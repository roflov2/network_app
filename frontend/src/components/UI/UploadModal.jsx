import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUpload }) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = async (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            await processFile(e.target.files[0]);
        }
    };

    const processFile = async (file) => {
        setUploading(true);
        try {
            await onUpload(file);
            onClose();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                    <X size={20} />
                </button>

                <h2 className="text-sm logo-font mb-4 text-zinc-900 dark:text-white mt-2">Upload Network Data</h2>

                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors font-mono ${dragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".csv"
                    />

                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                        <Upload size={40} className="text-zinc-400" />
                        <p className="font-bold text-sm text-zinc-700 dark:text-zinc-200">
                            Drag & Drop your CSV here
                        </p>
                        <p className="text-xs text-zinc-500">
                            or click to browse
                        </p>
                    </div>
                </div>

                <div className="mt-6 mb-2">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase mb-2">Required CSV Structure</h3>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                            <div className="font-bold text-zinc-800 dark:text-zinc-200">Source</div>
                            <div className="col-span-2">Source node ID</div>

                            <div className="font-bold text-zinc-800 dark:text-zinc-200">Target</div>
                            <div className="col-span-2">Target node ID</div>

                            <div className="font-bold text-zinc-800 dark:text-zinc-200">Edge_Type</div>
                            <div className="col-span-2">Relationship (e.g., MENTIONS)</div>

                            <div className="font-bold text-zinc-800 dark:text-zinc-200">Target_Type</div>
                            <div className="col-span-2">Category (e.g., Person)</div>

                            <div className="font-bold text-zinc-800 dark:text-zinc-200">Date</div>
                            <div className="col-span-2">YYYY-MM-DD</div>
                        </div>
                    </div>
                </div>

                {uploading && (
                    <div className="mt-4 text-center text-blue-500 font-bold font-mono text-sm">Processing...</div>
                )}
            </div>
        </div>
    );
}
