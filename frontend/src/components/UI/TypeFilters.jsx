import React, { useState } from 'react';
import { Filter, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { getColorForType } from '../../utils/graph-logic';
import PixelButton from '../UI/PixelButton';

export default function TypeFilters({ availableTypes, selectedTypes, onToggleType, onSelectAll, onDeselectAll, hideColors }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!availableTypes || availableTypes.length === 0) return null;


    return (
        <div className="p-4 border-t-2 border-retro-border bg-retro-paper">
            <div
                className="flex items-center justify-between mb-3 cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-retro-border flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Filter size={14} />
                    Node Types ({selectedTypes.size}/{availableTypes.length})
                </h3>
                {isExpanded && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <PixelButton
                            onClick={onSelectAll}
                            className="px-2 py-1 text-[10px]"
                        >
                            All
                        </PixelButton>
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {availableTypes.map(type => {
                        const isSelected = selectedTypes.has(type);
                        const color = getColorForType(type);

                        return (
                            <label
                                key={type}
                                className="flex items-center gap-2 px-2 py-1.5 border border-transparent hover:bg-slate-100 hover:border-retro-border cursor-pointer transition-colors group"
                            >
                                <div className={`w-3 h-3 flex items-center justify-center border ${isSelected ? 'bg-retro-primary border-retro-border' : 'bg-white border-retro-muted'}`}>
                                    {isSelected && <div className="w-1.5 h-1.5 bg-white" />}
                                </div>

                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleType(type)}
                                    className="hidden" // Custom checkbox above
                                />

                                {!hideColors && (
                                    <div
                                        className="w-2 h-2 rounded-none border border-retro-border flex-shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                )}
                                <span className="font-mono text-xs text-retro-border flex-1 uppercase">{type}</span>
                                {isSelected ? (
                                    <Eye size={12} className="opacity-0 group-hover:opacity-100 text-retro-primary" />
                                ) : (
                                    <EyeOff size={12} className="text-retro-muted opacity-0 group-hover:opacity-100" />
                                )}
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
