import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementPreview = ({
    formData, set, selectedElementId, setSelectedElementId,
    handleElementDoubleClick, isMobile, refs, assets = {}
}) => {
    // Configuración de dimensiones según formato
    const getDimensions = () => {
        const baseWidth = isMobile ? 320 : 450;
        const ratios = {
            square:    { w: baseWidth,       h: baseWidth,                  label: '1:1'  },
            youtube:   { w: baseWidth * 1.5, h: baseWidth * 1.5 * (9 / 16), label: '16:9' },
            whatsapp:  { w: baseWidth * 0.7, h: baseWidth * 0.7 * (16 / 9), label: '9:16' },
            instagram: { w: baseWidth,       h: baseWidth * 1.25,           label: '4:5'  },
        };
        return ratios[formData.format] || ratios.instagram;
    };

    const dims = getDimensions();

    // Tamaño de logo Oasis en px (basado en % del ancho del canvas)
    const oasisLogoW = Math.round(dims.w * ((formData.logoOasisSize || 40) / 100));
    const rrssSize   = formData.rrssSize || 28;

    return (
        <div className="preview-workspace d-flex align-items-center justify-content-center"
            style={{ perspective: '1200px', width: '100%', minHeight: '650px' }}>

            {/* Contenedor Isla Flotante */}
            <motion.div
                layout
                initial={false}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="preview-island shadow-2xl"
                style={{
                    width: dims.w,
                    height: dims.h,
                    position: 'relative',
                    borderRadius: '24px',
                    background: formData.bgMode === 'gradient'
                        ? `linear-gradient(${formData.bgGradAngle || 135}deg, ${formData.gradientStart}, ${formData.gradientEnd})`
                        : '#0a0a0a',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    containerType: 'size',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.6)',
                }}
            >
                {/* ── Imagen de Fondo ─────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {formData.bgImage && (
                        <motion.img
                            key={formData.bgImage}
                            crossOrigin="anonymous"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: formData.bgOpacity ?? 0.55, scale: 1 }}
                            exit={{ opacity: 0 }}
                            src={formData.bgImage}
                            alt=""
                            style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%',
                                objectFit: 'cover', filter: `blur(${formData.bgBlur || 0}px)`,
                                zIndex: 0,
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* ── Overlay Glassmorphism ────────────────────────────────────── */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent)',
                    zIndex: 1, pointerEvents: 'none',
                }} />

                {/* ── Logo Oasis (superior izquierdo) ─────────────────────────── */}
                {formData.showLogoOasis && assets.oasis && (
                    <img
                        src={assets.oasis}
                        alt="Logo Oasis"
                        crossOrigin="anonymous"
                        style={{
                            position: 'absolute', top: 12, left: 12,
                            width: oasisLogoW, height: 'auto',
                            objectFit: 'contain', zIndex: 20,
                            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* ── Logo IASD (superior derecho) ────────────────────────────── */}
                {formData.showLogoIasd && assets.iasd && (
                    <img
                        src={assets.iasd}
                        alt="Logo IASD"
                        crossOrigin="anonymous"
                        style={{
                            position: 'absolute', top: 12, right: 12,
                            width: Math.round(dims.w * ((formData.logoIasdSize || 30) / 100)),
                            height: 'auto', objectFit: 'contain', zIndex: 20,
                            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* ── Redes Sociales (inferior izquierdo) ─────────────────────── */}
                {formData.showRrss && assets.rrss && (
                    <div style={{
                        position: 'absolute', bottom: 10, left: 12,
                        display: 'flex', alignItems: 'center', gap: 6,
                        zIndex: 20, pointerEvents: 'none',
                    }}>
                        <img
                            src={assets.rrss}
                            alt="Redes Sociales"
                            crossOrigin="anonymous"
                            style={{
                                width: rrssSize, height: rrssSize,
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))',
                            }}
                        />
                        <span style={{
                            fontSize: rrssSize * 0.45, color: '#fff',
                            fontFamily: 'Montserrat', fontWeight: 700,
                            textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                            whiteSpace: 'nowrap',
                        }}>
                            @templo_oasis
                        </span>
                    </div>
                )}

                {/* ── Canvas de Elementos ──────────────────────────────────────── */}
                <div style={{
                    position: 'relative', zIndex: 10, width: '100%', height: '100%',
                    padding: '10cqi', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>

                    {/* TÍTULO PRINCIPAL */}
                    <motion.div
                        drag
                        dragMomentum={false}
                        onDragEnd={(_e, info) => set('titlePos', {
                            x: formData.titlePos.x + info.offset.x,
                            y: formData.titlePos.y + info.offset.y,
                        })}
                        onMouseDown={() => setSelectedElementId('title')}
                        onDoubleClick={() => handleElementDoubleClick('title')}
                        style={{
                            x: formData.titlePos.x, y: formData.titlePos.y,
                            cursor: 'grab', pointerEvents: 'auto', textAlign: 'center',
                            outline: selectedElementId === 'title' ? '2px solid #F59E0B' : 'none',
                            borderRadius: 4,
                        }}
                    >
                        <h1 style={{
                            color: formData.titleColor,
                            fontFamily: formData.titleFont,
                            fontSize: `${(formData.titleSize || 2) * 0.8}cqi`,
                            lineHeight: 0.95, fontWeight: 900, textTransform: 'uppercase',
                            margin: 0, textShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            fontStyle: formData.titleItalic ? 'italic' : 'normal',
                        }}>
                            {formData.title || 'TÍTULO'}
                        </h1>
                    </motion.div>

                    {/* SPEAKER / PREDICADOR */}
                    {formData.speaker && (
                        <motion.div
                            drag dragMomentum={false}
                            onDragEnd={(_e, info) => set('speakerPos', {
                                x: formData.speakerPos.x + info.offset.x,
                                y: formData.speakerPos.y + info.offset.y,
                            })}
                            onMouseDown={() => setSelectedElementId('speaker')}
                            style={{
                                x: formData.speakerPos.x, y: formData.speakerPos.y,
                                cursor: 'grab', textAlign: 'center', marginTop: '2cqi',
                                outline: selectedElementId === 'speaker' ? '2px solid #F59E0B' : 'none',
                                borderRadius: 4,
                            }}
                        >
                            <p style={{
                                color: formData.speakerColor, fontFamily: formData.speakerFont,
                                fontSize: `${(formData.speakerSize || 1.7) * 0.7}cqi`,
                                margin: 0, fontStyle: 'italic',
                                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                            }}>
                                {formData.speaker}
                            </p>
                        </motion.div>
                    )}

                    {/* FECHA / HORA / UBICACIÓN — fijo en parte inferior */}
                    <div style={{ position: 'absolute', bottom: '10cqi', width: '80%', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '3cqi', opacity: 0.85 }}>
                            {formData.date && (
                                <span style={{ fontSize: '3cqi', color: formData.dateColor || '#fff', fontFamily: 'Montserrat' }}>
                                    <i className="bi bi-calendar3 me-1" />{formData.date}
                                </span>
                            )}
                            {formData.time && (
                                <span style={{ fontSize: '3cqi', color: formData.timeColor || '#fff', fontFamily: 'Montserrat' }}>
                                    <i className="bi bi-clock me-1" />{formData.time}
                                </span>
                            )}
                        </div>
                        {formData.location && (
                            <div style={{ fontSize: '2.5cqi', color: formData.locationColor || formData.accentColor || '#ccc', marginTop: '1cqi' }}>
                                <i className="bi bi-geo-alt-fill me-1" />{formData.location}
                            </div>
                        )}
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default AnnouncementPreview;