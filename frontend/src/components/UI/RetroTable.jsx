import React from 'react';

const RetroTable = ({ headers, data, onRowClick, keyField = 'id' }) => {
    return (
        <div className="w-full overflow-x-auto bg-retro-surface">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-retro-paper border-b-2 border-retro-border">
                        {headers.map((col, index) => {
                            const label = typeof col === 'object' ? col.header : col;
                            return (
                                <th
                                    key={index}
                                    className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-retro-border border-r border-retro-border last:border-r-0 font-brand"
                                >
                                    {label}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-retro-border">
                    {data.map((item, rowIndex) => (
                        <tr
                            key={item[keyField] || rowIndex}
                            onClick={() => onRowClick && onRowClick(item)}
                            className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                            {headers.map((col, colIndex) => {
                                const accessor = typeof col === 'object' ? col.accessor : null;
                                const content = accessor ? item[accessor] : item[colIndex]; // Fallback for array data?
                                return (
                                    <td
                                        key={colIndex}
                                        className="px-3 py-2 font-mono text-xs text-retro-border border-r border-retro-border/50 last:border-r-0 truncate max-w-[150px]"
                                        title={typeof content === 'string' ? content : ''}
                                    >
                                        {content}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={headers.length} className="px-3 py-4 text-center text-retro-muted italic font-mono text-xs">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Helper for consistency in cells
export const RetroCell = ({ children, className = '' }) => (
    <td className={`px-3 py-2 font-mono text-sm text-retro-border border-r border-gray-200 last:border-r-0 ${className}`}>
        {children}
    </td>
);

export default RetroTable;
