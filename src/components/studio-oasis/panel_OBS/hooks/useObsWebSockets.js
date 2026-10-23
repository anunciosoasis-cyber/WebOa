import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../api/supabaseClient';
import { useLiveKey, overlayChannel } from '../../../../api/liveChannel';
import { useToast } from '../../../../react-ui/components/Toast';

export const useObsWebSockets = (colors, setters) => {
    const { showToast } = useToast();
    const liveKey = useLiveKey();
    const [obsChannel, setObsChannel] = useState(null);
    const [liveOverlay, setLiveOverlay] = useState(() => {
        try { return JSON.parse(localStorage.getItem('obs_overlay_data')) || { mode: 'hidden' }; }
        catch { return { mode: 'hidden' }; }
    });

    // Los manejadores del canal se registran una sola vez: leen siempre los valores actuales desde refs.
    // Antes capturaban los del primer render (canal null, himnario vacío) y la selección remota no salía al aire.
    const channelRef = useRef(null);
    const settersRef = useRef(setters);
    settersRef.current = setters;
    const colorsRef = useRef(colors);
    colorsRef.current = colors;

    const pushToOBS = async (mode, title, content, extra = {}) => {
        try {
            const c = colorsRef.current;
            const payload = {
                mode,
                title,
                content,
                template: extra.template || 'classic',
                subText: extra.subText || '',
                bg_color: c.bg,
                text_color: c.text,
                accent_color: c.accent,
                ...extra
            };
            localStorage.setItem('obs_overlay_data', JSON.stringify(payload));
            setLiveOverlay(payload);
            if (channelRef.current) {
                await channelRef.current.send({ type: 'broadcast', event: 'update_overlay', payload });
                showToast('Enviado al aire', 'success');
            } else {
                showToast('Sin conexión con las pantallas remotas: solo se actualizó este equipo', 'warning');
            }
        } catch (err) { showToast('Error de conexión', 'error'); }
    };
    const pushRef = useRef(pushToOBS);
    pushRef.current = pushToOBS;

    useEffect(() => {
        if (!liveKey) return;
        const channel = overlayChannel(liveKey);
        const s = () => settersRef.current;
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
                        s().setIsBibleLive(true);
                        if (payload.mode === 'bible') {
                            s().setActivePreviewSource('biblia');
                            s().setActiveTab('biblia');
                        } else if (payload.mode === 'himno') {
                            s().setActivePreviewSource('himnario');
                            s().setActiveTab('himnario');
                        } else if (payload.mode === 'lower_third' || payload.mode === 'predicador') {
                            s().setActivePreviewSource('predicador');
                            if (payload.title || payload.content) {
                                s().setPreacher({ name: payload.title || '', title: payload.content || '' });
                            }
                        } else if (payload.mode === 'announcement' || payload.mode === 'anuncio') {
                            s().setActivePreviewSource('anuncio');
                            if (payload.title || payload.content) {
                                s().setAnnouncement({ title: payload.title || '', content: payload.content || '' });
                            }
                        }
                    } else {
                        s().setIsBibleLive(false);
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
                        else if (s().handleNextHymn) s().handleNextHymn();
                    }
                    else if (payload.key === 'PageUp' || payload.key === 'PrevHymn') {
                        const prevHymnBtn = document.getElementById('btn-prev-hymn');
                        if (prevHymnBtn && !prevHymnBtn.disabled) prevHymnBtn.click();
                        else if (s().handlePrevHymn) s().handlePrevHymn();
                    }
                }
            })
            .on('broadcast', { event: 'remote_select_hymn' }, ({ payload }) => {
                if (payload && payload.hymn) {
                    const targetNum = payload.hymn.number;
                    const found = (s().himnarioList || []).find(h => h.number === targetNum) || payload.hymn;
                    if (s().handleHymnSelect) s().handleHymnSelect(found);

                    // stanzaIndex (opcional, contrato v1): la app elige la estrofa; sin él, la primera
                    const stanza = found.stanzas?.[Math.min(Math.max(0, payload.stanzaIndex || 0), found.stanzas.length - 1)];
                    if (stanza) {
                        if (s().setSelectedStanza) s().setSelectedStanza(stanza);
                        pushRef.current('himno', `Himno ${found.number} - ${found.title}`, stanza.text, { template: s().hymnalTemplate || 'classic', subText: stanza.number ? `Estrofa ${stanza.number}` : 'Coro' });
                        s().setIsBibleLive(true);
                    }
                }
            })
            .on('broadcast', { event: 'remote_select_bible' }, ({ payload }) => {
                if (payload && payload.book && payload.chapter && payload.verse) {
                    const verseText = payload.verse.text;
                    const title = `${payload.book.name} ${payload.chapter}:${payload.verse.verse}`;
                    if (s().remoteTargetVerseRef) s().remoteTargetVerseRef.current = payload.verse.verse;
                    if (s().setSelectedBook) s().setSelectedBook(payload.book);
                    if (s().setSelectedChapter) s().setSelectedChapter(payload.chapter);
                    if (s().setSelectedVerseObj) s().setSelectedVerseObj(payload.verse);
                    if (s().setActivePreviewSource) s().setActivePreviewSource('biblia');
                    if (s().setActiveTab) s().setActiveTab('biblia');
                    if (s().setIsBibleLive) s().setIsBibleLive(true);
                    pushRef.current('bible', title, verseText, { template: s().globalTemplate || 'classic' });
                }
            });

        channelRef.current = channel;
        setObsChannel(channel);
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({ type: 'broadcast', event: 'request_sync', payload: {} });
            }
        });
        return () => {
            channelRef.current = null;
            setObsChannel(null);
            supabase.removeChannel(channel);
        };
    }, [liveKey]);

    return { liveOverlay, setLiveOverlay, pushToOBS, obsChannel, liveKey };
};
