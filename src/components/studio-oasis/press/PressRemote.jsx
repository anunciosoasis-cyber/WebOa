// PressRemote.jsx
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

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
    <div className="oasis-remote bg-ui-bg shadow-neumorph p-4 rounded-[2rem] border border-white/60 flex flex-row items-center gap-4 w-full font-sans">

      {/* Compacto: QR a la izquierda, texto y botón a la derecha (la columna comparte espacio con la tira) */}
      <div className="shrink-0">

        {/* Marco QR centrado y escalado para equilibrio visual */}
        <div className="bg-white p-2 rounded-2xl shadow-[4px_6px_18px_rgba(166,180,200,0.25)] border border-slate-200/80 inline-flex items-center justify-center">
          {qrApiUrl ? (
            <img
              src={qrApiUrl}
              alt="Código QR Control Remoto"
              className="oasis-remote__qr w-24 h-24 object-contain rounded-lg block"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-slate-100 animate-pulse" aria-label="Generando código QR" />
          )}
        </div>
      </div>

      {/* FOOTER: INPUT URL Y BOTÓN DE ACCIÓN */}
      <div className="flex-1 min-w-0 space-y-2 text-left">
        <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest m-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Control remoto
        </p>
        <p className="oasis-remote__desc text-[11px] font-semibold text-slate-500 leading-snug m-0">Escanéalo con el celular para pasar las diapositivas.</p>
        {/* Input estilizado tipo pastilla */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-ui-bg shadow-neumorph-inset border border-white/30 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold text-slate-600 truncate select-all">
            {remoteUrl || 'Cargando enlace...'}
          </div>
          <button
            onClick={handleCopyLink}
            title={copied ? 'Enlace copiado' : 'Copiar enlace del control remoto'}
            aria-label="Copiar enlace del control remoto"
            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border transition-all active:scale-95 ${copied
              ? 'bg-oasis-yellow text-white border-white/40'
              : 'bg-white text-slate-700 border-gray-100 shadow-sm hover:text-oasis-orange'}`}
          >
            {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
          </button>
        </div>

      </div>

    </div>
  );
};

export default PressRemote;