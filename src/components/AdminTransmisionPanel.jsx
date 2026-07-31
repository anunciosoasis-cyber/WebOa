import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { buscarVersiculoLocal } from '../utils/bibleParser';
import { useToast } from '../react-ui/components/Toast';
import { BookOpen, Megaphone, MonitorOff, MonitorPlay, Play, Pause, SkipBack, SkipForward, Eye, Projector } from 'lucide-react';

const AdminTransmisionPanel = () => {
    const { showToast } = useToast();
    
    // Estado de colores (mismo que ObsController)
    const [colors, setColors] = useState({ 
        bg: 'rgba(18, 12, 31, 0.85)', 
        text: '#ffffff', 
        accent: '#f59e0b' 
    });
    
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
    const [timer, setTimer] = useState('5:00');
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [activeTab, setActiveTab] = useState('biblia');
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

    const [obsChannel, setObsChannel] = useState(null);

    // Conectar al canal Realtime de Supabase (mismo que ObsController)
    useEffect(() => {
        const channel = supabase.channel('broadcasting');
        channel.on('broadcast', { event: 'update_overlay' }, (payload) => {
            console.log('Overlay update received:', payload.payload);
        })
        .subscribe();
        setObsChannel(channel);
        return () => supabase.removeChannel(channel);
    }, []);

    const pushToOBS = async (mode, title, content, extra = {}) => {
        try {
            const payload = {
                mode,
                title,
                content,
                template: extra.template || 'classic',
                subText: extra.subText || '',
                bg_color: colors.bg,
                text_color: colors.text,
                accent_color: colors.accent,
                ...extra
            };
            
            // 1. Guardar en localStorage (para persistencia)
            localStorage.setItem('obs_overlay_data', JSON.stringify(payload));
            
            // 2. Enviar por canal Realtime (para comunicación en tiempo real)
            if (obsChannel) {
                await obsChannel.send({
                    type: 'broadcast',
                    event: 'update_overlay',
                    payload
                });
            }
            
            showToast('Enviado al aire', 'success');
        } catch (err) {
            console.error('Error sending to OBS:', err);
            showToast('Error de conexión', 'error');
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
        <div style={{ marginTop: '20px' }}>
            {/* Header - Exactly like mockup */}
            <div style={{
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div>
                    <p style={{ color: '#999', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '1px', margin: '0 0 4px 0' }}>
                        PRODUCCIÓN EN TIEMPO REAL
                    </p>
                    <h3 style={{ color: '#111', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>
                        ESTUDIO<br/><span style={{ color: '#f59e0b' }}>OASIS</span>
                    </h3>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '0.75rem', margin: '0 0 4px 0' }}>YOUTUBE STUDIO</p>
                    <p style={{ color: '#111', fontSize: '1rem', fontWeight: '600', margin: 0 }}>26 25/07/2026</p>
                </div>
                <button style={{
                    background: '#ef4444',
                    color: 'white',
                    fontWeight: '700',
                    padding: '8px 20px',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                }}>
                    CONECTAR
                </button>
            </div>

            {/* Main Grid: 2x2 + Right Sidebar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '16px' }}>

                {/* ROW 1 */}
                {/* REGULACIÓN (TOP LEFT) */}
                <div style={{
                    background: '#f9f9f9',
                    border: '1px solid #e5e5e5',
                    borderRadius: '14px',
                    padding: '16px',
                    minHeight: '240px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        background: '#333',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                        marginBottom: '12px',
                        width: 'fit-content'
                    }}>
                        REGULACIÓN
                    </div>
                    <div style={{ flex: 1, background: '#1a1a1a', borderRadius: '8px' }}></div>
                </div>

                {/* TRANSMISIÓN DIRECTA (TOP CENTER) */}
                <div style={{
                    background: '#f9f9f9',
                    border: '1px solid #e5e5e5',
                    borderRadius: '14px',
                    padding: '16px',
                    minHeight: '240px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        background: '#333',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                        marginBottom: '12px',
                        width: 'fit-content'
                    }}>
                        TRANSMISIÓN DIRECTA
                    </div>
                    <div style={{ flex: 1, background: '#1a1a1a', borderRadius: '8px', marginBottom: '8px' }}></div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem' }}>
                        <span style={{ background: '#e0e0e0', color: '#666', padding: '3px 8px', borderRadius: '3px' }}>VIS CRS</span>
                        <span style={{ background: '#e0e0e0', color: '#666', padding: '3px 8px', borderRadius: '3px' }}>PROYECTOR</span>
                    </div>
                </div>

                {/* CONTADOR (RIGHT, SPANS 2 ROWS) */}
                <div style={{
                    background: '#fffbf0',
                    border: '2px solid #f59e0b',
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    gridRow: '1 / 3'
                }}>
                    <h6 style={{ color: '#999', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '1px', margin: 0 }}>
                        CONTADOR
                    </h6>
                    <div style={{
                        width: '140px',
                        height: '140px',
                        background: '#f59e0b',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: '700',
                        color: 'white',
                        boxShadow: '0 6px 20px rgba(245,158,11,0.3)'
                    }}>
                        {timer}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button style={{
                            background: '#333',
                            color: '#fff',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            ◀
                        </button>
                        <button style={{
                            background: '#f59e0b',
                            color: '#000',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700'
                        }}>
                            ▶
                        </button>
                        <button style={{
                            background: '#333',
                            color: '#fff',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            ▶▶
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button style={{
                            background: '#22c55e',
                            color: '#fff',
                            border: 'none',
                            flex: 1,
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '0.7rem',
                            padding: '8px',
                            cursor: 'pointer'
                        }}>
                            VISUAL DEMO
                        </button>
                        <button style={{
                            background: '#f59e0b',
                            color: '#000',
                            border: 'none',
                            flex: 1,
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '0.7rem',
                            padding: '8px',
                            cursor: 'pointer'
                        }}>
                            PROYECTOR
                        </button>
                    </div>
                </div>

                {/* ROW 2 */}
                {/* CONTENIDO (BOTTOM LEFT) */}
                <div style={{
                    background: '#f9f9f9',
                    border: '1px solid #e5e5e5',
                    borderRadius: '14px',
                    padding: '16px'
                }}>
                    <div style={{
                        background: '#333',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                        marginBottom: '12px',
                        width: 'fit-content'
                    }}>
                        CONTENIDO
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
                        <button 
                            onClick={() => setActiveTab('biblia')}
                            style={{
                                background: activeTab === 'biblia' ? '#f59e0b' : '#fff',
                                color: activeTab === 'biblia' ? '#fff' : '#999',
                                border: activeTab === 'biblia' ? 'none' : '1px solid #e0e0e0',
                                padding: '5px 12px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            BIBLIA
                        </button>
                        <button 
                            onClick={() => setActiveTab('himnario')}
                            style={{
                                background: activeTab === 'himnario' ? '#f59e0b' : '#fff',
                                color: activeTab === 'himnario' ? '#fff' : '#999',
                                border: activeTab === 'himnario' ? 'none' : '1px solid #e0e0e0',
                                padding: '5px 12px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            HIMNARIO
                        </button>
                    </div>

                    {activeTab === 'biblia' ? (
                        <div>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                <button style={{
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer'
                                }}>LADO</button>
                                <button style={{
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer'
                                }}>CAP</button>
                                <button style={{
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer'
                                }}>VER</button>
                                <button style={{
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer',
                                    marginLeft: 'auto'
                                }}>▶</button>
                                <button style={{
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer'
                                }}>◀</button>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Buscar versículo" 
                                value={bibleQuery}
                                onChange={handleSearchBible}
                                style={{
                                    width: '100%',
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    color: '#333',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    padding: '8px',
                                    marginBottom: '8px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{
                                background: '#1a1a1a',
                                padding: '8px',
                                borderRadius: '6px',
                                minHeight: '80px',
                                color: '#ccc',
                                fontSize: '0.7rem',
                                lineHeight: '1.4',
                                marginBottom: '8px'
                            }}>
                                {biblePreview ? (
                                    <>
                                        <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '4px' }}>{biblePreview.referencia}</strong>
                                        {biblePreview.texto}
                                    </>
                                ) : (
                                    <em>Previsualización...</em>
                                )}
                            </div>
                            <button 
                                onClick={handleLanzarBiblia}
                                disabled={!biblePreview}
                                style={{
                                    background: '#f59e0b',
                                    color: '#000',
                                    fontWeight: '600',
                                    border: 'none',
                                    borderRadius: '6px',
                                    width: '100%',
                                    padding: '8px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    opacity: biblePreview ? 1 : 0.5
                                }}
                            >
                                ENVIAR AL AIRE
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                <button style={{
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer'
                                }}>LADO</button>
                                <button style={{
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer'
                                }}>CAP</button>
                                <button style={{
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer'
                                }}>VER</button>
                            </div>
                            <div style={{
                                background: '#1a1a1a',
                                padding: '8px',
                                borderRadius: '6px',
                                minHeight: '90px',
                                marginBottom: '8px'
                            }}></div>
                            <button style={{
                                background: '#f59e0b',
                                color: '#000',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '6px',
                                width: '100%',
                                padding: '8px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }}>
                                ENVIAR AL AIRE
                            </button>
                        </div>
                    )}
                </div>

                {/* BANNERS (BOTTOM CENTER) */}
                <div style={{
                    background: '#f9f9f9',
                    border: '1px solid #e5e5e5',
                    borderRadius: '14px',
                    padding: '16px'
                }}>
                    <div style={{
                        background: '#333',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                        marginBottom: '12px',
                        width: 'fit-content'
                    }}>
                        BANNERS
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {/* Banner 1 */}
                        <div style={{
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '10px'
                        }}>
                            <div style={{
                                background: '#f59e0b',
                                color: '#fff',
                                padding: '3px 8px',
                                borderRadius: '3px',
                                fontSize: '0.6rem',
                                fontWeight: '600',
                                marginBottom: '6px',
                                width: 'fit-content'
                            }}>
                                PREDICADOR
                            </div>
                            <p style={{ color: '#999', fontSize: '0.65rem', margin: 0 }}>
                                Selecciona predicador
                            </p>
                        </div>

                        {/* Banner 2 */}
                        <div style={{
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '10px'
                        }}>
                            <div style={{
                                background: '#f59e0b',
                                color: '#fff',
                                padding: '3px 8px',
                                borderRadius: '3px',
                                fontSize: '0.6rem',
                                fontWeight: '600',
                                marginBottom: '6px',
                                width: 'fit-content'
                            }}>
                                PREDICADOR
                            </div>
                            <p style={{ color: '#999', fontSize: '0.65rem', margin: 0 }}>
                                Selecciona predicador
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTransmisionPanel;
