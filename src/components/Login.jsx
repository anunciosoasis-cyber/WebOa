import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import logoImg from '../img/logos/LOGO1.png';
import oasisCommunityImg from '../img/comunidad-oasis.jpg';
import '../styles/login.css';

const STORAGE_KEY = 'oasis_known_accounts';
const LEAVE_MS = 620; // obturador se cierra (0.42 s) y el logo alcanza a brillar

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Login Oasis cinematográfico:
 * - La foto de la comunidad a pantalla completa, con zoom lento, gradación cálida y viñeta
 * - Bienvenida sobre la imagen y una sola tarjeta de vidrio oscuro (sin cortes ni cambios de tema)
 * - Recuperación de contraseña por email e inicio de sesión con Google
 */
export default function Login() {
    const { signIn, signUp, requestPasswordReset } = useAuth();
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
        const prev = document.title;
        document.title = 'Acceso miembros · Iglesia Adventista Oasis';
        return () => { document.title = prev; };
    }, []);

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
        <div className="lg" data-leaving={leaving}>
            {/* Escena: la comunidad Oasis a pantalla completa */}
            <div className="lg-scene" aria-hidden="true">
                <img src={oasisCommunityImg} alt="" className="lg-scene-img" />
                <div className="lg-scene-shade" />
            </div>

            {/* Cortina de transición */}
            <div className="lg-curtain" aria-hidden="true">
                <img src={logoImg} alt="" />
            </div>

            {/* Barra superior de navegación rápida */}
            <header className="lg-top lg-in" style={{ '--i': 0 }}>
                <Link to="/" className="lg-chip">
                    <ArrowLeft size={15} /> Volver al sitio
                </Link>
            </header>

            {/* Bienvenida sobre la foto */}
            <section className="lg-hero lg-in" style={{ '--i': 1 }}>
                <span className="lg-hero-kicker">Iglesia Adventista Oasis · Medellín</span>
                <h1 className="lg-hero-title">Bienvenido<br />a casa</h1>
                <p className="lg-hero-text">El espacio de quienes sirven: ministerios, anuncios, transmisión y más.</p>
            </section>

            <main className="lg-card lg-in" style={{ '--i': 2 }}>
                <div className="lg-card-head">
                    <img src={logoImg} alt="" className="lg-card-logo" />
                    <div>
                        <h2 className="lg-card-title">
                            {view === 'register' ? 'Crear cuenta' : view === 'forgot' ? 'Recuperar contraseña' : 'Acceso miembros'}
                        </h2>
                        <p className="lg-card-sub">
                            {view === 'register' ? 'Únete a la plataforma de la iglesia' : view === 'forgot' ? 'Te enviaremos un enlace a tu correo' : 'Ingresa con tu cuenta de Oasis'}
                        </p>
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
                                            Correo electrónico
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
                                            Contraseña
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
                                        'Ingresar'
                                    )}
                                </button>

                                <div className="lg-ref-divider">
                                    <span>o continuar con</span>
                                </div>

                                <div className="lg-ref-google-container">
                                    <GoogleSignInButton
                                        theme="filled_black"
                                        onSuccess={handleGoogleSuccess}
                                        onError={triggerError}
                                    />
                                </div>

                                <div className="lg-ref-footer">
                                    <span>¿No tienes cuenta?</span>
                                    <button
                                        type="button"
                                        className="lg-ref-switch-btn"
                                        onClick={() => handleSwitchMode('register')}
                                    >
                                        Regístrate
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── MODO 2: RECUPERACIÓN DE CONTRASEÑA ── */}
                        {view === 'forgot' && (
                            <form className="lg-ref-form" onSubmit={handleForgotPasswordSubmit}>

                                {!recoverySent ? (
                                    <>
                                        <div className="lg-ref-group">
                                            <label htmlFor="lg-rec-email" className="lg-ref-label">
                                                Correo electrónico
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
                                                'Enviar enlace'
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
                                            Usar otro correo
                                        </button>
                                    </div>
                                )}

                                <div className="lg-ref-footer">
                                    <button
                                        type="button"
                                        className="lg-ref-back-link"
                                        onClick={() => handleSwitchMode('login')}
                                    >
                                        ← Volver a iniciar sesión
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── MODO 3: REGISTRO ── */}
                        {view === 'register' && (
                            <form className="lg-ref-form" onSubmit={handleSubmit}>

                                <div className="lg-ref-group">
                                    <label htmlFor="lg-reg-name" className="lg-ref-label">
                                        Nombre completo
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
                                        Correo electrónico
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
                                        Contraseña
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
                                        Confirmar contraseña
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
                                        'Crear cuenta'
                                    )}
                                </button>

                                <div className="lg-ref-divider">
                                    <span>o registrarse con</span>
                                </div>

                                <div className="lg-ref-google-container">
                                    <GoogleSignInButton
                                        theme="filled_black"
                                        onSuccess={handleGoogleSuccess}
                                        onError={triggerError}
                                    />
                                </div>

                                <div className="lg-ref-footer">
                                    <span>¿Ya tienes cuenta?</span>
                                    <button
                                        type="button"
                                        className="lg-ref-switch-btn"
                                        onClick={() => handleSwitchMode('login')}
                                    >
                                        Inicia sesión
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
