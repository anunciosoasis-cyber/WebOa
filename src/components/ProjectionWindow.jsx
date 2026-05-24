import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Componente que renderiza su contenido en una ventana externa (Pop-up real).
 * Ideal para proyección en una segunda pantalla.
 */
const ProjectionWindow = ({ children, onClose }) => {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        // Abrir la ventana en blanco
        const win = window.open('', '', 'width=1280,height=720,left=200,top=200');
        if (!win) {
            alert('Por favor, permite las ventanas emergentes (pop-ups) en tu navegador para usar el proyector.');
            if (onClose) onClose();
            return;
        }

        win.document.title = 'Proyección Oasis';
        win.document.body.style.margin = '0';
        win.document.body.style.overflow = 'hidden';

        // Copiar estilos de la ventana principal a la nueva
        Array.from(document.styleSheets).forEach(styleSheet => {
            try {
                if (styleSheet.href) {
                    const newLinkEl = win.document.createElement('link');
                    newLinkEl.rel = 'stylesheet';
                    newLinkEl.href = styleSheet.href;
                    win.document.head.appendChild(newLinkEl);
                } else if (styleSheet.cssRules) {
                    const newStyleEl = win.document.createElement('style');
                    Array.from(styleSheet.cssRules).forEach(cssRule => {
                        newStyleEl.appendChild(win.document.createTextNode(cssRule.cssText));
                    });
                    win.document.head.appendChild(newStyleEl);
                }
            } catch (e) {
                // Ignorar errores de CORS en hojas de estilo externas
            }
        });

        // Crear el contenedor donde React inyectará los elementos
        const el = win.document.createElement('div');
        win.document.body.appendChild(el);
        setContainer(el);

        // Detectar si el usuario cierra la ventana manualmente
        const handleBeforeUnload = () => {
            if (onClose) onClose();
        };
        win.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup: Se ejecuta cuando el componente se desmonta (ej. React Strict Mode)
        return () => {
            win.removeEventListener('beforeunload', handleBeforeUnload);
            win.close();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Si el contenedor aún no existe, no renderizamos nada
    if (!container) return null;

    // Usamos React Portals para renderizar el children dentro del DOM de la nueva ventana
    return createPortal(children, container);
};

export default ProjectionWindow;
