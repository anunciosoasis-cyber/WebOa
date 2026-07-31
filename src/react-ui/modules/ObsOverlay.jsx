import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { supabase } from '../../api/supabaseClient'; // Make sure the path is correct
import BibleHymnOverlay from './ProyectorOver/components/BibleHymnOverlay';
import LowerThirdOverlay from './ProyectorOver/components/LowerThirdOverlay';
import CountdownOverlay from './ProyectorOver/components/CountdownOverlay';

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
            const data = payload.payload;
            if (data && data.target && data.target !== 'all' && data.target !== 'obs') {
                return;
            }
            setOverlayData(data);
            try { localStorage.setItem('obs_overlay_data', JSON.stringify(data)); } catch(e){}
        }).subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'request_sync',
                    payload: {}
                });
            }
        });

        return () => {
            supabase.removeChannel(channel);
            document.body.style.backgroundColor = '#0000FF';
            document.documentElement.style.backgroundColor = '#0000FF';
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
                {(overlayData.mode === 'bible' || overlayData.mode === 'himno') ? (
                    <BibleHymnOverlay key="bibleHymn" overlayData={overlayData} overlayStyle={overlayStyle} />
                ) : (overlayData.mode === 'preacher' || overlayData.mode === 'anuncio' || overlayData.mode === 'announcement') ? (
                    <LowerThirdOverlay key="preacher" overlayData={overlayData} overlayStyle={overlayStyle} />
                ) : overlayData.mode === 'countdown' ? (
                    <CountdownOverlay key="countdown" overlayData={overlayData} overlayStyle={overlayStyle} now={now} />
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
