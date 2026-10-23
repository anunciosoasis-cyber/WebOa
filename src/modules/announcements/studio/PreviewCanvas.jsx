import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ImageIcon, Sparkles } from 'lucide-react';

const FORMATS = [
    { id: '4:5', label: 'Post 4:5', w: 4, h: 5 },
    { id: '9:16', label: 'Historia 9:16', w: 9, h: 16 },
    { id: '16:9', label: 'Horizontal 16:9', w: 16, h: 9 },
];

const PROGRESS_PHASES = [
    { target: 28, text: 'Estructurando composición y balance…' },
    { target: 54, text: 'Aplicando paleta Oasis y gradientes…' },
    { target: 76, text: 'Renderizando tipografías y efectos…' },
    { target: 92, text: 'Optimizando resolución y nitidez…' },
    { target: 97, text: 'Finalizando flyer de alta calidad…' },
];

/**
 * Hook de progreso percibido activo:
 * En lugar de un spinner estático/aburrido, avanza progresivamente por fases
 * simuladas de diseño para reducir drásticamente el tiempo de espera percibido.
 */
function useRenderProgress(isBusy) {
    const [progress, setProgress] = useState(0);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timer = null;
        let tick = null;

        if (isBusy) {
            setVisible(true);
            setProgress(14);
            setPhaseIndex(0);

            const startTime = Date.now();
            tick = setInterval(() => {
                const elapsed = Date.now() - startTime;
                if (elapsed < 280) {
                    setProgress(28);
                    setPhaseIndex(0);
                } else if (elapsed < 620) {
                    setProgress(54);
                    setPhaseIndex(1);
                } else if (elapsed < 1050) {
                    setProgress(76);
                    setPhaseIndex(2);
                } else if (elapsed < 1650) {
                    setProgress(90);
                    setPhaseIndex(3);
                } else if (elapsed < 2400) {
                    setProgress(95);
                    setPhaseIndex(4);
                } else {
                    // Si el servidor tarda más, avanza suavemente hacia el 98%
                    setProgress((prev) => Math.min(prev + 0.35, 98));
                }
            }, 75);
        } else if (visible) {
            // Cuando la imagen real termina de generarse, completa al 100% y desvanece
            setProgress(100);
            timer = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 300);
        }

        return () => {
            if (tick) clearInterval(tick);
            if (timer) clearTimeout(timer);
        };
    }, [isBusy]); // eslint-disable-line react-hooks/exhaustive-deps

    const isComplete = progress >= 100;
    const phaseText = isComplete
        ? '¡Diseño completado!'
        : PROGRESS_PHASES[phaseIndex]?.text || 'Renderizando…';

    return {
        visible,
        isComplete,
        progress: Math.round(progress),
        phaseText,
    };
}

/** Vista previa real del motor con morphing animado y barra de avance percibido activo. */
export default function PreviewCanvas({ aspectRatio, src, busy, missingLabels, onFormat }) {
    const stageRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ width: 340, height: 425 });

    // Estado para transición suave de imagen (crossfade)
    const [renderedSrc, setRenderedSrc] = useState(src);
    const [isImageFading, setIsImageFading] = useState(false);

    // Progreso percibido dinámico (reemplazo de esfera girando)
    const { visible: showProgress, isComplete, progress, phaseText } = useRenderProgress(busy);

    // Calcular dimensiones fluidas ajustadas exactamente al espacio disponible en el stage
    useEffect(() => {
        if (!stageRef.current) return undefined;

        const calculateSize = () => {
            if (!stageRef.current) return;
            const rect = stageRef.current.getBoundingClientRect();
            // Margen de seguridad para padding y sombra
            const maxW = Math.max(rect.width - 16, 120);
            const maxH = Math.max(rect.height - 16, 120);

            const fmt = FORMATS.find((f) => f.id === aspectRatio) || FORMATS[0];
            const ratio = fmt.w / fmt.h;

            let finalW, finalH;
            if (maxH * ratio <= maxW) {
                finalH = maxH;
                finalW = Math.round(finalH * ratio);
            } else {
                finalW = maxW;
                finalH = Math.round(finalW / ratio);
            }

            setCanvasSize({ width: finalW, height: finalH });
        };

        calculateSize();
        const ro = new ResizeObserver(calculateSize);
        ro.observe(stageRef.current);
        window.addEventListener('resize', calculateSize);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', calculateSize);
        };
    }, [aspectRatio]);

    // Transición suave al actualizar la imagen (pre-carga y crossfade)
    useEffect(() => {
        if (!src) {
            setRenderedSrc(null);
            return;
        }
        if (src === renderedSrc) return;

        // Si ya hay una imagen mostrada, precargar la nueva en memoria para que no haya parpadeo blanco
        const preload = new Image();
        preload.src = src;
        preload.onload = () => {
            setIsImageFading(true);
            const t = setTimeout(() => {
                setRenderedSrc(src);
                setIsImageFading(false);
            }, 120);
            return () => clearTimeout(t);
        };
        preload.onerror = () => {
            setRenderedSrc(src);
        };
    }, [src, renderedSrc]);

    return (
        <>
            <div className="ann-segmented ann-format-segmented" role="group" aria-label="Formato de anuncio">
                {FORMATS.map((f) => (
                    <button
                        key={f.id}
                        type="button"
                        aria-pressed={aspectRatio === f.id}
                        onClick={() => onFormat(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="ann-canvas-stage" ref={stageRef}>
                <div
                    className="ann-canvas"
                    style={{
                        width: `${canvasSize.width}px`,
                        height: `${canvasSize.height}px`,
                    }}
                >
                    {renderedSrc ? (
                        <img
                            src={renderedSrc}
                            alt="Vista previa del anuncio"
                            className={`ann-canvas-img ${isImageFading ? 'ann-canvas-img-fading' : 'ann-canvas-img-visible'}`}
                        />
                    ) : (
                        <div className="ann-canvas-empty">
                            <ImageIcon size={30} className="ann-canvas-empty-icon" />
                            <strong>Aún no hay vista previa</strong>
                            <span>{missingLabels?.length ? `Falta ${missingLabels.join(', ')}.` : 'Generando…'}</span>
                        </div>
                    )}

                    {/* Sección que muestra avance progresivo y fases activas en lugar de esfera girando */}
                    {showProgress && (
                        <div className="ann-canvas-busy-overlay" role="status" aria-live="polite">
                            <div className="ann-progress-card">
                                <div className="ann-progress-header">
                                    <div className="ann-progress-title-wrap">
                                        {isComplete ? (
                                            <CheckCircle2 size={15} style={{ color: '#34D399' }} />
                                        ) : (
                                            <Sparkles size={14} className="ann-progress-sparkle" />
                                        )}
                                        <span className="ann-progress-title">
                                            {isComplete ? 'FLYER LISTO' : 'GENERANDO DISEÑO OASIS'}
                                        </span>
                                    </div>
                                    <span className="ann-progress-pct">{progress}%</span>
                                </div>

                                <div className="ann-progress-track">
                                    <div
                                        className="ann-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div
                                    className={`ann-progress-step-text ${isComplete ? 'ann-progress-step-success' : ''}`}
                                >
                                    {phaseText}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
