import React, { useState, useEffect } from 'react';
import BoardCard from './BoardCard';
import BoardButton from './BoardButton';
import BoardInput from './BoardInput';

const BoardMembers = () => {
  // Datos de miembros y departamentos de la junta de iglesia
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('oasis_board_members');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('oasis_board_members', JSON.stringify(members));
  }, [members]);

  const [newDepartment, setNewDepartment] = useState({
    department: '',
    role: 'Director(a)',
    directorName: '',
    directorDocId: '',
    subDirectorName: '',
    subDirectorDocId: ''
  });

  const handleAddDepartment = () => {
    if (!newDepartment.department || !newDepartment.directorName) return;

    const newEntry = {
      id: Date.now(),
      department: newDepartment.department.trim(),
      role: newDepartment.role.trim() || 'Director(a)',
      director: {
        name: newDepartment.directorName.trim(),
        docId: newDepartment.directorDocId.trim()
      },
      subDirector: {
        name: newDepartment.subDirectorName.trim(),
        docId: newDepartment.subDirectorDocId.trim()
      }
    };

    setMembers([...members, newEntry]);
    setNewDepartment({
      department: '',
      role: 'Director(a)',
      directorName: '',
      directorDocId: '',
      subDirectorName: '',
      subDirectorDocId: ''
    });
  };

  const handleRemoveDepartment = (id) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <BoardCard className="border border-slate-200/80 shadow-md p-6 md:p-8 bg-white/90 rounded-[2.2rem]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 font-['Moonrising']">
              Gestión de Miembros de Junta por Departamento
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Registra cada departamento con su Director Titular y Subdirector/Suplente para habilitar el quórum y la votación por Cédula.
            </p>
          </div>
          <span className="bg-amber-500/10 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/20 font-mono">
            {members.length} Departamentos Configurados
          </span>
        </div>

        {/* FORMULARIO DE REGISTRO DE DEPARTAMENTO (DIRECTOR Y SUBDIRECTOR) */}
        <div className="bg-slate-50 p-6 md:p-7 rounded-3xl border border-slate-200/80 mb-8 space-y-5">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Añadir Departamento con Director y Subdirector
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nombre del Departamento</label>
              <BoardInput 
                placeholder="Ej. Ministerio Personal / Tesorería" 
                value={newDepartment.department} 
                onChange={(e) => setNewDepartment({ ...newDepartment, department: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Cargo Principal</label>
              <BoardInput 
                placeholder="Ej. Director / Anciano / Tesorero" 
                value={newDepartment.role} 
                onChange={(e) => setNewDepartment({ ...newDepartment, role: e.target.value })} 
              />
            </div>
          </div>

          {/* SECCIÓN DIRECTOR TITULAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-black text-amber-600 uppercase tracking-wider block">
              👑 Director(a) Titular
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <BoardInput 
                placeholder="Nombre completo del Director(a)" 
                value={newDepartment.directorName} 
                onChange={(e) => setNewDepartment({ ...newDepartment, directorName: e.target.value })} 
              />
              <BoardInput 
                placeholder="Documento de Identidad / Cédula" 
                value={newDepartment.directorDocId} 
                onChange={(e) => setNewDepartment({ ...newDepartment, directorDocId: e.target.value })} 
              />
            </div>
          </div>

          {/* SECCIÓN SUBDIRECTOR / SUPLENTE */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
              👤 Subdirector(a) / Suplente
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <BoardInput 
                placeholder="Nombre completo del Subdirector(a)" 
                value={newDepartment.subDirectorName} 
                onChange={(e) => setNewDepartment({ ...newDepartment, subDirectorName: e.target.value })} 
              />
              <BoardInput 
                placeholder="Documento de Identidad / Cédula" 
                value={newDepartment.subDirectorDocId} 
                onChange={(e) => setNewDepartment({ ...newDepartment, subDirectorDocId: e.target.value })} 
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <BoardButton 
              onClick={handleAddDepartment}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-md uppercase text-xs"
            >
              Agregar Departamento y Miembros
            </BoardButton>
          </div>
        </div>

        {/* LISTA ACTUAL DE DEPARTAMENTOS */}
        <div>
          <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">
            Lista de Departamentos y Representantes Habilitados
          </h4>

          {members.length === 0 ? (
            <p className="text-slate-400 italic text-center py-8">No hay departamentos ni miembros configurados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
                >
                  <div>
                    {/* Encabezado de Departamento */}
                    <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="font-black text-slate-900 text-base flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          {item.department}
                        </h5>
                        <p className="text-xs font-bold text-amber-600 mt-0.5">{item.role || 'Departamento'}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveDepartment(item.id)} 
                        className="text-rose-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                        title="Eliminar Departamento"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>

                    {/* Fichas de Director y Subdirector */}
                    <div className="space-y-3">
                      
                      {/* Director Titular */}
                      <div className="bg-amber-50/60 border border-amber-200/70 p-3 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-amber-700 uppercase">Director(a) Titular</p>
                          <p className="text-sm font-bold text-slate-800">{item.director?.name || item.name || 'Sin asignar'}</p>
                        </div>
                        {item.director?.docId && (
                          <span className="text-[10px] bg-amber-200/80 text-amber-900 font-mono font-bold px-2 py-0.5 rounded-full">
                            ID: {item.director.docId}
                          </span>
                        )}
                      </div>

                      {/* Subdirector / Suplente */}
                      <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Subdirector(a) / Suplente</p>
                          <p className="text-sm font-bold text-slate-800">{item.subDirector?.name || 'No registrado'}</p>
                        </div>
                        {item.subDirector?.docId ? (
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-full">
                            ID: {item.subDirector.docId}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Opcional</span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Lógica de Firma Digital para Cargos Administrativos (Pastor / Secretario / Tesorero) */}
                  {((item.department && item.department.toLowerCase().includes('secretar')) || 
                    (item.role && item.role.toLowerCase().includes('pastor')) || 
                    (item.role && item.role.toLowerCase().includes('secretar'))) && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Firma Digital para Acta Oficial</p>
                      {item.signature ? (
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <img src={item.signature} alt="Firma" className="h-8 object-contain mix-blend-multiply" />
                          <button onClick={() => {
                            setMembers(members.map(m => m.id === item.id ? { ...m, signature: null } : m))
                          }} className="text-xs text-rose-500 hover:underline font-bold">Quitar</button>
                        </div>
                      ) : (
                        <div>
                          <input 
                            type="file" 
                            accept="image/*"
                            id={`signature-${item.id}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setMembers(members.map(m => m.id === item.id ? { ...m, signature: reader.result } : m));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label 
                            htmlFor={`signature-${item.id}`}
                            className="cursor-pointer inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                            Subir Firma (PNG)
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </BoardCard>
    </div>
  );
};

export default BoardMembers;
