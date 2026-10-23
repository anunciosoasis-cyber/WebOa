/**
 * Tiempo real de las salas (Estudio Oasis ↔ OBS ↔ proyector ↔ app) sobre el gateway Socket.IO del backend.
 * Imita la API de canales de Supabase Realtime que ya usaban los componentes:
 *   const ch = realtime.channel(`oasis_live_${key}`);
 *   ch.on('broadcast', { event }, ({ payload }) => …).subscribe((status) => …);
 *   ch.send({ type: 'broadcast', event, payload });  realtime.removeChannel(ch);
 * `key` es el token de pantalla de la sala (32 hex). Si hay sesión, el JWT viaja también y da rol de operador.
 * Contrato de eventos: backend/src/live/live-events.ts.
 */
import { io } from 'socket.io-client';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '').replace(/\/$/, '');
const TOPIC = /^oasis_(live|press)_([a-f0-9]{32})$/;

const KIND_BY_PATH = [
    ['/transmision/overlay', 'OBS'],
    ['/transmision/proyector', 'Proyector'],
    ['/countdown-live', 'Cuenta regresiva'],
    ['/remote', 'Control web'],
    ['/admin', 'Estudio'],
];
const kind = () => (KIND_BY_PATH.find(([p]) => window.location.pathname.startsWith(p)) || [null, 'Pantalla'])[1];

/** Un socket por sala (token), compartido por todos los canales de la página. */
const sockets = new Map();
const socketFor = (key) => {
    let entry = sockets.get(key);
    if (!entry) {
        const socket = io(`${API}/live`, {
            // función: se reevalúa en cada reconexión (toma el token de acceso renovado)
            auth: (cb) => cb({ k: key, token: localStorage.getItem('auth_token') || undefined, kind: kind() }),
            transports: ['websocket', 'polling'],
        });
        socket.on('connect_error', (e) => console.warn('[Sala] Conexión rechazada:', e?.message));
        entry = { socket, users: 0, channels: new Map() };
        sockets.set(key, entry);
    }
    return entry;
};
const release = (key) => {
    const entry = sockets.get(key);
    if (entry && --entry.users <= 0) {
        entry.socket.disconnect();
        sockets.delete(key);
    }
};

class LiveChannel {
    constructor(topic) {
        const match = TOPIC.exec(topic);
        // Canales sin sala (p. ej. el antiguo 'obs_public_channel') no transmiten: antes cualquiera podía emitir en ellos
        this.noop = !match;
        this.name = match?.[1];
        this.key = match?.[2];
        this.handlers = new Map();
        this.cleanup = [];
    }

    on(type, filter, handler) {
        if (type === 'broadcast' && filter?.event) {
            const list = this.handlers.get(filter.event) || [];
            list.push(handler);
            this.handlers.set(filter.event, list);
        }
        return this;
    }

    subscribe(callback) {
        if (this.noop) {
            setTimeout(() => callback?.('CHANNEL_ERROR'), 0);
            return this;
        }
        const entry = socketFor(this.key);
        entry.users++;
        entry.channels.set(this.name, (entry.channels.get(this.name) || 0) + 1);
        this.subscribed = true;
        const { socket } = entry;

        const onMessage = (msg) => {
            if (msg?.channel !== this.name) return;
            // ts: hora del servidor (ver live.gateway.ts); en el último estado repetido al entrar es la original
            for (const handler of this.handlers.get(msg.event) || []) handler({ type: 'broadcast', event: msg.event, payload: msg.payload, ts: msg.ts });
        };
        const join = () => socket.emit('join', { channel: this.name }, (ack) => callback?.(ack?.ok ? 'SUBSCRIBED' : 'CHANNEL_ERROR'));
        const onDisconnect = () => callback?.('CLOSED');
        const onError = () => callback?.('CHANNEL_ERROR'); // connect_error: token de sala inválido o sin permiso

        socket.on('broadcast', onMessage);
        socket.on('connect', join); // también al reconectar: vuelve a unirse y recibe el último estado
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onError);
        if (socket.connected) join();
        this.cleanup.push(() => {
            socket.off('broadcast', onMessage);
            socket.off('connect', join);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onError);
        });
        return this;
    }

    /** Devuelve 'ok' | 'error' como Supabase. */
    send({ event, payload }) {
        if (this.noop) return Promise.resolve('ok');
        const { socket } = socketFor(this.key);
        return new Promise((resolve) => {
            socket.timeout(5000).emit('broadcast', { channel: this.name, event, payload }, (err, ack) => {
                if (err || !ack?.ok) console.warn('[Sala] Evento no enviado:', event, err?.message || ack?.error);
                resolve(err || !ack?.ok ? 'error' : 'ok');
            });
        });
    }

    unsubscribe() {
        this.cleanup.forEach((fn) => fn());
        this.cleanup = [];
        this.handlers.clear();
        if (this.subscribed) {
            const entry = sockets.get(this.key);
            const left = (entry?.channels.get(this.name) || 1) - 1;
            entry?.channels.set(this.name, left);
            // Otro componente de la página puede seguir escuchando este canal en el mismo socket
            if (entry && left === 0) entry.socket.emit('leave', { channel: this.name });
            release(this.key);
            this.subscribed = false;
        }
        return Promise.resolve('ok');
    }
}

export const realtime = {
    channel: (topic) => new LiveChannel(topic),
    removeChannel: (channel) => channel?.unsubscribe?.() ?? Promise.resolve('ok'),
};
