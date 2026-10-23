/**
 * RibbonTabInicio
 *
 * UI for the "Inicio" tab in the Ribbon menu. Handles typography controls, alignment, spacing, shadows and other
 * text‑related properties for the selected element. Props are passed down from the parent RibbonMenu and are typed via
 * `RibbonTabInicioProps`.
 */
import React from 'react';
import { motion, MotionProps, AnimatePresence } from 'framer-motion';
import { SHADOW_OPTIONS } from './constants';
import { useTheme } from '../../context/ThemeContext';

// --- BIBLIOTECA DE FUENTES AMPLIADA ---
const EXTENDED_FONTS = [
  // ── Fuentes locales ──
  { label: 'Blacksword ★ (Orador)', value: "'Blacksword', 'Dancing Script', cursive" },
  { label: 'Modern Age ★', value: "'Modern Age', 'Orbitron', sans-serif" },
  { label: 'Moonrising ★', value: "'Moonrising', 'Cinzel Decorative', cursive" },
  { label: 'Advent Sans ★', value: "'Advent Sans', 'Advent Pro', sans-serif" },
  { label: 'Above The Beyond ★', value: "'Above The Beyond', 'Dancing Script', cursive" },
  // ── Google Fonts (siempre disponibles) ──
  { label: 'Orbitron (Modern Age)', value: "'Orbitron', sans-serif" },
  { label: 'Cinzel Decorative', value: "'Cinzel Decorative', cursive" },
  { label: 'Bebas Neue (Display)', value: "'Bebas Neue', sans-serif" },
  { label: 'Advent Pro (Subtítulos)', value: "'Advent Pro', sans-serif" },
  { label: 'Dancing Script (Firma)', value: "'Dancing Script', cursive" },
  { label: 'Inter (Sutil)', value: "'Inter', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Oswald (Condensado)', value: "'Oswald', sans-serif" },
  { label: 'Lora (Clásico)', value: "'Lora', serif" },
];

import { RibbonButton, RibbonGroup } from '../ui/RibbonUI';

interface RibbonTabInicioProps {
  formData: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  textAlign: string;
  setTextAlign: (align: string) => void;
  isBold: boolean;
  setIsBold: React.Dispatch<React.SetStateAction<boolean>>;
  isItalic: boolean;
  setIsItalic: React.Dispatch<React.SetStateAction<boolean>>;
  isUnderline: boolean;
  setIsUnderline: React.Dispatch<React.SetStateAction<boolean>>;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  textOpacity: number;
  setTextOpacity: (opacity: number) => void;
  textShadow: string;
  setTextShadow: (shadow: string) => void;
  letterSpacing: number;
  setLetterSpacing: (spacing: number) => void;
  lineHeight: number;
  setLineHeight: (lineHeight: number) => void;
}

const ELEMENTS = [
  { value: 'title', label: 'H1: Título Principal' },
  { value: 'title2', label: 'H2: Subtítulo' },
  { value: 'speaker', label: 'Orador' },
  { value: 'tag', label: 'Etiqueta/Tag' },
  { value: 'date', label: 'Fecha' },
  { value: 'time', label: 'Hora' },
  { value: 'location', label: 'Ubicación' },
];

const ALIGN_OPTIONS = [
  { val: 'left', icon: 'bi-text-left' },
  { val: 'center', icon: 'bi-text-center' },
  { val: 'right', icon: 'bi-text-right' },
  { val: 'justify', icon: 'bi-justify' },
];

const RibbonTabInicio: React.FC<RibbonTabInicioProps> = ({
  formData, set, selectedElementId, setSelectedElementId,
  setFontSize, selectedColor, setSelectedColor,
  textAlign, setTextAlign, isBold, setIsBold,
  isItalic, setIsItalic, isUnderline, setIsUnderline,
  fontFamily, setFontFamily, textOpacity, setTextOpacity,
  textShadow, setTextShadow, letterSpacing, setLetterSpacing,
  lineHeight, setLineHeight,
}) => {
  const { theme, mode } = useTheme();
  const elId = selectedElementId || 'title';
  const fv = (key: string, fallback: any) => (formData as any)[`${elId}${key}`] ?? fallback;
  const sv = (key: string, value: any) => { set(`${elId}${key}`, value); };

  const customListStyle = {
    padding: '4px 8px',
    fontSize: '0.72rem',
    borderRadius: '8px',
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    cursor: 'pointer',
    outline: 'none',
    color: theme.colors.text.primary,
    fontWeight: 600,
    transition: 'all 0.2s ease',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      style={{ display: 'flex', alignItems: 'center', height: '100%' }}
    >
      <RibbonGroup label="Edición">
        <div style={{ position: 'relative' }}>
          <i className="bi bi-layers" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: theme.colors.text.secondary }} />
          <select 
            className="form-select-sm"
            style={{ ...customListStyle, width: '130px', paddingLeft: '24px' }}
            value={elId || 'title'}
            onChange={e => setSelectedElementId(e.target.value)}>
            {ELEMENTS.map(el => <option key={el.value} value={el.value}>{el.label}</option>)}
          </select>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Fuente">
        <select 
          className="form-select-sm"
          style={{ ...customListStyle, width: '120px', fontFamily: fv('Font', fontFamily) }}
          value={fv('Font', fontFamily)}
          onChange={e => { setFontFamily(e.target.value); sv('Font', e.target.value); }}>
          {EXTENDED_FONTS.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </select>
        
        <div style={{ display: 'flex', gap: '2px', background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#eff6ff', padding: '2px', borderRadius: '8px' }}>
          <RibbonButton 
            whileHover={{ backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#fff' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setFontSize((s: number) => Math.max(8, s - 2)); sv('Size', Math.max(0.5, (Number(formData[`${elId}Size`]) || 1) - 0.1)); }}
            style={{ width: 26, height: 26, border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800 }}>
            A-
          </RibbonButton>
          <RibbonButton 
            whileHover={{ backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#fff' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setFontSize((s: number) => Math.min(120, s + 2)); sv('Size', Math.min(10, (Number(formData[`${elId}Size`]) || 1) + 0.1)); }}
            style={{ width: 26, height: 26, border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800 }}>
            A+
          </RibbonButton>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Formato">
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { k: 'B', label: 'B', icon: 'bi-type-bold', stateVal: isBold, toggle: () => { setIsBold((b: boolean) => !b); sv('Bold', !formData[`${elId}Bold`]); } },
            { k: 'I', label: 'I', icon: 'bi-type-italic', stateVal: isItalic, toggle: () => { setIsItalic((b: boolean) => !b); sv('Italic', !formData[`${elId}Italic`]); } },
            { k: 'U', label: 'U', icon: 'bi-type-underline', stateVal: isUnderline, toggle: () => { setIsUnderline((b: boolean) => !b); sv('Underline', !formData[`${elId}Underline`]); } },
          ].map(btn => {
            const active = elId ? !!formData[`${elId}${btn.k === 'B' ? 'Bold' : btn.k === 'I' ? 'Italic' : 'Underline'}`] : btn.stateVal;
            return (
              <RibbonButton 
                key={btn.k} 
                whileTap={{ scale: 0.85 }} 
                onClick={btn.toggle}
                style={{ 
                  width: 30, height: 30, 
                  border: 'none', 
                  borderRadius: '8px', 
                  background: active ? (mode === 'dark' ? 'rgba(251,191,36,0.1)' : '#eff6ff') : (mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc'), 
                  color: active ? theme.colors.primary : theme.colors.text.secondary, 
                  cursor: 'pointer', 
                  fontSize: '0.9rem', 
                  boxShadow: active ? `inset 0 0 0 1px ${theme.colors.primary}` : 'none'
                }}>
                <i className={`bi ${btn.icon}`}></i>
              </RibbonButton>
            );
          })}
        </div>
        <div style={{ borderLeft: `1px solid ${theme.colors.border}`, height: '20px', margin: '0 4px' }} />
        <input type="color" value={fv('Color', selectedColor)}
          onChange={e => { setSelectedColor(e.target.value); sv('Color', e.target.value); }}
          style={{ width: 28, height: 28, border: `2px solid ${theme.colors.background}`, borderRadius: '50%', cursor: 'pointer', padding: 0, boxShadow: `0 0 0 1px ${theme.colors.border}` }} />
      </RibbonGroup>

      <RibbonGroup label="Párrafo">
        <div style={{ display: 'flex', gap: '2px', background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '3px', borderRadius: '10px' }}>
          {ALIGN_OPTIONS.map(a => {
            const active = elId ? formData[`${elId}Align`] === a.val : textAlign === a.val;
            return (
              <RibbonButton 
                key={a.val} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => { setTextAlign(a.val); sv('Align', a.val); }}
                style={{ 
                  width: 28, height: 28, border: 'none', borderRadius: '6px', 
                  background: active ? (mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#fff') : 'transparent', 
                  color: active ? theme.colors.primary : theme.colors.text.secondary, 
                  boxShadow: active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer' 
                }}>
                <i className={`bi ${a.icon}`} style={{ fontSize: '0.9rem' }}></i>
              </RibbonButton>
            );
          })}
        </div>
      </RibbonGroup>

      <RibbonGroup label="Espaciado">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', fontWeight: 800, color: theme.colors.text.secondary }}>
            <span>TRACKING</span>
            <span>{fv('LetterSpacing', letterSpacing)}</span>
          </div>
          <input type="range" min={-2} max={15} step={0.5} value={fv('LetterSpacing', letterSpacing)}
            onChange={e => { setLetterSpacing(parseFloat(e.target.value)); sv('LetterSpacing', parseFloat(e.target.value)); }}
            style={{ width: '100%', height: '3px', accentColor: theme.colors.primary, cursor: 'ew-resize' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', fontWeight: 800, color: theme.colors.text.secondary, marginTop: '4px' }}>
            <span>LEADING</span>
            <span>{fv('LineHeight', lineHeight)}</span>
          </div>
          <input type="range" min={0.8} max={2.5} step={0.1} value={fv('LineHeight', lineHeight)}
            onChange={e => { setLineHeight(parseFloat(e.target.value)); sv('LineHeight', parseFloat(e.target.value)); }}
            style={{ width: '100%', height: '3px', accentColor: theme.colors.primary, cursor: 'ew-resize' }} />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Efectos">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <select 
            className="form-select-sm"
            style={{ ...customListStyle, width: '90px', padding: '2px 6px', fontSize: '0.65rem' }}
            value={fv('Shadow', textShadow) || 'none'}
            onChange={e => { setTextShadow(e.target.value); sv('Shadow', e.target.value); }}>
            {SHADOW_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.5rem', fontWeight: 800, color: theme.colors.text.secondary }}>OPAC.</span>
            <input type="range" min={0.1} max={1} step={0.1} value={fv('Opacity', textOpacity)}
              onChange={e => { setTextOpacity(parseFloat(e.target.value)); sv('Opacity', parseFloat(e.target.value)); }}
              style={{ width: '45px', height: '3px', accentColor: theme.colors.primary }} />
          </div>
        </div>
      </RibbonGroup>
    </motion.div>
  );
};

export default RibbonTabInicio;