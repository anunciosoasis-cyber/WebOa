import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OasisLogoSVG from '../components/OasisLogoSVG';
import { BaseLayoutProps } from './types';

const WhatsAppLayout: React.FC<BaseLayoutProps> = ({
  formData, scales, assets, gotaColor1, gotaColor2, layoutStyles, layoutMode, ts, handleElementDoubleClick, fadeInProps
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '10%', boxSizing: 'border-box' }}>
      
      {/* 1. TOP: Etiqueta y Títulos gigantes */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center', gap: `${scales.gap}px`, marginTop: '10%' }}>
        <AnimatePresence>
          {/* Etiqueta */}
          {formData.tag && formData.tagVisible !== false && (
            <motion.div key="tag" {...fadeInProps} style={{ padding: '0.6em 1.5em', borderRadius: '50px', background: formData.gradientEnd || 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', pointerEvents: 'auto', ...ts('tag', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.tag * 1.2, color: '#fff', fontWeight: 800, letterSpacing: '0.15em' }), opacity: formData.tag.trim() ? undefined : 0 }} data-el="tag" onDoubleClick={() => handleElementDoubleClick('tag')}>
              {formData.tag}
            </motion.div>
          )}

          {/* Título GIGANTE */}
          {formData.titleVisible !== false && (
            <motion.div key="title" {...fadeInProps} style={{ width: '100%', pointerEvents: 'auto', marginTop: '10px', ...ts('title', { fontFamily: "'Orbitron', sans-serif", fontSize: scales.title * 1.6, color: '#fff', fontWeight: '900', lineHeight: 1, textShadow: '0 8px 25px rgba(0,0,0,0.8)' }) }} data-el="title" onDoubleClick={() => handleElementDoubleClick('title')}>
              {formData.title || 'TÍTULO'}
            </motion.div>
          )}

          {/* Subtítulo */}
          {formData.title2 && formData.title2Visible !== false && (
            <motion.div key="subtitle" {...fadeInProps} style={{ width: '100%', pointerEvents: 'auto', marginTop: '5px', ...ts('title2', { fontFamily: "'Advent Pro', sans-serif", fontSize: scales.sub * 1.2, color: formData.gradientStart || '#ffeb3b', fontWeight: '600', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }) }} data-el="title2" onDoubleClick={() => handleElementDoubleClick('title2')}>
              {formData.title2}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. MIDDLE: Orador cruzando el diseño */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '20px 0' }}>
        <AnimatePresence>
          {formData.speaker && formData.speakerVisible !== false && (
            <motion.div key="speaker" {...fadeInProps} style={{ pointerEvents: 'auto', transform: 'rotate(-5deg)' }} data-el="speaker" onDoubleClick={() => handleElementDoubleClick('speaker')}>
              <span style={{ display: 'block', padding: '10px 30px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', backdropFilter: 'blur(5px)', ...ts('speaker', { fontFamily: "'Blacksword', 'Dancing Script', cursive", fontSize: scales.speaker * 2, color: '#fff', fontWeight: 700, textShadow: '0 4px 15px rgba(0,0,0,0.9)' }) }}>{formData.speaker}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. BOTTOM: Meta, Logos y RRSS aglomerados */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', width: '100%', marginBottom: '5%' }}>
        
        {/* Metadatos en formato píldora vertical */}
        <AnimatePresence>
          {(formData.date || formData.time || formData.location) && (
            <motion.div key="metadata" {...fadeInProps} style={{ display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'auto', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {formData.date && formData.dateVisible !== false && (
                  <span data-el="date" onDoubleClick={() => handleElementDoubleClick('date')} style={{ padding: '0.5em 1.2em', borderRadius: '8px', background: 'rgba(0,0,0,0.6)', border: `1px solid ${formData.gradientStart || 'rgba(255,255,255,0.3)'}`, ...ts('date', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.meta * 1.1, color: '#fff', fontWeight: 600 }) }}>
                    <svg viewBox="0 0 16 16" width="1.1em" height="1.1em" style={{ minWidth: '1.1em' }} fill="currentColor"><path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/><path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg> <span style={{ marginLeft: '4px' }}>{formData.date}</span>
                  </span>
                )}
                {formData.time && (
                  <span data-el="time" onDoubleClick={() => handleElementDoubleClick('time')} style={{ padding: '0.5em 1.2em', borderRadius: '8px', background: 'rgba(0,0,0,0.6)', border: `1px solid ${formData.gradientEnd || 'rgba(255,255,255,0.3)'}`, ...ts('time', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.meta * 1.1, color: '#fff', fontWeight: 600 }) }}>
                    <svg viewBox="0 0 16 16" width="1.1em" height="1.1em" style={{ minWidth: '1.1em' }} fill="currentColor"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg> <span style={{ marginLeft: '4px' }}>{formData.time}</span>
                  </span>
                )}
              </div>
              {formData.location && formData.locationVisible !== false && (
                <span data-el="location" onDoubleClick={() => handleElementDoubleClick('location')} style={{ padding: '0.5em 1.5em', borderRadius: '8px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)', ...ts('location', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.meta * 1.1, color: '#fff', fontWeight: 600 }) }}>
                  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg> <span style={{ marginLeft: '4px' }}>{formData.location}</span>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOGOS MOVED TO BOTTOM */}
      </div>
    </div>
  );
};

export default WhatsAppLayout;
