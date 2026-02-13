"use client";

import { useState, useEffect, useRef } from "react";
import {
    Download,
    ArrowLeft,
    RefreshCw,
    Palette,
    Type,
    Image as ImageIcon,
    Sparkles,
    CheckCircle2,
    Save,
    Share2,
    ZoomIn,
    Plus,
    Minus,
    Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMarketingTemplateAction } from "@/app/actions/marketing-actions";
import { getSchoolBySlugAction } from "@/app/actions/parent-actions";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getGoogleFontUrl } from "@/lib/fonts";
import { MarketingRenderer } from "@/components/admin-console/MarketingRenderer";
import { saveSchoolDesignAction, getSchoolDesignAction, resetSchoolDesignAction } from "@/app/actions/school-marketing-actions";
import { uploadFileForSchoolAction } from "@/app/actions/upload-actions";

interface ZoneStyle {
    fontFamily: string;
    fontSize: number;
    fillType: 'solid' | 'gradient';
    color: string;
    gradient?: {
        start: string;
        end: string;
        direction: number;
    };
    shadowColor?: string;
    textAlign: 'left' | 'center' | 'right';
    weight: 'normal' | 'bold' | '300' | '700' | '800' | '900';
    italic: boolean;
    uppercase: boolean;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    letterSpacing: number;
    lineHeight: number;
}

interface Zone {
    id: string;
    type: 'LOGO' | 'SCHOOL_NAME' | 'HEADLINE' | 'SUB_HEADLINE' | 'CONTACT_INFO' | 'QR_CODE' | 'WEBSITE' | 'IMAGE';
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    style?: ZoneStyle;
    mockContent?: string;
    zIndex?: number;
}

export default function MarketingCustomizerPage() {
    const router = useRouter();
    const { slug, id } = useParams();

    const [template, setTemplate] = useState<any>(null);
    const [school, setSchool] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const [zones, setZones] = useState<Zone[]>([]);
    const [customValues, setCustomValues] = useState<Record<string, string>>({});
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        loadData();
    }, [id, slug]);

    // Dynamic Font Loading
    useEffect(() => {
        if (!zones.length) return;
        const usedFonts = Array.from(new Set(zones.map(z => z.style?.fontFamily).filter(Boolean))) as string[];
        const filteredFonts = usedFonts.filter(f => f !== 'Outfit' && f !== 'Inter' && f !== 'Poppins');

        if (filteredFonts.length > 0) {
            const url = getGoogleFontUrl(filteredFonts);
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

    async function loadData() {
        setIsLoading(true);
        const [tRes, sRes, dRes] = await Promise.all([
            getMarketingTemplateAction(id as string),
            getSchoolBySlugAction(slug as string),
            getSchoolDesignAction(slug as string, id as string)
        ]);

        if (tRes.success && tRes.data && sRes.success) {
            setTemplate(tRes.data);
            setSchool(sRes.school);

            const parsedZones = JSON.parse(tRes.data.config || "[]");
            setZones(parsedZones);

            const savedData = dRes.success ? (typeof dRes.data === 'string' ? JSON.parse(dRes.data) : dRes.data) : null;
            const initialValues: Record<string, string> = {};

            parsedZones.forEach((z: Zone) => {
                // Check if we have saved data for this zone (structured)
                if (savedData && savedData[z.id]) {
                    if (typeof savedData[z.id] === 'object') {
                        initialValues[z.id] = savedData[z.id].content;
                    } else {
                        // Migration/Fallback for old string values
                        initialValues[z.id] = savedData[z.id];
                    }
                } else {
                    // Fallback to defaults
                    if (z.type === 'SCHOOL_NAME') initialValues[z.id] = sRes.school.name;
                    else if (z.type === 'CONTACT_INFO') initialValues[z.id] = sRes.school.phone || sRes.school.email || "";
                    else if (z.type === 'WEBSITE') initialValues[z.id] = sRes.school.website || "";
                    else if (z.mockContent) {
                        initialValues[z.id] = z.mockContent;
                    }
                }
            });
            setCustomValues(initialValues);
        } else {
            toast.error("Failed to load template or school data");
            router.push(`/s/${slug}/marketing`);
        }
        setIsLoading(false);
    }

    const handleDownload = async () => {
        setIsGenerating(true);

        try {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Use natural dimensions for high-res output
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = template.baseImageUrl;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Draw Base
            ctx.drawImage(img, 0, 0);

            // Draw Zones
            await document.fonts.ready; // Ensure fonts are loaded

            // Sort zones by z-index for correct layering
            const sortedZones = [...zones].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

            for (const zone of sortedZones) {
                const x = (zone.x / 100) * canvas.width;
                const y = (zone.y / 100) * canvas.height;
                const w = (zone.width / 100) * canvas.width;
                const h = (zone.height / 100) * canvas.height;

                if (zone.type === 'LOGO' && school.logo) {
                    const logoImg = new Image();
                    logoImg.crossOrigin = "anonymous";
                    logoImg.src = school.logo;
                    await new Promise((resolve) => {
                        logoImg.onload = resolve;
                        logoImg.onerror = resolve;
                    });

                    if (logoImg.complete && logoImg.naturalWidth > 0) {
                        const ratio = Math.min(w / logoImg.naturalWidth, h / logoImg.naturalHeight);
                        const finalW = logoImg.naturalWidth * ratio;
                        const finalH = logoImg.naturalHeight * ratio;
                        const finalX = x + (w - finalW) / 2;
                        const finalY = y + (h - finalH) / 2;
                        ctx.drawImage(logoImg, finalX, finalY, finalW, finalH);
                    }
                } else if (zone.type === 'IMAGE') {
                    const imageUrl = customValues[zone.id] || zone.mockContent;
                    if (imageUrl) {
                        const zoneImg = new Image();
                        zoneImg.crossOrigin = "anonymous";
                        zoneImg.src = imageUrl;
                        await new Promise((resolve) => {
                            zoneImg.onload = resolve;
                            zoneImg.onerror = resolve;
                        });

                        if (zoneImg.complete && zoneImg.naturalWidth > 0) {
                            // Cover fit for images like in CSS
                            const ratio = Math.max(w / zoneImg.naturalWidth, h / zoneImg.naturalHeight);
                            const finalW = zoneImg.naturalWidth * ratio;
                            const finalH = zoneImg.naturalHeight * ratio;
                            const finalX = x + (w - finalW) / 2;
                            const finalY = y + (h - finalH) / 2;

                            ctx.save();
                            ctx.beginPath();
                            ctx.rect(x, y, w, h);
                            ctx.clip();
                            ctx.drawImage(zoneImg, finalX, finalY, finalW, finalH);
                            ctx.restore();
                        }
                    }
                } else if (customValues[zone.id]) {
                    // Draw Styled Text
                    const style = zone.style || {
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
                        lineHeight: 1.2,
                        padding: 5,
                        verticalAlign: 'middle'
                    } as any;

                    // Calculate font size relative to ZONE HEIGHT (matching Konva)
                    const fontSizePct = style.fontSize || 5;
                    const fontSizePx = (fontSizePct / 100) * h; // Fix: Relative to h, not canvas.height

                    const weight = (style.weight === '800' || style.weight === '900') ? '900' :
                        (style.weight === 'bold' || style.weight === '700') ? '700' :
                            (style.weight === '300' ? '300' : '400');

                    const family = style.fontFamily || 'sans-serif';
                    const italic = style.italic ? 'italic' : '';
                    const padding = (style.padding || 5);
                    const paddingPx = (padding / 100) * Math.min(w, h); // Approx padding

                    ctx.font = `${italic} ${weight} ${fontSizePx}px "${family}"`;
                    ctx.textAlign = style.textAlign || 'center';

                    // Vertical Alignment
                    if (style.verticalAlign === 'top') {
                        ctx.textBaseline = 'top';
                    } else if (style.verticalAlign === 'bottom') {
                        ctx.textBaseline = 'bottom';
                    } else {
                        ctx.textBaseline = 'middle';
                    }

                    // Shadow
                    if (style.shadow && style.shadow !== 'none') {
                        ctx.shadowColor = 'rgba(0,0,0,0.5)';
                        if (style.shadow === 'sm') { ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
                        else if (style.shadow === 'md') { ctx.shadowBlur = 8; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4; }
                        else if (style.shadow === 'lg') { ctx.shadowBlur = 15; ctx.shadowOffsetX = 8; ctx.shadowOffsetY = 8; }
                        else if (style.shadow === 'xl') { ctx.shadowColor = 'black'; ctx.shadowBlur = 0; ctx.lineWidth = 4; ctx.strokeStyle = 'black'; }
                    } else {
                        ctx.shadowColor = 'transparent';
                    }

                    // Fill Style
                    if (style.fillType === 'gradient' && style.gradient) {
                        const angleRad = (style.gradient.direction - 90) * (Math.PI / 180);
                        const cx = x + w / 2;
                        const cy = y + h / 2;
                        const dist = w;

                        const x1 = cx - Math.cos(angleRad) * dist / 2;
                        const y1 = cy - Math.sin(angleRad) * dist / 2;
                        const x2 = cx + Math.cos(angleRad) * dist / 2;
                        const y2 = cy + Math.sin(angleRad) * dist / 2;

                        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
                        grad.addColorStop(0, style.gradient.start);
                        grad.addColorStop(1, style.gradient.end);
                        ctx.fillStyle = grad;
                    } else {
                        ctx.fillStyle = style.color || school.primaryColor || '#000000';
                    }

                    // Calculate drawing position within the zone
                    let textX = x + w / 2;
                    if (style.textAlign === 'left') textX = x + paddingPx;
                    else if (style.textAlign === 'right') textX = x + w - paddingPx;

                    let textY = y + h / 2;
                    if (style.verticalAlign === 'top') textY = y + paddingPx;
                    else if (style.verticalAlign === 'bottom') textY = y + h - paddingPx;

                    const textToDraw = style.uppercase ? customValues[zone.id].toUpperCase() : customValues[zone.id];

                    // --- Multi-line Text Rendering Support ---
                    const lineHeight = fontSizePx * (style.lineHeight || 1.2);
                    const maxTextWidth = w - (paddingPx * 2);

                    // Simple word wrap + newline support
                    const getLines = (text: string, maxWidth: number) => {
                        const paragraphs = text.split('\n');
                        const lines: string[] = [];

                        paragraphs.forEach(paragraph => {
                            if (paragraph === '') {
                                lines.push('');
                                return;
                            }
                            const words = paragraph.split(' ');
                            let currentLine = words[0];

                            for (let i = 1; i < words.length; i++) {
                                const word = words[i];
                                const width = ctx.measureText(currentLine + " " + word).width;
                                if (width < maxWidth) {
                                    currentLine += " " + word;
                                } else {
                                    lines.push(currentLine);
                                    currentLine = word;
                                }
                            }
                            lines.push(currentLine);
                        });
                        return lines;
                    };

                    const lines = getLines(textToDraw, maxTextWidth);
                    const totalHeight = lines.length * lineHeight;

                    // Starting Y based on vertical alignment
                    let startY = y + h / 2; // Default middle
                    if (style.verticalAlign === 'top') {
                        startY = y + paddingPx + (fontSizePx / 2);
                    } else if (style.verticalAlign === 'bottom') {
                        startY = y + h - paddingPx - totalHeight + (fontSizePx / 2);
                    } else {
                        startY = y + (h - totalHeight) / 2 + (fontSizePx / 2);
                    }

                    // Draw each line
                    lines.forEach((line, index) => {
                        const lineY = startY + (index * lineHeight);

                        if (style.shadow === 'xl') {
                            ctx.strokeText(line, textX, lineY);
                        }
                        ctx.fillText(line, textX, lineY);
                    });

                    // Reset Shadow
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.lineWidth = 0;
                }
            }

            // Trigger Download
            const link = document.createElement('a');
            link.download = `${template.name.replace(/\s+/g, '_')}_Branded.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success("Ready for download!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate high-res image");
        }
        setIsGenerating(false);
    };

    async function handleSaveDraft() {
        const loadingToast = toast.loading("Saving draft...");

        // Structure data: { zoneId: { content, style } }
        const structuredData: Record<string, any> = {};
        zones.forEach(z => {
            structuredData[z.id] = {
                content: customValues[z.id] || "",
                style: {} // No style overrides in school portal
            };
        });

        const res = await saveSchoolDesignAction(slug as string, id as string, JSON.stringify(structuredData) as any);
        toast.dismiss(loadingToast);

        if (res.success) {
            toast.success("Draft saved successfully");
        } else {
            toast.error("Failed to save draft");
        }
    }

    async function handleReset() {
        if (!confirm("Are you sure? This will discard all your customizations and revert to the original template.")) return;

        const loadingToast = toast.loading("Resetting design...");
        const res = await resetSchoolDesignAction(slug as string, id as string);

        if (res.success) {
            await loadData(); // Reload to get fresh defaults
            toast.success("Design reset to original");
        } else {
            toast.error("Failed to reset design");
        }
        toast.dismiss(loadingToast);
    }

    if (isLoading) return <LoadingState />;
    if (!template) return null; // Prevent rendering if template failed to load

    return (
        <div className="min-h-full bg-zinc-100/50">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-zinc-200/50 px-8 py-4 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-6">
                        <Link href={`/s/${slug}/marketing`} className="h-11 w-11 rounded-2xl bg-zinc-900/5 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-900/10 transition-all active:scale-95">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="h-8 w-[1px] bg-zinc-200 hidden md:block" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black tracking-tight text-zinc-900 uppercase">Branding <span className="text-brand">Studio</span></h1>
                                <span className="bg-brand/10 text-brand px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Beta</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-1 opacity-60">Creative Engine v2</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 rounded-xl px-4 py-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-50 font-bold uppercase text-[9px] tracking-widest transition-all active:scale-95 border border-zinc-200/50"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Reset Template
                        </button>

                        <div className="h-6 w-[1px] bg-zinc-200 mx-1" />

                        <button
                            onClick={handleSaveDraft}
                            className="flex items-center gap-2 rounded-xl px-4 py-2 bg-zinc-100 text-zinc-900 font-bold uppercase text-[9px] tracking-widest transition-all hover:bg-zinc-200 active:scale-95 border border-zinc-200/50"
                        >
                            <Save className="h-3.5 w-3.5" />
                            Save Draft
                        </button>

                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className={cn(
                                "group relative flex items-center gap-2 rounded-xl px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-white font-black uppercase text-[10px] tracking-[0.1em] transition-all hover:bg-zinc-800 active:scale-95 shadow-xl shadow-zinc-900/20",
                                isGenerating && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isGenerating ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-brand" />
                            ) : (
                                <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                            )}
                            <span>Download <span className="text-brand">Image</span></span>
                        </button>

                        <div className="h-6 w-[1px] bg-zinc-200 mx-1" />

                        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1 border border-zinc-200/50">
                            <button
                                onClick={() => setZoom(Math.max(25, zoom - 25))}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setZoom(100)}
                                className="px-2 h-8 rounded-lg flex items-center justify-center hover:bg-white text-[9px] font-black text-zinc-500 hover:text-zinc-900 uppercase tracking-widest transition-all"
                            >
                                {zoom}%
                            </button>
                            <button
                                onClick={() => setZoom(Math.min(400, zoom + 25))}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
                    {/* Live Preview */}
                    <div className="flex-1 w-full max-w-4xl space-y-6 lg:sticky lg:top-28">
                        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] p-4 lg:p-12 border border-white shadow-2xl relative overflow-hidden group">
                            <div className="bg-zinc-50 rounded-2xl relative overflow-auto custom-scrollbar ring-1 ring-zinc-200/50 shadow-inner p-4 flex items-center justify-center">
                                <MarketingRenderer
                                    imageUrl={template.baseImageUrl}
                                    zones={zones as any}
                                    contentOverrides={customValues}
                                    styleOverrides={{}}
                                    selectedZoneId={selectedZoneId}
                                    onZoneClick={(id) => setSelectedZoneId(id)}
                                    className="w-full"
                                    allowTransformer={true}
                                    zoom={zoom / 100}
                                />
                            </div>

                            <div className="absolute top-12 left-12 flex flex-col gap-2 pointer-events-none">
                                <span className="bg-white/80 backdrop-blur-md text-brand px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white flex items-center gap-2 shadow-sm">
                                    <Monitor className="h-3 w-3" />
                                    Live Preview
                                </span>
                            </div>
                        </div>

                        <div className="bg-brand/5 rounded-3xl p-6 border border-brand/10 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-bold text-brand uppercase tracking-widest leading-relaxed">
                                Smart-Auto branding has applied your school logo, name, and contact details automatically. Click elements to edit.
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full lg:w-96 space-y-8 lg:sticky lg:top-28">
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl">
                            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Palette className="h-4 w-4 text-brand" />
                                Custom Studio
                            </h3>

                            <div className="space-y-6 max-h-[calc(100vh-450px)] overflow-y-auto pr-2 custom-scrollbar-gentle">
                                {zones.filter(z => z.type !== 'LOGO' && z.type !== 'QR_CODE').map((zone) => (
                                    <div
                                        key={zone.id}
                                        className={cn(
                                            "space-y-2 p-3 rounded-2xl transition-all border",
                                            selectedZoneId === zone.id
                                                ? "bg-brand/5 border-brand/20 ring-1 ring-brand/20"
                                                : "bg-transparent border-transparent hover:bg-zinc-50"
                                        )}
                                        onClick={() => setSelectedZoneId(zone.id)}
                                    >
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                            {zone.type.replace('_', ' ')}
                                            {customValues[zone.id] === "" && <span className="text-rose-400 h-1 w-1 rounded-full bg-rose-400" />}
                                        </label>
                                        <div className="relative group">
                                            {zone.type === 'IMAGE' ? (
                                                <div className="space-y-3">
                                                    {/* Image Preview */}
                                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                                                        <img
                                                            src={customValues[zone.id] || zone.mockContent}
                                                            alt="Zone Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {/* Upload Button */}
                                                    <div className="flex items-center gap-2">
                                                        <label className="flex-1 cursor-pointer">
                                                            <input
                                                                type="file"
                                                                accept="image/png, image/jpeg, image/webp"
                                                                className="hidden"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;

                                                                    const toastId = toast.loading("Uploading image...");
                                                                    const formData = new FormData();
                                                                    formData.append("file", file);
                                                                    formData.append("folder", "marketing-customizations");

                                                                    const res = await uploadFileForSchoolAction(formData, slug as string) as any;

                                                                    if (res.success && res.url) {
                                                                        setCustomValues(prev => ({ ...prev, [zone.id]: res.url }));
                                                                        toast.success("Image uploaded!");
                                                                    } else {
                                                                        toast.error(res.error || "Upload failed");
                                                                    }
                                                                    toast.dismiss(toastId);
                                                                }}
                                                            />
                                                            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
                                                                <ImageIcon className="h-4 w-4" />
                                                                Replace Image
                                                            </div>
                                                        </label>
                                                        {customValues[zone.id] && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newVals = { ...customValues };
                                                                    delete newVals[zone.id];
                                                                    setCustomValues(newVals);
                                                                }}
                                                                className="p-2 rounded-xl bg-white border border-zinc-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
                                                                title="Reset to Default"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {zone.type === 'HEADLINE' || zone.type === 'SUB_HEADLINE' ? (
                                                        <textarea
                                                            value={customValues[zone.id] || ""}
                                                            onChange={(e) => setCustomValues({ ...customValues, [zone.id]: e.target.value })}
                                                            rows={2}
                                                            placeholder="Enter text..."
                                                            className="w-full rounded-2xl border-none bg-zinc-100 p-4 text-xs font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-brand/5 transition-all resize-none shadow-inner"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={customValues[zone.id] || ""}
                                                            onChange={(e) => setCustomValues({ ...customValues, [zone.id]: e.target.value })}
                                                            placeholder="Enter content..."
                                                            className="w-full rounded-2xl border-none bg-zinc-100 p-4 text-xs font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-brand/5 transition-all shadow-inner"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-zinc-50 flex flex-col gap-4">
                                <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    <span>Export Quality</span>
                                    <span className="text-brand">Ultrapixel PNG</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-brand" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-950/90 backdrop-blur-2xl rounded-[2.5rem] p-8 text-white shadow-2xl shadow-zinc-900/40 border border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Workspace Actions</h3>
                                <div className="flex gap-1">
                                    <div className="h-1 w-1 rounded-full bg-brand" />
                                    <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                    <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button className="flex flex-row items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 group">
                                    <Share2 className="h-5 w-5 text-zinc-400 group-hover:text-brand transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Share Branded Link</span>
                                </button>
                                <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                                    <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                                        Use the header buttons to <span className="text-zinc-300">Save</span>, <span className="text-zinc-300">Reset</span> or <span className="text-zinc-300">Download</span> your work.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            {/* Hidden High-Res Canvas */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

function LoadingState() {
    return (
        <div className="h-full min-h-[50vh] bg-white flex flex-col items-center justify-center">
            <div className="relative h-24 w-24">
                <div className="absolute inset-0 border-4 border-brand/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-brand rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] animate-pulse">Initializing Creative Studio</p>
        </div>
    );
}
