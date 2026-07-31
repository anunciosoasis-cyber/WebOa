import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BibleHymnOverlay = ({ overlayData, overlayStyle }) => {
    const tmpl = overlayData.template ? overlayData.template.toLowerCase() : 'classic';

    // Función para escalar dinámicamente el texto y evitar desbordamientos
    const getDynamicFontSize = (text, defaultSizeRem) => {
        if (!text) return `${defaultSizeRem}rem`;
        const lines = text.split(/\r\n|\r|\n/).length;
        const chars = text.length;
        
        // Cálculo matemático riguroso: 
        // 70vh disponibles divididos entre (cantidad de líneas * 1.45 de line-height)
        const maxVh = 70 / (lines * 1.45);
        
        let size = defaultSizeRem;
        if (lines >= 8 || chars > 250) size = defaultSizeRem * 0.55;
        else if (lines >= 6 || chars > 180) size = defaultSizeRem * 0.70;
        else if (lines >= 5 || chars > 120) size = defaultSizeRem * 0.82;
        
        // Obliga a que la fuente no exceda los rem calculados, ni tampoco el límite matemático de altura
        return `min(${size}rem, ${maxVh}vh)`;
    };

    // Animaciones por físicas de resorte desacopladas para impacto televisivo
    const containerVariants = {
        cinematic: {
            initial: { opacity: 0, scale: 1.03, y: 20 },
            animate: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    when: "beforeChildren",
                    staggerChildren: 0.15
                }
            },
            exit: { opacity: 0, scale: 0.97, y: -15, transition: { duration: 0.3, ease: 'easeInOut' } }
        },
        minimal: {
            initial: { opacity: 0, y: 100 },
            animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 18, when: "beforeChildren", staggerChildren: 0.08 } },
            exit: { opacity: 0, y: 60, transition: { duration: 0.25 } }
        },
        // REDISEÑO: Ajuste de físicas y escala para el panel holográfico lateral
        sidebar: {
            initial: { opacity: 0, x: 250, scaleX: 0.9 },
            animate: { opacity: 1, x: 0, scaleX: 1, transition: { type: 'spring', stiffness: 85, damping: 15, mass: 1, when: "beforeChildren", staggerChildren: 0.1 } },
            exit: { opacity: 0, x: 200, scaleX: 0.95, transition: { duration: 0.3, ease: 'easeIn' } }
        },
        // REDISEÑO: Trayectoria de entrada en resorte asimétrica para la marquesina flotante
        classic: {
            initial: { opacity: 0, x: -180, y: 30 },
            animate: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', stiffness: 100, damping: 16, mass: 0.9, when: "beforeChildren", staggerChildren: 0.1 } },
            exit: { opacity: 0, x: -120, y: 20, transition: { duration: 0.25, ease: 'easeIn' } }
        }
    };

    const childVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
    };

    const sunGlowVariants = {
        hidden: { opacity: 0, scaleX: 0.4 },
        visible: { opacity: 1, scaleX: 1, transition: { duration: 1.2, ease: 'easeOut', delay: 0.1 } }
    };

    const containerVars = containerVariants[tmpl] || containerVariants.classic;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={overlayData.mode + tmpl + overlayData.title + overlayData.content}
                initial={containerVars.initial}
                animate={containerVars.animate}
                exit={containerVars.exit}
                style={{
                    ...overlayStyle,
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: tmpl === 'sidebar' ? 'flex-end' : 'center',
                    justifyContent: tmpl === 'cinematic' ? 'center' : (tmpl === 'minimal' ? 'flex-end' : (tmpl === 'sidebar' ? 'center' : 'flex-end')),
                    // OPTIMIZACIÓN: Padding ajustado para el nuevo Classic flotante
                    padding: tmpl === 'minimal' ? '0 100px 100px 100px' : (tmpl === 'sidebar' ? '0' : (tmpl === 'classic' ? '0 0 80px 80px' : '80px 120px')),
                    zIndex: 999,
                    overflow: 'hidden',
                    pointerEvents: 'none'
                }}
            >
                {/* 1. ESTILO CINEMATIC (SIN CAMBIOS) */}
                {tmpl === 'cinematic' && (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '1450px' }}>
                        <motion.div
                            variants={sunGlowVariants}
                            style={{
                                position: 'absolute',
                                bottom: '22%',
                                left: '15%',
                                right: '15%',
                                height: '140px',
                                background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(239,68,68,0.05) 50%, transparent 100%)',
                                filter: 'blur(35px)',
                                pointerEvents: 'none',
                                transformOrigin: 'bottom'
                            }}
                        />

                        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '45px', filter: 'drop-shadow(0 25px 55px rgba(0,0,0,0.95))' }}>
                            <motion.p
                                variants={childVariants}
                                style={{
                                    color: '#FFFFFF',
                                    fontSize: getDynamicFontSize(overlayData.content, overlayData.mode === 'himno' ? 3.8 : 3.3),
                                    fontWeight: 800,
                                    lineHeight: 1.45,
                                    fontFamily: "'Cinzel', 'Georgia', serif",
                                    margin: 0,
                                    whiteSpace: 'pre-line',
                                    fontStyle: 'italic',
                                    letterSpacing: '0.5px',
                                    maskImage: 'linear-gradient(to bottom, #fff 85%, rgba(255,255,255,0.8) 100%)'
                                }}
                            >
                                "{overlayData.content}"
                            </motion.p>

                            <motion.div
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 0.9 }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.35 }}
                                style={{ height: '2px', width: '280px', background: 'linear-gradient(90deg, transparent 0%, #FFF 30%, #F59E0B 50%, #FFF 70%, transparent 100%)', filter: 'drop-shadow(0 0 4px #F59E0B)' }}
                            />

                            <motion.div variants={childVariants} style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                <h2 style={{ color: '#F59E0B', fontFamily: "'Moonrising', sans-serif", fontSize: '1.45rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '8px', margin: 0 }}>
                                    {overlayData.title}
                                </h2>
                                {overlayData.subText && (
                                    <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', color: '#E2E8F0', padding: '5px 16px', borderRadius: '999px', fontSize: '0.85rem', fontStyle: 'normal', fontWeight: 800, letterSpacing: '2px', fontFamily: "'Moonrising', sans-serif" }}>
                                        {overlayData.subText}
                                    </span>
                                )}
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* 2. ESTILO MINIMAL (SIN CAMBIOS) */}
                {tmpl === 'minimal' && (
                    <div style={{ width: '100%', maxWidth: '1550px', background: 'linear-gradient(180deg, rgba(15,23,42,0.88) 0%, rgba(9,14,23,0.96) 100%)', backdropFilter: 'blur(25px)', borderTop: '4px solid #F59E0B', borderRadius: '24px', padding: '35px 55px', boxShadow: '0 30px 70px rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{ background: '#F59E0B', color: '#030712', padding: '3px 12px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 950, fontFamily: "'Moonrising', sans-serif", letterSpacing: '2px' }}>
                                {overlayData.mode === 'himno' ? 'HIMNARIO' : 'ESCRITURAS'}
                            </span>
                            <motion.h2 variants={childVariants} style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', margin: 0 }}>
                                {overlayData.title}
                            </motion.h2>
                        </div>
                        <motion.p variants={childVariants} style={{ margin: 0, color: '#FFFFFF', fontSize: getDynamicFontSize(overlayData.content, overlayData.mode === 'himno' ? 1.9 : 2.3), fontWeight: 700, lineHeight: 1.35, whiteSpace: 'pre-line', fontFamily: overlayData.mode === 'bible' ? "'Georgia', serif" : "inherit" }}>
                            {overlayData.content}
                        </motion.p>
                    </div>
                )}

                {/* 3. NUEVO ESTILO SIDEBAR: PANEL HOLOGRÁFICO VERTICAL BROADCAST */}
                {tmpl === 'sidebar' && (
                    <div style={{ width: '38%', height: '100%', background: 'linear-gradient(90deg, rgba(6,10,20,0.8) 0%, rgba(13,20,38,0.95) 70%, rgba(17,24,48,0.98) 100%)', backdropFilter: 'blur(35px)', borderLeft: '6px solid #F59E0B', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 55px', boxShadow: '-25px 0 80px rgba(0,0,0,0.9)', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative' }} >

                        {/* Hilo de luz decorativo superior */}
                        <div style={{ position: 'absolute', top: '40px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg, rgba(245,158,11,0.4), transparent)' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
                                {overlayData.mode === 'himno' ? 'Oasis Himnario' : 'Oasis Escrituras'}
                            </span>
                            <motion.h2 variants={childVariants} style={{ color: '#FFFFFF', fontFamily: "'Moonrising', sans-serif", fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '5px', margin: 0, textShadow: '0 0 15px rgba(245,158,11,0.2)' }}>
                                {overlayData.title}
                            </motion.h2>
                            {overlayData.subText && (
                                <div style={{ display: 'flex', marginTop: '4px' }}>
                                    <span style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.15), transparent)', borderLeft: '3px solid #F59E0B', color: '#F59E0B', padding: '3px 14px', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                                        {overlayData.subText.toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <motion.p variants={childVariants} style={{ color: '#F1F5F9', fontSize: getDynamicFontSize(overlayData.content, overlayData.mode === 'himno' ? 2.3 : 2.1), fontWeight: 700, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line', fontFamily: overlayData.mode === 'bible' ? "'Georgia', serif" : "inherit", textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                            {overlayData.content}
                        </motion.p>
                    </div>
                )}

                {/* 4. NUEVO ESTILO CLASSIC: MARQUESINA FLOTANTE ASIMÉTRICA CON CEJA DE ACCESO */}
                {tmpl !== 'cinematic' && tmpl !== 'minimal' && tmpl !== 'sidebar' && (
                    <div style={{ width: '100%', maxWidth: '1480px', alignSelf: 'flex-start', marginLeft: '60px', display: 'flex', flexDirection: 'column', filter: 'drop-shadow(0 30px 65px rgba(0,0,0,0.85))', position: 'relative' }}>

                        {/* Pestaña de Acceso Superior para el Título */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #090e17 0%, #152131 100%)', backdropFilter: 'blur(20px)', borderLeft: '8px solid #F59E0B', padding: '8px 36px', borderRadius: '14px 24px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                            <motion.h2 variants={childVariants} style={{ color: '#F59E0B', fontFamily: "'Moonrising', sans-serif", fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '6px', margin: 0 }}>
                                {overlayData.title}
                            </motion.h2>
                            {overlayData.subText && (
                                <span style={{ marginLeft: '14px', background: 'rgba(255,255,255,0.06)', color: '#94A3B8', padding: '2px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', fontFamily: "'Moonrising', sans-serif" }}>
                                    {overlayData.subText}
                                </span>
                            )}
                        </div>

                        {/* Marquesina de Texto Principal de Cristal */}
                        <div style={{ width: '100%', background: 'linear-gradient(180deg, rgba(13,20,35,0.92) 0%, rgba(7,10,19,0.97) 100%)', backdropFilter: 'blur(30px)', padding: '36px 50px', borderRadius: '0 24px 24px 24px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none', position: 'relative' }}>
                            {/* Delgada línea reflectiva dorada interna */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #F59E0B, transparent 60%)' }} />

                            <motion.p variants={childVariants} style={{ color: '#FFFFFF', fontSize: getDynamicFontSize(overlayData.content, overlayData.mode === 'himno' ? 2.5 : 2.3), fontWeight: 700, margin: 0, lineHeight: 1.45, whiteSpace: 'pre-line', fontFamily: overlayData.mode === 'bible' ? "'Georgia', serif" : "inherit", textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                                {overlayData.content}
                            </motion.p>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default BibleHymnOverlay;