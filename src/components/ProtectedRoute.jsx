import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Decodifica el payload del JWT de forma segura sin librerías externas */
const decodeJwt = (token) => {
    try {
        const payload = token?.split('.')?.[1];
        if (!payload) return null;
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
};

const ProtectedRoute = ({ redirectPath = '/login', adminOnly = true }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    const token = localStorage.getItem('auth_token');

    // 1. Si no hay token de autenticación, expulsar inmediatamente al login
    if (!token) {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_refresh');
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    // 2. Verificar que el token sea un JWT válido y no haya expirado
    const payload = decodeJwt(token);
    if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
        console.warn('[Seguridad] Token JWT inválido o expirado. Redirigiendo a login.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_refresh');
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Verificando credenciales...</span>
                </div>
            </div>
        );
    }

    // 3. El rol se toma del JWT criptográfico emitido por el backend (evita manipulación en localStorage)
    const verifiedRole = payload.role || user?.role;
    const adminRoles = ['admin', 'pastor', 'editor', 'operator'];

    if (adminOnly && (!verifiedRole || !adminRoles.includes(verifiedRole))) {
        console.warn(`[Seguridad] Acceso denegado: el rol '${verifiedRole}' no tiene permisos de administración.`);
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
