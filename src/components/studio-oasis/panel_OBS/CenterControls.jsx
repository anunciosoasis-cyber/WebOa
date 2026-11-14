import React, { useState } from 'react';
import { LayoutTemplate, Sparkles, PanelRight, Film, Send, Eraser, MonitorPlay, Tv } from 'lucide-react';

const CtrlCentralOpciones = ({
    studioMode,
    setStudioMode,
    pushToOBS,
    activePreviewSource,
    handleTemplateChange,
    liveOverlay
}) => {
    const [currentStyle, setCurrentStyle] = useState(() => {
        try { return (localStorage.getItem('oasis_presentation_template') || 'CLASSIC').toUpperCase(); }
        catch { return 'CLASSIC'; }
    });
    const estilos = [
        { id: 'CLASSIC', icon: LayoutTemplate, tooltip: 'Clásico' },
        { id: 'MINIMAL', icon: Sparkles, tooltip: 'Minimalista' },
        { id: 'SIDEBAR', icon: PanelRight, tooltip: 'Sidebar' },
        { id: 'CINEMATIC', icon: Film, tooltip: 'Cinemático' }
    ];

    const hayAlAire = liveOverlay && liveOverlay.mode && liveOverlay.mode !== 'hidden';
    const vistaBtn = (activo) => `w-8 h-8 rounded-full flex items-center justify-center transition-all ${activo
        ? 'bg-white shadow-sm border border-gray-100 text-oasis-yellow'
        : 'text-gray-400 hover:text-gray-600 border border-transparent'}`;

    return (
        // Barra de solo iconos: en la columna central se apila (es estrecha); bajo los monitores queda en una fila.
        <div
            className="w-fit max-w-full mx-auto flex flex-wrap items-center justify-center gap-2.5 p-2 select-none bg-ui-bg shadow-neumorph rounded-[1.75rem] border border-white/60"
            data-purpose="center-production-pill-switcher"
        >
            {/* Acciones al aire */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    onClick={() => {
                        if (hayAlAire) {
                            pushToOBS(liveOverlay.mode, liveOverlay.title, liveOverlay.content, {
                                template: currentStyle.toLowerCase(),
                                subText: liveOverlay.subText || ''
                            });
                        }
                    }}
                    disabled={!hayAlAire}
                    title="Transición al aire: reenviar lo que está al aire con el estilo elegido"
                    aria-label="Transición al aire"
                    className="w-10 h-10 rounded-full bg-oasis-yellow text-white flex items-center justify-center shadow-[0_4px_10px_rgba(245,158,11,0.4)] border border-white/40 hover:scale-105 active:scale-95 transition-all disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <Send size={16} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => pushToOBS('hidden')}
                    title="Limpiar pantallas (OBS y proyector)"
                    aria-label="Limpiar pantallas"
                    className="w-10 h-10 rounded-full bg-white text-oasis-red flex items-center justify-center shadow-sm border border-gray-100 hover:shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                    <Eraser size={16} strokeWidth={2.5} />
                </button>
            </div>

            {/* Vista del monitor: OBS / Proyector */}
            <div className="bg-ui-bg shadow-neumorph-inset rounded-full p-1 flex items-center gap-0.5 border border-white/30" role="group" aria-label="Vista del estudio">
                <button onClick={() => setStudioMode(true)} title="Vista OBS" aria-label="Vista OBS" aria-pressed={!!studioMode} className={vistaBtn(studioMode)}>
                    <MonitorPlay size={15} strokeWidth={2.2} />
                </button>
                <button onClick={() => setStudioMode(false)} title="Vista proyector" aria-label="Vista proyector" aria-pressed={!studioMode} className={vistaBtn(!studioMode)}>
                    <Tv size={15} strokeWidth={2.2} />
                </button>
            </div>

            {/* Estilo de presentación */}
            <div className="oasis-ctrl-estilos grid gap-1 bg-white shadow-sm rounded-2xl p-1 border border-gray-100/70" role="group" aria-label="Estilo de presentación">
                {estilos.map((estilo) => {
                    const isSelected = currentStyle === estilo.id;
                    const Icon = estilo.icon;
                    return (
                        <button
                            key={estilo.id}
                            title={`Estilo ${estilo.tooltip}`}
                            aria-label={`Estilo ${estilo.tooltip}`}
                            aria-pressed={isSelected}
                            onClick={() => {
                                setCurrentStyle(estilo.id);
                                if (handleTemplateChange) {
                                    handleTemplateChange(estilo.id.toLowerCase());
                                }
                            }}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-oasis-yellow/90 text-gray-950 shadow-sm' : 'text-gray-400 hover:text-slate-600'}`}
                        >
                            <Icon size={14} strokeWidth={isSelected ? 2.5 : 2} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CtrlCentralOpciones;
