import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & MotionProps &
  React.RefAttributes<HTMLDivElement> & { children?: React.ReactNode };
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

// ── Campos ────────────────────────────────────────────────────
const FIELD_GROUPS = {
  main: [
    { key: 'title',   label: 'TÍTULO PRINCIPAL',         type: 'text', icon: 'bi-type-h1', placeholder: 'Título en mayúsculas sólidas' },
    { key: 'title2',  label: 'PALABRA ESPECIAL (CURSIVA)', type: 'text', icon: 'bi-stars',   placeholder: 'Palabra de énfasis en letra de corrido…' },
  ],
  grid: [
    { key: 'tag',     label: 'TIPO DE CULTO / ETIQUETA', type: 'text', icon: 'bi-tag',       placeholder: 'Ej: CULTO DE ADORACIÓN' },
    { key: 'speaker', label: 'PREDICA / ORADOR',         type: 'text', icon: 'bi-person',    placeholder: 'Ej: Min. Elías Linero' },
    { key: 'date',    label: 'FECHA',                    type: 'text', icon: 'bi-calendar3', placeholder: 'Ej: Sábado 17 de Octubre, 2026' },
    { key: 'time',    label: 'HORA',                     type: 'text', icon: 'bi-clock',     placeholder: 'Ej: 6:16 PM' },
  ],
  bible: [
    { key: 'bibleRef',  label: 'CITA BÍBLICA',           type: 'text',     icon: 'bi-bookmark',  placeholder: 'Ej: 2 Reyes 6:16' },
    { key: 'bibleText', label: 'VERSÍCULO',              type: 'textarea', icon: 'bi-book-half', placeholder: 'Escribe el versículo bíblico…' },
  ],
  footer: [
    { key: 'location', label: 'UBICACIÓN',               type: 'text',     icon: 'bi-geo-alt' },
    { key: 'content',  label: 'NOTAS ADICIONALES',       type: 'textarea', icon: 'bi-text-paragraph' },
  ],
} as const;

interface FormData { [key: string]: any }
interface QuickContentPanelProps {
  formData: FormData;
  set: (key: string, value: any) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  /** Si es true, se renderiza como un bloque normal en lugar de un drawer flotante */
  isEmbedded?: boolean;
}

const QuickContentPanel: React.FC<QuickContentPanelProps> = ({
  formData, set, selectedElementId, setSelectedElementId, isEmbedded = false,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const accent = isDark ? theme.colors.primary : '#5b2ea6';
  const secondaryAccent = isDark ? theme.colors.secondary : '#5b2ea6';

  // ── Estilos base inputs ───────────────────────────────────
  const bg = isDark ? 'rgba(36, 18, 74, 0.95)' : 'rgba(248,248,252,0.98)';
  const borderDefault = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.09)';

  const baseInput: React.CSSProperties = {
    fontSize: '0.73rem',
    width: '100%',
    padding: '6px 10px',
    borderRadius: 8,
    border: `1px solid ${borderDefault}`,
    background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f0f0f5',
    color: theme.colors.text.primary,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    colorScheme: isDark ? 'dark' : 'light',
    fontFamily: 'inherit',
  };

  // ── Render campo ─────────────────────────────────────────
  const renderField = (f: { key: string; label: string; type: string; icon: string; placeholder?: string }) => {
    const isActive = selectedElementId === f.key;
    const fieldAccent = (f.key === 'title' || f.key === 'title2' || f.key === 'bibleText') ? secondaryAccent : accent;
    
    const style: React.CSSProperties = {
      ...baseInput,
      border: `1px solid ${isActive ? fieldAccent : borderDefault}`,
      background: isActive ? (isDark ? 'rgba(255,255,255,0.06)' : '#fff') : baseInput.background,
      boxShadow: isActive ? `0 0 0 3px ${fieldAccent}15` : 'none',
    };
    return (
      <div
        key={f.key}
        style={{ marginBottom: 8 }}
        onClick={e => { e.stopPropagation(); setSelectedElementId(f.key); }}
        onMouseDown={e => e.stopPropagation()}
      >
        <label style={{
          fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.8px',
          color: isActive ? fieldAccent : (isDark ? '#64748b' : '#999'),
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3,
          userSelect: 'none',
          transition: 'color 0.2s ease'
        }}>
          <i className={`bi ${f.icon}`} style={{ fontSize: '0.62rem', color: isActive ? fieldAccent : 'inherit' }} />
          {f.label}
        </label>
        {f.type === 'textarea' ? (
          <textarea
            rows={f.key === 'bibleText' ? 3 : 2}
            placeholder={f.placeholder ?? ''}
            value={formData[f.key] ?? ''}
            onChange={e => set(f.key, e.target.value)}
            onKeyDown={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            style={{
              ...style, resize: 'vertical',
              fontStyle: f.key === 'bibleText' ? 'italic' : 'normal',
              minHeight: f.key === 'bibleText' ? 60 : 44,
            }}
          />
        ) : (
          <input
            type={f.type === 'date' || f.type === 'time' ? f.type : 'text'}
            placeholder={f.placeholder ?? ''}
            value={formData[f.key] ?? ''}
            onChange={e => set(f.key, e.target.value)}
            onKeyDown={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            style={{
              ...style, height: 32,
              fontStyle: f.key === 'bibleRef' ? 'italic' : 'normal',
            }}
          />
        )}
      </div>
    );
  };

  const divider = (icon: string, label: string) => (
    <div style={{ margin: '14px 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <i className={`bi ${icon}`} style={{ color: accent, fontSize: '0.68rem', opacity: 0.8 }} />
      <span style={{ fontSize: '0.55rem', fontWeight: 900, color: accent, letterSpacing: '1px', opacity: 0.9 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.07)' }} />
    </div>
  );

  const containerStyle: React.CSSProperties = isEmbedded 
    ? {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.colors.surface,
        userSelect: 'none',
        boxSizing: 'border-box'
      }
    : {
        position: 'fixed',
        top: 202,
        left: 0,
        bottom: 0,
        width: 280,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        background: bg,
        backdropFilter: 'blur(18px)',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.09)'}`,
        boxShadow: isDark ? '10px 0 40px rgba(0,0,0,0.5)' : '4px 0 32px rgba(0,0,0,0.18)',
        userSelect: 'none',
      };

  return (
    <div style={containerStyle} onMouseDown={e => e.stopPropagation()}>
      {/* Cabecera */}
      <div style={{
        height: 48,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 16px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.07)'}`,
      }}>
        <i className="bi bi-pencil-square" style={{ color: secondaryAccent, fontSize: '1rem' }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1.2px', color: theme.colors.text.primary, flex: 1 }}>
          EDITOR RÁPIDO
        </span>
      </div>

      {/* Cuerpo scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 30px', scrollbarWidth: 'thin' }}>
        {FIELD_GROUPS.main.map(renderField)}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
          {FIELD_GROUPS.grid.map(renderField)}
        </div>

        {divider('bi-book', 'TEXTO BÍBLICO')}
        {FIELD_GROUPS.bible.map(renderField)}

        {divider('bi-info-circle', 'DETALLES')}
        {FIELD_GROUPS.footer.map(renderField)}
      </div>
    </div>
  );
};

export default QuickContentPanel;
