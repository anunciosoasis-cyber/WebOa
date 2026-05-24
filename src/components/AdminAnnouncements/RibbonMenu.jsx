import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';

/**
 * RIBBON MENU V3 - OASIS PREMIUM REFINED
 */
export const RibbonMenu = ({
    formData, set, setMany, activeRibbonTab, setActiveRibbonTab,
    selectedElementId, setSelectedElementId, handleDownloadPNG,
    handleSubmit, isSubmitting, isMobile, theme,
    applyTemplate, handleFileChange, fileInputRef,
    showForm, setShowForm, shapeMode, setShapeMode,
    TEMPLATES, FONTS, FORMATS
}) => {

    const target = selectedElementId || 'title';
    const isText = ['title', 'title2', 'title3', 'speaker', 'content', 'location'].includes(selectedElementId);
    const isLogo = selectedElementId?.toLowerCase().includes('logo') || selectedElementId === 'rrss';
    const isShape = selectedElementId?.startsWith('shape_');

    const selectedShape = isShape
        ? (formData.shapes || []).find(s => s.id === parseInt(selectedElementId.replace('shape_', '')))
        : null;

    const OASIS_COLORS = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        glassWhite: 'rgba(255, 255, 255, 0.03)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        textMain: '#FFFFFF',
        textMuted: 'rgba(255, 255, 255, 0.5)'
    };

    const RibbonIconButton = ({ icon: Icon, onClick, active, label, color }) => (
        <button
            onClick={onClick}
            className={`ribbon-icon-btn ${active ? 'active' : ''}`}
            title={label}
            style={color ? { color } : {}}
        >
            <Icon size={isMobile ? 18 : 20} strokeWidth={active ? 2.5 : 2} />
            {label && !isMobile && <span className="ms-1">{label}</span>}
        </button>
    );

    return (
        <div className="ribbon-master shadow-lg">
            {/* 1. NAVEGACIÓN DE TABS */}
            <div className="ribbon-tabs">
                <div className="tabs-group">
                    {['Inicio', 'Insertar', 'Diseño', 'Capas'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-link ${activeRibbonTab === tab.toLowerCase() ? 'active' : ''}`}
                            onClick={() => setActiveRibbonTab(tab.toLowerCase())}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="actions-group">
                    <button className="btn-save secondary" onClick={handleDownloadPNG}>
                        <Lucide.Download size={16} />
                    </button>
                    <button className={`btn-save primary ${isSubmitting ? 'loading' : ''}`} onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Lucide.RefreshCcw size={16} className="spin" /> : <Lucide.Send size={16} />}
                        {!isMobile && <span>PUBLICAR</span>}
                    </button>
                </div>
            </div>

            {/* 2. PANEL DE HERRAMIENTAS (DINÁMICO) */}
            <div className="ribbon-toolbar scrollbar-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${activeRibbonTab}-${selectedElementId}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="toolbar-inner"
                    >
                        {activeRibbonTab === 'inicio' && (
                            <>
                                {isText && (
                                    <div className="tool-section">
                                        <div className="tool-row">
                                            <select
                                                className="form-select-oasis font-select"
                                                value={formData[`${target}Font`] || 'MoonRising'}
                                                onChange={(e) => set(`${target}Font`, e.target.value)}
                                            >
                                                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                            </select>
                                            <div className="number-stepper">
                                                <button onClick={() => set(`${target}Size`, Math.max(0.1, (formData[`${target}Size`] || 1) - 0.1))}>-</button>
                                                <input type="text" readOnly value={Math.round((formData[`${target}Size`] || 1) * 10) / 10} />
                                                <button onClick={() => set(`${target}Size`, (formData[`${target}Size`] || 1) + 0.1)}>+</button>
                                            </div>
                                        </div>
                                        <div className="tool-row mt-1">
                                            <RibbonIconButton icon={Lucide.Bold} active={formData[`${target}Bold`]} onClick={() => set(`${target}Bold`, !formData[`${target}Bold`])} />
                                            <RibbonIconButton icon={Lucide.Italic} active={formData[`${target}Italic`]} onClick={() => set(`${target}Italic`, !formData[`${target}Italic`])} />
                                            <div className="v-separator" />
                                            <div className="color-picker-container">
                                                <input type="color" className="color-picker-mini" value={formData[`${target}Color`]} onChange={e => set(`${target}Color`, e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isShape && selectedShape && (
                                    <div className="tool-section">
                                        <div className="tool-row">
                                            <span className="small-label">COLOR</span>
                                            <input type="color" className="color-picker-mini" value={selectedShape.gradFrom} onChange={e => set('shapes', formData.shapes.map(s => s.id === selectedShape.id ? { ...s, gradFrom: e.target.value } : s))} />
                                            <div className="v-separator" />
                                            <Lucide.Box size={14} style={{ color: OASIS_COLORS.textMuted }} />
                                            <input type="range" min="0" max="100" className="oasis-slider" value={selectedShape.radius} onChange={e => set('shapes', formData.shapes.map(s => s.id === selectedShape.id ? { ...s, radius: parseInt(e.target.value) } : s))} />
                                        </div>
                                        <div className="tool-row mt-1">
                                            <button className="btn-delete" onClick={() => set('shapes', formData.shapes.filter(s => s.id !== selectedShape.id))}>
                                                <Lucide.Trash2 size={14} /> ELIMINAR FORMA
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!selectedElementId && (
                                    <div className="tool-section empty-state">
                                        <Lucide.MousePointer2 size={16} color={OASIS_COLORS.accent} />
                                        <span>Selecciona un elemento para editarlo</span>
                                    </div>
                                )}
                            </>
                        )}

                        {activeRibbonTab === 'insertar' && (
                            <div className="tool-section">
                                <div className="tool-row gap-3">
                                    <button className={`btn-insert ${shapeMode ? 'active' : ''}`} onClick={() => setShapeMode(!shapeMode)}>
                                        <Lucide.PlusSquare size={18} /> <span>FORMA</span>
                                    </button>
                                    <button className="btn-insert" onClick={() => fileInputRef.current.click()}>
                                        <Lucide.ImagePlus size={18} /> <span>IMAGEN</span>
                                    </button>
                                    <div className="v-separator" />
                                    <button className="btn-insert" onClick={() => setSelectedElementId('title')}>
                                        <Lucide.Type size={18} /> <span>TEXTO</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <style>{`
                .ribbon-master { width: 100%; background: ${OASIS_COLORS.deepPurple}; border-bottom: 1px solid ${OASIS_COLORS.glassBorder}; font-family: 'Inter', sans-serif; z-index: 100; }
                
                .ribbon-tabs { height: 42px; display: flex; justify-content: space-between; align-items: center; background: ${OASIS_COLORS.midnight}; padding: 0 15px; }
                .tabs-group { display: flex; gap: 5px; height: 100%; }
                .tab-link { border: none; background: transparent; padding: 0 16px; font-size: 0.75rem; font-weight: 700; color: ${OASIS_COLORS.textMuted}; cursor: pointer; border-bottom: 3px solid transparent; transition: 0.2s; }
                .tab-link.active { color: ${OASIS_COLORS.accent}; border-bottom-color: ${OASIS_COLORS.accent}; background: ${OASIS_COLORS.deepPurple}; }
                
                .ribbon-toolbar { height: 95px; padding: 10px 20px; display: flex; align-items: center; overflow-x: auto; background: ${OASIS_COLORS.deepPurple}; }
                .toolbar-inner { display: flex; align-items: center; height: 100%; gap: 20px; }
                
                .tool-section { display: flex; flex-direction: column; gap: 8px; padding-right: 20px; border-right: 1px solid ${OASIS_COLORS.glassBorder}; height: 100%; justify-content: center; }
                .tool-row { display: flex; align-items: center; gap: 10px; }
                
                .ribbon-icon-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid ${OASIS_COLORS.glassBorder}; background: ${OASIS_COLORS.glassWhite}; color: ${OASIS_COLORS.textMuted}; cursor: pointer; transition: 0.2s; }
                .ribbon-icon-btn:hover { background: ${OASIS_COLORS.glassBorder}; color: #fff; }
                .ribbon-icon-btn.active { background: ${OASIS_COLORS.accent}15; color: ${OASIS_COLORS.accent}; border-color: ${OASIS_COLORS.accent}; }
                
                .btn-insert { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; border: 1px solid ${OASIS_COLORS.glassBorder}; background: ${OASIS_COLORS.glassWhite}; font-size: 0.7rem; font-weight: 800; cursor: pointer; color: ${OASIS_COLORS.textMuted}; transition: 0.3s; }
                .btn-insert:hover { background: ${OASIS_COLORS.glassBorder}; border-color: ${OASIS_COLORS.accent}; color: ${OASIS_COLORS.accent}; }
                .btn-insert.active { background: ${OASIS_COLORS.accent}; color: ${OASIS_COLORS.midnight}; }

                .actions-group { display: flex; gap: 10px; }
                .btn-save { border: none; border-radius: 10px; padding: 8px 16px; font-weight: 900; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                .btn-save.primary { background: ${OASIS_COLORS.accent}; color: ${OASIS_COLORS.midnight}; box-shadow: 0 4px 12px ${OASIS_COLORS.accent}44; }
                .btn-save.secondary { background: ${OASIS_COLORS.glassWhite}; color: #fff; border: 1px solid ${OASIS_COLORS.glassBorder}; }
                
                .form-select-oasis { height: 34px; border-radius: 8px; border: 1px solid ${OASIS_COLORS.glassBorder}; background: ${OASIS_COLORS.glassWhite}; padding: 0 10px; font-size: 0.75rem; font-weight: 600; color: #fff; outline: none; }
                .font-select { width: 140px; }
                
                .number-stepper { display: flex; border: 1px solid ${OASIS_COLORS.glassBorder}; border-radius: 8px; overflow: hidden; background: ${OASIS_COLORS.glassWhite}; height: 34px; }
                .number-stepper button { width: 30px; border: none; background: rgba(255,255,255,0.05); font-weight: bold; cursor: pointer; color: #fff; }
                .number-stepper input { width: 45px; text-align: center; border: none; font-size: 0.75rem; font-weight: 800; color: #fff; background: transparent; }
                
                .color-picker-mini { width: 34px; height: 34px; padding: 0; border: 2px solid ${OASIS_COLORS.glassBorder}; border-radius: 8px; cursor: pointer; background: transparent; }
                
                .v-separator { width: 1px; height: 24px; background: ${OASIS_COLORS.glassBorder}; margin: 0 5px; }
                .empty-state { border-right: none; color: ${OASIS_COLORS.textMuted}; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 10px; }
                
                .btn-delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 6px 12px; border-radius: 8px; font-size: 0.6rem; font-weight: 800; cursor: pointer; transition: 0.2s; }
                .btn-delete:hover { background: #ef4444; color: #fff; }
                
                .small-label { font-size: 0.6rem; font-weight: 900; color: ${OASIS_COLORS.accent}; text-transform: uppercase; }
                
                .oasis-slider { appearance: none; height: 4px; background: ${OASIS_COLORS.glassBorder}; border-radius: 2px; outline: none; width: 80px; }
                .oasis-slider::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; border-radius: 50%; background: ${OASIS_COLORS.accent}; cursor: pointer; }

                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .scrollbar-hidden::-webkit-scrollbar { display: none; }

                @media (max-width: 768px) {
                    .tool-section { border-right: none; padding-right: 10px; }
                    .tab-link { padding: 0 12px; font-size: 0.7rem; }
                    .btn-save span { display: none; }
                }
            `}</style>
        </div>
    );
};

export default RibbonMenu;