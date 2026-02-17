"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group, Transformer, Circle, Path, Line } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { cn } from "@/lib/utils";

// --- Types ---
export interface ZoneStyle {
    fontFamily: string;
    fontSize: number;
    fillType: 'solid' | 'gradient' | 'none';
    color: string;
    gradient?: {
        type: 'linear' | 'radial';
        startColor: string;
        endColor: string;
        direction?: number; // for linear
    };
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

    // New Advanced Props
    stroke?: string;
    strokeWidth?: number;
    dash?: number[];
    pathData?: string; // For Pen tool
    points?: number[]; // For Lines/Polygons

    // Photo Masking
    // photoTransform is no longer used, as we use a pre-upload cropper modal.
}

export interface IDZone {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    style: ZoneStyle;
    mockContent: string;
    zIndex?: number;
    locked?: boolean;
    visible?: boolean;
    side?: 'FRONT' | 'BACK';
}

export interface IDCardKonvaCanvasProps {
    zones: IDZone[];
    selectedZoneIds?: string[];
    keyElementId?: string | null;
    mode?: 'SELECT' | 'DRAW' | 'PEN';
    stageRef?: React.MutableRefObject<any>;
    onSelectZone?: (id: string | null, shiftKey?: boolean) => void;
    onZoneTransform?: (id: string, update: { x: number; y: number; width: number; height: number; rotation?: number }) => void;
    onZoneDrawn?: (zone: { x: number; y: number; width: number; height: number; type?: string }) => void;
    onPathAdded?: (pathData: string) => void;
    readOnly?: boolean;
    allowDrag?: boolean;
    allowTransformer?: boolean;
    zoom?: number;
    orientation: 'VERTICAL' | 'HORIZONTAL';
    width?: number;
    height?: number;
    unit?: 'mm' | 'cm' | 'in';
    bleed?: number;
    safeMargin?: number;
    showGuides?: boolean;
}

// --- Helpers ---
const UNIT_TO_MM = {
    mm: 1,
    cm: 10,
    in: 25.4
};

const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || hex === 'transparent') return 'rgba(0,0,0,0)';
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + (alpha / 100) + ')';
    }
    return hex;
};

const getFillProps = (s: ZoneStyle, w: number, h: number) => {
    if (s.fillType === 'none') return { fill: undefined };
    if (s.fillType === 'gradient' && s.gradient) {
        const { type, startColor, endColor, direction = 0 } = s.gradient;
        if (type === 'linear') {
            const angle = (direction * Math.PI) / 180;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return {
                fillLinearGradientStartPoint: { x: 0, y: 0 },
                fillLinearGradientEndPoint: { x: w * cos, y: h * sin },
                fillLinearGradientColorStops: [0, startColor, 1, endColor],
            };
        } else {
            return {
                fillRadialGradientStartPoint: { x: w / 2, y: h / 2 },
                fillRadialGradientStartRadius: 0,
                fillRadialGradientEndPoint: { x: w / 2, y: h / 2 },
                fillRadialGradientEndRadius: Math.max(w, h) / 2,
                fillRadialGradientColorStops: [0, startColor, 1, endColor],
            };
        }
    }
    return { fill: s.bgColor && s.bgColor !== 'transparent' ? hexToRgba(s.bgColor, s.bgOpacity || 100) : undefined };
};

const URLImage = React.forwardRef(({ src, width, height, cornerRadius, opacity, fit = 'cover' }: any, ref: any) => {
    const [image] = useImage(src, 'anonymous');

    const transform = useMemo(() => {
        if (!image) return { x: 0, y: 0, width, height, scaleX: 1, scaleY: 1 };

        const imgRatio = image.width / image.height;
        const containerRatio = width / height;

        let drawWidth, drawHeight, drawX, drawY;

        if (fit === 'cover') {
            // "object-fit: cover" logic
            if (imgRatio > containerRatio) {
                drawHeight = height;
                drawWidth = height * imgRatio;
                drawX = (width - drawWidth) / 2;
                drawY = 0;
            } else {
                drawWidth = width;
                drawHeight = width / imgRatio;
                drawX = 0;
                drawY = (height - drawHeight) / 2;
            }
        } else {
            // "object-fit: contain" logic
            if (imgRatio > containerRatio) {
                drawWidth = width;
                drawHeight = width / imgRatio;
                drawX = 0;
                drawY = (height - drawHeight) / 2;
            } else {
                drawHeight = height;
                drawWidth = height * imgRatio;
                drawX = (width - drawWidth) / 2;
                drawY = 0;
            }
        }

        return { x: drawX, y: drawY, width: drawWidth, height: drawHeight, scaleX: 1, scaleY: 1 };
    }, [image, width, height, fit]);

    return (
        <KonvaImage
            ref={ref}
            image={image}
            x={transform.x}
            y={transform.y}
            width={transform.width}
            height={transform.height}
            scaleX={transform.scaleX}
            scaleY={transform.scaleY}
            cornerRadius={cornerRadius}
            opacity={opacity}
        />
    );
});

URLImage.displayName = 'URLImage';

export default function IDCardKonvaCanvas({
    zones,
    selectedZoneIds = [],
    keyElementId = null,
    mode = 'SELECT',
    stageRef: externalStageRef, // Rename to avoid conflict
    onSelectZone = () => { },
    onZoneTransform = () => { },
    onZoneDrawn = () => { },
    onPathAdded = () => { },
    readOnly = false,
    allowDrag = true,
    allowTransformer = true,
    zoom = 1,
    orientation,
    width = 86,
    height = 54,
    unit = 'mm',
    bleed = 3,
    safeMargin = 5,
    showGuides = true,
}: any) {
    const internalStageRef = useRef<Konva.Stage>(null);
    const stageRef = externalStageRef || internalStageRef;

    const stageContainerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [penPoints, setPenPoints] = useState<number[]>([]);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
    const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

    const MM_TO_PX = 8;
    const unitMultiplier = UNIT_TO_MM[unit as keyof typeof UNIT_TO_MM];

    // Total canvas size including bleed
    const totalWidthMm = width * unitMultiplier + (bleed * 2);
    const totalHeightMm = height * unitMultiplier + (bleed * 2);

    const designWidth = totalWidthMm * MM_TO_PX;
    const designHeight = totalHeightMm * MM_TO_PX;

    const bleedPx = bleed * MM_TO_PX;
    const safePx = safeMargin * MM_TO_PX;

    useEffect(() => {
        setSize({ width: designWidth, height: designHeight });
    }, [designWidth, designHeight]);

    const sortedZones = useMemo(() => {
        return [...zones].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    }, [zones]);

    const trRef = useRef<Konva.Transformer>(null);
    // Removed photoTrRef and photoRefs

    useEffect(() => {
        if (!trRef.current || !stageRef.current) return;

        const nodes = selectedZoneIds
            .map((id: string) => stageRef.current.findOne('#' + id))
            .filter(Boolean);

        if (nodes.length > 0) {
            trRef.current.nodes(nodes);
        } else {
            trRef.current.nodes([]);
        }

        trRef.current.getLayer()?.batchDraw();
    }, [selectedZoneIds, zones, readOnly, allowTransformer]);

    const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (readOnly) return;
        const stage = e.target.getStage();
        if (!stage) return;

        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(stage.getPointerPosition()!);

        if (mode === 'DRAW') {
            setDrawStart(pos);
            setDrawCurrent(pos);
            onSelectZone(null);
            return;
        }

        if (mode === 'PEN') {
            setPenPoints([...penPoints, pos.x, pos.y]);
            return;
        }

        if (e.target === stage) {
            onSelectZone(null);
        }
    };

    const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (readOnly) return;
        const stage = e.target.getStage();
        if (!stage) return;

        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(stage.getPointerPosition()!);

        if (mode === 'DRAW' && drawStart) {
            setDrawCurrent(pos);
            return;
        }

        if (mode === 'PEN' && penPoints.length > 0) {
            // Preview current segment
            setDrawCurrent(pos);
        }
    };

    const handleStageMouseUp = () => {
        if (readOnly) return;

        if (mode === 'DRAW' && drawStart && drawCurrent) {
            const x = Math.min(drawStart.x, drawCurrent.x);
            const y = Math.min(drawStart.y, drawCurrent.y);
            const width = Math.abs(drawStart.x - drawCurrent.x);
            const height = Math.abs(drawStart.y - drawCurrent.y);

            if (width > 5 && height > 5) {
                onZoneDrawn({
                    x: (x / size.width) * 100,
                    y: (y / size.height) * 100,
                    width: (width / size.width) * 100,
                    height: (height / size.height) * 100
                });
            }
            setDrawStart(null);
            setDrawCurrent(null);
        }
    };

    const finishPenPath = () => {
        if (penPoints.length < 4) {
            setPenPoints([]);
            return;
        }
        // Convert points to SVG path data (normalized 0-100)
        let path = `M ${(penPoints[0] / size.width) * 100} ${(penPoints[1] / size.height) * 100}`;
        for (let i = 2; i < penPoints.length; i += 2) {
            path += ` L ${(penPoints[i] / size.width) * 100} ${(penPoints[i + 1] / size.height) * 100}`;
        }
        onPathAdded(path);
        setPenPoints([]);
    };

    // Handle double click or Enter to finish pen path in parent? 
    // For now let's just add a way to finish it.

    return (
        <div ref={stageContainerRef} className="w-full relative flex justify-center">
            {mode === 'PEN' && penPoints.length > 0 && (
                <button
                    onClick={finishPenPath}
                    className="absolute top-4 right-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                >
                    Finish Path
                </button>
            )}
            <div className="relative shadow-2xl bg-white border border-zinc-200" style={{
                width: size.width * zoom,
                height: size.height * zoom,
                transition: 'all 0.3s ease'
            }}>
                <Stage
                    width={size.width * zoom}
                    height={size.height * zoom}
                    ref={stageRef}
                    onMouseDown={handleStageMouseDown}
                    onMouseMove={handleStageMouseMove}
                    onMouseUp={handleStageMouseUp}
                    scaleX={zoom}
                    scaleY={zoom}
                    className={cn(
                        readOnly ? '' : (mode === 'SELECT' ? 'cursor-default' : 'cursor-crosshair')
                    )}
                >
                    <Layer>
                        {/* 1. Bleed Area Guide */}
                        {showGuides && (
                            <Rect
                                x={0}
                                y={0}
                                width={size.width}
                                height={size.height}
                                stroke="#ef4444"
                                strokeWidth={1}
                                dash={[5, 5]}
                                opacity={0.5}
                                listening={false}
                            />
                        )}

                        {/* 2. Trim Line (The actual card Edge) */}
                        <Rect
                            x={bleedPx}
                            y={bleedPx}
                            width={size.width - (bleedPx * 2)}
                            height={size.height - (bleedPx * 2)}
                            stroke="#000"
                            strokeWidth={1}
                            opacity={0.2}
                            listening={!readOnly}
                            onClick={(e) => {
                                e.cancelBubble = true;
                                if (!readOnly) onSelectZone('CANVAS');
                            }}
                        />

                        {/* 3. Safe Area Guide */}
                        {showGuides && (
                            <Rect
                                x={bleedPx + safePx}
                                y={bleedPx + safePx}
                                width={size.width - (bleedPx * 2) - (safePx * 2)}
                                height={size.height - (bleedPx * 2) - (safePx * 2)}
                                stroke="#10b981"
                                strokeWidth={1}
                                dash={[2, 2]}
                                opacity={0.4}
                                listening={false}
                            />
                        )}

                        {/* Content Group - Everything is relative to top-left of BLEED area if we want, 
                            but usually designers work relative to TRIM. Let's make it relative to TRIM (offset by bleedPx) 
                        */}
                        <Group x={bleedPx} y={bleedPx}>
                            {sortedZones.map((zone) => {
                                const s = zone.style;
                                const isImage = ['IMAGE', 'LOGO', 'STUDENT_PHOTO', 'SCHOOL_LOGO', 'SIGNATURE', 'QR_CODE'].includes(zone.type);
                                const isShape = ['SHAPE', 'CIRCLE', 'RECTANGLE', 'PATH'].includes(zone.type);
                                const isText = !isImage && !isShape;

                                const zoneX = (zone.x / 100) * (size.width - bleedPx * 2);
                                const zoneY = (zone.y / 100) * (size.height - bleedPx * 2);
                                const zoneW = (zone.width / 100) * (size.width - bleedPx * 2);
                                const zoneH = (zone.height / 100) * (size.height - bleedPx * 2);

                                if (zone.visible === false) return null;
                                const isLocked = zone.locked === true;

                                return (
                                    <Group
                                        key={zone.id}
                                        id={zone.id}
                                        x={zoneX}
                                        y={zoneY}
                                        width={zoneW}
                                        height={zoneH}
                                        draggable={!readOnly && !isLocked && allowDrag && mode === 'SELECT'}
                                        onClick={(e) => {
                                            e.cancelBubble = true;
                                            if (!readOnly) onSelectZone(zone.id, e.evt.shiftKey);
                                        }}
                                        onDragEnd={(e) => {
                                            if (readOnly || !allowDrag || isLocked) return;
                                            const node = e.target;
                                            const canvasW = size.width - bleedPx * 2;
                                            const canvasH = size.height - bleedPx * 2;
                                            onZoneTransform(zone.id, {
                                                x: (node.x() / canvasW) * 100,
                                                y: (node.y() / canvasH) * 100,
                                                width: (node.width() * node.scaleX() / canvasW) * 100,
                                                height: (node.height() * node.scaleY() / canvasH) * 100
                                            });
                                            node.scaleX(1); node.scaleY(1);
                                        }}
                                        onTransformEnd={(e) => {
                                            if (readOnly || !allowTransformer || isLocked) return;
                                            const node = e.target;
                                            const canvasW = size.width - bleedPx * 2;
                                            const canvasH = size.height - bleedPx * 2;
                                            onZoneTransform(zone.id, {
                                                x: (node.x() / canvasW) * 100,
                                                y: (node.y() / canvasH) * 100,
                                                width: (node.width() * node.scaleX() / canvasW) * 100,
                                                height: (node.height() * node.scaleY() / canvasH) * 100,
                                                rotation: node.rotation()
                                            });
                                            node.scaleX(1); node.scaleY(1);
                                        }}
                                        rotation={s.rotation || 0}
                                        opacity={(s.opacity ?? 100) / 100}
                                        listening={!isLocked}
                                        clipFunc={(ctx) => {
                                            const r = s.borderRadius || 0;
                                            if (r > 0) {
                                                ctx.beginPath();
                                                ctx.moveTo(r, 0);
                                                ctx.lineTo(zoneW - r, 0);
                                                ctx.quadraticCurveTo(zoneW, 0, zoneW, r);
                                                ctx.lineTo(zoneW, zoneH - r);
                                                ctx.quadraticCurveTo(zoneW, zoneH, zoneW - r, zoneH);
                                                ctx.lineTo(r, zoneH);
                                                ctx.quadraticCurveTo(0, zoneH, 0, zoneH - r);
                                                ctx.lineTo(0, r);
                                                ctx.quadraticCurveTo(0, 0, r, 0);
                                                ctx.closePath();
                                            } else {
                                                ctx.rect(0, 0, zoneW, zoneH);
                                            }
                                        }}
                                    >
                                        {isImage && (
                                            <URLImage
                                                src={zone.mockContent}
                                                width={zoneW}
                                                height={zoneH}
                                                cornerRadius={0} // Clipping handled by Group
                                                opacity={1} // Group handles opacity
                                                fit={['SCHOOL_LOGO', 'LOGO', 'SIGNATURE', 'QR_CODE'].includes(zone.type) ? 'contain' : 'cover'}
                                            />
                                        )}

                                        {zone.type === 'CIRCLE' && (
                                            <Circle
                                                x={zoneW / 2}
                                                y={zoneH / 2}
                                                radius={Math.min(zoneW, zoneH) / 2}
                                                {...getFillProps(s, zoneW, zoneH)}
                                                stroke={s.stroke || s.borderColor}
                                                strokeWidth={s.strokeWidth || s.borderWidth || 0}
                                                dash={s.dash}
                                            />
                                        )}

                                        {(zone.type === 'RECTANGLE' || zone.type === 'SHAPE') && (
                                            <Rect
                                                width={zoneW}
                                                height={zoneH}
                                                {...getFillProps(s, zoneW, zoneH)}
                                                stroke={s.stroke || s.borderColor}
                                                strokeWidth={s.strokeWidth || s.borderWidth || 0}
                                                dash={s.dash}
                                                cornerRadius={s.borderRadius || 0}
                                            />
                                        )}

                                        {zone.type === 'PATH' && (
                                            <Path
                                                data={s.pathData || ""}
                                                {...getFillProps(s, zoneW, zoneH)}
                                                stroke={s.stroke || s.borderColor}
                                                strokeWidth={s.strokeWidth || s.borderWidth || 0}
                                                dash={s.dash}
                                                width={100} // Normalized width
                                                height={100}
                                                scaleX={zoneW / 100}
                                                scaleY={zoneH / 100}
                                            />
                                        )}

                                        {isText && (
                                            <Group>
                                                <Rect
                                                    width={zoneW}
                                                    height={zoneH}
                                                    {...getFillProps(s, zoneW, zoneH)}
                                                    cornerRadius={s.borderRadius || 0}
                                                />
                                                <Text
                                                    text={s.uppercase ? zone.mockContent.toUpperCase() : zone.mockContent}
                                                    width={zoneW}
                                                    height={zoneH}
                                                    fontFamily={s.fontFamily}
                                                    fontSize={(s.fontSize / 100) * (size.height - bleedPx * 2)}
                                                    fontStyle={(() => {
                                                        let kFontStyle = 'normal';
                                                        if (['bold', '700', '800', '900'].includes(s.weight)) kFontStyle = 'bold';
                                                        if (s.italic) kFontStyle = kFontStyle === 'bold' ? 'italic bold' : 'italic';
                                                        return kFontStyle;
                                                    })()}
                                                    textDecoration={s.underline ? 'underline' : s.strikethrough ? 'line-through' : ''}
                                                    align={s.textAlign}
                                                    verticalAlign={s.verticalAlign || 'middle'}
                                                    lineHeight={s.lineHeight}
                                                    padding={s.padding || 2}
                                                    fill={s.color}
                                                />
                                            </Group>
                                        )}
                                    </Group>
                                );
                            })}
                        </Group>

                        {/* Pen tool live preview */}
                        {mode === 'PEN' && penPoints.length > 0 && (
                            <Line
                                points={drawCurrent ? [...penPoints, drawCurrent.x, drawCurrent.y] : penPoints}
                                stroke="#4F46E5"
                                strokeWidth={2}
                                lineCap="round"
                                lineJoin="round"
                            />
                        )}

                        {!readOnly && allowTransformer && (
                            <Transformer
                                ref={trRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    if (selectedZoneIds.length === 1) {
                                        const selectedZone = zones.find((z: IDZone) => z.id === selectedZoneIds[0]);
                                        const isFixedRatioType = ['STUDENT_PHOTO', 'SCHOOL_LOGO', 'LOGO', 'SIGNATURE', 'QR_CODE', 'IMAGE'].includes(selectedZone?.type || '');

                                        if (isFixedRatioType) {
                                            const targetRatio = selectedZone?.type === 'STUDENT_PHOTO' ? 1 : (selectedZone!.width / selectedZone!.height);
                                            let { width, height } = newBox;

                                            if (Math.abs(width - oldBox.width) > Math.abs(height - oldBox.height)) {
                                                height = width / targetRatio;
                                            } else {
                                                width = height * targetRatio;
                                            }

                                            return {
                                                ...newBox,
                                                width: Math.max(5, width),
                                                height: Math.max(5, height)
                                            };
                                        }
                                    }

                                    // No strict ratio for other types or multi-selection
                                    return newBox;
                                }}
                                keepRatio={selectedZoneIds.length === 1 ? ['STUDENT_PHOTO', 'SCHOOL_LOGO', 'SIGNATURE', 'QR_CODE', 'IMAGE', 'LOGO'].includes(zones.find((z: IDZone) => z.id === selectedZoneIds[0])?.type || '') : false}
                                anchorStroke="#4F46E5"
                                anchorFill="#4F46E5"
                                borderStroke="#4F46E5"
                                borderDash={[4, 4]}
                                rotateEnabled={selectedZoneIds.length === 1 && zones.find((z: IDZone) => z.id === selectedZoneIds[0])?.type !== 'STUDENT_PHOTO'}
                            />
                        )}

                        {/* Card Boundary Highlight (when key element) */}
                        {!readOnly && keyElementId === 'CANVAS' && (
                            <Rect
                                x={bleedPx}
                                y={bleedPx}
                                width={size.width - bleedPx * 2}
                                height={size.height - bleedPx * 2}
                                stroke="#10b981"
                                strokeWidth={3}
                                dash={[8, 4]}
                                listening={false}
                            />
                        )}

                        {/* Key Element Highlight */}
                        {!readOnly && keyElementId && (
                            <Group listening={false}>
                                {(() => {
                                    const z = zones.find((zone: IDZone) => zone.id === keyElementId);
                                    if (!z) return null;
                                    const zoneX = (z.x / 100) * (size.width - bleedPx * 2);
                                    const zoneY = (z.y / 100) * (size.height - bleedPx * 2);
                                    const zoneW = (z.width / 100) * (size.width - bleedPx * 2);
                                    const zoneH = (z.height / 100) * (size.height - bleedPx * 2);

                                    return (
                                        <Rect
                                            x={bleedPx + zoneX - 2}
                                            y={bleedPx + zoneY - 2}
                                            width={zoneW + 4}
                                            height={zoneH + 4}
                                            stroke="#10b981" // Emerald-500
                                            strokeWidth={2}
                                            cornerRadius={2}
                                            dash={[4, 2]}
                                            rotation={z.style.rotation || 0}
                                        />
                                    );
                                })()}
                            </Group>
                        )}

                        {!readOnly && mode === 'DRAW' && drawStart && drawCurrent && (
                            <Rect
                                x={Math.min(drawStart.x, drawCurrent.x)}
                                y={Math.min(drawStart.y, drawCurrent.y)}
                                width={Math.abs(drawStart.x - drawCurrent.x)}
                                height={Math.abs(drawStart.y - drawCurrent.y)}
                                stroke="#4F46E5"
                                strokeWidth={2}
                                dash={[4, 4]}
                                fill="rgba(79, 70, 229, 0.1)"
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}
