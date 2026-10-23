import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseLayoutProps } from '../types';

const TemplateCultoAdoracion: React.FC<BaseLayoutProps> = ({
  formData, scales, ts, handleElementDoubleClick, fadeInProps
}) => {
  // Parse date roughly if possible. Fallback to just rendering it as is.
  // Assuming user might type "21 de Junio de 2025" or similar.
  const dateParts = formData.date ? formData.date.split(' ') : [];
  const year = dateParts.find(p => p.length === 4 && !isNaN(Number(p))) || '2025';
  const day = dateParts.find(p => p.length <= 2 && !isNaN(Number(p))) || '21';
  // Just find a word longer than 3 letters that is not 'de'
  const month = dateParts.find(p => p.length > 2 && isNaN(Number(p)) && p.toLowerCase() !== 'del') || 'JUNIO';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '10%', boxSizing: 'border-box' }}>
      
      {/* FECHA LATERAL (Estilo Especial Culto de Adoración) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '20%' }}>
        <AnimatePresence>
          {formData.dateVisible !== false && (
            <motion.div key="custom-date" {...fadeInProps} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pointerEvents: 'auto' }} data-el="date" onDoubleClick={() => handleElementDoubleClick('date')}>
              <span style={{ fontSize: `calc(${scales.meta} * 2.5)`, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.2em', lineHeight: 1 }}>{year}</span>
              <span style={{ fontSize: `calc(${scales.title} * 2.5)`, fontWeight: 900, color: '#fff', lineHeight: 0.9 }}>{day}</span>
              <span style={{ fontSize: `calc(${scales.meta} * 3)`, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.1 }}>{month}</span>
              {formData.time && (
                <span style={{ fontSize: `calc(${scales.meta} * 1.2)`, fontWeight: 600, color: '#fff', marginTop: '10px' }}>DESDE {formData.time}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BLOQUE CENTRAL DE TÍTULOS */}
      <div style={{ marginTop: 'auto', marginBottom: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <AnimatePresence>
          {/* Tag Arriba */}
          {formData.tag && formData.tagVisible !== false && (
            <motion.div key="tag" {...fadeInProps} style={{ textTransform: 'uppercase', letterSpacing: '0.15em', ...ts('tag', { fontSize: scales.meta, fontWeight: 700, color: '#fff' }) }} data-el="tag" onDoubleClick={() => handleElementDoubleClick('tag')}>
              {formData.tag}
            </motion.div>
          )}

          {/* Título en Caja Redondeada */}
          {formData.titleVisible !== false && (
            <motion.div key="title" {...fadeInProps} style={{ padding: '20px 40px', border: '2px solid #fff', borderRadius: '50px', width: '100%', textAlign: 'center', ...ts('title', { fontSize: scales.title, color: formData.titleColor || '#fcd34d' }) }} data-el="title" onDoubleClick={() => handleElementDoubleClick('title')}>
              {formData.title}
            </motion.div>
          )}

          {/* Orador */}
          {formData.speaker && formData.speakerVisible !== false && (
            <motion.div key="speaker" {...fadeInProps} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', pointerEvents: 'auto' }} data-el="speaker" onDoubleClick={() => handleElementDoubleClick('speaker')}>
              <span style={{ fontSize: scales.meta, fontWeight: 700, color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ORADOR</span>
              <span style={{ ...ts('speaker', { fontSize: scales.speaker, color: '#60a5fa' }) }}>{formData.speaker}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONTENIDO / BIBLIA */}
      <div style={{ textAlign: 'center', marginBottom: '25%' }}>
        <AnimatePresence>
          {(formData.bibleText || formData.content) && formData.contentVisible !== false && (
            <motion.div key="content" {...fadeInProps} style={{ pointerEvents: 'auto', padding: '0 10%', ...ts('content', { fontSize: scales.content, color: '#fff', fontWeight: 500, letterSpacing: '0.05em' }) }} data-el="content" onDoubleClick={() => handleElementDoubleClick('content')}>
              {formData.bibleText || formData.content}
              {formData.bibleRef && (
                <div style={{ marginTop: '10px', fontWeight: 700, fontSize: `calc(${scales.content} * 0.8)` }}>{formData.bibleRef}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default TemplateCultoAdoracion;
