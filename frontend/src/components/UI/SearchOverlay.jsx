import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { buildSearchIndex } from '../../utils/graph-logic';
import { useCamera, useSigma } from '@react-sigma/core';

export default function SearchOverlay({ graph }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    // Memoize index creation so we don't rebuild on every render
    const searchIndex = useMemo(() => {
        if (!graph) return null;
        return buildSearchIndex(graph);
    }, [graph]);

    // We need access to sigma to move camera
    // However, this component is best placed INSIDE SigmaContainer if we want 'useSigma'
    // Or we pass a callback.
    // The Spec structure showed SearchOverlay inside MainCanvas, potentially outside SigmaContainer?
    // If outside, we can't use 'useCamera' directly unless we lift state or use a portal.
    // Actually, 'InteractiveGraph' is the one containing SigmaContainer. 
    // We can make SearchOverlay a child of InteractiveGraph/SigmaContainer 
    // OR we can pass a "onNodeSelect" handler to App, and App passes it to SearchOverlay.
    // Let's implement it as a standalone UI component that takes an 'onSelect' prop.
    return (
        <SearchInput
            query={query}
            setQuery={setQuery}
            results={results}
            setResults={setResults}
            searchIndex={searchIndex}
        // We'll need a way to trigger graph action. 
        // For now, let's export it as a helper that App.jsx renders OVER the graph, 
        // but it might need to trigger Sigma events.
        // Simplest: App passes handleSelectNode(nodeId)
        />
    );
}

// Actual UI Component
export function SearchUI({ onSelectNode, graph }) {
    const [query, setQuery] = useState("");
    const [matches, setMatches] = useState([]);

    const searchIndex = useMemo(() => {
        if (!graph) return null;
        return buildSearchIndex(graph);
    }, [graph]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.length > 1 && searchIndex) {
            const res = searchIndex.search(value);
            setMatches(res.slice(0, 10)); // Top 10
        } else {
            setMatches([]);
        }
    };

    const handleSelect = (item) => {
        onSelectNode(item.id);
        setQuery("");
        setMatches([]);
    };

    return (
        <div className="absolute top-4 left-16 z-30 w-80">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-zinc-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search nodes..."
                    className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md leading-5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm shadow-md"
                />
            </div>

            {matches.length > 0 && (
                <ul className="absolute mt-1 w-full bg-white dark:bg-zinc-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {matches.map((match) => (
                        <li
                            key={match.item.id}
                            onClick={() => handleSelect(match.item)}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                        >
                            <span className="block truncate font-medium">{match.item.label || match.item.id}</span>
                            <span className="block truncate text-xs text-zinc-500">{match.item.type}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
