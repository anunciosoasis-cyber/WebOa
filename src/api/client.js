import axios from 'axios';
import { supabase } from '../common/supabaseClient';

// En desarrollo usamos el localhost de NestJS. 
// En producción, es OBLIGATORIO configurar VITE_API_URL en Hostinger con la URL de Render.
let base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
if (!base.endsWith('/api')) {
    base = base.replace(/\/$/, '') + '/api';
}

const apiClient = axios.create({
    baseURL: base,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

/**
 * Interceptor de REQUEST — inyecta el JWT de Supabase en cada llamada.
 * supabase.auth.getSession() devuelve el token desde memoria (no hace red),
 * y lo renueva automáticamente si está por expirar (autoRefreshToken: true).
 */
apiClient.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

/**
 * Interceptor de RESPONSE — si el backend devuelve 401, la sesión de
 * Supabase probablemente expiró o fue revocada. Forzar sign-out.
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await supabase.auth.signOut();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
