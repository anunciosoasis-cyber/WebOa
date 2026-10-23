// RemoteView.jsx — Control remoto inteligente para smartphone (vía código QR)
// Comunicación en tiempo real bidireccional sobre WebSocket con Estudio Oasis y Proyector
import React, { useState, useEffect, useRef } from 'react';
import { realtime } from '../../../api/realtime';
import { liveKeyFromUrl, pressChannel } from '../../../api/liveChannel';
import { ChevronLeft, ChevronRight, EyeOff, Eye, Sparkles, Layers } from 'lucide-react';

/** Tarjeta miniatura responsiva para la pantalla del celular */
const SlideMiniPreview = ({ slide, title, url, isBlank, isSmall = false }) => {
  if (isBlank) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center text-center p-2">
        <span className="text-rose-500 font-mono text-[11px] font-black uppercase tracking-widest animate-pulse">
          [ PANTALLA NEGRA ]
        </span>
      </div>
    );
  }

  // 1. Imagen pura (subida directa o exportada)
  if (url || slide?.fileUrl) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
        <img
          src={url || slide.fileUrl}
          alt={title || 'Diapositiva'}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // 2. Diapositiva con fondo personalizado o del sistema
  const bg = slide?.background;
  const slideTitle = slide?.title || title || 'Diapositiva Oasis';
  const slideSubtitle = slide?.subtitle || '';

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-center p-2.5">
      {bg ? (
        <>
          <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b0d36] via-[#120C1F] to-[#08050D]" />
      )}
      <div className="relative z-10 w-full px-1.5 flex flex-col items-center justify-center">
        <h4
          className={`font-black text-[#FFB800] leading-tight line-clamp-2 uppercase tracking-wide ${
            isSmall ? 'text-[9px]' : 'text-xs sm:text-sm'
          }`}
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}
        >
          {slideTitle}
        </h4>
        {slideSubtitle && !isSmall && (
          <p
            className="text-[10px] text-slate-200 font-semibold line-clamp-1 mt-1 opacity-90"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}
          >
            {slideSubtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export const RemoteView = () => {
  const [sessionData, setSessionData] = useState({
    currentSlide: 1,
    totalSlides: 1,
    isBlank: false,
    title: 'Presentación Oasis',
    activeSlideTitle: 'Diapositiva 1',
    nextSlideTitle: 'Diapositiva 2',
    activeSlideUrl: null,
    nextSlideUrl: null,
    activeSlide: null,
    nextSlide: null,
    slidesSummary: [],
  });

  const [status, setStatus] = useState(() => (liveKeyFromUrl() ? 'conectando' : 'sin-clave'));
  const channelRef = useRef(null);
  const thumbnailsScrollRef = useRef(null);

  useEffect(() => {
    const key = liveKeyFromUrl();
    if (!key) return;
    const channel = pressChannel(key);
    let waitTimer;

    channel
      .on('broadcast', { event: 'ppt_state' }, ({ payload }) => {
        if (payload) {
          setSessionData((prev) => ({
            ...prev,
            ...payload,
            slidesSummary: payload.slidesSummary?.length ? payload.slidesSummary : prev.slidesSummary,
          }));
          setStatus('conectado');
          clearTimeout(waitTimer);
        }
      })
      .subscribe((st) => {
        if (st === 'SUBSCRIBED') {
          channel.send({ type: 'broadcast', event: 'ppt_request_state', payload: {} });
          waitTimer = setTimeout(() => setStatus((s) => (s === 'conectando' ? 'sin-estudio' : s)), 5000);
        }
      });

    channelRef.current = channel;
    return () => {
      clearTimeout(waitTimer);
      channelRef.current = null;
      realtime.removeChannel(channel);
    };
  }, []);

  // Vibración háptica en smartphones
  const triggerVibration = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }
  };

  // Envío de comandos con respuesta optimista inmediata en la UI móvil
  const sendCommand = (action, extra = {}) => {
    triggerVibration();

    // Actualización visual optimista instantánea
    if (action === 'NEXT') {
      setSessionData((prev) => ({
        ...prev,
        currentSlide: Math.min(prev.totalSlides, prev.currentSlide + 1),
        isBlank: false,
      }));
    } else if (action === 'PREV') {
      setSessionData((prev) => ({
        ...prev,
        currentSlide: Math.max(1, prev.currentSlide - 1),
        isBlank: false,
      }));
    } else if (action === 'TOGGLE_BLANK') {
      setSessionData((prev) => ({ ...prev, isBlank: !prev.isBlank }));
    } else if (action === 'GOTO' && typeof extra.index === 'number') {
      setSessionData((prev) => ({
        ...prev,
        currentSlide: extra.index + 1,
        isBlank: false,
      }));
    }

    channelRef.current?.send({
      type: 'broadcast',
      event: 'ppt_command',
      payload: { action, ...extra, timestamp: Date.now() },
    });
  };

  // Desplazar tira de miniaturas al cambiar de diapositiva
  useEffect(() => {
    if (!thumbnailsScrollRef.current) return;
    const activeEl = thumbnailsScrollRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [sessionData.currentSlide]);

  const statusLabel = {
    'sin-clave': 'Enlace incompleto: escanea el código QR desde Studio Oasis',
    conectando: 'Conectando con la sala de transmisión…',
    'sin-estudio': 'Buscando el estudio… (Asegúrate de tener Oasis Press abierto en el PC)',
    conectado: null,
  }[status];

  return (
    <div className="min-h-screen bg-[#0F172A] p-3 sm:p-5 flex items-center justify-center font-sans select-none text-slate-100">
      <div className="bg-[#1E293B] rounded-[36px] p-5 sm:p-6 shadow-2xl border border-slate-700/60 max-w-sm w-full space-y-4 flex flex-col justify-between">
        {/* HEADER MARCA OASIS PRESS & BADGE ESTADO */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div>
            <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase block">
              CONTROL REMOTO
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">
              OASIS<span className="text-[#FFB800]">PRESS</span>
            </h1>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'conectado' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              {status === 'conectado' ? 'EN VIVO' : 'CONECTANDO'}
            </span>
          </div>
        </div>

        {statusLabel && (
          <p
            role="status"
            className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/80 rounded-2xl px-3 py-2 m-0 text-center"
          >
            {statusLabel}
          </p>
        )}

        {/* PANTALLA PRINCIPAL EN VIVO (PANTALLA PROYECTOR) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              AL AIRE (PROYECTOR)
            </span>
            <span className="text-[11px] font-mono font-bold text-[#FFB800] bg-black/40 px-2.5 py-0.5 rounded-full border border-slate-700">
              {sessionData.currentSlide} / {sessionData.totalSlides}
            </span>
          </div>

          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-slate-700/80">
            <SlideMiniPreview
              slide={sessionData.activeSlide}
              title={sessionData.activeSlideTitle}
              url={sessionData.activeSlideUrl}
              isBlank={sessionData.isBlank}
            />
          </div>
        </div>

        {/* PANTALLA SECUNDARIA MINIATURA (SIGUIENTE) */}
        <div className="flex items-center gap-3 bg-slate-850/60 p-2.5 rounded-2xl border border-slate-800">
          <div className="w-24 aspect-video bg-black rounded-xl overflow-hidden border border-slate-700/80 shrink-0">
            <SlideMiniPreview
              slide={sessionData.nextSlide}
              title={sessionData.nextSlideTitle}
              url={sessionData.nextSlideUrl}
              isSmall={true}
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-black text-[#FFB800] uppercase tracking-wider block">
              A CONTINUACIÓN
            </span>
            <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
              {sessionData.nextSlideTitle || 'Fin de Presentación'}
            </p>
          </div>
        </div>

        {/* TIRA DE MINIATURAS DEL SISTEMA (CAROUSEL DE TODAS LAS DIAPOSITIVAS) */}
        {sessionData.slidesSummary?.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers size={11} /> Miniaturas ({sessionData.slidesSummary.length})
              </span>
              <span className="text-[9px] text-slate-500 font-semibold">Toca para proyectar</span>
            </div>

            <div
              ref={thumbnailsScrollRef}
              className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth custom-scrollbar"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {sessionData.slidesSummary.map((sl, i) => {
                const isActive = sessionData.currentSlide === sl.index;
                return (
                  <button
                    key={sl.index || i}
                    type="button"
                    data-active={isActive ? 'true' : undefined}
                    onClick={() => sendCommand('GOTO', { index: i })}
                    className={`relative shrink-0 w-20 aspect-video rounded-xl overflow-hidden text-left border transition-all duration-150 ${
                      isActive
                        ? 'border-[#FFB800] ring-2 ring-[#FFB800] shadow-md scale-105'
                        : 'border-slate-700/80 bg-slate-900 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {sl.thumbnail ? (
                      <img src={sl.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-slate-950 p-1 flex items-center justify-center text-center">
                        <span className="text-[8px] font-black text-[#FFB800] line-clamp-2 leading-none uppercase">
                          {sl.title}
                        </span>
                      </div>
                    )}
                    <span
                      className={`absolute top-0.5 left-0.5 text-[8px] font-mono font-black px-1 rounded ${
                        isActive ? 'bg-[#FFB800] text-slate-950' : 'bg-black/70 text-white'
                      }`}
                    >
                      #{sl.index}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTROLES DE NAVEGACIÓN PRINCIPALES */}
        <div className="bg-slate-900/90 rounded-3xl p-3 border border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Flecha Anterior */}
            <button
              type="button"
              onClick={() => sendCommand('PREV')}
              disabled={sessionData.currentSlide <= 1}
              className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-750 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all border border-slate-700 flex items-center justify-center gap-1.5 font-black text-sm uppercase tracking-wider text-white shadow-sm"
              title="Diapositiva Anterior"
            >
              <ChevronLeft size={22} className="text-[#FFB800]" /> Anterior
            </button>

            {/* Flecha Siguiente */}
            <button
              type="button"
              onClick={() => sendCommand('NEXT')}
              disabled={sessionData.currentSlide >= sessionData.totalSlides}
              className="flex-1 py-4 rounded-2xl bg-[#FFB800] hover:bg-[#F3AD00] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 font-black text-sm uppercase tracking-wider text-slate-950 shadow-lg shadow-[#FFB800]/20"
              title="Siguiente Diapositiva"
            >
              Siguiente <ChevronRight size={22} />
            </button>
          </div>

          {/* Botón Pantalla Negra */}
          <button
            type="button"
            onClick={() => sendCommand('TOGGLE_BLANK')}
            className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
              sessionData.isBlank
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {sessionData.isBlank ? (
              <>
                <Eye size={15} /> Restaurar Proyector
              </>
            ) : (
              <>
                <EyeOff size={15} /> Pantalla Negra (Blank)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoteView;
