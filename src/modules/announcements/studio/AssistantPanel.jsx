import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowUp, Loader2, RotateCcw, Sparkles, Undo2 } from 'lucide-react';

const EXAMPLES = [
    'Culto de adoración el sábado a las 10 am, tema: Esperanza que transforma, predica el Pr. Juan Pérez',
    'Boda de Ana y Luis el 12 de diciembre a las 4 pm en el templo central',
    'Campaña evangelística, tema: Esperanza para hoy, del 1 al 7 de noviembre a las 7 pm, pastor invitado: Carlos Ruiz',
    'Se pospone la vigilia de oración para el 31 de octubre a las 9 pm',
];

/**
 * Asistente en código (el mismo del bot de Telegram): el usuario describe el anuncio y el asistente
 * llena los datos. Cada cambio se puede deshacer.
 */
export default function AssistantPanel({
    messages,
    busy,
    canUndo,
    onSend,
    onUndo,
    onReset,
    kind,
    kindLabel,
    styles,
    selectedStyleId,
    onSelectStyle,
}) {
    const [text, setText] = useState('');
    const logRef = useRef(null);

    useEffect(() => {
        logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, busy]);

    const send = (value = text) => {
        const message = value.trim();
        if (!message || busy) return;
        onSend(message);
        setText('');
    };

    return (
        <section className="ann-panel ann-assistant" aria-label="Asistente de anuncios">
            <div className="ann-panel-head">
                <h3>Asistente</h3>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button type="button" className="ann-btn ann-btn-ghost ann-btn-sm" onClick={onUndo} disabled={!canUndo} title="Deshacer el último cambio del asistente">
                        <Undo2 size={14} /> Deshacer
                    </button>
                    <button type="button" className="ann-btn ann-btn-ghost ann-btn-sm" onClick={onReset} title="Empezar un anuncio nuevo">
                        <RotateCcw size={14} /> Nuevo
                    </button>
                </div>
            </div>

            {/* Diseños de plantilla ubicados en la columna del asistente para no comprimir el lienzo ni los campos */}
            {styles && styles.length > 0 && (
                <div className="ann-assistant-styles-section">
                    <div className="ann-assistant-styles-head">
                        <span className="ann-assistant-styles-title">
                            {kind === 'culto' ? 'Plantillas de Culto' : `Diseños · ${kindLabel || ''}`}
                        </span>
                        <span className="ann-assistant-styles-badge">{styles.length} opciones</span>
                    </div>
                    <div className="ann-assistant-styles-row" role="radiogroup" aria-label={`Plantillas de ${kindLabel}`}>
                        {styles.map((st) => {
                            const isSelected = st.id === (selectedStyleId ?? styles[0]?.id);
                            const bgGradient = st.bg
                                ? `linear-gradient(180deg, ${st.bg[0]}, ${st.bg[1]})`
                                : st.palette?.background
                                ? `linear-gradient(180deg, ${st.palette.background}, #0b0716)`
                                : 'linear-gradient(180deg, #221538, #0d0718)';

                            return (
                                <button
                                    key={st.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    className={`ann-assistant-style-card ${isSelected ? 'is-selected' : ''}`}
                                    onClick={() => onSelectStyle?.(st.id)}
                                    title={st.label}
                                >
                                    <span className="ann-assistant-style-thumb" style={{ background: bgGradient }}>
                                        {kind !== 'culto' ? (
                                            <img
                                                src={`/templates/${kind}-${st.id}.png`}
                                                alt=""
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span className="ann-assistant-style-culto-icon">
                                                {st.label.replace(/^Culto\s+(de\s+)?/i, '').slice(0, 3).toUpperCase()}
                                            </span>
                                        )}
                                        {isSelected && <span className="ann-assistant-style-check">✓</span>}
                                    </span>
                                    <span className="ann-assistant-style-name">{st.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="ann-log" ref={logRef} aria-live="polite">
                {messages.length === 0 && (
                    <div className="ann-empty">
                        Describe el anuncio como lo dirías en un mensaje: tipo de culto, fecha, hora, tema, quién predica y la cita bíblica.
                        Puedes pedir cambios después, por ejemplo «ponlo en formato historia».
                        <div className="ann-examples">
                            {EXAMPLES.map((ex) => (
                                <button key={ex} type="button" className="ann-example" onClick={() => send(ex)}>
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((m) =>
                    m.role === 'user' ? (
                        <div key={m.id} className="ann-msg ann-msg-user">
                            {m.text}
                        </div>
                    ) : (
                        <div key={m.id} className={`ann-msg ann-msg-assistant${m.error ? ' ann-msg-error' : ''}`}>
                            {m.error ? <AlertCircle size={15} /> : <Sparkles size={15} />}
                            <span>{m.text}</span>
                        </div>
                    ),
                )}
                {busy && (
                    <div className="ann-msg ann-msg-assistant">
                        <Loader2 size={15} className="ann-spin" />
                        <span>Interpretando…</span>
                    </div>
                )}
            </div>

            <form
                className="ann-composer"
                onSubmit={(e) => {
                    e.preventDefault();
                    send();
                }}
            >
                <label htmlFor="ann-assistant-input" className="visually-hidden">
                    Mensaje para el asistente
                </label>
                <textarea
                    id="ann-assistant-input"
                    rows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            send();
                        }
                    }}
                    placeholder="Ej.: sábado 24 de octubre 10 am, tema: La fe, predica el Pr. Luis"
                    maxLength={2000}
                />
                <button type="submit" className="ann-btn ann-btn-primary" disabled={!text.trim() || busy} aria-label="Enviar al asistente">
                    <ArrowUp size={16} />
                </button>
            </form>
            <div className="ann-hint">Enter para enviar · Shift+Enter para nueva línea</div>
        </section>
    );
}
