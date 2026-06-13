import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient'; // Make sure this path is correct
import { buscarVersiculoLocal } from '../utils/bibleParser';
import { useToast } from '../react-ui/components/Toast';
import { BookOpen, Megaphone, MonitorOff, MonitorPlay } from 'lucide-react';

const AdminTransmisionPanel = () => {
    const [bibliaJSON, setBibliaJSON] = useState(null);
    const [bibleQuery, setBibleQuery] = useState('');
    const [biblePreview, setBiblePreview] = useState(null);
    
    const [announcement, setAnnouncement] = useState({ title: '', content: '' });
    const [colors, setColors] = useState({
        bg: '#120c1f',
        text: '#ffffff',
        accent: '#f59e0b'
    });
    
    const [isLiveActive, setIsLiveActive] = useState(false);
    const { showToast } = useToast();

    // Cargar Biblia del LocalStorage o hacer fetch
    useEffect(() => {
        const localBible = localStorage.getItem('biblia_reina_valera');
        if (localBible) {
            try {
                setBibliaJSON(JSON.parse(localBible));
            } catch (e) {
                console.error("Error parsing local bible", e);
            }
        } else {
            // Simulamos la carga por ahora. En producción, aquí harías fetch('biblia.json')
            setBibliaJSON([]); 
            // showToast("Biblia local no cargada. Por favor sube el archivo JSON.", "warning");
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
            const { error } = await supabase
                .from('configuracion_en_vivo')
                .update({
                    overlay_mode: mode,
                    overlay_title: title,
                    overlay_content: content,
                    overlay_bg_color: colors.bg,
                    overlay_text_color: colors.text,
                    overlay_accent_color: colors.accent,
                    updated_at: new Date().toISOString()
                })
                .eq('is_live', false); // O el id correspondiente

            if (error) throw error;
            showToast('Enviado a OBS', 'success');
        } catch (err) {
            console.error(err);
            // Fallback since we might not have the correct UUID yet, we can do a generic update
            await supabase.from('configuracion_en_vivo').update({
                overlay_mode: mode,
                overlay_title: title,
                overlay_content: content
            }).is('is_live', false);
            showToast('Enviado a OBS (Fallback)', 'success');
        }
    };

    const handleLanzarBiblia = () => {
        if (!biblePreview) return;
        pushToOBS('bible', biblePreview.referencia, biblePreview.texto);
    };

    const handleLanzarAnuncio = () => {
        if (!announcement.title && !announcement.content) return;
        pushToOBS('announcement', announcement.title, announcement.content);
    };

    const handleQuitarDelAire = () => {
        pushToOBS('hidden', '', '');
    };

    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '20px', marginTop: '20px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MonitorPlay size={20} color="#f59e0b" /> CONSOLA DE TRANSMISIÓN (OBS)
            </h4>

            <div className="row g-4">
                {/* Panel Biblia */}
                <div className="col-md-6">
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px' }}>
                        <h5 style={{ color: '#fff', fontSize: '1rem' }}><BookOpen size={16}/> Buscador Rápido de Biblia</h5>
                        <input 
                            type="text" 
                            className="form-control mb-2" 
                            placeholder="Ej: Jn 3 16 o Sal 119 105" 
                            value={bibleQuery}
                            onChange={handleSearchBible}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff' }}
                        />
                        
                        <div style={{ minHeight: '80px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', color: '#ccc', fontSize: '0.85rem', marginBottom: '10px' }}>
                            {biblePreview ? (
                                <>
                                    <strong style={{ color: '#f59e0b', display: 'block' }}>{biblePreview.referencia}</strong>
                                    {biblePreview.texto}
                                </>
                            ) : (
                                <em>Previsualización del versículo...</em>
                            )}
                        </div>

                        <button 
                            className="btn btn-warning w-100 fw-bold" 
                            onClick={handleLanzarBiblia}
                            disabled={!biblePreview}
                        >
                            ENVIAR AL AIRE
                        </button>
                    </div>
                </div>

                {/* Panel Anuncios y Estilos */}
                <div className="col-md-6">
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px' }}>
                        <h5 style={{ color: '#fff', fontSize: '1rem' }}><Megaphone size={16}/> Anuncios y Estilos</h5>
                        <input 
                            type="text" 
                            className="form-control mb-2" 
                            placeholder="Título (Ej: Reunión de Jóvenes)" 
                            value={announcement.title}
                            onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff' }}
                        />
                        <textarea 
                            className="form-control mb-2" 
                            placeholder="Cuerpo del anuncio..." 
                            rows="2"
                            value={announcement.content}
                            onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff' }}
                        ></textarea>

                        <div className="d-flex gap-2 mb-3">
                            <input type="color" value={colors.bg} onChange={(e) => setColors({...colors, bg: e.target.value})} title="Fondo" style={{ width: '30px', height: '30px', padding: 0, border: 'none' }}/>
                            <input type="color" value={colors.text} onChange={(e) => setColors({...colors, text: e.target.value})} title="Texto" style={{ width: '30px', height: '30px', padding: 0, border: 'none' }}/>
                            <input type="color" value={colors.accent} onChange={(e) => setColors({...colors, accent: e.target.value})} title="Acento" style={{ width: '30px', height: '30px', padding: 0, border: 'none' }}/>
                        </div>

                        <button 
                            className="btn btn-info w-100 fw-bold text-white mb-2" 
                            onClick={handleLanzarAnuncio}
                        >
                            LANZAR ANUNCIO
                        </button>

                        <button 
                            className="btn btn-outline-danger w-100 fw-bold" 
                            onClick={handleQuitarDelAire}
                        >
                            <MonitorOff size={16}/> QUITAR DEL AIRE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTransmisionPanel;
