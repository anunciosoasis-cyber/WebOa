// PressEditModal.jsx — editor único de diapositivas de Oasis Press: crear (anuncio híbrido o cartel) y editar,
// con vista previa en vivo hecha con el mismo componente que el proyector.
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../react-ui/ThemeContext';
import { motion } from 'framer-motion';
import { X, ImagePlus, Trash2, Upload, Eye, EyeOff, Bold, Italic, Underline, Film, Sparkles } from 'lucide-react';
import SlideCanvasView, { SLIDE_FONTS, DEFAULT_SLIDE_STYLE, isHybridSlide } from './SlideCanvasView';
import { imageFileToDataUrl } from './PressFileManager';

// "youtube_mirando_el-mundo.png" → "Youtube mirando el mundo"
const prettyFileTitle = (name) => {
  const t = name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const TEMPLATES = {
  hybrid: () => ({
    type: 'hybrid_announcement', title: '', subtitle: '', mediaUrl: null, fileUrl: null, mediaType: 'image',
    eventData: { tag: 'ANUNCIO OASIS', speaker: '', eventDate: 'PRÓXIMO SÁBADO - 10:00 AM', location: 'TEMPLO OASIS', description: '' },
  }),
  cartel: () => ({
    type: 'styled', title: 'TÍTULO DEL ANUNCIO', subtitle: 'Subtítulo o descripción breve del evento',
    eventData: { tag: 'BOLETÍN OASIS', speaker: '', eventDate: 'PRÓXIMO SÁBADO - 10:00 AM', location: 'TEMPLO OASIS' },
    style: { ...DEFAULT_SLIDE_STYLE }, hidden: {},
  }),
};

const COLOR_PRESETS = ['#120C1F', '#0B1B2B', '#3B0764', '#7C2D12', '#064E3B'];
const ACCENT_PRESETS = ['#FBBF24', '#F97316', '#A78BFA', '#34D399', '#38BDF8'];

const inputCls = 'w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5b2ea6]/40 focus:border-[#5b2ea6]';

const Field = ({ label, children, layer, hidden, onToggle }) => (
  <label className="block">
    <span className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
      {label}
      {layer && (
        <button type="button" onClick={(e) => { e.preventDefault(); onToggle(); }} aria-pressed={!hidden}
          aria-label={hidden ? `Mostrar ${label}` : `Ocultar ${label}`} title={hidden ? 'Oculto en la diapositiva' : 'Visible en la diapositiva'}
          className={`w-7 h-7 grid place-items-center rounded-lg ${hidden ? 'text-slate-300 hover:text-slate-500' : 'text-[#5b2ea6] hover:bg-[#5b2ea6]/10'}`}>
          {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </span>
    {children}
  </label>
);

/** Grupo del ribbon: controles arriba y su nombre abajo, separado del siguiente por una línea. */
const RibbonGroup = ({ label, children, last }) => (
  <div className={`flex flex-col justify-between gap-1.5 px-3 py-2 ${last ? '' : 'border-r border-slate-200'}`}>
    <div className="flex items-center gap-2 min-h-[36px]">{children}</div>
    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 text-center">{label}</span>
  </div>
);

/** Fila compacta de colores: muestras + selector libre. */
const SwatchRow = ({ label, value, presets, onChange }) => (
  <div className="flex items-center gap-1">
    {presets.map((c) => (
      <button key={c} type="button" onClick={() => onChange(c)} aria-label={`${label} ${c}`} title={c}
        className={`w-[22px] h-[22px] rounded-full border-2 ${value?.toLowerCase() === c.toLowerCase() ? 'border-[#5b2ea6] ring-2 ring-[#5b2ea6]/30' : 'border-white shadow'}`}
        style={{ background: c }} />
    ))}
    <label className="relative w-[22px] h-[22px] rounded-full overflow-hidden border-2 border-white shadow cursor-pointer" title="Color personalizado"
      style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label={`${label} personalizado`} />
    </label>
  </div>
);

export const PressEditModal = ({ mode = 'edit', slide, index = 0, background, onSave, onClose }) => {
  const creating = mode === 'create';
  const { mode: themeMode } = useTheme();
  const [kind, setKind] = useState('hybrid'); // solo al crear
  const [draft, setDraft] = useState(() => (creating ? TEMPLATES.hybrid() : slide));
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => { if (!creating) setDraft(slide); }, [slide, creating]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [onClose]);

  if (!draft) return null;

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setEvent = (patch) => setDraft((d) => ({ ...d, eventData: { ...(d.eventData || {}), ...patch } }));
  const setStyle = (patch) => setDraft((d) => ({ ...d, style: { ...DEFAULT_SLIDE_STYLE, ...(d.style || {}), ...patch } }));
  const toggleLayer = (key) => setDraft((d) => ({ ...d, hidden: { ...(d.hidden || {}), [key]: !d.hidden?.[key] } }));
  const setElement = (i, content) => setDraft((d) => ({ ...d, elements: d.elements.map((el, j) => (j === i ? { ...el, content } : el)) }));

  // Cambiar de tipo al crear conserva lo que ya se escribió
  const switchKind = (k) => {
    if (k === kind) return;
    setKind(k);
    setDraft((d) => ({ ...TEMPLATES[k](), title: d.title || TEMPLATES[k]().title, subtitle: d.subtitle, eventData: { ...TEMPLATES[k]().eventData, ...d.eventData } }));
  };

  const loadMediaFile = async (file, apply) => {
    if (!file) return;
    const video = file.type.startsWith('video/') || /\.(mp4|webm)$/i.test(file.name);
    const url = video ? URL.createObjectURL(file) : await imageFileToDataUrl(file).catch(() => URL.createObjectURL(file));
    apply({ url, mediaType: video ? 'video' : 'image', name: file.name });
  };
  const applyMedia = ({ url, mediaType, name }) => setDraft((d) => ({
    ...d, fileUrl: url, mediaUrl: url, mediaType, fileName: name,
    ...(isHybridSlide(d) ? {} : { type: mediaType }),
    title: d.title || prettyFileTitle(name),
  }));

  const hybrid = isHybridSlide(draft);
  const media = !!(draft.mediaUrl || draft.fileUrl);
  const isElements = draft.elements?.length > 0;
  const cartel = !hybrid && !media; // cartel o diapositiva de texto
  const ev = draft.eventData || {};
  const st = { ...DEFAULT_SLIDE_STYLE, ...(draft.style || {}) };
  const hidden = draft.hidden || {};
  const canSave = !creating || !!draft.title?.trim();

  const submit = () => {
    if (!canSave) return;
    // Al guardar, el subtítulo de un anuncio se completa con la fecha si quedó vacío (lo usa la tira y el control remoto)
    onSave(creating ? { ...draft, subtitle: draft.subtitle || ev.eventDate || '' } : draft);
  };

  // Portal al body y por encima de la barra inferior del admin (z 20000), que en móvil tapaba Guardar
  return createPortal(
    <div data-admin-theme={themeMode}>
    <motion.div className="oasis-dark-scope fixed inset-0 z-[30000] flex items-center justify-center p-2 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="press-edit-title"
        initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-7xl max-h-[96vh] flex flex-col bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* ── Cabecera ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 pt-4 pb-3 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5b2ea6]">Oasis Press</span>
            <h2 id="press-edit-title" className="font-moonrising text-lg uppercase tracking-wide text-slate-900 m-0 leading-tight">
              {creating ? <>Nueva <span className="text-[#F5A623]">diapositiva</span></> : <>Editar diapositiva <span className="text-[#F5A623]">#{index + 1}</span></>}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {creating && (
              <div role="tablist" aria-label="Tipo de diapositiva" className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200">
                {[['hybrid', 'Contenido híbrido', Upload], ['cartel', 'Diseñar cartel', Sparkles]].map(([k, label, Icon]) => (
                  <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => switchKind(k)}
                    className={`relative h-8 px-4 rounded-full inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-colors ${kind === k ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                    {kind === k && <motion.span layoutId="press-kind-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5b2ea6] to-[#7c3aed]" transition={{ type: 'spring', damping: 28, stiffness: 380 }} />}
                    <Icon size={13} className="relative" /> <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
            )}
            <button type="button" onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full grid place-items-center text-slate-500 hover:bg-slate-100"><X size={18} /></button>
          </div>
        </div>

        {/* ── Ribbon de estilo (como Office): grupos con su etiqueta abajo ── */}
        <div className="mx-5 sm:mx-6 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 overflow-x-auto custom-scrollbar">
          <div className="flex items-stretch min-w-max">
            {(hybrid || media) && (
              <RibbonGroup label="Multimedia">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); loadMediaFile(e.dataTransfer.files?.[0], applyMedia); }}
                  className={`flex items-center gap-2.5 rounded-xl border-2 border-dashed p-1.5 pr-2 transition-colors ${dragging ? 'border-[#5b2ea6] bg-[#5b2ea6]/5' : 'border-slate-300'}`}
                  title="Arrastra aquí tu afiche o vídeo"
                >
                  <div className="w-14 aspect-video rounded-md overflow-hidden bg-white border border-slate-200 grid place-items-center shrink-0">
                    {media ? (draft.mediaType === 'video' ? <Film size={16} className="text-slate-400" /> : <img src={draft.mediaUrl || draft.fileUrl} alt="" className="w-full h-full object-cover" />) : <ImagePlus size={16} className="text-slate-400" />}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm" className="hidden"
                    onChange={(e) => { loadMediaFile(e.target.files?.[0], applyMedia); e.target.value = ''; }} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white hover:bg-[#5b2ea6]">
                    <Upload size={13} /> {media ? 'Cambiar' : 'Afiche'}
                  </button>
                </div>
              </RibbonGroup>
            )}

            {(!media || hybrid) && (
              <>
                <RibbonGroup label="Fuente">
                  <select value={st.fontFamily} onChange={(e) => setStyle({ fontFamily: e.target.value })} aria-label="Fuente del título"
                    className="h-9 w-36 px-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5b2ea6]/40" style={{ fontFamily: SLIDE_FONTS[st.fontFamily] }}>
                    {Object.keys(SLIDE_FONTS).map((f) => <option key={f} value={f} style={{ fontFamily: SLIDE_FONTS[f] }}>{f}</option>)}
                  </select>
                  <div className="inline-flex p-0.5 rounded-lg border border-slate-200 bg-white" role="group" aria-label="Formato del título">
                    {[['bold', Bold, 'Negrita'], ['italic', Italic, 'Cursiva'], ['underline', Underline, 'Subrayado']].map(([key, Icon, label]) => (
                      <button key={key} type="button" onClick={() => setStyle({ [key]: !st[key] })} aria-pressed={!!st[key]} aria-label={label} title={label}
                        className={`w-8 h-8 grid place-items-center rounded-md ${st[key] ? 'bg-[#5b2ea6] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <Icon size={14} />
                      </button>
                    ))}
                  </div>
                </RibbonGroup>
                <RibbonGroup label="Fondo"><SwatchRow label="Fondo" value={st.bgColor} presets={COLOR_PRESETS} onChange={(c) => setStyle({ bgColor: c })} /></RibbonGroup>
                <RibbonGroup label="Texto"><SwatchRow label="Texto" value={st.textColor} presets={['#FFFFFF', '#FDE68A', '#E2E8F0']} onChange={(c) => setStyle({ textColor: c })} /></RibbonGroup>
                <RibbonGroup label="Acento"><SwatchRow label="Acento" value={st.accentColor} presets={ACCENT_PRESETS} onChange={(c) => setStyle({ accentColor: c })} /></RibbonGroup>
                <RibbonGroup label="Imagen de fondo" last>
                  <div className="w-12 aspect-video rounded-md overflow-hidden bg-white border border-slate-200 shrink-0" title={draft.background ? 'Propia de esta diapositiva' : background ? 'Fondo de la presentación' : 'Sin imagen: se usa el color de fondo'}>
                    {(draft.background || background) && <img src={draft.background || background} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { loadMediaFile(e.target.files?.[0], ({ url }) => set({ background: url })); e.target.value = ''; }} />
                  <button type="button" onClick={() => bgRef.current?.click()} className="h-8 px-3 rounded-full text-[11px] font-black uppercase tracking-wider border border-slate-300 bg-white text-slate-700 hover:border-[#5b2ea6] hover:text-[#5b2ea6]">Elegir</button>
                  {draft.background && (
                    <button type="button" onClick={() => set({ background: null })} aria-label="Quitar imagen de fondo" title="Quitar imagen de fondo" className="w-8 h-8 grid place-items-center rounded-full text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                  )}
                </RibbonGroup>
              </>
            )}
          </div>
        </div>

        {/* ── Campos al lado de la vista previa ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] gap-5">
            <div className="space-y-3">
              {isElements ? (
                draft.elements.map((el, i) => (
                  <Field key={el.id || i} label={el.type === 'heading' ? 'Título' : el.type === 'tag' ? 'Etiqueta' : el.type === 'image' ? 'Imagen' : 'Texto'}>
                    {el.type === 'image' ? <p className="text-xs text-slate-500 m-0">Imagen importada del archivo</p>
                      : el.type === 'text' ? <textarea rows={2} value={el.content || ''} onChange={(e) => setElement(i, e.target.value)} className={`${inputCls} h-auto py-2`} />
                        : <input value={el.content || ''} onChange={(e) => setElement(i, e.target.value)} className={inputCls} />}
                  </Field>
                ))
              ) : (
                <>
                  <Field label={media && !hybrid ? 'Título (se ve en la tira y en el control remoto)' : 'Título'} layer={cartel} hidden={hidden.title} onToggle={() => toggleLayer('title')}>
                    <input autoFocus value={draft.title || ''} onChange={(e) => set({ title: e.target.value })} placeholder="Ej. Conferencia de Jóvenes Oasis" className={inputCls} />
                  </Field>
                  {(!media || hybrid) && (
                    <Field label="Subtítulo" layer={cartel} hidden={hidden.subtitle} onToggle={() => toggleLayer('subtitle')}>
                      <textarea rows={2} value={draft.subtitle || ''} onChange={(e) => set({ subtitle: e.target.value })} className={`${inputCls} h-auto py-2`} />
                    </Field>
                  )}
                </>
              )}

              {(hybrid || (cartel && !isElements)) && (
                <>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    {[['tag', 'Etiqueta'], ['speaker', 'Orador'], ['eventDate', 'Fecha y hora'], ['location', 'Lugar']].map(([key, label]) => (
                      <Field key={key} label={label} layer hidden={hidden[key]} onToggle={() => toggleLayer(key)}>
                        <input value={ev[key] || ''} onChange={(e) => setEvent({ [key]: e.target.value })} placeholder={key === 'speaker' ? 'Ej. Pr. Felipe Miranda' : ''} className={inputCls} />
                      </Field>
                    ))}
                  </div>
                  {hybrid && (
                    <Field label="Descripción">
                      <textarea rows={2} value={ev.description || ''} onChange={(e) => setEvent({ description: e.target.value })} className={`${inputCls} h-auto py-2`} />
                    </Field>
                  )}
                </>
              )}
              {draft.mediaType === 'video' && <p className="text-[11px] text-amber-600 m-0">Los vídeos no se guardan al recargar la página: vuelve a cargarlo si recargas.</p>}
            </div>

            {/* Vista previa en vivo (mismo componente que el proyector) + acciones */}
            <div className="[order:-1] lg:[order:2] flex flex-col gap-3 lg:sticky lg:top-0 self-start w-full">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Vista previa · así se verá en el proyector</span>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
                <SlideCanvasView slide={draft} background={background} rounded={false} />
              </div>
              <div className="hidden lg:flex justify-end gap-3">
                <button type="button" onClick={onClose} className="h-11 px-6 rounded-full border border-slate-300 font-bold text-sm text-slate-700">Cancelar</button>
                <button type="button" onClick={submit} disabled={!canSave}
                  className="h-11 px-6 rounded-full font-black text-sm uppercase tracking-wider text-white bg-gradient-to-r from-[#5b2ea6] to-[#7c3aed] shadow-[0_8px_20px_-6px_rgba(91,46,166,0.7)] disabled:opacity-40">
                  {creating ? 'Agregar a la presentación' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Móvil: Cancelar / Guardar siempre visibles */}
        <div className="lg:hidden shrink-0 flex gap-3 px-5 py-3 border-t border-slate-200 bg-white">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-full border border-slate-300 font-bold text-sm text-slate-700">Cancelar</button>
          <button type="button" onClick={submit} disabled={!canSave}
            className="flex-[1.6] h-11 rounded-full font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#5b2ea6] to-[#7c3aed] disabled:opacity-40">
            {creating ? 'Agregar' : 'Guardar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
    </div>,
    document.body
  );
};

export default PressEditModal;
