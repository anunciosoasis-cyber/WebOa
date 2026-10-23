import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OasisLogoSVG from '../components/OasisLogoSVG';
import { BaseLayoutProps } from './types';

const YouTubeLayout: React.FC<BaseLayoutProps> = ({
  formData, scales, assets, gotaColor1, gotaColor2, layoutStyles, layoutMode, ts, handleElementDoubleClick, fadeInProps
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
      
      {/* Contenido */}
      <div style={{ flex: layoutMode === 'left' ? 1 : 'none', width: layoutMode === 'left' ? 'auto' : '100%', display: 'flex', flexDirection: 'column', justifyContent: layoutMode === 'bottom' ? 'flex-end' : 'center', alignItems: layoutStyles.alignItems, textAlign: layoutStyles.textAlign, padding: layoutMode === 'bottom' ? '4% 4% 12% 4%' : '4%', zIndex: 10 }}>
        
        {/* CENTER: TEXTS */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: layoutStyles.alignItems, textAlign: layoutStyles.textAlign, gap: `${scales.gap * 0.8}px`, width: '100%', margin: 'auto 0' }}>
          <AnimatePresence>
            {formData.tag && formData.tagVisible !== false && (
              <motion.div key="tag" {...fadeInProps} style={{ padding: '0.4em 1.2em', borderRadius: '4px', background: formData.gradientStart || '#ff007f', color: '#fff', pointerEvents: 'auto', alignSelf: layoutStyles.alignItems, ...ts('tag', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.tag, fontWeight: 700, letterSpacing: '0.1em' }), opacity: formData.tag.trim() ? undefined : 0 }} data-el="tag" onDoubleClick={() => handleElementDoubleClick('tag')}>
                {formData.tag}
              </motion.div>
            )}

            {formData.titleVisible !== false && (
              <motion.div key="title" {...fadeInProps} style={{ width: '100%', pointerEvents: 'auto', ...ts('title', { fontFamily: "'Orbitron', sans-serif", fontSize: scales.title * 1.2, color: '#fff', fontWeight: '900', lineHeight: 1.05, textShadow: '0 4px 15px rgba(0,0,0,0.6)', textAlign: layoutStyles.textAlign }) }} data-el="title" onDoubleClick={() => handleElementDoubleClick('title')}>
                {formData.title || 'TÍTULO'}
              </motion.div>
            )}

            {formData.title2 && formData.title2Visible !== false && (
              <motion.div key="subtitle" {...fadeInProps} style={{ width: '100%', pointerEvents: 'auto', ...ts('title2', { fontFamily: "'Advent Pro', sans-serif", fontSize: scales.sub, color: 'rgba(255,255,255,0.9)', fontWeight: '500', lineHeight: 1.2, textAlign: layoutStyles.textAlign }) }} data-el="title2" onDoubleClick={() => handleElementDoubleClick('title2')}>
                {formData.title2}
              </motion.div>
            )}

            {formData.speaker && formData.speakerVisible !== false && (
              <motion.div key="speaker" {...fadeInProps} style={{ width: '100%', pointerEvents: 'auto', marginTop: '10px' }} data-el="speaker" onDoubleClick={() => handleElementDoubleClick('speaker')}>
                <span style={{ display: 'block', ...ts('speaker', { fontFamily: "'Blacksword', 'Dancing Script', cursive", fontSize: scales.speaker * 1.5, color: '#fff', fontWeight: 700, textShadow: '0 4px 20px rgba(0,0,0,0.7)', textAlign: layoutStyles.textAlign }) }}>{formData.speaker}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER: METADATA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: layoutStyles.alignItems, width: '100%', paddingBottom: formData.showRrss !== false ? `${scales.rrssIcon * 1.5}px` : '0px' }}>
          <AnimatePresence>
            {(formData.date || formData.time || formData.location) && (
              <motion.div key="metadata" {...fadeInProps} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: layoutStyles.alignItems, pointerEvents: 'auto' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: layoutStyles.alignItems === 'flex-start' ? 'flex-start' : 'center' }}>
                  {formData.date && formData.dateVisible !== false && (
                    <span data-el="date" onDoubleClick={() => handleElementDoubleClick('date')} style={{ display: 'flex', alignItems: 'center', gap: '0.4em', ...ts('date', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.meta, color: '#fff', fontWeight: 600 }) }}>
                      <svg viewBox="0 0 16 16" width="1.1em" height="1.1em" style={{ minWidth: '1.1em' }} fill="currentColor"><path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/><path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg> <span style={{ marginLeft: '4px' }}>{formData.date}</span>
                    </span>
                  )}
                  {formData.time && (
                    <span data-el="time" onDoubleClick={() => handleElementDoubleClick('time')} style={{ display: 'flex', alignItems: 'center', gap: '0.4em', ...ts('time', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.meta, color: '#fff', fontWeight: 600 }) }}>
                      <svg viewBox="0 0 16 16" width="1.1em" height="1.1em" style={{ minWidth: '1.1em' }} fill="currentColor"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg> <span style={{ marginLeft: '4px' }}>{formData.time}</span>
                    </span>
                  )}
                </div>
                {formData.location && formData.locationVisible !== false && (
                  <span data-el="location" onDoubleClick={() => handleElementDoubleClick('location')} style={{ display: 'flex', alignItems: 'center', gap: '0.4em', ...ts('location', { fontFamily: "'Modern Age', 'Orbitron', sans-serif", fontSize: scales.meta, color: '#fff', fontWeight: 600 }) }}>
                    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg> <span style={{ marginLeft: '4px' }}>{formData.location}</span>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. RIGHT COLUMN: Espacio libre para imagen/sujeto */}
      {layoutMode === 'left' && <div style={{ flex: 1 }} />}
    </div>
  );
};

export default YouTubeLayout;
