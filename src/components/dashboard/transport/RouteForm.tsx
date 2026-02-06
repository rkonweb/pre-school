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
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createRouteAction, updateRouteAction } from "@/app/actions/transport-actions";

interface RouteFormProps {
    slug: string;
    vehicles: any[];
    drivers: any[];
    initialData?: any;
    routeId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function RouteForm({
    slug,
    vehicles,
    drivers,
    initialData,
    routeId,
    onSuccess,
    onCancel
}: RouteFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        vehicleId: initialData?.vehicleId || "",
        driverId: initialData?.driverId || "",
        stops: initialData?.stops ? initialData.stops.map((s: any) => ({
            name: s.name,
            pickupTime: s.pickupTime,
            dropTime: s.dropTime,
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
            stops: [...prev.stops, { name: "", pickupTime: "", dropTime: "", lat: 0, lng: 0 }]
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
                const floatVal = parseFloat(value);
                value = isNaN(floatVal) ? 0 : floatVal;
            }
            newStops[index] = { ...newStops[index], [field]: value };
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
                ? await updateRouteAction(routeId, formData, slug)
                : await createRouteAction(formData, slug);

            if (res.success) {
                toast.success(routeId ? "Route configuration updated" : "New transport route established");
                if (onSuccess) onSuccess();
                else router.push(`/s/${slug}/transport/routes`);
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
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Standardized Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onCancel ? onCancel() : router.back()}
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:border-zinc-900 active:scale-95 shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase">
                            {routeId ? "Edit Route" : "New Route"}
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-0.5">
                            {routeId ? "Update route details and stops." : "Define a new transport route and stops."}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10">
                {/* Main Content: Left Column */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Route Parameters Card */}
                    <div className="bg-white rounded-[40px] p-10 border border-zinc-200 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                                <Settings2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Route Info</h2>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Name and description</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <InputField
                                    required
                                    label="Route Name"
                                    placeholder="e.g. MORNING EXPRESS - SECTOR 4"
                                    value={formData.name}
                                    onChange={(v: string) => setFormData({ ...formData, name: v })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <InputField
                                    label="Description"
                                    placeholder="RELIABLE TRANSIT FOR STUDENTS"
                                    value={formData.description}
                                    onChange={(v: string) => setFormData({ ...formData, description: v })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Waypoints Sequence Matrix */}
                    <div className="bg-white rounded-[40px] p-10 border border-zinc-200 shadow-xl shadow-zinc-200/40">
                        <div className="flex items-start justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg">
                                    <Compass className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Stops</h2>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">List of pickup and drop points</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addStop}
                                className="h-12 px-6 bg-zinc-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Stop
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.stops.map((stop: any, fileIndex: number) => (
                                <div key={fileIndex} className="group/stop relative grid gap-6 rounded-[32px] border border-zinc-100 bg-zinc-50/50 p-8 transition-all hover:bg-white hover:shadow-2xl hover:shadow-zinc-200/50">
                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => removeStop(fileIndex)}
                                        className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-300 opacity-0 shadow-xl ring-1 ring-zinc-50 transition-all hover:text-red-600 hover:scale-110 group-hover/stop:opacity-100 z-10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="flex-1 space-y-8">
                                            <div className="flex items-center gap-5">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white font-black text-xs italic shadow-lg">
                                                    {String(fileIndex + 1).padStart(2, '0')}
                                                </div>
                                                <div className="flex-1 border-b-2 border-dashed border-zinc-200 focus-within:border-brand transition-colors">
                                                    <input
                                                        placeholder="ENTER STOP NAME..."
                                                        required
                                                        className="w-full border-0 bg-transparent p-0 pb-2 text-xl font-black text-zinc-900 focus:ring-0 placeholder:text-zinc-200 uppercase tracking-tight"
                                                        value={stop.name}
                                                        onChange={(e) => updateStop(fileIndex, "name", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-brand mb-2 block italic">Morning</label>
                                                    <label className="text-[11px] font-black uppercase tracking-tight text-zinc-900 mb-2 block">Pick Time</label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                                        <input
                                                            type="time"
                                                            className="w-full border-0 bg-transparent pl-6 p-0 font-bold text-zinc-900 focus:ring-0"
                                                            value={stop.pickupTime}
                                                            onChange={(e) => updateStop(fileIndex, "pickupTime", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-brand mb-2 block text-right italic">Evening</label>
                                                    <label className="text-[11px] font-black uppercase tracking-tight text-zinc-900 mb-2 block text-right">Drop Time</label>
                                                    <div className="relative flex justify-end">
                                                        <input
                                                            type="time"
                                                            className="w-full border-0 bg-transparent pr-6 p-0 font-bold text-zinc-900 focus:ring-0 text-right"
                                                            value={stop.dropTime}
                                                            onChange={(e) => updateStop(fileIndex, "dropTime", e.target.value)}
                                                        />
                                                        <Clock className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coordinates Input */}
                                        <div className="lg:w-64 space-y-4 p-6 rounded-[28px] bg-zinc-900 text-white shadow-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-3 w-3 text-brand" />
                                                    <span className="text-[8px] font-black uppercase tracking-[3px] text-zinc-500">Location Settings</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => getCurrentLocation(fileIndex)}
                                                    className="h-7 px-3 bg-brand/10 text-brand rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-brand hover:text-white transition-all active:scale-95"
                                                >
                                                    GET LOCATION
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="relative group/coord">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-zinc-500 uppercase">Lat</span>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="w-full h-10 bg-white/5 border-0 rounded-xl pl-10 pr-3 text-[10px] font-bold focus:ring-1 focus:ring-brand transition-all"
                                                        value={stop.lat === 0 ? '' : stop.lat}
                                                        onChange={(e) => updateStop(fileIndex, "lat", e.target.value)}
                                                    />
                                                </div>
                                                <div className="relative group/coord">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-zinc-500 uppercase">Lng</span>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="w-full h-10 bg-white/5 border-0 rounded-xl pl-10 pr-3 text-[10px] font-bold focus:ring-1 focus:ring-brand transition-all"
                                                        value={stop.lng === 0 ? '' : stop.lng}
                                                        onChange={(e) => updateStop(fileIndex, "lng", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.stops.length === 0 && (
                                <button
                                    type="button"
                                    className="w-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-200 rounded-[40px] bg-zinc-50/30 group hover:border-brand hover:bg-white transition-all duration-500"
                                    onClick={addStop}
                                >
                                    <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 ring-1 ring-zinc-50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                        <MapPin className="h-8 w-8 text-zinc-100 group-hover:text-brand" />
                                    </div>
                                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest leading-relaxed text-center italic">
                                        No stops added yet.<br />
                                        <span className="text-brand not-italic">Click to add your first stop</span>
                                    </h3>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Right Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Resource Allocation Matrix */}
                    <div className="bg-white rounded-[40px] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/40 sticky top-8">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                                <Layers className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Vehicle & Driver</h2>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Assign vehicle and driver</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Vehicle</label>
                                <div className="relative">
                                    <Bus className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all uppercase"
                                        value={formData.vehicleId}
                                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                    >
                                        <option value="">Select vehicle...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.capacity} CAP</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <Info className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Driver</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all uppercase"
                                        value={formData.driverId}
                                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                    >
                                        <option value="">Select driver...</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <Info className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-zinc-100 space-y-6">
                            <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 shadow-inner">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Route Status</label>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full animate-ping",
                                        formData.name && formData.stops.length > 0 ? "bg-emerald-500" : "bg-amber-400"
                                    )} />
                                    <span className="text-[10px] font-black text-zinc-900 uppercase italic">
                                        {formData.name && formData.stops.length > 0
                                            ? "Ready to save"
                                            : "Missing information"}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-16 bg-zinc-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-3 shadow-2xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Saving Route...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-5 w-5 text-brand" />
                                        Save Route
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => onCancel ? onCancel() : router.back()}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-[3px] text-zinc-300 hover:text-red-500 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

function InputField({ label, placeholder, value, onChange, type = "text", required, readOnly, hint }: any) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                {hint && <span className="text-[9px] font-black text-brand uppercase italic">{hint}</span>}
            </div>
            <input
                type={type}
                required={required}
                readOnly={readOnly}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full bg-zinc-50 border border-zinc-100 rounded-[20px] py-5 px-8 font-bold text-sm text-zinc-900 shadow-sm focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all uppercase placeholder:text-zinc-200",
                    readOnly && "opacity-60 cursor-not-allowed"
                )}
            />
        </div>
    );
}
