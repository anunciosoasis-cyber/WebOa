"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import apiClient from '../../api/client';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarSection = () => {
    const { theme } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    // Paleta Oasis Deep Purple
    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        softBg: '#F8F9FC',
        shadow: 'rgba(0, 0, 0, 0.12)'
    };

    const pickFirst = (...values) => values.find((v) => v !== undefined && v !== null && String(v).trim() !== '');

    const parseSpanishDate = (dateStr) => {
        if (!dateStr) return null;
        dateStr = dateStr.trim();
        
        // 1. Ya está en formato YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

        // 2. Formato numérico DD/MM/YYYY o DD-MM-YYYY
        const slashMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (slashMatch) {
            return `${slashMatch[3]}-${slashMatch[2].padStart(2, '0')}-${slashMatch[1].padStart(2, '0')}`;
        }

        // 3. Formato texto "23 de mayo de 2026" o "23 de Mayo del 2026"
        const textMatch = dateStr.toLowerCase().match(/(\d{1,2})\s+de\s+([a-z]+)\s+(?:de|del)\s+(\d{4})/);
        if (textMatch) {
            const [, day, monthStr, year] = textMatch;
            const months = { enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06', julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12' };
            if (months[monthStr]) {
                return `${year}-${months[monthStr]}-${day.padStart(2, '0')}`;
            }
        }

        return null; // Si no se pudo parsear (ej. "Próximo Sábado") no aparecerá en la grilla exacta
    };

    const normalizeAnnouncement = (ann) => {
        let form = {};
        if (ann?.formData && typeof ann.formData === 'string') {
            try { form = JSON.parse(ann.formData); } catch { form = {}; }
        } else if (ann?.formData && typeof ann.formData === 'object') {
            form = ann.formData;
        }

        if (Object.keys(form).length === 0 && ann?.content && typeof ann.content === 'string' && ann.content.startsWith('{')) {
            try { form = JSON.parse(ann.content); } catch { /* ignore */ }
        }

        const rawDate = pickFirst(ann?.date, form?.date, '');
        const parsedDate = parseSpanishDate(rawDate) || ann?.eventDate;

        return {
            ...ann,
            id: ann?.id,
            title: pickFirst(ann?.title, form?.title, 'Evento'),
            rawDate: rawDate,
            date: parsedDate, // YYYY-MM-DD para la lógica del calendario
            time: pickFirst(ann?.time, form?.time, ''),
            location: pickFirst(ann?.location, form?.location, ''),
        };
    };

    useEffect(() => {
        apiClient.get('/announcements')
            .then(({ data }) => {
                const resData = Array.isArray(data) ? data : (data?.data || []);
                const normalizedEvents = resData.map(normalizeAnnouncement);
                setEvents(normalizedEvents.filter(ev => ev.date));
            })
            .catch(err => console.error("Calendar Fetch Error:", err));
    }, []);

    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => {
        let day = new Date(y, m, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["L", "M", "M", "J", "V", "S", "D"];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const renderDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ padding: '10px' }}></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEvents = events.filter(ev => ev.date === dateStr);
            const hasEvents = dayEvents.length > 0;
            const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const isSelected = selectedDate === dateStr;

            days.push(
                <motion.div
                    key={d}
                    whileHover={hasEvents ? { scale: 1.1, y: -2 } : {}}
                    onClick={() => hasEvents && setSelectedDate(isSelected ? null : dateStr)}
                    style={{
                        padding: '10px',
                        textAlign: 'center',
                        cursor: hasEvents ? 'pointer' : 'default',
                        borderRadius: '14px',
                        fontSize: '0.85rem',
                        fontWeight: (hasEvents || isToday) ? '800' : '500',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        backgroundColor: isSelected ? colors.accent : hasEvents ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                        color: isSelected ? colors.midnight : hasEvents ? colors.accent : colors.deepPurple,
                        border: isToday && !isSelected ? `1.5px solid ${colors.accent}` : '1.5px solid transparent',
                    }}
                >
                    {d}
                    {hasEvents && !isSelected && (
                        <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: colors.accent }} />
                    )}
                </motion.div>
            );
        }
        return days;
    };

    const selectedDayEvents = events.filter(ev => ev.date === selectedDate);

    return (
        <div style={{
            background: '#FFFFFF',
            borderRadius: '40px',
            padding: '40px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: `0 20px 50px -10px ${colors.shadow}`,
            border: '1px solid rgba(0,0,0,0.03)',
        }}>
            {/* HEADER DEL CALENDARIO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.accent, marginBottom: '5px' }}>
                        <LucideIcons.Calendar size={14} />
                        <span style={{ fontWeight: '900', letterSpacing: '2px', fontSize: '0.6rem', textTransform: 'uppercase' }}>Agenda</span>
                    </div>
                    <h3 style={{ fontFamily: 'Moonrising, sans-serif', color: colors.deepPurple, fontSize: '1.8rem', margin: 0 }}>
                        Eventos
                    </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: colors.softBg, padding: '8px 15px', borderRadius: '100px' }}>
                    <button onClick={prevMonth} className="cal-nav-btn"><LucideIcons.ChevronLeft size={16}/></button>
                    <span style={{ fontWeight: '800', fontSize: '0.85rem', minWidth: '100px', textAlign: 'center', color: colors.deepPurple, textTransform: 'uppercase' }}>
                        {monthNames[month]}
                    </span>
                    <button onClick={nextMonth} className="cal-nav-btn"><LucideIcons.ChevronRight size={16}/></button>
                </div>
            </div>

            {/* GRILLA DEL CALENDARIO */}
            <div style={{ background: colors.softBg, borderRadius: '24px', padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '15px' }}>
                    {dayNames.map((d, i) => (
                        <div key={i} style={{ textAlign: 'center', fontWeight: '900', color: colors.deepPurple, fontSize: '0.65rem', opacity: 0.4 }}>{d}</div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                    {renderDays()}
                </div>
            </div>

            {/* PANEL DE DETALLES DINÁMICO */}
            <div style={{ marginTop: '30px', flexGrow: 1 }}>
                <AnimatePresence mode="wait">
                    {selectedDate ? (
                        <motion.div 
                            key={selectedDate}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <p style={{ fontSize: '0.7rem', fontWeight: '900', color: colors.accent, textTransform: 'uppercase', marginBottom: '15px' }}>
                                Detalles del día
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedDayEvents.map(ev => (
                                    <div key={ev.id} style={{ 
                                        background: colors.softBg, 
                                        padding: '18px', 
                                        borderRadius: '20px', 
                                        borderLeft: `4px solid ${colors.accent}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '5px'
                                    }}>
                                        <span style={{ color: colors.deepPurple, fontWeight: '800', fontSize: '0.95rem' }}>{ev.title}</span>
                                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem', color: '#666', fontWeight: '600' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><LucideIcons.Clock size={12} color={colors.accent}/> {ev.time || '10:00 AM'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><LucideIcons.MapPin size={12} color={colors.accent}/> {ev.location || 'Templo'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 0', opacity: 0.3 }}>
                            <LucideIcons.CalendarDays size={40} style={{ marginBottom: '10px' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>Selecciona un día marcado para ver eventos</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .cal-nav-btn {
                    background: none; border: none; color: ${colors.deepPurple}; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: 0.2s;
                }
                .cal-nav-btn:hover { color: ${colors.accent}; transform: scale(1.2); }
                @font-face {
                    font-family: 'Moonrising';
                    src: url('/fonts/Moonrising.ttf');
                }
            `}</style>
        </div>
    );
};

export default CalendarSection;