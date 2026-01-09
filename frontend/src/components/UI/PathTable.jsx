import React from 'react';
import { Route, Download } from 'lucide-react';

// CSV export utility
function exportToCSV(data, filename) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
            const cell = row[h] || '';
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

export default function PathTable({ paths, selectedPathIndex, onSelectPath }) {
    if (!paths || paths.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-zinc-400">
                No paths to display
            </div>
        );
    }

    const handleExport = () => {
        const exportData = paths.map((path, idx) => ({
            path_number: idx + 1,
            path: path.join(' -> '),
            hops: path.length - 1
        }));

        exportToCSV(exportData, `paths-${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-900">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Route size={16} className="text-zinc-500" />
                        <h3 className="text-xs logo-font text-zinc-700 dark:text-zinc-200 mt-1">
                            SHORTEST PATHS ({paths.length})
                        </h3>
                    </div>

                    {/* CSV Export */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-mono"
                        title="Download as CSV"
                    >
                        <Download size={14} />
                        <span>CSV</span>
                    </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    Click a path to highlight it in the graph
                </p>
            </div>

            {/* Path List */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm font-mono">
                    <thead className="bg-zinc-100 dark:bg-zinc-800 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 text-left logo-font text-[10px] text-zinc-600 dark:text-zinc-400">
                                #
                            </th>
                            <th className="px-4 py-2 text-left logo-font text-[10px] text-zinc-600 dark:text-zinc-400">
                                PATH
                            </th>
                            <th className="px-4 py-2 text-left logo-font text-[10px] text-zinc-600 dark:text-zinc-400">
                                HOPS
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paths.map((path, index) => {
                            const isSelected = index === selectedPathIndex;
                            return (
                                <tr
                                    key={index}
                                    onClick={() => onSelectPath(index)}
                                    className={`
                                        cursor-pointer border-b border-zinc-200 dark:border-zinc-700
                                        hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors
                                        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}
                                    `}
                                    style={isSelected ? { borderLeftColor: '#0F52BA' } : {}}
                                >
                                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-2 font-mono text-xs">
                                        {path.map((node, i) => (
                                            <span key={i}>
                                                <span className="text-zinc-800 dark:text-zinc-200">
                                                    {node}
                                                </span>
                                                {i < path.length - 1 && (
                                                    <span className="text-zinc-400 mx-1">-&gt;</span>
                                                )}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                                        {path.length - 1}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
