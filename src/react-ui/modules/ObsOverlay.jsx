import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { supabase } from '../../api/supabaseClient'; // Make sure the path is correct

const ObsOverlay = () => {
    const [overlayData, setOverlayData] = useState({
        overlay_mode: 'hidden',
        overlay_title: '',
        overlay_content: '',
        overlay_bg_color: '#120c1f',
        overlay_text_color: '#ffffff',
        overlay_accent_color: '#f59e0b'
    });

    const isChroma = new URLSearchParams(window.location.search).get('chroma') === 'true';

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (overlayData.mode === 'countdown' || overlayData.mode === 'live_status') {
            const interval = setInterval(() => setNow(Date.now()), 1000);
            return () => clearInterval(interval);
        }
    }, [overlayData.mode, overlayData.targetTime]);

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
    
    const isOvertimeLive = overlayData.mode === 'live_status' && (overlayData.isOvertime || (overlayData.targetTime - now) < 0);

    useEffect(() => {
        // Carga inicial (via localStorage por si abren la ventana después de enviar)
        const initial = localStorage.getItem('obs_overlay_data');
        if (initial) {
            try { setOverlayData(JSON.parse(initial)); } catch(e){}
        }

        // Suscripción a Supabase Realtime (Broadcast directo, sin tablas)
        const channel = supabase.channel('obs_public_channel');
        
        // Limpiar estilos forzados de React/ThemeContext para garantizar transparencia en OBS
        document.body.style.backgroundColor = 'transparent';
        document.documentElement.style.backgroundColor = 'transparent';

        channel.on('broadcast', { event: 'update_overlay' }, (payload) => {
            setOverlayData(payload.payload);
            try { localStorage.setItem('obs_overlay_data', JSON.stringify(payload.payload)); } catch(e){}
        }).subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // Solicitar al admin el estado actual
                await channel.send({
                    type: 'broadcast',
                    event: 'request_sync',
                    payload: {}
                });
            }
        });

        // Event listener para control remoto desde el overlay
        const handleKeyDown = async (e) => {
            if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                await channel.send({
                    type: 'broadcast',
                    event: 'remote_keydown',
                    payload: { key: e.key }
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Variables dinámicas
    const overlayStyle = {
        '--bg-color': overlayData.bg_color,
        '--text-color': overlayData.text_color,
        '--accent-color': overlayData.accent_color,
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#0000FF',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Forzar fondo azul Croma en HTML y BODY para OBS */}
            <style>
                {`
                    html, body, #root {
                        background-color: #0000FF !important;
                        background: #0000FF !important;
                    }
                `}
            </style>
            
            <AnimatePresence mode="wait">
                {((overlayData.mode === 'bible' || overlayData.mode === 'himno') && overlayData.template === 'cinematic') ? (
                    <motion.div
                        key={overlayData.mode + overlayData.template + overlayData.title + overlayData.content}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
                        style={{
                            ...overlayStyle,
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            background: 'transparent',
                            padding: '40px 80px 80px 80px',
                            textAlign: 'center'
                        }}
                    >
                        <motion.p 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            style={{ 
                                color: 'var(--text-color)', 
                                fontSize: '2.5rem', 
                                fontWeight: 600, 
                                lineHeight: '1.4', 
                                fontFamily: 'Georgia, serif',
                                marginBottom: '20px',
                                textShadow: '2px 4px 12px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)'
                            }}
                        >
                            "{overlayData.content}"
                        </motion.p>
                        <motion.h2 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            style={{ 
                                color: 'var(--accent-color)', 
                                fontSize: '1.5rem', 
                                fontWeight: 900, 
                                textTransform: 'uppercase', 
                                letterSpacing: '5px',
                                fontFamily: 'Moonrising, sans-serif',
                                textShadow: '1px 2px 8px rgba(0,0,0,0.9)'
                            }}
                        >
                            {overlayData.title}
                        </motion.h2>
                    </motion.div>
                ) : ((overlayData.mode === 'bible' || overlayData.mode === 'himno') && overlayData.template === 'minimal') ? (
                    <motion.div
                        key={overlayData.mode + overlayData.template + overlayData.title + overlayData.content}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        style={{
                            ...overlayStyle,
                            position: 'absolute',
                            bottom: '50px',
                            left: '50px',
                            right: '50px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{
                            background: 'var(--bg-color)',
                            backdropFilter: 'blur(12px)',
                            borderBottom: '8px solid var(--accent-color)',
                            borderRadius: '16px',
                            padding: '30px 60px',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                            textAlign: 'center',
                            maxWidth: '1600px',
                            width: '100%'
                        }}>
                            <h2 style={{ color: 'var(--accent-color)', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '15px' }}>
                                {overlayData.title}
                            </h2>
                            <p style={{ color: 'var(--text-color)', fontSize: overlayData.mode === 'himno' ? '2.0rem' : '2.6rem', fontWeight: 600, margin: 0, fontFamily: 'Inter, sans-serif' }}>
                                {overlayData.content}
                            </p>
                        </div>
                    </motion.div>
                ) : ((overlayData.mode === 'bible' || overlayData.mode === 'himno') && overlayData.template === 'sidebar') ? (
                    <motion.div
                        key={overlayData.mode + overlayData.template + overlayData.title + overlayData.content}
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        style={{
                            ...overlayStyle,
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '500px',
                            background: 'rgba(18, 12, 31, 0.75)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderLeft: '6px solid var(--accent-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: '60px 50px',
                            boxShadow: '-20px 0 50px rgba(0,0,0,0.5)'
                        }}
                    >
                        <h2 style={{ color: 'var(--accent-color)', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '20px' }}>
                            {overlayData.title}
                        </h2>
                        <p style={{ color: 'var(--text-color)', fontSize: '1.8rem', fontWeight: 500, lineHeight: '1.6', margin: 0, fontFamily: 'Georgia, serif' }}>
                            {overlayData.content}
                        </p>
                    </motion.div>
                ) : (overlayData.mode === 'bible' || overlayData.mode === 'himno' || overlayData.mode === 'announcement') ? (
                    <motion.div 
                        key={overlayData.mode + overlayData.title + overlayData.content}
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        style={{
                            ...overlayStyle,
                            position: 'absolute',
                            bottom: '80px',
                            left: '80px',
                            maxWidth: '1200px',
                            backgroundColor: 'var(--bg-color)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            borderLeft: '12px solid var(--accent-color)',
                            padding: '35px 50px',
                            borderRadius: '0 24px 24px 0',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                            color: 'var(--text-color)'
                        }}
                    >
                        <h2 style={{ 
                            margin: '0 0 15px 0', 
                            fontSize: '1.6rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: '4px',
                            color: 'var(--accent-color)',
                            fontWeight: 800
                        }}>
                            {overlayData.title}
                        </h2>
                        <p style={{ 
                            margin: 0, 
                            fontSize: overlayData.mode === 'bible' ? '2.4rem' : '1.8rem', 
                            fontWeight: '600', 
                            lineHeight: '1.4',
                            fontFamily: overlayData.mode === 'bible' ? 'Georgia, serif' : 'inherit',
                            whiteSpace: 'pre-line'
                        }}>
                            {overlayData.content}
                        </p>
                    </motion.div>
                ) : overlayData.mode === 'lower_third' ? (
                    <motion.div
                        key="lower_third"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                            ...overlayStyle,
                            position: 'absolute',
                            bottom: '100px',
                            left: '100px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Contenedor del Nombre */}
                        <motion.div 
                            variants={{
                                hidden: { width: 0, opacity: 0 },
                                visible: { width: 'auto', opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                                exit: { width: 0, opacity: 0, transition: { duration: 0.4, ease: "easeInOut", delay: 0.2 } }
                            }}
                            style={{ 
                                background: 'var(--bg-color)', 
                                padding: '18px 50px', 
                                borderLeft: '10px solid var(--accent-color)',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                boxShadow: '20px 20px 40px rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(10px)',
                                borderTopRightRadius: '8px'
                            }}
                        >
                            <motion.h1 
                                variants={{
                                    hidden: { x: -50, opacity: 0 },
                                    visible: { x: 0, opacity: 1, transition: { delay: 0.3, duration: 0.5 } },
                                    exit: { x: -50, opacity: 0, transition: { duration: 0.2 } }
                                }}
                                style={{ margin: 0, color: 'var(--text-color)', fontSize: '3.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', fontFamily: 'Moonrising, sans-serif' }}
                            >
                                {overlayData.title}
                            </motion.h1>
                        </motion.div>
                        
                        {/* Contenedor del Tema/Cargo */}
                        <motion.div
                            variants={{
                                hidden: { y: -20, opacity: 0 },
                                visible: { y: 0, opacity: 1, transition: { delay: 0.6, type: 'spring', stiffness: 100 } },
                                exit: { y: -20, opacity: 0, transition: { duration: 0.2 } }
                            }}
                            style={{
                                background: 'var(--accent-color)',
                                padding: '10px 50px',
                                alignSelf: 'flex-start',
                                borderBottomRightRadius: '16px',
                                boxShadow: '10px 10px 20px rgba(0,0,0,0.3)',
                                minWidth: '400px'
                            }}
                        >
                            <motion.h2 
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { delay: 0.8 } },
                                    exit: { opacity: 0 }
                                }}
                                style={{ margin: 0, color: '#000', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}
                            >
                                {overlayData.content}
                            </motion.h2>
                        </motion.div>
                    </motion.div>
                ) : overlayData.mode === 'countdown' ? (
                    <motion.div
                        key={`countdown-${overlayData.template}`}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
                        style={{
                            ...overlayStyle,
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            pointerEvents: 'none',
                            alignItems: overlayData.template === 'corner_elegant' ? 'flex-end' : (overlayData.template === 'pill_bottom' ? 'flex-end' : 'center'),
                            justifyContent: overlayData.template === 'corner_elegant' ? 'flex-end' : 'center',
                            padding: overlayData.template === 'corner_elegant' ? '60px' : (overlayData.template === 'pill_bottom' ? '80px' : '0')
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            flexDirection: overlayData.template === 'pill_bottom' ? 'row' : 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: overlayData.template === 'pill_bottom' ? '40px' : '0',
                            background: overlayData.template === 'corner_elegant' ? 'rgba(18, 12, 31, 0.85)' : 'rgba(18, 12, 31, 0.65)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: `1px solid rgba(255,255,255,0.1)`,
                            borderBottom: overlayData.template === 'pill_bottom' ? `6px solid ${overlayData.accent_color}` : (overlayData.template === 'corner_elegant' ? `none` : `8px solid ${overlayData.accent_color}`),
                            borderLeft: overlayData.template === 'corner_elegant' ? `6px solid ${overlayData.accent_color}` : 'none',
                            borderRadius: overlayData.template === 'pill_bottom' ? '100px' : '30px',
                            padding: overlayData.template === 'corner_elegant' ? '30px 45px' : (overlayData.template === 'pill_bottom' ? '20px 60px' : '70px 120px'),
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                        }}>
                            <h2 style={{ 
                                color: 'var(--accent-color)', 
                                fontSize: overlayData.template === 'corner_elegant' ? '1.4rem' : (overlayData.template === 'pill_bottom' ? '2.2rem' : '3rem'), 
                                fontWeight: 900, 
                                textTransform: 'uppercase', 
                                letterSpacing: '6px', 
                                margin: overlayData.template === 'pill_bottom' ? '0' : '0 0 15px 0'
                            }}>
                                {overlayData.title}
                            </h2>
                            <div style={{ 
                                fontSize: overlayData.template === 'corner_elegant' ? '5rem' : (overlayData.template === 'pill_bottom' ? '6rem' : '12rem'), 
                                fontWeight: 900, 
                                color: '#fff', 
                                fontFamily: 'Moonrising, sans-serif', 
                                lineHeight: 1 
                            }}>
                                {getFormattedRemaining()}
                            </div>
                        </div>
                    </motion.div>
                ) : overlayData.mode === 'live_status' ? (
                    <motion.div
                        key="live_status"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            ...overlayStyle,
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isChroma ? 'transparent' : 'url("https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=2070&auto=format&fit=crop") center/cover'
                        }}
                    >
                        {!isChroma && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }}></div>}
                        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                            <h2 style={{ fontFamily: 'Moonrising, sans-serif', fontSize: '3.5rem', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.8)', marginBottom: '30px' }}>
                                {overlayData.title}
                            </h2>
                            <div style={{ fontSize: '20vw', fontWeight: 900, color: isOvertimeLive ? '#EF4444' : '#fff', fontFamily: 'Moonrising, sans-serif', lineHeight: 1, textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
                                {getFormattedRemaining()}
                            </div>
                            <p style={{ color: '#fff', fontSize: '2vw', letterSpacing: '0.2em', fontWeight: 'bold', marginTop: '40px', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                                {isOvertimeLive ? 'TIEMPO EXCEDIDO' : 'TIEMPO RESTANTE'}
                            </p>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default ObsOverlay;
