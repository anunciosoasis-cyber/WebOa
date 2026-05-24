import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Ghost, CheckCircle, Info, MessageSquare, Send, Home, Activity, Heart, Truck } from 'lucide-react';
import apiClient from '../../api/client';
import { useToast } from '../components/Toast';

const Peticiones = () => {
    const [step, setStep] = useState(1); // 1: Privacidad, 2: Tipo de Petición, 3: Formulario final, 4: Éxito
    const [loading, setLoading] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
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
        accent: '#F59E0B',
        softBg: '#F8F9FC',
    };

    const handleFinalSubmit = async (e) => {
        if(e) e.preventDefault();
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
            setStep(4); // Éxito
        } catch (error) {
            showToast('Hubo un error al enviar tu solicitud.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle(colors.softBg)}>
            <AnimatePresence mode="wait">
                
                {/* PASO 1: TRATAMIENTO DE DATOS */}
                {step === 1 && (
                    <motion.div key="p1" initial={anim.init} animate={anim.in} exit={anim.out} style={cardStyle}>
                        <ShieldCheck size={50} color={colors.deepPurple} style={{ opacity: 0.3, marginBottom: '20px' }} />
                        <h2 style={titleStyle}>Tratamiento de <span style={{ color: colors.accent }}>Datos</span></h2>
                        <p style={descStyle}>
                            Para continuar, debes aceptar el tratamiento de tus datos personales según la <b>Ley 1581 de 2012</b>.
                        </p>
                        <div style={flexCol}>
                            <button onClick={() => setStep(2)} className="btn-oasis-primary">ACEPTO Y CONTINUAR</button>
                            <button onClick={() => navigate('/')} style={btnBackText}>Rechazar y volver al inicio</button>
                        </div>
                    </motion.div>
                )}

                {/* PASO 2: SELECCIÓN DE TIPO DE PETICIÓN */}
                {step === 2 && (
                    <motion.div key="p2" initial={anim.init} animate={anim.in} exit={anim.out} style={cardStyle}>
                        <StepHeader onBack={() => setStep(1)} title="¿Qué necesitas?" step="Paso 2 de 3" />
                        <p style={{...descStyle, textAlign: 'left', marginBottom: '20px'}}>Selecciona el tipo de apoyo que buscas:</p>
                        
                        <div style={gridOptions}>
                            {[
                                { id: 'oracion', label: 'Oración', icon: <MessageSquare size={20}/> },
                                { id: 'visitacion', label: 'Visitación', icon: <Home size={20}/> },
                                { id: 'medica', label: 'Asistencia Médica', icon: <Activity size={20}/> },
                                { id: 'social', label: 'Ayuda Social', icon: <Heart size={20}/> },
                                { id: 'traslado', label: 'Traslado', icon: <Truck size={20}/> }
                            ].map(opt => (
                                <div 
                                    key={opt.id}
                                    onClick={() => { setFormData({...formData, tipo: opt.id}); setStep(3); }}
                                    style={optionCard(formData.tipo === opt.id, colors)}
                                >
                                    {opt.icon}
                                    <span>{opt.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* PASO 3: MENSAJE E IDENTIDAD */}
                {step === 3 && (
                    <motion.div key="p3" initial={anim.init} animate={anim.in} exit={anim.out} style={cardStyle}>
                        <StepHeader onBack={() => setStep(2)} title="Detalles finales" step="Paso 3 de 3" />
                        
                        <div style={{ marginBottom: '25px' }}>
                            <div onClick={() => setIsAnonymous(!isAnonymous)} style={toggleStyle(isAnonymous, colors)}>
                                <Ghost size={18} />
                                <span>{isAnonymous ? 'MODO INCÓGNITO ACTIVADO' : '¿ENVIAR COMO INCÓGNITO?'}</span>
                            </div>
                            
                            {isAnonymous && (
                                <div style={anonWarning}>
                                    <Info size={14} />
                                    <span>Al ser incógnito, recibiremos tu petición pero <b>no podremos contactarte</b>.</span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleFinalSubmit} style={{textAlign: 'left'}}>
                            {!isAnonymous && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <div className="form-group">
                                        <label className="oasis-label">Tu Nombre</label>
                                        <input required type="text" className="oasis-input" placeholder="Nombre completo" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label className="oasis-label">WhatsApp / Teléfono</label>
                                        <input required type="tel" className="oasis-input" placeholder="Ej: 3001234567" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                                    </div>
                                </motion.div>
                            )}

                            <div className="form-group">
                                <label className="oasis-label">Tu Petición o Mensaje</label>
                                <textarea required className="oasis-input oasis-textarea" placeholder="Escribe aquí..." value={formData.mensaje} onChange={(e) => setFormData({...formData, mensaje: e.target.value})} />
                            </div>

                            <button type="submit" disabled={loading} className="btn-oasis-primary">
                                {loading ? 'ENVIANDO...' : 'ENVIAR AHORA'} <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* PASO 4: ÉXITO */}
                {step === 4 && (
                    <motion.div key="p4" initial={anim.init} animate={anim.in} style={{...cardStyle, textAlign: 'center'}}>
                        <CheckCircle size={70} color={colors.accent} style={{ marginBottom: '20px' }} />
                        <h2 style={titleStyle}>¡Recibido!</h2>
                        <p style={descStyle}>Tu petición ha sido enviada con éxito. Estaremos tratando tu caso con prioridad.</p>
                        <button onClick={() => navigate('/')} className="btn-oasis-primary">VOLVER AL INICIO</button>
                    </motion.div>
                )}

            </AnimatePresence>

            <style>{`
                .form-group { margin-bottom: 18px; }
                .oasis-label { font-size: 0.65rem; font-weight: 800; color: ${colors.deepPurple}; opacity: 0.5; margin-bottom: 6px; text-transform: uppercase; display: block; margin-left: 10px; }
                .oasis-input { width: 100%; padding: 14px 18px; border-radius: 18px; border: 1.5px solid #f0f0f0; background: #fafafa; font-size: 0.95rem; outline: none; transition: 0.3s; }
                .oasis-input:focus { border-color: ${colors.accent}; background: #fff; }
                .oasis-textarea { height: 100px; resize: none; }
                .btn-oasis-primary { 
                    background: ${colors.deepPurple}; color: #fff; border: none; padding: 18px; width: 100%; border-radius: 20px; 
                    font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px;
                }
                .btn-oasis-primary:hover { background: ${colors.accent}; color: ${colors.deepPurple}; transform: translateY(-2px); }
            `}</style>
        </div>
    );
};

// --- SOPORTE UI ---
const StepHeader = ({ onBack, title, step }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', textAlign: 'left' }}>
        <button onClick={onBack} style={btnIcon}><ArrowLeft size={18} /></button>
        <div>
            <span style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.4 }}>{step}</span>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'Moonrising, sans-serif' }}>{title}</h3>
        </div>
    </div>
);

const containerStyle = (bg) => ({ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bg, padding: '20px' });
const cardStyle = { maxWidth: '500px', width: '100%', background: '#fff', borderRadius: '35px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', textAlign: 'center' };
const titleStyle = { fontFamily: 'Moonrising, sans-serif', fontSize: '1.7rem', color: '#120C1F', margin: '0 0 10px' };
const descStyle = { color: '#777', lineHeight: '1.5', fontSize: '0.9rem', marginBottom: '25px' };
const flexCol = { display: 'flex', flexDirection: 'column', gap: '10px' };
const btnBackText = { background: 'none', border: 'none', color: '#999', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' };
const btnIcon = { background: '#f5f5f5', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'grid', placeItems: 'center' };

const gridOptions = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left' };

const optionCard = (active, colors) => ({
    padding: '15px', borderRadius: '18px', border: `2px solid ${active ? colors.accent : '#f0f0f0'}`,
    background: active ? '#fff' : '#fafafa', cursor: 'pointer', transition: '0.2s',
    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 700, color: colors.deepPurple
});

const toggleStyle = (active, colors) => ({
    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '15px', cursor: 'pointer',
    background: active ? colors.deepPurple : '#f0f0f0', color: active ? '#fff' : '#888', fontWeight: 800, fontSize: '0.7rem'
});

const anonWarning = {
    marginTop: '10px', padding: '10px 15px', borderRadius: '12px', background: '#FFFBEB', color: '#92400E',
    fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left'
};

const anim = { init: { opacity: 0, x: 20 }, in: { opacity: 1, x: 0 }, out: { opacity: 0, x: -20 } };

export default Peticiones;