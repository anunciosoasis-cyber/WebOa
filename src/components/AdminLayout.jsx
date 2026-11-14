"use client";

import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useAppMode from '../hooks/useAppMode';
import AdminBottomNav from '../react-ui/components/AdminBottomNav';
import PageTransition from '../react-ui/components/PageTransition';
import '../styles/admin-dark.css';
import logoImg from '../img/logos/LOGO1.png';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import {
    Inbox, Megaphone, Users,
    Settings, Layers, LogOut, LayoutDashboard,
    ChevronLeft, ChevronRight, Moon, Sun, Calendar, Home, FolderOpen,
    ExternalLink, Heart, Mail, MonitorPlay, ClipboardList, Building2
} from 'lucide-react';

// Rutas a pantalla completa: sin padding ni barra inferior móvil (el editor trae su propia navegación).
const EDITOR_ROUTES = ['/admin/announcements', '/admin/creator'];

const AdminLayout = () => {
    const location = useLocation();
    const isEditor = EDITOR_ROUTES.includes(location.pathname);
    const { signOut, user, role } = useAuth();
    const { isMobile, isDesktop } = useAppMode();
    const { mode, toggleMode } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [logo, setLogo] = useState(null);
    const mainRef = useRef(null);

    React.useEffect(() => {
        apiClient.get('/settings').then(({ data }) => {
            const settingsObj = Array.isArray(data) ?
                data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) :
                data;
            if (settingsObj.logo) setLogo(settingsObj.logo);
        }).catch(e => console.error('Logo load error:', e));
    }, []);

    const oasisColors = {
        deepPurple: '#2a144a',
        midnight: '#1b0d36',
        accent: '#F59E0B',
        glassBorder: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        textMain: mode === 'dark' ? '#FFFFFF' : '#2a144a'
    };

    // Tema Morado Oscuro con gradiente profundo y sobrio para el Menú Lateral
    const sidebarColors = {
        bg: mode === 'dark'
            ? 'linear-gradient(180deg, #1E0E38 0%, #140926 55%, #0B0516 100%)'
            : 'linear-gradient(180deg, #2A144A 0%, #1C0D34 55%, #110722 100%)',
        dockBg: mode === 'dark' ? '#0B0515' : '#0F071C',
        dockCardBg: mode === 'dark' ? '#130923' : '#180D2B',
        text: 'rgba(255, 255, 255, 0.68)',
        textActive: '#F59E0B',
        accent: '#F59E0B',
        hoverBg: 'rgba(255, 255, 255, 0.05)',
        activeBg: 'rgba(255, 255, 255, 0.09)',
        border: 'rgba(255, 255, 255, 0.08)'
    };

    const allLinks = [
        { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/admin/announcements', label: 'Anuncios', Icon: Megaphone },
        { to: '/admin/requests', label: 'Peticiones', Icon: Inbox },
        { to: '/admin/inscripciones', label: 'Eventos', Icon: Calendar },
        { to: '/admin/culto', label: 'Studio Oasis', Icon: MonitorPlay },
        { to: '/admin/junta', label: 'Junta Oasis', Icon: ClipboardList, adminOnly: true },
        { to: '/admin/recursos', label: 'Archivos', Icon: FolderOpen, adminOnly: true },
        { to: '/admin/users', label: 'Equipo', Icon: Users, adminOnly: true },
        { to: '/admin/about', label: 'Identidad', Icon: Heart, adminOnly: true },
        { to: '/admin/plantilla-correo', label: 'Plantilla Email', Icon: Mail, adminOnly: true },
        { to: '/admin/ajustes', label: 'Ajustes', Icon: Settings, adminOnly: true },
        { to: '/admin/plataforma', label: 'Plataforma', Icon: Building2, superAdminOnly: true },
    ];

    const isUserAdmin = role === 'admin' || user?.role === 'admin';
    const links = allLinks.filter(l => (!l.adminOnly || isUserAdmin) && (!l.superAdminOnly || user?.isSuperAdmin));
    const sidebarWidth = isCollapsed ? '75px' : '260px';

    return (
        <div data-admin-theme={mode} style={{
            minHeight: '100vh',
            background: mode === 'dark' ? oasisColors.midnight : '#F9FAFB',  
            color: oasisColors.textMain,
            display: 'flex',
            overflow: 'hidden'
        }}>
            
            {isDesktop && (
                <motion.aside 
                    initial={false}
                    animate={{ width: sidebarWidth }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'fixed', left: '20px', top: '20px', bottom: '20px',
                        zIndex: 1000,
                        display: 'flex', flexDirection: 'column'
                    }}
                >
                    <div style={{
                        background: sidebarColors.bg,
                        border: `1px solid ${sidebarColors.border}`,
                        borderRadius: '26px',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '0 22px 48px -14px rgba(18, 12, 31, 0.42)'
                    }}>
                        {/* Header Marca */}
                        <div style={{
                            padding: '32px 20px 22px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            minHeight: '96px'
                        }}>
                            <AnimatePresence mode="wait">
                                {!isCollapsed ? (
                                    <motion.div
                                        key="full"
                                        initial={{ opacity: 0, scale: 0.92 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.92 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                                    >
                                        <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '3.2px', color: 'rgba(245, 158, 11, 0.85)', textTransform: 'uppercase' }}>
                                            Panel Oasis
                                        </span>
                                        <span style={{ fontFamily: 'Moonrising', fontSize: '1.85rem', letterSpacing: '2.5px', color: '#FFFFFF', textAlign: 'center', lineHeight: 1.05 }}>
                                            OASIS
                                        </span>
                                    </motion.div>
                                ) : (
                                    <motion.span
                                        key="short"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ fontFamily: 'Moonrising', fontSize: '0.72rem', letterSpacing: '1px', color: '#FFFFFF', textAlign: 'center' }}
                                    >
                                        OASIS
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            <div style={{
                                width: isCollapsed ? '28px' : '72%',
                                height: '1px',
                                marginTop: '12px',
                                background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.35), transparent)'
                            }} />
                        </div>

                        {/* Navegación Orgánica */}
                        <nav style={{ flex: 1, padding: '4px 12px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                            {links.map(({ to, label, Icon }) => {
                                const active = to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);
                                return (
                                    <Link key={to} to={to} style={{
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: '11px 14px', borderRadius: '12px',
                                        textDecoration: 'none',
                                        background: active ? sidebarColors.activeBg : 'transparent',
                                        border: active ? '1px solid rgba(245, 158, 11, 0.16)' : '1px solid transparent',
                                        color: active ? sidebarColors.textActive : sidebarColors.text,
                                        transition: 'all 0.2s ease',
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = sidebarColors.hoverBg; e.currentTarget.style.color = '#FFF'; } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = sidebarColors.text; } else { e.currentTarget.style.color = sidebarColors.textActive; } }}
                                    >
                                        {active && !isCollapsed && (
                                            <span style={{
                                                position: 'absolute',
                                                left: '0px',
                                                top: '22%',
                                                bottom: '22%',
                                                width: '3px',
                                                borderRadius: '0 4px 4px 0',
                                                backgroundColor: sidebarColors.accent
                                            }} />
                                        )}
                                        <Icon size={19} strokeWidth={active ? 2.4 : 1.9} style={{ flexShrink: 0 }} />
                                        <AnimatePresence>
                                            {!isCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    style={{ fontWeight: active ? 700 : 500, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', letterSpacing: '0.1px' }}
                                                >
                                                    {label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Footer / Utilities con Perfil (Sólido, sobrio y sin transparencias excesivas) */}
                        <div style={{
                            padding: '16px 12px 18px',
                            background: sidebarColors.dockBg,
                            borderTop: `1px solid ${sidebarColors.border}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {/* Opciones (Theme, Logout, Landing) */}
                            <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center', gap: isCollapsed ? '10px' : '8px', flexDirection: isCollapsed ? 'column' : 'row' }}>
                                <button
                                    onClick={toggleMode}
                                    style={{
                                        flex: isCollapsed ? 'none' : 1,
                                        background: sidebarColors.dockCardBg,
                                        border: `1px solid ${sidebarColors.border}`,
                                        borderRadius: '10px',
                                        color: sidebarColors.accent,
                                        cursor: 'pointer',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Cambiar Tema"
                                >
                                    {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                </button>
                                <button
                                    onClick={signOut}
                                    style={{
                                        flex: isCollapsed ? 'none' : 1,
                                        background: sidebarColors.dockCardBg,
                                        border: `1px solid ${sidebarColors.border}`,
                                        borderRadius: '10px',
                                        color: '#F87171',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Cerrar Sesión"
                                >
                                    <LogOut size={16} />
                                </button>
                                <button
                                    onClick={() => window.open('/', '_blank')}
                                    style={{
                                        flex: isCollapsed ? 'none' : 1,
                                        background: sidebarColors.dockCardBg,
                                        border: `1px solid ${sidebarColors.border}`,
                                        borderRadius: '10px',
                                        color: 'rgba(255,255,255,0.75)',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Ir a la Landing Page"
                                >
                                    <ExternalLink size={16} />
                                </button>
                            </div>

                            {/* Perfil de Usuario */}
                            <AnimatePresence mode="wait">
                                {!isCollapsed ? (
                                    <motion.div
                                        key="expanded-profile"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                                            background: sidebarColors.dockCardBg,
                                            border: `1px solid ${sidebarColors.border}`,
                                            borderRadius: '14px'
                                        }}
                                    >
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: '#10B981', color: '#FFF', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '1.05rem',
                                            flexShrink: 0
                                        }}>
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                            <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                {user?.name || 'Administrador'}
                                            </span>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                                {role || 'ADMIN'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="collapsed-profile"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                                        style={{
                                            width: '34px', height: '34px', borderRadius: '50%', margin: '0 auto',
                                            background: '#10B981', color: '#FFF', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '1rem',
                                            flexShrink: 0
                                        }}
                                    >
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Botón de Colapso (Integrado y sobrio) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            position: 'absolute',
                            right: '-14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '28px', height: '28px',
                            borderRadius: '50%',
                            background: '#1E0E38',
                            border: '1px solid rgba(245, 158, 11, 0.45)',
                            color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 6px 16px rgba(8, 5, 13, 0.35)',
                            zIndex: 10,
                            padding: 0
                        }}
                        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                    >
                        {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                    </button>
                </motion.aside>
            )}

            {/* ─── CONTENIDO PRINCIPAL CON TRANSICIONES ─── */}
            <main ref={mainRef} style={{
                flex: 1,
                marginLeft: isDesktop ? `calc(${sidebarWidth} + 40px)` : 0,
                transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                height: '100vh',
                overflowY: isEditor ? 'hidden' : 'auto',
                position: 'relative'
            }}>
                <PageTransition
                    scrollRef={mainRef}
                    style={isEditor
                        ? { padding: isMobile ? 0 : '12px 16px 12px 0', height: '100%', boxSizing: 'border-box' }
                        : { padding: isMobile ? '20px' : '40px', maxWidth: '1300px', margin: '0 auto', boxSizing: 'content-box' }}
                />
            </main>

            {isMobile && !isEditor && <AdminBottomNav />}

            <style>{`
                @font-face { font-family: 'Moonrising'; src: url('/fonts/Moonrising.ttf'); }
                
                /* Scrollbar Invisible */
                main::-webkit-scrollbar { width: 0; }
                nav::-webkit-scrollbar { width: 0; }

                * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
                
                a:hover { opacity: 0.8; }
            `}</style>
        </div>
    );
};

export default AdminLayout;