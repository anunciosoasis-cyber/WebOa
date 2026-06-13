import React, { useRef, useEffect, useState } from 'react';

/**
 * Componente Wrapper para el Canvas de Fabric.js
 */
const FabricCanvas = ({ canvasId, dimensions }) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const checkSize = () => {
            if (containerRef.current) {
                // El contenedor menos el padding
                const containerWidth = containerRef.current.clientWidth - 40; 
                const containerHeight = containerRef.current.clientHeight - 40; 
                
                let newScale = 1;
                // Si la pantalla o el área es más pequeña que las dimensiones del canvas, escalamos
                if (containerWidth > 0 && containerWidth < dimensions.width) {
                    newScale = containerWidth / dimensions.width;
                }
                if (containerHeight > 0 && containerHeight < dimensions.height) {
                    const heightScale = containerHeight / dimensions.height;
                    if (heightScale < newScale) newScale = heightScale;
                }
                
                setScale(newScale < 0.2 ? 0.2 : newScale);
            }
        };

        checkSize();
        window.addEventListener('resize', checkSize);
        // Observador adicional por si el flexbox cambia
        const observer = new ResizeObserver(checkSize);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            window.removeEventListener('resize', checkSize);
            observer.disconnect();
        };
    }, [dimensions]);

    return (
        <div ref={containerRef} className="canvas-wrapper shadow-2xl" style={{ 
            padding: '20px', 
            background: '#2c2c2c', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%', // Para llenar el flex area y poder calcular escala
            overflow: 'hidden'
        }}>
            <div style={{
                width: dimensions.width,
                height: dimensions.height,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <canvas id={canvasId} style={{
                    borderRadius: '4px',
                    boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                }} />
            </div>
        </div>
    );
};

export default FabricCanvas;
