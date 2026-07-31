import React, { useState } from 'react';
import { LayoutTemplate, Sparkles, PanelRight, Film } from 'lucide-react';

const CtrlCentralOpciones = ({
    studioMode,
    setStudioMode,
    pushToOBS,
    activePreviewSource,
    handleTemplateChange,
    liveOverlay
}) => {
    const [currentStyle, setCurrentStyle] = useState('CLASSIC');
    const estilos = [
        { id: 'CLASSIC', icon: LayoutTemplate, tooltip: 'Clásico' },
        { id: 'MINIMAL', icon: Sparkles, tooltip: 'Minimalista' },
        { id: 'SIDEBAR', icon: PanelRight, tooltip: 'Sidebar' },
        { id: 'CINEMATIC', icon: Film, tooltip: 'Cinemático' }
    ];

    // Distribución proporcional
    const getLeftPosition = (styleId) => {
        switch (styleId) {
            case 'CLASSIC': return 'left-[1%] w-[24%]';
            case 'MINIMAL': return 'left-[26%] w-[24%]';
            case 'SIDEBAR': return 'left-[51%] w-[24%]';
            case 'CINEMATIC': return 'left-[75%] w-[24%]';
            default: return 'left-[1%] w-[24%]';
        }
    };

    return (
        <div
            className="w-full flex flex-col gap-3 p-2 select-none justify-center h-full max-w-[290px] mx-auto"
            data-purpose="center-production-pill-switcher"
        >
            {/* FILA 1: Transición al Aire */}
            <button
                onClick={() => {
                    if (liveOverlay && liveOverlay.mode && liveOverlay.mode !== 'hidden') {
                        pushToOBS(liveOverlay.mode, liveOverlay.title, liveOverlay.content, { 
                            template: currentStyle.toLowerCase(),
                            subText: liveOverlay.subText || ''
                        });
                    } else {
                        pushToOBS(activePreviewSource);
                    }
                }}
                className="w-full h-[30px] bg-white shadow-sm hover:shadow-md rounded-full flex flex-col items-center justify-center font-moonrising text-[10px] font-bold uppercase tracking-wider text-slate-800 border border-gray-100/70 transition-all active:scale-[0.98]"
            >
                <span>Transición al aire</span>
            </button>

            {/* FILA 2: Limpiar Pantallas (Texto Corregido) */}
            <button
                onClick={() => pushToOBS('hidden')}
                className="w-full h-[30px] bg-white shadow-sm hover:shadow-md rounded-full flex flex-col items-center justify-center font-moonrising text-[10px] font-bold uppercase tracking-wider text-oasis-red border border-gray-100/70 transition-all active:scale-[0.98]"
            >
                <span>Limpiar Pantallas</span>
            </button>

            {/* FILA 3: Conmutadores de Pantalla en Paralelo */}
            <div className="grid grid-cols-2 gap-3 w-full">
                <button
                    onClick={() => setStudioMode(true)}
                    className={`h-[30px] rounded-full font-moonrising text-[9.5px] font-bold uppercase tracking-wider flex items-center justify-center transition-all border ${studioMode
                        ? 'bg-white shadow-sm border-gray-100 text-oasis-yellow font-black'
                        : 'bg-transparent text-gray-400 border-transparent hover:text-gray-600'
                        }`}
                >
                    Vista OBS
                </button>
                <button
                    onClick={() => setStudioMode(false)}
                    className={`h-[30px] rounded-full font-moonrising text-[9.5px] font-bold uppercase tracking-wider flex items-center justify-center transition-all border ${!studioMode
                        ? 'bg-white shadow-sm border-gray-100 text-slate-800 font-black'
                        : 'bg-transparent text-gray-400 border-transparent hover:text-gray-600'
                        }`}
                >
                    Proyector
                </button>
            </div>

            {/* FILA 4: Multi-selector de Estilo de Presentación (Iconos Elegantes) */}
            <div className="bg-white shadow-sm rounded-full p-1 h-[30px] w-full border border-gray-100/70 relative flex items-center">
                {/* Píldora Flotante Amarilla */}
                <div
                    className={`absolute top-1 bottom-1 bg-oasis-yellow/90 rounded-full shadow-sm transition-all duration-300 ease-out z-10 ${getLeftPosition(currentStyle)}`}
                />

                {estilos.map((estilo) => {
                    const isSelected = currentStyle === estilo.id;
                    const Icon = estilo.icon;
                    return (
                        <button
                            key={estilo.id}
                            title={estilo.tooltip}
                            onClick={() => {
                                setCurrentStyle(estilo.id);
                                if (handleTemplateChange) {
                                    handleTemplateChange(estilo.id.toLowerCase());
                                }
                            }}
                            className={`flex-1 h-full z-20 transition-all duration-300 flex items-center justify-center ${isSelected ? 'text-gray-950 scale-110 drop-shadow-sm' : 'text-gray-400 hover:text-slate-600 hover:scale-105'
                                }`}
                        >
                            <Icon size={18} strokeWidth={isSelected ? 2.5 : 2} />
                        </button>
                    );
                })}
            </div>

        </div>
    );
};

export default CtrlCentralOpciones;