import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Music, ChevronLeft, ChevronRight, SkipBack, SkipForward, Maximize, Minimize, Play, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LocalSearchOverlay = ({
    overlayData,
    showHymnModal, setShowHymnModal,
    showBibleModal, setShowBibleModal,
    isFullscreen, toggleFullscreen,
    handlePrevNav, handleNextNav,
    handlePrevHymnNav, handleNextHymnNav,
    hymnSearchTerm, setHymnSearchTerm,
    himnarioData,
    setCurrentHymn, setCurrentStanzaIdx,
    projectToAll, channelRef,
    BIBLE_BOOKS,
    selectedBibleBook, setSelectedBibleBook,
    selectedBibleChapter, setSelectedBibleChapter,
    bibleVerses, setCurrentVerseIdx,
    loadingBible
}) => {
    // Local state for inline dropdowns
    const [showHymnSuggestions, setShowHymnSuggestions] = useState(false);
    const [inlineVerseStr, setInlineVerseStr] = useState('');
    const inputRef = useRef(null);

    // Filter hymns
    const hymnSuggestions = himnarioData
        .filter(h => h.number.toString().includes(hymnSearchTerm.toLowerCase()) || h.title.toLowerCase().includes(hymnSearchTerm.toLowerCase()))
        .slice(0, 5);

    useEffect(() => {
        if (showHymnModal && hymnSearchTerm.length > 0) {
            setShowHymnSuggestions(true);
        } else {
            setShowHymnSuggestions(false);
        }
    }, [hymnSearchTerm, showHymnModal]);

    const handleProjectHymn = (h) => {
        if (!h) return;
        setCurrentHymn(h);
        setCurrentStanzaIdx(0);
        const firstStanza = h.stanzas && h.stanzas[0] ? h.stanzas[0] : { text: '', number: 1 };
        projectToAll('himno', `Himno ${h.number} - ${h.title}`, firstStanza.text, { 
            template: overlayData.template || 'classic', 
            subText: firstStanza.number ? `Estrofa ${firstStanza.number}` : 'Coro' 
        });
        channelRef.current?.send({ type: 'broadcast', event: 'remote_select_hymn', payload: { hymn: h } });
        setShowHymnSuggestions(false);
        setHymnSearchTerm('');
    };

    const handleProjectBibleInline = () => {
        if (!bibleVerses || bibleVerses.length === 0) return;
        
        let targetVerse = bibleVerses[0];
        let idx = 0;
        
        if (inlineVerseStr) {
            const vNum = parseInt(inlineVerseStr);
            const foundIdx = bibleVerses.findIndex(v => v.verse === vNum);
            if (foundIdx !== -1) {
                idx = foundIdx;
                targetVerse = bibleVerses[foundIdx];
            }
        }
        
        setCurrentVerseIdx(idx);
        projectToAll('bible', `${selectedBibleBook.name} ${selectedBibleChapter}:${targetVerse.verse}`, targetVerse.text, { template: overlayData.template || 'classic' });
        channelRef.current?.send({ type: 'broadcast', event: 'remote_select_bible', payload: { book: selectedBibleBook, chapter: selectedBibleChapter, verse: targetVerse } });
        setInlineVerseStr('');
    };

    const handleMainPlayButton = () => {
        if (showBibleModal) {
            handleProjectBibleInline();
        } else if (showHymnModal && hymnSuggestions.length > 0) {
            handleProjectHymn(hymnSuggestions[0]);
        } else {
            channelRef.current?.send({ type: 'broadcast', event: 'request_sync', payload: {} });
        }
    };

    return (
        <>
            {/* Esquina Inferior Izquierda: Selectores Rápidos (Biblia & Himnario) - z-index balanceado */}
            <div style={{ position: 'absolute', bottom: '25px', left: '30px', zIndex: 50 }}>
                <div style={{
                    background: 'rgba(20, 30, 45, 0.75)',
                    padding: '6px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    <button
                        onClick={() => { setShowBibleModal(!showBibleModal); setShowHymnModal(false); }}
                        title="Activar Búsqueda Bíblica"
                        style={{
                            background: showBibleModal || overlayData.mode === 'bible' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                            color: showBibleModal || overlayData.mode === 'bible' ? '#93C5FD' : '#94A3B8',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '12px 18px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <BookOpen size={24} />
                    </button>

                    <button
                        onClick={() => { setShowHymnModal(!showHymnModal); setShowBibleModal(false); }}
                        title="Activar Búsqueda de Himno"
                        style={{
                            background: showHymnModal || overlayData.mode === 'himno' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                            color: showHymnModal || overlayData.mode === 'himno' ? '#C4B5FD' : '#94A3B8',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '12px 18px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Music size={24} />
                    </button>
                </div>
            </div>

            {/* Barra Flotante Centrada (Búsqueda Inline + Reproducción) */}
            <div style={{ position: 'absolute', bottom: '25px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
                <AnimatePresence>
                    {(showHymnModal || showBibleModal || overlayData.mode === 'himno' || overlayData.mode === 'bible') && (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            style={{
                                background: 'rgba(20, 30, 45, 0.75)',
                                padding: '8px 12px',
                                borderRadius: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                backdropFilter: 'blur(16px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                                minWidth: (showHymnModal || showBibleModal) ? '600px' : '350px',
                                justifyContent: 'space-between',
                                overflow: 'hidden'
                            }}
                        >
                            
                            {/* Sección Búsqueda Inline */}
                            <motion.div layout style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                {showBibleModal ? (
                                    <>
                                        <select
                                            value={selectedBibleBook.id}
                                            onChange={(e) => {
                                                const book = BIBLE_BOOKS.find(b => b.id === parseInt(e.target.value));
                                                if (book) { setSelectedBibleBook(book); setSelectedBibleChapter(1); }
                                            }}
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '15px', padding: '8px 12px', color: '#fff', outline: 'none', cursor: 'pointer', flex: 1 }}
                                        >
                                            {BIBLE_BOOKS.map(b => (
                                                <option key={b.id} value={b.id} style={{ background: '#0F172A' }}>{b.name}</option>
                                            ))}
                                        </select>
                                        
                                        <select
                                            value={selectedBibleChapter}
                                            onChange={(e) => setSelectedBibleChapter(parseInt(e.target.value))}
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '15px', padding: '8px 12px', color: '#fff', outline: 'none', cursor: 'pointer', width: '80px' }}
                                        >
                                            {Array.from({ length: selectedBibleBook.chapters }, (_, i) => i + 1).map(c => (
                                                <option key={c} value={c} style={{ background: '#0F172A' }}>Cap {c}</option>
                                            ))}
                                        </select>

                                        <input 
                                            type="number" 
                                            placeholder="Vers..."
                                            value={inlineVerseStr}
                                            onChange={(e) => setInlineVerseStr(e.target.value)}
                                            onKeyDown={(e) => { if(e.key === 'Enter') handleProjectBibleInline(); }}
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '15px', padding: '8px 12px', color: '#fff', outline: 'none', width: '80px' }}
                                        />
                                    </>
                                ) : showHymnModal ? (
                                    <>
                                        <Search size={18} color="#94A3B8" style={{ marginLeft: '10px' }} />
                                        <input 
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Buscar himno..."
                                            value={hymnSearchTerm}
                                            onChange={(e) => setHymnSearchTerm(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && hymnSuggestions.length > 0) {
                                                    handleProjectHymn(hymnSuggestions[0]);
                                                }
                                            }}
                                            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', flex: 1, fontSize: '0.95rem' }}
                                            autoFocus
                                        />
                                        
                                        <AnimatePresence>
                                            {showHymnSuggestions && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    style={{ position: 'absolute', bottom: '120%', left: 0, right: 0, background: 'rgba(20, 30, 45, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '14px', padding: '8px', backdropFilter: 'blur(10px)', boxShadow: '0 -10px 30px rgba(0,0,0,0.5)', zIndex: 60 }}
                                                >
                                                    {hymnSuggestions.map(h => (
                                                        <div 
                                                            key={h.number}
                                                            onClick={() => handleProjectHymn(h)}
                                                            style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', color: '#fff', transition: 'background 0.2s' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <span>#{h.number} - {h.title}</span>
                                                            <span style={{ color: '#A78BFA', fontSize: '0.8rem' }}>Proyectar ➔</span>
                                                        </div>
                                                    ))}
                                                    {hymnSuggestions.length === 0 && (
                                                        <div style={{ padding: '10px', color: '#94A3B8', textAlign: 'center' }}>No se encontraron himnos.</div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <div 
                                        onClick={() => {
                                            if (overlayData.mode === 'himno') {
                                                setShowHymnModal(true); setShowBibleModal(false);
                                            } else {
                                                setShowBibleModal(true); setShowHymnModal(false);
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '20px',
                                            padding: '8px 14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    >
                                        <Search size={16} color="#94A3B8" />
                                        <span style={{ color: '#64748B', fontSize: '0.9rem' }}>
                                            {overlayData.mode === 'himno' ? 'Buscar himno...' : 'Buscar versículo...'}
                                        </span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Controles de Reproducción */}
                            <motion.div layout style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '15px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                                {overlayData.mode === 'himno' && (
                                    <button
                                        onClick={handlePrevHymnNav}
                                        title="Himno Anterior (PageUp)"
                                        style={{ background: 'transparent', border: 'none', color: '#E2E8F0', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <SkipBack size={18} />
                                    </button>
                                )}

                                <button
                                    onClick={handlePrevNav}
                                    title={overlayData.mode === 'himno' ? "Estrofa Anterior (◀ / Flecha Izq)" : "Versículo Anterior (◀ / Flecha Izq)"}
                                    style={{ background: 'transparent', border: 'none', color: '#E2E8F0', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <ChevronLeft size={22} />
                                </button>

                                <button
                                    onClick={handleMainPlayButton}
                                    title={showBibleModal || showHymnModal ? "Proyectar" : "Sincronizar"}
                                    style={{ 
                                        background: '#1E40AF', 
                                        border: 'none', 
                                        color: '#fff', 
                                        cursor: 'pointer', 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '50%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 10px rgba(30, 64, 175, 0.5)'
                                    }}
                                >
                                    <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
                                </button>

                                <button
                                    onClick={handleNextNav}
                                    title={overlayData.mode === 'himno' ? "Siguiente Estrofa (▶ / Flecha Der)" : "Siguiente Versículo (▶ / Flecha Der)"}
                                    style={{ background: 'transparent', border: 'none', color: '#E2E8F0', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <ChevronRight size={22} />
                                </button>

                            {overlayData.mode === 'himno' && (
                                <button
                                    onClick={handleNextHymnNav}
                                    title="Siguiente Himno (PageDown)"
                                    style={{ background: 'transparent', border: 'none', color: '#E2E8F0', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <SkipForward size={18} />
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

            {/* Esquina Inferior Derecha: Botón flotante para Pantalla Completa (F11 / Clic) */}
            <div style={{ position: 'absolute', bottom: '25px', right: '30px', zIndex: 50 }}>
                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Salir Pantalla Completa (F11)" : "Alternar Pantalla Completa (F11)"}
                    style={{
                        background: 'rgba(20, 30, 45, 0.75)',
                        border: 'none',
                        color: '#94A3B8',
                        padding: '14px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                    {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                </button>
            </div>
        </>
    );
};

export default LocalSearchOverlay;
