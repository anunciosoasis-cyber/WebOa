import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Play, RotateCcw, Maximize, Minimize } from 'lucide-react';
import CountdownLiveModal from './studio-oasis/CountdownLiveModal';
import { supabase } from '../api/supabaseClient';

// ─── Página standalone de countdown ──────────────────────────────────────────
const CountdownPage = () => {
    const [config, setConfig]     = useState(null);
    const [phase, setPhase]       = useState('ready'); // 'ready' | 'running' | 'paused' | 'finished'
    const [remaining, setRemaining]   = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef();
    const intervalRef  = useRef();

    // ── Cargar config desde localStorage y AUTO-INICIAR ──
    const loadAndStart = (cfg) => {
        const mins = cfg?.minutes ?? 5;
        const secs = cfg?.seconds ?? 0;
        const total = mins * 60 + secs;
        setConfig({
            message:        cfg?.message        ?? '¡Iniciamos Transmisión!',
            subMessage:     cfg?.subMessage     ?? 'Prepárense para el culto',
            selectedPreset: cfg?.selectedPreset ?? 'oasis',
            customBg:       cfg?.customBg       ?? null,
        });
        setTotalSeconds(total);
        setRemaining(total);
        // Resetear a 'ready' primero para forzar re-mount del intervalo, luego iniciar
        setPhase('ready');
        setTimeout(() => setPhase('running'), 50);
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem('oasis_countdown_config');
            loadAndStart(raw ? JSON.parse(raw) : {});
        } catch {
            loadAndStart({});
        }
        document.title = 'Contador — Oasis Community';

        // ── Suscripción Supabase: recibir nuevas configuraciones si ya estaba abierta ──
        const channel = supabase.channel('obs_public_channel');
        channel.on('broadcast', { event: 'update_overlay' }, ({ payload }) => {
            if (payload?.mode === 'countdown') {
                // Leer la config actualizada de localStorage (el modal ya la guardó)
                try {
                    const raw = localStorage.getItem('oasis_countdown_config');
                    loadAndStart(raw ? JSON.parse(raw) : {});
                } catch {
                    loadAndStart({});
                }
            }
        }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleStart = () => setPhase('running');


    // ── Temporizador ──
    useEffect(() => {
        if (phase === 'running' && remaining > 0) {
            intervalRef.current = setInterval(() => {
                setRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setPhase('finished');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [phase]);

    // ── Fullscreen ──
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const handleReset = () => {
        setRemaining(totalSeconds);
        setPhase('ready');
    };

    const handleTogglePause = () => {
        setPhase(p => p === 'paused' ? 'running' : 'paused');
    };

    const formatDigits = secs => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return { m: m.toString().padStart(2, '0'), s: s.toString().padStart(2, '0') };
    };

    // ── Cargando ──
    if (!config) {
        return (
            <div style={{ background: '#08050D', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Moonrising', fontSize: '1.5rem' }}>
                Preparando...
            </div>
        );
    }

    const currentPreset = COUNTDOWN_PRESETS.find(p => p.id === config.selectedPreset) || COUNTDOWN_PRESETS[0];
    const bgStyle = config.customBg
        ? { backgroundImage: `url(${config.customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: currentPreset.bg };
    const overlayBg = config.customBg ? 'rgba(0,0,0,0.62)' : currentPreset.overlay;
    const progress   = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;
    const isLast10   = remaining <= 10 && remaining > 0;
    const { m: mStr, s: sStr } = formatDigits(remaining);
    const digitColor = isLast10 ? '#EF4444' : '#fff';
    const barColor   = isLast10 ? '#EF4444' : currentPreset.accent;

    return (
        <div
            ref={containerRef}
            style={{ position: 'fixed', inset: 0, overflow: 'hidden', userSelect: 'none', ...bgStyle }}
        >
            {/* Overlay de color */}
            <div style={{ position: 'absolute', inset: 0, background: overlayBg }} />

            {/* Barra de progreso superior */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'rgba(255,255,255,0.08)', zIndex: 2 }}>
                <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                    style={{ height: '100%', background: barColor, borderRadius: '0 4px 4px 0' }}
                />
            </div>

            {/* Controles superiores derecha */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 4, display: 'flex', gap: '10px' }}>
                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    style={btnStyle}
                >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
                <button onClick={() => window.close()} title="Cerrar" style={btnStyle}>
                    <X size={18} />
                </button>
            </div>

            {/* Contenido central */}
            <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                    {phase === 'finished' ? (
                        /* ── Pantalla final ── */
                        <motion.div
                            key="finished"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1,   opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            style={{ textAlign: 'center', padding: '0 40px' }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.7, repeat: 3 }}
                                style={{ fontSize: 'clamp(4rem, 14vw, 9rem)', marginBottom: '20px' }}
                            >
                                🎉
                            </motion.div>
                            <h1 style={{ fontFamily: 'Moonrising', fontSize: 'clamp(2rem, 7vw, 5.5rem)', color: currentPreset.accent, textShadow: `0 0 80px ${currentPreset.accent}99`, marginBottom: '16px' }}>
                                ¡YA COMENZAMOS!
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(0.9rem, 2vw, 1.3rem)', letterSpacing: '3px', marginBottom: '52px' }}>
                                {config.message}
                            </p>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button onClick={handleReset} style={pillBtn}>
                                    <RotateCcw size={18} /> REINICIAR
                                </button>
                                <button onClick={() => window.close()} style={{ ...pillBtn, background: currentPreset.accent, color: '#000' }}>
                                    CERRAR VENTANA
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* ── Countdown activo ── */
                        <motion.div
                            key="counting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', width: '100%', padding: '0 20px' }}
                        >
                            {/* Supra-label */}
                            <motion.p
                                initial={{ y: -12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                style={{ color: currentPreset.accent, fontWeight: 900, fontSize: 'clamp(0.6rem, 1.4vw, 0.9rem)', textTransform: 'uppercase', letterSpacing: '6px', marginBottom: '10px' }}
                            >
                                Oasis Community
                            </motion.p>

                            {/* Mensaje principal */}
                            <motion.h1
                                initial={{ y: -12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.06 }}
                                style={{ fontFamily: 'Moonrising', fontSize: 'clamp(1.4rem, 4vw, 3.8rem)', color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.7)', lineHeight: 1.2, maxWidth: '900px', margin: '0 auto clamp(20px,4vh,50px)', filter: (phase === 'paused' || phase === 'ready') ? 'blur(2px)' : 'none', transition: 'filter 0.3s' }}
                            >
                                {config.message}
                            </motion.h1>

                            {/* Dígitos gigantes */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(6px, 2vw, 28px)' }}>
                                {/* Minutos */}
                                <motion.div
                                    key={`m-${mStr}`}
                                    initial={{ opacity: 0.5, scale: 0.92 }}
                                    animate={{ opacity: 1,   scale: 1 }}
                                    transition={{ duration: 0.12 }}
                                    style={digitStyle(digitColor, phase)}
                                >
                                    {mStr}
                                </motion.div>

                                {/* Separador — parpadea con opacity */}
                                <motion.div
                                    animate={{ opacity: (phase === 'paused' || phase === 'ready') ? 0.3 : [1, 0, 1] }}
                                    transition={(phase === 'paused' || phase === 'ready')
                                        ? { duration: 0 }
                                        : { duration: 1, repeat: Infinity, ease: 'linear', times: [0, 0.5, 1] }
                                    }
                                    style={colonStyle(isLast10, currentPreset.accent, phase)}
                                >
                                    :
                                </motion.div>

                                {/* Segundos */}
                                <motion.div
                                    key={`s-${sStr}`}
                                    initial={{ opacity: 0.5, scale: 0.92 }}
                                    animate={{ opacity: 1,   scale: 1 }}
                                    transition={{ duration: 0.12 }}
                                    style={digitStyle(digitColor, phase)}
                                >
                                    {sStr}
                                </motion.div>
                            </div>

                            {/* Mensaje secundario */}
                            {config.subMessage && (
                                <motion.p
                                    initial={{ y: 12, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.12 }}
                                    style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.75rem, 1.8vw, 1.2rem)', marginTop: 'clamp(14px, 3vh, 32px)', letterSpacing: '3px', textTransform: 'uppercase', filter: (phase === 'paused' || phase === 'ready') ? 'blur(2px)' : 'none', transition: 'filter 0.3s' }}
                                >
                                    {config.subMessage}
                                </motion.p>
                            )}

                            {/* Badge LISTO / PAUSADO */}
                            <AnimatePresence>
                                {(phase === 'ready' || phase === 'paused') && (
                                    <motion.div
                                        key={phase}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        style={{ marginTop: '28px', background: phase === 'ready' ? `${currentPreset.accent}22` : 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: `1px solid ${phase === 'ready' ? currentPreset.accent : 'rgba(255,255,255,0.2)'}`, borderRadius: '50px', display: 'inline-block', padding: '10px 30px', color: phase === 'ready' ? currentPreset.accent : '#fff', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '3px' }}
                                    >
                                        {phase === 'ready' ? '▶  LISTO PARA INICIAR' : '⏸  PAUSADO'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controles inferiores */}
            {phase !== 'finished' && (
                <div style={{ position: 'absolute', bottom: '36px', left: 0, right: 0, zIndex: 4, display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    {phase === 'ready' ? (
                        <motion.button
                            onClick={handleStart}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            style={{ ...pillBtn, background: currentPreset.accent, color: '#000', padding: '16px 52px', fontSize: '0.9rem', border: 'none', boxShadow: `0 0 32px ${currentPreset.accent}66` }}
                        >
                            <Play size={18} /> INICIAR
                        </motion.button>
                    ) : (
                        <>
                            <button onClick={handleTogglePause} style={pillBtn}>
                                {phase === 'paused' ? <><Play size={16} /> REANUDAR</> : <><Pause size={16} /> PAUSAR</>}
                            </button>
                            <button onClick={handleReset} style={pillBtn}>
                                <RotateCcw size={16} /> REINICIAR
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Mini-anillo de progreso inferior izquierdo */}
            {phase !== 'finished' && (
                <div style={{ position: 'absolute', bottom: '28px', left: '36px', zIndex: 3, opacity: 0.45 }}>
                    <svg width="54" height="54" viewBox="0 0 54 54">
                        <circle cx="27" cy="27" r="21" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                        <circle
                            cx="27" cy="27" r="21" fill="none"
                            stroke={barColor} strokeWidth="4"
                            strokeDasharray={`${2 * Math.PI * 21}`}
                            strokeDashoffset={`${2 * Math.PI * 21 * (1 - progress / 100)}`}
                            strokeLinecap="round"
                            transform="rotate(-90 27 27)"
                            style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

// ─── Estilos helper ───────────────────────────────────────────────────────────
const btnStyle = {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '50%',
    width: '44px', height: '44px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', cursor: 'pointer',
};

const pillBtn = {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50px',
    padding: '12px 28px',
    color: '#fff', cursor: 'pointer',
    fontWeight: 900, fontSize: '0.78rem', letterSpacing: '2px',
    display: 'flex', alignItems: 'center', gap: '8px',
};

const digitStyle = (color, phase) => ({
    fontFamily: 'Moonrising',
    fontSize: 'clamp(5rem, 22vw, 20rem)',
    fontWeight: 900,
    color,
    lineHeight: 0.85,
    textShadow: color === '#EF4444' ? '0 0 80px rgba(239,68,68,0.55)' : '0 0 60px rgba(255,255,255,0.12)',
    filter: (phase === 'paused' || phase === 'ready') ? 'blur(3px)' : 'none',
    transition: 'filter 0.3s, color 0.3s, text-shadow 0.3s',
});

const colonStyle = (isLast10, accent, phase) => ({
    fontFamily: 'Moonrising',
    fontSize: 'clamp(3rem, 14vw, 14rem)',
    color: isLast10 ? '#EF4444' : accent,
    fontWeight: 900, lineHeight: 0.85,
    filter: (phase === 'paused' || phase === 'ready') ? 'blur(3px)' : 'none',
    transition: 'filter 0.3s, color 0.3s',
});

export default CountdownPage;
