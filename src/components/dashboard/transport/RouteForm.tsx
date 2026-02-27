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
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createRouteAction, updateRouteAction } from "@/app/actions/transport-actions";
import RouteMapPreview from "./RouteMapPreview";

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
                // Allow empty string or partial numbers while typing
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
                    <div className="bg-[#fafafa] rounded-[40px] p-8 border border-zinc-100 shadow-sm relative">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#a67c66] text-white flex items-center justify-center">
                                    <Compass className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Stops</h2>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">List of pickup and drop points</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addStop}
                                className="h-12 px-6 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Stop
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.stops.map((stop: any, fileIndex: number) => (
                                <div key={fileIndex} className="group/stop relative rounded-xl bg-white p-5 border border-zinc-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-100 text-xs font-semibold text-zinc-700">
                                                {fileIndex + 1}
                                            </div>
                                            <h4 className="text-sm font-semibold text-zinc-900">Stop Details</h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeStop(fileIndex)}
                                            className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-4 space-y-1.5 flex flex-col justify-end">
                                            <label className="text-xs font-medium text-zinc-700">Stop Name</label>
                                            <input
                                                placeholder="e.g. Central Library"
                                                required
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 placeholder:text-zinc-400"
                                                value={stop.name}
                                                onChange={(e) => updateStop(fileIndex, "name", e.target.value)}
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-1.5 flex flex-col justify-end">
                                            <label className="text-xs font-medium text-zinc-700">Morning Pick</label>
                                            <input
                                                type="time"
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                                                value={stop.pickupTime}
                                                onChange={(e) => updateStop(fileIndex, "pickupTime", e.target.value)}
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-1.5 flex flex-col justify-end">
                                            <label className="text-xs font-medium text-zinc-700">Evening Drop</label>
                                            <input
                                                type="time"
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                                                value={stop.dropTime}
                                                onChange={(e) => updateStop(fileIndex, "dropTime", e.target.value)}
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-1.5 flex flex-col justify-end">
                                            <label className="text-xs font-medium text-zinc-700">Fee (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                                                value={stop.monthlyFee}
                                                onChange={(e) => updateStop(fileIndex, "monthlyFee", e.target.value)}
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex flex-col justify-end">
                                            <button
                                                type="button"
                                                onClick={() => getCurrentLocation(fileIndex)}
                                                className="w-full flex h-[38px] items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                                            >
                                                <Activity className="h-3 w-3" />
                                                Locate
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Latitude</label>
                                            <input
                                                type="text"
                                                className="w-full border-0 bg-transparent p-0 text-sm font-medium text-zinc-600 focus:ring-0"
                                                value={stop.lat === 0 ? '' : stop.lat}
                                                onChange={(e) => updateStop(fileIndex, "lat", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Longitude</label>
                                            <input
                                                type="text"
                                                className="w-full border-0 bg-transparent p-0 text-sm font-medium text-zinc-600 focus:ring-0"
                                                value={stop.lng === 0 ? '' : stop.lng}
                                                onChange={(e) => updateStop(fileIndex, "lng", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.stops.length === 0 && (
                                <button
                                    type="button"
                                    className="w-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors group"
                                    onClick={addStop}
                                >
                                    <div className="h-10 w-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 ring-1 ring-zinc-200 group-hover:scale-110 transition-all">
                                        <Plus className="h-5 w-5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-700">No stops added yet</span>
                                    <span className="text-xs text-zinc-500 mt-1">Click to add your first route stop</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Right Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Live Preview Map */}
                    <div className="h-[400px] w-full z-20">
                        <RouteMapPreview stops={formData.stops} apiKey={apiKey} />
                    </div>

                    {/* Resource Allocation Matrix */}
                    <div className="bg-white rounded-[40px] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/40">
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
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Pickup Vehicle</label>
                                <div className="relative">
                                    <Bus className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all uppercase cursor-pointer"
                                        value={formData.pickupVehicleId}
                                        onChange={(e) => setFormData({ ...formData, pickupVehicleId: e.target.value })}
                                    >
                                        <option value="">Select pickup vehicle...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.capacity} CAP</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Drop Vehicle</label>
                                <div className="relative">
                                    <Bus className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all uppercase cursor-pointer"
                                        value={formData.dropVehicleId}
                                        onChange={(e) => setFormData({ ...formData, dropVehicleId: e.target.value })}
                                    >
                                        <option value="">Select drop vehicle...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.capacity} CAP</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                                    Driver {drivers.length > 0 ? `(${drivers.length} AVAILABLE)` : '(NONE FOUND)'}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-200 group-focus-within:text-brand transition-colors" />
                                    <select
                                        className="w-full h-14 appearance-none rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-12 text-xs font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all uppercase cursor-pointer"
                                        value={formData.driverId}
                                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                    >
                                        <option value="">Select driver...</option>
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

                        <div className="mt-12 pt-10 border-t border-zinc-100 space-y-6">
                            <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 shadow-inner">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Route Status</label>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        formData.name && formData.stops.length > 0 && formData.pickupVehicleId && formData.driverId
                                            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            : "bg-amber-400 animate-pulse"
                                    )} />
                                    <span className="text-[10px] font-black text-zinc-900 uppercase italic">
                                        {!formData.name ? "Enter Route Name" :
                                            formData.stops.length === 0 ? "Add at least one stop" :
                                                !formData.pickupVehicleId ? "Assign Pickup Vehicle" :
                                                    !formData.driverId ? "Assign Driver" :
                                                        "Ready to sync data"}
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
