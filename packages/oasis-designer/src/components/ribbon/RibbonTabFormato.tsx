import React from 'react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { FORMATS } from './constants';
import { RibbonButton, RibbonGroup } from '../ui/RibbonUI';

export interface RibbonTabFormatoProps {
  formData: any;
  set: (key: string, value: any) => void;
}

const RibbonTabFormato: React.FC<RibbonTabFormatoProps> = ({ formData, set }) => {
  
  // Variantes para los botones de formato
  const buttonVariants = {
    hover: { scale: 1.05, backgroundColor: "#f3f0ff" },
    tap: { scale: 0.95 },
    active: { 
      scale: 1, 
      backgroundColor: "#ede9fe", 
      borderColor: "#5b2ea6",
      boxShadow: "0 4px 12px rgba(91, 46, 166, 0.15)" 
    }
  };

  return (
    <RibbonGroup label="Dimensiones del Post">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
      }}>
        {Object.entries(FORMATS).map(([key, format]) => {
          const isActive = formData.format === key;
          
          return (
            <RibbonButton
              key={key}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              animate={isActive ? "active" : "initial"}
              onClick={() => set('format', key)}
              title={`${format.label} — ${format.desc}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                width: '65px',
                height: '55px',
                border: '1px solid #dee2e6',
                borderRadius: '10px',
                background: '#f8f9fa',
                color: isActive ? '#5b2ea6' : '#64748b',
                position: 'relative',
                outline: 'none',
                transition: 'border-color 0.2s, color 0.2s'
              }}
            >
              <i className={`bi ${format.icon}`} style={{ 
                fontSize: '1.1rem',
                color: isActive ? '#5b2ea6' : '#94a3b8'
              }}></i>
              
              <span style={{ 
                fontSize: '0.6rem', 
                fontWeight: isActive ? 800 : 600,
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>
                {format.label}
              </span>

              {/* Punto indicador orgánico para estado activo */}
              {isActive && (
                <motion.div
                  layoutId="activeDot"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '6px',
                    height: '6px',
                    background: '#5b2ea6',
                    borderRadius: '50%'
                  }}
                />
              )}
            </RibbonButton>
          );
        })}
      </div>
    </RibbonGroup>
  );
};

export default RibbonTabFormato;