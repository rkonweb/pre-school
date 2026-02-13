"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────

interface ZoneStyle {
    fontFamily: string;
    fontSize: number;
    fillType: 'solid' | 'gradient';
    color: string;
    gradient?: { start: string; end: string; direction: number };
    shadowColor?: string;
    textAlign: 'left' | 'center' | 'right';
    weight: 'normal' | 'bold' | '300' | '700' | '800' | '900'; // Added 700
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

export interface Zone {
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

export interface KonvaCanvasProps {
    imageUrl: string;
    zones: Zone[];
    selectedZoneId?: string | null;
    mode?: 'SELECT' | 'DRAW';
    stageRef?: React.MutableRefObject<any>;
    onSelectZone?: (id: string | null) => void;
    onZoneTransform?: (id: string, update: { x: number; y: number; width: number; height: number; rotation?: number }) => void;
    onZoneDrawn?: (zone: { x: number; y: number; width: number; height: number }) => void;
    readOnly?: boolean;
    allowDrag?: boolean;
    allowTransformer?: boolean;
    zoom?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────

// Convert hex to specific opacity hex
const hexToRgba = (hex: string, alpha: number) => {
    // If transparent or invalid
    if (!hex || hex === 'transparent') return 'rgba(0,0,0,0)';

    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + (alpha / 100) + ')';
    }
    return hex;
};

const URLImage = ({ src, width, height, cornerRadius, opacity }: any) => {
    const [image] = useImage(src, 'anonymous');
    return (
        <KonvaImage
            image={image}
            width={width}
            height={height}
            cornerRadius={cornerRadius}
            opacity={opacity}
        />
    );
};

// ─── Component ───────────────────────────────────────────────────

export default function KonvaCanvas({
    imageUrl,
    zones,
    selectedZoneId = null,
    mode = 'SELECT',
    stageRef,
    onSelectZone = () => { },
    onZoneTransform = () => { },
    onZoneDrawn = () => { },
    readOnly = false,
    allowDrag = true,
    allowTransformer = true,
    zoom = 1
}: KonvaCanvasProps) {
    const stageContainerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [image] = useImage(imageUrl, 'anonymous'); // Check CORS

    // Resize observer for the container to make canvas responsive
    useEffect(() => {
        const checkSize = () => {
            if (stageContainerRef.current) {
                const { offsetWidth } = stageContainerRef.current;
                // Maintain aspect ratio based on image if loaded, else default 4:5
                const aspect = image ? image.width / image.height : 4 / 5;
                setSize({
                    width: offsetWidth,
                    height: offsetWidth / aspect
                });
            }
        };

        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, [image]);

    // Update size when image loads
    useEffect(() => {
        if (image && stageContainerRef.current) {
            const { offsetWidth } = stageContainerRef.current;
            const aspect = image.width / image.height;
            setSize({
                width: offsetWidth,
                height: offsetWidth / aspect
            });
        }
    }, [image]);

    // Sorting zones by zIndex
    const sortedZones = useMemo(() => {
        return [...zones].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    }, [zones]);


    // ─── Interaction Handlers ────────────────────────────────────

    const trRef = useRef<Konva.Transformer>(null);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
    const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

    // Update transformer when selection changes
    useEffect(() => {
        if (readOnly || !allowTransformer || !trRef.current || !stageRef?.current) return;

        const node = selectedZoneId ? stageRef.current.findOne('#' + selectedZoneId) : null;
        if (node) {
            trRef.current.nodes([node]);
            trRef.current.getLayer()?.batchDraw();
        } else {
            trRef.current.nodes([]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [selectedZoneId, zones, readOnly, allowTransformer, stageRef]);

    const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (readOnly) return;

        if (mode === 'DRAW') {
            const stage = e.target.getStage();
            if (stage) {
                // Get relative pointer position considering zoom/pan
                const transform = stage.getAbsoluteTransform().copy().invert();
                const pos = transform.point(stage.getPointerPosition()!);
                setDrawStart(pos);
                setDrawCurrent(pos);
            }
            // Deselect while drawing
            onSelectZone(null);
            return;
        }

        // Check if clicked on empty stage (deselect)
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            onSelectZone(null);
        }
    };

    const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (readOnly) return;

        if (mode === 'DRAW' && drawStart) {
            const stage = e.target.getStage();
            if (stage) {
                const transform = stage.getAbsoluteTransform().copy().invert();
                const pos = transform.point(stage.getPointerPosition()!);
                setDrawCurrent(pos);
            }
        }
    };

    const handleStageMouseUp = () => {
        if (readOnly) return;

        if (mode === 'DRAW' && drawStart && drawCurrent) {
            // Calculate normalized rect
            const x = Math.min(drawStart.x, drawCurrent.x);
            const y = Math.min(drawStart.y, drawCurrent.y);
            const width = Math.abs(drawStart.x - drawCurrent.x);
            const height = Math.abs(drawStart.y - drawCurrent.y);

            // Minimum size threshold to avoid accidental clicks
            if (width > 10 && height > 10) {
                // Convert to percentages
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

    // ─── Zone Rendering ──────────────────────────────────────────

    return (
        <div ref={stageContainerRef} className="w-full relative">
            <div className="relative mx-auto" style={{
                width: size.width ? size.width * zoom : '100%',
                height: size.height ? size.height * zoom : 'auto'
            }}>
                <div className="relative overflow-hidden bg-white shadow-xl rounded-2xl border border-zinc-200">
                    <Stage
                        width={size.width * zoom}
                        height={size.height * zoom}
                        ref={stageRef}
                        onMouseDown={handleStageMouseDown}
                        onMouseMove={handleStageMouseMove}
                        onMouseUp={handleStageMouseUp}
                        scaleX={zoom}
                        scaleY={zoom}
                        draggable={zoom > 1}
                        className={cn(
                            readOnly ? '' : (mode === 'DRAW' ? 'cursor-crosshair' : 'cursor-default'),
                            zoom > 1 && mode === 'SELECT' ? 'cursor-grab active:cursor-grabbing' : ''
                        )}
                    >
                        <Layer>
                            {/* Zones (including BASE_IMAGE) */}
                            {sortedZones.map((zone) => {
                                const s = zone.style;

                                // Font Style
                                let kFontStyle = 'normal';
                                // Handle numeric weights that might come from DB as string '700'
                                const w = s.weight;
                                if (w === 'bold' || w === '700' || w === '800' || w === '900') {
                                    kFontStyle = 'bold';
                                }
                                if (s.italic) {
                                    kFontStyle = kFontStyle === 'bold' ? 'italic bold' : 'italic';
                                }

                                // Gradient fill
                                let fillProps: any = { fill: s.color };
                                if (s.fillType === 'gradient' && s.gradient) {
                                    const w_px = (zone.width / 100) * size.width;
                                    const h_px = (zone.height / 100) * size.height;
                                    fillProps = {
                                        fillPriority: 'linear-gradient',
                                        fillLinearGradientStartPoint: {
                                            x: (w_px / 2) - Math.cos((s.gradient.direction || 0) * Math.PI / 180) * (w_px / 2),
                                            y: (h_px / 2) - Math.sin((s.gradient.direction || 0) * Math.PI / 180) * (h_px / 2)
                                        },
                                        fillLinearGradientEndPoint: {
                                            x: (w_px / 2) + Math.cos((s.gradient.direction || 0) * Math.PI / 180) * (w_px / 2),
                                            y: (h_px / 2) + Math.sin((s.gradient.direction || 0) * Math.PI / 180) * (h_px / 2)
                                        },
                                        fillLinearGradientColorStops: [0, s.gradient.start, 1, s.gradient.end]
                                    };
                                } else {
                                    fillProps = { fill: s.color };
                                }

                                // Shadow
                                const shadowProps = s.shadow !== 'none' ? {
                                    shadowColor: s.shadowColor || 'black',
                                    shadowBlur: s.shadow === 'sm' ? 2 : s.shadow === 'md' ? 5 : s.shadow === 'lg' ? 10 : 0,
                                    shadowOffset: {
                                        x: s.shadow === 'sm' ? 1 : s.shadow === 'md' ? 2 : s.shadow === 'lg' ? 4 : 0,
                                        y: s.shadow === 'sm' ? 1 : s.shadow === 'md' ? 2 : s.shadow === 'lg' ? 4 : 0,
                                    },
                                    shadowOpacity: 0.5
                                } : { shadowOpacity: 0 };

                                const zoneX = (zone.x / 100) * size.width;
                                const zoneY = (zone.y / 100) * size.height;
                                const zoneW = (zone.width / 100) * size.width;
                                const zoneH = (zone.height / 100) * size.height;

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
                                        onClick={() => !readOnly && onSelectZone(zone.id)}
                                        onTap={() => !readOnly && onSelectZone(zone.id)}
                                        onDragStart={() => !readOnly && !isLocked && allowDrag && onSelectZone(zone.id)}
                                        onDragEnd={(e) => {
                                            if (readOnly || !allowDrag || isLocked) return;
                                            const node = e.target;
                                            const scaleX = node.scaleX();
                                            const scaleY = node.scaleY();
                                            node.scaleX(1);
                                            node.scaleY(1);

                                            onZoneTransform(zone.id, {
                                                x: (node.x() / size.width) * 100,
                                                y: (node.y() / size.height) * 100,
                                                width: (node.width() * scaleX / size.width) * 100,
                                                height: (node.height() * scaleY / size.height) * 100
                                            });
                                        }}
                                        onTransformEnd={(e) => {
                                            if (readOnly || !allowTransformer || isLocked) return;
                                            const node = e.target;
                                            const scaleX = node.scaleX();
                                            const scaleY = node.scaleY();
                                            node.scaleX(1);
                                            node.scaleY(1);

                                            onZoneTransform(zone.id, {
                                                x: (node.x() / size.width) * 100,
                                                y: (node.y() / size.height) * 100,
                                                width: (node.width() * scaleX / size.width) * 100,
                                                height: (node.height() * scaleY / size.height) * 100,
                                                rotation: node.rotation()
                                            });
                                        }}
                                        rotation={s.rotation || 0}
                                        opacity={(s.opacity ?? 100) / 100}
                                        listening={!isLocked} // Disable interactions if locked
                                    >
                                        {zone.type === 'IMAGE' || zone.type === 'BASE_IMAGE' ? (
                                            <URLImage
                                                src={zone.mockContent}
                                                width={zoneW}
                                                height={zoneH}
                                                cornerRadius={s.borderRadius || 0}
                                                opacity={(s.opacity ?? 100) / 100}
                                            />
                                        ) : (
                                            <>
                                                {/* Background Rect */}
                                                <Rect
                                                    width={zoneW}
                                                    height={zoneH}
                                                    fill={s.bgColor && s.bgColor !== 'transparent' ? hexToRgba(s.bgColor, s.bgOpacity || 100) : undefined}
                                                    stroke={s.borderColor || 'black'}
                                                    strokeWidth={s.borderWidth || 0}
                                                    cornerRadius={s.borderRadius || 0}
                                                    name="bg"
                                                />

                                                {/* Text Content */}
                                                <Text
                                                    name="text"
                                                    className="text"
                                                    text={s.uppercase ? zone.mockContent.toUpperCase() : zone.mockContent}
                                                    width={zoneW}
                                                    // No fixed height for text, let it flow so we can measure it
                                                    fontFamily={s.fontFamily}
                                                    fontSize={(s.fontSize / 100) * (size.height || 500)} // Absolute to stage height
                                                    fontStyle={kFontStyle}
                                                    textDecoration={s.underline ? 'underline' : s.strikethrough ? 'line-through' : ''}
                                                    align={s.textAlign}
                                                    verticalAlign={s.verticalAlign}
                                                    lineHeight={s.lineHeight}
                                                    padding={s.padding || 2}
                                                    {...fillProps}
                                                    {...shadowProps}
                                                    ref={(node) => {
                                                        if (node && !readOnly) {
                                                            // Sync back to parent if height doesn't match
                                                            // use timeout to avoid "cannot update during render"
                                                            setTimeout(() => {
                                                                const actualH = (node.height() / size.height) * 100;
                                                                if (Math.abs(actualH - zone.height) > 0.1) {
                                                                    onZoneTransform(zone.id, {
                                                                        x: zone.x,
                                                                        y: zone.y,
                                                                        width: zone.width,
                                                                        height: actualH,
                                                                        rotation: s.rotation
                                                                    });
                                                                }
                                                            }, 0);
                                                        }
                                                    }}
                                                />
                                            </>
                                        )}
                                    </Group>
                                );
                            })}

                            {/* Transformer - Only in Edit Mode */}
                            {!readOnly && allowTransformer && (
                                <Transformer
                                    ref={trRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        // Enforce minimum size
                                        if (newBox.width < 5 || newBox.height < 5) return oldBox;
                                        return newBox;
                                    }}
                                    // Enforce proportional scaling for images, logos, and QR codes
                                    keepRatio={selectedZoneId ? ['IMAGE', 'LOGO', 'QR_CODE', 'BASE_IMAGE'].includes(zones.find(z => z.id === selectedZoneId)?.type || '') : false}
                                    enabledAnchors={
                                        (() => {
                                            const z = selectedZoneId ? zones.find(z => z.id === selectedZoneId) : null;
                                            if (!z) return [];
                                            if (['IMAGE', 'LOGO', 'QR_CODE', 'BASE_IMAGE'].includes(z.type)) {
                                                return ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
                                            }
                                            // For text zones, only allow horizontal resizing (wrapping width)
                                            return ['middle-left', 'middle-right'];
                                        })()
                                    }
                                />
                            )}


                            {/* Drawing Feedback */}
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
        </div>
    );
}
