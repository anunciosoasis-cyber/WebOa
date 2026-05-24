import React from 'react';

const BrandPanel = ({ formData, set, assets }) => {
    return (
        <div className="brand-panel d-flex flex-column gap-4">
            <section>
                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Identidad Visual</label>
                
                <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" role="switch" id="showLogoOasis" 
                        checked={!!formData.showLogoOasis} onChange={e => set('showLogoOasis', e.target.checked)} />
                    <label className="form-check-label x-small" htmlFor="showLogoOasis">Logo Oasis Ecosystem</label>
                </div>

                <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" role="switch" id="showLogoIasd" 
                        checked={!!formData.showLogoIasd} onChange={e => set('showLogoIasd', e.target.checked)} />
                    <label className="form-check-label x-small" htmlFor="showLogoIasd">Logo Iglesia (IASD)</label>
                </div>

                <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" role="switch" id="showRrss" 
                        checked={!!formData.showRrss} onChange={e => set('showRrss', e.target.checked)} />
                    <label className="form-check-label x-small" htmlFor="showRrss">Redes Sociales (@templo_oasis)</label>
                </div>
            </section>

            <section>
                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Tamaño de Logos</label>
                <div className="mb-3">
                    <label className="x-small text-muted mb-1 d-block">Logo Oasis: {formData.logoOasisSize}%</label>
                    <input type="range" min="10" max="100" 
                        value={formData.logoOasisSize || 40} 
                        onChange={e => set('logoOasisSize', parseInt(e.target.value))}
                        className="form-range" />
                </div>
                <div className="mb-3">
                    <label className="x-small text-muted mb-1 d-block">Redes Sociales: {formData.rrssSize || 28}px</label>
                    <input type="range" min="10" max="100" 
                        value={formData.rrssSize || 28} 
                        onChange={e => set('rrssSize', parseInt(e.target.value))}
                        className="form-range" />
                </div>
            </section>
        </div>
    );
};

export default BrandPanel;
