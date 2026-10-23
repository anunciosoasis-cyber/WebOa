import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="bg-[#EEF1F6] p-5 sm:p-6 rounded-[32px] border border-white/80 shadow-[10px_10px_25px_rgba(166,180,200,0.35),-10px,-10px_25px_rgba(255,255,255,0.9)] flex flex-col justify-between space-y-5 h-full w-full text-slate-800 font-sans">

      {/* HEADER: BADGES DE ESTADO ESTILO PÍLDORA */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        {/* Badge Izquierdo: Estado de Pantalla */}
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-[2px_3px_8px_rgba(0,0,0,0.04)] border border-slate-200/80">
          <span className={`w-2.5 h-2.5 rounded-full ${isBlank ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
            {isBlank ? 'PANTALLA EN NEGRO' : 'PANTALLA PROYECTOR'}
          </span>
        </div>

        {/* Badge Derecho: Contador de Diapositiva */}
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-[2px_3px_8px_rgba(0,0,0,0.04)] border border-slate-200/80">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SLIDE</span>
          <span className="text-xs font-black text-slate-900 font-mono">
            {totalSlides > 0 ? currentSlideIndex + 1 : 0} / {totalSlides}
          </span>
        </div>

      </div>

      {/* MARCO DE PANTALLA PRINCIPAL */}
      <div className="relative w-full aspect-video max-h-[380px] bg-black rounded-[24px] p-2.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] border border-slate-800/80 overflow-hidden flex items-center justify-center">
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

      {/* CONTROLES ESTILO PANEL MODERNO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">

        {/* Barra de Controles de Navegación */}
        <div className="inline-flex items-center gap-2 bg-white/90 p-1.5 rounded-full shadow-[4px_6px_16px_rgba(166,180,200,0.25)] border border-slate-200/80 w-full sm:w-auto justify-center">

          {/* Botón Anterior */}
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="w-10 h-10 rounded-full bg-[#EEF1F6] hover:bg-slate-200 active:scale-95 disabled:opacity-30 disabled:hover:bg-[#EEF1F6] text-slate-800 font-extrabold flex items-center justify-center transition-all shadow-sm text-sm"
            title="Diapositiva Anterior"
          >
            ◀
          </button>

          {/* Botón Acción Principal: Alternar Pantalla Negra */}
          <button
            onClick={handleToggleBlank}
            className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 flex items-center gap-2 shadow-md active:scale-95 ${isBlank
                ? 'bg-red-500 text-white shadow-red-500/30'
                : 'bg-[#FFB800] hover:bg-[#F3AD00] text-slate-950 shadow-[0_4px_14px_rgba(255,184,0,0.4)]'
              }`}
          >
            {isBlank ? 'RESTAURAR' : 'PANTALLA NEGRA'}
          </button>

          {/* Botón Siguiente */}
          <button
            onClick={handleNext}
            disabled={currentSlideIndex === totalSlides - 1}
            className="w-10 h-10 rounded-full bg-[#EEF1F6] hover:bg-slate-200 active:scale-95 disabled:opacity-30 disabled:hover:bg-[#EEF1F6] text-slate-800 font-extrabold flex items-center justify-center transition-all shadow-sm text-sm"
            title="Siguiente Diapositiva"
          >
            ▶
          </button>
        </div>

        {/* Deslizador de Navegación Neumórfico */}
        <div className="flex items-center gap-3 bg-white/80 px-4 py-2.5 rounded-full border border-slate-200/80 shadow-[2px_3px_8px_rgba(0,0,0,0.03)] w-full sm:max-w-xs">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0">
            PROGRESO
          </span>
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSlides - 1)}
            value={currentSlideIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FFB800]"
          />
          <span className="text-xs font-bold text-slate-800 font-mono shrink-0">
            {totalSlides > 0 ? currentSlideIndex + 1 : 0}/{totalSlides}
          </span>
        </div>

      </div>

    </div>
  );
};

export default PressPreview;