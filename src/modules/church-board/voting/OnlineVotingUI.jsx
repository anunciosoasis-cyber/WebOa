import React, { useState } from 'react';

const OnlineVotingUI = ({ pointTitle, onVoteSubmit }) => {
  const [selectedVote, setSelectedVote] = useState(null);

  const handleVote = (voteType) => {
    setSelectedVote(voteType);
    if (onVoteSubmit) {
      onVoteSubmit(voteType);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto border-t-4 border-amber-500">
      <div className="text-center mb-8">
        <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
          Votación en Vivo
        </span>
        <h3 className="text-xl font-bold mt-4 text-slate-800">{pointTitle}</h3>
        <p className="text-slate-500 text-sm mt-2">Emite tu voto de forma segura y secreta.</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => handleVote('inFavor')}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${selectedVote === 'inFavor' ? 'bg-green-500 text-white shadow-lg scale-105' : 'bg-slate-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
        >
          A FAVOR
        </button>
        <button 
          onClick={() => handleVote('against')}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${selectedVote === 'against' ? 'bg-red-500 text-white shadow-lg scale-105' : 'bg-slate-50 text-red-700 hover:bg-red-100 border border-red-200'}`}
        >
          EN CONTRA
        </button>
        <button 
          onClick={() => handleVote('abstention')}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${selectedVote === 'abstention' ? 'bg-slate-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
        >
          ME ABSTENGO
        </button>
      </div>

      {selectedVote && (
        <div className="mt-6 text-center text-sm font-semibold text-green-600 bg-green-50 py-2 rounded-lg">
          ✓ Tu voto ha sido registrado exitosamente.
        </div>
      )}
    </div>
  );
};

export default OnlineVotingUI;
