import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Users, ArrowRight, Sparkles, Clock, ShieldCheck, } from 'lucide-react';
import apiClient from '../../api/client';
import { useTheme } from '../ThemeContext';
import oasisCommunityImg from '../../img/comunidad-oasis.jpg';

const QuickEvents = ({ embedded = false }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/event-forms')
            .then(({ data }) => setForms(Array.isArray(data) ? data.slice(0, 3) : []))
            .catch(e => console.error('Error al cargar eventos:', e))
            .finally(() => setLoading(false));
    }, []);

    if (loading || forms.length === 0) return null;

    const getEventCover = (form) =>
        form?.styles?.coverImage || form?.styles?.backgroundImage || form?.styles?.imageUrl || oasisCommunityImg;

    const getEventAccent = (form) => form?.styles?.primaryColor || theme.colors.primary || '#F59E0B';

    const getOverlayAlphas = (form) => {
        const level = form?.styles?.overlayStrength || 'medium';
        if (level === 'soft') return { top: 0.12, bottom: 0.68 };
        if (level === 'deep') return { top: 0.36, bottom: 0.94 };
        return { top: 0.22, bottom: 0.86 };
    };

    const getCapacityMeta = (form) => {
        const cap = Number(form?.capacity) || 0;
        const count = Number(form?.submissionCount) || 0;
        if (cap <= 0) {
            return { hasCap: false, isFull: false, remaining: null, pct: 0 };
        }
        const remaining = Math.max(0, cap - count);
        const pct = Math.min(100, Math.round((count / cap) * 100));
        return { hasCap: true, isFull: count >= cap, remaining, pct, cap };
    };

    const featured = forms[0];
    const secondaryForms = forms.slice(1);
    const featuredAccent = getEventAccent(featured);
    const featuredCover = getEventCover(featured);
    const featuredCap = getCapacityMeta(featured);
    const featuredOverlay = getOverlayAlphas(featured);
    const featuredBadge = featured.styles?.badgeText || 'Evento Destacado';

    return (
        <section
            id="eventos-rapidos"
            style={
                embedded
                    ? { padding: '8px 0 0', margin: 0, scrollMarginTop: '100px' }
                    : { padding: '72px 20px', maxWidth: '1240px', margin: '0 auto' }
            }
        >
            <style>{`
                .qe-spotlight {
                    background: #FFFFFF;
                    border-radius: 30px;
                    overflow: hidden;
                    border: 1px solid rgba(18, 12, 31, 0.08);
                    box-shadow: 0 28px 64px -22px rgba(18, 12, 31, 0.22);
                    cursor: pointer;
                    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
                }
                .qe-spotlight:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 36px 72px -20px rgba(18, 12, 31, 0.28);
                }
                .qe-spotlight-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center 42%;
                    transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .qe-spotlight:hover .qe-spotlight-img {
                    transform: scale(1.05);
                }
                .qe-cta-btn {
                    transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
                }
                .qe-spotlight:hover .qe-cta-btn {
                    transform: translateY(-2px);
                    filter: brightness(1.06);
                }
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

            {/* Encabezado de Sección */}
            {embedded ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <span className="oasis-tag oasis-tag--light">
                            <span className="oasis-tag__dot" />
                            Inscripción rápida
                        </span>
                        <span style={{ color: '#5B556B', fontSize: '0.86rem', fontWeight: 600 }}>
                            Reserva tu lugar sin salir del inicio
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/inscripciones')}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(18, 12, 31, 0.14)',
                            borderRadius: '999px',
                            padding: '7px 16px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            color: '#120C1F',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            cursor: 'pointer'
                        }}
                    >
                        <span>Ver todos</span>
                        <ArrowRight size={14} color="#F59E0B" />
                    </button>
                </div>
            ) : (
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
                        Experiencias Oasis
                    </span>
                    <h2 style={{
                        fontFamily: 'Moonrising, sans-serif',
                        color: '#120C1F',
                        fontSize: 'clamp(1.85rem, 4vw, 2.65rem)',
                        lineHeight: '1.1',
                        margin: '0 0 10px 0'
                    }}>
                        Inscripción <span style={{ color: '#F59E0B' }}>Rápida</span>
                    </h2>
                    <p style={{ color: '#5B556B', fontSize: '0.96rem', maxWidth: '560px', margin: 0 }}>
                        Aparta tu lugar en nuestras próximas actividades y vive una experiencia diseñada para toda la familia.
                    </p>
                </div>
            )}

            {/* Evento Destacado (Spotlight Comercial Full-Width) */}
            <div
                className="qe-spotlight"
                onClick={() => navigate('/inscripciones')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate('/inscripciones');
                    }
                }}
            >
                <div className="row g-0 align-items-stretch">
                    {/* Escenario Visual Izquierdo */}
                    <div className="col-lg-6" style={{ position: 'relative', minHeight: '340px', overflow: 'hidden', backgroundColor: '#08050D' }}>
                        <img
                            src={featuredCover}
                            alt={featured.title}
                            className="qe-spotlight-img"
                        />
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: `linear-gradient(180deg, rgba(8, 5, 13, ${featuredOverlay.top}) 0%, rgba(18, 12, 31, ${featuredOverlay.bottom}) 100%), radial-gradient(circle at 20% 20%, ${featuredAccent}45 0%, transparent 55%)`
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '5px',
                                background: `linear-gradient(90deg, ${featuredAccent}, #120C1F)`
                            }}
                        />

                        {/* Badge Superior */}
                        <div style={{ position: 'absolute', top: '22px', left: '22px', right: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span className="oasis-tag" style={{ '--tag-accent': featuredAccent }}>
                                <span className="oasis-tag__dot" />
                                {featuredBadge}
                            </span>

                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 14px',
                                    borderRadius: '999px',
                                    backgroundColor: featuredCap.isFull ? 'rgba(220, 38, 38, 0.9)' : featuredAccent,
                                    color: featuredCap.isFull ? '#FFFFFF' : '#120C1F',
                                    fontSize: '0.72rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.5px'
                                }}
                            >
                                <Users size={13} />
                                {featuredCap.hasCap
                                    ? featuredCap.isFull
                                        ? 'Cupos Agotados'
                                        : `${featuredCap.remaining} cupos disponibles`
                                    : 'Inscripciones Abiertas'}
                            </span>
                        </div>

                        {/* Barra de Progreso / Disponibilidad Inferior */}
                        <div style={{ position: 'absolute', bottom: '22px', left: '22px', right: '22px' }}>
                            <div
                                style={{
                                    background: 'rgba(18, 12, 31, 0.78)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.14)',
                                    borderRadius: '18px',
                                    padding: '14px 18px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: featuredCap.hasCap ? '8px' : '0' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                                        {featuredCap.hasCap ? 'Ocupación del evento' : 'Acceso confirmado al instante'}
                                    </span>
                                    <span style={{ color: featuredAccent, fontSize: '0.78rem', fontWeight: 900 }}>
                                        {featuredCap.hasCap ? `${featuredCap.pct}% reservado` : '100% Digital'}
                                    </span>
                                </div>
                                {featuredCap.hasCap && (
                                    <div style={{ height: '7px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${Math.max(8, featuredCap.pct)}%`,
                                                height: '100%',
                                                borderRadius: '999px',
                                                background: `linear-gradient(90deg, ${featuredAccent}, #F59E0B)`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pitch Comercial Derecho */}
                    <div className="col-lg-6" style={{ padding: 'clamp(28px, 4vw, 48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '11px',
                                    backgroundColor: `${featuredAccent}1A`,
                                    border: `1px solid ${featuredAccent}44`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: featuredAccent
                                }}
                            >
                                <CalendarDays size={18} />
                            </div>
                            <span style={{ color: featuredAccent, fontWeight: 900, fontSize: '0.74rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                Convocatoria Oficial · Oasis
                            </span>
                        </div>

                        <h3
                            style={{
                                fontFamily: 'Moonrising, sans-serif',
                                color: '#120C1F',
                                fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
                                lineHeight: 1.12,
                                marginBottom: '14px'
                            }}
                        >
                            {featured.title}
                        </h3>

                        <p
                            style={{
                                color: '#4E485E',
                                fontSize: '0.98rem',
                                lineHeight: 1.65,
                                marginBottom: '24px'
                            }}
                        >
                            {featured.description || 'Reserva tu lugar ahora y sé parte de una jornada especial de conexión, fe y comunidad en Oasis.'}
                        </p>

                        {/* Beneficios / Claridad Comercial */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 12px', borderRadius: '14px', backgroundColor: '#F8F9FC', border: '1px solid rgba(18, 12, 31, 0.06)' }}>
                                <Clock size={16} color={featuredAccent} />
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#120C1F' }}>Registro en 1 min</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 12px', borderRadius: '14px', backgroundColor: '#F8F9FC', border: '1px solid rgba(18, 12, 31, 0.06)' }}>
                                <ShieldCheck size={16} color={featuredAccent} />
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#120C1F' }}>Confirmación directa</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                className="qe-cta-btn"
                                style={{
                                    flex: '1 1 220px',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '16px 26px',
                                    background: featuredCap.isFull
                                        ? '#6B7280'
                                        : `linear-gradient(135deg, #120C1F 0%, #261A40 100%)`,
                                    color: '#FFFFFF',
                                    fontWeight: 900,
                                    fontSize: '0.82rem',
                                    letterSpacing: '1.3px',
                                    textTransform: 'uppercase',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    boxShadow: `0 16px 32px -12px rgba(18, 12, 31, 0.45), 0 0 0 1px ${featuredAccent}55`
                                }}
                            >
                                <span>{featuredCap.isFull ? 'Ver Detalles' : 'Reservar Mi Cupo Ahora'}</span>
                                <ArrowRight size={17} color={featuredAccent} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Eventos Secundarios (si hay 2 o más) */}
            {secondaryForms.length > 0 && (
                <div className="row g-4 justify-content-center mt-2">
                    {secondaryForms.map(form => {
                        const accentColor = getEventAccent(form);
                        const coverImage = getEventCover(form);
                        const capMeta = getCapacityMeta(form);

                        return (
                            <div key={form.id} className="col-md-6">
                                <div
                                    className="qe-card"
                                    onClick={() => navigate('/inscripciones')}
                                >
                                    <div style={{ position: 'relative', height: '185px', overflow: 'hidden', backgroundColor: '#120C1F' }}>
                                        <img
                                            src={coverImage}
                                            alt={form.title}
                                            className="qe-card-img"
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(180deg, rgba(18, 12, 31, 0.2) 0%, rgba(18, 12, 31, 0.78) 100%)'
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                backgroundColor: accentColor
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: '14px',
                                                left: '16px',
                                                right: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '10px'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '12px',
                                                    backgroundColor: 'rgba(18, 12, 31, 0.78)',
                                                    backdropFilter: 'blur(8px)',
                                                    border: `1px solid ${accentColor}66`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: accentColor
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
                                                    backgroundColor: capMeta.isFull ? 'rgba(220, 38, 38, 0.88)' : 'rgba(18, 12, 31, 0.8)',
                                                    backdropFilter: 'blur(8px)',
                                                    border: `1px solid ${capMeta.isFull ? 'rgba(255,255,255,0.2)' : `${accentColor}66`}`,
                                                    color: '#FFFFFF',
                                                    fontSize: '0.72rem',
                                                    fontWeight: '800'
                                                }}
                                            >
                                                <Users size={13} color={capMeta.isFull ? '#FFFFFF' : accentColor} />
                                                {capMeta.hasCap
                                                    ? capMeta.isFull
                                                        ? 'Agotado'
                                                        : `${capMeta.remaining} cupos`
                                                    : 'Inscripción abierta'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <h4
                                            style={{
                                                fontFamily: 'Moonrising, sans-serif',
                                                color: '#120C1F',
                                                fontSize: '1.22rem',
                                                lineHeight: '1.25',
                                                marginBottom: '10px'
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
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {form.description || 'Completa tu registro para participar en esta actividad de Oasis.'}
                                        </p>

                                        <div
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '14px',
                                                backgroundColor: '#F8F9FC',
                                                border: `1px solid ${accentColor}33`,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: '#120C1F',
                                                    fontWeight: '800',
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.8px',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                Reservar mi lugar
                                            </span>
                                            <ArrowRight size={17} color={accentColor} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!embedded && (
                <div className="text-center mt-5">
                    <button
                        className="qe-all-btn"
                        onClick={() => navigate('/inscripciones')}
                    >
                        <span>Explorar portal de eventos</span>
                        <ArrowRight size={15} color="#F59E0B" />
                    </button>
                </div>
            )}
        </section>
    );
};

export default QuickEvents;
