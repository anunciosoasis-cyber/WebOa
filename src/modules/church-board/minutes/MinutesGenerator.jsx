import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MinutesGenerator = ({ sessionData, agendaPoints }) => {
  const printRef = useRef();

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      // Configuraciones de html2canvas para máxima fidelidad
      const canvas = await html2canvas(element, {
        scale: 2, // Mejora la calidad de la imagen
        useCORS: true, // Permite cargar imágenes externas
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Formato A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Agrega la imagen al PDF usando toda la plantilla HTML
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Guarda el archivo
      const fileName = `Acta_Junta_Oasis_${sessionData?.date || 'Oficial'}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error("Error generando el PDF del acta:", error);
      alert("Hubo un error al generar el PDF. Revisa la consola para más detalles.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-end mb-4">
        <button 
          onClick={handleDownloadPdf}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Descargar Acta Oficial PDF
        </button>
      </div>

      {/* --- INICIO DE PLANTILLA PARA EL PDF --- */}
      {/* Todo lo que esté dentro de printRef se renderizará en el PDF */}
      <div 
        ref={printRef} 
        className="bg-white text-slate-800 p-12 w-[210mm] min-h-[297mm] shadow-xl border border-gray-200"
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        {/* Header (Membrete Oasis) */}
        <div className="border-b-4 border-amber-500 pb-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Iglesia Oasis</h1>
            <h2 className="text-xl font-medium text-slate-500 uppercase tracking-widest mt-1">Acta Oficial de Junta</h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">Fecha: <span className="font-normal">{sessionData?.date || 'No definida'}</span></p>
            <p className="text-sm font-bold">Modalidad: <span className="font-normal capitalize">{sessionData?.modality || 'Presencial'}</span></p>
            <p className="text-sm font-bold">Lugar: <span className="font-normal">{sessionData?.location || 'Sede Principal'}</span></p>
          </div>
        </div>

        {/* Datos de la Junta */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-4">{sessionData?.title || 'Reunión Ordinaria de Junta Directiva'}</h3>
          
          {/* Aquí se inyecta el contenido del Procesador de Texto Rico (ReactQuill) */}
          {sessionData?.description && (
            <div 
              className="prose prose-slate max-w-none text-sm text-slate-700 bg-slate-50 p-4 rounded border border-slate-100"
              dangerouslySetInnerHTML={{ __html: sessionData.description }}
            />
          )}
        </div>

        {/* Puntos Tratados y Votaciones */}
        <div className="mb-12">
          <h4 className="text-xl font-bold border-b border-slate-200 pb-2 mb-6 uppercase text-slate-400 text-sm tracking-widest">
            Orden del Día y Resoluciones
          </h4>
          
          <div className="space-y-8">
            {agendaPoints?.length > 0 ? (
              agendaPoints.map((point, idx) => (
                <div key={point.id || idx} className="bg-slate-50 border border-slate-200 rounded p-5 break-inside-avoid">
                  <h5 className="font-bold text-lg mb-2">{idx + 1}. {point.title}</h5>
                  <div 
                    className="text-sm text-slate-600 mb-4 prose"
                    dangerouslySetInnerHTML={{ __html: point.description }}
                  />
                  
                  {point.requiresVoting && point.votingResult ? (
                    <div className="bg-white p-4 border border-slate-100 rounded">
                      <p className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider">Resultado de Votación Híbrida</p>
                      <div className="flex gap-8 text-sm">
                        <div className="flex-1">
                          <p><span className="font-bold text-green-600">A Favor:</span> {point.votingResult.totalInFavor}</p>
                          <p><span className="font-bold text-red-600">En Contra:</span> {point.votingResult.totalAgainst}</p>
                          <p><span className="font-bold text-slate-500">Abstenciones:</span> {point.votingResult.totalAbstentions}</p>
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-end">
                          {point.votingResult.isPassed ? (
                            <span className="inline-block bg-green-100 text-green-800 font-bold px-4 py-2 rounded-full border border-green-200">
                              ACUERDO APROBADO
                            </span>
                          ) : (
                            <span className="inline-block bg-red-100 text-red-800 font-bold px-4 py-2 rounded-full border border-red-200">
                              MOCIÓN RECHAZADA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-3 border border-slate-100 rounded text-sm italic text-slate-500">
                      * Punto de carácter informativo. No requirió votación oficial.
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-sm">No se registraron puntos en la agenda.</p>
            )}
          </div>
        </div>

        {/* Firmas */}
        <div className="mt-20 pt-10 border-t-2 border-slate-200 flex justify-between px-12">
          <div className="text-center">
            <div className="w-48 h-px bg-slate-400 mb-2"></div>
            <p className="font-bold text-slate-800">Pastor / Presidente</p>
            <p className="text-xs text-slate-500">Iglesia Oasis</p>
          </div>
          <div className="text-center">
            <div className="w-48 h-px bg-slate-400 mb-2"></div>
            <p className="font-bold text-slate-800">Secretario(a)</p>
            <p className="text-xs text-slate-500">Iglesia Oasis</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-xs text-slate-400">
          Documento generado digitalmente por Oasis Ecosystem Board Module.
        </div>
      </div>
      {/* --- FIN DE PLANTILLA --- */}

    </div>
  );
};

export default MinutesGenerator;
