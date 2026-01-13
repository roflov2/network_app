import React from 'react';
import { X, Sparkles } from 'lucide-react';

export default function SummaryModal({ content, onClose }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-lg w-full border border-purple-200 dark:border-purple-900 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                            <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-sm logo-font text-purple-900 dark:text-purple-100 mt-1">
                            AI Relationship Summary
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-purple-900/70 hover:bg-purple-100 dark:text-purple-100/70 dark:hover:bg-purple-800/50 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-4 border border-zinc-200 dark:border-zinc-700 font-mono text-xs leading-relaxed text-[#6252F8] dark:text-[#8b7fff] max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
                        {content}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-purple-100 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/20 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs logo-font rounded-md transition-colors shadow-sm"
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
}
