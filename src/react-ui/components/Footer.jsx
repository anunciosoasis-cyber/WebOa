"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowUp,
    Clock,
    ExternalLink,
    HeartHandshake,
    MapPin,
    Tv
} from 'lucide-react';
import logoImg from '../../img/logos/LOGO1.png';
import oasisCommunityImg from '../../img/comunidad-oasis.jpg';
import apiClient from '../../api/client';

const Footer = () => {
    const [socials, setSocials] = useState({
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com'
    });

    useEffect(() => {
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
                console.error('Error loading social settings', error);
            }
        };
        fetchSettings();
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        textMain: '#FFFFFF',
        textMuted: 'rgba(255, 255, 255, 0.72)',
        textSoft: 'rgba(255, 255, 255, 0.52)',
        border: 'rgba(255, 255, 255, 0.12)'
    };

    return (
        <footer className="oasis-footer-wrapper">
            {/* Background Community Photo (same as Login) */}
            <div className="oasis-footer-bg" aria-hidden="true">
                <img
                    src={oasisCommunityImg}
                    alt=""
                    className="oasis-footer-bg-img"
                />
                <div className="oasis-footer-overlay" />
            </div>

            {/* Main Glass Container */}
            <div className="oasis-footer-container">
                <div className="oasis-footer-card">
                    {/* Subtle Top Gold Rim Accent */}
                    <div className="oasis-footer-top-rim" aria-hidden="true" />

                    <div className="oasis-footer-grid">
                        {/* Column 1: Brand & Socials */}
                        <div className="oasis-footer-brand">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                                <img
                                    src={logoImg}
                                    alt="OASIS"
                                    style={{ height: '42px', filter: 'brightness(0) invert(1)' }}
                                />
                                <div>
                                    <div
                                        style={{
                                            fontFamily: 'Moonrising, sans-serif',
                                            fontSize: '1.55rem',
                                            color: colors.textMain,
                                            letterSpacing: '3px',
                                            lineHeight: 1
                                        }}
                                    >
                                        OASIS
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            letterSpacing: '2px',
                                            textTransform: 'uppercase',
                                            color: colors.accent,
                                            marginTop: '4px'
                                        }}
                                    >
                                        Iglesia Adventista
                                    </div>
                                </div>
                            </div>

                            <p
                                style={{
                                    color: colors.textMuted,
                                    fontSize: '0.92rem',
                                    lineHeight: 1.7,
                                    maxWidth: '300px',
                                    margin: '0 0 22px 0'
                                }}
                            >
                                Un refugio de paz para la familia. Conectados por la fe, la esperanza y el servicio a nuestra comunidad.
                            </p>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <a
                                    href={socials.instagram}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Instagram"
                                    className="oasis-social-btn"
                                >
                                    <i className="bi bi-instagram" />
                                </a>
                                <a
                                    href={socials.facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Facebook"
                                    className="oasis-social-btn"
                                >
                                    <i className="bi bi-facebook" />
                                </a>
                                <a
                                    href={socials.youtube}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="YouTube"
                                    className="oasis-social-btn"
                                >
                                    <i className="bi bi-youtube" />
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Explorar */}
                        <div>
                            <h5 className="oasis-footer-heading">Iglesia</h5>
                            <nav className="oasis-footer-nav" aria-label="Navegación iglesia">
                                <Link to="/" className="oasis-footer-link">Inicio</Link>
                                <Link to="/about" className="oasis-footer-link">Quiénes Somos</Link>
                                <Link to="/tv" className="oasis-footer-link">
                                    <Tv size={14} style={{ color: colors.accent }} /> Oasis TV
                                </Link>
                                <Link to="/recursos" className="oasis-footer-link">Biblioteca de Recursos</Link>
                            </nav>
                        </div>

                        {/* Column 3: Ministerios & Participación */}
                        <div>
                            <h5 className="oasis-footer-heading">Participa</h5>
                            <nav className="oasis-footer-nav" aria-label="Participación y ministerios">
                                <Link to="/peticiones" className="oasis-footer-link">
                                    <HeartHandshake size={14} style={{ color: colors.accent }} /> Peticiones de Oración
                                </Link>
                                <Link to="/inscripciones" className="oasis-footer-link">Eventos e Inscripciones</Link>
                                <a
                                    href="https://alfoliadventista.org/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="oasis-footer-link"
                                >
                                    Diezmos y Ofrendas <ExternalLink size={12} style={{ opacity: 0.7 }} />
                                </a>
                                <Link to="/login" className="oasis-footer-link">Acceso Miembros</Link>
                            </nav>
                        </div>

                        {/* Column 4: Horarios & Ubicación */}
                        <div>
                            <h5 className="oasis-footer-heading">Visítanos</h5>
                            <div className="oasis-schedule-box">
                                <div className="oasis-schedule-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMain, fontWeight: 700, fontSize: '0.84rem' }}>
                                        <Clock size={14} color={colors.accent} /> Sábados
                                    </div>
                                    <span style={{ color: colors.textMuted, fontSize: '0.8rem' }}>9:30 AM · Culto Central</span>
                                </div>

                                <div className="oasis-schedule-divider" />

                                <div className="oasis-schedule-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMain, fontWeight: 700, fontSize: '0.84rem' }}>
                                        <Clock size={14} color={colors.accent} /> Miércoles
                                    </div>
                                    <span style={{ color: colors.textMuted, fontSize: '0.8rem' }}>7:30 PM · Noche de Oración</span>
                                </div>

                                <div className="oasis-schedule-divider" />

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '0.82rem', paddingTop: '2px' }}>
                                    <MapPin size={15} color={colors.accent} style={{ flexShrink: 0 }} />
                                    <span>Medellín, Antioquia · Colombia</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Legal & Back-to-top Bar */}
                    <div className="oasis-footer-bottom">
                        <small className="oasis-footer-copy">
                            © {new Date().getFullYear()} Iglesia Adventista Oasis · Medellín. Todos los derechos reservados.
                        </small>

                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="oasis-back-top"
                            aria-label="Volver arriba"
                        >
                            Subir <ArrowUp size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .oasis-footer-wrapper {
                    position: relative;
                    width: 100%;
                    padding: 96px 20px 56px;
                    overflow: hidden;
                    background-color: ${colors.midnight};
                    isolation: isolate;
                }
                .oasis-footer-bg {
                    position: absolute;
                    inset: 0;
                    z-index: -1;
                    pointer-events: none;
                    overflow: hidden;
                }
                .oasis-footer-bg-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center 45%;
                    filter: saturate(1.06) contrast(1.06) brightness(0.72) sepia(0.1);
                    transform: scale(1.04);
                }
                .oasis-footer-overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(to bottom, #F8F9FC 0%, rgba(18, 12, 31, 0.35) 26%, rgba(8, 5, 13, 0.88) 100%),
                        radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.08) 0%, transparent 65%);
                }
                .oasis-footer-container {
                    position: relative;
                    z-index: 2;
                    max-width: 1180px;
                    margin: 0 auto;
                }
                .oasis-footer-card {
                    position: relative;
                    background: rgba(14, 9, 24, 0.8);
                    backdrop-filter: blur(24px) saturate(150%);
                    -webkit-backdrop-filter: blur(24px) saturate(150%);
                    border-radius: 34px;
                    padding: 48px 44px 32px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 36px 80px -20px rgba(0, 0, 0, 0.72);
                    overflow: hidden;
                }
                .oasis-footer-top-rim {
                    position: absolute;
                    top: 0;
                    left: 15%;
                    right: 15%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.65), transparent);
                    pointer-events: none;
                }
                .oasis-footer-grid {
                    display: grid;
                    grid-template-columns: 1.25fr 0.85fr 0.95fr 1.15fr;
                    gap: 36px;
                    align-items: start;
                }
                .oasis-footer-heading {
                    font-size: 0.72rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.24em;
                    color: ${colors.accent};
                    margin: 0 0 18px 0;
                }
                .oasis-footer-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .oasis-footer-link {
                    text-decoration: none;
                    color: ${colors.textMuted};
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.22s ease, transform 0.22s ease;
                    width: fit-content;
                }
                .oasis-footer-link:hover {
                    color: ${colors.accent};
                    transform: translateX(4px);
                }
                .oasis-social-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #FFFFFF;
                    font-size: 1.15rem;
                    text-decoration: none;
                    transition: all 0.25s ease;
                }
                .oasis-social-btn:hover {
                    background: ${colors.accent};
                    border-color: ${colors.accent};
                    color: ${colors.midnight};
                    transform: translateY(-4px);
                    box-shadow: 0 10px 22px rgba(245, 158, 11, 0.35);
                }
                .oasis-schedule-box {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 18px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 11px;
                }
                .oasis-schedule-row {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .oasis-schedule-divider {
                    height: 1px;
                    background: rgba(255, 255, 255, 0.08);
                }
                .oasis-footer-bottom {
                    margin-top: 38px;
                    padding-top: 22px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                }
                .oasis-footer-copy {
                    color: ${colors.textSoft};
                    font-weight: 600;
                    letter-spacing: 0.6px;
                    font-size: 0.78rem;
                }
                .oasis-back-top {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 7px 14px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.07);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    color: ${colors.textMain};
                    font-size: 0.76rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.22s ease;
                }
                .oasis-back-top:hover {
                    background: ${colors.accent};
                    border-color: ${colors.accent};
                    color: ${colors.midnight};
                    transform: translateY(-2px);
                }

                @media (max-width: 992px) {
                    .oasis-footer-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 28px;
                    }
                    .oasis-footer-card {
                        padding: 36px 28px 26px;
                    }
                }
                @media (max-width: 600px) {
                    .oasis-footer-wrapper {
                        padding: 64px 14px 36px;
                    }
                    .oasis-footer-grid {
                        grid-template-columns: 1fr;
                        gap: 26px;
                    }
                    .oasis-footer-card {
                        padding: 30px 20px 24px;
                        border-radius: 26px;
                    }
                    .oasis-footer-bottom {
                        justify-content: center;
                        text-align: center;
                    }
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
