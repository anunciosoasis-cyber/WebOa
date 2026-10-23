import axios from 'axios';

// En desarrollo usamos el localhost de NestJS.
// En producción, VITE_API_URL es configurado por Vite en tiempo de compilación desde .env.production
const PRODUCTION_API = 'http://localhost:3000';
let base = import.meta.env.VITE_API_URL || PRODUCTION_API;
if (!base.endsWith('/api')) {
    base = base.replace(/\/$/, '') + '/api';
}

const apiClient = axios.create({
    baseURL: base,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 15000,
});

/**
 * Resuelve el Tenant ID o Tenant Slug activo:
 * 1. Subdominio (ej: medellin.oasis.com -> medellin)
 * 2. Sesión del usuario o localStorage ('active_tenant_id' o 'tenant_id')
 * 3. Default: 'default'
 */
function resolveCurrentTenant() {
    const storedTenant = localStorage.getItem('active_tenant_id') || localStorage.getItem('tenant_id');
    if (storedTenant && storedTenant !== 'www' && storedTenant !== 'api') return storedTenant;

    const hostname = window.location.hostname;
    // Si es IP o localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        return 'default';
    }

    const parts = hostname.split('.');
    if (parts.length >= 3) {
        const sub = parts[0].toLowerCase();
        // Si el subdominio es www o api, es el dominio principal de la iglesia por defecto
        if (sub !== 'www' && sub !== 'api') {
            return sub; // subdominio real de iglesia (ej: medellin, bogota)
        }
    }

    return 'default';
}

// Inyecta el JWT y el header X-Tenant-ID en cada petición
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantId = resolveCurrentTenant();
    if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
});

const REFRESH_KEY = 'auth_refresh';
let refreshing = null;

/**
 * Canjea el refresh token por un par nuevo. Una sola petición aunque fallen varias a la vez;
 * si otra pestaña ya rotó el token, se usa el que dejó en localStorage.
 */
const refreshSession = () => (refreshing ??= (async () => {
    const sent = localStorage.getItem(REFRESH_KEY);
    if (!sent) throw new Error('sin refresh token');
    try {
        const { data } = await apiClient.post('/auth/refresh', { refreshToken: sent }, { _skipRefresh: true });
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem(REFRESH_KEY, data.refreshToken);
    } catch (e) {
        if (localStorage.getItem(REFRESH_KEY) === sent) throw e; // nadie más lo renovó
    }
})().finally(() => { refreshing = null; }));

// Manejo global de respuestas 401 y 403
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config || {};
        const isAuthEndpoint = /\/(login|register|auth\/refresh|logout)$/.test(config.url || '');
        const isAdminRoute = window.location.pathname.startsWith('/admin');

        // 401: el token de acceso venció → renovar una vez y repetir la petición
        if (error.response?.status === 401 && !isAuthEndpoint && !config._skipRefresh && !config._retried) {
            try {
                await refreshSession();
                config._retried = true;
                config.headers.Authorization = `Bearer ${localStorage.getItem('auth_token')}`;
                return apiClient(config);
            } catch {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem(REFRESH_KEY);
                if (isAdminRoute) {
                    window.location.href = '/login';
                }
            }
        }

        // 403 Forbidden: Módulo no contratado por el Tenant o permisos insuficientes
        if (error.response?.status === 403) {
            const forbiddenMessage = error.response?.data?.message || 'Acceso no permitido';
            console.warn(`[Tenancy RBAC] Acceso restringido para el módulo:`, forbiddenMessage);
            
            // Disparar evento global para que la barra de navegación y el layout puedan actualizarse
            window.dispatchEvent(new CustomEvent('oasis:module_forbidden', {
                detail: {
                    url: error.config?.url,
                    message: forbiddenMessage
                }
            }));
        }

        return Promise.reject(error);
    }
);

export default apiClient;
