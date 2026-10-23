import React, { useState } from 'react';
import BoardInput from '../components/BoardInput';
import BoardButton from '../components/BoardButton';
import BoardCard from '../components/BoardCard';

const ParticipantRegistry = ({ participants, setParticipants, minQuorum }) => {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    setParticipants([...participants, { id: Date.now().toString(), name: newName.trim(), role: 'Miembro' }]);
    setNewName('');
  };

  const handleRemove = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const currentCount = participants.length;
  const hasQuorum = currentCount >= minQuorum;

  return (
    <BoardCard className="border border-slate-100 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Asistencia y Quórum</h3>
        <div className={`px-4 py-2 rounded-lg font-bold text-sm ${hasQuorum ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {currentCount} / {minQuorum} {hasQuorum ? '¡Quórum Alcanzado!' : 'Falta Quórum'}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <BoardInput 
            placeholder="Escribe el nombre del participante..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="pt-1">
          <BoardButton type="button" onClick={handleAdd}>Agregar</BoardButton>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[150px] max-h-[300px] overflow-y-auto">
        {participants.length === 0 ? (
          <p className="text-slate-400 text-center italic mt-10">Ningún participante registrado todavía.</p>
        ) : (
          <ul className="space-y-2">
            {participants.map((p, index) => (
              <li key={p.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-slate-700">{p.name}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{p.role}</span>
                </div>
                <button onClick={() => handleRemove(p.id)} className="text-rose-500 hover:text-rose-700 p-2 transition-colors" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BoardCard>
  );
};

export default ParticipantRegistry;
