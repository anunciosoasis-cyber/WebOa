import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import apiClient from '../../api/client';
import { useToast } from './Toast';

const QuickFormModal = ({ isOpen, onClose, type }) => {
    const { theme } = useTheme();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: ''
    });

    const isPrayer = type === 'prayer';
    const title = isPrayer ? 'Petición de Oración' : '¡Soy Nuevo!';
    const subtitle = isPrayer 
        ? 'Déjanos saber cómo podemos orar por ti. Nuestro equipo estará intercediendo.'
        : 'Nos alegra que estés aquí. Déjanos tus datos para conectarnos contigo.';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/requests', {
                type: isPrayer ? 'prayer' : 'connect',
                status: 'pending',
                data: formData
            });
            showToast(isPrayer ? 'Petición enviada con éxito' : '¡Gracias por conectarte!', 'success');
            onClose();
            setFormData({ name: '', phone: '', message: '' });
            setAcceptedTerms(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            showToast('Hubo un error al enviar tus datos. Intenta nuevamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { y: 50, opacity: 0, scale: 0.95 },
        visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.4 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <motion.div 
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(18, 12, 31, 0.6)',
                            backdropFilter: 'blur(4px)'
                        }}
                    />
                    
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        style={{
                            position: 'relative',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '24px',
                            padding: '40px',
                            width: '100%',
                            maxWidth: '450px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            zIndex: 1
                        }}
                    >
                        <button 
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'transparent',
                                border: 'none',
                                color: '#120C1F',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                opacity: 0.5,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = 1}
                            onMouseOut={e => e.currentTarget.style.opacity = 0.5}
                        >
                            <i className="bi bi-x-circle-fill"></i>
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                color: '#F59E0B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.8rem',
                                margin: '0 auto 15px auto'
                            }}>
                                <i className={isPrayer ? "bi bi-chat-heart" : "bi bi-person-heart"}></i>
                            </div>
                            <h3 style={{ 
                                fontFamily: 'Moonrising, sans-serif', 
                                color: '#120C1F', 
                                margin: '0 0 10px 0',
                                fontSize: '1.5rem'
                            }}>
                                {title}
                            </h3>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                                {subtitle}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#120C1F' }}>
                                    Nombre Completo *
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        backgroundColor: '#F8F9FC',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        fontSize: '0.95rem'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#F59E0B'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                                    placeholder="Escribe tu nombre"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#120C1F' }}>
                                    Teléfono / WhatsApp *
                                </label>
                                <input 
                                    type="tel" 
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        backgroundColor: '#F8F9FC',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        fontSize: '0.95rem'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#F59E0B'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                                    placeholder="+57 300 000 0000"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#120C1F' }}>
                                    {isPrayer ? '¿Cuál es tu petición?' : '¿Tienes algún mensaje adicional?'}
                                </label>
                                <textarea 
                                    rows="3"
                                    required={isPrayer}
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        backgroundColor: '#F8F9FC',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        fontSize: '0.95rem',
                                        resize: 'none'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#F59E0B'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                                    placeholder={isPrayer ? "Escribe aquí tu petición de oración..." : "Comentarios (opcional)"}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '5px' }}>
                                <input 
                                    type="checkbox" 
                                    id="termsToggle"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#F59E0B', width: '16px', height: '16px' }}
                                />
                                <label htmlFor="termsToggle" style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4, cursor: 'pointer' }}>
                                    Autorizo el <strong style={{ color: '#120C1F' }}>tratamiento de mis datos personales</strong> para ser contactado de acuerdo con la política de privacidad de la iglesia.
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading || !acceptedTerms}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    backgroundColor: '#120C1F',
                                    color: '#FFF',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    cursor: loading ? 'wait' : (!acceptedTerms ? 'not-allowed' : 'pointer'),
                                    transition: 'all 0.2s',
                                    marginTop: '10px',
                                    opacity: (loading || !acceptedTerms) ? 0.5 : 1
                                }}
                                onMouseOver={e => (!loading && acceptedTerms) && (e.target.style.backgroundColor = '#F59E0B')}
                                onMouseOut={e => (!loading && acceptedTerms) && (e.target.style.backgroundColor = '#120C1F')}
                            >
                                {loading ? 'Enviando...' : (isPrayer ? 'Enviar Petición' : 'Conectarme')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QuickFormModal;
