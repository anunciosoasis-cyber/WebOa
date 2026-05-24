"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { COLORS } from './AboutStyles';

// DATA PICTÓRICA POR DEFECTO - Estructura Colombia / América Latina
const DEPARTAMENTOS_OASIS = [
    { 
        id: 'pastoria', 
        name: "Liderazgo Distrital", 
        role: "Pastor y Administración", 
        type: 'pastor', 
        img: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop',
        icon: 'UserCheck'
    },
    { 
        id: 'ancianato', 
        name: "Cuerpo de Ancianos", 
        role: "Liderazgo Espiritual", 
        type: 'departamento', 
        img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
        icon: 'Shield'
    },
    { 
        id: 'es', 
        name: "Escuela Sabática", 
        role: "Crecimiento y Discipulado", 
        type: 'departamento', 
        img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop',
        icon: 'BookOpen'
    },
    { 
        id: 'jovenes', 
        name: "Sociedad de Jóvenes", 
        role: "Ministerio Juvenil - JA", 
        type: 'departamento', 
        img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
        icon: 'Zap'
    },
    { 
        id: 'conquistadores', 
        name: "Club Conquistadores", 
        role: "Formación y Valores", 
        type: 'clubes', 
        img: 'https://images.unsplash.com/photo-1472393365320-dc77e9abe70a?q=80&w=1200&auto=format&fit=crop',
        icon: 'Compass'
    },
    { 
        id: 'comunicaciones', 
        name: "Comunicaciones y Media", 
        role: "Evangelismo Digital", 
        type: 'departamento', 
        img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
        icon: 'Mic'
    },
    { 
        id: 'diaconado', 
        name: "Diaconado", 
        role: "Servicio y Logística", 
        type: 'departamento', 
        img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop',
        icon: 'Handshake'
    }
];

const AboutBoard = ({ boardMembers = [], onSelectMember, getImageUrl }) => {
    const [isPaused, setIsPaused] = useState(false);

    // Si no llegan datos del backend, usamos nuestra data pictórica
    const displayMembers = boardMembers.length > 0 ? boardMembers : DEPARTAMENTOS_OASIS;

    const getBadgeLabel = (type) => {
        if (type === 'pastor') return 'Pastor';
        if (type === 'clubes') return 'Clubes';
        return 'Departamento';
    };

    const IconRenderer = ({ name }) => {
        const Icon = LucideIcons[name] || LucideIcons.Users;
        return <Icon size={12} />;
    };

    return (
        <section style={{ 
            padding: '120px 0', 
            background: COLORS.midnight, 
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Header de Sección */}
            <div style={{ maxWidth: 1200, margin: '0 auto 50px', padding: '0 20px', textAlign: 'center' }}>
                <span style={{ color: COLORS.accent, fontWeight: 900, letterSpacing: 5, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Liderazgo Eclesiástico
                </span>
                <h2 style={{ 
                    fontFamily: 'Moonrising, sans-serif', 
                    color: '#fff', 
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    marginTop: '15px'
                }}>
                    Junta <span style={{ color: COLORS.accent }}>Directiva</span>
                </h2>
                <div style={{ height: '2px', width: '40px', background: COLORS.accent, margin: '20px auto', opacity: 0.3 }} />
            </div>

            {/* Carrusel Infinito */}
            <div 
                className="carousel-container"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <motion.div 
                    className="carousel-track"
                    animate={{ x: isPaused ? undefined : ["0%", "-50%"] }}
                    transition={{ 
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 35,
                            ease: "linear"
                        }
                    }}
                    style={{ display: 'flex', gap: '25px', width: 'fit-content' }}
                >
                    {/* Duplicamos para loop perfecto */}
                    {[...displayMembers, ...displayMembers].map((member, idx) => (
                        <motion.div 
                            key={`${member.id}-${idx}`}
                            whileHover={{ y: -10 }}
                            onClick={() => onSelectMember && onSelectMember(member)}
                            style={{ 
                                width: '300px',
                                flexShrink: 0,
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '35px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: `1px solid rgba(255,255,255,0.08)`,
                                backdropFilter: 'blur(10px)',
                                position: 'relative'
                            }}
                        >
                            {/* Badge Dinámico */}
                            <div style={{ 
                                position: 'absolute', top: '20px', right: '20px', zIndex: 10,
                                background: member.type === 'pastor' ? COLORS.accent : 'rgba(18, 12, 31, 0.8)',
                                padding: '6px 14px', borderRadius: '100px',
                                fontSize: '0.6rem', fontWeight: 900, 
                                color: member.type === 'pastor' ? COLORS.midnight : '#fff',
                                textTransform: 'uppercase', letterSpacing: '1px',
                                display: 'flex', alignItems: 'center', gap: '5px'
                            }}>
                                <IconRenderer name={member.icon} />
                                {getBadgeLabel(member.type)}
                            </div>

                            {/* Contenedor Imagen con Protección */}
                            <div style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
                                <img 
                                    src={getImageUrl ? getImageUrl(member.imageUrl || member.img) : (member.imageUrl || member.img)} 
                                    alt={member.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
                                    className="member-img"
                                />
                                <div className="card-overlay">
                                    <LucideIcons.ShieldCheck size={28} color={COLORS.accent} />
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, marginTop: '8px', letterSpacing: '2px' }}>DATO PROTEGIDO</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '25px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ 
                                    fontFamily: 'Moonrising, sans-serif', 
                                    color: '#fff', 
                                    fontSize: '1.05rem',
                                    marginBottom: '5px'
                                }}>
                                    {member.name}
                                </h4>
                                <span style={{ 
                                    color: COLORS.accent, 
                                    fontWeight: 900, 
                                    fontSize: '0.6rem', 
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    opacity: 0.7
                                }}>
                                    {member.role}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Comentario General a pie de Galería */}
            <div style={{ 
                maxWidth: '800px', 
                margin: '50px auto 0', 
                textAlign: 'center', 
                padding: '0 20px',
                opacity: 0.5
            }}>
                <p style={{ color: '#fff', fontSize: '0.9rem', lineHeight: '1.8', fontStyle: 'italic' }}>
                    "El cuerpo directivo de Oasis representa la diversidad de talentos puestos al servicio de Dios. Cada departamento trabaja en sinergia para ser un canal de bendición en el territorio distrital."
                </p>
            </div>

            <style>{`
                .carousel-container { width: 100%; padding: 30px 0; cursor: grab; }
                .card-overlay {
                    position: absolute; inset: 0; background: rgba(8, 5, 13, 0.9);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    color: #fff; opacity: 0; transition: 0.4s ease; backdrop-filter: blur(10px);
                }
                div[style*="width: '300px'"]:hover .card-overlay { opacity: 1; }
                div[style*="width: '300px'"]:hover .member-img { transform: scale(1.1); transition: 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </section>
    );
};

export default AboutBoard;