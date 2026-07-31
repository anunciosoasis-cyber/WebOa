import React from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, Tv } from 'lucide-react';
import CtrlCentralOpciones from './CenterControls';

const PreviewMonitors = ({
    liveOverlay,
    colors,
    pushToOBS,
    studioMode,
    setStudioMode,
    activePreviewSource,
    obsMonitorBg,
    setObsMonitorBg,
    isDark,
    handleTemplateChange
}) => {

    // Función encargada de renderizar el overlay dentro del lienzo a escala completa de la miniatura
    const renderExactOverlayContent = (overlay) => {
        if (!overlay || overlay.mode === 'hidden') return null;
        if (overlay.mode === 'bible' || overlay.mode === 'himno') {
            return (
                <div className="w-full h-full flex items-center justify-center p-8 select-none">
                    <div className="w-full max-w-[85%] bg-slate-900/95 backdrop-blur-md rounded-3xl p-8 border-4 border-oasis-yellow shadow-2xl text-center">
                        <p className="text-white text-[32px] font-black leading-snug tracking-wide whitespace-pre-line">
                            {overlay.data?.text || overlay.content}
                        </p>
                    </div>
                </div>
            );
        }
        if (overlay.mode === 'preacher') {
            return (
                <div className="w-full h-full flex items-end justify-start p-12 select-none">
                    <div className="flex items-center gap-5 bg-slate-950/95 backdrop-blur-lg p-6 rounded-2xl border-l-[8px] border-oasis-yellow shadow-2xl max-w-[70%]">
                        <div className="w-14 h-14 bg-gradient-to-br from-oasis-yellow to-oasis-red rounded-xl flex items-center justify-center text-2xl">
                            🎙
                        </div>
                        <div className="overflow-hidden">
                            <h5 className="text-white text-[20px] font-black uppercase tracking-widest truncate">
                                {overlay.title || overlay.data?.name}
                            </h5>
                            <p className="text-gray-400 text-[14px] font-bold uppercase tracking-wider mt-0.5 truncate">
                                {overlay.content || overlay.data?.title}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        if (overlay.mode === 'anuncio') {
            return (
                <div className="w-full h-full flex items-center justify-center p-8 select-none">
                    <div className="w-[85%] bg-gradient-to-br from-emerald-600/95 to-teal-700/95 backdrop-blur-md p-6 rounded-2xl border-2 border-white/20 text-center shadow-2xl">
                        <h6 className="text-emerald-100 text-[14px] font-black tracking-widest uppercase mb-1">
                            📢 {overlay.title || overlay.data?.title}
                        </h6>
                        <p className="text-white text-[18px] font-bold leading-normal whitespace-pre-line">
                            {overlay.content || overlay.data?.content}
                        </p>
                    </div>
                </div>
            );
        }
        if (overlay.mode === 'countdown') {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center select-none relative overflow-hidden">
                    {overlay.customBg && (
                        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${overlay.customBg})` }}></div>
                    )}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
                    <div className="z-10 text-center flex flex-col items-center justify-center">
                        <h2 className="text-oasis-yellow text-[10px] font-black uppercase tracking-[2px] font-moonrising mb-0.5">
                            {overlay.title || 'ESTAMOS COMENZANDO'}
                        </h2>
                        <div className="text-white text-[28px] font-black leading-none font-moonrising drop-shadow-xl">
                            05:00
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-3">
                <Tv size={32} className="opacity-50" />
                <span className="text-[11px] font-bold tracking-widest uppercase">
                    {activePreviewSource} EN MODO
                </span>
            </div>
        );
    };

    const isChroma = obsMonitorBg === 'chroma';

    return (
        <div className="w-full flex flex-col lg:flex-row gap-4 items-center justify-between min-h-[145px] select-none text-gray-900">

            {/* MONITOR 1: Pantalla OBS (Izquierda) */}
            <div className="flex-1 w-full lg:max-w-[38%] flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between px-1">
                    <span className="font-moonrising text-[9.5px] uppercase tracking-widest text-slate-700 bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isChroma ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} />
                        PANTALLA OBS
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setObsMonitorBg(prev => prev === 'video' ? 'chroma' : 'video')}
                            className="text-[8px] font-bold bg-white shadow-sm border border-gray-100 px-2 py-0.5 rounded-md hover:text-oasis-orange transition-colors"
                        >
                            🎨 {isChroma ? 'Croma' : 'Video'}
                        </button>
                        <button
                            onClick={() => window.open('/transmision/overlay', 'OBS_WINDOW', 'width=1920,height=1080')}
                            className="text-[8px] font-bold bg-white shadow-sm border border-gray-100 px-2 py-0.5 rounded-md hover:text-oasis-orange transition-colors"
                        >
                            ↗ Full
                        </button>
                    </div>
                </div>

                {/* Contenedor de la miniatura a escala */}
                <div className="w-full aspect-video bg-ui-bg shadow-neumorph rounded-3xl overflow-hidden border border-white/60 relative p-1">
                    <div className="w-full h-full rounded-2xl overflow-hidden relative bg-black">
                        {/* Lienzo virtual de 1920x1080 encogido proporcionalmente mediante CSS transform */}
                        <div
                            className="absolute origin-top-left w-[1920px] h-[1080px]"
                            style={{
                                transform: 'scale(0.125)', // Escala fija para encajar 1920px en el ancho relativo del flexbox
                                background: isChroma ? '#0000FF' : 'linear-gradient(to bottom, rgba(30,27,75,0.4), rgba(15,23,42,0.7)), url("https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1920") center/cover'
                            }}
                        >
                            {(!liveOverlay || !liveOverlay.mode || liveOverlay.mode === 'hidden') ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-4">
                                    <Tv size={80} className="opacity-40" />
                                    <span className="text-2xl font-black tracking-widest uppercase">OBS EN NEGRO</span>
                                </div>
                            ) : (
                                renderExactOverlayContent(liveOverlay)
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROL CENTRAL: Botonera Modular Estirada (Centro) */}
            <div className="w-full lg:w-[24%] shrink-0 flex items-center justify-center py-2 lg:py-0">
                <CtrlCentralOpciones
                    studioMode={studioMode}
                    setStudioMode={setStudioMode}
                    pushToOBS={pushToOBS}
                    activePreviewSource={activePreviewSource}
                    handleTemplateChange={handleTemplateChange}
                    liveOverlay={liveOverlay}
                />
            </div>

            {/* MONITOR 2: Pantalla Proyector (Derecha) */}
            <div className="flex-1 w-full lg:max-w-[38%] flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between px-1">
                    <span className="font-moonrising text-[9.5px] uppercase tracking-widest text-slate-700 bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-oasis-yellow animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        PANTALLA PROYECTOR
                    </span>
                    <button
                        onClick={() => window.open('/transmision/proyector', 'PROYECTOR_WINDOW', 'width=1920,height=1080')}
                        className="text-[8px] font-bold bg-white shadow-sm border border-gray-100 px-2 py-0.5 rounded-md hover:text-oasis-orange transition-colors"
                    >
                        ↗ Full
                    </button>
                </div>

                {/* Contenedor de la miniatura a escala */}
                <div className="w-full aspect-video bg-ui-bg shadow-neumorph rounded-3xl overflow-hidden border border-white/60 relative p-1">
                    <div className="w-full h-full rounded-2xl overflow-hidden relative bg-black">
                        {/* Lienzo virtual de 1920x1080 encogido proporcionalmente */}
                        <div
                            className="absolute origin-top-left w-[1920px] h-[1080px]"
                            style={{
                                transform: 'scale(0.125)',
                                background: 'radial-gradient(circle at 50% 20%, rgba(30, 27, 75, 0.6) 0%, rgba(9, 14, 23, 0.95) 100%), url("https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=1920") center/cover'
                            }}
                        >
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                            <div className="relative w-full h-full">
                                {(!liveOverlay || !liveOverlay.mode || liveOverlay.mode === 'hidden') ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-4">
                                        <MonitorPlay size={80} className="opacity-40" />
                                        <span className="text-2xl font-black tracking-widest uppercase">TEMPLO EN NEGRO</span>
                                    </div>
                                ) : (
                                    renderExactOverlayContent(liveOverlay)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PreviewMonitors;