import axios from 'axios';

// En desarrollo usamos el localhost de NestJS.
// En producción configurar VITE_API_URL en Hostinger con la URL de Render.
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

// Inyecta el JWT del backend (guardado en localStorage) en cada request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Si el backend devuelve 401, limpiar sesión y redirigir al login
// Excepto si el error viene del propio endpoint /login (credenciales incorrectas)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginEndpoint = error.config?.url?.includes('/login');
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        if (error.response?.status === 401 && !isLoginEndpoint) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            if (isAdminRoute) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
