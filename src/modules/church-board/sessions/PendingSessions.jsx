import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import BoardButton from '../components/BoardButton';
import { useToast } from '../../../react-ui/components/Toast';

const PendingSessions = ({ onStartSession }) => {
  const { showToast } = useToast();
  
  const [pending, setPending] = useState(() => {
    const saved = localStorage.getItem('oasis_pending_sessions');
    if (saved) return JSON.parse(saved);
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem('oasis_pending_sessions', JSON.stringify(pending));
  }, [pending]);

  const [editingSession, setEditingSession] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);

  const handleStart = (session) => {
    showToast(`Iniciando panel de control para: ${session.title}`, 'info');
    onStartSession(session);
  };

  const handleEditClick = (session) => {
    setEditingSession({ ...session });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSession.title || !editingSession.date || !editingSession.time) {
      showToast('Por favor completa los campos requeridos', 'error');
      return;
    }
    
    setPending(prev => prev.map(s => s.id === editingSession.id ? editingSession : s));
    showToast(`Junta "${editingSession.title}" actualizada con éxito`, 'success');
    setEditingSession(null);
  };

  const handleDeleteClick = (session) => {
    setDeletingSession(session);
  };

  const confirmDelete = () => {
    if (!deletingSession) return;
    setPending(prev => prev.filter(s => s.id !== deletingSession.id));
    showToast(`Junta "${deletingSession.title}" eliminada`, 'success');
    setDeletingSession(null);
  };

  return (
    <div className="bg-slate-50/80 rounded-[2.2rem] p-6 border border-slate-200/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.03)] backdrop-blur-sm h-full flex flex-col justify-between relative">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] px-2 font-['Moonrising'] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
          Juntas Pendientes
        </h3>
        <span className="bg-amber-100/80 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-200/60 shadow-sm">
          {pending.length} Programadas
        </span>
      </div>

      <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
        {pending.length === 0 ? (
          <p className="text-slate-400 italic text-center py-10">No hay juntas pendientes en agenda.</p>
        ) : (
          pending.map(session => (
            <div 
              key={session.id} 
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.12)] hover:border-amber-400/60 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 text-sm">{session.title}</h4>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button 
                    onClick={() => handleEditClick(session)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Editar Junta"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(session)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar Junta"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 text-xs font-semibold text-slate-500 mb-3 flex-wrap items-center">
                <span className="flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2.5 py-1 rounded-md text-[11px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {session.date}
                </span>
                <span className="flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2.5 py-1 rounded-md text-[11px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {session.time}
                </span>
                <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md text-[11px] font-extrabold ml-auto">
                  {session.modality}
                </span>
              </div>
              
              <BoardButton 
                variant="primary" 
                className="w-full justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs py-2.5 shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.35)] border-none"
                onClick={() => handleStart(session)}
              >
                INICIAR JUNTA AHORA
              </BoardButton>
            </div>
          ))
        )}
      </div>

      {/* Modal de Edición de Junta */}
      {editingSession && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">Editar Junta Programada</h3>
              <button onClick={() => setEditingSession(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Junta</label>
                <input 
                  type="text" 
                  value={editingSession.title}
                  onChange={(e) => setEditingSession({ ...editingSession, title: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha</label>
                  <input 
                    type="date" 
                    value={editingSession.date}
                    onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora</label>
                  <input 
                    type="time" 
                    value={editingSession.time}
                    onChange={(e) => setEditingSession({ ...editingSession, time: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modalidad</label>
                <select 
                  value={editingSession.modality}
                  onChange={(e) => setEditingSession({ ...editingSession, modality: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white"
                >
                  <option value="Híbrida">Híbrida</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deletingSession && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-red-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">¿Eliminar "{deletingSession.title}"?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Esta junta pendiente programada para el <strong className="text-slate-700">{deletingSession.date}</strong> a las <strong className="text-slate-700">{deletingSession.time}</strong> será removida de la agenda.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingSession(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 rounded-full text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PendingSessions;
