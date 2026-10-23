// PressThumbnails.jsx — tira de diapositivas: miniaturas reales (mismo componente que el proyector) y acciones por diapositiva
import React, { useRef, useEffect, useState } from 'react';
import { Film, Pencil, Copy, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import SlideCanvasView from './SlideCanvasView';

const ActionButton = ({ label, onClick, disabled, danger, children }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={`w-7 h-7 grid place-items-center rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none ${
      danger ? 'bg-red-500 text-white' : 'bg-black/70 text-white hover:bg-[#5b2ea6]'
    }`}
  >
    {children}
  </button>
);

export const PressThumbnails = ({
  slides = [],
  currentSlideIndex = 0,
  setCurrentSlideIndex,
  setIsBlank,
  background = null,
  onEdit,
  onDuplicate,
  onMove,
  onDelete,
}) => {
  const containerRef = useRef(null);
  const activeSlideRef = useRef(null);
  // Borrar pide un segundo clic (2 s) para evitar borrados accidentales en pleno culto
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Solo desplaza la tira horizontalmente: scrollIntoView arrastraba toda la página hasta aquí al abrir Studio
  useEffect(() => {
    const container = containerRef.current;
    const active = activeSlideRef.current;
    if (!container || !active) return;
    const offset = active.getBoundingClientRect().left - container.getBoundingClientRect().left;
    container.scrollTo({
      left: container.scrollLeft + offset - (container.clientWidth - active.clientWidth) / 2,
      behavior: 'smooth',
    });
  }, [currentSlideIndex]);

  useEffect(() => {
    if (!confirmDeleteId) return;
    const t = setTimeout(() => setConfirmDeleteId(null), 2000);
    return () => clearTimeout(t);
  }, [confirmDeleteId]);

  if (!slides.length) return null;

  return (
    <div className="bg-[#EEF1F6] p-4 rounded-[28px] border border-white/80 shadow-[10px_10px_25px_rgba(166,180,200,0.35),-10px_-10px_25px_rgba(255,255,255,0.9)] font-sans">
      <div className="flex items-center justify-between px-2 mb-3">
        <div className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFB800]" />
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
            Tira de Diapositivas
          </span>
          <span className="text-[10px] font-semibold text-slate-400 normal-case hidden sm:inline">· pasa el cursor para editar</span>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 font-mono">
          {slides.length} SLIDES
        </span>
      </div>

      <div ref={containerRef} className="flex gap-3.5 overflow-x-auto p-2 pb-3 scroll-smooth custom-scrollbar">
        {slides.map((s, idx) => {
          const isActive = currentSlideIndex === idx;
          const isVideo = s.mediaType === 'video' || s.type === 'video';
          const key = s.id ?? idx;
          const askingDelete = confirmDeleteId === key;

          return (
            <div key={key} ref={isActive ? activeSlideRef : null} className="group relative shrink-0 w-48">
              <button
                type="button"
                onClick={() => { setCurrentSlideIndex(idx); setIsBlank?.(false); }}
                onDoubleClick={() => onEdit?.(idx)}
                aria-label={`Diapositiva ${idx + 1}: ${s.title || ''}`}
                aria-current={isActive ? 'true' : undefined}
                className={`relative block w-full aspect-video rounded-2xl overflow-hidden text-left select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5b2ea6]
                  border transition-all duration-300 ease-out
                  ${isActive
                    ? 'border-[#FFB800] ring-2 ring-[#FFB800] shadow-[0_8px_20px_rgba(255,184,0,0.3)] -translate-y-1'
                    : 'border-slate-200/90 hover:-translate-y-0.5 hover:shadow-[4px_6px_14px_rgba(166,180,200,0.3)]'}`}
              >
                {/* Miniatura real: la misma diapositiva que ve el proyector, a escala */}
                <div className="absolute inset-0 pointer-events-none">
                  <SlideCanvasView slide={s} background={background} rounded={false} />
                </div>

                <span className={`absolute top-1.5 left-1.5 z-10 text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${isActive ? 'bg-[#FFB800] text-slate-950' : 'bg-black/60 text-white border border-white/20'}`}>
                  #{idx + 1}
                </span>
                {isVideo && (
                  <span className="absolute top-1.5 right-1.5 z-10 inline-flex items-center gap-1 bg-purple-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    <Film size={10} /> Vídeo
                  </span>
                )}
                {isActive && !isVideo && (
                  <span className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 bg-black/75 text-[9px] font-black text-emerald-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                )}
              </button>

              {/* Acciones: visibles al pasar el cursor, al enfocar con teclado y siempre en la activa (táctil) */}
              <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 rounded-xl bg-black/40 backdrop-blur-sm transition-opacity
                ${isActive || askingDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}>
                <ActionButton label="Editar diapositiva" onClick={() => onEdit?.(idx)}><Pencil size={13} /></ActionButton>
                <ActionButton label="Duplicar diapositiva" onClick={() => onDuplicate?.(idx)}><Copy size={13} /></ActionButton>
                <ActionButton label="Mover a la izquierda" onClick={() => onMove?.(idx, -1)} disabled={idx === 0}><ChevronLeft size={15} /></ActionButton>
                <ActionButton label="Mover a la derecha" onClick={() => onMove?.(idx, 1)} disabled={idx === slides.length - 1}><ChevronRight size={15} /></ActionButton>
                <ActionButton
                  label={askingDelete ? 'Confirmar: borrar diapositiva' : 'Borrar diapositiva'}
                  danger={askingDelete}
                  disabled={slides.length <= 1}
                  onClick={() => (askingDelete ? (setConfirmDeleteId(null), onDelete?.(idx)) : setConfirmDeleteId(key))}
                >
                  <Trash2 size={13} />
                </ActionButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PressThumbnails;
