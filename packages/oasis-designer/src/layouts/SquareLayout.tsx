import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OasisLogoSVG from '../components/OasisLogoSVG';
import { BaseLayoutProps } from './types';

const SquareLayout: React.FC<BaseLayoutProps> = ({
  formData, scales, assets, gotaColor1, gotaColor2, layoutStyles, layoutMode, ts, handleElementDoubleClick, fadeInProps
}) => {
  return (
    <>
      {/* CENTER: TEXTS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: layoutStyles.justifyContent, alignItems: layoutStyles.alignItems, textAlign: layoutStyles.textAlign, gap: formData.format === 'youtube' ? `${scales.gap * 0.8}px` : `${scales.gap}px`, width: '100%', padding: layoutMode === 'bottom' ? '10px 0 30px 0' : '10px 0' }}>
        <AnimatePresence>
          {/* Etiqueta */}
          {formData.tag && formData.tagVisible !== false && (
              <motion.div key="tag" {...fadeInProps} style={{ padding: '0.4em 1.2em', borderRadius: '50px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', pointerEvents: 'auto', ...ts('tag', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.tag, color: '#fff', fontWeight: 700, letterSpacing: '0.08em', textAlign: layoutStyles.textAlign }), opacity: formData.tag.trim() ? undefined : 0 }} data-el="tag" onDoubleClick={() => handleElementDoubleClick('tag')}>
              {formData.tag}
            </motion.div>
          )}

          {/* Título */}
          {formData.titleVisible !== false && (
            <motion.div key="title" {...fadeInProps} style={{ width: '100%', margin: 0, padding: 0, pointerEvents: 'auto', display: 'block', ...ts('title', { fontFamily: "'Orbitron', sans-serif", fontSize: scales.title, color: '#fff', fontWeight: '800', lineHeight: 1.1, textShadow: '0 4px 15px rgba(0,0,0,0.6)', textAlign: layoutStyles.textAlign }), textAlign: layoutStyles.textAlign }} data-el="title" onDoubleClick={() => handleElementDoubleClick('title')}>
              {formData.title || 'TÍTULO DEL EVENTO'}
            </motion.div>
          )}

          {/* Subtítulo */}
          {formData.title2 && formData.title2Visible !== false && (
            <motion.div key="subtitle" {...fadeInProps} style={{ width: '100%', margin: 0, padding: 0, pointerEvents: 'auto', display: 'block', ...ts('title2', { fontFamily: "'Advent Pro', sans-serif", fontSize: scales.sub, color: 'rgba(255,255,255,0.9)', fontWeight: '500', lineHeight: 1.3, textAlign: layoutStyles.textAlign }), textAlign: layoutStyles.textAlign }} data-el="title2" onDoubleClick={() => handleElementDoubleClick('title2')}>
              {formData.title2}
            </motion.div>
          )}

          {/* Orador */}
          {formData.speaker && formData.speakerVisible !== false && (
            <motion.div key="speaker" {...fadeInProps} style={{ width: '100%', margin: 0, padding: 0, pointerEvents: 'auto', display: 'block', textAlign: layoutStyles.textAlign }} data-el="speaker" onDoubleClick={() => handleElementDoubleClick('speaker')}>
              <span style={{ display: 'block', ...ts('speaker', { fontFamily: "'Blacksword', 'Dancing Script', cursive", fontSize: scales.speaker * 1.35, color: '#fff', fontWeight: 700, textShadow: '0 4px 20px rgba(0,0,0,0.7)', lineHeight: 1.1, textAlign: layoutStyles.textAlign }), textAlign: layoutStyles.textAlign }}>{formData.speaker}</span>
            </motion.div>
          )}

          {/* Contenido / Biblia */}
          {(formData.bibleText || formData.content) && formData.contentVisible !== false && (
            <motion.div key="content" {...fadeInProps} style={{ padding: '12px 18px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '100%', pointerEvents: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: layoutStyles.alignItems, gap: '6px', ...ts('content', { fontFamily: "'Advent Sans', 'Advent Pro', sans-serif", fontSize: scales.content, color: '#eee', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.4, textAlign: layoutStyles.textAlign }) }} data-el="content" onDoubleClick={() => handleElementDoubleClick('content')}>
              <span>"{formData.bibleText || formData.content}"</span>
              {formData.bibleRef && (
                <span style={{ fontSize: `calc(${scales.content} * 0.85)`, fontStyle: 'normal', fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em' }}>
                  — {formData.bibleRef}
                </span>
              )}
            </motion.div>
          )}

          {/* METADATA: FECHA, HORA, LUGAR */}
          {(formData.date || formData.time || formData.location) && (
            <motion.div key="metadata" {...fadeInProps} style={{ display: 'flex', flexDirection: 'column', alignItems: layoutStyles.alignItems, gap: `${scales.gap}px`, pointerEvents: 'auto' }}>
              
              {/* Fila superior: Fecha y Hora */}
              {(formData.date || formData.time) && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', justifyContent: layoutStyles.alignItems === 'flex-start' ? 'flex-start' : 'center', alignItems: 'center', width: '100%' }}>
                  {formData.date && formData.dateVisible !== false && (
                    <span data-el="date" onDoubleClick={() => handleElementDoubleClick('date')} style={{ display: 'flex', alignItems: 'center', gap: '0.4em', padding: '0.35em 0.8em', borderRadius: '50px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', ...ts('date', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.meta, color: '#fff', fontWeight: 600, letterSpacing: '0.05em' }), whiteSpace: 'nowrap' }}>
                      <svg viewBox="0 0 16 16" width="1.1em" height="1.1em" style={{ minWidth: '1.1em' }} fill="currentColor"><path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/><path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg> <span style={{ marginLeft: '4px' }}>{formData.date}</span>
                    </span>
                  )}
                  {formData.time && (
                    <span data-el="time" onDoubleClick={() => handleElementDoubleClick('time')} style={{ display: 'flex', alignItems: 'center', gap: '0.4em', padding: '0.35em 0.8em', borderRadius: '50px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', ...ts('time', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.meta, color: '#fff', fontWeight: 600, letterSpacing: '0.05em' }), whiteSpace: 'nowrap' }}>
                      <svg viewBox="0 0 16 16" width="1.1em" height="1.1em" style={{ minWidth: '1.1em' }} fill="currentColor"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg> <span style={{ marginLeft: '4px' }}>{formData.time}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Fila inferior: Ubicación */}
              {formData.location && formData.locationVisible !== false && (
                <span data-el="location" onDoubleClick={() => handleElementDoubleClick('location')} style={{ display: 'flex', alignItems: 'center', gap: '0.4em', padding: '0.35em 1.1em', borderRadius: '50px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', ...ts('location', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.meta, color: '#fff', fontWeight: 600, letterSpacing: '0.05em' }) }}>
                  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg> {formData.location}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SquareLayout;
