import axios from 'axios';

/**
 * API de Biblia e Himnario (AdventistMediaEngine .NET, MEDIA_MODE=online). Datos públicos: sin token.
 * Desarrollo: el motor local escucha en http://localhost:5001 (modo offline también sirve /api/v1).
 * Producción: VITE_MEDIA_API_URL = URL del servicio media-api.
 */
const base = (import.meta.env.VITE_MEDIA_API_URL || 'http://localhost:5001').replace(/\/+$/, '').replace(/\/api\/v1$/, '');

const mediaClient = axios.create({
    baseURL: `${base}/api/v1`,
    headers: { Accept: 'application/json' },
    timeout: 15000,
});

export default mediaClient;
