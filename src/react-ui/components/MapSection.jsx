import React from 'react';
import { useTheme } from '../ThemeContext';
import GlassCard from './GlassCard';

const MapSection = () => {
    const { theme } = useTheme();
    
    // Paleta Oasis Establecida
    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        textPrimary: '#1A2F23'
    };

    const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.059247738243!2d-75.58983942415124!3d6.255928826210086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4428fd37035f8d%3A0xc0c8d9294e5a953e!2sIglesia%20Adventista%20del%20S%C3%A9ptimo%20D%C3%ADa%20-%20Oasis!5e0!3m2!1ses!2sco!4v1713567000000!5m2!1ses!2sco";
    const mapDirectUrl = "https://maps.app.goo.gl/9y5H6uU9W2Lz5N1D7";

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
                backgroundColor: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.12)',
                border: '1px solid rgba(0,0,0,0.03)',
                transition: 'transform 0.3s ease'
            }} className="map-card-container">
                
                {/* Cabecera con Tipografía Moonrising */}
                <div style={{ marginBottom: '25px' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        color: colors.accent,
                        marginBottom: '10px'
                    }}>
                        <i className="bi bi-geo-alt-fill" style={{ fontSize: '1.2rem' }}></i>
                        <span style={{ fontWeight: '900', letterSpacing: '3px', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                            Ubicación
                        </span>
                    </div>
                    <h3 style={{
                        fontFamily: 'Moonrising, sans-serif',
                        color: colors.deepPurple,
                        fontSize: '2rem',
                        margin: 0,
                        lineHeight: 1.1
                    }}>
                        Templo <span style={{ color: colors.accent }}>Oasis</span>
                    </h3>
                    <p style={{ color: '#666', marginTop: '10px', fontSize: '0.95rem', fontWeight: '500' }}>
                        Medellín, Antioquia. Un espacio para ti.
                    </p>
                </div>

                {/* Contenedor del Mapa con Estética de Dispositivo */}
                <div className="map-iframe-container" style={{
                    flexGrow: 1,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    background: '#F0F2F5',
                    position: 'relative',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <iframe
                        src={mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación Oasis"
                    ></iframe>
                </div>

                {/* Botón de Acción Estilo Isla */}
                <div style={{ marginTop: '25px' }}>
                    <a href={mapDirectUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <button style={{ 
                            width: '100%', 
                            padding: '16px', 
                            backgroundColor: colors.deepPurple,
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '20px',
                            fontWeight: '900',
                            fontSize: '0.8rem',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 20px -5px rgba(18, 12, 31, 0.3)'
                        }} className="map-btn">
                            ¿Cómo llegar? <i className="bi bi-arrow-up-right"></i>
                        </button>
                    </a>
                </div>
            </div>

            <style>{`
                .map-card-container {
                    padding: 40px;
                    border-radius: 40px;
                }
                .map-iframe-container {
                    min-height: 350px;
                }
                .map-card-container:hover {
                    transform: translateY(-5px);
                }
                .map-btn:hover {
                    background-color: ${colors.accent} !important;
                    color: ${colors.deepPurple} !important;
                    transform: translateY(-2px);
                }
                @font-face {
                    font-family: 'Moonrising';
                    src: url('/fonts/Moonrising.ttf');
                }
                @media (max-width: 768px) {
                    .map-card-container {
                        padding: 20px !important;
                        border-radius: 24px !important;
                    }
                    .map-iframe-container {
                        min-height: 250px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MapSection;