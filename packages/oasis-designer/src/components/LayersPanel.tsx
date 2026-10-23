import React from 'react';

interface Layer {
  id: string;
  label: string;
  type: 'text' | 'image' | 'logo' | 'shape';
  visible: boolean;
}

interface LayersPanelProps {
  formData: any;
  set: (key: string, value: any) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  theme: any;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ 
  formData, set, selectedElementId, setSelectedElementId, theme 
}) => {
  // Define layers based on formData keys
  // We check if they have content or if their visibility flag is true
  const layers: Layer[] = [
    { id: 'title', label: 'H1: Título Principal', type: 'text', visible: !!formData.title },
    { id: 'title2', label: 'Palabra Especial (Cursiva)', type: 'text', visible: !!formData.title2 },
    { id: 'speaker', label: 'Predica / Orador', type: 'text', visible: !!formData.speaker },
    { id: 'tag', label: 'Etiqueta', type: 'text', visible: !!formData.tag },
    { id: 'date', label: 'Fecha', type: 'text', visible: !!formData.date },
    { id: 'location', label: 'Lugar', type: 'text', visible: !!formData.location },
    { id: 'content', label: 'Cita / Texto', type: 'text', visible: !!(formData.content || formData.bibleText) },
    { id: 'showLogoOasis', label: 'Logo Oasis', type: 'logo', visible: formData.showLogoOasis !== false },
    { id: 'showLogoIasd', label: 'Logo Iglesia', type: 'logo', visible: !!formData.showLogoIasd },
    { id: 'showRrss', label: 'Redes Sociales', type: 'logo', visible: !!formData.showRrss },
    { id: 'bgImage', label: 'Imagen de Fondo', type: 'image', visible: !!(formData.bgImage || formData.imageUrl) },
  ];

  const toggleVisibility = (id: string, current: boolean) => {
    if (id.startsWith('show')) {
      set(id, !current);
    } else if (id === 'bgImage') {
       // For image, maybe toggle bgMode or just clear it? 
       // Better to just clear it if they hide it, or we could add a bgOpacity toggle.
    } else {
      // Toggle visibility flag
      const visKey = `${id}Visible`;
      set(visKey, formData[visKey] === false);
    }
  };

  return (
    <div style={{ 
      padding: '16px', 
      background: theme.colors.surface, 
      height: '100%', 
      borderRight: `1px solid ${theme.colors.border}`, 
      width: '220px', 
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      <h6 style={{ 
        fontSize: '0.7rem', 
        fontWeight: 800, 
        color: theme.colors.text.secondary, 
        marginBottom: '20px', 
        textTransform: 'uppercase', 
        letterSpacing: '1.2px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <i className="bi bi-layers-half" style={{ color: theme.colors.primary, fontSize: '1rem' }}></i>
        Capas del Diseño
      </h6>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {layers.map(layer => {
          const isSelected = selectedElementId === layer.id;
          const isEmpty = layer.type === 'text' && !layer.visible;

          return (
            <div 
              key={layer.id}
              onClick={() => setSelectedElementId(layer.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: isSelected ? 'rgba(91, 46, 166, 0.08)' : 'transparent',
                border: `1px solid ${isSelected ? 'rgba(91, 46, 166, 0.2)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isEmpty ? 0.5 : 1
              }}
            >
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '6px', 
                background: isSelected ? '#5b2ea6' : 'rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                <i className={`bi ${layer.type === 'text' ? 'bi-type' : layer.type === 'logo' ? 'bi-badge-tm' : 'bi-image'}`} 
                   style={{ color: isSelected ? '#fff' : '#64748b', fontSize: '0.8rem' }} />
              </div>
              
              <span style={{ 
                flex: 1, 
                fontSize: '0.72rem', 
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? theme.colors.primary : theme.colors.text.primary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {layer.label}
              </span>

              <button 
                onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id, layer.visible); }}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', 
                  padding: '4px', color: layer.visible ? '#10b981' : '#cbd5e1',
                  transition: 'color 0.2s'
                }}
              >
                <i className={`bi ${layer.visible ? 'bi-eye-fill' : 'bi-eye-slash'}`} style={{ fontSize: '0.9rem' }}></i>
              </button>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: 'auto', padding: '20px 0' }}>
         <p style={{ fontSize: '0.6rem', color: theme.colors.text.secondary, fontStyle: 'italic', textAlign: 'center' }}>
            Click para seleccionar y editar propiedades
         </p>
      </div>
    </div>
  );
};

export default LayersPanel;
