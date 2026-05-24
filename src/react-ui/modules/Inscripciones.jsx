import React, { useEffect, useState } from 'react';
import { useTheme } from '../ThemeContext';
import Button from '../components/Button';
import apiClient from '../../api/client';
import GlassCard from '../components/GlassCard';
import FormViewer from '../components/FormViewer';

/**
 * Componente Inscripciones (Público)
 * ---------------------------------
 * Punto de entrada para que los usuarios se registren en eventos.
 * 1. Lista todos los formularios activos (/event-forms).
 * 2. Permite seleccionar un evento y renderiza el FormViewer para completar el registro.
 */
const Inscripciones = () => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    // ESTADOS: Lista de eventos, evento seleccionado, y estados de flujo (carga/finalizado)
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        apiClient.get('/event-forms')
            .then(({ data }) => {
                setForms(data);
            })
            .catch(e => console.error('Error al cargar eventos:', e))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="container py-5 text-center" style={{ animation: 'fadeIn 0.5s ease' }}>
                <div className="display-1 mb-4">🎉</div>
                <h2 style={{ fontFamily: theme.fonts.titles, color: theme.colors.primary }}>Completar Inscripción</h2>
                <p className="text-muted">Hemos recibido tus datos correctamente. ¡Nos vemos pronto!</p>
                <button className="btn btn-primary mt-4 rounded-pill px-5" onClick={() => { setFinished(false); setSelectedForm(null); }} style={{ background: selectedForm?.styles?.primaryColor || theme.colors.primary, border: 'none' }}>
                    Volver al listado
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {selectedForm ? (
                <div className="row justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                    <div className="col-12 col-lg-9">
                        <button className="btn btn-link text-decoration-none text-muted p-0 mb-4 fw-bold" style={{ fontSize: '0.8rem' }} onClick={() => setSelectedForm(null)}>
                            <i className="bi bi-arrow-left me-2"></i>VOLVER AL LISTADO
                        </button>
                        <FormViewer form={selectedForm} onComplete={() => setFinished(true)} />
                    </div>
                </div>
            ) : (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mb-5" style={{ animation: 'fadeInDown 0.8s ease' }}>
                        <span style={{ 
                            color: '#F59E0B', 
                            fontWeight: '900', 
                            textTransform: 'uppercase', 
                            letterSpacing: '4px', 
                            fontSize: '0.7rem', 
                            display: 'block',
                            marginBottom: '10px'
                        }}>
                            Oasis Community
                        </span>
                        <h1 style={{ 
                            fontFamily: theme.fonts.titles, 
                            fontSize: 'clamp(2rem, 5vw, 3rem)', 
                            fontWeight: '900',
                            color: isDark ? '#FFF' : theme.colors.primary,
                            marginBottom: '15px'
                        }}>
                            Próximos <span style={{ color: '#F59E0B' }}>Eventos</span>
                        </h1>
                        <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                            Participa en nuestras actividades y vive la experiencia Oasis.
                        </p>
                    </div>

                    <div className="row g-4 justify-content-center w-100">
                        {forms.map(form => (
                            <div key={form.id} className="col-md-6 col-lg-4">
                                <GlassCard
                                    style={{ 
                                        height: '100%', 
                                        cursor: 'pointer', 
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
                                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
                                        padding: '30px',
                                        borderRadius: '24px'
                                    }}
                                    className="event-card-hover"
                                    onClick={() => setSelectedForm(form)}
                                >
                                    <div className="d-flex flex-column h-100">
                                        <div style={{ 
                                            width: 54, height: 54, 
                                            background: (form.styles?.primaryColor || theme.colors.primary) + '15', 
                                            borderRadius: '16px', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            color: form.styles?.primaryColor || theme.colors.primary, 
                                            marginBottom: '20px' 
                                        }}>
                                            <i className={`bi ${form.styles?.icon || 'bi-calendar-event'} fs-3`}></i>
                                        </div>
                                        <h4 className="fw-bold mb-3" style={{ fontSize: '1.2rem', color: isDark ? '#FFF' : '#120C1F' }}>{form.title}</h4>
                                        <p className="small flex-grow-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', lineHeight: '1.5' }}>{form.description}</p>
                                        
                                        <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                            {form.capacity > 0 && form.submissionCount >= form.capacity ? (
                                                <span className="fw-bold text-danger small">Lugar Agotado</span>
                                            ) : (
                                                <>
                                                    <span className="fw-bold small" style={{ color: form.styles?.primaryColor || theme.colors.primary, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                                        Inscribirme →
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        ))}
                        {forms.length === 0 && (
                            <div className="text-center p-5 opacity-50 w-100">
                                <i className="bi bi-calendar-x display-4 mb-3"></i>
                                <h5>No hay eventos activos.</h5>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <style>{`
                .event-card-hover:hover { 
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    background: ${isDark ? 'rgba(255,255,255,0.05)' : '#FFF'} !important;
                    border-color: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Inscripciones;
