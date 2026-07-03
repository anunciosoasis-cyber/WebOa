import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import apiClient from '../api/client';
import himnarioData from '../data/himnario.json';
import { useToast } from '../react-ui/components/Toast';
import { MonitorPlay, MonitorOff, BookOpen, Megaphone, ExternalLink, ChevronLeft, ChevronRight, User, LayoutTemplate, PanelBottom, PanelRight, Film, Timer, Music } from 'lucide-react';
import { motion } from 'framer-motion';

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

const AdminTransmisionInline = ({ currentActivity, timeMetrics, serviceStartTime, isDark }) => {
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

    // Tabs State
    const [activeTab, setActiveTab] = useState('biblia'); // 'biblia' or 'himnario'

    // Hymnal State
    const [himnarioList, setHimnarioList] = useState([]);
    const [selectedHymn, setSelectedHymn] = useState(null);
    const [selectedStanza, setSelectedStanza] = useState(null);
    const [hymnalTemplate, setHymnalTemplate] = useState('classic');
    const [audioMode, setAudioMode] = useState('letra'); // 'letra', 'cantado', 'pista'
    const [isLoadingHymns, setIsLoadingHymns] = useState(false);
    
    // Hymnal Search State
    const [hymnSearchTerm, setHymnSearchTerm] = useState('');
    const [isHymnDropdownOpen, setIsHymnDropdownOpen] = useState(false);

    // Load himnos statically from JSON
    useEffect(() => {
        const loadHymns = () => {
            setIsLoadingHymns(true);
            try {
                let data = himnarioData;
                
                // Intercalar el coro después de cada estrofa
                data = data.map(hymn => {
                    const chorus = hymn.stanzas.find(s => s.type === 'chorus' || s.number === '' || String(s.number).toLowerCase() === 'coro');
                    if (chorus) {
                        const expandedStanzas = [];
                        const onlyStanzas = hymn.stanzas.filter(s => s !== chorus);
                        onlyStanzas.forEach(s => {
                            expandedStanzas.push(s);
                            // Intercalar el coro
                            expandedStanzas.push(chorus);
                        });
                        return { ...hymn, stanzas: expandedStanzas };
                    }
                    return hymn;
                });

                if (data && data.length > 0) {
                    setHimnarioList(data);
                    setSelectedHymn(data[0]);
                    setSelectedStanza(data[0].stanzas[0]);
                }
            } catch (err) {
                console.error("Error cargando himnos locales:", err);
                // Fallback a vacio o notificar error
            } finally {
                setIsLoadingHymns(false);
            }
        };
        loadHymns();
    }, []);

    const handleHymnSelect = (hymn) => {
        setSelectedHymn(hymn);
        setSelectedStanza(hymn.stanzas[0]);
        setHymnSearchTerm(`${hymn.number} - ${hymn.title}`);
        setIsHymnDropdownOpen(false);
    };

    // Keep search input synced with selected hymn initially or when changed externally
    useEffect(() => {
        if (selectedHymn && !isHymnDropdownOpen) {
            setHymnSearchTerm(`${selectedHymn.number} - ${selectedHymn.title}`);
        }
    }, [selectedHymn, isHymnDropdownOpen]);

    const normalizeString = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const filteredHymns = himnarioList.filter(h => {
        const term = normalizeString(hymnSearchTerm);
        return h.number.toString().includes(term) || normalizeString(h.title).includes(term);
    });

    const handleStanzaChange = (e) => {
        const idx = parseInt(e.target.value);
        if (selectedHymn && selectedHymn.stanzas[idx]) {
            setSelectedStanza(selectedHymn.stanzas[idx]);
        }
    };

    const currentStanzaIndex = selectedHymn?.stanzas.findIndex(s => s === selectedStanza) ?? -1;
    const canGoPrevStanza = currentStanzaIndex > 0;
    const canGoNextStanza = selectedHymn && currentStanzaIndex >= 0 && currentStanzaIndex < selectedHymn.stanzas.length - 1;

    const handlePrevStanza = () => {
        if (canGoPrevStanza) {
            const newStanza = selectedHymn.stanzas[currentStanzaIndex - 1];
            setSelectedStanza(newStanza);
            if (isBibleLive) { // Reusing flag or making a new one, but they share the main projection area
                pushToOBS('himno', `Himno ${selectedHymn.number} - ${selectedHymn.title}`, newStanza.text, { template: hymnalTemplate, subText: newStanza.number ? `Estrofa ${newStanza.number}` : newStanza.number === '' ? 'Coro' : '' });
            }
        }
    };

    const handleNextStanza = () => {
        if (canGoNextStanza) {
            const newStanza = selectedHymn.stanzas[currentStanzaIndex + 1];
            setSelectedStanza(newStanza);
            if (isBibleLive) {
                pushToOBS('himno', `Himno ${selectedHymn.number} - ${selectedHymn.title}`, newStanza.text, { template: hymnalTemplate, subText: newStanza.number ? `Estrofa ${newStanza.number}` : newStanza.number === '' ? 'Coro' : '' });
            }
        }
    };

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
        }).on('broadcast', { event: 'remote_keydown' }, (payload) => {
            const key = payload.payload.key;
            if (key === 'ArrowRight' || key === 'ArrowDown') {
                const nextBtn = document.getElementById('btn-next-stanza');
                if (nextBtn && !nextBtn.disabled) nextBtn.click();
            } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
                const prevBtn = document.getElementById('btn-prev-stanza');
                if (prevBtn && !prevBtn.disabled) prevBtn.click();
            }
        }).subscribe();

        setObsChannel(channel);
        return () => supabase.removeChannel(channel);
    }, []);

    // Keyboard Navigation for Stanzas
    useEffect(() => {
        const handleKeyDown = (e) => {
            // No hacer nada si el foco está en un input o textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextBtn = document.getElementById('btn-next-stanza');
                if (nextBtn && !nextBtn.disabled) nextBtn.click();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevBtn = document.getElementById('btn-prev-stanza');
                if (prevBtn && !prevBtn.disabled) prevBtn.click();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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
            background: isDark ? undefined : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '35px',
            padding: '30px',
            marginTop: '30px',
            boxShadow: isDark ? 'none' : '0 15px 35px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(20px)'
        }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--bs-border-color-translucent)' }}>
                <div>
                    <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '4px' }}>
                        Studio en Vivo
                    </span>
                    <h4 style={{ color: isDark ? '#fff' : '#000', fontSize: '1.4rem', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Moonrising, sans-serif' }}>
                        <MonitorPlay size={24} color="#f59e0b" /> CONSOLA OBS
                    </h4>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}onClick={openOBSWindow}
                    className="btn d-flex align-items-center gap-2 fw-bold px-4 py-2"
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '50px', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                >
                    <ExternalLink size={18} /> ABRIR WEB OBS
                </motion.button>
            </div>

            <div className="row g-4">
                {/* Panel Principal (Biblia / Himnario) */}
                <div className="col-md-7">
                    <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, padding: '25px', borderRadius: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>

                        {/* Tabs (Segmented Control) */}
                        <div className="d-flex p-1 mb-4" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '16px', position: 'relative' }}>
                            {['biblia', 'himnario'].map((tab) => (
                                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}key={tab}
                                    className="btn flex-grow-1 position-relative border-0"
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        color: activeTab === tab ? '#fff' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
                                        borderRadius: '12px',
                                        padding: '10px 15px',
                                        transition: 'color 0.2s',
                                        zIndex: 1,
                                        fontWeight: activeTab === tab ? 'bold' : 'normal',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="active-tab"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'var(--bs-primary)',
                                                borderRadius: '12px',
                                                zIndex: -1,
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(59, 130, 246, 0.5)'
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    {tab === 'biblia' ? <BookOpen size={18} /> : <Music size={18} />}
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </motion.button>
                            ))}
                        </div>

                        {activeTab === 'biblia' && (
                            <>
                                <h5 style={{ color: isDark ? '#fff' : '#000', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BookOpen size={18} color="#3B82F6" /> Biblia Reina Valera 1960
                                </h5>

                                <div className="d-flex align-items-center gap-2 mb-3 w-100" style={{ overflowX: 'auto', paddingBottom: '5px' }}>
                                    {/* Selector de Libro */}
                                    <select
                                        className="form-select flex-grow-1"
                                        style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#000', borderRadius: '12px', padding: '10px', minWidth: '120px' }}
                                        value={selectedBook.id}
                                        onChange={(e) => {
                                            const book = BIBLE_BOOKS.find(b => b.id === parseInt(e.target.value));
                                            setSelectedBook(book);
                                            setSelectedChapter(1);
                                        }}
                                    >
                                        {BIBLE_BOOKS.map(b => (
                                            <option key={b.id} value={b.id} style={{ color: isDark ? '#fff' : '#000', background: isDark ? '#1a1a1a' : '#fff' }}>{b.name}</option>
                                        ))}
                                    </select>

                                    {/* Selector de Capítulo */}
                                    <select
                                        className="form-select"
                                        style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#000', borderRadius: '12px', padding: '10px', width: 'auto' }}
                                        value={selectedChapter}
                                        onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
                                    >
                                        {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(c => (
                                            <option key={c} value={c} style={{ color: isDark ? '#fff' : '#000', background: isDark ? '#1a1a1a' : '#fff' }}>Cap. {c}</option>
                                        ))}
                                    </select>

                                    {/* Selector de Versículo */}
                                    <select
                                        className="form-select"
                                        style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#000', borderRadius: '12px', padding: '10px', width: 'auto' }}
                                        value={selectedVerseObj?.verse || ''}
                                        onChange={handleVerseChange}
                                        disabled={isLoadingVerses}
                                    >
                                        {isLoadingVerses ? <option>...</option> : verses.map(v => (
                                            <option key={v.verse} value={v.verse} style={{ color: isDark ? '#fff' : '#000', background: isDark ? '#1a1a1a' : '#fff' }}>Ver. {v.verse}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Selector de Estilos UI/UX (Compacto) - Movido abajo */}
                                <div className="d-flex justify-content-center gap-3 mb-4">
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center p-2"
                                        style={{
                                            background: bibleTemplate === 'classic' ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                            border: bibleTemplate === 'classic' ? '1px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                            color: bibleTemplate === 'classic' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                            borderRadius: '10px',
                                            transition: 'all 0.2s',
                                            width: '45px', height: '45px'
                                        }}
                                        onClick={() => handleTemplateChange('classic')}
                                        title="Clásico Flotante"
                                    >
                                        <LayoutTemplate size={20} />
                                    </motion.button>

                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center p-2"
                                        style={{
                                            background: bibleTemplate === 'minimal' ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                            border: bibleTemplate === 'minimal' ? '1px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                            color: bibleTemplate === 'minimal' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                            borderRadius: '10px',
                                            transition: 'all 0.2s',
                                            width: '45px', height: '45px'
                                        }}
                                        onClick={() => handleTemplateChange('minimal')}
                                        title="Zócalo Inferior"
                                    >
                                        <PanelBottom size={20} />
                                    </motion.button>

                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center p-2"
                                        style={{
                                            background: bibleTemplate === 'sidebar' ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                            border: bibleTemplate === 'sidebar' ? '1px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                            color: bibleTemplate === 'sidebar' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                            borderRadius: '10px',
                                            transition: 'all 0.2s',
                                            width: '45px', height: '45px'
                                        }}
                                        onClick={() => handleTemplateChange('sidebar')}
                                        title="Panel Lateral Derecho"
                                    >
                                        <PanelRight size={20} />
                                    </motion.button>

                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center p-2"
                                        style={{
                                            background: bibleTemplate === 'cinematic' ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                            border: bibleTemplate === 'cinematic' ? '1px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                            color: bibleTemplate === 'cinematic' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                            borderRadius: '10px',
                                            transition: 'all 0.2s',
                                            width: '45px', height: '45px'
                                        }}
                                        onClick={() => handleTemplateChange('cinematic')}
                                        title="Centro Cinematográfico"
                                    >
                                        <Film size={20} />
                                    </motion.button>
                                </div>

                                {/* Mini-OBS Preview Visual */}
                                <div style={{
                                    height: '240px',
                                    background: 'url("https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=800&auto=format&fit=crop") center/cover',
                                    borderRadius: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    marginBottom: '20px',
                                    border: '1px solid var(--bs-secondary-color)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    marginTop: '20px'
                                }}>
                                    {/* Overlay oscuro de fondo */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', transition: 'all 0.3s' }} />

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
                                                background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
                                                borderLeft: `4px solid ${colors.accent}`, padding: '12px 15px', borderRadius: '0 8px 8px 0'
                                            } : bibleTemplate === 'minimal' ? {
                                                bottom: '15px', left: '15px', right: '15px',
                                                background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
                                                borderBottom: `4px solid ${colors.accent}`, padding: '12px 15px', borderRadius: '8px',
                                                textAlign: 'center'
                                            } : bibleTemplate === 'sidebar' ? {
                                                top: 0, bottom: 0, right: 0, width: '45%',
                                                background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
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
                                                textShadow: bibleTemplate === 'cinematic' ? '1px 1px 4px rgba(0,0,0,0.9)' : 'none'
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
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                            <em>Selecciona un versículo para previsualizar</em>
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex gap-2">
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center"
                                        onClick={handlePrevVerse}
                                        disabled={!canGoPrev || isLoadingVerses}
                                        title="Versículo Anterior"
                                        style={{
                                            background: (!canGoPrev || isLoadingVerses) ? 'var(--bs-tertiary-bg)' : 'var(--bs-border-color)',
                                            color: (!canGoPrev || isLoadingVerses) ? 'var(--bs-secondary-color)' : '#fff',
                                            borderRadius: '10px',
                                            border: '1px solid var(--bs-border-color)',
                                            padding: '0 12px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <ChevronLeft size={18} />
                                    </motion.button>

                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => {
                                            pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${selectedVerseObj?.verse}`, selectedVerseObj?.text, { template: bibleTemplate });
                                            setIsBibleLive(true);
                                        }}
                                        disabled={!selectedVerseObj || isLoadingVerses}
                                        style={{
                                            background: (!selectedVerseObj || isLoadingVerses) ? 'var(--bs-tertiary-bg)' : `linear-gradient(90deg, ${colors.accent}, #F59E0B)`,
                                            color: (!selectedVerseObj || isLoadingVerses) ? 'var(--bs-secondary-color)' : '#000',
                                            borderRadius: '10px',
                                            padding: '8px 12px',
                                            fontSize: '0.8rem',
                                            border: 'none',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <MonitorPlay size={16} /> ENVIAR A OBS
                                    </motion.button>

                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center"
                                        onClick={handleNextVerse}
                                        disabled={!canGoNext || isLoadingVerses}
                                        title="Versículo Siguiente"
                                        style={{
                                            background: (!canGoNext || isLoadingVerses) ? 'var(--bs-tertiary-bg)' : 'var(--bs-border-color)',
                                            color: (!canGoNext || isLoadingVerses) ? 'var(--bs-secondary-color)' : '#fff',
                                            borderRadius: '10px',
                                            border: '1px solid var(--bs-border-color)',
                                            padding: '0 12px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <ChevronRight size={18} />
                                    </motion.button>
                                </div>
                            </>
                        )}

                        {activeTab === 'himnario' && (
                            <>
                                <h5 style={{ color: isDark ? '#fff' : '#000', fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Music size={18} color="#3B82F6" /> Himnario Adventista
                                </h5>

                                <div className="d-flex align-items-center gap-2 mb-3 w-100" style={{ position: 'relative', zIndex: 10 }}>
                                    {/* Buscador de Himno */}
                                    <div className="flex-grow-1 position-relative" style={{ minWidth: '0' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={isLoadingHymns ? "Cargando himnos..." : "Buscar por número o título..."}
                                            style={{
                                                background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                                color: isDark ? '#fff' : '#000', borderRadius: '12px', padding: '10px 15px', width: '100%'
                                            }}
                                            value={hymnSearchTerm}
                                            onChange={(e) => {
                                                setHymnSearchTerm(e.target.value);
                                                setIsHymnDropdownOpen(true);
                                            }}
                                            onClick={() => {
                                                setHymnSearchTerm('');
                                                setIsHymnDropdownOpen(true);
                                            }}
                                            onFocus={() => {
                                                setHymnSearchTerm('');
                                                setIsHymnDropdownOpen(true);
                                            }}
                                            onBlur={() => setTimeout(() => setIsHymnDropdownOpen(false), 200)}
                                            disabled={isLoadingHymns || himnarioList.length === 0}
                                        />
                                        {isHymnDropdownOpen && (
                                            <div
                                                style={{
                                                    position: 'absolute', top: '100%', left: 0, right: 0,
                                                    background: isDark ? 'rgba(18, 12, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)', border: `1px solid ${colors.accent}`,
                                                    borderRadius: '12px', marginTop: '5px', maxHeight: '250px',
                                                    overflowY: 'auto', zIndex: 1000, backdropFilter: 'blur(10px)',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                {filteredHymns.length > 0 ? filteredHymns.map(h => (
                                                    <div
                                                        key={h.number}
                                                        style={{
                                                            padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid var(--bs-border-color-translucent)',
                                                            color: selectedHymn?.number === h.number ? colors.accent : (isDark ? '#fff' : '#000'),
                                                            background: selectedHymn?.number === h.number ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = selectedHymn?.number === h.number ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent'}
                                                        onMouseDown={() => handleHymnSelect(h)}
                                                    >
                                                        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>#{h.number}</span>
                                                        {h.title}
                                                    </div>
                                                )) : (
                                                    <div style={{ padding: '10px 15px', color: 'var(--bs-secondary-color)' }}>
                                                        No se encontraron himnos.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selector de Estrofa */}
                                    <select
                                        className="form-select"
                                        style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#000', borderRadius: '12px', padding: '10px', width: '130px', flexShrink: 0 }}
                                        value={currentStanzaIndex}
                                        onChange={handleStanzaChange}
                                        disabled={!selectedHymn}
                                    >
                                        {selectedHymn?.stanzas.map((s, idx) => {
                                            const isCoro = s.type === 'chorus' || s.number === '' || String(s.number).toLowerCase() === 'coro';
                                            return (
                                                <option key={idx} value={idx} style={{ color: isDark ? '#fff' : '#000', background: isDark ? '#1a1a1a' : '#fff' }}>
                                                    {isCoro ? 'Coro' : `Estrofa ${s.number}`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* Selector de Estilos UI/UX (Compacto) */}
                                <div className="d-flex justify-content-center gap-3 mb-4">
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center p-2"
                                        style={{
                                            background: hymnalTemplate === 'classic' ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                            border: hymnalTemplate === 'classic' ? '1px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                            color: hymnalTemplate === 'classic' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                            borderRadius: '10px', transition: 'all 0.2s', width: '45px', height: '45px'
                                        }}
                                        onClick={() => setHymnalTemplate('classic')}
                                        title="Clásico Flotante"
                                    >
                                        <LayoutTemplate size={20} />
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center p-2"
                                        style={{
                                            background: hymnalTemplate === 'minimal' ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                            border: hymnalTemplate === 'minimal' ? '1px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                            color: hymnalTemplate === 'minimal' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                            borderRadius: '10px', transition: 'all 0.2s', width: '45px', height: '45px'
                                        }}
                                        onClick={() => setHymnalTemplate('minimal')}
                                        title="Zócalo Inferior"
                                    >
                                        <PanelBottom size={20} />
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center p-2"
                                        style={{
                                            background: hymnalTemplate === 'sidebar' ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                            border: hymnalTemplate === 'sidebar' ? '1px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                            color: hymnalTemplate === 'sidebar' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                            borderRadius: '10px', transition: 'all 0.2s', width: '45px', height: '45px'
                                        }}
                                        onClick={() => setHymnalTemplate('sidebar')}
                                        title="Panel Lateral Derecho"
                                    >
                                        <PanelRight size={20} />
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn d-flex align-items-center justify-content-center p-2"
                                        style={{
                                            background: hymnalTemplate === 'cinematic' ? 'rgba(139, 92, 246, 0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                            border: hymnalTemplate === 'cinematic' ? '1px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                            color: hymnalTemplate === 'cinematic' ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                            borderRadius: '10px', transition: 'all 0.2s', width: '45px', height: '45px'
                                        }}
                                        onClick={() => setHymnalTemplate('cinematic')}
                                        title="Centro Cinematográfico"
                                    >
                                        <Film size={20} />
                                    </motion.button>
                                </div>

                                {/* Controles de Audio */}
                                <div className="mb-4">
                                    <div className="d-flex p-1 mb-2" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '24px', position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                                        {[
                                            { id: 'letra', label: 'Solo Letra' },
                                            { id: 'cantado', label: 'Cantado', disabled: !selectedHymn?.mp3Url },
                                            { id: 'pista', label: 'Pista', disabled: !selectedHymn?.mp3UrlInstr }
                                        ].map((mode) => (
                                            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}key={mode.id}
                                                className="btn btn-sm position-relative border-0"
                                                onClick={() => !mode.disabled && setAudioMode(mode.id)}
                                                disabled={mode.disabled}
                                                style={{
                                                    color: audioMode === mode.id ? (isDark ? '#000' : '#fff') : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                                    borderRadius: '20px',
                                                    padding: '6px 20px',
                                                    transition: 'color 0.2s',
                                                    zIndex: 1,
                                                    fontWeight: audioMode === mode.id ? 'bold' : 'normal',
                                                    opacity: mode.disabled ? 0.4 : 1
                                                }}
                                            >
                                                {audioMode === mode.id && (
                                                    <motion.div
                                                        layoutId="active-audio"
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            background: isDark ? '#fff' : '#000',
                                                            borderRadius: '20px',
                                                            zIndex: -1,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                        }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                    />
                                                )}
                                                {mode.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                    {audioMode !== 'letra' && selectedHymn && (
                                        <div className="d-flex justify-content-center mt-2" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '12px', padding: '10px' }}>
                                            <audio
                                                controls
                                                src={audioMode === 'cantado' ? selectedHymn.mp3Url : selectedHymn.mp3UrlInstr}
                                                style={{ width: '100%', height: '35px' }}
                                            >
                                                Tu navegador no soporta el elemento de audio.
                                            </audio>
                                        </div>
                                    )}
                                </div>

                                {/* Mini-OBS Preview Visual (Himnario) */}
                                <div style={{
                                    height: '240px',
                                    background: 'url("https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=800&auto=format&fit=crop") center/cover',
                                    borderRadius: '16px', position: 'relative', overflow: 'hidden',
                                    marginBottom: '20px', border: '1px solid var(--bs-secondary-color)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)', marginTop: '20px'
                                }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', transition: 'all 0.3s' }} />

                                    {selectedStanza ? (
                                        <div style={{
                                            position: 'absolute', transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                                            ...(hymnalTemplate === 'classic' ? {
                                                bottom: '15px', left: '15px', maxWidth: '85%',
                                                background: 'rgba(18, 12, 31, 0.85)', backdropFilter: 'blur(5px)',
                                                borderLeft: `4px solid ${colors.accent}`, padding: '12px 15px', borderRadius: '0 8px 8px 0'
                                            } : hymnalTemplate === 'minimal' ? {
                                                bottom: '15px', left: '15px', right: '15px',
                                                background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
                                                borderBottom: `4px solid ${colors.accent}`, padding: '12px 15px', borderRadius: '8px', textAlign: 'center'
                                            } : hymnalTemplate === 'sidebar' ? {
                                                top: 0, bottom: 0, right: 0, width: '45%',
                                                background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
                                                borderLeft: `4px solid ${colors.accent}`, padding: '15px',
                                                display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                            } : /* cinematic */ {
                                                inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                                alignItems: 'center', paddingBottom: '30px', textAlign: 'center', background: 'transparent'
                                            })
                                        }}>
                                            <h6 style={{
                                                color: colors.accent, margin: '0 0 5px 0',
                                                fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
                                                fontFamily: hymnalTemplate === 'cinematic' ? 'Moonrising, sans-serif' : 'inherit',
                                                textShadow: hymnalTemplate === 'cinematic' ? '1px 1px 4px rgba(0,0,0,0.9)' : 'none'
                                            }}>
                                                Himno {selectedHymn.number} - {selectedStanza.number ? `Estrofa ${selectedStanza.number}` : 'Coro'}
                                            </h6>
                                            <p style={{
                                                color: '#fff', margin: 0, fontSize: hymnalTemplate === 'cinematic' ? '0.9rem' : '0.8rem',
                                                fontWeight: 'normal', lineHeight: '1.3',
                                                fontFamily: hymnalTemplate === 'cinematic' ? 'Georgia, serif' : 'inherit',
                                                textShadow: hymnalTemplate === 'cinematic' ? '1px 2px 5px rgba(0,0,0,0.9)' : 'none',
                                                whiteSpace: 'pre-line'
                                            }}>
                                                {selectedStanza.text}
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                            <em>Selecciona un himno para previsualizar</em>
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex gap-2 mt-auto">
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}id="btn-prev-stanza"
                                        className="btn d-flex align-items-center justify-content-center"
                                        onClick={() => {
                                            const prevIdx = currentStanzaIndex - 1;
                                            handleStanzaChange({ target: { value: prevIdx } });
                                            if (isBibleLive) {
                                                const newStanza = selectedHymn?.stanzas[prevIdx];
                                                pushToOBS('himno', selectedHymn.title, newStanza?.text, { template: hymnalTemplate, subText: newStanza?.number ? `Estrofa ${newStanza.number}` : newStanza?.number === '' ? 'Coro' : '' });
                                            }
                                        }}
                                        disabled={!canGoPrevStanza}
                                        title="Estrofa Anterior"
                                        style={{
                                            background: !canGoPrevStanza ? 'var(--bs-tertiary-bg)' : 'var(--bs-border-color)',
                                            color: !canGoPrevStanza ? 'var(--bs-secondary-color)' : '#fff',
                                            borderRadius: '10px', border: '1px solid var(--bs-border-color)', padding: '0 12px', transition: 'all 0.2s'
                                        }}
                                    >
                                        <ChevronLeft size={18} />
                                    </motion.button>

                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => {
                                            pushToOBS('himno', selectedHymn.title, selectedStanza?.text, { template: hymnalTemplate, subText: selectedStanza.number ? `Estrofa ${selectedStanza.number}` : selectedStanza.number === '' ? 'Coro' : '' });
                                            setIsBibleLive(true);
                                        }}
                                        disabled={!selectedStanza}
                                        style={{
                                            background: !selectedStanza ? 'var(--bs-tertiary-bg)' : `linear-gradient(90deg, ${colors.accent}, #F59E0B)`,
                                            color: !selectedStanza ? 'var(--bs-secondary-color)' : '#000',
                                            borderRadius: '10px', padding: '8px 12px', fontSize: '0.8rem', border: 'none', transition: 'all 0.3s'
                                        }}
                                    >
                                        <MonitorPlay size={16} /> ENVIAR A OBS
                                    </motion.button>

                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}id="btn-next-stanza"
                                        className="btn d-flex align-items-center justify-content-center"
                                        onClick={() => {
                                            const nextIdx = currentStanzaIndex + 1;
                                            handleStanzaChange({ target: { value: nextIdx } });
                                            if (isBibleLive) {
                                                const newStanza = selectedHymn?.stanzas[nextIdx];
                                                pushToOBS('himno', selectedHymn.title, newStanza?.text, { template: hymnalTemplate, subText: newStanza?.number ? `Estrofa ${newStanza.number}` : newStanza?.number === '' ? 'Coro' : '' });
                                            }
                                        }}
                                        disabled={!canGoNextStanza}
                                        title="Estrofa Siguiente"
                                        style={{
                                            background: !canGoNextStanza ? 'var(--bs-tertiary-bg)' : 'var(--bs-border-color)',
                                            color: !canGoNextStanza ? 'var(--bs-secondary-color)' : '#fff',
                                            borderRadius: '10px', border: '1px solid var(--bs-border-color)', padding: '0 12px', transition: 'all 0.2s'
                                        }}
                                    >
                                        <ChevronRight size={18} />
                                    </motion.button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Panel Anuncios y Controles Master */}
                <div className="col-md-5">
                    <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, padding: '25px', borderRadius: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <h5 style={{ color: 'var(--bs-heading-color)', fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Megaphone size={16} color="#10B981" /> Anuncios Libres
                        </h5>

                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Título (Ej: Ofrendas)"
                            value={announcement.title}
                            onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#000', borderRadius: '10px', padding: '8px 12px', fontSize: '0.85rem' }}
                        />
                        <textarea
                            className="form-control mb-3"
                            placeholder="Cuerpo del anuncio..."
                            rows="2"
                            value={announcement.content}
                            onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
                            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#000', borderRadius: '10px', padding: '8px 12px', fontSize: '0.85rem', resize: 'none' }}
                        ></textarea>

                        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn w-100 fw-bold text-white mb-auto d-flex align-items-center justify-content-center gap-2"
                            onClick={() => pushToOBS('announcement', announcement.title, announcement.content)}
                            style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '0.85rem', boxShadow: '0 5px 15px rgba(16, 185, 129, 0.3)' }}
                        >
                            <MonitorPlay size={16} /> LANZAR A OBS
                        </motion.button>

                        {/* Panel Predicador */}
                        <div style={{ marginTop: '20px' }}>
                            <h5 style={{ color: 'var(--bs-heading-color)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={16} color="#8B5CF6" /> Zócalo de Predicador
                            </h5>

                            <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Nombre (Ej: Ps. Diego Marín)"
                                value={preacher.name}
                                onChange={(e) => setPreacher({ ...preacher, name: e.target.value })}
                                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#000', borderRadius: '10px', padding: '8px 12px', fontSize: '0.85rem' }}
                            />
                            <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Tema (Ej: El poder de la cruz)"
                                value={preacher.title}
                                onChange={(e) => setPreacher({ ...preacher, title: e.target.value })}
                                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#000', borderRadius: '10px', padding: '8px 12px', fontSize: '0.85rem' }}
                            />

                            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn w-100 fw-bold text-white mb-3 d-flex align-items-center justify-content-center gap-2"
                                onClick={() => pushToOBS('lower_third', preacher.name, preacher.title)}
                                style={{ background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '0.85rem', boxShadow: '0 5px 15px rgba(139, 92, 246, 0.3)' }}
                            >
                                <MonitorPlay size={16} /> MOSTRAR PREDICADOR
                            </motion.button>
                        </div>

                        {/* Panel Estado de Culto y Contadores */}
                        <div style={{ marginTop: '5px' }}>
                            <h5 style={{ color: 'var(--bs-heading-color)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Timer size={16} color="#EF4444" /> Controles de Culto
                            </h5>

                            <div className="d-flex flex-column gap-2 mb-3">
                                {serviceStartTime && (
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => {
                                            pushToOBS('live_status', currentActivity?.actividad || 'PROGRAMA FINALIZADO', '', { targetTime: Date.now() + (timeMetrics?.remaining || 0) * 1000, isOvertime: timeMetrics?.isOvertime });
                                        }}
                                        style={{ background: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '10px', fontSize: '0.85rem', transition: 'all 0.2s' }}
                                    >
                                        <MonitorPlay size={16} /> PROYECTAR ESTADO
                                    </motion.button>
                                )}

                                <div className="mb-2">
                                    <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '0.75rem', display: 'block', marginBottom: '5px' }}>Estilo visual:</span>
                                    <div className="d-flex flex-wrap gap-2">
                                        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-1"
                                            style={{
                                                background: countdownTemplate === 'glass_center' ? 'rgba(239, 68, 68, 0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                                border: countdownTemplate === 'glass_center' ? '1px solid #EF4444' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                color: countdownTemplate === 'glass_center' ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                                borderRadius: '8px', transition: 'all 0.2s'
                                            }}
                                            onClick={() => setCountdownTemplate('glass_center')}
                                        >
                                            <LayoutTemplate size={16} className="mb-1" />
                                            <span style={{ fontSize: '0.6rem' }}>Centro</span>
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-1"
                                            style={{
                                                background: countdownTemplate === 'pill_bottom' ? 'rgba(239, 68, 68, 0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                                border: countdownTemplate === 'pill_bottom' ? '1px solid #EF4444' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                color: countdownTemplate === 'pill_bottom' ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                                borderRadius: '8px', transition: 'all 0.2s'
                                            }}
                                            onClick={() => setCountdownTemplate('pill_bottom')}
                                        >
                                            <PanelBottom size={16} className="mb-1" />
                                            <span style={{ fontSize: '0.6rem' }}>Abajo</span>
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-1"
                                            style={{
                                                background: countdownTemplate === 'corner_elegant' ? 'rgba(239, 68, 68, 0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : '#fff'),
                                                border: countdownTemplate === 'corner_elegant' ? '1px solid #EF4444' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                color: countdownTemplate === 'corner_elegant' ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                                                borderRadius: '8px', transition: 'all 0.2s'
                                            }}
                                            onClick={() => setCountdownTemplate('corner_elegant')}
                                        >
                                            <PanelRight size={16} className="mb-1" />
                                            <span style={{ fontSize: '0.6rem' }}>Esquina</span>
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="d-flex flex-wrap gap-2">
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn flex-grow-1 fw-bold text-danger d-flex align-items-center justify-content-center gap-1 p-2"
                                        onClick={() => pushToOBS('countdown', 'ESTAMOS COMENZANDO', '', { targetTime: Date.now() + 5 * 60000, template: countdownTemplate })}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', transition: 'all 0.2s' }}
                                    >
                                        <Timer size={14} />
                                        <span style={{ fontSize: '0.75rem' }}>5 MIN</span>
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn flex-grow-1 fw-bold text-danger d-flex align-items-center justify-content-center gap-1 p-2"
                                        onClick={() => pushToOBS('countdown', 'ESTAMOS COMENZANDO', '', { targetTime: Date.now() + 10 * 60000, template: countdownTemplate })}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', transition: 'all 0.2s' }}
                                    >
                                        <Timer size={14} />
                                        <span style={{ fontSize: '0.75rem' }}>10 MIN</span>
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn flex-grow-1 fw-bold text-danger d-flex align-items-center justify-content-center gap-1 p-2"
                                        onClick={() => pushToOBS('countdown', 'ESTAMOS COMENZANDO', '', { targetTime: Date.now() + 15 * 60000, template: countdownTemplate })}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', transition: 'all 0.2s' }}
                                    >
                                        <Timer size={14} />
                                        <span style={{ fontSize: '0.75rem' }}>15 MIN</span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        <div className="my-2" style={{ borderTop: '1px solid var(--bs-tertiary-bg)' }}></div>

                        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}className="btn btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                            onClick={() => {
                                pushToOBS('hidden', '', '');
                                setIsBibleLive(false);
                            }}
                            style={{ borderRadius: '50px', padding: '10px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#EF4444' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <MonitorOff size={16} /> QUITAR TODO
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTransmisionInline;
