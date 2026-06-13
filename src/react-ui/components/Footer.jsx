"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import logoImg from '../../img/logos/LOGO1.png';
import apiClient from '../../api/client';

const Footer = () => {
    const { theme } = useTheme();
    
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 992 : false);
    const [socials, setSocials] = useState({
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com'
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 992);
        window.addEventListener('resize', handleResize);

        const fetchSettings = async () => {
            try {
                const { data } = await apiClient.get('/public/settings');
                const s = data || {};
                setSocials({
                    facebook: s.facebook_url || 'https://facebook.com',
                    instagram: s.instagram_url || 'https://instagram.com',
                    youtube: s.youtube_url || 'https://youtube.com'
                });
            } catch (error) {
                console.error("Error loading social settings", error);
            }
        };
        fetchSettings();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Paleta Oasis Premium
    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        textMuted: 'rgba(255, 255, 255, 0.65)',
        crystalBorder: 'rgba(255, 255, 255, 0.15)',
    };

    const styles = {
        footerWrapper: {
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box',
            minHeight: isMobile ? 'auto' : '650px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '30px 15px' : '120px 20px',
            overflow: 'hidden',
            backgroundImage: 'url("https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=3840&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: isMobile ? 'scroll' : 'fixed',
            backgroundColor: colors.midnight
        },
        overlay: {
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, #F8F9FC 0%, rgba(8, 5, 13, 0.3) 30%, rgba(8, 5, 13, 0.8) 100%)`,
            zIndex: 1
        },
        footerIsla: {
            position: 'relative',
            width: '100%',
            maxWidth: '1100px',
            background: 'rgba(18, 12, 31, 0.75)', 
            backdropFilter: 'blur(30px) saturate(160%)',
            WebkitBackdropFilter: 'blur(30px) saturate(160%)',
            borderRadius: isMobile ? '30px' : '50px',
            padding: isMobile ? '30px 20px' : '70px 60px 50px',
            borderTop: `1px solid ${colors.crystalBorder}`,
            borderLeft: `1px solid ${colors.crystalBorder}`,
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7)',
            zIndex: 10
        },
        logoText: {
            fontFamily: 'Moonrising, sans-serif',
            fontSize: '1.6rem',
            color: '#fff',
            letterSpacing: '3px',
        },
        columnTitle: {
            fontSize: isMobile ? '0.65rem' : '0.75rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: isMobile ? '0.15em' : '0.3em',
            color: colors.accent,
            marginBottom: '25px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
        },
        link: {
            textDecoration: 'none',
            color: colors.textMuted,
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            fontWeight: '600',
            display: 'block',
            marginBottom: '15px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
        },
        socialBtn: {
            width: '50px',
            height: '50px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${colors.crystalBorder}`,
            color: '#fff',
            fontSize: '1.3rem',
            textDecoration: 'none',
        }
    };

    return (
        <footer style={styles.footerWrapper}>
            <div style={styles.overlay} />

            <div style={styles.footerIsla} className="crystal-island">
                <div className="container-fluid">
                    <div className={isMobile ? "row g-3" : "row g-5"}>
                        <div className="col-lg-4 col-12 text-center text-lg-start">
                            <div className="d-flex align-items-center justify-content-center justify-content-lg-start mb-4">
                                <img src={logoImg} alt="OASIS" style={{ height: '40px', marginRight: '15px', filter: 'brightness(0) invert(1)' }} />
                                <span style={styles.logoText}>OASIS</span>
                            </div>
                            <p style={{ color: colors.textMuted, fontSize: '0.95rem', lineHeight: '1.9', maxWidth: '320px', margin: isMobile ? '0 auto' : '0' }}>
                                Un refugio de paz para la familia. Conectados por la fe y la esperanza.
                            </p>
                        </div>

                        <div className="col-lg-4 col-12" style={isMobile ? { marginTop: '20px' } : {}}>
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-around', gap: '10px' }}>
                                <div style={{ flex: 1, textAlign: 'center' }} className="text-lg-start">
                                    <h5 style={styles.columnTitle}>Explorar</h5>
                                    <Link to="/" className="f-link" style={styles.link}>Inicio</Link>
                                    <Link to="/about" className="f-link" style={styles.link}>Nosotros</Link>
                                    <Link to="/recursos" className="f-link" style={styles.link}>Recursos</Link>
                                </div>

                                <div style={{ flex: 1, textAlign: 'center' }} className="text-lg-start">
                                    <h5 style={styles.columnTitle}>Ministerio</h5>
                                    <Link to="/peticiones" className="f-link" style={styles.link}>Oración</Link>
                                    <Link to="/inscripciones" className="f-link" style={styles.link}>Eventos</Link>
                                    <Link to="/login" className="f-link" style={styles.link}>Admin</Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-12 text-center" style={isMobile ? { marginTop: '20px' } : {}}>
                            <h5 style={{...styles.columnTitle, textAlign: 'center'}}>Conexión Social</h5>
                            <div className="d-flex gap-3 justify-content-center mb-4">
                                <a href={socials.instagram} target="_blank" rel="noreferrer" style={styles.socialBtn} className="social-icon">
                                    <i className="bi bi-instagram"></i>
                                </a>
                                <a href={socials.facebook} target="_blank" rel="noreferrer" style={styles.socialBtn} className="social-icon">
                                    <i className="bi bi-facebook"></i>
                                </a>
                                <a href={socials.youtube} target="_blank" rel="noreferrer" style={styles.socialBtn} className="social-icon">
                                    <i className="bi bi-youtube"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: isMobile ? '30px' : '70px', paddingTop: isMobile ? '20px' : '30px', borderTop: `1px solid ${colors.crystalBorder}`, textAlign: 'center' }}>
                        <small style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                            © 2026 OASIS ECOSYSTEM
                        </small>
                    </div>
                </div>
            </div>

            <style>{`
                .f-link:hover { color: ${colors.accent} !important; }
                .social-icon:hover {
                    background-color: ${colors.accent} !important;
                    color: ${colors.midnight} !important;
                    transform: translateY(-8px) scale(1.1);
                }
                @font-face {
                    font-family: 'Moonrising';
                    src: url('/fonts/Moonrising.ttf');
                }
            `}</style>
        </footer>
    );
};

export default Footer;