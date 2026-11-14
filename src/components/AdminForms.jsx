import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import GlassCard from '../react-ui/components/GlassCard';
import { motion } from 'framer-motion';
import {
    Plus, Trash2, Pencil, Users,
    Download, Layout, Music, TreePine,
    GraduationCap, ClipboardList, Image as ImageIcon,
    Upload, Loader2, Layers, Sparkles, RotateCcw
} from 'lucide-react';
import oasisCommunityImg from '../img/comunidad-oasis.jpg';

const OASIS_COLORS = {
    deepPurple: '#120C1F',
    midnight: '#08050D',
    accent: '#F59E0B',
    softBg: '#F8F9FC',
    glassWhite: 'rgba(255, 255, 255, 0.04)',
    glassBorderDark: 'rgba(255, 255, 255, 0.12)',
    glassBorderLight: 'rgba(18, 12, 31, 0.12)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
};

const ELEGANT_PALETTES = [
    { name: 'Dorado Oasis', color: '#F59E0B' },
    { name: 'Púrpura Real', color: '#6D28D9' },
    { name: 'Esmeralda', color: '#10B981' },
    { name: 'Índigo', color: '#4F46E5' },
    { name: 'Borgoña', color: '#BE123C' },
    { name: 'Ámbar Cálido', color: '#D97706' }
];

const OVERLAY_LEVELS = [
    { id: 'soft', label: 'Suave', topAlpha: 0.12, bottomAlpha: 0.68 },
    { id: 'medium', label: 'Equilibrada', topAlpha: 0.22, bottomAlpha: 0.84 },
    { id: 'deep', label: 'Cinemática', topAlpha: 0.36, bottomAlpha: 0.94 }
];

const EVENT_TEMPLATES = [
    {
        id: 'culto',
        name: 'Culto de Adoración',
        icon: Layout,
        color: '#4F46E5',
        description: 'Ideal para servicios semanales y reuniones generales.',
        fields: [
            { id: 1, label: 'Nombre Completo', type: 'text', required: true },
            { id: 2, label: 'Correo Electrónico', type: 'email', required: true },
            { id: 3, label: 'Número de Acompañantes', type: 'number', required: true }
        ],
        capacity: 100
    },
    {
        id: 'camp',
        name: 'Campamento / Retiro',
        icon: TreePine,
        color: '#10B981',
        description: 'Formulario con campos de salud y contacto de emergencia.',
        fields: [
            { id: 1, label: 'Nombre Completo', type: 'text', required: true },
            { id: 2, label: 'Edad', type: 'number', required: true },
            { id: 3, label: 'Información Médica / Alergias', type: 'textarea', required: false },
            { id: 4, label: 'Contacto de Emergencia', type: 'text', required: true }
        ],
        capacity: 50
    },
    {
        id: 'concert',
        name: 'Concierto / Evento',
        icon: Music,
        color: '#F59E0B',
        description: 'Para eventos masivos con tipos de entrada.',
        fields: [
            { id: 1, label: 'Nombre Completo', type: 'text', required: true },
            { id: 2, label: 'Tipo de Entrada', type: 'select', required: true, options: 'General, VIP, Cortesía' }
        ],
        capacity: 200
    },
    {
        id: 'seminar',
        name: 'Seminario / Clase',
        icon: GraduationCap,
        color: '#6D28D9',
        description: 'Enfoque profesional y académico.',
        fields: [
            { id: 1, label: 'Nombre Completo', type: 'text', required: true },
            { id: 2, label: 'Email', type: 'email', required: true },
            { id: 3, label: 'Profesión / Ocupación', type: 'text', required: false }
        ],
        capacity: 30
    }
];

const AdminForms = () => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingForm, setEditingForm] = useState(null);
    const [submissions, setSubmissions] = useState(null);
    const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null);
    const [selectingTemplate, setSelectingTemplate] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const coverFileInputRef = useRef(null);
    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => {} });

    const borderSubtle = isDark ? OASIS_COLORS.glassBorderDark : OASIS_COLORS.glassBorderLight;
    const cardSurface = isDark ? '#161026' : '#FFFFFF';
    const textPrimary = isDark ? '#FFFFFF' : OASIS_COLORS.deepPurple;
    const textMuted = isDark ? 'rgba(255,255,255,0.65)' : '#5B556B';

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/admin/event-forms');
            setForms(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCreateNew = () => setSelectingTemplate(true);

    const handleSelectTemplate = (template) => {
        setEditingForm({
            title: template.name,
            description: template.description,
            fields: template.fields.map(f => ({ ...f, id: Date.now() + Math.random() })),
            capacity: template.capacity,
            styles: {
                primaryColor: template.color,
                icon: template.id,
                coverImage: '',
                overlayStrength: 'medium',
                badgeText: 'Convocatoria Oficial'
            },
            isActive: true
        });
        setSelectingTemplate(false);
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCover(true);
        try {
            // Pasa por el backend: valida formato/tamaño y usa la cuenta de Cloudinary de producción
            const body = new FormData();
            body.append('file', file);
            body.append('folder', 'oasis-events');
            const { data } = await apiClient.post('/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (data?.url) {
                setEditingForm(prev => ({
                    ...prev,
                    styles: { ...prev.styles, coverImage: data.url }
                }));
                showToast('Imagen subida correctamente', 'success');
            } else {
                showToast(data?.message || 'No se pudo subir la imagen', 'error');
            }
        } catch (err) {
            const msg = err.response?.status === 413 ? 'La imagen supera 15 MB' : (err.response?.data?.message || err.message);
            showToast('Error al subir imagen: ' + msg, 'error');
        } finally {
            setUploadingCover(false);
            if (coverFileInputRef.current) coverFileInputRef.current.value = '';
        }
    };

    const handleSaveForm = async () => {
        try {
            if (editingForm.id) {
                await apiClient.put(`/admin/event-forms/${editingForm.id}`, editingForm);
            } else {
                await apiClient.post('/admin/event-forms', editingForm);
            }
            setEditingForm(null);
            fetchForms();
            showToast('Formulario guardado', 'success');
        } catch (e) {
            showToast('Error al guardar: ' + e.message, 'error');
        }
    };

    const handleDeleteForm = async (id) => {
        setConfirmConfig({
            show: true, title: 'ELIMINAR FORMULARIO', message: '¿Estás seguro? Se borrarán todos los registros asociados.', type: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/admin/event-forms/${id}`);
                    fetchForms();
                    showToast('Formulario eliminado', 'success');
                } catch (e) { showToast('Error al eliminar', 'error'); }
                setConfirmConfig(p => ({ ...p, show: false }));
            }
        });
    };

    const fetchSubmissions = async (formId) => {
        try {
            const { data } = await apiClient.get('/admin/event-submissions');
            const filtered = (data || []).filter(s => s.eventForm && s.eventForm.id === formId);
            setSubmissions(filtered);
            setViewingSubmissionsFor(forms.find(f => f.id === formId));
        } catch (e) { console.error(e); }
    };

    if (editingForm) {
        const previewAccent = editingForm.styles?.primaryColor || OASIS_COLORS.accent;
        const previewCover = editingForm.styles?.coverImage || oasisCommunityImg;
        const overlayLevel = OVERLAY_LEVELS.find(l => l.id === (editingForm.styles?.overlayStrength || 'medium')) || OVERLAY_LEVELS[1];
        const previewBadge = editingForm.styles?.badgeText || 'Convocatoria Oficial';

        return (
            <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : OASIS_COLORS.softBg, minHeight: '100vh', padding: '40px' }}>
                <header className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3">
                    <div>
                        <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Form Architecture</span>
                        <h1 style={{ fontFamily: 'Moonrising', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', margin: '5px 0 0', color: textPrimary }}>
                            {editingForm.id ? 'EDITAR' : 'CREAR'} <span style={{ color: OASIS_COLORS.accent }}>EVENTO</span>
                        </h1>
                    </div>
                    <button
                        className="btn rounded-pill px-4 fw-bold"
                        style={{
                            background: isDark ? OASIS_COLORS.glassWhite : '#FFFFFF',
                            border: `1px solid ${borderSubtle}`,
                            color: textPrimary,
                            boxShadow: '0 4px 12px rgba(18, 12, 31, 0.06)'
                        }}
                        onClick={() => setEditingForm(null)}
                    >
                        CANCELAR
                    </button>
                </header>

                <div className="row g-4">
                    <div className="col-lg-8">
                        {/* Datos Principales */}
                        <GlassCard style={{ padding: '32px', borderRadius: '28px', background: cardSurface, border: `1px solid ${borderSubtle}`, marginBottom: '26px', boxShadow: '0 18px 40px -18px rgba(18, 12, 31, 0.12)' }}>
                            <div className="row g-4">
                                <div className="col-12">
                                    <label style={labelStyle}>Título del Evento</label>
                                    <input
                                        type="text"
                                        className="form-control oasis-input"
                                        value={editingForm.title}
                                        onChange={e => setEditingForm({ ...editingForm, title: e.target.value })}
                                        placeholder="Ej: Campamento Oasis 2026"
                                    />
                                </div>
                                <div className="col-12">
                                    <label style={labelStyle}>Descripción / Invitación Comercial</label>
                                    <textarea
                                        className="form-control oasis-input"
                                        rows="4"
                                        value={editingForm.description}
                                        onChange={e => setEditingForm({ ...editingForm, description: e.target.value })}
                                        placeholder="Describe la experiencia, fecha, lugar o detalles clave para motivar la inscripción..."
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Imagen de Portada y Capas Visuales */}
                        <GlassCard style={{ padding: '32px', borderRadius: '28px', background: cardSurface, border: `1px solid ${borderSubtle}`, marginBottom: '28px', boxShadow: '0 18px 40px -18px rgba(18, 12, 31, 0.12)' }}>
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                                <div className="d-flex align-items-center gap-2">
                                    <Layers size={18} color={OASIS_COLORS.accent} />
                                    <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.95rem', margin: 0, color: textPrimary }}>
                                        PORTADA Y <span style={{ color: OASIS_COLORS.accent }}>CAPAS VISUALES</span>
                                    </h4>
                                </div>
                                {editingForm.styles?.coverImage && (
                                    <button
                                        type="button"
                                        className="btn btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1"
                                        style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textMuted, border: `1px solid ${borderSubtle}`, fontSize: '0.72rem' }}
                                        onClick={() => setEditingForm({ ...editingForm, styles: { ...editingForm.styles, coverImage: '' } })}
                                    >
                                        <RotateCcw size={12} /> Usar foto Oasis por defecto
                                    </button>
                                )}
                            </div>

                            <div className="row g-4 align-items-stretch">
                                {/* Controles de Foto + Capa */}
                                <div className="col-md-6 d-flex flex-column gap-3">
                                    <div>
                                        <label style={labelStyle}>Fotografía del Evento</label>
                                        <input
                                            ref={coverFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleCoverUpload}
                                        />
                                        <button
                                            type="button"
                                            disabled={uploadingCover}
                                            onClick={() => coverFileInputRef.current?.click()}
                                            style={{
                                                width: '100%',
                                                padding: '13px 18px',
                                                borderRadius: '14px',
                                                border: `1.5px dashed ${OASIS_COLORS.accent}`,
                                                background: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)',
                                                color: isDark ? '#FFFFFF' : OASIS_COLORS.deepPurple,
                                                fontWeight: 800,
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                cursor: uploadingCover ? 'wait' : 'pointer'
                                            }}
                                        >
                                            {uploadingCover ? (
                                                <>
                                                    <Loader2 size={16} className="spin-icon" /> Subiendo imagen...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={16} color={OASIS_COLORS.accent} /> Subir Foto desde Dispositivo
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>O Pegar URL de Imagen</label>
                                        <div className="position-relative">
                                            <input
                                                type="url"
                                                className="form-control oasis-input"
                                                value={editingForm.styles?.coverImage || ''}
                                                onChange={e => setEditingForm({
                                                    ...editingForm,
                                                    styles: { ...editingForm.styles, coverImage: e.target.value }
                                                })}
                                                placeholder="https://... (opcional)"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Etiqueta Destacada (Badge)</label>
                                        <input
                                            type="text"
                                            className="form-control oasis-input"
                                            value={editingForm.styles?.badgeText ?? 'Convocatoria Oficial'}
                                            onChange={e => setEditingForm({
                                                ...editingForm,
                                                styles: { ...editingForm.styles, badgeText: e.target.value }
                                            })}
                                            placeholder="Ej: Cupos Limitados, Retiro 2026..."
                                        />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Intensidad de Capa Oscura</label>
                                        <div className="d-flex gap-2">
                                            {OVERLAY_LEVELS.map(level => {
                                                const active = (editingForm.styles?.overlayStrength || 'medium') === level.id;
                                                return (
                                                    <button
                                                        key={level.id}
                                                        type="button"
                                                        onClick={() => setEditingForm({
                                                            ...editingForm,
                                                            styles: { ...editingForm.styles, overlayStrength: level.id }
                                                        })}
                                                        style={{
                                                            flex: 1,
                                                            padding: '9px 10px',
                                                            borderRadius: '12px',
                                                            border: `1px solid ${active ? previewAccent : borderSubtle}`,
                                                            background: active ? OASIS_COLORS.deepPurple : (isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'),
                                                            color: active ? '#FFFFFF' : textMuted,
                                                            fontWeight: 800,
                                                            fontSize: '0.74rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {level.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Vista Previa en Vivo de las Capas */}
                                <div className="col-md-6 d-flex flex-column">
                                    <label style={labelStyle}>Vista Previa en Vivo</label>
                                    <div
                                        style={{
                                            flex: 1,
                                            minHeight: '260px',
                                            borderRadius: '22px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            backgroundColor: OASIS_COLORS.midnight,
                                            border: `1px solid ${borderSubtle}`,
                                            boxShadow: '0 20px 40px -16px rgba(18, 12, 31, 0.35)'
                                        }}
                                    >
                                        <img
                                            src={previewCover}
                                            alt="Vista previa"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center 42%'
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: `linear-gradient(180deg, rgba(8, 5, 13, ${overlayLevel.topAlpha}) 0%, rgba(18, 12, 31, ${overlayLevel.bottomAlpha}) 100%), radial-gradient(circle at 20% 20%, ${previewAccent}44 0%, transparent 60%)`
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: `linear-gradient(90deg, ${previewAccent}, ${OASIS_COLORS.deepPurple})`
                                            }}
                                        />
                                        <div style={{ position: 'relative', zIndex: 2, height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div className="d-flex justify-content-between align-items-center gap-2">
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        padding: '5px 11px',
                                                        borderRadius: '999px',
                                                        backgroundColor: 'rgba(18, 12, 31, 0.8)',
                                                        border: `1px solid ${previewAccent}77`,
                                                        color: '#FFFFFF',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        letterSpacing: '1.2px',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    <Sparkles size={11} color={previewAccent} />
                                                    {previewBadge}
                                                </span>
                                                <span
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '999px',
                                                        backgroundColor: previewAccent,
                                                        color: OASIS_COLORS.deepPurple,
                                                        fontSize: '0.66rem',
                                                        fontWeight: 900
                                                    }}
                                                >
                                                    {editingForm.capacity > 0 ? `${editingForm.capacity} cupos` : 'Abierto'}
                                                </span>
                                            </div>

                                            <div>
                                                <h5 style={{ fontFamily: 'Moonrising', color: '#FFFFFF', fontSize: '1.2rem', margin: '0 0 6px 0', lineHeight: 1.2 }}>
                                                    {editingForm.title || 'Título del Evento'}
                                                </h5>
                                                <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.78rem', margin: 0, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {editingForm.description || 'Descripción breve de tu evento para invitar a la comunidad.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Estructura de Datos */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.95rem', color: textPrimary, margin: 0 }}>
                                ESTRUCTURA DE <span style={{ color: OASIS_COLORS.accent }}>DATOS</span>
                            </h4>
                            <button
                                className="btn btn-sm rounded-pill px-3 fw-bold"
                                style={{ background: `${OASIS_COLORS.accent}1A`, color: '#B45309', border: `1px solid ${OASIS_COLORS.accent}` }}
                                onClick={() => {
                                    setEditingForm({ ...editingForm, fields: [...editingForm.fields, { id: Date.now(), label: 'Nuevo Campo', type: 'text', required: false }] });
                                }}
                            >
                                + AÑADIR CAMPO
                            </button>
                        </div>

                        {editingForm.fields.map((field, index) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={field.id} className="mb-3">
                                <GlassCard style={{ padding: '18px 24px', borderRadius: '20px', background: cardSurface, border: `1px solid ${borderSubtle}`, boxShadow: '0 8px 24px -12px rgba(18, 12, 31, 0.08)' }}>
                                    <div className="row g-3 align-items-center">
                                        <div className="col-md-5">
                                            <input type="text" className="form-control oasis-input-sm" value={field.label} onChange={e => {
                                                const newFields = [...editingForm.fields];
                                                newFields[index].label = e.target.value;
                                                setEditingForm({ ...editingForm, fields: newFields });
                                            }} />
                                        </div>
                                        <div className="col-md-3">
                                            <select className="form-select oasis-input-sm" value={field.type} onChange={e => {
                                                const newFields = [...editingForm.fields];
                                                newFields[index].type = e.target.value;
                                                setEditingForm({ ...editingForm, fields: newFields });
                                            }}>
                                                <option value="text">Texto</option>
                                                <option value="email">Email</option>
                                                <option value="number">Número</option>
                                                <option value="date">Fecha</option>
                                                <option value="textarea">Área de texto</option>
                                                <option value="select">Dropdown</option>
                                                <option value="file">Archivo</option>
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" checked={field.required} onChange={e => {
                                                    const newFields = [...editingForm.fields];
                                                    newFields[index].required = e.target.checked;
                                                    setEditingForm({ ...editingForm, fields: newFields });
                                                }} id={`req-${field.id}`} />
                                                <label className="form-check-label small fw-semibold" style={{ color: textMuted }} htmlFor={`req-${field.id}`}>Requerido</label>
                                            </div>
                                        </div>
                                        <div className="col-md-2 text-end">
                                            <button className="btn btn-link text-danger p-0" onClick={() => {
                                                const newFields = editingForm.fields.filter((_, i) => i !== index);
                                                setEditingForm({ ...editingForm, fields: newFields });
                                            }}><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Panel Derecho: Configuración Final */}
                    <div className="col-lg-4">
                        <GlassCard style={{ padding: '32px', borderRadius: '28px', background: cardSurface, border: `1px solid ${borderSubtle}`, position: 'sticky', top: '20px', boxShadow: '0 20px 44px -16px rgba(18, 12, 31, 0.14)' }}>
                            <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.95rem', marginBottom: '26px', color: textPrimary }}>
                                CONFIGURACIÓN <span style={{ color: OASIS_COLORS.accent }}>FINAL</span>
                            </h4>

                            <div className="mb-4">
                                <label style={labelStyle}>Aforo Máximo</label>
                                <input
                                    type="number"
                                    className="form-control oasis-input"
                                    value={editingForm.capacity}
                                    onChange={e => setEditingForm({ ...editingForm, capacity: parseInt(e.target.value) || 0 })}
                                    placeholder="0 = Ilimitado"
                                />
                                <small className="mt-2 d-block" style={{ color: textMuted, fontSize: '0.78rem' }}>
                                    0 = Cupos ilimitados.
                                </small>
                            </div>

                            <div className="mb-4">
                                <label style={labelStyle}>Paleta Elegante del Evento</label>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {ELEGANT_PALETTES.map(p => {
                                        const selected = (editingForm.styles?.primaryColor || '').toLowerCase() === p.color.toLowerCase();
                                        return (
                                            <button
                                                key={p.color}
                                                type="button"
                                                title={p.name}
                                                onClick={() => setEditingForm({
                                                    ...editingForm,
                                                    styles: { ...editingForm.styles, primaryColor: p.color }
                                                })}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '10px',
                                                    backgroundColor: p.color,
                                                    border: selected ? '3px solid #120C1F' : '2px solid rgba(255,255,255,0.6)',
                                                    boxShadow: selected ? `0 0 0 2px ${p.color}` : '0 2px 6px rgba(0,0,0,0.15)',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="color"
                                        className="form-control oasis-input"
                                        style={{ width: '64px', height: '44px', padding: '4px' }}
                                        value={previewAccent}
                                        onChange={e => setEditingForm({ ...editingForm, styles: { ...editingForm.styles, primaryColor: e.target.value } })}
                                    />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: textMuted, fontFamily: 'monospace' }}>
                                        {previewAccent.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label style={labelStyle}>Estado del Evento</label>
                                <div className="form-check form-switch mt-2">
                                    <input className="form-check-input" type="checkbox" role="switch" id="isActiveSwitch"
                                        checked={editingForm.isActive !== false}
                                        onChange={e => setEditingForm({ ...editingForm, isActive: e.target.checked })} />
                                    <label className="form-check-label" htmlFor="isActiveSwitch" style={{ color: textPrimary, fontSize: '0.85rem', marginLeft: '8px', fontWeight: 600 }}>
                                        {editingForm.isActive !== false ? 'Activo (visible al público)' : 'Cerrado (oculto al público)'}
                                    </label>
                                </div>
                            </div>

                            <button
                                className="btn w-100 rounded-pill py-3 fw-bold"
                                style={{
                                    background: `linear-gradient(135deg, ${OASIS_COLORS.deepPurple} 0%, #261A40 100%)`,
                                    color: '#FFFFFF',
                                    border: `1px solid ${OASIS_COLORS.accent}66`,
                                    fontSize: '0.86rem',
                                    letterSpacing: '1.2px',
                                    boxShadow: '0 14px 28px -10px rgba(18, 12, 31, 0.4)'
                                }}
                                onClick={handleSaveForm}
                            >
                                PUBLICAR EVENTO
                            </button>
                        </GlassCard>
                    </div>
                </div>
                <style>{oasisInputStyles(OASIS_COLORS, isDark)}</style>
            </div>
        );
    }

    if (selectingTemplate) {
        return (
            <div className="container-fluid py-5" style={{ background: isDark ? OASIS_COLORS.midnight : OASIS_COLORS.softBg, minHeight: '100vh', padding: '40px' }}>
                <header className="text-center mb-5">
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Event Launchpad</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: textPrimary }}>ELIGE UNA <span style={{ color: OASIS_COLORS.accent }}>PLANTILLA</span></h1>
                </header>
                <div className="row g-4 justify-content-center">
                    {EVENT_TEMPLATES.map(t => (
                        <div key={t.id} className="col-md-6 col-xl-3">
                            <motion.div whileHover={{ y: -8 }} onClick={() => handleSelectTemplate(t)} style={{ cursor: 'pointer', height: '100%' }}>
                                <GlassCard style={{ padding: '36px', borderRadius: '28px', height: '100%', background: cardSurface, border: `1px solid ${borderSubtle}`, textAlign: 'center', boxShadow: '0 18px 40px -16px rgba(18, 12, 31, 0.12)' }}>
                                    <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: t.color + '18', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
                                        <t.icon size={30} strokeWidth={2.5} />
                                    </div>
                                    <h4 style={{ fontFamily: 'Moonrising', fontSize: '1rem', marginBottom: '12px', color: textPrimary }}>{t.name}</h4>
                                    <p style={{ fontSize: '0.84rem', color: textMuted, lineHeight: 1.6 }}>{t.description}</p>
                                    <div className="mt-4 pt-3 border-top" style={{ borderColor: borderSubtle }}>
                                        <span style={{ color: t.color, fontWeight: 900, fontSize: '0.72rem', letterSpacing: '1px' }}>SELECCIONAR →</span>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </div>
                    ))}
                    <div className="col-12 text-center mt-5">
                        <button className="btn btn-link fw-bold" style={{ color: textMuted }} onClick={() => setSelectingTemplate(false)}>Volver a la gestión</button>
                    </div>
                </div>
            </div>
        );
    }

    const handleExportExcel = () => {
        const form = viewingSubmissionsFor;
        const headers = form.fields.map(f => f.label);
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";

        csvContent += headers.join(",") + "\n";

        submissions.forEach(sub => {
            const row = form.fields.map(f => {
                let val = sub.data[f.label] || '';
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            });
            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Inscripciones_${form.title.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (viewingSubmissionsFor) {
        return (
            <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : OASIS_COLORS.softBg, minHeight: '100vh', padding: '40px' }}>
                <header className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3">
                    <div>
                        <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Data Analysis</span>
                        <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: textPrimary }}>RESPUESTAS <span style={{ color: OASIS_COLORS.accent }}>RECIBIDAS</span></h1>
                        <p style={{ color: textMuted, fontWeight: 700, margin: '10px 0 0' }}>Evento: {viewingSubmissionsFor.title}</p>
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn rounded-pill px-4 fw-bold d-flex align-items-center gap-2" style={{ background: '#10B981', color: '#fff', border: 'none' }} onClick={handleExportExcel}>
                            <Download size={18} /> EXPORTAR EXCEL
                        </button>
                        <button className="btn rounded-pill px-4 fw-bold" style={{ background: cardSurface, border: `1px solid ${borderSubtle}`, color: textPrimary }} onClick={() => setViewingSubmissionsFor(null)}>
                            VOLVER
                        </button>
                    </div>
                </header>

                <GlassCard style={{ borderRadius: '28px', background: cardSurface, border: `1px solid ${borderSubtle}`, overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table className={`table ${isDark ? 'table-dark' : ''} table-hover align-middle mb-0`} style={{ background: 'transparent' }}>
                            <thead>
                                <tr style={{ fontSize: '0.7rem', color: OASIS_COLORS.accent, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {viewingSubmissionsFor.fields.map(f => <th key={f.id} className="ps-4 py-4">{f.label}</th>)}
                                    <th className="text-end pe-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions?.map(sub => (
                                    <tr key={sub.id} style={{ borderBottom: `1px solid ${borderSubtle}` }}>
                                        {viewingSubmissionsFor.fields.map(f => (
                                            <td key={f.id} className="ps-4 py-3">{sub.data[f.label] || '—'}</td>
                                        ))}
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm text-danger" onClick={() => {}}>ELIMINAR</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : OASIS_COLORS.softBg, minHeight: '100vh', padding: '40px' }}>
            <header className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3">
                <div>
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Community Outreach</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: textPrimary }}>
                        GESTIÓN DE <span style={{ color: OASIS_COLORS.accent }}>EVENTOS</span>
                    </h1>
                </div>
                <button
                    className="btn rounded-pill px-4 shadow-sm fw-bold border-0 d-flex align-items-center gap-2"
                    style={{
                        background: `linear-gradient(135deg, ${OASIS_COLORS.deepPurple} 0%, #261A40 100%)`,
                        color: '#FFFFFF',
                        height: '48px',
                        position: 'relative',
                        zIndex: 50,
                        border: `1px solid ${OASIS_COLORS.accent}66`
                    }}
                    onClick={(e) => { e.preventDefault(); handleCreateNew(); }}
                >
                    <Plus size={20} strokeWidth={2.5} color={OASIS_COLORS.accent} /> NUEVO FORMULARIO
                </button>
            </header>

            <div className="row g-4">
                {forms.map(form => {
                    const accent = form.styles?.primaryColor || OASIS_COLORS.accent;
                    const cover = form.styles?.coverImage || oasisCommunityImg;

                    return (
                        <div key={form.id} className="col-md-6 col-xl-4">
                            <GlassCard style={{ borderRadius: '26px', height: '100%', background: cardSurface, border: `1px solid ${borderSubtle}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 18px 40px -18px rgba(18, 12, 31, 0.14)' }}>
                                {/* Portada del Evento en Gestión */}
                                <div style={{ position: 'relative', height: '150px', overflow: 'hidden', backgroundColor: OASIS_COLORS.midnight }}>
                                    <img
                                        src={cover}
                                        alt={form.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 42%' }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,5,13,0.18) 0%, rgba(18,12,31,0.82) 100%)' }} />
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: accent }} />
                                    <div style={{ position: 'absolute', top: '14px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(18, 12, 31, 0.78)', border: `1px solid ${accent}66`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ClipboardList size={18} />
                                        </div>
                                        <span style={{
                                            background: form.isActive ? 'rgba(16, 185, 129, 0.9)' : 'rgba(100, 116, 139, 0.85)',
                                            color: '#FFFFFF',
                                            padding: '5px 12px',
                                            borderRadius: '999px',
                                            fontSize: '0.65rem',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.8px'
                                        }}>
                                            {form.isActive ? 'Activo' : 'Cerrado'}
                                        </span>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                            <Users size={13} color={accent} />
                                            {form.capacity > 0 ? `Aforo: ${form.capacity}` : 'Aforo ilimitado'}
                                        </span>
                                        {form.styles?.coverImage && (
                                            <span style={{ color: '#FFFFFF', background: 'rgba(18,12,31,0.72)', padding: '3px 8px', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <ImageIcon size={11} color={accent} /> Foto propia
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <h4 style={{ fontFamily: 'Moonrising', fontSize: '1.05rem', marginBottom: '8px', color: textPrimary }}>{form.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: textMuted, lineHeight: 1.55, marginBottom: '22px', flexGrow: 1 }}>
                                        {form.description || 'Sin descripción'}
                                    </p>

                                    <div className="d-flex gap-2 mt-auto">
                                        <button
                                            className="btn btn-sm flex-grow-1 rounded-pill py-2 fw-bold"
                                            style={{ background: isDark ? OASIS_COLORS.glassWhite : '#F1F5F9', border: `1px solid ${borderSubtle}`, color: textPrimary, fontSize: '0.72rem', letterSpacing: '0.6px' }}
                                            onClick={() => fetchSubmissions(form.id)}
                                        >
                                            RESULTADOS
                                        </button>
                                        <button
                                            className="btn btn-sm rounded-circle"
                                            style={{ width: '38px', height: '38px', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', border: `1px solid ${borderSubtle}`, color: textPrimary }}
                                            onClick={() => setEditingForm(form)}
                                            title="Editar evento"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm rounded-circle"
                                            style={{ width: '38px', height: '38px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: OASIS_COLORS.error }}
                                            onClick={() => handleDeleteForm(form.id)}
                                            title="Eliminar evento"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    );
                })}
            </div>

            <ConfirmationModal
                show={confirmConfig.show} title={confirmConfig.title} message={confirmConfig.message} type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm} onCancel={() => setConfirmConfig(p => ({ ...p, show: false }))}
            />
            <style>{oasisInputStyles(OASIS_COLORS, isDark)}</style>
        </div>
    );
};

const labelStyle = { fontSize: '0.68rem', fontWeight: 900, color: '#D97706', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' };

const oasisInputStyles = (colors, isDark) => `
    .oasis-input {
        background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC'} !important;
        border: 1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(18, 12, 31, 0.14)'} !important;
        color: ${isDark ? '#FFFFFF' : '#120C1F'} !important;
        border-radius: 14px !important;
        padding: 12px 16px !important;
        font-size: 0.92rem !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .oasis-input::placeholder {
        color: ${isDark ? 'rgba(255, 255, 255, 0.38)' : '#94A3B8'} !important;
    }
    .oasis-input:focus {
        background: ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF'} !important;
        border-color: ${colors.accent} !important;
        box-shadow: 0 0 0 3px ${colors.accent}26 !important;
    }
    .oasis-input-sm {
        background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC'} !important;
        border: 1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(18, 12, 31, 0.14)'} !important;
        color: ${isDark ? '#FFFFFF' : '#120C1F'} !important;
        border-radius: 11px !important;
        padding: 9px 14px !important;
        font-size: 0.84rem !important;
    }
    .oasis-input-sm:focus {
        border-color: ${colors.accent} !important;
        box-shadow: 0 0 0 3px ${colors.accent}20 !important;
    }
    .spin-icon {
        animation: oasis-spin 1s linear infinite;
    }
    @keyframes oasis-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

export default AdminForms;
