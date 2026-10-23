import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface TextPanelProps {
  showTextPanel: boolean;
  setShowTextPanel: (show: boolean) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  textColor: string;
  setTextColor: (c: string) => void;
  textOpacity: number;
  setTextOpacity: (n: number) => void;
  textShadow: string;
  setTextShadow: (s: string) => void;
  letterSpacing: number;
  setLetterSpacing: (n: number) => void;
  lineHeight: number;
  setLineHeight: (n: number) => void;
  isMobile: boolean;
}

const TextPanel: React.FC<TextPanelProps> = ({
  showTextPanel, setShowTextPanel, fontFamily, setFontFamily, fontSize, setFontSize,
  textColor, setTextColor, textOpacity, setTextOpacity, textShadow, setTextShadow,
  letterSpacing, setLetterSpacing, lineHeight, setLineHeight, isMobile,
}) => {
  const { theme } = useTheme();

  const fontFamilies = [
    'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Comic Sans MS',
    "'Moonrising', serif",
    "'Modern Age', 'Orbitron', sans-serif",
    "'Advent Sans', 'Advent Pro', sans-serif",
    "'Above The Beyond', cursive",
    'Courier New',
  ];
  const fontSizeOptions = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];
  const textColorPresets = ['#ffffff','#000000','#5b2ea6','#00d2f3','#ef4444','#f59e0b','#10b981','#3b82f6','#ec4899','#6b7280'];
  const shadowPresets = [
    { name: 'Sin sombra', value: 'none' },
    { name: 'Suave', value: '1px 1px 4px rgba(0,0,0,0.5)' },
    { name: 'Media', value: '2px 2px 6px rgba(0,0,0,0.7)' },
    { name: 'Fuerte', value: '3px 3px 8px rgba(0,0,0,0.9)' },
    { name: 'Difusa', value: '0px 0px 12px rgba(0,0,0,0.8)' },
    { name: 'Glow', value: '0 0 10px rgba(91,46,166,1)' },
  ];

  return (
    <AnimatePresence>
      {showTextPanel && (
        <motion.div
          className="text-panel shadow-lg border-end"
          initial={{ opacity: 0, x: '-100%' }}
          animate={{ opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }}
          exit={{ opacity: 0, x: '-100%', transition: { duration: 0.2 } }}
          style={{
            position: 'fixed', top: '40px', left: 0, bottom: 0,
            width: isMobile ? '100%' : '300px', zIndex: 1150, overflowY: 'auto',
            background: theme.colors.surface, borderColor: theme.colors.border,
          }}
        >
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center sticky-top"
            style={{ background: theme.colors.surface, borderColor: theme.colors.border }}>
            <h6 className="fw-bold mb-0" style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.accent, letterSpacing: '1px' }}>TEXTO</h6>
            <button className="btn-close" onClick={() => setShowTextPanel(false)}></button>
          </div>

          <div className="p-3">
            {/* Familia de fuentes */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: theme.colors.text.primary }}>
                <i className="bi bi-fonts"></i> Fuente
              </label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                className="form-select form-select-sm">
                {fontFamilies.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <hr />

            {/* Tamaño */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: theme.colors.text.primary }}>
                <i className="bi bi-type-h1"></i> Tamaño: <span style={{ color: theme.colors.primary }}>{fontSize}px</span>
              </label>
              <input type="range" className="form-range" min="8" max="120" value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))} />
              <div className="d-flex flex-wrap gap-1 mt-2">
                {fontSizeOptions.map((size) => (
                  <motion.button key={size}
                    className={`btn btn-xs ${fontSize === size ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFontSize(size)} whileTap={{ scale: 0.95 }}
                    style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}>
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            <hr />

            {/* Color */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: theme.colors.text.primary }}>
                <i className="bi bi-palette"></i> Color
              </label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {textColorPresets.map((color) => (
                  <motion.div key={color}
                    style={{ width: '32px', height: '32px', backgroundColor: color,
                      border: textColor === color ? '3px solid #0d6efd' : '1px solid #999', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => setTextColor(color)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} title={color} />
                ))}
              </div>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                className="form-control form-control-color" style={{ height: '40px', cursor: 'pointer' }} />
            </div>

            <hr />

            {/* Opacidad */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: theme.colors.text.primary }}>
                Opacidad: <span style={{ color: theme.colors.primary }}>{(textOpacity * 100).toFixed(0)}%</span>
              </label>
              <input type="range" className="form-range" min="0" max="1" step="0.1" value={textOpacity}
                onChange={(e) => setTextOpacity(Number(e.target.value))} />
            </div>

            <hr />

            {/* Espaciado de letras */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: theme.colors.text.primary }}>
                Espaciado de Letras: <span style={{ color: theme.colors.primary }}>{letterSpacing}px</span>
              </label>
              <input type="range" className="form-range" min="-2" max="10" value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))} />
            </div>

            <hr />

            {/* Alto de línea */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: theme.colors.text.primary }}>
                Alto de Línea: <span style={{ color: theme.colors.primary }}>{lineHeight}</span>
              </label>
              <input type="range" className="form-range" min="0.8" max="2.5" step="0.1" value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))} />
            </div>

            <hr />

            {/* Sombra */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: theme.colors.text.primary }}>
                <i className="bi bi-cloud-haze2"></i> Sombra
              </label>
              <div className="d-grid gap-2">
                {shadowPresets.map((shadow, idx) => (
                  <motion.button key={idx} className="btn btn-sm btn-outline-secondary text-start"
                    onClick={() => setTextShadow(shadow.value)}
                    style={{ fontSize: '0.75rem', padding: '0.5rem', borderRadius: '0.5rem',
                      border: textShadow === shadow.value ? '2px solid #0d6efd' : '1px solid #dee2e6',
                      background: textShadow === shadow.value ? '#e7f1ff' : theme.colors.surface }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <span style={{ textShadow: shadow.value, fontWeight: 'bold' }}>{shadow.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextPanel;

