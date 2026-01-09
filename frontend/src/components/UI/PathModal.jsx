import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, ChevronDown } from 'lucide-react';

const NodeSelect = ({ label, value, onChange, nodes, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const node = nodes.find(n => n.id === value);
        if (node) {
            setSelectedNode(node);
            setSearchTerm(node.label || node.id);
        } else if (!value) {
            setSearchTerm('');
            setSelectedNode(null);
        }
    }, [value, nodes]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                // Reset search term to selected value on close if no new selection made
                if (selectedNode) {
                    setSearchTerm(selectedNode.label || selectedNode.id);
                } else if (!value) {
                    setSearchTerm('');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedNode, value]);

    const filteredNodes = nodes.filter(node => {
        const term = searchTerm.toLowerCase();
        return (
            (node.label && node.label.toLowerCase().includes(term)) ||
            node.id.toLowerCase().includes(term)
        );
    }).slice(0, 50); // Limit results for performance

    const handleSelect = (node) => {
        onChange(node.id);
        setSearchTerm(node.label || node.id);
        setIsOpen(false);
    };

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 font-mono">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    className="w-full p-2 pr-8 border border-zinc-300 dark:border-zinc-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 outline-none transition-all text-sm font-mono"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        if (!e.target.value) onChange('');
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>

            {isOpen && filteredNodes.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto font-mono text-sm leading-tight">
                    {filteredNodes.map((node) => (
                        <li
                            key={node.id}
                            onClick={() => handleSelect(node)}
                            className="px-3 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-700/50 last:border-0"
                        >
                            <span className="font-medium truncate">{node.label || node.id}</span>
                            <span className="text-[10px] text-zinc-500 truncate">{node.id}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default function PathModal({ isOpen, onClose, nodes, onFindPath }) {
    const [source, setSource] = useState('');
    const [target, setTarget] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!source || !target) {
            setError("Please select both source and target.");
            return;
        }
        if (source === target) {
            setError("Source and Target must be different.");
            return;
        }
        onFindPath(source, target);
        // Don't close immediately, let App handle result (or error if no path)
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 rounded-t-xl">
                    <h3 className="logo-font text-xs flex items-center gap-2 mt-1">
                        <Navigation size={16} className="text-blue-500" />
                        FIND PATH
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono">
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 text-xs rounded border border-red-200">
                            {error}
                        </div>
                    )}

                    <NodeSelect
                        label="Start Node"
                        value={source}
                        onChange={setSource}
                        nodes={nodes}
                        placeholder="Search start node..."
                    />

                    <NodeSelect
                        label="Target Node"
                        value={target}
                        onChange={setTarget}
                        nodes={nodes}
                        placeholder="Search target node..."
                    />

                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors">
                            CANCEL
                        </button>
                        <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-md transition-colors flex items-center gap-2">
                            <Navigation size={14} />
                            CALCULATE
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
