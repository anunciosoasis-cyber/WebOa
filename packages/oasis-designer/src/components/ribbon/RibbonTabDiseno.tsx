import React, { useState } from 'react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { TEMPLATES, BIBLIOTECA_FONDOS } from './constants';

type BibliotecaKey = keyof typeof BIBLIOTECA_FONDOS;
import { RibbonButton, RibbonGroup } from '../ui/RibbonUI';

export interface RibbonTabDisenoProps {
  formData: any;
  set: (key: string, value: any) => void;
}


const RibbonTabDiseno: React.FC<RibbonTabDisenoProps> = ({ formData, set }) => {
  const [catActiva, setCatActiva] = useState<BibliotecaKey>('naturaleza' as BibliotecaKey);

  const handleBgUpload = (imgData: string | null) => {
    set('bgImage', imgData);
    set('bgMode', imgData ? 'image' : 'gradient');
  };

    const handleSelectTemplate = (tpl: typeof TEMPLATES[number]) => {
    set('gradientStart', tpl.gradientStart);
    set('gradientEnd', tpl.gradientEnd);
    set('bgMode', 'gradient');
    // Mantenemos bgImage si el usuario quiere mezclar, o lo quitamos si es solo gradiente
    // Según tu petición de "mezcla sobre imagen", no lo ponemos a null automáticamente
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
      
      {/* 1. SECCIÓN DE GRADIENTES (REINTEGRADA Y MEJORADA) */}
      <RibbonGroup label="Gradientes" width="220px">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px',
            padding: '4px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' 
          }}>
            {TEMPLATES.slice(0, 4).map(tpl => (
              <RibbonButton 
                key={tpl.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleSelectTemplate(tpl)}
                style={{ 
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${tpl.gradientStart}, ${tpl.gradientEnd})`,
                  border: formData.gradientStart === tpl.gradientStart ? '2px solid #5b2ea6' : '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} 
              />
            ))}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type="color" value={formData.gradientStart} onChange={e => set('gradientStart', e.target.value)} 
                style={{ width: '28px', height: '24px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }} />
              <span style={{ fontSize: '10px', marginLeft: '5px', fontWeight: 700, color: '#64748b' }}>A</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type="color" value={formData.gradientEnd} onChange={e => set('gradientEnd', e.target.value)} 
                style={{ width: '28px', height: '24px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }} />
              <span style={{ fontSize: '10px', marginLeft: '5px', fontWeight: 700, color: '#64748b' }}>B</span>
            </div>
          </div>
        </div>
      </RibbonGroup>

      {/* 2. BIBLIOTECA BÍBLICA */}
      <RibbonGroup label="Biblioteca" width="520px">
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {(Object.keys(BIBLIOTECA_FONDOS) as BibliotecaKey[]).map(cat => (
              <button 
                key={cat} onClick={() => setCatActiva(cat)}
                style={{ 
                  fontSize: '0.6rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontWeight: catActiva === cat ? 900 : 500,
                  color: catActiva === cat ? '#5b2ea6' : '#94a3b8',
                  textTransform: 'uppercase',
                  borderBottom: catActiva === cat ? '2px solid #5b2ea6' : '2px solid transparent',
                  padding: '2px 0',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <i className={`bi ${BIBLIOTECA_FONDOS[cat].icon}`} style={{ fontSize: '0.8rem' }}></i>
                {BIBLIOTECA_FONDOS[cat].label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '2px 0', scrollbarWidth: 'none' }}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={catActiva} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', gap: '10px' }}
              >
                {BIBLIOTECA_FONDOS[catActiva].images.map((img, i) => (
                  <button
                    key={i} onClick={() => handleBgUpload(img.full)}
                    style={{ 
                      flexShrink: 0, width: 85, height: 55, borderRadius: '10px',
                      backgroundImage: `url(${img.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center',
                      border: formData.bgImage === img.full ? '3px solid #5b2ea6' : '1px solid #e2e8f0',
                      cursor: 'pointer', backgroundColor: '#f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                    title={BIBLIOTECA_FONDOS[catActiva].label}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </RibbonGroup>

      {/* 3. MEZCLA Y TRANSPARENCIAS (CONTROLES VERIFICADOS) */}
      <RibbonGroup label="Mezcla y Capas" width="180px">
        <div style={{ 
          display: 'flex', flexDirection: 'column', gap: '8px', 
          background: 'rgba(91, 46, 166, 0.04)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(91, 46, 166, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" id="blend-check" 
              checked={formData.blendGradient} 
              onChange={e => set('blendGradient', e.target.checked)} 
              style={{ accentColor: '#5b2ea6', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="blend-check" style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', cursor: 'pointer' }}>
              MODO MEZCLA
            </label>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontWeight: 900, color: '#5b2ea6' }}>
              <span>OPACIDAD CAPA</span>
              <span>{Math.round(formData.blendOpacity * 100)}%</span>
            </div>
            <input 
              type="range" min={0} max={1} step={0.01} 
              value={formData.blendOpacity}
              onWheel={e => e.stopPropagation()}
              onChange={e => set('blendOpacity', parseFloat(e.target.value))}
              disabled={!formData.blendGradient}
              style={{ width: '120px', accentColor: '#5b2ea6', cursor: 'pointer', opacity: formData.blendGradient ? 1 : 0.3 }} 
            />
          </div>
        </div>
      </RibbonGroup>

      {/* 4. CARGA LOCAL */}
      <RibbonGroup label="Carga">
        <label style={{ 
          width: 48, height: 48, border: '2px dashed #cbd5e1', borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fff'
        }}>
          <i className="bi bi-cloud-arrow-up-fill" style={{ fontSize: '1.4rem', color: '#5b2ea6' }}></i>
          <input type="file" hidden accept="image/*" onChange={e => {
            const f = e.target.files?.[0]; if (f) {
              const r = new FileReader(); r.onload = ev => handleBgUpload(ev.target?.result as string); r.readAsDataURL(f);
            }
          }} />
        </label>
      </RibbonGroup>
    </div>
  );
};

export default RibbonTabDiseno;