import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CountdownOverlay = ({ overlayData, overlayStyle, now }) => {
    const tmpl = overlayData.template ? overlayData.template.toLowerCase() : 'classic';

    const getFormattedRemaining = () => {
        if (!overlayData.targetTime) return '00:00';
        let diff = Math.floor((overlayData.targetTime - now) / 1000);
        if (overlayData.mode === 'countdown') {
            if (diff <= 0) return '00:00';
            const m = Math.floor(diff / 60);
            const s = diff % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        } else {
            const absDiff = Math.abs(diff);
            const m = Math.floor(absDiff / 60);
            const s = absDiff % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
    };

    // Variantes físicas de resorte para las transiciones maestras del overlay
    const overlayVariants = {
        hidden: { opacity: 0, scale: 1 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                when: "beforeChildren",
                staggerChildren: 0.12
            }
        },
        exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }
    };

    const elementVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
    };

    const horizonVariants = {
        hidden: { scaleX: 0.5, opacity: 0 },
        visible: { scaleX: 1, opacity: 1, transition: { duration: 1.4, ease: 'easeOut' } }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`countdown-${tmpl}`}
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                    ...overlayStyle,
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    // Distribución dinámica de acuerdo a la naturaleza de cada template
                    alignItems: tmpl === 'sidebar' ? 'flex-start' : 'center',
                    justifyContent: tmpl === 'minimal' ? 'center' : (tmpl === 'classic' ? 'flex-end' : 'center'),
                    padding: tmpl === 'classic' ? '0 0 80px 80px' : '0',
                    zIndex: 999,
                    overflow: 'hidden',
                    background: (overlayData.customBg && tmpl !== 'minimal') ? `url(${overlayData.customBg}) center/cover no-repeat` : 'transparent',
                    fontFamily: "'Moonrising', 'Inter', sans-serif"
                }}
            >
                {/* CAPA DE CAPTURA DE FONDO PATRÓN (Solo si no es minimalista) */}
                {overlayData.pattern && overlayData.pattern !== 'none' && tmpl !== 'minimal' && (
                    <div className={`absolute inset-0 z-0 bg-ui-pattern-${overlayData.pattern} opacity-[0.03] pointer-events-none`} />
                )}

                {/* FILTRO DE DESENFOQUE MAESTRO (Excluido de minimal para purismo absoluto) */}
                {tmpl !== 'minimal' && tmpl !== 'sidebar' && tmpl !== 'classic' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(15,23,42,0.5) 0%, rgba(2,6,23,0.85) 100%)', backdropFilter: 'blur(25px)', zIndex: -1 }} />
                )}

                {/* 1. VERDADERO ESTILO MINIMAL: ELEGANCIA FLOTANTE DESNUDA (Sin cajas ni plastas de fondo) */}
                {tmpl === 'minimal' && (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.95))' }}>
                        <motion.h2
                            variants={elementVariants}
                            style={{ color: 'var(--accent-color, #F59E0B)', fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '10px', margin: 0, opacity: 0.9 }}
                        >
                            {overlayData.title || 'COMENZAMOS'}
                        </motion.h2>

                        <motion.div
                            variants={elementVariants}
                            animate={{ scale: [1, 1.01, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' } }}
                            style={{ fontSize: '11rem', fontWeight: 950, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-4px' }}
                        >
                            {getFormattedRemaining()}
                        </motion.div>

                        {/* Pequeño indicador de progreso minimalista lineal */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '80px', opacity: 0.6 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            style={{ height: '2px', background: '#FFFFFF', marginTop: '10px', borderRadius: '2px' }}
                        />
                    </div>
                )}

                {/* 2. ESTILO CINEMATIC: EL ORIGEN DEL HORIZONTE */}
                {tmpl === 'cinematic' && (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <motion.div
                            variants={horizonVariants}
                            style={{
                                position: 'absolute',
                                bottom: '15%',
                                left: '10%',
                                right: '10%',
                                height: '160px',
                                background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(239,68,68,0.06) 60%, transparent 100%)',
                                filter: 'blur(40px)',
                                pointerEvents: 'none',
                                transformOrigin: 'bottom'
                            }}
                        />
                        <motion.div
                            variants={horizonVariants}
                            style={{
                                position: 'absolute',
                                bottom: '26%',
                                left: '20%',
                                right: '20%',
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 20%, #FFF 50%, rgba(255,255,255,0.2) 80%, transparent 100%)',
                                filter: 'drop-shadow(0 -3px 6px var(--accent-color, #F59E0B))',
                                opacity: 0.8
                            }}
                        />

                        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', filter: 'drop-shadow(0 25px 60px rgba(0,0,0,0.95))' }}>
                            <motion.h2 variants={elementVariants} style={{ color: '#FFFFFF', fontSize: '2.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '22px', margin: 0 }}>
                                {overlayData.title || 'ESTAMOS COMENZANDO'}
                            </motion.h2>

                            <motion.div
                                variants={elementVariants}
                                animate={{ scale: [1, 1.012, 1], textShadow: ['0 0 50px rgba(255,255,255,0.3)', '0 0 70px rgba(245,158,11,0.5)', '0 0 50px rgba(255,255,255,0.3)'] }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ fontSize: '15rem', fontWeight: 950, color: '#FFFFFF', lineHeight: 0.95, letterSpacing: '-1px', background: 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            >
                                {getFormattedRemaining()}
                            </motion.div>

                            <motion.div variants={elementVariants} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-color, #F59E0B)', padding: '6px 20px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '4px' }}>
                                LIVE BROADCAST
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* 3. VERDADERO ESTILO SIDEBAR: CONTROL LATERAL IZQUIERDO DE TRANSMISIÓN */}
                {tmpl === 'sidebar' && (
                    <div style={{ width: '28%', height: '100%', background: 'linear-gradient(90deg, rgba(9,14,23,0.85) 0%, rgba(15,23,42,0.95) 100%)', backdropFilter: 'blur(30px)', borderRight: '5px solid var(--accent-color, #F59E0B)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 45px', boxShadow: '30px 0 70px rgba(0,0,0,0.8)', borderLeft: '1px solid rgba(255,255,255,0.04)', relative: 'true' }}>

                        {/* Líneas estéticas de hardware de broadcast */}
                        <div style={{ position: 'absolute', top: '50px', left: '45px', right: '45px', height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))' }}>
                            <motion.h3 variants={elementVariants} style={{ color: 'var(--accent-color, #F59E0B)', fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '6px', margin: 0 }}>
                                {overlayData.title || 'COUNTDOWN'}
                            </motion.h3>

                            <motion.div
                                variants={elementVariants}
                                animate={{ scale: [1, 1.015, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' } }}
                                style={{ fontSize: '7rem', fontWeight: 950, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-2px', fontFamily: 'Moonrising, sans-serif' }}
                            >
                                {getFormattedRemaining()}
                            </motion.div>

                            <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.15)' }} />

                            <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '3px', color: '#64748B', textTransform: 'uppercase' }}>
                                STREAMING MONITOR
                            </span>
                        </div>
                    </div>
                )}

                {/* 4. PERFECCIONADO ESTILO CLASSIC: MARQUESINA HORIZONTAL DE CORTE DE NOTICIAS */}
                {tmpl !== 'minimal' && tmpl !== 'cinematic' && tmpl !== 'sidebar' && (
                    <div style={{ width: '100%', maxWidth: '1420px', display: 'flex', flexDirection: 'column', filter: 'drop-shadow(0 25px 55px rgba(0,0,0,0.85))' }}>

                        {/* Pestaña superior flotante del título */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #090e17 0%, #152131 100%)', backdropFilter: 'blur(20px)', borderLeft: '6px solid var(--accent-color, #F59E0B)', padding: '6px 30px', borderRadius: '12px 20px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <motion.h2 variants={elementVariants} style={{ color: 'var(--accent-color, #F59E0B)', fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '6px', margin: 0 }}>
                                {overlayData.title || 'TRANSMISIÓN'}
                            </motion.h2>
                        </div>

                        {/* Cinturón Horizontal Principal */}
                        <div style={{ width: '100%', background: 'linear-gradient(180deg, rgba(13,20,35,0.92) 0%, rgba(7,10,19,0.97) 100%)', backdropFilter: 'blur(30px)', padding: '24px 45px', borderRadius: '0 24px 24px 24px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none', display: 'flex', alignItems: 'center', justifyContent: 'between', gap: '40px', relative: 'true' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--accent-color, #F59E0B), transparent 60%)' }} />

                            <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', borderRight: '2px solid rgba(255,255,255,0.1)', paddingRight: '40px' }}>
                                INICIAMOS EN EN:
                            </span>

                            <motion.div
                                variants={elementVariants}
                                animate={{ scale: [1, 1.01, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' } }}
                                style={{ fontSize: '5.5rem', fontWeight: 950, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-1px', fontFamily: 'Moonrising, sans-serif' }}
                            >
                                {getFormattedRemaining()}
                            </motion.div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default CountdownOverlay;