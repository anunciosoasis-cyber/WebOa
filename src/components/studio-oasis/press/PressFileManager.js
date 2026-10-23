// PressFileManager.js
import { PresentationManager } from './presentations';

export class PressFileManager {
  constructor() {
    this.presentationManager = new PresentationManager();
  }

  /**
   * Convierte un archivo único o múltiple (PDF, PPTX, Vídeos, Imágenes, JSON) en un arreglo normalizado de Diapositivas
   */
  async processFiles(filesList) {
    const files = Array.from(filesList || []);
    if (!files.length) return { slides: [], title: '' };

    const slidesList = [];
    let presentationTitle = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      // 1. Si es vídeo MP4 / WEBM / MOV
      if (['mp4', 'webm', 'mov', 'mkv'].includes(extension) || file.type.startsWith('video/')) {
        const videoSlide = await this.processSingleVideo(file);
        if (videoSlide) {
          slidesList.push(videoSlide);
          if (!presentationTitle) presentationTitle = file.name.split('.')[0];
        }
        continue;
      }

      // 2. Si es imagen directa, procesar al instante
      if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension) || file.type.startsWith('image/')) {
        const imageSlide = await this.processSingleImageFallback(file);
        if (imageSlide) {
          slidesList.push(imageSlide);
          if (!presentationTitle) presentationTitle = file.name.split('.')[0];
        }
        continue;
      }

      // 3. PPTX o PDF: se procesan en el navegador (PresentationManager / JSZip / PDF.js).
      // Para compartirlas con el proyector como imágenes, súbelas desde la app (POST /api/slides).
      try {
        const ast = await this.presentationManager.loadFromFile(file);
        if (ast && ast.slides && ast.slides.length > 0) {
          if (!presentationTitle) presentationTitle = ast.title || file.name.split('.')[0];

          const processed = await Promise.all(ast.slides.map(async (s, idx) => {
            const mainHeading =
              s.elements?.find((el) => el.type === 'heading')?.content ||
              s.title ||
              `Diapositiva ${slidesList.length + idx + 1}`;
            const bodyTexts = s.elements
              ?.filter((el) => el.type === 'text')
              .map((el) => el.content)
              .join('\n');
            const imgContent =
              s.fileUrl ||
              s.elements?.find((el) => el.type === 'image')?.content ||
              null;

            // PDF es imagen completa por página; PPTX con texto es diapositiva estructurada
            const isPureImage = extension === 'pdf' || (!bodyTexts && !s.elements?.some((el) => el.type === 'heading') && !!imgContent);

            let thumb = s.thumbnailUrl || null;
            if (!thumb && imgContent) {
              thumb = await createMiniThumbnail(imgContent, 160, 0.55);
            }

            return {
              id: s.id || `slide-processed-${Date.now()}-${idx}`,
              title: mainHeading,
              subtitle: bodyTexts || (isPureImage ? '' : `Página ${idx + 1} de ${ast.slides.length}`),
              fileUrl: imgContent,
              mediaUrl: imgContent,
              thumbnailUrl: thumb,
              type: isPureImage ? 'image' : 'styled',
              elements: s.elements,
            };
          }));

          slidesList.push(...processed);
        }
      } catch (err) {
        console.warn(`Procesando cliente directo para ${file.name}:`, err);
        if (!['pptx', 'pdf'].includes(extension)) {
          const fallbackSlide = await this.processSingleImageFallback(file);
        if (fallbackSlide) {
          slidesList.push(fallbackSlide);
          if (!presentationTitle) presentationTitle = file.name.split('.')[0];
        }
      }
    }
    }

    return {
      slides: slidesList,
      title: presentationTitle || 'Presentación Oasis Press',
    };
  }

  /**
   * Procesa vídeos (MP4 / WEBM)
   */
  processSingleVideo(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      resolve({
        id: `slide-video-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        subtitle: 'Vídeo en movimiento',
        mediaUrl: url,
        fileUrl: url,
        type: 'video',
        mediaType: 'video',
        eventData: {
          speaker: '',
          eventDate: '',
          location: '',
          tag: 'ANUNCIO VÍDEO',
          description: '',
        },
      });
    });
  }

  /**
   * Procesa imágenes individuales directo a Data URL al instante
   */
  async processSingleImageFallback(file) {
    try {
      const dataUrl = await imageFileToDataUrl(file);
      const thumbUrl = await createMiniThumbnail(dataUrl, 160, 0.55);
      return {
        id: `slide-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        subtitle: 'Anuncio gráfico',
        fileUrl: dataUrl,
        mediaUrl: dataUrl,
        thumbnailUrl: thumbUrl,
        type: 'image',
        mediaType: 'image',
      };
    } catch {
      return null;
    }
  }

  /**
   * Crea un Anuncio Híbrido (Vídeo o Imagen externa + Datos de Evento Alado)
   */
  createHybridAnnouncement(announcementData) {
    return {
      id: `slide-hybrid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: announcementData.title || 'Anuncio Oasis',
      subtitle: announcementData.eventDate || announcementData.speaker || '',
      type: 'hybrid_announcement',
      mediaType: announcementData.mediaType || (announcementData.mediaUrl?.startsWith('data:image') ? 'image' : 'video'),
      mediaUrl: announcementData.mediaUrl || null,
      fileUrl: announcementData.mediaUrl || null,
      eventData: {
        speaker: announcementData.speaker || '',
        eventDate: announcementData.eventDate || '',
        location: announcementData.location || '',
        tag: announcementData.tag || 'ANUNCIO',
        description: announcementData.description || '',
      },
      showSideDescription: announcementData.showSideDescription !== false,
    };
  }

  /**
   * Guarda sesión activa en localStorage
   */
  saveSession(slides, currentSlideIndex, isBlank, presentationTitle) {
    try {
      const activeSlide = slides[currentSlideIndex];
      const nextSlide = slides[currentSlideIndex + 1];
      const payload = {
        currentSlide: currentSlideIndex + 1,
        totalSlides: slides.length,
        isBlank,
        title: presentationTitle,
        activeSlideTitle: activeSlide?.title || `Diapositiva ${currentSlideIndex + 1}`,
        nextSlideTitle: nextSlide ? (nextSlide.title || `Diapositiva ${currentSlideIndex + 2}`) : 'Fin de Presentación',
        activeSlideUrl: activeSlide?.fileUrl || activeSlide?.mediaUrl || null,
        activeSlideMediaType: activeSlide?.mediaType || activeSlide?.type || 'image',
        nextSlideUrl: nextSlide?.fileUrl || nextSlide?.mediaUrl || null,
        timestamp: Date.now(),
      };
      localStorage.setItem('oasis_ppt_session', JSON.stringify(payload));
    } catch (e) {
      console.warn('Almacenamiento local:', e);
    }
  }
}

/**
 * Lee una imagen como data URL reducida (lado mayor ≤ maxSide). Así cabe en localStorage para el proyector
 * de este PC y, si queda pequeña, también viaja por el canal en tiempo real.
 */
export const imageFileToDataUrl = (file, maxSide = 1280, quality = 0.75) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(reader.error);
  reader.onload = () => {
    const src = reader.result;
    if (/image\/(gif|svg)/.test(file.type)) return resolve(src); // animadas o vectoriales: sin recomprimir
    const img = new Image();
    img.onerror = () => resolve(src);
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      // PNG conserva transparencia; el resto en JPEG, mucho más liviano
      resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality));
    };
    img.src = src;
  };
  reader.readAsDataURL(file);
});

export default PressFileManager;


/**
 * Crea una miniatura ultra-ligera (160x90, JPEG 0.55, ~2 KB) para el control remoto móvil
 */
export const createMiniThumbnail = (dataUrlOrImage, maxSide = 160, quality = 0.55) => new Promise((resolve) => {
  if (!dataUrlOrImage || typeof dataUrlOrImage !== 'string') return resolve(null);
  if (/^https?:\/\//.test(dataUrlOrImage)) return resolve(dataUrlOrImage);
  if (!dataUrlOrImage.startsWith('data:image/')) return resolve(null);

  const img = new Image();
  img.onload = () => {
    try {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(null);
      }
    } catch {
      resolve(null);
    }
  };
  img.onerror = () => resolve(null);
  img.src = dataUrlOrImage;
});
