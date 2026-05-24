import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import { 
    Inbox, Clock, CheckCircle2, AlertCircle, 
    Send, Mail, MessageSquare, Search, User, 
    Phone, CheckCircle, XCircle, MoreVertical,
    Filter, Calendar, ChevronRight, Trash2
} from 'lucide-react';
import GlassCard from '../react-ui/components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const REQUESTS_REFRESH_MS = 5000;

const OASIS_COLORS = {
    deepPurple: '#120C1F',
    midnight: '#08050D',
    accent: '#F59E0B',
    glassWhite: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
};

const STATUS_CONFIG = {
    pendiente: { label: 'PENDIENTE', color: OASIS_COLORS.accent, bg: `${OASIS_COLORS.accent}15`, icon: Clock },
    gestionada: { label: 'GESTIONADA', color: OASIS_COLORS.success, bg: `${OASIS_COLORS.success}15`, icon: CheckCircle2 },
    sin_respuesta: { label: 'SIN RESPUESTA', color: OASIS_COLORS.error, bg: `${OASIS_COLORS.error}15`, icon: AlertCircle },
};

const CAT_COLORS = {
    'Oración': '#8b5cf6', 'Consejería': '#3b82f6', 'Visita': '#06b6d4',
    'Bautismo': '#10b981', 'Información': '#f59e0b', 'Otro': '#6b7280',
};

const Solicitudes = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('todas');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const { mode } = useTheme();
    const { showToast } = useToast();
    const isDark = mode === 'dark';
    const textPrimary = isDark ? '#FFFFFF' : OASIS_COLORS.deepPurple;
    const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748B';
    const softSurface = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(18,12,31,0.06)';
    const borderTone = isDark ? OASIS_COLORS.glassBorder : 'rgba(18,12,31,0.12)';
    const channelOffColor = isDark ? 'rgba(255,255,255,0.35)' : '#94A3B8';

    useEffect(() => {
        fetchRequests();

        const intervalId = window.setInterval(() => {
            fetchRequests({ silent: true });
        }, REQUESTS_REFRESH_MS);

        const refreshOnFocus = () => fetchRequests({ silent: true });
        const refreshOnVisible = () => {
            if (document.visibilityState === 'visible') {
                fetchRequests({ silent: true });
            }
        };

        window.addEventListener('focus', refreshOnFocus);
        document.addEventListener('visibilitychange', refreshOnVisible);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refreshOnFocus);
            document.removeEventListener('visibilitychange', refreshOnVisible);
        };
    }, []);

    const fetchRequests = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            const { data } = await apiClient.get('/requests');
            setRequests(data || []);
            setSelected(prev => {
                if (!prev?.id) return prev;
                const updated = (data || []).find(r => r.id === prev.id);
                return updated || null;
            });
        } catch (e) { console.error(e); }
        finally {
            if (!silent) setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await apiClient.patch(`/requests/${id}/status`, { status: newStatus, notes });
            setSelected(prev => prev ? { ...prev, status: newStatus, notes } : prev);
            showToast(`Estado actualizado`, 'success');
            await fetchRequests();
        } catch (e) {
            showToast('Error al actualizar estado', 'error');
        }
    };

    const handleWhatsApp = async () => {
        if (!selected) return;
        try {
            setProcessing(true);
            const { data } = await apiClient.post(`/requests/${selected.id}/whatsapp-link`, { notes });
            if (data.link) {
                window.open(data.link, '_blank');
                showToast('WhatsApp abierto', 'success');
                await fetchRequests();
            }
        } catch (e) {
            showToast(e.response?.data?.message || 'Error al conectar con WhatsApp', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleSendEmail = async () => {
        if (!selected) return;
        try {
            setProcessing(true);
            await apiClient.post(`/requests/${selected.id}/send-email`, { notes });
            showToast('Correo enviado correctamente', 'success');
            await fetchRequests();
        } catch (e) {
            showToast('Error al enviar correo', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteRequest = async () => {
        if (!selected) return;
        if (!selected.id) {
            showToast('No se pudo identificar la solicitud a eliminar.', 'error');
            return;
        }

        try {
            setProcessing(true);
            try {
                await apiClient.delete(`/requests/${selected.id}`);
            } catch (deleteErr) {
                const status = deleteErr?.response?.status;
                // Fallback para entornos donde DELETE es bloqueado por proxy/firewall
                if (status === 404 || status === 405) {
                    await apiClient.post(`/requests/${selected.id}/delete`);
                } else {
                    throw deleteErr;
                }
            }
            showToast('Solicitud eliminada correctamente', 'success');
            setSelected(null);
            setNotes('');
            await fetchRequests();
        } catch (e) {
            const msg = e?.response?.data?.message || 'Error al eliminar la solicitud';
            showToast(msg, 'error');
        } finally {
            setProcessing(false);
        }
    };

    const openDetail = (req) => {
        setSelected(req);
        setNotes(req.notes || req.response || '');
    };

    const filtered = requests.filter(r => filter === 'todas' || r.status === filter);
    const stats = {
        total: requests.length,
        pendiente: requests.filter(r => r.status === 'pendiente').length,
        gestionada: requests.filter(r => r.status === 'gestionada').length,
        sin_respuesta: requests.filter(r => r.status === 'sin_respuesta').length,
    };

    if (loading && requests.length === 0) return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: isDark ? OASIS_COLORS.midnight : '#F9FAFB' }}>
            <div className="spinner-border" style={{ color: OASIS_COLORS.accent }} role="status"></div>
        </div>
    );

    return (
        <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh', padding: '40px' }}>
            <header className="mb-5">
                <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Community Outreach</span>
                <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                    GESTIÓN DE <span style={{ color: OASIS_COLORS.accent }}>SOLICITUDES</span>
                </h1>
            </header>

            {/* KPI Section */}
            <div className="row g-4 mb-5">
                {[
                    { label: 'Total Peticiones', value: stats.total, icon: Inbox, color: OASIS_COLORS.accent },
                    { label: 'Pendientes', value: stats.pendiente, icon: Clock, color: OASIS_COLORS.accent },
                    { label: 'Gestionadas', value: stats.gestionada, icon: CheckCircle2, color: OASIS_COLORS.success },
                    { label: 'Sin Respuesta', value: stats.sin_respuesta, icon: AlertCircle, color: OASIS_COLORS.error },
                ].map((s, idx) => (
                    <div key={idx} className="col-md-3">
                        <GlassCard style={{ padding: '25px', borderRadius: '25px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <s.icon size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: isDark ? '#fff' : OASIS_COLORS.deepPurple, lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', color: isDark ? '#fff' : '#64748b' }}>{s.label}</div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                ))}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-2">
                    {[['todas', 'TODAS'], ['pendiente', 'PENDIENTES'], ['gestionada', 'GESTIONADAS'], ['sin_respuesta', 'SIN RESPUESTA']].map(([key, label]) => (
                        <button key={key} onClick={() => setFilter(key)} className="btn btn-sm rounded-pill px-4 fw-bold" 
                            style={{ 
                                background: filter === key ? OASIS_COLORS.accent : softSurface,
                                color: filter === key ? OASIS_COLORS.midnight : textSecondary,
                                border: `1px solid ${borderTone}`,
                                fontSize: '0.65rem'
                            }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <GlassCard style={{ borderRadius: '30px', overflow: 'hidden', border: `1px solid ${borderTone}` }}>
                <div className="table-responsive">
                    <table className={`table ${isDark ? 'table-dark' : ''} table-hover align-middle mb-0`}>
                        <thead style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.03)' }}>
                            <tr style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 900, color: OASIS_COLORS.accent }}>
                                <th className="ps-5 py-4">Solicitante</th>
                                <th className="text-center">Categoría</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Canales</th>
                                <th className="text-end pe-5">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 opacity-50">No hay solicitudes que mostrar</td></tr>
                            ) : (
                                filtered.map(req => (
                                    <tr key={req.id} onClick={() => openDetail(req)} style={{ cursor: 'pointer', transition: '0.2s', borderBottom: `1px solid ${OASIS_COLORS.glassBorder}` }} className="hover-row">
                                        <td className="ps-5 py-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: OASIS_COLORS.glassWhite, color: OASIS_COLORS.accent }}>
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold" style={{ color: isDark ? '#fff' : '#120C1F' }}>{req.is_anonymous ? '🕵️ Anónimo' : (req.name || 'Sin nombre')}</div>
                                                    <div className="x-small opacity-50" style={{ color: isDark ? '#fff' : '#64748b' }}>{req.phone || 'No registra teléfono'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900, background: (CAT_COLORS[req.category] || '#666') + '20', color: CAT_COLORS[req.category] || '#666' }}>
                                                {req.category}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill" style={{ background: STATUS_CONFIG[req.status]?.bg, color: STATUS_CONFIG[req.status]?.color, fontSize: '0.6rem', fontWeight: 900 }}>
                                                {React.createElement(STATUS_CONFIG[req.status]?.icon || Clock, { size: 12 })}
                                                {STATUS_CONFIG[req.status]?.label}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex gap-3 justify-content-center opacity-50">
                                                <Mail size={16} color={req.email_sent_at ? OASIS_COLORS.success : channelOffColor} />
                                                <MessageSquare size={16} color={req.wa_link_opened_at ? OASIS_COLORS.success : channelOffColor} />
                                            </div>
                                        </td>
                                        <td className="text-end pe-5">
                                            <button className="btn p-2 rounded-circle" style={{ background: softSurface, color: textPrimary }}>
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Detail Modal */}
            <AnimatePresence>
                {selected && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1050, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)' }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-100" style={{ maxWidth: '600px', padding: '20px' }}>
                            <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${borderTone}`, position: 'relative', background: isDark ? '#121826' : '#FFFFFF' }}>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="btn p-2 rounded-circle"
                                    title="Cerrar"
                                    style={{ position: 'absolute', top: '14px', left: '14px', background: softSurface, color: textPrimary, border: `1px solid ${borderTone}` }}
                                >
                                    <XCircle size={18} />
                                </button>
                                <div className="mb-4">
                                    <h4 style={{ fontFamily: 'Moonrising', color: textPrimary, marginLeft: '36px' }}>GESTIÓN DE <span style={{ color: OASIS_COLORS.accent }}>SOLICITUD</span></h4>
                                </div>
                                
                                <div className="p-4 rounded-4 mb-4" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(15,23,42,0.05)', border: `1px solid ${borderTone}` }}>
                                    <label style={labelStyle}>Mensaje Original</label>
                                    <p className="small mb-0" style={{ lineHeight: 1.6, color: textPrimary }}>{selected.description}</p>
                                </div>

                                <div className="mb-4">
                                    <label style={labelStyle}>Seguimiento / Respuesta</label>
                                    <textarea className="form-control oasis-input" rows="4" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas..." />
                                </div>

                                <div className="mb-5">
                                    <label style={labelStyle}>Actualizar Estado</label>
                                    <div className="d-flex gap-2">
                                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                                            const isActive = selected.status === key;
                                            return (
                                                <button key={key} onClick={() => handleStatusChange(selected.id, key)} className="btn btn-sm flex-grow-1 py-3 rounded-4 fw-900" 
                                                    style={{ 
                                                        background: isActive ? cfg.color : softSurface,
                                                        color: isActive ? OASIS_COLORS.midnight : cfg.color,
                                                        fontSize: '0.6rem',
                                                        border: `1px solid ${isActive ? 'transparent' : borderTone}`
                                                    }}>
                                                    {cfg.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="d-flex gap-3">
                                    <button 
                                        onClick={handleSendEmail} 
                                        disabled={processing}
                                        className="btn flex-grow-1 py-3 rounded-pill fw-bold text-white d-flex align-items-center justify-content-center gap-2" 
                                        style={{ background: OASIS_COLORS.accent }}
                                    >
                                        <Mail size={18} /> {processing ? 'ENVIANDO...' : 'RE-ENVIAR CORREO'}
                                    </button>

                                    <button 
                                        onClick={handleWhatsApp} 
                                        disabled={processing}
                                        className="btn flex-grow-1 py-3 rounded-pill fw-bold text-white d-flex align-items-center justify-content-center gap-2" 
                                        style={{ background: '#25D366' }}
                                    >
                                        <MessageSquare size={18} /> {processing ? 'CONECTANDO...' : 'WHATSAPP'}
                                    </button>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={handleDeleteRequest}
                                        disabled={processing}
                                        className="btn w-100 py-3 rounded-pill fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                                        style={{ background: OASIS_COLORS.error }}
                                    >
                                        <Trash2 size={18} /> {processing ? 'PROCESANDO...' : 'ELIMINAR SOLICITUD'}
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .hover-row:hover { background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.03)'} !important; }
                .oasis-input { background: ${isDark ? OASIS_COLORS.glassWhite : '#fff'} !important; border: 1px solid ${borderTone} !important; color: ${isDark ? '#fff' : '#120C1F'} !important; border-radius: 20px !important; padding: 15px !important; font-size: 0.9rem !important; }
                .oasis-input:focus { border-color: ${OASIS_COLORS.accent} !important; }
                .x-small { font-size: 0.7rem; }
                .fw-900 { font-weight: 900; }
            `}</style>
        </div>
    );
};

const labelStyle = { fontSize: '0.65rem', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '1px' };

export default Solicitudes;