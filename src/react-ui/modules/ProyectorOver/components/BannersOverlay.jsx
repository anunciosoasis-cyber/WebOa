import { motion } from 'framer-motion';

/**
 * BANNERS OVERLAY - SISTEMA TIPO NOTICIEROS PARA PREDICADORES Y ANUNCIOS
 * 4 Layouts profesionales: CLASSIC, MINIMAL, SIDEBAR, CINEMATIC
 */
const BannersOverlay = ({ overlayData, overlayStyle }) => {
    const tmpl = overlayData.template?.toLowerCase() || 'classic';

    // Estilos CSS para animaciones
    const pulseKeyframes = `
        @keyframes pulse-badge {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            50% { opacity: 1; }
            100% { opacity: 1; box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
        @keyframes pulse-dot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
    `;

    // Variantes de animación para container
    const containerVariants = {
        classic: {
            initial: { opacity: 0, y: 100 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
            exit: { opacity: 0, y: 100, transition: { duration: 0.3 } }
        },
        minimal: {
            initial: { opacity: 0, scaleX: 0 },
            animate: { opacity: 1, scaleX: 1, transition: { duration: 0.4, ease: 'easeOut' } },
            exit: { opacity: 0, scaleX: 0, transition: { duration: 0.2 } }
        },
        sidebar: {
            initial: { opacity: 0, x: -150 },
            animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
            exit: { opacity: 0, x: -150, transition: { duration: 0.3 } }
        },
        cinematic: {
            initial: { opacity: 0, scale: 0.9, rotateY: -30 },
            animate: { opacity: 1, scale: 1, rotateY: 0, transition: { duration: 0.6, ease: 'easeOut' } },
            exit: { opacity: 0, scale: 0.9, rotateY: 30, transition: { duration: 0.3 } }
        }
    };

    const getContainerVariants = () => containerVariants[tmpl] || containerVariants.classic;

    // ============================================
    // LAYOUT 1: CLASSIC (Lower Third Tradicional)
    // ============================================
    if (tmpl === 'classic') {
        return (
            <motion.div
                variants={getContainerVariants()}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                    ...overlayStyle,
                    position: 'absolute',
                    bottom: '60px',
                    left: '60px',
                    right: '60px',
                    maxWidth: '900px',
                    zIndex: 10
                }}
            >
                {/* Barra Superior: Nombre/Predicador */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    style={{
                        background: 'linear-gradient(90deg, rgba(18,12,31,0.95) 0%, rgba(245,158,11,0.15) 100%)',
                        padding: '18px 28px',
                        borderRadius: '8px 8px 0 0',
                        borderBottom: '3px solid #F59E0B',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(245,158,11,0.3)'
                    }}
                >
                    <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                        PREDICADOR
                    </div>
                    <h2 style={{
                        color: '#FFFFFF',
                        fontSize: '2.2rem',
                        fontFamily: 'Moonrising, sans-serif',
                        fontWeight: 900,
                        margin: 0,
                        textShadow: '0 4px 12px rgba(0,0,0,0.6)'
                    }}>
                        {overlayData.title || 'NOMBRE DEL PREDICADOR'}
                    </h2>
                </motion.div>

                {/* Barra Inferior: Tema/Título */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    style={{
                        background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(18,12,31,0.95) 100%)',
                        padding: '14px 28px',
                        borderRadius: '0 0 8px 8px',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderTop: 'none'
                    }}
                >
                    <p style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '1.3rem',
                        fontWeight: 500,
                        margin: 0,
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: 1.3
                    }}>
                        {overlayData.content || 'Tema del Sermón'}
                    </p>
                </motion.div>
            </motion.div>
        );
    }

    // ============================================
    // LAYOUT 2: MINIMAL (Barra Minimalista)
    // ============================================
    if (tmpl === 'minimal') {
        return (
            <motion.div
                variants={getContainerVariants()}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                    ...overlayStyle,
                    position: 'absolute',
                    bottom: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10
                }}
            >
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.1, duration: 0.4, origin: 'center' }}
                    style={{
                        background: 'linear-gradient(90deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.1) 50%, rgba(245,158,11,0.2) 100%)',
                        padding: '12px 32px',
                        borderRadius: '50px',
                        backdropFilter: 'blur(16px)',
                        border: '1.5px solid rgba(245,158,11,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#F59E0B',
                            boxShadow: '0 0 12px rgba(245,158,11,0.6)'
                        }}
                    />
                    <div style={{
                        fontSize: '0.7rem',
                        color: '#F59E0B',
                        fontWeight: 900,
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase'
                    }}>
                        EN VIVO
                    </div>
                    <div style={{
                        width: '1px',
                        height: '16px',
                        background: 'rgba(255,255,255,0.2)'
                    }} />
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        style={{
                            color: '#FFFFFF',
                            fontSize: '1.2rem',
                            fontFamily: 'Moonrising, sans-serif',
                            fontWeight: 900,
                            margin: 0,
                            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                        }}
                    >
                        {overlayData.title || 'PREDICADOR'}
                    </motion.h3>
                </motion.div>
            </motion.div>
        );
    }

    // ============================================
    // LAYOUT 3: SIDEBAR (Panel Lateral)
    // ============================================
    if (tmpl === 'sidebar') {
        return (
            <>
                <style>{pulseKeyframes}</style>
                <motion.div
                    variants={getContainerVariants()}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{
                        ...overlayStyle,
                        position: 'absolute',
                        left: '40px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '380px',
                        zIndex: 10
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        style={{
                            background: 'linear-gradient(180deg, rgba(245,158,11,0.2) 0%, rgba(18,12,31,0.95) 100%)',
                            padding: '32px 28px',
                            borderRadius: '16px',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(245,158,11,0.3)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
                        }}
                    >
                        {/* Indicador EN VIVO */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(239,68,68,0.2)',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                marginBottom: '16px',
                                border: '1px solid rgba(239,68,68,0.4)',
                                animation: 'pulse-badge 2s infinite'
                            }}
                        >
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#EF4444',
                                animation: 'pulse-dot 1.5s infinite'
                            }} />
                            <span style={{
                                fontSize: '0.65rem',
                                color: '#FCA5A5',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                EN VIVO
                            </span>
                        </motion.div>

                        {/* Nombre */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            style={{
                                color: '#FFFFFF',
                                fontSize: '2rem',
                                fontFamily: 'Moonrising, sans-serif',
                                fontWeight: 900,
                                margin: '0 0 12px 0',
                                lineHeight: 1.1,
                                textShadow: '0 4px 12px rgba(0,0,0,0.6)'
                            }}
                        >
                            {overlayData.title || 'PREDICADOR'}
                        </motion.h2>

                        {/* Tema/Contenido */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                        >
                            <div style={{
                                width: '40px',
                                height: '3px',
                                background: 'linear-gradient(90deg, #F59E0B, transparent)',
                                marginBottom: '12px',
                                borderRadius: '2px'
                            }} />
                            <p style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '1.1rem',
                                fontWeight: 500,
                                margin: 0,
                                lineHeight: 1.5,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {overlayData.content || 'Tema del Sermón'}
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Decoración lateral */}
                    <div style={{
                        position: 'absolute',
                        left: '-20px',
                        top: '20px',
                        width: '4px',
                        height: '60px',
                        background: 'linear-gradient(180deg, #F59E0B, transparent)',
                        borderRadius: '4px'
                    }} />
                </motion.div>
            </>
        );
    }

    // ============================================
    // LAYOUT 4: CINEMATIC (Full Screen con Efectos)
    // ============================================
    if (tmpl === 'cinematic') {
        return (
            <motion.div
                variants={getContainerVariants()}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                    ...overlayStyle,
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '80px 60px 120px',
                    zIndex: 10,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)'
                }}
            >
                {/* Efecto de fondo */}
                <motion.div
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 0.1, scale: 1 }}
                    transition={{ delay: 0, duration: 0.8 }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at center, rgba(245,158,11,0.1) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }}
                />

                {/* Contenedor central */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{
                        textAlign: 'center',
                        maxWidth: '1200px',
                        position: 'relative',
                        zIndex: 2
                    }}
                >
                    {/* Label */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        style={{
                            fontSize: '0.85rem',
                            color: '#F59E0B',
                            fontWeight: 900,
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            marginBottom: '20px',
                            fontFamily: 'Moonrising, sans-serif'
                        }}
                    >
                        PREDICADOR EN DIRECTO
                    </motion.div>

                    {/* Nombre Grande */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
                        style={{
                            color: '#FFFFFF',
                            fontSize: '4.5rem',
                            fontFamily: 'Moonrising, sans-serif',
                            fontWeight: 900,
                            margin: '0 0 30px 0',
                            lineHeight: 1.1,
                            textShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 80px rgba(245,158,11,0.3)',
                            letterSpacing: '-1px'
                        }}
                    >
                        {overlayData.title || 'PREDICADOR'}
                    </motion.h1>

                    {/* Tema/Contenido */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        style={{
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: '2rem',
                            fontWeight: 400,
                            margin: 0,
                            lineHeight: 1.4,
                            fontFamily: 'Georgia, serif',
                            fontStyle: 'italic'
                        }}
                    >
                        {overlayData.content || 'Tema del Sermón'}
                    </motion.p>

                    {/* Línea decorativa */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        style={{
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)',
                            margin: '30px auto 0',
                            width: '200px'
                        }}
                    />
                </motion.div>
            </motion.div>
        );
    }

    // Default fallback
    return null;
};

export default BannersOverlay;
