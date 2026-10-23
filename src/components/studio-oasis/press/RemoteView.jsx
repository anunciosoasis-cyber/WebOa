// RemoteView.jsx — control remoto del celular (QR). Habla con Oasis Press por el canal en tiempo real,
// así funciona desde otro dispositivo (antes usaba localStorage, que solo existe dentro del mismo navegador).
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../api/supabaseClient';
import { liveKeyFromUrl, pressChannel } from '../../../api/liveChannel';

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
  });
  // 'sin-clave' | 'conectando' | 'conectado' | 'sin-estudio'
  const [status, setStatus] = useState(() => (liveKeyFromUrl() ? 'conectando' : 'sin-clave'));
  const channelRef = useRef(null);

  useEffect(() => {
    const key = liveKeyFromUrl();
    if (!key) return;
    const channel = pressChannel(key);
    let waitTimer;
    channel
      .on('broadcast', { event: 'ppt_state' }, ({ payload }) => {
        if (payload) {
          setSessionData(payload);
          setStatus('conectado');
          clearTimeout(waitTimer);
        }
      })
      .subscribe((st) => {
        if (st === 'SUBSCRIBED') {
          channel.send({ type: 'broadcast', event: 'ppt_request_state', payload: {} });
          // Si nadie responde, Oasis Press no está abierto en el estudio
          waitTimer = setTimeout(() => setStatus(s => (s === 'conectando' ? 'sin-estudio' : s)), 4000);
        }
      });
    channelRef.current = channel;
    return () => {
      clearTimeout(waitTimer);
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  const sendCommand = (action) => {
    triggerVibration();
    channelRef.current?.send({ type: 'broadcast', event: 'ppt_command', payload: { action, timestamp: Date.now() } });
  };

  const statusLabel = {
    'sin-clave': 'Enlace incompleto: vuelve a escanear el QR desde Studio Oasis',
    'conectando': 'Conectando con el estudio…',
    'sin-estudio': 'No se encuentra el estudio: abre Oasis Press en el PC',
    'conectado': null,
  }[status];

  return (
    <div className="min-h-screen bg-[#EBECEF] p-4 sm:p-6 flex items-center justify-center font-sans select-none">
      
      {/* TARJETA PRINCIPAL DEL SMARTPHONE (MAQUETA EXACTA) */}
      <div className="bg-white rounded-[40px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 max-w-sm w-full space-y-5 flex flex-col justify-between">
        
        {/* HEADER MARCA OASIS PRESS */}
        <div className="text-left space-y-0.5 border-b border-slate-200/80 pb-3">
          <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase block">
            PRODUCCIÓN EN TIEMPO REAL
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">
            OASIS<span className="text-[#FFB800]">PRESS</span>
          </h1>
        </div>

        {statusLabel && (
          <p role="status" className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2 m-0">
            {statusLabel}
          </p>
        )}

        {/* PANTALLA PRINCIPAL EN VIVO (PANTALLA PROYECTOR) */}
        <div className="relative w-full aspect-video bg-black rounded-[24px] p-3 shadow-lg flex flex-col justify-between overflow-hidden text-white border border-slate-950">
          
          {/* Badge Superior Izquierdo */}
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
              PANTALLA PROYECTOR
            </span>

            <span className="text-[10px] font-mono font-bold text-[#FFB800] bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
              {sessionData.currentSlide} / {sessionData.totalSlides}
            </span>
          </div>

          {/* Contenido Visual Diapositiva Activa */}
          <div className="my-auto text-center flex items-center justify-center h-full">
            {sessionData.isBlank ? (
              <span className="text-rose-400 font-mono text-[10px] uppercase font-bold tracking-widest animate-pulse">
                [ PANTALLA NEGRA ]
              </span>
            ) : sessionData.activeSlideUrl ? (
              <img
                src={sessionData.activeSlideUrl}
                alt="Diapositiva Activa"
                className="max-h-[110px] w-full object-contain rounded-lg shadow-md mx-auto"
              />
            ) : (
              <h3 className="text-xs font-black text-white line-clamp-2 px-2 leading-tight">
                {sessionData.activeSlideTitle || `Diapositiva ${sessionData.currentSlide}`}
              </h3>
            )}
          </div>
        </div>

        {/* PANTALLA SECUNDARIA PEQUEÑA (SIGUIENTE / A CONTINUACIÓN) */}
        <div className="relative w-44 h-24 mx-auto bg-black rounded-[20px] p-2 shadow-md flex flex-col justify-between overflow-hidden text-white text-center border border-slate-900">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 self-center">
            SIGUIENTE
          </span>

          <div className="my-auto flex items-center justify-center h-full">
            {sessionData.nextSlideUrl ? (
              <img
                src={sessionData.nextSlideUrl}
                alt="Siguiente Diapositiva"
                className="max-h-[50px] w-full object-contain rounded mx-auto"
              />
            ) : (
              <p className="text-[10px] font-semibold text-slate-300 line-clamp-1 italic px-1">
                {sessionData.nextSlideTitle || 'Fin de Presentación'}
              </p>
            )}
          </div>
        </div>

        {/* CONTENEDOR INFERIOR DE NAVEGACIÓN NEUMÓRFICO */}
        <div className="bg-[#F4F5F8] rounded-[32px] p-5 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05),0_6px_20px_rgba(0,0,0,0.03)] border border-slate-200/60 space-y-3 flex flex-col items-center justify-center">
          
          {/* Panel de Botones Flechas Nav (Píldora Neumórfica Blanca) */}
          <div className="bg-white rounded-full p-2 border border-slate-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex items-center justify-between w-full px-6">
            
            {/* Flecha Izquierda */}
            <button
              onClick={() => sendCommand('PREV')}
              disabled={status !== 'conectado' || sessionData.currentSlide <= 1}
              className="text-black hover:text-[#FFB800] active:scale-90 disabled:opacity-25 transition-all p-2 text-2xl font-black outline-none cursor-pointer"
              title="Anterior"
            >
              ◀
            </button>

            {/* Separador sutil */}
            <div className="w-[1px] h-6 bg-slate-200"></div>

            {/* Flecha Derecha */}
            <button
              onClick={() => sendCommand('NEXT')}
              disabled={status !== 'conectado' || sessionData.currentSlide >= sessionData.totalSlides}
              className="text-black hover:text-[#FFB800] active:scale-90 disabled:opacity-25 transition-all p-2 text-2xl font-black outline-none cursor-pointer"
              title="Siguiente"
            >
              ▶
            </button>
          </div>

          {/* Botón Alternar Pantalla Negra */}
          <button
            onClick={() => sendCommand('TOGGLE_BLANK')}
            disabled={status !== 'conectado'}
            className={`text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full transition-all ${
              sessionData.isBlank
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {sessionData.isBlank ? 'Restaurar Pantalla' : 'Pantalla Negra (Blank)'}
          </button>
        </div>

      </div>

    </div>
  );
};

export default RemoteView;
