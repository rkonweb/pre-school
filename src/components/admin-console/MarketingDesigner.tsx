"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Type, Image as ImageIcon, MousePointer2, Maximize2,
    AlignLeft, AlignCenter, AlignRight,
    Copy, Trash2, Plus, Minus, Layers, X, Eye, EyeOff, Lock, Unlock,
    Settings, Strikethrough, ChevronDown, Check, ArrowUp, ArrowDown, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GOOGLE_FONTS, getGoogleFontUrl } from "@/lib/fonts";
import dynamic from "next/dynamic";
import Link from "next/link";
import MediaUploader from "@/components/upload/MediaUploader";
import { AnimatePresence, motion } from "framer-motion";

// Workaround for framer-motion children lint error
const MotionDiv = motion.div as any;

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
    type: 'LOGO' | 'SCHOOL_NAME' | 'HEADLINE' | 'SUB_HEADLINE' | 'CONTACT_INFO' | 'QR_CODE' | 'WEBSITE' | 'IMAGE' | 'BASE_IMAGE';
    x: number;
    y: number;
    width: number;
    height: number;
    style: ZoneStyle;
    mockContent: string;
    zIndex?: number;
    locked?: boolean;
    visible?: boolean;
}

interface MarketingDesignerProps {
    imageUrl: string;
    zones?: Zone[];
    initialZones?: Zone[];
    onZonesChange?: (zones: Zone[]) => void;
    onPreviewUpdate?: (url: string) => void;
    onChange?: (zones: Zone[]) => void;
    stageRef?: React.MutableRefObject<any>;
    // Metadata Props
    name?: string;
    onNameChange?: (name: string) => void;
    type?: string;
    onTypeChange?: (type: string) => void;
    category?: string;
    onCategoryChange?: (category: string) => void;
    formats?: { id: string; name: string }[];
    categories?: { id: string; name: string }[];
    actions?: React.ReactNode;
    backLink?: string;
    onBack?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────

const ZONE_TYPES = [
    { id: 'BASE_IMAGE', label: 'Foundation Image', icon: Maximize2 },
    { id: 'LOGO', label: 'School Logo', icon: ImageIcon },
    { id: 'SCHOOL_NAME', label: 'School Name', icon: Type },
    { id: 'HEADLINE', label: 'Headline', icon: Type },
    { id: 'SUB_HEADLINE', label: 'Sub-Headline', icon: Type },
    { id: 'CONTACT_INFO', label: 'Contact Info', icon: Type },
    { id: 'WEBSITE', label: 'Website URL', icon: Type },
    { id: 'QR_CODE', label: 'QR Code', icon: ImageIcon },
    { id: 'IMAGE', label: 'Asset Image', icon: ImageIcon },
] as const;

const DEFAULT_STYLE: ZoneStyle = {
    fontFamily: 'Roboto',
    fontSize: 5,
    fillType: 'solid',
    color: '#000000',
    gradient: { start: '#4F46E5', end: '#EC4899', direction: 45 },
    textAlign: 'center',
    weight: 'bold',
    italic: false,
    uppercase: false,
    underline: false,
    strikethrough: false,
    shadow: 'none',
    letterSpacing: 0,
    lineHeight: 1.2,
    bgColor: 'transparent',
    bgOpacity: 0,
    borderWidth: 0,
    borderColor: '#000000',
    borderRadius: 0,
    opacity: 100,
    rotation: 0,
    padding: 2,
    verticalAlign: 'middle',
};

import { KonvaCanvasProps } from "./KonvaCanvas";

// ─── Konva Canvas (dynamically imported — SSR-safe) ──────────────
const KonvaCanvas = dynamic<KonvaCanvasProps>(() => import("./KonvaCanvas"), { ssr: false });

// ─── Component ───────────────────────────────────────────────────

export function MarketingDesigner({
    imageUrl,
    initialZones = [],
    zones: controlledZones,
    onZonesChange,
    onPreviewUpdate,
    onChange,
    stageRef: externalStageRef,
    name,
    onNameChange,
    type,
    onTypeChange,
    category,
    onCategoryChange,
    formats = [],
    categories = [],
    actions,
    backLink,
    onBack,
}: MarketingDesignerProps) {
    const [internalZones, setInternalZones] = useState<Zone[]>(initialZones);
    const zones = controlledZones !== undefined ? controlledZones : internalZones;
    const [zoom, setZoom] = useState(100);
    const internalStageRef = useRef<any>(null);
    const stageRef = externalStageRef || internalStageRef;

    const updateZones = useCallback((newZones: Zone[]) => {
        if (controlledZones === undefined) setInternalZones(newZones);
        onChange?.(newZones);
        onZonesChange?.(newZones);
    }, [controlledZones, onChange, onZonesChange]);

    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [mode, setMode] = useState<'SELECT' | 'DRAW'>('SELECT');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewFont, setPreviewFont] = useState<string | null>(null);

    const selectedZone = zones.find(z => z.id === selectedZoneId);

    // Compute zones for display - applies temporary font preview if active
    const displayZones = zones.map(z =>
        (z.id === selectedZoneId && previewFont)
            ? { ...z, style: { ...z.style, fontFamily: previewFont } }
            : z
    );

    // Initialization Logic: If imageUrl is provided and no BASE_IMAGE zone exists, add it.
    useEffect(() => {
        if (!imageUrl) return;
        const baseExists = zones.some(z => z.type === 'BASE_IMAGE');
        if (!baseExists) {
            const baseZone: Zone = {
                id: 'foundation-layer',
                type: 'BASE_IMAGE',
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                style: { ...DEFAULT_STYLE, bgOpacity: 0 },
                mockContent: imageUrl,
                zIndex: -1, // Ensure it starts at the bottom
                locked: true,
                visible: true,
            };
            // Prepend to zones so it's at the bottom visually in layers (when reversed)
            updateZones([baseZone, ...zones]);
        }
    }, [imageUrl]); // Run when imageUrl changes (initial load)

    const handleImageUpload = (url: string) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let width = 30;
            let height = 30 / aspectRatio;

            if (height > 50) {
                height = 50;
                width = 50 * aspectRatio;
            }

            const newZone: Zone = {
                id: `zone-${Date.now()}`,
                type: 'IMAGE',
                x: 10,
                y: 10,
                width: width,
                height: height,
                style: { ...DEFAULT_STYLE, bgOpacity: 0 },
                mockContent: url,
            };
            updateZones([...zones, newZone]);
            setSelectedZoneId(newZone.id);
            setIsUploadModalOpen(false);
            setMode('SELECT');
        };
    };

    const toggleZoneLock = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        updateZones(zones.map(z => z.id === id ? { ...z, locked: !z.locked } : z));
    };

    const toggleZoneVisibility = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        updateZones(zones.map(z => z.id === id ? { ...z, visible: !(z.visible ?? true) } : z));
    };

    const duplicateZone = (id: string) => {
        const src = zones.find(z => z.id === id);
        if (!src) return;
        const dup: Zone = {
            ...JSON.parse(JSON.stringify(src)),
            id: `zone-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            x: Math.min(src.x + 3, 100 - src.width),
            y: Math.min(src.y + 3, 100 - src.height),
        };
        updateZones([...zones, dup]);
        setSelectedZoneId(dup.id);
    }

    const removeZone = (id: string) => {
        updateZones(zones.filter(z => z.id !== id));
        if (selectedZoneId === id) setSelectedZoneId(null);
    }

    const moveZone = (id: string, direction: 'up' | 'down') => {
        const index = zones.findIndex(z => z.id === id);
        if (index === -1) return;
        const newZones = [...zones];
        const swapIndex = direction === 'up' ? index + 1 : index - 1;
        if (swapIndex < 0 || swapIndex >= zones.length) return;

        const temp = newZones[index];
        newZones[index] = newZones[swapIndex];
        newZones[swapIndex] = temp;

        // Re-assign zIndex based on new order
        updateZones(newZones.map((z, i) => ({ ...z, zIndex: i })));
    };

    const updateZoneType = (id: string, type: Zone['type']) => {
        updateZones(zones.map(z => z.id === id ? { ...z, type } : z));
    }

    const updateZoneStyle = (id: string, styleUpdate: Partial<ZoneStyle>) => {
        updateZones(zones.map(z => z.id === id ? { ...z, style: { ...z.style, ...styleUpdate } } : z));
    }

    const handleZoneDrawn = useCallback((zone: { x: number; y: number; width: number; height: number }) => {
        const newZone: Zone = {
            id: `zone-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type: 'HEADLINE',
            ...zone,
            style: { ...DEFAULT_STYLE },
            mockContent: 'ADMISSIONS OPEN',
        };
        updateZones([...zones, newZone]);
        setSelectedZoneId(newZone.id);
        setMode('SELECT');
    }, [zones, updateZones]);

    const handleZoneTransform = useCallback((id: string, update: { x: number; y: number; width: number; height: number; rotation?: number }) => {
        updateZones(zones.map(z => {
            if (z.id !== id) return z;
            return {
                ...z,
                x: update.x,
                y: update.y,
                width: update.width,
                height: update.height,
                style: { ...z.style, rotation: update.rotation ?? z.style.rotation },
            };
        }));
    }, [zones, updateZones]);

    // Dynamic Font Loading
    useEffect(() => {
        const usedFonts = Array.from(new Set(zones.map(z => z.style?.fontFamily).filter(Boolean)));
        const filtered = usedFonts.filter(f => !['Outfit', 'Inter', 'Poppins', 'Roboto'].includes(f));
        if (filtered.length > 0) {
            const url = getGoogleFontUrl(filtered);
            let link = document.querySelector("link[id='google-fonts-dynamic']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.id = 'google-fonts-dynamic';
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
            link.href = url;
        }
    }, [zones]);

    // Stage Preview logic removed for clarity, can be added back if needed

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Top Toolbar Card */}
            <div className="h-20 border border-zinc-200/60 rounded-[2rem] px-8 flex items-center justify-between bg-white shadow-sm z-20 shrink-0">
                <div className="flex items-center gap-6">
                    {backLink ? (
                        <Link href={backLink} className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all border border-zinc-100">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    ) : onBack ? (
                        <button onClick={onBack} className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all border border-zinc-100">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    ) : null}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={name || ""}
                                onChange={(e) => onNameChange?.(e.target.value)}
                                placeholder="Untitled Template"
                                className="bg-transparent border-none outline-none text-base font-bold text-zinc-900 placeholder:text-zinc-300 w-64 focus:ring-0"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Asset Architect</span>
                            <div className="h-1 w-1 rounded-full bg-zinc-200" />
                            <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-wider truncate max-w-[150px]">{imageUrl.split('/').pop()}</span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-zinc-100 mx-2" />

                    <div className="flex bg-zinc-100/50 rounded-2xl p-1 border border-zinc-200/50">
                        <button
                            onClick={() => setMode('SELECT')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all",
                                mode === 'SELECT' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            <MousePointer2 className="h-3.5 w-3.5" />
                            Select
                        </button>
                        <button
                            onClick={() => { setMode('DRAW'); setSelectedZoneId(null); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all",
                                mode === 'DRAW' ? "bg-white text-amber-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Draw
                        </button>
                    </div>

                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all border border-zinc-200 bg-white shadow-sm"
                    >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Add Image
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Format</span>
                            {formats.length > 0 ? (
                                <select
                                    value={type}
                                    onChange={(e) => onTypeChange?.(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-zinc-600 outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Format</option>
                                    {formats.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                                </select>
                            ) : (
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">None</span>
                            )}
                        </div>
                        <div className="h-8 w-px bg-zinc-100" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Category</span>
                            {categories.length > 0 ? (
                                <select
                                    value={category}
                                    onChange={(e) => onCategoryChange?.(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-zinc-600 outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            ) : (
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">None</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {actions}
                </div>
            </div>

            <div className="flex gap-8 items-start">
                {/* Left Sidebar: Layers Card */}
                <div className="w-80 border border-zinc-200/60 rounded-[2.5rem] flex flex-col bg-white shrink-0 shadow-sm sticky top-8">
                    <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
                        <h3 className="text-[11px] font-extrabold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-indigo-600" />
                            Layers
                            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-zinc-50 border border-zinc-100 text-[9px] text-zinc-400 font-bold">{zones.length}</span>
                        </h3>
                    </div>
                    <div className="p-4 space-y-2 bg-zinc-50/50 rounded-b-[2.5rem] min-h-[400px]">
                        {zones.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                                <Maximize2 className="h-8 w-8 text-zinc-200" />
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest italic leading-relaxed">No layers yet.<br />Use DRAW mode to start.</p>
                            </div>
                        ) : (
                            [...zones].reverse().map((z) => (
                                <div
                                    key={z.id}
                                    onClick={() => setSelectedZoneId(z.id)}
                                    className={cn(
                                        "group w-full flex items-center justify-between p-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer border",
                                        selectedZoneId === z.id
                                            ? "bg-white border-indigo-200 text-indigo-700 shadow-md shadow-indigo-500/5 translate-x-1"
                                            : "bg-transparent border-transparent text-zinc-500 hover:bg-white/80 hover:border-zinc-200"
                                    )}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={cn(
                                            "h-8 w-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                                            selectedZoneId === z.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white text-zinc-400 border border-zinc-200 shadow-sm"
                                        )}>
                                            {z.type === 'BASE_IMAGE' ? <Maximize2 className="h-4 w-4" /> : z.type === 'IMAGE' ? <ImageIcon className="h-4 w-4" /> : <Type className="h-4 w-4" />}
                                        </div>
                                        <div className="flex flex-col items-start gap-0.5 min-w-0">
                                            <span className="truncate w-full text-[10px] leading-tight">{ZONE_TYPES.find(t => t.id === z.type)?.label || z.type}</span>
                                            <span className="text-[8px] opacity-40 normal-case font-bold truncate w-[100px]">
                                                {z.mockContent || "Empty layer"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button onClick={(e) => { e.stopPropagation(); moveZone(z.id, 'up'); }} className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                            <ArrowUp className="h-2.5 w-2.5" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); moveZone(z.id, 'down'); }} className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                            <ArrowDown className="h-2.5 w-2.5" />
                                        </button>
                                        <button onClick={(e) => toggleZoneVisibility(z.id, e)} className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                            {z.visible === false ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                                        </button>
                                        <button onClick={(e) => toggleZoneLock(z.id, e)} className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                            {z.locked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-zinc-50/50 rounded-[3rem] border border-zinc-200/40 relative flex flex-col min-w-0 min-h-[800px]">
                    <div className="flex-1 p-12 flex items-start justify-center">
                        <div className="max-w-4xl w-full py-8">
                            <KonvaCanvas
                                imageUrl={imageUrl}
                                zones={displayZones}
                                selectedZoneId={selectedZoneId}
                                mode={mode}
                                stageRef={stageRef}
                                onSelectZone={setSelectedZoneId}
                                onZoneTransform={handleZoneTransform}
                                onZoneDrawn={handleZoneDrawn}
                                zoom={zoom / 100}
                            />
                        </div>
                    </div>

                    {/* Quick Stats Footer */}
                    <div className="h-8 bg-zinc-100/50 border-t border-zinc-200/50 px-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                Rendering: {mode}
                            </span>
                            {selectedZone && (
                                <span className="text-[11px] font-mono text-indigo-400 font-black">
                                    X:{selectedZone.x.toFixed(1)}% Y:{selectedZone.y.toFixed(1)}% W:{selectedZone.width.toFixed(1)}% H:{selectedZone.height.toFixed(1)}%
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest italic leading-none">
                            {mode === 'DRAW' ? "Click & drag to draw zone" : selectedZoneId ? "Drag to move • Handles to resize" : "Click a layer to select"}
                        </p>
                    </div>
                </div>

                {/* Right Sidebar: Properties Card */}
                <div className="w-88 border border-zinc-200/60 rounded-[2.5rem] bg-white flex flex-col shrink-0 shadow-sm sticky top-8">
                    <div className="p-5 border-b border-zinc-100 bg-white shrink-0">
                        <h3 className="text-[11px] font-extrabold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                            <Settings className="h-3.5 w-3.5 text-indigo-600" />
                            Inspector
                        </h3>
                    </div>

                    <div className="p-6 space-y-8 rounded-b-[2.5rem]">
                        {/* Always visible Canvas Controls */}
                        <Section title="Canvas Zoom">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                                    className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 text-zinc-600 transition-colors shadow-sm"
                                    title="Zoom Out"
                                >
                                    <Minus className="h-4.5 w-4.5" />
                                </button>
                                <button
                                    onClick={() => setZoom(100)}
                                    className="flex-1 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 text-xs font-black text-zinc-900 uppercase tracking-widest transition-colors shadow-sm"
                                    title="Reset Zoom"
                                >
                                    {zoom}%
                                </button>
                                <button
                                    onClick={() => setZoom(Math.min(400, zoom + 25))}
                                    className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 text-zinc-600 transition-colors shadow-sm"
                                    title="Zoom In"
                                >
                                    <Plus className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        </Section>

                        {selectedZone ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <Section title="Identity">
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <Label>Zone Type</Label>
                                            <select
                                                value={selectedZone.type}
                                                onChange={(e) => updateZoneType(selectedZone.id, e.target.value as any)}
                                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                            >
                                                {ZONE_TYPES.map((type) => (
                                                    <option key={type.id} value={type.id}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Mock Content</Label>
                                            <textarea
                                                value={selectedZone.mockContent}
                                                onChange={(e) => updateZones(zones.map(z => z.id === selectedZone.id ? { ...z, mockContent: e.target.value } : z))}
                                                rows={3}
                                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 outline-none resize-none shadow-sm focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                                placeholder="Enter content..."
                                            />
                                        </div>
                                    </div>
                                </Section>

                                <Section title="Position & Size">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label>X Position %</Label>
                                            <input type="number" step="0.1" value={selectedZone.x} onChange={(e) => handleZoneTransform(selectedZone.id, { ...selectedZone, x: parseFloat(e.target.value) })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono font-bold text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Y Position %</Label>
                                            <input type="number" step="0.1" value={selectedZone.y} onChange={(e) => handleZoneTransform(selectedZone.id, { ...selectedZone, y: parseFloat(e.target.value) })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono font-bold text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Width %</Label>
                                            <input type="number" step="0.1" value={selectedZone.width} onChange={(e) => handleZoneTransform(selectedZone.id, { ...selectedZone, width: parseFloat(e.target.value) })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono font-bold text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Height %</Label>
                                            <input type="number" step="0.1" value={selectedZone.height} onChange={(e) => handleZoneTransform(selectedZone.id, { ...selectedZone, height: parseFloat(e.target.value) })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono font-bold text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all" />
                                        </div>
                                    </div>
                                </Section>

                                {selectedZone.type !== 'IMAGE' && selectedZone.type !== 'BASE_IMAGE' && (
                                    <Section title="Typography">
                                        <div className="space-y-4">
                                            <FontSelector value={selectedZone.style.fontFamily} onChange={(font) => updateZoneStyle(selectedZone.id, { fontFamily: font })} onHover={setPreviewFont} />
                                            <div className="space-y-1">
                                                <Label>Font Size ({selectedZone.style.fontSize}%)</Label>
                                                <input type="range" min="1" max="25" step="0.5" value={selectedZone.style.fontSize} onChange={(e) => updateZoneStyle(selectedZone.id, { fontSize: parseFloat(e.target.value) })} className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label>Alignment</Label>
                                                    <div className="flex bg-zinc-50 rounded-xl p-1 border border-zinc-200">
                                                        {(['left', 'center', 'right'] as const).map((align) => (
                                                            <button key={align} onClick={() => updateZoneStyle(selectedZone.id, { textAlign: align })} className={cn("flex-1 p-1.5 rounded-lg flex justify-center", selectedZone.style.textAlign === align ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400")}>
                                                                {align === 'left' ? <AlignLeft className="h-3 w-3" /> : align === 'center' ? <AlignCenter className="h-3 w-3" /> : <AlignRight className="h-3 w-3" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Weight</Label>
                                                    <select value={selectedZone.style.weight} onChange={(e) => updateZoneStyle(selectedZone.id, { weight: e.target.value as any })} className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-bold">
                                                        <option value="normal">Reg</option>
                                                        <option value="bold">Bold</option>
                                                        <option value="900">Black</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <Label>Fill Type</Label>
                                                    <div className="flex bg-zinc-50 rounded-xl p-1 border border-zinc-200">
                                                        {(['solid', 'gradient'] as const).map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => updateZoneStyle(selectedZone.id, { fillType: type })}
                                                                className={cn(
                                                                    "flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                                    selectedZone.style.fillType === type ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                                                )}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {selectedZone.style.fillType === 'gradient' ? (
                                                    <div className="space-y-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/50">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <Label>Start</Label>
                                                                <input
                                                                    type="color"
                                                                    value={selectedZone.style.gradient?.start || '#4F46E5'}
                                                                    onChange={(e) => updateZoneStyle(selectedZone.id, {
                                                                        gradient: { ...(selectedZone.style.gradient || { start: '#4F46E5', end: '#EC4899', direction: 45 }), start: e.target.value }
                                                                    })}
                                                                    className="h-10 w-full p-0.5 bg-white border border-zinc-200 rounded-xl cursor-pointer shadow-sm"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label>End</Label>
                                                                <input
                                                                    type="color"
                                                                    value={selectedZone.style.gradient?.end || '#EC4899'}
                                                                    onChange={(e) => updateZoneStyle(selectedZone.id, {
                                                                        gradient: { ...(selectedZone.style.gradient || { start: '#4F46E5', end: '#EC4899', direction: 45 }), end: e.target.value }
                                                                    })}
                                                                    className="h-10 w-full p-0.5 bg-white border border-zinc-200 rounded-xl cursor-pointer shadow-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <Label>Text Color</Label>
                                                        <input
                                                            type="color"
                                                            value={selectedZone.style.color}
                                                            onChange={(e) => updateZoneStyle(selectedZone.id, { color: e.target.value })}
                                                            className="h-10 w-full p-0.5 bg-white border border-zinc-200 rounded-xl cursor-pointer shadow-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                <Section title="Style">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="space-y-1 flex-1">
                                                <Label>BG Color</Label>
                                                <input type="color" value={selectedZone.style.bgColor || '#000000'} onChange={(e) => updateZoneStyle(selectedZone.id, { bgColor: e.target.value, bgOpacity: selectedZone.style.bgOpacity || 50 })} className="h-8 w-full p-0.5 bg-white border border-zinc-200 rounded-lg" />
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <Label>BG Alpha %</Label>
                                                <input type="range" min="0" max="100" step="5" value={selectedZone.style.bgOpacity || 0} onChange={(e) => updateZoneStyle(selectedZone.id, { bgOpacity: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-400" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label>Radius</Label>
                                                <input type="number" min="0" value={selectedZone.style.borderRadius || 0} onChange={(e) => updateZoneStyle(selectedZone.id, { borderRadius: parseInt(e.target.value) })} className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-mono font-bold" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Border</Label>
                                                <input type="number" min="0" value={selectedZone.style.borderWidth || 0} onChange={(e) => updateZoneStyle(selectedZone.id, { borderWidth: parseInt(e.target.value) })} className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-mono font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                </Section>

                                <Section title="Actions" >
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => duplicateZone(selectedZone.id)} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">
                                            <Copy className="h-3 w-3" /> Duplicate
                                        </button>
                                        <button onClick={() => removeZone(selectedZone.id)} disabled={selectedZone.type === 'BASE_IMAGE'} className={cn("flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", selectedZone.type === 'BASE_IMAGE' ? "bg-zinc-50 text-zinc-300 border border-zinc-100 cursor-not-allowed" : "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100")}>
                                            <Trash2 className="h-3 w-3" /> Delete
                                        </button>
                                    </div>
                                </Section>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-5 px-6">
                                <div className="h-20 w-20 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-200 shadow-inner">
                                    <MousePointer2 className="h-10 w-10 text-zinc-300" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[11px] text-zinc-500 font-extrabold uppercase tracking-widest leading-none">Property Inspector</p>
                                    <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest max-w-[150px] leading-relaxed mx-auto">
                                        Select a layer to view and edit its properties here.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsUploadModalOpen(false)}
                    >
                        <MotionDiv
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-zinc-900 uppercase">Upload Image</h3>
                                <button onClick={() => setIsUploadModalOpen(false)} className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <MediaUploader
                                type="PHOTO"
                                onUploadComplete={handleImageUpload}
                                onCancel={() => setIsUploadModalOpen(false)}
                            />
                        </MotionDiv>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Helper Components ───────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest px-0.5">{children}</label>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4 pt-6 last:pb-4 border-t border-zinc-100 first:border-t-0 first:pt-0">
            <Label>{title}</Label>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
}

function FontSelector({ value, onChange, onHover }: { value: string, onChange: (font: string) => void, onHover: (font: string | null) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const categories = ['Sans Serif', 'Serif', 'Display', 'Handwriting', 'Playful'];
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 outline-none flex items-center justify-between hover:bg-zinc-100 transition-colors shadow-sm"
            >
                <span className="truncate" style={{ fontFamily: value }}>{value}</span>
                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <MotionDiv
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-50 top-full mt-2 left-0 right-0 bg-white rounded-xl border border-zinc-100 shadow-xl max-h-64 overflow-y-auto custom-scrollbar p-1"
                    >
                        {categories.map(cat => (
                            <div key={cat} className="mb-2 last:mb-0">
                                <div className="px-2 py-1.5 text-[9px] uppercase font-black text-zinc-300 tracking-wider sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                    {cat}
                                </div>
                                {GOOGLE_FONTS.filter(f => f.category === cat).map(f => (
                                    <button
                                        key={f.name}
                                        onClick={() => {
                                            onChange(f.name);
                                            setIsOpen(false);
                                        }}
                                        onMouseEnter={() => onHover(f.name)}
                                        onMouseLeave={() => onHover(null)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                                            value === f.name ? "bg-indigo-50 text-indigo-600" : "hover:bg-zinc-50 text-zinc-700"
                                        )}
                                        style={{ fontFamily: f.name }}
                                    >
                                        <span className="truncate">{f.name}</span>
                                        {value === f.name && <Check className="h-3 w-3" />}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
}
