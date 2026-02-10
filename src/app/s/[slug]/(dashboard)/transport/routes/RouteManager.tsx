'use client';

import { useState } from "react";
import { Plus, Trash2, Save, MapPin, Bus, Search, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { createRouteAction, deleteRouteAction, addStopAction } from "@/app/actions/transport-actions";

export default function RouteManager({ schoolSlug, initialRoutes, vehicles }: any) {
    const [routes, setRoutes] = useState(initialRoutes);
    const [isCreating, setIsCreating] = useState(false);
    const [newRoute, setNewRoute] = useState({ name: "", description: "", pickupVehicleId: "", dropVehicleId: "", stops: [] as any[] });

    const handleCreateRoute = async () => {
        const res = await createRouteAction(schoolSlug, newRoute);
        if (res.success) {
            toast.success("Route created successfully");
            setIsCreating(false);
            setNewRoute({ name: "", description: "", pickupVehicleId: "", dropVehicleId: "", stops: [] });
            // Ideally revalidate or update state from server
        } else {
            toast.error(res.error || "Failed to create route");
        }
    };

    const addStopField = () => {
        setNewRoute({
            ...newRoute,
            stops: [...newRoute.stops, { name: "", pickupTime: "", dropTime: "", monthlyFee: 0, latitude: "", longitude: "" }]
        });
    };

    // Calculate available vehicles (simplified logic: vehicle is available if not used in same slot by OTHER routes)
    // NOTE: This logic assumes a vehicle can only do ONE route per slot globally.
    const isVehicleAvailable = (vehicleId: string, type: 'pickup' | 'drop', currentRouteId?: string) => {
        return !routes.some((r: any) =>
            r.id !== currentRouteId &&
            ((type === 'pickup' && r.pickupVehicleId === vehicleId) ||
                (type === 'drop' && r.dropVehicleId === vehicleId))
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Routes & Stops</h2>
                <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
                    <Plus className="h-4 w-4" /> Add Route
                </button>
            </div>

            {isCreating && (
                <div className="border p-4 rounded-lg bg-zinc-50 space-y-4">
                    <h3 className="font-semibold">New Route</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            placeholder="Route Name"
                            className="border p-2 rounded"
                            value={newRoute.name}
                            onChange={e => setNewRoute({ ...newRoute, name: e.target.value })}
                        />
                        <select
                            className="border p-2 rounded"
                            value={newRoute.pickupVehicleId}
                            onChange={e => setNewRoute({ ...newRoute, pickupVehicleId: e.target.value })}
                        >
                            <option value="">Select Pickup Vehicle</option>
                            {vehicles.map((v: any) => {
                                const isAvailable = isVehicleAvailable(v.id, 'pickup', (newRoute as any).id);
                                return (
                                    <option key={v.id} value={v.id} disabled={!isAvailable} className={!isAvailable ? 'text-gray-400 bg-gray-100' : ''}>
                                        {v.registrationNumber} ({v.capacity} seats) {isAvailable ? '' : '(Busy)'}
                                    </option>
                                );
                            })}
                        </select>
                        <select
                            className="border p-2 rounded"
                            value={newRoute.dropVehicleId}
                            onChange={e => setNewRoute({ ...newRoute, dropVehicleId: e.target.value })}
                        >
                            <option value="">Select Drop Vehicle</option>
                            {vehicles.map((v: any) => {
                                const isAvailable = isVehicleAvailable(v.id, 'drop', (newRoute as any).id);
                                return (
                                    <option key={v.id} value={v.id} disabled={!isAvailable} className={!isAvailable ? 'text-gray-400 bg-gray-100' : ''}>
                                        {v.registrationNumber} ({v.capacity} seats) {isAvailable ? '' : '(Busy)'}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium text-sm text-zinc-700">Route Stops</h4>
                            <button onClick={addStopField} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Add Stop
                            </button>
                        </div>

                        <div className="space-y-3">
                            {newRoute.stops.map((stop, idx) => (
                                <div key={idx} className="bg-white border rounded-lg p-3 shadow-sm relative group">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="flex items-center justify-center bg-zinc-100 text-zinc-500 w-6 h-6 rounded-full text-xs font-medium">
                                            {idx + 1}
                                        </span>
                                        <input
                                            placeholder="Stop Name (e.g. Central Park Gate 1)"
                                            className="border p-1.5 rounded text-sm flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={stop.name}
                                            onChange={e => {
                                                const stops = [...newRoute.stops];
                                                stops[idx].name = e.target.value;
                                                setNewRoute({ ...newRoute, stops });
                                            }}
                                        />
                                        <button onClick={() => {
                                            const stops = newRoute.stops.filter((_, i) => i !== idx);
                                            setNewRoute({ ...newRoute, stops });
                                        }} className="text-zinc-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4" /></button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <div>
                                            <label className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider mb-1 block">Pickup Time</label>
                                            <input type="time" className="w-full border p-1.5 rounded text-sm" value={stop.pickupTime} onChange={e => {
                                                const stops = [...newRoute.stops];
                                                stops[idx].pickupTime = e.target.value;
                                                setNewRoute({ ...newRoute, stops });
                                            }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider mb-1 block">Drop Time</label>
                                            <input type="time" className="w-full border p-1.5 rounded text-sm" value={stop.dropTime} onChange={e => {
                                                const stops = [...newRoute.stops];
                                                stops[idx].dropTime = e.target.value;
                                                setNewRoute({ ...newRoute, stops });
                                            }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider mb-1 block">Monthly Fee</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1.5 text-zinc-400 text-xs">₹</span>
                                                <input type="number" className="w-full border p-1.5 pl-6 rounded text-sm" value={stop.monthlyFee} onChange={e => {
                                                    const stops = [...newRoute.stops];
                                                    stops[idx].monthlyFee = e.target.value;
                                                    setNewRoute({ ...newRoute, stops });
                                                }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider mb-1 block flex items-center gap-1"><MapPin className="h-3 w-3" /> Lat</label>
                                            <input type="number" placeholder="28.1234" className="w-full border p-1.5 rounded text-sm" value={stop.latitude} onChange={e => {
                                                const stops = [...newRoute.stops];
                                                stops[idx].latitude = e.target.value;
                                                setNewRoute({ ...newRoute, stops });
                                            }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider mb-1 block flex items-center gap-1"><MapPin className="h-3 w-3" /> Lng</label>
                                            <input type="number" placeholder="77.1234" className="w-full border p-1.5 rounded text-sm" value={stop.longitude} onChange={e => {
                                                const stops = [...newRoute.stops];
                                                stops[idx].longitude = e.target.value;
                                                setNewRoute({ ...newRoute, stops });
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsCreating(false)} className="px-4 py-2 border rounded">Cancel</button>
                        <button onClick={handleCreateRoute} className="px-4 py-2 bg-green-600 text-white rounded">Save Route</button>
                    </div>
                </div>
            )}

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    placeholder="Search routes by name or vehicle..."
                    className="w-full border border-zinc-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    onChange={(e) => {
                        const search = e.target.value.toLowerCase();
                        setRoutes(initialRoutes.filter((r: any) =>
                            r.name.toLowerCase().includes(search) ||
                            r.pickupVehicle?.registrationNumber.toLowerCase().includes(search) ||
                            r.dropVehicle?.registrationNumber.toLowerCase().includes(search)
                        ));
                    }}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {routes.map((route: any) => (
                    <div key={route.id} className="group bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
                        {/* Route Header */}
                        <div className="bg-zinc-50/80 p-3 border-b border-zinc-100 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                                    <Bus className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900">{route.name}</h3>
                                    <div className="flex flex-col gap-1 text-xs text-zinc-500 mt-1">
                                        <span>{route.stops.length} Stops</span>
                                        <div className="flex gap-2">
                                            {route.pickupVehicle && (
                                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-zinc-200" title="Pickup Vehicle">
                                                    <span className="font-bold text-[10px] text-zinc-400">P:</span>
                                                    <span className="font-medium text-zinc-600">{route.pickupVehicle.registrationNumber}</span>
                                                </div>
                                            )}
                                            {route.dropVehicle && (
                                                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-zinc-200" title="Drop Vehicle">
                                                    <span className="font-bold text-[10px] text-zinc-400">D:</span>
                                                    <span className="font-medium text-zinc-600">{route.dropVehicle.registrationNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setNewRoute({
                                            ...route,
                                            pickupVehicleId: route.pickupVehicleId || "",
                                            dropVehicleId: route.dropVehicleId || "",
                                            stops: route.stops.map((s: any) => ({
                                                ...s,
                                                monthlyFee: s.monthlyFee || 0,
                                                latitude: s.latitude || "",
                                                longitude: s.longitude || ""
                                            }))
                                        });
                                        setIsCreating(true);
                                    }}
                                    className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Edit Route"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm("Delete route?")) {
                                            await deleteRouteAction(route.id);
                                            toast.success("Route deleted");
                                            setRoutes(routes.filter((r: any) => r.id !== route.id));
                                        }
                                    }}
                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete Route"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Route Timeline */}
                        {/* Dense Stops List */}
                        <div className="p-0 flex-1 overflow-auto max-h-[300px]">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-50 text-zinc-500 font-medium sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-2 w-10">#</th>
                                        <th className="px-2 py-2">Stop Name</th>
                                        <th className="px-2 py-2">Time</th>
                                        <th className="px-2 py-2 text-right">Fee</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 text-zinc-600">
                                    {route.stops.map((stop: any, idx: number) => (
                                        <tr key={stop.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-4 py-2 text-zinc-400 font-mono text-[10px]">{idx + 1}</td>
                                            <td className="px-2 py-2 font-medium text-zinc-700">
                                                {stop.name}
                                                {(stop.latitude || stop.longitude) && (
                                                    <span className="ml-1 inline-flex text-zinc-300" title={`Lat: ${stop.latitude}, Lng: ${stop.longitude}`}>
                                                        <MapPin className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 whitespace-nowrap">
                                                <div className="flex flex-col text-[10px]">
                                                    <span className="text-zinc-500">P: {stop.pickupTime || '--'}</span>
                                                    <span className="text-zinc-400">D: {stop.dropTime || '--'}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 text-right font-medium">
                                                {stop.monthlyFee > 0 ? (
                                                    <span className="text-blue-600">₹{stop.monthlyFee}</span>
                                                ) : (
                                                    <span className="text-green-600 text-[10px] uppercase">Free</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {routes.length === 0 && (
                    <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                        <div className="bg-zinc-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bus className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="text-zinc-900 font-medium">No routes found</h3>
                        <p className="text-zinc-500 text-sm mt-1">Create a new route to get started</p>
                    </div>
                )}
            </div>
        </div >
    );
}
