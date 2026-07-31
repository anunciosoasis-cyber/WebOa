import { useState, useEffect } from 'react';
import fastapiClient from '../../../../api/fastapiClient';
import himnarioData from '../../../../data/himnario.json';

export const useHimnario = (pushToOBS, setActivePreviewSource, isBibleLive, hymnalTemplate) => {
    const [himnarioList, setHimnarioList] = useState([]);
    const [selectedHymn, setSelectedHymn] = useState(null);
    const [selectedStanza, setSelectedStanza] = useState(null);
    const [isLoadingHymns, setIsLoadingHymns] = useState(false);
    const [hymnSearchTerm, setHymnSearchTerm] = useState('');
    const [isHymnDropdownOpen, setIsHymnDropdownOpen] = useState(false);
    
    // Autoadvance features
    const [isAutoAdvanceHymn, setIsAutoAdvanceHymn] = useState(false);
    const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(15);
    const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(15);

    useEffect(() => {
        const loadHymns = async () => {
            setIsLoadingHymns(true);
            try {
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
                console.warn("⚠️ FastAPI no disponible para Himnario. Usando respaldo local...", apiErr.message);
            }

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

    const handlePrevHymn = () => {
        if (!selectedHymn || !himnarioList.length) return;
        const idx = himnarioList.findIndex(h => h.number === selectedHymn.number);
        const prevIdx = (idx - 1 + himnarioList.length) % himnarioList.length;
        const prevHymn = himnarioList[prevIdx];
        handleHymnSelect(prevHymn);
        if (prevHymn.stanzas && prevHymn.stanzas[0]) {
            pushToOBS('himno', `Himno ${prevHymn.number} - ${prevHymn.title}`, prevHymn.stanzas[0].text, { template: hymnalTemplate, subText: prevHymn.stanzas[0].number ? `Estrofa ${prevHymn.stanzas[0].number}` : 'Coro' });
        }
    };

    const handleNextHymn = () => {
        if (!selectedHymn || !himnarioList.length) return;
        const idx = himnarioList.findIndex(h => h.number === selectedHymn.number);
        const nextIdx = (idx + 1) % himnarioList.length;
        const nextHymn = himnarioList[nextIdx];
        handleHymnSelect(nextHymn);
        if (nextHymn.stanzas && nextHymn.stanzas[0]) {
            pushToOBS('himno', `Himno ${nextHymn.number} - ${nextHymn.title}`, nextHymn.stanzas[0].text, { template: hymnalTemplate, subText: nextHymn.stanzas[0].number ? `Estrofa ${nextHymn.stanzas[0].number}` : 'Coro' });
        }
    };

    const handlePrevStanza = () => {
        if (!selectedHymn || !selectedHymn.stanzas || !selectedStanza) return;
        const idx = selectedHymn.stanzas.findIndex(s => s === selectedStanza);
        if (idx > 0) {
            const newStanza = selectedHymn.stanzas[idx - 1];
            setSelectedStanza(newStanza);
            setActivePreviewSource('himnario');
            pushToOBS('himno', `Himno ${selectedHymn.number} - ${selectedHymn.title}`, newStanza.text, { template: hymnalTemplate, subText: newStanza.number ? `Estrofa ${newStanza.number}` : 'Coro' });
        }
    };

    const handleNextStanza = () => {
        if (!selectedHymn || !selectedHymn.stanzas || !selectedStanza) return;
        const idx = selectedHymn.stanzas.findIndex(s => s === selectedStanza);
        if (idx >= 0 && idx < selectedHymn.stanzas.length - 1) {
            const newStanza = selectedHymn.stanzas[idx + 1];
            setSelectedStanza(newStanza);
            setActivePreviewSource('himnario');
            pushToOBS('himno', `Himno ${selectedHymn.number} - ${selectedHymn.title}`, newStanza.text, { template: hymnalTemplate, subText: newStanza.number ? `Estrofa ${newStanza.number}` : 'Coro' });
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
