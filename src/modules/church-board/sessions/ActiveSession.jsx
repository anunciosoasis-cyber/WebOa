import React, { useState, useEffect } from 'react';
import BoardCard from '../components/BoardCard';
import BoardButton from '../components/BoardButton';
import { useToast } from '../../../react-ui/components/Toast';

const ActiveSession = ({ activeSession, onEndSession }) => {
  const { showToast } = useToast();
  
  const [session] = useState(() => ({
    title: activeSession?.title || 'Junta Directiva en Vivo',
    date: activeSession?.date || new Date().toISOString().split('T')[0],
  }));

  const [checkedInMembers, setCheckedInMembers] = useState([]);
  const [activeVotingPointId, setActiveVotingPointId] = useState(null);

  const [agenda, setAgenda] = useState(() => {
    if (activeSession && activeSession.agenda && activeSession.agenda.length > 0) {
      return activeSession.agenda.map((p, idx) => ({
        id: p.id || idx + 1,
        title: p.title,
        description: p.description || '',
        requiresVoting: Boolean(p.requiresVoting),
        majorityType: p.majorityType || 'simple',
        status: 'pending',
        remoteVotes: p.votes || { inFavor: 0, against: 0, abstentions: 0 }
      }));
    }
    return [];
  });

  const unifiedCheckinLink = `${window.location.origin}/vote`;

  // Sincronización en vivo vía localStorage para Asistencia con Cédula y Votación Remota
  useEffect(() => {
    const handleStorageChange = (e) => {
      // 1. Registro de Ingreso con Cédula / Documento de Identidad
      if (e.key === 'oasis_attendance_checkin' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.voterId) {
            setCheckedInMembers(prev => {
              if (prev.includes(data.voterId)) return prev;
              showToast(`Nuevo ingreso registrado: Cédula ${data.voterId}`, 'info');
              return [...prev, data.voterId];
            });
          }
        } catch (err) { console.error(err); }
      }

      // 2. Transmisión de Votos Remotos en Tiempo Real
      if (e.key === 'oasis_remote_vote' && e.newValue) {
        try {
          const voteData = JSON.parse(e.newValue);
          handleRemoteVote(voteData.pointId, voteData.voteType);
        } catch (err) { console.error(err); }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyInvitation = () => {
    const message = `📜 *ASOCIACIÓN CENTRO OCCIDENTAL*\n🏛 *JUNTA DE IGLESIA OASIS*\n\n✨ *INVITACIÓN A PARTICIPAR EN LA JUNTA EN VIVO*\n📌 *${session.title}* — FECHA: ${session.date}\n\nEstimado(a) miembro de junta, te invitamos a registrar tu asistencia y participar activamente en las votaciones oficiales en vivo desde tu dispositivo.\n\n📲 *Ingresa aquí con tu Documento de Identidad (ID):*\n👉 ${unifiedCheckinLink}\n\n¡Tu voz y participación son fundamentales para la iglesia! 🏛️✨`;
    
    navigator.clipboard.writeText(message);
    showToast('¡Invitación oficial para WhatsApp copiada con éxito!', 'success');
  };

  const handleStartVote = (pointId) => {
    setActiveVotingPointId(pointId);
    setAgenda(agenda.map(p => p.id === pointId ? { ...p, status: 'voting' } : p));
    
    // Transmitir evento de inicio de votación a dispositivos móviles
    try {
      const activePoint = agenda.find(p => p.id === pointId);
      localStorage.setItem('oasis_active_voting_point', JSON.stringify({
        pointId,
        title: activePoint?.title,
        majorityType: activePoint?.majorityType,
        timestamp: Date.now()
      }));
    } catch (e) { console.error(e); }
    
    showToast('Votación activada en vivo para dispositivos móviles', 'success');
  };

  const handleCloseVote = (pointId) => {
    if (activeVotingPointId === pointId) {
      setActiveVotingPointId(null);
      localStorage.removeItem('oasis_active_voting_point');
    }
    setAgenda(agenda.map(p => p.id === pointId ? { ...p, status: 'closed' } : p));
    showToast('Punto concluido y votación cerrada', 'info');
  };

  const finishSession = () => {
    localStorage.removeItem('oasis_active_voting_point');

    // 1. Compilar los datos oficiales del Acta de la Junta
    const newActa = {
      id: activeSession?.id || `ACTA-${Date.now()}`,
      code: `ACTA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: session.title || 'Junta Directiva Concluida',
      date: session.date || new Date().toISOString().split('T')[0],
      time: activeSession?.time || '18:00',
      modality: activeSession?.modality || 'Presencial',
      status: 'Aprobada',
      secretary: 'Javier Mercado',
      president: 'Felipe Miranda',
      quorum: `${checkedInMembers.length || (activeSession?.participants?.length || 5)} Miembros Registrados`,
      agenda: agenda.map(a => ({
        id: a.id,
        title: a.title,
        status: 'Concluido',
        description: a.description || ''
      })),
      participants: activeSession?.participants || [
        { name: 'Felipe Miranda', role: 'Anciano' },
        { name: 'Javier Mercado', role: 'Secretario' },
        { name: 'Adriana Lopera', role: 'Directora' },
        { name: 'Harold Useche', role: 'Director' },
        { name: 'Enoc Mercado', role: 'Tesorero' }
      ],
      agreements: agenda.map((a, idx) => ({
        id: `ac-${idx}`,
        code: `VOT-00${idx + 1}`,
        description: a.title,
        result: a.remoteVotes 
          ? `Aprobado (${a.remoteVotes.inFavor || 0} a favor, ${a.remoteVotes.against || 0} en contra, ${a.remoteVotes.abstentions || 0} abstenciones)`
          : 'Aprobado Por Unanimidad'
      }))
    };

    try {
      // 2. Guardar la nueva Acta en el Histórico de Juntas ('oasis_minutes_history')
      const existingHistory = JSON.parse(localStorage.getItem('oasis_minutes_history') || '[]');
      const updatedHistory = [newActa, ...existingHistory.filter(h => h.id !== newActa.id)];
      localStorage.setItem('oasis_minutes_history', JSON.stringify(updatedHistory));

      // 3. Eliminar la Junta de Juntas Pendientes ('oasis_pending_sessions')
      if (activeSession?.id) {
        const existingPending = JSON.parse(localStorage.getItem('oasis_pending_sessions') || '[]');
        const updatedPending = existingPending.filter(s => s.id !== activeSession.id);
        localStorage.setItem('oasis_pending_sessions', JSON.stringify(updatedPending));
      }

      showToast('¡Acta oficial generada e ingresada al Histórico de Juntas!', 'success');
    } catch (err) {
      console.error("Error al guardar acta oficial en histórico:", err);
    }

    setTimeout(() => {
      onEndSession();
    }, 800);
  };

  const handleRemoteVote = (pointId, voteType) => {
    setAgenda(prevAgenda => prevAgenda.map(p => {
      if (p.id === pointId && p.remoteVotes) {
        return {
          ...p,
          remoteVotes: {
            ...p.remoteVotes,
            [voteType]: (p.remoteVotes[voteType] || 0) + 1
          }
        };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* HEADER DE JUNTA EN VIVO (COLOR OFICIAL DE NAVBAR #2a144a) */}
      <div className="bg-[#2a144a] border border-amber-500/20 text-white p-6 md:p-8 rounded-[2.2rem] shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-black tracking-[0.2em] uppercase text-xs text-amber-500">
              SALA EN VIVO EN EJECUCIÓN
            </span>
          </div>
          <h2 className="text-3xl font-black text-white font-['Moonrising']">{session.title}</h2>
          <p className="font-bold text-slate-300 text-sm mt-1">
            FECHA: {session.date} • <span className="bg-[#1b0d36] text-amber-400 border border-amber-500/20 px-3 py-0.5 rounded-full text-xs font-mono">{checkedInMembers.length} Miembros con Cédula Registrada</span>
          </p>
        </div>
        <BoardButton 
          variant="secondary" 
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-full border-none shadow-lg shadow-amber-500/20" 
          onClick={finishSession}
        >
          CERRAR JUNTA Y GENERAR ACTA
        </BoardButton>
      </div>

      {/* SECCIÓN DE INVITACIÓN OFICIAL Y PARTICIPACIÓN EN LA JUNTA */}
      <div className="bg-[#2a144a] text-white rounded-[2.2rem] p-7 shadow-2xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 mt-1">
            📜
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-widest">
                Invitación Oficial a Miembros
              </span>
            </div>
            <h4 className="font-black text-white text-base font-['Moonrising'] tracking-wider">
              Invitación de Participación en la Junta
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Genera una invitación inspiradora y elegante lista para compartir por WhatsApp. Los miembros ingresan con su Cédula / ID para validar presencia y votar en vivo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <button 
            onClick={() => window.open(unifiedCheckinLink, '_blank')}
            className="bg-[#1b0d36] hover:bg-[#231244] text-slate-300 border border-amber-500/20 font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all"
            title="Probar vista de ingreso en vivo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Probar Vista
          </button>
          
          <button 
            onClick={handleCopyInvitation} 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Copiar Invitación WhatsApp
          </button>
        </div>
      </div>

      {/* DESARROLLO DE LA AGENDA */}
      <BoardCard className="border border-slate-200/80 shadow-md p-8 bg-white/90 rounded-[2.2rem]">
        <h3 className="text-xs font-black text-slate-800 mb-6 uppercase tracking-[0.2em] font-['Moonrising'] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Desarrollo de la Agenda de la Junta
        </h3>
        
        <div className="space-y-6">
          {agenda.map((point, index) => {
            const isVotingActive = activeVotingPointId === point.id;

            return (
              <div 
                key={point.id} 
                className={`p-6 rounded-2xl border-2 transition-all ${
                  point.status === 'closed' 
                    ? 'bg-slate-50 border-slate-200 opacity-60' 
                    : isVotingActive
                    ? 'bg-amber-50/50 border-amber-500 shadow-xl'
                    : 'bg-white border-slate-200/80 shadow-sm'
                }`}
              >
                
                {point.status === 'closed' ? (
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-extrabold px-3 py-1 rounded-full">
                      PUNTO CONCLUIDO
                    </span>
                  </div>
                ) : isVotingActive && (
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      VOTACIÓN EN VIVO ACTIVADA EN DISPOSITIVOS MÓVILES
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-slate-800">
                    {index + 1}. {point.title}
                  </h4>
                  {!point.requiresVoting && point.status !== 'closed' && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200">
                      Informativo (Sin Votación)
                    </span>
                  )}
                </div>

                {/* ZONA DE VOTACIÓN ÚNICA (SOLO SI EL PUNTO REQUIERE VOTACIÓN) */}
                {point.requiresVoting && point.status !== 'closed' && (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/80 border border-amber-200/60 px-3 py-1 rounded-lg">
                        Mayoría Requerida: {point.majorityType.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      {!isVotingActive ? (
                        <button 
                          onClick={() => handleLaunchVote(point)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-full shadow-md shadow-amber-500/20 transition-transform active:scale-95 flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Lanzar Votación en Vivo
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleCloseVote(point.id)}
                          className="bg-[#2a144a] hover:bg-[#1b0d36] text-amber-400 font-extrabold text-xs px-5 py-2.5 rounded-full shadow-md transition-transform active:scale-95 flex items-center gap-2 border border-amber-500/30"
                        >
                          Cerrar Votación del Punto
                        </button>
                      )}
                    </div>

                    {/* PANEL ÚNICO UNIFICADO DE RESULTADOS EN VIVO */}
                    <div className="bg-[#2a144a] p-5 rounded-2xl border border-amber-500/20 shadow-xl mt-4">
                      <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Resultados de Votación en Vivo</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Quórum Unificado</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-3.5 bg-[#1b0d36] rounded-xl border border-amber-500/20">
                          <label className="text-[11px] uppercase font-black text-emerald-400 mb-1">A Favor</label>
                          <span className="text-3xl font-black text-white">{point.remoteVotes.inFavor}</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-3.5 bg-[#1b0d36] rounded-xl border border-amber-500/20">
                          <label className="text-[11px] uppercase font-black text-rose-400 mb-1">En Contra</label>
                          <span className="text-3xl font-black text-white">{point.remoteVotes.against}</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-3.5 bg-[#1b0d36] rounded-xl border border-amber-500/20">
                          <label className="text-[11px] uppercase font-black text-slate-400 mb-1">Abstención</label>
                          <span className="text-3xl font-black text-white">{point.remoteVotes.abstentions}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {point.status !== 'closed' && (
                  <div className="mt-5 flex justify-end">
                    <BoardButton variant="outline" onClick={() => handleCloseVote(point.id)}>
                      Marcar Punto como Concluido
                    </BoardButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </BoardCard>
    </div>
  );
};

export default ActiveSession;
