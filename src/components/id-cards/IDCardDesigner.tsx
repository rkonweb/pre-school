"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Type, Image as ImageIcon, MousePointer2, Maximize2,
    AlignLeft, AlignCenter, AlignRight,
    Copy, Trash2, Plus, Minus, Layers, X, Eye, EyeOff, Lock, Unlock,
    Settings, ChevronDown, Check, ArrowUp, ArrowDown, ArrowLeft,
    Square, Save, Monitor, Smartphone, RefreshCw, Circle, PenTool,
    Pipette, Droplets, LayoutGrid, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GOOGLE_FONTS, getGoogleFontUrl } from "@/lib/fonts";
import dynamic from "next/dynamic";
import Link from "next/link";
import MediaUploader from "@/components/upload/MediaUploader";
import { AnimatePresence, motion } from "framer-motion";
import { IDZone, ZoneStyle } from "./IDCardKonvaCanvas";
import PhotoCropper from "./PhotoCropper";

const MotionDiv = motion.div as any;

const ZONE_TYPES = [
    { id: 'STUDENT_PHOTO', label: 'Student Photo', icon: ImageIcon, defaultContent: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?q=80&w=256&h=256&fit=crop' },
    { id: 'STUDENT_NAME', label: 'Student Name', icon: Type, defaultContent: 'JOHNNY APPLESEED' },
    { id: 'ADMISSION_NUMBER', label: 'Admission No', icon: Type, defaultContent: 'ADM/2024/0842' },
    { id: 'GRADE', label: 'Grade/Class', icon: Type, defaultContent: 'PRE-SCHOOL (JUNIOR)' },
    { id: 'BLOOD_GROUP', label: 'Blood Group', icon: Type, defaultContent: 'O POSITIVE' },
    { id: 'SCHOOL_NAME', label: 'School Name', icon: Type, defaultContent: 'ST. ANDREWS PRE-SCHOOL' },
    { id: 'SCHOOL_LOGO', label: 'School Logo', icon: ImageIcon, defaultContent: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=256&h=256&fit=crop' }, // Dummy Crest
    { id: 'QR_CODE', label: 'QR Code', icon: ImageIcon, defaultContent: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ADM20240842' },
    { id: 'SIGNATURE', label: 'Signature', icon: ImageIcon, defaultContent: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=256&h=100&fit=crop' },
    { id: 'TEXT', label: 'Custom Text', icon: Type, defaultContent: 'IDENTITY CARD' },
    { id: 'RECTANGLE', label: 'Rectangle', icon: Square, defaultContent: '' },
    { id: 'CIRCLE', label: 'Circle', icon: Circle, defaultContent: '' },
    { id: 'PATH', label: 'Pen Path', icon: PenTool, defaultContent: '' },
    { id: 'IMAGE', label: 'Custom Image', icon: ImageIcon, defaultContent: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=256&h=256&fit=crop' },
] as const;

const DEFAULT_STYLE: ZoneStyle = {
    fontFamily: 'Inter',
    fontSize: 5,
    fillType: 'solid',
    color: '#000000',
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
    borderWidth: 0, // Legacy
    borderColor: '#000000', // Legacy
    stroke: '#000000',
    strokeWidth: 0,
    borderRadius: 0,
    opacity: 100,
    rotation: 0,
    padding: 2,
    verticalAlign: 'middle',
    gradient: {
        type: 'linear',
        startColor: '#ffffff',
        endColor: '#000000',
        direction: 90
    }
};

// --- Konva Canvas (SSR-safe) ---
const IDCardKonvaCanvas = dynamic(() => import("./IDCardKonvaCanvas"), { ssr: false });

interface IDCardDesignerProps {
    initialZones?: IDZone[];
    onSave?: (zones: IDZone[], orientation: 'VERTICAL' | 'HORIZONTAL', canvasSettings: any) => void;
    onBack?: () => void;
    name?: string;
    onNameChange?: (name: string) => void;
    initialOrientation?: 'VERTICAL' | 'HORIZONTAL';
    initialCanvasSettings?: {
        width: number;
        height: number;
        unit: 'mm' | 'cm' | 'in';
        bleed: number;
        safeMargin: number;
    };
}

export function IDCardDesigner({
    initialZones = [],
    onSave,
    onBack,
    name,
    onNameChange,
    initialOrientation = 'VERTICAL',
    initialCanvasSettings = {
        width: 86,
        height: 54,
        unit: 'mm' as const,
        bleed: 3,
        safeMargin: 5
    }
}: IDCardDesignerProps) {
    const [canvasSettings, setCanvasSettings] = useState({
        width: initialCanvasSettings?.width || (initialOrientation === 'VERTICAL' ? 54 : 86),
        height: initialCanvasSettings?.height || (initialOrientation === 'VERTICAL' ? 86 : 54),
        unit: (initialCanvasSettings?.unit as 'mm' | 'cm' | 'in') || 'mm',
        bleed: initialCanvasSettings?.bleed ?? 3,
        safeMargin: initialCanvasSettings?.safeMargin ?? 5,
        showGuides: true
    });
    const [historyState, setHistoryState] = useState<{
        past: IDZone[][];
        present: IDZone[];
        future: IDZone[][];
    }>({
        past: [],
        present: initialZones,
        future: []
    });

    const [orientation, setOrientation] = useState<'VERTICAL' | 'HORIZONTAL'>(initialOrientation);
    const [zoom, setZoom] = useState(100);
    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
    const [keyElementId, setKeyElementId] = useState<string | null>(null);
    const [mode, setMode] = useState<'SELECT' | 'DRAW' | 'PEN'>('SELECT');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewFont, setPreviewFont] = useState<string | null>(null);
    const [cropperData, setCropperData] = useState<{ isOpen: boolean; image: string; zoneId: string | null; zoneType: string | null; aspect?: number }>({
        isOpen: false,
        image: '',
        zoneId: null,
        zoneType: null
    });

    const [currentSide, setCurrentSide] = useState<'FRONT' | 'BACK'>('FRONT');

    // Clear selection when switching sides
    useEffect(() => {
        setSelectedZoneIds([]);
        setKeyElementId(null);
    }, [currentSide]);

    // Compatibility aliases
    const allZones = historyState.present;
    const zones = allZones.filter(z => (z.side || 'FRONT') === currentSide);
    const undoStack = historyState.past;
    const redoStack = historyState.future;

    const setZones = (newZones: IDZone[]) => {
        setHistoryState(prev => ({ ...prev, present: newZones }));
    };

    const updateZones = useCallback((newZones: IDZone[] | ((prevZones: IDZone[]) => IDZone[]), skipHistory = false) => {
        setHistoryState(prev => {
            const finalNewZones = typeof newZones === 'function' ? newZones(prev.present) : newZones;

            // Only push to history if there is an actual change
            if (JSON.stringify(prev.present) === JSON.stringify(finalNewZones)) {
                return prev;
            }

            if (skipHistory) {
                return { ...prev, present: finalNewZones };
            }

            return {
                past: [prev.present, ...prev.past].slice(0, 10),
                present: finalNewZones,
                future: []
            };
        });
    }, []);

    const undo = useCallback(() => {
        setHistoryState(prev => {
            if (prev.past.length === 0) return prev;
            const previous = prev.past[0];
            return {
                past: prev.past.slice(1),
                present: previous,
                future: [prev.present, ...prev.future].slice(0, 10)
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistoryState(prev => {
            if (prev.future.length === 0) return prev;
            const next = prev.future[0];
            return {
                past: [prev.present, ...prev.past].slice(0, 10),
                present: next,
                future: prev.future.slice(1)
            };
        });
    }, []);


    const updateZoneTransform = useCallback((id: string, transform: any) => {
        updateZones(prev => prev.map(z => z.id === id ? (transform.id ? transform : { ...z, ...transform }) : z));
    }, [updateZones]);

    // Reset selection side effects
    useEffect(() => {
        // Any selection side effects go here
    }, [selectedZoneIds]);

    const fitToScreen = useCallback(() => {
        if (!containerRef.current) return;

        const padding = 80;
        const { offsetWidth, offsetHeight } = containerRef.current;
        const availableWidth = offsetWidth - padding;
        const availableHeight = offsetHeight - padding;

        const MM_TO_PX = 8;
        const UNIT_TO_MM = { mm: 1, cm: 10, in: 25.4 };
        const multiplier = UNIT_TO_MM[canvasSettings.unit];

        const cardWidthPx = (canvasSettings.width * multiplier + (canvasSettings.bleed * 2)) * MM_TO_PX;
        const cardHeightPx = (canvasSettings.height * multiplier + (canvasSettings.bleed * 2)) * MM_TO_PX;

        const scaleX = availableWidth / cardWidthPx;
        const scaleY = availableHeight / cardHeightPx;
        const optimalZoom = Math.min(scaleX, scaleY, 2);

        setZoom(Math.floor(optimalZoom * 100));
    }, [canvasSettings]);

    // Side effects for orientation and initial fit
    useEffect(() => {
        const { width, height } = canvasSettings;
        if (width > height && orientation !== 'HORIZONTAL') {
            setOrientation('HORIZONTAL');
        } else if (height > width && orientation !== 'VERTICAL') {
            setOrientation('VERTICAL');
        }

        const timer = setTimeout(fitToScreen, 100);
        return () => clearTimeout(timer);
    }, [canvasSettings.width, canvasSettings.height, orientation, fitToScreen]);

    useEffect(() => {
        setTimeout(fitToScreen, 800);
    }, []);

    const toggleOrientation = (newOrientation: 'VERTICAL' | 'HORIZONTAL') => {
        if (newOrientation === orientation) return;

        setOrientation(newOrientation);

        // Swap dimensions if they don't match the new orientation
        const { width, height } = canvasSettings;
        const shouldSwap = (newOrientation === 'VERTICAL' && width > height) ||
            (newOrientation === 'HORIZONTAL' && height > width);

        if (shouldSwap) {
            setCanvasSettings(prev => ({
                ...prev,
                width: prev.height,
                height: prev.width
            }));
        }
    };

    const handleUnitChange = (newUnit: 'mm' | 'cm' | 'in') => {
        const UNIT_TO_MM = {
            mm: 1,
            cm: 10,
            in: 25.4
        };

        setCanvasSettings(prev => {
            if (prev.unit === newUnit) return prev;
            const multiplier = UNIT_TO_MM[prev.unit] / UNIT_TO_MM[newUnit];
            return {
                ...prev,
                unit: newUnit,
                width: Number((prev.width * multiplier).toFixed(2)),
                height: Number((prev.height * multiplier).toFixed(2))
            };
        });
    };

    const selectedZone = selectedZoneIds.length === 1 ? zones.find(z => z.id === selectedZoneIds[0]) : null;

    // Sanitize zone ratios (Student Photo: 1:1, Image: 2:3)
    useEffect(() => {
        const multiplier = 1; // Ratios are relative to canvas dimensions
        const canvasRatio = canvasSettings.width / canvasSettings.height;

        let hasChanges = false;
        const sanitizedZones = zones.map(z => {
            if (z.type === 'STUDENT_PHOTO') {
                // Should be square in pixels: (w% * canvasW) = (h% * canvasH)
                // targetH% = w% * (canvasW / canvasH)
                const targetH = z.width * canvasRatio;
                if (Math.abs(z.height - targetH) > 0.1) {
                    hasChanges = true;
                    return { ...z, height: targetH };
                }
            }
            return z;
        });

        if (hasChanges) {
            updateZones(sanitizedZones, true); // Skip history for ratio sanitization
        }
    }, [zones, canvasSettings.width, canvasSettings.height, updateZones]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'v') setMode('SELECT');
            if (e.key === 'r') setMode('DRAW');
            if (e.key === 'p') setMode('PEN');
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undo();
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                redo();
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedZoneIds.length > 0) {
                    updateZones(zones.filter(z => !selectedZoneIds.includes(z.id)));
                    setSelectedZoneIds([]);
                    setKeyElementId(null);
                }
            }
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                if (selectedZoneIds.length > 0) {
                    const newZones: IDZone[] = [];
                    const newIds: string[] = [];
                    selectedZoneIds.forEach(id => {
                        const src = zones.find(z => z.id === id);
                        if (src) {
                            const newId = `zone-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                            newZones.push({ ...JSON.parse(JSON.stringify(src)), id: newId, x: src.x + 2, y: src.y + 2 });
                            newIds.push(newId);
                        }
                    });
                    updateZones([...allZones, ...newZones]);
                    setSelectedZoneIds(newIds);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedZoneIds, allZones, zones, undo, redo, updateZones]);


    const handleZoneDrawn = useCallback((zone: { x: number; y: number; width: number; height: number }) => {
        const newZone: IDZone = {
            id: `zone-${Date.now()}`,
            type: 'RECTANGLE',
            ...zone,
            style: { ...DEFAULT_STYLE },
            mockContent: '',
            side: currentSide,
        };
        updateZones([...allZones, newZone]);
        setSelectedZoneIds([newZone.id]);
        setMode('SELECT');
    }, [allZones, currentSide, updateZones]);

    const handlePathAdded = useCallback((pathData: string) => {
        const newZone: IDZone = {
            id: `path-${Date.now()}`,
            type: 'PATH',
            x: 0, y: 0, width: 100, height: 100,
            style: {
                ...DEFAULT_STYLE,
                pathData,
                fillType: 'none',
                stroke: '#4F46E5',
                strokeWidth: 2
            },
            mockContent: '',
            side: currentSide,
        };
        updateZones([...allZones, newZone]);
        setSelectedZoneIds([newZone.id]);
        setMode('SELECT');
    }, [allZones, currentSide, updateZones]);

    const handleZoneTransform = useCallback((id: string, update: { x: number; y: number; width: number; height: number; rotation?: number }) => {
        updateZones(allZones.map(z => z.id === id ? { ...z, ...update, style: { ...z.style, rotation: update.rotation ?? z.style.rotation } } : z));
    }, [allZones, updateZones]);

    const addZone = (type: typeof ZONE_TYPES[number]) => {
        const canvasRatio = canvasSettings.width / canvasSettings.height;
        const initialW = type.id === 'STUDENT_PHOTO' ? 40 : 30;
        let initialH = 40;

        if (type.id === 'STUDENT_PHOTO') {
            initialH = initialW * canvasRatio;
        }

        const newZone: IDZone = {
            id: `zone-${Date.now()}`,
            type: type.id,
            x: 10,
            y: 10,
            width: initialW,
            height: initialH,
            style: { ...DEFAULT_STYLE },
            mockContent: type.defaultContent,
            side: currentSide,
        };
        updateZones([...allZones, newZone]);
        setSelectedZoneIds([newZone.id]);
    };

    const duplicateZone = (id: string) => {
        const src = allZones.find(z => z.id === id);
        if (!src) return;
        const dup: IDZone = {
            ...JSON.parse(JSON.stringify(src)),
            id: `zone-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            x: src.x + 2,
            y: src.y + 2,
        };
        updateZones([...allZones, dup]);
        setSelectedZoneIds([dup.id]);
    };

    const removeZone = (id: string) => {
        updateZones(allZones.filter(z => z.id !== id));
        setSelectedZoneIds(prev => prev.filter(sid => sid !== id));
    };

    const moveZone = (id: string, direction: 'up' | 'down') => {
        const index = allZones.findIndex(z => z.id === id);
        if (index === -1) return;
        const newZones = [...allZones];
        const swapIndex = direction === 'up' ? index + 1 : index - 1;
        if (swapIndex < 0 || swapIndex >= allZones.length) return;
        [newZones[index], newZones[swapIndex]] = [newZones[swapIndex], newZones[index]];
        updateZones(newZones.map((z, i) => ({ ...z, zIndex: i })));
    };

    const updateZoneStyle = (id: string, styleUpdate: Partial<ZoneStyle>) => {
        updateZones(allZones.map(z => z.id === id ? { ...z, style: { ...z.style, ...styleUpdate } } : z));
    };

    const alignZones = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
        if (selectedZoneIds.length === 0) return;
        if (selectedZoneIds.length === 1 && !keyElementId) return;
        if (selectedZoneIds.length === 1 && keyElementId === selectedZoneIds[0]) return;

        const selectedZones = zones.filter(z => selectedZoneIds.includes(z.id));
        const keyZone = keyElementId ? zones.find(z => z.id === keyElementId) : null;

        const refBounds = keyElementId === 'CANVAS' ? {
            minX: 0,
            maxX: 100,
            midX: 50,
            minY: 0,
            maxY: 100,
            midY: 50
        } : keyZone ? {
            minX: keyZone.x,
            maxX: keyZone.x + keyZone.width,
            midX: keyZone.x + keyZone.width / 2,
            minY: keyZone.y,
            maxY: keyZone.y + keyZone.height,
            midY: keyZone.y + keyZone.height / 2
        } : {
            minX: Math.min(...selectedZones.map(z => z.x)),
            maxX: Math.max(...selectedZones.map(z => z.x + z.width)),
            midX: (Math.min(...selectedZones.map(z => z.x)) + Math.max(...selectedZones.map(z => z.x + z.width))) / 2,
            minY: Math.min(...selectedZones.map(z => z.y)),
            maxY: Math.max(...selectedZones.map(z => z.y + z.height)),
            midY: (Math.min(...selectedZones.map(z => z.y)) + Math.max(...selectedZones.map(z => z.y + z.height))) / 2
        };

        const updatedZones = allZones.map(z => {
            if (!selectedZoneIds.includes(z.id) || z.id === keyElementId) return z;
            switch (type) {
                case 'left': return { ...z, x: refBounds.minX };
                case 'right': return { ...z, x: refBounds.maxX - z.width };
                case 'center': return { ...z, x: refBounds.midX - z.width / 2 };
                case 'top': return { ...z, y: refBounds.minY };
                case 'bottom': return { ...z, y: refBounds.maxY - z.height };
                case 'middle': return { ...z, y: refBounds.midY - z.height / 2 };
                default: return z;
            }
        });
        updateZones(updatedZones);
    };

    const distributeZones = (direction: 'horizontal' | 'vertical') => {
        if (selectedZoneIds.length < 3) return;

        const selectedZones = [...zones.filter(z => selectedZoneIds.includes(z.id))];
        if (direction === 'horizontal') {
            selectedZones.sort((a, b) => a.x - b.x);
            const first = selectedZones[0];
            const last = selectedZones[selectedZones.length - 1];
            const totalWidth = selectedZones.reduce((sum, z) => sum + z.width, 0);
            const gap = (last.x + last.width - first.x - totalWidth) / (selectedZones.length - 1);

            let currentX = first.x;
            const updatedZones = allZones.map(z => {
                const sIndex = selectedZones.findIndex(sz => sz.id === z.id);
                if (sIndex === -1) return z;
                const updated = { ...z, x: currentX };
                currentX += z.width + gap;
                return updated;
            });
            updateZones(updatedZones);
        } else {
            selectedZones.sort((a, b) => a.y - b.y);
            const first = selectedZones[0];
            const last = selectedZones[selectedZones.length - 1];
            const totalHeight = selectedZones.reduce((sum, z) => sum + z.height, 0);
            const gap = (last.y + last.height - first.y - totalHeight) / (selectedZones.length - 1);

            let currentY = first.y;
            const updatedZones = allZones.map(z => {
                const sIndex = selectedZones.findIndex(sz => sz.id === z.id);
                if (sIndex === -1) return z;
                const updated = { ...z, y: currentY };
                currentY += z.height + gap;
                return updated;
            });
            updateZones(updatedZones);
        }
    };

    // Dynamic Font Loading
    useEffect(() => {
        const usedFonts = Array.from(new Set(allZones.map((z: IDZone) => z.style?.fontFamily).filter(Boolean)));
        const filtered = usedFonts.filter((f: any) => !['Outfit', 'Inter', 'Poppins', 'Roboto', 'Geist'].includes(f));
        if (filtered.length > 0) {
            const url = getGoogleFontUrl(filtered);
            let link = document.querySelector("link[id='google-fonts-dynamic']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.id = 'google-fonts-dynamic'; link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
            link.href = url;
        }
    }, [zones]);

    return (
        <div className="flex flex-col h-[calc(100vh-73px)]">
            {/* Toolbar */}
            <div className="h-16 border-b border-zinc-200 px-8 flex items-center justify-between bg-white z-20 shrink-0">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 border border-zinc-100"><ArrowLeft className="h-5 w-5" /></button>
                    <div className="flex flex-col">
                        <input type="text" value={name || ""} onChange={(e) => onNameChange?.(e.target.value)} placeholder="New ID Template" className="bg-transparent border-none outline-none text-base font-bold text-zinc-900 placeholder:text-zinc-300 w-64 focus:ring-0" />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">ID Card Architect • CR80 Standard</span>
                    </div>

                    <div className="h-8 w-px bg-zinc-100" />

                    {/* Tool Modes */}
                    <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
                        <button
                            onClick={() => setMode('SELECT')}
                            className={cn("h-10 w-10 flex items-center justify-center rounded-xl transition-all", mode === 'SELECT' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400")}
                            title="Select (V)"
                        >
                            <MousePointer2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setMode('DRAW')}
                            className={cn("h-10 w-10 flex items-center justify-center rounded-xl transition-all", mode === 'DRAW' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400")}
                            title="Rectangle (R)"
                        >
                            <Square className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setMode('PEN')}
                            className={cn("h-10 w-10 flex items-center justify-center rounded-xl transition-all", mode === 'PEN' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400")}
                            title="Pen Tool (P)"
                        >
                            <PenTool className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-zinc-100" />

                    <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
                        <button onClick={() => toggleOrientation('VERTICAL')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", orientation === 'VERTICAL' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400")}><Smartphone className="h-3.5 w-3.5 mr-2 inline" />Vertical</button>
                        <button onClick={() => toggleOrientation('HORIZONTAL')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", orientation === 'HORIZONTAL' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400")}><Monitor className="h-3.5 w-3.5 mr-2 inline" />Horizontal</button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => onSave?.(allZones, orientation, canvasSettings)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"><Save className="h-4 w-4" /> Save Template</button>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left Sidebar: Components & Layers */}
                <div className="w-80 flex flex-col border-r border-zinc-200 bg-white shrink-0 overflow-y-auto">
                    <div className="p-6 border-b border-zinc-100">
                        <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest mb-4 flex items-center gap-2"><Plus className="h-3.5 w-3.5 text-indigo-600" /> Components</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {ZONE_TYPES.map(type => (
                                <button key={type.id} onClick={() => addZone(type)} className="p-3 rounded-2xl border border-zinc-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex flex-col items-center gap-2 text-center group">
                                    <type.icon className="h-4 w-4 text-zinc-400 group-hover:text-indigo-600" />
                                    <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-900 uppercase tracking-tight leading-none">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-5 border-b border-zinc-100 flex items-center justify-between"><h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-indigo-600" /> Layers</h3></div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {/* Virtual Card Layer */}
                            <div
                                onClick={() => {
                                    if (selectedZoneIds.length > 0) {
                                        setKeyElementId(prev => prev === 'CANVAS' ? null : 'CANVAS');
                                    }
                                }}
                                className={cn(
                                    "group flex items-center justify-between p-3 rounded-2xl text-[11px] font-bold uppercase transition-all cursor-pointer border",
                                    keyElementId === 'CANVAS' ? "bg-emerald-50/50 border-emerald-200 text-emerald-700" : "bg-zinc-50/30 border-dashed border-zinc-200 text-zinc-400 hover:bg-zinc-50"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", keyElementId === 'CANVAS' ? "bg-emerald-600 text-white" : "bg-white border border-zinc-200")}><Monitor className="h-3.5 w-3.5" /></div>
                                    <span>Card Boundaries</span>
                                </div>
                                {keyElementId === 'CANVAS' && <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active Anchor</span>}
                            </div>

                            <div className="h-px bg-zinc-100 my-2" />

                            {[...zones].reverse().map(z => (
                                <div
                                    key={z.id}
                                    onClick={(e) => {
                                        if (e.shiftKey) {
                                            setSelectedZoneIds(prev =>
                                                prev.includes(z.id) ? prev.filter(sid => sid !== z.id) : [...prev, z.id]
                                            );
                                        } else {
                                            setSelectedZoneIds([z.id]);
                                        }
                                    }}
                                    className={cn(
                                        "group flex items-center justify-between p-3 rounded-2xl text-[11px] font-bold uppercase transition-all cursor-pointer border",
                                        selectedZoneIds.includes(z.id) ? "bg-indigo-50/50 border-indigo-200 text-indigo-700" : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-50"
                                    )}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", selectedZoneIds.includes(z.id) ? "bg-indigo-600 text-white" : "bg-white border border-zinc-200")}><Type className="h-3.5 w-3.5" /></div>
                                        <span className="truncate">{ZONE_TYPES.find(t => t.id === z.type)?.label || z.type}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                        <button onClick={(e) => { e.stopPropagation(); moveZone(z.id, 'up'); }} title="Move Up"><ArrowUp className="h-3 w-3" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); removeZone(z.id); }} title="Delete"><Trash2 className="h-3 w-3 text-rose-500" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Canvas Area */}
                <div ref={containerRef} className="flex-1 bg-zinc-50 relative flex flex-col items-center justify-center p-12 overflow-auto">
                    <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                        <div className="flex items-center bg-white border border-zinc-200 p-1 rounded-xl shadow-sm mr-2">
                            <button
                                onClick={undo}
                                disabled={undoStack.length === 0}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    undoStack.length > 0 ? "text-zinc-900 hover:bg-zinc-50" : "text-zinc-300 pointer-events-none"
                                )}
                                title="Undo (Ctrl+Z)"
                            >
                                <RefreshCw className="h-4 w-4 -scale-x-100" />
                            </button>
                            <div className="w-px h-4 bg-zinc-100 mx-1" />
                            <button
                                onClick={redo}
                                disabled={redoStack.length === 0}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    redoStack.length > 0 ? "text-zinc-900 hover:bg-zinc-50" : "text-zinc-300 pointer-events-none"
                                )}
                                title="Redo (Ctrl+Y)"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="w-px h-6 bg-zinc-200 mx-1" />
                        <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="p-2 bg-white rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm"><Minus className="h-4 w-4 text-zinc-500" /></button>
                        <span className="text-[11px] font-black text-zinc-900 w-12 text-center bg-white border border-zinc-200 py-2 rounded-lg shadow-sm">{zoom}%</span>
                        <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-2 bg-white rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm"><Plus className="h-4 w-4 text-zinc-500" /></button>
                        <div className="w-px h-6 bg-zinc-200 mx-1" />
                        <button onClick={fitToScreen} className="p-2 bg-white rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm flex items-center gap-2 pr-3" title="Fit to screen">
                            <Maximize2 className="h-4 w-4 text-zinc-500" />
                            <span className="text-[10px] font-black uppercase text-zinc-500">Fit</span>
                        </button>
                    </div>

                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex bg-white border border-zinc-200 p-1.5 rounded-[1.5rem] shadow-xl">
                        <button
                            onClick={() => setCurrentSide('FRONT')}
                            className={cn(
                                "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                                currentSide === 'FRONT' ? "bg-black text-white shadow-lg shadow-black/20" : "text-zinc-400 hover:bg-zinc-50"
                            )}
                        >
                            <span className={cn("h-1.5 w-1.5 rounded-full transition-all", currentSide === 'FRONT' ? "bg-emerald-400 animate-pulse" : "bg-zinc-200")} />
                            Front Side
                        </button>
                        <button
                            onClick={() => setCurrentSide('BACK')}
                            className={cn(
                                "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                                currentSide === 'BACK' ? "bg-black text-white shadow-lg shadow-black/20" : "text-zinc-400 hover:bg-zinc-50"
                            )}
                        >
                            <span className={cn("h-1.5 w-1.5 rounded-full transition-all", currentSide === 'BACK' ? "bg-emerald-400 animate-pulse" : "bg-zinc-200")} />
                            Back Side
                        </button>
                    </div>

                    <IDCardKonvaCanvas
                        zones={zones}
                        selectedZoneIds={selectedZoneIds}
                        keyElementId={keyElementId}
                        mode={mode}
                        stageRef={stageRef}
                        orientation={orientation}
                        zoom={zoom / 100}
                        onSelectZone={(id: string | null, shiftKey?: boolean) => {
                            if (!id) {
                                setSelectedZoneIds([]);
                                setKeyElementId(null);
                                return;
                            }

                            if (id === 'CANVAS') {
                                if (selectedZoneIds.length > 0) {
                                    setKeyElementId(prev => prev === 'CANVAS' ? null : 'CANVAS');
                                }
                                return;
                            }

                            if (shiftKey) {
                                setSelectedZoneIds(prev => {
                                    const next = prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id];
                                    if (!next.includes(id) && keyElementId === id) setKeyElementId(null);
                                    return next;
                                });
                            } else {
                                // If already selected, toggle as key element
                                if (selectedZoneIds.includes(id) && selectedZoneIds.length > 1) {
                                    setKeyElementId(prev => prev === id ? null : id);
                                } else {
                                    setSelectedZoneIds([id]);
                                    setKeyElementId(null);
                                }
                            }
                        }}
                        onZoneTransform={updateZoneTransform}
                        onZoneDrawn={handleZoneDrawn}
                        onPathAdded={handlePathAdded}
                        width={canvasSettings.width}
                        height={canvasSettings.height}
                        unit={canvasSettings.unit}
                        bleed={canvasSettings.bleed}
                        safeMargin={canvasSettings.safeMargin}
                        showGuides={canvasSettings.showGuides}
                    />
                </div>

                {/* Inspector Area */}
                <div className="w-80 border-l border-zinc-200 bg-white flex flex-col shrink-0 overflow-y-auto">
                    <div className="p-5 border-b border-zinc-100 flex items-center gap-2 sticky top-0 bg-white z-10">
                        <Settings className="h-3.5 w-3.5 text-indigo-600" />
                        <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">Inspector</h3>
                    </div>
                    <div className="p-6 overflow-y-auto pb-20 space-y-6">
                        {(selectedZoneIds.length > 1 || (selectedZoneIds.length === 1 && keyElementId)) && (
                            <Section title="Alignment">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Align To</Label>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                            keyElementId === 'CANVAS' ? "bg-emerald-100 text-emerald-700" : (keyElementId ? "bg-indigo-100 text-indigo-700" : "bg-zinc-100 text-zinc-500")
                                        )}>
                                            {keyElementId === 'CANVAS' ? 'Card Bounds' : (keyElementId ? 'Key Element' : 'Selection Bounds')}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => alignZones('left')} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex flex-col items-center gap-1">
                                            <AlignLeft className="h-4 w-4 text-zinc-600" />
                                            <span className="text-[8px] font-black uppercase">Left</span>
                                        </button>
                                        <button onClick={() => alignZones('center')} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex flex-col items-center gap-1">
                                            <AlignCenter className="h-4 w-4 text-zinc-600" />
                                            <span className="text-[8px] font-black uppercase">Center</span>
                                        </button>
                                        <button onClick={() => alignZones('right')} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex flex-col items-center gap-1">
                                            <AlignRight className="h-4 w-4 text-zinc-600" />
                                            <span className="text-[8px] font-black uppercase">Right</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => alignZones('top')} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex flex-col items-center gap-1">
                                            <div className="rotate-90"><AlignLeft className="h-4 w-4 text-zinc-600" /></div>
                                            <span className="text-[8px] font-black uppercase">Top</span>
                                        </button>
                                        <button onClick={() => alignZones('middle')} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex flex-col items-center gap-1">
                                            <div className="rotate-90"><AlignCenter className="h-4 w-4 text-zinc-600" /></div>
                                            <span className="text-[8px] font-black uppercase">Middle</span>
                                        </button>
                                        <button onClick={() => alignZones('bottom')} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex flex-col items-center gap-1">
                                            <div className="rotate-90"><AlignRight className="h-4 w-4 text-zinc-600" /></div>
                                            <span className="text-[8px] font-black uppercase">Bottom</span>
                                        </button>
                                    </div>
                                    <div className="h-px bg-zinc-100 mx-2" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => distributeZones('horizontal')} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex flex-col items-center gap-1">
                                            <LayoutGrid className="h-4 w-4 text-zinc-600" />
                                            <span className="text-[8px] font-black uppercase">Dist. Horiz</span>
                                        </button>
                                        <button onClick={() => distributeZones('vertical')} className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex flex-col items-center gap-1">
                                            <Layers className="h-4 w-4 text-zinc-600" />
                                            <span className="text-[8px] font-black uppercase">Dist. Vert</span>
                                        </button>
                                    </div>
                                </div>
                            </Section>
                        )}
                        {selectedZone ? (
                            <div className="space-y-6">
                                <Section title="Precision Sizing">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label>X ({canvasSettings.unit})</Label>
                                            <input type="number" value={((selectedZone.x / 100) * canvasSettings.width).toFixed(2)} onChange={e => updateZoneTransform(selectedZone.id, { x: (parseFloat(e.target.value) / canvasSettings.width) * 100 })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                        </div>
                                        <div>
                                            <Label>Y ({canvasSettings.unit})</Label>
                                            <input type="number" value={((selectedZone.y / 100) * canvasSettings.height).toFixed(2)} onChange={e => updateZoneTransform(selectedZone.id, { y: (parseFloat(e.target.value) / canvasSettings.height) * 100 })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                        </div>
                                        <div>
                                            <Label>W ({canvasSettings.unit})</Label>
                                            <input type="number" value={((selectedZone.width / 100) * canvasSettings.width).toFixed(2)} onChange={e => updateZoneTransform(selectedZone.id, { width: (parseFloat(e.target.value) / canvasSettings.width) * 100 })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                        </div>
                                        <div>
                                            <Label>H ({canvasSettings.unit})</Label>
                                            <input type="number" value={((selectedZone.height / 100) * canvasSettings.height).toFixed(2)} onChange={e => updateZoneTransform(selectedZone.id, { height: (parseFloat(e.target.value) / canvasSettings.height) * 100 })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                        </div>
                                    </div>
                                </Section>

                                <Section title="Identity">
                                    <div className="space-y-3">
                                        <Label>Zone Type</Label>
                                        <select value={selectedZone.type} onChange={(e) => updateZones(allZones.map(z => z.id === selectedZone.id ? { ...z, type: e.target.value } : z))} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold">
                                            {ZONE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                        </select>

                                        <Label>Display Side</Label>
                                        <div className="flex bg-zinc-100 p-1 rounded-xl">
                                            <button
                                                onClick={() => updateZones(allZones.map(z => z.id === selectedZone.id ? { ...z, side: 'FRONT' } : z))}
                                                className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", (selectedZone.side || 'FRONT') === 'FRONT' ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
                                            >
                                                Front
                                            </button>
                                            <button
                                                onClick={() => updateZones(allZones.map(z => z.id === selectedZone.id ? { ...z, side: 'BACK' } : z))}
                                                className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", selectedZone.side === 'BACK' ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
                                            >
                                                Back
                                            </button>
                                        </div>
                                        <Label>Content (Mock)</Label>
                                        <div className="space-y-2">
                                            <textarea value={selectedZone.mockContent} onChange={e => updateZones(allZones.map(z => z.id === selectedZone.id ? { ...z, mockContent: e.target.value } : z))} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium min-h-[60px]" placeholder="Content..." />

                                            {selectedZone.type === 'STUDENT_PHOTO' && (
                                                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />
                                                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Adjust Photo</span>
                                                    </div>
                                                    <p className="text-[9px] text-zinc-500 font-bold leading-relaxed">
                                                        Use the <span className="text-indigo-600">Blue Box</span> to resize the frame and the <span className="text-emerald-600">Green Box</span> to scale or move the photo inside.
                                                    </p>
                                                </div>
                                            )}

                                            {['SCHOOL_LOGO', 'IMAGE', 'LOGO', 'STUDENT_PHOTO'].includes(selectedZone.type) && (
                                                <div className="bg-zinc-100/50 p-4 rounded-2xl border border-zinc-200/50">
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Upload Custom Image</p>
                                                    <MediaUploader
                                                        type="PHOTO"
                                                        folder="branding"
                                                        onUploadComplete={(url) => {
                                                            if (['STUDENT_PHOTO', 'IMAGE'].includes(selectedZone.type)) {
                                                                const aspect = selectedZone.type === 'STUDENT_PHOTO' ? 1 : undefined;
                                                                setCropperData({
                                                                    isOpen: true,
                                                                    image: url,
                                                                    zoneId: selectedZone.id,
                                                                    zoneType: selectedZone.type,
                                                                    aspect
                                                                });
                                                            } else {
                                                                // For Logos, Signatures, QR Codes: No cropping, just place proportionately
                                                                const img = new Image();
                                                                img.onload = () => {
                                                                    const aspect = img.width / img.height;
                                                                    updateZones(allZones.map(z => {
                                                                        if (z.id === selectedZone.id) {
                                                                            // Keep width, adjust height based on natural aspect
                                                                            return { ...z, mockContent: url, height: z.width / aspect };
                                                                        }
                                                                        return z;
                                                                    }));
                                                                };
                                                                img.src = url;
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Section>

                                {['STUDENT_NAME', 'ADMISSION_NUMBER', 'GRADE', 'BLOOD_GROUP', 'SCHOOL_NAME', 'TEXT'].includes(selectedZone.type) && (
                                    <Section title="Typography">
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Font Family</Label>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={selectedZone.style.fontFamily}
                                                        onChange={e => updateZoneStyle(selectedZone.id, { fontFamily: e.target.value })}
                                                        className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold"
                                                    >
                                                        {GOOGLE_FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                                                    </select>
                                                    <input type="color" value={selectedZone.style.color || '#000000'} onChange={e => updateZoneStyle(selectedZone.id, { color: e.target.value })} className="w-10 h-10 p-1 bg-white border border-zinc-200 rounded-xl cursor-pointer" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Size</Label>
                                                    <input type="number" value={selectedZone.style.fontSize} onChange={e => updateZoneStyle(selectedZone.id, { fontSize: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                                </div>
                                                <div>
                                                    <Label>Spacing</Label>
                                                    <input type="number" step="0.1" value={selectedZone.style.letterSpacing} onChange={e => updateZoneStyle(selectedZone.id, { letterSpacing: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => updateZoneStyle(selectedZone.id, { textAlign: 'left' })} className={cn("flex-1 p-2 rounded-lg border", selectedZone.style.textAlign === 'left' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-400 border-zinc-200")}><AlignLeft className="h-4 w-4 mx-auto" /></button>
                                                <button onClick={() => updateZoneStyle(selectedZone.id, { textAlign: 'center' })} className={cn("flex-1 p-2 rounded-lg border", selectedZone.style.textAlign === 'center' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-400 border-zinc-200")}><AlignCenter className="h-4 w-4 mx-auto" /></button>
                                                <button onClick={() => updateZoneStyle(selectedZone.id, { textAlign: 'right' })} className={cn("flex-1 p-2 rounded-lg border", selectedZone.style.textAlign === 'right' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-400 border-zinc-200")}><AlignRight className="h-4 w-4 mx-auto" /></button>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => updateZoneStyle(selectedZone.id, { weight: selectedZone.style.weight === 'bold' ? 'normal' : 'bold' })} className={cn("flex-1 p-2 rounded-lg border text-[10px] font-black uppercase", selectedZone.style.weight === 'bold' ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-400 border-zinc-200")}>Bold</button>
                                                <button onClick={() => updateZoneStyle(selectedZone.id, { italic: !selectedZone.style.italic })} className={cn("flex-1 p-2 rounded-lg border text-[10px] font-black uppercase", selectedZone.style.italic ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-400 border-zinc-200")}>Italic</button>
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                {['RECTANGLE', 'CIRCLE', 'PATH', 'SHAPE'].includes(selectedZone.type) && (
                                    <Section title="Fill & Appearance">
                                        <div className="space-y-4">
                                            <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                                                <button onClick={() => updateZoneStyle(selectedZone.id, { fillType: 'solid' })} className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight", selectedZone.style.fillType === 'solid' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400")}>Solid</button>
                                                <button onClick={() => updateZoneStyle(selectedZone.id, { fillType: 'gradient' })} className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight", selectedZone.style.fillType === 'gradient' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400")}>Gradient</button>
                                                <button onClick={() => updateZoneStyle(selectedZone.id, { fillType: 'none' })} className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight", selectedZone.style.fillType === 'none' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400")}>None</button>
                                            </div>

                                            {selectedZone.style.fillType === 'solid' && (
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <Label>Fill Color</Label>
                                                        <div className="flex gap-2">
                                                            <input type="color" value={selectedZone.style.bgColor || '#ffffff'} onChange={e => updateZoneStyle(selectedZone.id, { bgColor: e.target.value })} className="flex-1 h-10 p-1 bg-white border border-zinc-200 rounded-xl cursor-pointer" />
                                                            <input type="number" min="0" max="100" value={selectedZone.style.bgOpacity} onChange={e => updateZoneStyle(selectedZone.id, { bgOpacity: parseInt(e.target.value) })} className="w-16 px-2 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedZone.style.fillType === 'gradient' && (
                                                <div className="space-y-3">
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <Label>Start</Label>
                                                            <input type="color" value={selectedZone.style.gradient?.startColor || '#ffffff'} onChange={e => updateZoneStyle(selectedZone.id, { gradient: { ...selectedZone.style.gradient!, startColor: e.target.value } })} className="w-full h-10 p-1 bg-white border border-zinc-200 rounded-xl cursor-pointer" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label>End</Label>
                                                            <input type="color" value={selectedZone.style.gradient?.endColor || '#000000'} onChange={e => updateZoneStyle(selectedZone.id, { gradient: { ...selectedZone.style.gradient!, endColor: e.target.value } })} className="w-full h-10 p-1 bg-white border border-zinc-200 rounded-xl cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Angle ({selectedZone.style.gradient?.direction || 0}°)</Label>
                                                        <input type="range" min="0" max="360" value={selectedZone.style.gradient?.direction || 0} onChange={e => updateZoneStyle(selectedZone.id, { gradient: { ...selectedZone.style.gradient!, direction: parseInt(e.target.value) } })} className="w-full" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Section>
                                )}

                                <Section title="Effects & Borders">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Opacity</Label>
                                                <input type="number" min="0" max="100" value={selectedZone.style.opacity} onChange={e => updateZoneStyle(selectedZone.id, { opacity: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                            </div>
                                            <div>
                                                <Label>Radius</Label>
                                                <input type="number" value={selectedZone.style.borderRadius} onChange={e => updateZoneStyle(selectedZone.id, { borderRadius: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                            </div>
                                        </div>

                                        {!['STUDENT_NAME', 'ADMISSION_NUMBER', 'GRADE', 'BLOOD_GROUP', 'SCHOOL_NAME', 'TEXT', 'STUDENT_PHOTO', 'QR_CODE'].includes(selectedZone.type) && (
                                            <div className="space-y-4">
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <Label>Stroke Color</Label>
                                                        <input type="color" value={selectedZone.style.stroke || '#000000'} onChange={e => updateZoneStyle(selectedZone.id, { stroke: e.target.value })} className="w-full h-10 p-1 bg-white border border-zinc-200 rounded-xl cursor-pointer" />
                                                    </div>
                                                    <div className="w-24">
                                                        <Label>Width</Label>
                                                        <input type="number" min="0" value={selectedZone.style.strokeWidth || 0} onChange={e => updateZoneStyle(selectedZone.id, { strokeWidth: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Dash Array (eg: 5, 5)</Label>
                                                    <input
                                                        type="text"
                                                        value={selectedZone.style.dash?.join(', ') || ''}
                                                        onChange={e => updateZoneStyle(selectedZone.id, { dash: e.target.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n)) })}
                                                        placeholder="None"
                                                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Section>

                                <div className="flex gap-2 pt-4">
                                    <button onClick={() => duplicateZone(selectedZone.id)} className="flex-1 py-3 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"><Copy className="h-3 w-3" /> Duplicate</button>
                                    <button onClick={() => removeZone(selectedZone.id)} className="flex-1 py-3 px-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center gap-2"><Trash2 className="h-3 w-3" /> Delete</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <Section title="Canvas Settings">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Units</Label>
                                            <div className="flex bg-zinc-100 p-1 rounded-xl mt-1 text-[10px]">
                                                {['mm', 'cm', 'in'].map((u: any) => (
                                                    <button
                                                        key={u}
                                                        onClick={() => handleUnitChange(u)}
                                                        className={cn(
                                                            "flex-1 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all",
                                                            canvasSettings.unit === u ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                                        )}
                                                    >
                                                        {u}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>W ({canvasSettings.unit})</Label>
                                                <input type="number" value={canvasSettings.width} onChange={e => setCanvasSettings(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                            </div>
                                            <div>
                                                <Label>H ({canvasSettings.unit})</Label>
                                                <input type="number" value={canvasSettings.height} onChange={e => setCanvasSettings(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>Bleed (mm)</Label>
                                                <input type="number" value={canvasSettings.bleed} onChange={e => setCanvasSettings(prev => ({ ...prev, bleed: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                            </div>
                                            <div>
                                                <Label>Safe Area (mm)</Label>
                                                <input type="number" value={canvasSettings.safeMargin} onChange={e => setCanvasSettings(prev => ({ ...prev, safeMargin: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                                            <div className="flex items-center gap-2">
                                                <Eye className="h-3.5 w-3.5 text-zinc-400" />
                                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Show Guides</span>
                                            </div>
                                            <button
                                                onClick={() => setCanvasSettings(prev => ({ ...prev, showGuides: !prev.showGuides }))}
                                                className={cn("w-10 h-5 rounded-full transition-all relative", canvasSettings.showGuides ? "bg-indigo-600" : "bg-zinc-200")}
                                            >
                                                <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", canvasSettings.showGuides ? "right-1" : "left-1")} />
                                            </button>
                                        </div>
                                    </div>
                                </Section>

                                <div className="py-12 text-center space-y-4 px-6 border-t border-zinc-100">
                                    <div className="h-16 w-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mx-auto text-zinc-200">
                                        <MousePointer2 className="h-8 w-8 text-zinc-300" />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">Select an element on the canvas to edit its properties</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {cropperData.isOpen && cropperData.image && (
                    <PhotoCropper
                        image={cropperData.image}
                        aspect={cropperData.aspect}
                        title={cropperData.zoneType === 'STUDENT_PHOTO' ? 'Crop Student Photo' : 'Crop Image'}
                        onCancel={() => setCropperData({ isOpen: false, image: '', zoneId: null, zoneType: null, aspect: undefined })}
                        onCropComplete={(croppedUrl) => {
                            if (cropperData.zoneId) {
                                updateZones(zones.map(z => z.id === cropperData.zoneId ? { ...z, mockContent: croppedUrl } : z));
                            }
                            setCropperData({ isOpen: false, image: '', zoneId: null, zoneType: null, aspect: undefined });
                        }}
                    />
                )}
            </div>
        </div >
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">{title}</h4>
            <div className="p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100 space-y-4">{children}</div>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{children}</label>;
}
