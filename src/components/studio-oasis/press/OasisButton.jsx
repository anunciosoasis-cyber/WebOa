// OasisButton.jsx
import React from 'react';

const SIZES = {
    sm: 'px-5 py-2 text-xs rounded-xl',
    md: 'px-8 py-3 text-sm rounded-2xl',
    lg: 'px-10 py-4 text-base rounded-2xl',
};

export const OasisButton = ({
    children = 'CONECTAR',
    onClick,
    type = 'button',
    size = 'md',
    disabled = false,
    isLoading = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    ...props
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
        /* Layout & Tipografía */
        inline-flex items-center justify-center gap-2
        font-bold tracking-wider uppercase select-none
        border-none outline-none cursor-pointer
        
        /* Color & Sombra base amarilla */
        bg-[#F5A623] text-white
        shadow-[0_8px_24px_rgba(245,166,35,0.45)]
        
        /* Estados interactivos */
        hover:bg-[#E0961E] hover:shadow-[0_10px_28px_rgba(245,166,35,0.55)] hover:-translate-y-0.5
        active:scale-[0.98] active:shadow-[0_4px_12px_rgba(245,166,35,0.35)] active:translate-y-0
        
        /* Deshabilitado */
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F5A623] disabled:hover:shadow-[0_8px_24px_rgba(245,166,35,0.45)] disabled:hover:translate-y-0
        
        /* Transición suave */
        transition-all duration-200 ease-in-out
        
        /* Tamaño dinámico */
        ${SIZES[size] || SIZES.md}
        
        /* Clases adicionales para extensión */
        ${className}
      `}
            {...props}
        >
            {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
};

export default OasisButton;