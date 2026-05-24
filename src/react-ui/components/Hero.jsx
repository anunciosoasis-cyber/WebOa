"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OASIS_SLIDES = [
    {
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=90&w=3840&auto=format&fit=crop',
        title: "Unidos en Familia",
        description: "En Oasis, cada hogar encuentra un refugio de paz. Fortaleciendo los lazos del amor cristiano en cada generación.",
        accent: "Generaciones"
    },
    {
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=90&w=3840&auto=format&fit=crop',
        title: "Juventud con Propósito",
        description: "Liderando con fe y energía. Una comunidad donde los jóvenes transforman el mundo a través del servicio a Dios.",
        accent: "Dinamismo"
    },
    {
        url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=90&w=3840&auto=format&fit=crop',
        title: "Esperanza Bendita",
        description: "Caminando juntos hacia el encuentro con nuestro Creador. La unidad de la iglesia es nuestra mayor fortaleza.",
        accent: "Advenimiento"
    },
    {
        url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=90&w=3840&auto=format&fit=crop',
        title: "Comunidad Viva",
        description: "Más que una iglesia, somos un cuerpo unido en la misión de compartir el evangelio eterno a toda nación.",
        accent: "Misión"
    }
];

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [bgImage, setBgImage] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        fetch(`${apiBase}/public/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.bg_image) setBgImage(data.bg_image);
            }).catch(e => console.error('Hero bg load error:', e));
    }, []);

    // Paleta de Colores Senior UX: Deep Purple & Amber
    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B'
    };

    useEffect(() => {
        startTimer();
        return () => stopTimer();
    }, [currentIndex]);

    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => nextSlide(), 10000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const nextSlide = () => setCurrentIndex(prev => (prev >= OASIS_SLIDES.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentIndex(prev => (prev === 0 ? OASIS_SLIDES.length - 1 : prev - 1));

    const current = OASIS_SLIDES[currentIndex];

    return (
        <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-[#08050D] flex items-center px-6 lg:px-24">
            
            {/* 1. MOTOR DE IMÁGENES 4K CON DIFUSIÓN CINEMATOGRÁFICA */}
            <AnimatePresence mode="popLayout">
                <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${bgImage || current.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Capas de Sobriedad y Color Oasis */}
                    <div className="absolute inset-0 bg-[#08050D]/60 mix-blend-multiply z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#120C1F]/90 via-[#120C1F]/40 to-transparent z-20" />
                    <div className="absolute inset-0 backdrop-blur-[1px] z-30" />
                </motion.div>
            </AnimatePresence>

            {/* 2. CONTENIDO TEXTUAL CON JERARQUÍA SENIOR */}
            <div className="container relative z-40 text-white w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="max-w-4xl"
                    >
                        {/* Indicador de Tema */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-[2px] w-10 bg-[#F59E0B]" />
                            <span className="text-[10px] font-black tracking-[0.4em] text-[#F59E0B] uppercase">
                                {current.accent}
                            </span>
                        </div>

                        <h1 
                            style={{ fontFamily: 'Moonrising, sans-serif' }}
                            className="text-5xl md:text-7xl lg:text-[85px] font-bold tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl uppercase"
                        >
                            {current.title}
                        </h1>

                        <p className="max-w-xl text-lg md:text-xl font-light text-white/70 leading-relaxed border-l-2 border-[#F59E0B]/30 pl-8 mb-10 italic">
                            {current.description}
                        </p>


                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 4. INDICADORES DE NAVEGACIÓN (MINIMALISTAS) */}
            <div className="absolute bottom-12 left-6 lg:left-24 flex items-center gap-4 z-50">
                {OASIS_SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1 transition-all duration-1000 rounded-full ${
                            idx === currentIndex ? 'w-16 bg-[#F59E0B]' : 'w-4 bg-white/20 hover:bg-white/40'
                        }`}
                    />
                ))}
            </div>

            {/* 5. CONTROLES LATERALES GHOST */}
            <div className="hidden lg:block">
                <button onClick={prevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 z-50 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 hover:text-[#F59E0B] transition-all backdrop-blur-sm active:scale-90">
                    <LucideIcons.ChevronLeft size={28} />
                </button>
                <button onClick={nextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 z-50 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 hover:text-[#F59E0B] transition-all backdrop-blur-sm active:scale-90">
                    <LucideIcons.ChevronRight size={28} />
                </button>
            </div>
        </section>
    );
};

export default Hero;