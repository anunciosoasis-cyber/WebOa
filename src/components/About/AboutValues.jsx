"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, Shield } from 'lucide-react';
import { COLORS } from './AboutStyles';

const LucideIcons = { Eye, Heart, Shield };

const AboutValues = ({ settings }) => {
    const VALUES = [
        {
            title: settings?.about_mission_title || 'La Familia',
            desc: settings?.about_mission_content || 'Nuestro núcleo. Creemos en hogares restaurados bajo el diseño original de Dios.',
            icon: <LucideIcons.Heart size={24} />,
            featured: true
        },
        {
            title: settings?.about_vision_title || 'Visión',
            desc: settings?.about_vision_content || 'Ser una iglesia relevante y vibrante que impacta su entorno.',
            icon: <LucideIcons.Eye size={22} />,
            featured: false
        },
        {
            title: settings?.about_values_title || 'Valores',
            desc: settings?.about_values_content || 'Integridad, Excelencia, Unidad y Amor en todas nuestras acciones.',
            icon: <LucideIcons.Shield size={22} />,
            featured: false
        }
    ];

    return (
        <section
            style={{
                padding: '20px 20px',
                maxWidth: '1240px',
                margin: '-78px auto 48px',
                position: 'relative',
                zIndex: 10
            }}
        >
            <style>{`
                .about-val-card {
                    position: relative;
                    overflow: hidden;
                    isolation: isolate;
                }
                .about-val-shimmer {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        115deg,
                        transparent 20%,
                        rgba(245, 158, 11, 0.12) 50%,
                        transparent 80%
                    );
                    transform: translateX(-135%);
                    transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
                    pointer-events: none;
                    z-index: 1;
                }
                .about-val-card:hover .about-val-shimmer {
                    transform: translateX(135%);
                }
            `}</style>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                    gap: '22px',
                    alignItems: 'stretch'
                }}
            >
                {VALUES.map((v, i) => (
                    <motion.div
                        key={i}
                        className="about-val-card"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: i * 0.1 }}
                        whileHover={{ y: -8 }}
                        style={{
                            background: v.featured
                                ? `linear-gradient(150deg, #1B132E 0%, ${COLORS.midnight} 100%)`
                                : 'linear-gradient(165deg, #FFFFFF 0%, #F8F9FC 100%)',
                            color: v.featured ? '#FFFFFF' : COLORS.deepPurple,
                            padding: '34px 28px',
                            borderRadius: '30px',
                            boxShadow: v.featured
                                ? '0 24px 50px -14px rgba(8, 5, 13, 0.55), 0 0 0 1px rgba(245, 158, 11, 0.25)'
                                : '0 20px 44px -14px rgba(18, 12, 31, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            border: v.featured
                                ? '1px solid rgba(245, 158, 11, 0.28)'
                                : '1px solid rgba(18, 12, 31, 0.06)'
                        }}
                    >
                        <div className="about-val-shimmer" />

                        {v.featured && (
                            <div
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    top: '-45px',
                                    right: '-45px',
                                    width: '140px',
                                    height: '140px',
                                    background: COLORS.accent,
                                    borderRadius: '50%',
                                    opacity: 0.14,
                                    filter: 'blur(36px)',
                                    pointerEvents: 'none'
                                }}
                            />
                        )}

                        <div
                            style={{
                                position: 'relative',
                                zIndex: 2,
                                background: v.featured ? COLORS.accent : COLORS.deepPurple,
                                color: v.featured ? COLORS.midnight : COLORS.accent,
                                width: 52,
                                height: 52,
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '22px',
                                boxShadow: v.featured
                                    ? `0 10px 24px ${COLORS.accent}44`
                                    : '0 8px 20px rgba(18, 12, 31, 0.16)'
                            }}
                        >
                            {v.icon}
                        </div>

                        <h3
                            style={{
                                position: 'relative',
                                zIndex: 2,
                                fontFamily: 'Moonrising, sans-serif',
                                fontSize: '1.15rem',
                                letterSpacing: '0.5px',
                                marginBottom: '12px',
                                lineHeight: 1.2
                            }}
                        >
                            {v.title}
                        </h3>

                        <p
                            style={{
                                position: 'relative',
                                zIndex: 2,
                                fontSize: '0.9rem',
                                lineHeight: '1.6',
                                opacity: v.featured ? 0.84 : 0.72,
                                fontWeight: 500,
                                margin: 0
                            }}
                        >
                            {v.desc}
                        </p>

                        {v.featured && (
                            <div
                                style={{
                                    position: 'relative',
                                    zIndex: 2,
                                    marginTop: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    color: COLORS.accent
                                }}
                            >
                                <div style={{ width: '24px', height: '2px', background: COLORS.accent, borderRadius: '2px' }} />
                                Pilar Principal
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default AboutValues;
