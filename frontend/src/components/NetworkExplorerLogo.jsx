import React from 'react';

const NetworkExplorerLogo = () => {
    return (
        <div className="flex items-center gap-2 select-none">
            <div className="flex flex-col gap-0.5">
                <span className="logo-font logo-color-primary text-sm leading-none tracking-widest">
                    NETWORK
                </span>
                <span className="logo-font logo-color-secondary text-sm leading-none tracking-widest pl-[2px]">
                    EXPLORER
                </span>
            </div>
        </div>
    );
};

export default NetworkExplorerLogo;
