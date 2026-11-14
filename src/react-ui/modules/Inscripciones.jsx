import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CalendarDays,
    CalendarX2,
    CheckCircle2,
    Users,
    ArrowRight,
    Tv,
    Clock,
    ShieldCheck,
    Flame
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import apiClient from '../../api/client';
import FormViewer from '../components/FormViewer';
import PageHero from '../components/PageHero';
import { safeAccent } from '../../utils/eventColors';
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

    const getEventAccent = (form) => safeAccent(form?.styles?.primaryColor, oasis.gold);
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
                                                <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.02rem', lineHeight: 1.65, maxWidth: '680px', margin: '0 0 22px 0' }}>
                                                    {selectedForm.description}
                                                </p>
                                            )}

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#FFFFFF', fontSize: '0.76rem', fontWeight: 700 }}>
                                                    <Users size={14} color={accent} />
                                                    {selectedForm.capacity > 0
                                                        ? `${Math.max(0, selectedForm.capacity - (selectedForm.submissionCount || 0))} cupos disponibles`
                                                        : 'Cupos abiertos'}
                                                </span>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#FFFFFF', fontSize: '0.76rem', fontWeight: 700 }}>
                                                    <Clock size={14} color={accent} />
                                                    Registro en 1 minuto
                                                </span>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 14px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#FFFFFF', fontSize: '0.76rem', fontWeight: 700 }}>
                                                    <ShieldCheck size={14} color={accent} />
                                                    Confirmación inmediata
                                                </span>
                                            </div>
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
                        <PageHero
                            id="inscripciones"
                            eyebrow="Oasis Community"
                            title="PRÓXIMOS"
                            accent="EVENTOS"
                            subtitle="Participa en nuestras actividades, retiros y encuentros especiales. Vive la experiencia Oasis."
                            fallbackImage={oasisCommunityImg}
                        />

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
                                (() => {
                                    const featured = forms[0];
                                    const secondaryForms = forms.slice(1);
                                    const fAccent = getEventAccent(featured);
                                    const fCover = getEventCover(featured);
                                    const fCap = Number(featured.capacity) || 0;
                                    const fCount = Number(featured.submissionCount) || 0;
                                    const fFull = fCap > 0 && fCount >= fCap;
                                    const fRemaining = fCap > 0 ? Math.max(0, fCap - fCount) : null;
                                    const fPct = fCap > 0 ? Math.min(100, Math.round((fCount / fCap) * 100)) : 0;
                                    const fOverlayLevel = featured.styles?.overlayStrength || 'medium';
                                    const fTopAlpha = fOverlayLevel === 'soft' ? 0.12 : fOverlayLevel === 'deep' ? 0.36 : 0.22;
                                    const fBottomAlpha = fOverlayLevel === 'soft' ? 0.68 : fOverlayLevel === 'deep' ? 0.94 : 0.88;
                                    const fBadgeText = featured.styles?.badgeText || 'Experiencia Destacada';

                                    return (
                                        <div>
                                            {/* Spotlight Comercial del Evento Principal */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 22 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.45 }}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setSelectedForm(featured)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        setSelectedForm(featured);
                                                    }
                                                }}
                                                className="ev-cine-spotlight"
                                                style={{
                                                    borderRadius: '30px',
                                                    background: isDark ? '#161026' : '#FFFFFF',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(18, 12, 31, 0.08)'}`,
                                                    boxShadow: '0 28px 64px -20px rgba(18, 12, 31, 0.22)',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    marginBottom: secondaryForms.length > 0 ? '48px' : '0',
                                                    transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease'
                                                }}
                                            >
                                                <div className="row g-0 align-items-stretch">
                                                    {/* Escenario Fotográfico */}
                                                    <div className="col-lg-6" style={{ position: 'relative', minHeight: '360px', overflow: 'hidden', backgroundColor: oasis.midnight }}>
                                                        <img
                                                            src={fCover}
                                                            alt={featured.title}
                                                            className="ev-card-cover-img"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                objectPosition: 'center 42%',
                                                                filter: 'saturate(1.08) contrast(1.05)'
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                inset: 0,
                                                                background: `linear-gradient(180deg, rgba(8, 5, 13, ${fTopAlpha}) 0%, rgba(18, 12, 31, ${fBottomAlpha}) 100%), radial-gradient(circle at 20% 20%, ${fAccent}48 0%, transparent 58%)`
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: '5px',
                                                                background: `linear-gradient(90deg, ${fAccent}, ${oasis.deepPurple})`
                                                            }}
                                                        />

                                                        <div style={{ position: 'absolute', top: '22px', left: '22px', right: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '7px',
                                                                    padding: '7px 14px',
                                                                    borderRadius: '999px',
                                                                    backgroundColor: 'rgba(18, 12, 31, 0.84)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    border: `1px solid ${fAccent}77`,
                                                                    color: '#FFFFFF',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 900,
                                                                    letterSpacing: '1.6px',
                                                                    textTransform: 'uppercase'
                                                                }}
                                                            >
                                                                <Flame size={13} color={fAccent} />
                                                                {fBadgeText}
                                                            </span>

                                                            <span
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '7px 14px',
                                                                    borderRadius: '999px',
                                                                    backgroundColor: fFull ? 'rgba(220, 38, 38, 0.92)' : fAccent,
                                                                    color: fFull ? '#FFFFFF' : oasis.deepPurple,
                                                                    fontSize: '0.72rem',
                                                                    fontWeight: 900
                                                                }}
                                                            >
                                                                <Users size={13} />
                                                                {fCap > 0 ? (fFull ? 'Agotado' : `${fRemaining} cupos disponibles`) : 'Inscripción Abierta'}
                                                            </span>
                                                        </div>

                                                        <div style={{ position: 'absolute', bottom: '22px', left: '22px', right: '22px' }}>
                                                            <div
                                                                style={{
                                                                    background: 'rgba(18, 12, 31, 0.8)',
                                                                    backdropFilter: 'blur(12px)',
                                                                    border: '1px solid rgba(255, 255, 255, 0.14)',
                                                                    borderRadius: '18px',
                                                                    padding: '14px 18px'
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: fCap > 0 ? '8px' : '0' }}>
                                                                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.76rem', fontWeight: 700 }}>
                                                                        {fCap > 0 ? 'Disponibilidad en tiempo real' : 'Acceso confirmado al instante'}
                                                                    </span>
                                                                    <span style={{ color: fAccent, fontSize: '0.78rem', fontWeight: 900 }}>
                                                                        {fCap > 0 ? `${fPct}% ocupado` : '100% Digital'}
                                                                    </span>
                                                                </div>
                                                                {fCap > 0 && (
                                                                    <div style={{ height: '7px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
                                                                        <div
                                                                            style={{
                                                                                width: `${Math.max(8, fPct)}%`,
                                                                                height: '100%',
                                                                                borderRadius: '999px',
                                                                                background: `linear-gradient(90deg, ${fAccent}, ${oasis.gold})`
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Pitch Comercial */}
                                                    <div className="col-lg-6" style={{ padding: 'clamp(28px, 4vw, 48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                                            <div
                                                                style={{
                                                                    width: '38px',
                                                                    height: '38px',
                                                                    borderRadius: '12px',
                                                                    backgroundColor: `${fAccent}1E`,
                                                                    border: `1px solid ${fAccent}44`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: fAccent
                                                                }}
                                                            >
                                                                <CalendarDays size={19} />
                                                            </div>
                                                            <span style={{ color: fAccent, fontWeight: 900, fontSize: '0.74rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                                                Convocatoria Oficial · Oasis
                                                            </span>
                                                        </div>

                                                        <h2
                                                            style={{
                                                                fontFamily: 'Moonrising, sans-serif',
                                                                fontSize: 'clamp(1.65rem, 3vw, 2.3rem)',
                                                                color: isDark ? '#FFFFFF' : oasis.deepPurple,
                                                                marginBottom: '14px',
                                                                lineHeight: 1.12
                                                            }}
                                                        >
                                                            {featured.title}
                                                        </h2>

                                                        <p
                                                            style={{
                                                                color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(18, 12, 31, 0.72)',
                                                                fontSize: '0.98rem',
                                                                lineHeight: 1.65,
                                                                marginBottom: '24px'
                                                            }}
                                                        >
                                                            {featured.description || 'Reserva tu lugar ahora y sé parte de una experiencia transformadora junto a nuestra comunidad.'}
                                                        </p>

                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '28px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 12px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8F9FC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(18, 12, 31, 0.06)'}` }}>
                                                                <Clock size={16} color={fAccent} />
                                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#FFFFFF' : oasis.deepPurple }}>Registro en 1 min</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 12px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8F9FC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(18, 12, 31, 0.06)'}` }}>
                                                                <ShieldCheck size={16} color={fAccent} />
                                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#FFFFFF' : oasis.deepPurple }}>Confirmación directa</span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            disabled={fFull}
                                                            style={{
                                                                width: '100%',
                                                                border: 'none',
                                                                borderRadius: '16px',
                                                                padding: '16px 26px',
                                                                background: fFull
                                                                    ? '#6B7280'
                                                                    : `linear-gradient(135deg, ${oasis.deepPurple} 0%, #261A40 100%)`,
                                                                color: '#FFFFFF',
                                                                fontWeight: 900,
                                                                fontSize: '0.84rem',
                                                                letterSpacing: '1.4px',
                                                                textTransform: 'uppercase',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '10px',
                                                                cursor: fFull ? 'not-allowed' : 'pointer',
                                                                boxShadow: `0 16px 32px -12px rgba(18, 12, 31, 0.45), 0 0 0 1px ${fAccent}55`
                                                            }}
                                                        >
                                                            <span>{fFull ? 'Cupos Agotados' : 'Reservar Mi Cupo Ahora'}</span>
                                                            {!fFull && <ArrowRight size={17} color={fAccent} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Más Eventos Disponibles */}
                                            {secondaryForms.length > 0 && (
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
                                                        <h3 style={{ fontFamily: 'Moonrising, sans-serif', fontSize: '1.35rem', color: isDark ? '#FFFFFF' : oasis.deepPurple, margin: 0 }}>
                                                            Más Eventos <span style={{ color: oasis.gold }}>Disponibles</span>
                                                        </h3>
                                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(18, 12, 31, 0.55)' }}>
                                                            Selecciona una actividad para inscribirte
                                                        </span>
                                                    </div>

                                                    <div className="row g-4 justify-content-center">
                                                        {secondaryForms.map((form, idx) => {
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
                                                                        <div style={{ position: 'relative', height: '180px', overflow: 'hidden', backgroundColor: oasis.midnight }}>
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
                                                                                    padding: '12px 16px',
                                                                                    borderRadius: '14px',
                                                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8F9FC',
                                                                                    border: `1px solid ${accent}33`,
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
                                                                                    <>
                                                                                        <span style={{ color: isDark ? '#FFFFFF' : oasis.deepPurple, fontWeight: 900, fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                                                                            Reservar mi lugar
                                                                                        </span>
                                                                                        <ArrowRight size={16} color={accent} />
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .ev-card-cover-img {
                    transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .ev-cine-card:hover .ev-card-cover-img,
                .ev-cine-spotlight:hover .ev-card-cover-img {
                    transform: scale(1.06);
                }
                .ev-cine-card:hover,
                .ev-cine-spotlight:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 32px 68px -18px rgba(18, 12, 31, 0.25) !important;
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
