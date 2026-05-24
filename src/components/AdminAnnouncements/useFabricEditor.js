import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';

/**
 * Hook para gestionar la instancia de Fabric.js y comandos vectoriales
 */
export const useFabricEditor = (canvasId, dimensions) => {
    const [canvas, setCanvas] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null);

    // Inicializar Canvas
    useEffect(() => {
        const fabricCanvas = new fabric.Canvas(canvasId, {
            width: dimensions.width,
            height: dimensions.height,
            backgroundColor: '#000',
            preserveObjectStacking: true,
        });

        fabricCanvas.on('selection:created', (e) => setSelectedObject(e.target));
        fabricCanvas.on('selection:updated', (e) => setSelectedObject(e.target));
        fabricCanvas.on('selection:cleared', () => setSelectedObject(null));

        setCanvas(fabricCanvas);

        return () => {
            fabricCanvas.dispose();
        };
    }, [canvasId]);

    // Comando: Aplicar Plantilla
    const applyTemplate = useCallback(async (template) => {
        if (!canvas) return;
        const referenceWidth = 480;
        const scaleFactor = canvas.width / referenceWidth;

        canvas.clear();

        // 1. Fondo
        if (template.bgImage) {
            try {
                const img = await fabric.Image.fromURL(template.bgImage, { crossOrigin: 'anonymous' });
                img.set({
                    scaleX: canvas.width / img.width,
                    scaleY: canvas.height / img.height,
                    originX: 'left',
                    originY: 'top',
                    opacity: template.bgOpacity || 1,
                    selectable: false
                });
                canvas.backgroundImage = img;
                canvas.renderAll();
            } catch (err) {
                console.error("Error loading background:", err);
            }
        } else {
            canvas.backgroundColor = new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
                colorStops: [
                    { offset: 0, color: template.gradientStart },
                    { offset: 1, color: template.gradientEnd }
                ]
            });
            canvas.renderAll();
        }

        // 2. Elementos con escalado responsivo
        Object.entries(template.elements || {}).forEach(([id, data]) => {
            const text = new fabric.IText(data.text, {
                left: canvas.width / 2,
                top: (data.y / 100) * canvas.height,
                fontSize: data.size * scaleFactor,
                fontFamily: data.font,
                fill: template.titleColor || '#FFF',
                originX: 'center',
                textAlign: 'center',
                id: id,
                shadow: new fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: 10,
                    offsetX: 2,
                    offsetY: 2
                })
            });
            canvas.add(text);
        });

        canvas.renderAll();
    }, [canvas]);

    // Comando: Cambiar Fuente
    const setFont = useCallback((family) => {
        const active = canvas?.getActiveObject();
        if (active && active.type.includes('text')) {
            active.set('fontFamily', family);
            canvas.renderAll();
        }
    }, [canvas]);

    // Comando: Duplicar
    const duplicateObject = useCallback(() => {
        const active = canvas?.getActiveObject();
        if (!active) return;
        active.clone().then((cloned) => {
            canvas.discardActiveObject();
            cloned.set({
                left: cloned.left + 15,
                top: cloned.top + 15,
                evented: true,
            });
            if (cloned.type === 'activeSelection') {
                cloned.canvas = canvas;
                cloned.forEachObject((obj) => canvas.add(obj));
                cloned.setCoords();
            } else {
                canvas.add(cloned);
            }
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
        });
    }, [canvas]);

    const bringToFront = useCallback(() => {
        const active = canvas?.getActiveObject();
        if (active) {
            canvas.bringToFront(active);
            canvas.renderAll();
        }
    }, [canvas]);

    const sendToBack = useCallback(() => {
        const active = canvas?.getActiveObject();
        if (active) {
            canvas.sendToBack(active);
            canvas.renderAll();
        }
    }, [canvas]);

    const deleteObject = useCallback(() => {
        const active = canvas?.getActiveObject();
        if (active) {
            canvas.remove(active);
            canvas.renderAll();
        }
    }, [canvas]);

    const addShape = useCallback((type) => {
        if (!canvas) return;

        let shape;
        const common = {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fill: '#F59E0B',
            width: 100,
            height: 100,
            originX: 'center',
            originY: 'center'
        };

        if (type === 'rect') shape = new fabric.Rect(common);
        if (type === 'circle') shape = new fabric.Circle({ ...common, radius: 50 });
        if (type === 'star') {
            shape = new fabric.Polygon([
                { x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 },
                { x: 79, y: 91 }, { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 },
                { x: 2, y: 35 }, { x: 39, y: 35 }
            ], { ...common, scaleX: 1.5, scaleY: 1.5 });
        }

        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
        }
    }, [canvas]);

    const addImage = useCallback(async (url) => {
        if (!canvas) return;
        try {
            const img = await fabric.Image.fromURL(url, { crossOrigin: 'anonymous' });
            const scale = Math.min((canvas.width * 0.5) / img.width, (canvas.height * 0.5) / img.height);
            img.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        } catch (err) {
            console.error("Error adding image:", err);
        }
    }, [canvas]);

    const setBackground = useCallback(async (url) => {
        if (!canvas) return;
        try {
            const img = await fabric.Image.fromURL(url, { crossOrigin: 'anonymous' });
            img.set({
                scaleX: canvas.width / img.width,
                scaleY: canvas.height / img.height,
                originX: 'left',
                originY: 'top',
                selectable: false,
                evented: false
            });
            canvas.backgroundImage = img;
            canvas.renderAll();
        } catch (err) {
            console.error("Error setting background:", err);
        }
    }, [canvas]);

    // Comando: Modificar Propiedades
    const updateProperty = useCallback((prop, value) => {
        const active = canvas?.getActiveObject();
        if (active) {
            active.set(prop, value);
            canvas.renderAll();
        }
    }, [canvas]);

    // Comando: Redimensionar Canvas (Responsivo / Orgánico)
    const resizeCanvas = useCallback(async (newWidth, newHeight) => {
        if (!canvas) return;

        const oldWidth = canvas.width;
        const oldHeight = canvas.height;

        // 1. Ajustar dimensiones del canvas
        canvas.setDimensions({ width: newWidth, height: newHeight });

        // 2. Ajustar Fondo (Modo Cover Orgánico)
        if (canvas.backgroundImage) {
            const bg = canvas.backgroundImage;
            const scale = Math.max(newWidth / bg.width, newHeight / bg.height);
            bg.set({
                scaleX: scale,
                scaleY: scale,
                left: newWidth / 2,
                top: newHeight / 2,
                originX: 'center',
                originY: 'center'
            });
        }

        // 3. Ajustar Elementos Automáticamente
        canvas.getObjects().forEach(obj => {
            if (obj === canvas.backgroundImage) return;

            // Mantener posición relativa (%)
            const relX = obj.left / oldWidth;
            const relY = obj.top / oldHeight;

            obj.set({
                left: relX * newWidth,
                top: relY * newHeight
            });

            // Escalar texto proporcionalmente si es necesario
            if (obj.type.includes('text')) {
                obj.set('fontSize', obj.fontSize * (newWidth / oldWidth));
            }

            obj.setCoords();
        });

        canvas.renderAll();
    }, [canvas]);

    const setGradientBackground = useCallback((c1, c2, op1 = 1, op2 = 1) => {
        if (!canvas) return;

        // Convertir colores HEX a RGBA para transparencia
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const color1 = c1 === 'transparent' ? 'rgba(0,0,0,0)' : hexToRgba(c1, op1);
        const color2 = c2 === 'transparent' ? 'rgba(0,0,0,0)' : hexToRgba(c2, op2);

        canvas.backgroundImage = null; // Limpiar imagen de fondo
        canvas.backgroundColor = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
            colorStops: [
                { offset: 0, color: color1 },
                { offset: 1, color: color2 }
            ]
        });
        canvas.renderAll();
    }, [canvas]);

    return {
        canvas,
        selectedObject,
        applyTemplate,
        setFont,
        duplicateObject,
        bringToFront,
        sendToBack,
        deleteObject,
        addShape,
        addImage,
        setBackground,
        updateProperty,
        resizeCanvas,
        setGradientBackground
    };
};
