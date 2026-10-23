import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const MobileVotingView = () => {
  const { pointId: urlPointId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Recuperar ID de Cédula previamente guardado si existe
  const [voterId, setVoterId] = useState(() => localStorage.getItem('oasis_member_id') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('oasis_member_id'));
  const [hasVoted, setHasVoted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [error, setError] = useState(null);

  // Estado del punto de votación activo (Sincronizado en tiempo real)
  const [activePoint, setActivePoint] = useState(() => {
    try {
      const stored = localStorage.getItem('oasis_active_voting_point');
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error(e); }
    return urlPointId ? { id: parseInt(urlPointId, 10), title: `Punto #${urlPointId}` } : null;
  });

  // Escuchar cambios de votación activa y votos en vivo
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'oasis_active_voting_point' && e.newValue) {
        try {
          const point = JSON.parse(e.newValue);
          setActivePoint(point);
          setHasVoted(false);
          setAlreadyVoted(false);
        } catch (err) { console.error(err); }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Verificar si ya votó para el punto activo actual
  useEffect(() => {
    if (isAuthenticated && voterId && activePoint) {
      const voteKey = `oasis_voted_point_${activePoint.id}_id_${voterId.trim()}`;
      if (localStorage.getItem(voteKey)) {
        setAlreadyVoted(true);
      } else {
        setAlreadyVoted(false);
      }
    }
  }, [isAuthenticated, voterId, activePoint]);

  const handleAuthenticate = (e) => {
    e.preventDefault();
    const id = voterId.trim();
    
    if (!id) {
      setError('Por favor, ingresa tu Documento de Identidad (Cédula / ID).');
      return;
    }

    localStorage.setItem('oasis_member_id', id);
    setError(null);
    setIsAuthenticated(true);

    // Emitir registro de ingreso para la mesa principal / quórum
    const checkinData = {
      voterId: id,
      timestamp: Date.now()
    };
    localStorage.setItem('oasis_attendance_checkin', JSON.stringify(checkinData));
  };

  const handleVote = (voteType) => {
    if (!activePoint) return;

    try {
      const id = voterId.trim();
      const voteKey = `oasis_voted_point_${activePoint.id}_id_${id}`;
      localStorage.setItem(voteKey, 'true');

      const voteData = {
        pointId: activePoint.id,
        voteType: voteType,
        voterId: id,
        token: token || 'live-token',
        timestamp: Date.now()
      };
      
      localStorage.setItem('oasis_remote_vote', JSON.stringify(voteData));
      setHasVoted(true);
    } catch (err) {
      console.error(err);
      setError('Hubo un error al transmitir tu voto. Por favor, avisa a la secretaría.');
    }
  };

  const handleLogoutID = () => {
    localStorage.removeItem('oasis_member_id');
    setIsAuthenticated(false);
    setVoterId('');
  };

  // Obtener información del Miembro o Subdirector registrado por Cédula / ID
  const memberInfo = React.useMemo(() => {
    if (!voterId) return null;
    try {
      const saved = localStorage.getItem('oasis_board_members');
      if (!saved) return null;
      const list = JSON.parse(saved);
      const cleanId = voterId.trim();

      for (const dept of list) {
        if (dept.director?.docId === cleanId || (dept.name && dept.id === cleanId)) {
          return {
            name: dept.director?.name || dept.name,
            role: `Director(a) — ${dept.department || dept.role || 'Departamento'}`,
            isSub: false
          };
        }
        if (dept.subDirector?.docId === cleanId) {
          return {
            name: dept.subDirector.name,
            role: `Subdirector(a) Suplente — ${dept.department || 'Departamento'}`,
            isSub: true
          };
        }
      }
    } catch (e) { console.error(e); }
    return null;
  }, [voterId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* Header Fijo con Marca Oficial */}
      <div className="bg-[#1b0d36] text-white pt-10 pb-5 px-6 rounded-b-[2.5rem] shadow-2xl border-b border-amber-500/20 sticky top-0 z-20">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h3 className="font-['Moonrising'] text-amber-500 text-lg tracking-widest leading-none">
              JUNTA <span className="text-white">OASIS</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">
              Plataforma Única de Ingreso y Votación
            </p>
          </div>

          {isAuthenticated && (
            <button 
              onClick={handleLogoutID}
              className="text-[10px] bg-[#120C1F] hover:bg-[#1A0F2E] text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/30 transition-colors"
              title="Cambiar Cédula / ID"
            >
              ID: {voterId} ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
        
        {/* PASO 1: REGISTRO DE INGRESO CON CÉDULA / ID */}
        {!isAuthenticated ? (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1A0F2E] border border-amber-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
              
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/30 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 4-4H8a4 4 0 0 4-4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>

              <h2 className="text-2xl font-black text-white text-center mb-2 font-['Moonrising'] tracking-wider">
                Ingreso a la Junta
              </h2>
              <p className="text-slate-400 text-xs text-center mb-8 leading-relaxed">
                Ingresa tu <strong className="text-amber-400">Documento de Identidad / Cédula</strong> para registrar tu asistencia y habilitar tu voto en vivo.
              </p>

              <form onSubmit={handleAuthenticate} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Documento de Identidad (ID)
                  </label>
                  <input 
                    type="text" 
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    placeholder="Ej. 10203040"
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-5 py-4 text-xl font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all text-center tracking-wider"
                    autoFocus
                  />
                </div>

                {error && <p className="text-rose-400 text-xs font-bold text-center animate-pulse">{error}</p>}

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-base py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-transform active:scale-95 uppercase tracking-wider"
                >
                  Registrar Ingreso y Votar
                </button>
              </form>
            </div>
          </div>

        ) : (
          <div className="space-y-6">

            {/* BARRA DE ASISTENCIA REGISTRADA */}
            <div className="bg-[#2a144a] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-xl text-white">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></span>
                <div>
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    {memberInfo ? memberInfo.role : 'Ingreso Verificado'}
                  </p>
                  <p className="text-base font-bold text-white">
                    {memberInfo ? memberInfo.name : `ID: ${voterId}`}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-500/40 uppercase tracking-wider">
                {memberInfo?.isSub ? 'Suplente en Quórum' : 'Presente en Quórum'}
              </span>
            </div>

            {/* CASO A: YA VOTÓ EN ESTE PUNTO */}
            {alreadyVoted ? (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/30 flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Voto Emitido para este Punto</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  El documento <strong className="text-white">{voterId}</strong> ya ha registrado su decisión para <span className="text-amber-400 font-semibold">{activePoint?.title || 'este punto'}</span>. No se permite votación doble.
                </p>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400 font-mono">
                  Esperando el siguiente punto de la agenda...
                </div>
              </div>

            /* CASO B: ACABA DE ENVIAR SU VOTO */
            ) : hasVoted ? (
              <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 font-['Moonrising'] tracking-wider">¡Voto Transmitido!</h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  Tu voto se ha registrado exitosamente en la mesa principal de la junta.
                </p>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400 font-mono">
                  Punto: {activePoint?.title}
                </div>
              </div>

            /* CASO C: PUNTO DE VOTACIÓN ACTIVO */
            ) : activePoint ? (
              <div className="bg-slate-950 border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl animate-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest inline-block mb-3">
                  Votación Activa en Vivo
                </span>
                
                <h3 className="text-xl font-black text-white mb-6 leading-snug">
                  {activePoint.title}
                </h3>

                <div className="space-y-3">
                  <button 
                    onClick={() => handleVote('inFavor')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-transform active:scale-95 flex items-center justify-center gap-3 border border-emerald-500/40 uppercase tracking-wider"
                  >
                    <span className="text-2xl">✅</span> A FAVOR
                  </button>
                  
                  <button 
                    onClick={() => handleVote('against')}
                    className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-rose-600/20 transition-transform active:scale-95 flex items-center justify-center gap-3 border border-rose-500/40 uppercase tracking-wider"
                  >
                    <span className="text-2xl">❌</span> EN CONTRA
                  </button>
                  
                  <button 
                    onClick={() => handleVote('abstentions')}
                    className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-extrabold text-base py-3.5 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-3 border border-slate-700 uppercase tracking-wider"
                  >
                    <span className="text-2xl">⚪</span> ABSTENCIÓN
                  </button>
                </div>
              </div>

            /* CASO D: EN ESPERA DE VOTACIÓN */
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
                <div className="w-16 h-16 bg-slate-900 text-amber-500 rounded-2xl border border-slate-800 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">En Espera de Votación</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Estás conectado correctamente a la Junta Oasis. Tan pronto como el Pastor o Moderador lance una votación, la tarjeta de voto aparecerá aquí en tu pantalla.
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default MobileVotingView;
