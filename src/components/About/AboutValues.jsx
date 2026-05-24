"use client";

import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { COLORS } from './AboutStyles';

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
        <section style={{ 
            padding: '20px 20px', 
            maxWidth: '1300px', 
            margin: '-80px auto 40px', 
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ 
                display: 'grid', 
                // Forzamos 4 columnas en desktop y 1 en móvil
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '15px',
                alignItems: 'stretch'
            }}>
                {VALUES.map((v, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        whileHover={{ y: -8 }}
                        style={{ 
                            background: v.featured ? COLORS.midnight : '#FFFFFF', 
                            color: v.featured ? '#FFFFFF' : COLORS.deepPurple,
                            padding: '30px 25px', // Tamaño más compacto
                            borderRadius: '35px', 
                            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            border: v.featured ? 'none' : '1px solid rgba(0,0,0,0.03)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {v.featured && (
                            <div style={{ 
                                position: 'absolute', top: '-40px', right: '-40px', 
                                width: '100px', height: '100px', background: COLORS.accent,
                                borderRadius: '50%', opacity: 0.1, filter: 'blur(30px)'
                            }} />
                        )}

                        <div style={{ 
                            background: v.featured ? COLORS.accent : COLORS.midnight, 
                            color: v.featured ? COLORS.midnight : COLORS.accent, 
                            width: 50, height: 50, 
                            borderRadius: '16px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            marginBottom: '20px',
                            boxShadow: v.featured ? `0 8px 16px ${COLORS.accent}33` : 'none'
                        }}>
                            {v.icon}
                        </div>

                        <h3 style={{ 
                            fontFamily: 'Moonrising, sans-serif', 
                            fontSize: '1.1rem', 
                            marginBottom: '10px',
                            lineHeight: 1.2
                        }}>
                            {v.title}
                        </h3>
                        
                        <p style={{ 
                            fontSize: '0.85rem', 
                            lineHeight: '1.5', 
                            opacity: v.featured ? 0.8 : 0.6,
                            fontWeight: 500,
                            margin: 0
                        }}>
                            {v.desc}
                        </p>

                        {v.featured && (
                            <div style={{ 
                                marginTop: '15px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                fontSize: '0.6rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                color: COLORS.accent
                            }}>
                                <div style={{ width: '20px', height: '1.5px', background: COLORS.accent }} />
                                Principal
                            </div>
                        )}
                    </motion.div>
                ))}
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

export default AboutValues;