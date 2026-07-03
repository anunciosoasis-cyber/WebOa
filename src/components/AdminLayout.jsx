"use client";

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useAppMode from '../hooks/useAppMode';
import AdminBottomNav from '../react-ui/components/AdminBottomNav';
import logoImg from '../img/logos/LOGO1.png';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import {
    Inbox, Megaphone, Users,
    Settings, Layers, LogOut, LayoutDashboard,
    ChevronLeft, ChevronRight, Moon, Sun, Calendar, Home, FolderOpen,
    ExternalLink, Heart, Mail, MonitorPlay
} from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const { signOut, user, role } = useAuth();
    const { isMobile, isDesktop } = useAppMode();
    const { mode, toggleMode } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [logo, setLogo] = useState(null);

    React.useEffect(() => {
        apiClient.get('/settings').then(({ data }) => {
            const settingsObj = Array.isArray(data) ?
                data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) :
                data;
            if (settingsObj.logo) setLogo(settingsObj.logo);
        }).catch(e => console.error('Logo load error:', e));
    }, []);

    const oasisColors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        glassBorder: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        textMain: mode === 'dark' ? '#FFFFFF' : '#120C1F'
    };

    // Tema Morado Oscuro para el Menú Lateral
    const sidebarColors = {
        bg: mode === 'dark' ? '#160a26' : '#2a144a', // Morado oscuro profundo y elegante
        text: 'rgba(255, 255, 255, 0.65)',
        textActive: '#F59E0B',
        accent: '#F59E0B',
        hoverBg: 'rgba(255, 255, 255, 0.04)',
        activeBg: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.05)'
    };

    const allLinks = [
        { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/admin/announcements', label: 'Anuncios', Icon: Megaphone },
        { to: '/admin/requests', label: 'Peticiones', Icon: Inbox },
        { to: '/admin/inscripciones', label: 'Eventos', Icon: Calendar },
        { to: '/admin/culto', label: 'Studio Oasis', Icon: MonitorPlay },
        { to: '/admin/recursos', label: 'Archivos', Icon: FolderOpen, adminOnly: true },
        { to: '/admin/users', label: 'Equipo', Icon: Users, adminOnly: true },
        { to: '/admin/about', label: 'Identidad', Icon: Heart, adminOnly: true },
        { to: '/admin/plantilla-correo', label: 'Plantilla Email', Icon: Mail, adminOnly: true },
        { to: '/admin/ajustes', label: 'Ajustes', Icon: Settings, adminOnly: true },
    ];

    const isUserAdmin = role === 'admin' || user?.role === 'admin';
    const links = allLinks.filter(l => !l.adminOnly || isUserAdmin);
    const sidebarWidth = isCollapsed ? '75px' : '260px';

    return (
        <div style={{ 
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
                        borderRadius: '24px',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '4px 4px 24px rgba(0,0,0,0.15)'
                    }}>
                        {/* Header Marca */}
                        <div style={{ 
                            padding: '40px 20px 30px', 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '10px',
                            minHeight: '100px'
                        }}>
                            <AnimatePresence mode="wait">
                                {!isCollapsed ? (
                                    <motion.span 
                                        key="full"
                                        initial={{ opacity: 0, scale: 0.8 }} 
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ fontFamily: 'Moonrising', fontSize: '1.8rem', letterSpacing: '2px', color: '#FFFFFF', textAlign: 'center' }}
                                    >
                                        OASIS
                                    </motion.span>
                                ) : (
                                    <motion.span 
                                        key="short"
                                        initial={{ opacity: 0, scale: 1.2 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.2 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ fontFamily: 'Moonrising', fontSize: '0.7rem', letterSpacing: '1px', color: '#FFFFFF', textAlign: 'center' }}
                                    >
                                        OASIS
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Navegación Orgánica */}
                        <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                            {links.map(({ to, label, Icon }) => {
                                const active = to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);
                                return (
                                    <Link key={to} to={to} style={{
                                        display: 'flex', alignItems: 'center', gap: '15px',
                                        padding: '12px', borderRadius: '10px',
                                        textDecoration: 'none',
                                        background: active ? sidebarColors.activeBg : 'transparent',
                                        color: active ? sidebarColors.textActive : sidebarColors.text,
                                        transition: 'all 0.2s ease',
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = sidebarColors.hoverBg; e.currentTarget.style.color = '#FFF'; }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = sidebarColors.text; } else { e.currentTarget.style.color = sidebarColors.textActive; } }}
                                    >
                                        <Icon size={20} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
                                        <AnimatePresence>
                                            {!isCollapsed && (
                                                <motion.span 
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    style={{ fontWeight: active ? 600 : 400, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden' }}
                                                >
                                                    {label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Footer / Utilities con Perfil */}
                        <div style={{ padding: '20px 10px', borderTop: `1px solid ${sidebarColors.border}`, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {/* Opciones (Theme, Logout, Landing) */}
                            <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-around', alignItems: 'center', gap: isCollapsed ? '15px' : '0', flexDirection: isCollapsed ? 'column' : 'row' }}>
                                <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: sidebarColors.accent, cursor: 'pointer', padding: '5px' }} title="Cambiar Tema">
                                    {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                                <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#FF3B30', cursor: 'pointer', padding: '5px' }} title="Cerrar Sesión">
                                    <LogOut size={18} />
                                </button>
                                <button onClick={() => window.open('/', '_blank')} style={{ background: 'none', border: 'none', color: sidebarColors.text, cursor: 'pointer', padding: '5px' }} title="Ir a la Landing Page">
                                    <ExternalLink size={18} />
                                </button>
                            </div>

                            {/* Perfil de Usuario */}
                            <AnimatePresence mode="wait">
                                {!isCollapsed ? (
                                    <motion.div 
                                        key="expanded-profile"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
                                            background: 'rgba(0,0,0,0.2)', borderRadius: '16px' 
                                        }}
                                    >
                                        <div style={{ 
                                            width: '36px', height: '36px', borderRadius: '50%', 
                                            background: '#10B981', color: '#FFF', display: 'flex', 
                                            alignItems: 'center', justifyContent: 'center', 
                                            fontWeight: 'bold', fontSize: '1.1rem',
                                            flexShrink: 0
                                        }}>
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#FFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                {user?.name || 'Administrador'}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {role || 'ADMIN'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="collapsed-profile"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                                        style={{ 
                                            width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto',
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

                    {/* Botón de Colapso (Externo) */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            position: 'absolute',
                            right: '-12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '24px', height: '60px',
                            borderRadius: '12px',
                            background: '#FFFFFF',
                            border: `1px solid rgba(0,0,0,0.1)`,
                            color: '#120C1F', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 10,
                            padding: 0
                        }}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </motion.aside>
            )}

            {/* ─── CONTENIDO PRINCIPAL CON TRANSICIONES ─── */}
            <main style={{
                flex: 1,
                marginLeft: isDesktop ? `calc(${sidebarWidth} + 40px)` : 0,
                transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                height: '100vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{ padding: isMobile ? '20px' : '40px' }}
                    >
                        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                            <Outlet />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {isMobile && <AdminBottomNav />}

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