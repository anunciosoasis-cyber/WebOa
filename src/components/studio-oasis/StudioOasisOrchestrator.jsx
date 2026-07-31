import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useTheme } from '../../react-ui/ThemeContext';
import GlassCard from '../../react-ui/components/GlassCard';
import apiClient from '../../api/client';
import { useToast } from '../../react-ui/components/Toast';
import ConfirmationModal from '../../react-ui/components/ConfirmationModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ProjectionWindow from '../ProjectionWindow';
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
import PanelOBS from './panel_OBS/PanelOBS';
import YoutubeLivePanel from './YoutubeLivePanel';
import DateDisplay from './DateDisplay';
import CtrlCulto from './CtrlCulto';
import BtnOrdenCulto from './BtnOrdenCulto';
import PlantillaOrden from './PlantillaOrden';
import './OasisStyles.css';

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
                    { actividad: 'Servicio de Alabanza Inicial', responsable: '', duracion: 10, hora: '09:15' },
                    { actividad: 'Bienvenida y Oración Inicial', responsable: '', duracion: 5, hora: '09:25' },
                    { actividad: 'Informe del Progreso Misionero', responsable: '', duracion: 5, hora: '09:30' },
                    { actividad: 'Repaso de la Lección de Escuela Sabática', responsable: '', duracion: 45, hora: '09:35' },
                    { actividad: 'Clausura de Escuela Sabática', responsable: '', duracion: 5, hora: '10:20' },
                ],
            },
            {
                id: 'culto',
                titulo: '⚡ Servicio de Culto Divino (Oración y Adoración)',
                horario: '11:00',
                items: [
                    { actividad: 'Ejercicio de Canto', responsable: '', duracion: 5, hora: '11:00' },
                    { actividad: 'Preludio Instrumental', responsable: '', duracion: 3, hora: '11:05' },
                    { actividad: 'Bienvenida', responsable: '', duracion: 3, hora: '11:08' },
                    { actividad: 'Doxología / Entrada de Oficiantes', responsable: '', duracion: 3, hora: '11:11' },
                    { actividad: 'Invocación', responsable: '', duracion: 3, hora: '11:14' },
                    { actividad: 'Himno de Alabanza', responsable: '', duracion: 5, hora: '11:17' },
                    { actividad: 'Oración de Rodillas', responsable: '', duracion: 5, hora: '11:22' },
                    { actividad: 'Adoración por medio de Diezmos y Ofrendas', responsable: '', duracion: 10, hora: '11:27' },
                    { actividad: 'Momento Infantil', responsable: '', duracion: 7, hora: '11:37' },
                    { actividad: 'Himno o Participación Especial', responsable: '', duracion: 5, hora: '11:44' },
                    { actividad: 'Lectura Bíblica', responsable: '', duracion: 3, hora: '11:49' },
                    { actividad: 'Tema Principal (Sermón)', responsable: '', duracion: 30, hora: '11:52' },
                    { actividad: 'Himno Final', responsable: '', duracion: 5, hora: '12:22' },
                    { actividad: 'Oración Final / Bendición Pastoral', responsable: '', duracion: 3, hora: '12:27' },
                    { actividad: 'Música Instrumental Postludio', responsable: '', duracion: 5, hora: '12:30' },
                ],
            },
        ],
    },
];

const CircularProgress = ({ percentage, size = 200, strokeWidth = 12, isOvertime }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
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
                style={{ filter: `drop-shadow(0 0 10px ${color}26)` }}
            />
        </svg>
    );
};

const SectionHeader = ({ icon: Icon, title, subtitle, badge, isDark }) => (
    <div className="mb-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: OASIS_COLORS.accent + '15', color: OASIS_COLORS.accent, display: 'flex', alignItems: 'center', justifycontent: 'center' }}>
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
    const [showPlantilla, setShowPlantilla] = useState(false);
    const [plantillaEdits, setPlantillaEdits] = useState(null);
    const [plantillaCustom, setPlantillaCustom] = useState(() => {
        try { return JSON.parse(localStorage.getItem('oasis_plantillas_custom') || '[]'); } catch { return []; }
    });
    const [nuevaPlantillaNombre, setNuevaPlantillaNombre] = useState('');
    const [plantillaModo, setPlantillaModo] = useState('ver');
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

    const [blockElapsedSeconds, setBlockElapsedSeconds] = useState(() => {
        const base = Number(localStorage.getItem('culto_blockElapsedSeconds')) || 0;
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

    const handleSetCurrentActivityIndex = (newIndexUpdater) => {
        setCurrentActivityIndex(prev => {
            const nextVal = typeof newIndexUpdater === 'function' ? newIndexUpdater(prev) : newIndexUpdater;
            if (nextVal !== prev) {
                setBlockElapsedSeconds(0);
                localStorage.setItem('culto_blockElapsedSeconds', '0');
            }
            return nextVal;
        });
    };

    const [dismissedAlerts, setDismissedAlerts] = useState({});
    const { showToast } = useToast();

    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => { } });
    const [formData, setFormData] = useState({ actividad: '', responsable: '', hora: '', duracionEstimada: 5, fecha: selectedDate });

    const filteredOrden = useMemo(() => orden.filter(item => item.fecha === selectedDate), [orden, selectedDate]);

    useEffect(() => {
        fetchOrden();
    }, []);

    const [isBlockPaused, setIsBlockPaused] = useState(() => localStorage.getItem('culto_isBlockPaused') === 'true');

    useEffect(() => {
        if (serviceStartTime) localStorage.setItem('culto_serviceStartTime', serviceStartTime);
        else localStorage.removeItem('culto_serviceStartTime');
        localStorage.setItem('culto_currentActivityIndex', currentActivityIndex.toString());
        localStorage.setItem('culto_elapsedSeconds', elapsedSeconds.toString());
        localStorage.setItem('culto_blockElapsedSeconds', blockElapsedSeconds.toString());
        localStorage.setItem('culto_isPaused', isPaused.toString());
        localStorage.setItem('culto_isBlockPaused', isBlockPaused.toString());
    }, [serviceStartTime, currentActivityIndex, elapsedSeconds, blockElapsedSeconds, isPaused, isBlockPaused]);

    useEffect(() => {
        let timer;
        if (serviceStartTime && !isPaused) {
            localStorage.setItem('culto_lastTickTime', Date.now().toString());
            timer = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
                
                // Usamos el estado funcional para leer el valor actualizado de isBlockPaused
                setIsBlockPaused(currentPaused => {
                    if (!currentPaused) {
                        setBlockElapsedSeconds(prev => prev + 1);
                    }
                    return currentPaused;
                });
                
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

        if (serviceStartTime) return;

        setConfirmConfig({
            show: true, title: '¿INICIAR SERVICIO?', message: 'Se activará el panel en vivo con el control de tiempos.', type: 'warning',
            onConfirm: async () => {
                const now = new Date();
                setServiceStartTime(now.toISOString());
                setElapsedSeconds(0);
                setBlockElapsedSeconds(0);
                setCurrentActivityIndex(0);
                setIsPaused(false);
                setDismissedAlerts({});
                setConfirmConfig(p => ({ ...p, show: false }));
                try {
                    await apiClient.post('/youtube/broadcast/start');
                } catch (e) {
                    console.log('No YouTube broadcast started.');
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
                setBlockElapsedSeconds(0);
                setCurrentActivityIndex(0);
                setIsPaused(false);
                setDismissedAlerts({});
                localStorage.removeItem('culto_lastTickTime');
                setConfirmConfig(p => ({ ...p, show: false }));
                try {
                    await apiClient.post('/youtube/broadcast/stop');
                } catch (e) {
                    console.log('No YouTube broadcast stopped.');
                }
            }
        });
    };

    const loadPlantilla = (plantilla) => {
        setPlantillaEdits(JSON.parse(JSON.stringify(plantilla)));
        setPlantillaModo('ver');
        setNuevaPlantillaNombre('');
        setShowPlantilla(true);
    };

    const currentActivity = useMemo(() => filteredOrden[currentActivityIndex] || { actividad: "Sin actividad", hora: "0:00" }, [filteredOrden, currentActivityIndex]);
    const nextActivity = useMemo(() => filteredOrden[currentActivityIndex + 1] || { actividad: "--", hora: "--" }, [filteredOrden, currentActivityIndex]);

    const timeMetrics = useMemo(() => {
        if (!filteredOrden[currentActivityIndex]) return { remaining: 0, percentage: 0, isOvertime: false };
        const act = filteredOrden[currentActivityIndex];
        const totalDurationSeconds = (act.duracionEstimada || 5) * 60;
        const remaining = totalDurationSeconds - elapsedSeconds;
        const isOvertime = remaining < 0;
        const percentage = Math.min((elapsedSeconds / totalDurationSeconds) * 100, 100);

        return { remaining, percentage, isOvertime };
    }, [filteredOrden, currentActivityIndex, elapsedSeconds]);

    return (
        <main className="max-w-[1400px] mx-auto space-y-6 p-6 studio-oasis-theme">
            {showCountdown && <CountdownLiveModal onClose={() => setShowCountdown(false)} />}

            {/* BARRA SUPERIOR REORGANIZADA DE MANERA HERMÉTICA (Responsive) */}
            <header className="flex flex-col lg:flex-row items-center justify-between gap-6 w-full h-auto lg:h-[105px] select-none text-gray-900 mb-6 lg:mb-0">

                {/* Brand Logo Section */}
                <div className="flex flex-col select-none justify-center h-auto lg:h-full text-center lg:text-left">
                    <span className="font-moonrising text-[10px] font-normal uppercase tracking-[0.22em] text-gray-800">
                        Producción en tiempo real
                    </span>
                    <h1 className="font-moonrising text-5xl uppercase tracking-wide leading-[0.85] text-gray-950 mt-1">
                        Estudio <br />
                        <span className="text-oasis-orange">Oasis</span>
                    </h1>
                </div>

                {/* CONTENEDOR DE PANELES OPERATIVOS */}
                <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-end gap-4 flex-1 h-auto lg:h-full bg-ui-bg p-2 rounded-[2rem] shadow-neumorph-inset border border-white/40 min-w-0 w-full">

                    {/* YouTube Studio Status Component */}
                    <div className="h-auto lg:h-full flex items-center shrink-0">
                        <YoutubeLivePanel isDark={false} />
                    </div>

                    {/* MÓDULO FECHA Y CONTROLES CRONÓMETRO */}
                    <div className="flex flex-col gap-2 w-[165px] h-auto lg:h-full shrink-0">
                        {/* Caja del Indicador Hoy / Fecha (Componente Modular) */}
                        <DateDisplay selectedDate={selectedDate} />

                        {/* Caja de Mandos Multimedia Neumórficos (Componente Modular) */}
                        <CtrlCulto 
                            isPaused={isPaused} 
                            setIsPaused={setIsPaused} 
                            startService={startService} 
                            endService={endService} 
                            serviceStartTime={serviceStartTime}
                        />
                    </div>

                    {/* MÓDULO PANEL ORDEN DE CULTO CON CRONOGRAMA INTEGRADO (Componente Modular) */}
                    <BtnOrdenCulto
                        currentActivity={currentActivity}
                        nextActivity={nextActivity}
                        setCurrentActivityIndex={handleSetCurrentActivityIndex}
                        filteredOrden={filteredOrden}
                        setShowForm={setShowForm}
                        setShowPlantilla={setShowPlantilla}
                        PLANTILLAS_DEFAULT={PLANTILLAS_DEFAULT}
                        blockElapsedSeconds={blockElapsedSeconds}
                        serviceStartTime={serviceStartTime}
                        isBlockPaused={isBlockPaused}
                        setIsBlockPaused={setIsBlockPaused}
                    />
                </div>
            </header>

            {/* ZONA CENTRAL DE CONTROL DE PRODUCCIÓN */}
            <div className="bg-ui-bg p-6 rounded-[2rem] shadow-neumorph-inset border border-white/40">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <PanelOBS
                        timeMetrics={{ elapsedSeconds, isPaused, serviceStartTime }}
                        currentActivity={filteredOrden[currentActivityIndex]}
                        startService={startService}
                        endService={endService}
                    />
                </div>
            </div>

            {/* MODAL DE SELECCIÓN DE PLANTILLAS */}
            <PlantillaOrden 
                showPlantilla={showPlantilla}
                setShowPlantilla={setShowPlantilla}
                plantillasDefault={PLANTILLAS_DEFAULT}
                plantillasCustom={plantillaCustom}
                selectedDate={selectedDate}
                apiClient={apiClient}
                fetchOrden={fetchOrden}
                showToast={showToast}
            />
            <ConfirmationModal 
                show={confirmConfig.show}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(p => ({ ...p, show: false }))} 
            />
        </main>
    );
};
const labelStyle = { fontSize: '0.65rem', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '1px' };

export default AdminCulto;