import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { supabase } from '../api/supabaseClient';
import apiClient from '../api/client';
import fastapiClient from '../api/fastapiClient';
import himnarioData from '../data/himnario.json';
import { useToast } from '../react-ui/components/Toast';
import { MonitorPlay, MonitorOff, BookOpen, Megaphone, ExternalLink, ChevronLeft, ChevronRight, User, LayoutTemplate, PanelBottom, PanelRight, Film, Timer, Music, Radio, Volume2, Sparkles, Send, EyeOff, Search, X, Play, Monitor, Zap, Sliders, Tv, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const AdminTransmisionInline = forwardRef(({ currentActivity, timeMetrics, serviceStartTime, isDark }, ref) => {
    const { showToast } = useToast();
    const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS[42]);
    const [selectedChapter, setSelectedChapter] = useState(3);
    const [verses, setVerses] = useState([]);
    const [selectedVerseObj, setSelectedVerseObj] = useState(null);
    const remoteTargetVerseRef = useRef(null);
    const [isLoadingVerses, setIsLoadingVerses] = useState(false);
    const [isBibleLive, setIsBibleLive] = useState(false);
    const [bibleTemplate, setBibleTemplate] = useState('classic');
    const [countdownTemplate, setCountdownTemplate] = useState('glass_center');
    const [announcement, setAnnouncement] = useState(() => {
        try { return JSON.parse(localStorage.getItem('oasis_saved_announcement')) || { title: '', content: '' }; }
        catch { return { title: '', content: '' }; }
    });
    const [preacher, setPreacher] = useState(() => {
        try { return JSON.parse(localStorage.getItem('oasis_saved_preacher')) || { name: '', title: '' }; }
        catch { return { name: '', title: '' }; }
    });
    const [announcementsList, setAnnouncementsList] = useState(() => {
        try {
            const saved = localStorage.getItem('oasis_announcements_history');
            if (saved) return JSON.parse(saved);
            return [
                { title: "OFRENDAS / DIEZMOS", content: "Es momento de adorar a Dios con nuestros diezmos y ofrendas." },
                { title: "SILENCIAR CELULARES", content: "Por favor, poner los teléfonos móviles en modo silencio durante la reunión." },
                { title: "REUNIÓN DE JÓVENES", content: "Te esperamos este sábado a las 6:00 PM en nuestro auditorio principal." },
                { title: "ESCUELA DOMINICAL", content: "Mañana domingo a las 9:00 AM para todas las edades. ¡No faltes!" },
                { title: "BIENVENIDOS A CASA", content: "Nos alegra tenerte con nosotros hoy. ¡Que Dios te bendiga!" }
            ];
        } catch { return []; }
    });

    const saveToAnnouncementsMemory = (newAnno) => {
        if (!newAnno?.title && !newAnno?.content) return;
        setAnnouncementsList(prev => {
            const filtered = prev.filter(a => a.title !== newAnno.title || a.content !== newAnno.content);
            const updated = [newAnno, ...filtered].slice(0, 15);
            localStorage.setItem('oasis_announcements_history', JSON.stringify(updated));
            return updated;
        });
        showToast('Aviso guardado en memoria', 'success');
    };

    useEffect(() => {
        localStorage.setItem('oasis_saved_announcement', JSON.stringify(announcement));
    }, [announcement]);

    useEffect(() => {
        localStorage.setItem('oasis_saved_preacher', JSON.stringify(preacher));
    }, [preacher]);

    const [preacherStyle, setPreacherStyle] = useState('classic');
    const [announcementStyle, setAnnouncementStyle] = useState('classic');
    const [activeTab, setActiveTab] = useState('biblia');
    const [activePreviewSource, setActivePreviewSource] = useState('biblia');
    const [himnarioList, setHimnarioList] = useState([]);
    const [selectedHymn, setSelectedHymn] = useState(null);
    const [selectedStanza, setSelectedStanza] = useState(null);
    const [hymnalTemplate, setHymnalTemplate] = useState('classic');
    const [audioMode, setAudioMode] = useState('letra');
    const [isLoadingHymns, setIsLoadingHymns] = useState(false);
    const [hymnSearchTerm, setHymnSearchTerm] = useState('');
    const [isHymnDropdownOpen, setIsHymnDropdownOpen] = useState(false);
    const [colors, setColors] = useState({ bg: 'rgba(18, 12, 31, 0.85)', text: '#ffffff', accent: '#f59e0b' });
    const [obsChannel, setObsChannel] = useState(null);
    const [studioMode, setStudioMode] = useState(true);
    const [obsMonitorBg, setObsMonitorBg] = useState('video');
    const [isAutoAdvanceHymn, setIsAutoAdvanceHymn] = useState(false);
    const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(15);
    const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(15);
    const [liveOverlay, setLiveOverlay] = useState(() => {
        try { return JSON.parse(localStorage.getItem('obs_overlay_data')) || { mode: 'hidden' }; }
        catch { return { mode: 'hidden' }; }
    });

    useEffect(() => {
        const loadHymns = async () => {
            setIsLoadingHymns(true);
            try {
                // 1. Intentar cargar desde el microservicio especializado (backend-fastapi)
                const res = await fastapiClient.get('/hymns');
                if (res.data && res.data.length > 0) {
                    const mappedData = res.data.map(h => ({
                        ...h,
                        mp3Url: h.audio_url || h.mp3Url,
                        mp3UrlInstr: h.instrumental_url || h.mp3UrlInstr,
                        stanzas: (h.slides && h.slides.length > 0) ? h.slides.map(s => ({
                            type: s.slide_type,
                            number: s.slide_number,
                            text: Array.isArray(s.lines) ? s.lines.join('\r\n') : s.lines,
                            start_timestamp: s.start_timestamp,
                            end_timestamp: s.end_timestamp
                        })) : [{ type: 'stanza', number: 1, text: '(Instrumental)' }]
                    }));
                    setHimnarioList(mappedData);
                    setSelectedHymn(mappedData[0]);
                    setSelectedStanza(mappedData[0].stanzas[0]);
                    setIsLoadingHymns(false);
                    return;
                }
            } catch (apiErr) {
                console.warn("⚠️ FastAPI no disponible para Himnario. Usando respaldo local (himnario.json)...", apiErr.message);
            }

            // 2. Fallback automático al archivo JSON local
            try {
                let data = himnarioData;
                data = data.map(hymn => {
                    const chorus = hymn.stanzas.find(s => s.type === 'chorus' || s.number === '' || String(s.number).toLowerCase() === 'coro' || s.number === 0);
                    if (chorus) {
                        const expandedStanzas = [];
                        const onlyStanzas = hymn.stanzas.filter(s => s !== chorus);
                        onlyStanzas.forEach(s => { expandedStanzas.push(s); expandedStanzas.push(chorus); });
                        return { ...hymn, stanzas: expandedStanzas };
                    }
                    return hymn;
                });
                if (data && data.length > 0) {
                    setHimnarioList(data);
                    setSelectedHymn(data[0]);
                    setSelectedStanza(data[0].stanzas[0]);
                }
            } catch (err) { console.error("Error cargando himnos locales:", err); } finally { setIsLoadingHymns(false); }
        };
        loadHymns();
    }, []);

    const handleHymnSelect = (hymn) => {
        setSelectedHymn(hymn);
        setSelectedStanza(hymn.stanzas[0]);
        setHymnSearchTerm(`${hymn.number} - ${hymn.title}`);
        setIsHymnDropdownOpen(false);
        setActivePreviewSource('himnario');
    };

    useEffect(() => {
        if (selectedHymn && !isHymnDropdownOpen) setHymnSearchTerm(`${selectedHymn.number} - ${selectedHymn.title}`);
    }, [selectedHymn, isHymnDropdownOpen]);

    const normalizeString = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const filteredHymns = himnarioList.filter(h => h.number.toString().includes(normalizeString(hymnSearchTerm)) || normalizeString(h.title).includes(normalizeString(hymnSearchTerm)));

    const handleStanzaChange = (e) => {
        const idx = parseInt(e.target.value);
        if (selectedHymn && selectedHymn.stanzas[idx]) {
            setSelectedStanza(selectedHymn.stanzas[idx]);
            setActivePreviewSource('himnario');
        }
    };

    const currentStanzaIndex = selectedHymn?.stanzas.findIndex(s => s === selectedStanza) ?? -1;
    const canGoPrevStanza = currentStanzaIndex > 0;
    const canGoNextStanza = selectedHymn && currentStanzaIndex >= 0 && currentStanzaIndex < selectedHymn.stanzas.length - 1;

    const handlePrevStanza = () => {
        if (canGoPrevStanza) {
            const newStanza = selectedHymn.stanzas[currentStanzaIndex - 1];
            setSelectedStanza(newStanza);
            setActivePreviewSource('himnario');
            if (isBibleLive) pushToOBS('himno', `Himno ${selectedHymn.number} - ${selectedHymn.title}`, newStanza.text, { template: hymnalTemplate, subText: newStanza.number ? `Estrofa ${newStanza.number}` : 'Coro' });
        }
    };

    const handleNextStanza = () => {
        if (canGoNextStanza) {
            const newStanza = selectedHymn.stanzas[currentStanzaIndex + 1];
            setSelectedStanza(newStanza);
            setActivePreviewSource('himnario');
            if (isBibleLive) pushToOBS('himno', `Himno ${selectedHymn.number} - ${selectedHymn.title}`, newStanza.text, { template: hymnalTemplate, subText: newStanza.number ? `Estrofa ${newStanza.number}` : 'Coro' });
        }
    };

    const handlePrevHymn = () => {
        if (!selectedHymn || !himnarioList.length) return;
        const idx = himnarioList.findIndex(h => h.number === selectedHymn.number);
        const prevIdx = (idx - 1 + himnarioList.length) % himnarioList.length;
        const prevHymn = himnarioList[prevIdx];
        handleHymnSelect(prevHymn);
        if (isBibleLive && prevHymn.stanzas && prevHymn.stanzas[0]) {
            pushToOBS('himno', `Himno ${prevHymn.number} - ${prevHymn.title}`, prevHymn.stanzas[0].text, { template: hymnalTemplate, subText: prevHymn.stanzas[0].number ? `Estrofa ${prevHymn.stanzas[0].number}` : 'Coro' });
        }
    };

    const handleNextHymn = () => {
        if (!selectedHymn || !himnarioList.length) return;
        const idx = himnarioList.findIndex(h => h.number === selectedHymn.number);
        const nextIdx = (idx + 1) % himnarioList.length;
        const nextHymn = himnarioList[nextIdx];
        handleHymnSelect(nextHymn);
        if (isBibleLive && nextHymn.stanzas && nextHymn.stanzas[0]) {
            pushToOBS('himno', `Himno ${nextHymn.number} - ${nextHymn.title}`, nextHymn.stanzas[0].text, { template: hymnalTemplate, subText: nextHymn.stanzas[0].number ? `Estrofa ${nextHymn.stanzas[0].number}` : 'Coro' });
        }
    };

    useEffect(() => {
        const fetchChapter = async () => {
            setIsLoadingVerses(true);
            try {
                // 1. Intentar cargar desde el microservicio indexado (backend-fastapi)
                const res = await fastapiClient.get('/bible/chapter', {
                    params: { book: selectedBook.name, chapter: selectedChapter }
                });
                if (res.data && res.data.length > 0) {
                    setVerses(res.data);
                    const targetV = remoteTargetVerseRef.current ? res.data.find(v => v.verse === remoteTargetVerseRef.current) : null;
                    if (targetV) {
                        setSelectedVerseObj(targetV);
                        remoteTargetVerseRef.current = null;
                    } else {
                        setSelectedVerseObj(prev => (prev && res.data.some(v => v.verse === prev.verse)) ? prev : (res.data[0] || null));
                    }
                    setIsLoadingVerses(false);
                    return;
                }
            } catch (apiErr) {
                console.warn("⚠️ FastAPI no disponible para Biblia. Consultando servicio secundario...", apiErr.message);
            }

            // 2. Fallback automático a bolls.life
            try {
                const response = await fetch(`https://bolls.life/get-chapter/RV1960/${selectedBook.id}/${selectedChapter}/`);
                const data = await response.json();
                setVerses(data);
                const targetV = remoteTargetVerseRef.current ? data.find(v => v.verse === remoteTargetVerseRef.current) : null;
                if (targetV) {
                    setSelectedVerseObj(targetV);
                    remoteTargetVerseRef.current = null;
                } else {
                    setSelectedVerseObj(prev => (prev && data.some(v => v.verse === prev.verse)) ? prev : (data[0] || null));
                }
            } catch (err) { showToast("Error cargando versículos.", "error"); } finally { setIsLoadingVerses(false); }
        };
        fetchChapter();
    }, [selectedBook, selectedChapter]);

    const handleVerseChange = (e) => {
        const v = verses.find(ver => ver.verse === parseInt(e.target.value));
        setSelectedVerseObj(v);
        setActivePreviewSource('biblia');
    };

    const currentVerseIndex = verses.findIndex(v => v.verse === selectedVerseObj?.verse);
    const canGoPrev = currentVerseIndex > 0;
    const canGoNext = currentVerseIndex >= 0 && currentVerseIndex < verses.length - 1;

    const handlePrevVerse = () => {
        if (canGoPrev) {
            const newVerse = verses[currentVerseIndex - 1];
            setSelectedVerseObj(newVerse);
            setActivePreviewSource('biblia');
            if (isBibleLive) pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${newVerse.verse}`, newVerse.text, { template: bibleTemplate });
        }
    };

    const handleNextVerse = () => {
        if (canGoNext) {
            const newVerse = verses[currentVerseIndex + 1];
            setSelectedVerseObj(newVerse);
            setActivePreviewSource('biblia');
            if (isBibleLive) pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${newVerse.verse}`, newVerse.text, { template: bibleTemplate });
        }
    };

    const handleTemplateChange = (tmpl) => {
        if (activePreviewSource === 'biblia') {
            setBibleTemplate(tmpl);
            if (isBibleLive && selectedVerseObj) pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${selectedVerseObj.verse}`, selectedVerseObj.text, { template: tmpl });
        } else {
            setHymnalTemplate(tmpl);
            if (isBibleLive && selectedStanza) pushToOBS('himno', `Himno ${selectedHymn?.number}`, selectedStanza.text, { template: tmpl, subText: selectedStanza.number ? `Estrofa ${selectedStanza.number}` : 'Coro' });
        }
    };

    const stateRef = useRef({});
    useEffect(() => {
        stateRef.current = {
            remoteTargetVerseRef,
            hymnalTemplate,
            bibleTemplate,
            selectedHymn,
            himnarioList,
            isBibleLive,
            pushToOBS,
            handleHymnSelect,
            handlePrevHymn,
            handleNextHymn,
            setSelectedBook,
            setSelectedChapter,
            setSelectedVerseObj,
            setIsBibleLive,
            setActivePreviewSource,
            setActiveTab
        };
    });

    useEffect(() => {
        const channel = supabase.channel('obs_public_channel');
        channel
            .on('broadcast', { event: 'request_sync' }, async () => {
                const lastData = localStorage.getItem('obs_overlay_data');
                if (lastData) await channel.send({ type: 'broadcast', event: 'update_overlay', payload: JSON.parse(lastData) });
            })
            .on('broadcast', { event: 'update_overlay' }, ({ payload }) => {
                if (payload) {
                    setLiveOverlay(payload);
                    localStorage.setItem('obs_overlay_data', JSON.stringify(payload));
                    if (payload.mode !== 'hidden') {
                        setIsBibleLive(true);
                        if (payload.mode === 'bible') {
                            setActivePreviewSource('biblia');
                            setActiveTab('biblia');
                        } else if (payload.mode === 'himno') {
                            setActivePreviewSource('himnario');
                            setActiveTab('himnario');
                        } else if (payload.mode === 'lower_third' || payload.mode === 'predicador') {
                            setActivePreviewSource('predicador');
                            if (payload.title || payload.content) {
                                setPreacher({ name: payload.title || '', title: payload.content || '' });
                            }
                        } else if (payload.mode === 'announcement' || payload.mode === 'anuncio') {
                            setActivePreviewSource('anuncio');
                            if (payload.title || payload.content) {
                                setAnnouncement({ title: payload.title || '', content: payload.content || '' });
                            }
                        }
                    } else {
                        setIsBibleLive(false);
                    }
                }
            })
            .on('broadcast', { event: 'remote_keydown' }, ({ payload }) => {
                if (payload && payload.key) {
                    if (payload.key === 'ArrowRight' || payload.key === 'ArrowDown') {
                        const nextStanzaBtn = document.getElementById('btn-next-stanza');
                        const nextVerseBtn = document.getElementById('btn-next-verse');
                        if (nextStanzaBtn && !nextStanzaBtn.disabled) nextStanzaBtn.click();
                        else if (nextVerseBtn && !nextVerseBtn.disabled) nextVerseBtn.click();
                    }
                    else if (payload.key === 'ArrowLeft' || payload.key === 'ArrowUp') {
                        const prevStanzaBtn = document.getElementById('btn-prev-stanza');
                        const prevVerseBtn = document.getElementById('btn-prev-verse');
                        if (prevStanzaBtn && !prevStanzaBtn.disabled) prevStanzaBtn.click();
                        else if (prevVerseBtn && !prevVerseBtn.disabled) prevVerseBtn.click();
                    }
                    else if (payload.key === 'PageDown' || payload.key === 'NextHymn') {
                        const nextHymnBtn = document.getElementById('btn-next-hymn');
                        if (nextHymnBtn && !nextHymnBtn.disabled) nextHymnBtn.click();
                        else if (stateRef.current.handleNextHymn) stateRef.current.handleNextHymn();
                    }
                    else if (payload.key === 'PageUp' || payload.key === 'PrevHymn') {
                        const prevHymnBtn = document.getElementById('btn-prev-hymn');
                        if (prevHymnBtn && !prevHymnBtn.disabled) prevHymnBtn.click();
                        else if (stateRef.current.handlePrevHymn) stateRef.current.handlePrevHymn();
                    }
                }
            })
            .on('broadcast', { event: 'remote_select_hymn' }, ({ payload }) => {
                if (payload && payload.hymn && stateRef.current.himnarioList) {
                    const targetNum = payload.hymn.number;
                    const found = stateRef.current.himnarioList.find(h => h.number === targetNum) || payload.hymn;
                    if (stateRef.current.handleHymnSelect) {
                        stateRef.current.handleHymnSelect(found);
                    }
                    if (found.stanzas && found.stanzas[0] && stateRef.current.pushToOBS) {
                        stateRef.current.pushToOBS('himno', `Himno ${found.number} - ${found.title}`, found.stanzas[0].text, { template: stateRef.current.hymnalTemplate || 'classic', subText: found.stanzas[0].number ? `Estrofa ${found.stanzas[0].number}` : 'Coro' });
                        setIsBibleLive(true);
                    }
                }
            })
            .on('broadcast', { event: 'remote_select_bible' }, ({ payload }) => {
                if (payload && payload.book && payload.chapter && payload.verse && stateRef.current.pushToOBS) {
                    const verseText = payload.verse.text;
                    const title = `${payload.book.name} ${payload.chapter}:${payload.verse.verse}`;
                    if (stateRef.current.remoteTargetVerseRef) stateRef.current.remoteTargetVerseRef.current = payload.verse.verse;
                    if (stateRef.current.setSelectedBook) stateRef.current.setSelectedBook(payload.book);
                    if (stateRef.current.setSelectedChapter) stateRef.current.setSelectedChapter(payload.chapter);
                    if (stateRef.current.setSelectedVerseObj) stateRef.current.setSelectedVerseObj(payload.verse);
                    if (stateRef.current.setActivePreviewSource) stateRef.current.setActivePreviewSource('biblia');
                    if (stateRef.current.setActiveTab) stateRef.current.setActiveTab('biblia');
                    if (stateRef.current.setIsBibleLive) stateRef.current.setIsBibleLive(true);
                    stateRef.current.pushToOBS('bible', title, verseText, { template: stateRef.current.bibleTemplate || 'classic' });
                }
            })
            .subscribe();
        setObsChannel(channel);
        channel.send({ type: 'broadcast', event: 'request_sync' });
        return () => supabase.removeChannel(channel);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeTab === 'biblia') { document.getElementById('btn-next-verse')?.click(); }
                else { document.getElementById('btn-next-stanza')?.click(); }
            }
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeTab === 'biblia') { document.getElementById('btn-prev-verse')?.click(); }
                else { document.getElementById('btn-prev-stanza')?.click(); }
            }
            else if (e.key === 'Enter' || (e.key === ' ' && e.target === document.body)) {
                e.preventDefault();
                if (activeTab === 'biblia') { document.getElementById('btn-project-bible')?.click(); }
                else if (activeTab === 'himnario') { document.getElementById('btn-project-hymn')?.click(); }
                else { document.getElementById('btn-send-to-air')?.click(); }
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                document.getElementById('btn-clear-obs')?.click();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTab]);

    useEffect(() => {
        let timer;
        if (isAutoAdvanceHymn && selectedHymn && selectedHymn.stanzas && selectedHymn.stanzas.length > 0) {
            timer = setInterval(() => {
                setAutoAdvanceCountdown(prev => {
                    if (prev <= 1) {
                        setSelectedStanza(current => {
                            const idx = selectedHymn.stanzas.findIndex(s => s === current);
                            const nextIdx = (idx + 1) % selectedHymn.stanzas.length;
                            const nextStanza = selectedHymn.stanzas[nextIdx];
                            const subText = nextStanza.number ? `Estrofa ${nextStanza.number}` : 'Coro';
                            pushToOBS('himno', `Himno ${selectedHymn.number} - ${selectedHymn.title}`, nextStanza.text, { template: hymnalTemplate, subText });
                            setIsBibleLive(true);
                            return nextStanza;
                        });
                        return autoAdvanceSeconds;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setAutoAdvanceCountdown(autoAdvanceSeconds);
        }
        return () => clearInterval(timer);
    }, [isAutoAdvanceHymn, selectedHymn, autoAdvanceSeconds, hymnalTemplate]);

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
            localStorage.setItem('obs_overlay_data', JSON.stringify(payload));
            setLiveOverlay(payload);
            if (obsChannel) await obsChannel.send({ type: 'broadcast', event: 'update_overlay', payload });
            showToast('Enviado al aire', 'success');
        } catch (err) { showToast('Error de conexión', 'error'); }
    };

    const openOBSWindow = () => window.open('/transmision/overlay', 'OBS_WINDOW', 'width=1920,height=1080');
    const openProyectorWindow = () => window.open('/transmision/proyector', 'PROYECTOR_WINDOW', 'width=1920,height=1080');

    useImperativeHandle(ref, () => ({
        pushToOBS,
        clearAll: () => { pushToOBS('hidden', '', ''); setIsBibleLive(false); setLiveOverlay({ mode: 'hidden' }); },
        triggerTimer: (min) => pushToOBS('countdown', 'ESTAMOS COMENZANDO', '', { targetTime: Date.now() + min * 60000, template: countdownTemplate }),
        openOBSWindow,
        openProyectorWindow
    }));

    const themeStyles = {
        cardBg: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
        cardBorder: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
        cardShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px -5px rgba(0, 0, 0, 0.06)',
        headingColor: isDark ? '#FFFFFF' : '#0F172A',
        mutedColor: isDark ? 'rgba(255, 255, 255, 0.5)' : '#64748B',
        inputBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
        inputBorder: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #CBD5E1',
        tabBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9'
    };

    const actionButtonMotion = {
        whileHover: { scale: 1.03, y: -1 },
        whileTap: { scale: 0.97 },
        transition: { type: 'spring', stiffness: 500, damping: 28 }
    };

    const currentTemplate = activePreviewSource === 'biblia' ? bibleTemplate : activePreviewSource === 'himnario' ? hymnalTemplate : activePreviewSource === 'predicador' ? preacherStyle : 'classic';

    const previewOverlay = useMemo(() => {
        if (activePreviewSource === 'biblia') {
            if (!selectedVerseObj) return { mode: 'hidden' };
            return {
                mode: 'bible',
                title: `${selectedBook?.name || ''} ${selectedChapter || 1}:${selectedVerseObj.verse}`,
                content: selectedVerseObj.text,
                template: bibleTemplate
            };
        }
        if (activePreviewSource === 'himnario') {
            if (!selectedHymn || !selectedStanza) return { mode: 'hidden' };
            return {
                mode: 'himno',
                title: `Himno ${selectedHymn.number} - ${selectedHymn.title}`,
                content: selectedStanza.text,
                subText: selectedStanza.number ? `Estrofa ${selectedStanza.number}` : 'Coro',
                template: hymnalTemplate
            };
        }
        if (activePreviewSource === 'predicador') {
            return {
                mode: 'lower_third',
                title: preacher.name || 'Ps. Diego Marín',
                content: preacher.title || 'Título / Ministerio',
                template: preacherStyle
            };
        }
        if (activePreviewSource === 'anuncio') {
            return {
                mode: 'announcement',
                title: announcement.title || 'AVISO IMPORTANTE',
                content: announcement.content || 'Por favor prestar atención a las indicaciones en pantalla.',
                template: announcementStyle
            };
        }
        if (activePreviewSource === 'countdown') {
            // Si ya hay un countdown activo en el aire, mostrar esos datos reales
            const live = liveOverlay && liveOverlay.mode === 'countdown' ? liveOverlay : null;
            return {
                mode: 'countdown',
                title: live?.title || 'CUENTA REGRESIVA',
                content: live?.content || '',
                template: countdownTemplate,
                accent_color: live?.accent_color || '#F59E0B',
                bg_color: live?.bg_color || null,
                customBg: live?.customBg || null,
            };
        }
        return { mode: 'hidden' };
    }, [activePreviewSource, selectedVerseObj, selectedBook, selectedChapter, bibleTemplate, selectedHymn, selectedStanza, hymnalTemplate, preacher, preacherStyle, announcement, countdownTemplate, liveOverlay]);

    const renderExactOverlayContent = (overlay) => {
        if (!overlay || !overlay.mode || overlay.mode === 'hidden') return null;
        const tmpl = overlay.template || 'classic';

        if (overlay.mode === 'lower_third' || overlay.mode === 'predicador') {
            const bannerMotion = {
                initial: { opacity: 0, x: -120, y: 18, scale: 0.92, rotate: -1 },
                animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
                exit: { opacity: 0, x: -150, y: 24, scale: 0.9, rotate: -2 },
                transition: { type: 'spring', stiffness: 180, damping: 18, mass: 0.9 }
            };

            if (tmpl === 'ticker') {
                return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 16px 16px', pointerEvents: 'none' }}>
                        <motion.div {...bannerMotion} style={{ width: 'min(1700px, 95%)', background: 'linear-gradient(90deg, rgba(15,23,42,0.97), rgba(31,41,55,0.95))', border: '1px solid rgba(214,184,126,0.35)', borderLeft: '10px solid #D6B87E', borderRadius: '22px', boxShadow: '0 18px 45px rgba(0,0,0,0.75)', overflow: 'hidden' }}>
                            <div style={{ height: '4px', background: 'linear-gradient(90deg, #D6B87E, #A78BFA, #94A3B8)' }} />
                            <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                <motion.div
                                    initial={{ x: -30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -40, opacity: 0 }}
                                    transition={{ delay: 0.08, type: 'spring', stiffness: 220, damping: 20 }}
                                    style={{ background: 'linear-gradient(180deg, #D6B87E, #C7A66A)', color: '#111827', padding: '10px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '320px' }}
                                >
                                    <span style={{ fontSize: '0.5rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>Predicador</span>
                                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.1 }}>{overlay.title}</h5>
                                </motion.div>
                                <motion.div
                                    initial={{ x: 40, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 60, opacity: 0 }}
                                    transition={{ delay: 0.16, type: 'spring', stiffness: 180, damping: 22 }}
                                    style={{ flex: 1, padding: '10px 18px', display: 'flex', alignItems: 'center', background: 'rgba(17,24,39,0.44)' }}
                                >
                                    <span style={{ color: '#E5E7EB', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', lineHeight: 1.2, whiteSpace: 'pre-line' }}>{overlay.content}</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                );
            }

            if (tmpl === 'modern') {
                return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: '0 18px 18px 18px', pointerEvents: 'none' }}>
                        <motion.div {...bannerMotion} style={{ width: 'min(1600px, 92%)', background: 'linear-gradient(135deg, rgba(8,15,34,0.96), rgba(17,24,39,0.88))', borderRadius: '26px', border: '1px solid rgba(214,184,126,0.18)', boxShadow: '0 25px 65px rgba(0,0,0,0.75)', overflow: 'hidden' }}>
                            <div style={{ height: '10px', background: 'linear-gradient(90deg, #D6B87E, #A78BFA, #94A3B8)' }} />
                            <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                <motion.div
                                    initial={{ x: -36, opacity: 0, scaleX: 0.9 }}
                                    animate={{ x: 0, opacity: 1, scaleX: 1 }}
                                    exit={{ x: -48, opacity: 0, scaleX: 0.9 }}
                                    transition={{ delay: 0.06, type: 'spring', stiffness: 240, damping: 20 }}
                                    style={{ width: '14px', background: 'linear-gradient(180deg, #D6B87E, #C7A66A)' }} />
                                <div style={{ padding: '18px 22px 20px 22px', flex: 1 }}>
                                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <span style={{ background: 'rgba(214,184,126,0.14)', color: '#F5E6C8', border: '1px solid rgba(214,184,126,0.28)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.48rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>Noticiero</span>
                                        <h5 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.05rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{overlay.title}</h5>
                                    </motion.div>
                                    <motion.p initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} transition={{ delay: 0.16, type: 'spring', stiffness: 180, damping: 22 }} style={{ margin: 0, color: '#E2E8F0', fontSize: '0.76rem', lineHeight: 1.45, fontWeight: 700, whiteSpace: 'pre-line' }}>{overlay.content}</motion.p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                );
            }

            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: '0 0 12px 12px', pointerEvents: 'none' }}>
                    <motion.div {...bannerMotion} style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '4px 10px', borderLeft: '3px solid #D6B87E', boxShadow: '0 4px 12px rgba(0,0,0,0.7)', borderRadius: '0 6px 0 0' }}>
                        <h5 style={{ margin: 0, color: '#fff', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: 'Moonrising, sans-serif' }}>{overlay.title}</h5>
                    </motion.div>
                    <motion.div initial={{ x: 36, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 52, opacity: 0 }} transition={{ delay: 0.12, type: 'spring', stiffness: 200, damping: 20 }} style={{ background: '#D6B87E', padding: '2px 10px', display: 'inline-block', borderRadius: '0 0 6px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', alignSelf: 'flex-start' }}>
                        <span style={{ margin: 0, color: '#111827', fontSize: '0.45rem', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block' }}>{overlay.content}</span>
                    </motion.div>
                </div>
            );
        }

        if (overlay.mode === 'bible' || overlay.mode === 'himno') {
            if (tmpl === 'cinematic') {
                return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 16px 14px 16px', textAlign: 'center', background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.85) 100%)', pointerEvents: 'none' }}>
                        <p style={{ color: '#fff', fontSize: overlay.mode === 'himno' ? '0.62rem' : '0.56rem', fontStyle: 'italic', fontFamily: 'Georgia, serif', margin: '0 0 4px 0', lineHeight: 1.3, whiteSpace: 'pre-line', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>"{overlay.content}"</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.48rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'Moonrising, sans-serif' }}>{overlay.title}</span>
                            {overlay.subText && <span style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)', color: '#F59E0B', fontSize: '0.42rem', fontWeight: 800, padding: '1px 4px', borderRadius: '4px' }}>{overlay.subText}</span>}
                        </div>
                    </div>
                );
            } else if (tmpl === 'minimal') {
                return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px 10px 12px', pointerEvents: 'none' }}>
                        <div style={{ width: '100%', background: 'rgba(15, 23, 42, 0.94)', backdropFilter: 'blur(10px)', borderBottom: '3px solid #F59E0B', borderRadius: '8px', padding: '6px 10px', textAlign: 'center', boxShadow: '0 6px 15px rgba(0,0,0,0.7)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                                <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.48rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{overlay.title}</span>
                                {overlay.subText && <span style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', fontSize: '0.42rem', fontWeight: 800, padding: '1px 4px', borderRadius: '4px' }}>{overlay.subText}</span>}
                            </div>
                            <p style={{ color: '#fff', fontSize: overlay.mode === 'himno' ? '0.58rem' : '0.52rem', fontWeight: 600, margin: 0, whiteSpace: 'pre-line', lineHeight: 1.25 }}>{overlay.content}</p>
                        </div>
                    </div>
                );
            } else if (tmpl === 'sidebar') {
                return (
                    <div style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '42%', background: 'rgba(18, 12, 31, 0.92)', backdropFilter: 'blur(12px)', borderLeft: '3px solid #F59E0B', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 12px', boxShadow: '-8px 0 20px rgba(0,0,0,0.7)', textAlign: 'left' }}>
                            <div style={{ marginBottom: '4px' }}>
                                <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.48rem', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block' }}>{overlay.title}</span>
                                {overlay.subText && <span style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', fontSize: '0.40rem', fontWeight: 800, padding: '1px 4px', borderRadius: '4px', display: 'inline-block', marginTop: '1px' }}>{overlay.subText}</span>}
                            </div>
                            <p style={{ color: '#fff', fontSize: overlay.mode === 'himno' ? '0.54rem' : '0.50rem', fontWeight: 500, margin: 0, whiteSpace: 'pre-line', lineHeight: 1.25, fontFamily: overlay.mode === 'bible' ? 'Georgia, serif' : 'inherit' }}>{overlay.content}</p>
                        </div>
                    </div>
                );
            } else {
                /* Classic / Default */
                return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '0 0 12px 12px', pointerEvents: 'none' }}>
                        <div style={{ maxWidth: '85%', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', borderLeft: '4px solid #F59E0B', padding: '6px 10px', borderRadius: '0 8px 8px 0', boxShadow: '0 6px 18px rgba(0,0,0,0.7)', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                <h6 style={{ color: '#F59E0B', fontSize: '0.50rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{overlay.title}</h6>
                                {overlay.subText && <span style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', fontSize: '0.42rem', fontWeight: 800, padding: '1px 4px', borderRadius: '4px' }}>{overlay.subText}</span>}
                            </div>
                            <p style={{ color: '#fff', fontSize: overlay.mode === 'himno' ? '0.58rem' : '0.52rem', margin: 0, lineHeight: 1.25, whiteSpace: 'pre-line', fontWeight: 600, fontFamily: overlay.mode === 'bible' ? 'Georgia, serif' : 'inherit' }}>{overlay.content}</p>
                        </div>
                    </div>
                );
            }
        }

        if (overlay.mode === 'announcement') {
            if (tmpl === 'ticker') {
                return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 16px 16px', pointerEvents: 'none' }}>
                        <div style={{ width: 'min(1800px, 96%)', background: 'linear-gradient(90deg, rgba(17,24,39,0.98), rgba(15,118,110,0.96))', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.45)', boxShadow: '0 18px 45px rgba(0,0,0,0.75)', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                <div style={{ background: 'linear-gradient(180deg, #10B981, #059669)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '220px' }}>
                                    <span style={{ color: '#ECFDF5', fontSize: '0.55rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>Última hora</span>
                                </div>
                                <div style={{ padding: '12px 18px', flex: 1 }}>
                                    <h6 style={{ margin: '0 0 4px 0', color: '#6EE7B7', fontSize: '0.56rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>{overlay.title}</h6>
                                    <p style={{ margin: 0, color: '#F8FAFC', fontSize: '0.7rem', fontWeight: 800, lineHeight: 1.35, whiteSpace: 'pre-line' }}>{overlay.content}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            if (tmpl === 'modern') {
                return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}>
                        <div style={{ width: 'min(1500px, 92%)', background: 'linear-gradient(135deg, rgba(17,24,39,0.98), rgba(4,120,87,0.92))', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 25px 60px rgba(0,0,0,0.75)', overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr' }}>
                                <div style={{ background: 'linear-gradient(180deg, #10B981, #059669)', color: '#fff', padding: '20px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.48rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.85 }}>Anuncio</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 900, lineHeight: 1.1 }}>Rápido</span>
                                </div>
                                <div style={{ padding: '18px 22px' }}>
                                    <h6 style={{ margin: '0 0 8px 0', color: '#A7F3D0', fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{overlay.title}</h6>
                                    <p style={{ margin: 0, color: '#F8FAFC', fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.45, whiteSpace: 'pre-line' }}>{overlay.content}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', pointerEvents: 'none' }}>
                    <div style={{ width: '90%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))', backdropFilter: 'blur(10px)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.7)' }}>
                        <h6 style={{ color: '#D1FAE5', fontSize: '0.52rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>📢 {overlay.title}</h6>
                        <p style={{ color: '#fff', fontSize: '0.62rem', fontWeight: 800, margin: 0, lineHeight: 1.25, whiteSpace: 'pre-line' }}>{overlay.content}</p>
                    </div>
                </div>
            );
        }

        if (overlay.mode === 'countdown' || overlay.mode === 'live_status') {
            const accent = overlay.accent_color || '#60A5FA';
            const timeLabel = overlay.mode === 'countdown' ? overlay.title || 'CUENTA REGRESIVA' : overlay.title || 'TIEMPO EN VIVO';
            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '1.6rem', fontFamily: 'Moonrising, sans-serif', fontWeight: 900, color: '#fff', textShadow: '0 4px 15px rgba(0,0,0,0.8)', lineHeight: 1 }}>⏱</span>
                    <span style={{ fontSize: '0.52rem', fontWeight: 800, color: accent, letterSpacing: '1.5px', marginTop: '3px', textTransform: 'uppercase', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{timeLabel}</span>
                    {overlay.content && <span style={{ fontSize: '0.42rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', marginTop: '2px', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{overlay.content}</span>}
                </div>
            );
        }

        return null;
    };

    const renderMonitorBox = (overlay, badgeType) => {
        const isLive = badgeType === 'program';
        const badgeColor = isLive ? '#EF4444' : '#F59E0B';
        const badgeBg = isLive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
        const badgeBorder = isLive ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)';
        const overlayKey = overlay ? `${overlay.mode || 'hidden'}-${overlay.template || 'classic'}-${overlay.title || ''}-${overlay.content || ''}` : 'hidden';

        return (
            <div style={{ aspectRatio: '16 / 9', maxHeight: studioMode ? '280px' : '380px', background: 'url("https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=1200&auto=format&fit=crop") center/cover', borderRadius: '20px', position: 'relative', overflow: 'hidden', border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1'}`, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 100%)' }} />

                <div style={{ position: 'absolute', top: '10px', left: '12px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '30px', background: badgeBg, border: `1px solid ${badgeBorder}`, backdropFilter: 'blur(8px)' }}>
                    <div className="rounded-circle animate-pulse" style={{ width: 7, height: 7, background: badgeColor }} />
                    <span style={{ color: badgeColor, fontWeight: 900, fontSize: '0.62rem', letterSpacing: '0.8px' }}>
                        PREVIEW (LOCAL / PREPARACIÓN)
                    </span>
                </div>

                <div style={{ position: 'relative', zIndex: 5, flexGrow: 1, pointerEvents: 'none', width: '100%', height: '100%' }}>
                    <AnimatePresence mode="wait">
                        {(!overlay || !overlay.mode || overlay.mode === 'hidden') ? (
                            <motion.div
                                key="preview-empty"
                                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                style={{ width: '100%', height: '100%' }}
                            >
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', gap: '6px' }}>
                            <Monitor size={28} opacity={0.4} />
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '1.5px', textAlign: 'center' }}>
                                SELECCIONA UN ELEMENTO ABAJO
                            </span>
                        </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={overlayKey}
                                initial={{ opacity: 0, scale: 0.94, y: 18, rotateX: -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 12, rotateX: 6 }}
                                transition={{ type: 'spring', stiffness: 210, damping: 22, mass: 0.8 }}
                                style={{ width: '100%', height: '100%' }}
                            >
                                {renderExactOverlayContent(overlay)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    const renderProyectorMonitor = (overlay) => {
        const badgeColor = '#F59E0B';
        const badgeBg = 'rgba(245, 158, 11, 0.18)';
        const badgeBorder = 'rgba(245, 158, 11, 0.5)';

        return (
            <div style={{ aspectRatio: '16 / 9', maxHeight: studioMode ? '280px' : '380px', background: 'radial-gradient(circle at 50% 20%, rgba(30, 27, 75, 0.6) 0%, rgba(9, 14, 23, 0.95) 100%), url("https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=1200&auto=format&fit=crop") center/cover', borderRadius: '20px', position: 'relative', overflow: 'hidden', border: '2px solid rgba(245, 158, 11, 0.5)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(9, 14, 23, 0.75)', backdropFilter: 'blur(2px)' }} />

                <div style={{ position: 'absolute', top: '10px', left: '12px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '30px', background: badgeBg, border: `1px solid ${badgeBorder}`, backdropFilter: 'blur(8px)' }}>
                    <div className="rounded-circle animate-pulse" style={{ width: 7, height: 7, background: badgeColor }} />
                    <span style={{ color: badgeColor, fontWeight: 900, fontSize: '0.62rem', letterSpacing: '0.8px' }}>
                        PROYECTOR (TEMPLO EN VIVO)
                    </span>
                </div>

                <div style={{ position: 'absolute', top: '8px', right: '12px', zIndex: 10 }}>
                    <motion.button {...actionButtonMotion} onClick={() => window.open('/transmision/proyector', 'PROYECTOR_WINDOW', 'width=1920,height=1080')} className="btn btn-sm py-0 px-2 rounded-pill fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 10px 22px rgba(0,0,0,0.18)' }} title="Abrir pantalla en pestaña independiente para proyector">
                        ↗ Pantalla Completa
                    </motion.button>
                </div>

                <div style={{ position: 'relative', zIndex: 5, flexGrow: 1, pointerEvents: 'none', width: '100%', height: '100%' }}>
                    {(!overlay || !overlay.mode || overlay.mode === 'hidden') ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', gap: '6px', width: '100%', height: '100%' }}>
                            <MonitorPlay size={28} opacity={0.4} />
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '1.5px' }}>TEMPLO EN NEGRO</span>
                        </div>
                    ) : (
                        renderExactOverlayContent(overlay)
                    )}
                </div>
            </div>
        );
    };

    const renderObsMonitor = (overlay) => {
        const badgeColor = '#60A5FA';
        const badgeBg = 'rgba(59, 130, 246, 0.18)';
        const badgeBorder = 'rgba(59, 130, 246, 0.5)';
        const isChroma = obsMonitorBg === 'chroma';

        return (
            <div style={{ aspectRatio: '16 / 9', maxHeight: studioMode ? '280px' : '380px', background: isChroma ? '#0000FF' : 'linear-gradient(to bottom, rgba(0, 0, 255, 0.20), rgba(0, 0, 255, 0.40)), url("https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop") center/cover', borderRadius: '20px', position: 'relative', overflow: 'hidden', border: '2px solid rgba(59, 130, 246, 0.6)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: '10px', left: '12px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '30px', background: badgeBg, border: `1px solid ${badgeBorder}`, backdropFilter: 'blur(8px)' }}>
                    <div className="rounded-circle animate-pulse" style={{ width: 7, height: 7, background: badgeColor }} />
                    <span style={{ color: badgeColor, fontWeight: 900, fontSize: '0.62rem', letterSpacing: '0.8px' }}>
                        OBS (STREAMING EN VIVO)
                    </span>
                </div>

                <div style={{ position: 'absolute', top: '8px', right: '12px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => setObsMonitorBg(prev => prev === 'video' ? 'chroma' : 'video')} className="btn btn-sm py-0 px-2 rounded-pill fw-bold" style={{ fontSize: '0.58rem', background: 'rgba(0,0,0,0.5)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.4)' }} title="Cambiar fondo entre Cámara Simulada y Croma Azul (#0000FF)">
                        🎨 {isChroma ? 'Fondo Croma' : 'Simular Video'}
                    </button>
                    <button onClick={() => window.open('/transmision/overlay', 'OBS_WINDOW', 'width=1920,height=1080')} className="btn btn-sm py-0 px-2 rounded-pill fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.58rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} title="Abrir pantalla en pestaña independiente para OBS">
                        ↗ Pantalla Completa
                    </button>
                </div>

                <div style={{ position: 'relative', zIndex: 5, flexGrow: 1, pointerEvents: 'none', width: '100%', height: '100%' }}>
                    {(!overlay || !overlay.mode || overlay.mode === 'hidden') ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: isChroma ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', gap: '6px' }}>
                            <Tv size={28} opacity={isChroma ? 0.7 : 0.4} />
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '1.5px' }}>OBS EN NEGRO (TRANSPARENTE)</span>
                        </div>
                    ) : (
                        renderExactOverlayContent(overlay)
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="d-flex flex-column gap-4">
            <div style={{ background: themeStyles.cardBg, border: themeStyles.cardBorder, borderRadius: '30px', padding: '28px', boxShadow: themeStyles.cardShadow }}>
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 gap-3" style={{ borderBottom: themeStyles.cardBorder }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            <Sliders size={15} className="text-warning" />
                            <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.5px' }}>STUDIO CONTROLLER</span>
                        </div>
                        <div className="d-flex align-items-center gap-1 p-1 rounded-pill" style={{ background: themeStyles.tabBg }}>
                            <motion.button {...actionButtonMotion} onClick={() => setStudioMode(true)} className="btn btn-sm rounded-pill px-3 py-1 border-0 fw-bold transition-all d-flex align-items-center gap-1.5" style={{ background: studioMode ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'transparent', color: studioMode ? '#fff' : themeStyles.mutedColor, fontSize: '0.72rem', boxShadow: studioMode ? '0 10px 22px rgba(59,130,246,0.25)' : 'none' }}>
                                <Tv size={13} /> MODO ESTUDIO (3 PANTALLAS)
                            </motion.button>
                            <motion.button {...actionButtonMotion} onClick={() => setStudioMode(false)} className="btn btn-sm rounded-pill px-3 py-1 border-0 fw-bold transition-all d-flex align-items-center gap-1.5" style={{ background: !studioMode ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'transparent', color: !studioMode ? '#fff' : themeStyles.mutedColor, fontSize: '0.72rem', boxShadow: !studioMode ? '0 10px 22px rgba(59,130,246,0.25)' : 'none' }}>
                                <Monitor size={13} /> MODO PROGRAMA (2 EN VIVO)
                            </motion.button>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <div className="d-flex align-items-center gap-1 p-1 rounded-pill" style={{ background: themeStyles.tabBg }}>
                            {['classic', 'minimal', 'sidebar', 'cinematic'].map(tmpl => (
                                <motion.button {...actionButtonMotion} key={tmpl} onClick={() => handleTemplateChange(tmpl)} className="btn btn-sm rounded-pill px-3 py-1 border-0 fw-bold transition-all" style={{ background: currentTemplate === tmpl ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'transparent', color: currentTemplate === tmpl ? '#111827' : themeStyles.mutedColor, fontSize: '0.72rem', boxShadow: currentTemplate === tmpl ? '0 10px 20px rgba(245,158,11,0.25)' : 'none' }}>
                                    {tmpl.toUpperCase()}
                                </motion.button>
                            ))}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <motion.button
                                {...actionButtonMotion}
                                onClick={() => window.open('/transmision/overlay', 'OBS_WINDOW', 'width=1920,height=1080')}
                                className="btn btn-sm px-3 py-1 rounded-pill fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: '#fff', border: 'none', fontSize: '0.72rem', letterSpacing: '0.5px', boxShadow: '0 12px 24px rgba(59,130,246,0.28)' }}
                                title="Abrir ventana con fondo transparente para captura en OBS"
                            >
                                <Tv size={13} /> VISTA OBS
                            </motion.button>
                            <motion.button
                                {...actionButtonMotion}
                                onClick={() => window.open('/transmision/proyector', 'PROYECTOR_WINDOW', 'width=1920,height=1080')}
                                className="btn btn-sm px-3 py-1 rounded-pill fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', fontSize: '0.72rem', letterSpacing: '0.5px', boxShadow: '0 12px 24px rgba(245,158,11,0.28)' }}
                                title="Abrir ventana de proyección para el auditorio con fondos cinematográficos"
                            >
                                <MonitorPlay size={13} /> PROYECTOR
                            </motion.button>
                        </div>
                    </div>
                </div>

                <div className="row g-3 align-items-stretch">
                    {studioMode ? (
                        <>
                            <div className="col-12 col-xl-4 d-flex flex-column gap-2">
                                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: themeStyles.mutedColor, textTransform: 'uppercase', letterSpacing: '0.8px' }}>🖥️ PANTALLA 1: PREPARACIÓN (LOCAL)</span>
                                {renderMonitorBox(previewOverlay, 'preview')}
                            </div>
                            <div className="col-12 col-xl-4 d-flex flex-column gap-2">
                                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>📽️ PANTALLA 2: PROYECTOR (AUDITORIO)</span>
                                {renderProyectorMonitor(liveOverlay)}
                            </div>
                            <div className="col-12 col-xl-4 d-flex flex-column gap-2">
                                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.8px' }}>📡 PANTALLA 3: OBS (STREAMING)</span>
                                {renderObsMonitor(liveOverlay)}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="col-12 col-xl-6 d-flex flex-column gap-2">
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '1px' }}>📽️ SALIDA 1: PROYECTOR AUDITORIO (EN VIVO)</span>
                                {renderProyectorMonitor(liveOverlay)}
                            </div>
                            <div className="col-12 col-xl-6 d-flex flex-column gap-2">
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '1px' }}>📡 SALIDA 2: OBS STREAMING (EN VIVO)</span>
                                {renderObsMonitor(liveOverlay)}
                            </div>
                        </>
                    )}
                </div>

                {/* BARRA INTERACTIVA DE TRANSICIÓN MODO ESTUDIO */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-3" style={{ borderTop: themeStyles.cardBorder }}>
                    <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: isDark ? '#fff' : '#000' }}>Controlr Estudi de OBS:</span>
                        <span className="small opacity-50" style={{ color: themeStyles.mutedColor }}>Prepara a la izquierda, envía al aire con un clic</span>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        <motion.button
                            id="btn-send-to-air"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                                if (!previewOverlay || previewOverlay.mode === 'hidden') {
                                    pushToOBS('hidden', '', '');
                                } else {
                                    pushToOBS(previewOverlay.mode, previewOverlay.title, previewOverlay.content, { template: previewOverlay.template, subText: previewOverlay.subText });
                                }
                            }}
                            className="btn px-4 py-2.5 rounded-pill fw-bold d-flex align-items-center gap-2 shadow"
                            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#111827', border: 'none', fontSize: '0.85rem', letterSpacing: '0.5px', boxShadow: '0 14px 28px rgba(245,158,11,0.18)' }}
                        >
                            <Zap size={18} /> TRANSICIÓN AL AIRE (ENVIAR PREVIEW)
                        </motion.button>
                        <motion.button
                            {...actionButtonMotion}
                            id="btn-clear-obs"
                            onClick={() => pushToOBS('hidden', '', '')}
                            className="btn px-4 py-2.5 rounded-pill fw-bold d-flex align-items-center gap-2 shadow-sm"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.85rem', boxShadow: '0 12px 24px rgba(239,68,68,0.12)' }}
                        >
                            <EyeOff size={18} /> CORTE EN NEGRO (LIMPIAR OBS)
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* ── COLUMNA IZQUIERDA (7 COLS): CONTENIDO ESCRITO (Biblia & Himnario) ── */}
                <div className="col-xl-7 col-lg-12 d-flex flex-column">
                    <div style={{
                        background: themeStyles.cardBg,
                        border: themeStyles.cardBorder,
                        borderRadius: '26px',
                        padding: '24px',
                        boxShadow: themeStyles.cardShadow,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header con Tabs Responsivos y Sin Desbordamiento */}
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-2" style={{ borderBottom: themeStyles.cardBorder }}>
                            <h5 style={{ color: themeStyles.headingColor, fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={18} className="text-primary" /> CONTENIDO ESCRITO
                            </h5>
                            <div className="d-flex p-1 rounded-pill" style={{ background: themeStyles.tabBg }}>
                                {[
                                    { id: 'biblia', label: 'BIBLIA', icon: BookOpen },
                                    { id: 'himnario', label: 'HIMNARIO', icon: Music }
                                ].map(tab => (
                                    <motion.button
                                        {...actionButtonMotion}
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setActivePreviewSource(tab.id);
                                        }}
                                        className="btn btn-sm rounded-pill px-3 py-1 border-0 fw-bold d-flex align-items-center gap-1 transition-all"
                                        style={{
                                            background: activeTab === tab.id ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'transparent',
                                            color: activeTab === tab.id ? '#fff' : themeStyles.mutedColor,
                                            fontSize: '0.72rem', letterSpacing: '0.5px',
                                            boxShadow: activeTab === tab.id ? '0 10px 20px rgba(59,130,246,0.25)' : 'none'
                                        }}
                                    >
                                        <tab.icon size={12} /> {tab.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {activeTab === 'biblia' ? (
                            <div className="d-flex flex-column gap-3 flex-grow-1">
                                {/* Selectores de Biblia Responsivos */}
                                <div className="d-flex flex-wrap gap-2">
                                    <select
                                        className="form-select form-select-sm rounded-3 fw-bold flex-grow-1"
                                        style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, color: themeStyles.headingColor, padding: '10px 12px', minWidth: '130px' }}
                                        value={selectedBook.id}
                                        onChange={(e) => {
                                            const book = BIBLE_BOOKS.find(b => b.id === parseInt(e.target.value));
                                            setSelectedBook(book);
                                            setSelectedChapter(1);
                                            setActivePreviewSource('biblia');
                                        }}
                                    >
                                        {BIBLE_BOOKS.map(b => <option key={b.id} value={b.id} style={{ color: isDark ? '#fff' : '#000', background: isDark ? '#1a1a1a' : '#fff' }}>{b.name}</option>)}
                                    </select>
                                    <select
                                        className="form-select form-select-sm rounded-3 fw-bold"
                                        style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, color: themeStyles.headingColor, width: '105px', padding: '10px 12px' }}
                                        value={selectedChapter}
                                        onChange={(e) => {
                                            setSelectedChapter(parseInt(e.target.value));
                                            setActivePreviewSource('biblia');
                                        }}
                                    >
                                        {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(c => <option key={c} value={c} style={{ color: isDark ? '#fff' : '#000', background: isDark ? '#1a1a1a' : '#fff' }}>Cap. {c}</option>)}
                                    </select>
                                    <select
                                        className="form-select form-select-sm rounded-3 fw-bold"
                                        style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, color: themeStyles.headingColor, width: '105px', padding: '10px 12px' }}
                                        value={selectedVerseObj?.verse || ''}
                                        onChange={handleVerseChange}
                                        disabled={isLoadingVerses}
                                    >
                                        {isLoadingVerses ? <option>...</option> : verses.map(v => <option key={v.verse} value={v.verse} style={{ color: isDark ? '#fff' : '#000', background: isDark ? '#1a1a1a' : '#fff' }}>Ver. {v.verse}</option>)}
                                    </select>
                                </div>

                                {/* Preview de Versículo */}
                                <div className="p-3 rounded-3 flex-grow-1 d-flex flex-column justify-content-center" style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, borderLeft: '4px solid #3B82F6', minHeight: '120px', maxHeight: '180px', overflowY: 'auto' }}>
                                    {isLoadingVerses ? (
                                        <span className="text-muted small font-italic">Cargando versículo...</span>
                                    ) : selectedVerseObj ? (
                                        <>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3B82F6' }}>{selectedBook.name} {selectedChapter}:{selectedVerseObj.verse}</div>
                                                {isBibleLive && activePreviewSource === 'biblia' && (
                                                    <span className="badge rounded-pill bg-danger d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                                                        <span className="rounded-circle bg-white" style={{ width: '5px', height: '5px' }}></span> EN AIRE
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.92rem', color: themeStyles.headingColor, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{selectedVerseObj.text}</p>
                                        </>
                                    ) : <span className="text-muted small">Selecciona un versículo para proyectar</span>}
                                </div>

                                {/* Controles de Acción y Navegación de Versículos */}
                                <div className="d-flex flex-wrap gap-2 mt-auto">
                                    <button id="btn-prev-verse" onClick={handlePrevVerse} disabled={!canGoPrev || isLoadingVerses} className="btn rounded-3 px-3 py-2 border d-flex align-items-center justify-content-center shadow-sm" style={{ background: themeStyles.inputBg, color: themeStyles.headingColor, border: themeStyles.inputBorder }} title="Versículo anterior">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <motion.button
                                        id="btn-project-bible"
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => {
                                            pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${selectedVerseObj?.verse}`, selectedVerseObj?.text, { template: bibleTemplate });
                                            setIsBibleLive(true);
                                        }}
                                        disabled={!selectedVerseObj || isLoadingVerses}
                                        className="btn flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 shadow"
                                        style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '0.85rem', letterSpacing: '0.5px' }}
                                    >
                                        <Send size={15} /> PROYECTAR BIBLIA
                                    </motion.button>
                                    <button onClick={() => { pushToOBS('hidden', '', ''); setIsBibleLive(false); }} className="btn rounded-3 px-3 py-2 border d-flex align-items-center justify-content-center shadow-sm text-danger" style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder }} title="Ocultar de pantalla (OBS)">
                                        <EyeOff size={18} />
                                    </button>
                                    <button id="btn-next-verse" onClick={handleNextVerse} disabled={!canGoNext || isLoadingVerses} className="btn rounded-3 px-3 py-2 border d-flex align-items-center justify-content-center shadow-sm" style={{ background: themeStyles.inputBg, color: themeStyles.headingColor, border: themeStyles.inputBorder }} title="Siguiente versículo">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3 flex-grow-1">
                                {/* Buscador de Himnos y Selector de Estrofas */}
                                <div className="d-flex flex-wrap gap-2 position-relative">
                                    <div className="flex-grow-1 position-relative" style={{ minWidth: '180px' }}>
                                        <div className="position-relative d-flex align-items-center">
                                            <Search size={15} className="position-absolute ms-3 text-muted" style={{ pointerEvents: 'none' }} />
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3 fw-bold ps-5"
                                                placeholder={isLoadingHymns ? "Cargando himnos..." : "Buscar por # o título del himno..."}
                                                style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, color: themeStyles.headingColor, padding: '10px 14px 10px 36px' }}
                                                value={hymnSearchTerm}
                                                onChange={e => { setHymnSearchTerm(e.target.value); setIsHymnDropdownOpen(true); }}
                                                onClick={() => { setIsHymnDropdownOpen(true); }}
                                            />
                                            {hymnSearchTerm && (
                                                <button onClick={() => setHymnSearchTerm('')} className="btn btn-sm border-0 position-absolute end-0 me-1 text-muted p-1">
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        {isHymnDropdownOpen && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: isDark ? '#120C1F' : '#FFFFFF', border: `1px solid #8B5CF6`, borderRadius: '12px', marginTop: '4px', maxHeight: '220px', overflowY: 'auto', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
                                                {filteredHymns.slice(0, 30).map(h => (
                                                    <div key={h.number} onMouseDown={() => handleHymnSelect(h)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}`, color: themeStyles.headingColor, fontSize: '0.85rem', fontWeight: selectedHymn?.number === h.number ? 700 : 400 }}>
                                                        <span className="text-warning me-2 fw-bold">#{h.number}</span> {h.title}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <select
                                        className="form-select form-select-sm rounded-3 fw-bold"
                                        style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, color: themeStyles.headingColor, width: '130px', padding: '10px 12px' }}
                                        value={currentStanzaIndex}
                                        onChange={handleStanzaChange}
                                        disabled={!selectedHymn}
                                    >
                                        {selectedHymn?.stanzas.map((s, idx) => {
                                            const isCoro = s.type === 'chorus' || s.number === '' || String(s.number).toLowerCase() === 'coro' || s.number === 0;
                                            return <option key={idx} value={idx} style={{ color: isDark ? '#fff' : '#000', background: isDark ? '#1a1a1a' : '#fff' }}>{isCoro ? 'Coro' : `Estrofa ${s.number}`}</option>;
                                        })}
                                    </select>
                                </div>

                                {/* Preview de Estrofa del Himno */}
                                <div className="p-3 rounded-3 flex-grow-1 d-flex flex-column justify-content-center" style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, borderLeft: '4px solid #8B5CF6', minHeight: '120px', maxHeight: '180px', overflowY: 'auto' }}>
                                    {selectedStanza ? (
                                        <>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#8B5CF6' }}>Himno #{selectedHymn?.number} • {selectedHymn?.title} — {selectedStanza.number ? `Estrofa ${selectedStanza.number}` : 'Coro'}</div>
                                                {isBibleLive && activePreviewSource === 'himnario' && (
                                                    <span className="badge rounded-pill bg-danger d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                                                        <span className="rounded-circle bg-white" style={{ width: '5px', height: '5px' }}></span> EN AIRE
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.92rem', color: themeStyles.headingColor, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line', fontWeight: 500 }}>{selectedStanza.text}</p>
                                        </>
                                    ) : <span className="text-muted small">Selecciona o busca un himno para proyectar</span>}
                                </div>

                                {/* Barra de Auto-Avance Automático para Himnos */}
                                <div className="d-flex flex-wrap align-items-center justify-content-between p-2 rounded-3 mb-2" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const nextState = !isAutoAdvanceHymn;
                                                setIsAutoAdvanceHymn(nextState);
                                                setAutoAdvanceCountdown(autoAdvanceSeconds);
                                                if (nextState && selectedStanza) {
                                                    const subText = selectedStanza.number ? `Estrofa ${selectedStanza.number}` : 'Coro';
                                                    pushToOBS('himno', `Himno ${selectedHymn?.number} - ${selectedHymn?.title}`, selectedStanza?.text, { template: hymnalTemplate, subText });
                                                    setIsBibleLive(true);
                                                }
                                            }}
                                            disabled={!selectedHymn}
                                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1.5 shadow-sm ${isAutoAdvanceHymn ? 'bg-success text-white' : 'btn-outline-secondary'}`}
                                            style={{ fontSize: '0.75rem', border: isAutoAdvanceHymn ? 'none' : themeStyles.inputBorder }}
                                        >
                                            <Play size={13} /> {isAutoAdvanceHymn ? `AUTO-AVANCE ACTIVO (${autoAdvanceCountdown}s)` : 'AUTO-AVANCE (OFF)'}
                                        </button>
                                        {isAutoAdvanceHymn && (
                                            <span className="badge bg-warning text-dark animate-pulse" style={{ fontSize: '0.7rem' }}>
                                                Siguiente en {autoAdvanceCountdown}s...
                                            </span>
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                        <span style={{ fontSize: '0.7rem', color: themeStyles.mutedColor, fontWeight: 700 }}>Velocidad:</span>
                                        {[10, 15, 20, 30].map(sec => (
                                            <button
                                                key={sec}
                                                onClick={() => { setAutoAdvanceSeconds(sec); setAutoAdvanceCountdown(sec); }}
                                                className="btn btn-sm px-2 py-0.5 rounded fw-bold"
                                                style={{
                                                    background: autoAdvanceSeconds === sec ? '#8B5CF6' : 'transparent',
                                                    color: autoAdvanceSeconds === sec ? '#fff' : themeStyles.mutedColor,
                                                    fontSize: '0.7rem',
                                                    border: '1px solid rgba(139, 92, 246, 0.3)'
                                                }}
                                            >
                                                {sec}s
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Controles de Acción y Navegación del Himno */}
                                <div className="d-flex flex-wrap gap-2 mt-auto">
                                    <button id="btn-prev-hymn" onClick={handlePrevHymn} disabled={!selectedHymn} className="btn rounded-3 px-2 py-2 border d-flex align-items-center justify-content-center shadow-sm" style={{ background: themeStyles.inputBg, color: themeStyles.headingColor, border: themeStyles.inputBorder }} title="Himno anterior (PageUp)">
                                        <span style={{ fontSize: '0.85rem' }}>⏮</span>
                                    </button>
                                    <button id="btn-prev-stanza" onClick={handlePrevStanza} disabled={!canGoPrevStanza} className="btn rounded-3 px-3 py-2 border d-flex align-items-center justify-content-center shadow-sm" style={{ background: themeStyles.inputBg, color: themeStyles.headingColor, border: themeStyles.inputBorder }} title="Estrofa anterior (o Coro)">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <motion.button
                                        id="btn-project-hymn"
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => {
                                            const subText = selectedStanza.number ? `Estrofa ${selectedStanza.number}` : 'Coro';
                                            pushToOBS('himno', `Himno ${selectedHymn?.number} - ${selectedHymn?.title}`, selectedStanza?.text, { template: hymnalTemplate, subText });
                                            setIsBibleLive(true);
                                        }}
                                        disabled={!selectedStanza}
                                        className="btn flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 shadow"
                                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '0.85rem', letterSpacing: '0.5px' }}
                                    >
                                        <Send size={15} /> PROYECTAR HIMNO
                                    </motion.button>
                                    <button onClick={() => { pushToOBS('hidden', '', ''); setIsBibleLive(false); }} className="btn rounded-3 px-3 py-2 border d-flex align-items-center justify-content-center shadow-sm text-danger" style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder }} title="Ocultar de pantalla (OBS)">
                                        <EyeOff size={18} />
                                    </button>
                                    <button id="btn-next-stanza" onClick={handleNextStanza} disabled={!canGoNextStanza} className="btn rounded-3 px-3 py-2 border d-flex align-items-center justify-content-center shadow-sm" style={{ background: themeStyles.inputBg, color: themeStyles.headingColor, border: themeStyles.inputBorder }} title="Siguiente estrofa (o Coro)">
                                        <ChevronRight size={18} />
                                    </button>
                                    <button id="btn-next-hymn" onClick={handleNextHymn} disabled={!selectedHymn} className="btn rounded-3 px-2 py-2 border d-flex align-items-center justify-content-center shadow-sm" style={{ background: themeStyles.inputBg, color: themeStyles.headingColor, border: themeStyles.inputBorder }} title="Siguiente himno (PageDown)">
                                        <span style={{ fontSize: '0.85rem' }}>⏭</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── COLUMNA DERECHA (5 COLS): STACK VERTICAL DE ZÓCALO + ANUNCIOS ── */}
                <div className="col-xl-5 col-lg-12 d-flex flex-column gap-4">
                    {/* TARJETA 2: ZÓCALO DE PREDICADOR */}
                    <div style={{
                        background: themeStyles.cardBg,
                        border: themeStyles.cardBorder,
                        borderRadius: '26px',
                        padding: '24px',
                        boxShadow: themeStyles.cardShadow,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <h5 style={{ color: themeStyles.headingColor, fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={18} className="text-warning" /> ZÓCALO DE PREDICADOR
                        </h5>

                        <div className="d-flex flex-column gap-3">
                            <div className="row g-2">
                                <div className="col-12 col-sm-6">
                                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: themeStyles.mutedColor, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3 fw-bold"
                                        placeholder="Ej: Ps. Diego Marín"
                                        value={preacher.name}
                                        onChange={e => { setPreacher({ ...preacher, name: e.target.value }); setActivePreviewSource('predicador'); }}
                                        style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, color: themeStyles.headingColor, padding: '10px 12px', fontSize: '0.85rem' }}
                                    />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: themeStyles.mutedColor, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Tema / Título</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3 fw-bold"
                                        placeholder="Ej: El poder de la cruz"
                                        value={preacher.title}
                                        onChange={e => { setPreacher({ ...preacher, title: e.target.value }); setActivePreviewSource('predicador'); }}
                                        style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, color: themeStyles.headingColor, padding: '10px 12px', fontSize: '0.85rem' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: themeStyles.mutedColor, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>ESTILO VISUAL DEL ZÓCALO</label>
                                <div className="d-flex gap-2 p-1 rounded-pill" style={{ background: themeStyles.tabBg }}>
                                    {['classic', 'modern', 'ticker'].map(st => (
                                        <motion.button
                                            {...actionButtonMotion}
                                            key={st}
                                            onClick={() => {
                                                setPreacherStyle(st);
                                                setActivePreviewSource('predicador');
                                                if (liveOverlay?.mode === 'lower_third' || liveOverlay?.mode === 'predicador') {
                                                    pushToOBS(
                                                        'lower_third',
                                                        preacher.name || 'Ps. Diego Marín',
                                                        preacher.title || 'Título / Ministerio',
                                                        { template: st }
                                                    );
                                                }
                                            }}
                                            className="btn btn-sm rounded-pill flex-grow-1 border-0 fw-bold transition-all text-capitalize"
                                            style={{
                                                background: preacherStyle === st ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'transparent',
                                                color: preacherStyle === st ? '#fff' : themeStyles.mutedColor,
                                                fontSize: '0.75rem', padding: '6px',
                                                boxShadow: preacherStyle === st ? '0 10px 20px rgba(139,92,246,0.22)' : 'none'
                                            }}
                                        >
                                            {st === 'classic' ? 'Clásico' : st === 'modern' ? 'Moderno' : 'Ticker'}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-2">
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => {
                                        const finalName = preacher.name || "Ps. Diego Marín";
                                        const finalTitle = preacher.title || "El poder de la cruz";
                                        pushToOBS('preacher', finalName, finalTitle, { template: preacherStyle });
                                    }}
                                    className="btn flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm"
                                    style={{
                                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                        color: '#fff',
                                        borderRadius: '12px', border: 'none', fontSize: '0.85rem', letterSpacing: '0.5px'
                                    }}
                                >
                                    <User size={16} /> PROYECTAR ZÓCALO
                                </motion.button>
                                <motion.button
                                    {...actionButtonMotion}
                                    onClick={() => pushToOBS('hidden', '', '')}
                                    className="btn rounded-3 px-3 py-2 border d-flex align-items-center justify-content-center shadow-sm text-danger"
                                    style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}
                                    title="Ocultar zócalo de OBS"
                                >
                                    <EyeOff size={18} />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* TARJETA 3: ANUNCIOS RÁPIDOS */}
                    <div style={{
                        background: themeStyles.cardBg,
                        border: themeStyles.cardBorder,
                        borderRadius: '26px',
                        padding: '24px',
                        boxShadow: themeStyles.cardShadow,
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1
                    }}>
                        <h5 style={{ color: themeStyles.headingColor, fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Megaphone size={18} className="text-success" /> ANUNCIOS RÁPIDOS
                        </h5>

                        <div className="d-flex flex-column gap-3 flex-grow-1">
                            <div className="mb-1">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: themeStyles.mutedColor, textTransform: 'uppercase' }}>MEMORIA DE AVISOS (CLIC PARA CARGAR)</label>
                                    <motion.button
                                        {...actionButtonMotion}
                                        onClick={() => saveToAnnouncementsMemory(announcement)}
                                        className="btn btn-sm py-0 px-2 rounded-pill border fw-bold text-success"
                                        style={{ fontSize: '0.65rem', background: themeStyles.inputBg, boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                        title="Guardar el anuncio actual en la memoria del equipo"
                                    >
                                        + Guardar en Memoria
                                    </motion.button>
                                </div>
                                <div className="d-flex flex-wrap gap-1.5" style={{ maxHeight: '72px', overflowY: 'auto' }}>
                                    {announcementsList.map((item, idx) => (
                                        <motion.button
                                            {...actionButtonMotion}
                                            key={idx}
                                            onClick={() => {
                                                setAnnouncement(item);
                                                setActivePreviewSource('anuncio');
                                                showToast('Aviso cargado desde memoria', 'info');
                                            }}
                                            className="badge rounded-pill border px-2.5 py-1 text-truncate transition-all"
                                            style={{
                                                background: announcement.title === item.title ? 'rgba(245, 158, 11, 0.16)' : themeStyles.inputBg,
                                                color: announcement.title === item.title ? '#F59E0B' : themeStyles.headingColor,
                                                borderColor: announcement.title === item.title ? '#F59E0B' : themeStyles.inputBorder,
                                                cursor: 'pointer',
                                                maxWidth: '220px',
                                                fontSize: '0.72rem'
                                            }}
                                            title={`${item.title}: ${item.content}`}
                                        >
                                            📌 {item.title || 'Sin Título'}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: themeStyles.mutedColor, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Cabecera del Aviso</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3 fw-bold"
                                    placeholder="Ej: OFRENDAS / REUNIÓN GENERAL"
                                    value={announcement.title}
                                    onChange={e => { setAnnouncement({ ...announcement, title: e.target.value }); setActivePreviewSource('anuncio'); }}
                                    style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, color: themeStyles.headingColor, padding: '10px 12px', fontSize: '0.85rem' }}
                                />
                            </div>
                            <div className="flex-grow-1 d-flex flex-column">
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: themeStyles.mutedColor, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Cuerpo del Mensaje</label>
                                <textarea
                                    className="form-control rounded-3 flex-grow-1"
                                    placeholder="Escribe el aviso o mensaje importante para la congregación..."
                                    rows="3"
                                    value={announcement.content}
                                    onChange={e => { setAnnouncement({ ...announcement, content: e.target.value }); setActivePreviewSource('anuncio'); }}
                                    style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, color: themeStyles.headingColor, padding: '10px 12px', fontSize: '0.88rem', resize: 'none', minHeight: '80px' }}
                                ></textarea>
                            </div>

                            <div className="d-flex gap-2 mt-2">
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => {
                                        const finalTitle = announcement.title || "AVISO IMPORTANTE";
                                        const finalContent = announcement.content || "Por favor prestar atención a las indicaciones en pantalla.";
                                        saveToAnnouncementsMemory({ title: finalTitle, content: finalContent });
                                        pushToOBS('announcement', finalTitle, finalContent, { template: announcementStyle });
                                    }}
                                    className="btn flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm"
                                    style={{
                                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                        color: '#111827',
                                        borderRadius: '12px', border: 'none', fontSize: '0.85rem', letterSpacing: '0.5px' }}
                                >
                                    <Megaphone size={16} /> LANZAR ANUNCIO
                                </motion.button>
                                <motion.button
                                    {...actionButtonMotion}
                                    onClick={() => pushToOBS('hidden', '', '')}
                                    className="btn rounded-3 px-3 py-2 border d-flex align-items-center justify-content-center shadow-sm text-danger"
                                    style={{ background: themeStyles.inputBg, border: themeStyles.inputBorder, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}
                                    title="Ocultar anuncio de OBS"
                                >
                                    <EyeOff size={18} />
                                </motion.button>
                            </div>

                            <div className="mt-2">
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: themeStyles.mutedColor, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>ESTILO VISUAL DEL ANUNCIO</label>
                                <div className="d-flex gap-2 p-1 rounded-pill" style={{ background: themeStyles.tabBg }}>
                                    {['classic', 'modern', 'ticker'].map(st => (
                                        <button
                                            key={st}
                                            onClick={() => {
                                                setAnnouncementStyle(st);
                                                setActivePreviewSource('anuncio');
                                                if (liveOverlay?.mode === 'announcement' || liveOverlay?.mode === 'anuncio') {
                                                    pushToOBS(
                                                        'announcement',
                                                        announcement.title || 'AVISO IMPORTANTE',
                                                        announcement.content || 'Por favor prestar atención a las indicaciones en pantalla.',
                                                        { template: st }
                                                    );
                                                }
                                            }}
                                            className="btn btn-sm rounded-pill flex-grow-1 border-0 fw-bold transition-all text-capitalize"
                                            style={{
                                                background: announcementStyle === st ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'transparent',
                                                color: announcementStyle === st ? '#fff' : themeStyles.mutedColor,
                                                fontSize: '0.75rem', padding: '6px'
                                            }}
                                        >
                                            {st === 'classic' ? 'Clásico' : st === 'modern' ? 'Noticiero' : 'Ticker'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AdminTransmisionInline;
