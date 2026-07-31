import React from 'react';
import { motion } from 'framer-motion';

const AnnouncementOverlay = ({ overlayData, overlayStyle }) => {
    return (
        <motion.div
            key={`announcement-${overlayData.template || 'classic'}-${overlayData.title}-${overlayData.content}`}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            style={{
                ...overlayStyle,
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: overlayData.template === 'ticker' ? 'flex-end' : 'center',
                justifyContent: 'center',
                padding: overlayData.template === 'ticker' ? '0 24px 24px 24px' : '80px',
                zIndex: 10
            }}
        >
            {overlayData.template === 'ticker' ? (
                <div style={{ width: 'min(1800px, 96%)', background: 'linear-gradient(90deg, rgba(17,24,39,0.98), rgba(31,41,55,0.96))', borderRadius: '24px', border: '1px solid rgba(214,184,126,0.22)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                        <div style={{ background: 'linear-gradient(180deg, #D6B87E, #C7A66A)', padding: '18px 24px', display: 'flex', alignItems: 'center', minWidth: '280px' }}>
                            <div>
                                <div style={{ color: '#FFF7ED', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase' }}>Último Aviso</div>
                                <div style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase' }}>{overlayData.title}</div>
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '18px 24px', display: 'flex', alignItems: 'center' }}>
                            <p style={{ color: '#fff', fontSize: '2.3rem', fontWeight: 800, margin: 0, lineHeight: 1.25, whiteSpace: 'pre-line' }}>{overlayData.content}</p>
                        </div>
                    </div>
                </div>
            ) : overlayData.template === 'modern' ? (
                <div style={{ width: 'min(1600px, 94%)', background: 'linear-gradient(135deg, rgba(8,15,34,0.96), rgba(17,24,39,0.90))', borderRadius: '30px', border: '1px solid rgba(214,184,126,0.16)', boxShadow: '0 30px 70px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
                    <div style={{ height: '12px', background: 'linear-gradient(90deg, #D6B87E, #A78BFA, #94A3B8)' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                        <div style={{ background: 'linear-gradient(180deg, #D6B87E, #C7A66A)', padding: '28px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                            <span style={{ color: '#FFF7ED', fontSize: '0.85rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase' }}>Aviso</span>
                            <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', marginTop: '6px' }}>{overlayData.title}</span>
                        </div>
                        <div style={{ padding: '30px 34px' }}>
                            <p style={{ color: '#F8FAFC', fontSize: '2.6rem', fontWeight: 800, margin: 0, lineHeight: 1.22, whiteSpace: 'pre-line' }}>{overlayData.content}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(214,184,126,0.92), rgba(167,139,250,0.80))',
                    padding: '60px 80px',
                    borderRadius: '35px',
                    boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
                    textAlign: 'center',
                    maxWidth: '1400px',
                    width: '100%',
                    border: '2px solid rgba(255,255,255,0.18)'
                }}>
                    <h2 style={{ color: '#FFF7ED', fontSize: '2.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '6px', marginBottom: '25px' }}>
                        📢 {overlayData.title}
                    </h2>
                    <p style={{ color: '#ffffff', fontSize: '3.5rem', fontWeight: 800, margin: 0, lineHeight: 1.3, whiteSpace: 'pre-line' }}>
                        {overlayData.content}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default AnnouncementOverlay;
