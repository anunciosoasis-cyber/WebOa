import { useState, useEffect } from 'react';
import { supabase } from '../../../../api/supabaseClient';
import { useToast } from '../../../../react-ui/components/Toast';

export const useObsWebSockets = (colors, setters) => {
    const { showToast } = useToast();
    const [obsChannel, setObsChannel] = useState(null);
    const [liveOverlay, setLiveOverlay] = useState(() => {
        try { return JSON.parse(localStorage.getItem('obs_overlay_data')) || { mode: 'hidden' }; }
        catch { return { mode: 'hidden' }; }
    });

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
                        setters.setIsBibleLive(true);
                        if (payload.mode === 'bible') {
                            setters.setActivePreviewSource('biblia');
                            setters.setActiveTab('biblia');
                        } else if (payload.mode === 'himno') {
                            setters.setActivePreviewSource('himnario');
                            setters.setActiveTab('himnario');
                        } else if (payload.mode === 'lower_third' || payload.mode === 'predicador') {
                            setters.setActivePreviewSource('predicador');
                            if (payload.title || payload.content) {
                                setters.setPreacher({ name: payload.title || '', title: payload.content || '' });
                            }
                        } else if (payload.mode === 'announcement' || payload.mode === 'anuncio') {
                            setters.setActivePreviewSource('anuncio');
                            if (payload.title || payload.content) {
                                setters.setAnnouncement({ title: payload.title || '', content: payload.content || '' });
                            }
                        }
                    } else {
                        setters.setIsBibleLive(false);
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
                        else if (setters.handleNextHymn) setters.handleNextHymn();
                    }
                    else if (payload.key === 'PageUp' || payload.key === 'PrevHymn') {
                        const prevHymnBtn = document.getElementById('btn-prev-hymn');
                        if (prevHymnBtn && !prevHymnBtn.disabled) prevHymnBtn.click();
                        else if (setters.handlePrevHymn) setters.handlePrevHymn();
                    }
                }
            })
            .on('broadcast', { event: 'remote_select_hymn' }, ({ payload }) => {
                if (payload && payload.hymn && setters.himnarioList) {
                    const targetNum = payload.hymn.number;
                    const found = setters.himnarioList.find(h => h.number === targetNum) || payload.hymn;
                    if (setters.handleHymnSelect) setters.handleHymnSelect(found);
                    
                    if (found.stanzas && found.stanzas[0]) {
                        pushToOBS('himno', `Himno ${found.number} - ${found.title}`, found.stanzas[0].text, { template: setters.hymnalTemplate || 'classic', subText: found.stanzas[0].number ? `Estrofa ${found.stanzas[0].number}` : 'Coro' });
                        setters.setIsBibleLive(true);
                    }
                }
            })
            .on('broadcast', { event: 'remote_select_bible' }, ({ payload }) => {
                if (payload && payload.book && payload.chapter && payload.verse) {
                    const verseText = payload.verse.text;
                    const title = `${payload.book.name} ${payload.chapter}:${payload.verse.verse}`;
                    if (setters.remoteTargetVerseRef) setters.remoteTargetVerseRef.current = payload.verse.verse;
                    if (setters.setSelectedBook) setters.setSelectedBook(payload.book);
                    if (setters.setSelectedChapter) setters.setSelectedChapter(payload.chapter);
                    if (setters.setSelectedVerseObj) setters.setSelectedVerseObj(payload.verse);
                    if (setters.setActivePreviewSource) setters.setActivePreviewSource('biblia');
                    if (setters.setActiveTab) setters.setActiveTab('biblia');
                    if (setters.setIsBibleLive) setters.setIsBibleLive(true);
                    pushToOBS('bible', title, verseText, { template: setters.globalTemplate || 'classic' });
                }
            });

        setObsChannel(channel);
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({ type: 'broadcast', event: 'request_sync', payload: {} });
            }
        });
        return () => supabase.removeChannel(channel);
    }, [colors]);

    return { liveOverlay, setLiveOverlay, pushToOBS, obsChannel };
};
