import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Timer, Image } from 'lucide-react';

// ─── Fondos predefinidos (exportados para CountdownPage) ─────────────────────
export const COUNTDOWN_PRESETS = [
    { id: 'oasis',  label: 'Oasis Gold', bg: 'linear-gradient(135deg, #08050D 0%, #1a0d00 60%, #3b2000 100%)', overlay: 'rgba(8,5,13,0.55)',  accent: '#F59E0B' },
    { id: 'fire',   label: 'Fuego',      bg: 'linear-gradient(135deg, #1a0000 0%, #6B0000 50%, #c0392b 100%)', overlay: 'rgba(0,0,0,0.50)',    accent: '#FF6B35' },
    { id: 'ocean',  label: 'Océano',     bg: 'linear-gradient(135deg, #000428 0%, #004E92 100%)',              overlay: 'rgba(0,0,0,0.45)',    accent: '#6FB1FC' },
    { id: 'forest', label: 'Bosque',     bg: 'linear-gradient(135deg, #0a2e0a 0%, #134E5E 50%, #1a6b3a 100%)',overlay: 'rgba(0,0,0,0.50)',    accent: '#71B280' },
    { id: 'sunset', label: 'Atardecer',  bg: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #6B2FA0 100%)', overlay: 'rgba(0,0,0,0.45)',   accent: '#C084FC' },
    { id: 'glory',  label: 'Gloria',     bg: 'linear-gradient(135deg, #200122 0%, #6f0000 60%, #8B0050 100%)', overlay: 'rgba(0,0,0,0.50)',   accent: '#F472B6' },
];

const lStyle = {
    fontSize: '0.62rem', fontWeight: 900, color: '#F59E0B',
    textTransform: 'uppercase', letterSpacing: '3px',
    marginBottom: '10px', display: 'block',
};

const inputCss = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '14px', padding: '14px 18px',
    color: '#fff', fontSize: '0.95rem', width: '100%', outline: 'none',
};

// ─── Solo formulario de configuración ────────────────────────────────────────
const CountdownLiveModal = ({ onClose }) => {
    const [minutes, setMinutes]       = useState(5);
    const [seconds, setSeconds]       = useState(0);
    const [message, setMessage]       = useState('¡Iniciamos Transmisión!');
    const [subMessage, setSubMessage] = useState('Prepárense para el culto');
    const [selectedPreset, setSelectedPreset] = useState('oasis');
    const [customBg, setCustomBg]     = useState(null);
    const fileInputRef = useRef();

    const currentPreset = COUNTDOWN_PRESETS.find(p => p.id === selectedPreset) || COUNTDOWN_PRESETS[0];
    const bgStyle = customBg
        ? { backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: currentPreset.bg };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new window.Image();
            img.onload = () => {
                const MAX = 1280;
                let { width, height } = img;
                if (width > MAX || height > MAX) {
                    const ratio = Math.min(MAX / width, MAX / height);
                    width  = Math.round(width  * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width  = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                setCustomBg(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleStart = () => {
        const total = minutes * 60 + seconds;
        if (total <= 0) return;
        const config = { minutes, seconds, message, subMessage, selectedPreset, customBg };
        try {
            localStorage.setItem('oasis_countdown_config', JSON.stringify(config));
        } catch {
            // Si la imagen aún es muy grande, guardar sin imagen personalizada
            localStorage.setItem('oasis_countdown_config', JSON.stringify({ ...config, customBg: null }));
        }
        const w = window.screen.width  || 1280;
        const h = window.screen.height || 720;
        window.open(
            '/countdown-live',
            'oasis_countdown',
            `noopener,noreferrer,width=${w},height=${h},left=0,top=0,menubar=no,toolbar=no,location=no,status=no,scrollbars=no,resizable=yes`
        );
        onClose();
    };

    return createPortal(
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ zIndex: 3000, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ width: '100%', maxWidth: '620px', padding: '20px', maxHeight: '95vh', overflowY: 'auto' }}
            >
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '45px', color: '#fff' }}>

                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-5">
                        <div>
                            <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '4px' }}>
                                Transmisión en Vivo
                            </span>
                            <h2 style={{ fontFamily: 'Moonrising', fontSize: '2rem', margin: '6px 0 0', color: '#fff' }}>
                                CONTADOR <span style={{ color: '#F59E0B' }}>REGRESIVO</span>
                            </h2>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tiempo */}
                    <div className="mb-5">
                        <label style={lStyle}>Duración de la cuenta regresiva</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="number" min="0" max="99"
                                    value={minutes}
                                    onChange={e => setMinutes(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                                    style={{ ...inputCss, textAlign: 'center', fontSize: '2.5rem', fontFamily: 'Moonrising', padding: '10px' }}
                                />
                                <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.6rem', opacity: 0.4, letterSpacing: '2px' }}>MINUTOS</div>
                            </div>
                            <div style={{ fontFamily: 'Moonrising', fontSize: '3rem', color: '#F59E0B', lineHeight: 1, paddingBottom: '18px' }}>:</div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="number" min="0" max="59"
                                    value={seconds}
                                    onChange={e => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                    style={{ ...inputCss, textAlign: 'center', fontSize: '2.5rem', fontFamily: 'Moonrising', padding: '10px' }}
                                />
                                <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.6rem', opacity: 0.4, letterSpacing: '2px' }}>SEGUNDOS</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {[1, 3, 5, 10, 15].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => { setMinutes(m); setSeconds(0); }}
                                        style={{
                                            background: minutes === m && seconds === 0 ? '#F59E0B' : 'rgba(255,255,255,0.06)',
                                            color: minutes === m && seconds === 0 ? '#000' : 'rgba(255,255,255,0.7)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '20px', padding: '4px 14px',
                                            fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer',
                                        }}
                                    >
                                        {m}m
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className="mb-4">
                        <label style={lStyle}>Mensaje principal</label>
                        <input value={message} onChange={e => setMessage(e.target.value)}
                            placeholder="¡Iniciamos Transmisión!" style={inputCss} />
                    </div>
                    <div className="mb-5">
                        <label style={lStyle}>Mensaje secundario</label>
                        <input value={subMessage} onChange={e => setSubMessage(e.target.value)}
                            placeholder="Prepárense para el culto" style={inputCss} />
                    </div>

                    {/* Fondos */}
                    <div className="mb-5">
                        <label style={lStyle}>Fondo de pantalla</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                            {COUNTDOWN_PRESETS.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => { setSelectedPreset(preset.id); setCustomBg(null); }}
                                    style={{
                                        background: preset.bg, color: '#fff',
                                        border: selectedPreset === preset.id && !customBg ? '2px solid #F59E0B' : '2px solid transparent',
                                        borderRadius: '12px', padding: '8px 16px',
                                        fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px',
                                        cursor: 'pointer', textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                                        boxShadow: selectedPreset === preset.id && !customBg ? '0 0 12px rgba(245,158,11,0.5)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {preset.label}
                                </button>
                            ))}
                            <button
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    background: customBg ? `url(${customBg}) center/cover` : 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    border: customBg ? '2px solid #F59E0B' : '2px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px', padding: '8px 16px',
                                    fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    boxShadow: customBg ? '0 0 12px rgba(245,158,11,0.5)' : 'none',
                                }}
                            >
                                <Image size={14} /> {customBg ? '✓ PROPIA' : '+ SUBIR'}
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*"
                                style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>

                        {/* Vista previa */}
                        <div style={{ height: '90px', borderRadius: '16px', overflow: 'hidden', position: 'relative', ...bgStyle }}>
                            <div style={{ position: 'absolute', inset: 0, background: currentPreset.overlay }} />
                            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontFamily: 'Moonrising', color: '#fff', fontSize: 'clamp(0.7rem,2vw,1rem)', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                                    {message || 'Vista previa'}
                                </span>
                                <span style={{ color: currentPreset.accent, fontSize: '0.6rem', marginTop: '4px', opacity: 0.8 }}>
                                    {subMessage}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botón iniciar → abre nueva ventana */}
                    <button
                        onClick={handleStart}
                        disabled={minutes === 0 && seconds === 0}
                        style={{
                            width: '100%', background: '#F59E0B', color: '#000',
                            border: 'none', borderRadius: '50px', padding: '18px',
                            fontSize: '0.95rem', fontWeight: 900, letterSpacing: '3px',
                            cursor: minutes === 0 && seconds === 0 ? 'not-allowed' : 'pointer',
                            opacity: minutes === 0 && seconds === 0 ? 0.4 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Timer size={22} /> INICIAR TRANSMISIÓN
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default CountdownLiveModal;
