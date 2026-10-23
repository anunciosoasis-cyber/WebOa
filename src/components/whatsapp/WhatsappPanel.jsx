import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useToast } from '../../react-ui/components/Toast';

const ACCENT = '#F59E0B';
const STATUS = {
    scheduled: ['Programado', '#60A5FA'], queued: ['En cola', '#A78BFA'], retrying: ['Reintentando', '#F59E0B'],
    sent: ['Enviado', '#10B981'], failed: ['Falló', '#EF4444'], blocked: ['Bloqueado', '#EF4444'], cancelled: ['Cancelado', '#9CA3AF'],
};
const LIVE = { open: 'Conectado', connecting: 'Conectando…', close: 'Desconectado', api_unreachable: 'Sin conexión con Evolution API (revisa URL y API key)', unknown: 'Sin configurar' };
const errorText = (e) => {
    const m = e.response?.data?.message;
    return Array.isArray(m) ? m.join(' · ') : m || e.message || 'Error inesperado';
};

/**
 * WhatsApp de la iglesia (Evolution API): datos de conexión (se guardan con el botón general de Ajustes),
 * vinculación por QR, kill-switch, envío de prueba y registro de envíos.
 */
export default function WhatsappPanel({ settings, set, isDark }) {
    const { showToast } = useToast();
    const [status, setStatus] = useState(null);
    const [qr, setQr] = useState('');
    const [log, setLog] = useState([]);
    const [busy, setBusy] = useState('');
    const [test, setTest] = useState({ to: '', message: 'Mensaje de prueba de OASIS ✅' });

    const text = isDark ? '#fff' : '#120C1F';
    const field = { width: '100%', padding: '10px 12px', borderRadius: 12, border: `1px solid ${isDark ? '#ffffff22' : '#00000018'}`, background: isDark ? '#1B122E' : '#fff', color: text, fontSize: 14 };
    const label = { fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 4, display: 'block' };
    const btn = (primary) => ({ borderRadius: 50, padding: '8px 18px', fontWeight: 800, fontSize: 12, border: `1px solid ${ACCENT}`, background: primary ? ACCENT : 'transparent', color: primary ? '#000' : ACCENT });

    const refresh = useCallback(async () => {
        try {
            const [{ data: s }, { data: m }] = await Promise.all([apiClient.get('/whatsapp/status'), apiClient.get('/whatsapp/messages?limit=50')]);
            setStatus(s);
            setLog(m.data);
            if (s.qr_base64 && s.live_state !== 'open') setQr(s.qr_base64);
            if (s.live_state === 'open') setQr('');
        } catch (e) {
            setStatus({ error: errorText(e) });
        }
    }, []);
    useEffect(() => { refresh(); }, [refresh]);

    const run = (key, fn, ok) => async () => {
        setBusy(key);
        try {
            await fn();
            if (ok) showToast(ok, 'success');
            await refresh();
        } catch (e) {
            showToast(errorText(e), 'error');
        } finally {
            setBusy('');
        }
    };

    const connect = run('connect', async () => {
        await apiClient.post('/whatsapp/create-instance').catch((e) => {
            if (e.response?.status !== 500) throw e; // ya existe: solo pedimos el QR
        });
        const { data } = await apiClient.get('/whatsapp/qr');
        setQr(data.data?.base64 || '');
    });

    const connected = status?.live_state === 'open';
    return (
        <div style={{ color: text }}>
            <div className="row g-3">
                <div className="col-md-5">
                    <label style={label}>URL de Evolution API</label>
                    <input style={field} value={settings.evolution_url || ''} onChange={(e) => set('evolution_url', e.target.value.trim())} placeholder="https://evolution.midominio.com" />
                </div>
                <div className="col-md-4">
                    <label style={label}>API key</label>
                    <input style={field} type="password" autoComplete="off" value={settings.evolution_key || ''} onChange={(e) => set('evolution_key', e.target.value.trim())} />
                </div>
                <div className="col-md-3">
                    <label style={label}>Instancia</label>
                    <input style={field} value={settings.evolution_instance || ''} onChange={(e) => set('evolution_instance', e.target.value.trim())} placeholder="automática por iglesia" />
                </div>
            </div>
            <small style={{ opacity: 0.6, display: 'block', marginTop: 8 }}>Guarda los Ajustes antes de conectar. Cada iglesia usa su propia instancia (su propio número).</small>

            <div className="d-flex flex-wrap align-items-center gap-2 mt-4">
                <span style={{ fontWeight: 800, fontSize: 13 }}>
                    Estado: {status?.error ? <span style={{ color: '#EF4444' }}>{status.error}</span> : connected ? <span style={{ color: '#10B981' }}>Conectado</span> : LIVE[status?.live_state] ?? status?.live_state ?? '…'}
                </span>
                {!connected && <button style={btn(true)} disabled={!!busy} onClick={connect}>{busy === 'connect' ? 'Conectando…' : 'Conectar (QR)'}</button>}
                <button style={btn(false)} disabled={!!busy} onClick={run('refresh', async () => {})}>Actualizar</button>
                {connected && <button style={btn(false)} disabled={!!busy} onClick={run('logout', () => apiClient.post('/whatsapp/logout'), 'WhatsApp desconectado')}>Desconectar</button>}
            </div>

            {status?.kill_switch && (
                <div role="alert" className="mt-3 p-3 d-flex flex-wrap align-items-center gap-3" style={{ borderRadius: 16, background: '#EF444418', color: '#EF4444', fontSize: 13 }}>
                    <span style={{ flex: 1 }}><b>Envíos detenidos (kill-switch).</b> {status.kill_reason}</span>
                    <button style={btn(false)} disabled={!!busy} onClick={run('reset', () => apiClient.post('/whatsapp/reset-kill-switch'), 'Envíos reanudados')}>Reanudar envíos</button>
                </div>
            )}

            {qr && (
                <div className="mt-3 text-center">
                    <img src={qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`} alt="Código QR para vincular WhatsApp" style={{ width: 240, height: 240, background: '#fff', borderRadius: 16, padding: 8 }} />
                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>WhatsApp → Dispositivos vinculados → Vincular dispositivo. Luego pulsa Actualizar.</div>
                </div>
            )}

            <div className="row g-2 mt-4 align-items-end">
                <div className="col-md-4"><label style={label}>Envío de prueba a</label><input style={field} value={test.to} onChange={(e) => setTest((t) => ({ ...t, to: e.target.value.replace(/\D/g, '') }))} placeholder="573001234567" /></div>
                <div className="col-md-6"><label style={label}>Mensaje</label><input style={field} value={test.message} onChange={(e) => setTest((t) => ({ ...t, message: e.target.value }))} /></div>
                <div className="col-md-2"><button style={{ ...btn(true), width: '100%' }} disabled={!!busy || !test.to || !test.message} onClick={run('test', () => apiClient.post('/whatsapp/send-test', test), 'Mensaje en cola')}>Enviar</button></div>
            </div>

            <h6 className="mt-4" style={{ fontWeight: 800, fontSize: 13 }}>Registro de envíos</h6>
            {!log.length ? <div style={{ opacity: 0.5, fontSize: 13 }}>Sin envíos todavía.</div> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 12, color: text }}>
                        <thead><tr style={{ opacity: 0.6, textAlign: 'left' }}><th>Destino</th><th>Tipo</th><th>Estado</th><th>Cuándo</th><th>Detalle</th><th /></tr></thead>
                        <tbody>
                            {log.map((m) => {
                                const [name, color] = STATUS[m.status] ?? [m.status, '#9CA3AF'];
                                return (
                                    <tr key={m.id} style={{ borderTop: `1px solid ${isDark ? '#ffffff12' : '#0000000d'}` }}>
                                        <td style={{ padding: '6px 4px' }}>{m.to}</td>
                                        <td>{m.type}{m.announcement_id ? ` · anuncio #${m.announcement_id}` : ''}</td>
                                        <td style={{ color, fontWeight: 800 }}>{name}{m.attempts > 1 ? ` (${m.attempts})` : ''}</td>
                                        <td>{new Date(m.sent_at || m.scheduled_at).toLocaleString()}</td>
                                        <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.error || m.message || ''}>{m.error || m.message}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            {['failed', 'blocked'].includes(m.status) && <button style={btn(false)} disabled={!!busy} onClick={run(m.id, () => apiClient.post(`/whatsapp/messages/${m.id}/retry`), 'Reintento en cola')}>Reintentar</button>}
                                            {['scheduled', 'queued', 'retrying'].includes(m.status) && <button style={btn(false)} disabled={!!busy} onClick={run(m.id, () => apiClient.delete(`/whatsapp/messages/${m.id}`), 'Envío cancelado')}>Cancelar</button>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
