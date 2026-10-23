import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ redirectPath = '/login', adminOnly = true }) => {
    const { user, loading } = useAuth();

    // Fallback síncrono: si el estado React aún no se actualizó (race condition
    // entre setUser() y navigate()), leer directo de localStorage.
    const effectiveUser = user ?? (() => {
        try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
    })();

    if (loading) {
        return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
    }

    if (!effectiveUser) {
        return <Navigate to={redirectPath} replace />;
    }

    // Roles del equipo que entran al panel (matriz en backend/docs/ROLES_Y_SESIONES.md)
    const adminRoles = ['admin', 'pastor', 'editor', 'operator'];
    if (adminOnly && !adminRoles.includes(effectiveUser.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
