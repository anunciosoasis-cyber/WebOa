import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import GlassCard from '../react-ui/components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, UserPlus, Shield, Mail, Lock, 
    Trash2, Edit3, CheckCircle2, XCircle, 
    UserCheck, UserX, Search, Filter,
    MoreHorizontal, ShieldCheck, Clock,
    Save, X
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
                <h4 style={{ fontFamily: 'Moonrising', fontSize: '0.9rem', margin: 0, color: '#F59E0B' }}>{title}</h4>
                {subtitle && <p style={{ fontSize: '0.7rem', opacity: 0.5, margin: 0, color: isDark ? '#fff' : '#64748b' }}>{subtitle}</p>}
            </div>
        </div>
        {badge}
    </div>
);

const AdminUsers = () => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'admin' });
    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'warning', onConfirm: () => {} });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await apiClient.get('/users');
            setUsers(data || []);
        } catch (error) { setUsers([]); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await apiClient.put(`/users/${formData.id}`, formData);
            } else {
                await apiClient.post('/register', { username: formData.name, email: formData.email, password: formData.password, role: formData.role });
            }
            fetchUsers();
            setShowForm(false);
            resetForm();
            showToast('Usuario guardado', 'success');
        } catch (error) { showToast('Error al guardar', 'error'); }
    };

    const handleDelete = async (id) => {
        setConfirmConfig({
            show: true, title: 'Eliminar Usuario', message: '¿Eliminar permanentemente?', type: 'danger',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/users/${id}`);
                    fetchUsers();
                    showToast('Eliminado', 'success');
                } catch (error) { showToast('Error', 'error'); }
                setConfirmConfig(p => ({ ...p, show: false }));
            }
        });
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            await apiClient.patch(`/users/${id}/toggle`);
            fetchUsers();
            showToast('Estado actualizado', 'success');
        } catch (error) { showToast('Error', 'error'); }
    };

    const filteredUsers = users.filter(u => {
        if (filter === 'approved') return u.isApproved === true;
        if (filter === 'pending') return u.isApproved === false;
        return true;
    });

    const resetForm = () => setFormData({ id: '', name: '', email: '', password: '', role: 'admin' });

    const handleEdit = (user) => {
        setFormData({ ...user, password: '' });
        setShowForm(true);
    };

    return (
        <div className="container-fluid pb-5" style={{ background: isDark ? OASIS_COLORS.midnight : '#FFFFFF', minHeight: '100vh', padding: '40px' }}>
            <header className="mb-5 d-flex justify-content-between align-items-end">
                <div>
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Access Control</span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: isDark ? '#fff' : OASIS_COLORS.deepPurple }}>
                        GESTIÓN DE <span style={{ color: OASIS_COLORS.accent }}>EQUIPO</span>
                    </h1>
                </div>
                <button 
                    onClick={(e) => { e.preventDefault(); resetForm(); setShowForm(!showForm); }}
                    className="btn rounded-pill px-4 shadow-sm fw-bold border-0 text-dark d-flex align-items-center gap-2" 
                    style={{ background: OASIS_COLORS.accent, height: '48px', position: 'relative', zIndex: 50 }}
                >
                    {showForm ? <X size={18} /> : <UserPlus size={18} />}
                    {showForm ? 'CERRAR' : 'NUEVO USUARIO'}
                </button>
            </header>

            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-5">
                        <GlassCard style={{ padding: '40px', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                            <SectionHeader icon={UserPlus} title={formData.id ? 'EDITAR USUARIO' : 'NUEVO USUARIO'} subtitle="Completa los datos de acceso" isDark={isDark} />
                            <form onSubmit={handleSubmit} className="row g-4">
                                <div className="col-md-4">
                                    <label style={labelStyle}>Nombre Completo</label>
                                    <div className="position-relative">
                                        <Users className="position-absolute top-50 start-0 translate-middle-y ms-3 opacity-25" size={18} />
                                        <input className="form-control oasis-input ps-5" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Juan Pérez" />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label style={labelStyle}>Correo Electrónico</label>
                                    <div className="position-relative">
                                        <Mail className="position-absolute top-50 start-0 translate-middle-y ms-3 opacity-25" size={18} />
                                        <input type="email" className="form-control oasis-input ps-5" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@oasis.com" />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label style={labelStyle}>Contraseña</label>
                                    <div className="position-relative">
                                        <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 opacity-25" size={18} />
                                        <input type="password" className="form-control oasis-input ps-5" required={!formData.id} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label style={labelStyle}>Rol del Sistema</label>
                                    <div className="position-relative">
                                        <Shield className="position-absolute top-50 start-0 translate-middle-y ms-3 opacity-25" size={18} />
                                        <select className="form-select oasis-input ps-5" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                            <option value="admin">Administrador</option>
                                            <option value="editor">Editor</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-12 text-end">
                                    <button type="submit" className="btn rounded-pill px-5 fw-bold text-dark" style={{ background: OASIS_COLORS.accent, height: '48px' }}>
                                        <Save size={18} className="me-2" /> {formData.id ? 'ACTUALIZAR' : 'CREAR USUARIO'}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="d-flex gap-2 mb-4">
                {['all', 'approved', 'pending'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className="btn rounded-pill px-4 fw-bold" style={{ 
                        background: filter === f ? `${OASIS_COLORS.accent}15` : OASIS_COLORS.glassWhite,
                        color: filter === f ? OASIS_COLORS.accent : (isDark ? '#fff' : '#64748b'),
                        border: `1px solid ${filter === f ? OASIS_COLORS.accent : OASIS_COLORS.glassBorder}`,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase'
                    }}>
                        {f === 'all' ? 'TODOS' : f === 'approved' ? 'ACTIVOS' : 'PENDIENTES'}
                    </button>
                ))}
            </div>

            <GlassCard style={{ padding: '0', borderRadius: '35px', border: `1px solid ${OASIS_COLORS.glassBorder}`, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table mb-0" style={{ background: 'transparent', '--bs-table-bg': 'transparent' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th className="ps-4 py-4" style={thStyle}>USUARIO</th>
                                <th className="py-4" style={thStyle}>EMAIL</th>
                                <th className="py-4" style={thStyle}>ROL</th>
                                <th className="py-4" style={thStyle}>ESTADO</th>
                                <th className="pe-4 py-4 text-end" style={thStyle}>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="oasis-tr-hover" style={{ borderBottom: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                                    <td className="ps-4 py-4" style={{ background: 'transparent' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: u.isApproved ? `${OASIS_COLORS.success}15` : `${OASIS_COLORS.warning}15`, color: u.isApproved ? OASIS_COLORS.success : OASIS_COLORS.warning, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {u.isApproved ? <UserCheck size={20} /> : <Clock size={20} />}
                                            </div>
                                            <span style={{ fontWeight: 600, color: isDark ? '#fff' : '#120C1F' }}>{u.name || u.username}</span>
                                        </div>
                                    </td>
                                    <td className="py-4" style={{ opacity: 0.5, color: isDark ? '#fff' : '#64748b', background: 'transparent' }}>{u.email}</td>
                                    <td className="py-4" style={{ background: 'transparent' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', background: `${OASIS_COLORS.accent}10`, color: OASIS_COLORS.accent, border: `1px solid ${OASIS_COLORS.accent}30` }}>
                                            {u.role?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4" style={{ background: 'transparent' }}>
                                        <div className="form-check form-switch custom-switch">
                                            <input className="form-check-input" type="checkbox" checked={u.isApproved} onChange={() => handleToggle(u.id, u.isApproved)} />
                                        </div>
                                    </td>
                                    <td className="pe-4 py-4 text-end" style={{ background: 'transparent' }}>
                                        <div className="d-flex gap-2 justify-content-end">
                                            <button onClick={() => handleEdit(u)} className="action-btn btn-edit"><Edit3 size={16} /></button>
                                            <button onClick={() => handleDelete(u.id)} className="action-btn btn-delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <ConfirmationModal 
                show={confirmConfig.show} title={confirmConfig.title} message={confirmConfig.message} type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm} onCancel={() => setConfirmConfig(p => ({ ...p, show: false }))}
            />
            <style>{oasisInputStyles(OASIS_COLORS, isDark)}</style>
        </div>
    );
};

const thStyle = { fontSize: '0.65rem', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', border: 'none' };
const labelStyle = { fontSize: '0.65rem', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '8px', display: 'block' };

const oasisInputStyles = (colors, isDark) => `
    .oasis-input { background: ${isDark ? colors.glassWhite : '#fff'} !important; border: 1px solid ${colors.glassBorder} !important; color: ${isDark ? '#fff' : '#120C1F'} !important; border-radius: 15px !important; padding: 12px 20px !important; font-size: 0.9rem !important; }
    .oasis-input:focus { border-color: ${colors.accent} !important; box-shadow: 0 0 15px ${colors.accent}20 !important; }
    .form-select.oasis-input { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='rgba(255,255,255,0.5)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important; background-position: right 1rem center !important; background-repeat: no-repeat !important; background-size: 16px 12px !important; }
    
    .oasis-tr-hover { transition: background-color 0.2s ease; }
    .oasis-tr-hover:hover td { background-color: ${isDark ? 'rgba(255,255,255,0.03)' : colors.accent + '0A'} !important; }
    
    .action-btn { width: 35px; height: 35px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; border: none; }
    .btn-edit { background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; color: ${isDark ? '#fff' : '#120C1F'}; }
    .btn-edit:hover { background: ${colors.accent}; color: #fff !important; transform: scale(1.05); }
    .btn-delete { background: ${colors.error}15; color: ${colors.error}; }
    .btn-delete:hover { background: ${colors.error}; color: #fff !important; transform: scale(1.05); }

    .custom-switch .form-check-input { background-color: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); width: 2.5em; height: 1.25em; cursor: pointer; }
    .custom-switch .form-check-input:checked { background-color: ${colors.success}; border-color: ${colors.success}; }
`;

export default AdminUsers;
