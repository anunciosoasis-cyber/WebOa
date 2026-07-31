import React from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const BtnOrdenCulto = ({
    currentActivity,
    nextActivity,
    setCurrentActivityIndex,
    filteredOrden,
    setShowForm,
    setShowPlantilla,
    PLANTILLAS_DEFAULT,
    blockElapsedSeconds = 0,
    serviceStartTime,
    isBlockPaused,
    setIsBlockPaused,
    loadPlantilla
}) => {
    // Calculamos el tiempo restante para el bloque actual
    const duracionSegundos = (currentActivity?.duracionEstimada || 5) * 60;
    const tiempoRestante = serviceStartTime 
        ? Math.max(0, duracionSegundos - blockElapsedSeconds) 
        : duracionSegundos;

    const m = Math.floor(tiempoRestante / 60).toString().padStart(2, '0');
    const s = (tiempoRestante % 60).toString().padStart(2, '0');
    const displayTime = `${m}:${s}`;

    return (
        <div
            className="bg-ui-bg shadow-neumorph rounded-3xl p-4 flex-1 min-w-0 h-[105px] flex flex-row items-center gap-4 border border-white/50 overflow-hidden select-none text-gray-900"
            data-purpose="orden-culto-tracker"
        >

            {/* SUBSECCIÓN IZQUIERDA: Configuración y Títulos (Ancho fijo rígido) */}
            <div className="flex flex-col justify-between h-full w-[135px] shrink-0">
                <span className="font-moonrising text-[11px] uppercase tracking-wider text-gray-950 leading-none">
                    ORDEN DE <span className="text-oasis-yellow font-bold">CULTO</span>
                </span>

                {/* Botonera de Modificación Neumórfica Esférica */}
                <div className="flex items-center justify-between gap-1.5 w-full mt-0.5">
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-ui-bg shadow-neumorph w-7 h-7 rounded-full flex items-center justify-center font-black text-sm text-gray-800 hover:text-oasis-orange active:scale-95 transition-all border border-white/40"
                    >
                        +
                    </button>
                    <button
                        onClick={() => { /* Lógica para remover si es necesario */ }}
                        className="bg-ui-bg shadow-neumorph w-7 h-7 rounded-full flex items-center justify-center font-black text-sm text-gray-800 hover:text-oasis-orange active:scale-95 transition-all border border-white/40"
                    >
                        -
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-ui-bg shadow-neumorph text-[9px] font-bold flex-1 h-7 flex items-center justify-center rounded-2xl uppercase text-gray-700 hover:text-oasis-orange active:scale-95 transition-all border border-white/40"
                    >
                        Editar
                    </button>
                </div>

                {/* Botón de Inyección de Plantillas */}
                <button
                    onClick={() => setShowPlantilla(true)}
                    className="bg-oasis-yellow text-white text-[10px] py-1.5 px-3 rounded-xl font-bold tracking-widest uppercase shadow-[0_3px_8px_rgba(255,184,0,0.25)] text-center w-full mt-0.5 active:scale-[0.98] transition-all"
                >
                    Plantilla
                </button>
            </div>

            {/* SUBSECCIÓN DERECHA: Layout de Monitoreo de Cronograma Asíncrono */}
            <div className="flex-1 min-w-0 h-full flex flex-col justify-center gap-2 overflow-hidden">

                {/* 1. FILA SUPERIOR: Actividad en Curso Envolvente Inset */}
                <div className="bg-ui-bg shadow-neumorph-inset rounded-2xl px-4 flex items-center justify-between border border-white/30 h-[40px] w-full overflow-hidden">
                    <div className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap mr-2 flex-1 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isBlockPaused ? 'bg-gray-400' : 'bg-oasis-yellow shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-pulse'}`}></div>
                        <span className="text-[13px] font-bold text-gray-950 truncate font-sans">
                            {currentActivity?.actividad || "Sin actividad"}
                        </span>
                    </div>
                    {/* Render de Hora/Tiempo con tipografía Moonrising */}
                    <span className={`font-moonrising text-2xl font-bold ${tiempoRestante === 0 && serviceStartTime ? 'text-oasis-red animate-pulse' : 'text-gray-950'} shrink-0 tracking-wide`}>
                        {displayTime}
                    </span>
                </div>

                {/* 2. FILA INFERIOR: Navegación de Flujo + Próximo Evento en Cola */}
                <div className="flex flex-row items-center gap-3 h-[30px] w-full overflow-hidden">

                    {/* Micro Control Neumórfico de Transición de Índices */}
                    <div
                        className="bg-ui-bg shadow-neumorph rounded-full px-2 h-full flex items-center justify-center border border-white/50 select-none shrink-0"
                        data-purpose="micro-navigation-capsule"
                    >
                        {/* Riel interno hundido (Efecto Inset idéntico a CtrlCulto) */}
                        <div className="bg-ui-bg shadow-neumorph-inset rounded-full w-[95px] h-[24px] flex items-center justify-between px-1.5 relative border border-white/20">

                            {/* Botón Izquierdo: Actividad Anterior */}
                            <button
                                onClick={() => setCurrentActivityIndex(p => Math.max(0, p - 1))}
                                className="text-gray-500 hover:text-oasis-orange active:scale-90 transition-all z-10 w-5 h-5 flex items-center justify-center rounded-full"
                                title="Anterior bloque"
                            >
                                <ChevronLeft size={14} strokeWidth={3} />
                            </button>

                            {/* Botón Central: Control de Pausa/Play Individual */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                <button
                                    onClick={() => setIsBlockPaused(p => !p)}
                                    title={isBlockPaused ? "Iniciar tiempo de bloque" : "Pausar tiempo de bloque"}
                                    disabled={!serviceStartTime}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(245,158,11,0.4)] border border-white/40 text-white transform hover:scale-105 transition-all ${!serviceStartTime ? 'bg-gray-300 shadow-none cursor-not-allowed opacity-50' : isBlockPaused ? 'bg-gray-400 hover:bg-oasis-yellow' : 'bg-oasis-yellow'}`}
                                >
                                    {isBlockPaused ? (
                                        <Play size={12} fill="currentColor" className="ml-0.5" />
                                    ) : (
                                        <Pause size={12} fill="currentColor" />
                                    )}
                                </button>
                            </div>

                            {/* Botón Derecho: Siguiente Actividad */}
                            <button
                                onClick={() => setCurrentActivityIndex(p => Math.min(filteredOrden.length - 1, p + 1))}
                                className="text-gray-500 hover:text-oasis-orange active:scale-90 transition-all z-10 w-5 h-5 flex items-center justify-center rounded-full"
                                title="Siguiente bloque"
                            >
                                <ChevronRight size={14} strokeWidth={3} />
                            </button>

                        </div>
                    </div>

                    {/* Próxima Actividad en Cola Inset Mínimo */}
                    <div className="bg-ui-bg shadow-neumorph-inset rounded-xl px-4 flex flex-1 min-w-0 items-center justify-between border border-white/20 h-full overflow-hidden">
                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap mr-2 flex-1 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-oasis-yellow/50 shrink-0"></div>
                            <span className="text-[11px] font-bold text-gray-500 truncate font-sans">
                                {nextActivity?.actividad || "--"}
                            </span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-950 shrink-0 font-sans tracking-wide">
                            {nextActivity?.hora || "--"}
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default BtnOrdenCulto;