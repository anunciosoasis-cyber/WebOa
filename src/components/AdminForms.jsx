import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import GlassCard from '../react-ui/components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, X, Trash2, Pencil, Calendar, Users, 
    FileText, Download, Layout, Music, TreePine, 
    GraduationCap, Settings, CheckCircle2, Inbox,
    ArrowRight, ChevronRight, FileSpreadsheet, Eye, ClipboardList
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
        color: '#8B5CF6',
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
    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => {} });

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
            styles: { primaryColor: template.color, icon: template.id },
            isActive: true
        });
        setSelectingTemplate(false);
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
        return (
            <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh', padding: '40px' }}>
                <header className="mb-5 d-flex justify-content-between align-items-end">
                    <div>
                        <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Form Architecture</span>
                        <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                            {editingForm.id ? 'EDITAR' : 'CREAR'} <span style={{ color: OASIS_COLORS.accent }}>EVENTO</span>
                        </h1>
                    </div>
                    <button className="btn rounded-pill px-4 fw-bold" style={{ background: isDark ? OASIS_COLORS.glassWhite : '#f1f5f9', border: `1px solid ${OASIS_COLORS.glassBorder}`, color: isDark ? '#fff' : '#475569' }} onClick={() => setEditingForm(null)}>
                        CANCELAR
                    </button>
                </header>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}`, marginBottom: '30px' }}>
                            <div className="row g-4">
                                <div className="col-12">
                                    <label style={labelStyle}>Título del Evento</label>
                                    <input type="text" className="form-control oasis-input" value={editingForm.title} onChange={e => setEditingForm({ ...editingForm, title: e.target.value })} placeholder="Ej: Campamento 2026" />
                                </div>
                                <div className="col-12">
                                    <label style={labelStyle}>Descripción / Instrucciones</label>
                                    <textarea className="form-control oasis-input" rows="4" value={editingForm.description} onChange={e => setEditingForm({ ...editingForm, description: e.target.value })} placeholder="Información relevante para el usuario..." />
                                </div>
                            </div>
                        </GlassCard>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.9rem', color: '#fff' }}>ESTRUCTURA DE <span style={{ color: OASIS_COLORS.accent }}>DATOS</span></h4>
                            <button className="btn btn-sm rounded-pill px-3 fw-bold" style={{ background: `${OASIS_COLORS.accent}15`, color: OASIS_COLORS.accent, border: `1px solid ${OASIS_COLORS.accent}` }} onClick={() => {
                                setEditingForm({ ...editingForm, fields: [...editingForm.fields, { id: Date.now(), label: 'Nuevo Campo', type: 'text', required: false }] });
                            }}>
                                + AÑADIR CAMPO
                            </button>
                        </div>

                        {editingForm.fields.map((field, index) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={field.id} className="mb-3">
                                <GlassCard style={{ padding: '20px 30px', borderRadius: '20px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
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
                                                <label className="form-check-label small text-white-50" htmlFor={`req-${field.id}`}>Requerido</label>
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

                    <div className="col-lg-4">
                        <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}`, position: 'sticky', top: '20px' }}>
                            <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.9rem', marginBottom: '30px', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>CONFIGURACIÓN <span style={{ color: OASIS_COLORS.accent }}>FINAL</span></h4>
                            <div className="mb-4">
                                <label style={labelStyle}>Aforo Máximo</label>
                                <input type="number" className="form-control oasis-input" value={editingForm.capacity} onChange={e => setEditingForm({ ...editingForm, capacity: parseInt(e.target.value) || 0 })} placeholder="0 = Ilimitado" />
                                <small className="text-white-50 mt-2 d-block">Límite de inscripciones permitidas.</small>
                            </div>
                            <div className="mb-4">
                                <label style={labelStyle}>Color Institucional</label>
                                <input type="color" className="form-control oasis-input" style={{ height: '50px', padding: '5px' }} value={editingForm.styles?.primaryColor || OASIS_COLORS.accent} onChange={e => setEditingForm({ ...editingForm, styles: { ...editingForm.styles, primaryColor: e.target.value } })} />
                            </div>
                            <div className="mb-5">
                                <label style={labelStyle}>Estado del Evento</label>
                                <div className="form-check form-switch mt-2">
                                    <input className="form-check-input" type="checkbox" role="switch" id="isActiveSwitch"
                                        checked={editingForm.isActive !== false}
                                        onChange={e => setEditingForm({ ...editingForm, isActive: e.target.checked })} />
                                    <label className="form-check-label" htmlFor="isActiveSwitch" style={{ color: isDark ? '#fff' : '#475569', fontSize: '0.85rem', marginLeft: '8px' }}>
                                        {editingForm.isActive !== false ? 'Activo (visible al público)' : 'Cerrado (oculto al público)'}
                                    </label>
                                </div>
                            </div>
                            <button className="btn w-100 rounded-pill py-3 fw-bold text-dark" style={{ background: OASIS_COLORS.accent, fontSize: '0.9rem', letterSpacing: '1px' }} onClick={handleSaveForm}>
                                PUBLICAR EVENTO
                            </button>
                        </GlassCard>
                    </div>
                </div>
                <style>{oasisInputStyles(OASIS_COLORS)}</style>
            </div>
        );
    }

    if (selectingTemplate) {
        return (
            <div className="container-fluid py-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh', padding: '40px' }}>
                <header className="text-center mb-5">
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Event Launchpad</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>ELIGE UNA <span style={{ color: OASIS_COLORS.accent }}>PLANTILLA</span></h1>
                </header>
                <div className="row g-4 justify-content-center">
                    {EVENT_TEMPLATES.map(t => (
                        <div key={t.id} className="col-md-6 col-xl-3">
                            <motion.div whileHover={{ y: -10 }} onClick={() => handleSelectTemplate(t)} style={{ cursor: 'pointer', height: '100%' }}>
                                <GlassCard style={{ padding: '40px', borderRadius: '35px', height: '100%', border: `1px solid ${OASIS_COLORS.glassBorder}`, textAlign: 'center' }}>
                                    <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: t.color + '15', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                                        <t.icon size={32} strokeWidth={2.5} />
                                    </div>
                                    <h4 style={{ fontFamily: 'Moonrising', fontSize: '1rem', marginBottom: '15px', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>{t.name}</h4>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.5, lineHeight: 1.6 }}>{t.description}</p>
                                    <div className="mt-4 pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <span style={{ color: t.color, fontWeight: 900, fontSize: '0.7rem' }}>SELECCIONAR →</span>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </div>
                    ))}
                    <div className="col-12 text-center mt-5">
                        <button className="btn btn-link" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }} onClick={() => setSelectingTemplate(false)}>Volver a la gestión</button>
                    </div>
                </div>
            </div>
        );
    }

    const handleExportExcel = () => {
        const form = viewingSubmissionsFor;
        const headers = form.fields.map(f => f.label);
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM para UTF-8 en Excel
        
        csvContent += headers.join(",") + "\n";
        
        submissions.forEach(sub => {
            const row = form.fields.map(f => {
                let val = sub.data[f.label] || '';
                val = String(val).replace(/"/g, '""'); // Escape comillas
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
            <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh', padding: '40px' }}>
                <header className="mb-5 d-flex justify-content-between align-items-end">
                    <div>
                        <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Data Analysis</span>
                        <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>RESPUESTAS <span style={{ color: OASIS_COLORS.accent }}>RECIBIDAS</span></h1>
                        <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b', fontWeight: 700, margin: '10px 0 0' }}>Evento: {viewingSubmissionsFor.title}</p>
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn rounded-pill px-4 fw-bold d-flex align-items-center gap-2" style={{ background: '#10B981', color: '#fff', border: 'none' }} onClick={handleExportExcel}>
                            <Download size={18} /> EXPORTAR EXCEL
                        </button>
                        <button className="btn rounded-pill px-4 fw-bold" style={{ background: isDark ? OASIS_COLORS.glassWhite : '#f1f5f9', border: `1px solid ${OASIS_COLORS.glassBorder}`, color: isDark ? '#fff' : '#475569' }} onClick={() => setViewingSubmissionsFor(null)}>
                            VOLVER
                        </button>
                    </div>
                </header>

                <GlassCard style={{ borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}`, overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table className={`table ${isDark ? 'table-dark' : ''} table-hover align-middle mb-0`} style={{ background: 'transparent' }}>
                            <thead>
                                <tr style={{ fontSize: '0.65rem', color: OASIS_COLORS.accent, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {viewingSubmissionsFor.fields.map(f => <th key={f.id} className="ps-4 py-4">{f.label}</th>)}
                                    <th className="text-end pe-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions?.map(sub => (
                                    <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
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
        <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh', padding: '40px' }}>
            <header className="mb-5 d-flex justify-content-between align-items-end">
                <div>
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Community Outreach</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                        GESTIÓN DE <span style={{ color: OASIS_COLORS.accent }}>EVENTOS</span>
                    </h1>
                </div>
                <button className="btn rounded-pill px-4 shadow-sm fw-bold border-0 text-dark d-flex align-items-center gap-2" style={{ background: OASIS_COLORS.accent, height: '48px', position: 'relative', zIndex: 50 }} onClick={(e) => { e.preventDefault(); handleCreateNew(); }}>
                    <Plus size={20} strokeWidth={2.5} /> NUEVO FORMULARIO
                </button>
            </header>

            <div className="row g-4">
                {forms.map(form => (
                    <div key={form.id} className="col-md-6 col-xl-4">
                        <GlassCard style={{ padding: '30px', borderRadius: '35px', height: '100%', border: `1px solid ${OASIS_COLORS.glassBorder}`, borderLeft: `6px solid ${form.styles?.primaryColor || OASIS_COLORS.accent}` }}>
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: (form.styles?.primaryColor || OASIS_COLORS.accent) + '15', color: form.styles?.primaryColor || OASIS_COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ClipboardList size={20} />
                                </div>
                                <span style={{ background: form.isActive ? `${OASIS_COLORS.success}15` : 'rgba(255,255,255,0.05)', color: form.isActive ? OASIS_COLORS.success : '#888', padding: '5px 12px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>{form.isActive ? 'Activo' : 'Cerrado'}</span>
                            </div>
                            <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.95rem', marginBottom: '10px', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>{form.title}</h4>
                            <p style={{ fontSize: '0.8rem', opacity: 0.5, lineHeight: 1.5, marginBottom: '25px', color: isDark ? '#fff' : '#64748b' }}>{form.description || 'Sin descripción'}</p>
                            
                            <div className="d-flex gap-2 mt-auto">
                                <button className="btn btn-sm flex-grow-1 rounded-pill py-2 fw-bold" style={{ background: isDark ? OASIS_COLORS.glassWhite : '#f1f5f9', border: `1px solid ${OASIS_COLORS.glassBorder}`, color: isDark ? '#fff' : '#475569', fontSize: '0.7rem' }} onClick={() => fetchSubmissions(form.id)}>RESULTADOS</button>
                                <button className="btn btn-sm rounded-circle" style={{ width: '38px', height: '38px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9', border: `1px solid ${OASIS_COLORS.glassBorder}`, color: isDark ? '#fff' : '#475569' }} onClick={() => setEditingForm(form)}><Pencil size={14} /></button>
                                <button className="btn btn-sm rounded-circle" style={{ width: '38px', height: '38px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: OASIS_COLORS.error }} onClick={() => handleDeleteForm(form.id)}><Trash2 size={14} /></button>
                            </div>
                        </GlassCard>
                    </div>
                ))}
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
    .oasis-input-sm { background: ${isDark ? colors.glassWhite : '#fff'} !important; border: 1px solid ${colors.glassBorder} !important; color: ${isDark ? '#fff' : '#120C1F'} !important; border-radius: 10px !important; padding: 8px 15px !important; font-size: 0.8rem !important; }
    .table-hover tbody tr:hover { background: rgba(255,255,255,0.02) !important; }
`;

export default AdminForms;
