import React from 'react';

export const ClockPickerModal = ({ value, onChange, onClose }) => {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
                <h6>Seleccionar Hora</h6>
                <input type="time" value={value || ''} onChange={e => { onChange(e.target.value); onClose(); }} className="form-control" />
            </div>
        </div>
    );
};

export const CalendarPickerModal = ({ value, onChange, onClose }) => {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
                <h6>Seleccionar Fecha</h6>
                <input type="date" value={value || ''} onChange={e => { onChange(e.target.value); onClose(); }} className="form-control" />
            </div>
        </div>
    );
};
