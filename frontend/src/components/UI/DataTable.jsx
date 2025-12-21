import React, { useState, useMemo } from 'react';
import { Download, Eye, EyeOff } from 'lucide-react';

// CSV export utility
function exportToCSV(data, filename) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
            const cell = row[h] || '';
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(cell).replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export default function DataTable({ graph, fullGraph, viewAllData, onToggleViewAll, onSelection, focusedNode, focusedEdge }) {
    const [activeTab, setActiveTab] = useState('nodes'); // 'nodes' | 'edges'
    const [searchTerm, setSearchTerm] = useState('');

    const data = useMemo(() => {
        if (!graph) return { nodes: [], edges: [] };

        const nodes = graph.nodes().map(node => ({
            id: node,
            ...graph.getNodeAttributes(node)
        }));

        const edges = graph.edges().map(edge => ({
            id: edge,
            source: graph.source(edge),
            target: graph.target(edge),
            ...graph.getEdgeAttributes(edge)
        }));

        return { nodes, edges };
    }, [graph]);

    const filteredData = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (activeTab === 'nodes') {
            return data.nodes.filter(n =>
                n.id.toLowerCase().includes(lowerSearch) ||
                (n.label && n.label.toLowerCase().includes(lowerSearch))
            );
        } else {
            return data.edges.filter(e =>
                e.source.toLowerCase().includes(lowerSearch) ||
                e.target.toLowerCase().includes(lowerSearch)
            );
        }
    }, [data, activeTab, searchTerm]);

    const handleExport = () => {
        const exportData = activeTab === 'nodes'
            ? filteredData.map(n => ({ id: n.id, label: n.label, type: n.type }))
            : filteredData.map(e => ({ source: e.source, target: e.target, type: e.type }));

        exportToCSV(exportData, `${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    };

    if (!graph) return null;

    const showViewAllToggle = fullGraph && !viewAllData; // Only show when not already viewing all

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 sticky top-0 bg-white dark:bg-zinc-800 z-10 border-b border-zinc-100 dark:border-zinc-700 gap-2">
                <div className="flex space-x-1 bg-zinc-100 dark:bg-zinc-700 p-1 rounded">
                    <button
                        onClick={() => setActiveTab('nodes')}
                        className={`px-3 py-1 text-xs font-medium rounded ${activeTab === 'nodes' ? 'bg-white dark:bg-zinc-600 shadow text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-800'}`}
                    >
                        Nodes ({data.nodes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('edges')}
                        className={`px-3 py-1 text-xs font-medium rounded ${activeTab === 'edges' ? 'bg-white dark:bg-zinc-600 shadow text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-800'}`}
                    >
                        Edges ({data.edges.length})
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* View All Toggle */}
                    {onToggleViewAll && (
                        <button
                            onClick={onToggleViewAll}
                            className="flex items-center gap-1 px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                            title={viewAllData ? "Show filtered data" : "View all data"}
                        >
                            {viewAllData ? <EyeOff size={14} /> : <Eye size={14} />}
                            <span>{viewAllData ? 'Filtered' : 'All Data'}</span>
                        </button>
                    )}

                    {/* CSV Export */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        title="Download as CSV"
                    >
                        <Download size={14} />
                        <span>CSV</span>
                    </button>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Filter..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-24 px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-600 rounded bg-transparent dark:text-zinc-200"
                    />
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 font-semibold uppercase">
                        {activeTab === 'nodes' ? (
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Label</th>
                                <th className="px-3 py-2">Type</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="px-3 py-2">Source</th>
                                <th className="px-3 py-2">Target</th>
                                <th className="px-3 py-2">Type</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {filteredData.map((item, idx) => {
                            const isSelected = activeTab === 'nodes'
                                ? item.id === focusedNode
                                : item.id === focusedEdge;

                            return (
                                <tr
                                    key={item.id || idx}
                                    onClick={() => onSelection && onSelection(item, activeTab)}
                                    className={`
                                        hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer
                                        ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4' : ''}
                                    `}
                                    style={isSelected ? { borderLeftColor: '#0F52BA' } : {}}
                                >
                                    {activeTab === 'nodes' ? (
                                        <>
                                            <td className="px-3 py-1.5 truncate max-w-[80px]" title={item.id}>{item.id}</td>
                                            <td className="px-3 py-1.5 truncate max-w-[100px]" title={item.label}>{item.label || '-'}</td>
                                            <td className="px-3 py-1.5 text-zinc-500">{item.type || 'N/A'}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-3 py-1.5 truncate max-w-[80px]" title={item.source}>{item.source}</td>
                                            <td className="px-3 py-1.5 truncate max-w-[80px]" title={item.target}>{item.target}</td>
                                            <td className="px-3 py-1.5 text-zinc-500">{item.type || 'Edge'}</td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-3 py-4 text-center text-zinc-400 italic">No matches found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
