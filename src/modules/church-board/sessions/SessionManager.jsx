import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import BoardInput from '../components/BoardInput';
import BoardButton from '../components/BoardButton';
import AgendaBuilder from './AgendaBuilder';
import ParticipantRegistry from './ParticipantRegistry';
import { useToast } from '../../../react-ui/components/Toast';
import { DispatchController } from '../notifications/DispatchController';

const SessionManager = () => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [sessionData, setSessionData] = useState({
    title: '',
    date: '',
    time: '',
    modality: 'presencial',
    location: '',
    quorumMin: 1,
    description: ''
  });
  
  const [participants, setParticipants] = useState([]);
  const [agendaPoints, setAgendaPoints] = useState([]);

  // Auto-cargar miembros permanentes cuando el componente se monta
  useEffect(() => {
    // Esto luego se conectará a Supabase
    const defaultMembers = [
      { id: 'm1', name: 'Felipe Miranda', role: 'Anciano' },
      { id: 'm2', name: 'Javier Mercado', role: 'Secretario' },
      { id: 'm3', name: 'Adriana Lopera', role: 'Directora' },
      { id: 'm4', name: 'Harold Useche', role: 'Director' },
      { id: 'm5', name: 'Enoc Mercado', role: 'Tesorero' }
    ];
    setParticipants(defaultMembers);
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const handleEditorChange = (content) => {
    setSessionData(prev => ({ ...prev, description: content }));
  };

  const handleNextStep = () => {
    if (!sessionData.title || !sessionData.date || !sessionData.time) {
      showToast('Por favor completa los campos requeridos (Título, Fecha, Hora)', 'warning');
      return;
    }
    setStep(2);
  };

  const handleSaveSession = () => {
    const newSessionItem = {
      id: `JUNTA-${Date.now()}`,
      title: sessionData.title || 'Nueva Junta Directiva',
      date: sessionData.date || new Date().toISOString().split('T')[0],
      time: sessionData.time || '18:00',
      modality: sessionData.modality === 'hibrida' ? 'Híbrida' : sessionData.modality === 'virtual' ? 'Virtual' : 'Presencial',
      agenda: agendaPoints,
      participants: participants
    };
    
    try {
      const existing = JSON.parse(localStorage.getItem('oasis_pending_sessions') || '[]');
      const updated = [newSessionItem, ...existing];
      localStorage.setItem('oasis_pending_sessions', JSON.stringify(updated));

      const whatsappLink = DispatchController.generateWhatsAppLink(newSessionItem, agendaPoints);
      showToast('¡Junta configurada y guardada en Juntas Pendientes!', 'success');
      window.open(whatsappLink, '_blank');
    } catch (error) {
      console.error('Error al guardar junta:', error);
      showToast('Hubo un error al guardar la junta', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de Pasos */}
      <div className="flex gap-4 mb-6">
        <div className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm text-center transition-all ${step === 1 ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500 cursor-pointer'}`} onClick={() => setStep(1)}>
          1. Información General
        </div>
        <div className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm text-center transition-all ${step === 2 ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
          2. Agenda y Participantes
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-wider font-['Moonrising']">
            Nueva Convocatoria
          </h2>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BoardInput 
                label="Título de la Junta *" 
                value={sessionData.title} 
                onChange={(e) => setSessionData({...sessionData, title: e.target.value})}
                placeholder="Ej. Junta Directiva Q3 2026"
              />
              <BoardInput 
                label="Modalidad" 
                type="select" 
                value={sessionData.modality} 
                onChange={(e) => setSessionData({...sessionData, modality: e.target.value})} 
                options={[
                  { value: 'presencial', label: 'Presencial' },
                  { value: 'virtual', label: 'Virtual (Zoom/Meet)' },
                  { value: 'hibrida', label: 'Híbrida' }
                ]}
              />
              <BoardInput 
                label="Fecha *" 
                type="date" 
                value={sessionData.date} 
                onChange={(e) => setSessionData({...sessionData, date: e.target.value})} 
              />
              <BoardInput 
                label="Hora *" 
                type="time" 
                value={sessionData.time} 
                onChange={(e) => setSessionData({...sessionData, time: e.target.value})} 
              />
              <BoardInput 
                label="Quórum Mínimo Requerido" 
                type="number" 
                value={sessionData.quorumMin} 
                onChange={(e) => setSessionData({...sessionData, quorumMin: parseInt(e.target.value) || 1})} 
              />
              <BoardInput 
                label="Ubicación / Enlace Online" 
                value={sessionData.location} 
                onChange={(e) => setSessionData({...sessionData, location: e.target.value})}
                placeholder="Ej. Sala de Juntas Principal"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Descripción y Notas del Evento</label>
              <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
                <ReactQuill 
                  theme="snow" 
                  value={sessionData.description} 
                  onChange={handleEditorChange} 
                  modules={modules}
                  placeholder="Escribe los detalles, enlaces de Zoom o contexto de la junta..."
                  className="h-64 mb-12"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
              <BoardButton type="button" onClick={handleNextStep}>
                Continuar a la Agenda y Participantes
              </BoardButton>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in slide-in-from-right-8 duration-300">
          {/* Nuevo Layout: 2 Columnas (Ancho completo) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-6">
            <div className="lg:col-span-5">
              <ParticipantRegistry 
                participants={participants} 
                setParticipants={setParticipants} 
                minQuorum={sessionData.quorumMin} 
              />
            </div>
            
            <div className="lg:col-span-7">
              <AgendaBuilder 
                points={agendaPoints} 
                setPoints={setAgendaPoints} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <BoardButton variant="outline" type="button" onClick={() => setStep(1)}>
              Volver atrás
            </BoardButton>
            <BoardButton type="button" onClick={handleSaveSession}>
              Finalizar, Guardar y Notificar (WhatsApp)
            </BoardButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;
