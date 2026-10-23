import { useState, useEffect } from 'react';
import mediaClient from '../../../../api/mediaClient';
import { processHymnList, processedLocalHymns } from '../../../../utils/hymnProcessor';

export const useHimnario = (pushToOBS, setActivePreviewSource, isBibleLive, hymnalTemplate, liveOverlay) => {
    const [himnarioList, setHimnarioList] = useState(processedLocalHymns);
    const [selectedHymn, setSelectedHymn] = useState(processedLocalHymns[0] || null);
    const [selectedStanza, setSelectedStanza] = useState(processedLocalHymns[0]?.stanzas[0] || null);
    const [isLoadingHymns, setIsLoadingHymns] = useState(false);
    const [hymnSearchTerm, setHymnSearchTerm] = useState('');
    const [isHymnDropdownOpen, setIsHymnDropdownOpen] = useState(false);
    
    // Autoadvance features
    const [isAutoAdvanceHymn, setIsAutoAdvanceHymn] = useState(false);
    const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(15);
    const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(15);

    useEffect(() => {
        let isMounted = true;
        const loadHymns = async () => {
            setIsLoadingHymns(true);
            try {
                const res = await mediaClient.get('/hymns');
                if (res.data && res.data.length > 0 && isMounted) {
                    const processed = processHymnList(res.data);
                    if (processed.length > 0) {
                        console.log('[AME] Himnos cargados con exito desde Adventist Media Engine:', processed.length);
                        setHimnarioList(processed);
                        setSelectedHymn(prev => prev ? (processed.find(h => h.number === prev.number) || processed[0]) : processed[0]);
                        setSelectedStanza(prev => {
                            if (!prev) return processed[0]?.stanzas[0] || null;
                            return prev;
                        });
                        setIsLoadingHymns(false);
                        return;
                    }
                }
            } catch (apiErr) {
                console.warn("⚠️ API de himnario no disponible. Usando respaldo local procesado...", apiErr.message);
            }

            if (isMounted) {
                setHimnarioList(processedLocalHymns);
                if (!selectedHymn && processedLocalHymns.length > 0) {
                    setSelectedHymn(processedLocalHymns[0]);
                    setSelectedStanza(processedLocalHymns[0].stanzas[0]);
                }
                setIsLoadingHymns(false);
            }
        };
        loadHymns();
        return () => { isMounted = false; };
    }, []);

    const handleHymnSelect = (hymn) => {
        if (!hymn) return;
        setSelectedHymn(hymn);
        setSelectedStanza(hymn.stanzas ? hymn.stanzas[0] : null);
        setHymnSearchTerm(`${hymn.number} - ${hymn.title}`);
        setIsHymnDropdownOpen(false);
        setActivePreviewSource('himnario');
    };

    useEffect(() => {
        if (selectedHymn && !isHymnDropdownOpen) setHymnSearchTerm(`${selectedHymn.number} - ${selectedHymn.title}`);
    }, [selectedHymn, isHymnDropdownOpen]);

    const handlePrevHymn = () => {
        if (!selectedHymn || !himnarioList.length) return;
        const idx = himnarioList.findIndex(h => h.number === selectedHymn.number);
        const prevIdx = (idx - 1 + himnarioList.length) % himnarioList.length;
        const prevHymn = himnarioList[prevIdx];
        handleHymnSelect(prevHymn);
        // Solo enviar al aire si el himnario está actualmente proyectándose
        if (liveOverlay?.mode === 'himno' && prevHymn.stanzas && prevHymn.stanzas[0]) {
            const s = prevHymn.stanzas[0];
            pushToOBS('himno', `Himno ${prevHymn.number} - ${prevHymn.title}`, s.text, { 
                template: hymnalTemplate, 
                subText: s.subText || (s.number ? `Estrofa ${s.number}` : 'Coro') 
            });
        }
    };

    const handleNextHymn = () => {
        if (!selectedHymn || !himnarioList.length) return;
        const idx = himnarioList.findIndex(h => h.number === selectedHymn.number);
        const nextIdx = (idx + 1) % himnarioList.length;
        const nextHymn = himnarioList[nextIdx];
        handleHymnSelect(nextHymn);
        // Solo enviar al aire si el himnario está actualmente proyectándose
        if (liveOverlay?.mode === 'himno' && nextHymn.stanzas && nextHymn.stanzas[0]) {
            const s = nextHymn.stanzas[0];
            pushToOBS('himno', `Himno ${nextHymn.number} - ${nextHymn.title}`, s.text, { 
                template: hymnalTemplate, 
                subText: s.subText || (s.number ? `Estrofa ${s.number}` : 'Coro') 
            });
        }
    };

    const handlePrevStanza = () => {
        if (!selectedHymn || !selectedHymn.stanzas || !selectedStanza) return;
        const idx = selectedHymn.stanzas.findIndex(s => s === selectedStanza || s.text === selectedStanza.text);
        if (idx > 0) {
            const newStanza = selectedHymn.stanzas[idx - 1];
            setSelectedStanza(newStanza);
            setActivePreviewSource('himnario');
            // Solo proyectar si el modo actual en vivo es himno
            if (liveOverlay?.mode === 'himno') {
                pushToOBS('himno', `Himno ${selectedHymn.number} - ${selectedHymn.title}`, newStanza.text, { 
                    template: hymnalTemplate, 
                    subText: newStanza.subText || (newStanza.number ? `Estrofa ${newStanza.number}` : 'Coro') 
                });
            }
        }
    };

    const handleNextStanza = () => {
        if (!selectedHymn || !selectedHymn.stanzas || !selectedStanza) return;
        const idx = selectedHymn.stanzas.findIndex(s => s === selectedStanza || s.text === selectedStanza.text);
        if (idx >= 0 && idx < selectedHymn.stanzas.length - 1) {
            const newStanza = selectedHymn.stanzas[idx + 1];
            setSelectedStanza(newStanza);
            setActivePreviewSource('himnario');
            // Solo proyectar si el modo actual en vivo es himno
            if (liveOverlay?.mode === 'himno') {
                pushToOBS('himno', `Himno ${selectedHymn.number} - ${selectedHymn.title}`, newStanza.text, { 
                    template: hymnalTemplate, 
                    subText: newStanza.subText || (newStanza.number ? `Estrofa ${newStanza.number}` : 'Coro') 
                });
            }
        }
    };

    return {
        himnarioList,
        selectedHymn, setSelectedHymn,
        selectedStanza, setSelectedStanza,
        isLoadingHymns,
        hymnSearchTerm, setHymnSearchTerm,
        isHymnDropdownOpen, setIsHymnDropdownOpen,
        handleHymnSelect,
        handlePrevHymn, handleNextHymn,
        handlePrevStanza, handleNextStanza,
        isAutoAdvanceHymn, setIsAutoAdvanceHymn,
        autoAdvanceSeconds, setAutoAdvanceSeconds,
        autoAdvanceCountdown, setAutoAdvanceCountdown
    };
};
