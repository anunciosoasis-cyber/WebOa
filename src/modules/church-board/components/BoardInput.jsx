import React from 'react';

const BoardInput = ({ label, type = 'text', value, onChange, placeholder, options = [] }) => {
  const baseClasses = "w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all";

  return (
    <div className="flex flex-col gap-2 w-full mb-4">
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
          {label}
        </label>
      )}
      
      {type === 'select' ? (
        <select 
          value={value} 
          onChange={onChange} 
          className={baseClasses}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea 
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseClasses} min-h-[100px]`}
        />
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
};

export default BoardInput;
