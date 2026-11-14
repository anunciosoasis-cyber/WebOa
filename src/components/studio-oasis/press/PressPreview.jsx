import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, EyeOff, Eye } from 'lucide-react';
import SlideCanvasView from './SlideCanvasView';

export const PressPreview = ({
  background = null,
  slides = [],
  currentSlideIndex = 0,
  isBlank = false,
  isLoading = false,
  setCurrentSlideIndex,
  setIsBlank,
}) => {
  const currentSlide = slides[currentSlideIndex];
  const totalSlides = slides.length;
  // Dirección de la animación: la siguiente entra por la derecha, la anterior por la izquierda
  const lastIndexRef = useRef(currentSlideIndex);
  const direction = currentSlideIndex >= lastIndexRef.current ? 1 : -1;
  useEffect(() => { lastIndexRef.current = currentSlideIndex; });

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
    setIsBlank(false);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1));
    setIsBlank(false);
  };

  const handleToggleBlank = () => {
    setIsBlank((prev) => !prev);
  };

  const handleSliderChange = (e) => {
    setCurrentSlideIndex(parseInt(e.target.value));
    setIsBlank(false);
  };

  return (
    <div className="bg-ui-bg shadow-neumorph p-4 rounded-[2rem] border border-white/60 flex flex-col justify-between space-y-3 h-full w-full text-slate-800 font-sans">

      {/* HEADER: BADGES DE ESTADO ESTILO PÍLDORA */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        {/* Badge Izquierdo: Estado de Pantalla */}
        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
          <span className={`w-2 h-2 rounded-full ${isBlank ? 'bg-oasis-red animate-pulse' : 'bg-oasis-yellow'}`} />
          <span className="font-moonrising text-[9.5px] text-slate-700 uppercase tracking-widest">
            {isBlank ? 'PANTALLA EN NEGRO' : 'PANTALLA PROYECTOR'}
          </span>
        </div>

        {/* Badge Derecho: Contador de Diapositiva */}
        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100" title="Diapositiva actual">
          <span className="text-xs font-black text-slate-900 font-mono">
            {totalSlides > 0 ? currentSlideIndex + 1 : 0} / {totalSlides}
          </span>
        </div>

      </div>

      {/* MARCO DE PANTALLA PRINCIPAL */}
      <div className="relative w-full max-w-[max(420px,calc((100vh-500px)*16/9))] mx-auto aspect-video bg-black rounded-[24px] p-2.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {isLoading ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-9 h-9 border-3 border-[#FFB800] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#FFB800] uppercase tracking-wider">
              Cargando diapositiva...
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full rounded-[18px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={isBlank ? 'blank' : (currentSlide?.id ?? currentSlideIndex)}
                custom={direction}
                variants={{
                  enter: (d) => ({ opacity: 0, x: d * 40, scale: 0.98 }),
                  center: { opacity: 1, x: 0, scale: 1 },
                  exit: (d) => ({ opacity: 0, x: d * -40, scale: 0.98 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <SlideCanvasView slide={currentSlide} isBlank={isBlank} background={background} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* CONTROLES: cápsula hundida con flechas + pantalla negra (como En vivo) y barra de progreso */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="bg-ui-bg shadow-neumorph rounded-2xl flex items-center justify-center p-1.5 h-[46px] border border-white/50">
          <div className="bg-ui-bg shadow-neumorph-inset rounded-full w-[150px] h-[32px] flex items-center justify-between px-2 relative border border-white/20">
            <button onClick={handlePrev} disabled={currentSlideIndex === 0} title="Diapositiva anterior" aria-label="Diapositiva anterior"
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:text-oasis-orange active:scale-90 disabled:opacity-30 transition-all z-10">
              <ChevronLeft size={16} strokeWidth={3} />
            </button>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <button onClick={handleToggleBlank} aria-pressed={isBlank}
                title={isBlank ? 'Restaurar la diapositiva' : 'Pantalla negra'} aria-label={isBlank ? 'Restaurar la diapositiva' : 'Pantalla negra'}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white border border-white/40 hover:scale-105 active:scale-95 transition-all ${isBlank
                  ? 'bg-oasis-red shadow-[0_3px_8px_rgba(239,68,68,0.4)] animate-pulse'
                  : 'bg-gray-900 shadow-[0_3px_8px_rgba(0,0,0,0.3)]'}`}>
                {isBlank ? <Eye size={16} strokeWidth={2.5} /> : <EyeOff size={16} strokeWidth={2.5} />}
              </button>
            </div>
            <button onClick={handleNext} disabled={currentSlideIndex >= totalSlides - 1} title="Diapositiva siguiente" aria-label="Diapositiva siguiente"
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:text-oasis-orange active:scale-90 disabled:opacity-30 transition-all z-10">
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-w-[10rem] max-w-xs items-center gap-3 bg-ui-bg shadow-neumorph-inset px-4 h-[38px] rounded-full border border-white/30" title="Ir a una diapositiva">
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSlides - 1)}
            value={currentSlideIndex}
            onChange={handleSliderChange}
            aria-label="Progreso de la presentación"
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FFB800]"
          />
          <span className="text-[11px] font-bold text-slate-800 font-mono shrink-0">
            {totalSlides > 0 ? currentSlideIndex + 1 : 0}/{totalSlides}
          </span>
        </div>
      </div>

    </div>
  );
};

export default PressPreview;