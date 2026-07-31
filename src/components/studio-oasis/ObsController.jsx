import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { supabase } from '../../api/supabaseClient';
import apiClient from '../../api/client';
import fastapiClient from '../../api/fastapiClient';
import himnarioData from '../../data/himnario.json';
import { useToast } from '../../react-ui/components/Toast';
import { MonitorPlay, MonitorOff, BookOpen, Megaphone, ExternalLink, ChevronLeft, ChevronRight, User, LayoutTemplate, PanelBottom, PanelRight, Film, Timer, Music, Radio, Volume2, Sparkles, Send, EyeOff, Search, X, Play, Monitor, Zap, Sliders, Tv, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContadorPanel from './panel_OBS/ContadorPanel';

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

const ObsController = forwardRef(({ currentActivity, timeMetrics, serviceStartTime, isDark, startService, endService }, ref) => {
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
        <>
            {/* Left Screen & Center Controls Area (3 cols wide) */}
            <div className="lg:col-span-3 space-y-6">
                
                {/* Screen Layout Grid */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    {/* OBS Screen */}
                    <div className="w-full md:w-[40%] space-y-2">
                        <div className="bg-black rounded-3xl aspect-video relative flex items-center justify-center overflow-hidden shadow-xl border-4 border-gray-800">
                            <span className="absolute top-4 left-6 text-[10px] text-white/50 font-bold uppercase z-10">Pantalla OBS</span>
                            {/* Insert Live Preview Logic */}
                            <div className="w-full h-full position-absolute inset-0">
                                {liveOverlay.mode === 'biblia' && (
                                    <div className="d-flex align-items-center justify-content-center w-100 h-100 text-white p-4 text-center" style={{ background: colors.bg }}>
                                        <p className="fs-5">{liveOverlay.data?.text || 'Esperando Biblia...'}</p>
                                    </div>
                                )}
                                {liveOverlay.mode === 'himnario' && (
                                    <div className="d-flex align-items-center justify-content-center w-100 h-100 text-white p-4 text-center" style={{ background: colors.bg }}>
                                        <p className="fs-5">{liveOverlay.data?.text || 'Esperando Himno...'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center Vertical Controls */}
                    <div className="w-full md:w-[20%] flex flex-col items-center justify-center">
                        <div className="neumorph-card p-4 flex flex-col gap-4 w-full bg-white shadow-lg rounded-2xl border border-gray-100">
                            <button onClick={() => pushToOBS(activePreviewSource)} className="neumorph-button bg-white text-[10px] font-black py-3 px-2 rounded-full uppercase text-gray-700 hover:text-oasis-orange text-center w-full">
                                Transición al aire (enviar preview)
                            </button>
                            <button onClick={() => pushToOBS('hidden')} className="neumorph-button bg-white text-[10px] font-black py-3 px-2 rounded-full uppercase text-oasis-red hover:bg-red-50 text-center w-full">
                                Limpiar Pantallas (Ocultar)
                            </button>
                            <div className="flex gap-2 w-full">
                                <button onClick={() => setStudioMode(true)} className={`neumorph-button flex-1 py-3 text-[10px] font-black rounded-full uppercase text-center ${studioMode ? 'text-oasis-orange' : 'text-gray-500'}`}>Vista OBS</button>
                                <button onClick={() => setStudioMode(false)} className={`neumorph-button flex-1 py-3 text-[10px] font-black rounded-full uppercase text-center ${!studioMode ? 'text-oasis-orange' : 'text-gray-500'}`}>Proyector</button>
                            </div>
                        </div>
                    </div>

                    {/* Projector Screen */}
                    <div className="w-full md:w-[40%] space-y-2">
                        <div className="bg-black rounded-3xl aspect-video relative flex items-center justify-center overflow-hidden shadow-xl border-4 border-gray-800">
                            <span className="absolute top-4 left-6 text-[10px] text-white/50 font-bold uppercase z-10">Pantalla Proyector</span>
                            <div className="w-full h-full position-absolute inset-0">
                                {liveOverlay.mode === 'preacher' && (
                                    <div className="position-absolute bottom-0 w-100 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                        <h4 className="text-white fw-bold mb-0">{liveOverlay.data?.name}</h4>
                                        <p className="text-white-50 mb-0">{liveOverlay.data?.title}</p>
                                    </div>
                                )}
                                {liveOverlay.mode === 'anuncio' && (
                                    <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100 bg-warning text-dark p-4 text-center">
                                        <h3 className="fw-bold">{liveOverlay.data?.title}</h3>
                                        <p className="fs-5">{liveOverlay.data?.content}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Bottom Panels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Panel Contenido (Biblia/Himnario) */}
                    <div className="neumorph-card p-6">
                        <h3 className="text-center font-bold text-gray-700 mb-4 tracking-widest text-sm">CONTENIDO</h3>
                        <div className="flex flex-col gap-4">
                            <div className="neumorph-inset p-1 rounded-full flex">
                                <button onClick={() => { setActiveTab('biblia'); setActivePreviewSource('biblia'); }} className={`flex-1 py-1 rounded-full text-xs font-bold transition-colors ${activeTab === 'biblia' ? 'bg-oasis-yellow text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>BIBLIA</button>
                                <button onClick={() => { setActiveTab('himnario'); setActivePreviewSource('himnario'); }} className={`flex-1 py-1 rounded-full text-xs font-bold transition-colors ${activeTab === 'himnario' ? 'bg-oasis-yellow text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>HIMNARIO</button>
                            </div>
                            
                            {activeTab === 'biblia' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <select value={selectedBook.id} onChange={e => {
                                            const book = BIBLE_BOOKS.find(b => b.id === parseInt(e.target.value));
                                            setSelectedBook(book);
                                            setSelectedChapter(1);
                                        }} className="w-full bg-white border-none rounded-full shadow-inner text-[10px] font-bold px-4 py-2 text-gray-700 focus:ring-0">
                                            {BIBLE_BOOKS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" min="1" max={selectedBook.chapters} value={selectedChapter} onChange={e => setSelectedChapter(parseInt(e.target.value) || 1)} className="bg-white border-none rounded-lg text-[10px] font-bold p-2 text-center shadow-inner text-gray-700 focus:ring-0" placeholder="CAP" />
                                            <input type="number" value={selectedVerseObj?.verse || ''} readOnly className="bg-white border-none rounded-lg text-[10px] font-bold p-2 text-center shadow-inner text-gray-700" placeholder="VER" />
                                        </div>
                                        <div className="neumorph-card py-2 flex items-center justify-around mt-2">
                                            <button onClick={handlePrevVerse} className="text-xs text-gray-600 font-bold hover:text-oasis-orange px-2">◀</button>
                                            <button onClick={() => pushToOBS('biblia')} className="w-8 h-8 bg-oasis-yellow rounded-full flex items-center justify-center text-white shadow hover:scale-110 transition-transform">
                                                <Play size={14} fill="currentColor" />
                                            </button>
                                            <button onClick={handleNextVerse} className="text-xs text-gray-600 font-bold hover:text-oasis-orange px-2">▶</button>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3 shadow-inner border border-gray-100 overflow-y-auto max-h-[140px]">
                                        {verses.length > 0 ? verses.map(v => (
                                            <div key={v.verse} onClick={() => setSelectedVerseObj(v)} className={`p-2 rounded-lg cursor-pointer mb-1 text-[10px] transition-colors ${selectedVerseObj?.verse === v.verse ? 'bg-oasis-yellow text-white shadow-md' : 'hover:bg-white text-gray-700'}`}>
                                                <span className="font-bold mr-1">{v.verse}.</span>
                                                {v.text}
                                            </div>
                                        )) : <span className="text-[10px] font-bold text-gray-400 d-flex justify-content-center h-100 align-items-center">Cargando...</span>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'himnario' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <input type="text" value={hymnSearchTerm} onChange={e => setHymnSearchTerm(e.target.value)} className="w-full bg-white border-none rounded-full shadow-inner text-[10px] font-bold px-4 py-2 text-gray-700 focus:ring-0" placeholder="BUSCAR HIMNO" />
                                        <div className="neumorph-card py-2 flex items-center justify-around mt-2">
                                            <button onClick={() => handleHymnNavigate(-1)} className="text-xs text-gray-600 font-bold hover:text-oasis-orange px-2">◀</button>
                                            <button onClick={() => pushToOBS('himnario')} className="w-8 h-8 bg-oasis-yellow rounded-full flex items-center justify-center text-white shadow hover:scale-110 transition-transform">
                                                <Play size={14} fill="currentColor" />
                                            </button>
                                            <button onClick={() => handleHymnNavigate(1)} className="text-xs text-gray-600 font-bold hover:text-oasis-orange px-2">▶</button>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3 shadow-inner border border-gray-100 overflow-y-auto max-h-[140px]">
                                        {!selectedHymn ? (
                                            <div className="text-[10px] font-bold text-gray-400 d-flex justify-content-center h-100 align-items-center">Busca un himno...</div>
                                        ) : (
                                            <div>
                                                <strong className="text-[10px] text-oasis-orange d-block mb-1">#{selectedHymn.number} - {selectedHymn.title}</strong>
                                                {selectedHymn?.stanzas?.map((estr, idx) => (
                                                    <div key={idx} onClick={() => setSelectedStanza(estr)} className={`p-2 rounded-lg cursor-pointer mb-1 text-[10px] transition-colors ${selectedStanza === estr ? 'bg-oasis-yellow text-white shadow-md' : 'hover:bg-white text-gray-700'}`}>
                                                        {estr.type === 'chorus' ? 'Coro: ' : (estr.number ? `${estr.number}. ` : '')}{estr.text}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel Banners (Predicador/Anuncios) */}
                    <div className="neumorph-card p-6">
                        <h3 className="text-center font-bold text-gray-700 mb-4 tracking-widest text-sm">BANNERS</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Predicador */}
                            <div className="space-y-2">
                                <span className="block text-center text-[10px] font-bold text-gray-500 uppercase">Predicador</span>
                                <input value={preacher.name} onChange={e => { setPreacher({...preacher, name: e.target.value}); setActivePreviewSource('preacher'); }} className="w-full border-none rounded-full bg-white shadow-inner text-[10px] py-2 px-3 text-gray-700 focus:ring-0" placeholder="NOMBRE PREDICADOR" type="text" />
                                <input value={preacher.title} onChange={e => { setPreacher({...preacher, title: e.target.value}); setActivePreviewSource('preacher'); }} className="w-full border-none rounded-full bg-white shadow-inner text-[10px] py-2 px-3 text-gray-700 focus:ring-0" placeholder="TÍTULO / TEMA" type="text" />
                                <div className="flex gap-1 mt-2">
                                    <button onClick={() => pushToOBS('preacher')} className="flex-1 bg-oasis-yellow text-white text-[9px] font-bold py-2 rounded-lg hover:brightness-105 shadow">PROYECTAR</button>
                                    <button onClick={() => pushToOBS('hidden')} className="flex-1 text-oasis-red text-[9px] font-bold py-2 border border-oasis-red/20 rounded-lg hover:bg-red-50">OCULTAR</button>
                                </div>
                            </div>
                            
                            {/* Anuncios */}
                            <div className="space-y-2">
                                <span className="block text-center text-[10px] font-bold text-gray-500 uppercase">Anuncio</span>
                                <select onChange={e => {
                                    const selected = announcementsList.find(a => a.title === e.target.value);
                                    if(selected) { setAnnouncement(selected); setActivePreviewSource('anuncio'); }
                                }} className="w-full border-none rounded-full bg-oasis-yellow/10 text-oasis-orange text-[9px] font-bold py-2 px-2 focus:ring-0 truncate">
                                    <option value="">RÁPIDOS</option>
                                    {announcementsList?.map((a, idx) => (
                                        <option key={a.title} value={a.title}>{a.title}</option>
                                    ))}
                                </select>
                                <div className="space-y-1">
                                    <input value={announcement.title} onChange={e => { setAnnouncement({...announcement, title: e.target.value}); setActivePreviewSource('anuncio'); }} className="w-full border-none rounded-full bg-white shadow-inner text-[9px] py-1.5 px-3 text-gray-700 focus:ring-0" placeholder="TÍTULO" type="text" />
                                    <input value={announcement.content} onChange={e => { setAnnouncement({...announcement, content: e.target.value}); setActivePreviewSource('anuncio'); }} className="w-full border-none rounded-full bg-white shadow-inner text-[9px] py-1.5 px-3 text-gray-700 focus:ring-0" placeholder="TEXTO" type="text" />
                                </div>
                                <div className="flex gap-1 mt-1">
                                    <button onClick={() => { saveToAnnouncementsMemory(announcement); pushToOBS('anuncio'); }} className="flex-1 bg-oasis-yellow text-white text-[9px] font-bold py-1.5 rounded-lg hover:brightness-105 shadow">PROYECTAR</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar Contador */}
            <ContadorPanel 
                timeMetrics={timeMetrics} 
                studioMode={studioMode} 
                setStudioMode={setStudioMode} 
                startService={startService}
                endService={endService}
            />
        </>
    );
});

export default ObsController;
