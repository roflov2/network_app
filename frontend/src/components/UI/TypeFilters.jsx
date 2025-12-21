import React, { useState } from 'react';
import { Filter, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';

export default function TypeFilters({ availableTypes, selectedTypes, onToggleType, onSelectAll, onDeselectAll }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!availableTypes || availableTypes.length === 0) return null;

    // Calculate type colors (must match graph-logic.js - website brand palette)
    const getTypeColor = (type) => {
        const colors = {
            'Document': '#6B7280',
            'Person': '#0F52BA',         // Sapphire
            'Phone': '#F28500',          // Tangerine
            'Organisation': '#483C32',   // Taupe
            'Organization': '#483C32',   // Taupe
            'Email': '#E0115F',          // Ruby
            'Website': '#0F52BA',        // Sapphire
            'Cryptocurrency': '#F28500', // Tangerine
            'Wallet': '#F28500',         // Tangerine
        };

        if (colors[type]) {
            return colors[type];
        }

        // Secondary color palette (matches graph-logic.js)
        const secondaryPalette = [
            '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899',
            '#6366F1', '#14B8A6', '#A855F7', '#F97316', '#06B6D4',
            '#D946EF', '#84CC16', '#EF4444', '#8B4513', '#4B5563',
        ];

        // Use deterministic hash to select from secondary palette
        let hash = 0;
        for (let i = 0; i < type.length; i++) {
            hash = type.charCodeAt(i) + ((hash << 5) - hash);
        }

        const index = Math.abs(hash) % secondaryPalette.length;
        return secondaryPalette[index];
    };

    return (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            <div
                className="flex items-center justify-between mb-3 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Filter size={16} />
                    Node Types ({selectedTypes.size}/{availableTypes.length})
                </h3>
                {isExpanded && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={onSelectAll}
                            className="text-xs px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                            style={{ color: '#0F52BA' }} // Sapphire
                        >
                            All
                        </button>
                        <button
                            onClick={onDeselectAll}
                            className="text-xs px-2 py-1 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                        >
                            None
                        </button>
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableTypes.map(type => {
                        const isSelected = selectedTypes.has(type);
                        const color = getTypeColor(type);

                        return (
                            <label
                                key={type}
                                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors group"
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleType(type)}
                                    className="w-4 h-4 rounded border-zinc-300 cursor-pointer"
                                    style={{ accentColor: '#0F52BA' }} // Sapphire
                                />
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-sm flex-1">{type}</span>
                                {isSelected ? (
                                    <Eye size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#0F52BA' }} />
                                ) : (
                                    <EyeOff size={14} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
