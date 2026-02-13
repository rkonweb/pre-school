"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// ─── Types ───────────────────────────────────────────────────────

interface ZoneStyle {
    fontFamily: string;
    fontSize: number;
    fillType: 'solid' | 'gradient';
    color: string;
    gradient?: { start: string; end: string; direction: number };
    shadowColor?: string;
    textAlign: 'left' | 'center' | 'right';
    weight: 'normal' | 'bold' | '300' | '800' | '900';
    italic: boolean;
    uppercase: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    letterSpacing: number;
    lineHeight: number;
    bgColor?: string;
    bgOpacity?: number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    opacity?: number;
    rotation?: number;
    padding?: number;
    verticalAlign?: 'top' | 'middle' | 'bottom';
}

interface Zone {
    id: string;
    type: 'LOGO' | 'SCHOOL_NAME' | 'HEADLINE' | 'SUB_HEADLINE' | 'CONTACT_INFO' | 'QR_CODE' | 'WEBSITE';
    x: number;
    y: number;
    width: number;
    height: number;
    style: ZoneStyle;
    mockContent: string;
    zIndex?: number;
}

interface MarketingThumbnailProps {
    imageUrl: string;
    zones?: Zone[];
    className?: string;
}

// Dynamically import KonvaCanvas to avoid SSR issues with canvas
const KonvaCanvas = dynamic(() => import("./KonvaCanvas"), { ssr: false });

export function MarketingThumbnail({ imageUrl, zones = [], className }: MarketingThumbnailProps) {
    if (!imageUrl) {
        return <div className={cn("w-full h-full bg-zinc-100", className)} />;
    }

    return (
        <div className={cn("relative w-full overflow-hidden select-none bg-zinc-50", className)}>
            <KonvaCanvas
                imageUrl={imageUrl}
                zones={zones}
                readOnly={true}
                // Pass empty handlers since it's read-only
                onSelectZone={() => { }}
                onZoneTransform={() => { }}
                onZoneDrawn={() => { }}
                selectedZoneId={null}
                mode="SELECT"
            />

            {/* Overlay to prevent interactions if Konva events leak through (though readOnly handles most) */}
            <div className="absolute inset-0 z-10 pointer-events-none" />
        </div>
    );
}
