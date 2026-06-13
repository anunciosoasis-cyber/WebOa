/**
 * LayoutMaestro — Layout adaptativo Web / PWA
 *
 * Desktop (≥768px): Navbar horizontal sticky arriba
 * Mobile  (<768px): Header sticky + <BottomNav /> abajo
 *
 * Estética: Liquid Glass (backdropFilter, bordes sutiles, Flat Design 2.0)
 */
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import useAppMode from '../../hooks/useAppMode';
import BottomNav from './BottomNav';
import Navbar from './Navbar';
import Footer from './Footer';
import PersistentPlayer from './PersistentPlayer';


/* ─── LayoutMaestro ─── */
const LayoutMaestro = ({ showFooter = true }) => {
    const { isMobile, isDesktop } = useAppMode();
    const { theme, mode } = useTheme();
    const location = useLocation();
    const isDark = mode === 'dark';
    const isHome = location.pathname === '/';

    return (
        <div style={{
            minHeight: '100vh',
            background: isDark 
                ? 'radial-gradient(circle at 10% 10%, #0a0a1a 0%, #000000 100%)' 
                : 'radial-gradient(circle at 15% 20%, #f0f7ff 0%, #e2e8f0 50%, #f8fafd 100%)',
            fontFamily: 'AdventSans, system-ui, sans-serif',
            color: theme.colors.text.primary,
        }}>
            {/* Navbar centralizado (isla dinámica) */}
            <Navbar />

            {/* Main content area */}
            <main style={{ 
                minHeight: '100vh', 
                paddingTop: isHome ? '0' : '100px', // Espacio compacto para la navbar
                paddingBottom: isMobile ? '80px' : '0'
            }}>
                <PersistentPlayer />
                <Outlet />
            </main>

            {/* Universal Footer */}
            <Footer />
            {/* Mobile: Bottom Navigation */}
            {isMobile && <BottomNav />}
        </div>
    );
};

export default LayoutMaestro;
