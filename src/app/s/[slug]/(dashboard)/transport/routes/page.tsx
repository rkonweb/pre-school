"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    getRoutesAction,
    createRouteAction,
    updateRouteAction,
    deleteRouteAction,
    getVehiclesAction,
    getDriversAction
} from "@/app/actions/transport-actions";
import {
    MapPin,
    Plus,
    Navigation,
    Loader2,
    X,
    Bus,
    User,
    Clock,
    Trash2,
    Edit
} from "lucide-react";
import { toast } from "sonner";

export default function RoutesPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [routes, setRoutes] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        vehicleId: "",
        driverId: "",
        stops: [] as any[]
    });
    const [submitting, setSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [slug]);

    async function fetchData() {
        setLoading(true);
        const [routesRes, vehiclesRes, driversRes] = await Promise.all([
            getRoutesAction(slug),
            getVehiclesAction(slug),
            getDriversAction(slug)
        ]);

        if (routesRes.success) setRoutes(routesRes.data);
        if (vehiclesRes.success) setVehicles(vehiclesRes.data);
        if (driversRes.success) setDrivers(driversRes.data);
        setLoading(false);
    }

    // Force Re-render v2

    // Modal Handlers
    function openNewModal() {
        setEditingId(null);
        setFormData({ name: "", description: "", vehicleId: "", driverId: "", stops: [] });
        setIsModalOpen(true);
    }

    function handleEdit(route: any) {
        setEditingId(route.id);
        setFormData({
            name: route.name,
            description: route.description || "",
            vehicleId: route.vehicleId || "",
            driverId: route.driverId || "",
            stops: route.stops ? route.stops.map((s: any) => ({
                name: s.name,
                pickupTime: s.pickupTime,
                dropTime: s.dropTime,
                lat: s.latitude,
                lng: s.longitude
            })) : []
        });
        setIsModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this route?")) return;
        const res = await deleteRouteAction(id, slug);
        if (res.success) {
            toast.success("Route deleted");
            fetchData();
        } else {
            toast.error(res.error || "Failed to delete route");
        }
    }

    // Stop Management in Form
    function addStop() {
        setFormData({
            ...formData,
            stops: [...formData.stops, { name: "", pickupTime: "", dropTime: "", lat: 0, lng: 0 }]
        });
    }

    function removeStop(index: number) {
        const newStops = [...formData.stops];
        newStops.splice(index, 1);
        setFormData({ ...formData, stops: newStops });
    }

    function updateStop(index: number, field: string, value: any) {
        const newStops = [...formData.stops];
        // Handle float conversion safely
        if (field === "lat" || field === "lng") {
            const floatVal = parseFloat(value);
            value = isNaN(floatVal) ? 0 : floatVal;
        }
        newStops[index] = { ...newStops[index], [field]: value };
        setFormData({ ...formData, stops: newStops });
    }

    function getCurrentLocation(index: number) {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        toast.info("Fetching location...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newStops = [...formData.stops];
                newStops[index] = {
                    ...newStops[index],
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setFormData({ ...formData, stops: newStops });
                toast.success("Location updated");
            },
            () => {
                toast.error("Unable to retrieve your location");
            }
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            let res;
            if (editingId) {
                res = await updateRouteAction(editingId, formData, slug);
            } else {
                res = await createRouteAction(formData, slug);
            }

            if (res.success) {
                toast.success(editingId ? "Route updated" : "Route created");
                setIsModalOpen(false);
                fetchData();
                setFormData({ name: "", description: "", vehicleId: "", driverId: "", stops: [] });
                setEditingId(null);
            } else {
                console.error("Route Action Error:", res.error);
                toast.error(res.error || "Operation failed");
            }
        } catch (error: any) {
            console.error("Submit Error:", error);
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Route Management</h1>
                    <p className="text-zinc-500">Define routes, schedules, and assignments.</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl"
                >
                    <Plus className="h-4 w-4" />
                    Create Route
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50/50 border-b border-zinc-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-zinc-900">Route Name</th>
                                    <th className="px-6 py-4 font-bold text-zinc-900">Vehicle</th>
                                    <th className="px-6 py-4 font-bold text-zinc-900">Driver</th>
                                    <th className="px-6 py-4 font-bold text-zinc-900 text-center">Stops</th>
                                    <th className="px-6 py-4 font-bold text-zinc-900 text-center">Students</th>
                                    <th className="px-6 py-4 font-bold text-zinc-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {routes.map((route) => (
                                    <tr key={route.id} className="group transition-colors hover:bg-blue-50/30">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                                    <Navigation className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900">{route.name}</div>
                                                    <div className="text-xs text-zinc-500 max-w-[200px] truncate">{route.description || "No description"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-zinc-700">
                                                <Bus className="h-4 w-4 text-zinc-400" />
                                                <span className="font-medium">{route.vehicle ? route.vehicle.registrationNumber : "Unassigned"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-zinc-700">
                                                <User className="h-4 w-4 text-zinc-400" />
                                                <span className="font-medium">{route.driver ? route.driver.name : "Unassigned"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-zinc-100 px-2 text-xs font-bold text-zinc-700">
                                                {route._count?.stops || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-zinc-100 px-2 text-xs font-bold text-zinc-700">
                                                {route._count?.students || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(route)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Route"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(route.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Route"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {routes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50">
                                <Navigation className="h-8 w-8 text-zinc-300" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900">No Routes Found</h3>
                            <p className="max-w-xs text-sm text-zinc-500 mt-1">
                                Get started by creating your first transport route.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Route Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900">{editingId ? "Edit Route" : "Create New Route"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-zinc-100">
                                <X className="h-5 w-5 text-zinc-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Route Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Route A - Downtown"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Assign Vehicle</label>
                                    <select
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50"
                                        value={formData.vehicleId}
                                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.registrationNumber} ({v.capacity}s)</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Assign Driver</label>
                                    <select
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50"
                                        value={formData.driverId}
                                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                    >
                                        <option value="">Select Driver</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-zinc-900">Stops</h3>
                                    <button
                                        type="button"
                                        onClick={addStop}
                                        className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg"
                                    >
                                        + Add Stop
                                    </button>
                                </div>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.stops.map((stop, fileIndex) => (
                                        <div key={fileIndex} className="relative rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:bg-zinc-50 hover:shadow-sm hover:border-blue-200 group/stop">
                                            <div className="absolute right-4 top-4">
                                                <button
                                                    type="button"
                                                    onClick={() => removeStop(fileIndex)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-400 opacity-0 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover/stop:opacity-100"
                                                    title="Remove Stop"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                                    {fileIndex + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold uppercase text-zinc-400">Stop Name</label>
                                                    <input
                                                        placeholder="e.g. Central Library Stop"
                                                        required
                                                        className="w-full border-0 border-b border-zinc-200 bg-transparent px-0 py-1 text-sm font-bold text-zinc-900 focus:border-blue-600 focus:ring-0 placeholder:font-normal placeholder:text-zinc-400"
                                                        value={stop.name}
                                                        onChange={(e) => updateStop(fileIndex, "name", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Pickup Time</label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                        <input
                                                            type="time"
                                                            className="w-full rounded-xl border-zinc-200 bg-white pl-10 text-sm"
                                                            value={stop.pickupTime}
                                                            onChange={(e) => updateStop(fileIndex, "pickupTime", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Drop Time</label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                        <input
                                                            type="time"
                                                            className="w-full rounded-xl border-zinc-200 bg-white pl-10 text-sm"
                                                            value={stop.dropTime}
                                                            onChange={(e) => updateStop(fileIndex, "dropTime", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-xl bg-blue-50/50 p-3 ring-1 ring-blue-100">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-blue-700">
                                                        <MapPin className="h-3 w-3" /> Geo-Coordinates
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => getCurrentLocation(fileIndex)}
                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                    >
                                                        Use Current Location
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            placeholder="Latitude"
                                                            className="w-full rounded-lg border-blue-200 bg-white text-xs text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:ring-blue-500"
                                                            value={stop.lat === 0 ? '' : stop.lat}
                                                            onChange={(e) => updateStop(fileIndex, "lat", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            placeholder="Longitude"
                                                            className="w-full rounded-lg border-blue-200 bg-white text-xs text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:ring-blue-500"
                                                            value={stop.lng === 0 ? '' : stop.lng}
                                                            onChange={(e) => updateStop(fileIndex, "lng", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.stops.length === 0 && (
                                        <div className="text-center text-xs text-zinc-400 py-4 italic">No stops added yet.</div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editingId ? "Update Route" : "Create Route"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
