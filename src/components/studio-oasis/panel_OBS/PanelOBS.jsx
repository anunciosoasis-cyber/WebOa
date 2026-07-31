import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { supabase } from '../../../api/supabaseClient';
import apiClient from '../../../api/client';
import fastapiClient from '../../../api/fastapiClient';
import himnarioData from '../../../data/himnario.json';
import { useToast } from '../../../react-ui/components/Toast';
import { MonitorPlay, MonitorOff, BookOpen, Megaphone, ExternalLink, ChevronLeft, ChevronRight, User, LayoutTemplate, PanelBottom, PanelRight, Film, Timer, Music, Radio, Volume2, Sparkles, Send, EyeOff, Search, X, Play, Monitor, Zap, Sliders, Tv, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBiblia } from './hooks/useBiblia';
import { useHimnario } from './hooks/useHimnario';
import { useBanners } from './hooks/useBanners';
import { useObsWebSockets } from './hooks/useObsWebSockets';
import ContadorPanel from './ContadorPanel';
import PreviewMonitors from './PreviewMonitors';
import ContenidoPanel from './ContenidoPanel';
import BannersPanel from './BannersPanel';
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

const PanelOBS = forwardRef(({ currentActivity, timeMetrics, serviceStartTime, isDark, startService, endService }, ref) => {
    const { showToast } = useToast();
    const [isBibleLive, setIsBibleLive] = useState(false);
    const [globalTemplate, setGlobalTemplate] = useState('CLASSIC');
    const [countdownTemplate, setCountdownTemplate] = useState('classic');
    const [activeTab, setActiveTab] = useState('biblia');
    const [activePreviewSource, setActivePreviewSource] = useState('biblia');
    const [bibleTemplate, setBibleTemplate] = useState('classic');
    const [hymnalTemplate, setHymnalTemplate] = useState('classic');
    const [preacherStyle, setPreacherStyle] = useState('minimalist');
    const [announcementStyle, setAnnouncementStyle] = useState('modern');
    const [audioMode, setAudioMode] = useState('letra');
    const [colors, setColors] = useState({ bg: 'rgba(18, 12, 31, 0.85)', text: '#ffffff', accent: '#f59e0b' });
    const [studioMode, setStudioMode] = useState(true);
    const [obsMonitorBg, setObsMonitorBg] = useState('video');

    const banners = useBanners();
    const { preacher, setPreacher, announcementsList, setAnnouncementsList, announcement, setAnnouncement, saveToAnnouncementsMemory } = banners;

    const pushToOBSRef = useRef(null);
    const pushToOBS = (...args) => pushToOBSRef.current && pushToOBSRef.current(...args);

    const biblia = useBiblia(pushToOBS, setActivePreviewSource, isBibleLive, bibleTemplate);
    const { selectedBook, setSelectedBook, selectedChapter, setSelectedChapter, verses, selectedVerseObj, setSelectedVerseObj, isLoadingVerses, remoteTargetVerseRef, handlePrevVerse, handleNextVerse } = biblia;

    const himnario = useHimnario(pushToOBS, setActivePreviewSource, isBibleLive, hymnalTemplate);
    const { himnarioList, selectedHymn, setSelectedHymn, selectedStanza, setSelectedStanza, isLoadingHymns, hymnSearchTerm, setHymnSearchTerm, isHymnDropdownOpen, setIsHymnDropdownOpen, handleHymnSelect, handlePrevHymn, handleNextHymn, handlePrevStanza, handleNextStanza, isAutoAdvanceHymn, setIsAutoAdvanceHymn, autoAdvanceSeconds, setAutoAdvanceSeconds, autoAdvanceCountdown, setAutoAdvanceCountdown } = himnario;

    const obsWS = useObsWebSockets(colors, {
        setIsBibleLive,
        setActivePreviewSource,
        setActiveTab,
        setPreacher,
        setAnnouncement,
        handleNextHymn,
        handlePrevHymn,
        himnarioList,
        handleHymnSelect,
        globalTemplate,
        remoteTargetVerseRef,
        setSelectedBook,
        setSelectedChapter,
        setSelectedVerseObj
    });
    const { liveOverlay, setLiveOverlay, obsChannel } = obsWS;
    
    useEffect(() => {
        pushToOBSRef.current = obsWS.pushToOBS;
    }, [obsWS.pushToOBS]);

    const handleHymnNavigate = (direction) => {
        if (direction === 'prev') handlePrevHymn();
        else if (direction === 'next') handleNextHymn();
    };

    const handleVerseChange = (e) => {
        const v = verses.find(ver => ver.verse === parseInt(e.target.value));
        setSelectedVerseObj(v);
        setActivePreviewSource('biblia');
    };

    const handleStanzaChange = (e) => {
        const idx = parseInt(e.target.value);
        if (selectedHymn && selectedHymn.stanzas[idx]) {
            setSelectedStanza(selectedHymn.stanzas[idx]);
            setActivePreviewSource('himnario');
        }
    };

    const handleTemplateChange = (tmpl) => {
        const lowerTmpl = tmpl.toLowerCase();
        if (activePreviewSource === 'biblia') {
            setBibleTemplate(lowerTmpl);
            if (isBibleLive && selectedVerseObj) {
                pushToOBS('bible', `${selectedBook?.name} ${selectedChapter}:${selectedVerseObj.verse}`, selectedVerseObj.text, { template: lowerTmpl });
            }
        } else if (activePreviewSource === 'himnario') {
            setHymnalTemplate(lowerTmpl);
            if (isBibleLive && selectedStanza) {
                pushToOBS('himno', `Himno ${selectedHymn?.number}`, selectedStanza.text, { template: lowerTmpl, subText: selectedStanza.number ? `Estrofa ${selectedStanza.number}` : 'Coro' });
            }
        } else if (activePreviewSource === 'preacher') {
            setPreacherStyle(lowerTmpl);
        } else if (activePreviewSource === 'anuncio') {
            setAnnouncementStyle(lowerTmpl);
        }
        setGlobalTemplate(tmpl); // Update global for BannersPanel UI sync
    };

    useEffect(() => {
        if (liveOverlay && liveOverlay.mode && liveOverlay.mode !== 'hidden' && liveOverlay.template !== globalTemplate) {
            const extra = { template: globalTemplate };
            if (liveOverlay.subText) extra.subText = liveOverlay.subText;
            if (liveOverlay.accent_color) extra.accent_color = liveOverlay.accent_color;
            if (liveOverlay.bg_color) extra.bg_color = liveOverlay.bg_color;
            if (liveOverlay.customBg) extra.customBg = liveOverlay.customBg;
            if (liveOverlay.pattern) extra.pattern = liveOverlay.pattern;
            pushToOBS(liveOverlay.mode, liveOverlay.title, liveOverlay.content, extra);
        }
    }, [globalTemplate]); // Push update automatically if the template is changed while live
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

    const currentTemplate = globalTemplate;

    return (
        <>
            {/* Left Screen & Center Controls Area (3 cols wide) */}
            <div className="lg:col-span-3 space-y-6">
                
                <PreviewMonitors 
                    liveOverlay={liveOverlay}
                    colors={colors}
                    pushToOBS={pushToOBS}
                    studioMode={studioMode}
                    setStudioMode={setStudioMode}
                    activePreviewSource={activePreviewSource}
                    obsMonitorBg={obsMonitorBg}
                    setObsMonitorBg={setObsMonitorBg}
                    isDark={isDark}
                    handleTemplateChange={handleTemplateChange}
                />

                {/* Bottom Panels Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[310px] h-auto xl:h-[310px]">
                    <ContenidoPanel 
                        activeTab={activeTab} setActiveTab={setActiveTab} setActivePreviewSource={setActivePreviewSource}
                        selectedBook={selectedBook} setSelectedBook={setSelectedBook} BIBLE_BOOKS={BIBLE_BOOKS}
                        selectedChapter={selectedChapter} setSelectedChapter={setSelectedChapter}
                        selectedVerseObj={selectedVerseObj} setSelectedVerseObj={setSelectedVerseObj} verses={verses}
                        handlePrevVerse={handlePrevVerse} handleNextVerse={handleNextVerse} pushToOBS={pushToOBS}
                        hymnSearchTerm={hymnSearchTerm} setHymnSearchTerm={setHymnSearchTerm}
                        handleHymnNavigate={handleHymnNavigate} selectedHymn={selectedHymn}
                        selectedStanza={selectedStanza} setSelectedStanza={setSelectedStanza}
                        himnarioList={himnarioList} setSelectedHymn={setSelectedHymn}
                        handlePrevStanza={handlePrevStanza} handleNextStanza={handleNextStanza}
                        globalTemplate={globalTemplate}
                    />

                    <BannersPanel 
                        preacher={preacher} setPreacher={setPreacher} setActivePreviewSource={setActivePreviewSource}
                        pushToOBS={pushToOBS} announcementsList={announcementsList} announcement={announcement}
                        setAnnouncement={setAnnouncement} saveToAnnouncementsMemory={saveToAnnouncementsMemory}
                        globalTemplate={globalTemplate} setGlobalTemplate={setGlobalTemplate}
                        liveOverlay={liveOverlay}
                        activeTab={activeTab}
                        handleTemplateChange={handleTemplateChange}
                        bibleTemplate={bibleTemplate}
                        hymnalTemplate={hymnalTemplate}
                        preacherStyle={preacherStyle}
                        announcementStyle={announcementStyle}
                    />
                </div>
            </div>

            {/* Right Sidebar Contador */}
            <ContadorPanel 
                timeMetrics={timeMetrics} 
                studioMode={studioMode} 
                setStudioMode={setStudioMode} 
                startService={startService}
                endService={endService}
                pushToOBS={pushToOBS}
                globalTemplate={globalTemplate}
                setGlobalTemplate={setGlobalTemplate}
                countdownTemplate={countdownTemplate}
                setCountdownTemplate={setCountdownTemplate}
            />
        </>
    );
});

export default PanelOBS;
