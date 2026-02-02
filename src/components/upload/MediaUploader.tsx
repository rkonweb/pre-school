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
}

export default function MediaUploader({ type, onUploadComplete, onCancel }: MediaUploaderProps) {
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

                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Compression failed'));
                        },
                        'image/jpeg',
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
                    folder: type === "PHOTO" ? 'homework' : 'videos',
                }),
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error('Upload failed');
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
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-4 border-dashed border-blue-300 rounded-3xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={type === "PHOTO" ? "image/*" : "video/*"}
                        onChange={handleFileSelect}
                        className="hidden"
                        capture={type === "PHOTO" ? "environment" : "user"}
                    />

                    <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        {type === "PHOTO" ? (
                            <Camera className="h-10 w-10 text-white" />
                        ) : (
                            <Video className="h-10 w-10 text-white" />
                        )}
                    </div>

                    <h3 className="text-xl font-black text-zinc-900 mb-2">
                        {type === "PHOTO" ? "Take or Upload Photo" : "Record or Upload Video"}
                    </h3>
                    <p className="text-zinc-600 font-medium">
                        {type === "PHOTO"
                            ? "Max 5MB • JPG, PNG, WebP"
                            : "Max 15 seconds • MP4, WebM"}
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {/* Preview */}
                    <div className="relative rounded-2xl overflow-hidden bg-zinc-900">
                        {type === "PHOTO" ? (
                            <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                        ) : (
                            <video src={preview} controls className="w-full h-64" />
                        )}

                        {!isUploading && (
                            <button
                                onClick={handleCancel}
                                className="absolute top-4 right-4 h-10 w-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        )}
                    </div>

                    {/* File Info */}
                    <div className="flex items-center justify-between p-4 bg-zinc-100 rounded-xl">
                        <div className="flex items-center gap-3">
                            {type === "PHOTO" ? (
                                <Camera className="h-5 w-5 text-blue-600" />
                            ) : (
                                <Film className="h-5 w-5 text-purple-600" />
                            )}
                            <div>
                                <p className="font-bold text-zinc-900 text-sm">{file.name}</p>
                                <p className="text-xs text-zinc-500">
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
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
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
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleCancel}
                                className="py-3 bg-zinc-200 text-zinc-700 rounded-xl font-bold hover:bg-zinc-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUpload}
                                className="py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                            >
                                <Upload className="h-5 w-5" />
                                Upload
                            </motion.button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
