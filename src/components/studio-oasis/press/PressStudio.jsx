// PressStudio.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cast, Square, Check, Image as ImageIcon, Plus, X, Presentation } from 'lucide-react';
import { useToast } from '../../../react-ui/components/Toast';
import { PresentationManager } from './presentations';
import PressFileManager, { imageFileToDataUrl } from './PressFileManager';
import PressPreview from './PressPreview';
import PressRemote from './PressRemote';
import PressThumbnails from './PressThumbnails';
import PressUploader from './PressUploader';
import PressEditModal from './PressEditModal';
import { DEFAULT_SLIDE_STYLE } from './SlideCanvasView';
import QRCode from 'qrcode';
import { realtime } from '../../../api/realtime';
import { useLiveKey, liveUrl, pressChannel, overlayChannel, shareableUrl, loadCurrentRoom } from '../../../api/liveChannel';
import apiClient from '../../../api/client';

const SLIDES_KEY = 'oasis_press_slides';
// Ejemplo inicial: se puede editar, reordenar o borrar desde la tira de diapositivas
const DEFAULT_SLIDES = [
  { id: 1, title: 'Bienvenida al Culto Divino', subtitle: 'Iglesia Adventista Oasis', type: 'styled' },
  { id: 2, title: 'Himno de Alabanza #12', subtitle: 'Señor mi Dios al contemplar', type: 'styled' },
  { id: 3, title: 'Lectura Bíblica: Salmos 23:1', subtitle: 'Jehová es mi pastor; nada me faltará.', type: 'styled' },
  { id: 4, title: 'Sermón: La Esperanza que Transforma', subtitle: 'Pr. Felipe Miranda', type: 'styled' },
  { id: 5, title: 'Himno Final #340 & Bendición', subtitle: 'En celestial morada', type: 'styled' },
];
// Presentaciones de la app ya insertadas aquí (no se repiten al recuperar las pendientes)
const IMPORTED_KEY = 'oasis_press_imported_decks';
const APPLIED_OPS_KEY = 'oasis_press_applied_ops';
const readImported = () => {
  try {
    const raw = localStorage.getItem(IMPORTED_KEY);
    return raw === null ? null : new Set(JSON.parse(raw));
  } catch { return new Set(); }
};
const deckSlides = ({ deckId, title, slides }) => (slides || []).map((sl, i) => ({
  id: `deck-${deckId}-${i}`,
  title: sl.title || `${title} — ${i + 1}`,
  subtitle: title,
  fileUrl: sl.url,
  mediaUrl: sl.url,
  type: sl.type === 'video' ? 'video' : 'image',
  mediaType: sl.type === 'video' ? 'video' : 'image',
}));
const newSlideId = () => `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;


// Obtiene una imagen ligera y segura para el control remoto (<350 KB en base64 o URL remota)
const getSafeRemoteImage = (slide) => {
  if (!slide) return null;
  if (slide.thumbnailUrl && typeof slide.thumbnailUrl === 'string') {
    return slide.thumbnailUrl;
  }
  const candidate = slide.fileUrl || slide.mediaUrl || slide.elements?.find((el) => el.type === 'image')?.content;
  if (typeof candidate === 'string') {
    if (/^https?:\/\//.test(candidate)) return candidate;
    if (candidate.startsWith('data:image/') && candidate.length <= 350_000) return candidate;
  }
  return slide.thumbnailUrl || null;
};

// Diapositivas de texto que la app puede editar (las de imagen/vídeo solo se mueven o borran)
const EDITABLE_TYPES = new Set(['styled', 'hybrid_announcement']);

// Lo que llega de la app: solo textos y estilo (nada de URLs de medios), recortados
const appText = (v) => (typeof v === 'string' ? v.slice(0, 500) : '');
const appSlideFields = (sl) => {
  const ev = sl?.eventData || {};
  const st = sl?.style || {};
  return {
    title: appText(sl?.title),
    subtitle: appText(sl?.subtitle),
    eventData: { tag: appText(ev.tag), speaker: appText(ev.speaker), eventDate: appText(ev.eventDate), location: appText(ev.location) },
    style: {
      ...Object.fromEntries(['bgColor', 'textColor', 'accentColor', 'fontFamily'].filter((k) => typeof st[k] === 'string').map((k) => [k, st[k].slice(0, 40)])),
      ...Object.fromEntries(['bold', 'italic', 'underline'].filter((k) => typeof st[k] === 'boolean').map((k) => [k, st[k]])),
    },
  };
};

// Imagen o vídeo de una diapositiva creada en la app: URL del servidor (https) o imagen data: (nada de blob: ni otros esquemas)
const appMedia = (sl) => {
  const url = sl?.mediaUrl;
  if (typeof url !== 'string' || !shareableUrl(url) || !/^(data:image\/|https?:\/\/)/.test(url)) return null;
  return { mediaUrl: url, fileUrl: url, mediaType: sl.mediaType === 'video' ? 'video' : 'image' };
};

// Como la vista previa de la app: una imagen es el fondo del cartel (con velo); solo el vídeo pasa a anuncio híbrido
const appMediaFields = (media) => (!media ? { type: 'styled', background: null, mediaUrl: null, fileUrl: null }
  : media.mediaType === 'image' ? { type: 'styled', background: media.mediaUrl, mediaUrl: null, fileUrl: null }
    : { ...media, type: 'hybrid_announcement', background: null });

const createRemotePayload = (allSlides, activeIndex, currentTitle, currentBlank, appliedOps = [], globalBackground = null) => {
  const active = allSlides[activeIndex];
  const next = allSlides[activeIndex + 1];

  const activeImg = getSafeRemoteImage(active);
  const nextImg = getSafeRemoteImage(next);

  return {
    currentSlide: activeIndex + 1,
    totalSlides: allSlides.length,
    isBlank: Boolean(currentBlank),
    title: currentTitle || 'Oasis Press',
    activeSlideTitle: active?.title || `Diapositiva ${activeIndex + 1}`,
    nextSlideTitle: next ? (next.title || `Diapositiva ${activeIndex + 2}`) : 'Fin de Presentación',
    activeSlideUrl: activeImg,
    nextSlideUrl: nextImg,
    activeSlide: active ? {
      title: active.title || `Diapositiva ${activeIndex + 1}`,
      subtitle: active.subtitle || '',
      type: active.type || 'styled',
      fileUrl: activeImg,
      thumbnailUrl: active?.thumbnailUrl || activeImg,
      background: shareableUrl(active.background) || null,
    } : null,
    nextSlide: next ? {
      title: next.title || `Diapositiva ${activeIndex + 2}`,
      subtitle: next.subtitle || '',
      type: next.type || 'styled',
      fileUrl: nextImg,
      thumbnailUrl: next?.thumbnailUrl || nextImg,
      background: shareableUrl(next.background) || null,
    } : null,
    slidesSummary: allSlides.map((sl, i) => ({
      index: i + 1,
      id: String(sl.id ?? i),
      title: sl.title || `Diapositiva ${i + 1}`,
      subtitle: sl.subtitle || '',
      type: sl.type || 'styled',
      thumbnail: sl.thumbnailUrl || (sl.mediaType !== 'video' && sl.type !== 'video' && typeof sl.fileUrl === 'string' && (sl.fileUrl.startsWith('http') || sl.fileUrl.length < 50_000) ? sl.fileUrl : null),
      mediaType: sl.mediaType || (sl.type === 'video' ? 'video' : undefined),
      // El fondo de un cartel viaja como su imagen: así la app la muestra al editar y la conserva al guardar
      mediaUrl: [sl.mediaUrl, sl.type === 'styled' ? sl.background : null].find((u) => typeof u === 'string' && (u.startsWith('http') || (u.startsWith('data:image/') && u.length < 50_000))),
      // Datos para editarla desde la app (solo diapositivas de texto)
      ...(EDITABLE_TYPES.has(sl.type || 'styled') ? { editable: true, eventData: sl.eventData || {}, style: { ...DEFAULT_SLIDE_STYLE, ...(sl.style || {}) } } : {}),
      hasBackground: !!sl.background,
    })),
    // Fondo general de las diapositivas de texto (la app muestra si hay uno y permite quitarlo)
    hasBackground: !!globalBackground,
    // Cambios de la app ya aplicados aquí: la app deja de reenviarlos (ver ppt_add/update/delete_slide)
    appliedOps,
    timestamp: Date.now(),
  };
};

export const PressStudio = () => {
  const [presentationManager] = useState(() => new PresentationManager());
  const [fileManager] = useState(() => new PressFileManager());
  const viewportRef = useRef(null);

  const [slides, setSlides] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SLIDES_KEY));
      if (Array.isArray(saved) && saved.length) return saved;
    } catch { /* sin datos guardados */ }
    return DEFAULT_SLIDES;
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isBlank, setIsBlank] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [presentationTitle, setPresentationTitle] = useState('Oasis Press');
  const [showAddSlideModal, setShowAddSlideModal] = useState(false);

  // El enlace del control remoto lleva la clave del canal: el QR se genera aquí mismo
  // (antes se pedía a api.qrserver.com, que habría recibido la clave).
  const liveKey = useLiveKey();
  const remoteUrl = liveKey ? `${window.location.origin}${liveUrl('/remote', liveKey)}` : '';
  const [qrApiUrl, setQrApiUrl] = useState('');
  useEffect(() => {
    if (!remoteUrl) return;
    QRCode.toDataURL(remoteUrl, { width: 360, margin: 1 }).then(setQrApiUrl).catch(() => setQrApiUrl(''));
  }, [remoteUrl]);

  const pressChannelRef = useRef(null);

  // Fondo de las diapositivas de texto (se guarda en este equipo)
  const BG_KEY = 'oasis_press_bg';
  const [pressBackground, setPressBackground] = useState(() => { try { return localStorage.getItem(BG_KEY) || null; } catch { return null; } });
  const bgInputRef = useRef(null);
  const handleBackgroundFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await imageFileToDataUrl(file, 1280, 0.75);
      setPressBackground(url);
      try { localStorage.setItem(BG_KEY, url); } catch { showToast('Fondo aplicado solo hasta recargar: la imagen es muy pesada para guardarla', 'warning'); }
    } catch {
      showToast('No se pudo leer la imagen de fondo', 'error');
    }
  };
  const clearBackground = () => {
    setPressBackground(null);
    try { localStorage.removeItem(BG_KEY); } catch { /* nada que borrar */ }
  };

  // Envía la diapositiva actual al proyector: localStorage (proyector de este PC) y canal (otros equipos)
  const pushSlideToScreens = () => {
    const activeSlide = slides[currentSlideIndex];
    const media = activeSlide?.fileUrl || activeSlide?.mediaUrl || null;
    const effectiveBg = shareableUrl(activeSlide?.background) || shareableUrl(pressBackground) || null;
    const slideToSend = activeSlide ? {
      ...activeSlide,
      background: effectiveBg,
      fileUrl: shareableUrl(activeSlide.fileUrl) || activeSlide.fileUrl,
      mediaUrl: shareableUrl(activeSlide.mediaUrl) || activeSlide.mediaUrl,
    } : null;
    // La diapositiva viaja completa: el proyector la pinta con el mismo componente que la vista previa
    const overlayPayload = {
      mode: isBlank ? 'blank' : 'slide',
      title: presentationTitle ? `${presentationTitle} — Diapositiva ${currentSlideIndex + 1}` : `Diapositiva ${currentSlideIndex + 1}`,
      content: activeSlide?.subtitle || activeSlide?.title || '',
      mediaType: activeSlide?.mediaType || (activeSlide?.type === 'video' ? 'video' : media ? 'image' : null),
      slide: slideToSend,
      background: effectiveBg,
      target: 'proyector',
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem('obs_overlay_data', JSON.stringify(overlayPayload));
    } catch (e) {
      console.warn('Imagen demasiado grande para el proyector local:', e);
    }
    pressChannelRef.current?.send({
      type: 'broadcast',
      event: 'ppt_slide',
      payload: overlayPayload,
    });
  };

  // Proyectar: envía la diapositiva actual a las pantallas ya abiertas (no abre ventanas;
  // el proyector se abre una vez con "Full" en Pantalla Proyector).
  const { showToast } = useToast();
  const [justSent, setJustSent] = useState(false);
  // La presentación solo está al aire tras una orden (botón Proyectar o el control de la app);
  // mientras lo está, cambiar de diapositiva la sigue en pantalla. Otro overlay (himno, Biblia…) la saca del aire.
  const onAirRef = useRef(false);
  const [airTick, setAirTick] = useState(0);
  // Los oyentes del canal se crean una vez: llaman a la versión actual (si no, enviarían la lista del primer render)
  const pushRef = useRef(pushSlideToScreens);
  pushRef.current = pushSlideToScreens;
  const handleProjectSlide = () => {
    onAirRef.current = true;
    pushSlideToScreens();
    setJustSent(true);
    setTimeout(() => setJustSent(false), 1600);
    showToast(isBlank ? 'Pantalla negra enviada al proyector' : `Diapositiva ${currentSlideIndex + 1} enviada al proyector`, 'success', 2500);
  };

  // Detener: saca la presentación del aire y deja el proyector limpio (también lo que mandó la app).
  const handleStopAll = () => {
    onAirRef.current = false;
    const payload = { mode: 'hidden', target: 'proyector', timestamp: Date.now() };
    try { localStorage.setItem('obs_overlay_data', JSON.stringify(payload)); } catch { /* sin espacio: el canal basta */ }
    pressChannelRef.current?.send({ type: 'broadcast', event: 'ppt_slide', payload });
    showToast('Presentación detenida: proyector limpio', 'info', 2500);
  };

  // Solo cuando el operador cambia de diapositiva o activa la pantalla negra: abrir Studio o añadir
  // diapositivas ya no se adueña del proyector. Comparar con el valor anterior es idempotente en StrictMode.
  const activeBackground = slides[currentSlideIndex]?.background || null;
  const prevSync = useRef({ currentSlideIndex, isBlank, pressBackground, activeBackground, airTick });
  useEffect(() => {
    const prev = prevSync.current;
    if (prev.currentSlideIndex === currentSlideIndex && prev.isBlank === isBlank
      && prev.pressBackground === pressBackground && prev.activeBackground === activeBackground && prev.airTick === airTick) return;
    prevSync.current = { currentSlideIndex, isBlank, pressBackground, activeBackground, airTick };
    if (onAirRef.current) pushSlideToScreens();
  }, [currentSlideIndex, isBlank, pressBackground, activeBackground, airTick]);

  useEffect(() => {
    if (!liveKey) return;
    const overlay = overlayChannel(liveKey);
    let lastTs = 0; // al reconectar, el servidor repite el último overlay con su hora original: no es una orden nueva
    overlay.on('broadcast', { event: 'update_overlay' }, ({ payload, ts }) => {
      if (ts && ts <= lastTs) return;
      if (ts) lastTs = ts;
      if (payload && !payload._sync && payload.mode && payload.mode !== 'hidden') onAirRef.current = false;
    }).subscribe();
    return () => { realtime.removeChannel(overlay); };
  }, [liveKey]);

  // Operaciones de la app ya aplicadas (opId): la app las reenvía hasta verlas en ppt_state, así nunca se duplican.
  // Se guardan para que una recarga del Estudio no vuelva a aplicar algo que la app aún no vio confirmado.
  const appliedOpsRef = useRef(null);
  if (appliedOpsRef.current === null) {
    try { appliedOpsRef.current = JSON.parse(localStorage.getItem(APPLIED_OPS_KEY)) || []; } catch { appliedOpsRef.current = []; }
  }
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  // Control remoto (celular) por el canal en tiempo real
  const remoteStateRef = useRef(null);
  remoteStateRef.current = createRemotePayload(slides, currentSlideIndex, presentationTitle, isBlank, appliedOpsRef.current, pressBackground);
  const announcedDecksRef = useRef(new Set());
  const slideCountRef = useRef(slides.length);
  slideCountRef.current = slides.length;

  const applyOnce = (opId, apply) => {
    if (typeof opId !== 'string' || appliedOpsRef.current.includes(opId)) return false;
    appliedOpsRef.current = [...appliedOpsRef.current, opId].slice(-100);
    try { localStorage.setItem(APPLIED_OPS_KEY, JSON.stringify(appliedOpsRef.current)); } catch { /* solo en memoria */ }
    apply();
    return true;
  };

  // Lo que llega de la app se inserta después de la actual, sin cambiar lo que está al aire.
  const insertFromApp = (incoming, message) => {
    if (!incoming.length) return;
    const at = Math.min(remoteStateRef.current?.currentSlide ?? 0, slideCountRef.current);
    // Se añade después de la actual sin salir al aire: solo se proyecta cuando el operador la elige o la envía
    setSlides((prev) => [...prev.slice(0, at), ...incoming, ...prev.slice(at)]);
    showToast(message, 'success', 4000);
  };

  const importedDecksRef = useRef(undefined);
  if (importedDecksRef.current === undefined) importedDecksRef.current = readImported();
  const importDecks = (decks) => {
    const seen = importedDecksRef.current || new Set();
    const fresh = decks.filter((d) => !seen.has(d.deckId));
    if (!fresh.length) return;
    fresh.forEach((d) => seen.add(d.deckId));
    importedDecksRef.current = seen;
    try { localStorage.setItem(IMPORTED_KEY, JSON.stringify([...seen].slice(-200))); } catch { /* sin espacio: solo en memoria */ }
    const own = fresh.find((d) => d.deckId === serverDeckRef.current?.deckId);
    if (own) {
      finishServerDeck();
      const ownSlides = deckSlides(own);
      setSlides(ownSlides);
      setCurrentSlideIndex(0);
      setIsBlank(false);
      if (own.title) setPresentationTitle(own.title);
      showToast(`${ownSlides.length} diapositivas listas, tal cual el archivo original`, 'success', 4000);
      return;
    }
    const incoming = fresh.flatMap(deckSlides);
    insertFromApp(incoming, `${incoming.length} diapositiva(s) de "${fresh.map((d) => d.title).join('", "')}" recibidas desde la app (en la lista, sin proyectar)`);
  };

  // Subidas de la app que terminaron con el Estudio cerrado (el aviso en vivo se perdió): se recuperan al abrir.
  useEffect(() => {
    if (!liveKey) return;
    let alive = true;
    (async () => {
      try {
        const [room, { data }] = await Promise.all([loadCurrentRoom(), apiClient.get('/slides/decks')]);
        const since = Date.now() - 12 * 60 * 60 * 1000;
        const pending = (data || [])
          .filter((d) => d.roomId && d.roomId === room?.id && d.status === 'ready' && new Date(d.createdAt).getTime() > since)
          .reverse()
          .map((d) => ({ deckId: d.id, title: d.title, slides: d.slides }));
        if (!alive) return;
        // Primera vez en este equipo: lo anterior ya se recibió en vivo, solo se marca
        if (importedDecksRef.current === null) {
          importedDecksRef.current = new Set(pending.map((d) => d.deckId));
          try { localStorage.setItem(IMPORTED_KEY, JSON.stringify([...importedDecksRef.current])); } catch { /* solo en memoria */ }
          return;
        }
        importDecks(pending);
      } catch { /* sin sesión o sin el módulo de medios: solo tiempo real */ }
    })();
    return () => { alive = false; };
  }, [liveKey]);

  useEffect(() => {
    if (!liveKey) return;
    const channel = pressChannel(liveKey);
    // Con la lista de cambios aplicados al día (la app la usa para confirmar lo que envió)
    const sendState = () => channel.send({ type: 'broadcast', event: 'ppt_state', payload: { ...remoteStateRef.current, appliedOps: appliedOpsRef.current } });
    channel
      .on('broadcast', { event: 'ppt_command' }, ({ payload }) => {
        const action = payload?.action;
        // El control de la app es una orden de proyectar: la diapositiva elegida sale al aire
        if (['NEXT', 'PREV', 'FIRST', 'LAST', 'TOGGLE_BLANK', 'GOTO'].includes(action)) {
          const wasOnAir = onAirRef.current;
          onAirRef.current = true;
          // Si no cambia de diapositiva (p. ej. GOTO a la actual), el efecto se dispara igual y la envía una sola vez
          if (!wasOnAir) setAirTick((t) => t + 1);
        }
        if (action === 'NEXT') {
          setCurrentSlideIndex((prev) => Math.min(slideCountRef.current - 1, prev + 1));
          setIsBlank(false);
        } else if (action === 'PREV') {
          setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
          setIsBlank(false);
        } else if (action === 'FIRST') {
          setCurrentSlideIndex(0);
          setIsBlank(false);
        } else if (action === 'LAST') {
          setCurrentSlideIndex(Math.max(0, slideCountRef.current - 1));
          setIsBlank(false);
        } else if (action === 'TOGGLE_BLANK') {
          setIsBlank((prev) => !prev);
        } else if (action === 'GOTO' && typeof payload?.index === 'number') {
          setCurrentSlideIndex(Math.max(0, Math.min(slideCountRef.current - 1, payload.index)));
          setIsBlank(false);
        }
      })
      .on('broadcast', { event: 'ppt_request_state' }, sendState)
      // Diapositiva de texto creada en la app: solo campos de texto y estilo (nada de URLs de medios)
      // Diapositivas de texto desde la app: crear, editar y borrar (idempotentes por opId)
      .on('broadcast', { event: 'ppt_add_slide' }, ({ payload }) => {
        if (typeof payload?.slide?.title !== 'string') return;
        const media = appMedia(payload.slide);
        const slide = { id: newSlideId(), hidden: {}, ...appSlideFields(payload.slide), ...appMediaFields(media) };
        slide.style = { ...DEFAULT_SLIDE_STYLE, ...slide.style };
        applyOnce(payload.opId ?? newSlideId(), () => insertFromApp([slide], `Diapositiva "${slide.title}" recibida desde la app (en la lista, sin proyectar)`));
        sendState();
      })
      .on('broadcast', { event: 'ppt_update_slide' }, ({ payload }) => {
        if (!payload?.id || !payload?.slide) return;
        applyOnce(payload.opId ?? newSlideId(), () => {
          const fields = appSlideFields(payload.slide);
          const hasMediaKey = 'mediaUrl' in payload.slide;
          const media = appMedia(payload.slide);
          setSlides((prev) => prev.map((sl) => (String(sl.id) !== String(payload.id) || !EDITABLE_TYPES.has(sl.type || 'styled') ? sl : {
            ...sl,
            ...(hasMediaKey ? appMediaFields(media) : {}),
            title: fields.title,
            subtitle: fields.subtitle,
            eventData: { ...(sl.eventData || {}), ...fields.eventData },
            style: { ...DEFAULT_SLIDE_STYLE, ...(sl.style || {}), ...fields.style },
          })));
          showToast(`Diapositiva "${fields.title}" editada desde la app`, 'success', 3000);
        });
        sendState();
      })
      .on('broadcast', { event: 'ppt_delete_slide' }, ({ payload }) => {
        if (!payload?.id) return;
        applyOnce(payload.opId ?? newSlideId(), () => {
          const current = slidesRef.current;
          const idx = current.findIndex((sl) => String(sl.id) === String(payload.id));
          if (idx < 0 || current.length <= 1) return;
          setSlides(current.filter((_, i) => i !== idx));
          // La que está al aire no cambia: si se borra una anterior, el índice se corre
          setCurrentSlideIndex((cur) => Math.max(0, Math.min(current.length - 2, idx < cur ? cur - 1 : cur)));
          showToast('Diapositiva eliminada desde la app', 'info', 3000);
        });
        sendState();
      })
      .on('broadcast', { event: 'ppt_set_background' }, ({ payload }) => {
        const bg = payload?.background;
        const valid = bg === null || (typeof bg === 'string' && !!shareableUrl(bg) && /^(data:image\/|https?:\/\/)/.test(bg));
        applyOnce(payload?.opId ?? newSlideId(), () => {
          // Inválida o muy pesada: se confirma igual (la app deja de reenviarla) y se avisa aquí
          if (!valid) return showToast('La imagen de fondo enviada desde la app no es válida o es muy pesada', 'error', 4000);
          if (payload.id) {
            setSlides((prev) => prev.map((sl) => (String(sl.id) === String(payload.id) ? { ...sl, background: bg } : sl)));
            showToast(bg ? 'Fondo de la diapositiva cambiado desde la app' : 'Fondo de la diapositiva quitado desde la app', 'success', 3000);
          } else if (bg) {
            setPressBackground(bg);
            try { localStorage.setItem(BG_KEY, bg); } catch { /* muy pesada: solo hasta recargar */ }
            showToast('Fondo de las diapositivas cambiado desde la app', 'success', 3000);
          } else {
            clearBackground();
            showToast('Fondo de las diapositivas quitado desde la app', 'info', 3000);
          }
        });
        sendState();
      })
      .on('broadcast', { event: 'ppt_request_slide' }, () => {
        if (onAirRef.current) pushRef.current();
      })
      // Diapositivas subidas desde la app (las convierte el servidor y llegan ya como imágenes)
      .on('broadcast', { event: 'press_progress' }, ({ payload }) => {
        if (payload?.status === 'failed') {
          if (payload.deckId && payload.deckId === serverDeckRef.current?.deckId) return serverDeckFailed(payload.error);
          showToast(`No se pudieron convertir las diapositivas: ${payload.error || 'error desconocido'}`, 'error', 6000);
        } else if (payload?.status === 'processing' && !announcedDecksRef.current.has(payload.deckId)) {
          announcedDecksRef.current.add(payload.deckId);
          showToast('Recibiendo diapositivas desde la app…', 'info', 3000);
        }
      })
      .on('broadcast', { event: 'press_slides_added' }, ({ payload }) => {
        if (payload?.deckId) importDecks([payload]);
      })
      .subscribe((status) => { if (status === 'SUBSCRIBED') sendState(); });
    pressChannelRef.current = channel;
    return () => {
      pressChannelRef.current = null;
      realtime.removeChannel(channel);
    };
  }, [liveKey]);

  // Cada cambio de diapositiva se refleja en el celular con payload optimizado
  useEffect(() => {
    const payload = createRemotePayload(slides, currentSlideIndex, presentationTitle, isBlank, appliedOpsRef.current, pressBackground);
    remoteStateRef.current = payload;
    pressChannelRef.current?.send({ type: 'broadcast', event: 'ppt_state', payload });
  }, [currentSlideIndex, slides, isBlank, presentationTitle, pressBackground]);

  // PresentationManager mount & sync
  useEffect(() => {
    if (viewportRef.current && presentationManager.getAST()) {
      presentationManager.mount(viewportRef.current);
    }
  }, [slides, presentationManager]);

  useEffect(() => {
    if (presentationManager.getAST()) {
      presentationManager.goToSlide(currentSlideIndex);
    }
  }, [currentSlideIndex, presentationManager]);

  // Gestor de carga de archivos (Servicio independiente PressFileManager)
  // Presentación que este equipo mandó a convertir: { deckId, files, poll }
  const serverDeckRef = useRef(null);
  useEffect(() => () => clearInterval(serverDeckRef.current?.poll), []);
  const finishServerDeck = () => {
    clearInterval(serverDeckRef.current?.poll);
    serverDeckRef.current = null;
    setIsLoading(false);
  };
  const serverDeckFailed = (error) => {
    const files = serverDeckRef.current?.files;
    finishServerDeck();
    showToast(`El servidor no pudo convertir la presentación (${error || 'error desconocido'}). Se cargó una versión simplificada; para verla idéntica, súbela como PDF.`, 'warning', 9000);
    if (files) loadLocally(files);
  };

  const isDocument = (f) => /\.(pptx?|pdf)$/i.test(f.name);
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (!files.some(isDocument)) return loadLocally(files);

    // PowerPoint/PDF: el servidor convierte cada diapositiva en imagen (fondos, fuentes y diseño exactos).
    // Llega por la sala (press_slides_added) o, si eso falla, consultando el estado del deck.
    setIsLoading(true);
    try {
      const room = await loadCurrentRoom();
      const form = new FormData();
      form.append('roomId', room.id);
      form.append('title', files[0].name.replace(/\.[^.]+$/, ''));
      files.forEach((f) => form.append('files', f));
      // multipart explícito: el cliente trae JSON por defecto y axios convertiría el FormData en JSON (sin archivos)
      const { data } = await apiClient.post('/slides', form, { timeout: 0, headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Convirtiendo la presentación para que se vea igual que el original…', 'info', 4000);
      const poll = setInterval(async () => {
        try {
          const { data: deck } = await apiClient.get(`/slides/decks/${data.deckId}`);
          if (deck.status === 'ready') importDecks([{ deckId: deck.id, title: deck.title, slides: deck.slides }]);
          else if (deck.status === 'failed') serverDeckFailed(deck.error);
        } catch { /* sin red: se reintenta */ }
      }, 4000);
      serverDeckRef.current = { deckId: data.deckId, files, poll };
    } catch (err) {
      setIsLoading(false);
      const reason = err?.response?.data?.message || err?.message || 'sin conexión';
      showToast(`No se pudo enviar al servidor (${reason}). Se cargó una versión simplificada.`, 'warning', 8000);
      loadLocally(files);
    }
  };

  // Lector del navegador: imágenes tal cual; PowerPoint/PDF solo como respaldo (pierde parte del diseño)
  const loadLocally = async (files) => {
    setIsLoading(true);
    try {
      const result = await fileManager.processFiles(files);
      if (result.slides && result.slides.length > 0) {
        setSlides(result.slides);
        setCurrentSlideIndex(0);
        setIsBlank(false);
        const newTitle = result.title || presentationTitle;
        if (result.title) {
          setPresentationTitle(result.title);
        }
        // Emitir inmediatamente al celular para sincronizar el archivo externo al instante
        const immediatePayload = createRemotePayload(result.slides, 0, newTitle, false, appliedOpsRef.current, pressBackground);
        remoteStateRef.current = immediatePayload;
        pressChannelRef.current?.send({
          type: 'broadcast',
          event: 'ppt_state',
          payload: immediatePayload,
        });
        showToast(`${result.slides.length} diapositivas listas y sincronizadas con el control remoto`, 'success', 3000);
      }
    } catch (err) {
      console.error('Error al procesar la presentación:', err);
      alert('Hubo un problema al procesar el archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear diapositiva personalizada
  const handleAddCustomSlide = (slideData) => {
    setSlides((prev) => [...prev, { type: 'styled', ...slideData, id: slideData.id || newSlideId() }]);
  };

  // ── Edición de la tira ──
  const [editingIndex, setEditingIndex] = useState(null);
  const saveEditedSlide = (updated) => {
    setSlides((prev) => prev.map((sl, i) => (i === editingIndex ? updated : sl)));
    setEditingIndex(null);
    showToast('Diapositiva actualizada', 'success', 2000);
  };
  const duplicateSlide = (idx) => {
    setSlides((prev) => [...prev.slice(0, idx + 1), { ...prev[idx], id: newSlideId() }, ...prev.slice(idx + 1)]);
    setCurrentSlideIndex(idx + 1);
  };
  const moveSlide = (idx, dir) => {
    const to = idx + dir;
    setSlides((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
    // La seleccionada sigue a la diapositiva que se movió
    setCurrentSlideIndex((cur) => (cur === idx ? to : cur === to ? idx : cur));
  };
  const deleteSlide = (idx) => {
    setSlides((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
    setCurrentSlideIndex((cur) => Math.max(0, cur > idx || cur === slides.length - 1 ? cur - 1 : cur));
  };

  // Guardar en este equipo. Los vídeos (blob:) no sobreviven a una recarga, por eso no se guardan.
  const warnedStorage = useRef(false);
  useEffect(() => {
    try {
      localStorage.setItem(SLIDES_KEY, JSON.stringify(slides.filter((sl) => !String(sl.fileUrl || sl.mediaUrl || '').startsWith('blob:'))));
    } catch {
      if (!warnedStorage.current) {
        warnedStorage.current = true;
        showToast('No hay espacio para guardar todas las diapositivas con imagen en este equipo', 'warning');
      }
    }
  }, [slides]);

  return (
    <div className="oasis-cq oasis-press bg-ui-bg p-4 sm:p-5 rounded-[2rem] shadow-neumorph-inset border border-white/40 space-y-4">

      {/* CABECERA: título + botonera de iconos (mismo lenguaje que En vivo; el texto va en title/aria-label) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-moonrising text-[13px] font-bold text-gray-950 uppercase tracking-wider flex items-center gap-2 m-0">
          <Presentation size={15} className="text-oasis-yellow" />
          OASIS <span className="text-oasis-yellow">PRESS</span>
        </h3>

        <div className="bg-ui-bg shadow-neumorph-inset rounded-full p-1.5 flex flex-wrap items-center gap-2 border border-white/30">
          {/* Al aire */}
          <motion.button
            type="button"
            onClick={handleProjectSlide}
            whileTap={{ scale: 0.94 }}
            title="Proyectar la diapositiva actual"
            aria-label="Proyectar"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 bg-oasis-yellow text-white shadow-[0_4px_10px_rgba(245,158,11,0.4)] border border-white/40 hover:scale-105"
          >
            {justSent ? <Check size={17} strokeWidth={3} /> : <Cast size={17} strokeWidth={2.5} />}
          </motion.button>
          <button type="button" onClick={handleStopAll} title="Detener la presentación y limpiar el proyector" aria-label="Detener presentación"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 bg-white text-oasis-red shadow-sm border border-gray-100 hover:shadow-md">
            <Square size={14} strokeWidth={3} fill="currentColor" />
          </button>

          <span className="w-px h-6 bg-slate-300/70" aria-hidden="true" />

          {/* Contenido */}
          <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBackgroundFile} />
          <div className="relative">
            <button type="button" onClick={() => bgInputRef.current?.click()} title="Imagen de fondo para las diapositivas de texto" aria-label="Fondo"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 bg-white text-slate-700 shadow-sm border border-gray-100 hover:shadow-md hover:text-oasis-orange overflow-hidden">
              {pressBackground ? <img src={pressBackground} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={16} strokeWidth={2.2} />}
            </button>
            {pressBackground && (
              <button type="button" onClick={clearBackground} aria-label="Quitar imagen de fondo" title="Quitar imagen de fondo"
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-gray-200 text-slate-500 hover:text-oasis-red flex items-center justify-center shadow-sm">
                <X size={10} strokeWidth={3} />
              </button>
            )}
          </div>
          <button type="button" onClick={() => setShowAddSlideModal(true)} title="Nueva diapositiva o anuncio" aria-label="Nueva diapositiva"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 bg-white text-slate-700 shadow-sm border border-gray-100 hover:shadow-md hover:text-oasis-orange">
            <Plus size={17} strokeWidth={2.5} />
          </button>
          <PressUploader isLoading={isLoading} onFileUpload={handleFileUpload} />
        </div>
      </div>

      {/* ÁREA PRINCIPAL: vista previa a la izquierda; tira de diapositivas y QR en una columna a la derecha
          (en escritorio todo cabe en una pantalla; la columna toma el alto de la vista previa y la tira se desplaza) */}
      <div className="oasis-press-grid">
        <div className="flex flex-col justify-between min-w-0">
          <PressPreview
            background={pressBackground}
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            isBlank={isBlank}
            isLoading={isLoading}
            setCurrentSlideIndex={setCurrentSlideIndex}
            setIsBlank={setIsBlank}
          />
        </div>

        <div className="oasis-press-side min-w-0">
          <div className="oasis-press-side__inner">
            <div className="oasis-press-side__thumbs">
              <PressThumbnails
                background={pressBackground}
                onEdit={setEditingIndex}
                onDuplicate={duplicateSlide}
                onMove={moveSlide}
                onDelete={deleteSlide}
                slides={slides}
                currentSlideIndex={currentSlideIndex}
                setCurrentSlideIndex={setCurrentSlideIndex}
                setIsBlank={setIsBlank}
              />
            </div>
            <PressRemote
              remoteUrl={remoteUrl}
              qrApiUrl={qrApiUrl}
            />
          </div>
        </div>
      </div>

      {editingIndex !== null && slides[editingIndex] && (
        <PressEditModal
          slide={slides[editingIndex]}
          index={editingIndex}
          background={pressBackground}
          onSave={saveEditedSlide}
          onClose={() => setEditingIndex(null)}
        />
      )}

      {/* MODAL AGREGAR DIAPOSITIVA */}
      {/* Crear diapositiva: el mismo editor que para editar, en modo creación */}
      {showAddSlideModal && (
        <PressEditModal
          mode="create"
          background={pressBackground}
          onSave={(newSlide) => {
            handleAddCustomSlide(newSlide);
            setShowAddSlideModal(false);
            showToast('Diapositiva agregada al final de la presentación', 'success', 2500);
          }}
          onClose={() => setShowAddSlideModal(false)}
        />
      )}
    </div>
  );
};

export default PressStudio;
