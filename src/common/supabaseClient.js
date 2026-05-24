import { createClient } from '@supabase/supabase-js';

/**
 * supabaseClient.js
 * ──────────────────────────────────────────────────────────────────
 * Singleton del cliente Supabase. Importar desde aquí en toda la app.
 *
 * Variables de entorno requeridas (Hostinger / .env.local):
 *   VITE_SUPABASE_URL       → Project Settings → API → Project URL
 *   VITE_SUPABASE_ANON_KEY  → Project Settings → API → anon public key
 *
 * La anon key es PÚBLICA — está diseñada para exponerse en el frontend.
 * NUNCA uses la service_role key en el frontend.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Faltan variables de entorno:\n' +
    '  VITE_SUPABASE_URL\n' +
    '  VITE_SUPABASE_ANON_KEY\n' +
    'Agrégalas en .env.local (local) y en Hostinger → Advanced → ENV Variables (producción).',
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,      // Guarda la sesión en localStorage automáticamente
    autoRefreshToken: true,    // Renueva el JWT antes de que expire (cada ~55 min)
    detectSessionInUrl: true,  // Necesario para el flujo de magic links / OAuth
  },
});
