"use client";

import { useEffect } from "react";

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
        : "174 123 100";
}

interface SchoolThemeProps {
    brandColor: string;
    schoolGradient?: string;
}

export function SchoolTheme({ brandColor, schoolGradient }: SchoolThemeProps) {
    useEffect(() => {
        if (!brandColor) return;

        const rgb = hexToRgb(brandColor);

        // Set on document root so it's available everywhere (including portals/dialogs)
        document.documentElement.style.setProperty("--brand-color", brandColor);
        document.documentElement.style.setProperty("--brand-color-rgb", rgb);

        if (schoolGradient) {
            document.documentElement.style.setProperty("--school-gradient", schoolGradient);
        }

        return () => {
            document.documentElement.style.removeProperty("--brand-color");
            document.documentElement.style.removeProperty("--brand-color-rgb");
            document.documentElement.style.removeProperty("--school-gradient");
        };
    }, [brandColor, schoolGradient]);

    return null;
}
