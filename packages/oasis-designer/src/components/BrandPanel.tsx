import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandPanelProps {
  showBrandPanel: boolean;
  setShowBrandPanel: (show: boolean) => void;
  logoOasis: string;
  selectedLogo: string | null;
  setSelectedLogo: (logo: string | null) => void;
  logoSize: number;
  setLogoSize: (size: number) => void;
  logoPosition: string;
  setLogoPosition: (pos: string) => void;
  logoOpacity: number;
  setLogoOpacity: (opacity: number) => void;
  onUploadLogo: (logo: string) => void;
  availableLogos: Array<{ name: string; url: string }>;
  isMobile: boolean;
}

const positionLabels: Record<string, string> = {
  'top-left': 'Arriba izquierda',
  'top-right': 'Arriba derecha',
  'bottom-left': 'Abajo izquierda',
  'bottom-right': 'Abajo derecha',
  'center': 'Centro',
};

const BrandPanel: React.FC<BrandPanelProps> = ({
  showBrandPanel, setShowBrandPanel, logoOasis, selectedLogo, setSelectedLogo,
  logoSize, setLogoSize, logoPosition, setLogoPosition, logoOpacity, setLogoOpacity,
  onUploadLogo, availableLogos, isMobile,
}) => {
  const logoPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
  const logoSizeOptions = [40, 60, 80, 100, 120, 140, 160, 180, 200];

  return (
    <AnimatePresence>
      {showBrandPanel && (
        <motion.div
          className="brand-panel bg-white border-end shadow-lg"
          initial={{ opacity: 0, x: '-100%' }}
          animate={{ opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }}
          exit={{ opacity: 0, x: '-100%', transition: { duration: 0.2 } }}
          style={{
            position: 'fixed', top: '40px', left: 0, bottom: 0,
            width: isMobile ? '100%' : '300px', zIndex: 1150, overflowY: 'auto',
          }}
        >
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center sticky-top bg-white">
            <h6 className="fw-bold mb-0" style={{ letterSpacing: '1px' }}>MARCA</h6>
            <button className="btn-close" onClick={() => setShowBrandPanel(false)}></button>
          </div>

          <div className="p-3">
            {/* Preview del logo actual */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-eye"></i> Vista Previa
              </label>
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed #dee2e6', borderRadius: '0.5rem', background: '#f8f9fa' }}>
                {selectedLogo ? (
                  <img src={selectedLogo} style={{ maxHeight: `${logoSize}px`, maxWidth: '100%', opacity: logoOpacity, objectFit: 'contain' }} alt="Logo" />
                ) : (
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Sin logo seleccionado</span>
                )}
              </div>
            </div>

            <hr />

            {/* Logos disponibles */}
            {availableLogos.length > 0 && (
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-grid"></i> Logos Disponibles
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {availableLogos.map((logo, idx) => (
                    <motion.div key={idx}
                      style={{ width: '60px', height: '60px', border: selectedLogo === logo.url ? '3px solid #0d6efd' : '1px solid #dee2e6',
                        borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', background: '#f8f9fa', padding: '4px' }}
                      onClick={() => setSelectedLogo(logo.url === selectedLogo ? null : logo.url)}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title={logo.name}>
                      <img src={logo.url} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} alt={logo.name} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <hr />

            {/* Subir logo personalizado */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-cloud-upload"></i> Logo Personalizado
              </label>
              <label className="btn btn-outline-secondary btn-sm w-100">
                <i className="bi bi-upload"></i> Subir Logo
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => { onUploadLogo(ev.target?.result as string); };
                    reader.readAsDataURL(file);
                  }} />
              </label>
            </div>

            <hr />

            {/* Tamaño */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-rulers"></i> Tamaño: <span className="text-primary">{logoSize}px</span>
              </label>
              <input type="range" className="form-range" min="40" max="200" step="10" value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))} />
              <div className="d-flex flex-wrap gap-1 mt-2">
                {logoSizeOptions.map((size) => (
                  <motion.button key={size}
                    className={`btn ${logoSize === size ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setLogoSize(size)} whileTap={{ scale: 0.95 }}
                    style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}>
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            <hr />

            {/* Posición */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-layout-split"></i> Posición
              </label>
              <div className="d-grid gap-2">
                {logoPositions.map((pos) => (
                  <motion.button key={pos}
                    className={`btn btn-sm ${logoPosition === pos ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setLogoPosition(pos)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                    {positionLabels[pos]}
                  </motion.button>
                ))}
              </div>
            </div>

            <hr />

            {/* Opacidad */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-droplet-half"></i> Opacidad: <span className="text-primary">{(logoOpacity * 100).toFixed(0)}%</span>
              </label>
              <input type="range" className="form-range" min="0" max="1" step="0.1" value={logoOpacity}
                onChange={(e) => setLogoOpacity(Number(e.target.value))} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandPanel;

