import React from 'react';
import { Upload, Navigation, HelpCircle, Menu, X, FolderOpen, Users, Search } from 'lucide-react';
import PixelButton from '../ui/PixelButton';

export default function FloatingControls({
    onUpload,
    onFindPath,
    onClearPath,
    onOpenSettings,
    onOpenHelp,
    onToggleCommunities,
    showCommunities,
    hasPath,
    onToggleSearch,
    isSearchOpen
}) {
    // Shared container class for standard width
    const containerClass = "flex flex-col gap-3 z-30 pointer-events-auto absolute top-4 right-4";

    const buttonClass = "w-12 h-12 flex items-center justify-center p-0";
    const iconSize = 24;

    // Active state class: Inverted colors (Dark BG, White Text) + Hover adjustment (Red Text)
    // Using !important to override PixelButton default classes
    // Active state class: Inverted colors (Dark BG, White Text) + Hover adjustment (Red Text)
    // Using !important to override PixelButton default classes
    const activeBtnClass = "!bg-slate-800 !text-white shadow-none translate-x-[1px] translate-y-[1px] !hover:bg-slate-800 !hover:text-red-500";

    return (
        <div className={containerClass}>
            {/* Search Toggle */}
            <div className="relative group">
                <PixelButton
                    onClick={onToggleSearch}
                    // active prop removed to allow full override via className
                    className={`${buttonClass} ${isSearchOpen ? activeBtnClass : ''}`}
                    title="" // Remove native tooltip to avoid double
                >
                    {isSearchOpen ? <X size={iconSize} /> : <Search size={iconSize} />}
                </PixelButton>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 border-2 border-retro-border text-white text-xs font-mono font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-pro-sm z-50 pointer-events-none">
                    {isSearchOpen ? "Close Search" : "Search"}
                </div>
            </div>

            {/* Upload (Primary Action) */}
            <div className="relative group">
                <PixelButton
                    onClick={onUpload}
                    className={buttonClass}
                    title=""
                >
                    <FolderOpen size={iconSize} />
                </PixelButton>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 border-2 border-retro-border text-white text-xs font-mono font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-pro-sm z-50 pointer-events-none">
                    Upload CSV
                </div>
            </div>

            {/* Toggle Communities */}
            <div className="relative group">
                <PixelButton
                    onClick={onToggleCommunities}
                    // active prop removed to allow full override via className
                    className={`${buttonClass} ${showCommunities ? activeBtnClass : ''}`}
                    title=""
                >
                    {showCommunities ? <X size={iconSize} /> : <Users size={iconSize} />}
                </PixelButton>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 border-2 border-retro-border text-white text-xs font-mono font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-pro-sm z-50 pointer-events-none">
                    {showCommunities ? "Hide Clusters" : "Show Clusters"}
                </div>
            </div>

            {/* Find Path */}
            <div className="relative group">
                <PixelButton
                    onClick={onFindPath}
                    className={buttonClass}
                    title=""
                >
                    <Navigation size={iconSize} />
                </PixelButton>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 border-2 border-retro-border text-white text-xs font-mono font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-pro-sm z-50 pointer-events-none">
                    Find Path
                </div>
            </div>

            {/* Clear Path (Conditional) */}
            {hasPath && (
                <div className="relative group">
                    <PixelButton
                        onClick={onClearPath}
                        className={`${buttonClass} bg-red-100 hover:bg-red-200 border-red-900 text-red-900`}
                        title=""
                    >
                        <X size={iconSize} />
                    </PixelButton>
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 border-2 border-retro-border text-white text-xs font-mono font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-pro-sm z-50 pointer-events-none">
                        Clear Path
                    </div>
                </div>
            )}

            {/* Help Button */}
            <div className="relative group">
                <PixelButton
                    onClick={onOpenHelp}
                    className={buttonClass}
                    title=""
                >
                    <HelpCircle size={iconSize} />
                </PixelButton>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 border-2 border-retro-border text-white text-xs font-mono font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-pro-sm z-50 pointer-events-none">
                    Help / Info
                </div>
            </div>

            {/* Sidebar Toggle */}
            <div className="relative group">
                <PixelButton
                    onClick={onOpenSettings}
                    className={buttonClass}
                    title=""
                >
                    <Menu size={iconSize} />
                </PixelButton>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 border-2 border-retro-border text-white text-xs font-mono font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-pro-sm z-50 pointer-events-none">
                    Menu
                </div>
            </div>
        </div>
    );
}
