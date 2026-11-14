import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../ThemeContext';
import Peticiones from '../modules/Peticiones';
import {
    Radio,
    HeartHandshake,
    Wallet,
    Share2,
    Check,
    Maximize2,
    Minimize2,
    ExternalLink,
    RefreshCw,
    Clock,
    Sparkles,
    Tv,
    X,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';

const PersistentPlayer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { mode } = useTheme();
    const {
        youtubeUrl,
        isLive,
        loading,
        errorMsg,
        showPip,
        setShowPip,
        youtubeChannelUrl,
        refreshPlayer
    } = usePlayer();

    const [activeInline, setActiveInline] = useState(null); // 'ofrenda' | 'peticion' | null
    const [theaterMode, setTheaterMode] = useState(false);
    const [copied, setCopied] = useState(false);
    const inlineDrawerRef = useRef(null);

    const isTvRoute = location.pathname === '/tv';
    const isDark = mode === 'dark';

    const OASIS = {
        ink: '#120C1F',
        inkSoft: '#4B4458',
        gold: '#F59E0B',
        goldSoft: 'rgba(245, 158, 11, 0.14)',
        live: '#DC2626',
        surface: isDark ? '#161026' : '#FFFFFF',
        surfaceMuted: isDark ? 'rgba(255,255,255,0.04)' : '#F8F9FC',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(18, 12, 31, 0.08)',
        text: isDark ? '#FFFFFF' : '#120C1F',
        textMuted: isDark ? 'rgba(255,255,255,0.68)' : 'rgba(18, 12, 31, 0.65)'
    };

    // If not on TV route and PiP is closed, don't render anything
    if (!isTvRoute && !showPip) return null;

    const handleToggleInline = (type) => {
        setActiveInline((prev) => {
            const next = prev === type ? null : type;
            if (next) {
                setTimeout(() => {
                    inlineDrawerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 120);
            }
            return next;
        });
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Oasis TV — Transmisión en Vivo',
                    text: 'Únete a nuestra transmisión en Oasis TV.',
                    url: shareUrl
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2400);
            }
        } catch {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2400);
            } catch {}
        }
    };

    // Variants for animation between full size (relative) and PiP (fixed)
    const variants = {
        full: {
            position: 'relative',
            bottom: 'auto',
            right: 'auto',
            width: '100%',
            maxWidth: '100%',
            margin: '0',
            borderRadius: '22px',
            boxShadow: isLive
                ? '0 24px 60px -12px rgba(220, 38, 38, 0.28), 0 12px 30px -10px rgba(18, 12, 31, 0.25)'
                : '0 24px 54px -14px rgba(18, 12, 31, 0.22)',
            zIndex: 1,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        pip: {
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '320px',
            maxWidth: '100%',
            margin: '0',
            borderRadius: '16px',
            boxShadow: '0 20px 44px rgba(18, 12, 31, 0.45)',
            zIndex: 9999,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        }
    };

    return (
        <div
            className={isTvRoute ? 'oasis-tv-page' : ''}
            style={
                isTvRoute
                    ? {
                          minHeight: '85vh',
                          maxWidth: '1320px',
                          margin: '0 auto',
                          padding: '28px 20px 64px 20px'
                      }
                    : {}
            }
        >
            <style>{`
                .oasis-tv-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                    align-items: start;
                }
                @media (min-width: 1024px) {
                    .oasis-tv-grid.has-sidebar {
                        grid-template-columns: minmax(0, 1fr) 360px;
                    }
                }
                .yt-pill-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    border-radius: 999px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
                    white-space: nowrap;
                }
                .yt-pill-btn:hover {
                    transform: translateY(-2px);
                }
                .yt-pill-btn:active {
                    transform: scale(0.97);
                }
                .yt-side-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
                }
                .yt-side-item:hover {
                    transform: translateY(-2px);
                }
                @keyframes tv-live-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.35; transform: scale(1.3); }
                }
                .tv-live-dot {
                    animation: tv-live-dot 1.2s infinite ease-in-out;
                }
            `}</style>

            {/* Top YouTube-style Header Bar */}
            {isTvRoute && (
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '18px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 14px',
                                borderRadius: '999px',
                                backgroundColor: isLive ? 'rgba(220, 38, 38, 0.12)' : OASIS.goldSoft,
                                border: `1px solid ${isLive ? 'rgba(220, 38, 38, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`
                            }}
                        >
                            {isLive ? (
                                <>
                                    <span
                                        className="tv-live-dot"
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: OASIS.live,
                                            boxShadow: '0 0 8px rgba(220, 38, 38, 0.8)'
                                        }}
                                    />
                                    <span style={{ color: OASIS.live, fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1.2px' }}>
                                        EN VIVO AHORA
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Tv size={14} color={OASIS.gold} />
                                    <span style={{ color: isDark ? '#FDE68A' : '#B45309', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1.2px' }}>
                                        OASIS TV • MENSAJES
                                    </span>
                                </>
                            )}
                        </div>

                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'Moonrising, sans-serif',
                                fontSize: 'clamp(1.35rem, 2.4vw, 1.85rem)',
                                color: OASIS.text,
                                letterSpacing: '0.5px'
                            }}
                        >
                            OASIS <span style={{ color: OASIS.gold }}>TV</span>
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => setTheaterMode((prev) => !prev)}
                        className="yt-pill-btn d-none d-lg-inline-flex"
                        style={{
                            backgroundColor: OASIS.surface,
                            color: OASIS.text,
                            border: `1px solid ${OASIS.border}`,
                            boxShadow: '0 4px 12px rgba(18, 12, 31, 0.06)'
                        }}
                    >
                        {theaterMode ? <Minimize2 size={16} color={OASIS.gold} /> : <Maximize2 size={16} color={OASIS.gold} />}
                        {theaterMode ? 'Vista Estándar' : 'Modo Cine'}
                    </button>
                </motion.div>
            )}

            {/* Main Grid (Video + Sidebar) */}
            <div className={isTvRoute ? `oasis-tv-grid ${theaterMode ? '' : 'has-sidebar'}` : ''}>
                {/* Left / Primary Watch Column */}
                <div>
                    <motion.div
                        layout
                        initial={isTvRoute ? 'full' : 'pip'}
                        animate={isTvRoute ? 'full' : 'pip'}
                        variants={variants}
                        style={{
                            backgroundColor: '#0E0918',
                            overflow: 'hidden',
                            border: isTvRoute
                                ? `1px solid ${isLive ? 'rgba(220, 38, 38, 0.45)' : OASIS.border}`
                                : `2px solid ${isLive ? '#EF4444' : 'rgba(255,255,255,0.14)'}`
                        }}
                    >
                        {/* Header only for PiP mode */}
                        {!isTvRoute && (
                            <div
                                style={{
                                    padding: '8px 12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: isDark ? '#0A0514' : '#FFFFFF',
                                    borderBottom: isDark ? 'none' : '1px solid rgba(18, 12, 31, 0.08)'
                                }}
                            >
                                <span
                                    style={{
                                        color: isLive ? OASIS.live : isDark ? '#FFFFFF' : OASIS.ink,
                                        fontSize: '0.78rem',
                                        fontWeight: 800,
                                        letterSpacing: '1px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {isLive && (
                                        <span
                                            className="tv-live-dot"
                                            style={{
                                                width: '7px',
                                                height: '7px',
                                                borderRadius: '50%',
                                                backgroundColor: OASIS.live
                                            }}
                                        />
                                    )}
                                    {isLive ? 'EN VIVO' : 'OASIS TV'}
                                </span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => navigate('/tv')}
                                        title="Expandir"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: isDark ? '#FFFFFF' : OASIS.ink,
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            opacity: 0.85
                                        }}
                                    >
                                        <i className="bi bi-arrows-angle-expand"></i>
                                    </button>
                                    <button
                                        onClick={() => setShowPip(false)}
                                        title="Cerrar"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: isDark ? '#FFFFFF' : OASIS.ink,
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            opacity: 0.85
                                        }}
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 16:9 Video Stage */}
                        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0E0918' }}>
                            {loading ? (
                                <div
                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white gap-3"
                                    style={{ background: 'radial-gradient(circle at center, #1E1633 0%, #0E0918 75%)' }}
                                >
                                    <div className="spinner-border" style={{ color: OASIS.gold }} role="status"></div>
                                    {isTvRoute && (
                                        <span style={{ fontSize: '0.88rem', opacity: 0.78, letterSpacing: '0.5px' }}>
                                            Cargando señal de Oasis TV...
                                        </span>
                                    )}
                                </div>
                            ) : youtubeUrl ? (
                                <iframe
                                    src={youtubeUrl}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Oasis TV"
                                ></iframe>
                            ) : (
                                <div
                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white p-4 text-center"
                                    style={{
                                        background: 'radial-gradient(circle at 50% 35%, #23193D 0%, #120C1F 55%, #0B0713 100%)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Subtle animated golden ambient aura */}
                                    <motion.div
                                        aria-hidden="true"
                                        animate={{ scale: [1, 1.18, 1], opacity: [0.22, 0.38, 0.22] }}
                                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{
                                            position: 'absolute',
                                            width: isTvRoute ? '260px' : '140px',
                                            height: isTvRoute ? '260px' : '140px',
                                            borderRadius: '50%',
                                            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, transparent 70%)',
                                            filter: 'blur(28px)',
                                            pointerEvents: 'none'
                                        }}
                                    />

                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{
                                            position: 'relative',
                                            zIndex: 2,
                                            width: isTvRoute ? '68px' : '46px',
                                            height: isTvRoute ? '68px' : '46px',
                                            borderRadius: '20px',
                                            backgroundColor: 'rgba(245, 158, 11, 0.14)',
                                            border: '1px solid rgba(245, 158, 11, 0.35)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: isTvRoute ? '16px' : '10px'
                                        }}
                                    >
                                        <Radio size={isTvRoute ? 32 : 22} color={OASIS.gold} />
                                    </motion.div>

                                    <h5
                                        style={{
                                            position: 'relative',
                                            zIndex: 2,
                                            fontWeight: 800,
                                            fontSize: isTvRoute ? 'clamp(1.05rem, 2vw, 1.35rem)' : '0.9rem',
                                            marginBottom: '6px'
                                        }}
                                    >
                                        {isTvRoute ? 'Transmisión en pausa o sin señal activa' : 'Sin señal'}
                                    </h5>
                                    <p
                                        style={{
                                            position: 'relative',
                                            zIndex: 2,
                                            color: 'rgba(255, 255, 255, 0.68)',
                                            fontSize: isTvRoute ? '0.92rem' : '0.75rem',
                                            maxWidth: '420px',
                                            marginBottom: isTvRoute ? '18px' : '0'
                                        }}
                                    >
                                        {isTvRoute
                                            ? 'Únete en nuestros horarios de culto o revisa nuestro canal oficial para ver predicaciones anteriores.'
                                            : 'Vuelve pronto'}
                                    </p>

                                    {isTvRoute && (
                                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={refreshPlayer}
                                                className="yt-pill-btn"
                                                style={{
                                                    backgroundColor: OASIS.gold,
                                                    color: OASIS.ink,
                                                    padding: '9px 18px',
                                                    fontSize: '0.84rem'
                                                }}
                                            >
                                                <RefreshCw size={15} /> Reintentar señal
                                            </button>
                                            {youtubeChannelUrl && (
                                                <a
                                                    href={youtubeChannelUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="yt-pill-btn"
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                        color: '#FFFFFF',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        padding: '9px 18px',
                                                        fontSize: '0.84rem',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <ExternalLink size={15} /> Ir a YouTube
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {isTvRoute && errorMsg && (
                                        <p className="small mt-3 mb-0" style={{ position: 'relative', zIndex: 2, color: '#FCA5A5' }}>
                                            {errorMsg}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* YouTube-Style Video Info & Action Bar */}
                    {isTvRoute && (
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                marginTop: '18px',
                                padding: '20px 22px',
                                borderRadius: '20px',
                                backgroundColor: OASIS.surface,
                                border: `1px solid ${OASIS.border}`,
                                boxShadow: '0 10px 30px -12px rgba(18, 12, 31, 0.08)'
                            }}
                        >
                            <h1
                                style={{
                                    margin: '0 0 14px 0',
                                    fontSize: 'clamp(1.15rem, 2.2vw, 1.45rem)',
                                    fontWeight: 800,
                                    color: OASIS.text,
                                    lineHeight: 1.3
                                }}
                            >
                                {isLive
                                    ? 'Transmisión en Vivo — Iglesia Adventista Oasis'
                                    : 'Únete a nuestra transmisión y experimenta a Dios desde donde estés'}
                            </h1>

                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '16px'
                                }}
                            >
                                {/* Channel Strip */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${OASIS.ink} 0%, #2B1F47 100%)`,
                                            border: `2px solid ${OASIS.gold}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#FFFFFF',
                                            fontFamily: 'Moonrising, sans-serif',
                                            fontSize: '1.05rem',
                                            flexShrink: 0
                                        }}
                                    >
                                        O
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.96rem', color: OASIS.text }}>
                                                Iglesia Oasis
                                            </span>
                                            <CheckCircle2 size={15} color={OASIS.gold} />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: OASIS.textMuted }}>
                                            {isLive ? 'Transmitiendo en directo ahora' : 'Oasis Media • Mensajes y Cultos'}
                                        </span>
                                    </div>
                                </div>

                                {/* YouTube-Style Action Pills */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleInline('ofrenda')}
                                        className="yt-pill-btn"
                                        style={{
                                            backgroundColor: OASIS.gold,
                                            color: '#FFFFFF',
                                            boxShadow: activeInline === 'ofrenda'
                                                ? '0 0 0 3px rgba(245, 158, 11, 0.35), 0 8px 20px rgba(245, 158, 11, 0.35)'
                                                : '0 6px 18px rgba(245, 158, 11, 0.3)'
                                        }}
                                    >
                                        <Wallet size={17} /> Dar Mi Ofrenda
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleToggleInline('peticion')}
                                        className="yt-pill-btn"
                                        style={{
                                            backgroundColor: isDark ? '#FFFFFF' : OASIS.ink,
                                            color: isDark ? OASIS.ink : '#FFFFFF',
                                            boxShadow: activeInline === 'peticion'
                                                ? '0 0 0 3px rgba(18, 12, 31, 0.25)'
                                                : '0 6px 18px rgba(18, 12, 31, 0.14)'
                                        }}
                                    >
                                        <HeartHandshake size={17} /> Necesito Oración
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        className="yt-pill-btn"
                                        style={{
                                            backgroundColor: OASIS.surfaceMuted,
                                            color: OASIS.text,
                                            border: `1px solid ${OASIS.border}`
                                        }}
                                    >
                                        {copied ? <Check size={16} color="#10B981" /> : <Share2 size={16} />}
                                        {copied ? '¡Enlace copiado!' : 'Compartir'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Expandable Inline Drawer (Alfolí / Peticiones) */}
                    {isTvRoute && (
                        <div ref={inlineDrawerRef}>
                            <AnimatePresence>
                                {activeInline === 'ofrenda' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div
                                            style={{
                                                marginTop: '16px',
                                                padding: '18px',
                                                backgroundColor: OASIS.surface,
                                                borderRadius: '22px',
                                                border: `1px solid ${OASIS.border}`,
                                                boxShadow: '0 14px 36px -12px rgba(18, 12, 31, 0.12)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ fontWeight: 800, color: OASIS.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Wallet size={18} color={OASIS.gold} /> Diezmos y Ofrendas — Alfolí Virtual
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveInline(null)}
                                                    style={{ background: 'transparent', border: 'none', color: OASIS.textMuted, cursor: 'pointer' }}
                                                    aria-label="Cerrar Alfolí"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            <iframe
                                                src="https://alfoliadventista.org/"
                                                style={{ width: '100%', height: '600px', border: 'none', borderRadius: '14px' }}
                                                title="Alfolí Virtual"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {activeInline === 'peticion' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div
                                            style={{
                                                marginTop: '16px',
                                                padding: '20px',
                                                backgroundColor: OASIS.surface,
                                                borderRadius: '22px',
                                                border: `1px solid ${OASIS.border}`,
                                                boxShadow: '0 14px 36px -12px rgba(18, 12, 31, 0.12)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontWeight: 800, color: OASIS.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <HeartHandshake size={18} color={OASIS.gold} /> Peticiones de Oración
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveInline(null)}
                                                    style={{ background: 'transparent', border: 'none', color: OASIS.textMuted, cursor: 'pointer' }}
                                                    aria-label="Cerrar Peticiones"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            <Peticiones inline={true} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Right Column — YouTube-style Interactive Sidebar */}
                {isTvRoute && !theaterMode && (
                    <motion.aside
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                        {/* Live Status & Schedule Card */}
                        <div
                            style={{
                                padding: '18px 20px',
                                borderRadius: '20px',
                                backgroundColor: OASIS.surface,
                                border: `1px solid ${isLive ? 'rgba(220, 38, 38, 0.35)' : OASIS.border}`,
                                boxShadow: '0 10px 30px -12px rgba(18, 12, 31, 0.08)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: OASIS.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={16} color={OASIS.gold} /> Horarios de Culto
                                </span>
                                <span
                                    style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        padding: '3px 9px',
                                        borderRadius: '999px',
                                        backgroundColor: isLive ? 'rgba(220, 38, 38, 0.12)' : OASIS.goldSoft,
                                        color: isLive ? OASIS.live : isDark ? '#FDE68A' : '#B45309'
                                    }}
                                >
                                    {isLive ? 'EN DIRECTO' : 'PROGRAMACIÓN'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '12px',
                                        backgroundColor: OASIS.surfaceMuted,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: OASIS.text }}>Sábados</span>
                                    <span style={{ fontSize: '0.82rem', color: OASIS.textMuted, fontWeight: 600 }}>9:30 AM — Culto Central</span>
                                </div>
                                <div
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '12px',
                                        backgroundColor: OASIS.surfaceMuted,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: OASIS.text }}>Miércoles</span>
                                    <span style={{ fontSize: '0.82rem', color: OASIS.textMuted, fontWeight: 600 }}>7:30 PM — Oración</span>
                                </div>
                            </div>
                        </div>

                        {/* YouTube-Style "Participa" Interactive List */}
                        <div
                            style={{
                                padding: '18px 16px',
                                borderRadius: '20px',
                                backgroundColor: OASIS.surface,
                                border: `1px solid ${OASIS.border}`,
                                boxShadow: '0 10px 30px -12px rgba(18, 12, 31, 0.08)'
                            }}
                        >
                            <div style={{ padding: '0 6px 12px 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={16} color={OASIS.gold} />
                                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: OASIS.text }}>
                                    Participa en la Transmisión
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleToggleInline('peticion')}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleInline('peticion'); } }}
                                    className="yt-side-item"
                                    style={{
                                        backgroundColor: activeInline === 'peticion' ? OASIS.goldSoft : OASIS.surfaceMuted,
                                        border: `1px solid ${activeInline === 'peticion' ? OASIS.gold : 'transparent'}`
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '14px',
                                            backgroundColor: OASIS.ink,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        <HeartHandshake size={22} color={OASIS.gold} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: OASIS.text }}>
                                            Enviar Petición
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: OASIS.textMuted }}>
                                            Oramos por ti y tu familia
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color={OASIS.textMuted} />
                                </div>

                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleToggleInline('ofrenda')}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleInline('ofrenda'); } }}
                                    className="yt-side-item"
                                    style={{
                                        backgroundColor: activeInline === 'ofrenda' ? OASIS.goldSoft : OASIS.surfaceMuted,
                                        border: `1px solid ${activeInline === 'ofrenda' ? OASIS.gold : 'transparent'}`
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '14px',
                                            backgroundColor: OASIS.gold,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Wallet size={22} color="#FFFFFF" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: OASIS.text }}>
                                            Diezmos y Ofrendas
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: OASIS.textMuted }}>
                                            Alfolí Virtual seguro
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color={OASIS.textMuted} />
                                </div>

                                <a
                                    href={youtubeChannelUrl || 'https://www.youtube.com'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="yt-side-item"
                                    style={{
                                        backgroundColor: OASIS.surfaceMuted,
                                        border: '1px solid transparent',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '14px',
                                            backgroundColor: 'rgba(220, 38, 38, 0.12)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        <ExternalLink size={20} color={OASIS.live} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: OASIS.text }}>
                                            Ver en YouTube
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: OASIS.textMuted }}>
                                            Archivo completo de sermones
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color={OASIS.textMuted} />
                                </a>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </div>
        </div>
    );
};

export default PersistentPlayer;
