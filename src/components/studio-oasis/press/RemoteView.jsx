// RemoteView.jsx — Control remoto de Oasis Press para el celular (se abre con el QR del Estudio)
// Comunicación en tiempo real bidireccional sobre WebSocket con Estudio Oasis y Proyector
import React, { useState, useEffect, useRef } from 'react';
import { realtime } from '../../../api/realtime';
import { liveKeyFromUrl, pressChannel } from '../../../api/liveChannel';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MonitorOff, Monitor, Radio, WifiOff,
  LoaderCircle, Presentation, Images, Film, Flag,
} from 'lucide-react';
import SlideCanvasView from './SlideCanvasView';

const GOLD = '#F59E0B';

/** Diapositiva de la tira tal como la pinta el Estudio. Sin `view` (Estudio antiguo) usa los campos sueltos. */
const summarySlide = (sl) => {
  const styled = (sl.type || 'styled') === 'styled';
  const video = sl.mediaType === 'video' || sl.type === 'video';
  return {
    ...sl,
    ...(sl.view || {}),
    // En la tira el fondo de un cartel viaja como mediaUrl (contrato de la app); los vídeos no se reproducen en miniatura
    mediaUrl: styled || video ? null : sl.thumbnail || sl.mediaUrl || null,
    fileUrl: null,
    background: styled ? sl.mediaUrl || null : null,
  };
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
      // !duration: la CSS global pone transition 0.4s !important a todos los botones y el toque se sentía lento
      className={`${sizes[size]} ${variants[variant]} shrink-0 rounded-full grid place-items-center !transition-[transform,background-color,color,box-shadow] !duration-150 active:scale-90 disabled:!bg-slate-100 disabled:!text-slate-300 disabled:!shadow-none disabled:pointer-events-none [touch-action:manipulation] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300`}
      style={variant === 'primary' && !disabled ? { background: `linear-gradient(145deg, #FBBF24, ${GOLD})` } : undefined}
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
            serverSlide: payload.currentSlide,
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

  // Solo en esta vista: viewport-fit=cover para que env(safe-area-inset-*) funcione (notch / barra inferior)
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    const prev = meta.content;
    meta.content = `${prev}, viewport-fit=cover`;
    return () => { meta.content = prev; };
  }, []);

  // Teclado / clicker Bluetooth: flechas, AvPág/RePág, espacio, Inicio/Fin, B o punto para pantalla negra
  const sendRef = useRef(null);
  useEffect(() => {
    const keys = {
      ArrowRight: 'NEXT', ArrowDown: 'NEXT', PageDown: 'NEXT', ' ': 'NEXT', Enter: 'NEXT',
      ArrowLeft: 'PREV', ArrowUp: 'PREV', PageUp: 'PREV', Backspace: 'PREV',
      Home: 'FIRST', End: 'LAST', b: 'TOGGLE_BLANK', B: 'TOGGLE_BLANK', '.': 'TOGGLE_BLANK',
    };
    const onKey = (e) => {
      const action = keys[e.key];
      if (!action || e.altKey || e.ctrlKey || e.metaKey) return;
      // Enter/espacio sobre un botón ya lo activan; no duplicar
      if ((e.key === ' ' || e.key === 'Enter') && e.target.closest?.('button')) return;
      e.preventDefault();
      sendRef.current?.(action);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

  // Respeta los límites para no enviar comandos inútiles (teclado o gesto en la primera/última)
  const go = (action) => {
    const { currentSlide: c, totalSlides: t } = sessionData;
    if ((action === 'NEXT' || action === 'LAST') && c >= t) return;
    if ((action === 'PREV' || action === 'FIRST') && c <= 1) return;
    sendCommand(action);
  };
  sendRef.current = go;

  // Deslizar sobre la diapositiva al aire: izquierda = siguiente, derecha = anterior
  const swipeRef = useRef(null);
  const onPointerDown = (e) => { swipeRef.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    go(dx < 0 ? 'NEXT' : 'PREV');
  };

  // Desplazar tira de miniaturas al cambiar de diapositiva
  useEffect(() => {
    const strip = thumbnailsScrollRef.current;
    const activeEl = strip?.querySelector('[data-active="true"]');
    // Solo la tira (scrollIntoView también movía la página y sacaba de vista la diapositiva al aire)
    if (activeEl) {
      const offset = activeEl.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
      strip.scrollTo({ left: offset - (strip.clientWidth - activeEl.offsetWidth) / 2, behavior: 'smooth' });
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
  const summary = sessionData.slidesSummary || [];
  const fromSummary = (n) => summary.find((sl) => sl.index === n);
  // La vista completa del Estudio si ya corresponde a la diapositiva actual; si no (toque optimista), la de la tira
  const synced = sessionData.serverSlide === currentSlide;
  const liveSlide = (synced && sessionData.activeView) || (fromSummary(currentSlide) && summarySlide(fromSummary(currentSlide)))
    || sessionData.activeView || { title: sessionData.activeSlideTitle, fileUrl: sessionData.activeSlideUrl };
  const nextSlide = atEnd ? null : (synced && sessionData.nextView) || (fromSummary(currentSlide + 1) && summarySlide(fromSummary(currentSlide + 1)))
    || { title: sessionData.nextSlideTitle, fileUrl: sessionData.nextSlideUrl };
  const background = sessionData.background || null;

  return (
    // [&_img]: la animación global de <img> (oasisFadeIn, forwards) anularía los filtros de desenfoque de SlideCanvasView
    <div className="min-h-[100dvh] bg-[#F5F6FA] text-slate-900 font-sans select-none overflow-x-hidden [touch-action:manipulation] [-webkit-tap-highlight-color:transparent] [&_img]:[animation:none]">
      <div className="max-w-md md:max-w-xl mx-auto pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] pb-[calc(150px+env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))]">
        {/* Barra superior: marca + estado */}
        <header className="flex items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-10 h-10 shrink-0 rounded-2xl grid place-items-center text-white shadow-[0_6px_16px_rgba(245,158,11,0.35)]"
              style={{ background: `linear-gradient(145deg, #FBBF24, ${GOLD})` }}
              aria-hidden="true"
            >
              <Presentation size={20} />
            </span>
            <div className="leading-none min-w-0">
              <h1 className="font-moonrising !text-[17px] font-black tracking-wide">
                Oasis<span style={{ color: GOLD }}>Press</span>
              </h1>
              <p className="text-[12px] font-semibold text-slate-500 mt-1 truncate">{sessionData.title}</p>
            </div>
          </div>

          <span
            role="status"
            aria-label={live ? 'Conectado en vivo' : 'Sin conexión con el Estudio'}
            className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] font-bold ${
              live ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {live ? <Radio size={15} className="animate-pulse" aria-hidden="true" /> : <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            {live ? 'En vivo' : 'Conectando'}
          </span>
        </header>

        {statusInfo && (
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
            <statusInfo.icon size={18} className={`text-amber-500 shrink-0 ${statusInfo.spin ? 'animate-spin' : ''}`} aria-hidden="true" />
            <p className="m-0 text-[13px] font-semibold text-slate-600">{statusInfo.text}</p>
          </div>
        )}

        {/* Al aire: se ve igual que en el Estudio; deslizar cambia de diapositiva */}
        <section aria-label="Diapositiva al aire" className="mt-4">
          <div
            className="relative mx-auto aspect-video rounded-[22px] overflow-hidden bg-black shadow-[0_14px_40px_rgba(15,23,42,0.18)] [touch-action:pan-y]"
            // En horizontal (pantalla baja) la diapositiva se achica para no quedar tapada por la barra de control
            style={{ width: 'min(100%, calc((100dvh - 260px - env(safe-area-inset-bottom)) * 16 / 9))', minWidth: '200px' }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { swipeRef.current = null; }}
            onDragStart={(e) => e.preventDefault()}
          >
            <SlideCanvasView slide={liveSlide} background={background} rounded={false} />
            {isBlank && (
              <div className="absolute inset-0 bg-black/85 grid place-items-center" aria-label="Pantalla negra">
                <span className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white/10 text-white/90 text-[12px] font-bold">
                  <MonitorOff size={16} aria-hidden="true" /> Pantalla negra
                </span>
              </div>
            )}
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-black/55 backdrop-blur text-white text-[10px] font-black tracking-wider">
              <span className={`w-1.5 h-1.5 rounded-full ${isBlank ? 'bg-slate-400' : 'bg-red-500 animate-pulse'}`} aria-hidden="true" />
              {isBlank ? 'OFF' : 'LIVE'}
            </span>
            <span className="absolute bottom-2.5 right-2.5 h-6 px-2.5 rounded-full bg-black/55 backdrop-blur text-white text-[11px] font-bold tabular-nums grid place-items-center">
              {currentSlide}/{totalSlides}
            </span>
          </div>
          <p className="m-0 mt-2 px-1 text-[14px] font-bold text-slate-800 truncate text-center">{liveSlide?.title || `Diapositiva ${currentSlide}`}</p>
        </section>

        {/* Siguiente: tocarla la proyecta */}
        <button
          type="button"
          onClick={() => go('NEXT')}
          disabled={atEnd}
          aria-label={atEnd ? 'Fin de la presentación' : `Proyectar la siguiente: ${nextSlide?.title || ''}`}
          className="mt-3 w-full flex items-center gap-3 rounded-[20px] bg-white p-2.5 text-left shadow-[0_4px_18px_rgba(15,23,42,0.06)] !transition-transform !duration-150 active:scale-[0.98] disabled:active:scale-100 [touch-action:manipulation]"
        >
          <span className="block w-28 aspect-video rounded-xl overflow-hidden bg-slate-100 shrink-0">
            {atEnd ? (
              <span className="w-full h-full grid place-items-center">
                <Flag size={18} className="text-slate-300" aria-hidden="true" />
              </span>
            ) : (
              <SlideCanvasView slide={nextSlide} background={background} rounded={false} />
            )}
          </span>
          <span className="block min-w-0 flex-1">
            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">
              {atEnd ? 'Última diapositiva' : `Siguiente · ${currentSlide + 1}`}
            </span>
            <span className="block mt-1 text-[14px] font-bold text-slate-800 line-clamp-2">
              {atEnd ? 'Fin de la presentación' : nextSlide?.title || `Diapositiva ${currentSlide + 1}`}
            </span>
          </span>
          {!atEnd && <ChevronRight size={20} className="text-slate-300 shrink-0" aria-hidden="true" />}
        </button>

        {/* Todas las diapositivas: tocar una la pone al aire */}
        {summary.length > 0 && (
          <section aria-label="Diapositivas" className="mt-5">
            <div className="flex items-center justify-between px-1 mb-2 text-slate-500">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold">
                <Images size={14} aria-hidden="true" /> Diapositivas
              </span>
              <span className="text-[12px] font-bold tabular-nums">{summary.length}</span>
            </div>
            <div ref={thumbnailsScrollRef} className="flex gap-2.5 overflow-x-auto pt-1.5 pb-3 -mx-4 px-4 scroll-smooth [scrollbar-width:none] [touch-action:pan-x]" style={{ scrollSnapType: 'x proximity' }}>
              {summary.map((sl, i) => {
                const isActive = currentSlide === sl.index;
                const video = sl.mediaType === 'video' || sl.type === 'video';
                return (
                  <button
                    key={sl.id || sl.index || i}
                    type="button"
                    data-active={isActive ? 'true' : undefined}
                    aria-label={`Proyectar diapositiva ${sl.index}: ${sl.title}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => sendCommand('GOTO', { index: i })}
                    className="shrink-0 w-32 sm:w-36 text-left !transition-transform !duration-150 active:scale-95 [touch-action:manipulation]"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    <span className={`relative block aspect-video rounded-2xl overflow-hidden bg-black ${
                      isActive ? 'ring-[3px] ring-amber-400 ring-offset-2 ring-offset-[#F5F6FA] shadow-[0_8px_20px_rgba(245,158,11,0.35)]' : 'shadow-[0_4px_12px_rgba(15,23,42,0.12)]'
                    }`}>
                      <SlideCanvasView slide={summarySlide(sl)} background={background} rounded={false} />
                      <span className={`absolute top-1 left-1 min-w-[20px] h-5 px-1 rounded-full grid place-items-center text-[10px] font-black tabular-nums ${
                        isActive ? 'bg-amber-400 text-slate-900' : 'bg-black/60 text-white'
                      }`}>
                        {sl.index}
                      </span>
                      {video && (
                        <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white grid place-items-center" aria-hidden="true">
                          <Film size={11} />
                        </span>
                      )}
                    </span>
                    <span className={`block mt-1.5 px-0.5 text-[11px] font-semibold truncate ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                      {sl.title}
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
        <div className="max-w-md md:max-w-xl mx-auto pl-[max(20px,env(safe-area-inset-left))] pr-[max(20px,env(safe-area-inset-right))] pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
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
