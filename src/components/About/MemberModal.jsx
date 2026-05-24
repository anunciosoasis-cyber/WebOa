import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { COLORS, FONT_FAMILY } from './AboutStyles';

const MemberModal = ({ member, onClose, getImageUrl }) => (
  <AnimatePresence>
    {member && createPortal(
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(8,5,13,0.98)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)' }} onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} style={{ width: '90vw', maxWidth: 1000, background: COLORS.midnight, borderRadius: 40, overflow: 'hidden', border: `1px solid ${COLORS.glassBorder}` }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 600 }}>
            <div><img src={getImageUrl(member.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            <div style={{ padding: 60, color: '#fff', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 3 }}>{member.role}</span>
              <h2 style={{ fontFamily: FONT_FAMILY.accent, fontSize: '3rem', margin: '20px 0' }}>{member.name}</h2>
              <p>{member.description}</p>
              <div style={{ marginTop: 'auto', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', display: 'flex', gap: 8, letterSpacing: 2 }}><LucideIcons.ShieldCheck size={14} /> Información Protegida</div>
            </div>
          </div>
        </motion.div>
      </motion.div>,
      document.body
    )}
  </AnimatePresence>
);

export default MemberModal;
