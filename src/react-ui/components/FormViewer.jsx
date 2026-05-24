import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import apiClient from '../../api/client';
import Button from './Button';

const FormViewer = ({ form, onComplete }) => {
    const { theme } = useTheme();
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (label, value) => {
        setFormData(prev => ({ ...prev, [label]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const submissionData = { ...formData };

            // Handle file uploads
            for (const field of form.fields) {
                if (field.type === 'file' && formData[field.label] instanceof File) {
                    const file = formData[field.label];
                    const fileName = `submissions_${form.id}_${Date.now()}-${file.name}`;

                    const uploadData = new FormData();
                    uploadData.append('file', file, fileName);

                    const { data } = await apiClient.post('/upload', uploadData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    submissionData[field.label] = data.url || data.filename;
                }
            }

            await apiClient.post('/event-submissions', { event_form_id: form.id, data: submissionData });

            onComplete && onComplete();
        } catch (e) {
            setError(e.message || 'Error al enviar la inscripción. Revisa que todos los campos obligatorios estén llenos.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* ENCABEZADO ESTILO GOOGLE FORMS */}
            <div style={{
                background: theme.colors.surface || '#ffffff',
                borderRadius: '12px',
                padding: '35px 40px',
                marginBottom: '20px',
                borderTop: `12px solid ${form.styles?.primaryColor || theme.colors.primary}`,
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.03)'
            }}>
                <h2 style={{ fontFamily: theme.fonts.titles, color: theme.colors.text?.primary || '#120C1F', marginBottom: '12px', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '900' }}>
                    {form.title}
                </h2>
                <p style={{ color: theme.colors.text?.secondary || '#64748b', fontSize: '1.05rem', margin: 0, lineHeight: '1.6' }}>
                    {form.description}
                </p>
                {form.capacity > 0 && (
                    <div className="mt-3 pt-3 border-top d-inline-block">
                        <span className="badge rounded-pill" style={{ background: `${form.styles?.primaryColor || theme.colors.primary}20`, color: form.styles?.primaryColor || theme.colors.primary, padding: '8px 15px' }}>
                            <i className="bi bi-people-fill me-2"></i>Aforo Limitado ({form.capacity} cupos)
                        </span>
                    </div>
                )}
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                {form.fields.map(field => (
                    <div key={field.id} style={{
                        background: theme.colors.surface || '#ffffff',
                        borderRadius: '12px',
                        padding: '30px 40px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.04)',
                        transition: 'all 0.3s ease'
                    }} className="form-field-card">
                        <label style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', display: 'block', color: theme.colors.text?.primary || '#120C1F' }}>
                            {field.label} {field.required && <span className="text-danger">*</span>}
                        </label>

                        {field.type === 'textarea' ? (
                            <textarea
                                className="form-control"
                                rows="3"
                                required={field.required}
                                placeholder="Tu respuesta"
                                style={inputStyle}
                                value={formData[field.label] || ''}
                                onChange={e => handleChange(field.label, e.target.value)}
                            />
                        ) : field.type === 'select' ? (
                            <select
                                className="form-select"
                                required={field.required}
                                style={inputStyle}
                                value={formData[field.label] || ''}
                                onChange={e => handleChange(field.label, e.target.value)}
                            >
                                <option value="">Elige una opción</option>
                                {field.options?.split(',').map(opt => (
                                    <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                ))}
                            </select>
                        ) : field.type === 'file' ? (
                            <input
                                type="file"
                                className="form-control"
                                required={field.required}
                                accept="image/*,application/pdf"
                                style={inputStyle}
                                onChange={e => handleChange(field.label, e.target.files[0])}
                            />
                        ) : (
                            <input
                                type={field.type}
                                className="form-control"
                                required={field.required}
                                placeholder="Tu respuesta"
                                style={inputStyle}
                                value={formData[field.label] || ''}
                                onChange={e => handleChange(field.label, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                {error && (
                    <div className="alert alert-danger" style={{ borderRadius: '12px', border: 'none', background: '#FEF2F2', color: '#991B1B' }}>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                    </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-3 mb-5">
                    <Button
                        type="submit"
                        disabled={submitting}
                        style={{ 
                            padding: '12px 30px', 
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            background: form.styles?.primaryColor || theme.colors.primary,
                            color: '#fff',
                            border: 'none',
                            boxShadow: `0 4px 15px ${form.styles?.primaryColor || theme.colors.primary}40`
                        }}
                    >
                        {submitting ? 'Enviando...' : 'Enviar Inscripción'}
                    </Button>
                    <span className="text-muted small">
                        <i className="bi bi-lock-fill me-1"></i>Tus datos están protegidos
                    </span>
                </div>
            </form>
            <style>{`
                .form-field-card:focus-within {
                    border-left: 6px solid ${form.styles?.primaryColor || theme.colors.primary} !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.06) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};

const inputStyle = { 
    borderRadius: '0', 
    border: 'none',
    borderBottom: '1px solid #ccc',
    padding: '10px 0',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    fontSize: '1rem'
};

export default FormViewer;
