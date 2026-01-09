import React, { useState } from 'react';
import { Users, X, ChevronUp, ChevronDown, Info } from 'lucide-react';

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

    // Info modal state
    const [showInfo, setShowInfo] = useState(false);

    // Dynamic styles based on variant
    const containerStyle = variant === 'bottom'
        ? {
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: sidebarOpen ? sidebarWidth : 0,
            height: isExpanded ? '16rem' : '2rem', // h-64 : h-8
            zIndex: 20
        }
        : {}; // Default sidebar style handled by class

    const containerClass = variant === 'bottom'
        ? "bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-200 dark:border-zinc-700 shadow-lg flex flex-col transition-all duration-300"
        : "w-64 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700 overflow-y-auto";

    const contentClass = variant === 'bottom'
        ? "p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto"
        : "p-2";

    return (
        <div style={containerStyle} className={containerClass}>
            {/* Context Info Overlay */}
            {showInfo && (
                <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 z-50 p-6 flex flex-col overflow-y-auto backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Users size={20} className="text-blue-600 dark:text-blue-400" />
                            Understanding Communities
                        </h3>
                        <button
                            onClick={() => setShowInfo(false)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">What is a Community?</h4>
                            <p>
                                A community is a densely connected group of nodes. We use the <strong>Louvain Algorithm</strong> to detect these clusters, finding groups that interact more with each other than with the rest of the network.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Togetherness Measures</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="border border-zinc-200 dark:border-zinc-700 p-3 rounded-md">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">Hub (Degree Centrality)</span>
                                    </div>
                                    <p className="text-xs">
                                        The most connected node <em>within</em> the community. Think of it as the "leader" or "center" of the group.
                                    </p>
                                </div>
                                <div className="border border-zinc-200 dark:border-zinc-700 p-3 rounded-md">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">Bridge (Betweenness Centrality)</span>
                                    </div>
                                    <p className="text-xs">
                                        A node that acts as a connector to <em>other</em> communities. It holds the network together by linking different groups.
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
                    className="w-full h-full flex items-center justify-between px-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Expand Communities"
                >
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        <Users size={14} />
                        <span>Communities ({sortedCommunities.length} clusters)</span>
                    </div>
                    <ChevronUp size={16} className="text-zinc-400" />
                </button>
            ) : (
                /* Expanded View */
                <>
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between shrink-0 h-12">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-zinc-500" />
                            <h3 className="text-sm font-semibold">
                                Detected Communities
                            </h3>
                            <button
                                onClick={() => setShowInfo(true)}
                                className="ml-1 text-zinc-400 hover:text-blue-500 transition-colors"
                                title="What is this?"
                            >
                                <Info size={14} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-zinc-500">
                                {sortedCommunities.length} clusters found
                            </p>
                            {variant === 'bottom' && (
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                                    title="Collapse"
                                >
                                    <ChevronDown size={16} />
                                </button>
                            )}
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                                    title="Close Community Mode"
                                >
                                    <X size={16} />
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
                                        p-3 rounded shadow-sm transition-all cursor-pointer flex items-center justify-between
                                        ${isSelected
                                            ? 'bg-blue-100 dark:bg-blue-900/30 shadow-md ring-2 ring-blue-500'
                                            : 'bg-zinc-50 dark:bg-zinc-800 hover:shadow-md'
                                        }
                                    `}
                                    onClick={() => onCommunityClick && onCommunityClick(communityId)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: stats.color }}
                                        />
                                        <div className="flex flex-col">
                                            <strong className="text-sm">Community {communityId}</strong>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{stats.count} nodes</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {variant === 'sidebar' && (
                        <div className="p-4 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 mt-auto">
                            <div className="font-medium mb-1">Louvain Algorithm</div>
                            <div>Detects communities by optimizing network modularity</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
