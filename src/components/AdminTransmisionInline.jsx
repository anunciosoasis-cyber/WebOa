import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { useToast } from '../react-ui/components/Toast';
import { MonitorPlay, MonitorOff, BookOpen, Megaphone, ExternalLink, ChevronLeft, ChevronRight, User, LayoutTemplate, PanelBottom, PanelRight, Film, Timer } from 'lucide-react';

const BIBLE_BOOKS = [
  { id: 1, name: "Génesis", chapters: 50 }, { id: 2, name: "Éxodo", chapters: 40 },
  { id: 3, name: "Levítico", chapters: 27 }, { id: 4, name: "Números", chapters: 36 },
  { id: 5, name: "Deuteronomio", chapters: 34 }, { id: 6, name: "Josué", chapters: 24 },
  { id: 7, name: "Jueces", chapters: 21 }, { id: 8, name: "Rut", chapters: 4 },
  { id: 9, name: "1 Samuel", chapters: 31 }, { id: 10, name: "2 Samuel", chapters: 24 },
  { id: 11, name: "1 Reyes", chapters: 22 }, { id: 12, name: "2 Reyes", chapters: 25 },
  { id: 13, name: "1 Crónicas", chapters: 29 }, { id: 14, name: "2 Crónicas", chapters: 36 },
  { id: 15, name: "Esdras", chapters: 10 }, { id: 16, name: "Nehemías", chapters: 13 },
  { id: 17, name: "Ester", chapters: 10 }, { id: 18, name: "Job", chapters: 42 },
  { id: 19, name: "Salmos", chapters: 150 }, { id: 20, name: "Proverbios", chapters: 31 },
  { id: 21, name: "Eclesiastés", chapters: 12 }, { id: 22, name: "Cantares", chapters: 8 },
  { id: 23, name: "Isaías", chapters: 66 }, { id: 24, name: "Jeremías", chapters: 52 },
  { id: 25, name: "Lamentaciones", chapters: 5 }, { id: 26, name: "Ezequiel", chapters: 48 },
  { id: 27, name: "Daniel", chapters: 12 }, { id: 28, name: "Oseas", chapters: 14 },
  { id: 29, name: "Joel", chapters: 3 }, { id: 30, name: "Amós", chapters: 9 },
  { id: 31, name: "Abdías", chapters: 1 }, { id: 32, name: "Jonás", chapters: 4 },
  { id: 33, name: "Miqueas", chapters: 7 }, { id: 34, name: "Nahúm", chapters: 3 },
  { id: 35, name: "Habacuc", chapters: 3 }, { id: 36, name: "Sofonías", chapters: 3 },
  { id: 37, name: "Hageo", chapters: 2 }, { id: 38, name: "Zacarías", chapters: 14 },
  { id: 39, name: "Malaquías", chapters: 4 }, { id: 40, name: "Mateo", chapters: 28 },
  { id: 41, name: "Marcos", chapters: 16 }, { id: 42, name: "Lucas", chapters: 24 },
  { id: 43, name: "Juan", chapters: 21 }, { id: 44, name: "Hechos", chapters: 28 },
  { id: 45, name: "Romanos", chapters: 16 }, { id: 46, name: "1 Corintios", chapters: 16 },
  { id: 47, name: "2 Corintios", chapters: 13 }, { id: 48, name: "Gálatas", chapters: 6 },
  { id: 49, name: "Efesios", chapters: 6 }, { id: 50, name: "Filipenses", chapters: 4 },
  { id: 51, name: "Colosenses", chapters: 4 }, { id: 52, name: "1 Tesalonicenses", chapters: 5 },
  { id: 53, name: "2 Tesalonicenses", chapters: 3 }, { id: 54, name: "1 Timoteo", chapters: 6 },
  { id: 55, name: "2 Timoteo", chapters: 4 }, { id: 56, name: "Tito", chapters: 3 },
  { id: 57, name: "Filemón", chapters: 1 }, { id: 58, name: "Hebreos", chapters: 13 },
  { id: 59, name: "Santiago", chapters: 5 }, { id: 60, name: "1 Pedro", chapters: 5 },
  { id: 61, name: "2 Pedro", chapters: 3 }, { id: 62, name: "1 Juan", chapters: 5 },
  { id: 63, name: "2 Juan", chapters: 1 }, { id: 64, name: "3 Juan", chapters: 1 },
  { id: 65, name: "Judas", chapters: 1 }, { id: 66, name: "Apocalipsis", chapters: 22 }
];

const AdminTransmisionInline = ({ currentActivity, timeMetrics, serviceStartTime }) => {
    const { showToast } = useToast();
    
    // Bible State
    const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS[42]); // Juan
    const [selectedChapter, setSelectedChapter] = useState(3);
    const [verses, setVerses] = useState([]);
    const [selectedVerseObj, setSelectedVerseObj] = useState(null);
    const [isLoadingVerses, setIsLoadingVerses] = useState(false);
    const [isBibleLive, setIsBibleLive] = useState(false);
    const [bibleTemplate, setBibleTemplate] = useState('classic');
    const [countdownTemplate, setCountdownTemplate] = useState('glass_center');

    // Announcement State
    const [announcement, setAnnouncement] = useState({ title: '', content: '' });

    // Preacher State
    const [preacher, setPreacher] = useState({ name: '', title: '' });

    // Styles
    const [colors, setColors] = useState({
        bg: 'rgba(18, 12, 31, 0.85)',
        text: '#ffffff',
        accent: '#f59e0b'
    });

    // Fetch Verses when Book/Chapter changes
    useEffect(() => {
        const fetchChapter = async () => {
            setIsLoadingVerses(true);
            try {
                // RV1960 using Bolls Life open API
                const response = await fetch(`https://bolls.life/get-chapter/RV1960/${selectedBook.id}/${selectedChapter}/`);
                const data = await response.json();
                setVerses(data);
                setSelectedVerseObj(data[0] || null); // Selecciona el primero por defecto
            } catch (err) {
                console.error(err);
                showToast("Error cargando versículos. Comprueba tu conexión.", "error");
            } finally {
                setIsLoadingVerses(false);
            }
        };
        fetchChapter();
    }, [selectedBook, selectedChapter]);

    const handleVerseChange = (e) => {
        const v = verses.find(ver => ver.verse === parseInt(e.target.value));
        setSelectedVerseObj(v);
    };

    const currentVerseIndex = verses.findIndex(v => v.verse === selectedVerseObj?.verse);
    const canGoPrev = currentVerseIndex > 0;
    const canGoNext = currentVerseIndex >= 0 && currentVerseIndex < verses.length - 1;

    const handlePrevVerse = () => {
        if (canGoPrev) {
            const newVerse = verses[currentVerseIndex - 1];
            setSelectedVerseObj(newVerse);
            if (isBibleLive) {
                pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${newVerse.verse}`, newVerse.text, { template: bibleTemplate });
            }
        }
    };

    const handleNextVerse = () => {
        if (canGoNext) {
            const newVerse = verses[currentVerseIndex + 1];
            setSelectedVerseObj(newVerse);
            if (isBibleLive) {
                pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${newVerse.verse}`, newVerse.text, { template: bibleTemplate });
            }
        }
    };

    const handleTemplateChange = (tmpl) => {
        setBibleTemplate(tmpl);
        // Auto-actualizar OBS si está en vivo
        if (isBibleLive && selectedVerseObj) {
            pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${selectedVerseObj.verse}`, selectedVerseObj.text, { template: tmpl });
        }
    };

    // Supabase Channel for Broadcast
    const [obsChannel, setObsChannel] = useState(null);

    useEffect(() => {
        const channel = supabase.channel('obs_public_channel');
        
        channel.on('broadcast', { event: 'request_sync' }, async () => {
            // Cuando OBS se conecta o recarga, le enviamos el último estado
            const lastData = localStorage.getItem('obs_overlay_data');
            if (lastData) {
                await channel.send({
                    type: 'broadcast',
                    event: 'update_overlay',
                    payload: JSON.parse(lastData)
                });
            }
        }).subscribe();
        
        setObsChannel(channel);
        return () => supabase.removeChannel(channel);
    }, []);

    const pushToOBS = async (mode, title, content, extra = {}) => {
        try {
            const payload = {
                mode: mode,
                title: title,
                content: content,
                template: extra.template || 'classic',
                targetTime: extra.targetTime || null,
                isOvertime: extra.isOvertime || false,
                bg_color: colors.bg,
                text_color: colors.text,
                accent_color: colors.accent
            };
            
            // Fallback local storage
            localStorage.setItem('obs_overlay_data', JSON.stringify(payload));

            // Enviar Broadcast por Supabase (no requiere tabla SQL)
            if (obsChannel) {
                await obsChannel.send({
                    type: 'broadcast',
                    event: 'update_overlay',
                    payload: payload
                });
                showToast('Enviado al aire exitosamente', 'success');
            } else {
                showToast('Canal no listo. Intenta de nuevo.', 'warning');
            }
        } catch (err) {
            console.error(err);
            showToast('Error de conexión', 'error');
        }
    };

    const openOBSWindow = () => {
        window.open('/transmision/overlay', 'OBS_WINDOW', 'width=1920,height=1080,menubar=no,toolbar=no,location=no');
    };

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, rgba(20, 15, 35, 0.8) 0%, rgba(10, 8, 20, 0.95) 100%)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '24px', 
            padding: '30px', 
            marginTop: '30px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)'
        }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                    <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '4px' }}>
                        Studio en Vivo
                    </span>
                    <h4 style={{ color: '#fff', fontSize: '1.4rem', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Moonrising, sans-serif' }}>
                        <MonitorPlay size={24} color="#f59e0b" /> CONSOLA OBS
                    </h4>
                </div>
                <button 
                    onClick={openOBSWindow}
                    className="btn d-flex align-items-center gap-2 fw-bold px-4 py-2"
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '50px', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                >
                    <ExternalLink size={18} /> ABRIR OVERLAY WEB (OBS)
                </button>
            </div>

            <div className="row g-4">
                {/* Panel Biblia */}
                <div className="col-md-7">
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '25px', borderRadius: '20px', height: '100%' }}>
                        <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={18} color="#3B82F6" /> Biblia Reina Valera 1960
                        </h5>
                        
                        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
                            {/* Selector de Libro */}
                            <select 
                                className="form-select flex-grow-1" 
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '12px' }}
                                value={selectedBook.id}
                                onChange={(e) => {
                                    const book = BIBLE_BOOKS.find(b => b.id === parseInt(e.target.value));
                                    setSelectedBook(book);
                                    setSelectedChapter(1);
                                }}
                            >
                                {BIBLE_BOOKS.map(b => (
                                    <option key={b.id} value={b.id} style={{ color: '#000' }}>{b.name}</option>
                                ))}
                            </select>

                            {/* Selector de Capítulo */}
                            <select 
                                className="form-select" 
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '12px', minWidth: '90px' }}
                                value={selectedChapter}
                                onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
                            >
                                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(c => (
                                    <option key={c} value={c} style={{ color: '#000' }}>Cap. {c}</option>
                                ))}
                            </select>

                            {/* Selector de Versículo */}
                            <select 
                                className="form-select" 
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '12px', minWidth: '90px' }}
                                value={selectedVerseObj?.verse || ''}
                                onChange={handleVerseChange}
                                disabled={isLoadingVerses}
                            >
                                {isLoadingVerses ? <option>...</option> : verses.map(v => (
                                    <option key={v.verse} value={v.verse} style={{ color: '#000' }}>Ver. {v.verse}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Selector de Estilos UI/UX */}
                        <div className="mb-4">
                            <span style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: 'block', marginBottom: '8px'}}>Plantilla Visual:</span>
                            <div className="d-flex flex-wrap gap-2">
                                <button 
                                    className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-2"
                                    style={{ 
                                        background: bibleTemplate === 'classic' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                                        border: bibleTemplate === 'classic' ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                                        color: bibleTemplate === 'classic' ? '#8B5CF6' : 'rgba(255,255,255,0.6)',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleTemplateChange('classic')}
                                    title="Clásico Flotante"
                                >
                                    <LayoutTemplate size={22} className="mb-1" />
                                    <span style={{ fontSize: '0.7rem', fontWeight: bibleTemplate === 'classic' ? 'bold' : 'normal' }}>Clásico</span>
                                </button>

                                <button 
                                    className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-2"
                                    style={{ 
                                        background: bibleTemplate === 'minimal' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                                        border: bibleTemplate === 'minimal' ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                                        color: bibleTemplate === 'minimal' ? '#8B5CF6' : 'rgba(255,255,255,0.6)',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleTemplateChange('minimal')}
                                    title="Zócalo Inferior"
                                >
                                    <PanelBottom size={22} className="mb-1" />
                                    <span style={{ fontSize: '0.7rem', fontWeight: bibleTemplate === 'minimal' ? 'bold' : 'normal' }}>Zócalo</span>
                                </button>

                                <button 
                                    className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-2"
                                    style={{ 
                                        background: bibleTemplate === 'sidebar' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                                        border: bibleTemplate === 'sidebar' ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                                        color: bibleTemplate === 'sidebar' ? '#8B5CF6' : 'rgba(255,255,255,0.6)',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleTemplateChange('sidebar')}
                                    title="Panel Lateral Derecho"
                                >
                                    <PanelRight size={22} className="mb-1" />
                                    <span style={{ fontSize: '0.7rem', fontWeight: bibleTemplate === 'sidebar' ? 'bold' : 'normal' }}>Lateral</span>
                                </button>

                                <button 
                                    className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-2"
                                    style={{ 
                                        background: bibleTemplate === 'cinematic' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                                        border: bibleTemplate === 'cinematic' ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                                        color: bibleTemplate === 'cinematic' ? '#8B5CF6' : 'rgba(255,255,255,0.6)',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleTemplateChange('cinematic')}
                                    title="Centro Cinematográfico"
                                >
                                    <Film size={22} className="mb-1" />
                                    <span style={{ fontSize: '0.7rem', fontWeight: bibleTemplate === 'cinematic' ? 'bold' : 'normal' }}>Cine</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Mini-OBS Preview Visual */}
                        <div style={{ 
                            height: '240px', 
                            background: 'url("https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=800&auto=format&fit=crop") center/cover',
                            borderRadius: '16px', 
                            position: 'relative',
                            overflow: 'hidden',
                            marginBottom: '20px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            marginTop: '20px'
                        }}>
                            {/* Overlay oscuro de fondo */}
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', transition: 'all 0.3s' }} />
                            
                            {isLoadingVerses ? (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <em>Cargando versículos...</em>
                                </div>
                            ) : selectedVerseObj ? (
                                <div style={{
                                    position: 'absolute',
                                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                                    ...(bibleTemplate === 'classic' ? {
                                        bottom: '15px', left: '15px', maxWidth: '85%',
                                        background: 'rgba(18, 12, 31, 0.85)', backdropFilter: 'blur(5px)',
                                        borderLeft: `4px solid ${colors.accent}`, padding: '12px 15px', borderRadius: '0 8px 8px 0'
                                    } : bibleTemplate === 'minimal' ? {
                                        bottom: '15px', left: '15px', right: '15px',
                                        background: 'rgba(18, 12, 31, 0.85)', backdropFilter: 'blur(5px)',
                                        borderBottom: `4px solid ${colors.accent}`, padding: '12px 15px', borderRadius: '8px',
                                        textAlign: 'center'
                                    } : bibleTemplate === 'sidebar' ? {
                                        top: 0, bottom: 0, right: 0, width: '45%',
                                        background: 'rgba(18, 12, 31, 0.75)', backdropFilter: 'blur(5px)',
                                        borderLeft: `4px solid ${colors.accent}`, padding: '15px',
                                        display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                    } : /* cinematic */ {
                                        inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                        alignItems: 'center', paddingBottom: '30px', textAlign: 'center',
                                        background: 'transparent'
                                    })
                                }}>
                                    <h6 style={{ 
                                        color: colors.accent, 
                                        margin: '0 0 5px 0', 
                                        fontSize: bibleTemplate === 'cinematic' ? '0.7rem' : '0.7rem', 
                                        fontWeight: 'bold', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '1px',
                                        fontFamily: bibleTemplate === 'cinematic' ? 'Moonrising, sans-serif' : 'inherit',
                                        textShadow: bibleTemplate === 'cinematic' ? '1px 1px 4px rgba(0,0,0,0.8)' : 'none'
                                    }}>
                                        {selectedBook.name} {selectedChapter}:{selectedVerseObj.verse}
                                    </h6>
                                    <p style={{ 
                                        color: '#fff', 
                                        margin: 0, 
                                        fontSize: bibleTemplate === 'cinematic' ? '0.9rem' : '0.8rem', 
                                        fontWeight: 'normal',
                                        lineHeight: '1.3',
                                        fontFamily: bibleTemplate === 'cinematic' ? 'Georgia, serif' : 'inherit',
                                        textShadow: bibleTemplate === 'cinematic' ? '1px 2px 5px rgba(0,0,0,0.9)' : 'none'
                                    }}>
                                        {bibleTemplate === 'cinematic' ? `"${selectedVerseObj.text}"` : selectedVerseObj.text}
                                    </p>
                                </div>
                            ) : (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
                                    <em>Selecciona un versículo para previsualizar</em>
                                </div>
                            )}
                        </div>

                        <div className="d-flex gap-2">
                            <button 
                                className="btn d-flex align-items-center justify-content-center"
                                onClick={handlePrevVerse}
                                disabled={!canGoPrev || isLoadingVerses}
                                title="Versículo Anterior"
                                style={{
                                    background: (!canGoPrev || isLoadingVerses) ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                                    color: (!canGoPrev || isLoadingVerses) ? 'rgba(255,255,255,0.2)' : '#fff',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '0 15px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <button 
                                className="btn flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2" 
                                onClick={() => {
                                    pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${selectedVerseObj?.verse}`, selectedVerseObj?.text, { template: bibleTemplate });
                                    setIsBibleLive(true);
                                }}
                                disabled={!selectedVerseObj || isLoadingVerses}
                                style={{ 
                                    background: (!selectedVerseObj || isLoadingVerses) ? 'rgba(255,255,255,0.05)' : `linear-gradient(90deg, ${colors.accent}, #F59E0B)`, 
                                    color: (!selectedVerseObj || isLoadingVerses) ? 'rgba(255,255,255,0.2)' : '#000', 
                                    borderRadius: '12px', 
                                    padding: '14px',
                                    border: 'none',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <MonitorPlay size={20} /> ENVIAR VERSÍCULO A OBS
                            </button>

                            <button 
                                className="btn d-flex align-items-center justify-content-center"
                                onClick={handleNextVerse}
                                disabled={!canGoNext || isLoadingVerses}
                                title="Versículo Siguiente"
                                style={{
                                    background: (!canGoNext || isLoadingVerses) ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                                    color: (!canGoNext || isLoadingVerses) ? 'rgba(255,255,255,0.2)' : '#fff',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '0 15px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel Anuncios y Controles Master */}
                <div className="col-md-5">
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '25px', borderRadius: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Megaphone size={18} color="#10B981" /> Anuncios Libres
                        </h5>
                        
                        <input 
                            type="text" 
                            className="form-control mb-3" 
                            placeholder="Título (Ej: Ofrendas)" 
                            value={announcement.title}
                            onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '12px' }}
                        />
                        <textarea 
                            className="form-control mb-4" 
                            placeholder="Cuerpo del anuncio..." 
                            rows="2"
                            value={announcement.content}
                            onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '12px' }}
                        ></textarea>

                        <button 
                            className="btn w-100 fw-bold text-white mb-auto d-flex align-items-center justify-content-center gap-2" 
                            onClick={() => pushToOBS('announcement', announcement.title, announcement.content)}
                            style={{ background: 'linear-gradient(90deg, #10B981, #059669)', border: 'none', borderRadius: '50px', padding: '14px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}
                        >
                            <MonitorPlay size={20} /> LANZAR ANUNCIO A OBS
                        </button>

                        {/* Panel Predicador */}
                        <div style={{ marginTop: '20px' }}>
                            <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={18} color="#8B5CF6" /> Zócalo de Predicador
                            </h5>
                            
                            <input 
                                type="text" 
                                className="form-control mb-2" 
                                placeholder="Nombre (Ej: Ps. Diego Marín)" 
                                value={preacher.name}
                                onChange={(e) => setPreacher({...preacher, name: e.target.value})}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '10px' }}
                            />
                            <input 
                                type="text"
                                className="form-control mb-3" 
                                placeholder="Tema / Cargo (Ej: El poder de la cruz)" 
                                value={preacher.title}
                                onChange={(e) => setPreacher({...preacher, title: e.target.value})}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '10px' }}
                            />

                            <button 
                                className="btn w-100 fw-bold text-white mb-4 d-flex align-items-center justify-content-center gap-2" 
                                onClick={() => pushToOBS('lower_third', preacher.name, preacher.title)}
                                style={{ background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)' }}
                            >
                                <MonitorPlay size={18} /> MOSTRAR PREDICADOR
                            </button>
                        </div>

                        {/* Panel Estado de Culto y Contadores */}
                        <div style={{ marginTop: '10px' }}>
                            <h5 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Timer size={18} color="#EF4444" /> Controles de Culto
                            </h5>
                            
                            <div className="d-flex flex-column gap-2 mb-4">
                                {serviceStartTime && (
                                    <button 
                                        className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2" 
                                        onClick={() => {
                                            pushToOBS('live_status', currentActivity?.actividad || 'PROGRAMA FINALIZADO', '', { targetTime: Date.now() + (timeMetrics?.remaining || 0) * 1000, isOvertime: timeMetrics?.isOvertime });
                                        }}
                                        style={{ background: 'linear-gradient(90deg, #F59E0B, #D97706)', border: 'none', borderRadius: '12px', padding: '12px', color: '#000', boxShadow: '0 10px 20px rgba(245, 158, 11, 0.3)' }}
                                    >
                                        <MonitorPlay size={18} /> PROYECTAR ESTADO A OBS
                                    </button>
                                )}
                                
                                <div className="mb-3">
                                    <span style={{color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: '8px'}}>Estilo visual:</span>
                                    <div className="d-flex flex-wrap gap-2">
                                        <button 
                                            className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-2"
                                            style={{ 
                                                background: countdownTemplate === 'glass_center' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.3)',
                                                border: countdownTemplate === 'glass_center' ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                                                color: countdownTemplate === 'glass_center' ? '#EF4444' : 'rgba(255,255,255,0.6)',
                                                borderRadius: '12px', transition: 'all 0.2s'
                                            }}
                                            onClick={() => setCountdownTemplate('glass_center')}
                                        >
                                            <LayoutTemplate size={20} className="mb-1" />
                                            <span style={{ fontSize: '0.65rem' }}>Cristal Central</span>
                                        </button>
                                        <button 
                                            className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-2"
                                            style={{ 
                                                background: countdownTemplate === 'pill_bottom' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.3)',
                                                border: countdownTemplate === 'pill_bottom' ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                                                color: countdownTemplate === 'pill_bottom' ? '#EF4444' : 'rgba(255,255,255,0.6)',
                                                borderRadius: '12px', transition: 'all 0.2s'
                                            }}
                                            onClick={() => setCountdownTemplate('pill_bottom')}
                                        >
                                            <PanelBottom size={20} className="mb-1" />
                                            <span style={{ fontSize: '0.65rem' }}>Píldora Inferior</span>
                                        </button>
                                        <button 
                                            className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-2"
                                            style={{ 
                                                background: countdownTemplate === 'corner_elegant' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.3)',
                                                border: countdownTemplate === 'corner_elegant' ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                                                color: countdownTemplate === 'corner_elegant' ? '#EF4444' : 'rgba(255,255,255,0.6)',
                                                borderRadius: '12px', transition: 'all 0.2s'
                                            }}
                                            onClick={() => setCountdownTemplate('corner_elegant')}
                                        >
                                            <PanelRight size={20} className="mb-1" />
                                            <span style={{ fontSize: '0.65rem' }}>Esquina Elegante</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="d-flex flex-wrap gap-2">
                                    <button 
                                        className="btn flex-grow-1 fw-bold text-white d-flex flex-column align-items-center justify-content-center p-2" 
                                        onClick={() => pushToOBS('countdown', 'ESTAMOS COMENZANDO', '', { targetTime: Date.now() + 5 * 60000, template: countdownTemplate })}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '12px', transition: 'all 0.2s' }}
                                    >
                                        <Timer size={18} className="mb-1" />
                                        <span style={{ fontSize: '0.7rem' }}>5 MIN</span>
                                    </button>
                                    <button 
                                        className="btn flex-grow-1 fw-bold text-white d-flex flex-column align-items-center justify-content-center p-2" 
                                        onClick={() => pushToOBS('countdown', 'ESTAMOS COMENZANDO', '', { targetTime: Date.now() + 10 * 60000, template: countdownTemplate })}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '12px', transition: 'all 0.2s' }}
                                    >
                                        <Timer size={18} className="mb-1" />
                                        <span style={{ fontSize: '0.7rem' }}>10 MIN</span>
                                    </button>
                                    <button 
                                        className="btn flex-grow-1 fw-bold text-white d-flex flex-column align-items-center justify-content-center p-2" 
                                        onClick={() => pushToOBS('countdown', 'ESTAMOS COMENZANDO', '', { targetTime: Date.now() + 15 * 60000, template: countdownTemplate })}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '12px', transition: 'all 0.2s' }}
                                    >
                                        <Timer size={18} className="mb-1" />
                                        <span style={{ fontSize: '0.7rem' }}>15 MIN</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="my-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}></div>

                        <button 
                            className="btn btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2" 
                            onClick={() => {
                                pushToOBS('hidden', '', '');
                                setIsBibleLive(false);
                            }}
                            style={{ borderRadius: '50px', padding: '14px', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#EF4444' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <MonitorOff size={20}/> QUITAR TODO DEL AIRE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTransmisionInline;
