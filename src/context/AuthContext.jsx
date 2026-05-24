import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../common/supabaseClient';

const AuthContext = createContext({});

/**
 * buildUser — combina los datos del JWT de Supabase con el perfil
 * guardado en public.perfiles para obtener el rol de la app.
 */
async function buildUser(supaSession) {
  if (!supaSession?.user) return null;
  const u = supaSession.user;

  // Leer rol y estado desde public.perfiles (la tabla que creamos con el trigger)
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, activo, nombre, apellido')
    .eq('id', u.id)
    .maybeSingle();

  return {
    id: u.id,                                                      // UUID de Supabase
    email: u.email,
    name: perfil?.nombre
      ?? u.user_metadata?.nombre
      ?? u.email?.split('@')[0]
      ?? 'Usuario',
    role: perfil?.rol ?? u.user_metadata?.role ?? 'usuario',
    isApproved: perfil?.activo ?? false,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Recuperar sesión que ya existe (recarga de página)
    supabase.auth.getSession().then(async ({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing ? await buildUser(existing) : null);
      setLoading(false);
    });

    // 2. Suscribirse a cambios futuros (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession ? await buildUser(newSession) : null);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  /** Login con email + contraseña de Supabase Auth */
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  /** Cerrar sesión — onAuthStateChange limpia user/session automáticamente */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const adminRoles    = ['admin', 'editor'];
  const canAccessAdmin = user && adminRoles.includes(user.role);

  const value = {
    signIn,
    signOut,
    user,
    session,
    loading,
    isAdmin: user?.role === 'admin',
    isEditor: user?.role === 'editor',
    role: user?.role ?? '',
    canAccessAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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


