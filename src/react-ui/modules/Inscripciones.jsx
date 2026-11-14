import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CalendarDays,
    CalendarX2,
    CheckCircle2,
    Sparkles,
    Users,
    ArrowRight,
    Tv
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import apiClient from '../../api/client';
import FormViewer from '../components/FormViewer';
import oasisCommunityImg from '../../img/comunidad-oasis.jpg';

/**
 * Componente Inscripciones (Público)
 * ---------------------------------
 * Punto de entrada cinematográfico para que los usuarios se registren en eventos.
 * 1. Lista todos los formularios activos (/event-forms) con paleta adaptativa por evento.
 * 2. Al seleccionar un evento, adapta la atmósfera visual al color principal del evento.
 */
const Inscripciones = () => {
    const { theme, mode } = useTheme();
    const navigate = useNavigate();
    const isDark = mode === 'dark';

    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);

    const oasis = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        gold: '#F59E0B',
        softBg: '#F8F9FC'
    };

    const getEventAccent = (form) => form?.styles?.primaryColor || oasis.gold;
    const getEventCover = (form) =>
        form?.styles?.coverImage ||
        form?.styles?.backgroundImage ||
        form?.styles?.imageUrl ||
        oasisCommunityImg;

    useEffect(() => {
        apiClient
            .get('/event-forms')
            .then(({ data }) => {
                setForms(Array.isArray(data) ? data : []);
            })
            .catch((e) => console.error('Error al cargar eventos:', e))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ backgroundColor: isDark ? oasis.midnight : oasis.softBg, minHeight: '85vh', padding: '140px 20px 80px' }}>
                <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
                    <div className="row g-4">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="col-12 col-md-6 col-lg-4">
                                <div
                                    style={{
                                        height: '320px',
                                        borderRadius: '26px',
                                        background: 'linear-gradient(110deg, #FFFFFF 30%, #F1F3F9 50%, #FFFFFF 70%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'ev-skeleton 1.5s infinite linear',
                                        border: '1px solid rgba(18, 12, 31, 0.05)'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <style>{`
                    @keyframes ev-skeleton {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `}</style>
            </div>
        );
    }

    if (finished) {
        const accent = getEventAccent(selectedForm);
        return (
            <div
                style={{
                    minHeight: '85vh',
                    backgroundColor: isDark ? oasis.midnight : oasis.softBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '120px 20px 60px'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        maxWidth: '520px',
                        width: '100%',
                        background: isDark ? '#161026' : '#FFFFFF',
                        borderRadius: '30px',
                        padding: '48px 32px',
                        textAlign: 'center',
                        border: `1px solid ${accent}44`,
                        boxShadow: `0 28px 60px -16px rgba(18, 12, 31, 0.2), 0 0 40px -12px ${accent}33`
                    }}
                >
                    <div
                        style={{
                            width: '76px',
                            height: '76px',
                            borderRadius: '24px',
                            backgroundColor: `${accent}1E`,
                            border: `1px solid ${accent}55`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '22px'
                        }}
                    >
                        <CheckCircle2 size={38} color={accent} />
                    </div>
                    <h2
                        style={{
                            fontFamily: 'Moonrising, sans-serif',
                            color: isDark ? '#FFFFFF' : oasis.deepPurple,
                            fontSize: '1.7rem',
                            marginBottom: '12px'
                        }}
                    >
                        ¡Inscripción Confirmada!
                    </h2>
                    <p
                        style={{
                            color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(18, 12, 31, 0.68)',
                            fontSize: '0.96rem',
                            lineHeight: 1.65,
                            marginBottom: '28px'
                        }}
                    >
                        Hemos recibido tus datos correctamente{selectedForm?.title ? ` para ${selectedForm.title}` : ''}. ¡Nos vemos pronto!
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setFinished(false);
                            setSelectedForm(null);
                        }}
                        style={{
                            padding: '14px 28px',
                            borderRadius: '999px',
                            border: 'none',
                            background: oasis.deepPurple,
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            boxShadow: '0 10px 24px rgba(18, 12, 31, 0.28)'
                        }}
                    >
                        Volver al listado
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: isDark ? oasis.midnight : oasis.softBg, minHeight: '100vh', paddingBottom: '100px' }}>
            <AnimatePresence mode="wait">
                {selectedForm ? (
                    /* VISTA DE INSCRIPCIÓN DE EVENTO SELECCIONADO (PALETA DINÁMICA DEL EVENTO) */
                    <motion.div
                        key="event-detail"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                    >
                        {(() => {
                            const accent = getEventAccent(selectedForm);
                            const coverImg = getEventCover(selectedForm);
                            return (
                                <>
                                    {/* Hero Cinematográfico adaptado al color e imagen del evento */}
                                    <div
                                        style={{
                                            background: `linear-gradient(160deg, ${oasis.midnight} 0%, ${oasis.deepPurple} 100%)`,
                                            padding: '136px 20px 80px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            borderBottom: `2px solid ${accent}55`
                                        }}
                                    >
                                        <img
                                            src={coverImg}
                                            alt=""
                                            aria-hidden="true"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                opacity: 0.24,
                                                filter: 'saturate(1.08) contrast(1.05)',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                        <div
                                            aria-hidden="true"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: `radial-gradient(circle at 50% 35%, ${accent}38 0%, rgba(18, 12, 31, 0.8) 58%, rgba(8, 5, 13, 0.96) 100%)`,
                                                pointerEvents: 'none'
                                            }}
                                        />

                                        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedForm(null)}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 16px',
                                                    borderRadius: '999px',
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    border: '1px solid rgba(255, 255, 255, 0.16)',
                                                    color: '#FFFFFF',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    marginBottom: '22px'
                                                }}
                                            >
                                                <ArrowLeft size={15} /> Volver al listado
                                            </button>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                                <div
                                                    style={{
                                                        width: '54px',
                                                        height: '54px',
                                                        borderRadius: '16px',
                                                        backgroundColor: `${accent}24`,
                                                        border: `1px solid ${accent}66`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: accent
                                                    }}
                                                >
                                                    <CalendarDays size={24} color={accent} />
                                                </div>
                                                <span
                                                    style={{
                                                        padding: '5px 14px',
                                                        borderRadius: '999px',
                                                        backgroundColor: `${accent}22`,
                                                        border: `1px solid ${accent}55`,
                                                        color: accent,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 900,
                                                        letterSpacing: '2px',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    Inscripción Oficial
                                                </span>
                                            </div>

                                            <h1
                                                style={{
                                                    fontFamily: 'Moonrising, sans-serif',
                                                    color: '#FFFFFF',
                                                    fontSize: 'clamp(1.9rem, 4.5vw, 3rem)',
                                                    lineHeight: 1.1,
                                                    margin: '0 0 12px 0'
                                                }}
                                            >
                                                {selectedForm.title}
                                            </h1>
                                            {selectedForm.description && (
                                                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.65, maxWidth: '660px', margin: 0 }}>
                                                    {selectedForm.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ maxWidth: '840px', margin: '-36px auto 0', padding: '0 20px', position: 'relative', zIndex: 5 }}>
                                        <FormViewer form={selectedForm} onComplete={() => setFinished(true)} />
                                    </div>
                                </>
                            );
                        })()}
                    </motion.div>
                ) : (
                    /* LISTADO DE EVENTOS */
                    <motion.div
                        key="event-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Hero Cinematográfico */}
                        <header
                            style={{
                                padding: '165px 20px 100px',
                                textAlign: 'center',
                                background: `linear-gradient(180deg, ${oasis.midnight} 0%, ${oasis.deepPurple} 100%)`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'radial-gradient(circle at 50% 42%, rgba(245, 158, 11, 0.16) 0%, rgba(18, 12, 31, 0.72) 55%, rgba(8, 5, 13, 0.96) 100%)',
                                    pointerEvents: 'none'
                                }}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 2 }}
                            >
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 16px',
                                        borderRadius: '999px',
                                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                        border: '1px solid rgba(245, 158, 11, 0.35)',
                                        color: oasis.gold,
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '3.5px',
                                        fontSize: '0.7rem',
                                        marginBottom: '20px'
                                    }}
                                >
                                    <Sparkles size={13} /> Oasis Community
                                </span>

                                <h1
                                    style={{
                                        fontFamily: 'Moonrising, sans-serif',
                                        fontSize: 'clamp(2.2rem, 6vw, 4rem)',
                                        color: '#FFFFFF',
                                        lineHeight: 1.05,
                                        margin: 0,
                                        textShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
                                    }}
                                >
                                    PRÓXIMOS <span style={{ color: oasis.gold }}>EVENTOS</span>
                                </h1>

                                <div
                                    style={{
                                        width: '60px',
                                        height: '3px',
                                        borderRadius: '999px',
                                        background: `linear-gradient(90deg, transparent, ${oasis.gold}, transparent)`,
                                        margin: '20px auto'
                                    }}
                                />

                                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(0.95rem, 1.8vw, 1.08rem)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.65 }}>
                                    Participa en nuestras actividades, retiros y encuentros especiales. Vive la experiencia Oasis.
                                </p>
                            </motion.div>
                        </header>

                        {/* Grilla de Eventos */}
                        <div style={{ maxWidth: '1160px', margin: '-44px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
                            {forms.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        background: isDark ? '#161026' : '#FFFFFF',
                                        borderRadius: '28px',
                                        padding: '64px 24px',
                                        textAlign: 'center',
                                        border: '1px solid rgba(18, 12, 31, 0.06)',
                                        boxShadow: '0 22px 50px -14px rgba(18, 12, 31, 0.14)'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '72px',
                                            height: '72px',
                                            borderRadius: '22px',
                                            backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '20px'
                                        }}
                                    >
                                        <CalendarX2 size={32} color={oasis.gold} />
                                    </div>
                                    <h3
                                        style={{
                                            fontFamily: 'Moonrising, sans-serif',
                                            color: isDark ? '#FFFFFF' : oasis.deepPurple,
                                            fontSize: '1.35rem',
                                            marginBottom: '10px'
                                        }}
                                    >
                                        No hay eventos activos por ahora
                                    </h3>
                                    <p
                                        style={{
                                            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(18, 12, 31, 0.62)',
                                            fontSize: '0.94rem',
                                            maxWidth: '430px',
                                            margin: '0 auto 24px',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        Estamos preparando los próximos encuentros de nuestra comunidad. Vuelve pronto o acompáñanos en Oasis TV.
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/tv')}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '12px 22px',
                                                borderRadius: '999px',
                                                border: 'none',
                                                backgroundColor: oasis.deepPurple,
                                                color: '#FFFFFF',
                                                fontWeight: 800,
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Tv size={16} color={oasis.gold} /> Ir a Oasis TV
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/')}
                                            style={{
                                                padding: '12px 22px',
                                                borderRadius: '999px',
                                                border: '1px solid rgba(18, 12, 31, 0.12)',
                                                backgroundColor: '#F8F9FC',
                                                color: oasis.deepPurple,
                                                fontWeight: 800,
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Volver al inicio
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="row g-4 justify-content-center">
                                    {forms.map((form, idx) => {
                                        const accent = getEventAccent(form);
                                        const coverImg = getEventCover(form);
                                        const isFull = form.capacity > 0 && form.submissionCount >= form.capacity;
                                        const remaining = form.capacity > 0 ? Math.max(0, form.capacity - (form.submissionCount || 0)) : null;

                                        return (
                                            <motion.div
                                                key={form.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.06 }}
                                                className="col-md-6 col-lg-4"
                                            >
                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => setSelectedForm(form)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            setSelectedForm(form);
                                                        }
                                                    }}
                                                    className="ev-cine-card"
                                                    style={{
                                                        height: '100%',
                                                        cursor: 'pointer',
                                                        borderRadius: '26px',
                                                        background: isDark ? '#161026' : '#FFFFFF',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(18, 12, 31, 0.07)'}`,
                                                        boxShadow: '0 20px 44px -14px rgba(18, 12, 31, 0.14)',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        position: 'relative',
                                                        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
                                                    }}
                                                >
                                                    {/* Cinematic Cover Image Header */}
                                                    <div style={{ position: 'relative', height: '175px', overflow: 'hidden', backgroundColor: oasis.midnight }}>
                                                        <img
                                                            src={coverImg}
                                                            alt={form.title}
                                                            className="ev-card-cover-img"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                objectPosition: 'center 42%',
                                                                filter: 'saturate(1.06) contrast(1.05)'
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                inset: 0,
                                                                background: `linear-gradient(180deg, rgba(8, 5, 13, 0.2) 0%, rgba(18, 12, 31, 0.88) 100%), radial-gradient(circle at 85% 20%, ${accent}44 0%, transparent 60%)`
                                                            }}
                                                        />

                                                        {/* Top Accent Strip */}
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: '4px',
                                                                background: `linear-gradient(90deg, ${accent}, ${oasis.deepPurple})`
                                                            }}
                                                        />

                                                        {/* Icon & Capacity Badges over Cover */}
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                bottom: '14px',
                                                                left: '18px',
                                                                right: '18px',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                zIndex: 2
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: '42px',
                                                                    height: '42px',
                                                                    borderRadius: '13px',
                                                                    background: 'rgba(18, 12, 31, 0.78)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    border: `1px solid ${accent}66`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: accent
                                                                }}
                                                            >
                                                                <CalendarDays size={20} color={accent} />
                                                            </div>

                                                            <span
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '5px',
                                                                    padding: '5px 11px',
                                                                    borderRadius: '999px',
                                                                    fontSize: '0.68rem',
                                                                    fontWeight: 800,
                                                                    backgroundColor: isFull ? 'rgba(220, 38, 38, 0.88)' : 'rgba(18, 12, 31, 0.78)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    border: `1px solid ${isFull ? 'rgba(255,255,255,0.2)' : `${accent}66`}`,
                                                                    color: isFull ? '#FFFFFF' : accent
                                                                }}
                                                            >
                                                                <Users size={12} />
                                                                {form.capacity > 0
                                                                    ? isFull
                                                                        ? 'Agotado'
                                                                        : `${remaining} cupos`
                                                                    : 'Inscripción abierta'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                        <h4
                                                            style={{
                                                                fontFamily: 'Moonrising, sans-serif',
                                                                fontSize: '1.18rem',
                                                                color: isDark ? '#FFFFFF' : oasis.deepPurple,
                                                                marginBottom: '10px',
                                                                lineHeight: 1.25
                                                            }}
                                                        >
                                                            {form.title}
                                                        </h4>

                                                        <p
                                                            style={{
                                                                color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(18, 12, 31, 0.65)',
                                                                fontSize: '0.88rem',
                                                                lineHeight: 1.6,
                                                                flexGrow: 1,
                                                                marginBottom: '20px'
                                                            }}
                                                        >
                                                            {form.description}
                                                        </p>

                                                        <div
                                                            style={{
                                                                paddingTop: '14px',
                                                                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(18, 12, 31, 0.06)'}`,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            {isFull ? (
                                                                <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                                    Lugar Agotado
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    style={{
                                                                        color: accent,
                                                                        fontWeight: 900,
                                                                        fontSize: '0.78rem',
                                                                        letterSpacing: '1px',
                                                                        textTransform: 'uppercase',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px'
                                                                    }}
                                                                >
                                                                    Inscribirme <ArrowRight size={15} />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .ev-card-cover-img {
                    transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .ev-cine-card:hover .ev-card-cover-img {
                    transform: scale(1.07);
                }
                .ev-cine-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 28px 56px -14px rgba(18, 12, 31, 0.22) !important;
                }
                @font-face {
                    font-family: 'Moonrising';
                    src: url('/fonts/Moonrising.ttf');
                }
            `}</style>
        </div>
    );
};

export default Inscripciones;
