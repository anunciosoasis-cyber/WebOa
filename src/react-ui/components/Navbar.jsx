"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Users, MapPin, CalendarDays, HeartHandshake, ClipboardList, Wallet, PlayCircle, BookOpen } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../img/logos/LOGO1.png';

const Navbar = () => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Rutas que SIEMPRE deben tener la Navbar oscura/cristal (fondos claros)
    const darkNavRoutes = ['/peticiones', '/about', '/recursos', '/inscripciones'];
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

    const navGroups = [
        { label: 'Inicio', to: '/' },
        {
            label: 'Iglesia',
            items: [
                { to: '/about', icon: Users, title: 'Nosotros', desc: 'Quiénes somos y en qué creemos' },
                { section: 'visitanos', icon: MapPin, title: 'Visítanos', desc: 'Sábados 9:00 AM · cómo llegar' },
                { section: 'calendario', icon: CalendarDays, title: 'Agenda', desc: 'Próximos cultos y eventos' },
            ],
        },
        {
            label: 'Ministerio',
            items: [
                { to: '/peticiones', icon: HeartHandshake, title: 'Peticiones de oración', desc: 'Oramos contigo' },
                { to: '/inscripciones', icon: ClipboardList, title: 'Inscripciones', desc: 'Regístrate en los eventos' },
                { href: 'https://alfoliadventista.org/', icon: Wallet, title: 'Diezmos y ofrendas', desc: 'Alfolí Adventista (sitio externo)' },
            ],
        },
        {
            label: 'Medios',
            items: [
                { to: '/tv', icon: PlayCircle, title: 'Oasis TV', desc: 'Transmisión en vivo y cultos' },
                { to: '/recursos', icon: BookOpen, title: 'Recursos', desc: 'Lecciones, libros y materiales' },
            ],
        },
    ];

    const isGroupActive = (g) => g.to ? location.pathname === g.to : g.items.some((i) => i.to && location.pathname.startsWith(i.to));

    // Secciones de la página de inicio: si estoy en otra página, primero voy al inicio y luego bajo
    const goToSection = (e, id) => {
        e.preventDefault();
        e.currentTarget.blur();
        setMobileMenuOpen(false);
        const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        if (location.pathname === '/') scroll();
        else { navigate('/'); setTimeout(scroll, 450); }
    };

    const renderItem = (item, variant) => {
        const Icon = item.icon;
        const cls = variant === 'mobile' ? 'nav-m-item' : 'nav-dd-item';
        const body = (
            <>
                <span className="nav-dd-icon" aria-hidden="true"><Icon size={18} /></span>
                <span className="nav-dd-text">
                    <span className="nav-dd-title">{item.title}</span>
                    <span className="nav-dd-desc">{item.desc}</span>
                </span>
            </>
        );
        if (item.href) return <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>;
        if (item.section) return <a key={item.title} href={`/#${item.section}`} onClick={(e) => goToSection(e, item.section)} className={cls}>{body}</a>;
        return <Link key={item.title} to={item.to} onClick={(e) => e.currentTarget.blur()} className={cls}>{body}</Link>;
    };

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
                    position: 'relative'
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
                <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '34px', height: '100%' }}>
                    {navGroups.map((group) => {
                        const active = isGroupActive(group);
                        const linkStyle = {
                            textDecoration: 'none',
                            color: getNavTextColor(),
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.25em',
                            position: 'relative',
                            transition: 'color 0.3s ease',
                            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                        };
                        const line = active && <motion.div layoutId="activeNav" className="active-nav-line" style={{ backgroundColor: colors.accent }} />;
                        if (group.to) {
                            return <Link key={group.label} to={group.to} className="nav-link-v3" style={linkStyle}>{group.label}{line}</Link>;
                        }
                        return (
                            // Abre con el cursor (hover) y con el teclado (focus-within), solo con CSS
                            <div key={group.label} className="nav-dd">
                                <button type="button" className="nav-link-v3" style={linkStyle} aria-haspopup="true">
                                    {group.label}
                                    <ChevronDown size={13} className="nav-dd-chevron" aria-hidden="true" />
                                    {line}
                                </button>
                                <div className="nav-dd-panel" role="menu" aria-label={group.label}>
                                    <div className="nav-dd-card">
                                        {group.items.map((item) => renderItem(item, 'desktop'))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <Link to="/login" className="admin-btn-crystal" style={{
                        padding: '10px 28px',
                        backgroundColor: 'transparent',
                        color: shouldBeDark ? colors.accent : 'rgba(255,255,255,0.85)',
                        border: shouldBeDark ? `1px solid ${colors.accent}` : '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '50px',
                        fontSize: '0.7rem',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        Acceso miembros
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
                            padding: '26px 22px', boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
                            display: 'flex', flexDirection: 'column', gap: '18px',
                            maxHeight: 'calc(100dvh - 130px)', overflowY: 'auto',
                            pointerEvents: 'auto', border: `1px solid ${colors.crystalBorder}`,
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        {navGroups.filter((g) => g.items).map((group) => (
                            <div key={group.label}>
                                <p className="nav-m-heading">{group.label}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {group.items.map((item) => renderItem(item, 'mobile'))}
                                </div>
                            </div>
                        ))}
                        <Link to="/login" className="nav-m-access">Acceso miembros</Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .nav-link-v3:hover, .nav-dd:hover > .nav-link-v3, .nav-dd:focus-within > .nav-link-v3 { color: ${colors.accent} !important; }
                .nav-link-v3:focus-visible { outline: 2px solid ${colors.accent}; outline-offset: 6px; border-radius: 4px; }
                .nav-dd { position: relative; height: 100%; display: flex; align-items: center; }
                .nav-dd-chevron { transition: transform 0.25s ease; }
                .nav-dd:hover .nav-dd-chevron, .nav-dd:focus-within .nav-dd-chevron { transform: rotate(180deg); }
                /* padding-top hace de "puente" para que el cursor no pierda el submenú al bajar */
                .nav-dd-panel {
                    position: absolute; top: 100%; left: 50%; padding-top: 10px; z-index: 10;
                    opacity: 0; visibility: hidden; transform: translate(-50%, 8px);
                    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
                }
                .nav-dd:hover .nav-dd-panel, .nav-dd:focus-within .nav-dd-panel {
                    opacity: 1; visibility: visible; transform: translate(-50%, 0);
                }
                .nav-dd-card {
                    width: 300px; padding: 8px; border-radius: 22px;
                    background: rgba(18, 12, 31, 0.97); backdrop-filter: blur(20px);
                    border: 1px solid ${colors.crystalBorder}; box-shadow: 0 24px 50px rgba(0,0,0,0.45);
                    display: flex; flex-direction: column; gap: 2px;
                }
                .nav-dd-item, .nav-m-item {
                    display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px;
                    text-decoration: none; color: #FFF; transition: background 0.2s ease;
                }
                .nav-dd-item:hover, .nav-dd-item:focus-visible, .nav-m-item:hover { background: rgba(255,255,255,0.07); outline: none; }
                .nav-dd-icon {
                    flex-shrink: 0; width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center;
                    background: rgba(245,158,11,0.12); color: ${colors.accent}; border: 1px solid rgba(245,158,11,0.25);
                }
                .nav-dd-item:hover .nav-dd-icon { background: ${colors.accent}; color: ${colors.midnight}; }
                .nav-dd-text { display: flex; flex-direction: column; min-width: 0; }
                .nav-dd-title { font-size: 0.85rem; font-weight: 800; line-height: 1.25; }
                .nav-dd-desc { font-size: 0.72rem; color: rgba(255,255,255,0.55); line-height: 1.35; }
                .nav-m-heading { margin: 0 0 6px 12px; color: ${colors.accent}; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.3em; text-transform: uppercase; }
                .nav-m-access {
                    margin-top: 4px; text-align: center; padding: 12px; border-radius: 999px; text-decoration: none;
                    border: 1px solid ${colors.accent}; color: ${colors.accent}; font-size: 0.75rem; font-weight: 900;
                    letter-spacing: 0.2em; text-transform: uppercase;
                }
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