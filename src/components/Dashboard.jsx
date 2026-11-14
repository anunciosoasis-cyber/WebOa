"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useTheme } from '../react-ui/ThemeContext';
import GlassCard from '../react-ui/components/GlassCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
    Users, Calendar, Inbox, Newspaper, Settings,
    FileText, ArrowRight, Search, Download, Users2,
    Layers, FolderOpen, Heart, Mail, ClipboardList,
    Radio, RefreshCw, CheckCircle2, Clock, Sparkles
} from 'lucide-react';
import apiClient from '../api/client';
import { useToast } from '../react-ui/components/Toast';

const Dashboard = () => {
    const { mode } = useTheme();
    const { role, user } = useAuth();
    const { showToast } = useToast();
    const isUserAdmin = role === 'admin' || user?.role === 'admin';
    const isDark = mode === 'dark';
    const navigate = useNavigate();

    const OASIS_COLORS = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        cardSurface: isDark ? '#161026' : '#FFFFFF',
        borderSubtle: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(18, 12, 31, 0.08)',
        textPrimary: isDark ? '#FFFFFF' : '#120C1F',
        textMuted: isDark ? 'rgba(255, 255, 255, 0.65)' : '#5B556B',
        success: '#10B981',
        error: '#EF4444'
    };

    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingRequests: 0,
        resolvedRequests: 0,
        totalAnnouncements: 0,
        activeAnnouncements: 0,
        totalResources: 0,
        activeEvents: 0,
        totalEvents: 0,
        totalSubmissions: 0,
        totalUsers: 0,
        streamIsLive: false,
        nextActivity: null
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [eventForms, setEventForms] = useState([]);
    const [submissionsByForm, setSubmissionsByForm] = useState({});
    const [ordenCulto, setOrdenCulto] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [liveTime, setLiveTime] = useState(0);

    const handleExportPDF = async (elementId, filename = 'reporte-oasis.pdf') => {
        const element = document.getElementById(elementId);
        if (!element) return;
        showToast('Generando reporte ejecutivo...', 'info');
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: isDark ? '#161026' : '#ffffff',
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

    const fetchDashboardData = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const [
                reqsRes,
                announcementsRes,
                resourcesRes,
                cultoRes,
                settingsRes,
                formsRes,
                submissionsRes,
                usersRes
            ] = await Promise.all([
                apiClient.get('/requests').catch(() => ({ data: [] })),
                apiClient.get('/announcements').catch(() => ({ data: [] })),
                apiClient.get('/resources').catch(() => ({ data: [] })),
                apiClient.get('/orden-culto').catch(() => ({ data: [] })),
                apiClient.get('/public/settings').catch(() => ({ data: {} })),
                apiClient.get('/admin/event-forms').catch(() => ({ data: [] })),
                apiClient.get('/admin/event-submissions').catch(() => ({ data: [] })),
                isUserAdmin ? apiClient.get('/users').catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
            ]);

            const reqs = Array.isArray(reqsRes.data) ? reqsRes.data : [];
            const announcements = Array.isArray(announcementsRes.data) ? announcementsRes.data : (announcementsRes.data?.data || []);
            const resources = Array.isArray(resourcesRes.data) ? resourcesRes.data : [];
            const culto = Array.isArray(cultoRes.data) ? [...cultoRes.data].sort((a, b) => (a.hora || '').localeCompare(b.hora || '')) : [];
            const forms = Array.isArray(formsRes.data) ? formsRes.data : [];
            const subs = Array.isArray(submissionsRes.data) ? submissionsRes.data : [];
            const usersList = Array.isArray(usersRes.data) ? usersRes.data : [];

            const settingsObj = Array.isArray(settingsRes.data)
                ? settingsRes.data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
                : (settingsRes.data || {});

            const subCounts = subs.reduce((acc, s) => {
                const fId = s.eventForm?.id || s.eventFormId;
                if (fId) acc[fId] = (acc[fId] || 0) + 1;
                return acc;
            }, {});

            setOrdenCulto(culto);
            setEventForms(forms);
            setSubmissionsByForm(subCounts);
            setRecentRequests(reqs.slice(0, 4));
            setStats({
                totalRequests: reqs.length,
                pendingRequests: reqs.filter(r => (r.status || 'pendiente').toLowerCase() === 'pendiente').length,
                resolvedRequests: reqs.filter(r => (r.status || '').toLowerCase() !== 'pendiente').length,
                totalAnnouncements: announcements.length,
                activeAnnouncements: announcements.filter(a => a.isPublished !== false).length,
                totalResources: resources.length,
                activeEvents: forms.filter(f => f.isActive !== false).length,
                totalEvents: forms.length,
                totalSubmissions: subs.length,
                totalUsers: usersList.length,
                streamIsLive: settingsObj.stream_is_live === true || settingsObj.stream_is_live === 'true',
                nextActivity: culto.find(item => !item.completado) || null
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isUserAdmin]);

    useEffect(() => {
        fetchDashboardData(false);
    }, [fetchDashboardData]);

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

    const allModules = [
        {
            title: 'Anuncios',
            info: `${stats.activeAnnouncements} publicados · ${stats.totalAnnouncements} total`,
            icon: Newspaper,
            link: '/admin/announcements',
            color: '#10B981'
        },
        {
            title: 'Peticiones',
            info: `${stats.pendingRequests} pendientes · ${stats.totalRequests} total`,
            icon: Inbox,
            link: '/admin/requests',
            color: '#F59E0B'
        },
        {
            title: 'Eventos',
            info: `${stats.activeEvents} activos · ${stats.totalSubmissions} inscritos`,
            icon: Calendar,
            link: '/admin/inscripciones',
            color: '#3B82F6'
        },
        {
            title: 'Studio Oasis',
            info: isCultoLive ? 'Cronómetro en vivo' : `${ordenCulto.length} bloques en orden`,
            icon: Layers,
            link: '/admin/culto',
            color: '#D97706'
        },
        {
            title: 'Junta Oasis',
            info: 'Actas y votaciones',
            icon: ClipboardList,
            link: '/admin/junta',
            color: '#8B5CF6',
            adminOnly: true
        },
        {
            title: 'Archivos',
            info: `${stats.totalResources} recursos disponibles`,
            icon: FolderOpen,
            link: '/admin/recursos',
            color: '#6366F1',
            adminOnly: true
        },
        {
            title: 'Equipo',
            info: `${stats.totalUsers} cuentas registradas`,
            icon: Users2,
            link: '/admin/users',
            color: '#EC4899',
            adminOnly: true
        },
        {
            title: 'Identidad',
            info: 'Historia, valores y junta',
            icon: Heart,
            link: '/admin/about',
            color: '#E11D48',
            adminOnly: true
        },
        {
            title: 'Plantilla Email',
            info: 'Confirmación de eventos',
            icon: Mail,
            link: '/admin/plantilla-correo',
            color: '#0EA5E9',
            adminOnly: true
        },
        {
            title: 'Ajustes',
            info: stats.streamIsLive ? 'TV en vivo activa' : 'Sistema y transmisión',
            icon: Settings,
            link: '/admin/ajustes',
            color: '#64748B',
            adminOnly: true
        }
    ];

    const filteredModules = allModules.filter(m => {
        if (m.adminOnly && !isUserAdmin) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return m.title.toLowerCase().includes(q) || m.info.toLowerCase().includes(q);
    });

    const StatHighlight = ({ label, sublabel, value, icon: Icon, color, onClick }) => (
        <motion.div
            whileHover={{ y: -3 }}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            className="d-flex align-items-center justify-content-between gap-3 px-4 py-3 rounded-4 h-100"
            style={{
                background: OASIS_COLORS.cardSurface,
                border: `1px solid ${OASIS_COLORS.borderSubtle}`,
                boxShadow: '0 12px 28px -16px rgba(18, 12, 31, 0.14)',
                cursor: 'pointer'
            }}
        >
            <div className="d-flex align-items-center gap-3">
                <div style={{ padding: '12px', borderRadius: '14px', background: `${color}18`, color: color }}>
                    <Icon size={20} strokeWidth={2.4} />
                </div>
                <div>
                    <div style={{ fontSize: '1.55rem', fontWeight: 900, lineHeight: 1.05, color: OASIS_COLORS.textPrimary }}>{value}</div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.9px', color: OASIS_COLORS.textMuted, marginTop: '3px' }}>{label}</div>
                    {sublabel && <div style={{ fontSize: '0.7rem', color: color, fontWeight: 700, marginTop: '2px' }}>{sublabel}</div>}
                </div>
            </div>
            <ArrowRight size={16} color={OASIS_COLORS.textMuted} />
        </motion.div>
    );

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border" style={{ color: OASIS_COLORS.accent }} />
            </div>
        );
    }

    return (
        <div className="container-fluid pb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* 1. HEADER EJECUTIVO */}
            <header className="mb-4">
                <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
                    <div>
                        <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '3.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={12} /> Centro de Operaciones · Tiempo Real
                        </span>
                        <h1 style={{ fontFamily: 'Moonrising', fontSize: 'clamp(1.9rem, 3.5vw, 2.5rem)', margin: '6px 0 0', color: OASIS_COLORS.textPrimary }}>
                            DASHBOARD <span style={{ color: OASIS_COLORS.accent }}>OASIS</span>
                        </h1>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="position-relative">
                            <Search className="position-absolute translate-middle-y top-50 ms-3" size={16} color={OASIS_COLORS.textMuted} />
                            <input
                                type="text"
                                className="form-control"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filtrar módulo..."
                                style={{
                                    width: '240px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    background: OASIS_COLORS.cardSurface,
                                    border: `1px solid ${OASIS_COLORS.borderSubtle}`,
                                    color: OASIS_COLORS.textPrimary,
                                    paddingLeft: '40px',
                                    fontSize: '0.86rem',
                                    boxShadow: '0 8px 20px -12px rgba(18, 12, 31, 0.12)'
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => fetchDashboardData(true)}
                            disabled={refreshing}
                            title="Actualizar métricas reales"
                            style={{
                                height: '44px',
                                padding: '0 16px',
                                borderRadius: '14px',
                                background: OASIS_COLORS.cardSurface,
                                border: `1px solid ${OASIS_COLORS.borderSubtle}`,
                                color: OASIS_COLORS.textPrimary,
                                fontWeight: 800,
                                fontSize: '0.76rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '7px',
                                cursor: 'pointer',
                                boxShadow: '0 8px 20px -12px rgba(18, 12, 31, 0.12)'
                            }}
                        >
                            <RefreshCw size={15} color={OASIS_COLORS.accent} className={refreshing ? 'dash-spin' : ''} />
                            Actualizar
                        </button>
                    </div>
                </div>

                {/* 4 KPIs 100% REALES */}
                <div className="row g-3">
                    <div className="col-6 col-xl-3">
                        <StatHighlight
                            label="Peticiones Pendientes"
                            sublabel={`${stats.totalRequests} recibidas en total`}
                            value={stats.pendingRequests}
                            icon={Inbox}
                            color={OASIS_COLORS.accent}
                            onClick={() => navigate('/admin/requests')}
                        />
                    </div>
                    <div className="col-6 col-xl-3">
                        <StatHighlight
                            label="Inscritos en Eventos"
                            sublabel={`${stats.activeEvents} eventos activos`}
                            value={stats.totalSubmissions}
                            icon={Calendar}
                            color="#3B82F6"
                            onClick={() => navigate('/admin/inscripciones')}
                        />
                    </div>
                    <div className="col-6 col-xl-3">
                        <StatHighlight
                            label="Anuncios Publicados"
                            sublabel={`${stats.totalAnnouncements} registrados`}
                            value={stats.activeAnnouncements}
                            icon={Newspaper}
                            color={OASIS_COLORS.success}
                            onClick={() => navigate('/admin/announcements')}
                        />
                    </div>
                    <div className="col-6 col-xl-3">
                        <StatHighlight
                            label={isUserAdmin ? 'Recursos / Equipo' : 'Recursos Oasis'}
                            sublabel={isUserAdmin ? `${stats.totalUsers} cuentas en equipo` : 'Biblioteca digital'}
                            value={stats.totalResources}
                            icon={isUserAdmin ? Users : FolderOpen}
                            color="#8B5CF6"
                            onClick={() => navigate('/admin/recursos')}
                        />
                    </div>
                </div>
            </header>

            {/* 2. PULSO OPERATIVO REAL + STUDIO CULTO EN VIVO */}
            <div className="row g-4 mb-5">
                <div className="col-lg-8">
                    <GlassCard
                        id="alcance-card"
                        style={{
                            padding: '28px 30px',
                            borderRadius: '28px',
                            background: OASIS_COLORS.cardSurface,
                            border: `1px solid ${OASIS_COLORS.borderSubtle}`,
                            boxShadow: '0 20px 44px -18px rgba(18, 12, 31, 0.14)',
                            height: '100%'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                            <div>
                                <h4 style={{ fontFamily: 'Moonrising', fontSize: '1.08rem', color: OASIS_COLORS.textPrimary, margin: 0 }}>
                                    ACTIVIDAD <span style={{ color: OASIS_COLORS.accent }}>EN TIEMPO REAL</span>
                                </h4>
                                <p style={{ fontSize: '0.82rem', color: OASIS_COLORS.textMuted, margin: '4px 0 0', fontWeight: 600 }}>
                                    Ocupación real de eventos y últimas peticiones recibidas
                                </p>
                            </div>
                            <button
                                onClick={() => handleExportPDF('alcance-card')}
                                style={{
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
                                    border: `1px solid ${OASIS_COLORS.borderSubtle}`,
                                    color: OASIS_COLORS.textPrimary,
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Download size={14} color={OASIS_COLORS.accent} /> REPORTE PDF
                            </button>
                        </div>

                        <div className="row g-4">
                            {/* Columna A: Ocupación real de eventos */}
                            <div className="col-md-6">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', color: OASIS_COLORS.accent }}>
                                        Inscripciones por Evento
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/inscripciones')}
                                        style={{ background: 'none', border: 'none', color: OASIS_COLORS.textMuted, fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                    >
                                        Gestionar →
                                    </button>
                                </div>

                                {eventForms.length === 0 ? (
                                    <div style={{ padding: '22px', borderRadius: '18px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px dashed ${OASIS_COLORS.borderSubtle}`, textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.84rem', color: OASIS_COLORS.textMuted, margin: '0 0 10px 0' }}>No hay eventos creados todavía.</p>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/admin/inscripciones')}
                                            style={{ border: 'none', borderRadius: '999px', padding: '7px 16px', background: OASIS_COLORS.deepPurple, color: '#FFFFFF', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            Crear Evento
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {eventForms.slice(0, 3).map(form => {
                                            const count = submissionsByForm[form.id] ?? form.submissionCount ?? 0;
                                            const cap = Number(form.capacity) || 0;
                                            const pct = cap > 0 ? Math.min(100, Math.round((count / cap) * 100)) : 100;
                                            const evColor = form.styles?.primaryColor || OASIS_COLORS.accent;

                                            return (
                                                <div
                                                    key={form.id}
                                                    onClick={() => navigate('/admin/inscripciones')}
                                                    style={{
                                                        padding: '14px 16px',
                                                        borderRadius: '16px',
                                                        background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                                                        border: `1px solid ${OASIS_COLORS.borderSubtle}`,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                                        <span style={{ fontWeight: 800, fontSize: '0.86rem', color: OASIS_COLORS.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {form.title}
                                                        </span>
                                                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: evColor, flexShrink: 0 }}>
                                                            {cap > 0 ? `${count} / ${cap}` : `${count} inscritos`}
                                                        </span>
                                                    </div>
                                                    <div style={{ height: '7px', borderRadius: '999px', background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', overflow: 'hidden' }}>
                                                        <div
                                                            style={{
                                                                width: `${cap > 0 ? Math.max(4, pct) : (count > 0 ? 100 : 0)}%`,
                                                                height: '100%',
                                                                borderRadius: '999px',
                                                                backgroundColor: evColor
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Columna B: Últimas Peticiones Reales */}
                            <div className="col-md-6">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', color: OASIS_COLORS.accent }}>
                                        Últimas Peticiones
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/requests')}
                                        style={{ background: 'none', border: 'none', color: OASIS_COLORS.textMuted, fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                    >
                                        Ver bandeja →
                                    </button>
                                </div>

                                {recentRequests.length === 0 ? (
                                    <div style={{ padding: '22px', borderRadius: '18px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px dashed ${OASIS_COLORS.borderSubtle}`, textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.84rem', color: OASIS_COLORS.textMuted, margin: 0 }}>No hay peticiones registradas todavía.</p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {recentRequests.map(req => {
                                            const isPending = (req.status || 'pendiente').toLowerCase() === 'pendiente';
                                            return (
                                                <div
                                                    key={req.id}
                                                    onClick={() => navigate('/admin/requests')}
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderRadius: '14px',
                                                        background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                                                        border: `1px solid ${OASIS_COLORS.borderSubtle}`,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: OASIS_COLORS.textPrimary, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                            {req.isAnonymous ? 'Anónimo' : (req.name || req.fullName || 'Miembro Oasis')}
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: OASIS_COLORS.textMuted, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                            {req.type || req.category || 'Oración'}
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '999px',
                                                        fontSize: '0.66rem',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        backgroundColor: isPending ? 'rgba(245, 158, 11, 0.14)' : 'rgba(16, 185, 129, 0.14)',
                                                        color: isPending ? '#D97706' : '#059669',
                                                        flexShrink: 0,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        {isPending ? <Clock size={11} /> : <CheckCircle2 size={11} />}
                                                        {isPending ? 'Pendiente' : 'Atendida'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 3. CONTROL DE CULTO Y TRANSMISIÓN EN VIVO */}
                <div className="col-lg-4">
                    <GlassCard
                        style={{
                            padding: '30px',
                            borderRadius: '28px',
                            background: 'linear-gradient(160deg, #120C1F 0%, #241242 100%)',
                            border: `1px solid ${isCultoLive ? (isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success) : 'rgba(245, 158, 11, 0.32)'}`,
                            color: '#FFFFFF',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 22px 48px -18px rgba(18, 12, 31, 0.45)'
                        }}
                    >
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', color: isCultoLive ? (isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success) : OASIS_COLORS.accent }}>
                                    {isCultoLive ? (isOvertime ? 'ALERTA DESVÍO' : 'CULTO EN VIVO') : 'STUDIO OASIS'}
                                </span>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '999px',
                                    backgroundColor: stats.streamIsLive ? 'rgba(220, 38, 38, 0.2)' : 'rgba(255,255,255,0.08)',
                                    border: `1px solid ${stats.streamIsLive ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.14)'}`,
                                    fontSize: '0.66rem',
                                    fontWeight: 800,
                                    color: stats.streamIsLive ? '#FCA5A5' : 'rgba(255,255,255,0.72)'
                                }}>
                                    <Radio size={12} color={stats.streamIsLive ? '#EF4444' : 'rgba(255,255,255,0.6)'} />
                                    {stats.streamIsLive ? 'TV EN VIVO' : 'TV OFFLINE'}
                                </span>
                            </div>

                            {isCultoLive && currentActivity ? (
                                <div className="text-center my-3">
                                    <h2 style={{ fontFamily: 'Moonrising', fontSize: '1.35rem', margin: '0 0 6px', color: '#FFFFFF' }}>{currentActivity.actividad}</h2>
                                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginBottom: '18px' }}>Resp: {currentActivity.responsable}</p>
                                    <div style={{ fontSize: '3.2rem', fontWeight: 900, fontFamily: 'Moonrising', color: isOvertime ? OASIS_COLORS.error : '#FFFFFF', lineHeight: 1 }}>
                                        {formatLiveTime(remainingTime)}
                                    </div>
                                    <p style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.55)', marginTop: '10px', textTransform: 'uppercase' }}>
                                        {isOvertime ? 'Tiempo Excedido' : 'Tiempo Restante'}
                                    </p>
                                </div>
                            ) : (
                                <div className="my-2">
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.14)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Layers size={24} color={OASIS_COLORS.accent} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontFamily: 'Moonrising', fontSize: '1.35rem', margin: 0, color: '#FFFFFF' }}>Orden de Culto</h3>
                                            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
                                                {ordenCulto.length} {ordenCulto.length === 1 ? 'bloque programado' : 'bloques programados'}
                                            </span>
                                        </div>
                                    </div>

                                    {stats.nextActivity ? (
                                        <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1.2px', color: OASIS_COLORS.accent, textTransform: 'uppercase' }}>
                                                Siguiente actividad
                                            </span>
                                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#FFFFFF', marginTop: '4px' }}>
                                                {stats.nextActivity.actividad}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>
                                                {stats.nextActivity.hora ? `${stats.nextActivity.hora} · ` : ''}{stats.nextActivity.responsable || 'Equipo Oasis'}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
                                            Sin bloques pendientes en el orden actual.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/admin/culto')}
                            style={{
                                width: '100%',
                                marginTop: '22px',
                                padding: '14px',
                                borderRadius: '14px',
                                border: `1px solid ${isCultoLive ? (isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success) : OASIS_COLORS.accent}`,
                                background: isCultoLive ? (isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success) : 'rgba(245, 158, 11, 0.12)',
                                color: isCultoLive ? '#08050D' : OASIS_COLORS.accent,
                                fontWeight: 900,
                                fontSize: '0.8rem',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                transition: '0.25s'
                            }}
                            className="hover-gold"
                        >
                            {isCultoLive ? 'IR AL PANEL EN VIVO' : 'ENTRAR A CONTROL'}
                        </button>
                    </GlassCard>
                </div>
            </div>

            {/* 4. SISTEMA MODULAR COMPLETO */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 style={{ fontFamily: 'Moonrising', fontSize: '1.05rem', color: OASIS_COLORS.textPrimary, margin: 0 }}>
                    SISTEMA <span style={{ color: OASIS_COLORS.accent }}>MODULAR</span>
                </h4>
                {searchQuery && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: OASIS_COLORS.textMuted }}>
                        Mostrando {filteredModules.length} resultados para "{searchQuery}"
                    </span>
                )}
            </div>

            {filteredModules.length === 0 ? (
                <GlassCard style={{ padding: '32px', borderRadius: '24px', background: OASIS_COLORS.cardSurface, border: `1px solid ${OASIS_COLORS.borderSubtle}`, textAlign: 'center' }}>
                    <p style={{ color: OASIS_COLORS.textMuted, margin: '0 0 12px 0' }}>No se encontraron módulos que coincidan con "{searchQuery}".</p>
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{ border: 'none', borderRadius: '999px', padding: '8px 18px', background: OASIS_COLORS.deepPurple, color: '#FFFFFF', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                        Limpiar filtro
                    </button>
                </GlassCard>
            ) : (
                <div className="row g-3 mb-5">
                    {filteredModules.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <div key={m.link + i} className="col-6 col-md-4 col-xl-3">
                                <motion.div whileHover={{ y: -5 }} className="h-100" onClick={() => navigate(m.link)} style={{ cursor: 'pointer' }}>
                                    <GlassCard style={{
                                        padding: '22px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        height: '100%',
                                        borderRadius: '24px',
                                        background: OASIS_COLORS.cardSurface,
                                        border: `1px solid ${OASIS_COLORS.borderSubtle}`,
                                        boxShadow: '0 14px 30px -18px rgba(18, 12, 31, 0.14)'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: `${m.color}18`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon size={21} strokeWidth={2.3} />
                                            </div>
                                            <ArrowRight size={15} color={OASIS_COLORS.textMuted} />
                                        </div>
                                        <h6 style={{ fontFamily: 'Moonrising', fontSize: '0.86rem', color: OASIS_COLORS.textPrimary, margin: '0 0 5px 0', letterSpacing: '0.6px' }}>{m.title}</h6>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.color }}>{m.info}</span>
                                        <div style={{ position: 'absolute', bottom: '-12px', right: '-12px', opacity: 0.04, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
                                            <Icon size={76} color={m.color} />
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @font-face { font-family: 'Moonrising'; src: url('/fonts/Moonrising.ttf'); }
                .hover-gold:hover { background: ${OASIS_COLORS.accent} !important; color: ${OASIS_COLORS.midnight} !important; }
                .dash-spin { animation: dash-rotate 0.9s linear infinite; }
                @keyframes dash-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Dashboard;
