import React from 'react';

const PixelButton = ({ children, onClick, active, className = '', ...props }) => {
    return (
        <button
            onClick={onClick}
            className={`
                border border-retro-border shadow-pro-sm
                font-mono text-xs uppercase font-bold
                px-4 py-2
                bg-retro-surface text-retro-border
                transition-all duration-75
                active:shadow-none active:translate-x-[1px] active:translate-y-[1px]
                hover:bg-slate-50
                ${active ? 'bg-slate-100 shadow-none translate-x-[1px] translate-y-[1px]' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
};

export default PixelButton;
