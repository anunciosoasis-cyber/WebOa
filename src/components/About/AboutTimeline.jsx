"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Circle } from 'lucide-react';
import LucideByName from './LucideByName';
import { COLORS } from './AboutStyles';

const DEFAULT_TIMELINE = [
    { year: '2018', event: 'El Génesis', desc: 'Visión en Medellín: refugio de paz.', icon: 'Zap' },
    { year: '2020', event: 'Salto Digital', desc: 'Conexión global en Latinoamérica.', icon: 'Globe' },
    { year: '2023', event: 'Sede Física', desc: 'Inauguración ecosistema principal.', icon: 'Home' },
    { year: '2025', event: 'Oasis Infinite', desc: 'Plataforma modular y expansión nacional.', icon: 'Rocket' },
];

const AboutTimeline = ({ historyBrief, timeline = DEFAULT_TIMELINE }) => {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start center', 'end center']
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const IconRenderer = ({ name, color }) => (
        <LucideByName name={name} fallback={Circle} size={17} color={color} strokeWidth={2.3} />
    );

    const items = Array.isArray(timeline) && timeline.length > 0 ? timeline : DEFAULT_TIMELINE;

    return (
        <section
            ref={containerRef}
            style={{
                padding: '70px 20px 90px',
                maxWidth: '1080px',
                margin: '0 auto',
                position: 'relative'
            }}
        >
            <style>{`
                .about-timeline-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 36px;
                }
                .about-timeline-sticky {
                    position: relative;
                }
                @media (min-width: 768px) {
                    .about-timeline-grid {
                        grid-template-columns: 0.85fr 1.15fr;
                        gap: 72px;
                    }
                    .about-timeline-sticky {
                        position: sticky;
                        top: 140px;
                        height: fit-content;
                    }
                }
            `}</style>

            <div className="about-timeline-grid">
                {/* CABECERA IZQUIERDA */}
                <div className="about-timeline-sticky">
                    <span
                        style={{
                            color: COLORS.accent,
                            fontWeight: 900,
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '4px',
                            display: 'block',
                            marginBottom: '12px'
                        }}
                    >
                        Trayectoria
                    </span>
                    <h2
                        style={{
                            fontFamily: 'Moonrising, sans-serif',
                            color: COLORS.deepPurple,
                            fontSize: 'clamp(1.85rem, 4vw, 2.6rem)',
                            lineHeight: 1.1,
                            margin: '0 0 16px 0'
                        }}
                    >
                        Nuestra <span style={{ color: COLORS.accent }}>Historia</span>
                    </h2>
                    <div
                        style={{
                            width: '44px',
                            height: '3px',
                            borderRadius: '999px',
                            backgroundColor: COLORS.accent,
                            opacity: 0.45,
                            marginBottom: '18px'
                        }}
                    />
                    <p style={{ color: 'rgba(18, 12, 31, 0.72)', lineHeight: 1.7, fontSize: '0.96rem', fontWeight: 500, margin: 0 }}>
                        {historyBrief || 'Pasos guiados por la fe hacia el Ecosistema Oasis.'}
                    </p>
                </div>

                {/* TIMELINE */}
                <div style={{ position: 'relative', paddingLeft: '44px' }}>
                    {/* Track Background */}
                    <div
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '8px',
                            bottom: '8px',
                            width: '2px',
                            background: 'rgba(18, 12, 31, 0.08)',
                            borderRadius: '10px'
                        }}
                    />

                    {/* Línea Activa */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '8px',
                            bottom: '8px',
                            width: '2px',
                            background: `linear-gradient(180deg, ${COLORS.accent} 0%, #D97706 100%)`,
                            scaleY,
                            originY: 0,
                            zIndex: 2,
                            borderRadius: '10px'
                        }}
                    />

                    {items.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0.35, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-8%' }}
                            transition={{ duration: 0.45, delay: idx * 0.06 }}
                            whileHover={{ x: 4 }}
                            style={{
                                position: 'relative',
                                marginBottom: idx === items.length - 1 ? 0 : '26px',
                                padding: '20px 22px',
                                borderRadius: '22px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid rgba(18, 12, 31, 0.06)',
                                boxShadow: '0 12px 28px -12px rgba(18, 12, 31, 0.1)'
                            }}
                        >
                            {/* Nodo */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '-45px',
                                    top: '20px',
                                    zIndex: 10
                                }}
                            >
                                <div
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        borderRadius: '12px',
                                        background: COLORS.deepPurple,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 18px rgba(18, 12, 31, 0.22)',
                                        border: '2px solid #FFFFFF'
                                    }}
                                >
                                    <IconRenderer name={item.icon} color={COLORS.accent} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                                <span
                                    style={{
                                        fontFamily: 'Moonrising, sans-serif',
                                        fontSize: '1.1rem',
                                        color: COLORS.accent,
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {item.year}
                                </span>
                                <h3
                                    style={{
                                        fontWeight: 800,
                                        fontSize: '1.02rem',
                                        color: COLORS.deepPurple,
                                        margin: 0
                                    }}
                                >
                                    {item.event}
                                </h3>
                            </div>
                            <p
                                style={{
                                    color: 'rgba(18, 12, 31, 0.68)',
                                    fontSize: '0.88rem',
                                    lineHeight: 1.55,
                                    marginTop: '6px',
                                    marginBottom: 0,
                                    fontWeight: 500
                                }}
                            >
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutTimeline;
