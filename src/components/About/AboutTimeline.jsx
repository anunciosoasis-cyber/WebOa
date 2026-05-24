"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { COLORS } from './AboutStyles';

const DEFAULT_TIMELINE = [
    { year: '2018', event: 'El Génesis', desc: 'Visión en Medellín: refugio de paz.', icon: 'Zap', color: '#F59E0B' },
    { year: '2020', event: 'Salto Digital', desc: 'Conexión global en Latinoamérica.', icon: 'Globe', color: '#8B5CF6' },
    { year: '2023', event: 'Sede Física', desc: 'Inauguración ecosistema principal.', icon: 'Home', color: '#10B981' },
    { year: '2025', event: 'Oasis Infinite', desc: 'Plataforma modular y expansión nacional.', icon: 'Rocket', color: '#3B82F6' },
];

const AboutTimeline = ({ historyBrief, timeline = DEFAULT_TIMELINE, isMobile }) => {
    const containerRef = useRef(null);
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const IconRenderer = ({ name, color }) => {
        const Icon = LucideIcons[name] || LucideIcons.Circle;
        return <Icon size={18} color={color} strokeWidth={2.5} />;
    };

    return (
        <section ref={containerRef} style={{ 
            padding: '60px 20px', // Reducido de 120px
            maxWidth: '1000px', // Más angosto para mayor control
            margin: '0 auto',
            position: 'relative'
        }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '0.8fr 1.2fr', gap: isMobile ? 40 : 80 }}>
                
                {/* CABECERA IZQUIERDA */}
                <div style={{ position: isMobile ? 'relative' : 'sticky', top: '150px', height: 'fit-content' }}>
                    <span style={{ 
                        color: COLORS.accent, 
                        fontWeight: 900, 
                        fontSize: '0.65rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '4px',
                        display: 'block',
                        marginBottom: '10px'
                    }}>
                        Trayectoria
                    </span>
                    <p style={{ color: '#777', lineHeight: 1.6, fontSize: '0.95rem', fontWeight: 500 }}>
                        {historyBrief || "Pasos guiados hacia el Ecosistema Oasis."}
                    </p>
                </div>

                {/* TIMELINE COMPACTA */}
                <div style={{ position: 'relative', paddingLeft: isMobile ? '20px' : '40px' }}>
                    
                    {/* Track Background */}
                    <div style={{ 
                        position: 'absolute', 
                        left: '0', 
                        top: '5px', 
                        bottom: '5px', 
                        width: '2px', 
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '10px'
                    }} />

                    {/* Línea Activa */}
                    <motion.div 
                        style={{ 
                            position: 'absolute', 
                            left: '0', 
                            top: '5px', 
                            bottom: '5px', 
                            width: '2px', 
                            background: COLORS.accent,
                            scaleY,
                            originY: 0,
                            zIndex: 2
                        }} 
                    />

                    {timeline.map((item, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0.4, x: 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, margin: "-10%" }}
                            style={{ position: 'relative', marginBottom: '35px' }} // Reducido de 80px
                        >
                            {/* El Nodo más pequeño */}
                            <div style={{ 
                                position: 'absolute', 
                                left: '-50px', 
                                top: '0',
                                zIndex: 10
                            }}>
                                <div style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '10px',
                                    background: COLORS.midnight,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                    border: `2px solid #fff`
                                }}>
                                    <IconRenderer name={item.icon} color={COLORS.accent} />
                                </div>
                            </div>

                            {/* Contenido Minimalista */}
                            <div style={{ paddingLeft: '5px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                    <span style={{ fontFamily: 'Moonrising', fontSize: '1.1rem', color: COLORS.accent }}>
                                        {item.year}
                                    </span>
                                    <h3 style={{ fontWeight: 800, fontSize: '1rem', color: COLORS.deepPurple, margin: 0 }}>
                                        {item.event}
                                    </h3>
                                </div>
                                <p style={{ 
                                    color: '#666', 
                                    fontSize: '0.85rem', 
                                    lineHeight: 1.5,
                                    marginTop: '4px',
                                    fontWeight: 500
                                }}>
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                @font-face {
                    font-family: 'Moonrising';
                    src: url('/fonts/Moonrising.ttf');
                }
            `}</style>
        </section>
    );
};

export default AboutTimeline;