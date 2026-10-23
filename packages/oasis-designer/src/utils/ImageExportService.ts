import { toPng, toJpeg, toSvg } from 'html-to-image';
import { DownloadService } from './DownloadService';

/**
 * Interface for the export options
 */
export interface ExportOptions {
  scale?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'svg';
  filename?: string;
  logoColor?: string;
  bgImage?: string | null;
  logoBase64: {
    iasd?: string;
    rrss?: string;
    oasisLetras?: string;
    iasdWhite?: string;
    rrssWhite?: string;
    oasisLetrasWhite?: string;
  };
}

/**
 * Service to handle high-fidelity image rendering and export using html-to-image
 */
export class ImageExportService {
  /**
   * Helper to convert an image URL to Base64
   */
  private static async toBase64(url: string): Promise<string> {
    if (!url || url.startsWith('data:')) return url;
    try {
      const resp = await fetch(url, { mode: 'cors', cache: 'no-cache' });
      const blob = await resp.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Failed to convert to base64:', url, e);
      return url;
    }
  }

  /**
   * Internal helper to prepare the node for capture
   */
  private static async prepareNode(node: HTMLElement, options: ExportOptions): Promise<() => void> {
    const restoreActions: Array<() => void> = [];

    // --- 0. Ocultar el marco de selección del editor durante la captura ---
    node.classList.add('is-exporting');
    restoreActions.push(() => node.classList.remove('is-exporting'));

    // --- 1. Convert ALL images to Base64 ---
    const imgs = node.querySelectorAll('img');
    const b64Promises = Array.from(imgs).map(async (img) => {
      const src = img.src;
      if (src && !src.startsWith('data:')) {
        const b64 = await this.toBase64(src);
        if (b64 && b64.startsWith('data:')) {
          const originalSrc = img.src;
          img.src = b64;
          restoreActions.push(() => { img.src = originalSrc; });
        }
      }
    });
    
    await Promise.all(b64Promises);

    // Cleanup function to restore original state
    return () => {
      restoreActions.reverse().forEach(restore => restore());
    };
  }

  /**
   * Captures a DOM node and returns a Data URL
   */
  static async captureToDataUrl(node: HTMLElement, options: ExportOptions): Promise<string> {
    const { scale = 3, quality = 0.95, format = 'jpeg' } = options;

    // 1. Force Browser to hydrate fonts
    // We wait for all fonts to be ready
    try {
      await document.fonts.ready;
      // Extra check: try to load the most critical fonts
      const fontList = ['Modern Age', 'Orbitron', 'Advent Pro', 'Blacksword', 'Dancing Script'];
      await Promise.all(fontList.map(f => document.fonts.load(`1em "${f}"`)));
    } catch (e) {
      console.warn('Font hydration warning:', e);
    }

    // 2. Prepare node (Base64 images)
    const restore = await this.prepareNode(node, options);

    try {
      const config = {
        pixelRatio: scale,
        quality: quality,
        backgroundColor: format === 'jpeg' ? '#000000' : undefined,
        cacheBust: true,
        // Avoid scanning cross-origin stylesheets from the host app (Bootstrap,
        // Google Fonts, animate.css). The browser blocks cssRules access and the
        // export can fail while publishing.
        skipFonts: false,
        style: {
          borderRadius: '0',
          boxShadow: 'none',
        }
      };

      // html-to-image quirk: needs a delay to ensure the browser has finished layouts
      // especially after inyecting base64 images
      await new Promise(r => setTimeout(r, 200));

      let dataUrl: string;
      if (format === 'png') {
        dataUrl = await toPng(node, config);
      } else if (format === 'svg') {
        dataUrl = await toSvg(node, config);
      } else {
        dataUrl = await toJpeg(node, config);
      }

      return dataUrl;
    } finally {
      // 3. Restore original DOM
      restore();
    }
  }

  /**
   * Captures a node and triggers a file download
   */
  static async downloadImage(node: HTMLElement, options: ExportOptions): Promise<void> {
    const { filename = 'anuncio', format = 'jpeg' } = options;
    
    // Warm-up: First capture often initializes the font cache in html-to-image
    await this.captureToDataUrl(node, options);
    
    // Final capture
    const dataUrl = await this.captureToDataUrl(node, options);
    
    const extension = format === 'jpeg' ? 'jpg' : format;
    const finalFilename = `${filename}.${extension}`;
    
    DownloadService.downloadFromDataUrl(dataUrl, finalFilename);
  }

  /**
   * Captures a node and returns a base64 string
   */
  static async getBase64(node: HTMLElement, options: ExportOptions): Promise<string> {
    await this.captureToDataUrl(node, options);
    return await this.captureToDataUrl(node, options);
  }
}
