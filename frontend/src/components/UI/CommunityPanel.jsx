import React, { useState } from 'react';
import { Users, X, ChevronUp, ChevronDown } from 'lucide-react';

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
