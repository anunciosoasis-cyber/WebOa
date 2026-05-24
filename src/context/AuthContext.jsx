import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext({});

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // Sincronizar estado si otra pestaña cierra sesión
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue) {
        setUser(null);
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
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /** Cerrar sesión — limpia localStorage y estado local */
  const signOut = async () => {
    await apiClient.post('/logout').catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const adminRoles     = ['admin', 'editor'];
  const canAccessAdmin = user && adminRoles.includes(user.role);

  const value = {
    signIn,
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


