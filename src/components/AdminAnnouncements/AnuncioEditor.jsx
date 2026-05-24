import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useFabricEditor } from './useFabricEditor';
import FabricCanvas from './FabricCanvas';
import { TEMPLATES, FONTS } from './announcementPresets';

/**
 * ANUNCIO EDITOR V4 - VECTORIAL & LIQUID GLASS
 * Reemplaza al anterior AdminAnnouncements para ofrecer una experiencia tipo Canva.
 */
const AnuncioEditor = () => {
    const dimensions = { width: 400, height: 500 };
    const { canvas, selectedObject, applyTemplate, setFont } = useFabricEditor('oasis-vector-canvas', dimensions);
    const [activeTab, setActiveTab] = useState('inicio');
    const [isSaving, setIsSaving] = useState(false);

    // Cargar plantilla inicial
    useEffect(() => {
        if (canvas) applyTemplate(TEMPLATES[0]);
    }, [canvas]);

    return (
        <div className="editor-master-container">
            {/* 1. RIBBON MENU - FLUENT GLASS */}
            <nav className="fluent-ribbon shadow-sm">
                <div className="ribbon-tabs">
                    {['Inicio', 'Insertar', 'Diseño', 'Capas'].map(tab => (
                        <button 
                            key={tab} 
                            className={`tab-btn ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="flex-grow-1" />
                    <button className="btn-action primary" onClick={() => console.log('Publicar')}>
                        <Lucide.CloudUpload size={18} /> <span>PUBLICAR</span>
                    </button>
                </div>

                <div className="ribbon-tools">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="tools-inner"
                        >
                            {activeTab === 'inicio' && (
                                <div className="tool-group">
                                    <div className="tool-label">FUENTE</div>
                                    <select className="fluent-select" onChange={(e) => setFont(e.target.value)}>
                                        {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                    <div className="separator" />
                                    <button className="tool-btn"><Lucide.Bold size={16} /></button>
                                    <button className="tool-btn"><Lucide.Italic size={16} /></button>
                                    <div className="separator" />
                                    <input type="color" className="color-btn" />
                                </div>
                            )}
                            {activeTab === 'diseño' && (
                                <div className="tool-group">
                                    <div className="tool-label">PLANTILLAS OASIS</div>
                                    <div className="template-scroll">
                                        {TEMPLATES.map(tpl => (
                                            <button key={tpl.id} className="tpl-mini-btn" onClick={() => applyTemplate(tpl)}>
                                                <div className="tpl-preview" style={{ background: tpl.gradientStart }} />
                                                <span>{tpl.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </nav>

            {/* 2. WORKSPACE */}
            <main className="editor-workspace">
                <aside className="layers-panel fluent-glass">
                    <div className="panel-header">CAPAS</div>
                    <div className="layers-list">
                        {canvas?._objects.map((obj, i) => (
                            <div key={i} className="layer-item">
                                <Lucide.Type size={14} />
                                <span>{obj.id || 'Texto'}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="canvas-area">
                    <FabricCanvas canvasId="oasis-vector-canvas" dimensions={dimensions} />
                </section>
            </main>

            <style>{`
                .editor-master-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background: #1a1a1a;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                }

                /* FLUENT RIBBON */
                .fluent-ribbon {
                    background: rgba(45, 45, 45, 0.8);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    z-index: 100;
                }
                .ribbon-tabs {
                    display: flex;
                    padding: 0 20px;
                    height: 40px;
                    align-items: center;
                    background: rgba(0,0,0,0.2);
                }
                .tab-btn {
                    border: none;
                    background: transparent;
                    color: #aaa;
                    padding: 0 15px;
                    height: 100%;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                }
                .tab-btn.active {
                    color: #fff;
                    border-bottom-color: #F59E0B;
                }
                .ribbon-tools {
                    height: 80px;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                }
                .tools-inner { display: flex; gap: 20px; align-items: center; }
                .tool-group { display: flex; align-items: center; gap: 10px; }
                .tool-label { font-size: 0.6rem; font-weight: 800; color: #666; text-transform: uppercase; }

                /* WORKSPACE */
                .editor-workspace {
                    display: flex;
                    flex-grow: 1;
                    overflow: hidden;
                }
                .layers-panel {
                    width: 250px;
                    background: rgba(35, 35, 35, 0.6);
                    backdrop-filter: blur(15px);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                }
                .panel-header { padding: 15px; font-size: 0.7rem; font-weight: 800; color: #F59E0B; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .canvas-area {
                    flex-grow: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle, #2a2a2a 0%, #1a1a1a 100%);
                    position: relative;
                }

                /* UI ELEMENTS */
                .fluent-select {
                    background: #333;
                    border: 1px solid #444;
                    color: #fff;
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 0.75rem;
                }
                .btn-action {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    border-radius: 6px;
                    border: none;
                    font-weight: 700;
                    font-size: 0.75rem;
                    cursor: pointer;
                }
                .btn-action.primary { background: #F59E0B; color: #000; }
                .tpl-mini-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    background: transparent;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                }
                .tpl-preview { width: 50px; height: 40px; border-radius: 4px; border: 1px solid #555; }
                .template-scroll { display: flex; gap: 15px; overflow-x: auto; padding: 5px; }
                .layers-list { padding: 10px; }
                .layer-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    cursor: pointer;
                }
                .layer-item:hover { background: rgba(255,255,255,0.05); }
            `}</style>
        </div>
    );
};

export default AnuncioEditor;
