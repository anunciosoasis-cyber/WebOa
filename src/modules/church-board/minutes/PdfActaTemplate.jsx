import React, { forwardRef } from 'react';

export const PdfActaTemplate = forwardRef(({ junta, signatures = [], globalSettings = {} }, ref) => {
  const headerImage = globalSettings.email_header_image;
  const headerTitleText = globalSettings.email_header_title || 'ACTA DE REUNIÓN';
  const footerImage = globalSettings.email_footer_image;
  const footerText = globalSettings.email_footer_text;

  // Lista limpia de asistentes
  const asistentesList = signatures
    .map(s => s.name)
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(', ');

  // Búsqueda robusta de firmas por rol
  const getSignatureByRoleKey = (roleKey) => {
    return signatures.find(s => {
      if (!s.role) return false;
      const normalizedRole = s.role.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedRole.includes(roleKey);
    });
  };

  const pastorSignature = getSignatureByRoleKey('pastor') || getSignatureByRoleKey('presidente');
  const secretarySignature = getSignatureByRoleKey('secretari');

  // Limpieza del identificador
  const rawId = junta?.id || '';
  const cleanId = rawId.toUpperCase().startsWith('ACTA') ? rawId : `ACTA ${rawId}`;

  return (
    <div
      ref={ref}
      className="acta-pdf-root"
      style={{
        /* MEDIDAS EXACTAS HOJA CARTA (LETTER) EN PÍXELES DE IMPRESIÓN/DOM */
        width: '816px',             // 215.9mm a 96DPI (Ancho estándar Carta)
        minHeight: '1056px',        // 279.4mm a 96DPI (Alto estándar Carta)
        backgroundColor: '#ffffff',
        margin: '0',                // Eliminar cualquier margen heredado
        padding: '0',
        boxSizing: 'border-box',
        color: '#0f172a',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden'          // Evitar desbordamiento
      }}
    >
      {/* REGLAS CSS PARA SALIDA A PDF E IMPRESIÓN */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');

        .font-title {
          font-family: 'Moonrising', 'Montserrat', Arial, sans-serif !important;
        }

        .font-body {
          font-family: 'Adventist Sans Logo', 'Arial', sans-serif !important;
        }

        @page {
          size: letter portrait;
          margin: 0;
        }

        @media print {
          html, body {
            width: 816px !important;
            height: 1056px !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .acta-pdf-root {
            width: 816px !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ENCABEZADO */}
      <header style={{ width: '100%' }}>
        {headerImage && (
          <div
            style={{
              width: '100%',
              height: '180px',
              backgroundImage: `url("${headerImage}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#2a144a',
              display: 'block'
            }}
            role="img"
            aria-label="Encabezado Oficial"
          />
        )}

        {globalSettings.email_header_title ? (
          <div
            style={{
              backgroundColor: '#2a144a',
              padding: '18px 40px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <h2 className="font-title" style={{ color: '#F59E0B', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
              {globalSettings.email_header_title}
            </h2>
          </div>
        ) : (!headerImage && (
          <div
            style={{
              backgroundColor: '#2a144a',
              padding: '14px 40px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <p className="font-title" style={{ color: 'rgba(245,158,11,0.8)', fontSize: '12px', fontWeight: 'bold', letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>
              ACTA DE REUNIÓN
            </p>
          </div>
        ))}
      </header>

      {/* CUERPO DEL ACTA */}
      <main className="font-body" style={{ padding: '36px 48px', flexGrow: 1, boxSizing: 'border-box', width: '100%' }}>

        {/* TITULACIÓN */}
        <section style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '20px', marginBottom: '28px' }}>
          <h1 className="font-title" style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>
            ASOCIACIÓN CENTRO OCCIDENTAL
          </h1>
          <h2 className="font-title" style={{ fontSize: '15px', fontWeight: '700', color: '#475569', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
            JUNTA DE IGLESIA OASIS
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-title" style={{ fontSize: '18px', fontWeight: '800', color: '#D97706', margin: 0 }}>
              {cleanId}
            </h3>
            <span className="font-body" style={{ fontSize: '12px', fontWeight: '700', color: '#B45309', backgroundColor: '#FEF3C7', padding: '4px 12px', borderRadius: '4px' }}>
              FECHA: {junta?.date || 'No registrada'}
            </span>
          </div>
        </section>

        {/* PRELIMINARES */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ borderLeft: '4px solid #D97706', paddingLeft: '12px', marginBottom: '16px' }}>
            <h4 className="font-title" style={{ fontSize: '14px', fontWeight: '800', color: '#D97706', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
              PRELIMINARES
            </h4>
          </div>

          {junta?.preliminares && junta.preliminares.length > 0 ? (
            <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0', fontSize: '13px', color: '#334155', lineHeight: '1.7' }}>
              {junta.preliminares.map((prel, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{prel}</li>
              ))}
            </ul>
          ) : (
            <div style={{ border: '1px dashed #CBD5E1', backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '4px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                No hay datos preliminares registrados para esta reunión.
              </p>
            </div>
          )}

          {/* ASISTENTES E INVITADOS */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '16px 20px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#1E293B', lineHeight: '1.6' }}>
              <strong className="font-title" style={{ color: '#0F172A', fontSize: '12px' }}>ASISTENTES:</strong>{' '}
              {asistentesList || <span style={{ fontStyle: 'italic', color: '#64748B' }}>Sin participantes registrados.</span>}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#1E293B' }}>
              <strong className="font-title" style={{ color: '#0F172A', fontSize: '12px' }}>INVITADOS:</strong>{' '}
              {junta?.invitados || <span style={{ fontStyle: 'italic', color: '#64748B' }}>Ninguno</span>}
            </p>
          </div>
        </section>

        {/* PUNTOS Y RESOLUCIONES */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ borderLeft: '4px solid #D97706', paddingLeft: '12px', marginBottom: '16px' }}>
            <h4 className="font-title" style={{ fontSize: '14px', fontWeight: '800', color: '#D97706', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
              PUNTOS Y RESOLUCIONES
            </h4>
          </div>

          {junta?.puntos && junta.puntos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {junta.puntos.map((punto, idx) => (
                <div key={idx} className="page-break-avoid" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span className="font-title" style={{ fontWeight: '800', color: '#D97706', fontSize: '13px' }}>
                      {idx + 1}.
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '13px', color: '#0F172A', lineHeight: '1.5' }}>
                      {punto.titulo || punto.descripcion}
                    </span>
                  </div>
                  {punto.estado && (
                    <div style={{ marginTop: '6px', paddingLeft: '22px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.5px',
                        backgroundColor: punto.estado === 'Aprobado' ? '#D1FAE5' : '#FFE4E6',
                        color: punto.estado === 'Aprobado' ? '#065F46' : '#991B1B'
                      }}>
                        ESTADO: {punto.estado.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ border: '1px dashed #CBD5E1', backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                No hay puntos o resoluciones registradas en esta acta.
              </p>
            </div>
          )}
        </section>

        {/* FIRMAS */}
        <section className="page-break-avoid" style={{ marginTop: '60px', marginBottom: '20px' }}>
          <div style={{ borderLeft: '4px solid #0F172A', paddingLeft: '12px', marginBottom: '28px' }}>
            <h4 className="font-title" style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
              FIRMAS Y VALIDACIÓN
            </h4>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '60px' }}>

            {/* Firma Pastor*/}
            <div style={{ width: '220px', position: 'relative' }}>
              {pastorSignature?.signature && (
                <img
                  src={pastorSignature.signature}
                  alt="Firma Pastor"
                  style={{ position: 'absolute', bottom: '28px', left: '10px', height: '55px', objectFit: 'contain' }}
                />
              )}
              <div style={{ width: '100%', height: '1px', backgroundColor: '#475569', marginBottom: '8px' }} />
              <p className="font-title" style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#0F172A', margin: 0 }}>
                {pastorSignature?.name || 'PASTOR'}
              </p>
              <p style={{ fontSize: '10px', color: '#64748B', margin: '2px 0 0 0' }}>Pastor</p>
            </div>

            {/* Firma Secretario(a) */}
            <div style={{ width: '220px', position: 'relative' }}>
              {secretarySignature?.signature && (
                <img
                  src={secretarySignature.signature}
                  alt="Firma Secretaria"
                  style={{ position: 'absolute', bottom: '28px', left: '10px', height: '55px', objectFit: 'contain' }}
                />
              )}
              <div style={{ width: '100%', height: '1px', backgroundColor: '#475569', marginBottom: '8px' }} />
              <p className="font-title" style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#0F172A', margin: 0 }}>
                {secretarySignature?.name || 'SECRETARÍA'}
              </p>
              <p style={{ fontSize: '10px', color: '#64748B', margin: '2px 0 0 0' }}>Secretario(a)</p>
            </div>

          </div>
        </section>

      </main>

      {/* PIE DE PÁGINA */}
      <footer style={{ width: '100%' }}>
        {footerImage && (
          <div
            style={{
              width: '100%',
              height: '120px',
              backgroundImage: `url("${footerImage}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#1b0d36',
              display: 'block'
            }}
            role="img"
            aria-label="Pie de página"
          />
        )}

        {footerText ? (
          <div style={{ backgroundColor: '#1b0d36', padding: '18px 40px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <p className="font-body" style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: '1.6' }}>
              {footerText}
            </p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#1b0d36', height: '6px', width: '100%' }} />
        )}
      </footer>

    </div>
  );
});

PdfActaTemplate.displayName = 'PdfActaTemplate';