import React from 'react';
import { Upload, Navigation, HelpCircle, Menu, X, FolderOpen, Users } from 'lucide-react';

export default function FloatingControls({
    onUpload,
    onFindPath,
    onClearPath,
    onOpenSettings,
    onOpenHelp,
    onToggleCommunities,
    showCommunities,
    hasPath
}) {
    const btnClass = "p-3 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative group";

    // Active state style for toggles
    const activeClass = "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";

    return (
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-30 pointer-events-auto">
            {/* Upload (Primary Action) */}
            <button onClick={onUpload} className={btnClass} title="Upload Data">
                <FolderOpen size={20} />
                <span className="absolute right-full mr-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Upload CSV
                </span>
            </button>

            {/* Toggle Communities */}
            <button
                onClick={onToggleCommunities}
                className={`${btnClass} ${showCommunities ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : ''}`}
                title={showCommunities ? "Hide Communities" : "Show Communities"}
            >
                {showCommunities ? <X size={20} /> : <Users size={20} />}
                <span className="absolute right-full mr-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {showCommunities ? "Hide Communities" : "Show Communities"}
                </span>
            </button>

            {/* Find Path */}
            <button onClick={onFindPath} className={btnClass} title="Find Path">
                <Navigation size={20} />
                <span className="absolute right-full mr-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Find Path
                </span>
            </button>

            {/* Clear Path (Conditional) */}
            {hasPath && (
                <button onClick={onClearPath} className={`${btnClass} bg-red-50 text-red-600 border-red-200 hover:bg-red-100`} title="Clear Path">
                    <X size={20} />
                    <span className="absolute right-full mr-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Clear Path
                    </span>
                </button>
            )}

            {/* Help Button */}
            <button onClick={onOpenHelp} className={btnClass} title="Help / Info">
                <HelpCircle size={20} />
                <span className="absolute right-full mr-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Help / Info
                </span>
            </button>

            {/* Sidebar Toggle */}
            <button onClick={onOpenSettings} className={btnClass} title="Show Controls">
                <Menu size={20} />
                <span className="absolute right-full mr-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Show Controls
                </span>
            </button>
        </div>
    );
}
