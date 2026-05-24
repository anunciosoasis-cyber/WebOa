import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../react-ui/ThemeContext';
import GlassCard from '../react-ui/components/GlassCard';

const Login = () => {
    const { signIn } = useAuth();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const colors = {
        primary: '#120C1F', 
        accent: '#F59E0B',
        softBackground: '#F8F9FC',
        // Sombras negras puras para realismo
        shadow: 'rgba(0, 0, 0, 0.12)',
        deepShadow: 'rgba(0, 0, 0, 0.18)'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn({
                email: formData.email,
                password: formData.password
            });
            navigate('/admin/requests');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error de acceso');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100dvh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.softBackground,
            position: 'relative',
            paddingTop: '100px', // Espacio de seguridad para que la Navbar no lo tape
            overflowX: 'hidden'
        }}>
            {/* 1. FONDO LIMPIO CON IMAGEN SUTIL */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url("https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px) grayscale(20%)',
                opacity: 0.15,
                zIndex: 0
            }} />

            {/* 2. PANEL DE LOGIN (SINFONÍA DE SOMBRAS NATURALES) */}
            <div style={{ 
                width: '100%', 
                maxWidth: '440px', 
                padding: '0 20px',
                zIndex: 5, // Menor que el z-index de la Navbar (1000)
                animation: 'loginAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '40px',
                    padding: '60px 45px',
                    // Sombra negra pura, sin brillos de colores
                    boxShadow: `0 10px 25px -5px ${colors.shadow}, 0 25px 50px -12px ${colors.deepShadow}`,
                    border: '1px solid rgba(0,0,0,0.03)',
                    textAlign: 'center'
                }}>
                    <div style={{ 
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.04)',
                        color: colors.primary,
                        fontSize: '0.65rem',
                        fontWeight: '900',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        marginBottom: '20px',
                        opacity: 0.5
                    }}>
                        Personal Autorizado
                    </div>
                    
                    <h2 style={{ 
                        fontFamily: 'Moonrising, sans-serif', 
                        color: colors.primary, 
                        fontSize: '1.7rem',
                        margin: '0 0 40px 0',
                        letterSpacing: '1px'
                    }}>
                        OASIS <span style={{ color: colors.accent }}>CONTROL</span>
                    </h2>

                    {error && (
                        <div style={{ 
                            background: '#FFF1F2', 
                            color: '#BE123C', 
                            padding: '14px', 
                            borderRadius: '18px', 
                            fontSize: '0.8rem', 
                            marginBottom: '25px',
                            fontWeight: '600',
                            border: '1px solid rgba(190, 18, 60, 0.05)'
                        }}>
                             {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                        <div className="mb-4">
                            <label style={{ 
                                color: colors.primary, 
                                fontSize: '0.7rem', 
                                fontWeight: '800', 
                                marginLeft: '15px',
                                marginBottom: '8px',
                                display: 'block',
                                opacity: 0.4
                            }}>EMAIL</label>
                            <input
                                type="email"
                                className="form-control login-input"
                                style={{ 
                                    background: '#F9FAFB',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: '20px',
                                    padding: '16px 22px',
                                    color: colors.primary,
                                    fontSize: '0.9rem'
                                }}
                                placeholder="admin@oasis.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="mb-5">
                            <label style={{ 
                                color: colors.primary, 
                                fontSize: '0.7rem', 
                                fontWeight: '800', 
                                marginLeft: '15px',
                                marginBottom: '8px',
                                display: 'block',
                                opacity: 0.4
                            }}>CONTRASEÑA</label>
                            <input
                                type="password"
                                className="form-control login-input"
                                style={{ 
                                    background: '#F9FAFB',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: '20px',
                                    padding: '16px 22px',
                                    color: colors.primary,
                                    fontSize: '0.9rem'
                                }}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ 
                                background: colors.primary,
                                color: '#fff',
                                border: 'none',
                                padding: '18px',
                                borderRadius: '20px',
                                width: '100%',
                                fontWeight: '900',
                                fontSize: '0.8rem',
                                letterSpacing: '2px',
                                boxShadow: '0 10px 20px -5px rgba(18, 12, 31, 0.3)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            className="btn-submit"
                        >
                            {loading ? 'VERIFICANDO...' : 'ENTRAR AL PANEL'}
                        </button>

                        <div className="text-center mt-5">
                            <button 
                                type="button" 
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: colors.primary, 
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    opacity: 0.3,
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate('/')}
                            >
                                ← REGRESAR AL SITIO
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes loginAppear {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .login-input:focus {
                    background: #fff !important;
                    border-color: ${colors.accent} !important;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.03) !important;
                    outline: none;
                }
                .btn-submit:hover {
                    background: ${colors.accent} !important;
                    color: ${colors.primary} !important;
                    transform: translateY(-2px);
                }
                @font-face {
                    font-family: 'Moonrising';
                    src: url('/fonts/Moonrising.ttf');
                }
            `}</style>
        </div>
    );
};

export default Login;