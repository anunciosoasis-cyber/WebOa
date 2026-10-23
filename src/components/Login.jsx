import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Moon, Sun, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../react-ui/ThemeContext';
import GoogleSignInButton from './GoogleSignInButton';
import logoImg from '../img/logos/LOGO1.png';
import oasisCommunityImg from '../img/comunidad-oasis.png';
import '../styles/login.css';

const STORAGE_KEY = 'oasis_known_accounts';
const LEAVE_MS = 520;

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Login Oasis estilo tarjeta de referencia:
 * - Fondo atmosférico difuminado con la foto de la comunidad Oasis
 * - Tarjeta centrada con cabecera fotográfica nítida y corte diagonal
 * - Insignia circular central superpuesta con el emblema de Oasis
 * - Formulario minimalista con etiquetas en mayúsculas y trazo limpio
 * - Opción de recuperación de contraseña por email integrada
 * - Inicio de sesión con Google
 * - Paleta y botones oficiales Oasis (Oasis Gold y Royal Midnight Purple)
 */
export default function Login() {
    const { signIn, signUp, requestPasswordReset } = useAuth();
    const { mode, toggleMode } = useTheme();
    const isDark = mode === 'dark';
    const navigate = useNavigate();

    // 'login' | 'register' | 'forgot'
    const [view, setView] = useState('login');
    const [knownUsers, setKnownUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isManualLogin, setIsManualLogin] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoverySent, setRecoverySent] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [shake, setShake] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const leaveTimer = useRef(null);

    useEffect(() => () => clearTimeout(leaveTimer.current), []);

    useEffect(() => {
        try {
            const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (Array.isArray(list) && list.length > 0) {
                setKnownUsers(list);
                setSelectedUser(list[0]);
                setFormData((prev) => ({ ...prev, email: list[0].email }));
                setRecoveryEmail(list[0].email);
                setIsManualLogin(false);
                return;
            }
        } catch (e) {
            console.error('Error al leer perfiles:', e);
        }
        setIsManualLogin(true);
    }, []);

    const set = (key) => (e) => {
        const val = e.target.value;
        setFormData((prev) => ({ ...prev, [key]: val }));
        if (key === 'email') setRecoveryEmail(val);
    };

    const triggerError = (msg) => {
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 400);
    };

    const enterAdmin = () => {
        setLeaving(true);
        leaveTimer.current = setTimeout(
            () => navigate('/admin/requests'),
            reducedMotion() ? 0 : LEAVE_MS
        );
    };

    const handleGoogleSuccess = (result) => {
        if (result?.user) {
            const account = {
                name: result.user.name || result.user.full_name || 'Operador',
                role: result.user.role || 'Admin',
                email: result.user.email,
                avatar: result.user.avatar || null,
            };
            const others = knownUsers.filter((u) => u.email !== account.email);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([account, ...others].slice(0, 4)));
        }
        enterAdmin();
    };

    const handleSwitchMode = (targetView) => {
        setView(targetView);
        setError('');
        setSuccessMsg('');
        setRecoverySent(false);
        if (targetView === 'register') {
            setIsManualLogin(true);
            setSelectedUser(null);
        } else if (targetView === 'login' && knownUsers.length > 0) {
            setSelectedUser(knownUsers[0]);
            setIsManualLogin(false);
            setFormData((prev) => ({ ...prev, email: knownUsers[0].email, password: '' }));
        }
    };

    const handleSwitchToManual = () => {
        setSelectedUser(null);
        setIsManualLogin(true);
        setFormData((prev) => ({ ...prev, email: '', password: '' }));
        setError('');
    };

    // Envío del formulario de Login / Registro
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (view === 'register') {
            if (formData.password !== formData.confirmPassword) {
                return triggerError('Las contraseñas no coinciden.');
            }
            if (formData.password.length < 6) {
                return triggerError('La contraseña debe tener al menos 6 caracteres.');
            }
        }

        setLoading(true);
        try {
            if (view === 'register') {
                if (signUp) {
                    await signUp({
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        password: formData.password,
                    });
                }
            }
            const result = await signIn({
                email: formData.email.trim(),
                password: formData.password,
            });

            if (result?.user) {
                const account = {
                    name: result.user.name || result.user.full_name || formData.name || 'Operador',
                    role: result.user.role || 'Admin',
                    email: formData.email.trim(),
                    avatar: result.user.avatar || null,
                };
                const others = knownUsers.filter((u) => u.email !== account.email);
                localStorage.setItem(STORAGE_KEY, JSON.stringify([account, ...others].slice(0, 4)));
            }
            enterAdmin();
        } catch (err) {
            triggerError(err.response?.data?.message || err.message || 'Credenciales incorrectas');
            setLoading(false);
        }
    };

    // Envío de recuperación de contraseña por email
    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        const targetEmail = (recoveryEmail || formData.email || '').trim();
        if (!targetEmail) {
            return triggerError('Por favor ingresa tu correo electrónico.');
        }

        setLoading(true);
        try {
            const res = await requestPasswordReset(targetEmail);
            setRecoverySent(true);
            setSuccessMsg(res?.message || 'Hemos enviado las instrucciones a tu correo electrónico.');
        } catch (err) {
            triggerError(err.response?.data?.message || err.message || 'No se pudo enviar el correo de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    const remembered = view === 'login' && !isManualLogin && selectedUser;

    return (
        <div className="lg" data-mode={mode} data-leaving={leaving}>
            {/* Fondo atmosférico difuminado con la foto de la comunidad */}
            <div
                className="lg-ref-backdrop"
                style={{ backgroundImage: `url(${oasisCommunityImg})` }}
                aria-hidden="true"
            />
            <div className="lg-ref-backdrop-overlay" aria-hidden="true" />

            {/* Cortina de transición */}
            <div className="lg-curtain" aria-hidden="true">
                <img src={logoImg} alt="" />
            </div>

            {/* Barra superior de navegación rápida */}
            <header className="lg-top lg-in" style={{ '--i': 0 }}>
                <Link to="/" className="lg-chip">
                    <ArrowLeft size={15} /> Volver al sitio
                </Link>
                <button
                    type="button"
                    className="lg-chip"
                    onClick={toggleMode}
                    aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                    {isDark ? <Sun size={15} /> : <Moon size={15} />}
                </button>
            </header>

            {/* Tarjeta de estilo de referencia con cabecera en corte diagonal e insignia */}
            <main className="lg-ref-card lg-in" style={{ '--i': 1 }}>
                {/* Cabecera con foto y corte diagonal */}
                <div className="lg-ref-header">
                    <img
                        src={oasisCommunityImg}
                        alt="Comunidad Iglesia Adventista Oasis"
                        className="lg-ref-header-img"
                    />
                    <div className="lg-ref-header-overlay" />
                    
                    {/* Insignia circular centrada flotando sobre el corte diagonal */}
                    <div className="lg-ref-badge" title="Iglesia Oasis">
                        <img src={logoImg} alt="Oasis" className="lg-ref-badge-logo" />
                        <span className="lg-ref-badge-label">OASIS</span>
                    </div>
                </div>

                {/* Cuerpo del formulario */}
                <div className="lg-ref-body">
                    <div className={shake ? 'lg-shake' : undefined}>
                        {/* Mensaje de error */}
                        {error && (
                            <div className="lg-ref-alert lg-ref-alert-error" role="alert">
                                {error}
                            </div>
                        )}

                        {/* Mensaje de éxito */}
                        {successMsg && (
                            <div className="lg-ref-alert lg-ref-alert-success" role="status">
                                <CheckCircle2 size={16} />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        {/* ── MODO 1: LOGIN ── */}
                        {view === 'login' && (
                            <form className="lg-ref-form" onSubmit={handleSubmit}>
                                {remembered && (
                                    <div className="lg-ref-remembered-banner">
                                        <span>Sesión guardada para <strong>{selectedUser.name}</strong></span>
                                        <button type="button" className="lg-ref-link" onClick={handleSwitchToManual}>
                                            Cambiar cuenta
                                        </button>
                                    </div>
                                )}

                                {!remembered && (
                                    <div className="lg-ref-group">
                                        <label htmlFor="lg-email" className="lg-ref-label">
                                            CORREO ELECTRÓNICO
                                        </label>
                                        <input
                                            id="lg-email"
                                            className="lg-ref-input"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="ejemplo@oasis.org"
                                            value={formData.email}
                                            onChange={set('email')}
                                        />
                                    </div>
                                )}

                                <div className="lg-ref-group">
                                    <div className="lg-ref-label-row">
                                        <label htmlFor="lg-pass" className="lg-ref-label">
                                            CONTRASEÑA
                                        </label>
                                        <button
                                            type="button"
                                            className="lg-ref-forgot-link"
                                            onClick={() => handleSwitchMode('forgot')}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                    <div className="lg-ref-input-wrap">
                                        <input
                                            id="lg-pass"
                                            className="lg-ref-input lg-ref-input-pass"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={set('password')}
                                            autoFocus={Boolean(remembered)}
                                        />
                                        <button
                                            type="button"
                                            className="lg-ref-eye"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="lg-ref-submit-btn"
                                    disabled={loading || leaving}
                                >
                                    {loading ? (
                                        <span className="lg-spin" aria-label="Ingresando..." />
                                    ) : (
                                        'INGRESAR'
                                    )}
                                </button>

                                <div className="lg-ref-divider">
                                    <span>o continuar con</span>
                                </div>

                                <div className="lg-ref-google-container">
                                    <GoogleSignInButton
                                        theme={isDark ? 'filled_black' : 'outline'}
                                        onSuccess={handleGoogleSuccess}
                                        onError={triggerError}
                                    />
                                </div>

                                <div className="lg-ref-footer">
                                    <span>¿NO TIENES UNA CUENTA?</span>
                                    <button
                                        type="button"
                                        className="lg-ref-switch-btn"
                                        onClick={() => handleSwitchMode('register')}
                                    >
                                        REGÍSTRATE
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── MODO 2: RECUPERACIÓN DE CONTRASEÑA ── */}
                        {view === 'forgot' && (
                            <form className="lg-ref-form" onSubmit={handleForgotPasswordSubmit}>
                                <div className="lg-ref-view-intro">
                                    <h2 className="lg-ref-view-title">Recuperar Contraseña</h2>
                                    <p className="lg-ref-view-desc">
                                        Ingresa el correo electrónico asociado a tu cuenta de Iglesia Oasis y te enviaremos las instrucciones de recuperación.
                                    </p>
                                </div>

                                {!recoverySent ? (
                                    <>
                                        <div className="lg-ref-group">
                                            <label htmlFor="lg-rec-email" className="lg-ref-label">
                                                CORREO ELECTRÓNICO
                                            </label>
                                            <div className="lg-ref-input-wrap">
                                                <input
                                                    id="lg-rec-email"
                                                    className="lg-ref-input"
                                                    type="email"
                                                    required
                                                    autoComplete="email"
                                                    placeholder="ejemplo@oasis.org"
                                                    value={recoveryEmail}
                                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                                    autoFocus
                                                />
                                                <Mail size={16} className="lg-ref-input-icon" />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="lg-ref-submit-btn"
                                            disabled={loading || leaving}
                                        >
                                            {loading ? (
                                                <span className="lg-spin" aria-label="Enviando..." />
                                            ) : (
                                                'ENVIAR ENLACE DE RECUPERACIÓN'
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <div className="lg-ref-recovery-done">
                                        <p>
                                            Hemos enviado las instrucciones a <strong>{recoveryEmail}</strong>. Si no lo ves en unos minutos, revisa tu carpeta de spam.
                                        </p>
                                        <button
                                            type="button"
                                            className="lg-ref-submit-btn"
                                            onClick={() => setRecoverySent(false)}
                                        >
                                            REINTENTAR CON OTRO CORREO
                                        </button>
                                    </div>
                                )}

                                <div className="lg-ref-footer">
                                    <button
                                        type="button"
                                        className="lg-ref-back-link"
                                        onClick={() => handleSwitchMode('login')}
                                    >
                                        ← VOLVER AL INICIO DE SESIÓN
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── MODO 3: REGISTRO ── */}
                        {view === 'register' && (
                            <form className="lg-ref-form" onSubmit={handleSubmit}>
                                <div className="lg-ref-view-intro">
                                    <h2 className="lg-ref-view-title">Crear Cuenta</h2>
                                    <p className="lg-ref-view-desc">
                                        Únete a la plataforma de gestión de Iglesia Oasis.
                                    </p>
                                </div>

                                <div className="lg-ref-group">
                                    <label htmlFor="lg-reg-name" className="lg-ref-label">
                                        NOMBRE COMPLETO
                                    </label>
                                    <input
                                        id="lg-reg-name"
                                        className="lg-ref-input"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        placeholder="Nombre y apellido"
                                        value={formData.name}
                                        onChange={set('name')}
                                    />
                                </div>

                                <div className="lg-ref-group">
                                    <label htmlFor="lg-reg-email" className="lg-ref-label">
                                        CORREO ELECTRÓNICO
                                    </label>
                                    <input
                                        id="lg-reg-email"
                                        className="lg-ref-input"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        placeholder="ejemplo@oasis.org"
                                        value={formData.email}
                                        onChange={set('email')}
                                    />
                                </div>

                                <div className="lg-ref-group">
                                    <label htmlFor="lg-reg-pass" className="lg-ref-label">
                                        CONTRASEÑA
                                    </label>
                                    <div className="lg-ref-input-wrap">
                                        <input
                                            id="lg-reg-pass"
                                            className="lg-ref-input lg-ref-input-pass"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            autoComplete="new-password"
                                            placeholder="Mínimo 6 caracteres"
                                            value={formData.password}
                                            onChange={set('password')}
                                        />
                                        <button
                                            type="button"
                                            className="lg-ref-eye"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="lg-ref-group">
                                    <label htmlFor="lg-reg-pass2" className="lg-ref-label">
                                        CONFIRMAR CONTRASEÑA
                                    </label>
                                    <div className="lg-ref-input-wrap">
                                        <input
                                            id="lg-reg-pass2"
                                            className="lg-ref-input lg-ref-input-pass"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            autoComplete="new-password"
                                            placeholder="Repite la contraseña"
                                            value={formData.confirmPassword}
                                            onChange={set('confirmPassword')}
                                        />
                                        <button
                                            type="button"
                                            className="lg-ref-eye"
                                            onClick={() => setShowConfirmPassword((v) => !v)}
                                            aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="lg-ref-submit-btn"
                                    disabled={loading || leaving}
                                >
                                    {loading ? (
                                        <span className="lg-spin" aria-label="Creando cuenta..." />
                                    ) : (
                                        'CREAR CUENTA'
                                    )}
                                </button>

                                <div className="lg-ref-divider">
                                    <span>o registrarse con</span>
                                </div>

                                <div className="lg-ref-google-container">
                                    <GoogleSignInButton
                                        theme={isDark ? 'filled_black' : 'outline'}
                                        onSuccess={handleGoogleSuccess}
                                        onError={triggerError}
                                    />
                                </div>

                                <div className="lg-ref-footer">
                                    <span>¿YA TIENES UNA CUENTA?</span>
                                    <button
                                        type="button"
                                        className="lg-ref-switch-btn"
                                        onClick={() => handleSwitchMode('login')}
                                    >
                                        INICIA SESIÓN
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
