import { useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'oasis.flyerDraft.v1';
const MAX_UNDO = 20;

export const REQUIRED_FIELDS = ['sermonTitleMain', 'dateText', 'timeText'];

const INITIAL = {
    fields: { templateId: 'adoracion', aspectRatio: '4:5', gradientId: 'tema', fontPairId: 'clasico' },
    /** Datos que el asistente dedujo y el usuario debe confirmar: [{ field, value, reason }] */
    assumptions: [],
    messages: [],
    undo: [],
    publishDate: '',
};

const clean = (fields) => Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)));
const snapshot = (s) => [...s.undo, { fields: s.fields, assumptions: s.assumptions }].slice(-MAX_UNDO);

function reducer(state, action) {
    switch (action.type) {
        case 'setField': {
            const fields = clean({ ...state.fields, [action.field]: action.value });
            // Editar un dato a mano es confirmarlo
            return { ...state, fields, assumptions: state.assumptions.filter((a) => a.field !== action.field) };
        }
        case 'userMessage':
            return { ...state, messages: [...state.messages, { id: action.id, role: 'user', text: action.text }] };
        case 'assist': {
            const { result } = action;
            const assumptions = [...state.assumptions.filter((a) => !result.changed.includes(a.field)), ...result.assumptions];
            return {
                ...state,
                undo: result.changed.length ? snapshot(state) : state.undo,
                fields: clean(result.fields),
                assumptions,
                messages: [...state.messages, { id: action.id, role: 'assistant', text: result.reply, changed: result.changed }],
            };
        }
        case 'assistError':
            return { ...state, messages: [...state.messages, { id: action.id, role: 'assistant', text: action.text, error: true }] };
        case 'confirm':
            return { ...state, assumptions: state.assumptions.filter((a) => a.field !== action.field) };
        case 'undo': {
            const prev = state.undo.at(-1);
            if (!prev) return state;
            return { ...state, ...prev, undo: state.undo.slice(0, -1) };
        }
        case 'publishDate':
            return { ...state, publishDate: action.value };
        case 'reset':
            return { ...INITIAL, fields: { ...INITIAL.fields, ...action.keep } };
        default:
            return state;
    }
}

function load() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL;
    } catch {
        return INITIAL;
    }
}

/** Payload para el motor: completa el tipo de culto con el de la plantilla y quita vacíos. */
export function toPayload(fields, templates = []) {
    if ((fields.kind ?? 'culto') !== 'culto') return clean(fields);
    const serviceType = fields.serviceType?.trim() || templates.find((t) => t.id === fields.templateId)?.serviceType;
    return clean({ ...fields, serviceType });
}

/** Obligatorios de la categoría (los dice el motor en /flyers/options; culto: los de siempre). */
export function requiredFor(fields, kinds = []) {
    const kind = fields.kind ?? 'culto';
    return kind === 'culto' ? REQUIRED_FIELDS : (kinds.find((k) => k.id === kind)?.required ?? []);
}

// Las fotos (base64) no van a sessionStorage: con el historial de deshacer superarían su cupo de ~5 MB.
// shortcut: al recargar la pestaña se pierden las fotos del borrador; si molesta, guardarlas en IndexedDB.
const withoutPhotos = ({ photo, eventLogo, ...rest }) => rest;

/**
 * Borrador del anuncio (mismos campos que el bot de Telegram), con deshacer y guardado en la pestaña.
 * El estado vive en un reducer para que dos mensajes seguidos no se pisen.
 */
export default function useFlyerDraft(kinds) {
    const [state, dispatch] = useReducer(reducer, undefined, load);

    useEffect(() => {
        try {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ ...state, fields: withoutPhotos(state.fields), undo: state.undo.map((u) => ({ ...u, fields: withoutPhotos(u.fields) })) }),
            );
        } catch {
            /* sin almacenamiento (modo privado): el borrador vive solo en memoria */
        }
    }, [state]);

    const missing = useMemo(() => requiredFor(state.fields, kinds).filter((k) => !state.fields[k]), [state.fields, kinds]);
    return { ...state, missing, dispatch };
}
