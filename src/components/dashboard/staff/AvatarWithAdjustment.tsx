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
            // Prioritize croppedArea (percentages)
            const area = parsed.croppedArea || parsed.croppedAreaPixels; // Fallback to pixels if percentages not available

            if (area) {
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
            } else if (parsed.zoom !== undefined && (parsed.x !== undefined || (parsed.crop && parsed.crop.x !== undefined))) {
                // Older fallback logic
                const cropX = parsed.x !== undefined ? parsed.x : parsed.crop.x;
                const cropY = parsed.y !== undefined ? parsed.y : parsed.crop.y;
                content = (
                    <img
                        src={src}
                        alt={alt || "Avatar"}
                        className="h-full w-full"
                        style={{
                            transform: `scale(${parsed.zoom})`,
                            translate: `${-cropX}% ${-cropY}%`,
                            objectFit: "cover",
                        }}
                    />
                );
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
