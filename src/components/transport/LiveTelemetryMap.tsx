"use client";

import { useEffect, useState, useRef } from "react";
import { Bus, Wifi, Activity, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface Vehicle {
    id: string;
    registrationNumber: string;
    status: string;
    model?: string;
}

interface Route {
    id: string;
    name: string;
    vehicle?: Vehicle | null;
    driver?: { name: string } | null;
}

interface LiveTelemetryMapProps {
    routes: Route[];
    stats: {
        vehicles: number;
        studentsOnTransport: number;
        routes: number;
    };
}

interface MarkerState {
    id: string;
    x: number; // percentage
    y: number; // percentage
    targetX: number;
    targetY: number;
    rotation: number;
    unitId: string;
    isMoving: boolean;
    status: "On-Time" | "Delayed";
    delayMins?: number;
}

export function LiveTelemetryMap({ routes, stats }: LiveTelemetryMapProps) {
    const [markers, setMarkers] = useState<MarkerState[]>([]);
    const [stability, setStability] = useState(99.8);

    // Initialize markers based on routes or mock if no routes
    useEffect(() => {
        const initialMarkers: MarkerState[] = [];
        const activeRoutes = routes.filter(r => r.vehicle);

        // If no active routes, create a few mock ones for visual fluff but label them better
        const displayCount = Math.max(activeRoutes.length, 3);

        for (let i = 0; i < displayCount; i++) {
            const route = activeRoutes[i];
            const x = Math.random() * 80 + 10;
            const y = Math.random() * 60 + 20;

            initialMarkers.push({
                id: route?.id || `mock-${i}`,
                unitId: route?.vehicle?.registrationNumber || `UNIT-0${i + 1}`,
                x,
                y,
                targetX: x + (Math.random() - 0.5) * 5,
                targetY: y + (Math.random() - 0.5) * 5,
                rotation: Math.random() * 360,
                isMoving: Math.random() > 0.3,
                status: Math.random() > 0.8 ? "Delayed" : "On-Time",
                delayMins: Math.floor(Math.random() * 15) + 3
            });
        }
        setMarkers(initialMarkers);
    }, [routes]);

    // Animation loop
    useEffect(() => {
        const interval = setInterval(() => {
            setMarkers(prev => prev.map(m => {
                if (!m.isMoving) {
                    // Start moving with some probability
                    if (Math.random() > 0.98) return { ...m, isMoving: true };
                    return m;
                }

                const dx = m.targetX - m.x;
                const dy = m.targetY - m.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 0.5) {
                    // New target
                    const nextX = Math.max(10, Math.min(90, m.x + (Math.random() - 0.5) * 15));
                    const nextY = Math.max(20, Math.min(80, m.y + (Math.random() - 0.5) * 15));
                    return {
                        ...m,
                        targetX: nextX,
                        targetY: nextY,
                        isMoving: Math.random() > 0.05 // sometimes stop
                    };
                }

                // Move towards target
                const step = 0.15;
                const newX = m.x + (dx / distance) * step;
                const newY = m.y + (dy / distance) * step;

                // Calculate rotation (smoothing a bit)
                const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                const rotationDiff = angle - m.rotation;
                const normalizedRotation = m.rotation + rotationDiff * 0.1;

                return {
                    ...m,
                    x: newX,
                    y: newY,
                    rotation: normalizedRotation
                };
            }));

            // Jitter stability for "realtime" effect
            setStability(s => Math.min(100, Math.max(98.5, s + (Math.random() - 0.5) * 0.1)));
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="lg:col-span-8 bg-white rounded-[40px] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/40 dark:bg-zinc-950 dark:border-zinc-800">
            <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-[20px] bg-brand/10 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Live Tracking</h3>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Track vehicle locations in real-time</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full dark:bg-emerald-500/10 dark:border-emerald-500/20">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest dark:text-emerald-400">System Connected</span>
                </div>
            </div>

            <div className="relative h-[520px] w-full overflow-hidden rounded-[32px] bg-zinc-950 border border-white/5 shadow-inner">
                {/* Abstract Grid Map */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                {/* Animated Markers */}
                {markers.map(m => (
                    <div
                        key={m.id}
                        className="absolute transition-all duration-75 group/marker"
                        style={{
                            left: `${m.x}%`,
                            top: `${m.y}%`,
                            transform: `translate(-50%, -50%) rotate(${m.rotation}deg)`
                        }}
                    >
                        <div className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.3)] ring-2 ring-white/10 group-hover/marker:scale-125 transition-transform",
                            m.isMoving ? "bg-brand ring-brand/40" : "bg-white shadow-zinc-400/20"
                        )}>
                            <Bus className={cn("h-5 w-5", m.isMoving ? "text-white" : "text-zinc-900")}
                                style={{ transform: `rotate(-${m.rotation}deg)` }} // keep icon upright
                            />

                            {/* Tooltip - Always reverse rotation to keep text readable */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white border border-zinc-200 px-3 py-2 shadow-2xl opacity-0 scale-90 group-hover/marker:opacity-100 group-hover/marker:scale-100 transition-all z-50 pointer-events-none"
                                style={{ transform: `translateX(-50%) rotate(-${m.rotation}deg)` }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-2 w-2 rounded-full", m.isMoving ? "bg-emerald-500 animate-pulse" : "bg-zinc-300")} />
                                    <p className="text-[9px] font-black text-zinc-900 uppercase tracking-widest">
                                        {m.unitId} • {m.isMoving ? "Moving" : "Stopped"}
                                    </p>
                                </div>
                                <div className="mt-1.5 flex items-center justify-between gap-4">
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                                        m.status === "On-Time" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                        {m.status === "On-Time" ? "On-Time" : `Delayed ${m.delayMins}m`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Map Overlay Panel */}
                <div className="absolute bottom-6 left-6 rounded-[28px] bg-zinc-900/90 backdrop-blur-xl p-6 border border-white/10 shadow-2xl w-64 ring-1 ring-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Wifi className="h-4 w-4 text-brand" />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-[2px]">Live Status</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/50 tracking-widest uppercase italic font-mono">Vehicles</span>
                            <span className="text-[10px] font-black text-emerald-400">{String(stats.vehicles).padStart(2, '0')} Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/50 tracking-widest uppercase italic font-mono">Students</span>
                            <span className="text-[10px] font-black text-brand">{String(stats.studentsOnTransport).padStart(2, '0')} students</span>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/30 tracking-widest uppercase italic text-xs">Connection</span>
                            <span className="text-[10px] font-black text-white">{stability.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
