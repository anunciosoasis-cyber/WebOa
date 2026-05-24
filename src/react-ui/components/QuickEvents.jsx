import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useTheme } from '../ThemeContext';
import GlassCard from './GlassCard';

const QuickEvents = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/event-forms')
            .then(({ data }) => setForms(data?.slice(0, 3) || [])) // Tomar los 3 primeros eventos
            .catch(e => console.error('Error al cargar eventos:', e))
            .finally(() => setLoading(false));
    }, []);

    if (loading || forms.length === 0) return null; // No mostrar si no hay eventos

    return (
        <section id="eventos-rapidos" style={{ padding: '60px 20px', maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', textAlign: 'center' }}>
                <span style={{ 
                    color: '#F59E0B', 
                    fontWeight: '900', 
                    textTransform: 'uppercase', 
                    letterSpacing: '4px', 
                    fontSize: '0.7rem', 
                    marginBottom: '15px' 
                }}>
                    Participa
                </span>
                <h2 style={{ 
                    fontFamily: 'Moonrising, sans-serif', 
                    color: '#120C1F', 
                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
                    lineHeight: '1.1',
                    margin: 0 
                }}>
                    Inscripción <span style={{ color: '#F59E0B' }}>Rápida</span>
                </h2>
            </div>

            <div className="row g-4 justify-content-center">
                {forms.map(form => (
                    <div key={form.id} className="col-md-6 col-lg-4">
                        <GlassCard
                            style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.3s ease', borderTop: `4px solid ${form.styles?.primaryColor || theme.colors.primary}` }}
                            onClick={() => navigate('/inscripciones')}
                        >
                            <div className="d-flex flex-column h-100">
                                <h4 className="fw-bold mb-3">{form.title}</h4>
                                <p className="text-muted small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{form.description}</p>
                                
                                <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                                    <span className="fw-bold small" style={{ color: form.styles?.primaryColor || theme.colors.primary }}>
                                        Inscribirme ahora
                                    </span>
                                    <i className="bi bi-chevron-right" style={{ color: form.styles?.primaryColor || theme.colors.primary }}></i>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                ))}
            </div>
            
            <div className="text-center mt-5">
                <button 
                    className="btn rounded-pill px-4 py-2 text-white fw-bold shadow-sm" 
                    style={{ backgroundColor: '#120C1F', letterSpacing: '1px', fontSize: '0.8rem' }}
                    onClick={() => navigate('/inscripciones')}
                >
                    VER TODOS LOS EVENTOS
                </button>
            </div>
        </section>
    );
};

export default QuickEvents;
