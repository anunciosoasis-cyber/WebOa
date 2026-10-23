import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseLayoutProps } from '../types';

/**
 * Plantilla oficial OASIS Flyer para el editor libre.
 * Replica de forma exacta el diseño, proporciones y estilo visual del motor de flyers:
 * - Antetítulo con filetes dorados: —— CULTO DE ADORACIÓN ——
 * - Título principal en tipografía sólida y moderna
 * - Subtítulo / palabra de énfasis en letra de corrido
 * - Versículo y cita bíblica con comillas elegantes
 * - Columnas inferiores de datos: FECHA | HORA | PREDICA separadas por líneas finas
 * - Todas las capas son interactivas y editables con doble clic.
 */
const TemplateOasisFlyer: React.FC<BaseLayoutProps> = ({
  formData,
  scales,
  ts,
  handleElementDoubleClick,
  fadeInProps,
}) => {
  // Paletas oficiales de acento según la plantilla
  const accentColor = React.useMemo(() => {
    if (formData.tagColor && formData.tagColor !== '#ffffffff') return formData.tagColor;
    if (formData.templateId === 'matutino') return '#A8D08D';
    if (formData.templateId === 'oracion') return '#E67E22';
    return '#D4A373';
  }, [formData.templateId, formData.tagColor]);

  const isWide = formData.format === 'youtube';
  const isTall = formData.format === 'whatsapp';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        paddingTop: `${scales.iasd * 1.3}px`,
        paddingBottom: `${scales.rrssIcon * 1.5}px`,
        boxSizing: 'border-box',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* ── BLOQUE SUPERIOR / CENTRAL: Antetítulo, Título, Énfasis y Versículo ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          marginTop: isTall ? '8%' : isWide ? '2%' : '4%',
          gap: `${scales.gap * 0.8}px`,
        }}
      >
        <AnimatePresence>
          {/* Antetítulo: —— CULTO DE ADORACIÓN —— */}
          {formData.tag && formData.tagVisible !== false && (
            <motion.div
              key="flyer-tag"
              {...fadeInProps}
              data-el="tag"
              onDoubleClick={() => handleElementDoubleClick('tag')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                width: '100%',
                cursor: 'pointer',
                pointerEvents: 'auto',
                marginBottom: '4px',
              }}
            >
              <div style={{ width: 36, height: 2, backgroundColor: accentColor, opacity: 0.85 }} />
              <span
                style={{
                  ...ts('tag', {
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    fontSize: `${scales.tag * 0.95}px`,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: accentColor,
                    textTransform: 'uppercase',
                  }),
                }}
              >
                {formData.tag}
              </span>
              <div style={{ width: 36, height: 2, backgroundColor: accentColor, opacity: 0.85 }} />
            </motion.div>
          )}

          {/* Título Principal */}
          {formData.titleVisible !== false && (
            <motion.div
              key="flyer-title"
              {...fadeInProps}
              data-el="title"
              onDoubleClick={() => handleElementDoubleClick('title')}
              style={{
                width: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                pointerEvents: 'auto',
                ...ts('title', {
                  fontFamily: "'Montserrat', 'Inter', sans-serif",
                  fontSize: `${scales.title * 1.25}px`,
                  fontWeight: 800,
                  lineHeight: 1.08,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  textShadow: '0 4px 20px rgba(0,0,0,0.7)',
                }),
              }}
            >
              {formData.title || 'TÍTULO DEL ANUNCIO'}
            </motion.div>
          )}

          {/* Palabra Especial / Énfasis en letra de corrido */}
          {formData.title2Visible !== false && (
            <motion.div
              key="flyer-subtitle"
              {...fadeInProps}
              data-el="title2"
              onDoubleClick={() => handleElementDoubleClick('title2')}
              style={{
                width: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                pointerEvents: 'auto',
                marginTop: '4px',
                ...ts('title2', {
                  fontFamily: "'Above The Beyond', 'Dancing Script', cursive",
                  fontSize: `${scales.sub * 1.45}px`,
                  color: accentColor,
                  lineHeight: 1.2,
                  textShadow: '0 4px 18px rgba(0,0,0,0.8)',
                }),
              }}
            >
              {formData.title2 ? (
                formData.title2
              ) : (
                <span
                  className="oasis-placeholder"
                  style={{
                    display: 'inline-block',
                    fontSize: `${scales.meta * 0.72}px`,
                    opacity: 0.7,
                    color: accentColor,
                    border: `1px dashed ${accentColor}88`,
                    borderRadius: 20,
                    padding: '2px 14px',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.05em',
                    textShadow: 'none',
                  }}
                >
                  ✨ + Palabra Especial (Cursiva)
                </span>
              )}
            </motion.div>
          )}

          {/* Versículo / Cita Bíblica enmarcada */}
          {(formData.bibleText || formData.content || formData.bibleRef) && formData.contentVisible !== false && (
            <motion.div
              key="flyer-verse"
              {...fadeInProps}
              data-el="content"
              onDoubleClick={() => handleElementDoubleClick('content')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '12px',
                maxWidth: '90%',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              {(formData.bibleText || formData.content) && (
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: `${scales.content * 1.6}px`,
                    lineHeight: 0.8,
                    color: accentColor,
                    fontWeight: 700,
                    marginBottom: 2,
                  }}
                >
                  “
                </div>
              )}
              {(formData.bibleText || formData.content) && (
                <div
                  style={{
                    ...ts('content', {
                      fontFamily: "'Inter', sans-serif",
                      fontSize: `${scales.content * 0.95}px`,
                      color: 'rgba(255,255,255,0.95)',
                      textAlign: 'center',
                      lineHeight: 1.4,
                      textShadow: '0 2px 10px rgba(0,0,0,0.7)',
                      fontStyle: 'italic',
                    }),
                  }}
                >
                  {formData.bibleText || formData.content}
                </div>
              )}
              {formData.bibleRef && (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: `${scales.content * 0.8}px`,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: accentColor,
                    textTransform: 'uppercase',
                  }}
                >
                  — {formData.bibleRef}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BLOQUE INFERIOR: Columnas FECHA | HORA | PREDICA ── */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingTop: '16px',
          marginBottom: isTall ? '8%' : '4%',
          borderTop: '1px solid rgba(255, 255, 255, 0.22)',
          boxSizing: 'border-box',
        }}
      >
        <AnimatePresence>
          {/* Columna Fecha */}
          {formData.date && formData.dateVisible !== false && (
            <motion.div
              key="meta-date"
              {...fadeInProps}
              data-el="date"
              onDoubleClick={() => handleElementDoubleClick('date')}
              style={{ flex: 1, textAlign: 'center', cursor: 'pointer', pointerEvents: 'auto', padding: '0 4px' }}
            >
              <div
                style={{
                  fontSize: `${scales.meta * 0.72}px`,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: accentColor,
                  marginBottom: 3,
                }}
              >
                FECHA
              </div>
              <div
                style={{
                  ...ts('date', {
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    fontSize: `${scales.meta * 0.95}px`,
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }),
                }}
              >
                {formData.date}
              </div>
            </motion.div>
          )}

          {/* Divisor vertical */}
          {formData.date && formData.dateVisible !== false && (formData.time || formData.speaker) && (
            <div style={{ width: 1, height: '28px', backgroundColor: 'rgba(255,255,255,0.22)' }} />
          )}

          {/* Columna Hora */}
          {formData.time && (
            <motion.div
              key="meta-time"
              {...fadeInProps}
              data-el="time"
              onDoubleClick={() => handleElementDoubleClick('time')}
              style={{ flex: 1, textAlign: 'center', cursor: 'pointer', pointerEvents: 'auto', padding: '0 4px' }}
            >
              <div
                style={{
                  fontSize: `${scales.meta * 0.72}px`,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: accentColor,
                  marginBottom: 3,
                }}
              >
                HORA
              </div>
              <div
                style={{
                  ...ts('time', {
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    fontSize: `${scales.meta * 0.95}px`,
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }),
                }}
              >
                {formData.time}
              </div>
            </motion.div>
          )}

          {/* Divisor vertical */}
          {formData.speaker && formData.speakerVisible !== false && (formData.date || formData.time) && (
            <div style={{ width: 1, height: '28px', backgroundColor: 'rgba(255,255,255,0.22)' }} />
          )}

          {/* Columna Predicador */}
          {formData.speaker && formData.speakerVisible !== false && (
            <motion.div
              key="meta-speaker"
              {...fadeInProps}
              data-el="speaker"
              onDoubleClick={() => handleElementDoubleClick('speaker')}
              style={{ flex: 1, textAlign: 'center', cursor: 'pointer', pointerEvents: 'auto', padding: '0 4px' }}
            >
              <div
                style={{
                  fontSize: `${scales.meta * 0.72}px`,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: accentColor,
                  marginBottom: 3,
                }}
              >
                PREDICA
              </div>
              <div
                style={{
                  ...ts('speaker', {
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    fontSize: `${scales.meta * 0.95}px`,
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }),
                }}
              >
                {formData.speaker}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TemplateOasisFlyer;
