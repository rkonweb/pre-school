"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCw, Check } from "lucide-react";

interface PhotoCropperProps {
    image: string;
    title?: string;
    aspect?: number;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
}

export default function PhotoCropper({ image, title = "Crop Student Photo", aspect = 1, onCropComplete, onCancel }: PhotoCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onRotationChange = (rotation: number) => {
        setRotation(rotation);
    };

    const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: any,
        rotation = 0
    ): Promise<string> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return '';

        const safeArea = Math.max(image.width, image.height) * 2;

        // set each dimensions to double largest dimension to allow for a safe area for the
        // image to potentially rotate in without being clipped by canvas
        canvas.width = safeArea;
        canvas.height = safeArea;

        // translate canvas context to a central point of image to allow rotating around the center.
        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        // draw rotated image and store data.
        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        // set canvas width to final desired crop size - this will clear existing context
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // paste generated rotate image with correct offsets for x,y crop values.
        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        );

        // As Base64 string
        return canvas.toDataURL('image/jpeg');
    };

    const handleConfirm = async () => {
        try {
            const croppedImage = await getCroppedImg(
                image,
                croppedAreaPixels,
                rotation
            );
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{title}</h2>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                            {aspect === 1 ? 'Adjust image to fit the 1:1 square ratio' : 'Adjust image to desired proportions'}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-zinc-100 overflow-hidden">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                        onRotationChange={onRotationChange}
                    />
                </div>

                {/* Controls */}
                <div className="p-8 space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <ZoomOut className="h-4 w-4 text-zinc-400" />
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                                className="flex-1 h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                            />
                            <ZoomIn className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div className="flex items-center gap-4">
                            <RotateCw className="h-4 w-4 text-zinc-400" />
                            <input
                                type="range"
                                min={0}
                                max={360}
                                step={1}
                                value={rotation}
                                onChange={(e) => setRotation(parseInt(e.target.value))}
                                className="flex-1 h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1 h-12 rounded-2xl border-2 border-zinc-100 font-black uppercase tracking-widest text-[11px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-200 gap-2"
                        >
                            <Check className="h-4 w-4" /> Apply Crop
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
