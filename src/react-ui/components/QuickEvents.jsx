import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Users, ArrowRight, Sparkles } from 'lucide-react';
import apiClient from '../../api/client';
import { useTheme } from '../ThemeContext';
import oasisCommunityImg from '../../img/comunidad-oasis.jpg';

const QuickEvents = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/event-forms')
            .then(({ data }) => setForms(data?.slice(0, 3) || []))
            .catch(e => console.error('Error al cargar eventos:', e))
            .finally(() => setLoading(false));
    }, []);

    if (loading || forms.length === 0) return null;

    const getEventCover = (form) =>
        form?.styles?.coverImage || form?.styles?.backgroundImage || form?.styles?.imageUrl || oasisCommunityImg;

    return (
        <section id="eventos-rapidos" style={{ padding: '64px 20px', maxWidth: '1240px', margin: '0 auto' }}>
            <style>{`
                .qe-card {
                    background: #FFFFFF;
                    border-radius: 26px;
                    overflow: hidden;
                    border: 1px solid rgba(18, 12, 31, 0.08);
                    box-shadow: 0 18px 44px -18px rgba(18, 12, 31, 0.16);
                    cursor: pointer;
                    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .qe-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 28px 56px -18px rgba(18, 12, 31, 0.25);
                    border-color: rgba(245, 158, 11, 0.4);
                }
                .qe-card-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .qe-card:hover .qe-card-img {
                    transform: scale(1.06);
                }
                .qe-card-cta-arrow {
                    transition: transform 0.25s ease;
                }
                .qe-card:hover .qe-card-cta-arrow {
                    transform: translateX(4px);
                }
                .qe-all-btn {
                    background: linear-gradient(135deg, #120C1F 0%, #24193B 100%);
                    color: #FFFFFF;
                    border: 1px solid rgba(245, 158, 11, 0.35);
                    border-radius: 999px;
                    padding: 13px 30px;
                    font-size: 0.78rem;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    box-shadow: 0 14px 30px -10px rgba(18, 12, 31, 0.4);
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                }
                .qe-all-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 18px 36px -10px rgba(18, 12, 31, 0.5);
                    border-color: #F59E0B;
                }
            `}</style>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '42px', textAlign: 'center' }}>
                <span style={{
                    color: '#F59E0B',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    fontSize: '0.7rem',
                    marginBottom: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Sparkles size={13} />
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
                {forms.map(form => {
                    const accentColor = form.styles?.primaryColor || theme.colors.primary || '#F59E0B';
                    const coverImage = getEventCover(form);
                    const hasCapacity = Boolean(form.maxCapacity);

                    return (
                        <div key={form.id} className="col-md-6 col-lg-4">
                            <div
                                className="qe-card"
                                onClick={() => navigate('/inscripciones')}
                            >
                                {/* Cabecera cinemática con imagen y degradado */}
                                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', backgroundColor: '#120C1F' }}>
                                    <img
                                        src={coverImage}
                                        alt={form.title}
                                        className="qe-card-img"
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: `linear-gradient(180deg, rgba(18, 12, 31, 0.18) 0%, rgba(18, 12, 31, 0.72) 100%)`,
                                        }}
                                    />
                                    {/* Barra superior de color del evento */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            backgroundColor: accentColor,
                                        }}
                                    />
                                    {/* Icono + badge de estado/cupo */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: '14px',
                                            left: '16px',
                                            right: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '10px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(18, 12, 31, 0.75)',
                                                backdropFilter: 'blur(8px)',
                                                border: `1px solid ${accentColor}66`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: accentColor,
                                            }}
                                        >
                                            <CalendarDays size={20} />
                                        </div>
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px',
                                                borderRadius: '999px',
                                                backgroundColor: 'rgba(18, 12, 31, 0.78)',
                                                backdropFilter: 'blur(8px)',
                                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                                color: '#FFFFFF',
                                                fontSize: '0.72rem',
                                                fontWeight: '700',
                                                letterSpacing: '0.4px',
                                            }}
                                        >
                                            {hasCapacity ? (
                                                <>
                                                    <Users size={13} color={accentColor} />
                                                    Cupo: {form.maxCapacity}
                                                </>
                                            ) : (
                                                <>
                                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: accentColor }} />
                                                    Inscripción abierta
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Cuerpo de la tarjeta */}
                                <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <h4
                                        style={{
                                            fontFamily: 'Moonrising, sans-serif',
                                            color: '#120C1F',
                                            fontSize: '1.22rem',
                                            lineHeight: '1.25',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        {form.title}
                                    </h4>
                                    <p
                                        style={{
                                            color: '#5B556B',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.55',
                                            flexGrow: 1,
                                            marginBottom: '18px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {form.description || 'Completa tu registro para participar en esta actividad de Oasis.'}
                                    </p>

                                    <div
                                        style={{
                                            paddingTop: '14px',
                                            borderTop: '1px solid rgba(18, 12, 31, 0.08)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: accentColor,
                                                fontWeight: '800',
                                                fontSize: '0.8rem',
                                                letterSpacing: '0.8px',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            Inscribirme ahora
                                        </span>
                                        <ArrowRight size={17} color={accentColor} className="qe-card-cta-arrow" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-5">
                <button
                    className="qe-all-btn"
                    onClick={() => navigate('/inscripciones')}
                >
                    <span>Ver todos los eventos</span>
                    <ArrowRight size={15} color="#F59E0B" />
                </button>
            </div>
        </section>
    );
};

export default QuickEvents;
