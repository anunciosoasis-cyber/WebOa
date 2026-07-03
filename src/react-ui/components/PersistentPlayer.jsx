import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../ThemeContext';
import Peticiones from '../modules/Peticiones';

const PersistentPlayer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { youtubeUrl, isLive, loading, errorMsg, showPip, setShowPip } = usePlayer();
    const [activeInline, setActiveInline] = useState(null); // 'ofrenda' | 'peticion' | null

    const isTvRoute = location.pathname === '/tv';
    const isDark = mode === 'dark';

    const OASIS_COLORS = {
        deepPurple: '#120C1F',
        accent: '#F59E0B',
    };

    // If not on TV route and PiP is closed, don't render anything
    if (!isTvRoute && !showPip) return null;

    // Variants for animation between full size (relative) and PiP (fixed)
    const variants = {
        full: {
            position: 'relative',
            bottom: 'auto',
            right: 'auto',
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            zIndex: 1,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        pip: {
            position: 'fixed',
            bottom: '80px', // Above mobile bottom nav
            right: '20px',
            width: '320px',
            maxWidth: '100%',
            margin: '0',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            zIndex: 9999,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        }
    };

    return (
        <div className={isTvRoute ? "container py-4 py-md-5" : ""} style={{ minHeight: isTvRoute ? '80vh' : 'auto' }}>
            {isTvRoute && (
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                        {isLive ? (
                            <span className="text-danger fw-bold" style={{ animation: 'pulse 2s infinite', fontSize: '0.9rem', letterSpacing: '2px' }}>
                                EN VIVO
                            </span>
                        ) : (
                            <span className="text-primary fw-bold" style={{ fontSize: '0.9rem', letterSpacing: '2px' }}>
                                MENSAJES ANTERIORES
                            </span>
                        )}
                        <h2 className="mb-0" style={{ fontFamily: 'Moonrising', color: isDark ? '#fff' : '#000' }}>
                            OASIS <span style={{ color: OASIS_COLORS.accent }}>TV</span>
                        </h2>
                    </div>
                    <p className="opacity-75 m-0" style={{ color: isDark ? '#fff' : '#000' }}>Únete a nuestra transmisión y experimenta a Dios desde donde estés.</p>
                </div>
            )}

            <motion.div
                layout
                initial={isTvRoute ? "full" : "pip"}
                animate={isTvRoute ? "full" : "pip"}
                variants={variants}
                style={{
                    backgroundColor: isDark ? '#120C1F' : '#fff',
                    overflow: 'hidden',
                    border: isTvRoute ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : `2px solid ${isLive ? '#EF4444' : 'rgba(255,255,255,0.1)'}`
                }}
                className={isTvRoute ? 'mb-4' : ''}
            >
                {/* Header only for PiP mode */}
                {!isTvRoute && (
                    <div style={{
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isDark ? '#0A0514' : '#f8f9fa',
                        borderBottom: isDark ? 'none' : '1px solid #ddd'
                    }}>
                        <span style={{ color: isDark ? 'white' : 'black', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                            {isLive ? 'EN VIVO' : 'OASIS TV'}
                        </span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => navigate('/tv')} title="Expandir" style={{ background: 'transparent', border: 'none', color: isDark ? 'white' : 'black', cursor: 'pointer', fontSize: '1rem', opacity: 0.8 }}>
                                <i className="bi bi-arrows-angle-expand"></i>
                            </button>
                            <button onClick={() => setShowPip(false)} title="Cerrar" style={{ background: 'transparent', border: 'none', color: isDark ? 'white' : 'black', cursor: 'pointer', fontSize: '1rem', opacity: 0.8 }}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#000' }}>
                    {loading ? (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white">
                            <div className="spinner-border text-light" role="status"></div>
                        </div>
                    ) : youtubeUrl ? (
                        <iframe
                            src={youtubeUrl}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Oasis TV"
                        ></iframe>
                    ) : (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white p-4 text-center">
                            <i className="bi bi-camera-video-off mb-3" style={{ fontSize: isTvRoute ? '3rem' : '2rem', opacity: 0.5 }}></i>
                            {isTvRoute && <h5>No hay transmisiones disponibles</h5>}
                            <p className="opacity-50 small mb-0">{isTvRoute ? 'Actualmente no estamos en vivo ni se encontraron videos.' : 'Sin señal'}</p>
                            {isTvRoute && errorMsg && <p className="text-danger small mt-2">{errorMsg}</p>}
                        </div>
                    )}
                </div>
            </motion.div>

            {isTvRoute && (
                <div className="d-flex flex-column gap-3">
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <button
                            onClick={() => setActiveInline(prev => prev === 'ofrenda' ? null : 'ofrenda')}
                            className="btn fw-bold d-flex align-items-center gap-2"
                            style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: OASIS_COLORS.accent, color: '#FFF', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}
                        >
                            <i className="bi bi-wallet2"></i> Dar Mi Ofrenda
                        </button>
                        <button
                            onClick={() => setActiveInline(prev => prev === 'peticion' ? null : 'peticion')}
                            className="btn fw-bold d-flex align-items-center gap-2"
                            style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: isDark ? '#FFF' : '#000', color: isDark ? OASIS_COLORS.deepPurple : '#FFF', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
                        >
                            <i className="bi bi-chat-heart"></i> Necesito Oración
                        </button>
                    </div>

                    <AnimatePresence>
                        {activeInline === 'ofrenda' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                <div className="mt-2 p-3" style={{ backgroundColor: isDark ? '#120C1F' : '#f8f9fa', borderRadius: '24px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                                    <iframe src="https://alfoliadventista.org/" style={{ width: '100%', height: '600px', border: 'none', borderRadius: '16px' }} title="Alfolí Virtual" />
                                </div>
                            </motion.div>
                        )}
                        {activeInline === 'peticion' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                <div className="mt-2" style={{ backgroundColor: isDark ? '#120C1F' : '#f8f9fa', borderRadius: '24px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, padding: '20px' }}>
                                    <Peticiones inline={true} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default PersistentPlayer;
