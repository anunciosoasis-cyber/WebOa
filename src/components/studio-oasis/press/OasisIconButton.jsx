// OasisIconButton.jsx
import React from 'react';

const SIZES = {
  sm: 'w-8 h-8 rounded-lg text-xs',
  md: 'w-10 h-10 rounded-xl text-sm',
  lg: 'w-12 h-12 rounded-2xl text-base',
};

const VARIANTS = {
  default: 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 shadow-sm',
  accent: 'bg-[#F5A623] hover:bg-[#E0961E] text-black font-bold shadow-[0_4px_16px_rgba(245,166,35,0.35)]',
  ghost: 'bg-transparent hover:bg-white/10 text-slate-400 hover:text-white',
  outline: 'border border-white/20 hover:bg-white/10 text-slate-300',
  danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
  success: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30',
};

export const OasisIconButton = ({
  icon,
  children,
  onClick,
  type = 'button',
  size = 'md',
  variant = 'default',
  disabled = false,
  isLoading = false,
  title = '',
  className = '',
  ...props
}) => {
  const content = icon || children;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={`
        inline-flex items-center justify-center shrink-0 select-none
        outline-none cursor-pointer transition-all duration-200 ease-in-out
        active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${SIZES[size] || SIZES.md}
        ${VARIANTS[variant] || VARIANTS.default}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        content
      )}
    </button>
  );
};

export default OasisIconButton;
