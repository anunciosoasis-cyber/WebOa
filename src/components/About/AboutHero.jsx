import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, FONT_FAMILY } from './AboutStyles';

const AboutHero = ({ title, content }) => (
  <section style={{ padding: '160px 20px 100px', textAlign: 'center', background: COLORS.midnight, color: '#fff', position: 'relative' }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=3840")', backgroundSize: 'cover' }} />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', zIndex: 2 }}>
      <h1 style={{ fontFamily: FONT_FAMILY.accent, fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>{title}</h1>
      <p style={{ maxWidth: '600px', margin: '20px auto', opacity: 0.7 }}>{content}</p>
    </motion.div>
  </section>
);

export default AboutHero;
