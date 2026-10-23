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

    const channelRef = useRef(null);
    const settersRef = useRef(setters);
    settersRef.current = setters;
    const colorsRef = useRef(colors);
    colorsRef.current = colors;
    const liveOverlayRef = useRef(liveOverlay);
    liveOverlayRef.current = liveOverlay;

    const pushToOBS = async (mode, title, content, extra = {}) => {
        try {
            const c = colorsRef.current;
            const currentTemplate = (
                extra.template || 
                liveOverlayRef.current?.template || 
                localStorage.getItem('oasis_presentation_template') || 
                'classic'
            ).toLowerCase();

            const payload = {
                mode,
                title: title || '',
                content: content || '',
                template: currentTemplate,
                subText: extra.subText || '',
                bg_color: c.bg,
                text_color: c.text,
                accent_color: c.accent,
                ...extra
            };

            localStorage.setItem('obs_overlay_data', JSON.stringify(payload));
            if (payload.template) {
                localStorage.setItem('oasis_presentation_template', payload.template);
            }
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
                if (lastData) {
                    try {
                        const parsed = JSON.parse(lastData);
                        // Solo sincronizar si hay una proyección activa, nunca re-proyectar estado oculto o basura
                        if (parsed && parsed.mode && parsed.mode !== 'hidden') {
                            await channel.send({ type: 'broadcast', event: 'update_overlay', payload: parsed });
                        }
                    } catch(e) {}
                }
            })
            .on('broadcast', { event: 'update_overlay' }, ({ payload }) => {
                if (payload) {
                    setLiveOverlay(payload);
                    try {
                        localStorage.setItem('obs_overlay_data', JSON.stringify(payload));
                        if (payload.template) localStorage.setItem('oasis_presentation_template', payload.template.toLowerCase());
                    } catch(e){}
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
                // Protección crucial: SOLO reaccionar a flechas remotas si lo que está en el aire es himno o biblia
                const currentAirMode = liveOverlayRef.current?.mode;
                if (currentAirMode !== 'himno' && currentAirMode !== 'bible') {
                    return;
                }

                if (payload && payload.key) {
                    if (payload.key === 'ArrowRight' || payload.key === 'ArrowDown') {
                        if (currentAirMode === 'himno') {
                            const nextStanzaBtn = document.getElementById('btn-next-stanza');
                            if (nextStanzaBtn && !nextStanzaBtn.disabled) nextStanzaBtn.click();
                        } else if (currentAirMode === 'bible') {
                            const nextVerseBtn = document.getElementById('btn-next-verse');
                            if (nextVerseBtn && !nextVerseBtn.disabled) nextVerseBtn.click();
                        }
                    }
                    else if (payload.key === 'ArrowLeft' || payload.key === 'ArrowUp') {
                        if (currentAirMode === 'himno') {
                            const prevStanzaBtn = document.getElementById('btn-prev-stanza');
                            if (prevStanzaBtn && !prevStanzaBtn.disabled) prevStanzaBtn.click();
                        } else if (currentAirMode === 'bible') {
                            const prevVerseBtn = document.getElementById('btn-prev-verse');
                            if (prevVerseBtn && !prevVerseBtn.disabled) prevVerseBtn.click();
                        }
                    }
                    else if (payload.key === 'PageDown' || payload.key === 'NextHymn') {
                        if (currentAirMode === 'himno') {
                            if (s().handleNextHymn) s().handleNextHymn();
                        }
                    }
                    else if (payload.key === 'PageUp' || payload.key === 'PrevHymn') {
                        if (currentAirMode === 'himno') {
                            if (s().handlePrevHymn) s().handlePrevHymn();
                        }
                    }
                }
            })
            .on('broadcast', { event: 'remote_select_hymn' }, ({ payload }) => {
                if (payload && payload.hymn) {
                    const targetNum = payload.hymn.number;
                    const found = (s().himnarioList || []).find(h => h.number === targetNum) || payload.hymn;
                    if (s().handleHymnSelect) s().handleHymnSelect(found);

                    const stanza = found.stanzas?.[Math.min(Math.max(0, payload.stanzaIndex || 0), found.stanzas.length - 1)];
                    if (stanza) {
                        if (s().setSelectedStanza) s().setSelectedStanza(stanza);
                        // Preservar la plantilla activa del payload o del overlay en vivo
                        const tmpl = (payload.template || liveOverlayRef.current?.template || s().hymnalTemplate || 'classic').toLowerCase();
                        pushRef.current('himno', `Himno ${found.number} - ${found.title}`, stanza.text, { 
                            template: tmpl, 
                            subText: stanza.subText || (stanza.number ? `Estrofa ${stanza.number}` : 'Coro') 
                        });
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
                    const tmpl = (payload.template || liveOverlayRef.current?.template || s().bibleTemplate || 'classic').toLowerCase();
                    pushRef.current('bible', title, verseText, { template: tmpl });
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
