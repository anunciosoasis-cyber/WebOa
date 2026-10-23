import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronLeft, ChevronRight, Clock, User, MapPin, Sparkles } from 'lucide-react';
import apiClient from '../../../api/client';

const ANNOUNCEMENTS_REFRESH_MS = 30000;
const ANNOUNCEMENTS_UPDATED_EVENT = 'oasis:announcements-updated';
const ANNOUNCEMENTS_UPDATED_KEY = 'oasis_announcements_updated_at';

// Componente individual de imagen de tarjeta con fallback automático inteligente
const CardImage = ({ primarySrc, fallbackSrc, alt, title, tag }) => {
    const [src, setSrc] = useState(primarySrc || fallbackSrc || '');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setSrc(primarySrc || fallbackSrc || '');
        setHasError(false);
    }, [primarySrc, fallbackSrc]);

    const handleError = () => {
        if (src !== fallbackSrc && fallbackSrc) {
            setSrc(fallbackSrc);
        } else {
            setHasError(true);
        }
    };

    if (hasError || !src) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1f1435 0%, #120C1F 60%, #08050D 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#F59E0B',
                    marginBottom: '16px'
                }}>
                    <Sparkles size={26} />
                </div>
                <span style={{
                    color: '#F59E0B',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: '6px'
                }}>
                    {tag || 'OASIS'}
                </span>
                <span style={{
                    color: '#FFFFFF',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    lineHeight: '1.2',
                    fontFamily: 'Moonrising, sans-serif'
                }}>
                    {title}
                </span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={handleError}
            loading="lazy"
            decoding="async"
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
            }}
        />
    );
};

const Announcements = ({ items: propItems, loading: propLoading }) => {
    const [internalItems, setInternalItems] = useState([]);
    const [internalLoading, setInternalLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [scrollIndex, setScrollIndex] = useState(0);

    const items = propItems !== undefined ? propItems : internalItems;
    const loading = propLoading !== undefined ? propLoading : internalLoading;

    const pickFirst = (...values) => values.find((v) => v !== undefined && v !== null && String(v).trim() !== '');

    const apiBase = useMemo(() => {
        const raw = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        return raw.endsWith('/api') ? raw.slice(0, -4) : raw;
    }, []);

    const resolveImageUrl = useCallback((value) => {
        if (!value) return '';
        if (value.startsWith('http')) return value;
        const path = value.startsWith('/') ? value : `/uploads/${value}`;
        return `${apiBase}${path}`;
    }, [apiBase]);

    const normalizeAnnouncement = useCallback((ann) => {
        let form = {};
        if (ann?.formData && typeof ann.formData === 'string') {
            try {
                form = JSON.parse(ann.formData);
            } catch {
                form = {};
            }
        } else if (ann?.formData && typeof ann.formData === 'object') {
            form = ann.formData;
        }

        let annTitle = pickFirst(ann?.title, form?.title, 'ANUNCIO');
        let annSubtitle = pickFirst(form?.subtitle, form?.title2, ann?.subtitle, '');

        if (annTitle && typeof annTitle === 'string' && annTitle.includes('|||')) {
            const parts = annTitle.split('|||');
            annTitle = parts[0];
            annSubtitle = parts[1] || annSubtitle;
        }

        const rawImg = pickFirst(ann?.imageUrl, ann?.image_url, form?.imageUrl, '');
        const fallbackBg = form?.bgImage && typeof form.bgImage === 'string' && form.bgImage.startsWith('http') ? form.bgImage : '';

        return {
            id: ann?.id,
            tag: pickFirst(ann?.tag, form?.tag, 'OASIS'),
            title: annTitle,
            subtitle: annSubtitle,
            title3: pickFirst(form?.title3, ''),
            speaker: pickFirst(form?.speaker, ann?.speaker, ann?.description, ''),
            content: pickFirst(ann?.content, form?.content, ''),
            date: pickFirst(ann?.date, form?.date, ''),
            time: pickFirst(ann?.time, form?.time, ''),
            location: pickFirst(ann?.location, form?.location, ''),
            image: rawImg ? resolveImageUrl(rawImg) : '',
            fallbackBg: fallbackBg,
        };
    }, [resolveImageUrl]);

    const loadAnnouncements = useCallback(async () => {
        if (propItems !== undefined) return;
        try {
            const { data } = await apiClient.get('/announcements');
            const list = Array.isArray(data) ? data : (data?.data || []);
            setInternalItems(list);
        } catch {
            setInternalItems([]);
        } finally {
            setInternalLoading(false);
        }
    }, [propItems]);

    useEffect(() => {
        if (propItems === undefined) {
            loadAnnouncements();

            const intervalId = window.setInterval(loadAnnouncements, ANNOUNCEMENTS_REFRESH_MS);
            const handleFocus = () => loadAnnouncements();
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    loadAnnouncements();
                }
            };
            const handleStorage = (event) => {
                if (event.key === ANNOUNCEMENTS_UPDATED_KEY) {
                    loadAnnouncements();
                }
            };

            window.addEventListener('focus', handleFocus);
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('storage', handleStorage);
            window.addEventListener(ANNOUNCEMENTS_UPDATED_EVENT, loadAnnouncements);

            return () => {
                window.clearInterval(intervalId);
                window.removeEventListener('focus', handleFocus);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('storage', handleStorage);
                window.removeEventListener(ANNOUNCEMENTS_UPDATED_EVENT, loadAnnouncements);
            };
        }
    }, [propItems, loadAnnouncements]);

    // Check scroll state for arrow buttons
    const updateScrollState = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        // Approximate active index
        const cardWidth = 300;
        const idx = Math.round(scrollLeft / cardWidth);
        setScrollIndex(Math.max(0, Math.min(items.length - 1, idx)));
    }, [items.length]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [items, updateScrollState]);

    const scrollByAmount = (direction) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const amount = direction === 'next' ? 320 : -320;
        el.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const scrollToCard = (index) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const targetX = index * 300;
        el.scrollTo({ left: targetX, behavior: 'smooth' });
    };

    // Body scroll lock on modal open
    useEffect(() => {
        if (selectedId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedId]);

    const selectedAnn = useMemo(() => items.find(i => i.id === selectedId), [selectedId, items]);
    const selectedData = useMemo(() => normalizeAnnouncement(selectedAnn), [selectedAnn, normalizeAnnouncement]);
    const currentIndex = useMemo(() => items.findIndex(i => i.id === selectedId), [items, selectedId]);

    const handleNext = useCallback((e) => {
        if (e) e.stopPropagation();
        if (items.length > 0) {
            const nextIndex = (currentIndex + 1) % items.length;
            setSelectedId(items[nextIndex].id);
        }
    }, [currentIndex, items]);

    const handlePrev = useCallback((e) => {
        if (e) e.stopPropagation();
        if (items.length > 0) {
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            setSelectedId(items[prevIndex].id);
        }
    }, [currentIndex, items]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedId) return;
            if (e.key === 'ArrowRight') handleNext();
            else if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'Escape') setSelectedId(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, handleNext, handlePrev]);

    if (loading) {
        return (
            <div style={{ display: 'flex', gap: '20px', padding: '20px', overflowX: 'hidden' }}>
                {[1, 2, 3, 4].map(n => (
                    <div key={n} style={{
                        flex: '0 0 280px',
                        aspectRatio: '4 / 5',
                        borderRadius: '24px',
                        background: 'linear-gradient(90deg, #1e1b2e 0%, #2b2540 50%, #1e1b2e 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'pulse 1.5s infinite ease-in-out'
                    }} />
                ))}
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div style={{
                padding: '50px 20px',
                textAlign: 'center',
                color: '#6B7280',
                background: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                margin: '20px 0'
            }}>
                <Sparkles size={36} color="#F59E0B" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: '#120C1F', fontWeight: 800, fontSize: '1.2rem', marginBottom: '6px' }}>
                    Sin publicaciones recientes
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    Pronto tendremos nuevas actividades y cultos especiales para compartir.
                </p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', margin: '0 auto' }}>
            <style>{`
                .announcements-track {
                    display: flex;
                    flex-direction: row;
                    gap: 24px;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    padding: 12px 6px 28px 6px;
                }
                .announcements-track::-webkit-scrollbar {
                    display: none;
                }
                .announcement-card {
                    flex: 0 0 280px;
                    scroll-snap-align: start;
                    aspect-ratio: 4 / 5;
                    border-radius: 24px;
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                    background: #08050D;
                    box-shadow: 0 16px 36px -10px rgba(0,0,0,0.35);
                    border: 1px solid rgba(255,255,255,0.08);
                    transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.3s ease;
                    user-select: none;
                }
                .announcement-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 24px 48px -12px rgba(245, 158, 11, 0.25);
                }
                @media (max-width: 640px) {
                    .announcement-card {
                        flex: 0 0 240px;
                        border-radius: 20px;
                    }
                    .announcements-track {
                        gap: 16px;
                    }
                }
                .announcement-carousel-ctrl {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(18, 12, 31, 0.85);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    color: #FFFFFF;
                    display: grid;
                    place-items: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
                }
                .announcement-carousel-ctrl:hover:not(:disabled) {
                    background: #F59E0B;
                    color: #120C1F;
                    transform: scale(1.08);
                    box-shadow: 0 10px 24px rgba(245, 158, 11, 0.4);
                }
                .announcement-carousel-ctrl:disabled {
                    opacity: 0.25;
                    cursor: not-allowed;
                    border-color: rgba(255,255,255,0.1);
                }
                .announcement-modal-container {
                    position: relative;
                    width: 96vw;
                    max-width: 1300px;
                    height: 90vh;
                    background: #08050D;
                    border-radius: 28px;
                    display: flex;
                    flex-direction: row;
                    overflow: hidden;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.85);
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .announcement-modal-left {
                    flex: 1 1 50%;
                    height: 100%;
                    position: relative;
                    background: #000000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .announcement-modal-right {
                    flex: 1 1 50%;
                    min-width: 320px;
                    max-width: 520px;
                    padding: 50px 40px;
                    background: #0d0817;
                    color: white;
                    border-left: 1px solid rgba(255,255,255,0.08);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .announcement-close-btn {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.6);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    cursor: pointer;
                    display: grid;
                    place-items: center;
                    backdrop-filter: blur(10px);
                    z-index: 30;
                    transition: background 0.2s, transform 0.2s;
                }
                .announcement-close-btn:hover {
                    background: #F59E0B;
                    color: #120C1F;
                    transform: scale(1.05);
                }
                @media (max-width: 900px) {
                    .announcement-modal-container {
                        flex-direction: column;
                        height: 94vh;
                        max-height: 94vh;
                        overflow-y: auto;
                    }
                    .announcement-modal-left {
                        height: 42vh;
                        min-height: 240px;
                        flex: none;
                    }
                    .announcement-modal-right {
                        flex: 1;
                        max-width: 100%;
                        border-left: none;
                        border-top: 1px solid rgba(255,255,255,0.08);
                        padding: 30px 20px 20px;
                    }
                }
            `}</style>

            {/* Cabecera del Carrusel con Controles */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                padding: '0 4px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: '#F59E0B',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        {items.length} {items.length === 1 ? 'publicación' : 'publicaciones'}
                    </span>
                    <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 500 }}>
                        Desliza para ver más
                    </span>
                </div>

                {/* Flechas de Navegación del Carrusel */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => scrollByAmount('prev')}
                        disabled={!canScrollLeft}
                        className="announcement-carousel-ctrl"
                        aria-label="Anterior anuncio"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scrollByAmount('next')}
                        disabled={!canScrollRight}
                        className="announcement-carousel-ctrl"
                        aria-label="Siguiente anuncio"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* TRACK DEL CARRUSEL (HORIZONTAL SLIDER) */}
            <div ref={scrollContainerRef} className="announcements-track">
                {items.map((ann) => {
                    const cardData = normalizeAnnouncement(ann);
                    return (
                        <div
                            key={ann.id}
                            className="announcement-card"
                            onClick={() => setSelectedId(ann.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(ann.id); }}
                        >
                            {/* Imagen o Fallback */}
                            <CardImage
                                primarySrc={cardData.image}
                                fallbackSrc={cardData.fallbackBg}
                                alt={cardData.title}
                                title={cardData.title}
                                tag={cardData.tag}
                            />

                            {/* Badge superior: Tag y Fecha */}
                            <div style={{
                                position: 'absolute',
                                top: '14px',
                                left: '14px',
                                right: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                pointerEvents: 'none',
                                zIndex: 10
                            }}>
                                <span style={{
                                    background: 'rgba(18, 12, 31, 0.85)',
                                    color: '#F59E0B',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                    backdropFilter: 'blur(8px)',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase'
                                }}>
                                    {cardData.tag}
                                </span>

                                {!!cardData.date && (
                                    <span style={{
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        color: '#FFFFFF',
                                        backdropFilter: 'blur(8px)',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        padding: '4px 9px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Calendar size={12} color="#F59E0B" />
                                        {cardData.date}
                                    </span>
                                )}
                            </div>

                            {/* Overlay inferior con gradiente de contraste */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '36px 18px 18px',
                                background: 'linear-gradient(to top, rgba(8, 5, 13, 0.98) 0%, rgba(8, 5, 13, 0.75) 55%, transparent 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '3px',
                                zIndex: 10
                            }}>
                                <span style={{
                                    color: '#FFFFFF',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    lineHeight: '1.25',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {cardData.title}
                                </span>

                                {!!cardData.subtitle && (
                                    <span style={{
                                        color: '#F59E0B',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        lineHeight: '1.2'
                                    }}>
                                        {cardData.subtitle}
                                    </span>
                                )}

                                {!!cardData.speaker && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        marginTop: '4px',
                                        color: 'rgba(255,255,255,0.7)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        <User size={13} color="#F59E0B" />
                                        <span>{cardData.speaker}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Puntos Indicadores del Carrusel */}
            {items.length > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '8px'
                }}>
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollToCard(i)}
                            style={{
                                width: i === scrollIndex ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: i === scrollIndex ? '#F59E0B' : 'rgba(18, 12, 31, 0.2)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                padding: 0
                            }}
                            aria-label={`Ir al anuncio ${i + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* MODAL DETALLADO CON NAVEGACIÓN Y TECLADO */}
            <AnimatePresence>
                {selectedId && selectedAnn && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999,
                        padding: '16px'
                    }}>
                        {/* Backdrop desenfocado */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.85)',
                                backdropFilter: 'blur(12px)'
                            }}
                        />

                        {/* Contenedor Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="announcement-modal-container"
                        >
                            {/* IZQUIERDA: IMAGEN / POSTER */}
                            <div className="announcement-modal-left">
                                <CardImage
                                    primarySrc={selectedData.image}
                                    fallbackSrc={selectedData.fallbackBg}
                                    alt={selectedData.title}
                                    title={selectedData.title}
                                    tag={selectedData.tag}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(null);
                                    }}
                                    className="announcement-close-btn"
                                    aria-label="Cerrar modal"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* DERECHA: TEXTO Y CONTENIDO */}
                            <div className="announcement-modal-right">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedId}
                                        initial={{ opacity: 0, x: 15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -15 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            flex: 1,
                                            overflowY: 'auto',
                                            paddingRight: '6px'
                                        }}>
                                            {/* Meta Pills */}
                                            <div style={{
                                                display: 'flex',
                                                gap: '10px',
                                                marginBottom: '18px',
                                                alignItems: 'center',
                                                flexWrap: 'wrap'
                                            }}>
                                                {!!selectedData.tag && (
                                                    <span style={{
                                                        background: '#F59E0B',
                                                        color: '#120C1F',
                                                        padding: '5px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 900,
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {selectedData.tag}
                                                    </span>
                                                )}
                                                {!!selectedData.date && (
                                                    <span style={{
                                                        color: 'rgba(255,255,255,0.7)',
                                                        fontSize: '0.8rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        <Calendar size={14} color="#F59E0B" />
                                                        {selectedData.date}
                                                    </span>
                                                )}
                                                {!!selectedData.time && (
                                                    <span style={{
                                                        color: 'rgba(255,255,255,0.7)',
                                                        fontSize: '0.8rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        <Clock size={14} color="#F59E0B" />
                                                        {selectedData.time}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Título Principal */}
                                            <h2 style={{
                                                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                                                fontWeight: 900,
                                                margin: '0 0 6px 0',
                                                lineHeight: '1.15',
                                                color: '#FFFFFF'
                                            }}>
                                                {selectedData.title}
                                            </h2>

                                            {!!selectedData.subtitle && (
                                                <h3 style={{
                                                    color: '#F59E0B',
                                                    fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                                                    fontWeight: 800,
                                                    margin: '0 0 16px 0',
                                                    lineHeight: '1.2'
                                                }}>
                                                    {selectedData.subtitle}
                                                </h3>
                                            )}

                                            {!!selectedData.speaker && (
                                                <p style={{
                                                    color: '#E5E7EB',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    margin: '0 0 12px 0'
                                                }}>
                                                    <User size={16} color="#F59E0B" />
                                                    {selectedData.speaker}
                                                </p>
                                            )}

                                            {!!selectedData.location && (
                                                <p style={{
                                                    color: 'rgba(255,255,255,0.7)',
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    margin: '0 0 16px 0'
                                                }}>
                                                    <MapPin size={16} color="#F59E0B" />
                                                    {selectedData.location}
                                                </p>
                                            )}

                                            {/* Contenido / Descripción */}
                                            {!!selectedData.content && (
                                                <div style={{
                                                    color: 'rgba(255,255,255,0.8)',
                                                    fontSize: '0.95rem',
                                                    lineHeight: '1.7',
                                                    marginTop: '12px'
                                                }}>
                                                    {selectedData.content}
                                                </div>
                                            )}
                                        </div>

                                        {/* Navegación dentro del modal */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingTop: '16px',
                                            borderTop: '1px solid rgba(255,255,255,0.08)',
                                            marginTop: '14px'
                                        }}>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                                {currentIndex + 1} de {items.length}
                                            </span>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={handlePrev}
                                                    className="announcement-carousel-ctrl"
                                                    style={{ width: '40px', height: '40px' }}
                                                    aria-label="Anterior"
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>
                                                <button
                                                    onClick={handleNext}
                                                    className="announcement-carousel-ctrl"
                                                    style={{ width: '40px', height: '40px' }}
                                                    aria-label="Siguiente"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Announcements;