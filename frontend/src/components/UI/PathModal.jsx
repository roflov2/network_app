import React, { useState } from 'react';
import { X, Navigation } from 'lucide-react';

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
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Navigation size={20} className="text-blue-500" />
                        Find Shortest Path
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Node</label>
                        <input
                            list="nodes-list"
                            className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 outline-none transition-all"
                            placeholder="Select start node..."
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Target Node</label>
                        <input
                            list="nodes-list"
                            className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 outline-none transition-all"
                            placeholder="Select target node..."
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                        />
                    </div>

                    <datalist id="nodes-list">
                        {nodes.map(n => (
                            <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                    </datalist>

                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-md transition-colors flex items-center gap-2">
                            <Navigation size={16} />
                            Calculate Path
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
