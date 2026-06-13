import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../react-ui/ThemeContext';

const Login = () => {
    // ==========================================
    // 🎨 CONFIGURACIÓN DE IMAGEN (Cámbiala aquí)
    // ==========================================
    const LEFT_PANEL_IMAGE = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop";

    const { signIn } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    // Estado para recordar al último usuario
    const [lastUser, setLastUser] = useState(null);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            const stored = localStorage.getItem('oasis_last_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                setLastUser(parsed);
                setFormData(prev => ({ ...prev, email: parsed.email }));
            }
        } catch (e) {
            console.error('Error reading last user', e);
        }
    }, []);

    const handleClearLastUser = () => {
        setLastUser(null);
        setFormData({ email: '', password: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await signIn({
                email: formData.email,
                password: formData.password
            });

            // Guardar en memoria
            if (result && result.user) {
                localStorage.setItem('oasis_last_user', JSON.stringify({
                    name: result.user.name || result.user.username || 'Admin',
                    role: result.user.role || 'Admin',
                    email: formData.email
                }));
            }
            navigate('/admin/requests');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error de acceso');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#F8F9FC',
            paddingTop: '20px', // Reducido drásticamente para pegarlo a la Navbar
            paddingBottom: '40px',
            paddingLeft: '20px',
            paddingRight: '20px',
            minHeight: '100vh',
            overflow: 'hidden'
        }}>
            {/* CONTENEDOR PRINCIPAL: Tarjeta con sombra paralela */}
            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: '1000px',
                minHeight: '600px',
                backgroundColor: '#FFFFFF',
                borderRadius: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 40px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                animation: 'loginAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* LADO IZQUIERDO: IMAGEN Y TARJETA (Solo visible en PC/Tablet) */}
                <div className="d-none d-lg-block" style={{ width: '50%', position: 'relative' }}>
                    <img
                        src={LEFT_PANEL_IMAGE}
                        alt="Background"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(18, 12, 31, 0.3)' }} />

                    {/* Tarjeta inferior */}
                    <div style={{
                        position: 'absolute',
                        bottom: '50px',
                        left: '50px',
                        right: '50px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: '24px',
                        padding: '40px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            fontSize: '0.8rem',
                            color: '#F59E0B',
                            fontWeight: 900,
                            letterSpacing: '2px',
                            marginBottom: '15px',
                            textTransform: 'uppercase'
                        }}>
                            OASIS ECOSYSTEM
                        </div>
                        <h2 style={{
                            color: '#FFFFFF',
                            margin: 0,
                            fontWeight: 800,
                            fontSize: '2.2rem',
                            lineHeight: 1.2,
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}>
                            Gestión inteligente de sus procesos ministeriales.
                        </h2>
                    </div>
                </div>

                {/* LADO DERECHO: FORMULARIO */}
                <div style={{
                    width: '100%',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px'
                }}>
                    <div style={{ width: '100%', maxWidth: '380px' }}>

                        {/* Header: Título (Sin logo) */}
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontFamily: 'Moonrising, sans-serif', color: '#120C1F', margin: 0, fontSize: '2.2rem' }}>
                                OASIS <span style={{ color: '#F59E0B' }}>CONTROL</span>
                            </h2>
                            <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 800, letterSpacing: '1.5px', marginTop: '10px' }}>
                                INGRESE A SU PANEL OPERATIVO
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                background: '#FEE2E2',
                                color: '#B91C1C',
                                padding: '14px',
                                borderRadius: '16px',
                                fontSize: '0.85rem',
                                marginBottom: '25px',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Tarjeta de Último Usuario (Si existe) */}
                        {lastUser ? (
                            <div style={{
                                background: '#F8F9FC',
                                borderRadius: '24px',
                                padding: '30px 20px',
                                textAlign: 'center',
                                marginBottom: '30px',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <div style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '50%',
                                    background: '#120C1F',
                                    color: '#F59E0B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    margin: '0 auto 15px auto',
                                    fontWeight: 'bold'
                                }}>
                                    {lastUser.name.charAt(0).toUpperCase()}
                                </div>
                                <h5 style={{ color: '#120C1F', margin: '0 0 5px 0', fontWeight: 800, fontSize: '1.1rem' }}>
                                    {lastUser.name}
                                </h5>
                                <div style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                                    {lastUser.role}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClearLastUser}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#9ca3af',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseOver={e => e.target.style.color = '#120C1F'}
                                    onMouseOut={e => e.target.style.color = '#9ca3af'}
                                >
                                    INGRESAR CON OTRA CUENTA
                                </button>
                            </div>
                        ) : null}

                        {/* Formulario */}
                        <form onSubmit={handleSubmit}>
                            {!lastUser && (
                                <div className="mb-4">
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#120C1F', opacity: 0.5, marginBottom: '8px', display: 'block', paddingLeft: '5px' }}>
                                        CORREO ELECTRÓNICO
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="form-control"
                                        style={{
                                            background: '#fff',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            borderRadius: '16px',
                                            padding: '16px 20px',
                                            fontSize: '0.95rem',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                                        }}
                                    />
                                </div>
                            )}

                            <div className="mb-5">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingLeft: '5px', paddingRight: '5px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#120C1F', opacity: 0.5, margin: 0 }}>
                                        CONTRASEÑA
                                    </label>
                                    <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: '0.7rem', fontWeight: 800, color: '#F59E0B', textDecoration: 'none' }}>
                                        ¿OLVIDÓ LA CLAVE?
                                    </a>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <i className="bi bi-lock" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '1.1rem' }}></i>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="form-control"
                                        placeholder="••••••••"
                                        style={{
                                            background: '#fff',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            borderRadius: '16px',
                                            padding: '16px 20px 16px 45px',
                                            fontSize: '1.2rem',
                                            letterSpacing: '3px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: '#120C1F',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '18px',
                                    borderRadius: '16px',
                                    width: '100%',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    letterSpacing: '1px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    cursor: loading ? 'wait' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 10px 20px -5px rgba(18, 12, 31, 0.4)'
                                }}
                                onMouseOver={e => !loading && (e.target.style.background = '#F59E0B')}
                                onMouseOut={e => !loading && (e.target.style.background = '#120C1F')}
                            >
                                {loading ? 'VERIFICANDO...' : <>ACCEDER AL SISTEMA <i className="bi bi-arrow-right" style={{ fontSize: '1.1rem' }}></i></>}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 800, letterSpacing: '2px' }}>
                                © 2026 OASIS ECOSYSTEM
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes loginAppear {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .form-control:focus {
                    border-color: #F59E0B !important;
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1) !important;
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default Login;