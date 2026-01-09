import React from 'react';

const StatBox = ({ label, value, subtext }) => {
    return (
        <div className="h-24 bg-retro-surface border border-retro-border shadow-pro-sm p-4 flex flex-col justify-between">
            <span className="font-sans text-xs font-semibold text-retro-muted uppercase tracking-wide">
                {label}
            </span>
            <div className="font-mono text-2xl font-bold text-retro-border truncate">
                {value}
            </div>
            {subtext && (
                <span className="text-[10px] text-gray-400 font-mono">
                    {subtext}
                </span>
            )}
        </div>
    );
};

export default StatBox;
