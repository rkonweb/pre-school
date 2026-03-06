"use client";

import { useState, useRef, useEffect } from "react";
import {
    MapPin,
    Navigation,
    Loader2,
    Plus,
    Trash2,
    Clock,
    ArrowLeft,
    Bus,
    User,
    Info,
    Search,
    AlertCircle,
    CheckCircle2,
    Layers,
    Activity,
    Compass,
    Settings2,
    ShieldCheck,
    ChevronDown,
    Map
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createRouteAction, updateRouteAction } from "@/app/actions/transport-actions";
import RouteMapPreview from "./RouteMapPreview";
import { SectionHeader, Btn, ErpCard, ErpInput, StatusChip } from "@/components/ui/erp-ui";

interface RouteFormProps {
    slug: string;
    vehicles: any[];
    drivers: any[];
    initialData?: any;
    routeId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    apiKey: string;
}

export function RouteForm({
    slug,
    vehicles,
    drivers,
    initialData,
    routeId,
    onSuccess,
    onCancel,
    apiKey
}: RouteFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        pickupVehicleId: initialData?.pickupVehicleId || "",
        dropVehicleId: initialData?.dropVehicleId || "",
        driverId: initialData?.driverId || "",
        stops: initialData?.stops ? initialData.stops.map((s: any) => ({
            id: s.id,
            name: s.name,
            pickupTime: s.pickupTime,
            dropTime: s.dropTime,
            monthlyFee: s.monthlyFee || 0,
            lat: s.latitude,
            lng: s.longitude
        })) : []
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Stop Management
    function addStop() {
        setFormData(prev => ({
            ...prev,
            stops: [...prev.stops, { id: `new-${Date.now()}`, name: "", pickupTime: "", dropTime: "", monthlyFee: 0, lat: 0, lng: 0 }]
        }));
    }

    function removeStop(index: number) {
        setFormData(prev => {
            const newStops = [...prev.stops];
            newStops.splice(index, 1);
            return { ...prev, stops: newStops };
        });
    }

    function updateStop(index: number, field: string, value: any) {
        setFormData(prev => {
            const newStops = [...prev.stops];
            if (field === "lat" || field === "lng") {
                if (value === "" || value === "-") {
                    newStops[index] = { ...newStops[index], [field]: value };
                } else {
                    const floatVal = parseFloat(value);
                    newStops[index] = { ...newStops[index], [field]: isNaN(floatVal) ? 0 : floatVal };
                }
            } else if (field === "monthlyFee") {
                const floatVal = parseFloat(value);
                newStops[index] = { ...newStops[index], [field]: isNaN(floatVal) ? 0 : floatVal };
            } else {
                newStops[index] = { ...newStops[index], [field]: value };
            }
            return { ...prev, stops: newStops };
        });
    }

    function getCurrentLocation(index: number) {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported");
            return;
        }
        toast.info("Accessing GPS...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateStop(index, "lat", position.coords.latitude);
                updateStop(index, "lng", position.coords.longitude);
                toast.success("Location pinpointed");
            },
            () => toast.error("Location access denied")
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Route name is required");
            return;
        }

        setSubmitting(true);
        try {
            const res = routeId
                ? await updateRouteAction(slug, routeId, formData)
                : await createRouteAction(slug, formData);

            if (res.success) {
                toast.success(routeId ? "Route configuration updated" : "New transport route established");
                if (onSuccess) onSuccess();
                else router.push(`/s/${slug}/transport/route/routes`);
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    if (!mounted) return null;

    return (
        <div className="w-full space-y-12 pb-20">
            <SectionHeader
                title={routeId ? "Edit Corridor" : "Establish Corridor"}
                subtitle={routeId ? "Update route details and sequence waypoints." : "Define a new transport corridor and operational nodes."}
                icon={Navigation}
                action={
                    <Btn
                        variant="secondary"
                        icon={ArrowLeft}
                        onClick={() => onCancel ? onCancel() : router.back()}
                        title="Return to list"
                    >
                        Back
                    </Btn>
                }
            />

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10">
                {/* Main Content: Left Column */}
                <div className="lg:col-span-8 space-y-10">
                    <ErpCard className="p-10 !rounded-[40px] border-zinc-200">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                                <Settings2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Corridor Identity</h2>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Primary identification parameters</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 block mb-3">Network Node Name</label>
                                <ErpInput
                                    required
                                    placeholder="e.g. MORNING EXPRESS - SECTOR 4"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 block mb-3">Connectivity Description</label>
                                <ErpInput
                                    placeholder="RELIABLE TRANSIT FOR STUDENTS"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </ErpCard>

                    {/* Waypoints Sequence Matrix */}
                    <div className="bg-[#fafafa] rounded-[40px] p-8 border border-zinc-100 shadow-sm relative">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#a67c66] text-white flex items-center justify-center">
                                    <Compass className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Sequence Matrix</h2>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">List of operational waypoints</p>
                                </div>
                            </div>
                            <Btn
                                type="button"
                                onClick={addStop}
                                variant="primary"
                                icon={Plus}
                            >
                                Insert Waypoint
                            </Btn>
                        </div>

                        <div className="space-y-4">
                            {formData.stops.map((stop: any, fileIndex: number) => (
                                <ErpCard key={fileIndex} className="group/stop relative p-6 !rounded-3xl border-zinc-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-[10px] font-black text-white shadow-sm">
                                                {String(fileIndex + 1).padStart(2, '0')}
                                            </div>
                                            <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Waypoint Alpha</h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeStop(fileIndex)}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            title="Remove Node"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-4 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Location Identifier</label>
                                            <ErpInput
                                                placeholder="e.g. Central Library"
                                                required
                                                value={stop.name}
                                                onChange={(e) => updateStop(fileIndex, "name", e.target.value)}
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Inbound Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                                <input
                                                    type="time"
                                                    aria-label="Inbound Time"
                                                    className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl pl-12 pr-4 text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all"
                                                    value={stop.pickupTime}
                                                    onChange={(e) => updateStop(fileIndex, "pickupTime", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Outbound Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                                <input
                                                    type="time"
                                                    aria-label="Outbound Time"
                                                    className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl pl-12 pr-4 text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all"
                                                    value={stop.dropTime}
                                                    onChange={(e) => updateStop(fileIndex, "dropTime", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Tariff (₹)</label>
                                            <input
                                                type="number"
                                                aria-label="Tariff"
                                                className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all"
                                                value={stop.monthlyFee}
                                                onChange={(e) => updateStop(fileIndex, "monthlyFee", e.target.value)}
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex flex-col justify-end pb-0.5">
                                            <button
                                                type="button"
                                                onClick={() => getCurrentLocation(fileIndex)}
                                                className="h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-200/50 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                <MapPin className="h-3.5 w-3.5 text-brand" />
                                                Sync GPS
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-zinc-50">
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.2em] px-1">Lat Matrix</label>
                                            <input
                                                type="text"
                                                aria-label="Latitude"
                                                className="w-full bg-zinc-50/50 border-0 p-3 rounded-lg text-[10px] font-mono text-zinc-500 focus:ring-0"
                                                value={stop.lat === 0 ? '' : stop.lat}
                                                onChange={(e) => updateStop(fileIndex, "lat", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.2em] px-1">Lng Matrix</label>
                                            <input
                                                type="text"
                                                aria-label="Longitude"
                                                className="w-full bg-zinc-50/50 border-0 p-3 rounded-lg text-[10px] font-mono text-zinc-500 focus:ring-0"
                                                value={stop.lng === 0 ? '' : stop.lng}
                                                onChange={(e) => updateStop(fileIndex, "lng", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </ErpCard>
                            ))}

                            {formData.stops.length === 0 && (
                                <button
                                    type="button"
                                    className="w-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-100 rounded-[32px] bg-white hover:bg-zinc-50 transition-all group"
                                    onClick={addStop}
                                >
                                    <div className="h-16 w-16 bg-zinc-50 rounded-[28px] shadow-sm flex items-center justify-center mb-6 ring-1 ring-zinc-100 group-hover:scale-110 group-hover:bg-zinc-900 transition-all">
                                        <Plus className="h-6 w-6 text-zinc-300 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Zero Waypoints Detected</span>
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-2 italic">Insert at least one node to visualize corridor</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Right Column */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="overflow-hidden rounded-[40px] border border-zinc-200 shadow-2xl shadow-zinc-200/50 h-[400px]">
                        <RouteMapPreview stops={formData.stops} apiKey={apiKey} />
                    </div>

                    <ErpCard className="p-8 !rounded-[40px] border-zinc-200">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                                <Layers className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Deployment</h2>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Asset and Pilot allocation</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Inbound Asset (Pick)</label>
                                <div className="relative">
                                    <Bus className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        aria-label="Assign Pickup Vehicle"
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all uppercase cursor-pointer"
                                        value={formData.pickupVehicleId}
                                        onChange={(e) => setFormData({ ...formData, pickupVehicleId: e.target.value })}
                                    >
                                        <option value="">Scan for asset...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.capacity} UNIT LOAD</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Outbound Asset (Drop)</label>
                                <div className="relative">
                                    <Bus className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        aria-label="Assign Drop Vehicle"
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all uppercase cursor-pointer"
                                        value={formData.dropVehicleId}
                                        onChange={(e) => setFormData({ ...formData, dropVehicleId: e.target.value })}
                                    >
                                        <option value="">Scan for asset...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.capacity} UNIT LOAD</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                                    Assigned Pilot {drivers.length > 0 ? `(${drivers.length} ACTIVE)` : '(NONE)'}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        aria-label="Assign Pilot"
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all uppercase cursor-pointer"
                                        value={formData.driverId}
                                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                    >
                                        <option value="">Identify pilot...</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-zinc-100 space-y-8">
                            <div className="p-8 rounded-[32px] bg-zinc-50/50 border border-zinc-100 shadow-inner">
                                <label className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-4 block">Deployment Integrity</label>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        formData.name && formData.stops.length > 0 && formData.pickupVehicleId && formData.driverId
                                            ? "bg-brand shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                                            : "bg-amber-400 animate-pulse"
                                    )} />
                                    <span className="text-[10px] font-black text-zinc-900 uppercase italic tracking-tight">
                                        {!formData.name ? "Awaiting Network Node" :
                                            formData.stops.length === 0 ? "Sequence Incomplete" :
                                                !formData.pickupVehicleId ? "Asset Missing" :
                                                    !formData.driverId ? "Pilot Missing" :
                                                        "System Integrity: Verified"}
                                    </span>
                                </div>
                            </div>

                            <Btn
                                type="submit"
                                disabled={submitting}
                                variant="primary"
                                className="w-full h-16 !rounded-[24px] !text-[10px] !tracking-[3px]"
                                icon={submitting ? Loader2 : ShieldCheck}
                                loading={submitting}
                            >
                                {submitting ? "Saving Matrix..." : "Commit Corridor"}
                            </Btn>

                            <button
                                type="button"
                                onClick={() => onCancel ? onCancel() : router.back()}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-[4px] text-zinc-300 hover:text-red-500 transition-all font-mono"
                            >
                                [ Terminate Session ]
                            </button>
                        </div>
                    </ErpCard>
                </div>
            </form>
        </div>
    );
}
