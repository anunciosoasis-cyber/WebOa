import React from 'react';
import { motion } from 'framer-motion';
import { TEMPLATES, FormData } from '../data/templates';
import { useTheme } from '../context/ThemeContext';
import styles from './TemplatesGallery.module.css';

interface TemplatesGalleryProps {
  onSelect: (formData: Partial<FormData>) => void;
}

const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ onSelect }) => {
  const { theme, mode } = useTheme();

  return (
    <div className={`${styles.galleryContainer} ${styles[mode]}`}>
      <header className={styles.header}>
        <motion.h1 
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`${styles.title} ${styles[mode]}`}
        >
          Elige una Plantilla
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`${styles.subtitle} ${styles[mode]}`}
        >
          Selecciona un diseño premium para comenzar a crear tu anuncio.
        </motion.p>
      </header>

      <div className={styles.grid}>
        {TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 + 0.2, ease: "easeOut" }}
            onClick={() => onSelect(template.formData)}
            className={`${styles.card} ${styles[mode]}`}
          >
            {/* Preview Box - represents the background gradient */}
            <div 
              className={styles.previewBox}
              style={{
                background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`
              }}
            >
              <div className={styles.previewText}>
                <h3 
                  className={styles.previewTitle} 
                  style={{ 
                    fontFamily: template.formData.titleFont,
                    color: template.formData.titleColor || '#ffffff'
                  }}
                >
                  {template.formData.title || 'Título'}
                </h3>
                <p 
                  className={styles.previewSubtitle} 
                  style={{ 
                    fontFamily: template.formData.title2Font,
                    color: template.formData.title2Color || 'rgba(255,255,255,0.8)'
                  }}
                >
                  {template.formData.title2 || 'Subtítulo'}
                </p>
              </div>
            </div>

            {/* Template Info */}
            <div className={styles.cardInfo}>
              <h2 className={`${styles.cardTitle} ${styles[mode]}`}>
                {template.name}
              </h2>
              <p className={`${styles.cardDescription} ${styles[mode]}`}>
                {template.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesGallery;
