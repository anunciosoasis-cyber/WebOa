// PressRemote.jsx
import React, { useState } from 'react';

export const PressRemote = ({ remoteUrl, qrApiUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (navigator.clipboard && remoteUrl) {
      navigator.clipboard.writeText(remoteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#EEF1F6] p-5 sm:p-6 rounded-[32px] border border-white/80 shadow-[10px_10px_25px_rgba(166,180,200,0.35),-10px_-10px_25px_rgba(255,255,255,0.9)] flex flex-col justify-between items-center text-center h-full w-full font-sans">

      {/* HEADER: BADGE SUPERIOR */}
      <div className="w-full flex justify-center">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-[2px_3px_8px_rgba(0,0,0,0.04)] border border-slate-200/80">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
            CONTROL REMOTO QR
          </span>
        </div>
      </div>

      {/* CONTENEDOR CENTRAL: QR & DESCRIPCIÓN */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto space-y-4 w-full py-3">
        <p className="text-xs font-semibold text-slate-500 max-w-[240px] leading-relaxed">
          Escanea el código con la cámara de tu celular para controlar las diapositivas en vivo.
        </p>

        {/* Marco QR centrado y escalado para equilibrio visual */}
        <div className="bg-white p-4 sm:p-5 rounded-[28px] shadow-[4px_6px_18px_rgba(166,180,200,0.25)] border border-slate-200/80 inline-flex items-center justify-center transition-transform hover:scale-[1.02]">
          {qrApiUrl ? (
            <img
              src={qrApiUrl}
              alt="Código QR Control Remoto"
              className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl block"
            />
          ) : (
            <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-xl bg-slate-100 animate-pulse" aria-label="Generando código QR" />
          )}
        </div>
      </div>

      {/* FOOTER: INPUT URL Y BOTÓN DE ACCIÓN */}
      <div className="w-full space-y-3 pt-1">
        {/* Input estilizado tipo pastilla */}
        <div className="bg-white/80 border border-slate-200/80 px-4 py-2.5 rounded-full text-[11px] font-mono font-bold text-slate-600 truncate shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] select-all text-center">
          {remoteUrl || 'Cargando enlace...'}
        </div>

        {/* Botón Principal Amarillo Oasis */}
        <button
          onClick={handleCopyLink}
          className={`w-full py-3.5 rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-md ${
            copied
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-[#FFB800] hover:bg-[#F3AD00] text-slate-950 shadow-[0_4px_14px_rgba(255,184,0,0.4)]'
          }`}
        >
          {copied ? '✓ ¡ENLACE COPIADO!' : 'COPIAR ENLACE REMOTO'}
        </button>
      </div>

    </div>
  );
};

export default PressRemote;