import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import apiClient from '../../api/client';
import { supabase } from '../../api/supabaseClient';
import fastapiClient from '../../api/fastapiClient';
import himnarioDataRaw from '../../data/himnario.json';

const himnarioData = himnarioDataRaw.map(hymn => {
    const chorus = hymn.stanzas?.find(s => s.type === 'chorus' || s.number === '' || String(s.number).toLowerCase() === 'coro' || s.number === 0);
    if (chorus) {
        const expandedStanzas = [];
        const onlyStanzas = hymn.stanzas.filter(s => s !== chorus);
        onlyStanzas.forEach(s => { 
            expandedStanzas.push(s); 
            expandedStanzas.push(chorus); 
        });
        return { ...hymn, stanzas: expandedStanzas };
    }
    return hymn;
});

// Import newly created components
import BackgroundManager from './ProyectorOver/components/BackgroundManager';
import BibleHymnOverlay from './ProyectorOver/components/BibleHymnOverlay';
import AnnouncementOverlay from './ProyectorOver/components/AnnouncementOverlay';
import LowerThirdOverlay from './ProyectorOver/components/LowerThirdOverlay';
import CountdownOverlay from './ProyectorOver/components/CountdownOverlay';
import BannersOverlay from './ProyectorOver/components/BannersOverlay';
import LocalSearchOverlay from './ProyectorOver/components/LocalSearchOverlay';

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


const ProyectorOverlay = () => {
    const [overlayData, setOverlayData] = useState({
        mode: 'hidden',
        title: '',
        content: '',
        subText: '',
        template: 'classic',
        bg_color: '#0F172A',
        text_color: '#ffffff',
        accent_color: '#f59e0b'
    });

    const [now, setNow] = useState(Date.now());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showHymnModal, setShowHymnModal] = useState(false);
    const [hymnSearchTerm, setHymnSearchTerm] = useState('');
    const [showBibleModal, setShowBibleModal] = useState(false);
    const [selectedBibleBook, setSelectedBibleBook] = useState(BIBLE_BOOKS[42]); // Juan
    const [selectedBibleChapter, setSelectedBibleChapter] = useState(3);
    const [bibleVerses, setBibleVerses] = useState([]);
    const [loadingBible, setLoadingBible] = useState(false);
    const [currentHymn, setCurrentHymn] = useState(null);
    const [currentStanzaIdx, setCurrentStanzaIdx] = useState(0);
    const [currentVerseIdx, setCurrentVerseIdx] = useState(0);

    const stateRef = useRef({});
    const channelRef = useRef(null);

    useEffect(() => {
        if (!showBibleModal) return;
        const fetchChapter = async () => {
            setLoadingBible(true);
            try {
                const res = await fastapiClient.get('/bible/chapter', {
                    params: { book: selectedBibleBook.name, chapter: selectedBibleChapter }
                });
                if (res.data && res.data.length > 0) {
                    setBibleVerses(res.data);
                    setLoadingBible(false);
                    return;
                }
            } catch (apiErr) {}
            try {
                const response = await fetch(`https://bolls.life/get-chapter/RV1960/${selectedBibleBook.id}/${selectedBibleChapter}/`);
                const data = await response.json();
                setBibleVerses(data);
            } catch (err) {} finally {
                setLoadingBible(false);
            }
        };
        fetchChapter();
    }, [selectedBibleBook, selectedBibleChapter, showBibleModal]);

    useEffect(() => {
        if (overlayData.mode === 'countdown' || overlayData.mode === 'live_status') {
            const interval = setInterval(() => setNow(Date.now()), 1000);
            return () => clearInterval(interval);
        }
    }, [overlayData.mode, overlayData.targetTime]);

    const projectToAll = (mode, title, content, extra = {}) => {
        const payload = {
            mode,
            title,
            content,
            template: extra.template || overlayData.template || 'classic',
            subText: extra.subText || '',
            bg_color: overlayData.bg_color || '#0F172A',
            text_color: overlayData.text_color || '#ffffff',
            accent_color: overlayData.accent_color || '#f59e0b'
        };
        setOverlayData(payload);
        try { localStorage.setItem('obs_overlay_data', JSON.stringify(payload)); } catch(e){}
        if (channelRef.current) {
            channelRef.current.send({ type: 'broadcast', event: 'update_overlay', payload });
        }
    };

    const handlePrevHymnNav = () => {
        channelRef.current?.send({ type: 'broadcast', event: 'remote_keydown', payload: { key: 'PageUp' } });
        if (overlayData.mode === 'himno' && currentHymn) {
            const idx = himnarioData.findIndex(h => h.number === currentHymn.number);
            const prevIdx = (idx - 1 + himnarioData.length) % himnarioData.length;
            const prevHymn = himnarioData[prevIdx];
            setCurrentHymn(prevHymn);
            setCurrentStanzaIdx(0);
            const s = prevHymn.stanzas && prevHymn.stanzas[0] ? prevHymn.stanzas[0] : { text: '', number: 1 };
            projectToAll('himno', `Himno ${prevHymn.number} - ${prevHymn.title}`, s.text, {
                template: overlayData.template || 'classic',
                subText: s.number ? `Estrofa ${s.number}` : 'Coro'
            });
            channelRef.current?.send({ type: 'broadcast', event: 'remote_select_hymn', payload: { hymn: prevHymn } });
        }
    };

    const handleNextHymnNav = () => {
        channelRef.current?.send({ type: 'broadcast', event: 'remote_keydown', payload: { key: 'PageDown' } });
        if (overlayData.mode === 'himno' && currentHymn) {
            const idx = himnarioData.findIndex(h => h.number === currentHymn.number);
            const nextIdx = (idx + 1) % himnarioData.length;
            const nextHymn = himnarioData[nextIdx];
            setCurrentHymn(nextHymn);
            setCurrentStanzaIdx(0);
            const s = nextHymn.stanzas && nextHymn.stanzas[0] ? nextHymn.stanzas[0] : { text: '', number: 1 };
            projectToAll('himno', `Himno ${nextHymn.number} - ${nextHymn.title}`, s.text, {
                template: overlayData.template || 'classic',
                subText: s.number ? `Estrofa ${s.number}` : 'Coro'
            });
            channelRef.current?.send({ type: 'broadcast', event: 'remote_select_hymn', payload: { hymn: nextHymn } });
        }
    };

    const handlePrevNav = () => {
        channelRef.current?.send({ type: 'broadcast', event: 'remote_keydown', payload: { key: 'ArrowLeft' } });
        if (overlayData.mode === 'bible' && bibleVerses.length > 0) {
            if (currentVerseIdx > 0) {
                const prevIdx = currentVerseIdx - 1;
                const v = bibleVerses[prevIdx];
                setCurrentVerseIdx(prevIdx);
                projectToAll('bible', `${selectedBibleBook.name} ${selectedBibleChapter}:${v.verse}`, v.text, { template: overlayData.template || 'classic' });
            }
        } else if (overlayData.mode === 'himno' && currentHymn && currentHymn.stanzas) {
            if (currentStanzaIdx > 0) {
                const prevIdx = currentStanzaIdx - 1;
                const s = currentHymn.stanzas[prevIdx];
                setCurrentStanzaIdx(prevIdx);
                projectToAll('himno', `Himno ${currentHymn.number} - ${currentHymn.title}`, s.text, {
                    template: overlayData.template || 'classic',
                    subText: s.number ? `Estrofa ${s.number}` : 'Coro'
                });
            }
        }
    };

    const handleNextNav = () => {
        channelRef.current?.send({ type: 'broadcast', event: 'remote_keydown', payload: { key: 'ArrowRight' } });
        if (overlayData.mode === 'bible' && bibleVerses.length > 0) {
            if (currentVerseIdx < bibleVerses.length - 1) {
                const nextIdx = currentVerseIdx + 1;
                const v = bibleVerses[nextIdx];
                setCurrentVerseIdx(nextIdx);
                projectToAll('bible', `${selectedBibleBook.name} ${selectedBibleChapter}:${v.verse}`, v.text, { template: overlayData.template || 'classic' });
            }
        } else if (overlayData.mode === 'himno' && currentHymn && currentHymn.stanzas) {
            if (currentStanzaIdx < currentHymn.stanzas.length - 1) {
                const nextIdx = currentStanzaIdx + 1;
                const s = currentHymn.stanzas[nextIdx];
                setCurrentStanzaIdx(nextIdx);
                projectToAll('himno', `Himno ${currentHymn.number} - ${currentHymn.title}`, s.text, {
                    template: overlayData.template || 'classic',
                    subText: s.number ? `Estrofa ${s.number}` : 'Coro'
                });
            }
        }
    };

    useEffect(() => {
        stateRef.current = {
            overlayData,
            currentHymn,
            currentStanzaIdx,
            currentVerseIdx,
            bibleVerses,
            selectedBibleBook,
            selectedBibleChapter,
            handleNextNav,
            handlePrevNav,
            handleNextHymnNav,
            handlePrevHymnNav
        };
    });

    useEffect(() => {
        const initial = localStorage.getItem('obs_overlay_data');
        if (initial) {
            try { setOverlayData(JSON.parse(initial)); } catch(e){}
        }


        const channel = supabase.channel('obs_public_channel');
        channelRef.current = channel;
        
        channel.on('broadcast', { event: 'update_overlay' }, (payload) => {
            const data = payload.payload;
            if (data) {
                if (data.target && data.target !== 'all' && data.target !== 'proyector') {
                    return;
                }
                setOverlayData(data);
                try { localStorage.setItem('obs_overlay_data', JSON.stringify(data)); } catch(e){}
                if (data.mode === 'himno' && data.title) {
                    const match = data.title.match(/Himno\s+(\d+)/i);
                    if (match) {
                        const found = himnarioData.find(h => h.number === parseInt(match[1]));
                        if (found) {
                            setCurrentHymn(found);
                            if (found.stanzas) {
                                const stIdx = found.stanzas.findIndex(s => s.text === data.content);
                                if (stIdx !== -1) setCurrentStanzaIdx(stIdx);
                            }
                        }
                    }
                } else if (data.mode === 'bible' && data.title) {
                    const match = data.title.match(/^(.+)\s+(\d+):(\d+)$/);
                    if (match) {
                        const bName = match[1];
                        const cNum = parseInt(match[2]);
                        const vNum = parseInt(match[3]);
                        const foundBook = BIBLE_BOOKS.find(b => b.name.toLowerCase() === bName.toLowerCase());
                        if (foundBook) setSelectedBibleBook(foundBook);
                        setSelectedBibleChapter(cNum);
                        if (vNum > 0) setCurrentVerseIdx(vNum - 1);
                    }
                }
            }
        }).subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({ type: 'broadcast', event: 'request_sync', payload: {} });
            }
        });

        const handleKeyDown = async (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                if (e.key === 'Escape') {
                    setShowHymnModal(false);
                    setShowBibleModal(false);
                }
                return;
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                if (stateRef.current.handleNextNav) stateRef.current.handleNextNav();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (stateRef.current.handlePrevNav) stateRef.current.handlePrevNav();
            } else if (e.key === 'PageDown') {
                e.preventDefault();
                if (stateRef.current.handleNextHymnNav) stateRef.current.handleNextHymnNav();
            } else if (e.key === 'PageUp') {
                e.preventDefault();
                if (stateRef.current.handlePrevHymnNav) stateRef.current.handlePrevHymnNav();
            } else if (e.key === 'f' || e.key === 'F' || e.key === 'F11') {
                toggleFullscreen();
            } else if (e.key === 'h' || e.key === 'H' || e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                setShowHymnModal(prev => !prev);
                setShowBibleModal(false);
            } else if (e.key === 'v' || e.key === 'V' || e.key === 'i' || e.key === 'I') {
                e.preventDefault();
                setShowBibleModal(prev => !prev);
                setShowHymnModal(false);
            } else if (e.key === 'Escape') {
                setShowHymnModal(false);
                setShowBibleModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    const getFormattedRemaining = () => {
        if (!overlayData.targetTime) return '00:00';
        let diff = Math.floor((overlayData.targetTime - now) / 1000);
        if (overlayData.mode === 'countdown') {
            if (diff <= 0) return '00:00';
            const m = Math.floor(diff / 60);
            const s = diff % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        } else {
            const absDiff = Math.abs(diff);
            const m = Math.floor(absDiff / 60);
            const s = absDiff % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
    };

    const overlayStyle = {
        '--bg-color': overlayData.bg_color || '#0F172A',
        '--text-color': overlayData.text_color || '#ffffff',
        '--accent-color': overlayData.accent_color || '#f59e0b',
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: 'transparent',
            fontFamily: 'Inter, sans-serif'
        }}>
            <BackgroundManager mode={overlayData.mode} />
            <style>
                {`
                    html, body, #root {
                        margin: 0; padding: 0; overflow: hidden;
                        background-color: #090E17 !important;
                    }
                `}
            </style>

            <AnimatePresence mode="wait">
                {(overlayData.mode === 'bible' || overlayData.mode === 'himno') ? (
                    <BibleHymnOverlay key="bibleHymn" overlayData={overlayData} overlayStyle={overlayStyle} />
                ) : (overlayData.mode === 'preacher' || overlayData.mode === 'anuncio' || overlayData.mode === 'announcement') ? (
                    <LowerThirdOverlay key="preacher" overlayData={overlayData} overlayStyle={overlayStyle} />
                ) : overlayData.mode === 'countdown' ? (
                    <CountdownOverlay key="countdown" overlayData={overlayData} overlayStyle={overlayStyle} now={now} />
                ) : overlayData.mode === 'live_status' ? (
                    <motion.div
                        key="live_status"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                    >
                        <h2 style={{ fontSize: '4rem', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.8)', marginBottom: '20px', fontWeight: 900 }}>
                            {overlayData.title}
                        </h2>
                        <div style={{ fontSize: '22vw', fontWeight: 900, color: (overlayData.isOvertime || (overlayData.targetTime - now) < 0) ? '#EF4444' : '#fff', lineHeight: 1, textShadow: '0 10px 40px rgba(0,0,0,0.9)', fontFamily: 'monospace' }}>
                            {getFormattedRemaining()}
                        </div>
                        <p style={{ color: '#fff', fontSize: '2.5vw', letterSpacing: '0.2em', fontWeight: 800, marginTop: '30px', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                            {(overlayData.isOvertime || (overlayData.targetTime - now) < 0) ? 'TIEMPO EXCEDIDO' : 'TIEMPO RESTANTE'}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
                    >
                        <div style={{ textAlign: 'center', opacity: 0.35 }}>
                            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, color: '#fff', letterSpacing: '12px', margin: 0, fontFamily: 'Moonrising, sans-serif' }}>
                                OASIS ESTUDIO
                            </h1>
                            <p style={{ fontSize: '1.5rem', color: '#fff', letterSpacing: '6px', fontWeight: 700, marginTop: '15px', textTransform: 'uppercase' }}>
                                PROYECCIÓN EN VIVO AUDITORIO
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <LocalSearchOverlay 
                overlayData={overlayData}
                showHymnModal={showHymnModal} setShowHymnModal={setShowHymnModal}
                showBibleModal={showBibleModal} setShowBibleModal={setShowBibleModal}
                isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen}
                handlePrevNav={handlePrevNav} handleNextNav={handleNextNav}
                handlePrevHymnNav={handlePrevHymnNav} handleNextHymnNav={handleNextHymnNav}
                hymnSearchTerm={hymnSearchTerm} setHymnSearchTerm={setHymnSearchTerm}
                himnarioData={himnarioData}
                setCurrentHymn={setCurrentHymn} setCurrentStanzaIdx={setCurrentStanzaIdx}
                projectToAll={projectToAll} channelRef={channelRef}
                BIBLE_BOOKS={BIBLE_BOOKS}
                selectedBibleBook={selectedBibleBook} setSelectedBibleBook={setSelectedBibleBook}
                selectedBibleChapter={selectedBibleChapter} setSelectedBibleChapter={setSelectedBibleChapter}
                bibleVerses={bibleVerses} setCurrentVerseIdx={setCurrentVerseIdx}
                loadingBible={loadingBible}
            />
        </div>
    );
};

export default ProyectorOverlay;
