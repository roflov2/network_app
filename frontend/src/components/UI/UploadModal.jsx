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

                <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Upload Network Data</h2>

                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
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
                        <p className="font-medium text-zinc-700 dark:text-zinc-200">
                            Drag & Drop your CSV here
                        </p>
                        <p className="text-sm text-zinc-500">
                            or click to browse
                        </p>
                    </div>
                </div>

                {uploading && (
                    <div className="mt-4 text-center text-blue-500 font-medium">Processing...</div>
                )}
            </div>
        </div>
    );
}
