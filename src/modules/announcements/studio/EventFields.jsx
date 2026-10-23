import React, { useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, Loader2, Shuffle, X } from 'lucide-react';

/** Texto de varias líneas → lista; se confirma al salir del campo para no comerse los saltos de línea. */
function LinesField({ id, label, value, onCommit, placeholder }) {
    const [text, setText] = useState((value ?? []).join('\n'));
    const focused = useRef(false);
    useEffect(() => {
        if (!focused.current) setText((value ?? []).join('\n'));
    }, [value]);
    return (
        <div className="ann-field">
            <label htmlFor={id}>{label}</label>
            <textarea
                id={id}
                value={text}
                placeholder={placeholder}
                onFocus={() => (focused.current = true)}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => {
                    focused.current = false;
                    onCommit(text.split('\n').map((s) => s.trim()).filter(Boolean));
                }}
            />
        </div>
    );
}

const readDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
    });

/**
 * Foto propia o logo: se reduce en el navegador (máx. 1080 px) antes de enviarla, así el motor recibe
 * una imagen liviana. La librería de compresión se carga solo al elegir una foto.
 */
function PhotoField({ id, label, value, isLogo, onChange, onError }) {
    const [busy, setBusy] = useState(false);
    const pick = async (file) => {
        if (!file) return;
        if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return onError('Usa una imagen JPG, PNG o WEBP.');
        setBusy(true);
        try {
            const { default: compress } = await import('browser-image-compression');
            // Los logos conservan la transparencia (PNG); las fotos van en JPEG
            const out = await compress(file, { maxWidthOrHeight: isLogo ? 800 : 1080, maxSizeMB: 0.7, fileType: isLogo ? 'image/png' : 'image/jpeg', useWebWorker: true });
            onChange(await readDataUrl(out));
        } catch {
            onError('No se pudo procesar la imagen.');
        } finally {
            setBusy(false);
        }
    };
    return (
        <div className="ann-field">
            <label htmlFor={id}>{label}</label>
            <div className="ann-photo">
                {value ? <img src={value} alt="" className={isLogo ? 'ann-photo-logo' : undefined} /> : <span className="ann-photo-empty"><ImagePlus size={18} /></span>}
                <label className="ann-btn ann-btn-sm" htmlFor={id}>
                    {busy ? <Loader2 size={13} className="ann-spin" /> : <ImagePlus size={13} />} {value ? 'Cambiar' : 'Subir'}
                </label>
                <input id={id} type="file" accept="image/png,image/jpeg,image/webp" className="visually-hidden" onChange={(e) => pick(e.target.files?.[0])} />
                {value && (
                    <button type="button" className="ann-btn ann-btn-ghost ann-btn-sm" onClick={() => onChange('')} aria-label={`Quitar ${label.toLowerCase()}`}>
                        <X size={13} />
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * Campos de las categorías que no son culto. Se arman con el catálogo del motor (GET /flyers/options),
 * así la web y el bot piden exactamente lo mismo.
 */
export default function EventFields({ spec, style, fields, assumptions, options, onChange, onConfirm, onRandomBackground, onError }) {
    const assumed = Object.fromEntries(assumptions.map((a) => [a.field, a]));
    const required = new Set(spec.required);

    const renderField = (f) => {
        const id = `ann-f-${f.key}`;
        if (f.type === 'lines') return <LinesField key={f.key} id={id} label={f.label} value={fields[f.key]} placeholder={f.placeholder} onCommit={(list) => onChange(f.key, list)} />;
        if (f.type === 'photo')
            return <PhotoField key={f.key} id={id} label={f.label} value={fields[f.key]} isLogo={f.key === 'eventLogo'} onChange={(v) => onChange(f.key, v)} onError={onError} />;
        const common = { id, value: fields[f.key] ?? '', onChange: (e) => onChange(f.key, e.target.value), 'aria-describedby': assumed[f.key] ? `ann-a-${f.key}` : undefined };
        return (
            <div key={f.key} className="ann-field" data-required={required.has(f.key) ? 'true' : undefined} data-assumed={assumed[f.key] ? 'true' : undefined}>
                <label htmlFor={id}>{f.label}</label>
                {f.type === 'select' ? (
                    <select {...common}>
                        <option value="">Elige…</option>
                        {f.options.map((o) => (
                            <option key={o} value={o}>
                                {o.charAt(0) + o.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                ) : f.type === 'textarea' ? (
                    <textarea {...common} maxLength={400} placeholder={f.placeholder} />
                ) : (
                    <input {...common} type="text" maxLength={160} placeholder={f.placeholder} />
                )}
                {f.key === 'sermonTitleScript' && (fields.bibleVerse || fields.sermonTitleMain) && (
                    <div className="ann-chips" aria-label="Sugerencias de palabra para resaltar">
                        {(fields.bibleVerse || fields.sermonTitleMain)
                            .replace(/[.,;!?()"'«»“”]/g, '')
                            .split(/\s+/)
                            .filter((w) => w.length >= 3)
                            .slice(0, 16)
                            .map((w) => {
                                const active = (fields.sermonTitleScript ?? '').toLowerCase() === w.toLowerCase();
                                return (
                                    <button
                                        key={w}
                                        type="button"
                                        className={`ann-chip ${active ? 'ann-chip-active' : ''}`}
                                        onClick={() => onChange('sermonTitleScript', active ? '' : w)}
                                        title={active ? 'Quitar palabra resaltada' : `Destacar "${w}" en letra cursiva`}
                                    >
                                        {w}
                                    </button>
                                );
                            })}
                    </div>
                )}
                {assumed[f.key] && (
                    <div className="ann-assumption" id={`ann-a-${f.key}`}>
                        <span>Revisa: {assumed[f.key].reason}</span>
                        <button type="button" onClick={() => onConfirm(f.key)}>
                            <Check size={12} /> Es correcto
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="ann-section">
                <div className="ann-section-title">{spec.label}</div>
                {spec.fields.map(renderField)}
            </div>
            {options.fontPairs?.length > 0 && (
                <div className="ann-section">
                    <div className="ann-section-title">Tipografía</div>
                    <div className="ann-field">
                        <label htmlFor="ann-f-fontPairId">Estilo de letra</label>
                        <select
                            id="ann-f-fontPairId"
                            value={fields.fontPairId ?? 'clasico'}
                            onChange={(e) => onChange('fontPairId', e.target.value)}
                        >
                            {options.fontPairs.map((fp) => (
                                <option key={fp.id} value={fp.id}>
                                    {fp.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            {style?.photoBackground && (
                <div className="ann-section">
                    <div className="ann-section-title">Fondo</div>
                    <div className="ann-row" style={{ alignItems: 'end' }}>
                        <div className="ann-field">
                            <label htmlFor="ann-f-backgroundId">Foto de fondo</label>
                            <select id="ann-f-backgroundId" value={fields.backgroundId ?? ''} onChange={(e) => onChange('backgroundId', e.target.value)}>
                                <option value="">Sin foto (solo color)</option>
                                {options.backgrounds.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="button" className="ann-btn" onClick={onRandomBackground} disabled={!options.backgrounds.length}>
                            <Shuffle size={14} /> Otra foto
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
