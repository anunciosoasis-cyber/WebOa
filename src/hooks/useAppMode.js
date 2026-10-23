/**
 * useAppMode — Detecta el contexto de ejecución de la app
 *
 * Retorna:
 *  isMobile  → pantalla < 768px
 *  isDesktop → pantalla ≥ 768px
 *  isPWA     → app instalada abierta en modo standalone
 *  isWeb     → navegador convencional
 */
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

const detectPWA = () => {
    // iOS Safari standalone
    if (navigator.standalone === true) return true;
    // Chromium / otros navegadores
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    // Fallback: query string inyectada por el manifest start_url
    if (new URLSearchParams(window.location.search).get('pwa') === '1') return true;
    return false;
};

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 0.02}px)`;

const useAppMode = () => {
    // matchMedia solo dispara al cruzar el breakpoint; el antiguo listener de resize
    // re-renderizaba los layouts completos en cada píxel de redimensionado.
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
    const [isPWA, setIsPWA] = useState(detectPWA);

    useEffect(() => {
        const mql = window.matchMedia(MOBILE_QUERY);
        const onChange = (e) => setIsMobile(e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        // Escucha cambios dinámicos del display-mode (instalación en caliente)
        const mql = window.matchMedia('(display-mode: standalone)');
        const handler = (e) => setIsPWA(e.matches || navigator.standalone === true);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    const isDesktop = !isMobile;
    const isWeb = !isPWA;

    return { isMobile, isDesktop, isPWA, isWeb };
};

export default useAppMode;
