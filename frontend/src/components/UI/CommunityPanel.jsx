import React from 'react';
import { Users } from 'lucide-react';

export default function CommunityPanel({ communities, selectedCommunityId, onCommunityClick }) {
    if (!communities || Object.keys(communities).length === 0) {
        return null;
    }

    // Sort communities by size (largest first)
    const sortedCommunities = Object.entries(communities)
        .sort(([, a], [, b]) => b.count - a.count);

    return (
        <div className="w-64 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700 overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-zinc-500" />
                    <h3 className="text-sm font-semibold">
                        Detected Communities
                    </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                    {sortedCommunities.length} clusters found
                </p>
            </div>

            <div className="p-2">
                {sortedCommunities.map(([communityId, stats]) => {
                    const isSelected = selectedCommunityId === communityId;
                    return (
                        <div
                            key={communityId}
                            className={`
                                mb-2 p-3 rounded shadow-sm transition-all cursor-pointer
                                ${isSelected
                                    ? 'bg-blue-100 dark:bg-blue-900/30 shadow-md ring-2 ring-blue-500'
                                    : 'bg-zinc-50 dark:bg-zinc-800 hover:shadow-md'
                                }
                            `}
                            onClick={() => onCommunityClick && onCommunityClick(communityId)}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: stats.color }}
                                    />
                                    <strong className="text-sm">Community {communityId}</strong>
                                </div>
                            </div>
                            <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                <div>{stats.count} nodes</div>
                                <div className="text-zinc-500 dark:text-zinc-500 mt-1">
                                    Modularity-based grouping
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700">
                <div className="font-medium mb-1">Louvain Algorithm</div>
                <div>Detects communities by optimizing network modularity</div>
            </div>
        </div>
    );
}
