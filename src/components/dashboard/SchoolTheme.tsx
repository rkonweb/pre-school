"use client";

import { useEffect } from "react";

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
        : "174 123 100"; // fallback to #AE7B64
}

interface SchoolThemeProps {
    brandColor: string;
}

export function SchoolTheme({ brandColor }: SchoolThemeProps) {
    useEffect(() => {
        if (!brandColor) return;

        const rgb = hexToRgb(brandColor);

        // Set on document root so it's available everywhere (including portals)
        document.documentElement.style.setProperty("--brand-color", brandColor);
        document.documentElement.style.setProperty("--brand-color-rgb", rgb);

        // Also set primary/brand aliases if needed by Tailwind config
        // (Tailwind config maps 'brand' to var(--brand-color))

        return () => {
            // Cleanup on unmount (e.g. navigating away from school dashboard)
            document.documentElement.style.removeProperty("--brand-color");
            document.documentElement.style.removeProperty("--brand-color-rgb");
        };
    }, [brandColor]);

    return null;
}
