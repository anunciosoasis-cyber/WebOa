import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LowerThirdOverlay = ({ overlayData, overlayStyle }) => {
    // Variantes físicas de resorte para una entrada cinemática fluida
    const containerVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.96 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 120,
                damping: 20,
                mass: 1,
                when: "beforeChildren",
                staggerChildren: 0.15
            }
        },
        exit: {
            opacity: 0,
            y: 40,
            scale: 0.94,
            transition: { ease: 'easeInOut', duration: 0.25 }
        }
    };

    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 16 } }
    };

    const glowVariants = {
        hidden: { scaleX: 0, opacity: 0 },
        visible: { scaleX: 1, opacity: 1, transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 } }
    };

    const tmpl = overlayData.template?.toLowerCase() || 'classic';
    const isTicker = tmpl === 'classic';
    const isModern = tmpl === 'minimal';
    const isCinematic = tmpl === 'cinematic' || tmpl === 'sidebar';

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`lower_third-${tmpl}-${overlayData.title}-${overlayData.content}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                    ...overlayStyle,
                    position: 'absolute',
                    bottom: '60px',
                    left: '60px',
                    zIndex: 999,
                    fontFamily: "'Moonrising', 'Inter', sans-serif"
                }}
            >
                {/* 1. ESTILO TICKER: HARDWARE INFORMATIVO DE TELEVISIÓN PREMIUM */}
                {isTicker && (
                    <div style={{ width: 'min(1650px, 90vw)', display: 'flex', flexDirection: 'column', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.7))' }}>
                        <div style={{ height: '3px', width: '100%', background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 50%, #D6B87E 100%)', borderRadius: '4px 4px 0 0' }} />
                        <div style={{ display: 'flex', alignItems: 'stretch', background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderRadius: '0 0 20px 20px', overflow: 'hidden' }}>
                            <div style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D6B87E 100%)', color: '#030712', padding: '14px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '320px' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(3,7,18,0.6)' }}>OASIS NEWS</span>
                                <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{overlayData.title}</h1>
                            </div>
                            <div style={{ flex: 1, padding: '14px 36px', display: 'flex', alignItems: 'center' }}>
                                <motion.p variants={textVariants} style={{ margin: 0, color: '#F1F5F9', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
                                    {overlayData.content}
                                </motion.p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. ESTILO MODERN: NOTICIERO ESTRATÉGICO GLASSMORPHISM */}
                {isModern && (
                    <div style={{ width: 'min(1500px, 85vw)', background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.7) 100%)', backdropFilter: 'blur(25px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.75)', padding: '20px 32px', overflow: 'hidden', relative: 'true' }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '2.5px', textTransform: 'uppercase' }}>BOLETÍN</span>
                                <motion.h1 variants={textVariants} style={{ margin: 0, color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                    {overlayData.title}
                                </motion.h1>
                            </div>
                            <motion.p variants={textVariants} style={{ margin: 0, color: '#CBD5E1', fontSize: '1.1rem', lineHeight: 1.35, fontWeight: 700, whiteSpace: 'pre-line' }}>
                                {overlayData.content}
                            </motion.p>
                        </div>
                    </div>
                )}

                {/* 3. ESTILO CINEMATIC: HORIZONTE DE LA TIERRA CON AMANECER BRILLANTE */}
                {isCinematic && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: 'min(1600px, 88vw)', filter: 'drop-shadow(0 35px 60px rgba(0,0,0,0.9))', position: 'relative' }}>

                        {/* CONTENEDOR PRINCIPAL: Base Oscura de la Tierra */}
                        <div style={{ background: 'linear-gradient(180deg, rgba(4,6,14,0.94) 0%, rgba(10,15,30,0.98) 100%)', backdropFilter: 'blur(30px)', padding: '28px 45px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', relative: 'true', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                            {/* GRADIANTE MAESTRO: Efecto Amanecer Solar Espectacular */}
                            <motion.div
                                variants={glowVariants}
                                style={{
                                    position: 'absolute',
                                    bottom: '-25px',
                                    left: '10%',
                                    right: '10%',
                                    height: '50px',
                                    background: 'radial-gradient(circle, rgba(245,158,11,0.6) 0%, rgba(239,68,68,0.2) 50%, transparent 100%)',
                                    filter: 'blur(12px)',
                                    transformOrigin: 'bottom'
                                }}
                            />
                            <motion.div
                                variants={glowVariants}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: 'linear-gradient(90deg, transparent 0%, #F59E0B 30%, #FFF 50%, #F59E0B 70%, transparent 100%)',
                                    filter: 'drop-shadow(0 -4px 8px #F59E0B)'
                                }}
                            />

                            {/* TÍTULO DEL BANNER: Fuente Moonrising Absoluta */}
                            <motion.h1
                                variants={textVariants}
                                style={{
                                    margin: 0,
                                    color: '#FFFFFF',
                                    fontSize: '2.6rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '5px',
                                    lineHeight: 1,
                                    fontFamily: "'Moonrising', sans-serif",
                                    textShadow: '0 0 20px rgba(255,255,255,0.15)'
                                }}
                            >
                                {overlayData.title}
                            </motion.h1>

                            {/* SUBTÍTULO / DESCRIPCIÓN DEL NOTICIERO */}
                            <motion.p
                                variants={textVariants}
                                style={{
                                    margin: 0,
                                    color: '#94A3B8',
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    letterSpacing: '3px',
                                    textTransform: 'uppercase',
                                    lineHeight: 1.2,
                                    whiteSpace: 'pre-line',
                                    borderLeft: '3px solid #F59E0B',
                                    paddingLeft: '15px'
                                }}
                            >
                                {overlayData.content}
                            </motion.p>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default LowerThirdOverlay;