import axios from 'axios';

// En desarrollo usamos el localhost:8000 donde corre uvicorn.
// En producción, VITE_FASTAPI_URL será la URL del microservicio (ej. Render/Docker).
const FASTAPI_DEFAULT_URL = 'http://localhost:8000/api/v1';
let base = import.meta.env.VITE_FASTAPI_URL || FASTAPI_DEFAULT_URL;
if (!base.includes('/api/v1')) {
    base = base.replace(/\/$/, '') + '/api/v1';
}

const fastapiClient = axios.create({
    baseURL: base,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 15000, // 15 segundos de timeout para operaciones de base de datos o búsquedas indexadas
});

// Interceptor para inyectar el JWT de Supabase/Elesia que el usuario tiene en localStorage
fastapiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

fastapiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("⚠️ Token no autorizado en microservicio FastAPI. Revisa autenticación JWT.");
        }
        return Promise.reject(error);
    }
);

export default fastapiClient;
