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
    Map,
    GripVertical,
    IndianRupee,
    Route,
    CircleDot,
    Phone,
    Shield
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
        toast.info("Getting your current location...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateStop(index, "lat", position.coords.latitude);
                updateStop(index, "lng", position.coords.longitude);
                toast.success("Location captured successfully!");
            },
            () => toast.error("Location access denied. Please enable location in your browser settings.")
        );
    }

    // Validation checks
    const hasName = !!formData.name.trim();
    const hasStops = formData.stops.length > 0;
    const hasPickupBus = !!formData.pickupVehicleId;
    const hasDropBus = !!formData.dropVehicleId;
    const hasDriver = !!formData.driverId;
    const allStopsNamed = formData.stops.every((s: any) => s.name.trim());
    const isReady = hasName && hasStops && allStopsNamed && hasPickupBus && hasDriver;

    const completionSteps = [
        { done: hasName, label: "Route name" },
        { done: hasStops && allStopsNamed, label: "At least one stop added" },
        { done: hasPickupBus, label: "Pickup bus assigned" },
        { done: hasDropBus, label: "Drop bus assigned" },
        { done: hasDriver, label: "Driver assigned" },
    ];
    const completedCount = completionSteps.filter(s => s.done).length;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Please enter a route name");
            return;
        }
        if (formData.stops.length === 0) {
            toast.error("Please add at least one stop to the route");
            return;
        }
        if (!allStopsNamed) {
            toast.error("Please give a name to every stop");
            return;
        }

        setSubmitting(true);
        try {
            const res = routeId
                ? await updateRouteAction(slug, routeId, formData)
                : await createRouteAction(slug, formData);

            if (res.success) {
                toast.success(routeId ? "Route updated successfully!" : "New route created successfully!");
                if (onSuccess) onSuccess();
                else router.push(`/s/${slug}/transport/route/routes`);
            } else {
                toast.error(res.error || "Something went wrong");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    if (!mounted) return null;

    return (
        <div className="w-full space-y-10 pb-20">
            <SectionHeader
                title={routeId ? "Edit Route" : "Create New Route"}
                subtitle={routeId
                    ? "Update route details, stops, and bus assignments."
                    : "Set up a new bus route with stops, timings, and assign a bus and driver."}
                icon={Route}
                action={
                    <Btn
                        variant="secondary"
                        icon={ArrowLeft}
                        onClick={() => onCancel ? onCancel() : router.back()}
                        title="Go back"
                    >
                        Back
                    </Btn>
                }
            />

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10">
                {/* Main Content: Left Column */}
                <div className="lg:col-span-8 space-y-10">

                    {/* ── SECTION 1: Route Details ──────────────────── */}
                    <ErpCard className="p-10 !rounded-[40px] border-zinc-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                                <Route className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Route Details</h2>
                                <p className="text-xs font-semibold text-zinc-400 mt-0.5">Give this route a name and optional description</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1 block">
                                    Route Name <span className="text-red-400">*</span>
                                </label>
                                <ErpInput
                                    required
                                    placeholder="e.g. Route A - South Bangalore"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <p className="text-[10px] text-zinc-400 px-1">Choose an easy-to-remember name like "Route 1 - Jayanagar" or "Morning Express - North Zone"</p>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1 block">Description (Optional)</label>
                                <ErpInput
                                    placeholder="e.g. Covers Jayanagar, BTM Layout, and HSR Layout areas"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <p className="text-[10px] text-zinc-400 px-1">Briefly describe which areas or neighborhoods this route covers</p>
                            </div>
                        </div>
                    </ErpCard>

                    {/* ── SECTION 2: Bus Stops ──────────────────── */}
                    <div className="bg-[#fafafa] rounded-[40px] p-8 border border-zinc-100 shadow-sm relative">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 tracking-tight">Bus Stops</h2>
                                    <p className="text-xs font-semibold text-zinc-400 mt-0.5">
                                        Add each pickup/drop point along this route in order
                                        {formData.stops.length > 0 && <span className="text-emerald-600 ml-1">· {formData.stops.length} stop{formData.stops.length !== 1 ? 's' : ''} added</span>}
                                    </p>
                                </div>
                            </div>
                            <Btn
                                type="button"
                                onClick={addStop}
                                variant="primary"
                                icon={Plus}
                            >
                                Add Stop
                            </Btn>
                        </div>

                        {/* Info banner */}
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                Add stops in the order the bus will visit them. For each stop, set the morning <strong>Pickup Time</strong> and afternoon <strong>Drop Time</strong>. You can also set a <strong>Monthly Fee</strong> per stop and capture the <strong>GPS Location</strong> for map tracking.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {formData.stops.map((stop: any, stopIndex: number) => (
                                <ErpCard key={stopIndex} className="group/stop relative p-6 !rounded-3xl border-zinc-200 hover:border-zinc-300 transition-all">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-[11px] font-black text-white shadow-sm">
                                                {stopIndex + 1}
                                            </div>
                                            <h4 className="text-sm font-bold text-zinc-800">
                                                Stop {stopIndex + 1}
                                                {stop.name && <span className="text-zinc-400 font-normal ml-1">— {stop.name}</span>}
                                            </h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeStop(stopIndex)}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            title="Remove this stop"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                        {/* Stop Name */}
                                        <div className="md:col-span-4 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">
                                                Stop Name <span className="text-red-400">*</span>
                                            </label>
                                            <ErpInput
                                                placeholder="e.g. Jayanagar 4th Block"
                                                required
                                                value={stop.name}
                                                onChange={(e) => updateStop(stopIndex, "name", e.target.value)}
                                            />
                                        </div>

                                        {/* Pickup Time */}
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Pickup Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                                <input
                                                    type="time"
                                                    aria-label="Pickup Time"
                                                    className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl pl-12 pr-4 text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all"
                                                    value={stop.pickupTime}
                                                    onChange={(e) => updateStop(stopIndex, "pickupTime", e.target.value)}
                                                />
                                            </div>
                                            <p className="text-[9px] text-zinc-400 px-1">Morning pickup</p>
                                        </div>

                                        {/* Drop Time */}
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Drop Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                                <input
                                                    type="time"
                                                    aria-label="Drop Time"
                                                    className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl pl-12 pr-4 text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all"
                                                    value={stop.dropTime}
                                                    onChange={(e) => updateStop(stopIndex, "dropTime", e.target.value)}
                                                />
                                            </div>
                                            <p className="text-[9px] text-zinc-400 px-1">Afternoon drop</p>
                                        </div>

                                        {/* Monthly Fee */}
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Monthly Fee (₹)</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                                <input
                                                    type="number"
                                                    aria-label="Monthly Fee"
                                                    className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl pl-12 pr-4 text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all"
                                                    value={stop.monthlyFee}
                                                    onChange={(e) => updateStop(stopIndex, "monthlyFee", e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <p className="text-[9px] text-zinc-400 px-1">Per student/month</p>
                                        </div>

                                        {/* GPS Button */}
                                        <div className="md:col-span-2 flex flex-col justify-end pb-0.5">
                                            <button
                                                type="button"
                                                onClick={() => getCurrentLocation(stopIndex)}
                                                className="h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider shadow-xl shadow-zinc-200/50 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                                                Get Location
                                            </button>
                                            <p className="text-[9px] text-zinc-400 px-1 mt-1 text-center">Use GPS</p>
                                        </div>
                                    </div>

                                    {/* Coordinates Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-zinc-100">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Latitude</label>
                                            <input
                                                type="text"
                                                aria-label="Latitude"
                                                className="w-full bg-zinc-50/50 border border-zinc-100 p-3 rounded-lg text-[11px] font-mono text-zinc-500 focus:ring-2 focus:ring-brand outline-none"
                                                value={stop.lat === 0 ? '' : stop.lat}
                                                onChange={(e) => updateStop(stopIndex, "lat", e.target.value)}
                                                placeholder="e.g. 12.9250"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Longitude</label>
                                            <input
                                                type="text"
                                                aria-label="Longitude"
                                                className="w-full bg-zinc-50/50 border border-zinc-100 p-3 rounded-lg text-[11px] font-mono text-zinc-500 focus:ring-2 focus:ring-brand outline-none"
                                                value={stop.lng === 0 ? '' : stop.lng}
                                                onChange={(e) => updateStop(stopIndex, "lng", e.target.value)}
                                                placeholder="e.g. 77.5938"
                                            />
                                        </div>
                                    </div>
                                </ErpCard>
                            ))}

                            {formData.stops.length === 0 && (
                                <button
                                    type="button"
                                    className="w-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-zinc-200 rounded-[32px] bg-white hover:bg-zinc-50 transition-all group"
                                    onClick={addStop}
                                >
                                    <div className="h-16 w-16 bg-zinc-50 rounded-[28px] shadow-sm flex items-center justify-center mb-5 ring-1 ring-zinc-100 group-hover:scale-110 group-hover:bg-emerald-600 transition-all">
                                        <Plus className="h-6 w-6 text-zinc-300 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-sm font-bold text-zinc-700">No stops added yet</span>
                                    <span className="text-xs text-zinc-400 mt-1">Click to add the first bus stop for this route</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Right Column */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Map Preview */}
                    <div className="overflow-hidden rounded-[40px] border border-zinc-200 shadow-2xl shadow-zinc-200/50 h-[400px]">
                        <RouteMapPreview stops={formData.stops} apiKey={apiKey} />
                    </div>

                    {/* Assign Bus & Driver */}
                    <ErpCard className="p-8 !rounded-[40px] border-zinc-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg">
                                <Bus className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Assign Bus & Driver</h2>
                                <p className="text-xs font-semibold text-zinc-400 mt-0.5">Select which bus and driver will run this route</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Pickup Bus */}
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                                    Pickup Bus <span className="text-red-400">*</span>
                                </label>
                                <p className="text-[10px] text-zinc-400 px-1 -mt-1">Bus used for morning pickups</p>
                                <div className="relative">
                                    <Bus className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        aria-label="Select Pickup Bus"
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all cursor-pointer"
                                        value={formData.pickupVehicleId}
                                        onChange={(e) => setFormData({ ...formData, pickupVehicleId: e.target.value })}
                                    >
                                        <option value="">Select a bus...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.capacity} seats</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Drop Bus */}
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Drop Bus</label>
                                <p className="text-[10px] text-zinc-400 px-1 -mt-1">Bus used for afternoon drops (can be same as pickup)</p>
                                <div className="relative">
                                    <Bus className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        aria-label="Select Drop Bus"
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all cursor-pointer"
                                        value={formData.dropVehicleId}
                                        onChange={(e) => setFormData({ ...formData, dropVehicleId: e.target.value })}
                                    >
                                        <option value="">Select a bus...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.capacity} seats</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Driver */}
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                                    Driver <span className="text-red-400">*</span>
                                    {drivers.length > 0 ? <span className="text-emerald-500 ml-1">({drivers.length} available)</span> : <span className="text-orange-500 ml-1">(No drivers added yet)</span>}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        aria-label="Select Driver"
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all cursor-pointer"
                                        value={formData.driverId}
                                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                    >
                                        <option value="">Select a driver...</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}{d.phone ? ` — ${d.phone}` : ''}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Readiness Checklist */}
                        <div className="mt-10 pt-8 border-t border-zinc-100 space-y-6">
                            <div className="p-6 rounded-[24px] bg-zinc-50 border border-zinc-100">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ready to Save?</label>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-1 rounded-lg",
                                        isReady ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                        {completedCount}/{completionSteps.length} done
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {completionSteps.map((step, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0",
                                                step.done ? "bg-emerald-500" : "bg-zinc-200"
                                            )}>
                                                {step.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                            <span className={cn(
                                                "text-xs font-semibold",
                                                step.done ? "text-zinc-700 line-through" : "text-zinc-500"
                                            )}>
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Btn
                                type="submit"
                                disabled={submitting || !isReady}
                                variant="primary"
                                className={cn(
                                    "w-full h-16 !rounded-[24px] !text-sm !tracking-wide",
                                    !isReady && "opacity-50 cursor-not-allowed"
                                )}
                                icon={submitting ? Loader2 : CheckCircle2}
                                loading={submitting}
                            >
                                {submitting ? "Saving..." : routeId ? "Save Changes" : "Create Route"}
                            </Btn>

                            <button
                                type="button"
                                onClick={() => onCancel ? onCancel() : router.back()}
                                className="w-full py-4 text-xs font-bold text-zinc-400 hover:text-red-500 transition-all text-center"
                            >
                                Cancel
                            </button>
                        </div>
                    </ErpCard>

                    {/* Quick Tips */}
                    <ErpCard className="p-6 !rounded-[32px] border-zinc-200 bg-blue-50/50">
                        <div className="flex items-center gap-3 mb-4">
                            <Info className="h-5 w-5 text-blue-500" />
                            <h3 className="text-sm font-bold text-zinc-800">Quick Tips</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <CircleDot className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                                <p className="text-[11px] text-zinc-600 leading-relaxed">Add stops in the <strong>order the bus travels</strong> — first stop at the top, last at the bottom.</p>
                            </li>
                            <li className="flex items-start gap-2">
                                <CircleDot className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                                <p className="text-[11px] text-zinc-600 leading-relaxed">Use <strong>"Get Location"</strong> button at each stop to capture GPS coordinates for parent app tracking.</p>
                            </li>
                            <li className="flex items-start gap-2">
                                <CircleDot className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                                <p className="text-[11px] text-zinc-600 leading-relaxed">The <strong>monthly fee</strong> is the transport charge per student at that stop.</p>
                            </li>
                            <li className="flex items-start gap-2">
                                <CircleDot className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                                <p className="text-[11px] text-zinc-600 leading-relaxed">You can use the <strong>same bus</strong> for both pickup and drop if needed.</p>
                            </li>
                        </ul>
                    </ErpCard>
                </div>
            </form>
        </div>
    );
}
