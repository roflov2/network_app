import React, { useState, useMemo } from 'react';
import { Download, Eye, EyeOff, Search } from 'lucide-react';
import RetroTable from './RetroTable';
import PixelButton from './PixelButton';

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

    // Define columns for RetroTable
    const columns = activeTab === 'nodes'
        ? [
            { header: 'ID', accessor: 'id' },
            { header: 'Label', accessor: 'label' },
            { header: 'Type', accessor: 'type' }
        ]
        : [
            { header: 'Source', accessor: 'source' },
            { header: 'Target', accessor: 'target' },
            { header: 'Type', accessor: 'type' }
        ];

    // Inverted style for active tabs
    const activeClass = "!bg-slate-800 !text-white shadow-none translate-x-[1px] translate-y-[1px] hover:!bg-slate-800";

    return (
        <div className="flex flex-col h-full bg-retro-paper border-t-2 border-retro-border">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 sticky top-0 bg-retro-paper z-10 border-b border-zinc-200 gap-2">
                <div className="flex gap-2">
                    <PixelButton
                        onClick={() => setActiveTab('nodes')}
                        size="sm"
                        className={`!text-[10px] !px-3 !py-0 h-8 flex items-center justify-center gap-2 ${activeTab === 'nodes' ? activeClass : ''}`}
                    >
                        Nodes ({data.nodes.length})
                    </PixelButton>
                    <PixelButton
                        onClick={() => setActiveTab('edges')}
                        size="sm"
                        className={`!text-[10px] !px-3 !py-0 h-8 flex items-center justify-center gap-2 ${activeTab === 'edges' ? activeClass : ''}`}
                    >
                        Edges ({data.edges.length})
                    </PixelButton>
                </div>

                <div className="flex items-center gap-2">
                    {/* View All Toggle */}
                    {onToggleViewAll && (
                        <PixelButton
                            onClick={onToggleViewAll}
                            active={viewAllData}
                            size="sm"
                            className="!text-[10px] !px-3 !py-0 h-8 flex items-center gap-2"
                            title={viewAllData ? "Show filtered data" : "View all data"}
                        >
                            {viewAllData ? <EyeOff size={12} /> : <Eye size={12} />}
                            <span className="hidden sm:inline">{viewAllData ? 'Filtered' : 'All Data'}</span>
                        </PixelButton>
                    )}

                    {/* CSV Export */}
                    <PixelButton
                        onClick={handleExport}
                        size="sm"
                        className="!text-[10px] !px-3 !py-0 h-8 flex items-center gap-2"
                        title="Download as CSV"
                    >
                        <Download size={12} />
                        <span className="hidden sm:inline">CSV</span>
                    </PixelButton>

                    {/* Search */}
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Filter..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-32 px-2 py-1 pl-7 text-xs font-mono bg-retro-surface border border-retro-border focus:outline-none focus:ring-0 placeholder-retro-muted text-retro-border shadow-pro-sm"
                        />
                        <Search size={12} className="absolute left-2 text-retro-muted" />
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-2">
                <div className="h-full border border-retro-border shadow-pro-sm bg-retro-surface">
                    <RetroTable
                        headers={columns}
                        data={filteredData}
                        onRowClick={(item) => onSelection && onSelection(item, activeTab)}
                        keyField="id" // Works for nodes, RetroTable needs to handle missing id for edges or we gen a key
                    />
                </div>
            </div>
        </div>
    );
}
