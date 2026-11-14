import apiClient from '../../../api/client';

/** Llamadas del módulo de anuncios (NestJS → motor de flyers, el mismo del bot de Telegram). */
export const announcementsApi = {
    options: () => apiClient.get('/flyers/options').then((r) => r.data),
    /** Asistente en código: mensaje + borrador → { fields, changed, missing, assumptions, reply } */
    assist: (message, fields) => apiClient.post('/flyers/assist', { message, fields }, { timeout: 15000 }).then((r) => r.data),
    preview: (payload) => apiClient.post('/flyers/preview', { payload }, { timeout: 60000 }).then((r) => r.data),
    publish: (payload, date) => apiClient.post('/flyers', { payload, date: date || undefined }, { timeout: 90000 }).then((r) => r.data),
    /** Edita un anuncio del motor: lo vuelve a dibujar y reemplaza imagen y datos */
    update: (id, payload, date) => apiClient.put(`/flyers/${id}`, { payload, date: date || undefined }, { timeout: 90000 }).then((r) => r.data),
    /** Anuncios vigentes de la iglesia (los mismos que muestra la web) */
    list: () => apiClient.get('/announcements').then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),
    remove: (id) => apiClient.delete(`/announcements/${id}`).then((r) => r.data),
};

export const errorText = (e) => {
    const m = e.response?.data?.message;
    return Array.isArray(m) ? m.join(' · ') : m || e.message || 'Error inesperado';
};
