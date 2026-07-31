import React from 'react';
import { Play } from 'lucide-react';

const CtrlCulto = ({ isPaused, setIsPaused, startService, endService, serviceStartTime }) => {
    
    const handlePlay = () => {
        if (!serviceStartTime) {
            startService();
        } else if (isPaused) {
            setIsPaused(false);
        }
    };

    const handlePause = () => {
        if (serviceStartTime && !isPaused) {
            setIsPaused(true);
        }
    };

    const handleStop = () => {
        if (serviceStartTime) {
            endService();
        }
    };

    return (
        <div
            className="bg-ui-bg shadow-neumorph rounded-2xl flex items-center justify-center p-1.5 h-[45px] w-full border border-white/50 select-none"
            data-purpose="culto-multimedia-controls"
        >
            {/* Riel interno hundido (Inset Layout de la maqueta) */}
            <div className="bg-ui-bg shadow-neumorph-inset rounded-xl w-[135px] h-[30px] flex items-center justify-between px-3 relative border border-white/20">

                {/* Botón de Pausa / Reanudación */}
                <button
                    onClick={handlePause}
                    className={`font-bold text-xs tracking-widest transition-all z-10 w-6 h-6 flex items-center justify-center ${isPaused ? 'text-oasis-orange animate-pulse' : 'text-gray-600 hover:text-oasis-orange active:scale-95'}`}
                    disabled={!serviceStartTime}
                >
                    ||
                </button>

                {/* Botón Central Play: Flotante y de mayor tamaño que rompe el eje vertical */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <button
                        onClick={handlePlay}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(245,158,11,0.4)] text-white hover:scale-105 active:scale-95 transition-all border border-white/40 ${serviceStartTime && !isPaused ? 'bg-green-500 shadow-[0_4px_10px_rgba(34,197,94,0.4)]' : 'bg-oasis-yellow'}`}
                    >
                        <Play size={13} fill="currentColor" className="ml-0.5" />
                    </button>
                </div>

                {/* Botón de Detención (Stop) */}
                <button
                    onClick={handleStop}
                    className="w-6 h-6 flex items-center justify-center z-10 group"
                    disabled={!serviceStartTime}
                >
                    <div className={`w-3 h-3 rounded-[3px] transition-all ${serviceStartTime ? 'bg-black group-hover:bg-oasis-red active:scale-95' : 'bg-gray-300'}`}></div>
                </button>

            </div>
        </div>
    );
};

export default CtrlCulto;