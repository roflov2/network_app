import React, { useState } from 'react';
import { Users, X, ChevronUp, ChevronDown, Info } from 'lucide-react';
import DataCard from '../UI/DataCard';
import PixelButton from '../UI/PixelButton';

// Icons for Centrality Avatars (SVG Data URIs)
const BRIDGE_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEwIDEzYTVlNSA1IDAgMCAwIDcuNTQgLjU0bDMsM2E1IDUgMCAwIDAgNy4wNy03LjA3bC0xLjcyLTEuNzEiLz48cGF0aCBkPSJNMTQgMTFhNSA1IDAgMCAwLTcuNTQtLjU0bC0zLTNhNSA1IDAgMCAwLTcuMDcgNy4wN2wxLjcyIDEuNzEiLz48L3N2Zz4=";
const HUB_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI2Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMiIvPjwvc3ZnPg==";

export default function CommunityPanel({
    communities,
    selectedCommunityId,
    onCommunityClick,
    onClose,
    variant = 'sidebar', // 'sidebar' | 'bottom'
    sidebarOpen = false,
    sidebarWidth = 0
}) {
    if (!communities || Object.keys(communities).length === 0) {
        return null;
    }

    // Sort communities by size (largest first)
    const sortedCommunities = Object.entries(communities)
        .sort(([, a], [, b]) => b.count - a.count);

    // Bottom variant uses local expanded state
    const [isExpanded, setIsExpanded] = useState(false);
    // Info modal state
    const [showInfo, setShowInfo] = useState(false);

    // Dynamic styles based on variant
    const containerStyle = variant === 'bottom'
        ? {
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: sidebarOpen ? sidebarWidth : 0,
            height: isExpanded ? '16rem' : '2.5rem',
            zIndex: 20
        }
        : {}; // Default sidebar style handled by class

    const containerClass = variant === 'bottom'
        ? "bg-retro-paper border-t-2 border-retro-border shadow-pro flex flex-col transition-all duration-300"
        : "w-64 bg-retro-paper border-l-2 border-retro-border overflow-y-auto";

    const contentClass = variant === 'bottom'
        ? "p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto bg-slate-50"
        : "p-2 space-y-2";

    return (
        <div style={containerStyle} className={containerClass}>
            {/* Context Info Overlay */}
            {showInfo && (
                <div className="absolute inset-0 bg-white/95 z-50 p-6 flex flex-col overflow-y-auto backdrop-blur-none border-2 border-retro-border m-4 shadow-pro">
                    <div className="flex items-center justify-between mb-4 border-b-2 border-retro-border pb-2">
                        <h3 className="font-mono text-lg font-bold uppercase tracking-wide flex items-center gap-2 text-retro-border">
                            <Users size={20} className="text-retro-primary" />
                            Community Intel
                        </h3>
                        <button
                            onClick={() => setShowInfo(false)}
                            className="p-1 hover:bg-slate-200 transition-colors border border-retro-border"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4 text-sm text-retro-border font-mono">
                        <div className="bg-blue-50 p-4 border border-blue-200">
                            <h4 className="font-bold text-blue-900 mb-1 uppercase text-xs">Algorithm: Louvain</h4>
                            <p>
                                Clusters tightly knit nodes. Groups interact more internally than externally.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-retro-border mb-2 uppercase text-xs">Topology Markers</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="border border-retro-border bg-amber-50 p-3 shadow-pro-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 bg-amber-500 flex items-center justify-center shrink-0 border border-retro-border">
                                            <img src={HUB_ICON} alt="Hub" className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-retro-border uppercase text-xs">Hub (Degree)</span>
                                    </div>
                                    <p className="text-xs text-retro-muted">
                                        Local leader. High internal connectivity.
                                    </p>
                                </div>
                                <div className="border border-retro-border bg-violet-50 p-3 shadow-pro-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 bg-violet-500 flex items-center justify-center shrink-0 border border-retro-border">
                                            <img src={BRIDGE_ICON} alt="Bridge" className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-retro-border uppercase text-xs">Bridge (Betweenness)</span>
                                    </div>
                                    <p className="text-xs text-retro-muted">
                                        Global connector. Links distinct clusters.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {variant === 'bottom' && !isExpanded ? (
                /* Collapsed Handle for Bottom Variant */
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full h-full flex items-center justify-between px-4 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Expand Communities"
                >
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-retro-border uppercase">
                        <Users size={14} />
                        <span>Detected Clusters: {sortedCommunities.length}</span>
                    </div>
                    <ChevronUp size={16} className="text-retro-border" />
                </button>
            ) : (
                /* Expanded View */
                <>
                    <div className="p-3 border-b-2 border-retro-border bg-retro-paper flex items-center justify-between shrink-0 h-10">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-retro-primary" />
                            <h3 className="font-mono text-xs font-bold uppercase tracking-wide text-retro-border">
                                Clusters
                            </h3>
                            <button
                                onClick={() => setShowInfo(true)}
                                className="ml-1 text-retro-muted hover:text-retro-primary transition-colors"
                                title="Info"
                            >
                                <Info size={14} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-retro-muted">
                                {sortedCommunities.length} FOUND
                            </span>
                            {variant === 'bottom' && (
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-0.5 hover:bg-slate-200 border border-transparent hover:border-retro-border transition-all"
                                    title="Collapse"
                                >
                                    <ChevronDown size={14} />
                                </button>
                            )}
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="p-0.5 hover:bg-slate-200 border border-transparent hover:border-retro-border transition-all"
                                    title="Close"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={contentClass}>
                        {sortedCommunities.map(([communityId, stats]) => {
                            const isSelected = selectedCommunityId === communityId;
                            return (
                                <div
                                    key={communityId}
                                    className={`
                                        p-3 border transition-all cursor-pointer flex items-center justify-between
                                        ${isSelected
                                            ? 'bg-blue-100 border-retro-border shadow-pro ring-0'
                                            : 'bg-white border-retro-border hover:bg-slate-50 shadow-pro-sm'
                                        }
                                    `}
                                    onClick={() => onCommunityClick && onCommunityClick(communityId)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 border border-retro-border shrink-0"
                                            style={{ backgroundColor: stats.color }}
                                        />
                                        <div className="flex flex-col">
                                            <strong className="font-mono text-xs uppercase text-retro-border">ID: {communityId}</strong>
                                            <span className="font-mono text-[10px] text-retro-muted">{stats.count} nodes</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {variant === 'sidebar' && (
                        <div className="p-4 text-[10px] font-mono text-retro-muted border-t-2 border-retro-border mt-auto uppercase bg-slate-50">
                            <div className="font-bold mb-1 text-retro-border">Algorithm: Louvain</div>
                            <div>Modularity Optimization</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
