import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../GlassCard';
import { Trash2, Pencil, Plus, Collection, X, Inbox } from 'lucide-react';

const AnnouncementsList = ({
    showForm,
    setShowForm,
    announcements,
    handleEdit,
    handleDelete,
    isMobile
}) => {
    const OASIS_COLORS = {
        deepPurple: '#120C1F',
        midnight: '#08050D',
        accent: '#F59E0B',
        glassWhite: 'rgba(255, 255, 255, 0.03)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        success: '#10B981',
        error: '#EF4444'
    };

    return (
        <AnimatePresence>
            {showForm && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999 }}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: isMobile ? '100%' : '400px',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            background: OASIS_COLORS.midnight,
                            borderLeft: `1px solid ${OASIS_COLORS.glassBorder}`,
                            padding: '30px'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div>
                                <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Library</span>
                                <h4 className="mb-0 fw-bold" style={{ fontFamily: 'Moonrising', color: '#fff', fontSize: '1.2rem' }}>MIS <span style={{ color: OASIS_COLORS.accent }}>ANUNCIOS</span></h4>
                            </div>
                            <button className="btn p-0 text-white-50" onClick={() => setShowForm(false)}><X /></button>
                        </div>

                        <div className="flex-grow-1 overflow-auto pe-2 custom-scroll">
                            {announcements.length === 0 ? (
                                <div className="text-center py-5 opacity-25">
                                    <Inbox size={48} className="mb-3" />
                                    <p className="small fw-bold">No hay anuncios guardados</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {announcements.map(ann => (
                                        <GlassCard key={ann.id} style={{ padding: '15px', borderRadius: '20px', border: `1px solid ${OASIS_COLORS.glassBorder}` }}>
                                            <div className="d-flex gap-3">
                                                <div style={{ width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#000' }}>
                                                    {ann.bgImage ? (
                                                        <img src={ann.bgImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                    ) : (
                                                        <div style={{ background: `linear-gradient(135deg, ${ann.gradientStart}, ${ann.gradientEnd})`, width: '100%', height: '100%' }}></div>
                                                    )}
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <h6 className="mb-1 fw-bold text-white text-truncate">{ann.title || 'Sin Título'}</h6>
                                                    <div className="d-flex gap-2 mt-2">
                                                        <button className="btn btn-sm py-1 px-3 rounded-pill" style={{ background: OASIS_COLORS.glassWhite, color: '#fff', fontSize: '0.65rem', fontWeight: 900, border: `1px solid ${OASIS_COLORS.glassBorder}` }} onClick={() => handleEdit(ann)}>
                                                            EDITAR
                                                        </button>
                                                        <button className="btn btn-sm py-1 px-2 rounded-circle" style={{ background: 'rgba(239, 68, 68, 0.1)', color: OASIS_COLORS.error, border: 'none' }} onClick={() => handleDelete(ann.id)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-5 pt-4 border-top" style={{ borderColor: OASIS_COLORS.glassBorder }}>
                            <button className="btn w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2" style={{ background: OASIS_COLORS.accent, color: OASIS_COLORS.midnight, fontSize: '0.8rem' }} onClick={() => { handleEdit(null); setShowForm(false); }}>
                                <Plus size={18} strokeWidth={3} /> CREAR NUEVO
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: ${OASIS_COLORS.glassBorder}; border-radius: 10px; }
            `}</style>
        </AnimatePresence>
    );
};

export default AnnouncementsList;
