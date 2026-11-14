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
    const [activeHubTab, setActiveHubTab] = useState('all'); // 'all' | 'announcements' | 'events'

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

            {/* 2. HUB UNIFICADO: NOVEDADES + INSCRIPCIÓN RÁPIDA */}
            <section id="novedades" style={{ padding: '36px 20px 44px', maxWidth: '1240px', margin: '0 auto', scrollMarginTop: '95px' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '26px',
                    textAlign: 'center'
                }}>
                    <span style={{
                        color: '#F59E0B',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        fontSize: '0.72rem',
                        marginBottom: '10px'
                    }}>
                        Actualidad & Eventos
                    </span>
                    <h2 style={{
                        fontFamily: 'Moonrising, sans-serif',
                        color: '#120C1F',
                        fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)',
                        lineHeight: '1.1',
                        margin: '0 0 18px 0'
                    }}>
                        Novedades <span style={{ color: '#F59E0B' }}>Oasis</span>
                    </h2>

                    {/* Pills de navegación rápida del Hub */}
                    <div style={{
                        display: 'inline-flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '5px',
                        borderRadius: '999px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(18, 12, 31, 0.08)',
                        boxShadow: '0 10px 28px -12px rgba(18, 12, 31, 0.14)'
                    }}>
                        {[
                            { id: 'all', label: 'Todo' },
                            { id: 'announcements', label: 'Novedades' },
                            { id: 'events', label: 'Inscripción Rápida' }
                        ].map(tab => {
                            const isActive = activeHubTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveHubTab(tab.id)}
                                    style={{
                                        border: 'none',
                                        borderRadius: '999px',
                                        padding: '8px 18px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.8px',
                                        textTransform: 'uppercase',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        backgroundColor: isActive ? '#120C1F' : 'transparent',
                                        color: isActive ? '#F59E0B' : '#5B556B',
                                        boxShadow: isActive ? '0 6px 16px -6px rgba(18, 12, 31, 0.45)' : 'none'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Contenido unificado sin espacios muertos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {(activeHubTab === 'all' || activeHubTab === 'announcements') && (
                        <div>
                            <Announcements items={announcements} loading={loadingAnnouncements} />
                        </div>
                    )}

                    {(activeHubTab === 'all' || activeHubTab === 'events') && (
                        <QuickEvents embedded />
                    )}
                </div>
            </section>

            {/* 3. CINTA SOCIAL (CON SETTINGS COMPARTIDOS) */}
            <SocialRibbon settings={settings} />

            {/* 4. SECCIÓN MIXTA: MAPA Y CALENDARIO */}
            <section id="visitanos" style={{ 
                scrollMarginTop: '100px',
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
                <div id="calendario" style={{ width: '100%', scrollMarginTop: '100px' }}>
                    <CalendarSection announcements={announcements} />
                </div>
            </section>

            {/* Espaciador final antes del Footer */}
            <div style={{ height: '80px' }} />
        </main>
    );
};

export default Home;