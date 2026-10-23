// PressStudio.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../react-ui/components/Toast';
import { PresentationManager } from './presentations';
import PressFileManager, { imageFileToDataUrl } from './PressFileManager';
import PressPreview from './PressPreview';
import PressRemote from './PressRemote';
import PressThumbnails from './PressThumbnails';
import PressUploader from './PressUploader';
import PressEditModal from './PressEditModal';
import QRCode from 'qrcode';
import { supabase } from '../../../api/supabaseClient';
import { useLiveKey, liveUrl, pressChannel, shareableUrl } from '../../../api/liveChannel';

const SLIDES_KEY = 'oasis_press_slides';
// Ejemplo inicial: se puede editar, reordenar o borrar desde la tira de diapositivas
const DEFAULT_SLIDES = [
  { id: 1, title: 'Bienvenida al Culto Divino', subtitle: 'Iglesia Adventista Oasis', type: 'styled' },
  { id: 2, title: 'Himno de Alabanza #12', subtitle: 'Señor mi Dios al contemplar', type: 'styled' },
  { id: 3, title: 'Lectura Bíblica: Salmos 23:1', subtitle: 'Jehová es mi pastor; nada me faltará.', type: 'styled' },
  { id: 4, title: 'Sermón: La Esperanza que Transforma', subtitle: 'Pr. Felipe Miranda', type: 'styled' },
  { id: 5, title: 'Himno Final #340 & Bendición', subtitle: 'En celestial morada', type: 'styled' },
];
const newSlideId = () => `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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
      const url = await imageFileToDataUrl(file, 1920, 0.8);
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
    // La diapositiva viaja completa: el proyector la pinta con el mismo componente que la vista previa
    const overlayPayload = {
      mode: isBlank ? 'blank' : 'slide',
      title: presentationTitle ? `${presentationTitle} — Diapositiva ${currentSlideIndex + 1}` : `Diapositiva ${currentSlideIndex + 1}`,
      content: activeSlide?.subtitle || activeSlide?.title || '',
      mediaType: activeSlide?.mediaType || (activeSlide?.type === 'video' ? 'video' : media ? 'image' : null),
      slide: activeSlide || null,
      background: pressBackground,
      target: 'proyector',
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem('obs_overlay_data', JSON.stringify(overlayPayload));
    } catch (e) {
      console.warn('Imagen demasiado grande para el proyector local:', e);
    }
    // Vídeos o imágenes locales grandes no caben en un mensaje: esas solo llegan al proyector de este PC
    if (!media || shareableUrl(media)) {
      pressChannelRef.current?.send({ type: 'broadcast', event: 'ppt_slide', payload: { ...overlayPayload, background: shareableUrl(pressBackground) } });
    }
  };

  // Proyectar: envía la diapositiva actual a las pantallas ya abiertas (no abre ventanas;
  // el proyector se abre una vez con "Full" en Pantalla Proyector).
  const { showToast } = useToast();
  const [justSent, setJustSent] = useState(false);
  const handleProjectSlide = () => {
    pushSlideToScreens();
    setJustSent(true);
    setTimeout(() => setJustSent(false), 1600);
    showToast(isBlank ? 'Pantalla negra enviada al proyector' : `Diapositiva ${currentSlideIndex + 1} enviada al proyector`, 'success', 2500);
  };

  // Solo cuando el operador cambia de diapositiva o activa la pantalla negra: abrir Studio o añadir
  // diapositivas ya no se adueña del proyector. Comparar con el valor anterior es idempotente en StrictMode.
  const prevSync = useRef({ currentSlideIndex, isBlank });
  useEffect(() => {
    const prev = prevSync.current;
    if (prev.currentSlideIndex === currentSlideIndex && prev.isBlank === isBlank) return;
    prevSync.current = { currentSlideIndex, isBlank };
    pushSlideToScreens();
  }, [currentSlideIndex, isBlank]);

  // Control remoto (celular) por el canal en tiempo real
  const remoteStateRef = useRef(null);
  remoteStateRef.current = (() => {
    const active = slides[currentSlideIndex];
    const next = slides[currentSlideIndex + 1];
    return {
      currentSlide: currentSlideIndex + 1,
      totalSlides: slides.length,
      isBlank,
      title: presentationTitle,
      activeSlideTitle: active?.title || `Diapositiva ${currentSlideIndex + 1}`,
      nextSlideTitle: next ? (next.title || `Diapositiva ${currentSlideIndex + 2}`) : 'Fin de Presentación',
      activeSlideUrl: shareableUrl(active?.fileUrl || active?.mediaUrl),
      nextSlideUrl: shareableUrl(next?.fileUrl || next?.mediaUrl),
      timestamp: Date.now(),
    };
  })();
  const announcedDecksRef = useRef(new Set());
  const slideCountRef = useRef(slides.length);
  slideCountRef.current = slides.length;

  useEffect(() => {
    if (!liveKey) return;
    const channel = pressChannel(liveKey);
    const sendState = () => channel.send({ type: 'broadcast', event: 'ppt_state', payload: remoteStateRef.current });
    channel
      .on('broadcast', { event: 'ppt_command' }, ({ payload }) => {
        const action = payload?.action;
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
        }
      })
      .on('broadcast', { event: 'ppt_request_state' }, sendState)
      // Diapositivas subidas desde la app (las convierte el servidor y llegan ya como imágenes)
      .on('broadcast', { event: 'press_progress' }, ({ payload }) => {
        if (payload?.status === 'failed') {
          showToast(`No se pudieron convertir las diapositivas: ${payload.error || 'error desconocido'}`, 'error', 6000);
        } else if (payload?.status === 'processing' && !announcedDecksRef.current.has(payload.deckId)) {
          announcedDecksRef.current.add(payload.deckId);
          showToast('Recibiendo diapositivas desde la app…', 'info', 3000);
        }
      })
      .on('broadcast', { event: 'press_slides_added' }, ({ payload }) => {
        const incoming = (payload?.slides || []).map((sl, i) => ({
          id: `deck-${payload.deckId}-${i}`,
          title: sl.title || `${payload.title} — ${i + 1}`,
          subtitle: payload.title,
          fileUrl: sl.url,
          mediaUrl: sl.url,
          type: 'image',
          mediaType: 'image',
        }));
        if (!incoming.length) return;
        // Se insertan justo después de la diapositiva actual (no interrumpen lo que está al aire)
        const at = remoteStateRef.current?.currentSlide ?? 0;
        setSlides((prev) => [...prev.slice(0, at), ...incoming, ...prev.slice(at)]);
        showToast(`${incoming.length} diapositiva(s) de "${payload.title}" añadidas después de la actual`, 'success', 4000);
      })
      .subscribe((status) => { if (status === 'SUBSCRIBED') sendState(); });
    pressChannelRef.current = channel;
    return () => {
      pressChannelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [liveKey]);

  // Cada cambio de diapositiva se refleja en el celular
  useEffect(() => {
    pressChannelRef.current?.send({ type: 'broadcast', event: 'ppt_state', payload: remoteStateRef.current });
  }, [currentSlideIndex, slides, isBlank, presentationTitle]);

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
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    setIsLoading(true);
    try {
      const result = await fileManager.processFiles(files);
      if (result.slides && result.slides.length > 0) {
        setSlides(result.slides);
        setCurrentSlideIndex(0);
        if (result.title) {
          setPresentationTitle(result.title);
        }
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
    <div className="bg-ui-bg p-6 rounded-[2rem] shadow-neumorph-inset border border-white/40 space-y-6">

      {/* CABECERA OASIS PRESS COMPACTA Y MODERNA */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        {/* Identificador de Módulo OASIS PRESS */}
        <div className="flex items-center gap-2.5">
          <h3 className="font-moonrising text-base font-black text-gray-950 uppercase tracking-widest">
            OASIS <span className="text-[#F5A623]">PRESS</span>
          </h3>
        </div>

        {/* Botonera: Cargar Archivo como Principal + IconButtons para Proyector y Crear Diapositiva */}
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={handleProjectSlide}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            title="Enviar la diapositiva actual al proyector"
            className="relative h-12 px-5 rounded-full inline-flex items-center gap-2.5 text-white text-sm font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.65)] hover:shadow-[0_12px_26px_-6px_rgba(16,185,129,0.8)] transition-shadow"
          >
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-white/80 animate-ping" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-white" />
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={justSent ? 'sent' : 'idle'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                {justSent ? 'Enviado ✓' : 'Proyectar'}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBackgroundFile} />
          <div className="inline-flex items-center h-12 rounded-full bg-white border border-slate-200 shadow-sm overflow-hidden">
            <motion.button
              type="button"
              onClick={() => bgInputRef.current?.click()}
              whileTap={{ scale: 0.96 }}
              title="Imagen de fondo para las diapositivas de texto"
              className="h-full pl-1.5 pr-4 inline-flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-[#5b2ea6]"
            >
              <span className="w-9 h-9 rounded-full overflow-hidden grid place-items-center bg-slate-100 border border-slate-200">
                {pressBackground ? (
                  <img src={pressBackground} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
                  </svg>
                )}
              </span>
              Fondo
            </motion.button>
            {pressBackground && (
              <button type="button" onClick={clearBackground} aria-label="Quitar imagen de fondo" title="Quitar imagen de fondo"
                className="h-full px-3 border-l border-slate-200 text-slate-400 hover:text-red-500 text-sm font-black">✕</button>
            )}
          </div>

          <motion.button
            type="button"
            onClick={() => setShowAddSlideModal(true)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            title="Crear una diapositiva o un anuncio"
            className="h-12 pl-3 pr-5 rounded-full inline-flex items-center gap-2.5 text-white text-sm font-black uppercase tracking-wider bg-gradient-to-r from-[#5b2ea6] to-[#7c3aed] shadow-[0_8px_20px_-6px_rgba(91,46,166,0.7)] hover:shadow-[0_12px_26px_-6px_rgba(124,58,237,0.8)] transition-shadow"
          >
            <span className="w-7 h-7 rounded-full bg-white/20 grid place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            Nueva diapositiva
          </motion.button>

          <PressUploader
            isLoading={isLoading}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>

      {/* ÁREA PRINCIPAL (8 COLS PREVIEW + 4 COLS QR REMOTE CON EQUILIBRIO VISUAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between h-full">
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

        <div className="lg:col-span-4 flex flex-col h-full">
          <PressRemote
            remoteUrl={remoteUrl}
            qrApiUrl={qrApiUrl}
          />
        </div>
      </div>

      {/* CARRUSEL DE MINIATURAS EN PARTE INFERIOR */}
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
