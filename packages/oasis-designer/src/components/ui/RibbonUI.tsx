import React from 'react';
import { motion, MotionProps } from 'framer-motion';

/**
 * Standard Motion Button for the Ribbon Interface
 */
export type RibbonButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & MotionProps & {
  isActive?: boolean;
  activeColor?: string;
};

export const RibbonButton: React.FC<RibbonButtonProps> = ({ 
  children, 
  style, 
  isActive, 
  activeColor = 'var(--text-active, #5b2ea6)', 
  ...props 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        border: 'none',
        background: isActive ? 'rgba(91, 46, 166, 0.08)' : 'transparent',
        color: isActive ? activeColor : 'inherit',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        fontFamily: "'Poppins', sans-serif",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * Standard Grouping Container for Ribbon Tools
 */
export interface RibbonGroupProps {
  children: React.ReactNode;
  label: string;
  width?: string | number;
}

export const RibbonGroup: React.FC<RibbonGroupProps> = ({ children, label, width }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '8px', 
      padding: '0 16px', 
      borderRight: '1px solid rgba(0,0,0,0.06)',
      height: '100%',
      minWidth: width,
      flexShrink: 0,
      justifyContent: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        {children}
      </div>
      <span style={{ 
        fontSize: '0.58rem', 
        color: 'var(--text-primary, #94a3b8)', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        letterSpacing: '1px',
        paddingBottom: '4px',
        fontFamily: "'Poppins', sans-serif"
      }}>
        {label}
      </span>
    </div>
  );
};
