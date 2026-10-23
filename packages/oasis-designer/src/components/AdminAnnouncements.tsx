import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageExportService } from '../utils/ImageExportService';
import { DownloadService } from '../utils/DownloadService';
import { uploadAnnouncementImage } from '../utils/uploadImage';
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../utils/apiClient';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence, MotionProps, useDragControls } from 'framer-motion';

import AnnouncementPreview from './AnnouncementPreview';
import AnnouncementsList from './AnnouncementsList';
import DesignPanel from './DesignPanel';
import TextPanel from './TextPanel';
import BrandPanel from './BrandPanel';
import LayersPanel from './LayersPanel';
import RibbonMenu, { RibbonTab } from './RibbonMenu';
import ImageLibrary from './ImageLibrary';
import QuickContentPanel from './QuickContentPanel';
import logoOasis from '../assets/logos/LOGO1.svg';
import logoAdventista from '../assets/logos/IASD1.png'; // Keep PNG if no SVG found
import rrssImage from '../assets/logos/RRSS1.png';
import logoLumina from '../assets/logos/logo2.svg';

type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & MotionProps & React.RefAttributes<HTMLDivElement> & { children?: React.ReactNode };
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

// --- Format presets ---
const FORMATS: Record<string, { label: string; icon: string; W: number; H: number; aspect: string; desc: string }> = {
  instagram: { label: 'Instagram', icon: 'bi-instagram', W: 1080, H: 1350, aspect: '4/5', desc: 'Vertical 4:5' },
  square: { label: 'Cuadrado', icon: 'bi-square', W: 1080, H: 1080, aspect: '1/1', desc: 'Cuadrado 1:1' },
  youtube: { label: 'YouTube', icon: 'bi-youtube', W: 1920, H: 1080, aspect: '16/9', desc: 'Horizontal 16:9' },
  whatsapp: { label: 'WhatsApp', icon: 'bi-whatsapp', W: 720, H: 1280, aspect: '9/16', desc: 'Estado 9:16' },
};

const ANNOUNCEMENTS_UPDATED_EVENT = 'oasis:announcements-updated';
const ANNOUNCEMENTS_UPDATED_KEY = 'oasis_announcements_updated_at';


import { FormData, DEFAULT_FORM } from '../data/templates';

type ActivePanel = 'design' | 'text' | 'brand' | null;

// ── Móvil: herramientas en un dock inferior que abren paneles deslizables ──
type MobileSheet = 'contenido' | RibbonTab | 'capas';
const MOBILE_TOOLS: Array<{ id: MobileSheet; icon: string; label: string }> = [
  { id: 'contenido', icon: 'bi-pencil-square', label: 'Contenido' },
  { id: 'inicio', icon: 'bi-fonts', label: 'Texto' },
  { id: 'insertar', icon: 'bi-plus-square', label: 'Insertar' },
  { id: 'diseño', icon: 'bi-palette', label: 'Diseño' },
  { id: 'marca', icon: 'bi-patch-check', label: 'Marca' },
  { id: 'formato', icon: 'bi-aspect-ratio', label: 'Formato' },
  { id: 'capas', icon: 'bi-layers', label: 'Capas' },
];
// Al tocar un elemento del lienzo se abre la herramienta que lo edita
const sheetForElement = (id: string): MobileSheet =>
  id === 'bgImage' ? 'diseño' : id.startsWith('show') ? 'marca' : 'inicio';

const isDataUrl = (v: unknown) => typeof v === 'string' && v.startsWith('data:');
const hasLocalImages = (data: FormData) =>
  isDataUrl((data as any).bgImage) ||
  (Array.isArray((data as any).customLogos) && (data as any).customLogos.some((l: any) => isDataUrl(l?.url)));


// --- Main component ---
const AdminAnnouncements: React.FC<{ initialData?: Partial<FormData>; onBack?: () => void }> = ({ initialData, onBack }) => {
  const { theme, mode, toggleMode } = useTheme();
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [draftToast, setDraftToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [drafts, setDrafts] = useState<{ id: string; label: string; savedAt: number; isTemplate: boolean; data: FormData }[]>([]);

  const DRAFT_KEY = 'ann_drafts_v1';
  const DRAFT_TTL = 12 * 60 * 60 * 1000; // 12 horas en ms

  const loadDrafts = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return [];
      const all = JSON.parse(raw) as typeof drafts;
      const now = Date.now();
      const valid = all.filter(d => d.isTemplate || (now - d.savedAt) < DRAFT_TTL);
      if (valid.length !== all.length) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(valid)); } catch { /* se reintenta en la próxima carga */ } }
      return valid;
    } catch { return []; }
  }, []);

  // localStorage tiene ~5 MB: un fondo en base64 puede excederlo (QuotaExceededError).
  const persistDrafts = useCallback((list: unknown[]) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Draft save failed:', e);
      setDraftToast({ msg: '❌ No hay espacio para guardar el borrador (imágenes muy pesadas). Publica o descarga el diseño.', type: 'err' });
      setTimeout(() => setDraftToast(null), 4500);
      return false;
    }
  }, []);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [showList, setShowList] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLayers, setShowLayers] = useState(() => window.innerWidth >= 768);
  const [showQuickEditor, setShowQuickEditor] = useState(false);

  const [isContentMinimized, setIsContentMinimized] = useState(true);

  // Editor formData
  const [formData, setFormData] = useState<FormData>({ ...DEFAULT_FORM, ...initialData });
  const [selectedElementId, setSelectedElementId] = useState<string | null>('title');
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [shapeMode] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTab>('inicio');
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<MobileSheet | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const sheetDrag = useDragControls();

  // Toolbar state
  const [fontSize, setFontSize] = useState(18);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [textAlign, setTextAlign] = useState('center');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontFamily, setFontFamily] = useState("'Advent Sans', 'Advent Pro', sans-serif");
  const [textColor, setTextColor] = useState('#ffffff');
  const [textOpacity, setTextOpacity] = useState(1);
  const [textShadow, setTextShadow] = useState('none');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(100);
  const [logoPosition, setLogoPosition] = useState('top-left');
  const [logoOpacity, setLogoOpacity] = useState(1);

  const [logoBase64, setLogoBase64] = useState<{iasd?: string, oasis?: string, rrss?: string, oasisLetras?: string, iasdWhite?: string, rrssWhite?: string, oasisLetrasWhite?: string}>({});

  const toBase64 = async (url: string): Promise<string> => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Error converting to base64:', url, e);
      return url;
    }
  };

  const tintToWhite = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  useEffect(() => {
    const loadLogos = async () => {
      const iasd = await toBase64(logoAdventista);
      const rrss = await toBase64(rrssImage);
      const oasisLetras = await toBase64(logoOasis);
      
      const iasdWhite = await tintToWhite(iasd);
      const rrssWhite = await tintToWhite(rrss);
      const oasisLetrasWhite = await tintToWhite(oasisLetras);

      setLogoBase64({ iasd, rrss, oasisLetras, iasdWhite, rrssWhite, oasisLetrasWhite });
    };
    loadLogos();
  }, []);

  const refreshAnnouncements = useCallback(async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setAnnouncements([]);
    }
  }, []);

  const notifyAnnouncementsUpdated = useCallback(() => {
    const stamp = Date.now().toString();
    localStorage.setItem(ANNOUNCEMENTS_UPDATED_KEY, stamp);
    window.dispatchEvent(new Event(ANNOUNCEMENTS_UPDATED_EVENT));
  }, []);

  // Removed auto-switch to 'inicio' tab to improve UX

  const set = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  // Toque en el lienzo: selecciona y, en móvil, abre la herramienta de ese elemento.
  // Si ya hay un panel de formato abierto (Texto/Marca/Diseño) cambia al del elemento; Contenido y Capas se respetan.
  const selectFromCanvas = useCallback((id: string | null) => {
    setSelectedElementId(id);
    if (!isMobile || !id) return;
    setMobileSheet(cur => (!cur || cur === 'inicio' || cur === 'marca' || cur === 'diseño') ? sheetForElement(id) : cur);
  }, [isMobile]);

  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const saveDraft = useCallback((asTemplate = false) => {
    const current = formDataRef.current;
    const existing = loadDrafts();
    const id = Date.now().toString();
    const label = asTemplate
      ? `Plantilla — ${current.title || 'Sin título'}`
      : `Borrador — ${current.title || 'Sin título'}`;
    const newDraft = { id, label, savedAt: Date.now(), isTemplate: asTemplate, data: current };
    if (!persistDrafts([newDraft, ...existing].slice(0, 20))) return;
    setDrafts(loadDrafts());
    setDraftToast({ msg: asTemplate ? '✓ Guardado como plantilla' : '✓ Borrador guardado (12 h)', type: 'ok' });
    setTimeout(() => setDraftToast(null), 3000);
  }, [loadDrafts, persistDrafts]);

  const loadDraft = useCallback((d: { id: string; label: string; savedAt: number; isTemplate: boolean; data: FormData }) => {
    setFormData(d.data);
    setShowDraftPanel(false);
    setDraftToast({ msg: `Cargado: ${d.label}`, type: 'ok' });
    setTimeout(() => setDraftToast(null), 2500);
  }, []);

  const deleteDraft = useCallback((id: string) => {
    const updated = loadDrafts().filter(d => d.id !== id);
    if (persistDrafts(updated)) setDrafts(updated);
  }, [loadDrafts, persistDrafts]);

  const promoteDraft = useCallback((id: string) => {
    const all = loadDrafts();
    const updated = all.map(d => d.id === id ? { ...d, isTemplate: true, label: d.label.replace('Borrador', 'Plantilla') } : d);
    if (!persistDrafts(updated)) return;
    setDrafts(updated);
    setDraftToast({ msg: '\u2713 Convertido en plantilla', type: 'ok' });
    setTimeout(() => setDraftToast(null), 2500);
  }, [loadDrafts, persistDrafts]);

  const downloadImage = useCallback(async () => {
    const node = previewRef.current;
    if (!node) return;
    setIsDownloading(true);

    try {
      const filename = DownloadService.generateAnnouncementFilename(
        formData.title,
        formData.format
      );
      
      await ImageExportService.downloadImage(node, {
        filename,
        format: 'jpeg',
        quality: 0.95,
        logoColor: formData.logoColor,
        bgImage: formData.bgImage || formData.imageUrl,
        logoBase64
      });
    } catch (err) {
      console.error('Download failed:', err);
      setDraftToast({ msg: '❌ Error al descargar la imagen', type: 'err' });
      setTimeout(() => setDraftToast(null), 3000);
    } finally {
      setIsDownloading(false);
    }
  }, [formData, logoBase64]);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, [loadDrafts]);

  useEffect(() => {
    refreshAnnouncements();
  }, [refreshAnnouncements]);

  useEffect(() => {
    if (!showList) return;
    refreshAnnouncements();

    const intervalId = window.setInterval(() => {
      refreshAnnouncements();
    }, 7000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [showList, refreshAnnouncements]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getLogoPositionStyle = (pos: string) => {
    switch (pos) {
      case 'top-left': return { top: '5%', left: '5%' };
      case 'top-right': return { top: '5%', right: '5%' };
      case 'bottom-left': return { bottom: '5%', left: '5%' };
      case 'bottom-right': return { bottom: '5%', right: '5%' };
      case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default: return { top: '5%', left: '5%' };
    }
  };

  const currentFmt = FORMATS[formData.format] || FORMATS.instagram;

  // El fondo del contenedor SIEMPRE es el gradiente; la imagen se renderiza
  // como <motion.img> dentro del preview para poder aplicar blend mode encima.
  const previewBgStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${formData.gradientStart}, ${formData.gradientEnd})`
  };

  const canvasW = formData.format === 'whatsapp' ? 260 : (formData.format === 'youtube' ? 560 : 340);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl || '';

      const previewNode = previewRef.current;
      if (previewNode) {
        const imageBase64 = await ImageExportService.getBase64(previewNode, {
          format: 'jpeg',
          quality: 0.95,
          logoColor: formData.logoColor,
          bgImage: formData.bgImage || formData.imageUrl,
          logoBase64
        }); 
        let uploadedUrl: string | null = null;
        try {
          const uploadResult = await uploadAnnouncementImage(imageBase64);
          if (uploadResult?.success && uploadResult.imageUrl) uploadedUrl = uploadResult.imageUrl;
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
        }
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else if (hasLocalImages(formData)) {
          // Las imágenes locales (data:) se descartan al guardar: sin la subida se perderían.
          throw new Error('No se pudo subir la imagen del anuncio. No se publicó para no perder tus imágenes; intenta de nuevo.');
        }
      }

      const persistedFormData = {
        ...formData,
        imageUrl: finalImageUrl || null,
        bgImage: typeof formData.bgImage === 'string' && formData.bgImage.startsWith('data:')
          ? (finalImageUrl || null)
          : formData.bgImage,
        customLogos: Array.isArray(formData.customLogos)
          ? formData.customLogos.map((logo: any) => {
            if (!logo || typeof logo !== 'object') return logo;
            if (typeof logo.url === 'string' && logo.url.startsWith('data:')) {
              return { ...logo, url: null };
            }
            return logo;
          })
          : formData.customLogos,
      };
      const payload = {
        title: formData.title2 ? `${formData.title || ''}|||${formData.title2}` : formData.title,
        tag: formData.tag,
        description: formData.speaker || formData.title2 || '',
        content: formData.content,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        imageUrl: finalImageUrl,
        formData: JSON.stringify(persistedFormData)
      };

      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, { ...editingAnnouncement, ...payload });
      } else {
        await createAnnouncement(payload);
      }
      notifyAnnouncementsUpdated();
      await refreshAnnouncements();
      setDraftToast({ msg: editingAnnouncement ? '✓ Anuncio actualizado' : '✓ Anuncio publicado', type: 'ok' });
      setTimeout(() => setDraftToast(null), 2500);
      setShowForm(false);
      setEditingAnnouncement(null);
    } catch (e: any) {
      console.error(e);
      setDraftToast({ msg: e?.message || 'No se pudo publicar el anuncio', type: 'err' });
      setTimeout(() => setDraftToast(null), 3500);
    } finally { setIsSubmitting(false); }
  };

  const handleEditAnn = (ann: any) => {
    setEditingAnnouncement(ann);
    if (ann.formData) { try { setFormData({ ...DEFAULT_FORM, ...JSON.parse(ann.formData) }); } catch { } }
    setShowList(false);
    setShowForm(false);
  };

  const handleDeleteAnn = async (id: number) => {
    try {
      await deleteAnnouncement(id);
      notifyAnnouncementsUpdated();
      await refreshAnnouncements();
      setDraftToast({ msg: '✓ Anuncio eliminado', type: 'ok' });
      setTimeout(() => setDraftToast(null), 2500);
    } catch (e: any) {
      setDraftToast({ msg: e?.message || 'No se pudo eliminar el anuncio', type: 'err' });
      setTimeout(() => setDraftToast(null), 3500);
    }
  };

  const commitEdit = useCallback(() => {
    if (!editingElement) return;
    setFormData(prev => ({ ...prev, [editingElement]: editingValue }));
    setEditingElement(null);
    setEditingValue('');
  }, [editingElement, editingValue]);

  const handleElementDoubleClick = useCallback((elementId: string) => {
    setEditingElement(elementId);
    setEditingValue((formData as any)[elementId] ?? '');
    setSelectedElementId(elementId);
    // Móvil: el doble toque también abre la herramienta que edita ese elemento
    if (isMobile) setMobileSheet(cur => cur ?? sheetForElement(elementId));
  }, [formData, isMobile]);

  const sidebarItems: Array<{ id: ActivePanel; icon: string; label: string }> = [
    { id: 'design', icon: 'bi-palette', label: 'Diseño' },
    { id: 'text', icon: 'bi-fonts', label: 'Texto' },
    { id: 'brand', icon: 'bi-badge-tm', label: 'Marca' },
  ];

  const renderRibbon = (overrides: Partial<React.ComponentProps<typeof RibbonMenu>> = {}) => (
    <RibbonMenu
        activeRibbonTab={activeRibbonTab}
        setActiveRibbonTab={setActiveRibbonTab}
        formData={formData}
        set={set as (key: string, value: any) => void}
        selectedElementId={selectedElementId}
        setSelectedElementId={setSelectedElementId}
        fontSize={fontSize}
        setFontSize={setFontSize}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        textAlign={textAlign}
        setTextAlign={setTextAlign}
        isBold={isBold}
        setIsBold={setIsBold}
        isItalic={isItalic}
        setIsItalic={setIsItalic}
        isUnderline={isUnderline}
        setIsUnderline={setIsUnderline}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        textOpacity={textOpacity}
        setTextOpacity={setTextOpacity}
        textShadow={textShadow}
        setTextShadow={setTextShadow}
        letterSpacing={letterSpacing}
        setLetterSpacing={setLetterSpacing}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        selectedLogo={selectedLogo}
        setSelectedLogo={setSelectedLogo}
        logoSize={logoSize}
        setLogoSize={setLogoSize}
        logoPosition={logoPosition}
        setLogoPosition={setLogoPosition}
        logoOpacity={logoOpacity}
        setLogoOpacity={setLogoOpacity}
        theme={mode}
        onOpenImageLibrary={() => setShowImageLibrary(true)}
        {...overrides}
      />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: theme.colors.background, color: theme.colors.text.primary }}>

      {/* ── HEADER ── */}
      <header style={{ 
        display: 'flex', flexDirection: 'column', 
        background: mode === 'dark' ? 'rgba(36, 18, 74, 0.85)' : theme.colors.surface, 
        backdropFilter: mode === 'dark' ? 'blur(10px)' : 'none',
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : theme.colors.border}`, 
        zIndex: 1100, flexShrink: 0, position: 'relative'
      }}>
        {/* Fila principal */}
        <div style={{ height: 'auto', minHeight: 48, display: 'flex', alignItems: 'center', gap: isMobile ? 2 : 12, padding: isMobile ? '6px 8px 6px 4px' : '10px 20px', flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '1 1 0' }}>
          {onBack && (
            <button 
              onClick={onBack}
              title="Volver" aria-label="Volver"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.colors.text.primary, fontSize: '1.2rem', padding: '0 8px' }}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
          )}
          {!isMobile && (<>
          <img
            src={logoLumina}
            style={{
              height: 28,
              width: 'auto',
              filter: mode === 'dark' ? 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(251, 191, 36, 0.3))' : 'drop-shadow(0 0 8px rgba(91, 46, 166, 0.3))'
            }}
            alt="Lumina Logo"
          />
          <div style={{ width: 1, height: 20, background: theme.colors.border, margin: '0 4px' }} />
          </>)}
          {/* div+role: el h1 global del sitio público fuerza 1.75rem !important en móvil */}
          <div role="heading" aria-level={1} style={{ 
            margin: 0, fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px', 
            color: theme.colors.text.primary, textTransform: 'uppercase', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0
          }}>
            CREADOR <span style={{ 
              color: mode === 'dark' ? '#fbbf24' : '#fbbf24',
              textShadow: mode === 'dark' ? '0 0 12px rgba(251, 191, 36, 0.3)' : 'none'
            }}>DE ANUNCIOS</span>
          </div>
        </div>
        {!isMobile && (
        <button onClick={toggleMode} title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.colors.text.secondary, fontSize: '1rem', padding: '0 6px' }}>
          <i className={`bi ${mode === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
        </button>
        )}

        {/* Herramientas de PC (En móviles van en la 2da fila) */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setShowLayers(prev => !prev); if (!showLayers) { setShowList(false); setShowQuickEditor(false); } }} title="Capas de Diseño"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 8px', border: `1px solid ${showLayers ? theme.colors.primary : '#dee2e6'}`, borderRadius: 4, background: showLayers ? `${theme.colors.primary}11` : theme.colors.surface, color: showLayers ? theme.colors.primary : theme.colors.text.secondary, cursor: 'pointer', gap: 1, fontSize: '0.55rem', fontWeight: 600, transition: 'all 0.2s' }}>
              <i className="bi bi-layers-half" style={{ fontSize: '1rem' }}></i>
              <span>Capas</span>
            </button>
            <button onClick={() => { setShowQuickEditor(prev => !prev); if (!showQuickEditor) { setShowLayers(false); setShowList(false); } }} title="Editor Rápido"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 8px', border: `1px solid ${showQuickEditor ? theme.colors.primary : '#dee2e6'}`, borderRadius: 4, background: showQuickEditor ? `${theme.colors.primary}11` : theme.colors.surface, color: showQuickEditor ? theme.colors.primary : theme.colors.text.secondary, cursor: 'pointer', gap: 1, fontSize: '0.55rem', fontWeight: 600, transition: 'all 0.2s' }}>
              <i className="bi bi-pencil-square" style={{ fontSize: '1rem' }}></i>
              <span>Editar</span>
            </button>
            <button onClick={() => { setShowList(prev => !prev); if (!showList) { setShowLayers(false); setShowQuickEditor(false); } }} title="Biblioteca de Anuncios"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 8px', border: `1px solid ${showList ? theme.colors.primary : '#dee2e6'}`, borderRadius: 4, background: showList ? `${theme.colors.primary}11` : theme.colors.surface, color: showList ? theme.colors.primary : theme.colors.text.secondary, cursor: 'pointer', gap: 1, fontSize: '0.55rem', fontWeight: 600, transition: 'all 0.2s' }}>
              <i className="bi bi-collection" style={{ fontSize: '1rem' }}></i>
              <span>Anuncios</span>
            </button>
            <button onClick={() => { setEditingAnnouncement(null); setFormData(DEFAULT_FORM); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 8px', border: '1px solid #dee2e6', borderRadius: 4, background: theme.colors.surface, color: theme.colors.text.secondary, cursor: 'pointer', gap: 1, fontSize: '0.55rem', fontWeight: 600 }}>
              <i className="bi bi-file-plus" style={{ fontSize: '1rem' }}></i>
              <span>Nuevo</span>
            </button>
            {/* Guardar borrador */}
            <button onClick={() => saveDraft(false)} title="Guardar borrador (12 h)"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 8px', border: '1px solid #f59e0b', borderRadius: 4, background: theme.colors.surface, color: '#f59e0b', cursor: 'pointer', gap: 1, fontSize: '0.55rem', fontWeight: 600 }}>
              <i className="bi bi-clock-history" style={{ fontSize: '1rem' }}></i>
              <span>Guardar</span>
            </button>
            {/* Panel de borradores */}
            <button onClick={() => { setShowDraftPanel(p => !p); setDrafts(loadDrafts()); }} title="Borradores y plantillas"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 8px', border: `1px solid ${showDraftPanel ? '#5b2ea6' : '#dee2e6'}`, borderRadius: 4, background: showDraftPanel ? '#ede9fe' : theme.colors.surface, color: showDraftPanel ? '#5b2ea6' : theme.colors.text.secondary, cursor: 'pointer', gap: 1, fontSize: '0.55rem', fontWeight: 600 }}>
              <i className="bi bi-layout-text-sidebar" style={{ fontSize: '1rem' }}></i>
              <span>Borradores</span>
            </button>
          </div>
        )}

        {isMobile ? (<>
          <button onClick={downloadImage} disabled={isDownloading} title="Descargar imagen" aria-label="Descargar imagen"
            style={{ width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center', border: 'none', borderRadius: 12, background: 'transparent', color: theme.colors.text.secondary, fontSize: '1.15rem' }}>
            <i className={`bi ${isDownloading ? 'bi-hourglass-split' : 'bi-download'}`}></i>
          </button>
          <button onClick={() => setShowMobileMenu(v => !v)} title="Más opciones" aria-label="Más opciones" aria-expanded={showMobileMenu}
            style={{ width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center', border: 'none', borderRadius: 12, background: showMobileMenu ? `${theme.colors.primary}22` : 'transparent', color: theme.colors.text.secondary, fontSize: '1.2rem' }}>
            <i className="bi bi-three-dots-vertical"></i>
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            style={{ height: 38, flexShrink: 0, padding: '0 16px', border: 'none', borderRadius: 99, background: '#F59E0B', color: '#1B0D36', fontWeight: 700, fontSize: '0.85rem', opacity: isSubmitting ? 0.6 : 1 }}>
            {isSubmitting ? 'Publicando…' : 'Publicar'}
          </button>
        </>) : (<>
        {/* Descargar */}
        <button onClick={downloadImage} disabled={isDownloading} title="Descargar imagen PNG"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 8px', border: 'none', borderRadius: 4, background: isDownloading ? '#6b7280' : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, color: '#fff', cursor: isDownloading ? 'not-allowed' : 'pointer', gap: 1, fontSize: '0.55rem', fontWeight: 700 }}>
          <i className={`bi ${isDownloading ? 'bi-hourglass-split' : 'bi-download'}`} style={{ fontSize: '1rem' }}></i>
          <span>{isDownloading ? '...' : 'Descargar'}</span>
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 10px', border: 'none', borderRadius: 4, background: isSubmitting ? '#6ee7b7' : '#10b981', color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer', gap: 1, minWidth: 50, fontSize: '0.55rem', fontWeight: 700 }}>
          <i className={`bi ${isSubmitting ? 'bi-hourglass-split' : 'bi-cloud-arrow-up'}`} style={{ fontSize: '1rem' }}></i>
          <span>{isSubmitting ? '...' : 'Publicar'}</span>
        </button>
        </>)}
        </div> {/* Fin fila principal */}

        {/* Menú ⋯ móvil: acciones secundarias */}
        <AnimatePresence>
          {isMobile && showMobileMenu && (
            <MotionDiv initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
              role="menu"
              style={{ position: 'absolute', top: 54, right: 8, zIndex: 3000, minWidth: 220, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.25)', padding: 6 }}>
              {[
                { icon: 'bi-collection', label: 'Mis anuncios', onClick: () => setShowList(true) },
                { icon: 'bi-file-plus', label: 'Nuevo anuncio', onClick: () => { setEditingAnnouncement(null); setFormData(DEFAULT_FORM); } },
                { icon: 'bi-clock-history', label: 'Guardar borrador', onClick: () => saveDraft(false) },
                { icon: 'bi-layout-text-sidebar', label: 'Borradores y plantillas', onClick: () => { setShowDraftPanel(true); setDrafts(loadDrafts()); } },
                { icon: mode === 'dark' ? 'bi-sun' : 'bi-moon', label: mode === 'dark' ? 'Modo claro' : 'Modo oscuro', onClick: toggleMode },
              ].map(item => (
                <button key={item.label} role="menuitem" onClick={() => { setShowMobileMenu(false); item.onClick(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', height: 44, padding: '0 12px', border: 'none', borderRadius: 10, background: 'transparent', color: theme.colors.text.primary, fontSize: '0.9rem', fontWeight: 500, textAlign: 'left' }}>
                  <i className={`bi ${item.icon}`} style={{ color: theme.colors.text.secondary, fontSize: '1.05rem' }}></i>{item.label}
                </button>
              ))}
            </MotionDiv>
          )}
        </AnimatePresence>
      </header>

      {/* ── RIBBON ── */}
      {showImageLibrary && (
        <ImageLibrary
          onSelectImage={(url) => { set('bgImage', url); set('bgMode', 'image'); setShowImageLibrary(false); }}
          onClose={() => setShowImageLibrary(false)}
          theme={theme}
        />
      )}
      {!isMobile && renderRibbon()}

      {/* ── WORKSPACE ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>



        {/* Left drawer: Layers or Quick Editor */}
        <AnimatePresence mode="wait">
          {isMobile ? null : showLayers ? (
            <motion.div
              key="layers-panel"
              initial={{ width: isMobile ? '100%' : 0, opacity: 0, y: isMobile ? 50 : 0 }}
              animate={{ width: isMobile ? '100%' : 220, opacity: 1, y: 0 }}
              exit={{ width: isMobile ? '100%' : 0, opacity: 0, y: isMobile ? 50 : 0 }}
              style={{
                overflow: 'hidden', flexShrink: 0, height: isMobile ? '70vh' : '100%',
                ...(isMobile ? {
                  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2000,
                  background: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}`,
                  borderTopLeftRadius: 16, borderTopRightRadius: 16, boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
                } : {})
              }}
            >
              {isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${theme.colors.border}` }}>
                  <span style={{ fontWeight: 700 }}>Capas</span>
                  <button onClick={() => setShowLayers(false)} style={{ background: 'none', border: 'none', color: theme.colors.text.primary }}><i className="bi bi-x-lg"></i></button>
                </div>
              )}
              <div style={{ height: isMobile ? 'calc(100% - 48px)' : '100%', overflow: 'hidden' }}>
                <LayersPanel formData={formData} set={set} selectedElementId={selectedElementId} setSelectedElementId={setSelectedElementId} theme={theme} />
              </div>
            </motion.div>
          ) : showQuickEditor ? (
            <motion.div
              key="quick-editor-panel"
              initial={{ width: isMobile ? '100%' : 0, opacity: 0, y: isMobile ? 50 : 0 }}
              animate={{ width: isMobile ? '100%' : 280, opacity: 1, y: 0 }}
              exit={{ width: isMobile ? '100%' : 0, opacity: 0, y: isMobile ? 50 : 0 }}
              style={{
                overflow: 'hidden', flexShrink: 0, height: isMobile ? '80vh' : '100%',
                ...(isMobile ? {
                  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2000,
                  background: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}`,
                  borderTopLeftRadius: 16, borderTopRightRadius: 16, boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
                } : { borderRight: `1px solid ${theme.colors.border}` })
              }}
            >
              {isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${theme.colors.border}` }}>
                  <span style={{ fontWeight: 700 }}>Editor Rápido</span>
                  <button onClick={() => setShowQuickEditor(false)} style={{ background: 'none', border: 'none', color: theme.colors.text.primary }}><i className="bi bi-x-lg"></i></button>
                </div>
              )}
              <div style={{ height: isMobile ? 'calc(100% - 48px)' : '100%', overflowY: 'auto' }}>
                <QuickContentPanel formData={formData} set={set} selectedElementId={selectedElementId} setSelectedElementId={setSelectedElementId} isEmbedded={true} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.colors.canvas, position: 'relative', minHeight: 0, minWidth: 0, padding: isMobile ? '0.75rem' : '1.5rem', containerType: 'size' }}
          onMouseDown={e => { if (e.target === e.currentTarget) setSelectedElementId(null); }}>

          {/* Remove the old floating QuickContentPanel */}

          {/* Preview canvas */}
          <MotionDiv layout ref={previewRef} id="preview-container"
            style={{ 
              width: '100%', 
              maxWidth: `min(100cqw, calc(100cqh * ${currentFmt.aspect}))`, 
              aspectRatio: currentFmt.aspect, 
              margin: '0 auto', 
              position: 'relative', 
              overflow: 'hidden', 
              ...previewBgStyle, 
              cursor: shapeMode ? 'crosshair' : 'default', 
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4)', 
              borderRadius: 0, 
              outline: shapeMode ? '3px dashed #5b2ea6' : 'none', 
              containerType: 'inline-size' 
            }}>
            <AnnouncementPreview
              previewRef={previewRef}
              formData={formData}
              FORMATS={FORMATS}
              currentFmt={currentFmt}
              isMobile={isMobile}
              selectedElementId={selectedElementId}
              setSelectedElementId={selectFromCanvas}
              setEditingElement={setEditingElement}
              shapeMode={shapeMode}
              onCanvasClick={() => { }}
              onCanvasTouchEnd={() => { }}
              editingElement={editingElement}
              editingValue={editingValue}
              setEditingValue={setEditingValue}
              handleElementDoubleClick={handleElementDoubleClick}
              commitEdit={commitEdit}
              selectedFieldKey={selectedElementId}
              set={set as any}
              assets={{ 
                oasis: logoOasis, 
                iasd: formData.logoColor === 'white' ? (logoBase64.iasdWhite || logoAdventista) : (logoBase64.iasd || logoAdventista), 
                rrss: (formData.logoColor === 'white' || formData.logoColor === 'auto') ? (logoBase64.rrssWhite || rrssImage) : (logoBase64.rrss || rrssImage),
                logoOasisLetras: (formData.logoColor === 'white' || formData.logoColor === 'auto') ? (logoBase64.oasisLetrasWhite || logoOasis) : (logoBase64.oasisLetras || logoOasis)
              }}
              logoOasis={logoOasis}
              logoAdventista={logoBase64.iasd || logoAdventista}
              rrssImage={logoBase64.rrss || rrssImage}
              previewBgStyle={previewBgStyle}
              onBgPosChange={(x: number, y: number) => { set('bgPosX', x); set('bgPosY', y); }}
            >
              {selectedLogo && (
                <div
                  style={{
                    position: 'absolute',
                    zIndex: 15,
                    opacity: logoOpacity,
                    pointerEvents: 'none',
                    ...getLogoPositionStyle(logoPosition)
                  }}
                >
                  <img src={selectedLogo} style={{ height: `${(logoSize / 100) * 15}cqw`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} alt="Custom Logo" />
                </div>
              )}
            </AnnouncementPreview>
          </MotionDiv>
        </div>

        {/* Right drawer */}
        <AnimatePresence>
          {showList && (
            <MotionDiv initial={{ width: isMobile ? '100%' : 0, opacity: 0, y: isMobile ? 50 : 0 }} animate={{ width: isMobile ? '100%' : 300, opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }} exit={{ width: isMobile ? '100%' : 0, opacity: 0, y: isMobile ? 50 : 0, transition: { duration: 0.2 } }}
              style={{
                overflow: 'hidden', flexShrink: 0, height: isMobile ? '80vh' : '100%',
                ...(isMobile ? {
                  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2000,
                  background: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}`,
                  borderTopLeftRadius: 16, borderTopRightRadius: 16, boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
                } : { background: theme.colors.surface, borderLeft: `1px solid ${theme.colors.border}` })
              }}>
              {isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${theme.colors.border}` }}>
                  <span style={{ fontWeight: 700 }}>Anuncios Guardados</span>
                  <button onClick={() => setShowList(false)} style={{ background: 'none', border: 'none', color: theme.colors.text.primary }}><i className="bi bi-x-lg"></i></button>
                </div>
              )}
              <div style={{ width: isMobile ? '100%' : 300, height: isMobile ? 'calc(100% - 48px)' : '100%', overflowY: 'auto' }}>
                <AnnouncementsList showForm={showForm} setShowForm={(value) => { setShowForm(value); if (!value) setShowList(false); }} announcements={announcements}
                  handleEdit={handleEditAnn} handleDelete={handleDeleteAnn}
                  logoOasis={logoOasis} isMobile={isMobile} activeMode="anuncios" theme={theme} />
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>



      {isMobile && (<>
        <AnimatePresence>
          {mobileSheet && (
            <motion.div key="mobile-sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              drag="y" dragControls={sheetDrag} dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => { if (info.offset.y > 80 || info.velocity.y > 500) setMobileSheet(null); }}
              role="dialog" aria-label={MOBILE_TOOLS.find(t => t.id === mobileSheet)?.label}
              style={{ flexShrink: 0, maxHeight: '46dvh', display: 'flex', flexDirection: 'column', background: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}`, borderRadius: '20px 20px 0 0', boxShadow: '0 -10px 30px rgba(0,0,0,0.18)', marginTop: -16, position: 'relative', zIndex: 5 }}>
              {/* Asa: arrastrar hacia abajo cierra el panel */}
              <div onPointerDown={e => sheetDrag.start(e)} style={{ touchAction: 'none', padding: '8px 16px 4px', cursor: 'grab' }}>
                <div style={{ width: 40, height: 5, borderRadius: 9, background: theme.colors.text.secondary, opacity: 0.35, margin: '0 auto 8px' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{MOBILE_TOOLS.find(t => t.id === mobileSheet)?.label}</span>
                  <button onClick={() => setMobileSheet(null)} aria-label="Cerrar panel" style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: 'transparent', color: theme.colors.text.secondary }}><i className="bi bi-x-lg"></i></button>
                </div>
              </div>
              <div style={{ overflowY: 'auto', overscrollBehavior: 'contain', padding: '0 12px 12px' }}>
                {mobileSheet === 'contenido' ? (
                  <QuickContentPanel formData={formData} set={set} selectedElementId={selectedElementId} setSelectedElementId={setSelectedElementId} isEmbedded={true} />
                ) : mobileSheet === 'capas' ? (
                  <LayersPanel formData={formData} set={set} selectedElementId={selectedElementId} setSelectedElementId={setSelectedElementId} theme={theme} />
                ) : renderRibbon({ activeRibbonTab: mobileSheet, sheetMode: true })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <nav aria-label="Herramientas del editor" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-around', background: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}`, padding: '6px 2px calc(6px + env(safe-area-inset-bottom))', position: 'relative', zIndex: 6 }}>
          {MOBILE_TOOLS.map(tool => {
            const active = mobileSheet === tool.id;
            return (
              <button key={tool.id} onClick={() => setMobileSheet(active ? null : tool.id)} aria-pressed={active}
                style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0', border: 'none', background: 'transparent', color: active ? theme.colors.primary : theme.colors.text.secondary, fontSize: '0.62rem', fontWeight: 600 }}>
                <span style={{ width: 40, height: 28, display: 'grid', placeItems: 'center', borderRadius: 99, background: active ? `${theme.colors.primary}22` : 'transparent', fontSize: '1.1rem', transition: 'background 0.2s' }}>
                  <i className={`bi ${tool.icon}`}></i>
                </span>
                {tool.label}
              </button>
            );
          })}
        </nav>
      </>)}

      {/* ── TOAST BORRADORES ── */}
      {draftToast && (
        <div style={{ position: 'fixed', bottom: isMobile ? 96 : 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: draftToast.type === 'ok' ? '#10b981' : '#ef4444', color: '#fff', padding: '10px 24px', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {draftToast.msg}
        </div>
      )}

      {/* ── PANEL BORRADORES ── */}
      <AnimatePresence>
        {showDraftPanel && (
          <MotionDiv
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ position: 'fixed', top: 48, right: 12, zIndex: 3000, width: 340, maxHeight: '70vh', overflowY: 'auto', background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.25)', padding: 16 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.colors.text.primary }}>
                <i className="bi bi-layout-text-sidebar" style={{ marginRight: 6, color: '#5b2ea6' }}></i>
                Borradores y Plantillas
              </span>
              <button onClick={() => setShowDraftPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.text.secondary, fontSize: '1.1rem' }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button onClick={() => saveDraft(false)} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid #f59e0b', background: 'transparent', color: '#f59e0b', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                <i className="bi bi-clock-history" style={{ marginRight: 4 }}></i>Guardar borrador
              </button>
              <button onClick={() => saveDraft(true)} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#5b2ea6,#00d2f3)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                <i className="bi bi-bookmark-star" style={{ marginRight: 4 }}></i>Como plantilla
              </button>
            </div>

            {drafts.length === 0 ? (
              <p style={{ textAlign: 'center', color: theme.colors.text.secondary, fontSize: '0.8rem', padding: '20px 0' }}>No hay borradores guardados</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {drafts.map(d => {
                  const hoursLeft = d.isTemplate ? null : Math.max(0, Math.ceil((DRAFT_TTL - (Date.now() - d.savedAt)) / 3600000));
                  const timeStr = d.isTemplate ? 'Plantilla' : `Expira en ${hoursLeft}h`;
                  return (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: d.isTemplate ? 'rgba(91,46,166,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${d.isTemplate ? 'rgba(91,46,166,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
                      <i className={`bi ${d.isTemplate ? 'bi-bookmark-star-fill' : 'bi-clock'}`} style={{ color: d.isTemplate ? '#5b2ea6' : '#f59e0b', fontSize: '1rem', flexShrink: 0 }}></i>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.78rem', color: theme.colors.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</div>
                        <div style={{ fontSize: '0.68rem', color: theme.colors.text.secondary }}>{timeStr} · {new Date(d.savedAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => loadDraft(d)} title="Cargar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', fontSize: '0.95rem', padding: 2 }}><i className="bi bi-box-arrow-in-down"></i></button>
                        {!d.isTemplate && (
                          <button onClick={() => promoteDraft(d.id)} title="Convertir en plantilla" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5b2ea6', fontSize: '0.95rem', padding: 2 }}><i className="bi bi-bookmark-plus"></i></button>
                        )}
                        <button onClick={() => deleteDraft(d.id)} title="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.95rem', padding: 2 }}><i className="bi bi-trash"></i></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: theme.colors.surface, borderRadius: 12, padding: 24, width: 360, maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <h5 style={{ color: theme.colors.text.primary }}>{editingAnnouncement ? 'Editar anuncio' : 'Nuevo anuncio'}</h5>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.8rem', color: theme.colors.text.secondary, display: 'block', marginBottom: 4 }}>Título</label>
              <input className="form-control" value={formData.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.8rem', color: theme.colors.text.secondary, display: 'block', marginBottom: 4 }}>Etiqueta</label>
              <input className="form-control" value={formData.tag} onChange={e => set('tag', e.target.value)} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.8rem', color: theme.colors.text.secondary, display: 'block', marginBottom: 4 }}>Contenido</label>
              <textarea className="form-control" rows={3} value={formData.content} onChange={e => set('content', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Publicar'}</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{
        padding: '10px 24px',
        background: theme.colors.surface,
        borderTop: `1px solid ${theme.colors.border}`,
        display: isMobile ? 'none' : 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.65rem',
        color: theme.colors.text.secondary,
        fontWeight: 600,
        zIndex: 1100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logoLumina} style={{ height: 18, width: 'auto', opacity: 0.8 }} alt="Lumina Logo" />
          <span style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>Lumina Creator</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ opacity: 0.6 }}>Oasis Cloud Integration</span>
          <span style={{ padding: '2px 8px', background: 'rgba(91,46,166,0.1)', color: '#5b2ea6', borderRadius: '4px' }}>v1.1</span>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION REMOVED - Conflicted with Dashboard */}
    </div>
  );
};

export default AdminAnnouncements;


