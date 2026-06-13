import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useTheme } from '../react-ui/ThemeContext';
import GlassCard from '../react-ui/components/GlassCard';
import apiClient from '../api/client';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ProjectionWindow from './ProjectionWindow';
import {
    Clock, User, Plus, Trash2, CircleCheck, CircleAlert,
    Calendar as CalendarIcon, Bell, Users as UsersIcon,
    Music, Upload, Play, Pause, SkipForward, Download,
    FileSpreadsheet, UserPlus, X, Check,
    ChevronUp, ChevronDown, LayoutDashboard, Share2,
    FileText, Zap, Monitor, Save, ListChecks,
    History, CirclePlay, CircleStop, AlertTriangle, Timer, MonitorPlay
} from 'lucide-react';
import CountdownLiveModal from './CountdownLiveModal';
import AdminTransmisionInline from './AdminTransmisionInline';
import YoutubeLivePanel from './YoutubeLivePanel';

const OASIS_COLORS = {
    deepPurple: '#120C1F',
    midnight: '#08050D',
    accent: '#F59E0B',
    glassWhite: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
};

const PLANTILLAS_DEFAULT = [
    {
        id: 'adventista',
        nombre: '⛪ Culto Adventista Completo',
        secciones: [
            {
                id: 'sabatica',
                titulo: '🧠 Escuela Sabática & Repaso de la Lección',
                horario: '09:15',
                items: [
                    { actividad: 'Servicio de Alabanza Inicial',             responsable: '', duracion: 10, hora: '09:15' },
                    { actividad: 'Bienvenida y Oración Inicial',             responsable: '', duracion: 5,  hora: '09:25' },
                    { actividad: 'Informe del Progreso Misionero',           responsable: '', duracion: 5,  hora: '09:30' },
                    { actividad: 'Repaso de la Lección de Escuela Sabática', responsable: '', duracion: 45, hora: '09:35' },
                    { actividad: 'Clausura de Escuela Sabática',             responsable: '', duracion: 5,  hora: '10:20' },
                ],
            },
            {
                id: 'culto',
                titulo: '⚡ Servicio de Culto Divino (Oración y Adoración)',
                horario: '11:00',
                items: [
                    { actividad: 'Ejercicio de Canto',                         responsable: '', duracion: 5,  hora: '11:00' },
                    { actividad: 'Preludio Instrumental',                      responsable: '', duracion: 3,  hora: '11:05' },
                    { actividad: 'Bienvenida',                                 responsable: '', duracion: 3,  hora: '11:08' },
                    { actividad: 'Doxología / Entrada de Oficiantes',          responsable: '', duracion: 3,  hora: '11:11' },
                    { actividad: 'Invocación',                                 responsable: '', duracion: 3,  hora: '11:14' },
                    { actividad: 'Himno de Alabanza',                          responsable: '', duracion: 5,  hora: '11:17' },
                    { actividad: 'Oración de Rodillas',                        responsable: '', duracion: 5,  hora: '11:22' },
                    { actividad: 'Adoración por medio de Diezmos y Ofrendas', responsable: '', duracion: 10, hora: '11:27' },
                    { actividad: 'Momento Infantil',                           responsable: '', duracion: 7,  hora: '11:37' },
                    { actividad: 'Himno o Participación Especial',             responsable: '', duracion: 5,  hora: '11:44' },
                    { actividad: 'Lectura Bíblica',                            responsable: '', duracion: 3,  hora: '11:49' },
                    { actividad: 'Tema Principal (Sermón)',                    responsable: '', duracion: 30, hora: '11:52' },
                    { actividad: 'Himno Final',                                responsable: '', duracion: 5,  hora: '12:22' },
                    { actividad: 'Oración Final / Bendición Pastoral',         responsable: '', duracion: 3,  hora: '12:27' },
                    { actividad: 'Música Instrumental Postludio',              responsable: '', duracion: 5,  hora: '12:30' },
                ],
            },
        ],
    },
];

const CircularProgress = ({ percentage, size = 200, strokeWidth = 12, isOvertime }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    // Si está en sobretiempo, llenamos el círculo por completo en rojo estático o parpadeante
    const offset = isOvertime ? 0 : circumference - (percentage / 100) * circumference;
    const color = isOvertime ? OASIS_COLORS.error : percentage > 85 ? OASIS_COLORS.warning : OASIS_COLORS.accent;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="transparent" />
            <motion.circle
                cx={size / 2} cy={size / 2} r={radius}
                stroke={color} strokeWidth={strokeWidth} fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5, ease: "linear" }}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 10px ${color}26)` }} // 26 es 15% de opacidad en hex
            />
        </svg>
    );
};

const SectionHeader = ({ icon: Icon, title, subtitle, badge, isDark }) => (
    <div className="mb-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: OASIS_COLORS.accent + '15', color: OASIS_COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} />
            </div>
            <div>
                <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.9rem', margin: 0, color: OASIS_COLORS.accent }}>{title}</h4>
                {subtitle && <p style={{ fontSize: '0.7rem', opacity: 0.5, margin: 0, color: isDark ? '#fff' : '#64748b' }}>{subtitle}</p>}
            </div>
        </div>
        {badge}
    </div>
);

const AdminCulto = () => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const [orden, setOrden] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [showCountdown, setShowCountdown] = useState(false);
    const [showProjection, setShowProjection] = useState(false);
    const [showPlantilla, setShowPlantilla]       = useState(false);
    const [plantillaEdits, setPlantillaEdits]     = useState(null);
    const [plantillaCustom, setPlantillaCustom]   = useState(() => {
        try { return JSON.parse(localStorage.getItem('oasis_plantillas_custom') || '[]'); } catch { return []; }
    });
    const [nuevaPlantillaNombre, setNuevaPlantillaNombre] = useState('');
    const [plantillaModo, setPlantillaModo]               = useState('ver');
    const [serviceStartTime, setServiceStartTime] = useState(() => localStorage.getItem('culto_serviceStartTime') || null);
    const [currentActivityIndex, setCurrentActivityIndex] = useState(() => Number(localStorage.getItem('culto_currentActivityIndex')) || 0);
    const [isPaused, setIsPaused] = useState(() => localStorage.getItem('culto_isPaused') === 'true');
    const [elapsedSeconds, setElapsedSeconds] = useState(() => {
        const base = Number(localStorage.getItem('culto_elapsedSeconds')) || 0;
        const startTime = localStorage.getItem('culto_serviceStartTime');
        const paused = localStorage.getItem('culto_isPaused') === 'true';
        
        if (startTime && !paused) {
            const lastTick = Number(localStorage.getItem('culto_lastTickTime'));
            if (lastTick) {
                const diff = Math.floor((Date.now() - lastTick) / 1000);
                if (diff > 0 && diff < 86400) {
                    return base + diff;
                }
            }
        }
        return base;
    });

    // MEJORA: Estado para controlar si el usuario cerró temporalmente la alerta de la Escuela Sabática
    const [dismissedAlerts, setDismissedAlerts] = useState({});

    const { showToast } = useToast();

    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => { } });
    const [formData, setFormData] = useState({ actividad: '', responsable: '', hora: '', duracionEstimada: 5, fecha: selectedDate });

    const filteredOrden = useMemo(() => orden.filter(item => item.fecha === selectedDate), [orden, selectedDate]);

    useEffect(() => {
        fetchOrden();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (serviceStartTime) localStorage.setItem('culto_serviceStartTime', serviceStartTime);
        else localStorage.removeItem('culto_serviceStartTime');
        localStorage.setItem('culto_currentActivityIndex', currentActivityIndex.toString());
        localStorage.setItem('culto_elapsedSeconds', elapsedSeconds.toString());
        localStorage.setItem('culto_isPaused', isPaused.toString());
    }, [serviceStartTime, currentActivityIndex, elapsedSeconds, isPaused]);

    useEffect(() => {
        let timer;
        if (serviceStartTime && !isPaused) {
            localStorage.setItem('culto_lastTickTime', Date.now().toString());
            timer = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
                localStorage.setItem('culto_lastTickTime', Date.now().toString());
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [serviceStartTime, isPaused]);

    const fetchOrden = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/orden-culto');
            setOrden(data.sort((a, b) => a.hora.localeCompare(b.hora)));
        } catch (e) {
            console.error('Error fetching orden:', e);
        } finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        if (e) e.preventDefault();
        try {
            await apiClient.post('/orden-culto', { ...formData, fecha: selectedDate });
            setFormData({ actividad: '', responsable: '', hora: '', duracionEstimada: 5, fecha: selectedDate });
            setShowForm(false);
            fetchOrden();
            showToast('Bloque añadido', 'success');
        } catch (e) { showToast('Error', 'error'); }
    };

    const startService = () => {
        if (filteredOrden.length === 0) {
            showToast('No hay actividades para hoy', 'warning');
            return;
        }

        if (serviceStartTime) {
            setViewMode('live');
            return;
        }

        setConfirmConfig({
            show: true, title: '¿INICIAR SERVICIO?', message: 'Se activará el panel en vivo con el control de tiempos.', type: 'warning',
            onConfirm: async () => {
                const now = new Date();
                setServiceStartTime(now.toISOString());
                setElapsedSeconds(0);
                setCurrentActivityIndex(0);
                setIsPaused(false);
                setDismissedAlerts({});
                setConfirmConfig(p => ({ ...p, show: false }));
                try {
                    await apiClient.post('/youtube/broadcast/start');
                } catch(e) {
                    console.log('No YouTube broadcast started (maybe not linked or no active event).');
                }
            }
        });
    };

    const endService = () => {
        setConfirmConfig({
            show: true, title: '¿FINALIZAR CULTO?', message: 'Esto detendrá definitivamente el cronómetro y limpiará el progreso actual.', type: 'error',
            onConfirm: async () => {
                setServiceStartTime(null);
                setElapsedSeconds(0);
                setCurrentActivityIndex(0);
                setIsPaused(false);
                setDismissedAlerts({});
                localStorage.removeItem('culto_lastTickTime');
                setConfirmConfig(p => ({ ...p, show: false }));
                try {
                    await apiClient.post('/youtube/broadcast/stop');
                } catch(e) {
                    console.log('No YouTube broadcast stopped.');
                }
            }
        });
    };

    const initPlantilla = (plantilla = PLANTILLAS_DEFAULT[0]) => {
        setPlantillaEdits(JSON.parse(JSON.stringify(plantilla)));
        setPlantillaModo('ver');
        setNuevaPlantillaNombre('');
        setShowPlantilla(true);
    };

    const updatePlantillaItem = (secIdx, itemIdx, field, value) => {
        setPlantillaEdits(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.secciones[secIdx].items[itemIdx][field] = value;
            return next;
        });
    };

    const addItemToSeccion = (secIdx) => {
        setPlantillaEdits(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.secciones[secIdx].items.push({ actividad: '', responsable: '', duracion: 5, hora: '' });
            return next;
        });
    };

    const removeItemFromSeccion = (secIdx, itemIdx) => {
        setPlantillaEdits(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.secciones[secIdx].items.splice(itemIdx, 1);
            return next;
        });
    };

    const handleAplicarPlantilla = async () => {
        if (!plantillaEdits) return;
        const allItems = plantillaEdits.secciones.flatMap(s => s.items.filter(i => i.actividad.trim()));
        try {
            for (const item of allItems) {
                await apiClient.post('/orden-culto', {
                    actividad: item.actividad,
                    responsable: item.responsable || '—',
                    hora: item.hora || '09:00',
                    duracionEstimada: item.duracion || 5,
                    fecha: selectedDate,
                });
            }
            await fetchOrden();
            showToast(`${allItems.length} actividades aplicadas a ${selectedDate}`, 'success');
            setShowPlantilla(false);
        } catch {
            showToast('Error al aplicar plantilla', 'error');
        }
    };

    const handleGuardarPlantilla = () => {
        if (!plantillaEdits || !nuevaPlantillaNombre.trim()) return;
        const nueva = { ...JSON.parse(JSON.stringify(plantillaEdits)), id: `custom_${Date.now()}`, nombre: nuevaPlantillaNombre };
        const updated = [...plantillaCustom, nueva];
        setPlantillaCustom(updated);
        localStorage.setItem('oasis_plantillas_custom', JSON.stringify(updated));
        showToast('Plantilla guardada', 'success');
        setNuevaPlantillaNombre('');
        setPlantillaModo('ver');
    };

    const currentActivity = useMemo(() => filteredOrden[currentActivityIndex] || null, [filteredOrden, currentActivityIndex]);

    // MEJORA: Cálculos de tiempos exactos y control de sobretiempo
    const timeMetrics = useMemo(() => {
        if (!currentActivity) return { remaining: 0, percentage: 0, isOvertime: false };
        const totalDurationSeconds = (currentActivity.duracionEstimada || 5) * 60;
        const remaining = totalDurationSeconds - elapsedSeconds;
        const isOvertime = remaining < 0;
        const percentage = Math.min((elapsedSeconds / totalDurationSeconds) * 100, 100);

        return { remaining, percentage, isOvertime };
    }, [currentActivity, elapsedSeconds]);

    // MEJORA LÓGICA: Detección inteligente de ventana emergente para Escuela Sabática
    const shouldShowEspecialAlert = useMemo(() => {
        if (!currentActivity) return false;

        const nameNormalized = currentActivity.actividad.toLowerCase();
        const isSabatica = nameNormalized.includes('sabatica') || nameNormalized.includes('sabática');

        // Mostrar alerta si es Escuela Sabática y quedan menos de 2 minutos (120 seg) o ya está en sobretiempo
        const targetAlertReached = timeMetrics.remaining <= 120;
        const isDismissed = dismissedAlerts[currentActivityIndex];

        return isSabatica && targetAlertReached && !isDismissed;
    }, [currentActivity, timeMetrics.remaining, dismissedAlerts, currentActivityIndex]);

    const formatTime = (totalSeconds) => {
        const absoluteSeconds = Math.abs(totalSeconds);
        const mins = Math.floor(absoluteSeconds / 60);
        const secs = absoluteSeconds % 60;
        const sign = totalSeconds < 0 ? "-" : "";
        return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExportPDF = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const element = document.getElementById('timeline-printable');
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: OASIS_COLORS.midnight });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, 10, 190, 0);
        doc.save(`Orden_${selectedDate}.pdf`);
    };

    return (
        <div className="container-fluid pb-5 px-3 px-md-5 pt-4 pt-md-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh' }}>

            {/* VENTANA EMERGENTE: CONTADOR DE ESCUELA SABÁTICA */}
            <AnimatePresence>
                {shouldShowEspecialAlert && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000, background: 'rgba(5, 3, 10, 0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ maxWidth: '500px', width: '100%', padding: '20px' }}
                        >
                            <div
                                className="text-center position-relative"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: `2px solid ${timeMetrics.isOvertime ? OASIS_COLORS.error : OASIS_COLORS.warning}`,
                                    borderRadius: '32px',
                                    padding: '40px 30px',
                                    boxShadow: `0 0 40px ${timeMetrics.isOvertime ? OASIS_COLORS.error : OASIS_COLORS.warning}26` // 26 es 15% en hex
                                }}
                            >
                                <div className="mb-3 d-inline-flex p-3 rounded-circle" style={{ background: timeMetrics.isOvertime ? `${OASIS_COLORS.error}15` : `${OASIS_COLORS.warning}15`, color: timeMetrics.isOvertime ? OASIS_COLORS.error : OASIS_COLORS.warning }}>
                                    <AlertTriangle size={36} className={timeMetrics.isOvertime ? "animate-pulse" : ""} />
                                </div>
                                <h3 style={{ fontFamily: 'Moonrising', fontSize: '1.2rem', color: '#fff', letterSpacing: '1px' }}>
                                    {timeMetrics.isOvertime ? 'TIEMPO EXPIRADO' : 'CONCLUIR ESCUELA SABÁTICA'}
                                </h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.7, color: '#fff' }}>
                                    {timeMetrics.isOvertime ? 'El bloque central de la clase ha excedido el límite asignado.' : 'Por favor hermano(a), vaya finalizando el repaso del folleto y recolectando el registro.'}
                                </p>

                                <div
                                    style={{
                                        fontSize: '4.5rem',
                                        fontFamily: 'Moonrising',
                                        fontWeight: 900,
                                        color: timeMetrics.isOvertime ? OASIS_COLORS.error : '#fff',
                                        lineHeight: 1,
                                        margin: '25px 0'
                                    }}
                                >
                                    {formatTime(timeMetrics.remaining)}
                                </div>

                                <div className="d-flex gap-3 mt-4">
                                    <button
                                        onClick={() => setDismissedAlerts(p => ({ ...p, [currentActivityIndex]: true }))}
                                        className="btn rounded-pill px-4 py-2 w-100 text-white-50 small btn-outline-light border-0"
                                        style={{ background: 'rgba(255,255,255,0.05)' }}
                                    >
                                        IGNORAR AVISO
                                    </button>
                                    <button
                                        onClick={() => { setCurrentActivityIndex(p => p + 1); setElapsedSeconds(0); }}
                                        className="btn rounded-pill px-4 py-2 w-100 fw-bold text-dark"
                                        style={{ background: timeMetrics.isOvertime ? OASIS_COLORS.error : OASIS_COLORS.accent }}
                                    >
                                        SIGUIENTE BLOQUE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VENTANA EMERGENTE: PROYECCIÓN (SE ABRE EN UNA NUEVA PESTAÑA/VENTANA REAL) */}
            <AnimatePresence>
                {showProjection && (
                    <ProjectionWindow onClose={() => setShowProjection(false)}>
                        <div 
                            className="w-100 h-100 d-flex flex-column align-items-center justify-content-center" 
                            style={{ 
                                height: '100vh',
                                width: '100vw',
                                position: 'relative',
                                backgroundImage: 'url("https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=2070&auto=format&fit=crop")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Overlay oscuro para legibilidad */}
                            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.6)' }}></div>
                            
                            <div className="position-relative text-center w-100 px-4" style={{ zIndex: 1 }}>
                                <h2 style={{ fontFamily: 'Moonrising, sans-serif', fontSize: '3.5rem', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.8)', marginBottom: '30px' }}>
                                    {currentActivity?.actividad || 'PROGRAMA FINALIZADO'}
                                </h2>
                                <div style={{
                                    fontSize: '20vw',
                                    fontWeight: 900,
                                    color: timeMetrics.isOvertime ? OASIS_COLORS.error : '#fff',
                                    fontFamily: 'Moonrising, sans-serif',
                                    lineHeight: 1,
                                    textShadow: '0 10px 40px rgba(0,0,0,0.8)'
                                }}>
                                    {formatTime(timeMetrics.remaining)}
                                </div>
                                <p className="opacity-75 fw-bold tracking-widest mt-5" style={{ color: '#fff', fontSize: '2vw', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                                    {timeMetrics.isOvertime ? 'TIEMPO EXCEDIDO' : 'TIEMPO RESTANTE'}
                                </p>
                            </div>

                            <div className="position-absolute bottom-0 end-0 p-5 d-flex gap-3" style={{ zIndex: 2 }}>
                                <button onClick={(e) => {
                                    const doc = e.target.ownerDocument;
                                    if (!doc.fullscreenElement) {
                                        doc.documentElement.requestFullscreen().catch(err => console.log(err));
                                    } else {
                                        doc.exitFullscreen();
                                    }
                                }} className="btn btn-dark rounded-circle p-3 shadow" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Monitor size={24} color="#fff" />
                                </button>
                            </div>
                        </div>
                    </ProjectionWindow>
                )}
            </AnimatePresence>

            {/* Header del Modulo */}
            <header className="mb-5 d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-end gap-4">
                <div>
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Real-time Production</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                        STUDIO <span style={{ color: OASIS_COLORS.accent }}>OASIS</span>
                    </h1>
                </div>
                <div className="d-flex flex-wrap flex-md-nowrap gap-3 align-items-center w-100 w-lg-auto mt-3 mt-lg-0">
                    <div className="px-4 py-3 rounded-pill d-flex align-items-center justify-content-between gap-3 w-100 w-md-auto" style={{ background: isDark ? OASIS_COLORS.glassWhite : '#fff', border: `1px solid ${isDark ? OASIS_COLORS.glassBorder : 'rgba(0,0,0,0.1)'}`, boxShadow: isDark ? 'none' : '0 10px 25px rgba(0,0,0,0.05)', minWidth: '220px' }}>
                        <div className="d-flex align-items-center gap-2">
                            <CalendarIcon size={16} color={OASIS_COLORS.accent} />
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={`border-0 bg-transparent fw-bold ${isDark ? 'text-white' : 'text-dark'}`} style={{ outline: 'none', fontSize: '0.9rem' }} />
                        </div>
                    </div>
                    {serviceStartTime ? (
                        <button onClick={endService} className="btn rounded-pill px-5 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 w-100 w-md-auto transition-all" style={{ background: '#FF444415', color: '#FF4444', border: '1px solid #FF4444', fontSize: '0.9rem', boxShadow: 'none' }}>
                            <CircleStop size={18} /> FINALIZAR CULTO
                        </button>
                    ) : (
                        <button onClick={startService} className="btn rounded-pill px-5 py-3 fw-bold text-dark d-flex align-items-center justify-content-center gap-2 w-100 w-md-auto transition-all hover-scale" style={{ background: OASIS_COLORS.accent, fontSize: '0.9rem', boxShadow: `0 10px 25px ${OASIS_COLORS.accent}40`, border: 'none' }}>
                            <CirclePlay size={18} /> INICIAR VIVO
                        </button>
                    )}
                </div>
            </header>

            {showCountdown && <CountdownLiveModal onClose={() => setShowCountdown(false)} />}

            <div className="row g-4">
                {/* ── COLUMNA PRINCIPAL (IZQUIERDA/ARRIBA): OPERACIÓN & OBS ── */}
                <div className="col-xl-8 col-lg-7 order-1 d-flex flex-column gap-4">
                    {/* Tarjeta del Vivo (Contador Integrado) */}
                    {serviceStartTime ? (
                        <GlassCard className="p-4" style={{ borderRadius: '30px', border: `1px solid ${timeMetrics.isOvertime ? OASIS_COLORS.error : OASIS_COLORS.accent}26`, background: `radial-gradient(circle at top right, ${timeMetrics.isOvertime ? OASIS_COLORS.error : OASIS_COLORS.accent}26, transparent)`, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                            <div className="d-flex flex-column flex-md-row align-items-center text-center text-md-start gap-4">
                                <div className="position-relative d-inline-block flex-shrink-0">
                                    <CircularProgress percentage={timeMetrics.percentage} size={140} isOvertime={timeMetrics.isOvertime} strokeWidth={8} />
                                    <div className="position-absolute top-50 start-50 translate-middle w-100 text-center">
                                        <div style={{
                                            fontSize: '1.8rem',
                                            fontWeight: 900,
                                            color: timeMetrics.isOvertime ? OASIS_COLORS.error : (isDark ? '#fff' : '#000'),
                                            fontFamily: 'Moonrising',
                                            lineHeight: 1
                                        }}>
                                            {formatTime(timeMetrics.remaining)}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-100">
                                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
                                        <div className="rounded-circle animate-pulse" style={{ width: 8, height: 8, background: timeMetrics.isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success }} />
                                        <span style={{ color: timeMetrics.isOvertime ? OASIS_COLORS.error : OASIS_COLORS.success, fontWeight: 900, fontSize: '0.7rem', letterSpacing: '1px' }}>
                                            {timeMetrics.isOvertime ? 'ALERTA DE DESVÍO' : 'EN VIVO'}
                                        </span>
                                    </div>
                                    <h2 className="mb-3" style={{ fontFamily: 'Moonrising', fontSize: '1.5rem', color: isDark ? '#fff' : '#000' }}>{currentActivity?.actividad || 'PROGRAMA FINALIZADO'}</h2>

                                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-4 mb-4">
                                        <div className="text-center text-md-start">
                                            <div className="x-small opacity-50 fw-bold" style={{ color: isDark ? '#fff' : '#000' }}>RESPONSABLE</div>
                                            <div className="fw-bold" style={{ color: isDark ? '#fff' : '#000' }}>{currentActivity?.responsable || '—'}</div>
                                        </div>
                                        <div className="text-center text-md-start">
                                            <div className="x-small opacity-50 fw-bold" style={{ color: OASIS_COLORS.accent }}>TIEMPO</div>
                                            <div className="fw-bold" style={{ color: isDark ? '#fff' : '#000' }}>{currentActivity?.duracionEstimada || 0} min</div>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 justify-content-center justify-content-md-start mt-2">
                                        <button onClick={() => setIsPaused(!isPaused)} className="btn rounded-circle d-flex align-items-center justify-content-center" style={{ background: isPaused ? OASIS_COLORS.accent : OASIS_COLORS.glassWhite, color: isPaused ? '#000' : (isDark ? '#fff' : '#000'), border: `1px solid ${OASIS_COLORS.glassBorder}`, width: '48px', height: '48px' }} title={isPaused ? 'Reanudar' : 'Pausar'}>
                                            {isPaused ? <Play size={22} style={{marginLeft: '2px'}} /> : <Pause size={22} />}
                                        </button>
                                        <button onClick={() => { setCurrentActivityIndex(p => p + 1); setElapsedSeconds(0); }} className="btn rounded-circle d-flex align-items-center justify-content-center text-dark" style={{ background: OASIS_COLORS.accent, width: '48px', height: '48px' }} title="Siguiente Actividad">
                                            <SkipForward size={22} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ) : (
                        <GlassCard className="p-3 d-flex flex-row align-items-center justify-content-center text-center gap-3" style={{ borderRadius: '20px', border: `1px solid ${isDark ? OASIS_COLORS.glassBorder : 'rgba(0,0,0,0.1)'}`, background: isDark ? undefined : '#fff' }}>
                            <CircleStop size={24} className="opacity-25" style={{ color: isDark ? '#fff' : '#000' }} />
                            <div>
                                <h6 className="fw-bold opacity-50 mb-0" style={{ color: isDark ? '#fff' : '#000', fontSize: '0.9rem' }}>Culto no iniciado</h6>
                                <p className="x-small opacity-50 mb-0">Usa "INICIAR VIVO" para arrancar el cronómetro general.</p>
                            </div>
                        </GlassCard>
                    )}

                    {/* Consola Inline OBS Siempre Visible */}
                    <AdminTransmisionInline currentActivity={currentActivity} timeMetrics={timeMetrics} serviceStartTime={serviceStartTime} />
                </div>

                {/* ── COLUMNA SECUNDARIA (DERECHA/ABAJO): TIMELINE Y PLANIFICACIÓN ── */}
                <div className="col-xl-4 col-lg-5 order-2 d-flex flex-column gap-4">
                    <YoutubeLivePanel isDark={isDark} />
                    
                    <GlassCard className="p-4 p-md-5" style={{ borderRadius: '35px', border: `1px solid ${isDark ? OASIS_COLORS.glassBorder : 'rgba(0,0,0,0.1)'}`, background: isDark ? undefined : '#fff', boxShadow: isDark ? 'none' : '0 15px 35px rgba(0,0,0,0.15)' }}>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                            <SectionHeader icon={ListChecks} title="ORDEN DEL CULTO" subtitle="Cronograma detallado" isDark={isDark} />
                            <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
                                <button onClick={() => initPlantilla()} className="btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-1 flex-grow-1" style={{ background: 'rgba(245,158,11,0.08)', color: OASIS_COLORS.accent, border: `1px solid rgba(245,158,11,0.3)`, fontSize: '0.7rem' }}>
                                    <ListChecks size={14} /> PLANTILLA
                                </button>
                                <button onClick={() => setShowForm(true)} className="btn rounded-pill px-4 py-2 fw-bold flex-grow-1" style={{ background: `${OASIS_COLORS.accent}15`, color: OASIS_COLORS.accent, border: `1px solid ${OASIS_COLORS.accent}`, fontSize: '0.7rem' }}>
                                    + AGREGAR
                                </button>
                            </div>
                        </div>

                        <div className="timeline-view">
                            {filteredOrden.length === 0 ? (
                                <div className="text-center py-5 opacity-25">
                                    <LayoutDashboard size={48} className="mb-3" />
                                    <p className="fw-bold">No hay actividades programadas para este día.</p>
                                </div>
                            ) : (
                                filteredOrden.map((item, idx) => (
                                    <div key={item.id} className="d-flex gap-4 mb-4">
                                        <div className="text-end pt-2" style={{ width: '60px' }}>
                                            <span style={{ fontWeight: 900, color: OASIS_COLORS.accent, fontSize: '0.8rem' }}>{item.hora}</span>
                                        </div>
                                        <div className="position-relative">
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: OASIS_COLORS.accent, zIndex: 2, position: 'relative', marginTop: '12px', boxShadow: `0 0 10px ${OASIS_COLORS.accent}88` }} />
                                            {idx < filteredOrden.length - 1 && <div style={{ width: '2px', height: '100%', background: OASIS_COLORS.glassBorder, position: 'absolute', left: '5px', top: '24px' }} />}
                                        </div>
                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                            <div className="p-3 rounded-4 transition-all hover-glass" style={{ background: isDark ? OASIS_COLORS.glassWhite : '#fff', border: `1px solid ${isDark ? OASIS_COLORS.glassBorder : 'rgba(0,0,0,0.1)'}`, boxShadow: isDark ? 'none' : '0 10px 20px rgba(0,0,0,0.15)' }}>
                                                <div className="d-flex justify-content-between align-items-start align-items-sm-center flex-column flex-sm-row gap-2">
                                                    <div>
                                                        <h6 className={`mb-1 fw-bold ${isDark ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.9rem' }}>{item.actividad}</h6>
                                                        <div className={`d-flex gap-3 opacity-75 ${isDark ? 'text-white-50' : 'text-secondary'}`}>
                                                            <span className="x-small fw-bold"><User size={12} className="me-1" /> {item.responsable}</span>
                                                            <span className="x-small fw-bold"><Clock size={12} className="me-1" /> {item.duracionEstimada} min</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={async () => { await apiClient.delete(`/orden-culto/${item.id}`); fetchOrden(); }} className="btn p-2 text-danger opacity-25 hover-opacity-100"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard id="timeline-printable" className="p-4 p-md-5" style={{ borderRadius: '30px', border: `1px solid ${isDark ? OASIS_COLORS.glassBorder : 'rgba(0,0,0,0.1)'}`, background: isDark ? undefined : '#fff', boxShadow: isDark ? 'none' : '0 15px 35px rgba(0,0,0,0.15)' }}>
                        <SectionHeader icon={Share2} title="EXPORTAR" isDark={isDark} />
                        <div className="d-flex flex-column gap-2">
                            <button onClick={handleExportPDF} className="btn w-100 text-start rounded-4 p-3 d-flex align-items-center gap-3" style={{ background: isDark ? OASIS_COLORS.glassWhite : '#fff', color: isDark ? '#fff' : '#000', border: `1px solid ${isDark ? OASIS_COLORS.glassBorder : 'rgba(0,0,0,0.1)'}`, boxShadow: isDark ? 'none' : '0 8px 15px rgba(0,0,0,0.15)' }}>
                                <div className="p-2 rounded-3" style={{ background: '#FF444420', color: '#FF4444' }}><FileText size={20} /></div>
                                <div><span className="d-block fw-bold small">Reporte PDF</span><span className="x-small opacity-50">Versión para impresión</span></div>
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* MODAL FORM DE AGREGAR ACTIVIDAD */}
            <AnimatePresence>
                {showForm && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1050, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-100" style={{ maxWidth: '550px', padding: '20px' }}>
                            <GlassCard style={{ padding: '45px', borderRadius: '40px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                                <div className="d-flex justify-content-between mb-4">
                                    <h4 style={{ fontFamily: 'Moonrising', margin: 0 }}>NUEVO <span style={{ color: OASIS_COLORS.accent }}>BLOQUE</span></h4>
                                    <button onClick={() => setShowForm(false)} className="btn text-white-50 p-0"><X /></button>
                                </div>
                                <form onSubmit={handleCreate} className="row g-4">
                                    <div className="col-12">
                                        <label style={labelStyle}>Actividad</label>
                                        <input className="form-control oasis-input" required value={formData.actividad} onChange={e => setFormData({ ...formData, actividad: e.target.value })} placeholder="Ej: Escuela Sabática o Alabanza" />
                                    </div>
                                    <div className="col-12">
                                        <label style={labelStyle}>Responsable</label>
                                        <input className="form-control oasis-input" required value={formData.responsable} onChange={e => setFormData({ ...formData, responsable: e.target.value })} placeholder="Ej: Director del área" />
                                    </div>
                                    <div className="col-md-6">
                                        <label style={labelStyle}>Hora de Inicio</label>
                                        <input type="time" className="form-control oasis-input" required value={formData.hora} onChange={e => setFormData({ ...formData, hora: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label style={labelStyle}>Duración (min)</label>
                                        <input type="number" className="form-control oasis-input" required value={formData.duracionEstimada} onChange={e => setFormData({ ...formData, duracionEstimada: parseInt(e.target.value) || 5 })} />
                                    </div>
                                    <div className="col-12 mt-5">
                                        <button type="submit" className="btn rounded-pill w-100 py-3 fw-bold text-dark" style={{ background: OASIS_COLORS.accent, fontSize: '0.9rem', letterSpacing: '1px' }}>CONFIRMAR BLOQUE</button>
                                    </div>
                                </form>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── MODAL ORDEN SUGERIDO / PLANTILLA ───────────────────────── */}
            {showPlantilla && createPortal(
                <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 2500, background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(22px)', overflowY: 'auto', padding: '40px 20px' }}
                >
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <div>
                                <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.62rem', letterSpacing: '4px', textTransform: 'uppercase' }}>Programa del Sábado</span>
                                <h2 style={{ fontFamily: 'Moonrising', fontSize: '2rem', color: '#fff', margin: '4px 0 0' }}>
                                    ORDEN <span style={{ color: OASIS_COLORS.accent }}>SUGERIDO</span>
                                </h2>
                            </div>
                            <div className="d-flex gap-2 align-items-center flex-wrap">
                                {plantillaModo === 'nueva' ? (
                                    <>
                                        <input
                                            value={nuevaPlantillaNombre}
                                            onChange={e => setNuevaPlantillaNombre(e.target.value)}
                                            placeholder="Nombre de la plantilla..."
                                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '9px 20px', color: '#fff', fontSize: '0.83rem', outline: 'none', minWidth: '220px' }}
                                        />
                                        <button onClick={handleGuardarPlantilla} disabled={!nuevaPlantillaNombre.trim()} style={{ background: OASIS_COLORS.accent, color: '#000', border: 'none', borderRadius: '50px', padding: '10px 20px', fontWeight: 900, fontSize: '0.72rem', letterSpacing: '1px', cursor: 'pointer', opacity: nuevaPlantillaNombre.trim() ? 1 : 0.4, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Save size={14} /> GUARDAR
                                        </button>
                                        <button onClick={() => setPlantillaModo('ver')} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '10px 18px', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: '0.72rem' }}>
                                            CANCELAR
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setPlantillaModo('nueva')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '10px 18px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Plus size={14} /> GUARDAR COMO PLANTILLA
                                        </button>
                                        <button onClick={handleAplicarPlantilla} style={{ background: OASIS_COLORS.accent, color: '#000', border: 'none', borderRadius: '50px', padding: '10px 22px', fontWeight: 900, fontSize: '0.72rem', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Check size={14} /> APLICAR HOY
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setShowPlantilla(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '42px', height: '42px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Selector de plantilla (si hay más de una) */}
                        {[...PLANTILLAS_DEFAULT, ...plantillaCustom].length > 1 && (
                            <div className="d-flex gap-2 mb-5 flex-wrap">
                                {[...PLANTILLAS_DEFAULT, ...plantillaCustom].map(p => (
                                    <button key={p.id} onClick={() => setPlantillaEdits(JSON.parse(JSON.stringify(p)))}
                                        style={{ background: plantillaEdits?.id === p.id ? OASIS_COLORS.accent : 'rgba(255,255,255,0.06)', color: plantillaEdits?.id === p.id ? '#000' : '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '8px 20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        {p.nombre}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Secciones editables */}
                        {plantillaEdits?.secciones.map((seccion, secIdx) => (
                            <div key={seccion.id} style={{ marginBottom: '44px' }}>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h5 style={{ color: OASIS_COLORS.accent, fontFamily: 'Moonrising', fontSize: '0.85rem', letterSpacing: '2px', margin: 0 }}>
                                        {seccion.titulo}
                                        <span style={{ marginLeft: '12px', fontSize: '0.65rem', opacity: 0.45, fontFamily: 'sans-serif', fontWeight: 400, letterSpacing: '1px' }}>
                                            ⏰ {seccion.horario}
                                        </span>
                                    </h5>
                                    <button onClick={() => addItemToSeccion(secIdx)} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', padding: '5px 16px', color: OASIS_COLORS.accent, fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', letterSpacing: '1px' }}>
                                        + AÑADIR
                                    </button>
                                </div>

                                {/* Cabecera columnas */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px 36px', gap: '8px', padding: '0 16px', marginBottom: '6px' }}>
                                    {['ACTIVIDAD', 'RESPONSABLE', 'MIN', 'HORA', ''].map(h => (
                                        <span key={h} style={{ fontSize: '0.58rem', fontWeight: 900, color: 'rgba(255,255,255,0.22)', letterSpacing: '2px' }}>{h}</span>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {seccion.items.map((item, itemIdx) => (
                                        <div key={itemIdx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '10px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px 36px', gap: '8px', alignItems: 'center' }}>
                                            <input value={item.actividad} onChange={e => updatePlantillaItem(secIdx, itemIdx, 'actividad', e.target.value)} placeholder="Nombre de la actividad"
                                                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 600, width: '100%' }} />
                                            <input value={item.responsable} onChange={e => updatePlantillaItem(secIdx, itemIdx, 'responsable', e.target.value)} placeholder="Responsable"
                                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', width: '100%' }} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <input type="number" min="1" max="180" value={item.duracion} onChange={e => updatePlantillaItem(secIdx, itemIdx, 'duracion', parseInt(e.target.value) || 0)}
                                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: OASIS_COLORS.accent, fontSize: '0.82rem', fontWeight: 700, width: '40px', textAlign: 'right' }} />
                                                <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.65rem' }}>min</span>
                                            </div>
                                            <input type="time" value={item.hora} onChange={e => updatePlantillaItem(secIdx, itemIdx, 'hora', e.target.value)}
                                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', width: '100%' }} />
                                            <button onClick={() => removeItemFromSeccion(secIdx, itemIdx)}
                                                style={{ background: 'transparent', border: 'none', color: '#FF4444', cursor: 'pointer', opacity: 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Footer */}
                        <div style={{ position: 'sticky', bottom: 0, background: 'rgba(8,5,13,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '18px 0', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setShowPlantilla(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '12px 28px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                                CANCELAR
                            </button>
                            <button onClick={handleAplicarPlantilla} style={{ background: OASIS_COLORS.accent, color: '#000', border: 'none', borderRadius: '50px', padding: '12px 36px', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Check size={16} /> APLICAR AL DÍA ACTUAL
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmationModal
                show={confirmConfig.show} title={confirmConfig.title} message={confirmConfig.message} type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm} onCancel={() => setConfirmConfig(p => ({ ...p, show: false }))}
            />
            <style>{`
                .oasis-input { background: ${isDark ? OASIS_COLORS.glassWhite : '#fff'} !important; border: 1px solid ${OASIS_COLORS.glassBorder} !important; color: ${isDark ? '#fff' : '#120C1F'} !important; border-radius: 18px !important; padding: 14px 20px !important; font-size: 0.9rem !important; }
                .oasis-input:focus { border-color: ${OASIS_COLORS.accent} !important; box-shadow: 0 0 20px ${OASIS_COLORS.accent}20 !important; }
                .hover-glass:hover { background: rgba(255,255,255,0.06) !important; transform: translateX(5px); }
                .tracking-widest { letter-spacing: 0.2em; }
                .oasis-pulse-red { animation: pulseRed 1.5s infinite; }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            `}</style>
        </div>
    );
};

const labelStyle = { fontSize: '0.65rem', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '1px' };

export default AdminCulto;