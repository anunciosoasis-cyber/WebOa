import React from 'react';
import { FONTS } from './announcementPresets';

const TextPanel = ({ formData, set, selectedElementId, setSelectedElementId }) => {
    const target = selectedElementId || 'title';
    const isText = ['title', 'title2', 'title3', 'speaker', 'content', 'tag', 'location', 'date', 'time'].includes(target);

    return (
        <div className="text-panel d-flex flex-column gap-4">
            <section>
                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Propiedades de Texto</label>
                <div className="mb-3">
                    <label className="x-small text-muted mb-1 d-block">Fuente</label>
                    <select
                        className="form-select form-select-sm"
                        value={formData[`${target}Font`] || 'MoonRising'}
                        onChange={(e) => set(`${target}Font`, e.target.value)}
                    >
                        {FONTS.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="x-small text-muted mb-1 d-block">Tamaño: {formData[`${target}Size`]}</label>
                    <input type="range" min="0.1" max="5" step="0.1" 
                        value={formData[`${target}Size`] || 1} 
                        onChange={e => set(`${target}Size`, parseFloat(e.target.value))}
                        className="form-range" />
                </div>

                <div className="d-flex gap-2">
                    <button className={`btn btn-sm flex-grow-1 ${formData[`${target}Bold`] ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => set(`${target}Bold`, !formData[`${target}Bold`])}>
                        Negrita
                    </button>
                    <button className={`btn btn-sm flex-grow-1 ${formData[`${target}Italic`] ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => set(`${target}Italic`, !formData[`${target}Italic`])}>
                        Cursiva
                    </button>
                </div>
            </section>

            <section>
                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Color del Texto</label>
                <div className="d-flex gap-2 flex-wrap">
                    <input type="color" 
                        value={formData[`${target}Color`] || '#ffffff'} 
                        onChange={e => set(`${target}Color`, e.target.value)}
                        className="form-control form-control-sm p-1" style={{ width: '45px', height: '45px' }} />
                    {['#ffffff', '#f8f9fa', '#333333', '#5b2ea6', '#10b981', '#ef4444', '#f59e0b'].map(c => (
                        <div key={c} 
                            onClick={() => set(`${target}Color`, c)}
                            style={{ 
                                width: '22px', height: '22px', background: c, 
                                borderRadius: '4px', cursor: 'pointer',
                                border: formData[`${target}Color`] === c ? '2px solid #00d2f3' : '1px solid #dee2e6'
                            }} />
                    ))}
                </div>
            </section>

            <section>
                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Alineación</label>
                <div className="btn-group btn-group-sm w-100">
                    <button className={`btn ${formData[`${target}Align`] === 'left' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => set(`${target}Align`, 'left')}>
                        <i className="bi bi-text-left"></i>
                    </button>
                    <button className={`btn ${(!formData[`${target}Align`] || formData[`${target}Align`] === 'center') ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => set(`${target}Align`, 'center')}>
                        <i className="bi bi-text-center"></i>
                    </button>
                    <button className={`btn ${formData[`${target}Align`] === 'right' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => set(`${target}Align`, 'right')}>
                        <i className="bi bi-text-right"></i>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default TextPanel;
