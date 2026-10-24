/**
 * Canales de producción en vivo (Studio Oasis ↔ OBS, proyector, control remoto y app).
 *
 * Cada iglesia tiene salas (backend /rooms). La "clave" de un canal es el token de pantalla de la sala (32 hex):
 * las pantallas públicas (OBS, proyector) la reciben en la URL como ?k=; el Estudio la obtiene de /rooms/current.
 * El transporte es el gateway Socket.IO del backend (api/realtime.js); si hay sesión, viaja también el JWT.
 * shortcut: quien tenga la URL con ?k= puede controlar la sala (igual que antes); si se filtra, rotar el token
 * desde el Estudio (POST /rooms/:id/display-token).
 */
import { useEffect, useState } from 'react';
import apiClient from './client';
import { realtime } from './realtime';

const isValidKey = (k) => typeof k === 'string' && /^[a-f0-9]{32}$/.test(k);
// getRandomValues también funciona fuera de HTTPS (p. ej. el PC del estudio por IP de la red local)
const newKey = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');

// Copia local de la clave: las pantallas se pueden abrir al instante y el estudio sigue funcionando
// aunque el backend no responda.
const LOCAL_KEY = 'oasis_live_key';
const readLocal = () => { try { const k = localStorage.getItem(LOCAL_KEY); return isValidKey(k) ? k : null; } catch { return null; } };
const writeLocal = (k) => { try { localStorage.setItem(LOCAL_KEY, k); } catch { /* modo privado: solo en memoria */ } };
let memoryKey = null;
export const localLiveKey = () => {
    const k = readLocal() || memoryKey || newKey();
    memoryKey = k;
    writeLocal(k);
    return k;
};

let keyPromise = null;
/** Sala principal de la iglesia (id, nombre, displayToken). Requiere sesión del equipo. */
export const loadCurrentRoom = () => apiClient.get('/rooms/current').then(({ data }) => data);

/**
 * Clave compartida entre los equipos del estudio: el token de la sala principal.
 * Nunca falla: si el backend no responde se queda con la última clave conocida en este equipo.
 */
export const loadLiveKey = () => (keyPromise ??= (async () => {
    const local = localLiveKey();
    try {
        const room = await loadCurrentRoom();
        if (isValidKey(room?.displayToken)) {
            writeLocal(room.displayToken);
            memoryKey = room.displayToken;
            return room.displayToken;
        }
    } catch (e) {
        console.warn('No se pudo obtener la sala del estudio; se usa la última clave de este equipo.', e?.message || e);
    }
    return local;
})());

/** Hook para las pantallas del estudio: devuelve la clave local al instante y la de Ajustes cuando llega. */
export const useLiveKey = () => {
    const [key, setKey] = useState(localLiveKey);
    useEffect(() => {
        let alive = true;
        loadLiveKey().then(k => { if (alive) setKey(k); });
        return () => { alive = false; };
    }, []);
    return key;
};

/**
 * Clave para las pantallas públicas (OBS, proyector, control remoto): llega en la URL como ?k=.
 * Si falta, se usa la de este navegador cuando aquí se abrió Studio (p. ej. el proyector del mismo PC).
 */
export const liveKeyFromUrl = () => {
    const k = new URLSearchParams(window.location.search).get('k');
    return isValidKey(k) ? k : readLocal();
};

/** Pantalla abierta sin clave: canal aleatorio aislado (nadie puede emitirle; sigue funcionando por localStorage en el mismo PC). */
export const privateFallbackKey = newKey;

/** URL de una pantalla pública con la clave incluida. */
export const liveUrl = (path, key) => (key ? `${path}?k=${key}` : path);

// Canal "live" (overlays, himnario, Biblia, cronómetro) y canal "press" (presentaciones) de la sala.
export const overlayChannel = (key) => realtime.channel(`oasis_live_${key}`);
export const pressChannel = (key) => realtime.channel(`oasis_press_${key}`);

// Supabase limita el tamaño de cada mensaje; las imágenes locales grandes (data:) o los vídeos (blob:) no viajan.
const MAX_INLINE_IMAGE = 3_000_000;
export const shareableUrl = (url) => {
    if (typeof url !== 'string') return null;
    if (/^https?:\/\//.test(url)) return url;
    if (url.startsWith('data:image/') && url.length <= MAX_INLINE_IMAGE) return url;
    if (/^(#|rgb|hsl|linear-gradient|radial-gradient)/i.test(url)) return url;
    return null;
};

const OVERLAY_MODES = new Set(['hidden', 'bible', 'himno', 'preacher', 'anuncio', 'announcement', 'countdown', 'live_status', 'slide', 'blank', 'presentation']);
const MAX_TEXT = 4000;
const MEDIA_FIELDS = ['imageUrl', 'customBg', 'bgImage', 'background'];

/**
 * Filtra un mensaje recibido antes de pintarlo en pantalla (defensa en profundidad además de la clave):
 * modo conocido, textos acotados e imágenes solo http(s), data:image o colores/gradientes CSS.
 */
export const sanitizeOverlay = (payload) => {
    if (!payload || typeof payload !== 'object') return null;
    const mode = payload.mode || payload.type;
    if (!OVERLAY_MODES.has(mode)) return null;
    const clean = { mode, type: mode };
    for (const [k, v] of Object.entries(payload)) {
        if (typeof v === 'string') clean[k] = MEDIA_FIELDS.includes(k) ? v : v.slice(0, MAX_TEXT);
        else if (typeof v === 'number' || typeof v === 'boolean' || v === null) clean[k] = v;
        else if (Array.isArray(v) || typeof v === 'object') clean[k] = v;
    }
    const safeMedia = (v) => {
        if (v == null) return null;
        const str = String(v).trim();
        if (/^(https?:\/\/|data:(image|video)\/|blob:|#|rgb|hsl|linear-gradient|radial-gradient)/i.test(str)) return str;
        return null;
    };
    for (const field of MEDIA_FIELDS) {
        if (field in clean) clean[field] = safeMedia(clean[field]);
    }
    if (clean.slide && typeof clean.slide === 'object') {
        clean.slide = {
            ...clean.slide,
            fileUrl: safeMedia(clean.slide.fileUrl),
            mediaUrl: safeMedia(clean.slide.mediaUrl),
            background: safeMedia(clean.slide.background),
            bgImage: safeMedia(clean.slide.bgImage),
            thumbnailUrl: safeMedia(clean.slide.thumbnailUrl),
        };
    }
    return clean;
};
