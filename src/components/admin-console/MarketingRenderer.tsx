"use client";

import { useEffect, useState } from "react";
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
    weight: 'normal' | 'bold' | '300' | '700' | '800' | '900';
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
    type: 'LOGO' | 'SCHOOL_NAME' | 'HEADLINE' | 'SUB_HEADLINE' | 'CONTACT_INFO' | 'QR_CODE' | 'WEBSITE' | 'IMAGE';
    x: number;
    y: number;
    width: number;
    height: number;
    style?: ZoneStyle;
    mockContent: string;
    zIndex?: number;
}

interface MarketingRendererProps {
    imageUrl: string;
    zones: Zone[];
    contentOverrides?: Record<string, string>;
    styleOverrides?: Record<string, Partial<ZoneStyle>>;
    selectedZoneId?: string | null;
    onZoneClick?: (zoneId: string) => void;
    className?: string;
    readOnly?: boolean;
    allowDrag?: boolean;
    allowTransformer?: boolean;
    zoom?: number;
}

const KonvaCanvas = dynamic(() => import("./KonvaCanvas"), { ssr: false });

export function MarketingRenderer({
    imageUrl,
    zones,
    contentOverrides = {},
    styleOverrides = {},
    selectedZoneId,
    onZoneClick,
    className,
    readOnly,
    allowDrag = false,
    allowTransformer = false,
    zoom = 1
}: MarketingRendererProps) {

    // Apply content and style overrides to zones
    const displayZones = zones.map(zone => {
        const styleOverride = styleOverrides[zone.id] || {};
        return {
            ...zone,
            mockContent: contentOverrides[zone.id] || zone.mockContent,
            style: {
                ...(zone.style || {
                    fontFamily: 'Inter',
                    fontSize: 5,
                    fillType: 'solid',
                    color: '#000000',
                    textAlign: 'center',
                    weight: 'bold',
                    italic: false,
                    uppercase: false,
                    shadow: 'none',
                    letterSpacing: 0,
                    lineHeight: 1.2
                } as ZoneStyle),
                ...styleOverride
            }
        };
    });

    return (
        <div className={cn("relative w-full overflow-hidden bg-zinc-50 select-none", className)}>
            <div className="relative">
                <KonvaCanvas
                    imageUrl={imageUrl}
                    zones={displayZones as any}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={(id) => onZoneClick?.(id!)}
                    readOnly={readOnly !== undefined ? readOnly : !onZoneClick}
                    allowDrag={allowDrag}
                    allowTransformer={allowTransformer}
                    mode="SELECT"
                    zoom={zoom}
                />
            </div>
        </div>
    );
}
