/**
 * Controlador de Despacho y Notificaciones para Junta Oasis
 * Maneja la lógica de envío de resúmenes por WhatsApp y correos con actas adjuntas.
 */

export class DispatchController {
  /**
   * Genera el enlace de WhatsApp oficial para despachar el resumen de la junta
   * @param {Object} sessionData - Datos generales de la junta
   * @param {Array} agendaPoints - Lista de puntos y resultados
   */
  static generateWhatsAppLink(sessionData, agendaPoints) {
    const phone = ''; // Dejar vacío para que el usuario elija el contacto/grupo en su App
    
    let message = `*🏛️ RESUMEN OFICIAL: ${sessionData?.title?.toUpperCase() || 'JUNTA DE IGLESIA'}*\n`;
    message += `📅 Fecha: ${sessionData?.date || new Date().toLocaleDateString()}\n`;
    message += `📍 Modalidad: ${sessionData?.modality || 'Presencial'}\n\n`;
    
    message += `*📝 ACUERDOS PRINCIPALES:*\n`;
    
    if (agendaPoints && agendaPoints.length > 0) {
      agendaPoints.forEach((p, idx) => {
        message += `\n${idx + 1}. ${p.title}\n`;
        if (p.requiresVoting && p.votingResult) {
          const resultText = p.votingResult.isPassed ? '✅ APROBADO' : '❌ RECHAZADO';
          message += `   _Voto: ${resultText}_ (Favor: ${p.votingResult.totalInFavor}, Contra: ${p.votingResult.totalAgainst})\n`;
        } else {
          message += `   _Punto Informativo_\n`;
        }
      });
    } else {
      message += `No se registraron acuerdos.\n`;
    }

    message += `\n📄 *Nota:* El Acta PDF oficial con el registro detallado y firmas será enviada a su correo electrónico.\n`;
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }

  /**
   * Simula el despacho de correos (A conectar con Backend/SendGrid/Postmark)
   */
  static async sendMinutesEmail(pdfBlob, recipientList) {
    console.log('Preparando despacho de correos...');
    console.log('Adjunto:', pdfBlob);
    console.log('Destinatarios:', recipientList);
    
    // Aquí iría la llamada a la API (Ej. Supabase Edge Function o NestJS endpoint)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Correos despachados exitosamente' });
      }, 1500);
    });
  }
}
