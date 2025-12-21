import React from 'react';
import { Maximize, Minimize, Plus, Minus, LocateFixed } from 'lucide-react';

export default function GraphControls({ onZoomIn, onZoomOut, onCenter, onFullscreen, isFullscreen }) {
    const btnClass = "p-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0 flex items-center justify-center transition-colors";

    return (
        <div className="absolute bottom-4 right-4 flex flex-col bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden z-20">
            <button
                onClick={onFullscreen}
                className={btnClass}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button onClick={onZoomIn} className={btnClass} title="Zoom In">
                <Plus size={20} />
            </button>
            <button onClick={onZoomOut} className={btnClass} title="Zoom Out">
                <Minus size={20} />
            </button>
            <button onClick={onCenter} className={btnClass} title="Reset View">
                <LocateFixed size={20} />
            </button>
        </div>
    );
}
