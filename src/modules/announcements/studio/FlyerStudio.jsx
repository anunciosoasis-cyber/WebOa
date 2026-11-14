import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, LayoutList, ListChecks, MessageSquareText, Pencil, X } from 'lucide-react';
import { useToast } from '../../../react-ui/components/Toast';
import SendWhatsapp from '../../../components/whatsapp/SendWhatsapp';
import { announcementsApi, errorText } from '../api/announcementsApi';
import useFlyerDraft, { toPayload } from '../hooks/useFlyerDraft';
import AssistantPanel from './AssistantPanel';
import FieldsPanel from './FieldsPanel';
import KindPicker from './KindPicker';
import PreviewCanvas from './PreviewCanvas';
import PublishBar from './PublishBar';
import PublishedPanel from './PublishedPanel';

const LABELS = { sermonTitleMain: 'el título', dateText: 'la fecha', timeText: 'la hora' };
const PREVIEW_DEBOUNCE_MS = 800;
// Las etiquetas del motor traen emojis para Telegram; en el admin van sin ellos
const plainLabel = (label) => label.replace(/^[^\p{L}\p{N}]+/u, '').trim();
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Diseño automático: asistente | vista previa | datos. Mismo motor, asistente y formato que el bot de Telegram.
 */
export default function FlyerStudio({ isDark, onOpenInCanvas }) {
    const { showToast } = useToast();
    const [options, setOptions] = useState(null);
    const draft = useFlyerDraft(options?.kinds);
    const { fields, assumptions, messages, undo, publishDate, missing, dispatch } = draft;
    const kind = fields.kind ?? 'culto';
    const kindSpec = options?.kinds?.find((k) => k.id === kind);
    const [preview, setPreview] = useState(null); // { src, caption }
    const [busy, setBusy] = useState(''); // '' | 'assist' | 'preview' | 'publish'
    const [published, setPublished] = useState(null);
    const [sendOpen, setSendOpen] = useState(false);
    const [error, setError] = useState('');
    const [mobileTab, setMobileTab] = useState('assistant');
    const requestId = useRef(0);
    const [editing, setEditing] = useState(null); // { id, title } del anuncio publicado que se está cambiando
    const [listOpen, setListOpen] = useState(false);
    const [list, setList] = useState({ items: [], loading: false });

    const loadList = useCallback(() => {
        setList((l) => ({ ...l, loading: true }));
        announcementsApi
            .list()
            .then((items) => setList({ items, loading: false }))
            .catch((e) => {
                setList((l) => ({ ...l, loading: false }));
                showToast(`No se pudo cargar la lista: ${errorText(e)}`, 'error');
            });
    }, [showToast]);

    // Las páginas públicas escuchan esta marca para recargar los anuncios
    const notifyWeb = () => {
        try {
            localStorage.setItem('oasis_announcements_updated_at', String(Date.now()));
        } catch {
            /* sin almacenamiento */
        }
        window.dispatchEvent(new Event('oasis:announcements-updated'));
    };

    useEffect(() => {
        announcementsApi
            .options()
            .then((data) =>
                setOptions({
                    ...data,
                    gradients: data.gradients.map((g) => ({ ...g, label: plainLabel(g.label) })),
                    fontPairs: data.fontPairs.map((f) => ({ ...f, label: plainLabel(f.label) })),
                }),
            )
            .catch((e) => setError(`El motor de flyers no está disponible: ${errorText(e)}`));
    }, []);

    const payload = useMemo(() => toPayload(fields, options?.templates), [fields, options]);
    const payloadKey = JSON.stringify(payload);
    const ready = missing.length === 0 && (kind !== 'culto' || Boolean(payload.serviceType));
    const missingLabels = missing.map((k) => (kind === 'culto' ? LABELS[k] : (kindSpec?.fields.find((f) => f.key === k)?.label.toLowerCase() ?? k)));

    const renderPreview = async () => {
        const id = ++requestId.current;
        setBusy((b) => b || 'preview');
        setError('');
        try {
            const data = await announcementsApi.preview(payload);
            if (id === requestId.current) setPreview({ src: `data:${data.mimeType};base64,${data.imageBase64}`, caption: data.caption });
        } catch (e) {
            if (id === requestId.current) setError(errorText(e));
        } finally {
            if (id === requestId.current) setBusy((b) => (b === 'preview' ? '' : b));
        }
    };

    // Vista previa en vivo: cada cambio completo se dibuja con el motor real
    useEffect(() => {
        if (!ready || !options) return undefined;
        const t = setTimeout(renderPreview, PREVIEW_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [payloadKey, ready, options]); // eslint-disable-line react-hooks/exhaustive-deps

    const sendToAssistant = async (message) => {
        dispatch({ type: 'userMessage', id: newId(), text: message });
        setBusy('assist');
        try {
            // Las fotos no viajan al asistente (no las necesita y pesan); se conservan en el borrador
            const { photo, eventLogo, ...light } = fields;
            const result = await announcementsApi.assist(message, light);
            dispatch({ type: 'assist', id: newId(), result: { ...result, fields: { ...result.fields, ...(photo && { photo }), ...(eventLogo && { eventLogo }) } } });
        } catch (e) {
            dispatch({ type: 'assistError', id: newId(), text: `No pude interpretar el mensaje (${errorText(e)}). Puedes completar los datos a mano.` });
        } finally {
            setBusy('');
        }
    };

    const nextBackground = () => {
        const ids = options?.backgrounds.map((b) => b.id) ?? [];
        if (!ids.length) return;
        dispatch({ type: 'setField', field: 'backgroundId', value: ids[(ids.indexOf(fields.backgroundId) + 1) % ids.length] });
    };

    const publish = async () => {
        setBusy('publish');
        setError('');
        try {
            const data = editing ? await announcementsApi.update(editing.id, payload, publishDate) : await announcementsApi.publish(payload, publishDate);
            setPublished(data.announcement.id);
            setPreview((p) => ({ src: p?.src ?? data.announcement.imageUrl, caption: data.caption }));
            showToast(editing ? 'Cambios guardados en la web' : 'Anuncio publicado en la web', 'success');
            setEditing(null);
            notifyWeb();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setBusy('');
        }
    };

    const downloadFlyer = async () => {
        if (!preview?.src) return;
        try {
            const cleanTitle = (fields.sermonTitleMain || 'anuncio-oasis')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\w\d-_]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 40) || 'anuncio';
            const ratioStr = (fields.aspectRatio || '4:5').replace(':', '-');
            const filename = `oasis-${cleanTitle}-${ratioStr}.png`;

            if (preview.src.startsWith('data:')) {
                const a = document.createElement('a');
                a.href = preview.src;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                const res = await fetch(preview.src);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
            showToast('Flyer descargado en PNG de alta resolución', 'success');
        } catch {
            window.open(preview.src, '_blank');
        }
    };

    const shareWhatsapp = async () => {
        if (!preview?.src) return;
        let text = preview.caption || fields.sermonTitleMain || 'Anuncio Iglesia Oasis';
        // Si la imagen ya tiene URL pública alojada, añadir enlace para previsualización automática en WhatsApp
        if (preview.src && !preview.src.startsWith('data:')) {
            text += `\n\n🖼️ Imagen: ${preview.src}`;
        }

        // 1. En móviles o navegadores con soporte Web Share con archivos (adjunta imagen + texto directamente):
        if (navigator.share) {
            try {
                let file = null;
                if (preview.src.startsWith('data:')) {
                    const res = await fetch(preview.src);
                    const blob = await res.blob();
                    file = new File([blob], 'anuncio-oasis.png', { type: 'image/png' });
                }
                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: fields.sermonTitleMain || 'Anuncio Oasis',
                        text,
                        files: [file],
                    });
                    return;
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
            }
        }

        // 2. En escritorio / web: copiar la imagen en el portapapeles del sistema para pegarla con Ctrl+V
        let imageCopied = false;
        if (preview.src.startsWith('data:') && navigator.clipboard?.write && window.ClipboardItem) {
            try {
                const res = await fetch(preview.src);
                const blob = await res.blob();
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                imageCopied = true;
            } catch {
                try {
                    await navigator.clipboard.writeText(text);
                } catch {}
            }
        } else if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
            } catch {}
        }

        // 3. Abrir wa.me con el texto del anuncio
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');

        if (imageCopied) {
            showToast('Abriendo wa.me · ¡Imagen copiada al portapapeles! Presiona Ctrl+V en el chat para pegarla', 'success');
        } else {
            showToast('Abriendo wa.me con el texto del anuncio', 'info');
        }
    };

    const reset = () => {
        dispatch({ type: 'reset', keep: { kind: fields.kind, styleId: fields.styleId, aspectRatio: fields.aspectRatio, gradientId: fields.gradientId, fontPairId: fields.fontPairId } });
        setPreview(null);
        setPublished(null);
        setSendOpen(false);
        setEditing(null);
    };

    const openList = () => {
        setListOpen(true);
        loadList();
    };

    const editAnnouncement = (ann, form) => {
        dispatch({ type: 'load', fields: form.flyer, publishDate: ann.date ?? '' });
        setEditing({ id: ann.id, title: ann.title });
        setPreview(ann.imageUrl ? { src: ann.imageUrl, caption: ann.description } : null);
        setPublished(null);
        setSendOpen(false);
        setListOpen(false);
        // Las fotos no se guardan con el anuncio (solo el PNG final): hay que volver a subirlas
        if (form.hasPhoto || form.hasEventLogo) showToast('Este anuncio tenía foto o logo: vuelve a subirlos en «Datos» antes de guardar', 'info');
    };

    const deleteAnnouncement = async (ann) => {
        try {
            await announcementsApi.remove(ann.id);
            setList((l) => ({ ...l, items: l.items.filter((a) => a.id !== ann.id) }));
            if (editing?.id === ann.id) setEditing(null);
            if (published === ann.id) setPublished(null);
            notifyWeb();
            showToast('Anuncio eliminado de la web', 'success');
        } catch (e) {
            showToast(`No se pudo eliminar: ${errorText(e)}`, 'error');
        }
    };

    if (!options) {
        return error ? (
            <div className="ann-alert" role="alert">
                <AlertCircle size={16} /> {error}
            </div>
        ) : (
            <div className="ann-note" style={{ padding: 32 }}>
                Conectando con el motor de diseño…
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="ann-alert" role="alert">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            <div className="ann-studio-bar">
                {editing ? (
                    <div className="ann-editing-banner" role="status">
                        <Pencil size={14} />
                        <span>
                            Editando <strong>{editing.title}</strong> · al guardar se reemplaza en la web
                        </span>
                        <button type="button" className="ann-btn ann-btn-sm ann-btn-ghost" onClick={reset}>
                            <X size={12} /> Cancelar edición
                        </button>
                    </div>
                ) : (
                    <span />
                )}
                <button type="button" className="ann-btn ann-btn-sm" onClick={openList}>
                    <LayoutList size={14} /> Publicados
                </button>
            </div>
            {listOpen && (
                <PublishedPanel
                    items={list.items}
                    loading={list.loading}
                    editingId={editing?.id}
                    onEdit={editAnnouncement}
                    onDelete={deleteAnnouncement}
                    onClose={() => setListOpen(false)}
                />
            )}
            <div style={{ padding: '0 12px 12px' }} className="ann-mobile-tabs">
                <div className="ann-segmented" role="tablist" aria-label="Paneles">
                    <button type="button" role="tab" aria-selected={mobileTab === 'assistant'} onClick={() => setMobileTab('assistant')}>
                        <MessageSquareText size={14} /> Asistente
                    </button>
                    <button type="button" role="tab" aria-selected={mobileTab === 'fields'} onClick={() => setMobileTab('fields')}>
                        <ListChecks size={14} /> Datos{assumptions.length ? ` (${assumptions.length})` : ''}
                    </button>
                </div>
            </div>

            {options.kinds && (
                <KindPicker
                    kinds={options.kinds}
                    kind={kind}
                    onKind={(id) => {
                        dispatch({ type: 'setField', field: 'kind', value: id });
                        if (id === 'culto') {
                            const defaultTpl = options.templates?.[0]?.id ?? 'adoracion';
                            dispatch({ type: 'setField', field: 'templateId', value: defaultTpl });
                        } else {
                            dispatch({ type: 'setField', field: 'styleId', value: options.kinds.find((k) => k.id === id)?.styles[0]?.id });
                        }
                    }}
                />
            )}

            <div className="ann-studio" data-mobile-tab={mobileTab}>
                <div className="ann-col-assistant ann-sticky">
                    <AssistantPanel
                        messages={messages}
                        busy={busy === 'assist'}
                        canUndo={undo.length > 0}
                        onSend={sendToAssistant}
                        onUndo={() => dispatch({ type: 'undo' })}
                        onReset={reset}
                        kind={kind}
                        kindLabel={kindSpec?.label}
                        styles={kind === 'culto' ? options?.templates : kindSpec?.styles}
                        selectedStyleId={kind === 'culto' ? fields.templateId : fields.styleId}
                        onSelectStyle={(id) => {
                            if (kind === 'culto') {
                                dispatch({ type: 'setField', field: 'templateId', value: id });
                                const tpl = options?.templates?.find((t) => t.id === id);
                                if (tpl) dispatch({ type: 'setField', field: 'serviceType', value: tpl.serviceType });
                            } else {
                                dispatch({ type: 'setField', field: 'styleId', value: id });
                            }
                        }}
                    />
                </div>

                <div className="ann-col-preview">
                    <PreviewCanvas
                        aspectRatio={fields.aspectRatio ?? '4:5'}
                        src={preview?.src}
                        busy={busy === 'preview'}
                        missingLabels={missingLabels}
                        onFormat={(id) => dispatch({ type: 'setField', field: 'aspectRatio', value: id })}
                    />
                    <PublishBar
                        ready={ready}
                        busy={busy}
                        pendingAssumptions={assumptions.length}
                        hasPreview={Boolean(preview?.src)}
                        published={published}
                        editing={Boolean(editing)}
                        caption={preview?.caption}
                        sendOpen={sendOpen}
                        onRefresh={renderPreview}
                        onDownload={downloadFlyer}
                        onWhatsapp={shareWhatsapp}
                        onToggleGroups={() => setSendOpen((o) => !o)}
                        onOpenCanvas={() => onOpenInCanvas(payload, options)}
                        onPublish={publish}
                        onCopyCaption={() => {
                            navigator.clipboard?.writeText(preview.caption);
                            showToast('Texto copiado al portapapeles', 'info');
                        }}
                    />
                    {published && sendOpen && (
                        <div style={{ width: '100%', maxWidth: 560 }}>
                            <SendWhatsapp key={published} announcementId={published} caption={preview?.caption} isDark={isDark} onDone={() => setSendOpen(false)} />
                        </div>
                    )}
                </div>

                <div className="ann-col-fields">
                    <FieldsPanel
                        fields={fields}
                        assumptions={assumptions}
                        options={options}
                        publishDate={publishDate}
                        onChange={(field, value) => dispatch({ type: 'setField', field, value })}
                        onConfirm={(field) => dispatch({ type: 'confirm', field })}
                        onPublishDate={(value) => dispatch({ type: 'publishDate', value })}
                        onRandomBackground={nextBackground}
                        onError={(m) => showToast(m, 'error')}
                    />
                </div>
            </div>
        </>
    );
}
