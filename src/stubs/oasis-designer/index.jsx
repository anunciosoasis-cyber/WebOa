// Stub temporal para @oasis/designer
// El paquete real requiere la ruta: bases para dev/editor grafico/AdminAnnouncements/packages/oasis-designer
import React from 'react';

export const ThemeProvider = ({ children }) => <>{children}</>;

const OasisDesigner = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '16px',
        gap: '12px'
    }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
        </svg>
        <span>Editor de anuncios no disponible en este entorno</span>
        <small style={{ opacity: 0.5 }}>Configura la ruta del paquete @oasis/designer en package.json</small>
    </div>
);

export default OasisDesigner;
