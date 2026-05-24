import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from './useEditorStore';

/**
 * HOOK MAESTRO: useOasisEditor
 * Encapsula la lógica de Fabric.js con Smart Guides, historial y sistema de capas.
 */
export const useOasisEditor = (canvasId, initialDimensions) => {
    const [canvas, setCanvas] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [layers, setLayers] = useState([]);
    const { pushState } = useEditorStore();
    
    // Referencia para evitar bucles en el guardado de historial
    const isStateLoading = useRef(false);

    // INICIALIZACIÓN
    useEffect(() => {
        const fc = new fabric.Canvas(canvasId, {
            width: initialDimensions.width,
            height: initialDimensions.height,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
        });

        // Configuración de Smart Guides (Guías Magnéticas Simples)
        fc.on('object:moving', (options) => {
            const obj = options.target;
            const vLine = fc.width / 2;
            const hLine = fc.height / 2;
            const margin = 10;

            // Snap al centro vertical
            if (Math.abs(obj.left - vLine) < margin) {
                obj.set({ left: vLine }).setCoords();
            }
            // Snap al centro horizontal
            if (Math.abs(obj.top - hLine) < margin) {
                obj.set({ top: hLine }).setCoords();
            }
        });

        // Eventos de selección y actualización de capas
        const updateUI = () => {
            setSelectedObject(fc.getActiveObject());
            setLayers([...fc.getObjects()].reverse());
            
            // Guardar en historial si no es una carga de estado
            if (!isStateLoading.current) {
                pushState(JSON.stringify(fc.toJSON()));
            }
        };

        fc.on({
            'selection:created': updateUI,
            'selection:updated': updateUI,
            'selection:cleared': updateUI,
            'object:modified': updateUI,
            'object:added': updateUI,
            'object:removed': updateUI
        });

        setCanvas(fc);

        return () => {
            fc.dispose();
        };
    }, [canvasId]);

    // COMANDO: Aplicar JSON de Historial
    const loadFromJSON = useCallback((json) => {
        if (!canvas || !json) return;
        isStateLoading.current = true;
        canvas.loadFromJSON(json).then(() => {
            canvas.renderAll();
            setLayers([...canvas.getObjects()].reverse());
            isStateLoading.current = false;
        });
    }, [canvas]);

    // COMANDO: Exportar Alta Resolución (3x)
    const exportHighRes = useCallback(() => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL({
            format: 'png',
            multiplier: 3,
            quality: 1
        });
        const link = document.createElement('a');
        link.download = `Oasis_Design_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    }, [canvas]);

    // COMANDO: Redimensionar Orgánico (Cover Background)
    const resizeCanvas = useCallback((w, h) => {
        if (!canvas) return;
        const oldW = canvas.width;
        const oldH = canvas.height;
        
        canvas.setDimensions({ width: w, height: h });

        if (canvas.backgroundImage) {
            const bg = canvas.backgroundImage;
            const scale = Math.max(w / bg.width, h / bg.height);
            bg.set({
                scaleX: scale,
                scaleY: scale,
                left: w / 2,
                top: h / 2,
                originX: 'center',
                originY: 'center'
            });
        }

        canvas.getObjects().forEach(obj => {
            if (obj === canvas.backgroundImage) return;
            obj.set({
                left: (obj.left / oldW) * w,
                top: (obj.top / oldH) * h
            });
            if (obj.type.includes('text')) {
                obj.set('fontSize', obj.fontSize * (w / oldW));
            }
            obj.setCoords();
        });
        canvas.renderAll();
    }, [canvas]);

    // COMANDO: Actualizar Propiedad de Objeto Seleccionado
    const updateObjectProperty = useCallback((prop, value) => {
        const active = canvas?.getActiveObject();
        if (active) {
            active.set(prop, value);
            if (prop === 'fontFamily') {
                // Forzar renderizado de fuente si es necesario
                canvas.renderAll();
            }
            canvas.requestRenderAll();
            pushState(JSON.stringify(canvas.toJSON()));
        }
    }, [canvas, pushState]);

    // COMANDO: Alineación de Objetos
    const alignObject = useCallback((type) => {
        const active = canvas?.getActiveObject();
        if (!active) return;

        switch (type) {
            case 'left': active.set({ left: active.width * active.scaleX / 2 }); break;
            case 'center': active.centerH(); break;
            case 'right': active.set({ left: canvas.width - (active.width * active.scaleX / 2) }); break;
            case 'top': active.set({ top: active.height * active.scaleY / 2 }); break;
            case 'middle': active.centerV(); break;
            case 'bottom': active.set({ top: canvas.height - (active.height * active.scaleY / 2) }); break;
        }
        active.setCoords();
        canvas.requestRenderAll();
        pushState(JSON.stringify(canvas.toJSON()));
    }, [canvas, pushState]);

    // COMANDO: Gestión de Capas (Z-Index)
    const changeOrder = useCallback((direction) => {
        const active = canvas?.getActiveObject();
        if (!active) return;
        if (direction === 'front') active.bringToFront();
        if (direction === 'back') active.sendToBack();
        if (direction === 'forward') active.bringForward();
        if (direction === 'backward') active.sendBackwards();
        canvas.requestRenderAll();
        setLayers([...canvas.getObjects()].reverse());
    }, [canvas]);

    // COMANDO: Insertar Elementos
    const addText = useCallback((text = 'Nuevo Texto', options = {}) => {
        if (!canvas) return;
        const textObj = new fabric.IText(text, {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fontFamily: 'Montserrat',
            fontSize: 40,
            fill: '#000000',
            originX: 'center',
            originY: 'center',
            ...options
        });
        canvas.add(textObj);
        canvas.setActiveObject(textObj);
    }, [canvas]);

    const addShape = useCallback((type) => {
        if (!canvas) return;
        const common = { 
            left: canvas.width / 2, top: canvas.height / 2, 
            fill: '#f59e0b', width: 100, height: 100,
            originX: 'center', originY: 'center'
        };
        let shape;
        if (type === 'rect') shape = new fabric.Rect(common);
        if (type === 'circle') shape = new fabric.Circle({ ...common, radius: 50 });
        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
        }
    }, [canvas]);

    const addImageFromUrl = useCallback(async (url) => {
        if (!canvas) return;
        try {
            const img = await fabric.Image.fromURL(url, { crossOrigin: 'anonymous' });
            // Escalar para que no sea gigante
            const scale = Math.min(200 / img.width, 200 / img.height);
            img.set({
                scaleX: scale,
                scaleY: scale,
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center'
            });
            canvas.add(img);
            canvas.setActiveObject(img);
        } catch (err) {
            console.error("Error adding image:", err);
        }
    }, [canvas]);

    const deleteSelected = useCallback(() => {
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active) {
            canvas.remove(active);
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }
    }, [canvas]);

    const duplicateSelected = useCallback(async () => {
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active) {
            const cloned = await active.clone();
            cloned.set({
                left: active.left + 20,
                top: active.top + 20,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
        }
    }, [canvas]);

    const setBackground = useCallback(async (url) => {
        if (!canvas) return;
        try {
            const img = await fabric.Image.fromURL(url, { crossOrigin: 'anonymous' });
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            img.set({
                scaleX: scale,
                scaleY: scale,
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center',
                selectable: false,
                evented: false
            });
            canvas.backgroundImage = img;
            canvas.requestRenderAll();
            pushState(JSON.stringify(canvas.toJSON()));
        } catch (err) {
            console.error("Error setting background:", err);
        }
    }, [canvas, pushState]);

    return {
        canvas,
        selectedObject,
        layers,
        loadFromJSON,
        exportHighRes,
        resizeCanvas,
        updateObjectProperty,
        alignObject,
        changeOrder,
        addText,
        addShape,
        addImageFromUrl,
        deleteSelected,
        duplicateSelected,
        setBackground
    };
};
