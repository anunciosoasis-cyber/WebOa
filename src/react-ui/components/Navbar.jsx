"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../img/logos/LOGO1.png';

const Navbar = () => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Rutas que SIEMPRE deben tener la Navbar oscura/cristal (fondos claros)
    const darkNavRoutes = ['/login', '/peticiones', '/about', '/recursos', '/inscripciones'];
    const isForceDark = darkNavRoutes.includes(location.pathname);

    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        crystalBorder: 'rgba(255, 255, 255, 0.15)',
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { to: '/', label: 'Inicio' },
        { to: '/about', label: 'Nosotros' },
        { to: '/recursos', label: 'Recursos' },
        { to: '/peticiones', label: 'Peticiones' },
        { to: '/inscripciones', label: 'Eventos' }
    ];

    // Lógica de color dinámica
    // Si estoy en una ruta de contenido claro O si hice scroll -> Navbar Oscura
    const shouldBeDark = isForceDark || scrolled;

    // Color de texto dinámico basado en el fondo de la navbar
    // El usuario prefiere siempre letras blancas para mantener la consistencia con el diseño Hero
    const getNavTextColor = () => {
        if (shouldBeDark) return 'rgba(255,255,255,0.9)';
        return '#FFF'; 
    };

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000,
            display: 'flex', justifyContent: 'center',
            padding: '20px', 
            pointerEvents: 'none'
        }}>
            <motion.nav 
                initial={false}
                animate={{
                    width: '90%',
                    maxWidth: '1100px',
                    borderRadius: '100px',
                    height: shouldBeDark ? '70px' : '80px',
                    backgroundColor: shouldBeDark ? 'rgba(18, 12, 31, 0.9)' : 'rgba(18, 12, 31, 0.4)',
                    backdropFilter: 'blur(20px) saturate(160%)',
                    border: `1px solid ${colors.crystalBorder}`,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    pointerEvents: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 50px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* BRANDING */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <img 
                        src={logoImg} 
                        alt="OASIS" 
                        style={{ 
                            height: shouldBeDark ? '30px' : '38px', 
                            filter: 'brightness(0) invert(1)',
                            transition: 'all 0.4s ease' 
                        }} 
                    />
                    <span style={{
                        fontFamily: 'Moonrising, sans-serif',
                        fontSize: shouldBeDark ? '1.1rem' : '1.3rem',
                        color: getNavTextColor(),
                        letterSpacing: '3px',
                        transition: 'all 0.4s ease'
                    }}>OASIS</span>
                </Link>

                {/* DESKTOP MENU */}
                <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    {navLinks.map((link) => (
                        <Link 
                            key={link.to} 
                            to={link.to} 
                            className="nav-link-v3"
                            style={{
                                textDecoration: 'none',
                                color: getNavTextColor(),
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.25em',
                                position: 'relative',
                                transition: 'color 0.3s ease'
                            }}
                        >
                            {link.label}
                            {location.pathname === link.to && (
                                <motion.div layoutId="activeNav" className="active-nav-line" style={{ backgroundColor: colors.accent }} />
                            )}
                        </Link>
                    ))}
                    
                    <Link to="/login" className="admin-btn-crystal" style={{
                        padding: '10px 28px',
                        backgroundColor: shouldBeDark ? colors.accent : 'rgba(255,255,255,0.1)',
                        color: shouldBeDark ? colors.midnight : '#FFF',
                        border: shouldBeDark ? 'none' : '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '50px',
                        fontSize: '0.7rem',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        Admin
                    </Link>
                </div>

                {/* MOBILE TRIGGER */}
                <button 
                    className="mobile-only"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <div style={{ width: '22px', height: '2px', backgroundColor: '#FFF', marginBottom: '6px' }} />
                    <div style={{ width: '16px', height: '2px', backgroundColor: colors.accent, marginLeft: '8px' }} />
                </button>
            </motion.nav>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            position: 'absolute', top: '100px', left: '20px', right: '20px',
                            backgroundColor: 'rgba(8, 5, 13, 0.95)', borderRadius: '30px',
                            padding: '40px', boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
                            display: 'flex', flexDirection: 'column', gap: '25px',
                            pointerEvents: 'auto', border: `1px solid ${colors.crystalBorder}`,
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        {navLinks.map((link) => (
                            <Link key={link.to} to={link.to} style={{
                                color: '#FFF', textDecoration: 'none', fontWeight: '900',
                                fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '3px',
                                textAlign: 'center'
                            }}>
                                {link.label}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .nav-link-v3:hover { color: ${colors.accent} !important; }
                .active-nav-line {
                    position: absolute; bottom: -8px; left: 0; right: 0;
                    height: 2px; border-radius: 2px;
                }
                .admin-btn-crystal:hover {
                    background-color: #FFF !important;
                    color: ${colors.midnight} !important;
                    transform: translateY(-2px);
                }
                @media (max-width: 992px) {
                    .hidden-mobile { display: none !important; }
                    nav { padding: 0 25px !important; }
                }
                @media (min-width: 993px) {
                    .mobile-only { display: none !important; }
                }
            `}</style>
        </header>
    );
};

export default Navbar;