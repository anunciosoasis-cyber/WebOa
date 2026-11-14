import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    CheckCircle2,
    Ghost,
    Heart,
    HeartHandshake,
    Home,
    Info,
    Lock,
    MessageSquare,
    RotateCcw,
    Send,
    ShieldCheck,
    Truck
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToast } from '../components/Toast';
import PageHero from '../components/PageHero';

const REQUEST_TYPES = [
    { id: 'oracion', label: 'Oración', icon: MessageSquare },
    { id: 'visitacion', label: 'Visitación', icon: Home },
    { id: 'medica', label: 'Asistencia Médica', icon: Activity },
    { id: 'social', label: 'Ayuda Social', icon: Heart },
    { id: 'traslado', label: 'Traslado', icon: Truck }
];

const Peticiones = ({ inline = false }) => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [acceptedPolicy, setAcceptedPolicy] = useState(true);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        tipo: 'oracion',
        mensaje: ''
    });

    const navigate = useNavigate();
    const { showToast } = useToast();

    const colors = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        softBg: '#F8F9FC',
    };

    const handleFinalSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!acceptedPolicy) {
            showToast('Debes aceptar el tratamiento de datos (Ley 1581 de 2012) para continuar.', 'warning');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                category: formData.tipo,
                description: formData.mensaje,
                is_anonymous: isAnonymous,
                contact_name: isAnonymous ? null : formData.nombre,
                contact_phone: isAnonymous ? null : formData.telefono,
            };
            await apiClient.post('/requests', payload);
            setSubmitted(true);
        } catch (error) {
            showToast('Hubo un error al enviar tu solicitud.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            nombre: '',
            telefono: '',
            tipo: 'oracion',
            mensaje: ''
        });
        setIsAnonymous(false);
        setSubmitted(false);
    };

    const renderFormCard = () => (
        <div
            style={{
                background: '#FFFFFF',
                borderRadius: inline ? '22px' : '30px',
                padding: inline ? '22px' : '34px 32px',
                boxShadow: inline
                    ? 'none'
                    : '0 26px 60px -16px rgba(18, 12, 31, 0.16), inset 0 1px 0 rgba(255,255,255,0.95)',
                border: inline ? 'none' : '1px solid rgba(18, 12, 31, 0.06)',
                width: '100%'
            }}
        >
            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.form
                        key="single-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleFinalSubmit}
                        style={{ textAlign: 'left' }}
                    >
                        {/* 1. TIPO DE PETICIÓN */}
                        <div style={{ marginBottom: '22px' }}>
                            <label className="pet-label">1. ¿Cómo podemos apoyarte?</label>
                            <div className="pet-type-grid">
                                {REQUEST_TYPES.map((opt) => {
                                    const Icon = opt.icon;
                                    const active = formData.tipo === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tipo: opt.id })}
                                            className={`pet-type-pill ${active ? 'active' : ''}`}
                                            style={{
                                                background: active ? colors.deepPurple : '#F8F9FC',
                                                color: active ? '#FFFFFF' : colors.deepPurple,
                                                borderColor: active ? colors.deepPurple : 'rgba(18, 12, 31, 0.08)',
                                                boxShadow: active ? '0 8px 20px rgba(18, 12, 31, 0.18)' : 'none'
                                            }}
                                        >
                                            <Icon size={16} color={active ? colors.accent : colors.deepPurple} />
                                            <span>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. MODO INCÓGNITO + DATOS DE CONTACTO */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                                <label className="pet-label" style={{ margin: 0 }}>2. Tus datos</label>
                                <button
                                    type="button"
                                    onClick={() => setIsAnonymous(!isAnonymous)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '7px',
                                        padding: '7px 14px',
                                        borderRadius: '999px',
                                        border: `1px solid ${isAnonymous ? colors.deepPurple : 'rgba(18, 12, 31, 0.12)'}`,
                                        background: isAnonymous ? colors.deepPurple : '#F8F9FC',
                                        color: isAnonymous ? '#FFFFFF' : 'rgba(18, 12, 31, 0.72)',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Ghost size={14} color={isAnonymous ? colors.accent : 'currentColor'} />
                                    {isAnonymous ? 'Modo incógnito activo' : 'Enviar como incógnito'}
                                </button>
                            </div>

                            <AnimatePresence initial={false}>
                                {isAnonymous ? (
                                    <motion.div
                                        key="anon-note"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div
                                            style={{
                                                padding: '12px 15px',
                                                borderRadius: '14px',
                                                background: 'rgba(245, 158, 11, 0.1)',
                                                border: '1px solid rgba(245, 158, 11, 0.28)',
                                                color: '#92400E',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <Info size={16} style={{ flexShrink: 0, color: colors.accent }} />
                                            <span>
                                                Tu petición se enviará de forma privada sin datos personales; <b>no podremos contactarte</b> de regreso.
                                            </span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="identity-fields"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="pet-fields-row">
                                            <div>
                                                <input
                                                    required={!isAnonymous}
                                                    type="text"
                                                    className="pet-input"
                                                    placeholder="Tu nombre completo"
                                                    value={formData.nombre}
                                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    required={!isAnonymous}
                                                    type="tel"
                                                    className="pet-input"
                                                    placeholder="WhatsApp / Teléfono"
                                                    value={formData.telefono}
                                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 3. MENSAJE */}
                        <div style={{ marginBottom: '18px' }}>
                            <label className="pet-label">3. Tu petición o mensaje</label>
                            <textarea
                                required
                                className="pet-input pet-textarea"
                                placeholder="Cuéntanos por qué podemos orar o cómo podemos ayudarte..."
                                value={formData.mensaje}
                                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                            />
                        </div>

                        {/* 4. CONSENTIMIENTO INTEGRADO (LEY 1581) */}
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px 14px',
                                borderRadius: '14px',
                                backgroundColor: '#F8F9FC',
                                border: '1px solid rgba(18, 12, 31, 0.06)',
                                marginBottom: '20px',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                color: 'rgba(18, 12, 31, 0.72)',
                                lineHeight: 1.45
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={acceptedPolicy}
                                onChange={(e) => setAcceptedPolicy(e.target.checked)}
                                style={{
                                    marginTop: '3px',
                                    accentColor: colors.deepPurple,
                                    width: '16px',
                                    height: '16px',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            />
                            <span>
                                Acepto el tratamiento de mis datos personales según la <b>Ley 1581 de 2012</b> para la atención pastoral de mi solicitud.
                            </span>
                        </label>

                        {/* 5. BOTÓN ENVIAR */}
                        <button type="submit" disabled={loading} className="pet-submit-btn">
                            {loading ? 'ENVIANDO...' : 'ENVIAR PETICIÓN'} <Send size={17} />
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        key="success-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '26px 10px' }}
                    >
                        <div
                            style={{
                                width: '74px',
                                height: '74px',
                                borderRadius: '24px',
                                backgroundColor: 'rgba(245, 158, 11, 0.14)',
                                border: '1px solid rgba(245, 158, 11, 0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px'
                            }}
                        >
                            <CheckCircle2 size={38} color={colors.accent} />
                        </div>
                        <h2
                            style={{
                                fontFamily: 'Moonrising, sans-serif',
                                fontSize: '1.65rem',
                                color: colors.deepPurple,
                                margin: '0 0 10px 0'
                            }}
                        >
                            ¡Petición Recibida!
                        </h2>
                        <p
                            style={{
                                color: 'rgba(18, 12, 31, 0.68)',
                                fontSize: '0.94rem',
                                lineHeight: 1.6,
                                maxWidth: '380px',
                                margin: '0 auto 24px'
                            }}
                        >
                            Nuestro equipo pastoral y de intercesión estará orando y atendiendo tu caso con prioridad.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="pet-submit-btn"
                                style={{ width: 'auto', padding: '13px 22px', fontSize: '0.8rem' }}
                            >
                                <RotateCcw size={15} /> Enviar otra petición
                            </button>
                            {!inline && (
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    style={{
                                        padding: '13px 22px',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(18, 12, 31, 0.12)',
                                        background: '#F8F9FC',
                                        color: colors.deepPurple,
                                        fontWeight: 800,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Volver al inicio
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    if (inline) {
        return (
            <div style={{ width: '100%' }}>
                {renderFormCard()}
                <style>{sharedCss(colors)}</style>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: colors.softBg, minHeight: '100dvh' }}>
        <PageHero
            id="peticiones"
            eyebrow="Apoyo espiritual"
            title="PETICIONES DE"
            accent="ORACIÓN"
            subtitle="Cuéntanos cómo podemos orar por ti. Te acompañamos con fe y discreción."
            compact
        />
        <div
            style={{
                padding: '0 20px 80px',
                marginTop: '-56px',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2
            }}
        >
            <div className="pet-page-shell">
                {/* Columna Izquierda: Panel Cinematográfico Pastoral */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="pet-hero-panel"
                    style={{
                        background: `linear-gradient(155deg, #1B132E 0%, ${colors.deepPurple} 55%, ${colors.midnight} 100%)`,
                        borderRadius: '30px',
                        padding: '40px 34px',
                        color: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 28px 60px -16px rgba(8, 5, 13, 0.45)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    {/* Subtle gold radial spotlight */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: '-60px',
                            right: '-60px',
                            width: '240px',
                            height: '240px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)',
                            filter: 'blur(30px)',
                            pointerEvents: 'none'
                        }}
                    />

                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <span className="oasis-tag" style={{ marginBottom: '20px' }}>
                            <span className="oasis-tag__dot" /> Estamos contigo
                        </span>

                        <h2
                            style={{
                                fontFamily: 'Moonrising, sans-serif',
                                fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)',
                                lineHeight: 1.1,
                                margin: '0 0 16px 0',
                                letterSpacing: '0.5px'
                            }}
                        >
                            ESTAMOS CONTIGO EN <span style={{ color: colors.accent }}>ORACIÓN</span>
                        </h2>

                        <p
                            style={{
                                color: 'rgba(255, 255, 255, 0.76)',
                                fontSize: '0.96rem',
                                lineHeight: 1.7,
                                margin: '0 0 28px 0'
                            }}
                        >
                            Comparte tu motivo de oración, solicitud de visita o necesidad en un solo paso. Nuestro equipo pastoral te acompaña con fe y discreción.
                        </p>
                    </div>

                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="pet-trust-item">
                            <HeartHandshake size={18} color={colors.accent} style={{ flexShrink: 0 }} />
                            <span>Atención pastoral cercana y oración diaria por cada caso</span>
                        </div>
                        <div className="pet-trust-item">
                            <Lock size={18} color={colors.accent} style={{ flexShrink: 0 }} />
                            <span>Confidencialidad garantizada y opción de envío anónimo</span>
                        </div>
                        <div className="pet-trust-item">
                            <ShieldCheck size={18} color={colors.accent} style={{ flexShrink: 0 }} />
                            <span>Protección de datos conforme a la Ley 1581 de 2012</span>
                        </div>
                    </div>
                </motion.div>

                {/* Columna Derecha: Formulario Único */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                    {renderFormCard()}
                </motion.div>
            </div>

            <style>{sharedCss(colors)}</style>
        </div>
        </div>
    );
};

const sharedCss = (colors) => `
    .pet-page-shell {
        width: 100%;
        max-width: 1120px;
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
        align-items: stretch;
    }
    @media (min-width: 960px) {
        .pet-page-shell {
            grid-template-columns: 0.92fr 1.18fr;
            gap: 28px;
        }
    }
    .pet-label {
        font-size: 0.72rem;
        font-weight: 800;
        color: ${colors.deepPurple};
        opacity: 0.72;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        display: block;
    }
    .pet-type-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .pet-type-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 15px;
        border-radius: 14px;
        border: 1px solid rgba(18, 12, 31, 0.08);
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .pet-type-pill:hover {
        transform: translateY(-2px);
    }
    .pet-fields-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
    }
    @media (min-width: 576px) {
        .pet-fields-row {
            grid-template-columns: 1fr 1fr;
        }
    }
    .pet-input {
        width: 100%;
        padding: 13px 16px;
        border-radius: 15px;
        border: 1.5px solid rgba(18, 12, 31, 0.08);
        background: #F8F9FC;
        color: ${colors.deepPurple};
        font-size: 0.92rem;
        font-weight: 500;
        outline: none;
        transition: border-color 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease;
    }
    .pet-input:focus {
        border-color: ${colors.accent};
        background: #FFFFFF;
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.14);
    }
    .pet-textarea {
        min-height: 112px;
        resize: vertical;
    }
    .pet-submit-btn {
        background: ${colors.deepPurple};
        color: #FFFFFF;
        border: none;
        padding: 16px 24px;
        width: 100%;
        border-radius: 16px;
        font-weight: 800;
        font-size: 0.86rem;
        letter-spacing: 0.8px;
        cursor: pointer;
        transition: all 0.25s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        box-shadow: 0 12px 26px -8px rgba(18, 12, 31, 0.35);
    }
    .pet-submit-btn:hover:not(:disabled) {
        background: ${colors.accent};
        color: ${colors.deepPurple};
        transform: translateY(-2px);
        box-shadow: 0 14px 28px -8px rgba(245, 158, 11, 0.45);
    }
    .pet-submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .pet-trust-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.86);
        font-size: 0.84rem;
        font-weight: 500;
    }
    @font-face {
        font-family: 'Moonrising';
        src: url('/fonts/Moonrising.ttf');
    }
`;

export default Peticiones;
