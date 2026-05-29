import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import GlassCard from '../react-ui/components/GlassCard';
import { Plus, X, Trash2, Pencil, Database, FolderOpen, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OASIS_COLORS = {
    deepPurple: '#120C1F',
    midnight: '#08050D',
    accent: '#F59E0B',
    glassWhite: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    success: '#10B981'
};

const emptyForm = {
    id: '',
    title: '',
    category: 'oasis',
    resource_type: 'link',
    content_type: 'other',
    is_downloadable: true,
    download_url: '',
    thumbnail_url: '',
    description: '',
    original_filename: '',
    file_size_bytes: null,
};

const AdminRecursos = () => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const { showToast } = useToast();

    const [resources, setResources] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [formData, setFormData] = useState(emptyForm);
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => {} });

    useEffect(() => {
        fetchResources();
    }, []);

    const normalize = (item) => ({
        ...item,
        resource_type: item.resourceType || item.resource_type || 'link',
        content_type: item.contentType || item.content_type || 'other',
        is_downloadable: item.isDownloadable ?? item.is_downloadable ?? item.actionType === 'download',
        download_url: item.downloadUrl || item.download_url || '',
        thumbnail_url: item.thumbnailUrl || item.thumbnail_url || '',
        original_filename: item.originalFilename || item.original_filename || '',
        file_size_bytes: item.fileSizeBytes || item.file_size_bytes || null,
    });

    const fetchResources = async () => {
        try {
            const { data } = await apiClient.get('/resources');
            setResources((data || []).map(normalize));
        } catch (error) {
            console.error(error);
            showToast('Error cargando recursos', 'error');
        }
    };

    const inferContentType = (file) => {
        if (!file?.type) return 'other';
        if (file.type.startsWith('image/')) return 'image';
        if (file.type === 'application/pdf') return 'pdf';
        return 'other';
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        try {
            setUploadingFile(true);
            const body = new FormData();
            body.append('file', file);

            const { data } = await apiClient.post('/resources/upload-file', body, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const nextContentType = inferContentType(file);
            setSelectedFileName(file.name);
            setFormData((prev) => ({
                ...prev,
                resource_type: 'file',
                content_type: nextContentType,
                download_url: data?.downloadUrl || data?.url || '',
                thumbnail_url: nextContentType === 'image' ? (data?.url || '') : prev.thumbnail_url,
                original_filename: data?.originalFilename || file.name,
                file_size_bytes: data?.bytes || file.size,
            }));

            if (nextContentType === 'image') {
                showToast('Imagen subida y miniatura asignada automáticamente', 'success');
            } else {
                showToast('Archivo subido correctamente', 'success');
            }
        } catch (error) {
            console.error(error);
            showToast('Error al subir archivo', 'error');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleThumbnailUpload = async (file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            showToast('La miniatura debe ser una imagen', 'warning');
            return;
        }

        try {
            setUploadingThumbnail(true);
            const body = new FormData();
            body.append('file', file);

            const { data } = await apiClient.post('/resources/upload-file', body, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setFormData((prev) => ({
                ...prev,
                thumbnail_url: data?.url || prev.thumbnail_url,
            }));

            showToast('Miniatura subida correctamente', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error al subir miniatura', 'error');
        } finally {
            setUploadingThumbnail(false);
        }
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setSelectedFileName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requiresThumbnail =
                formData.resource_type === 'link' ||
                (formData.resource_type === 'file' && formData.content_type !== 'image');

            if (!formData.title.trim()) {
                showToast('El título es obligatorio', 'warning');
                return;
            }
            if (formData.resource_type !== 'info' && !formData.download_url) {
                showToast('Carga archivo o URL para este recurso', 'warning');
                return;
            }
            if (requiresThumbnail && !formData.thumbnail_url) {
                showToast('Para links o archivos no imagen, debes subir una miniatura', 'warning');
                return;
            }

            const payload = {
                title: formData.title,
                category: formData.category,
                resource_type: formData.resource_type,
                content_type: formData.content_type,
                is_downloadable: formData.is_downloadable,
                download_url: formData.resource_type === 'info' ? '' : formData.download_url,
                thumbnail_url: formData.thumbnail_url || '',
                description: formData.description || '',
                original_filename: formData.original_filename || '',
                file_size_bytes: formData.file_size_bytes,
            };

            if (formData.id) {
                await apiClient.put(`/resources/${formData.id}`, payload);
            } else {
                await apiClient.post('/resources', payload);
            }

            await fetchResources();
            setShowForm(false);
            resetForm();
            showToast('Recurso guardado', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error al guardar recurso', 'error');
        }
    };

    const handleEdit = (rec) => {
        setFormData(normalize(rec));
        setSelectedFileName(rec.original_filename || '');
        setShowForm(true);
    };

    const handleDelete = (id) => {
        setConfirmConfig({
            show: true,
            title: 'ELIMINAR RECURSO',
            message: '¿Deseas eliminar este recurso?',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/resources/${id}`);
                    await fetchResources();
                    showToast('Recurso eliminado', 'success');
                } catch (error) {
                    showToast('Error al eliminar', 'error');
                }
                setConfirmConfig((p) => ({ ...p, show: false }));
            },
        });
    };

    return (
        <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh', padding: '40px' }}>
            <header className="mb-5 d-flex justify-content-between align-items-end">
                <div>
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Digital Asset Management</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.2rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                        GESTOR DE <span style={{ color: OASIS_COLORS.accent }}>RECURSOS</span>
                    </h1>
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (!showForm) resetForm();
                        setShowForm(!showForm);
                    }}
                    className="btn rounded-pill px-4 shadow-sm fw-bold border-0 text-dark d-flex align-items-center gap-2"
                    style={{ background: OASIS_COLORS.accent, height: '48px', position: 'relative', zIndex: 50 }}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} strokeWidth={2.5} />}
                    {showForm ? 'CANCELAR' : 'NUEVO RECURSO'}
                </button>
            </header>

            <AnimatePresence>
                {showForm ? (
                    <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="mb-5">
                        <GlassCard style={{ padding: '30px', borderRadius: '28px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                            <form onSubmit={handleSubmit} className="row g-3">
                                <div className="col-md-6">
                                    <label style={labelStyle}>Nombre</label>
                                    <input className="form-control oasis-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                </div>
                                <div className="col-md-3">
                                    <label style={labelStyle}>Categoría</label>
                                    <select className="form-select oasis-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="oasis">OASIS</option>
                                        <option value="multimedia">Multimedia</option>
                                        <option value="adventista">Institucional</option>
                                        <option value="utilidad">Utilidad</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label style={labelStyle}>Tipo</label>
                                    <select className="form-select oasis-input" value={formData.resource_type} onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}>
                                        <option value="file">Archivo</option>
                                        <option value="link">Link</option>
                                        <option value="info">Solo información</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label style={labelStyle}>Formato</label>
                                    <select className="form-select oasis-input" value={formData.content_type} onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}>
                                        <option value="image">Imagen</option>
                                        <option value="pdf">PDF</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label style={labelStyle}>Acceso</label>
                                    <select className="form-select oasis-input" value={formData.is_downloadable ? 'download' : 'read'} onChange={(e) => setFormData({ ...formData, is_downloadable: e.target.value === 'download' })}>
                                        <option value="download">Descargable</option>
                                        <option value="read">Solo lectura</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label style={labelStyle}>Miniatura (opcional)</label>
                                    <input type="url" className="form-control oasis-input" value={formData.thumbnail_url || ''} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} />
                                    <small style={{ opacity: 0.7 }}>
                                        {formData.resource_type === 'link' || (formData.resource_type === 'file' && formData.content_type !== 'image')
                                            ? 'Requerida para link y archivos no imagen'
                                            : 'Si subes una imagen, se asigna automáticamente'}
                                    </small>
                                </div>

                                {formData.resource_type === 'file' ? (
                                    <div className="col-12">
                                        <label style={labelStyle}>Archivo (subida a Cloudinary)</label>
                                        <div className="d-flex gap-2 align-items-center">
                                            <input
                                                type="file"
                                                className="form-control oasis-input"
                                                accept="image/*,application/pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                                            />
                                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{uploadingFile ? 'Subiendo...' : (selectedFileName || 'Sin archivo')}</span>
                                        </div>
                                    </div>
                                ) : null}

                                {(formData.resource_type === 'link' || (formData.resource_type === 'file' && formData.content_type !== 'image')) ? (
                                    <div className="col-12">
                                        <label style={labelStyle}>Subir miniatura (imagen obligatoria)</label>
                                        <div className="d-flex gap-2 align-items-center">
                                            <input
                                                type="file"
                                                className="form-control oasis-input"
                                                accept="image/*"
                                                onChange={(e) => handleThumbnailUpload(e.target.files?.[0])}
                                            />
                                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                                {uploadingThumbnail ? 'Subiendo miniatura...' : 'PNG/JPG/WEBP'}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}

                                {formData.resource_type !== 'info' ? (
                                    <div className="col-12">
                                        <label style={labelStyle}>URL destino</label>
                                        <input type="url" className="form-control oasis-input" value={formData.download_url} onChange={(e) => setFormData({ ...formData, download_url: e.target.value })} required />
                                    </div>
                                ) : null}

                                <div className="col-12">
                                    <label style={labelStyle}>Descripción</label>
                                    <textarea className="form-control oasis-input" rows={3} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <div className="col-12 text-end">
                                    <button type="submit" className="btn px-5 rounded-pill fw-bold text-dark" style={{ background: OASIS_COLORS.accent, height: '46px' }}>
                                        GUARDAR RECURSO
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <GlassCard style={{ borderRadius: '28px', border: `1px solid ${OASIS_COLORS.glassBorder}`, overflow: 'hidden' }}>
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.9rem', margin: 0, color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                        INVENTARIO <span style={{ color: OASIS_COLORS.accent }}>ACTUAL</span>
                    </h4>
                    <div className="d-flex align-items-center gap-2">
                        <Database size={16} color={OASIS_COLORS.accent} />
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>{resources.length}</span>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className={`table ${isDark ? 'table-dark' : ''} table-hover align-middle mb-0`} style={{ background: 'transparent' }}>
                        <thead>
                            <tr style={{ fontSize: '0.65rem', color: OASIS_COLORS.accent, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <th className="ps-4 py-4">Recurso / Categoría</th>
                                <th className="text-center">Acceso</th>
                                <th className="text-end pe-4">Gestión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map((rec) => (
                                <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td className="ps-4 py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `${OASIS_COLORS.accent}10`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {rec.thumbnail_url ? <img src={rec.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <FolderOpen size={18} color={OASIS_COLORS.accent} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isDark ? '#fff' : '#120C1F' }}>{rec.title}</div>
                                                <div style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase', color: isDark ? '#fff' : '#64748b' }}>
                                                    {rec.category} · {rec.resource_type} / {rec.content_type}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span style={{ background: rec.is_downloadable ? `${OASIS_COLORS.success}20` : `${OASIS_COLORS.accent}15`, color: rec.is_downloadable ? OASIS_COLORS.success : OASIS_COLORS.accent, padding: '5px 12px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                            {rec.is_downloadable ? 'Descargable' : 'Solo lectura'}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            {rec.download_url ? (
                                                <a className="btn btn-sm" href={rec.download_url} target="_blank" rel="noreferrer" style={{ background: `${OASIS_COLORS.accent}15`, border: `1px solid ${OASIS_COLORS.accent}55`, color: OASIS_COLORS.accent, padding: '8px', borderRadius: '10px' }}>
                                                    <UploadCloud size={14} />
                                                </a>
                                            ) : null}
                                            <button className="btn btn-sm" onClick={() => handleEdit(rec)} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9', border: `1px solid ${OASIS_COLORS.glassBorder}`, color: isDark ? '#fff' : '#475569', padding: '8px', borderRadius: '10px' }}><Pencil size={14} /></button>
                                            <button className="btn btn-sm" onClick={() => handleDelete(rec.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '8px', borderRadius: '10px' }}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <ConfirmationModal
                show={confirmConfig.show}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig((p) => ({ ...p, show: false }))}
            />

            <style>{`
                .oasis-input {
                    background: ${isDark ? OASIS_COLORS.glassWhite : '#fff'} !important;
                    border: 1px solid ${OASIS_COLORS.glassBorder} !important;
                    color: ${isDark ? '#fff' : '#120C1F'} !important;
                    border-radius: 14px !important;
                    padding: 12px 18px !important;
                }
                .oasis-input:focus {
                    border-color: ${OASIS_COLORS.accent} !important;
                    box-shadow: 0 0 15px ${OASIS_COLORS.accent}20 !important;
                }
            `}</style>
        </div>
    );
};

const labelStyle = {
    fontSize: '0.65rem',
    fontWeight: 900,
    color: '#F59E0B',
    textTransform: 'uppercase',
    marginBottom: '8px',
    display: 'block',
};

export default AdminRecursos;
