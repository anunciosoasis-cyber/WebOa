import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import GlassCard from '../react-ui/components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Settings, Church, MessageSquare, Mail, 
    ShieldCheck, Zap, Globe, Save, RefreshCcw,
    Eye, EyeOff, CheckCircle2, AlertCircle,
    Server, Send, Smartphone, Layout, Key,
    ArrowRight, Lock, Bell
} from 'lucide-react';

const OASIS_COLORS = {
    deepPurple: '#120C1F',
    midnight: '#08050D',
    accent: '#F59E0B',
    glassWhite: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
};

const SectionHeader = ({ icon: Icon, title, subtitle, badge, isDark }) => (
    <div className="mb-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: OASIS_COLORS.accent + '15', color: OASIS_COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} />
            </div>
            <div>
                <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.9rem', margin: 0, color: OASIS_COLORS.accent }}>{title}</h4>
                {subtitle && <p style={{ fontSize: '0.7rem', opacity: 0.5, margin: 0, color: isDark ? '#fff' : '#000' }}>{subtitle}</p>}
            </div>
        </div>
        {badge}
    </div>
);

const SMTP_PRESETS = {
    gmail: {
        label: 'Gmail',
        icon: Mail,
        color: '#EA4335',
        host: 'smtp.gmail.com',
        port: '587',
        encryption: 'tls',
        hint: 'Use an "App Password" (not your regular password).',
        link: 'https://myaccount.google.com/apppasswords',
    },
    outlook: {
        label: 'Outlook',
        icon: Mail,
        color: '#0078D4',
        host: 'smtp-mail.outlook.com',
        port: '587',
        encryption: 'tls',
        hint: 'Use your regular credentials. Ensure SMTP is enabled.',
        link: 'https://account.microsoft.com/security',
    },
    custom: {
        label: 'Custom',
        icon: Server,
        color: '#6B7280',
        host: '',
        port: '587',
        encryption: 'tls',
        hint: 'Enter your custom SMTP server details.',
        link: null,
    },
};

const DEFAULTS = {
    church_name: 'Iglesia Adventista Oasis',
    notify_email: '',
    whatsapp_number: '',
    whatsapp_group_link: '',
    mail_provider: 'gmail',
    mail_host: 'smtp.gmail.com',
    mail_port: '587',
    mail_encryption: 'tls',
    mail_username: '',
    mail_from_name: 'Oasis Iglesia',
    mail_from_address: '',
    evolution_url: '',
    evolution_key: '',
    evolution_instance: 'oasis-iglesia',
    youtube_playlist_id: '',
    logo: '',
    bg_image: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',
    email_template_solicitud: '',
};

const AdminAjustes = () => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const [settings, setSettings] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showEvKey, setShowEvKey] = useState(false);
    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => {} });

    useEffect(() => {
        (async () => {
            try {
                const { data } = await apiClient.get('/settings');
                if (data) {
                    const settingsObj = Array.isArray(data) ?
                        data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) :
                        data;
                    setSettings(prev => ({ ...prev, ...settingsObj }));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const set = useCallback((key, val) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    }, []);

    const applyPreset = (key) => {
        const preset = SMTP_PRESETS[key];
        if (!preset) return;
        setSettings(prev => ({
            ...prev,
            mail_provider: key,
            mail_host: preset.host || prev.mail_host,
            mail_port: preset.port,
            mail_encryption: preset.encryption,
        }));
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.url;
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await apiClient.post('/settings', settings);
            showToast('Configuración guardada', 'success');
        } catch (err) {
            showToast('Error al guardar', 'error');
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: isDark ? OASIS_COLORS.midnight : '#F9FAFB' }}>
            <div className="spinner-border" style={{ color: OASIS_COLORS.accent }} role="status"></div>
        </div>
    );

    return (
        <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh', padding: '40px' }}>
            <header className="mb-5 d-flex justify-content-between align-items-end">
                <div>
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>System Infrastructure</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                        AJUSTES DEL <span style={{ color: OASIS_COLORS.accent }}>SISTEMA</span>
                    </h1>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="btn rounded-pill px-4 shadow-sm fw-bold border-0 text-dark d-flex align-items-center gap-2" 
                    style={{ background: OASIS_COLORS.accent, height: '48px' }}
                >
                    {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
            </header>

            <div className="row g-4">
                {/* 1. CHURCH INFORMATION */}
                <div className="col-lg-6">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}`, height: '100%' }}>
                        <SectionHeader icon={Church} title="IGLESIA" subtitle="Configuración general" isDark={isDark} />
                        <div className="mb-4">
                            <label style={labelStyle}>Nombre de la Iglesia</label>
                            <input className="form-control oasis-input" value={settings.church_name} onChange={e => set('church_name', e.target.value)} placeholder="Ej: Oasis Iglesia" />
                            <small className="mt-2 d-block" style={{ opacity: 0.5, color: isDark ? '#fff' : '#000' }}>Aparecerá como remitente en todas las comunicaciones.</small>
                        </div>
                    </GlassCard>
                </div>

                {/* 2. NOTIFICATIONS */}
                <div className="col-lg-6">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}`, height: '100%' }}>
                        <SectionHeader icon={Zap} title="INTEGRACIONES" subtitle="Servicios externos" isDark={isDark} />
                        <div className="row g-3">
                            <div className="col-md-7">
                                <label style={labelStyle}>Email de Destino</label>
                                <input type="email" className="form-control oasis-input" value={settings.notify_email} onChange={e => set('notify_email', e.target.value)} placeholder="pastor@iglesia.com" />
                            </div>
                            <div className="col-md-5">
                                <label style={labelStyle}>Nombre Remitente</label>
                                <input className="form-control oasis-input" value={settings.mail_from_name} onChange={e => set('mail_from_name', e.target.value)} placeholder="Oasis Iglesia" />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 3. WHATSAPP CONFIG */}
                <div className="col-12">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <SectionHeader 
                            icon={MessageSquare} 
                            title="WHATSAPP CONNECT" 
                            subtitle="Comunicación directa y automatizada"
                            badge={<span style={{ background: `${OASIS_COLORS.success}15`, color: OASIS_COLORS.success, padding: '5px 12px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900 }}>ECO-OPTIMIZED</span>}
                            isDark={isDark}
                        />
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label style={labelStyle}>Número de WhatsApp (Personal)</label>
                                <div className="input-group">
                                    <span className="input-group-text border-0" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderTopLeftRadius: '15px', borderBottomLeftRadius: '15px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>+</span>
                                    <input className="form-control oasis-input" value={settings.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value.replace(/\D/g, ''))} placeholder="573001234567" />
                                </div>
                                <small className="mt-2 d-block" style={{ opacity: 0.5, color: isDark ? '#fff' : '#000' }}>Recomendado para atención personalizada.</small>
                            </div>
                            <div className="col-md-6">
                                <label style={labelStyle}>Enlace de Grupo (Alternativo)</label>
                                <input className="form-control oasis-input" value={settings.whatsapp_group_link} onChange={e => set('whatsapp_group_link', e.target.value)} placeholder="https://chat.whatsapp.com/..." />
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-4 d-flex align-items-center gap-3" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                            <ShieldCheck className="text-success" size={24} />
                            <p className="small text-success mb-0" style={{ fontWeight: 600 }}>El sistema utiliza enlaces directos para evitar costos de API Business.</p>
                        </div>
                    </GlassCard>
                </div>

                {/* 4. SMTP SERVER */}
                <div className="col-lg-8">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <SectionHeader icon={Mail} title="MENSAJERÍA" subtitle="Configuración SMTP" isDark={isDark} />
                        
                        <div className="d-flex gap-2 mb-5 overflow-auto pb-2">
                            {Object.entries(SMTP_PRESETS).map(([key, p]) => (
                                <button key={key} type="button" 
                                    onClick={() => applyPreset(key)}
                                    style={{
                                        minWidth: '120px',
                                        padding: '15px',
                                        borderRadius: '20px',
                                        background: settings.mail_provider === key ? p.color + '15' : OASIS_COLORS.glassWhite,
                                        border: `1px solid ${settings.mail_provider === key ? p.color : OASIS_COLORS.glassBorder}`,
                                        color: settings.mail_provider === key ? p.color : (isDark ? '#fff' : '#000'),
                                        transition: '0.3s'
                                    }}
                                    className="d-flex flex-column align-items-center gap-2"
                                >
                                    <p.icon size={24} />
                                    <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>{p.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="row g-4">
                            <div className="col-md-7">
                                <label style={labelStyle}>Usuario / Email SMTP</label>
                                <input className="form-control oasis-input" value={settings.mail_username} onChange={e => set('mail_username', e.target.value)} placeholder="usuario@gmail.com" />
                            </div>
                            <div className="col-md-5">
                                <label style={labelStyle}>Contraseña de Aplicación</label>
                                <div className="p-2 px-3 rounded-4 d-flex align-items-center gap-2" style={{ background: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', height: '47px' }}>
                                    <Lock size={16} className="text-success" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: OASIS_COLORS.success }}>Protegida por entorno (.env)</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label style={labelStyle}>Servidor (Host)</label>
                                <input className="form-control oasis-input" value={settings.mail_host} onChange={e => set('mail_host', e.target.value)} placeholder="smtp.gmail.com" />
                            </div>
                            <div className="col-md-3">
                                <label style={labelStyle}>Puerto</label>
                                <select className="form-select oasis-input" value={settings.mail_port} onChange={e => set('mail_port', e.target.value)}>
                                    <option value="587">587 (TLS)</option>
                                    <option value="465">465 (SSL)</option>
                                    <option value="25">25 (Unsafe)</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label style={labelStyle}>Cifrado</label>
                                <select className="form-select oasis-input" value={settings.mail_encryption} onChange={e => set('mail_encryption', e.target.value)}>
                                    <option value="tls">TLS</option>
                                    <option value="ssl">SSL</option>
                                    <option value="">Ninguno</option>
                                </select>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* 5. EVOLUTION API */}
                <div className="col-lg-4">
                    {/* ... (keep existing evolution content) */}
                </div>

                {/* 5b. PLANTILLA DE CORREO — enlace a página dedicada */}
                <div className="col-12">
                    <GlassCard style={{ padding: '30px 40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: OASIS_COLORS.accent + '15', color: OASIS_COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.9rem', margin: 0, color: OASIS_COLORS.accent }}>PLANTILLA DE CORREO</h4>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.5, margin: 0, color: isDark ? '#fff' : '#000' }}>Edita el texto y las variables que se envían al recibir una solicitud</p>
                                </div>
                            </div>
                            <a href="/admin/plantilla-correo" style={{ background: OASIS_COLORS.accent, color: '#000', border: 'none', borderRadius: '50px', padding: '12px 28px', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={15} /> ABRIR EDITOR DE PLANTILLA
                            </a>
                        </div>
                    </GlassCard>
                </div>

                {/* 6. BRANDING & SOCIAL MEDIA */}
                <div className="col-12">
                    <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                        <SectionHeader 
                            icon={Globe} 
                            title="BRANDING & SOCIAL" 
                            subtitle="Identidad visual y presencia digital"
                            isDark={isDark}
                        />
                        <div className="row g-4">
                            {/* Logos & Background */}
                            <div className="col-md-6">
                                <div className="row g-3">
                                    <div className="col-6">
                                        <label style={labelStyle}>Logo de la Iglesia</label>
                                        <div className="p-3 rounded-4 border border-dashed text-center" style={{ borderColor: OASIS_COLORS.glassBorder, background: OASIS_COLORS.glassWhite }}>
                                            <div className="mb-3 rounded-3 overflow-hidden bg-black d-flex align-items-center justify-content-center" style={{ height: '100px' }}>
                                                {settings.logo ? <img src={settings.logo} className="mw-100 mh-100 object-fit-contain" /> : <Church size={40} className="opacity-25" />}
                                            </div>
                                            <label className="btn btn-sm w-100 rounded-pill" style={{ background: OASIS_COLORS.glassWhite, color: '#fff', border: `1px solid ${OASIS_COLORS.glassBorder}`, fontSize: '0.6rem' }}>
                                                SUBIR LOGO
                                                <input type="file" hidden onChange={async e => set('logo', await uploadFile(e.target.files[0]))} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label style={labelStyle}>Imagen de Fondo</label>
                                        <div className="p-3 rounded-4 border border-dashed text-center" style={{ borderColor: OASIS_COLORS.glassBorder, background: OASIS_COLORS.glassWhite }}>
                                            <div className="mb-3 rounded-3 overflow-hidden bg-black" style={{ height: '100px' }}>
                                                {settings.bg_image ? <img src={settings.bg_image} className="w-100 h-100 object-fit-cover" /> : <Layout size={40} className="opacity-25 mt-4" />}
                                            </div>
                                            <label className="btn btn-sm w-100 rounded-pill" style={{ background: OASIS_COLORS.glassWhite, color: '#fff', border: `1px solid ${OASIS_COLORS.glassBorder}`, fontSize: '0.6rem' }}>
                                                SUBIR FONDO
                                                <input type="file" hidden onChange={async e => set('bg_image', await uploadFile(e.target.files[0]))} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="col-md-6">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label style={labelStyle}>Facebook URL</label>
                                        <input className="form-control oasis-input" value={settings.facebook_url} onChange={e => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
                                    </div>
                                    <div className="col-md-6">
                                        <label style={labelStyle}>Instagram URL</label>
                                        <input className="form-control oasis-input" value={settings.instagram_url} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
                                    </div>
                                    <div className="col-md-6">
                                        <label style={labelStyle}>YouTube URL</label>
                                        <input className="form-control oasis-input" value={settings.youtube_url} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/..." />
                                    </div>
                                    <div className="col-md-6">
                                        <label style={labelStyle}>Twitter / X URL</label>
                                        <input className="form-control oasis-input" value={settings.twitter_url} onChange={e => set('twitter_url', e.target.value)} placeholder="https://twitter.com/..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <ConfirmationModal 
                show={confirmConfig.show} title={confirmConfig.title} message={confirmConfig.message} type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm} onCancel={() => setConfirmConfig(p => ({ ...p, show: false }))}
            />
            <style>{oasisInputStyles(OASIS_COLORS, isDark)}</style>
        </div>
    );
};

const labelStyle = { fontSize: '0.65rem', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '8px', display: 'block' };

const oasisInputStyles = (colors, isDark) => `
    .oasis-input { background: ${isDark ? colors.glassWhite : '#fff'} !important; border: 1px solid ${isDark ? colors.glassBorder : 'rgba(0,0,0,0.1)'} !important; color: ${isDark ? '#fff' : '#120C1F'} !important; border-radius: 15px !important; padding: 12px 20px !important; font-size: 0.9rem !important; }
    .oasis-input:focus { border-color: ${colors.accent} !important; box-shadow: 0 0 15px ${colors.accent}20 !important; }
    .form-select.oasis-input { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important; background-repeat: no-repeat !important; background-position: right 1rem center !important; background-size: 16px 12px !important; }
    .animate-spin { animation: spin 2s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default AdminAjustes;
