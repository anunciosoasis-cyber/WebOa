import React from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';

/**
 * Cabecera cinematográfica común a todas las secciones públicas.
 * El fondo se edita en Admin → Ajustes → "Fondos de secciones" (clave hero_bg_<id>);
 * si no hay imagen subida usa `fallbackImage`, y si tampoco hay, solo la atmósfera oscura.
 */
const PageHero = ({ id, eyebrow, title, accent, subtitle, fallbackImage, compact = false, live = false, children }) => {
    const { publicSettings } = usePlayer() || {};
    const bg = publicSettings?.[`hero_bg_${id}`] || fallbackImage;

    return (
        <section className={`page-hero ${compact ? 'page-hero--compact' : ''}`}>
            {bg && (
                <motion.div
                    aria-hidden="true"
                    className="page-hero__img"
                    initial={{ opacity: 0, scale: 1.12 }}
                    animate={{ opacity: 1, scale: [1.12, 1.04] }}
                    transition={{ opacity: { duration: 1.2 }, scale: { duration: 18, ease: 'easeOut' } }}
                    style={{ backgroundImage: `url("${bg}")` }}
                />
            )}
            <div aria-hidden="true" className="page-hero__veil" />
            <div aria-hidden="true" className="page-hero__glow" />

            <motion.div
                className="page-hero__content"
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
                {eyebrow && (
                    <span className={`oasis-tag oasis-tag--hero ${live ? 'oasis-tag--live' : ''}`}>
                        <span className="oasis-tag__dot" />
                        {eyebrow}
                    </span>
                )}

                <h1 className="page-hero__title">
                    {title} {accent && <span>{accent}</span>}
                </h1>

                <motion.div
                    aria-hidden="true"
                    className="page-hero__rule"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />

                {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
                {children}
            </motion.div>
        </section>
    );
};

export default PageHero;
