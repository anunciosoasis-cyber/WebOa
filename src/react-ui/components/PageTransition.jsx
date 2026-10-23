/**
 * PageTransition — transición compartida entre páginas para los layouts.
 *
 * - Salida corta (120ms) + entrada suave (220ms): ágil pero orgánica.
 * - Solo opacity/transform (GPU), sin blur ni cambios de layout.
 * - Suspense propio: al cargar un chunk lazy el layout (navbar/sidebar) sigue visible
 *   y solo el área de contenido muestra un skeleton.
 * - El scroll vuelve arriba cuando termina la salida, no a mitad de la animación.
 */
import React, { Suspense, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const EASE_OUT = [0.22, 1, 0.36, 1];

const variants = {
    initial: { opacity: 0, y: 8 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: 'easeIn' } },
};

// Congela el outlet al montar: sin esto la página que sale renderizaría la ruta nueva.
const FrozenOutlet = () => {
    const outlet = useOutlet();
    const [frozen] = useState(outlet);
    return frozen;
};

export const RouteSkeleton = () => (
    <div role="status" aria-label="Cargando contenido" className="oasis-route-skeleton">
        <div style={{ width: '40%', height: 28 }} />
        <div style={{ width: '100%', height: 160 }} />
        <div style={{ width: '85%', height: 16 }} />
        <div style={{ width: '70%', height: 16 }} />
        <style>{`
            .oasis-route-skeleton { display: flex; flex-direction: column; gap: 16px; padding: 24px 16px; min-height: 60vh; max-width: 1100px; margin: 0 auto; }
            .oasis-route-skeleton > div { border-radius: 12px; background: currentColor; opacity: .07; animation: oasisSkel 1.2s ease-in-out infinite; }
            @keyframes oasisSkel { 50% { opacity: .14; } }
            @media (prefers-reduced-motion: reduce) { .oasis-route-skeleton > div { animation: none; } }
        `}</style>
    </div>
);

const PageTransition = ({ scrollRef, style }) => {
    const { pathname } = useLocation();
    return (
        <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={() => (scrollRef?.current ?? window).scrollTo({ top: 0, behavior: 'instant' })}
        >
            <motion.div key={pathname} variants={variants} initial="initial" animate="enter" exit="exit" style={style}>
                <Suspense fallback={<RouteSkeleton />}>
                    <FrozenOutlet />
                </Suspense>
            </motion.div>
        </AnimatePresence>
    );
};

export default PageTransition;
