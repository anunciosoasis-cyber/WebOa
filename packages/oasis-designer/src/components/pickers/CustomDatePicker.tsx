import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CustomDatePickerProps {
  onSelect: (date: string) => void;
  onClose: () => void;
  theme: any;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ onSelect, onClose, theme }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  const days = [];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const offset = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  for (let i = 0; i < offset; i++) {
    days.push(<div key={`empty-${i}`} style={{ width: '32px', height: '32px' }} />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString();
    const isSelected = selectedDate?.toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString();

    days.push(
      <motion.div
        key={d}
        whileHover={{ scale: 1.1, background: 'rgba(91, 46, 166, 0.1)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
          setSelectedDate(date);
          onSelect(date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }));
          setTimeout(onClose, 200); // Small delay for visual feedback
        }}
        style={{
          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem',
          background: isSelected ? 'linear-gradient(135deg, #5b2ea6, #00d2f3)' : 'transparent',
          color: isSelected ? '#fff' : (isToday ? '#5b2ea6' : theme.colors.text.primary),
          fontWeight: isToday || isSelected ? 800 : 500,
          border: isToday && !isSelected ? '1px solid #5b2ea6' : 'none'
        }}
      >
        {d}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      style={{
        position: 'absolute', top: '100%', left: 0, marginTop: '8px', zIndex: 3000,
        background: theme.colors.surface, backdropFilter: 'blur(16px)',
        border: `1px solid ${theme.colors.border}`, borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)', padding: '16px', width: '260px',
        color: theme.colors.text.primary
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5b2ea6' }}><i className="bi bi-chevron-left"></i></button>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.colors.text.primary }}>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5b2ea6' }}><i className="bi bi-chevron-right"></i></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {weekDays.map(wd => (
          <div key={wd} style={{ fontSize: '0.65rem', fontWeight: 700, color: theme.colors.text.secondary, textAlign: 'center' }}>{wd}</div>
        ))}
        {days}
      </div>
    </motion.div>
  );
};

export default CustomDatePicker;
