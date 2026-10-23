import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CustomTimePickerProps {
  onSelect: (time: string) => void;
  onClose: () => void;
  theme: any;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ onSelect, onClose, theme }) => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');
  const [mode, setMode] = useState<'hours' | 'minutes'>('hours');
  
  const clockRef = useRef<HTMLDivElement>(null);

  const handleClockClick = (e: React.MouseEvent) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hours') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      if (h > 12) h = 12;
      setHour(h);
      onSelect(`${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`);
      setTimeout(() => setMode('minutes'), 300);
    } else {
      let m = Math.round(angle / 6);
      if (m === 60) m = 0;
      setMinute(m);
      onSelect(`${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`);
      setTimeout(onClose, 600); // Close after choosing minutes
    }
  };

  const togglePeriod = (p: 'AM' | 'PM') => {
    setPeriod(p);
    onSelect(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${p}`);
  };

  const renderNumbers = () => {
    const numbers = mode === 'hours' ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    return numbers.map((num, i) => {
      const angle = (i * 30) * (Math.PI / 180);
      const radius = 80;
      const x = Math.sin(angle) * radius;
      const y = -Math.cos(angle) * radius;
      const isSelected = mode === 'hours' ? hour === num : minute === num;

      return (
        <div
          key={num}
          style={{
            position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
            transform: 'translate(-50%, -50%)', fontSize: '0.8rem', fontWeight: isSelected ? 800 : 500,
            color: isSelected ? '#fff' : theme.colors.text.primary,
            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', background: isSelected ? '#5b2ea6' : 'transparent',
            zIndex: 2, pointerEvents: 'none'
          }}
        >
          {num}
        </div>
      );
    });
  };

  const handAngle = mode === 'hours' ? (hour % 12) * 30 : minute * 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      style={{
        position: 'absolute', top: '100%', left: 0, marginTop: '8px', zIndex: 3000,
        background: theme.colors.surface, backdropFilter: 'blur(16px)',
        border: `1px solid ${theme.colors.border}`, borderRadius: '24px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)', padding: '20px', width: '260px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        color: theme.colors.text.primary
      }}
    >
      {/* Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <div 
          onClick={() => setMode('hours')}
          style={{ fontSize: '2rem', fontWeight: 800, color: mode === 'hours' ? '#5b2ea6' : theme.colors.text.secondary, cursor: 'pointer', background: mode === 'hours' ? 'rgba(91,46,166,0.1)' : 'transparent', padding: '0 8px', borderRadius: '8px' }}
        >
          {hour.toString().padStart(2, '0')}
        </div>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: theme.colors.text.secondary }}>:</span>
        <div 
          onClick={() => setMode('minutes')}
          style={{ fontSize: '2rem', fontWeight: 800, color: mode === 'minutes' ? '#5b2ea6' : theme.colors.text.secondary, cursor: 'pointer', background: mode === 'minutes' ? 'rgba(91,46,166,0.1)' : 'transparent', padding: '0 8px', borderRadius: '8px' }}
        >
          {minute.toString().padStart(2, '0')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '8px' }}>
          <button onClick={() => togglePeriod('AM')} style={{ border: 'none', background: period === 'AM' ? '#5b2ea6' : 'rgba(0,0,0,0.05)', color: period === 'AM' ? '#fff' : theme.colors.text.secondary, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', cursor: 'pointer' }}>AM</button>
          <button onClick={() => togglePeriod('PM')} style={{ border: 'none', background: period === 'PM' ? '#5b2ea6' : 'rgba(0,0,0,0.05)', color: period === 'PM' ? '#fff' : theme.colors.text.secondary, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', cursor: 'pointer' }}>PM</button>
        </div>
      </div>

      {/* Clock Face */}
      <div 
        ref={clockRef}
        onClick={handleClockClick}
        style={{ 
          width: '200px', height: '200px', borderRadius: '50%', 
          background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
          position: 'relative', cursor: 'pointer', border: `1px solid ${theme.colors.border}`
        }}
      >
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '6px', height: '6px', background: '#5b2ea6', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }} />
        
        {/* Clock Hand */}
        <div style={{
          position: 'absolute', bottom: '50%', left: '50%', width: '2px', height: mode === 'hours' ? '70px' : '85px',
          background: '#5b2ea6', transformOrigin: 'bottom', transform: `translateX(-50%) rotate(${handAngle}deg)`,
          zIndex: 5, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '12px', height: '12px', background: '#5b2ea6', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>

        {renderNumbers()}
      </div>

      <div style={{ borderTop: `1px solid ${theme.colors.border}`, width: '100%', marginTop: '20px', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={onClose}
          style={{ 
            padding: '6px 16px', borderRadius: '8px', border: 'none', 
            background: 'linear-gradient(135deg, #5b2ea6, #00d2f3)', color: '#fff', 
            fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(91,46,166,0.2)'
          }}
        >
          Aceptar
        </button>
      </div>
    </motion.div>
  );
};

export default CustomTimePicker;
