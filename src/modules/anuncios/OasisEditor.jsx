import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useOasisEditor } from './useOasisEditor';
import { useEditorStore } from './useEditorStore';
import { OASIS_LIBRARY } from './OasisAssets';

/**
 * OASIS EDITOR PRO: Componente Principal
 * Estética Liquid Glass con Ribbon y Panel de Capas.
 */
const OasisEditor = () => {
    const [activeTab, setActiveTab] = useState('inicio');
    const [canvasSize, setCanvasSize] = useState(OASIS_LIBRARY.canvasSizes[1]); // Default Square
    
    // Store de Zustand
    const { undo, redo, canUndo, canRedo } = useEditorStore();

    // Hook Maestro del Editor
    const { 
        canvas, selectedObject, layers, 
        loadFromJSON, exportHighRes, resizeCanvas,
        updateObjectProperty, alignObject, changeOrder,
        addText, addShape, addImageFromUrl, deleteSelected, duplicateSelected, setBackground
    } = useOasisEditor('oasis-pro-canvas', { width: 480, height: 480 });

    const [selectedCategory, setSelectedCategory] = useState('naturaleza');

    // Manejo de atajos de teclado
    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!canvas?.getActiveObject()?.isEditing) deleteSelected();
            }
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                duplicateSelected();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [canvas, deleteSelected, duplicateSelected]);

    // Efecto para manejar Undo/Redo desde el Store
    const handleUndo = () => {
        const prevState = undo();
        if (prevState) loadFromJSON(prevState);
    };

    const handleRedo = () => {
        const nextState = redo();
        if (nextState) loadFromJSON(nextState);
    };

    // Efecto de Redimensionamiento Proporcional
    const handleFormatChange = (size) => {
        setCanvasSize(size);
        const scale = Math.min(500 / size.width, 600 / size.height);
        resizeCanvas(size.width * scale, size.height * scale);
    };

    return (
        <div className="oasis-pro-editor light-theme">
            {/* 1. RIBBON PREMIUM */}
            <header className="oasis-ribbon">
                <div className="ribbon-main">
                    <div className="brand">
                        <div className="brand-dot" />
                        <span>OASIS DESIGN PRO</span>
                    </div>
                    
                    <nav className="ribbon-tabs">
                        {['Inicio', 'Insertar', 'Biblioteca', 'Formato'].map(tab => (
                            <button 
                                key={tab} 
                                className={`tab-btn ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>

                    <div className="history-actions">
                        <button disabled={!canUndo} onClick={handleUndo} className="icon-btn"><Lucide.Undo2 size={18} /></button>
                        <button disabled={!canRedo} onClick={handleRedo} className="icon-btn"><Lucide.Redo2 size={18} /></button>
                        <div className="divider" />
                        <button onClick={exportHighRes} className="btn-export">
                            <Lucide.Download size={16} /> <span>EXPORTAR HD</span>
                        </button>
                    </div>
                </div>

                <div className="ribbon-toolbar">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="toolbar-inner"
                        >
                            {activeTab === 'inicio' && (
                                <div className="tool-row">
                                    <div className="unit">
                                        <label>ALINEACIÓN</label>
                                        <div className="btns">
                                            <button className="glass-btn" onClick={() => alignObject('left')}><Lucide.AlignLeft size={16} /></button>
                                            <button className="glass-btn" onClick={() => alignObject('center')}><Lucide.AlignCenter size={16} /></button>
                                            <button className="glass-btn" onClick={() => alignObject('right')}><Lucide.AlignRight size={16} /></button>
                                            <div className="mini-divider" />
                                            <button className="glass-btn" onClick={() => alignObject('top')}><Lucide.AlignStartVertical size={16} /></button>
                                            <button className="glass-btn" onClick={() => alignObject('middle')}><Lucide.AlignCenterVertical size={16} /></button>
                                            <button className="glass-btn" onClick={() => alignObject('bottom')}><Lucide.AlignEndVertical size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="divider-v" />
                                    <div className="unit">
                                        <label>ORGANIZACIÓN</label>
                                        <div className="btns">
                                            <button className="glass-btn" onClick={() => changeOrder('front')}><Lucide.ChevronFirst size={16} className="rotate-90" /></button>
                                            <button className="glass-btn" onClick={() => changeOrder('back')}><Lucide.ChevronLast size={16} className="rotate-90" /></button>
                                            <button className="glass-btn danger" onClick={deleteSelected}><Lucide.Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'insertar' && (
                                <div className="tool-row">
                                    <div className="unit">
                                        <label>BÁSICOS</label>
                                        <div className="btns">
                                            <button className="glass-btn-text" onClick={() => addText()}><Lucide.Type size={16} /> <span>Texto</span></button>
                                            <button className="glass-btn-text" onClick={() => addShape('rect')}><Lucide.Square size={16} /> <span>Rect</span></button>
                                            <button className="glass-btn-text" onClick={() => addShape('circle')}><Lucide.Circle size={16} /> <span>Círculo</span></button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'biblioteca' && (
                                <div className="tool-row overflow-hidden">
                                    <div className="unit">
                                        <label>CATEGORÍA</label>
                                        <select className="glass-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                            {Object.keys(OASIS_LIBRARY.images).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                    <div className="divider-v" />
                                    <div className="image-strip-horizontal scroll-beauty">
                                        {OASIS_LIBRARY.images[selectedCategory].map((url, i) => (
                                            <button key={i} className="asset-card" onClick={() => setBackground(url)}>
                                                <img src={url} alt="asset" />
                                                <div className="overlay"><span>FONDO</span></div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'formato' && (
                                <div className="tool-row">
                                    <div className="unit">
                                        <label>FORMATOS SOCIALES</label>
                                        <div className="btns">
                                            {OASIS_LIBRARY.canvasSizes.map(size => (
                                                <button 
                                                    key={size.id} 
                                                    className={`glass-btn-text ${canvasSize.id === size.id ? 'active' : ''}`}
                                                    onClick={() => handleFormatChange(size)}
                                                >
                                                    <span>{size.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </header>

            {/* 2. AREA DE TRABAJO */}
            <main className="editor-workspace">
                <aside className="layers-panel glass">
                    <div className="panel-title">CAPAS Y ORDEN</div>
                    <div className="layers-list scroll-beauty">
                        {layers.map((obj, i) => (
                            <div 
                                key={i} 
                                className={`layer-item ${selectedObject === obj ? 'selected' : ''}`}
                                onClick={() => { canvas.setActiveObject(obj); canvas.requestRenderAll(); }}
                            >
                                <div className="layer-icon">
                                    {obj.type.includes('text') ? <Lucide.Type size={14} /> : <Lucide.Box size={14} />}
                                </div>
                                <span className="layer-name">{obj.id || obj.type}</span>
                                <div className="layer-actions">
                                    <Lucide.Eye size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="stage">
                    <motion.div 
                        layout
                        className="canvas-island shadow-2xl"
                    >
                        <canvas id="oasis-pro-canvas" />
                        <div className="canvas-label">OASIS VECTOR ENGINE 7.0</div>
                    </motion.div>
                </section>

                <aside className="properties-panel glass">
                    <div className="panel-title">PROPIEDADES</div>
                    {selectedObject ? (
                        <div className="props-content">
                            <div className="prop-unit">
                                <label>OPACIDAD</label>
                                <input 
                                    type="range" min="0" max="1" step="0.1" 
                                    value={selectedObject.opacity || 1}
                                    onChange={(e) => updateObjectProperty('opacity', parseFloat(e.target.value))}
                                />
                            </div>
                            
                            {selectedObject.type.includes('text') && (
                                <>
                                    <div className="prop-unit">
                                        <label>FUENTE</label>
                                        <select 
                                            className="glass-select-small"
                                            value={selectedObject.fontFamily}
                                            onChange={(e) => updateObjectProperty('fontFamily', e.target.value)}
                                        >
                                            {OASIS_LIBRARY.fonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="prop-unit">
                                        <label>TAMAÑO</label>
                                        <input 
                                            type="number" className="glass-input"
                                            value={selectedObject.fontSize}
                                            onChange={(e) => updateObjectProperty('fontSize', parseInt(e.target.value))}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="prop-unit">
                                <label>COLOR RELLENO</label>
                                <input 
                                    type="color" className="glass-color"
                                    value={selectedObject.fill}
                                    onChange={(e) => updateObjectProperty('fill', e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">Selecciona un objeto para editar</div>
                    )}
                </aside>
            </main>

            <style>{`
                .oasis-pro-editor {
                    height: 100vh; display: flex; flex-direction: column; background: #f4f7f9;
                    font-family: 'Outfit', sans-serif; overflow: hidden;
                }
                
                /* LIQUID GLASS RIBBON */
                .oasis-ribbon {
                    background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(40px);
                    border-bottom: 1px solid rgba(0,0,0,0.05); z-index: 100;
                }
                .ribbon-main { height: 60px; display: flex; align-items: center; padding: 0 30px; gap: 40px; }
                .brand { display: flex; align-items: center; gap: 10px; font-weight: 900; font-size: 0.8rem; letter-spacing: 2px; }
                .brand-dot { width: 10px; height: 10px; background: #f59e0b; border-radius: 50%; }
                
                .ribbon-tabs { display: flex; gap: 5px; }
                .tab-btn {
                    border: none; background: transparent; padding: 8px 20px; font-size: 0.8rem; font-weight: 700;
                    color: #64748b; cursor: pointer; border-radius: 20px; transition: 0.2s;
                }
                .tab-btn.active { background: rgba(0,0,0,0.05); color: #000; }
                
                .history-actions { margin-left: auto; display: flex; align-items: center; gap: 12px; }
                .btn-export {
                    background: #000; color: #fff; border: none; padding: 0 20px; height: 38px;
                    border-radius: 19px; font-weight: 800; font-size: 0.75rem; display: flex; align-items: center; gap: 8px; cursor: pointer;
                }
                .icon-btn { background: transparent; border: none; color: #64748b; cursor: pointer; }
                .icon-btn:disabled { opacity: 0.3; cursor: default; }

                .ribbon-toolbar { height: 90px; border-top: 1px solid rgba(0,0,0,0.02); padding: 0 30px; }
                .toolbar-inner { height: 100%; display: flex; align-items: center; }
                .tool-row { display: flex; align-items: center; gap: 30px; }
                .unit { display: flex; flex-direction: column; gap: 6px; }
                .unit label { font-size: 0.6rem; font-weight: 900; color: #94a3b8; letter-spacing: 1px; }
                .btns { display: flex; gap: 8px; }
                
                .glass-btn {
                    width: 38px; height: 38px; background: #fff; border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;
                }
                .glass-btn:hover { background: #f8fafc; transform: translateY(-2px); }
                .glass-btn.danger { color: #ef4444; }
                
                .glass-btn-text {
                    height: 38px; padding: 0 16px; background: #fff; border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer;
                }
                .glass-btn-text.active { border-color: #f59e0b; color: #f59e0b; }

                .glass-select {
                    background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px;
                    padding: 8px 12px; font-size: 0.8rem; font-weight: 700; outline: none;
                }

                .divider-v { width: 1px; height: 40px; background: rgba(0,0,0,0.05); }
                .mini-divider { width: 1px; height: 20px; background: rgba(0,0,0,0.05); align-self: center; }

                /* ASSETS STRIP */
                .image-strip-horizontal { display: flex; gap: 12px; overflow-x: auto; padding: 5px 0; }
                .asset-card {
                    width: 80px; height: 50px; border-radius: 8px; overflow: hidden; border: none; padding: 0; cursor: pointer; position: relative; flex-shrink: 0;
                }
                .asset-card img { width: 100%; height: 100%; object-fit: cover; }
                .asset-card .overlay {
                    position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
                    opacity: 0; transition: 0.3s;
                }
                .asset-card:hover .overlay { opacity: 1; }
                .overlay span { color: #fff; font-size: 0.5rem; font-weight: 900; }

                /* WORKSPACE */
                .editor-workspace { display: flex; flex-grow: 1; overflow: hidden; position: relative; }
                .layers-panel, .properties-panel {
                    width: 260px; background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(30px);
                    display: flex; flex-direction: column; z-index: 10;
                }
                .layers-panel { border-right: 1px solid rgba(0,0,0,0.05); }
                .properties-panel { border-left: 1px solid rgba(0,0,0,0.05); }

                .panel-title { padding: 25px 20px; font-size: 0.65rem; font-weight: 900; color: #94a3b8; letter-spacing: 1px; }
                .layers-list { flex-grow: 1; overflow-y: auto; padding: 0 15px; }
                .layer-item {
                    display: flex; align-items: center; gap: 12px; padding: 10px 15px; background: #fff;
                    border-radius: 10px; border: 1px solid rgba(0,0,0,0.03); margin-bottom: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer;
                }
                .layer-item.selected { border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
                .layer-icon { color: #f59e0b; }
                .layer-name { flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

                .stage { flex-grow: 1; display: flex; align-items: center; justify-content: center; background: #f0f3f5; position: relative; padding: 20px; }
                .canvas-island { background: #fff; padding: 12px; border-radius: 20px; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1); position: relative; }
                .canvas-label { position: absolute; top: -30px; right: 0; font-size: 0.6rem; font-weight: 900; color: #cbd5e1; }

                /* PROPERTIES */
                .props-content { padding: 0 20px; display: flex; flex-direction: column; gap: 20px; }
                .prop-unit { display: flex; flex-direction: column; gap: 8px; }
                .prop-unit label { font-size: 0.6rem; font-weight: 900; color: #94a3b8; }
                .glass-input {
                    background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 8px; padding: 8px; font-size: 0.8rem; font-weight: 700;
                }
                .glass-color {
                    width: 100%; height: 35px; border: 1px solid rgba(0,0,0,0.05); border-radius: 8px; cursor: pointer;
                }
                .no-selection { padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 0.8rem; font-weight: 600; font-style: italic; }

                .scroll-beauty::-webkit-scrollbar { width: 4px; height: 4px; }
                .scroll-beauty::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .rotate-90 { transform: rotate(90deg); }
            `}</style>
        </div>
    );
};

export default OasisEditor;
