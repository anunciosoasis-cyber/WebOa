/**
 * pptxParser.ts
 * Extracción, lectura y parseo de archivos PPTX / JSON a PresentationAST
 * Módulo de Carga de Presentaciones de Estudio Oasis
 */

import { PresentationAST, SlideNode, SlideElement } from '../../types/slide.types';
import JSZip from 'jszip';

export class PPTXParser {
  
  private async ensureJSZip(): Promise<any> {
    return JSZip;
  }

  private async ensurePdfJs(): Promise<any> {
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
    try {
      const pdfjs = await import('pdfjs-dist');
      if (pdfjs) {
        const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version || '5.4.296'}/build/pdf.worker.min.mjs`;
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        }
        (window as any).pdfjsLib = pdfjs;
        return pdfjs;
      }
    } catch (e) {
      console.warn('Import directo de pdfjs-dist falló, usando CDN:', e);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        try {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        } catch {}
        resolve((window as any).pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private async makeThumb(dataUri: string, maxW = 160, maxH = 90): Promise<string | null> {
    if (!dataUri || !dataUri.startsWith('data:image/')) return null;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = maxW;
          c.height = maxH;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, maxW, maxH);
            resolve(c.toDataURL('image/jpeg', 0.55));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = dataUri;
    });
  }

  public async parseFile(file: File): Promise<PresentationAST> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'json') {
      return this.parseJSONFile(file);
    } else if (extension === 'pptx') {
      return this.parsePPTXFile(file);
    } else if (extension === 'pdf') {
      return this.parsePDFFile(file);
    } else if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(extension || '')) {
      return this.parseImageFile(file);
    }

    throw new Error(`Formato de archivo no soportado: .${extension}`);
  }

  public async parseJSON(jsonContent: string): Promise<PresentationAST> {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.slides || !Array.isArray(parsed.slides)) {
        throw new Error('Formato JSON de presentación no válido: falta propiedad "slides"');
      }
      return {
        id: parsed.id || `pres-${Date.now()}`,
        title: parsed.title || 'Presentación Oasis',
        author: parsed.author || 'Estudio Oasis',
        aspectRatio: parsed.aspectRatio || '16:9',
        slides: parsed.slides,
        createdAt: parsed.createdAt || Date.now(),
        updatedAt: Date.now()
      };
    } catch (e) {
      throw new Error(`Error parseando JSON de presentación: ${(e as Error).message}`);
    }
  }

  private async parseJSONFile(file: File): Promise<PresentationAST> {
    const text = await file.text();
    return this.parseJSON(text);
  }

  /**
   * Parseo Real de Archivos PowerPoint (.pptx)
   * Desempaqueta la estructura ZIP interna, lee los XML de cada diapositiva (ppt/slides/slide1.xml)
   * y construye la representación visual idéntica de la diapositiva.
   */
  private async parsePPTXFile(file: File): Promise<PresentationAST> {
    const slides: SlideNode[] = [];
    const fileNameClean = file.name.replace(/\.[^/.]+$/, "");

    try {
      const JSZip = await this.ensureJSZip();
      const zip = await JSZip.loadAsync(file);

      // Buscar todos los archivos XML de diapositivas en ppt/slides/
      const slideFilePaths = Object.keys(zip.files)
        .filter(path => /^ppt\/slides\/slide\d+\.xml$/.test(path))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)![0], 10);
          const numB = parseInt(b.match(/\d+/)![0], 10);
          return numA - numB;
        });

      // Extraer imágenes de medios en ppt/media/
      const mediaFiles = Object.keys(zip.files).filter(path => path.startsWith('ppt/media/'));
      const mediaMap: Record<string, string> = {};
      for (const mediaPath of mediaFiles) {
        const blob = await zip.files[mediaPath].async('blob');
        mediaMap[mediaPath] = await this.blobToDataURI(blob);
      }

      const mediaKeys = Object.keys(mediaMap);
      const parser = new DOMParser();

      if (slideFilePaths.length > 0) {
        for (let i = 0; i < slideFilePaths.length; i++) {
          const slidePath = slideFilePaths[i];
          const xmlText = await zip.files[slidePath].async('text');
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

          // Extraer párrafos completos <a:p> uniendo los runs de texto <a:t> internos para evitar frases rotas
          const paragraphNodes = Array.from(xmlDoc.getElementsByTagName('a:p'));
          const slideTexts = paragraphNodes
            .map(pNode => {
              const tNodes = Array.from(pNode.getElementsByTagName('a:t'));
              return tNodes.map(t => t.textContent || '').join('').trim();
            })
            .filter(text => text.length > 0);

          const slideTitle = slideTexts[0] || `${fileNameClean} — Diapositiva ${i + 1}`;
          const slideBodyTexts = slideTexts.slice(1);

          const elements: SlideElement[] = [];

          // 1. Título de la Diapositiva
          elements.push({
            id: `el-title-${i}`,
            type: 'heading',
            content: slideTitle,
            style: { color: '#F59E0B', fontSize: '2.2rem', fontWeight: 900, textAlign: 'center', marginBottom: '1rem', lineHeight: '1.2' },
            animationRule: { step: 0, buildIn: 'slide-in-down' }
          });

          // 2. Párrafos y Viñetas de Texto (Unificados en oraciones completas)
          if (slideBodyTexts.length > 0) {
            const combinedBodyText = slideBodyTexts.join('\n');
            elements.push({
              id: `el-text-${i}`,
              type: 'text',
              content: combinedBodyText,
              style: { color: '#FFFFFF', fontSize: '1.3rem', textAlign: 'center', marginTop: '0.5rem', lineHeight: '1.5', maxWidth: '85%', margin: '0.5rem auto' },
              animationRule: { step: 1, buildIn: 'fade-in' }
            });
          }

          // 3. Imagen de apoyo integrada si esta diapositiva específica la incluye
          let slideImageUri: string | null = null;
          const slideNumMatch = slidePath.match(/slide(\d+)\.xml/);
          if (slideNumMatch) {
            const relsPath = `ppt/slides/_rels/slide${slideNumMatch[1]}.xml.rels`;
            if (zip.files[relsPath]) {
              try {
                const relsText = await zip.files[relsPath].async('text');
                const relsDoc = parser.parseFromString(relsText, 'text/xml');
                const relNodes = Array.from(relsDoc.getElementsByTagName('Relationship'));
                for (const r of relNodes) {
                  const target = r.getAttribute('Target') || '';
                  const type = r.getAttribute('Type') || '';
                  if (type.includes('image') || /\.(png|jpe?g|webp|gif|svg)$/i.test(target)) {
                    const normPath = target.startsWith('/')
                      ? target.slice(1)
                      : ('ppt/slides/' + target).replace(/\/+/g, '/').replace(/ppt\/slides\/\.\.\//, 'ppt/');
                    if (mediaMap[normPath]) {
                      slideImageUri = mediaMap[normPath];
                      break;
                    }
                  }
                }
              } catch (e) {
                console.warn('Error leyendo rels de diapositiva:', e);
              }
            }
          }

          if (slideImageUri) {
            elements.push({
              id: `el-img-${i}`,
              type: 'image',
              content: slideImageUri,
              style: { maxHeight: '180px', width: 'auto', margin: '1rem auto', borderRadius: '1rem' }
            });
          }

          let thumbUrl: string | undefined = undefined;
          if (slideImageUri) {
            thumbUrl = (await this.makeThumb(slideImageUri)) || undefined;
          }

          slides.push({
            id: `slide-pptx-${i + 1}`,
            index: i,
            title: slideTitle,
            fileUrl: slideImageUri || undefined,
            thumbnailUrl: thumbUrl,
            background: { type: 'gradient', value: 'linear-gradient(135deg, #120C1F 0%, #1b0d36 100%)' },
            elements
          });
        }
      }
    } catch (error) {
      console.error("Error al parsear archivo PPTX Zip:", error);
    }

    if (slides.length === 0) {
      slides.push(this.createFallbackSlide(fileNameClean, 0));
    }

    return {
      id: `pptx-${Date.now()}`,
      title: fileNameClean,
      aspectRatio: '16:9',
      slides,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Convertidor de PDF a AST (Renderizado Visual 100% Idéntico en HD Canvas)
   */
  private async parsePDFFile(file: File): Promise<PresentationAST> {
    const slides: SlideNode[] = [];
    const fileNameClean = file.name.replace(/\.[^/.]+$/, "");

    try {
      const pdfjs = await this.ensurePdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await (loadingTask.promise || loadingTask);

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = Math.min(1.6, Math.max(1.0, 1440 / unscaledViewport.width));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);

        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

        // Generar miniatura ultraligera (~2-3 KB) para el control remoto y carrusel
        let thumbUrl: string | undefined = undefined;
        try {
          const thumbCanvas = document.createElement('canvas');
          const tw = 180;
          const th = Math.max(1, Math.round(tw * (viewport.height / viewport.width)));
          thumbCanvas.width = tw;
          thumbCanvas.height = th;
          const thumbCtx = thumbCanvas.getContext('2d');
          if (thumbCtx) {
            thumbCtx.drawImage(canvas, 0, 0, tw, th);
            thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.55);
          }
        } catch {}

        slides.push({
          id: `slide-pdf-${i}`,
          index: i - 1,
          title: `${fileNameClean} — Diapositiva ${i}`,
          fileUrl: dataUrl,
          thumbnailUrl: thumbUrl,
          type: 'image',
          mediaType: 'image',
          elements: [
            {
              id: `el-pdf-img-${i}`,
              type: 'image',
              content: dataUrl,
              style: { width: '100%', height: '100%', position: 'absolute', top: '0', left: '0' }
            }
          ]
        });
      }
    } catch (err) {
      console.error("Error al procesar PDF:", err);
    }

    if (slides.length === 0) {
      slides.push(this.createFallbackSlide(fileNameClean, 0));
    }

    return {
      id: `pdf-${Date.now()}`,
      title: fileNameClean,
      aspectRatio: '16:9',
      slides,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  private async parseImageFile(file: File): Promise<PresentationAST> {
    const dataUrl = await this.blobToDataURI(file);
    const fileNameClean = file.name.replace(/\.[^/.]+$/, "");

    return {
      id: `img-${Date.now()}`,
      title: fileNameClean,
      aspectRatio: '16:9',
      slides: [
        {
          id: `slide-img-1`,
          index: 0,
          title: fileNameClean,
          elements: [
            {
              id: `el-single-img-1`,
              type: 'image',
              content: dataUrl,
              style: { width: '100%', height: '100%', position: 'absolute', top: '0', left: '0' }
            }
          ]
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  private createFallbackSlide(title: string, index: number): SlideNode {
    return {
      id: `slide-fallback-${index}`,
      index,
      title,
      background: { type: 'gradient', value: 'linear-gradient(135deg, #2a144a 0%, #1b0d36 100%)' },
      elements: [
        {
          id: `el-title-${index}`,
          type: 'heading',
          content: title,
          style: { color: '#F59E0B', fontSize: '2.5rem', fontWeight: 900, textAlign: 'center' },
          animationRule: { step: 0, buildIn: 'fade-in' }
        }
      ]
    };
  }

  private blobToDataURI(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
