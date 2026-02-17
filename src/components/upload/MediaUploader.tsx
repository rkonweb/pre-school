"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Video, Upload, X, Loader2, CheckCircle, AlertCircle, Film } from "lucide-react";
import { toast } from "sonner";
import { UPLOAD_LIMITS } from "@/lib/gcs-config";

interface MediaUploaderProps {
    type: "PHOTO" | "VIDEO";
    onUploadComplete: (url: string) => void;
    onCancel?: () => void;
    folder?: 'homework' | 'worksheets' | 'videos' | 'voice-notes' | 'admissions' | 'branding';
}

export default function MediaUploader({ type, onUploadComplete, onCancel, folder }: MediaUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const isImage = type === "PHOTO";
        const allowedTypes = isImage ? UPLOAD_LIMITS.allowedImageTypes : UPLOAD_LIMITS.allowedVideoTypes;

        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error(`Please select a valid ${type.toLowerCase()} file`);
            return;
        }

        // Validate file size
        const maxSize = isImage ? UPLOAD_LIMITS.maxImageSize : UPLOAD_LIMITS.maxVideoSize;
        if (selectedFile.size > maxSize) {
            toast.error(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`);
            return;
        }

        // Validate video duration
        if (type === "VIDEO") {
            const duration = await getVideoDuration(selectedFile);
            if (duration > UPLOAD_LIMITS.maxVideoDuration) {
                toast.error(`Video too long. Max duration: ${UPLOAD_LIMITS.maxVideoDuration}s`);
                return;
            }
        }

        setFile(selectedFile);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
    };

    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if needed
                    const maxWidth = 1920;
                    const maxHeight = 1080;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    const fileType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Compression failed'));
                        },
                        fileType,
                        0.8
                    );
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            let fileToUpload: Blob = file;

            // Compress image
            if (type === "PHOTO") {
                setIsCompressing(true);
                fileToUpload = await compressImage(file);
                setIsCompressing(false);
            }

            // Convert to base64 for API upload
            const base64 = await blobToBase64(fileToUpload);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Upload to server
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: base64,
                    fileName: file.name,
                    contentType: fileToUpload.type,
                    folder: folder || (type === "PHOTO" ? 'homework' : 'videos'),
                }),
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || response.statusText || 'Upload failed');
            }

            const data = await response.json();
            setUploadProgress(100);

            setTimeout(() => {
                onUploadComplete(data.url);
                toast.success('Upload successful!');
            }, 500);

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Upload failed');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleCancel = () => {
        setFile(null);
        setPreview("");
        setUploadProgress(0);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onCancel?.();
    };

    return (
        <div className="space-y-4">
            {!file ? (
                /* @ts-ignore */
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-blue-300 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={type === "PHOTO" ? "image/*" : "video/*"}
                        onChange={handleFileSelect}
                        className="hidden"
                        capture={type === "PHOTO" ? "environment" : "user"}
                    />

                    <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-200">
                        {type === "PHOTO" ? (
                            <Camera className="h-7 w-7 text-white" />
                        ) : (
                            <Video className="h-7 w-7 text-white" />
                        )}
                    </div>

                    <h3 className="text-sm font-black text-zinc-900 mb-1">
                        {type === "PHOTO" ? "Take or Upload Photo" : "Record or Upload Video"}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                        {type === "PHOTO"
                            ? "Max 5MB • JPG, PNG, WebP"
                            : "Max 15s • MP4, WebM"}
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {/* Preview */}
                    <div className="relative rounded-xl overflow-hidden bg-zinc-900">
                        {preview ? (
                            type === "PHOTO" ? (
                                <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
                            ) : (
                                <video src={preview} controls className="w-full h-40" />
                            )
                        ) : (
                            <div className="w-full h-40 flex items-center justify-center text-zinc-500">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        )}

                        {!isUploading && (
                            <button
                                onClick={handleCancel}
                                className="absolute top-2 right-2 h-8 w-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <X className="h-4 w-4 text-white" />
                            </button>
                        )}
                    </div>

                    {/* File Info */}
                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                        <div className="flex items-center gap-3">
                            {type === "PHOTO" ? (
                                <Camera className="h-4 w-4 text-zinc-400" />
                            ) : (
                                <Film className="h-4 w-4 text-zinc-400" />
                            )}
                            <div>
                                <p className="font-black text-zinc-900 text-xs truncate max-w-[150px]">{file.name}</p>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="space-y-3">
                            {isCompressing && (
                                <div className="flex items-center gap-3 text-blue-600">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="font-bold text-sm">Compressing image...</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-zinc-700">Uploading...</span>
                                    <span className="font-black text-blue-600">{uploadProgress}%</span>
                                </div>
                                <div className="h-3 bg-zinc-200 rounded-full overflow-hidden">
                                    {/* @ts-ignore */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        {...{ className: "h-full bg-gradient-to-r from-blue-500 to-purple-500" } as any}
                                    />
                                </div>
                            </div>

                            {uploadProgress === 100 && (
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-bold text-sm">Upload complete!</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload Button */}
                    {!isUploading && (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleCancel}
                                className="py-2.5 bg-zinc-50 text-zinc-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-zinc-100 hover:bg-zinc-100 transition-colors"
                            >
                                Cancel
                            </button>
                            {/* @ts-ignore */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUpload}
                                className="py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                <Upload className="h-3 w-3" />
                                Upload
                            </motion.button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
