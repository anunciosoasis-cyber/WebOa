import React, { useState } from 'react';
import { RibbonButton, RibbonGroup } from '../ui/RibbonUI';
import CustomDatePicker from '../pickers/CustomDatePicker';
import CustomTimePicker from '../pickers/CustomTimePicker';
import { useTheme } from '../../context/ThemeContext';

export interface RibbonTabInsertarProps {
  formData: any;
  set: (key: string, value: any) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  onOpenImageLibrary?: () => void;
}

const TEXTO_ELEMENTS = [
  { id: 'title',   label: 'H1',       icon: 'bi-type-h1', defaultVal: 'TÍTULO DEL EVENTO',           desc: 'Título principal' },
  { id: 'title2',  label: 'H2',       icon: 'bi-type-h2', defaultVal: 'Subtítulo del evento',        desc: 'Subtítulo' },
  { id: 'title3',  label: 'H3',       icon: 'bi-type-h3', defaultVal: 'Información adicional',       desc: 'Línea 3' },
  { id: 'content', label: 'Cita',     icon: 'bi-quote',   defaultVal: 'Texto bíblico o descripción', desc: 'Cita / Biblia' },
];

const MODULOS_ELEMENTS = [
  { id: 'speaker',  label: 'Orador',   icon: 'bi-person-badge',       defaultVal: 'Nombre del Orador',   desc: 'Nombre del expositor' },
  { id: 'tag',      label: 'Etiqueta', icon: 'bi-bookmark-star-fill', defaultVal: 'ESPECIAL',            desc: 'Chip de categoría' },
  { id: 'date',     label: 'Fecha',    icon: 'bi-calendar3',          defaultVal: 'Próximo Sábado',     desc: 'Fecha del evento' },
  { id: 'time',     label: 'Hora',     icon: 'bi-clock-history',      defaultVal: '18:00 hrs',           desc: 'Hora del evento' },
  { id: 'location', label: 'Lugar',    icon: 'bi-geo-alt-fill',       defaultVal: 'Templo Oasis',    desc: 'Ubicación' },
];

const LOGOS_ELEMENTS = [
  { id: 'showLogoOasis', label: 'Oasis',      icon: 'bi-shield-check',  desc: 'Logo Oasis' },
  { id: 'showLogoIasd',  label: 'IASD',       icon: 'bi-star-fill',     desc: 'Logo Adventista' },
  { id: 'showRrss',      label: 'Redes',      icon: 'bi-share-fill',    desc: 'Redes sociales' },
];

/** Componente de botón de texto fuera para evitar re-montajes */
const TextBtn = ({ el, formData, set, selectedElementId, setSelectedElementId, theme, mode }: any) => {
  const hasContent = !!(formData[el.id] && formData[el.id].trim());
  const isSelected = selectedElementId === el.id;

  const handleClick = () => {
    if (hasContent) {
      set(el.id, '');
      if (isSelected) setSelectedElementId(null);
    } else {
      set(el.id, el.defaultVal);
      setSelectedElementId(el.id);
    }
  };

  const activeColor = mode === 'dark' ? theme.colors.secondary : '#5b2ea6';
  const activeBg = mode === 'dark' ? 'rgba(167, 139, 250, 0.12)' : 'linear-gradient(135deg, #ede9fe, #ddd6fe)';

  return (
    <RibbonButton
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      title={hasContent ? `Quitar ${el.desc}` : `Insertar ${el.desc}`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: 52, height: 52, gap: 3,
        border: `1px solid ${hasContent ? activeColor : theme.colors.border}`,
        borderRadius: 12,
        background: hasContent ? activeBg : (mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'),
        color: hasContent ? activeColor : theme.colors.text.secondary,
        cursor: 'pointer',
        boxShadow: hasContent ? `0 4px 12px ${mode === 'dark' ? 'rgba(167,139,250,0.15)' : 'rgba(91,46,166,0.18)'}` : 'none',
        transition: 'all 0.2s ease', position: 'relative',
      }}
    >
      <i className={`bi ${el.icon}`} style={{ fontSize: '1.05rem', opacity: hasContent ? 1 : 0.7 }}></i>
      <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: 0.3 }}>{el.label}</span>
      {hasContent && (
        <span style={{
          position: 'absolute', top: -4, right: -4, width: 12, height: 12,
          background: activeColor, borderRadius: '50%', border: `2px solid ${theme.colors.surface}`,
          boxShadow: `0 0 8px ${activeColor}44`
        }} />
      )}
    </RibbonButton>
  );
};

/** Componente de botón de módulo fuera para evitar re-montajes */
const ModBtn = ({ el, formData, set, selectedElementId, setSelectedElementId, openPicker, setOpenPicker, theme, mode }: any) => {
  const hasContent = !!(formData[el.id] && String(formData[el.id]).trim());
  const isSelected = selectedElementId === el.id;

  const handleClick = () => {
    if (el.id === 'date' || el.id === 'time') {
      const isPickerOpen = openPicker === el.id;
      if (hasContent && isPickerOpen) {
        set(el.id, '');
        setOpenPicker(null);
        setSelectedElementId(null);
      } else {
        if (!hasContent) set(el.id, el.defaultVal);
        setOpenPicker(el.id);
        setSelectedElementId(el.id);
      }
      return;
    }
    
    if (hasContent) {
      set(el.id, '');
      if (isSelected) setSelectedElementId(null);
    } else {
      set(el.id, el.defaultVal);
      setSelectedElementId(el.id);
    }
  };

  const activeColor = mode === 'dark' ? theme.colors.primary : '#0ea5e9';
  const activeBg = mode === 'dark' ? 'rgba(251, 191, 36, 0.12)' : 'linear-gradient(135deg, #e0f2fe, #bae6fd)';

  return (
    <div style={{ position: 'relative' }}>
      <RibbonButton
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleClick}
        title={hasContent ? `Quitar ${el.desc}` : `Insertar ${el.desc}`}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          width: 52, height: 52, gap: 3,
          border: `1px solid ${hasContent ? activeColor : theme.colors.border}`,
          borderRadius: 12,
          background: hasContent ? activeBg : (mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'),
          color: hasContent ? activeColor : theme.colors.text.secondary,
          cursor: 'pointer',
          boxShadow: hasContent ? `0 4px 12px ${mode === 'dark' ? 'rgba(251,191,36,0.15)' : 'rgba(14,165,233,0.18)'}` : 'none',
          transition: 'all 0.2s ease', position: 'relative',
        }}
      >
        <i className={`bi ${el.icon}`} style={{ fontSize: '1.05rem', opacity: hasContent ? 1 : 0.7 }}></i>
        <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: 0.3 }}>{el.label}</span>
        {hasContent && (
          <span style={{
            position: 'absolute', top: -4, right: -4, width: 12, height: 12,
            background: activeColor, borderRadius: '50%', border: `2px solid ${theme.colors.surface}`,
            boxShadow: `0 0 8px ${activeColor}44`
          }} />
        )}
      </RibbonButton>

      {openPicker === 'date' && el.id === 'date' && (
        <CustomDatePicker 
          theme={theme} 
          onSelect={(date) => { set('date', date); }} 
          onClose={() => setOpenPicker(null)} 
        />
      )}
      {openPicker === 'time' && el.id === 'time' && (
        <CustomTimePicker 
          theme={theme} 
          onSelect={(time) => { set('time', time); }} 
          onClose={() => setOpenPicker(null)} 
        />
      )}
    </div>
  );
};

const LogoBtn = ({ el, formData, set, theme, mode }: any) => {
  const isOn = formData[el.id] !== false;
  const activeColor = '#10b981'; // Green stays green but refined
  const activeBg = mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : 'linear-gradient(135deg, #d1fae5, #a7f3d0)';

  return (
    <RibbonButton
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => set(el.id, !isOn)}
      title={isOn ? `Ocultar ${el.desc}` : `Mostrar ${el.desc}`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: 52, height: 52, gap: 3,
        border: `1px solid ${isOn ? activeColor : theme.colors.border}`,
        borderRadius: 12,
        background: isOn ? activeBg : (mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'),
        color: isOn ? activeColor : theme.colors.text.secondary,
        cursor: 'pointer',
        boxShadow: isOn ? `0 4px 12px ${mode === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.18)'}` : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <i className={`bi ${el.icon}`} style={{ fontSize: '1.05rem', opacity: isOn ? 1 : 0.7 }}></i>
      <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: 0.3 }}>{el.label}</span>
    </RibbonButton>
  );
};

const RibbonTabInsertar: React.FC<RibbonTabInsertarProps> = ({
  formData, set, selectedElementId, setSelectedElementId, onOpenImageLibrary
}) => {
  const { theme, mode } = useTheme();
  const [openPicker, setOpenPicker] = useState<'date' | 'time' | null>(null);
  const hasBgImage = !!(formData.bgImage || formData.imageUrl);

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <RibbonGroup label="Textos">
        {TEXTO_ELEMENTS.map(el => (
          <TextBtn 
            key={el.id} 
            el={el} 
            formData={formData} 
            set={set} 
            selectedElementId={selectedElementId} 
            setSelectedElementId={setSelectedElementId} 
            theme={theme}
            mode={mode}
          />
        ))}
      </RibbonGroup>

      <RibbonGroup label="Módulos">
        {MODULOS_ELEMENTS.map(el => (
          <ModBtn 
            key={el.id} 
            el={el} 
            formData={formData} 
            set={set} 
            selectedElementId={selectedElementId} 
            setSelectedElementId={setSelectedElementId} 
            openPicker={openPicker} 
            setOpenPicker={setOpenPicker}
            theme={theme}
            mode={mode}
          />
        ))}
      </RibbonGroup>

      <RibbonGroup label="Imagen">
        <RibbonButton
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={onOpenImageLibrary}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, gap: 3,
            border: `1.5px solid ${hasBgImage ? (mode === 'dark' ? theme.colors.primary : '#f59e0b') : theme.colors.border}`,
            borderRadius: 12,
            background: hasBgImage ? (mode === 'dark' ? 'rgba(234, 179, 8, 0.2)' : 'linear-gradient(135deg, #fef3c7, #fde68a)') : theme.colors.surface,
            color: hasBgImage ? (mode === 'dark' ? theme.colors.primary : '#b45309') : theme.colors.text.secondary,
            cursor: 'pointer',
            boxShadow: hasBgImage ? '0 4px 12px rgba(245,158,11,0.18)' : '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.18s ease', position: 'relative',
          }}
        >
          <i className="bi bi-images" style={{ fontSize: '1.1rem' }}></i>
          <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: 0.3 }}>Biblioteca</span>
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup label="Visibilidad">
        {LOGOS_ELEMENTS.map(el => (
          <LogoBtn key={el.id} el={el} formData={formData} set={set} theme={theme} mode={mode} />
        ))}
      </RibbonGroup>
    </div>
  );
};

export default RibbonTabInsertar;
