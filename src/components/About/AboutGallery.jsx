"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { COLORS } from './AboutStyles';

// DATA PICTORIAL COMPLETA - Muestra de Trayectoria Oasis
const OASIS_MOMENTS = [
    { id: 1, title: 'Generación Oasis JA', tag: '#Jóvenes', likes: 245, comments: 18, img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200', size: 'big' },
    { id: 2, title: 'Adoración Colectiva', tag: '#Sábado', likes: 512, comments: 42, img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200', size: 'small' },
    { id: 3, title: 'Club Conquistadores', tag: '#Aventura', likes: 189, comments: 24, img: 'https://images.unsplash.com/photo-1472393365320-dc77e9abe70a?q=80&w=1200', size: 'small' },
    { id: 4, title: 'Impacto Social ADRA', tag: '#Servicio', likes: 334, comments: 15, img: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1200', size: 'medium' },
    { id: 5, title: 'Escuela Sabática', tag: '#Estudio', likes: 156, comments: 9, img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200', size: 'small' },
    { id: 6, title: 'Noche de Esperanza', tag: '#Evangelismo', likes: 410, comments: 33, img: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1200', size: 'medium' },
    { id: 7, title: 'Pequeños Oasis', tag: '#Infantes', likes: 198, comments: 11, img: 'https://images.unsplash.com/photo-1484662020986-75935d2ebc66?q=80&w=1200', size: 'small' },
];

const AboutGallery = ({ galleryItems = [], getImageUrl }) => {
    const [likedItems, setLikedItems] = useState({});
    const [activeHeart, setActiveHeart] = useState(null);
    const [selectedReel, setSelectedReel] = useState(null);

    const items = galleryItems || [];

    const handleLike = (id, e) => {
        if (e) e.stopPropagation();
        setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
        if (!likedItems[id]) {
            setActiveHeart(id);
            setTimeout(() => setActiveHeart(null), 800);
        }
    };

    // Helper para definir las clases de la grilla Bento
    const getBentoClass = (size, index) => {
        if (size === 'big') return 'bento-big';
        if (size === 'medium') return 'bento-medium';
        return 'bento-small';
    };

    // Variantes de animación para la entrada de la grilla
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <section style={{ padding: '120px 20px', background: COLORS.softBg, overflow: 'hidden' }}>
            {/* Encabezado Cinematográfico */}
            <div style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '800px', margin: '0 auto 80px' }}>
                <span style={{ color: COLORS.accent, fontWeight: 900, letterSpacing: 5, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Mosaico de Fe
                </span>
                <h2 style={{ 
                    fontFamily: 'Moonrising, sans-serif', 
                    color: COLORS.deepPurple, 
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
                    marginTop: '15px',
                    lineHeight: 1
                }}>
                    Nuestra <span style={{ color: COLORS.accent }}>Comunidad</span>
                </h2>
                <p style={{ color: '#555', fontSize: '1.1rem', marginTop: '20px', lineHeight: 1.8, fontWeight: 500 }}>
                    Explora los momentos vibrantes que definen la trayectoria de Oasis Medellín. Interactúa con nuestra historia tipo Social Media.
                </p>
            </div>

            {/* GRILLA BENTO DINÁMICA CON PARALLAX */}
            <motion.div 
                className="bento-grid"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {items.map((item, idx) => (
                    <motion.div 
                        key={item.id}
                        variants={cardVariants}
                        className={`bento-item ${getBentoClass(item.size, idx)}`}
                        onDoubleClick={(e) => handleLike(item.id, e)}
                        onClick={() => setSelectedReel(item)}
                        // EFECTO PARALLAX sutil en hover
                        whileHover={{ y: -15, scale: 1.01, zIndex: 50 }}
                        style={{
                            position: 'relative',
                            background: '#000',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                            breakInside: 'avoid',
                            marginBottom: '25px',
                            display: 'block'
                        }}
                    >
                        <img 
                            src={getImageUrl ? getImageUrl(item.imageUrl || item.img) : item.img} 
                            alt={item.title} 
                            style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.85, transition: '0.8s' }} 
                            className="bento-img"
                        />

                        {/* Corazón Double Tap */}
                        <AnimatePresence>
                            {activeHeart === item.id && (
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.8, opacity: 1 }} exit={{ scale: 2.5, opacity: 0 }}
                                    style={{ position: 'absolute', top: '40%', left: '38%', zIndex: 100 }}
                                >
                                    <LucideIcons.Heart size={item.size === 'big' ? 120 : 70} fill={COLORS.accent} color={COLORS.accent} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Overlay Social Media (Instagram style) */}
                        <div className="bento-overlay">
                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                                    {item.title || ''}
                                </h4>
                                <span style={{ color: COLORS.accent, fontSize: '0.8rem', fontWeight: 700 }}>
                                    {item.tag || ''}
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className="social-btn" onClick={(e) => handleLike(item.id, e)}>
                                        <LucideIcons.Heart fill={likedItems[item.id] ? COLORS.accent : 'none'} color={likedItems[item.id] ? COLORS.accent : '#fff'} size={20} />
                                        <span>{likedItems[item.id] ? item.likes + 1 : item.likes}</span>
                                    </div>
                                    <div className="social-btn">
                                        <LucideIcons.MessageCircle size={20} color="#fff" />
                                        <span>{item.comments}</span>
                                    </div>
                                </div>
                                <LucideIcons.Share2 size={18} color="#fff" style={{ opacity: 0.6 }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* MODAL REEL (ZOOM IN) - Mismo que antes */}
            <AnimatePresence>
                {selectedReel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="reel-modal" onClick={() => setSelectedReel(null)}>
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} className="reel-content" onClick={(e) => e.stopPropagation()}>
                            <img src={getImageUrl ? getImageUrl(selectedReel.imageUrl || selectedReel.img) : selectedReel.img} alt="" />
                            <div className="reel-info">
                                <button className="close-reel" onClick={() => setSelectedReel(null)}><LucideIcons.X /></button>
                                <span className="reel-tag">{selectedReel.tag}</span>
                                <h2>{selectedReel.title}</h2>
                                <p>Comunidad Oasis Medellín • 2026</p>
                                <div className="reel-actions">
                                    <button className="reel-action-btn" onClick={(e) => handleLike(selectedReel.id, e)}>
                                        <LucideIcons.Heart fill={likedItems[selectedReel.id] ? COLORS.accent : 'none'} color={likedItems[selectedReel.id] ? COLORS.accent : '#fff'} />
                                        Me encanta
                                    </button>
                                    <button className="reel-action-btn"><LucideIcons.MessageCircle /> Comentar</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .bento-grid {
                    column-count: 3;
                    column-gap: 25px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .bento-item { transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1); }

                .bento-overlay {
                    position: absolute; inset: 0; padding: 30px;
                    background: linear-gradient(to top, rgba(8,5,13,0.95) 0%, rgba(8,5,13,0.2) 60%, transparent 100%);
                    backdrop-filter: blur(4px); transition: 0.4s ease;
                    display: flex; flex-direction: column; justify-content: flex-end;
                    opacity: 0; transform: translateY(10px);
                }
                .bento-item:hover .bento-overlay { opacity: 1; transform: translateY(0); }
                .bento-item:hover .bento-img { transform: scale(1.1); }

                .social-btn { display: flex; align-items: center; gap: 6px; color: #fff; font-weight: 700; font-size: 0.85rem; }

                /* REEL MODAL - Estilos Premium */
                .reel-modal { position: fixed; inset: 0; background: rgba(8, 5, 13, 0.98); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(15px); padding: 20px; }
                .reel-content { width: 100%; maxWidth: 1000px; height: 85vh; background: #050505; border-radius: 40px; overflow: hidden; display: flex; border: 1px solid rgba(255,255,255,0.1); }
                .reel-content img { width: 60%; height: 100%; object-fit: contain; background: #000; }
                .reel-info { width: 40%; padding: 50px; display: flex; flex-direction: column; color: #fff; position: relative; }
                .close-reel { position: absolute; top: 30px; right: 30px; background: none; border: none; color: #fff; cursor: pointer; }
                .reel-tag { color: ${COLORS.accent}; font-weight: 900; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 3px; }
                .reel-info h2 { font-family: 'Moonrising'; font-size: 2.2rem; margin: 15px 0; line-height: 1.1; }
                .reel-actions { margin-top: auto; display: flex; flex-direction: column; gap: 15px; }
                .reel-action-btn { width: 100%; padding: 15px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
                .reel-action-btn:hover { background: ${COLORS.accent}; color: ${COLORS.midnight}; }

                @media (max-width: 992px) {
                    .bento-grid { column-count: 2; column-gap: 15px; }
                    .bento-item { margin-bottom: 15px; }
                    .reel-content { flex-direction: column; height: auto; max-height: 95vh; }
                    .reel-content img { width: 100%; height: 350px; }
                    .reel-info { width: 100%; padding: 25px; }
                    .reel-info h2 { font-size: 1.6rem; }
                }
                @font-face { font-family: 'Moonrising'; src: url('/fonts/Moonrising.ttf'); }
            `}</style>
        </section>
    );
};

export default AboutGallery;