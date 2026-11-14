"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users } from 'lucide-react';
import LucideByName from './LucideByName';
import { COLORS } from './AboutStyles';

// DATA PICTÓRICA POR DEFECTO - Estructura Colombia / América Latina
const DEPARTAMENTOS_OASIS = [
    {
        id: 'pastoria',
        name: 'Liderazgo Distrital',
        role: 'Pastor y Administración',
        type: 'pastor',
        img: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop',
        icon: 'UserCheck'
    },
    {
        id: 'ancianato',
        name: 'Cuerpo de Ancianos',
        role: 'Liderazgo Espiritual',
        type: 'departamento',
        img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
        icon: 'Shield'
    },
    {
        id: 'es',
        name: 'Escuela Sabática',
        role: 'Crecimiento y Discipulado',
        type: 'departamento',
        img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop',
        icon: 'BookOpen'
    },
    {
        id: 'jovenes',
        name: 'Sociedad de Jóvenes',
        role: 'Ministerio Juvenil - JA',
        type: 'departamento',
        img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
        icon: 'Zap'
    },
    {
        id: 'conquistadores',
        name: 'Club Conquistadores',
        role: 'Formación y Valores',
        type: 'clubes',
        img: 'https://images.unsplash.com/photo-1472393365320-dc77e9abe70a?q=80&w=1200&auto=format&fit=crop',
        icon: 'Compass'
    },
    {
        id: 'comunicaciones',
        name: 'Comunicaciones y Media',
        role: 'Evangelismo Digital',
        type: 'departamento',
        img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
        icon: 'Mic'
    },
    {
        id: 'diaconado',
        name: 'Diaconado',
        role: 'Servicio y Logística',
        type: 'departamento',
        img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop',
        icon: 'Handshake'
    }
];

const AboutBoard = ({ boardMembers = [], onSelectMember, getImageUrl }) => {
    const [isPaused, setIsPaused] = useState(false);

    // Si no llegan datos del backend, usamos nuestra data pictórica
    const displayMembers = Array.isArray(boardMembers) && boardMembers.length > 0
        ? boardMembers
        : DEPARTAMENTOS_OASIS;

    const getBadgeLabel = (type) => {
        if (type === 'pastor') return 'Pastor';
        if (type === 'clubes') return 'Clubes';
        return 'Departamento';
    };

    const IconRenderer = ({ name }) => (
        <LucideByName name={name} fallback={Users} size={12} />
    );

    return (
        <section
            style={{
                padding: '110px 0',
                background: `linear-gradient(180deg, ${COLORS.midnight} 0%, ${COLORS.deepPurple} 50%, ${COLORS.midnight} 100%)`,
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Subtle ambient gold glow */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: '8%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '520px',
                    height: '220px',
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none'
                }}
            />

            {/* Header de Sección */}
            <div style={{ maxWidth: 1200, margin: '0 auto 45px', padding: '0 20px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                <span style={{ color: COLORS.accent, fontWeight: 900, letterSpacing: 5, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    Liderazgo Eclesiástico
                </span>
                <h2
                    style={{
                        fontFamily: 'Moonrising, sans-serif',
                        color: '#fff',
                        fontSize: 'clamp(2rem, 5vw, 3.1rem)',
                        marginTop: '14px',
                        letterSpacing: '0.5px'
                    }}
                >
                    Junta <span style={{ color: COLORS.accent }}>Directiva</span>
                </h2>
                <div style={{ height: '3px', width: '48px', background: COLORS.accent, margin: '18px auto 0', opacity: 0.45, borderRadius: '999px' }} />
            </div>

            {/* Carrusel Infinito */}
            <div
                className="carousel-container"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <motion.div
                    className="carousel-track"
                    animate={{ x: isPaused ? undefined : ['0%', '-50%'] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: 'loop',
                            duration: 38,
                            ease: 'linear'
                        }
                    }}
                    style={{ display: 'flex', gap: '24px', width: 'fit-content' }}
                >
                    {[...displayMembers, ...displayMembers].map((member, idx) => (
                        <motion.div
                            key={`${member.id || idx}-${idx}`}
                            className="board-member-card"
                            whileHover={{ y: -10 }}
                            onClick={() => onSelectMember && onSelectMember(member)}
                            style={{
                                width: '290px',
                                flexShrink: 0,
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '30px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: '1px solid rgba(255, 255, 255, 0.09)',
                                backdropFilter: 'blur(12px)',
                                position: 'relative',
                                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            {/* Badge Dinámico */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '18px',
                                    right: '18px',
                                    zIndex: 10,
                                    background: member.type === 'pastor' ? COLORS.accent : 'rgba(18, 12, 31, 0.85)',
                                    border: member.type === 'pastor' ? 'none' : '1px solid rgba(255,255,255,0.14)',
                                    padding: '6px 13px',
                                    borderRadius: '100px',
                                    fontSize: '0.6rem',
                                    fontWeight: 900,
                                    color: member.type === 'pastor' ? COLORS.midnight : '#fff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <IconRenderer name={member.icon} />
                                {getBadgeLabel(member.type)}
                            </div>

                            {/* Contenedor Imagen */}
                            <div style={{ height: '310px', position: 'relative', overflow: 'hidden' }}>
                                <img
                                    src={getImageUrl ? getImageUrl(member.imageUrl || member.img) : (member.imageUrl || member.img)}
                                    alt={member.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
                                    className="member-img"
                                />
                                {/* Vignette gradient */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(180deg, transparent 45%, rgba(8, 5, 13, 0.92) 100%)',
                                        pointerEvents: 'none'
                                    }}
                                />
                                <div className="card-overlay">
                                    <Sparkles size={26} color={COLORS.accent} />
                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, marginTop: '10px', letterSpacing: '2px', color: COLORS.accent }}>
                                        VER DETALLES
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '22px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <h4
                                    style={{
                                        fontFamily: 'Moonrising, sans-serif',
                                        color: '#fff',
                                        fontSize: '1.02rem',
                                        marginBottom: '6px',
                                        letterSpacing: '0.4px'
                                    }}
                                >
                                    {member.name}
                                </h4>
                                <span
                                    style={{
                                        color: COLORS.accent,
                                        fontWeight: 800,
                                        fontSize: '0.66rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1.8px',
                                        opacity: 0.85
                                    }}
                                >
                                    {member.role}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Comentario General a pie de Galería */}
            <div
                style={{
                    maxWidth: '780px',
                    margin: '42px auto 0',
                    textAlign: 'center',
                    padding: '0 20px',
                    opacity: 0.65
                }}
            >
                <p style={{ color: '#fff', fontSize: '0.92rem', lineHeight: '1.8', fontStyle: 'italic', margin: 0 }}>
                    "El cuerpo directivo de Oasis representa la diversidad de talentos puestos al servicio de Dios. Cada departamento trabaja en sinergia para ser un canal de bendición en el territorio distrital."
                </p>
            </div>

            <style>{`
                .carousel-container { width: 100%; padding: 24px 0; cursor: grab; }
                .board-member-card { transition: border-color 0.35s ease, box-shadow 0.35s ease; }
                .board-member-card:hover {
                    border-color: rgba(245, 158, 11, 0.45) !important;
                    box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.18) !important;
                }
                .card-overlay {
                    position: absolute; inset: 0; background: rgba(12, 8, 22, 0.72);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    color: #fff; opacity: 0; transition: 0.35s ease; backdrop-filter: blur(6px);
                }
                .board-member-card:hover .card-overlay { opacity: 1; }
                .member-img { transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .board-member-card:hover .member-img { transform: scale(1.08); }
            `}</style>
        </section>
    );
};

export default AboutBoard;
