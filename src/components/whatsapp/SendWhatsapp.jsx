import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useToast } from '../../react-ui/components/Toast';

const ACCENT = '#F59E0B';
const errorText = (e) => {
    const m = e.response?.data?.message;
    return Array.isArray(m) ? m.join(' · ') : m || e.message || 'Error inesperado';
};

/** Enviar (o programar) un anuncio publicado por WhatsApp a grupos y/o números. */
export default function SendWhatsapp({ announcementId, caption, isDark, onDone }) {
    const { showToast } = useToast();
    const [groups, setGroups] = useState(null);
    const [picked, setPicked] = useState([]);
    const [numbers, setNumbers] = useState('');
    const [text, setText] = useState(caption || '');
    const [when, setWhen] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        apiClient.get('/whatsapp/groups').then(({ data }) => setGroups(data.data)).catch(() => setGroups([]));
    }, []);

    const to = [...picked, ...numbers.split(/[\s,;]+/).map((n) => n.replace(/\D/g, '')).filter(Boolean)];
    const send = async () => {
        setBusy(true);
        try {
            const { data } = await apiClient.post(`/whatsapp/announcements/${announcementId}`, {
                to,
                caption: text,
                scheduledAt: when ? new Date(when).toISOString() : undefined,
            });
            showToast(when ? `Programado: ${data.data.length} envío(s)` : `En cola: ${data.data.length} envío(s)`, 'success');
            onDone?.();
        } catch (e) {
            showToast(errorText(e), 'error');
        } finally {
            setBusy(false);
        }
    };

    const color = isDark ? '#fff' : '#120C1F';
    const field = { width: '100%', padding: '10px 12px', borderRadius: 12, border: `1px solid ${isDark ? '#ffffff22' : '#00000018'}`, background: isDark ? '#1B122E' : '#fff', color, fontSize: 14 };
    const label = { fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 4, display: 'block' };
    return (
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 10, padding: 16, borderRadius: 16, border: `1px solid ${ACCENT}55`, color }}>
            <b style={{ fontSize: 13 }}>Enviar por WhatsApp</b>
            <div>
                <span style={label}>Grupos</span>
                {groups === null ? <div style={{ fontSize: 12, opacity: 0.6 }}>Cargando grupos…</div>
                    : !groups.length ? <div style={{ fontSize: 12, opacity: 0.6 }}>Sin grupos (¿WhatsApp conectado en Ajustes?).</div>
                    : (
                        <div style={{ maxHeight: 140, overflowY: 'auto', fontSize: 13 }}>
                            {groups.map((g) => (
                                <label key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input type="checkbox" checked={picked.includes(g.id)} onChange={(e) => setPicked((p) => (e.target.checked ? [...p, g.id] : p.filter((x) => x !== g.id)))} />
                                    {g.name}
                                </label>
                            ))}
                        </div>
                    )}
            </div>
            <div><label style={label}>Números (con indicativo, separados por coma)</label><input style={field} value={numbers} onChange={(e) => setNumbers(e.target.value)} placeholder="573001234567, 573109876543" /></div>
            <div><label style={label}>Texto</label><textarea style={{ ...field, minHeight: 80 }} value={text} onChange={(e) => setText(e.target.value)} maxLength={1024} /></div>
            <div><label style={label}>Programar (vacío = ahora)</label><input type="datetime-local" style={field} value={when} onChange={(e) => setWhen(e.target.value)} /></div>
            <button className="btn rounded-pill fw-bold text-dark" style={{ background: ACCENT }} disabled={busy || !to.length} onClick={send}>
                {busy ? 'Enviando…' : when ? `Programar (${to.length})` : `Enviar (${to.length})`}
            </button>
        </div>
    );
}
