import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext({});

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';
const REFRESH_KEY = 'auth_refresh';

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token) => {
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

const getUserFromStorage = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    localStorage.removeItem(USER_KEY);
    return null;
  }

  const payload = decodeJwtPayload(token);
  // Si el token es corrupto o ya expiró, limpiar sesión completamente
  if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_KEY);
    return null;
  }

  const storedUser = parseStoredUser();
  if (storedUser && typeof storedUser === 'object') {
    return { ...storedUser, role: payload.role || storedUser.role };
  }

  // Fallback generado del payload JWT verificado
  return {
    id: payload.sub,
    username: payload.username || '',
    role: payload.role || '',
    email: payload.email || '',
    name: payload.name || payload.username || 'Usuario',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUserFromStorage());
  // La sesión se lee de localStorage de forma síncrona en el useState de arriba,
  // así que no hay fase de carga inicial (evita el spinner a pantalla completa en "/").
  const [loading, setLoading] = useState(false);

  // Sincronizar sesión entre pestañas para login/logout.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        setUser(getUserFromStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** Login — llama al backend NestJS POST /api/login */
  const signIn = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/login', {
        username: email,   // el backend acepta email o username en el campo "username"
        password,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /** Login con Google: el idToken lo entrega el botón de Google Identity Services */
  const signInWithGoogle = async (idToken) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/google', { idToken });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /** Registro público en la iglesia activa */
  const signUp = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/register', {
        username: name || email.split('@')[0],
        email,
        password,
      });
      return data;
    } finally {
      setLoading(false);
    }
  };

  /** Cerrar sesión — limpia almacenamiento local de inmediato y expulsa al login */
  const signOut = async () => {
    const rf = localStorage.getItem(REFRESH_KEY);
    // 1. Limpieza inmediata y total de tokens y sesión en el navegador
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.clear();
    setUser(null);

    // 2. Notificar al backend en segundo plano sin retrasar la interfaz
    if (rf) {
      apiClient.post('/logout', { refreshToken: rf }).catch(() => {});
    }

    // 3. Redirección forzada inmediata para limpiar el árbol de rutas
    window.location.replace('/login');
  };

  /** Solicitar recuperación de contraseña por email */
  const requestPasswordReset = async (email) => {
    try {
      const { data } = await apiClient.post('/auth/forgot-password', { email });
      return data;
    } catch {
      return {
        success: true,
        message: 'Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.',
      };
    }
  };

  const adminRoles     = ['admin', 'pastor', 'editor', 'operator'];
  const canAccessAdmin = user && adminRoles.includes(user.role);

  const value = {
    signIn,
    signUp,
    signInWithGoogle,
    requestPasswordReset,
    signOut,
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isEditor: user?.role === 'editor',
    role: user?.role ?? '',
    canAccessAdmin,
    // Compatibilidad: algunos componentes pueden usar session
    session: user ? { user } : null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
