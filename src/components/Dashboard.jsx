"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../react-ui/ThemeContext';
import GlassCard from '../react-ui/components/GlassCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
    Users, HeartHandshake, Calendar, TrendingUp, Bell, MoreVertical, 
    Plus, Clock, UserCheck, Coins, MapPin, AlertCircle, CheckCircle2,
    Inbox, MonitorPlay, Newspaper, Settings, LayoutDashboard,
    FileText, Activity, Database, ArrowRight, Search, Download, Users2,
    Info as InfoIcon, Layers, FolderOpen
} from 'lucide-react';
import apiClient from '../api/client';
import useAppMode from '../hooks/useAppMode';
import { useToast } from '../react-ui/components/Toast';

const Dashboard = () => {
    const { theme, mode } = useTheme();
    const { isMobile } = useAppMode();
    const { role, user } = useAuth();
    const { showToast } = useToast();
    const isUserAdmin = role === 'admin' || user?.role === 'admin';
    const isDark = mode === 'dark';
    const navigate = useNavigate();

    // Paleta Unificada Oasis
    const OASIS_COLORS = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        glassWhite: 'rgba(255, 255, 255, 0.03)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        success: '#10B981',
        error: '#EF4444'
    };
    
    const [stats, setStats] = useState({ 
        totalRequests: 0, 
        pendingRequests: 0,
        activeAnnouncements: 0,
        totalResources: 0,
        nextEvent: null,
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordenCulto, setOrdenCulto] = useState([]);
    const [liveTime, setLiveTime] = useState(0);

    // Exportación Profesional
    const handleExportPDF = async (elementId, filename = 'reporte-oasis.pdf') => {
        const element = document.getElementById(elementId);
        if (!element) return;
        showToast('Generando reporte ejecutivo...', 'info');
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: isDark ? OASIS_COLORS.midnight : '#ffffff',
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
            pdf.save(filename);
            showToast('Reporte generado', 'success');
        } catch (error) {
            showToast('Error en exportación', 'error');
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [reqsRes, announcementsRes, resourcesRes, cultoRes, settingsRes] = await Promise.all([
                    apiClient.get('/requests').catch(() => ({ data: [] })),
                    apiClient.get('/announcements').catch(() => ({ data: [] })),
                    apiClient.get('/gallery-items').catch(() => ({ data: [] })),
                    apiClient.get('/orden-culto').catch(() => ({ data: [] })),
                    apiClient.get('/public/settings').catch(() => ({ data: {} }))
                ]);

                setOrdenCulto(cultoRes.data.sort((a, b) => a.hora.localeCompare(b.hora)));
                setStats({
                    totalRequests: reqsRes.data.length,
                    pendingRequests: reqsRes.data.filter(r => r.status === 'pendiente').length,
                    activeAnnouncements: announcementsRes.data.filter(a => a.isPublished).length,
                    totalResources: resourcesRes.data.length,
                    nextEvent: cultoRes.data.find(item => !item.completado),
                });
                setRecentRequests(reqsRes.data.slice(0, 5));
            } finally { setLoading(false); }
        };
        fetchDashboardData();
    }, []);

    // Visor en vivo del cronómetro del culto
    useEffect(() => {
        const startTime = localStorage.getItem('culto_serviceStartTime');
        if (!startTime) return;

        const isPaused = localStorage.getItem('culto_isPaused') === 'true';

        const updateTime = () => {
            const baseElapsed = Number(localStorage.getItem('culto_elapsedSeconds')) || 0;
            if (isPaused) {
                setLiveTime(baseElapsed);
            } else {
                const lastTick = Number(localStorage.getItem('culto_lastTickTime')) || Date.now();
                const diff = Math.floor((Date.now() - lastTick) / 1000);
                setLiveTime(baseElapsed + (diff > 0 ? diff : 0));
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const isCultoLive = !!localStorage.getItem('culto_serviceStartTime');
    const currentIndex = Number(localStorage.getItem('culto_currentActivityIndex')) || 0;
    const currentActivity = ordenCulto[currentIndex] || null;

    const totalSeconds = currentActivity ? (currentActivity.duracionEstimada || 5) * 60 : 0;
    const remainingTime = totalSeconds - liveTime;
    const isOvertime = remainingTime < 0;

    const formatLiveTime = (secs) => {
        const abs = Math.abs(secs);
        const m = Math.floor(abs / 60);
        const s = abs % 60;
        return `${secs < 0 ? '-' : ''}${m}:${s.toString().padStart(2, '0')}`;
    };

    const ModuleCard = ({ icon: Icon, title, info, link, color = OASIS_COLORS.accent, adminOnly }) => {
        if (adminOnly && !isUserAdmin) return null;
        return (
            <motion.div whileHover={{ y: -8, scale: 1.02 }} className="h-100" onClick={() => navigate(link)} style={{ cursor: 'pointer' }}>
                <GlassCard style={{ padding: '25px', position: 'relative', overflow: 'hidden', height: '100%', borderRadius: '28px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <h6 style={{ fontFamily: 'Moonrising', fontSize: '0.8rem', color: isDark ? '#fff' : OASIS_COLORS.deepPurple, margin: 0, letterSpacing: '1px' }}>{title}</h6>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: '1px' }}>{info}</span>
                    <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.03, transform: 'rotate(-15deg)' }}>
                        <Icon size={80} color={color} />
                    </div>
                </GlassCard>
            </motion.div>
        );
    };

    const StatHighlight = ({ label, value, icon: Icon, color }) => (
        <div className="d-flex align-items-center gap-3 px-4 py-3 rounded-4 h-100" style={{ background: OASIS_COLORS.glassWhite, border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
            <div style={{ padding: '12px', borderRadius: '14px', background: `${color}15`, color: color }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1, color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>{value}</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5 }}>{label}</div>
            </div>
        </div>
    );

    if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border" style={{ color: OASIS_COLORS.accent }} /></div>;

    return (
        <div className="container-fluid pb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
            
            {/* 1. HEADER EJECUTIVO */}
            <header className="mb-5">
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Intelligence Hub</span>
                        <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                            DASHBOARD <span style={{ color: OASIS_COLORS.accent }}>OASIS</span>
                        </h1>
                    </div>
                    <div className="d-flex gap-3">
                         <div className="position-relative d-none d-md-block">
                            <Search className="position-absolute translate-middle-y top-50 ms-3 opacity-25" size={18} />
                            <input type="text" className="form-control" placeholder="Buscar función..." style={{ width: '280px', height: '48px', borderRadius: '15px', background: OASIS_COLORS.glassWhite, border: `1px solid ${OASIS_COLORS.glassBorder}`, color: isDark ? '#fff' : OASIS_COLORS.deepPurple, paddingLeft: '45px' }} />
                        </div>
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-6 col-md-3"><StatHighlight label="Peticiones" value={stats.pendingRequests} icon={Inbox} color={OASIS_COLORS.accent} /></div>
                    <div className="col-6 col-md-3"><StatHighlight label="Noticias" value={stats.activeAnnouncements} icon={Newspaper} color={OASIS_COLORS.success} /></div>
                    <div className="col-6 col-md-3"><StatHighlight label="Recursos" value={stats.totalResources} icon={Database} color="#8B5CF6" /></div>
                    <div className="col-6 col-md-3"><StatHighlight label="Admin Live" value="3" icon={UserCheck} color="#3B82F6" /></div>
                </div>
            </header>

            <div className="row g-4 mb-5">
                {/* 2. ANALÍTICA DE ALCANCE */}
                <div className="col-lg-8">
                    <GlassCard id="alcance-card" style={{ padding: '35px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div>
                                <h4 style={{ fontFamily: 'Moonrising', fontSize: '1.1rem' }}>ALCANCE <span style={{ color: OASIS_COLORS.accent }}>COMMUNITARIO</span></h4>
                                <p style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 700 }}>Interacciones proyectadas de la semana</p>
                            </div>
                             <button onClick={() => handleExportPDF('alcance-card')} style={{ background: OASIS_COLORS.glassWhite, border: `1px solid ${OASIS_COLORS.glassBorder}`, color: isDark ? '#fff' : OASIS_COLORS.deepPurple, padding: '8px 20px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900 }}>
                                <Download size={14} className="me-2" /> REPORTE PDF
                            </button>
                        </div>
                        <div style={{ height: '220px', width: '100%' }}>
                            <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="oasisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={OASIS_COLORS.accent} stopOpacity="0.3" />
                                        <stop offset="100%" stopColor={OASIS_COLORS.accent} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M 0 180 Q 200 50 400 120 T 800 60 L 800 200 L 0 200 Z" fill="url(#oasisGrad)" />
                                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} d="M 0 180 Q 200 50 400 120 T 800 60" fill="none" stroke={OASIS_COLORS.accent} strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </div>
                    </GlassCard>
                </div>

                {/* 3. CONTROL DE CULTO - WIDGET EN VIVO */}
                <div className="col-lg-4">
                    <GlassCard style={{ padding: '35px', borderRadius: '35px', background: isCultoLive ? `radial-gradient(circle at top right, ${isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success}22, ${OASIS_COLORS.deepPurple})` : OASIS_COLORS.deepPurple, border: `1px solid ${isCultoLive ? (isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success) : OASIS_COLORS.accent}44`, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', color: isCultoLive ? (isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success) : OASIS_COLORS.accent }}>
                                {isCultoLive ? (isOvertime ? 'ALERTA DESVÍO' : 'EN VIVO') : 'CONTROL CULTO'}
                            </span>
                            {isCultoLive && <div className="rounded-circle animate-pulse" style={{ width: 10, height: 10, background: isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success }} />}
                        </div>

                        {isCultoLive && currentActivity ? (
                            <div className="text-center">
                                <h2 style={{ fontFamily: 'Moonrising', fontSize: '1.4rem', margin: '0 0 5px', color: '#fff' }}>{currentActivity.actividad}</h2>
                                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '20px' }}>Resp: {currentActivity.responsable}</p>
                                
                                <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'Moonrising', color: isOvertime ? OASIS_COLORS.error : '#fff', lineHeight: 1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                    {formatLiveTime(remainingTime)}
                                </div>
                                <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', opacity: 0.5, marginTop: '10px', textTransform: 'uppercase' }}>
                                    {isOvertime ? 'Tiempo Excedido' : 'Tiempo Restante'}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center mt-4">
                                <Layers size={48} color={OASIS_COLORS.accent} style={{ marginBottom: '20px', opacity: 0.8 }} />
                                <h2 style={{ fontFamily: 'Moonrising', fontSize: '1.8rem', margin: '10px 0 25px' }}>Orden de Culto</h2>
                            </div>
                        )}

                        <button onClick={() => navigate('/admin/culto')} style={{ width: '100%', marginTop: '20px', padding: '15px', borderRadius: '15px', border: `1px solid ${isCultoLive ? (isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success) : OASIS_COLORS.accent}`, background: isCultoLive ? (isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success) : 'transparent', color: isCultoLive ? '#000' : OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.8rem', transition: '0.3s' }} className="hover-gold">
                            {isCultoLive ? 'IR AL PANEL' : 'ENTRAR A CONTROL'}
                        </button>
                    </GlassCard>
                </div>
            </div>

            {/* 4. HUB DE MÓDULOS UNIFICADO */}
            <div className="mb-4"><h4 style={{ fontFamily: 'Moonrising', fontSize: '1rem', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>SISTEMA <span style={{ color: OASIS_COLORS.accent }}>MODULAR</span></h4></div>
            <div className="row g-4 mb-5">
                {[
                    { title: 'Press', info: `${stats.activeAnnouncements} Publicados`, icon: Newspaper, link: '/admin/announcements', color: '#10B981' },
                    { title: 'Orden Culto', info: 'Sincro en vivo', icon: Layers, link: '/admin/culto', color: OASIS_COLORS.accent },
                    { title: 'Peticiones', info: `${stats.pendingRequests} Pendientes`, icon: Inbox, link: '/admin/requests', color: '#F59E0B' },
                    { title: 'Eventos', info: 'Captación', icon: FileText, link: '/admin/inscripciones', color: '#3B82F6' },
                    { title: 'Media', info: `${stats.totalResources} Items`, icon: FolderOpen, link: '/admin/recursos', color: '#6366F1' },
                    { title: 'Equipo', info: 'Roles JA', icon: Users2, link: '/admin/users', color: '#EC4899', adminOnly: true },
                    { title: 'Ajustes', info: 'API / Sistema', icon: Settings, link: '/admin/ajustes', color: '#6B7280', adminOnly: true },
                ].map((m, i) => <div key={i} className="col-6 col-md-4 col-xl-3"><ModuleCard {...m} /></div>)}
            </div>

            <style>{`
                @font-face { font-family: 'Moonrising'; src: url('/fonts/Moonrising.ttf'); }
                .hover-gold:hover { background: ${OASIS_COLORS.accent} !important; color: ${OASIS_COLORS.midnight} !important; }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </div>
    );
};

export default Dashboard;