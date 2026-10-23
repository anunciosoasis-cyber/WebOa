/**
 * Service to handle file downloads and filename management
 */
export class DownloadService {
  /**
   * Sanitizes a string to be used as a filename
   */
  static sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
      .replace(/_{2,}/g, '_')      // Replace multiple underscores with one
      .slice(0, 50);               // Limit length
  }

  /**
   * Generates a standardized filename for announcements
   */
  static generateAnnouncementFilename(title: string, format: string): string {
    const cleanTitle = this.sanitizeFilename(title || 'anuncio');
    const cleanFormat = this.sanitizeFilename(format || 'post');
    return `${cleanFormat}_${cleanTitle}`;
  }

  /**
   * Triggers a download from a Data URL
   */
  static downloadFromDataUrl(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Triggers a download from a Blob
   */
  static downloadFromBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    this.downloadFromDataUrl(url, filename);
    // Note: URL.revokeObjectURL(url) should be called, but doing it immediately might break the download in some browsers.
    // Better to do it after a small timeout if needed, or rely on page cleanup.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
