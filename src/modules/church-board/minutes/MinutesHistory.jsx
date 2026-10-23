import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BoardTable from '../components/BoardTable';
import BoardButton from '../components/BoardButton';
import { useToast } from '../../../react-ui/components/Toast';
import { DispatchController } from '../notifications/DispatchController';
import apiClient from '../../../api/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PdfActaTemplate } from './PdfActaTemplate';
import { generatePdfActa, printActaNative } from './PdfExportService';

const MinutesHistory = ({ onNewJunta }) => {
  const { showToast } = useToast();
  const [globalSettings, setGlobalSettings] = useState({});
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('oasis_minutes_history');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('oasis_minutes_history', JSON.stringify(history));
  }, [history]);

  const [selectedJunta, setSelectedJunta] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirmJunta, setDeleteConfirmJunta] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('auth_user') || localStorage.getItem('user');
      if (storedUser) {
        const u = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;
        if (u && u.role) {
          setIsAdmin(u.role.toLowerCase() === 'admin');
        }
      }
    } catch (e) {
      console.warn("Error checking admin status", e);
    }
  }, []);
  
  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/settings');
        const map = Array.isArray(data)
          ? data.reduce((a, s) => ({ ...a, [s.key]: s.value }), {})
          : data;
        setGlobalSettings(map);
      } catch (e) { console.error("Error fetching global settings", e); }
    })();
  }, []);
  
  const columns = [
    { label: 'FECHA JUNTA', align: 'left' },
    { label: 'ID ACTA', align: 'center' },
    { label: 'ACCIONES', align: 'right' }
  ];

  const handleViewDetails = (junta) => {
    setSelectedJunta(junta);
    setPreviewOpen(true);
  };

  const handleDownloadPDF = async (junta) => {
    showToast(`Generando Acta Oficial para ${junta.id}...`, 'info');
    
    try {
      const signatures = JSON.parse(localStorage.getItem('oasis_board_members') || '[]');
      await generatePdfActa(junta, signatures, globalSettings);
      showToast('¡Acta generada y descargada con éxito!', 'success');
    } catch (e) {
      console.error("Error PDF:", e);
      showToast('Hubo un error generando el PDF', 'error');
    }
  };

  const handleSend = (junta) => {
    try {
      const mockSession = { title: `Revisión de ${junta.id}`, date: junta.date, modality: 'Acta Cerrada' };
      const link = DispatchController.generateWhatsAppLink(mockSession, []);
      window.open(link, '_blank');
      showToast(`Despachando acta ${junta.id} vía WhatsApp`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Error al intentar despachar', 'error');
    }
  };

  const handleDeleteJunta = (junta) => {
    setDeleteConfirmJunta(junta);
  };

  const confirmDelete = () => {
    if (!deleteConfirmJunta) return;
    setHistory(prev => prev.filter(item => item.id !== deleteConfirmJunta.id));
    showToast(`Acta ${deleteConfirmJunta.id} eliminada correctamente`, 'success');
    setDeleteConfirmJunta(null);
  };

  const handleCopyHtml = async () => {
    try {
      const element = document.getElementById('acta-preview-content');
      if (!element) throw new Error("Elemento no encontrado");
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html':  new Blob([element.outerHTML], { type: 'text/html' }),
          'text/plain': new Blob([element.innerText], { type: 'text/plain' }),
        }),
      ]);
      showToast('HTML de Acta copiado — listo para pegar en Gmail u Outlook', 'success');
    } catch (e) {
      console.error(e);
      showToast('No se pudo acceder al portapapeles.', 'error');
    }
  };

  const handleCopyWhatsApp = (junta) => {
    try {
      const signatures = JSON.parse(localStorage.getItem('oasis_board_members') || '[]');
      const asistentes = signatures.map(s => s.name).filter((v, i, a) => v && a.indexOf(v) === i).join(', ');
      
      let text = `📜 *ASOCIACIÓN CENTRO OCCIDENTAL*\n`;
      text += `🏛 *JUNTA DE IGLESIA OASIS*\n`;
      text += `📌 *${junta.id}* — FECHA: ${junta.date || 'No registrada'}\n\n`;
      
      text += `📋 *PRELIMINARES:*\n`;
      if (junta.preliminares && junta.preliminares.length > 0) {
        junta.preliminares.forEach(p => { text += `• ${p}\n`; });
      } else {
        text += `• Sin preliminares registrados.\n`;
      }
      text += `\n👥 *ASISTENTES:*\n${asistentes || 'Sin registrados.'}\n\n`;

      text += `📝 *PUNTOS Y RESOLUCIONES:*\n`;
      if (junta.puntos && junta.puntos.length > 0) {
        junta.puntos.forEach((p, i) => {
          text += `${i + 1}. *${p.titulo || p.descripcion}* [${(p.estado || 'Aprobado').toUpperCase()}]\n`;
        });
      } else {
        text += `• Sin puntos registrados.\n`;
      }
      text += `\n✍️ *FIRMAS Y VALIDACIÓN:*\n• Pastor/Presidente: Firma Registrada\n• Secretaría: Firma Registrada`;

      navigator.clipboard.writeText(text);
      showToast('Formato listo para WhatsApp copiado al portapapeles', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error al preparar texto WhatsApp', 'error');
    }
  };

  return (
    <div className="bg-slate-50/80 rounded-[2.2rem] p-6 border border-slate-200/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.03)] backdrop-blur-sm h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] px-2 font-['Moonrising'] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
          Histórico de Juntas
        </h3>
      </div>

      <BoardTable 
        columns={columns}
        data={history}
        renderRow={(junta) => (
          <>
            <div className="font-semibold text-slate-700">{junta.date}</div>
            <div className="text-center font-mono text-slate-500">{junta.id}</div>
            <div className="flex justify-end gap-3 text-slate-600">
              <button 
                onClick={() => handleViewDetails(junta)}
                className="hover:text-amber-600 transition-colors p-1" 
                title="Ver Detalles"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button 
                onClick={() => handleDownloadPDF(junta)}
                className="hover:text-amber-600 transition-colors p-1" 
                title="Descargar PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              </button>
              <button 
                onClick={() => handleSend(junta)}
                className="hover:text-amber-600 transition-colors p-1" 
                title="Enviar Acta (Mail/WA)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
              {isAdmin && (
                <button 
                  onClick={() => handleDeleteJunta(junta)}
                  className="hover:text-red-600 transition-colors p-1 text-slate-400" 
                  title="Eliminar Acta (Solo Administradores)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              )}
            </div>
          </>
        )}
      />

      {/* Modal de Previsualización Full Screen con Fondo Blur (Renderizado en document.body mediante React Portal) */}
      {previewOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-2 sm:p-4 md:p-6 w-screen h-screen">
          <div className="bg-[#f8f9fa] rounded-[2.2rem] shadow-2xl w-full max-w-7xl h-full max-h-[96vh] flex flex-col overflow-hidden relative border border-amber-500/20">
            
            {/* Header del modal con color oficial #2a144a */}
            <div className="px-6 py-4 bg-[#2a144a] flex justify-between items-center text-amber-400 border-b border-amber-500/20 shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <h3 className="font-black tracking-widest uppercase text-xs md:text-sm font-['Moonrising'] text-white">
                  Previsualización Oficial: <span className="text-amber-400">{selectedJunta.id}</span>
                </h3>
              </div>
              <button 
                onClick={() => setPreviewOpen(false)} 
                className="bg-[#1b0d36] hover:bg-rose-600 text-amber-400 hover:text-white transition-all p-2 rounded-full border border-amber-500/30" 
                title="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            {/* Contenedor escroleable centrado de la hoja Carta */}
            <div className="p-4 md:p-8 overflow-auto bg-slate-400/40 custom-scrollbar flex justify-center items-start flex-1">
              <div id="acta-preview-content" className="bg-white shadow-2xl text-left shrink-0 my-4 rounded-sm" style={{ width: '816px', minHeight: '1056px' }}>
                <PdfActaTemplate 
                  junta={selectedJunta} 
                  signatures={JSON.parse(localStorage.getItem('oasis_board_members') || '[]')} 
                  globalSettings={globalSettings}
                />
              </div>
            </div>

            {/* Footer de acciones */}
            <div className="p-4 bg-white border-t flex flex-wrap justify-between items-center gap-3">
              <div className="flex gap-2">
                <button 
                  onClick={handleCopyHtml} 
                  className="px-4 py-2 rounded-full text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors flex gap-1.5 items-center"
                  title="Copia el HTML completo para pegar en Gmail u Outlook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                  Copiar HTML (Gmail/Outlook)
                </button>
                <button 
                  onClick={() => handleCopyWhatsApp(selectedJunta)} 
                  className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors flex gap-1.5 items-center"
                  title="Copia el resumen formateado con negritas para WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Copiar para WhatsApp
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => setPreviewOpen(false)} 
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => printActaNative(document.getElementById('acta-preview-content'))} 
                  className="px-4 py-2 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors flex gap-1.5 items-center"
                  title="Abre el cuadro de impresión nativo del navegador para Guardar como PDF Vectorial sin errores"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Imprimir / PDF Vectorial
                </button>
                <button 
                  onClick={() => { setPreviewOpen(false); handleDownloadPDF(selectedJunta); }} 
                  className="px-4 py-2 rounded-full text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-md transition-colors flex gap-1.5 items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Descargar PDF (.pdf)
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmación de Eliminación (Solo Admins) */}
      {deleteConfirmJunta && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-red-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">¿Eliminar {deleteConfirmJunta.id}?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Esta acción es permanente y restringida a administradores. El acta con fecha <strong className="text-slate-700">{deleteConfirmJunta.date}</strong> será removida del sistema.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmJunta(null)}
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

export default MinutesHistory;
