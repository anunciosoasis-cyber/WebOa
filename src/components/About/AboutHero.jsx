import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, FONT_FAMILY } from './AboutStyles';

const AboutHero = ({ title, content }) => (
    <section
        style={{
            padding: '170px 20px 135px',
            textAlign: 'center',
            background: `linear-gradient(180deg, ${COLORS.midnight} 0%, ${COLORS.deepPurple} 100%)`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        {/* Atmospheric background image with subtle Ken Burns motion */}
        <motion.div
            initial={{ scale: 1.08, opacity: 0.16 }}
            animate={{ scale: 1.0, opacity: 0.22 }}
            transition={{ duration: 8, ease: 'easeOut' }}
            style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url("https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=3840")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                pointerEvents: 'none'
            }}
        />

        {/* Cinematic dark gradient & warm gold radial spotlight */}
        <div
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 42%, rgba(245, 158, 11, 0.14) 0%, rgba(18, 12, 31, 0.72) 52%, rgba(8, 5, 13, 0.96) 100%)',
                pointerEvents: 'none'
            }}
        />

        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', zIndex: 2, maxWidth: '860px', margin: '0 auto' }}
        >
            <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: COLORS.accent,
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    letterSpacing: '3.5px',
                    textTransform: 'uppercase',
                    marginBottom: '22px'
                }}
            >
                Identidad & Propósito
            </motion.span>

            <h1
                style={{
                    fontFamily: FONT_FAMILY.accent,
                    fontSize: 'clamp(2.6rem, 7.5vw, 4.8rem)',
                    lineHeight: 1.05,
                    letterSpacing: '1px',
                    margin: '0 auto',
                    textShadow: '0 12px 40px rgba(0, 0, 0, 0.55)'
                }}
            >
                {title}
            </h1>

            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '64px', opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                style={{
                    height: '3px',
                    borderRadius: '999px',
                    background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
                    margin: '20px auto 22px'
                }}
            />

            <p
                style={{
                    maxWidth: '640px',
                    margin: '0 auto',
                    color: 'rgba(255, 255, 255, 0.78)',
                    fontSize: 'clamp(0.98rem, 1.8vw, 1.12rem)',
                    lineHeight: 1.7,
                    fontWeight: 400
                }}
            >
                {content}
            </p>
        </motion.div>
    </section>
);

export default AboutHero;
