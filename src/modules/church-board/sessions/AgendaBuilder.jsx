import React, { useState } from 'react';
import BoardInput from '../components/BoardInput';
import BoardButton from '../components/BoardButton';
import BoardCard from '../components/BoardCard';
import ManualVoteRegistry from '../voting/ManualVoteRegistry';

const AgendaBuilder = ({ points, setPoints }) => {
  const [currentPoint, setCurrentPoint] = useState({
    title: '',
    description: '',
    requiresVoting: false,
    majorityType: 'simple'
  });

  const handleAddPoint = () => {
    if (!currentPoint.title) return;
    setPoints([...points, { 
      ...currentPoint, 
      id: Date.now().toString(),
      votes: { inFavor: 0, against: 0, abstentions: 0 } // Initialize votes for each point
    }]);
    setCurrentPoint({ title: '', description: '', requiresVoting: false, majorityType: 'simple' });
  };

  const handleUpdateVotes = (pointId, newVotes) => {
    setPoints(points.map(p => p.id === pointId ? { ...p, votes: newVotes } : p));
  };

  return (
    <BoardCard className="border border-slate-100 mb-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Orden del Día (Agenda)</h3>
      
      <div className="space-y-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Añadir Nuevo Punto</h4>
        <BoardInput 
          placeholder="Título del Punto a Tratar"
          value={currentPoint.title}
          onChange={(e) => setCurrentPoint({...currentPoint, title: e.target.value})}
        />
        <BoardInput 
          type="textarea"
          placeholder="Breve descripción o contexto..."
          value={currentPoint.description}
          onChange={(e) => setCurrentPoint({...currentPoint, description: e.target.value})}
        />
        
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
          <label className="flex items-center gap-3 font-semibold text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={currentPoint.requiresVoting}
              onChange={(e) => setCurrentPoint({...currentPoint, requiresVoting: e.target.checked})}
              className="w-5 h-5 accent-amber-500"
            />
            Este punto requiere votación oficial
          </label>
          
          {currentPoint.requiresVoting && (
            <select 
              value={currentPoint.majorityType}
              onChange={(e) => setCurrentPoint({...currentPoint, majorityType: e.target.value})}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-semibold text-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="simple">Mayoría Simple</option>
              <option value="dos_tercios">2/3 de los votos</option>
              <option value="absoluta">Mayoría Absoluta</option>
            </select>
          )}
        </div>
        
        <div className="flex justify-end pt-2">
          <BoardButton type="button" onClick={handleAddPoint}>
            Añadir a la Agenda
          </BoardButton>
        </div>
      </div>

      <div className="space-y-4">
        {points.length === 0 ? (
          <p className="text-slate-400 text-center italic mt-10">La agenda está vacía.</p>
        ) : points.map((p, i) => (
          <div key={p.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm transition-all hover:shadow-md relative overflow-hidden">
            {p.requiresVoting && (
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                VOTACIÓN: {p.majorityType.replace('_', ' ').toUpperCase()}
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-800 text-lg pr-32">{i + 1}. {p.title}</h4>
              <button 
                onClick={() => setPoints(points.filter(pt => pt.id !== p.id))}
                className="text-rose-500 hover:text-rose-700 font-semibold text-sm"
              >
                Eliminar
              </button>
            </div>
            {p.description && <p className="text-slate-600 mb-4">{p.description}</p>}
            
            {p.requiresVoting && (
              <ManualVoteRegistry 
                initialVotes={p.votes}
                onRegistrySubmit={(newVotes) => handleUpdateVotes(p.id, newVotes)} 
              />
            )}
          </div>
        ))}
      </div>
    </BoardCard>
  );
};

export default AgendaBuilder;
