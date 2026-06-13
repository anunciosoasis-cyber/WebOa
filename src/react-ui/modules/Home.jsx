import React, { useEffect, useState } from 'react';
import { useTheme } from '../ThemeContext';
import Hero from '../components/Hero';
import DynamicIsland from '../components/DynamicIsland';
import Announcements from '../components/Announcements';
import MapSection from '../components/MapSection';
import CalendarSection from '../components/CalendarSection';
import SocialRibbon from '../components/ComunidadInvita'; // Asegúrate de usar la versión Ribbon compacta
import QuickEvents from '../components/QuickEvents';
import apiClient from '../../api/client';
import useAppMode from '../../hooks/useAppMode';

const Home = () => {
    const { theme } = useTheme();
    const { isMobile } = useAppMode();
    const [settings, setSettings] = useState({
        stream_is_live: false,
        youtube_live_video_id: '',
        youtube_playlist_id: ''
    });

    useEffect(() => {
        apiClient.get('/settings').then(({ data }) => {
            const settingsObj = Array.isArray(data) ?
                data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) :
                data;
            setSettings(prev => ({ ...prev, ...settingsObj }));
        }).catch(err => console.error(err));
    }, []);

    return (
        <main style={{ backgroundColor: '#F8F9FC', overflowX: 'hidden' }}>
            
            {/* 1. HERO PRINCIPAL */}
            <Hero />

            {/* ISLA DINÁMICA DE ACCESOS RÁPIDOS */}
            <DynamicIsland settings={settings} />

            {/* 2. NOVEDADES (ANUNCIOS) */}
            <section id="novedades" style={{ padding: '30px 20px', maxWidth: '1240px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', textAlign: 'center' }}>
                    <span style={{ 
                        color: '#F59E0B', 
                        fontWeight: '900', 
                        textTransform: 'uppercase', 
                        letterSpacing: '4px', 
                        fontSize: '0.7rem', 
                        marginBottom: '15px' 
                    }}>
                        Actualidad
                    </span>
                    <h2 style={{ 
                        fontFamily: 'Moonrising, sans-serif', 
                        color: '#120C1F', 
                        fontSize: 'clamp(2rem, 5vw, 3rem)', 
                        lineHeight: '1.1',
                        margin: 0 
                    }}>
                        Novedades <span style={{ color: '#F59E0B' }}>Oasis</span>
                    </h2>
                    <div style={{ height: '4px', width: '40px', backgroundColor: '#F59E0B', marginTop: '20px', borderRadius: '10px', opacity: 0.3 }} />
                </div>

                {/* Carrusel de Anuncios Compacto */}
                <Announcements />
            </section>

            {/* SECCIÓN DE EVENTOS (INSCRIPCIÓN RÁPIDA) */}
            <QuickEvents />

            {/* 3. CINTA SOCIAL (REEMPLAZA COMUNIDAD INVITA PARA MÁS AGILIDAD) */}
            <SocialRibbon />

            {/* 4. SECCIÓN MIXTA: MAPA Y CALENDARIO (ÚNICA VEZ) */}
            <section style={{ 
                maxWidth: '1240px', 
                margin: '80px auto', 
                padding: '0 20px', 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '40px',
                alignItems: 'stretch' // Hace que ambos tengan la misma altura
            }}>
                <div style={{ width: '100%' }}>
                    <MapSection />
                </div>
                <div style={{ width: '100%' }}>
                    <CalendarSection />
                </div>
            </section>

            {/* Espaciador final antes del Footer */}
            <div style={{ height: '100px' }} />
        </main>
    );
};

export default Home;