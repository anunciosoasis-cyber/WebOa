import React, { useState } from 'react';
import { useToast } from '../../../react-ui/components/Toast';

const MobileVotingSimulator = ({ point, onClose, onSubmitVote }) => {
  const { showToast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);

  const handleVote = (voteType) => {
    setSelectedVote(voteType);
    setHasVoted(true);
    
    // Simular latencia de red
    setTimeout(() => {
      onSubmitVote(voteType);
      showToast('Voto remoto enviado correctamente', 'success');
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      {/* Marco del celular simulado */}
      <div className="bg-slate-900 rounded-[3rem] p-2 shadow-2xl w-[375px] h-[700px] flex flex-col relative animate-in zoom-in-95 duration-300">
        
        {/* Pantalla del celular */}
        <div className="bg-white rounded-[2.5rem] w-full h-full overflow-hidden flex flex-col relative">
          
          {/* Notch simulado */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-3xl z-10"></div>

          {/* Header */}
          <div className="bg-slate-800 text-white pt-10 pb-6 px-6 rounded-b-[2rem] shadow-md z-0">
            <h3 className="font-['Moonrising'] text-amber-400 text-lg text-center tracking-widest mb-2">Votación Oasis</h3>
            <p className="text-center text-xs text-slate-300">Conexión Segura Encriptada</p>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            
            {!hasVoted ? (
              <>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center mb-8 shadow-inner">
                  <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Punto en Debate</h4>
                  <p className="text-lg font-black text-slate-800">{point?.title || 'Punto de votación'}</p>
                  {point?.majorityType && (
                    <span className="inline-block mt-4 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                      {String(point.majorityType).replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => handleVote('inFavor')}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">✅</span> A FAVOR
                  </button>
                  <button 
                    onClick={() => handleVote('against')}
                    className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">❌</span> EN CONTRA
                  </button>
                  <button 
                    onClick={() => handleVote('abstentions')}
                    className="w-full bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold text-xl py-4 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">⚪</span> ABSTENCIÓN
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center animate-in fade-in duration-500 flex flex-col items-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">¡Voto Registrado!</h2>
                <p className="text-slate-500 mb-8">Tu decisión ha sido enviada de forma anónima a la mesa principal.</p>
                
                <button 
                  onClick={onClose}
                  className="text-amber-600 font-bold hover:underline"
                >
                  Cerrar simulador
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Botón para cerrar el modal fuera del celular */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-amber-400 font-bold"
        >
          Cerrar Simulación ✕
        </button>
      </div>
    </div>
  );
};

export default MobileVotingSimulator;
