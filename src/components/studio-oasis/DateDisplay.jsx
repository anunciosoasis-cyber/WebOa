import React from 'react';

const DateDisplay = ({ selectedDate }) => {
    // Transformamos "2026-07-25" a "25 / 07 / 2026" respetando los espacios de la maqueta
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
        }
        return dateStr;
    };

    return (
        <div
            className="bg-ui-bg shadow-neumorph rounded-2xl flex flex-row items-center p-1.5 h-[46px] w-full border border-white/50 select-none"
            data-purpose="date-display"
        >
            {/* Ícono de Calendario Estilizado a la Izquierda */}
            <div className="flex items-center justify-center px-2 text-gray-700 shrink-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[22px] h-[22px] opacity-85"
                >
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="4" />
                    <path d="M3 10h18" />
                </svg>
            </div>

            {/* Contenedor Interno Inset (Hundido) para la Fecha */}
            <div className="bg-ui-bg shadow-neumorph-inset rounded-xl flex-1 h-full flex items-center justify-center border border-white/30 px-3">
                <span className="font-sans font-bold text-[13px] tracking-wide text-gray-950 whitespace-nowrap">
                    {formatDisplayDate(selectedDate)}
                </span>
            </div>
        </div>
    );
};

export default DateDisplay;