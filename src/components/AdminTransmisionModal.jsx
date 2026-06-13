import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Megaphone, MonitorOff, MonitorPlay } from 'lucide-react';
import { supabase } from '../api/supabaseClient';
import { buscarVersiculoLocal } from '../utils/bibleParser';
import { useToast } from '../react-ui/components/Toast';

const AdminTransmisionModal = ({ onClose }) => {
    const [bibliaJSON, setBibliaJSON] = useState(null);
    const [bibleQuery, setBibleQuery] = useState('');
    const [biblePreview, setBiblePreview] = useState(null);
    
    const [announcement, setAnnouncement] = useState({ title: '', content: '' });
    const [colors, setColors] = useState({
        bg: 'rgba(18, 12, 31, 0.85)',
        text: '#ffffff',
        accent: '#f59e0b'
    });
    
    const { showToast } = useToast();

    // Cargar Biblia del LocalStorage
    useEffect(() => {
        const localBible = localStorage.getItem('biblia_reina_valera');
        if (localBible) {
            try { setBibliaJSON(JSON.parse(localBible)); } catch (e) { console.error(e); }
        } else {
            setBibliaJSON([]); 
        }
    }, []);

    const handleSearchBible = (e) => {
        const query = e.target.value;
        setBibleQuery(query);
        
        if (query.length > 3) {
            const result = buscarVersiculoLocal(query, bibliaJSON || []);
            if (!result.error) {
                setBiblePreview(result);
            } else {
                setBiblePreview(null);
            }
        } else {
            setBiblePreview(null);
        }
    };

    const pushToOBS = async (mode, title, content) => {
        try {
            await supabase.from('configuracion_en_vivo').update({
                overlay_mode: mode,
                overlay_title: title,
                overlay_content: content,
                overlay_bg_color: colors.bg,
                overlay_text_color: colors.text,
                overlay_accent_color: colors.accent,
                updated_at: new Date().toISOString()
            }).eq('is_live', false);
            showToast('Enviado a OBS', 'success');
        } catch (err) {
            console.error(err);
            showToast('Error al enviar a OBS', 'error');
        }
    };

    return createPortal(
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)' }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{ width: '100%', maxWidth: '900px', padding: '20px', maxHeight: '95vh', overflowY: 'auto' }}
            >
                <div style={{ 
                    background: 'rgba(20, 15, 35, 0.7)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '30px', 
                    padding: '40px', 
                    color: '#fff',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '4px' }}>
                                Studio en Vivo
                            </span>
                            <h2 style={{ fontFamily: 'Moonrising', fontSize: '1.8rem', margin: '5px 0 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MonitorPlay size={28} color="#F59E0B" /> CONSOLA OBS
                            </h2>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="row g-4">
                        {/* Buscador Bíblico */}
                        <div className="col-md-6">
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                                <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}><BookOpen size={18}/> Buscar en Biblia</h5>
                                <input 
                                    type="text" 
                                    className="form-control mb-4" 
                                    placeholder="Escribe 'jn 3 16'..." 
                                    value={bibleQuery}
                                    onChange={handleSearchBible}
                                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '15px', borderRadius: '12px' }}
                                />
                                
                                {/* Glassmorphism Preview */}
                                <div style={{ 
                                    minHeight: '120px', 
                                    background: 'url("https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=600&auto=format&fit=crop") center/cover',
                                    borderRadius: '16px', 
                                    position: 'relative',
                                    overflow: 'hidden',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                                    {biblePreview ? (
                                        <div style={{
                                            position: 'absolute', bottom: '15px', left: '15px', right: '15px',
                                            background: colors.bg,
                                            backdropFilter: 'blur(10px)',
                                            borderLeft: `6px solid ${colors.accent}`,
                                            padding: '15px',
                                            borderRadius: '0 12px 12px 0',
                                            color: colors.text
                                        }}>
                                            <h6 style={{ color: colors.accent, margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 900 }}>{biblePreview.referencia}</h6>
                                            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4, fontFamily: 'Georgia, serif' }}>{biblePreview.texto}</p>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                                            Previsualización del Overlay...
                                        </div>
                                    )}
                                </div>

                                <button 
                                    className="btn w-100 fw-bold p-3" 
                                    onClick={() => pushToOBS('bible', biblePreview?.referencia, biblePreview?.texto)}
                                    disabled={!biblePreview}
                                    style={{ background: biblePreview ? colors.accent : 'rgba(255,255,255,0.1)', color: biblePreview ? '#000' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '12px' }}
                                >
                                    ENVIAR VERSÍCULO A OBS
                                </button>
                            </div>
                        </div>

                        {/* Anuncios y Estilos */}
                        <div className="col-md-6">
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                                <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}><Megaphone size={18}/> Anuncio Libre</h5>
                                <input 
                                    type="text" 
                                    className="form-control mb-3" 
                                    placeholder="Título (Ej: Diezmos y Ofrendas)" 
                                    value={announcement.title}
                                    onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '12px' }}
                                />
                                <textarea 
                                    className="form-control mb-3" 
                                    placeholder="Cuerpo del texto..." 
                                    rows="2"
                                    value={announcement.content}
                                    onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '12px' }}
                                />

                                <div className="mb-4">
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Paleta de Colores de Salida</span>
                                    <div className="d-flex gap-3">
                                        <div className="d-flex flex-column align-items-center gap-1">
                                            <input type="color" value={colors.bg} onChange={(e) => setColors({...colors, bg: e.target.value})} style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}/>
                                            <span style={{ fontSize: '0.6rem', color: '#fff' }}>Fondo</span>
                                        </div>
                                        <div className="d-flex flex-column align-items-center gap-1">
                                            <input type="color" value={colors.text} onChange={(e) => setColors({...colors, text: e.target.value})} style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}/>
                                            <span style={{ fontSize: '0.6rem', color: '#fff' }}>Texto</span>
                                        </div>
                                        <div className="d-flex flex-column align-items-center gap-1">
                                            <input type="color" value={colors.accent} onChange={(e) => setColors({...colors, accent: e.target.value})} style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}/>
                                            <span style={{ fontSize: '0.6rem', color: '#fff' }}>Acento</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    className="btn w-100 fw-bold p-3 mb-3 text-white" 
                                    onClick={() => pushToOBS('announcement', announcement.title, announcement.content)}
                                    style={{ background: '#3B82F6', border: 'none', borderRadius: '12px' }}
                                >
                                    LANZAR ANUNCIO A OBS
                                </button>

                                <button 
                                    className="btn w-100 fw-bold p-3 d-flex align-items-center justify-content-center gap-2" 
                                    onClick={() => pushToOBS('hidden', '', '')}
                                    style={{ background: 'transparent', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}
                                >
                                    <MonitorOff size={18}/> QUITAR DEL AIRE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default AdminTransmisionModal;
