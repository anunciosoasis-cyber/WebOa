// RemoteView.jsx — Control remoto de Oasis Press para el celular (se abre con el QR del Estudio)
// Comunicación en tiempo real bidireccional sobre WebSocket con Estudio Oasis y Proyector
import React, { useState, useEffect, useRef } from 'react';
import { realtime } from '../../../api/realtime';
import { liveKeyFromUrl, pressChannel } from '../../../api/liveChannel';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MonitorOff, Monitor, Radio, WifiOff,
  LoaderCircle, Presentation, ArrowRight, Images,
} from 'lucide-react';

const GOLD = '#F59E0B';

/** Vista de una diapositiva (al aire, siguiente o miniatura). El contenido conserva sus colores; el marco es claro. */
const SlideMiniPreview = ({ slide, title, url, isBlank, isSmall = false }) => {
  if (isBlank) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center" aria-label="Pantalla negra">
        <MonitorOff className="text-white/70" size={isSmall ? 16 : 34} aria-hidden="true" />
      </div>
    );
  }

  // 1. Imagen pura o preview visual (subida directa, PDF o miniatura)
  const imageSrc = url || slide?.fileUrl || slide?.thumbnailUrl || slide?.thumbnail;
  if (imageSrc) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
        <img src={imageSrc} alt={title || 'Diapositiva'} className="w-full h-full object-contain" />
      </div>
    );
  }

  // 2. Diapositiva de texto con fondo personalizado o del sistema
  const bg = slide?.background;
  const slideTitle = slide?.title || title || 'Diapositiva';
  const slideSubtitle = slide?.subtitle || '';

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center text-center p-2.5">
      {bg ? (
        <>
          <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a1650] via-[#160d29] to-[#0b0714]" />
      )}
      <div className="relative z-10 w-full px-1.5">
        <h4
          className={`font-black leading-tight line-clamp-2 uppercase tracking-wide ${isSmall ? 'text-[8px]' : 'text-sm'}`}
          style={{ color: '#FBBF24', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
        >
          {slideTitle}
        </h4>
        {slideSubtitle && !isSmall && (
          <p className="text-[11px] text-white/85 font-semibold line-clamp-1 mt-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {slideSubtitle}
          </p>
        )}
      </div>
    </div>
  );
};

/** Botón redondo de la barra de control: solo ícono, con nombre accesible. */
const ControlButton = ({ label, onClick, disabled, children, variant = 'soft', size = 'md' }) => {
  const sizes = { sm: 'w-11 h-11', md: 'w-14 h-14', lg: 'w-[72px] h-[72px]' };
  const variants = {
    soft: 'bg-slate-100 text-slate-700 active:bg-slate-200',
    primary: 'text-white shadow-[0_10px_24px_rgba(245,158,11,0.45)] active:brightness-95',
    danger: 'bg-rose-500 text-white shadow-[0_10px_24px_rgba(244,63,94,0.4)]',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${sizes[size]} ${variants[variant]} rounded-full grid place-items-center transition-all duration-150 active:scale-90 disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300`}
      style={variant === 'primary' ? { background: `linear-gradient(145deg, #FBBF24, ${GOLD})` } : undefined}
    >
      {children}
    </button>
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
            slidesSummary: Array.isArray(payload.slidesSummary) && payload.slidesSummary.length > 0
              ? payload.slidesSummary
              : prev.slidesSummary,
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

    if (action === 'NEXT') {
      setSessionData((prev) => ({ ...prev, currentSlide: Math.min(prev.totalSlides, prev.currentSlide + 1), isBlank: false }));
    } else if (action === 'PREV') {
      setSessionData((prev) => ({ ...prev, currentSlide: Math.max(1, prev.currentSlide - 1), isBlank: false }));
    } else if (action === 'FIRST') {
      setSessionData((prev) => ({ ...prev, currentSlide: 1, isBlank: false }));
    } else if (action === 'LAST') {
      setSessionData((prev) => ({ ...prev, currentSlide: prev.totalSlides, isBlank: false }));
    } else if (action === 'TOGGLE_BLANK') {
      setSessionData((prev) => ({ ...prev, isBlank: !prev.isBlank }));
    } else if (action === 'GOTO' && typeof extra.index === 'number') {
      setSessionData((prev) => ({ ...prev, currentSlide: extra.index + 1, isBlank: false }));
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

  const statusInfo = {
    'sin-clave': { icon: WifiOff, text: 'Enlace incompleto: escanea el QR desde el Estudio' },
    conectando: { icon: LoaderCircle, text: 'Conectando con la sala…', spin: true },
    'sin-estudio': { icon: WifiOff, text: 'Abre Oasis Press en el Estudio para controlarlo' },
    conectado: null,
  }[status];

  const live = status === 'conectado';
  const { currentSlide, totalSlides, isBlank } = sessionData;
  const progress = totalSlides > 0 ? Math.min(100, (currentSlide / totalSlides) * 100) : 0;
  const atStart = currentSlide <= 1;
  const atEnd = currentSlide >= totalSlides;

  return (
    <div className="min-h-[100dvh] bg-[#F5F6FA] text-slate-900 font-sans select-none">
      <div className="max-w-md mx-auto px-4 pb-[calc(150px+env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))]">
        {/* Barra superior: marca + estado */}
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <span
              className="w-10 h-10 rounded-2xl grid place-items-center text-white shadow-[0_6px_16px_rgba(245,158,11,0.35)]"
              style={{ background: `linear-gradient(145deg, #FBBF24, ${GOLD})` }}
              aria-hidden="true"
            >
              <Presentation size={20} />
            </span>
            <div className="leading-none">
              <h1 className="font-moonrising text-[17px] font-black tracking-wide">
                Oasis<span style={{ color: GOLD }}>Press</span>
              </h1>
              <p className="font-moonrising text-[11px] tracking-wide text-slate-400 mt-1 truncate max-w-[170px]">{sessionData.title}</p>
            </div>
          </div>

          <span
            role="status"
            aria-label={live ? 'Conectado en vivo' : 'Sin conexión con el Estudio'}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] font-bold ${
              live ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {live ? <Radio size={15} className="animate-pulse" aria-hidden="true" /> : <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            {live ? 'En vivo' : '…'}
          </span>
        </header>

        {statusInfo && (
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
            <statusInfo.icon size={18} className={`text-amber-500 shrink-0 ${statusInfo.spin ? 'animate-spin' : ''}`} aria-hidden="true" />
            <p className="m-0 text-[13px] font-semibold text-slate-600">{statusInfo.text}</p>
          </div>
        )}

        {/* Al aire */}
        <section aria-label="Diapositiva al aire" className="mt-4">
          <div className="relative w-full aspect-video rounded-[22px] overflow-hidden bg-black shadow-[0_14px_40px_rgba(15,23,42,0.18)]">
            <SlideMiniPreview
              slide={sessionData.activeSlide}
              title={sessionData.activeSlideTitle}
              url={sessionData.activeSlideUrl}
              isBlank={isBlank}
            />
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-black/55 backdrop-blur text-white text-[10px] font-black tracking-wider">
              <span className={`w-1.5 h-1.5 rounded-full ${isBlank ? 'bg-slate-400' : 'bg-red-500 animate-pulse'}`} aria-hidden="true" />
              {isBlank ? 'OFF' : 'LIVE'}
            </span>
            <span className="absolute bottom-2.5 right-2.5 h-6 px-2.5 rounded-full bg-black/55 backdrop-blur text-white text-[11px] font-bold tabular-nums grid place-items-center">
              {currentSlide}/{totalSlides}
            </span>
          </div>
        </section>

        {/* Siguiente */}
        <section aria-label="Siguiente diapositiva" className="mt-3 flex items-center gap-3 rounded-[20px] bg-white p-2.5 shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
          <div className="w-24 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
            {atEnd ? (
              <div className="w-full h-full bg-slate-100 grid place-items-center">
                <Monitor size={18} className="text-slate-300" aria-hidden="true" />
              </div>
            ) : (
              <SlideMiniPreview slide={sessionData.nextSlide} title={sessionData.nextSlideTitle} url={sessionData.nextSlideUrl} isSmall />
            )}
          </div>
          <ArrowRight size={16} className="text-amber-500 shrink-0" aria-hidden="true" />
          <p className="m-0 min-w-0 flex-1 text-[13px] font-bold text-slate-700 truncate">
            {atEnd ? 'Fin' : sessionData.nextSlideTitle}
          </p>
        </section>

        {/* Todas las diapositivas: tocar una la pone al aire */}
        {sessionData.slidesSummary?.length > 0 && (
          <section aria-label="Diapositivas" className="mt-4">
            <div className="flex items-center gap-1.5 px-1 mb-2 text-slate-400">
              <Images size={14} aria-hidden="true" />
              <span className="text-[12px] font-bold tabular-nums">{sessionData.slidesSummary.length}</span>
            </div>
            <div ref={thumbnailsScrollRef} className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth [scrollbar-width:none]" style={{ scrollSnapType: 'x mandatory' }}>
              {sessionData.slidesSummary.map((sl, i) => {
                const isActive = currentSlide === sl.index;
                return (
                  <button
                    key={sl.id || sl.index || i}
                    type="button"
                    data-active={isActive ? 'true' : undefined}
                    aria-label={`Proyectar diapositiva ${sl.index}: ${sl.title}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => sendCommand('GOTO', { index: i })}
                    className={`relative shrink-0 w-28 aspect-video rounded-2xl overflow-hidden bg-black transition-all duration-150 active:scale-95 ${
                      isActive ? 'ring-[3px] ring-amber-400 ring-offset-2 ring-offset-[#F5F6FA] shadow-[0_8px_20px_rgba(245,158,11,0.35)]' : 'shadow-[0_4px_12px_rgba(15,23,42,0.12)]'
                    }`}
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    {sl.thumbnail ? (
                      <img src={sl.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <SlideMiniPreview slide={sl} title={sl.title} isSmall />
                    )}
                    <span className={`absolute top-1 left-1 min-w-[20px] h-5 px-1 rounded-full grid place-items-center text-[10px] font-black tabular-nums ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-black/60 text-white'
                    }`}>
                      {sl.index}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Barra de control fija abajo, como una app */}
      <nav
        aria-label="Controles de la presentación"
        className="fixed inset-x-0 bottom-0 z-20 bg-white/95 backdrop-blur-xl rounded-t-[30px] shadow-[0_-10px_40px_rgba(15,23,42,0.10)]"
      >
        <div className="max-w-md mx-auto px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: GOLD }} />
          </div>
          <div className="mt-3.5 flex items-center justify-between">
            <ControlButton label="Primera diapositiva" size="sm" onClick={() => sendCommand('FIRST')} disabled={atStart}>
              <ChevronsLeft size={20} aria-hidden="true" />
            </ControlButton>
            <ControlButton label="Diapositiva anterior" onClick={() => sendCommand('PREV')} disabled={atStart}>
              <ChevronLeft size={28} aria-hidden="true" />
            </ControlButton>
            <ControlButton
              label={isBlank ? 'Volver a proyectar' : 'Pantalla negra'}
              variant={isBlank ? 'danger' : 'soft'}
              onClick={() => sendCommand('TOGGLE_BLANK')}
            >
              {isBlank ? <Monitor size={22} aria-hidden="true" /> : <MonitorOff size={22} aria-hidden="true" />}
            </ControlButton>
            <ControlButton label="Diapositiva siguiente" variant="primary" size="lg" onClick={() => sendCommand('NEXT')} disabled={atEnd}>
              <ChevronRight size={34} aria-hidden="true" />
            </ControlButton>
            <ControlButton label="Última diapositiva" size="sm" onClick={() => sendCommand('LAST')} disabled={atEnd}>
              <ChevronsRight size={20} aria-hidden="true" />
            </ControlButton>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default RemoteView;
