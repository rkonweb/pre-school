"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarWithAdjustmentProps {
    src?: string | null;
    alt?: string;
    adjustment?: string | null; // JSON string
    className?: string;
}

export function AvatarWithAdjustment({ src, alt, adjustment, className }: AvatarWithAdjustmentProps) {
    if (!src) {
        return (
            <div className={cn("flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400", className)}>
                <User className="h-1/2 w-1/2" />
            </div>
        );
    }

    let content = (
        <img
            src={src}
            alt={alt || "Avatar"}
            className="h-full w-full object-cover"
        />
    );

    if (adjustment) {
        try {
            const parsed = JSON.parse(adjustment);

            // Find the area data - could be nested or at top level
            // We prioritize percentage-based 'croppedArea'
            const area = parsed.croppedArea ||
                (parsed.width !== undefined && parsed.width <= 100 ? parsed : null);

            if (area && area.width > 0) {
                const { x, y, width, height } = area;
                content = (
                    <img
                        src={src}
                        alt={alt || "Avatar"}
                        className="absolute max-w-none"
                        style={{
                            width: `${10000 / width}%`,
                            height: `${10000 / height}%`,
                            left: `${-x * (100 / width)}%`,
                            top: `${-y * (100 / height)}%`,
                        }}
                    />
                );
            } else {
                // Fallback for pixel-based or older formats
                const zoom = parsed.zoom || 1;
                const cropX = parsed.x !== undefined ? parsed.x : (parsed.crop?.x || 0);
                const cropY = parsed.y !== undefined ? parsed.y : (parsed.crop?.y || 0);
                const width = parsed.width || parsed.croppedAreaPixels?.width;

                // If we have width > 100, it's pixels. We can't easily translate by pixels 
                // without image dimensions, so we use scale and center as a better fallback
                if (width && width > 100) {
                    content = (
                        <div className="h-full w-full flex items-center justify-center overflow-hidden">
                            <img
                                src={src}
                                alt={alt || "Avatar"}
                                className="h-full w-full object-cover"
                                style={{
                                    transform: `scale(${zoom})`,
                                }}
                            />
                        </div>
                    );
                } else {
                    // Final percentage fallback
                    content = (
                        <img
                            src={src}
                            alt={alt || "Avatar"}
                            className="h-full w-full object-cover"
                            style={{
                                transform: `scale(${zoom})`,
                                translate: typeof cropX === 'number' && cropX <= 100 ? `${-cropX}% ${-cropY}%` : '0 0',
                            }}
                        />
                    );
                }
            }
        } catch (e) {
            console.error("Failed to parse avatar adjustment", e);
        }
    }

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {content}
        </div>
    );
}

// Version that uses the actual cropped area pixels if we want exactness
export function AvatarClipped({ src, adjustment, className }: AvatarWithAdjustmentProps) {
    if (!src) return <div className={cn("bg-zinc-100 dark:bg-zinc-800", className)} />;

    let style: React.CSSProperties = { objectFit: "cover" };

    if (adjustment) {
        try {
            const adj = JSON.parse(adjustment);
            if (adj.croppedArea) {
                const { x, y, width, height } = adj.croppedArea;
                // Use object-position and object-fit to "zoom" into the area
                // This is a bit tricky with object-fit: cover.
                // Better: use a large image inside a container and translate/scale.
                return (
                    <div className={cn("relative overflow-hidden", className)}>
                        <img
                            src={src}
                            alt="Avatar"
                            className="absolute max-w-none"
                            style={{
                                width: `${100 / width * 100}%`,
                                left: `${-x / width * 100}%`,
                                top: `${-y / height * 100}%`,
                            }}
                        />
                    </div>
                );
            }
        } catch (e) { }
    }

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <img src={src} alt="Avatar" className="h-full w-full object-cover" />
        </div>
    );
}
