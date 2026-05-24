import React from 'react';

/**
 * Componente Wrapper para el Canvas de Fabric.js
 */
const FabricCanvas = ({ canvasId, dimensions }) => {
    return (
        <div className="canvas-wrapper shadow-2xl" style={{ 
            padding: '20px', 
            background: '#2c2c2c', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <canvas id={canvasId} style={{
                borderRadius: '4px',
                boxShadow: '0 0 50px rgba(0,0,0,0.5)'
            }} />
        </div>
    );
};

export default FabricCanvas;
