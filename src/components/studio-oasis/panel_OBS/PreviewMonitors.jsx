import React, { useEffect, useRef, useState } from 'react';
import { useLiveKey, liveUrl } from '../../../api/liveChannel';
import { motion } from 'framer-motion';
import { MonitorPlay, Tv, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '../../../react-ui/components/Toast';
import CtrlCentralOpciones from './CenterControls';

/** Lienzo de 1920x1080 escalado al ancho real del monitor (con escala fija sobraba negro en monitores grandes). */
const ScaledCanvas = ({ style, children }) => {
    const ref = useRef(null);
    const [scale, setScale] = useState(0.125);
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(([entry]) => { if (entry.contentRect.width) setScale(entry.contentRect.width / 1920); });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return (
        <div ref={ref} className="absolute inset-0 overflow-hidden bg-black">
            <div className="absolute top-0 left-0 origin-top-left w-[1920px] h-[1080px]" style={{ ...style, transform: `scale(${scale})` }}>
                {children}
            </div>
        </div>
    );
};

/** Monitor: tarjeta neumórfica con la pantalla; etiqueta y acciones flotan dentro, sobre la imagen. */
const MonitorFrame = ({ label, dotClass, actions, children }) => (
    <div className="min-w-0 bg-ui-bg shadow-neumorph rounded-3xl p-1.5 border border-white/60">
        <div className="relative w-full aspect-video rounded-[1.25rem] overflow-hidden bg-black">
            {children}
            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-2 pointer-events-none">
                <span className="pointer-events-auto inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-md text-white font-moonrising text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotClass}`} />
                    {label}
                </span>
                <div className="pointer-events-auto flex items-center gap-1">{actions}</div>
            </div>
        </div>
    </div>
);

const GlassIcon = ({ title, onClick, children }) => (
    <button type="button" onClick={onClick} title={title} aria-label={title}
        className="w-7 h-7 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-white/85 hover:text-oasis-yellow hover:bg-black/70 flex items-center justify-center transition-colors active:scale-95">
        {children}
    </button>
);

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
    const liveKey = useLiveKey();

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

    const { showToast } = useToast();
    const isChroma = obsMonitorBg === 'chroma';

    const copyObsUrl = () => {
        const url = `${window.location.origin}${liveUrl('/transmision/overlay', liveKey)}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showToast('Enlace transparente para OBS copiado al portapapeles', 'success');
            }).catch(() => {
                prompt('Copia este enlace para OBS:', url);
            });
        } else {
            prompt('Copia este enlace para OBS:', url);
        }
    };

    return (
        <div className="oasis-monitors w-full select-none text-gray-900">

            {/* MONITOR 1: Pantalla OBS */}
            <MonitorFrame
                label={isChroma ? 'OBS · Chroma' : 'OBS'}
                dotClass={isChroma ? 'bg-blue-400' : 'bg-emerald-400'}
                actions={<>
                    <GlassIcon title="Copiar URL para la fuente de navegador de OBS" onClick={copyObsUrl}><Copy size={12} /></GlassIcon>
                    <GlassIcon title="Abrir OBS a pantalla completa" onClick={() => window.open(liveUrl('/transmision/overlay', liveKey), 'OBS_WINDOW', 'width=1920,height=1080')}><ExternalLink size={12} /></GlassIcon>
                </>}
            >
                        <ScaledCanvas
                            style={{
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
                        </ScaledCanvas>
            </MonitorFrame>

            {/* CONTROL CENTRAL */}
            <div className="oasis-monitors__ctrl flex items-center justify-center">
                <CtrlCentralOpciones
                    studioMode={studioMode}
                    setStudioMode={setStudioMode}
                    pushToOBS={pushToOBS}
                    activePreviewSource={activePreviewSource}
                    handleTemplateChange={handleTemplateChange}
                    liveOverlay={liveOverlay}
                />
            </div>

            {/* MONITOR 2: Pantalla Proyector */}
            <MonitorFrame
                label="Proyector"
                dotClass="bg-oasis-yellow"
                actions={<GlassIcon title="Abrir el proyector a pantalla completa" onClick={() => window.open(liveUrl('/transmision/proyector', liveKey), 'PROYECTOR_WINDOW', 'width=1920,height=1080')}><ExternalLink size={12} /></GlassIcon>}
            >
                        <ScaledCanvas
                            style={{
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
                        </ScaledCanvas>
            </MonitorFrame>

        </div>
    );
};

export default PreviewMonitors;