// Compatibilidad: los componentes importan `supabase` de aquí desde la época de Supabase Realtime.
// Ahora es el adaptador de salas sobre el gateway Socket.IO del backend (ver realtime.js).
export { realtime as supabase } from './realtime';
