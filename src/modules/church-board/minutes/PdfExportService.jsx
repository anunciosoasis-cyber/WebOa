import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PdfActaTemplate } from './PdfActaTemplate';
import apiClient from '../../../api/client';

const waitForAssets = async (element) => {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  const images = Array.from(element.querySelectorAll('img'));
  const promises = images.map((img) => {
    if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });
  await Promise.all(promises);
  await new Promise((resolve) => setTimeout(resolve, 300));
};

// Convierte URLs externas y relativas a Base64 de forma segura
const urlToBase64 = async (url) => {
  if (!url || url.startsWith('data:')) return url;

  try {
    let fetchUrl = url;
    if (url.startsWith('/')) {
      const serverOrigin = (apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
      fetchUrl = `${serverOrigin}${url}`;
    }

    const response = await fetch(fetchUrl, { mode: 'cors', cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`No se pudo convertir a Base64: ${url}`, error);
    return url;
  }
};

// Impresión Vectorial Nativa vía iframe
export const printActaNative = (element) => {
  if (!element) return;
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Acta de Reunión</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
          @page { size: letter portrait; margin: 0; }
          body { margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
      </head>
      <body>
        ${element.outerHTML}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() {
              if (window.frameElement) window.frameElement.remove();
            }, 1000);
          };
        </script>
      </body>
    </html>
  `);
  doc.close();
};

export const generatePdfActa = async (junta, signatures, globalSettings) => {
  // Pre-procesar imágenes a Base64 antes de renderizar React
  const processedSettings = { ...globalSettings };
  if (processedSettings.email_header_image) {
    processedSettings.email_header_image = await urlToBase64(processedSettings.email_header_image);
  }
  if (processedSettings.email_footer_image) {
    processedSettings.email_footer_image = await urlToBase64(processedSettings.email_footer_image);
  }

  const processedSignatures = await Promise.all(
    signatures.map(async (sig) => {
      if (sig.signature) {
        return { ...sig, signature: await urlToBase64(sig.signature) };
      }
      return sig;
    })
  );

  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '816px';
    container.style.zIndex = '-1000';
    document.body.appendChild(container);

    const root = createRoot(container);

    const TemplateWrapper = () => {
      const targetRef = useRef(null);

      useEffect(() => {
        const executeExport = async () => {
          try {
            const element = targetRef.current;
            if (!element) throw new Error("Elemento no montado");

            await waitForAssets(element);

            const headerEl = element.querySelector('header');
            const mainEl = element.querySelector('main');
            const footerEl = element.querySelector('footer');

            // Captura individual de Secciones
            const headerCanvas = headerEl
              ? await html2canvas(headerEl, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#120C1F' })
              : null;
            const footerCanvas = footerEl
              ? await html2canvas(footerEl, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#08050D' })
              : null;
            const mainCanvas = mainEl
              ? await html2canvas(mainEl, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff', windowWidth: 816 })
              : null;

            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'px',
              format: [816, 1056]
            });

            const pdfWidth = 816;
            const pdfHeight = 1056;

            const headerHeight = headerCanvas ? (headerCanvas.height * pdfWidth) / headerCanvas.width : 0;
            const footerHeight = footerCanvas ? (footerCanvas.height * pdfWidth) / footerCanvas.width : 0;

            const headerImgData = headerCanvas ? headerCanvas.toDataURL('image/png') : null;
            const footerImgData = footerCanvas ? footerCanvas.toDataURL('image/png') : null;
            const mainImgData = mainCanvas ? mainCanvas.toDataURL('image/png') : null;

            const usableHeight = pdfHeight - headerHeight - footerHeight;
            const mainHeight = mainCanvas ? (mainCanvas.height * pdfWidth) / mainCanvas.width : 0;

            let mainHeightLeft = mainHeight;
            let pageIdx = 0;

            // Renderizado estricto multipágina con Header y Footer repetidos en TODAS las páginas
            while (mainHeightLeft > 0 || pageIdx === 0) {
              if (pageIdx > 0) {
                pdf.addPage();
              }

              // 1. Encabezado en la parte superior de CADA página
              if (headerImgData) {
                pdf.addImage(headerImgData, 'PNG', 0, 0, pdfWidth, headerHeight);
              }

              // 2. Porción del contenido principal en el centro
              if (mainImgData) {
                const positionY = headerHeight - (pageIdx * usableHeight);
                pdf.addImage(mainImgData, 'PNG', 0, positionY, pdfWidth, mainHeight);
              }

              // 3. Pie de página en la parte inferior de CADA página
              if (footerImgData) {
                pdf.addImage(footerImgData, 'PNG', 0, pdfHeight - footerHeight, pdfWidth, footerHeight);
              }

              mainHeightLeft -= usableHeight;
              pageIdx++;
            }

            pdf.save(`Acta_${junta.id}.pdf`);

            setTimeout(() => {
              root.unmount();
              container.remove();
            }, 100);

            resolve();
          } catch (e) {
            console.error("Error al exportar PDF multipágina:", e);
            setTimeout(() => {
              root.unmount();
              container.remove();
            }, 100);
            reject(e);
          }
        };

        executeExport();
      }, []);

      return (
        <PdfActaTemplate
          ref={targetRef}
          junta={junta}
          signatures={processedSignatures}
          globalSettings={processedSettings}
        />
      );
    };

    root.render(<TemplateWrapper />);
  });
};
