import React from 'react';

const BoardButton = ({ children, onClick, type = 'button', variant = 'primary', className = '' }) => {
  const baseClasses = "font-bold px-8 py-3 rounded-full shadow-md transition-all transform hover:scale-105 active:scale-95";
  
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-600 text-slate-900",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "bg-transparent border-2 border-slate-300 text-slate-700 hover:border-slate-800 hover:text-slate-900"
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};

export default BoardButton;
