import { useState, useEffect, useRef } from 'react';
import fastapiClient from '../../../../api/fastapiClient';

export const useBiblia = (pushToOBS, setActivePreviewSource, isBibleLive, bibleTemplate) => {
    const [selectedBook, setSelectedBook] = useState({ id: 1, name: "Génesis", chapters: 50 });
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [verses, setVerses] = useState([]);
    const [selectedVerseObj, setSelectedVerseObj] = useState(null);
    const [isLoadingVerses, setIsLoadingVerses] = useState(false);
    const remoteTargetVerseRef = useRef(null);

    useEffect(() => {
        const fetchChapter = async () => {
            if (!selectedBook || !selectedChapter) return;
            setIsLoadingVerses(true);
            try {
                // Try bolls.life first as it's faster and more reliable
                try {
                    const response = await fetch(`https://bolls.life/get-chapter/RV1960/${selectedBook.id}/${selectedChapter}/`);
                    if (response.ok) {
                        const data = await response.json();
                        setVerses(data);
                        const targetV = remoteTargetVerseRef.current ? data.find(v => v.verse === remoteTargetVerseRef.current) : null;
                        if (targetV) {
                            setSelectedVerseObj(targetV);
                            remoteTargetVerseRef.current = null;
                        } else {
                            setSelectedVerseObj(prev => (prev && data.some(v => v.verse === prev.verse)) ? prev : (data[0] || null));
                        }
                        setIsLoadingVerses(false);
                        return;
                    }
                } catch (bollsErr) {
                    console.warn("⚠️ bolls.life no disponible. Consultando FastAPI...", bollsErr);
                }

                // Fallback to FastAPI
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
                }
            } catch (err) {
                console.error("Error cargando versículos.", err);
            } finally {
                setIsLoadingVerses(false);
            }
        };
        fetchChapter();
    }, [selectedBook, selectedChapter]);

    const currentVerseIndex = verses.findIndex(v => v.verse === selectedVerseObj?.verse);
    const canGoPrev = currentVerseIndex > 0;
    const canGoNext = currentVerseIndex >= 0 && currentVerseIndex < verses.length - 1;

    const handlePrevVerse = () => {
        if (canGoPrev) {
            const newVerse = verses[currentVerseIndex - 1];
            setSelectedVerseObj(newVerse);
            setActivePreviewSource('biblia');
            pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${newVerse.verse}`, newVerse.text, { template: bibleTemplate });
        }
    };

    const handleNextVerse = () => {
        if (canGoNext) {
            const newVerse = verses[currentVerseIndex + 1];
            setSelectedVerseObj(newVerse);
            setActivePreviewSource('biblia');
            pushToOBS('bible', `${selectedBook.name} ${selectedChapter}:${newVerse.verse}`, newVerse.text, { template: bibleTemplate });
        }
    };

    return {
        selectedBook, setSelectedBook,
        selectedChapter, setSelectedChapter,
        verses,
        selectedVerseObj, setSelectedVerseObj,
        isLoadingVerses,
        remoteTargetVerseRef,
        handlePrevVerse, handleNextVerse
    };
};
