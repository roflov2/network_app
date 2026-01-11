import React from 'react';
import { X, HelpCircle, MousePointer2, Move, Navigation, Users, Calendar } from 'lucide-react';

export default function HelpModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-700 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                            <HelpCircle size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-sm logo-font text-zinc-900 dark:text-zinc-100 mt-1">
                            Network Guide
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-black hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 font-mono">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        Welcome to the Network Explorer. This interactive tool helps you visualise and analyse complex relationships between entities.
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            Core Interactions
                        </h3>

                        <div className="grid gap-4">
                            <div className="flex gap-4">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md h-fit">
                                    <Move size={18} className="text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Rearrange</h4>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                        <strong>Drag</strong> nodes to adjust the layout and group related entities visually.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md h-fit">
                                    <MousePointer2 size={18} className="text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Focus & Explore</h4>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                        <strong>Click</strong> a node to highlight its direct connections and filter out noise.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md h-fit">
                                    <Navigation size={18} className="text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Find Paths</h4>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                        Use the navigation tool to discover the shortest routes between two specific entities.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md h-fit">
                                    <Users size={18} className="text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Communities</h4>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                        Toggle community detection to identify and visualise distinct clusters within the network.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md h-fit">
                                    <Calendar size={18} className="text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Temporal Distribution</h4>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                        View when network entities appeared over time. Expand the bottom panel to explore trends by year or month.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs logo-font rounded-md hover:opacity-90 transition-opacity"
                    >
                        GOT IT
                    </button>
                </div>
            </div>
        </div>
    );
}
