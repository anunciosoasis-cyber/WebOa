import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import GlassCard from '../react-ui/components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Info, Heart, Eye, Shield, History, Users, 
    Image as ImageIcon, Plus, Trash2, Camera, 
    Upload, CheckCircle2, X, Save, Edit2,
    Layout, ArrowRight, UserPlus, RefreshCcw
} from 'lucide-react';

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

const SectionHeader = ({ icon: Icon, title, subtitle, badge, isDark }) => (
    <div className="mb-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: OASIS_COLORS.accent + '15', color: OASIS_COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} />
            </div>
            <div>
                <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.9rem', margin: 0, color: OASIS_COLORS.accent }}>{title}</h4>
                {subtitle && <p style={{ fontSize: '0.7rem', opacity: 0.5, margin: 0, color: isDark ? '#fff' : '#64748b' }}>{subtitle}</p>}
            </div>
        </div>
        {badge}
    </div>
);

const DEFAULTS = {
    about_hero_title: 'Nuestra Identidad',
    about_hero_content: 'Somos una comunidad dedicada a transformar vidas a través del amor, el servicio y la innovación.',
    about_mission_title: 'Nuestra Misión',
    about_mission_content: 'Llevar el mensaje de esperanza a cada rincón, restaurando vidas y familias.',
    about_mission_icon: 'heart',
    about_vision_title: 'Nuestra Visión',
    about_vision_content: 'Ser una iglesia relevante y vibrante que impacta su entorno.',
    about_vision_icon: 'eye',
    about_values_title: 'Valores',
    about_values_content: 'Integridad, Excelencia, Unidad y Amor en todas nuestras acciones.',
    about_values_icon: 'shield',
    about_history_title: 'Nuestra Historia',
    about_history_content: 'Fundada en 2020, OASIS nació como una respuesta a la necesidad de conexión.',
    about_history_image: null,
    about_timeline: JSON.stringify([
        { year: '2018', event: 'El Génesis', desc: 'Visión en Medellín: refugio de paz.', icon: 'Zap', color: '#F59E0B' },
        { year: '2020', event: 'Salto Digital', desc: 'Conexión global en Latinoamérica.', icon: 'Globe', color: '#8B5CF6' },
        { year: '2023', event: 'Sede Física', desc: 'Inauguración ecosistema principal.', icon: 'Home', color: '#10B981' },
        { year: '2025', event: 'Oasis Infinite', desc: 'Plataforma modular y expansión nacional.', icon: 'Rocket', color: '#3B82F6' },
    ])
};

const AdminAbout = () => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const [settings, setSettings] = useState(DEFAULTS);
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [boardMembers, setBoardMembers] = useState([]);
    const [galleryItems, setGalleryItems] = useState([]);
    const [memberForm, setMemberForm] = useState({ name: '', role: '', type: 'individual', description: '', imageUrl: '', fullscreenImageUrl: '' });
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [memberFormSaving, setMemberFormSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => {} });

    const fetchData = async () => {
        try {
            const [settingsRes, boardRes, galleryRes] = await Promise.all([
                apiClient.get('/settings'),
                apiClient.get('/board-members'),
                apiClient.get('/gallery-items')
            ]);
            const settingsObj = Array.isArray(settingsRes.data) ?
                settingsRes.data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) :
                settingsRes.data;
            setSettings(prev => ({ ...prev, ...settingsObj }));
            try {
                const tl = settingsObj.about_timeline ? JSON.parse(settingsObj.about_timeline) : JSON.parse(DEFAULTS.about_timeline);
                setTimelineEvents(tl);
            } catch (e) {
                setTimelineEvents(JSON.parse(DEFAULTS.about_timeline));
            }
            setBoardMembers(boardRes.data);
            setGalleryItems(galleryRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const set = useCallback((key, val) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    }, []);

    const handleSaveSettings = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await apiClient.post('/settings', { ...settings, about_timeline: JSON.stringify(timelineEvents) });
            showToast('Identidad guardada', 'success');
        } catch (err) { showToast('Error al guardar', 'error'); }
        finally { setSaving(false); }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.url || res.data.filename;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMemberFormSaving(true);
        try {
            await apiClient.post('/board-members', { ...memberForm, order: boardMembers.length });
            setMemberForm({ name: '', role: '', type: 'individual', description: '', imageUrl: '', fullscreenImageUrl: '' });
            setShowMemberForm(false);
            fetchData();
            showToast('Miembro añadido', 'success');
        } catch (err) { showToast('Error', 'error'); }
        finally { setMemberFormSaving(false); }
    };

    const handleBoardDelete = async (id) => {
        setConfirmConfig({
            show: true, title: 'Eliminar Miembro', message: '¿Estás seguro?', type: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/board-members/${id}`);
                    fetchData();
                    showToast('Eliminado', 'success');
                } catch (err) { showToast('Error', 'error'); }
                setConfirmConfig(p => ({ ...p, show: false }));
            }
        });
    };

    const handleGalleryDelete = async (id) => {
        setConfirmConfig({
            show: true, title: 'Eliminar Imagen', message: '¿Eliminar de la galería?', type: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/gallery-items/${id}`);
                    fetchData();
                    showToast('Imagen eliminada', 'success');
                } catch (err) { showToast('Error', 'error'); }
                setConfirmConfig(p => ({ ...p, show: false }));
            }
        });
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
        return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: isDark ? OASIS_COLORS.midnight : '#F9FAFB' }}>
            <div className="spinner-border" style={{ color: OASIS_COLORS.accent }} role="status"></div>
        </div>
    );

    return (
        <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh', padding: '40px' }}>
            <header className="mb-5 d-flex justify-content-between align-items-end">
                <div>
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Branding & Vision</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                        GESTIÓN DE <span style={{ color: OASIS_COLORS.accent }}>IDENTIDAD</span>
                    </h1>
                </div>
                <button 
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="btn rounded-pill px-4 shadow-sm fw-bold border-0 text-dark d-flex align-items-center gap-2" 
                    style={{ background: OASIS_COLORS.accent, height: '48px' }}
                >
                    {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'GUARDANDO...' : 'GUARDAR IDENTIDAD'}
                </button>
            </header>

            <div className="row g-4">
                {/* 1. HERO SECTION */}
                <div className="col-12">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <SectionHeader icon={Layout} title="ENCABEZADO" subtitle="Título y descripción principal" isDark={isDark} />
                        <div className="row g-4">
                            <div className="col-md-5">
                                <label style={labelStyle}>Título Principal</label>
                                <input className="form-control oasis-input" value={settings.about_hero_title} onChange={e => set('about_hero_title', e.target.value)} />
                            </div>
                            <div className="col-md-7">
                                <label style={labelStyle}>Contenido Introductorio</label>
                                <textarea className="form-control oasis-input" rows="2" value={settings.about_hero_content} onChange={e => set('about_hero_content', e.target.value)} />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 2. CORE PILLARS */}
                <div className="col-md-4">
                    <GlassCard style={{ padding: '30px', borderRadius: '30px', border: `1px solid ${OASIS_COLORS.glassBorder}`, height: '100%' }}>
                        <SectionHeader icon={Heart} title="MISIÓN" isDark={isDark} />
                        <textarea className="form-control oasis-input" rows="4" value={settings.about_mission_content} onChange={e => set('about_mission_content', e.target.value)} />
                    </GlassCard>
                </div>
                <div className="col-md-4">
                    <GlassCard style={{ padding: '30px', borderRadius: '30px', border: `1px solid ${OASIS_COLORS.glassBorder}`, height: '100%' }}>
                        <SectionHeader icon={Eye} title="VISIÓN" isDark={isDark} />
                        <textarea className="form-control oasis-input" rows="4" value={settings.about_vision_content} onChange={e => set('about_vision_content', e.target.value)} />
                    </GlassCard>
                </div>
                <div className="col-md-4">
                    <GlassCard style={{ padding: '30px', borderRadius: '30px', border: `1px solid ${OASIS_COLORS.glassBorder}`, height: '100%' }}>
                        <SectionHeader icon={Shield} title="VALORES" isDark={isDark} />
                        <textarea className="form-control oasis-input" rows="4" value={settings.about_values_content} onChange={e => set('about_values_content', e.target.value)} />
                    </GlassCard>
                </div>

                {/* 3. HISTORY */}
                <div className="col-12">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <SectionHeader icon={History} title="HISTORIA" subtitle="Nuestro recorrido" isDark={isDark} />
                        <div className="row g-4 align-items-center">
                            <div className="col-md-8">
                                <label style={labelStyle}>Título de Historia</label>
                                <input className="form-control oasis-input mb-4" value={settings.about_history_title} onChange={e => set('about_history_title', e.target.value)} />
                                <label style={labelStyle}>Contenido</label>
                                <textarea className="form-control oasis-input" rows="6" value={settings.about_history_content} onChange={e => set('about_history_content', e.target.value)} />
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 rounded-4 border border-dashed" style={{ borderColor: OASIS_COLORS.glassBorder, background: OASIS_COLORS.glassWhite }}>
                                    <div className="mb-3 rounded-3 overflow-hidden" style={{ aspectRatio: '16/9', background: '#000' }}>
                                        {settings.about_history_image ? (
                                            <img src={getImageUrl(settings.about_history_image)} className="w-100 h-100 object-fit-cover" alt="" />
                                        ) : (
                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center opacity-25"><ImageIcon size={48} /></div>
                                        )}
                                    </div>
                                    <label className="btn w-100 rounded-pill py-2 fw-bold text-white" style={{ background: OASIS_COLORS.glassWhite, border: `1px solid ${OASIS_COLORS.glassBorder}`, fontSize: '0.7rem' }}>
                                        <Upload size={14} className="me-2" /> CAMBIAR IMAGEN
                                        <input type="file" hidden onChange={async e => set('about_history_image', await uploadFile(e.target.files[0]))} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 3.5. TIMELINE EVENTS */}
                <div className="col-12">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <SectionHeader icon={History} title="LÍNEA DE TIEMPO" subtitle="Hitos históricos de Oasis" isDark={isDark} />
                            <button onClick={() => setTimelineEvents([...timelineEvents, { year: '', event: '', desc: '', icon: 'Circle', color: '#F59E0B' }])} className="btn rounded-pill px-4 fw-bold" style={{ background: `${OASIS_COLORS.accent}15`, color: OASIS_COLORS.accent, border: `1px solid ${OASIS_COLORS.accent}`, fontSize: '0.7rem' }}>
                                <Plus size={16} className="me-2" /> AÑADIR HITO
                            </button>
                        </div>
                        <div className="row g-4">
                            {timelineEvents.map((ev, i) => (
                                <div key={i} className="col-md-6 col-lg-3">
                                    <GlassCard style={{ padding: '20px', borderRadius: '25px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                                        <div className="d-flex justify-content-end mb-2">
                                            <button onClick={() => { const nw = [...timelineEvents]; nw.splice(i, 1); setTimelineEvents(nw); }} className="btn p-0 text-danger opacity-50 hover-opacity-100"><Trash2 size={16}/></button>
                                        </div>
                                        <input className="form-control oasis-input mb-2" placeholder="Año" value={ev.year} onChange={e => { const nw = [...timelineEvents]; nw[i].year = e.target.value; setTimelineEvents(nw); }} />
                                        <input className="form-control oasis-input mb-2" placeholder="Evento" value={ev.event} onChange={e => { const nw = [...timelineEvents]; nw[i].event = e.target.value; setTimelineEvents(nw); }} />
                                        <textarea className="form-control oasis-input mb-2" rows="2" placeholder="Descripción" value={ev.desc} onChange={e => { const nw = [...timelineEvents]; nw[i].desc = e.target.value; setTimelineEvents(nw); }} />
                                        <input className="form-control oasis-input mb-2" placeholder="Icono (ej. Zap)" value={ev.icon} onChange={e => { const nw = [...timelineEvents]; nw[i].icon = e.target.value; setTimelineEvents(nw); }} />
                                        <input type="color" className="form-control form-control-color w-100 mb-2" value={ev.color || '#ffffff'} onChange={e => { const nw = [...timelineEvents]; nw[i].color = e.target.value; setTimelineEvents(nw); }} />
                                    </GlassCard>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* 4. BOARD MEMBERS */}
                <div className="col-12">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <SectionHeader icon={Users} title="JUNTA DIRECTIVA" subtitle="Liderazgo actual" isDark={isDark} />
                            <button onClick={() => setShowMemberForm(true)} className="btn rounded-pill px-4 fw-bold" style={{ background: `${OASIS_COLORS.accent}15`, color: OASIS_COLORS.accent, border: `1px solid ${OASIS_COLORS.accent}`, fontSize: '0.7rem' }}>
                                <UserPlus size={16} className="me-2" /> AÑADIR MIEMBRO
                            </button>
                        </div>

                        <div className="row g-4">
                            {boardMembers.map(m => (
                                <div key={m.id} className="col-md-6 col-lg-4">
                                    <motion.div whileHover={{ y: -5 }}>
                                        <GlassCard style={{ padding: '20px', borderRadius: '25px', border: `1px solid ${OASIS_COLORS.glassBorder}`, position: 'relative' }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div style={{ width: '60px', height: '60px', borderRadius: '15px', overflow: 'hidden', flexShrink: 0, border: `1px solid ${OASIS_COLORS.glassBorder}`, background: '#000' }}>
                                                    <img src={getImageUrl(m.imageUrl)} className="w-100 h-100 object-fit-cover" alt="" />
                                                </div>
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <h6 style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{m.type === 'group' ? m.role : m.name}</h6>
                                                    <span style={{ fontSize: '0.65rem', color: OASIS_COLORS.accent, fontWeight: 900 }}>{m.type === 'group' ? 'DEPTO' : m.role}</span>
                                                </div>
                                                <button onClick={() => handleBoardDelete(m.id)} className="btn p-0 text-danger opacity-50 hover-opacity-100"><Trash2 size={16} /></button>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                </div>
                            ))}
                        </div>

                        <AnimatePresence>
                            {showMemberForm && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mt-5 p-5 rounded-4" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                                    <div className="d-flex justify-content-between mb-4">
                                        <h5 style={{ fontFamily: 'Moonrising', fontSize: '0.8rem', color: '#fff' }}>NUEVO <span style={{ color: OASIS_COLORS.accent }}>REGISTRO</span></h5>
                                        <button onClick={() => setShowMemberForm(false)} className="btn text-white-50"><X /></button>
                                    </div>
                                    <div className="row g-4">
                                        <div className="col-md-4">
                                            <div className="text-center">
                                                <div className="mx-auto mb-3 rounded-4 overflow-hidden border" style={{ width: '120px', height: '150px', background: '#000', borderColor: OASIS_COLORS.glassBorder }}>
                                                    {memberForm.imageUrl ? <img src={getImageUrl(memberForm.imageUrl)} className="w-100 h-100 object-fit-cover" /> : <div className="w-100 h-100 d-flex align-items-center justify-content-center opacity-25 text-white"><Camera size={32} /></div>}
                                                </div>
                                                <label className="btn btn-sm rounded-pill px-3" style={{ background: OASIS_COLORS.glassWhite, color: '#fff', fontSize: '0.6rem', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                                                    SUBIR FOTO
                                                    <input type="file" hidden onChange={async e => setMemberForm({...memberForm, imageUrl: await uploadFile(e.target.files[0])})} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-8">
                                            <div className="row g-3">
                                                <div className="col-md-8">
                                                    <label style={labelStyle}>Nombre Completo</label>
                                                    <input className="form-control oasis-input" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label style={labelStyle}>Tipo</label>
                                                    <select className="form-select oasis-input" value={memberForm.type} onChange={e => setMemberForm({...memberForm, type: e.target.value})}>
                                                        <option value="individual">Persona</option>
                                                        <option value="group">Grupo</option>
                                                    </select>
                                                </div>
                                                <div className="col-12">
                                                    <label style={labelStyle}>Cargo / Departamento</label>
                                                    <input className="form-control oasis-input" value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} />
                                                </div>
                                                <div className="col-12">
                                                    <label style={labelStyle}>Breve Descripción</label>
                                                    <textarea className="form-control oasis-input" rows="2" value={memberForm.description} onChange={e => setMemberForm({...memberForm, description: e.target.value})} />
                                                </div>
                                                <div className="col-12 text-end">
                                                    <button onClick={handleFormSubmit} disabled={memberFormSaving} className="btn rounded-pill px-4 fw-bold text-dark" style={{ background: OASIS_COLORS.accent }}>{memberFormSaving ? 'GUARDANDO...' : 'AÑADIR MIEMBRO'}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>
                </div>

                {/* 5. GALLERY */}
                <div className="col-12">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <SectionHeader icon={ImageIcon} title="GALERÍA" subtitle="Momentos Oasis" isDark={isDark} />
                            <label className="btn rounded-pill px-4 fw-bold" style={{ background: `${OASIS_COLORS.success}15`, color: OASIS_COLORS.success, border: `1px solid ${OASIS_COLORS.success}`, fontSize: '0.7rem' }}>
                                <Upload size={16} className="me-2" /> SUBIR FOTOS
                                <input type="file" hidden multiple onChange={async e => {
                                    const files = Array.from(e.target.files);
                                    for (const file of files) {
                                        const url = await uploadFile(file);
                                        await apiClient.post('/gallery-items', { imageUrl: url, order: galleryItems.length });
                                    }
                                    fetchData();
                                }} />
                            </label>
                        </div>

                        <div className="row g-3">
                            {galleryItems.map(item => (
                                <div key={item.id} className="col-md-4 col-lg-2">
                                    <div className="rounded-4 overflow-hidden position-relative group shadow-sm border" style={{ borderColor: OASIS_COLORS.glassBorder, aspectRatio: '1/1' }}>
                                        <img src={getImageUrl(item.imageUrl)} className="w-100 h-100 object-fit-cover" alt="" />
                                        <button onClick={() => handleGalleryDelete(item.id)} className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle" style={{ width: '24px', height: '24px', padding: 0 }}><X size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            <ConfirmationModal 
                show={confirmConfig.show} title={confirmConfig.title} message={confirmConfig.message} type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm} onCancel={() => setConfirmConfig(p => ({ ...p, show: false }))}
            />
            <style>{oasisInputStyles(OASIS_COLORS, isDark)}</style>
        </div>
    );
};

const labelStyle = { fontSize: '0.65rem', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '8px', display: 'block' };

const oasisInputStyles = (colors, isDark) => `
    .oasis-input { background: ${isDark ? colors.glassWhite : '#fff'} !important; border: 1px solid ${colors.glassBorder} !important; color: ${isDark ? '#fff' : '#120C1F'} !important; border-radius: 15px !important; padding: 12px 20px !important; font-size: 0.9rem !important; }
    .oasis-input:focus { border-color: ${colors.accent} !important; box-shadow: 0 0 15px ${colors.accent}20 !important; }
    .form-select.oasis-input { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='rgba(255,255,255,0.5)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important; background-repeat: no-repeat !important; background-position: right 1rem center !important; background-size: 16px 12px !important; }
    .animate-spin { animation: spin 2s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .hover-opacity-100:hover { opacity: 1 !important; }
`;

export default AdminAbout;
