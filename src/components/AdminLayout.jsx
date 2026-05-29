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
    ExternalLink, Heart, Mail
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
        { to: '/admin/culto', label: 'Orden de Culto', Icon: Layers },
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
            
            {/* ─── SIDEBAR MINIMALISTA ─── */}
            {isDesktop && (
                <motion.aside 
                    initial={false}
                    animate={{ width: sidebarWidth }}
                    style={{
                        background: sidebarColors.bg,
                        borderRight: `1px solid ${sidebarColors.border}`,
                        position: 'fixed', left: 0, top: 0, bottom: 0,
                        zIndex: 1000,
                        display: 'flex', flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
                    }}
                >
                    {/* Header Marca */}
                    <div style={{ 
                        padding: '30px 20px', 
                        display: 'flex', 
                        flexDirection: isCollapsed ? 'column' : 'row',
                        alignItems: 'center', 
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        gap: '15px'
                    }}>
                        <img src={logo || logoImg} alt="O" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px' }} />
                        
                        {!isCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ fontFamily: 'Moonrising', fontSize: '1rem', letterSpacing: '2px', color: oasisColors.accent, flex: 1, marginLeft: '10px' }}
                            >OASIS</motion.span>
                        )}

                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            style={{
                                width: '24px', height: '24px', borderRadius: '6px',
                                background: sidebarColors.hoverBg, border: `1px solid ${sidebarColors.border}`,
                                color: sidebarColors.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = sidebarColors.activeBg; e.currentTarget.style.color = '#FFF'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = sidebarColors.hoverBg; e.currentTarget.style.color = sidebarColors.text; }}
                        >
                            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                        </button>
                    </div>

                    {/* Navegación Orgánica */}
                    <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                                    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                                    {!isCollapsed && <span style={{ fontWeight: active ? 700 : 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>}
                                    {active && <motion.div layoutId="activeInd" style={{ position: 'absolute', left: 0, width: '3px', height: '18px', background: sidebarColors.accent, borderRadius: '0 3px 3px 0' }} />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / Utilities */}
                    <div style={{ padding: '20px 10px', borderTop: `1px solid ${sidebarColors.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-around', alignItems: 'center', marginBottom: '10px' }}>
                            <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: sidebarColors.accent, cursor: 'pointer' }}>
                                {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                            {!isCollapsed && (
                                <button onClick={() => window.open('/', '_blank')} style={{ background: 'none', border: 'none', color: sidebarColors.text, cursor: 'pointer' }}>
                                    <ExternalLink size={16} />
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={signOut}
                            style={{ 
                                background: 'none', border: 'none', color: '#FF3B30', 
                                display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', 
                                gap: '15px', padding: '12px', cursor: 'pointer', opacity: 0.7
                            }}
                        >
                            <LogOut size={18} />
                            {!isCollapsed && <span style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>SALIR</span>}
                        </button>
                    </div>
                </motion.aside>
            )}

            {/* ─── CONTENIDO PRINCIPAL CON TRANSICIONES ─── */}
            <main style={{
                flex: 1,
                marginLeft: isDesktop ? sidebarWidth : 0,
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