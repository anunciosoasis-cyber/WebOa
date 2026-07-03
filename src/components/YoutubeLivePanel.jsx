import React, { useState, useEffect } from 'react';
import { Youtube, Users, MessageCircle, Settings, PlayCircle, StopCircle, RefreshCw, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../react-ui/components/GlassCard';
import apiClient from '../api/client';

const OASIS_COLORS = {
    deepPurple: '#120C1F',
    accent: '#F59E0B',
    glassWhite: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.05)',
    error: '#FF4444',
    success: '#10B981',
};

const YoutubeLivePanel = ({ isDark }) => {
    const [status, setStatus] = useState({ connected: false });
    const [broadcast, setBroadcast] = useState({ active: false, stats: { viewers: 0, likes: 0 } });
    const [chatMessages, setChatMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(() => {
            if (status.connected) {
                fetchBroadcast();
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [status.connected]);

    const checkStatus = async () => {
        try {
            const res = await apiClient.get('/youtube/status');
            setStatus(res.data);
            if (res.data.connected) fetchBroadcast();
        } catch (e) {
            console.error("No se pudo conectar a Youtube Module", e);
        }
    };

    const fetchBroadcast = async () => {
        try {
            const res = await apiClient.get('/youtube/broadcast');
            setBroadcast(res.data);
            if (res.data.chatId) {
                const chatRes = await apiClient.get(`/youtube/chat?chatId=${res.data.chatId}`);
                setChatMessages(chatRes.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const loginDirectly = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/youtube/auth-url');
            window.location.href = res.data.url;
        } catch (error) {
            alert('Error conectando a Google');
            setLoading(false);
        }
    };

    if (!status.connected) {
        return (
            <GlassCard className="p-4 d-flex flex-column gap-3" style={{ borderRadius: '25px', border: `1px solid ${isDark ? OASIS_COLORS.glassBorder : 'rgba(0,0,0,0.1)'}`, background: isDark ? undefined : '#fff', boxShadow: isDark ? 'none' : '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                    <Youtube color="#FF0000" size={24} />
                    <h5 className="mb-0 fw-bold" style={{ color: isDark ? '#fff' : '#000' }}>YouTube Live</h5>
                </div>
                
                {status.hasCredentials ? (
                    <div className="text-center py-3">
                        <p className="x-small opacity-75 mb-3" style={{ color: isDark ? '#fff' : '#000' }}>
                            {status.connected === false ? 'Tu sesión expiró o aún no estás conectado.' : 'Falta autorizar el inicio de sesión.'}
                        </p>
                        <button onClick={loginDirectly} className="btn text-white w-100 fw-bold mb-2 shadow" style={{ background: '#FF0000', borderRadius: '12px', fontSize: '0.8rem' }} disabled={loading}>
                            {loading ? 'CARGANDO...' : <><LogIn size={16} className="me-2"/> VINCULAR CANAL</>}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-3">
                        <p className="x-small opacity-50 mb-3" style={{ color: isDark ? '#fff' : '#000' }}>El administrador no ha configurado las credenciales de YouTube (YOUTUBE_CLIENT_ID) en el servidor.</p>
                    </div>
                )}
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-4" style={{ borderRadius: '25px', border: `1px solid ${isDark ? OASIS_COLORS.glassBorder : 'rgba(0,0,0,0.1)'}`, background: isDark ? undefined : '#fff', boxShadow: isDark ? 'none' : '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                    <Youtube color="#FF0000" size={24} />
                    <h5 className="mb-0 fw-bold" style={{ color: isDark ? '#fff' : '#000', fontFamily: 'Moonrising' }}>
                        YOUTUBE <span style={{ color: broadcast.active && broadcast.status === 'live' ? OASIS_COLORS.success : OASIS_COLORS.accent }}>{broadcast.active && broadcast.status === 'live' ? 'EN VIVO' : 'STUDIO'}</span>
                    </h5>
                </div>
                {broadcast.active && (
                    <div className="d-flex gap-3 align-items-center">
                        <div className="d-flex align-items-center gap-1 opacity-75">
                            <Users size={14} color={isDark ? '#fff' : '#000'} />
                            <span className="fw-bold" style={{ fontSize: '0.85rem', color: isDark ? '#fff' : '#000' }}>{broadcast.stats.viewers}</span>
                        </div>
                    </div>
                )}
            </div>

            {!broadcast.active ? (
                <div className="text-center py-4 opacity-50">
                    <RefreshCw size={24} className="mb-2" />
                    <p className="x-small fw-bold m-0" style={{ color: isDark ? '#fff' : '#000' }}>Buscando transmisión programada...</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    <div className="p-3" style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: '15px' }}>
                        <p className="x-small fw-bold opacity-50 mb-1" style={{ color: isDark ? '#fff' : '#000' }}>TÍTULO DE TRANSMISIÓN</p>
                        <p className="fw-bold mb-0" style={{ color: isDark ? '#fff' : '#000', fontSize: '0.9rem' }}>{broadcast.title}</p>
                    </div>

                    <div className="d-flex gap-2">
                        {broadcast.status !== 'live' ? (
                            <button className="btn text-dark fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2 disabled" style={{ background: OASIS_COLORS.accent, borderRadius: '12px', fontSize: '0.8rem', opacity: 0.5 }}>
                                <PlayCircle size={18} /> INICIAR VIVO (Vía OBS)
                            </button>
                        ) : (
                            <button className="btn fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2 disabled" style={{ background: 'rgba(255,0,0,0.1)', color: '#FF0000', border: '1px solid #FF0000', borderRadius: '12px', fontSize: '0.8rem', opacity: 0.5 }}>
                                <StopCircle size={18} /> CORTAR (Vía OBS)
                            </button>
                        )}
                    </div>

                    {/* Chat Box */}
                    {broadcast.chatId && (
                        <div className="mt-3">
                            <div className="d-flex align-items-center gap-2 mb-2 opacity-50">
                                <MessageCircle size={14} color={isDark ? '#fff' : '#000'} />
                                <span className="x-small fw-bold" style={{ color: isDark ? '#fff' : '#000' }}>CHAT EN VIVO ({chatMessages.length})</span>
                            </div>
                            <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '180px', paddingRight: '5px' }}>
                                {chatMessages.length === 0 && <p className="x-small opacity-50 text-center py-2" style={{ color: isDark ? '#fff' : '#000' }}>No hay mensajes aún.</p>}
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className="d-flex gap-2">
                                        <img src={msg.authorAvatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                                        <div style={{ flex: 1 }}>
                                            <span className="x-small fw-bold opacity-75 me-2" style={{ color: isDark ? '#fff' : '#000' }}>{msg.author}</span>
                                            <span className="x-small" style={{ color: isDark ? '#fff' : '#000' }}>{msg.message}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </GlassCard>
    );
};

export default YoutubeLivePanel;
