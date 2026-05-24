import { supabase } from '../common/supabaseClient.js';

/* ==========================================================
   MODULO 1: REGISTRO Y CAPTURA DE DATOS
   ========================================================== */
export const registerUser = async (email, password, nombre, phone) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Estos campos van a raw_user_meta_data y el trigger los copia a public.perfiles
        nombre: nombre,
        phone_number: phone,
      }
    }
  });
  if (error) throw error;
  return data;
};

/* ==========================================================
   MODULO 2: ACCESO Y VALIDACIÓN (LOGIN)
   ========================================================== */
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

/* ==========================================================
   MODULO 3: GESTIÓN DE PERFIL Y ESTADO
   ========================================================== */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('perfiles')        // ← tabla creada por el trigger
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

/* ==========================================================
   MODULO 4: CIERRE DE SESIÓN
   ========================================================== */
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.href = '/login';   // ruta de React Router
};

/* ==========================================================
   MODULO 5: ADMINISTRACIÓN DE USUARIOS
   Funciones exclusivas para que el Admin gestione el sistema.
   ========================================================== */

/**
 * updateUserProfile: Cambia el rol o el estado de aprobación en public.perfiles.
 * @param {string} userId - UUID del usuario a modificar.
 * @param {object} updates - Campos a cambiar (ej: { rol: 'admin', activo: true }).
 */
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('perfiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
  return data;
};

/**
 * getAllProfiles: Obtiene la lista completa de usuarios para el panel de gestión.
 */
export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
