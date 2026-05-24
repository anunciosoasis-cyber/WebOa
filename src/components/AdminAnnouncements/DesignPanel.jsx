import React from 'react';
import { TEMPLATES, STOCK_CATEGORIES } from './announcementPresets';

const DesignPanel = ({ formData, set, setMany, applyTemplate, setShowLibrary }) => {
    return (
        <div className="design-panel d-flex flex-column gap-4">
            {/* Templates Section */}
            <section>
                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Plantillas</label>
                <div className="row g-2">
                    {TEMPLATES.map(tpl => (
                        <div key={tpl.id} className="col-6">
                            <div className="tpl-card rounded-3 cursor-pointer overflow-hidden border shadow-sm hover-scale"
                                onClick={() => applyTemplate(tpl)}
                                style={{ 
                                    height: '80px', 
                                    background: `linear-gradient(135deg, ${tpl.gradientStart}, ${tpl.gradientEnd})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '8px',
                                    color: tpl.titleColor || '#fff',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>
                                {tpl.name}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Background Settings */}
            <section>
                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Fondo de Color</label>
                <div className="d-flex gap-2 align-items-center mb-3">
                    <input type="color" 
                        value={formData.gradientStart} 
                        onChange={e => set('gradientStart', e.target.value)}
                        className="form-control form-control-sm p-1" style={{ width: '45px', height: '35px' }} />
                    <i className="bi bi-arrow-right text-muted"></i>
                    <input type="color" 
                        value={formData.gradientEnd} 
                        onChange={e => set('gradientEnd', e.target.value)}
                        className="form-control form-control-sm p-1" style={{ width: '45px', height: '35px' }} />
                </div>

                <div className="mb-3">
                    <label className="x-small text-muted mb-1 d-block">Ángulo: {formData.bgGradAngle || 135}°</label>
                    <input type="range" min="0" max="360" 
                        value={formData.bgGradAngle || 135} 
                        onChange={e => set('bgGradAngle', parseInt(e.target.value))}
                        className="form-range" />
                </div>
            </section>

            {/* Background Texture/Image */}
            <section>
                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Textura y Opacidad</label>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-droplet-half text-muted"></i>
                    <input type="range" min="0" max="1" step="0.1" 
                        value={formData.bgOpacity || 0.55} 
                        onChange={e => set('bgOpacity', parseFloat(e.target.value))}
                        className="form-range flex-grow-1" />
                    <span className="x-small fw-bold">{Math.round((formData.bgOpacity || 0.55) * 100)}%</span>
                </div>
            </section>

            <button className="btn btn-outline-primary btn-sm w-100 mt-2" onClick={() => setShowLibrary(true)}>
                <i className="bi bi-images me-2"></i> Explorar Biblioteca
            </button>
        </div>
    );
};

export default DesignPanel;
