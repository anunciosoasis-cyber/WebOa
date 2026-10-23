import React, { useEffect, useRef, useState } from 'react';
import { Check, Shuffle } from 'lucide-react';
import EventFields from './EventFields';

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

/**
 * Datos del anuncio, editables en el lugar. Lo que el asistente dedujo aparece marcado
 * y bloquea la publicación hasta confirmarlo o corregirlo.
 */
export default function FieldsPanel({ fields, assumptions, options, publishDate, onChange, onConfirm, onPublishDate, onRandomBackground, onError }) {
    const assumed = Object.fromEntries(assumptions.map((a) => [a.field, a]));
    const kind = fields.kind ?? 'culto';
    const publication = (
        <div className="ann-section">
            <div className="ann-section-title">Publicación</div>
            <div className="ann-field">
                <label htmlFor="ann-f-until">Mostrar en la web hasta</label>
                <input id="ann-f-until" type="date" value={publishDate} onChange={(e) => onPublishDate(e.target.value)} />
            </div>
        </div>
    );

    // Otras categorías: formulario armado con el catálogo del motor
    if (kind !== 'culto') {
        const spec = options.kinds?.find((k) => k.id === kind);
        const style = spec?.styles.find((st) => st.id === fields.styleId) ?? spec?.styles[0];
        return (
            <section className="ann-panel ann-fields ann-sticky" aria-label="Datos del anuncio">
                <div className="ann-panel-head">
                    <h3>Datos del anuncio</h3>
                </div>
                {spec && (
                    <EventFields
                        spec={spec}
                        style={style}
                        fields={fields}
                        assumptions={assumptions}
                        options={options}
                        onChange={onChange}
                        onConfirm={onConfirm}
                        onRandomBackground={onRandomBackground}
                        onError={onError}
                    />
                )}
                {publication}
            </section>
        );
    }

    const field = (key, label, { required, placeholder, type = 'text', maxLength = 120 } = {}) => (
        <div className="ann-field" data-required={required ? 'true' : undefined} data-assumed={assumed[key] ? 'true' : undefined}>
            <label htmlFor={`ann-f-${key}`}>{label}</label>
            <input
                id={`ann-f-${key}`}
                type={type}
                value={fields[key] ?? ''}
                placeholder={placeholder}
                maxLength={maxLength}
                onChange={(e) => onChange(key, e.target.value)}
                aria-describedby={assumed[key] ? `ann-a-${key}` : undefined}
            />
            {assumed[key] && (
                <div className="ann-assumption" id={`ann-a-${key}`}>
                    <span>Revisa: {assumed[key].reason}</span>
                    <button type="button" onClick={() => onConfirm(key)}>
                        <Check size={12} /> Es correcto
                    </button>
                </div>
            )}
        </div>
    );

    const select = (key, label, items, { empty } = {}) => (
        <div className="ann-field">
            <label htmlFor={`ann-f-${key}`}>{label}</label>
            <select id={`ann-f-${key}`} value={fields[key] ?? ''} onChange={(e) => onChange(key, e.target.value)}>
                {empty && <option value="">{empty}</option>}
                {items.map((o) => (
                    <option key={o.id} value={o.id}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const changeTemplate = (id) => {
        onChange('templateId', id);
        onChange('serviceType', options.templates.find((t) => t.id === id)?.serviceType ?? '');
    };

    return (
        <section className="ann-panel ann-fields ann-sticky" aria-label="Datos del anuncio">
            <div className="ann-panel-head">
                <h3>Datos del anuncio</h3>
            </div>

            <div className="ann-section">
                <div className="ann-section-title">Culto</div>
                <div className="ann-field">
                    <label htmlFor="ann-f-templateId">Plantilla</label>
                    <select id="ann-f-templateId" value={fields.templateId ?? ''} onChange={(e) => changeTemplate(e.target.value)}>
                        {options.templates.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>
                {field('serviceType', 'Tipo de culto', { placeholder: options.templates.find((t) => t.id === fields.templateId)?.serviceType })}
            </div>

            <div className="ann-section">
                <div className="ann-section-title">Mensaje</div>
                {field('sermonTitleMain', 'Título', { required: true, placeholder: 'Esperanza que transforma' })}
                <div className="ann-field" data-assumed={assumed['sermonTitleScript'] ? 'true' : undefined}>
                    <label htmlFor="ann-f-sermonTitleScript">Palabra especial / Cursiva</label>
                    <input
                        id="ann-f-sermonTitleScript"
                        type="text"
                        value={fields.sermonTitleScript ?? ''}
                        placeholder="Ej: palabra del título para destacar en cursiva"
                        maxLength={60}
                        onChange={(e) => onChange('sermonTitleScript', e.target.value)}
                        aria-describedby={assumed['sermonTitleScript'] ? 'ann-a-sermonTitleScript' : undefined}
                    />
                    {fields.sermonTitleMain && (
                        <div className="ann-chips" aria-label="Sugerencias de palabra especial">
                            {fields.sermonTitleMain
                                .replace(/[.,;!?()"'«»“”]/g, '')
                                .split(/\s+/)
                                .filter((w) => w.length >= 3)
                                .map((w) => {
                                    const active = fields.sermonTitleScript?.toLowerCase() === w.toLowerCase();
                                    return (
                                        <button
                                            key={w}
                                            type="button"
                                            className={`ann-chip ${active ? 'ann-chip-active' : ''}`}
                                            onClick={() => onChange('sermonTitleScript', active ? '' : w)}
                                            title={active ? 'Quitar palabra especial' : `Usar "${w}" como palabra especial`}
                                        >
                                            {w}
                                        </button>
                                    );
                                })}
                        </div>
                    )}
                    {assumed['sermonTitleScript'] && (
                        <div className="ann-assumption" id="ann-a-sermonTitleScript">
                            <span>Revisa: {assumed['sermonTitleScript'].reason}</span>
                            <button type="button" onClick={() => onConfirm('sermonTitleScript')}>
                                <Check size={12} /> Es correcto
                            </button>
                        </div>
                    )}
                </div>
                {field('preacherName', 'Predica', { placeholder: 'Pr. Juan Pérez', maxLength: 60 })}
            </div>

            <div className="ann-section">
                <div className="ann-section-title">Fecha y hora</div>
                <div className="ann-row">
                    {field('dateText', 'Fecha', { required: true, placeholder: '2026 | 24 OCTUBRE' })}
                    {field('timeText', 'Hora', { required: true, placeholder: 'DESDE 10:00 AM' })}
                </div>
            </div>

            <div className="ann-section">
                <div className="ann-section-title">Texto bíblico</div>
                <div className="ann-field">
                    <label htmlFor="ann-f-bibleVerse">Versículo (tal como debe aparecer)</label>
                    <textarea id="ann-f-bibleVerse" value={fields.bibleVerse ?? ''} maxLength={400} onChange={(e) => onChange('bibleVerse', e.target.value)} />
                </div>
                {field('bibleReference', 'Cita', { placeholder: 'Juan 3:16', maxLength: 40 })}
            </div>

            <div className="ann-section">
                <div className="ann-section-title">Anuncios extra</div>
                <LinesField
                    id="ann-f-extra"
                    label="Uno por línea"
                    value={fields.extraAnnouncements}
                    placeholder={'Escuela Sabática 9:00 AM\nConquistadores 3:00 PM'}
                    onCommit={(list) => onChange('extraAnnouncements', list)}
                />
            </div>

            <div className="ann-section">
                <div className="ann-section-title">Diseño</div>
                <div className="ann-row">
                    {select('gradientId', 'Color', options.gradients)}
                    {select('fontPairId', 'Tipografía', options.fontPairs)}
                </div>
                <div className="ann-row" style={{ alignItems: 'end' }}>
                    {select('backgroundId', 'Foto de fondo', options.backgrounds, { empty: 'Sin foto (solo color)' })}
                    <button type="button" className="ann-btn" onClick={onRandomBackground} disabled={!options.backgrounds.length}>
                        <Shuffle size={14} /> Otra foto
                    </button>
                </div>
            </div>

            {publication}
        </section>
    );
}
