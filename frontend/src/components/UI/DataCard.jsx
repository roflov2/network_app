import React from 'react';

const DataCard = ({ title, children, className = '' }) => {
    return (
        <div className={`border border-retro-border bg-retro-surface shadow-pro ${className}`}>
            {title && (
                <div className="border-b border-retro-border bg-slate-50 px-4 py-2">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-retro-border">
                        {title}
                    </h3>
                </div>
            )}
            <div className="p-0">
                {children}
            </div>
        </div>
    );
};

export default DataCard;
