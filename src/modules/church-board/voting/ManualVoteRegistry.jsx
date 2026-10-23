import React, { useState, useEffect } from 'react';

const ManualVoteRegistry = ({ onRegistrySubmit, initialVotes = { inFavor: 0, against: 0, abstentions: 0 } }) => {
  const [votes, setVotes] = useState(initialVotes);

  useEffect(() => {
    // Notify parent whenever votes change
    onRegistrySubmit(votes);
  }, [votes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setVotes(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 flex items-center gap-6">
      <div className="text-sm font-bold text-slate-700 w-32">Votos Presenciales (Sala)</div>
      
      <div className="flex gap-4 flex-1">
        <div className="flex-1 flex items-center gap-2">
          <label className="text-xs font-semibold text-emerald-700">A Favor</label>
          <input 
            type="number" 
            name="inFavor" 
            min="0"
            value={votes.inFavor} 
            onChange={handleChange} 
            className="w-16 bg-white border border-emerald-200 text-emerald-800 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 font-bold text-center"
          />
        </div>
        
        <div className="flex-1 flex items-center gap-2">
          <label className="text-xs font-semibold text-rose-700">En Contra</label>
          <input 
            type="number" 
            name="against" 
            min="0"
            value={votes.against} 
            onChange={handleChange} 
            className="w-16 bg-white border border-rose-200 text-rose-800 rounded px-2 py-1 focus:ring-1 focus:ring-rose-500 font-bold text-center"
          />
        </div>
        
        <div className="flex-1 flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Abstenciones</label>
          <input 
            type="number" 
            name="abstentions" 
            min="0"
            value={votes.abstentions} 
            onChange={handleChange} 
            className="w-16 bg-white border border-slate-300 text-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-slate-500 font-bold text-center"
          />
        </div>
      </div>
    </div>
  );
};

export default ManualVoteRegistry;
