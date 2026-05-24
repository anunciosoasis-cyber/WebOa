import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../../api/client';

const ANNOUNCEMENTS_REFRESH_MS = 30000;
const ANNOUNCEMENTS_UPDATED_EVENT = 'oasis:announcements-updated';
const ANNOUNCEMENTS_UPDATED_KEY = 'oasis_announcements_updated_at';

const Announcements = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    const pickFirst = (...values) => values.find((v) => v !== undefined && v !== null && String(v).trim() !== '');

    const apiBase = useMemo(() => {
        const raw = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        return raw.endsWith('/api') ? raw.slice(0, -4) : raw;
    }, []);

    const resolveImageUrl = (value) => {
        if (!value) return '';
        if (value.startsWith('http')) return value;
        const path = value.startsWith('/') ? value : `/uploads/${value}`;
        return `${apiBase}${path}`;
    };

    const normalizeAnnouncement = (ann) => {
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

        return {
            id: ann?.id,
            tag: pickFirst(ann?.tag, form?.tag, 'OASIS'),
            title: pickFirst(ann?.title, form?.title, 'ANUNCIO'),
            subtitle: pickFirst(form?.title2, ann?.subtitle, ''),
            title3: pickFirst(form?.title3, ''),
            speaker: pickFirst(form?.speaker, ann?.description, ''),
            content: pickFirst(ann?.content, form?.content, ann?.description, ''),
            date: pickFirst(ann?.date, form?.date, ''),
            time: pickFirst(ann?.time, form?.time, ''),
            location: pickFirst(ann?.location, form?.location, ''),
            image: pickFirst(ann?.imageUrl, ann?.image_url, form?.imageUrl, form?.bgImage, ''),
        };
    };

    const loadAnnouncements = useCallback(async () => {
        try {
            const { data } = await apiClient.get('/announcements');
            const list = Array.isArray(data) ? data : (data?.data || []);
            setItems(list);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
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
    }, [loadAnnouncements]);

    useEffect(() => {
        if (selectedId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedId]);

    const selectedAnn = useMemo(() => items.find(i => i.id === selectedId), [selectedId, items]);
    const selectedData = useMemo(() => normalizeAnnouncement(selectedAnn), [selectedAnn]);

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
            if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape') {
                setSelectedId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, handleNext, handlePrev]);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Cargando...</div>;

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={gridStyle}>
                {items.map((ann) => {
                    const cardData = normalizeAnnouncement(ann);
                    return (
                    <motion.div
                        key={ann.id}
                        layoutId={`card-${ann.id}`}
                        onClick={() => setSelectedId(ann.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={verticalIsland}
                    >
                        <motion.img
                            layoutId={`img-${ann.id}`}
                            src={resolveImageUrl(cardData.image)}
                            style={islandImage}
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={islandOverlay}
                        >
                            <span style={islandTitleSmall}>{cardData.title}</span>
                        </motion.div>
                    </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {selectedId && selectedAnn && (
                    <div style={modalFixedWrapper}>
                        {/* Fondo desenfocado con salida suave */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            style={backdropStyle}
                        />

                        {/* Contenedor Principal con animación de expansión */}
                        <motion.div
                            layoutId={`card-${selectedId}`}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            style={modalContentContainer}
                        >
                            {/* IZQUIERDA: IMAGEN */}
                            <div style={modalLeft}>
                                <motion.img
                                    layoutId={`img-${selectedId}`}
                                    src={resolveImageUrl(selectedData.image)}
                                    style={fullImgStyle}
                                />
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(null);
                                    }}
                                    style={closeBtnStyle}
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>

                            {/* DERECHA: TEXTO (DARK MODE) */}
                            <div style={modalRightPane}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedId}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                        style={infoWrapper}
                                    >
                                        <div style={badgeRow}>
                                            <span style={badgeStyle}>{selectedData.tag}</span>
                                            {!!selectedData.date && <span style={dateTextStyle}><Calendar size={14} /> {selectedData.date}</span>}
                                            {!!selectedData.time && <span style={dateTextStyle}>{selectedData.time}</span>}
                                        </div>

                                        <h2 style={titleStyle}>{selectedData.title}</h2>
                                        {!!selectedData.subtitle && <p style={subtitleStyle}>{selectedData.subtitle}</p>}
                                        {!!selectedData.title3 && <p style={subtleTextStyle}>{selectedData.title3}</p>}
                                        {!!selectedData.speaker && <p style={speakerStyle}>{selectedData.speaker}</p>}

                                        <div style={scrollAreaStyle}>
                                            {!!selectedData.content && <p style={textContentStyle}>{selectedData.content}</p>}
                                            {!!selectedData.location && <p style={metaLineStyle}>{selectedData.location}</p>}
                                        </div>

                                        <div style={navigationContainerStyle}>
                                            <button onClick={handlePrev} style={navButtonStyle}>
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button onClick={handleNext} style={navButtonStyle}>
                                                <ChevronRight size={24} />
                                            </button>
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

// --- ESTILOS REFINADOS ---

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '30px',
    padding: '20px'
};

const verticalIsland = {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 5',
    borderRadius: '24px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#0a0a0a',
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const islandImage = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
};

const islandOverlay = {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: '30px 20px 20px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
};

const islandTitleSmall = {
    color: 'white',
    fontWeight: 800,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const modalFixedWrapper = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '20px'
};

const backdropStyle = {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(12px)',
};

const modalContentContainer = {
    position: 'relative',
    width: '96vw',
    maxWidth: '1400px',
    height: '92vh',
    background: '#0a0a0a',
    borderRadius: '32px',
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
};

const modalLeft = {
    flex: '1 1 520px',
    height: '100%',
    position: 'relative',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const fullImgStyle = { width: '100%', height: '100%', objectFit: 'contain' };

const modalRightPane = { flex: '1 1 320px', minWidth: '320px', maxWidth: '520px', padding: '60px 50px', background: '#0a0a0a', color: 'white', borderLeft: '1px solid rgba(255,255,255,0.08)' };

const infoWrapper = { height: '100%', display: 'flex', flexDirection: 'column' };

const closeBtnStyle = {
    position: 'absolute', top: '25px', left: '25px',
    width: '50px', height: '50px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white',
    cursor: 'pointer', display: 'grid', placeItems: 'center', backdropFilter: 'blur(10px)',
    zIndex: 20
};

const badgeRow = { display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center' };

const badgeStyle = {
    background: '#F59E0B', color: 'black', padding: '6px 14px',
    borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase'
};

const dateTextStyle = { color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 500 };

const titleStyle = { fontSize: '3rem', fontWeight: 900, margin: '0 0 25px 0', lineHeight: 1.1 };

const subtitleStyle = { color: '#E5E7EB', fontSize: '1.45rem', margin: '0 0 6px 0', lineHeight: 1.2 };

const subtleTextStyle = { color: 'rgba(255,255,255,0.75)', fontSize: '1rem', margin: '0 0 10px 0', lineHeight: 1.35 };

const speakerStyle = { color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 18px 0', lineHeight: 1.2 };

const scrollAreaStyle = { flex: 1, overflowY: 'auto', paddingRight: '10px' };

const textContentStyle = { color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.1rem' };

const metaLineStyle = { color: '#F59E0B', fontSize: '0.95rem', fontWeight: 800, marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' };

const navigationContainerStyle = { display: 'flex', justifyContent: 'flex-end', gap: '15px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' };

const navButtonStyle = {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
    width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
};

export default Announcements;