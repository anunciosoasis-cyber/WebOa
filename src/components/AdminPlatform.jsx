import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import GlassCard from '../react-ui/components/GlassCard';
import { Building2, Plus, X, Power } from 'lucide-react';

const ACCENT = '#F59E0B';
const MODULE_LABELS = { crm: 'Peticiones y formularios', cms: 'Contenido y recursos', worship: 'Culto y himnario', media: 'Presentaciones y medios', communications: 'WhatsApp y correo' };
const EMPTY = { slug: '', name: '', domain: '', adminEmail: '', adminName: '', modules: Object.keys(MODULE_LABELS) };

/** Panel del super-admin: iglesias de la plataforma, módulos contratados y primer admin. */
const AdminPlatform = () => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const { showToast } = useToast();
    const [tenants, setTenants] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [created, setCreated] = useState(null);

    const load = () => apiClient.get('/platform/tenants').then(({ data }) => setTenants(data)).catch(() => setTenants([]));
    useEffect(() => { load(); }, []);

    const toggleModule = (list, mod) => (list.includes(mod) ? list.filter((m) => m !== mod) : [...list, mod]);

    const create = async (e) => {
        e.preventDefault();
        try {
            const { data } = await apiClient.post('/platform/tenants', { ...form, domain: form.domain || undefined, adminName: form.adminName || undefined });
            setCreated(data);
            setForm(EMPTY);
            setShowForm(false);
            load();
        } catch (err) {
            const msg = err.response?.data?.message;
            showToast(Array.isArray(msg) ? msg.join(' · ') : msg || 'No se pudo crear la iglesia', 'error');
        }
    };

    const update = async (tenant, changes) => {
        try {
            await apiClient.patch(`/platform/tenants/${tenant.id}`, changes);
            load();
        } catch (err) {
            showToast(err.response?.data?.message || 'No se pudo actualizar', 'error');
        }
    };

    const text = isDark ? '#fff' : '#120C1F';
    const input = 'form-control oasis-input';

    return (
        <div className="container-fluid pb-5" style={{ minHeight: '100vh', padding: '40px', color: text }}>
            <header className="mb-5 d-flex justify-content-between align-items-end">
                <div>
                    <span style={{ color: ACCENT, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Plataforma</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0' }}>
                        IGLESIAS <span style={{ color: ACCENT }}>OASIS</span>
                    </h1>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn rounded-pill px-4 fw-bold border-0 text-dark d-flex align-items-center gap-2" style={{ background: ACCENT, height: 48 }}>
                    {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'CERRAR' : 'NUEVA IGLESIA'}
                </button>
            </header>

            {created && (
                <GlassCard style={{ padding: 24, borderRadius: 24, marginBottom: 24, border: `1px solid ${ACCENT}` }}>
                    <strong>Iglesia "{created.tenant.name}" creada.</strong>{' '}
                    {created.temporaryPassword
                        ? <>Admin nuevo: <code>{created.admin.email}</code> · contraseña temporal <code>{created.temporaryPassword}</code> (no se volverá a mostrar).</>
                        : <>Se vinculó la cuenta existente <code>{created.admin.email}</code> como admin.</>}
                    <button className="btn btn-sm ms-3" onClick={() => setCreated(null)}><X size={14} /></button>
                </GlassCard>
            )}

            {showForm && (
                <GlassCard style={{ padding: 32, borderRadius: 30, marginBottom: 32 }}>
                    <form onSubmit={create} className="row g-3">
                        <div className="col-md-4"><label className="small">Nombre</label><input className={input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Iglesia Oasis Norte" /></div>
                        <div className="col-md-4"><label className="small">Slug (subdominio)</label><input className={input} required pattern="[a-z0-9][a-z0-9-]{1,48}[a-z0-9]" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="oasis-norte" /></div>
                        <div className="col-md-4"><label className="small">Dominio propio (opcional)</label><input className={input} value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="iglesianorte.org" /></div>
                        <div className="col-md-6"><label className="small">Email del admin</label><input type="email" className={input} required value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} /></div>
                        <div className="col-md-6"><label className="small">Nombre del admin</label><input className={input} value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} /></div>
                        <div className="col-12 d-flex flex-wrap gap-3">
                            {Object.entries(MODULE_LABELS).map(([mod, label]) => (
                                <label key={mod} className="d-flex align-items-center gap-2 small">
                                    <input type="checkbox" checked={form.modules.includes(mod)} onChange={() => setForm({ ...form, modules: toggleModule(form.modules, mod) })} /> {label}
                                </label>
                            ))}
                        </div>
                        <div className="col-12"><button type="submit" className="btn rounded-pill px-4 fw-bold text-dark" style={{ background: ACCENT }}>CREAR IGLESIA</button></div>
                    </form>
                </GlassCard>
            )}

            <div className="d-flex flex-column gap-3">
                {tenants.map((t) => (
                    <GlassCard key={t.id} style={{ padding: 24, borderRadius: 24, opacity: t.is_active ? 1 : 0.55 }}>
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                            <div className="d-flex gap-3 align-items-center">
                                <Building2 size={22} color={ACCENT} />
                                <div>
                                    <div className="fw-bold">{t.name}</div>
                                    <div className="small" style={{ opacity: 0.6 }}>{t.slug}{t.domain ? ` · ${t.domain}` : ''} · {t.members} miembros</div>
                                </div>
                            </div>
                            <button className="btn btn-sm rounded-pill d-flex align-items-center gap-1" style={{ border: `1px solid ${t.is_active ? '#EF4444' : '#10B981'}`, color: t.is_active ? '#EF4444' : '#10B981' }} onClick={() => update(t, { is_active: !t.is_active })}>
                                <Power size={14} /> {t.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                        <div className="d-flex flex-wrap gap-3 mt-3">
                            {Object.entries(MODULE_LABELS).map(([mod, label]) => (
                                <label key={mod} className="d-flex align-items-center gap-2 small">
                                    <input type="checkbox" checked={t.modules.includes(mod)} onChange={() => update(t, { modules: toggleModule(t.modules, mod) })} /> {label}
                                </label>
                            ))}
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default AdminPlatform;
