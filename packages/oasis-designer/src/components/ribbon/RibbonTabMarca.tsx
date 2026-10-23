import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoOasis      from '../../assets/logos/LOGO1.svg';
import logoAdventista from '../../assets/logos/IASD1.png';
import rrssImage      from '../../assets/logos/RRSS1.png';
import logoLumina     from '../../assets/logos/logo2.svg';

import { RibbonButton, RibbonGroup } from '../ui/RibbonUI';
import { useTheme } from '../../context/ThemeContext';
import { TEMPLATES } from './constants';

// ── CONFIGURACIÓN DE POSICIONES COMPLETA ──
const LOGO_POSITIONS = [
  { value: 'top-left',      label: 'Superior Izq.',    icon: 'bi-arrow-up-left' },
  { value: 'top-center',    label: 'Superior Centro',  icon: 'bi-arrow-up' },
  { value: 'top-right',     label: 'Superior Der.',    icon: 'bi-arrow-up-right' },
  { value: 'center-left',   label: 'Centro Izq.',      icon: 'bi-arrow-left' },
  { value: 'center',        label: 'Centro Real',      icon: 'bi-plus-circle' },
  { value: 'center-right',  label: 'Centro Der.',      icon: 'bi-arrow-right' },
  { value: 'bottom-left',   label: 'Inferior Izq.',    icon: 'bi-arrow-down-left' },
  { value: 'bottom-center', label: 'Inferior Centro',  icon: 'bi-arrow-down' },
  { value: 'bottom-right',  label: 'Inferior Der.',    icon: 'bi-arrow-down-right' },
  { value: 'free',          label: 'Movimiento Libre', icon: 'bi-cursor-move' },
];

const LOGO_VARIANTS = [
  { value: 'auto',     label: 'Auto',     icon: 'bi-magic' },
  { value: 'original', label: 'Original', icon: 'bi-palette' },
  { value: 'white',    label: 'Blanco',   icon: 'bi-circle-fill', color: '#fff' },
  { value: 'black',    label: 'Negro',    icon: 'bi-circle-fill', color: '#000' },
  { value: 'mustard',  label: 'Mostaza',  icon: 'bi-circle-fill', color: '#fbbf24' },
  { value: 'custom',   label: 'Manual',   icon: 'bi-sliders', color: '#5b2ea6' },
];

export interface RibbonTabMarcaProps {
  formData: any;
  set: (key: string, value: any) => void;
  selectedLogo: string | null;
  setSelectedLogo: (logo: string | null) => void;
  logoSize: number;
  setLogoSize: (size: number) => void;
  logoPosition: string;
  setLogoPosition: (pos: string) => void;
  logoOpacity: number;
  setLogoOpacity: (opacity: number) => void;
}

const RibbonTabMarca: React.FC<RibbonTabMarcaProps> = ({
  formData, set, selectedLogo, setSelectedLogo,
  logoSize, setLogoSize, logoPosition, setLogoPosition,
  logoOpacity, setLogoOpacity,
}) => {
  const { theme, mode } = useTheme();

  // Estilo avanzado para la lista desplegable (Selector)
  const selectStyle = (isActive: boolean) => ({
    width: '150px',
    fontSize: '0.75rem',
    fontWeight: isActive ? 800 : 500,
    padding: '6px 10px 6px 32px',
    borderRadius: '10px',
    border: `1px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text.primary,
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23fbbf24' class='bi bi-chevron-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    transition: 'all 0.2s ease',
    outline: 'none',
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}
    >
      
      {/* SECCIÓN 1: ESTRUCTURA */}
      <RibbonGroup label="Estructura">
        {[
          { key: 'showLogoOasis', img: logoOasis, title: 'Oasis' },
          { key: 'showLogoIasd',  icon: 'bi-bank', title: 'Iglesia' },
          { key: 'showRrss',      icon: 'bi-share-fill', title: 'RRSS' }
        ].map(l => {
          const active = !!formData[l.key];
          return (
            <RibbonButton
              key={l.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => set(l.key, !formData[l.key])}
              style={{
                width: 42, height: 42, borderRadius: '12px', cursor: 'pointer',
                border: `1.5px solid ${active ? theme.colors.primary : theme.colors.border}`,
                background: active ? (mode === 'dark' ? 'rgba(251,191,36,0.1)' : '#f5f3ff') : theme.colors.surface, 
                color: active ? theme.colors.primary : theme.colors.text.secondary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px'
              }}
            >
              {'img' in l ? (
                <img src={l.img} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={l.title} />
              ) : (
                <i className={`bi ${l.icon}`} style={{ fontSize: '1.1rem' }}></i>
              )}
            </RibbonButton>
          );
        })}
      </RibbonGroup>

      <RibbonGroup label="Identidad y Efectos" width="550px">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', width: '100%' }}>
          
          {/* Subgrupo 1: Variantes Base */}
          <div style={{ 
            display: 'flex', gap: '4px', 
            background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
            padding: '4px', borderRadius: '10px' 
          }}>
            {LOGO_VARIANTS.map(v => {
              const isActive = formData.logoColor === v.value;
              return (
                <RibbonButton key={v.value} onClick={() => set('logoColor', v.value)}
                  style={{
                    width: 32, height: 32, borderRadius: '8px', cursor: 'pointer',
                    border: `1px solid ${isActive ? theme.colors.primary : 'transparent'}`,
                    background: isActive ? theme.colors.surface : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? `0 0 8px ${theme.colors.primary}33` : 'none'
                  }}
                  title={v.label}
                >
                  <i className={`bi ${v.icon}`} style={{ color: v.color || (mode === 'dark' ? '#fff' : '#333'), fontSize: '0.9rem' }}></i>
                </RibbonButton>
              );
            })}
          </div>

          <div style={{ width: '1px', height: '30px', background: theme.colors.border }} />

          {/* Subgrupo 2: Gradientes y Manual */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px',
              padding: '4px', background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
              borderRadius: '8px'
            }}>
              {TEMPLATES.slice(0, 8).map(tpl => (
                <div key={tpl.id} onClick={() => { set('logoGotaColor', tpl.gradientStart); set('logoGotaColor2', tpl.gradientEnd); set('logoColor', 'custom'); }}
                  style={{ 
                    width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', 
                    background: `linear-gradient(135deg, ${tpl.gradientStart}, ${tpl.gradientEnd})`, 
                    border: mode === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ position: 'relative', width: 20, height: 16 }}>
                <input type="color" value={formData.logoGotaColor} onChange={e => { set('logoGotaColor', e.target.value); set('logoColor', 'custom'); }} 
                  style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <div style={{ width: '100%', height: '100%', borderRadius: '4px', background: formData.logoGotaColor, border: `1px solid ${theme.colors.border}` }} />
              </div>
              <div style={{ position: 'relative', width: 20, height: 16 }}>
                <input type="color" value={formData.logoGotaColor2} onChange={e => { set('logoGotaColor2', e.target.value); set('logoColor', 'custom'); }} 
                  style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <div style={{ width: '100%', height: '100%', borderRadius: '4px', background: formData.logoGotaColor2, border: `1px solid ${theme.colors.border}` }} />
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '30px', background: theme.colors.border }} />

          {/* Subgrupo 3: Sliders de Efectos */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: theme.colors.text.secondary }}>SOMBRA</span>
              <input type="range" min={0} max={1} step={0.1} value={formData.logoShadow} onChange={e => set('logoShadow', parseFloat(e.target.value))} style={{ width: '60px', accentColor: theme.colors.primary }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: theme.colors.text.secondary }}>GLOW</span>
              <input type="range" min={0} max={1} step={0.1} value={formData.logoGlow} onChange={e => set('logoGlow', parseFloat(e.target.value))} style={{ width: '60px', accentColor: theme.colors.primary }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: theme.colors.text.secondary }}>BRILLO</span>
              <input type="range" min={0.5} max={2} step={0.1} value={formData.logoBrightness} onChange={e => set('logoBrightness', parseFloat(e.target.value))} style={{ width: '60px', accentColor: theme.colors.primary }} />
            </div>
          </div>

        </div>
      </RibbonGroup>

      {/* SECCIÓN 3: LOGO FLOTANTE */}
      <RibbonGroup label="Logo Flotante">
        <div style={{ display: 'flex', gap: '5px' }}>
          <RibbonButton 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedLogo(null)}
            style={{ width: 35, height: 35, borderRadius: '10px', border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, color: '#ef4444', cursor: 'pointer' }}>
            <i className="bi bi-eraser-fill"></i>
          </RibbonButton>
          
          {[logoOasis, logoAdventista, logoLumina].map((url, i) => (
            <RibbonButton key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedLogo(url)}
              style={{ 
                width: 42, height: 42, borderRadius: '12px', padding: '5px',
                border: `1.5px solid ${selectedLogo === url ? theme.colors.primary : theme.colors.border}`,
                background: theme.colors.surface, cursor: 'pointer'
              }}>
              <img src={url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="preset" />
            </RibbonButton>
          ))}

          <label style={{ 
            width: 35, height: 35, borderRadius: '10px', border: `2px dashed ${theme.colors.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: theme.colors.surface
          }}>
            <i className="bi bi-plus-lg" style={{ color: theme.colors.text.secondary }}></i>
            <input type="file" hidden accept="image/*,image/svg+xml" onChange={e => {
              const f = e.target.files?.[0]; if (f) {
                const r = new FileReader(); r.onload = ev => setSelectedLogo(ev.target?.result as string); r.readAsDataURL(f);
              }
            }} />
          </label>
        </div>
      </RibbonGroup>

      {/* SECCIÓN 4: PROPIEDADES */}
      <RibbonGroup label="Propiedades">
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 800 }}>
              <span style={{ color: theme.colors.text.secondary }}>ESCALA</span>
              <span style={{ color: theme.colors.primary }}>{logoSize}%</span>
            </div>
            <input type="range" min={30} max={250} value={logoSize}
              onWheel={e => e.stopPropagation()}
              onChange={e => setLogoSize(parseInt(e.target.value))}
              style={{ width: '90px', accentColor: theme.colors.primary, cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 800 }}>
              <span style={{ color: theme.colors.text.secondary }}>OPACIDAD</span>
              <span style={{ color: theme.colors.primary }}>{Math.round(logoOpacity * 100)}%</span>
            </div>
            <input type="range" min={0.1} max={1} step={0.1} value={logoOpacity}
              onWheel={e => e.stopPropagation()}
              onChange={e => setLogoOpacity(parseFloat(e.target.value))}
              style={{ width: '90px', accentColor: theme.colors.primary, cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: theme.colors.text.secondary, textAlign: 'center' }}>UBICACIÓN</span>
            <div style={{ position: 'relative' }}>
              <i className={`bi ${LOGO_POSITIONS.find(p => p.value === logoPosition)?.icon || 'bi-geo'}`} 
                 style={{ 
                   position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', 
                   color: theme.colors.primary, zIndex: 2, fontSize: '0.85rem', pointerEvents: 'none' 
                 }} 
              />
              <select 
                value={logoPosition} 
                onWheel={e => e.stopPropagation()}
                onChange={e => setLogoPosition(e.target.value)}
                style={selectStyle(logoPosition === 'free')}
              >
                {LOGO_POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

        </div>
      </RibbonGroup>
    </motion.div>
  );
};

export default RibbonTabMarca;