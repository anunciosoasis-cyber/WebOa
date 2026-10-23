import React, { useEffect, useState } from 'react';
import { useTheme } from '../ThemeContext';
import Hero from '../components/Hero';
import DynamicIsland from '../components/DynamicIsland';
import Announcements from '../../modules/announcements/public/AnnouncementsCarousel';
import MapSection from '../components/MapSection';
import CalendarSection from '../components/CalendarSection';
import SocialRibbon from '../components/ComunidadInvita';
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
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

    useEffect(() => {
        // Carga centralizada y eficiente de datos iniciales en paralelo
        apiClient.get('/public/settings').then(({ data }) => {
            const settingsObj = Array.isArray(data) ?
                data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) :
                data;
            setSettings(prev => ({ ...prev, ...settingsObj }));
        }).catch(err => console.error('Settings error:', err));

        apiClient.get('/announcements').then(({ data }) => {
            const list = Array.isArray(data) ? data : (data?.data || []);
            setAnnouncements(list);
        }).catch(err => console.error('Announcements error:', err)).finally(() => {
            setLoadingAnnouncements(false);
        });
    }, []);

    return (
        <main style={{ backgroundColor: '#F8F9FC', overflowX: 'hidden' }}>
            
            {/* 1. HERO PRINCIPAL */}
            <Hero settings={settings} />

            {/* ISLA DINÁMICA DE ACCESOS RÁPIDOS */}
            <DynamicIsland settings={settings} />

            {/* 2. NOVEDADES (CARRUSEL DE ANUNCIOS FLUIDO) */}
            <section id="novedades" style={{ padding: '40px 20px', maxWidth: '1240px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', textAlign: 'center' }}>
                    <span style={{ 
                        color: '#F59E0B', 
                        fontWeight: '900', 
                        textTransform: 'uppercase', 
                        letterSpacing: '4px', 
                        fontSize: '0.75rem', 
                        marginBottom: '12px' 
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
                    <div style={{ height: '4px', width: '40px', backgroundColor: '#F59E0B', marginTop: '16px', borderRadius: '10px', opacity: 0.3 }} />
                </div>

                {/* Carrusel de Anuncios Horizontal y Optimizado */}
                <Announcements items={announcements} loading={loadingAnnouncements} />
            </section>

            {/* SECCIÓN DE EVENTOS (INSCRIPCIÓN RÁPIDA) */}
            <QuickEvents />

            {/* 3. CINTA SOCIAL (CON SETTINGS COMPARTIDOS) */}
            <SocialRibbon settings={settings} />

            {/* 4. SECCIÓN MIXTA: MAPA Y CALENDARIO */}
            <section style={{ 
                maxWidth: '1240px', 
                margin: '80px auto', 
                padding: '0 20px', 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '40px',
                alignItems: 'stretch'
            }}>
                <div style={{ width: '100%' }}>
                    <MapSection />
                </div>
                <div style={{ width: '100%' }}>
                    <CalendarSection announcements={announcements} />
                </div>
            </section>

            {/* Espaciador final antes del Footer */}
            <div style={{ height: '80px' }} />
        </main>
    );
};

export default Home;