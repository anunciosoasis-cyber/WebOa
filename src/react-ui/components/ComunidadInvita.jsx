"use client";

import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapSection from './MapSection';
import CalendarSection from './CalendarSection';

const SocialRibbon = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [socials, setSocials] = useState({
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com'
    });

    useEffect(() => {
        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        const endpoint = apiBase.endsWith('/api') ? `${apiBase}/public/settings` : `${apiBase}/api/public/settings`;

        fetch(endpoint)
            .then(res => res.json())
            .then(data => {
                setSocials({
                    facebook: data.facebook_url || 'https://facebook.com',
                    instagram: data.instagram_url || 'https://instagram.com',
                    youtube: data.youtube_url || 'https://youtube.com',
                    twitter: data.twitter_url || 'https://twitter.com'
                });
            }).catch(e => console.error('Social links load error:', e));
    }, []);

    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B'
    };

    const dynamicMessages = [
        { title: "Hogares en Paz", text: "Recursos para edificar familias bajo el amor de Dios.", tag: "Familia" },
        { title: "Juventud Viva", text: "Un espacio dinámico para los que transforman el mundo.", tag: "Liderazgo" },
        { title: "Comunidad Oasis", text: "No camines solo. Únete a nuestra familia digital.", tag: "Conexión" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % dynamicMessages.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [dynamicMessages.length]);

    // CONFIGURACIÓN DE ESCALA SENIOR (Bento Grid 3:1)
    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center', // Alineación horizontal para ahorrar altura
        gap: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textDecoration: 'none',
        position: 'relative'
    };

    return (
        <>
            {/* Ribbon social y bienvenida */}
            <section style={{ 
                width: '100vw', position: 'relative', left: '50%', right: '50%', 
                marginLeft: '-50vw', marginRight: '-50vw', overflow: 'hidden',
                backgroundColor: colors.midnight, minHeight: '260px', // Altura compacta
                display: 'flex', alignItems: 'center', padding: '30px 0'
            }}>
                {/* FONDO HD CON RENDERIZADO NÍTIDO */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'url("https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=90&w=2500&auto=format&fit=crop")',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    filter: 'brightness(0.2) saturate(0.8)', // Menos blur para evitar distorsión
                    zIndex: 0
                }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10, padding: '0 20px' }}>
                    <div className="social-grid-container">
                        {/* INFO DINÁMICA (Izquierda) */}
                        <div className="info-container" style={{ paddingRight: '20px' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={messageIndex}
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.5 }}
                                >
                                    <span style={{ color: colors.accent, fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                        {dynamicMessages[messageIndex].tag}
                                    </span>
                                    <h2 style={{ fontFamily: 'Moonrising, sans-serif', color: '#fff', fontSize: '1.8rem', margin: '5px 0' }}>
                                        {dynamicMessages[messageIndex].title}
                                    </h2>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '15px' }}>
                                        {dynamicMessages[messageIndex].text}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* CONTENEDOR TARJETAS RRSS */}
                        <div className="social-cards-container" style={{ display: 'contents' }}>
                            {[
                                { icon: "Youtube", color: "#FF0000", label: "YouTube", sub: "Transmisiones", link: socials.youtube },
                                { icon: "Facebook", color: "#4267B2", label: "Facebook", sub: "Comunidad", link: socials.facebook },
                                { icon: "Instagram", color: "#E1306C", label: "Instagram", sub: "Dosis de Fe", link: socials.instagram }
                            ].map((item, idx) => {
                                const Icon = LucideIcons[item.icon];
                                return (
                                    <a key={idx} href={item.link} target="_blank" rel="noreferrer" style={cardStyle} className="social-pill-card">
                                        <div style={{ 
                                            background: `${item.color}15`, padding: '10px', 
                                            borderRadius: '14px', color: item.color, display: 'flex' 
                                        }} className="social-icon-wrapper">
                                            <Icon size={20} strokeWidth={2.5} />
                                        </div>
                                        <div style={{ flex: 1 }} className="social-text">
                                            <h4 style={{ color: '#fff', fontWeight: '800', margin: 0, fontSize: '0.85rem' }}>{item.label}</h4>
                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', margin: 0 }}>{item.sub}</p>
                                        </div>
                                        <LucideIcons.ArrowUpRight size={14} className="arrow-small social-arrow" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <style>{`
                    .social-pill-card:hover {
                        background: rgba(255, 255, 255, 0.08) !important;
                        transform: translateY(-5px);
                        border-color: rgba(255, 255, 255, 0.2) !important;
                    }
                    .arrow-small { color: ${colors.accent}; opacity: 0; transition: 0.3s; }
                    .social-pill-card:hover .arrow-small { opacity: 1; transform: translate(2px, -2px); }

                    .social-grid-container {
                        display: grid;
                        grid-template-columns: 1.2fr 1fr 1fr 1fr;
                        gap: 15px;
                        align-items: center;
                    }

                    @media (max-width: 1024px) {
                        .social-grid-container { grid-template-columns: 1fr 1fr !important; }
                    }
                    @media (max-width: 768px) {
                        .social-grid-container { 
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: center;
                            text-align: center;
                        }
                        .info-container { padding-right: 0 !important; }
                        section { padding: 40px 0 !important; }
                        
                        .social-cards-container {
                            display: flex !important;
                            flex-direction: row;
                            justify-content: center;
                            gap: 15px;
                            margin-top: 10px;
                        }
                        
                        .social-pill-card {
                            padding: 15px !important;
                            justify-content: center;
                            width: auto;
                        }
                        
                        .social-text, .social-arrow {
                            display: none !important;
                        }
                        
                        .social-icon-wrapper {
                            padding: 12px !important;
                        }
                    }
                `}</style>
            </section>

            {/* Título destacado para Mapa y Calendario */}
            <div style={{ maxWidth: '1100px', margin: '28px auto 12px auto', padding: '0 16px' }}>
                <h2 style={{
                    fontFamily: 'Moonrising, sans-serif',
                    color: '#1A2F23',
                    fontWeight: 900,
                    fontSize: '2.1rem',
                    marginBottom: '10px',
                    letterSpacing: '1px',
                    textAlign: 'center',
                    textShadow: '0 2px 8px #f8fafc88'
                }}>
                    ¡Visítanos y participa!
                </h2>
                <div style={{ height: '4px', width: '60px', backgroundColor: '#F59E0B', margin: '0 auto', borderRadius: '10px' }} />
            </div>
        </>
    );
};

export default SocialRibbon;