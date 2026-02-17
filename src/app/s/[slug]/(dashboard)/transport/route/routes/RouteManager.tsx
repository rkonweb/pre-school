'use client';

import { useState, useMemo } from "react";
import {
    Plus, Trash2, Save, MapPin, Bus, Search,
    Edit2, Filter, ChevronDown, ChevronUp,
    MoreHorizontal, User, Phone, CheckCircle, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { createRouteAction, deleteRouteAction } from "@/app/actions/transport-actions";
import { useConfirm } from "@/contexts/ConfirmContext";
import { AnimatePresence, motion } from "framer-motion";

type Route = any; // Using any for simplicity as per existing pattern

interface RouteManagerProps {
    schoolSlug: string;
    initialRoutes: Route[];
    vehicles: any[];
}

export default function RouteManager({ schoolSlug, initialRoutes, vehicles }: RouteManagerProps) {
    const { confirm: confirmDialog } = useConfirm();

    // State
    const [routes, setRoutes] = useState<Route[]>(initialRoutes);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Filters
    const [filterDriver, setFilterDriver] = useState<'all' | 'assigned' | 'unassigned'>('all');
    const [filterVehicle, setFilterVehicle] = useState<'all' | 'assigned' | 'unassigned'>('all');

    // Drawer / Modal State
    const [isdrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        pickupVehicleId: "",
        dropVehicleId: "",
        driverId: "",
        stops: [] as any[]
    });

    // --- Helpers ---

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedRoutes = useMemo(() => {
        let sortableRoutes = [...routes];

        // 1. Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            sortableRoutes = sortableRoutes.filter(r =>
                r.name.toLowerCase().includes(lowerQuery) ||
                r.pickupVehicle?.registrationNumber.toLowerCase().includes(lowerQuery) ||
                r.dropVehicle?.registrationNumber.toLowerCase().includes(lowerQuery) ||
                r.driver?.name.toLowerCase().includes(lowerQuery)
            );
        }

        if (filterDriver !== 'all') {
            sortableRoutes = sortableRoutes.filter(r =>
                filterDriver === 'assigned' ? !!r.driverId : !r.driverId
            );
        }

        if (filterVehicle !== 'all') {
            sortableRoutes = sortableRoutes.filter(r =>
                filterVehicle === 'assigned' ? (!!r.pickupVehicleId || !!r.dropVehicleId) : (!r.pickupVehicleId && !r.dropVehicleId)
            );
        }

        // 2. Sort
        if (sortConfig !== null) {
            sortableRoutes.sort((a, b) => {
                let aValue: any = a[sortConfig.key];
                let bValue: any = b[sortConfig.key];

                // Handle nested keys or derived values
                if (sortConfig.key === 'students') {
                    aValue = a._count?.students || 0;
                    bValue = b._count?.students || 0;
                } else if (sortConfig.key === 'stops') {
                    aValue = a.stops.length;
                    bValue = b.stops.length;
                } else if (sortConfig.key === 'driver') {
                    aValue = a.driver?.name || "";
                    bValue = b.driver?.name || "";
                } else if (sortConfig.key === 'vehicle') {
                    aValue = a.pickupVehicle?.registrationNumber || "";
                    bValue = b.pickupVehicle?.registrationNumber || "";
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableRoutes;
    }, [routes, sortConfig, searchQuery, filterDriver, filterVehicle]);

    // --- Actions ---

    const handleSubmit = async () => {
        if (!formData.name) return toast.error("Route name is required");

        const data = { ...formData };

        // If editing
        if (editingRoute) {
            // For simplicity, we are deleting the old route and creating a new one in this mock implementation
            // In a real app, we would have an updateRouteAction
            await deleteRouteAction(schoolSlug, editingRoute.id);
        }

        const res = await createRouteAction(schoolSlug, data);

        if (res.success) {
            toast.success(editingRoute ? "Route updated successfully" : "Route created successfully");
            setIsDrawerOpen(false);
            setEditingRoute(null);
            setFormData({ name: "", description: "", pickupVehicleId: "", dropVehicleId: "", driverId: "", stops: [] });

            // Optimistic update (or refetch)
            // Just for demonstration, we reload the page to get fresh data from server
            window.location.reload();
        } else {
            toast.error(res.error || "Failed to save route");
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Route",
            message: "Are you sure? This action cannot be undone.",
            variant: "danger",
            confirmText: "Delete Route",
        });

        if (confirmed) {
            const res = await deleteRouteAction(schoolSlug, id);
            if (res.success) {
                toast.success("Route deleted");
                setRoutes(routes.filter(r => r.id !== id));
            } else {
                toast.error("Failed to delete route");
            }
        }
    };

    const openDrawer = (route?: Route) => {
        if (route) {
            setEditingRoute(route);
            setFormData({
                name: route.name,
                description: route.description || "",
                pickupVehicleId: route.pickupVehicleId || "",
                dropVehicleId: route.dropVehicleId || "",
                driverId: route.driverId || "",
                stops: route.stops ? route.stops.map((s: any) => ({
                    ...s,
                    // Ensure numeric values are safe
                    latitude: s.latitude || "",
                    longitude: s.longitude || "",
                    monthlyFee: s.monthlyFee || 0
                })) : []
            });
        } else {
            setEditingRoute(null);
            setFormData({ name: "", description: "", pickupVehicleId: "", dropVehicleId: "", driverId: "", stops: [] });
        }
        setIsDrawerOpen(true);
    };

    const addStop = () => {
        setFormData(prev => ({
            ...prev,
            stops: [...prev.stops, { name: "", pickupTime: "", dropTime: "", monthlyFee: 0, latitude: "", longitude: "" }]
        }));
    };

    const removeStop = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            stops: prev.stops.filter((_, i) => i !== idx)
        }));
    };

    const updateStop = (idx: number, field: string, value: any) => {
        const newStops = [...formData.stops];
        newStops[idx][field] = value;
        setFormData({ ...formData, stops: newStops });
    };

    // --- Render ---

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Route Management</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage transport routes, stops, and vehicle assignments.</p>
                </div>
                <button
                    onClick={() => openDrawer()}
                    className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl shadow-lg shadow-brand/20 hover:brightness-110 active:scale-95 transition-all font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Create New Route
                </button>
            </div>

            {/* Controls Bar */}
            <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">

                {/* Search */}
                <div className="relative w-full xl:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        placeholder="Search routes, drivers, vehicles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
                    <Filter className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-600 mr-2 shrink-0">Filters:</span>

                    <select
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:ring-2 focus:ring-brand outline-none"
                        value={filterDriver}
                        onChange={(e) => setFilterDriver(e.target.value as any)}
                    >
                        <option value="all">All Drivers</option>
                        <option value="assigned">Assigned</option>
                        <option value="unassigned">Unassigned</option>
                    </select>

                    <select
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:ring-2 focus:ring-brand outline-none"
                        value={filterVehicle}
                        onChange={(e) => setFilterVehicle(e.target.value as any)}
                    >
                        <option value="all">All Vehicles</option>
                        <option value="assigned">Assigned</option>
                        <option value="unassigned">Unassigned</option>
                    </select>
                </div>
            </div>

            {/* Comprehensive Data Table */}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-200">
                                <SortHeader label="Route Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <SortHeader label="Driver" sortKey="driver" currentSort={sortConfig} onSort={handleSort} />
                                <SortHeader label="Vehicle (Pick/Drop)" sortKey="vehicle" currentSort={sortConfig} onSort={handleSort} />
                                <SortHeader label="Stops" sortKey="stops" currentSort={sortConfig} onSort={handleSort} />
                                <SortHeader label="Students" sortKey="students" currentSort={sortConfig} onSort={handleSort} />
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {sortedRoutes.length > 0 ? (
                                sortedRoutes.map((route) => (
                                    <tr key={route.id} className="hover:bg-zinc-50/50 transition-colors group">

                                        {/* Route Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Bus className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-zinc-900">{route.name}</div>
                                                    <div className="text-xs text-zinc-500">{route.description || "No description"}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Driver */}
                                        <td className="px-6 py-4">
                                            {route.driver ? (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-zinc-400" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-zinc-800">{route.driver.name}</span>
                                                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                            <Phone className="h-3 w-3" /> {route.driver.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs font-medium border border-yellow-100">
                                                    Unassigned
                                                </span>
                                            )}
                                        </td>

                                        {/* Vehicle Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                {route.pickupVehicle ? (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="font-bold text-zinc-400 w-8">PICK</span>
                                                        <span className="font-medium bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700">{route.pickupVehicle.registrationNumber}</span>
                                                    </div>
                                                ) : <div className="text-xs text-zinc-400">No Pickup Vehicle</div>}

                                                {route.dropVehicle ? (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="font-bold text-zinc-400 w-8">DROP</span>
                                                        <span className="font-medium bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700">{route.dropVehicle.registrationNumber}</span>
                                                    </div>
                                                ) : <div className="text-xs text-zinc-400">No Drop Vehicle</div>}
                                            </div>
                                        </td>

                                        {/* Stops */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md text-xs font-bold border border-zinc-200">
                                                    {route._count?.stops || route.stops?.length || 0}
                                                </div>
                                                <span className="text-xs text-zinc-500">Stops</span>
                                            </div>
                                        </td>

                                        {/* Students */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-xs font-bold border border-indigo-100">
                                                    {route._count?.students || 0}
                                                </div>
                                                <span className="text-xs text-zinc-500">Students</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openDrawer(route)}
                                                    className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Edit Route"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(route.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Route"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-24">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-zinc-50 p-4 rounded-full mb-4">
                                                <Bus className="h-8 w-8 text-zinc-300" />
                                            </div>
                                            <h3 className="text-zinc-900 font-medium text-lg">No routes found</h3>
                                            <p className="text-zinc-500 max-w-sm mt-2">
                                                Try adjusting your search or filters, or create a new route to get started.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Footer Details */}
            <div className="flex justify-between items-center text-xs text-zinc-400 px-2">
                <div>Showing {sortedRoutes.length} of {routes.length} routes</div>
                <div>Last updated: {new Date().toLocaleTimeString()}</div>
            </div>

            {/* Create/Edit Sheet (Modal) */}
            <AnimatePresence>
                {isdrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            onClick={() => setIsDrawerOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900">{editingRoute ? 'Edit Route' : 'Create New Route'}</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Configure route details and stops.</p>
                                </div>
                                <button onClick={() => setIsDrawerOpen(false)} className="text-zinc-400 hover:text-zinc-800">
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                                {/* Basic Info Section */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                        Basic Information
                                    </h3>
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Route Name</label>
                                            <input
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none"
                                                placeholder="e.g. Route 1 - North City"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Description</label>
                                            <textarea
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none resize-none h-20"
                                                placeholder="Optional route description..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Vehicle Assignment Section */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                        Vehicle & Driver
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Pickup Vehicle</label>
                                            <select
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none bg-white"
                                                value={formData.pickupVehicleId}
                                                onChange={e => setFormData({ ...formData, pickupVehicleId: e.target.value })}
                                            >
                                                <option value="">Select Vehicle</option>
                                                {vehicles.map(v => (
                                                    <option key={v.id} value={v.id}>{v.registrationNumber} ({v.model})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Drop Vehicle</label>
                                            <select
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none bg-white"
                                                value={formData.dropVehicleId}
                                                onChange={e => setFormData({ ...formData, dropVehicleId: e.target.value })}
                                            >
                                                <option value="">Select Vehicle</option>
                                                {vehicles.map(v => (
                                                    <option key={v.id} value={v.id}>{v.registrationNumber} ({v.model})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                {/* Stops Section */}
                                <section className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                                            Stops Configuration
                                        </h3>
                                        <button onClick={addStop} className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
                                            <Plus className="h-3 w-3" /> Add Stop
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.stops.map((stop, idx) => (
                                            <div key={idx} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 relative group">
                                                <div className="absolute -left-3 top-4 bg-zinc-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-10">
                                                    {idx + 1}
                                                </div>
                                                <button
                                                    onClick={() => removeStop(idx)}
                                                    className="absolute right-2 top-2 text-zinc-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>

                                                <div className="grid gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Stop Name</label>
                                                        <input
                                                            className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm outline-none focus:border-brand"
                                                            placeholder="e.g. Main Gate"
                                                            value={stop.name}
                                                            onChange={e => updateStop(idx, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Pickup Time</label>
                                                            <input
                                                                type="time"
                                                                className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm outline-none focus:border-brand"
                                                                value={stop.pickupTime}
                                                                onChange={e => updateStop(idx, 'pickupTime', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Drop Time</label>
                                                            <input
                                                                type="time"
                                                                className="w-full border border-zinc-200 rounded px-2 py-1.5 text-sm outline-none focus:border-brand"
                                                                value={stop.dropTime}
                                                                onChange={e => updateStop(idx, 'dropTime', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Fee (Monthly)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-1.5 text-zinc-400 text-xs">₹</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full border border-zinc-200 rounded pl-5 pr-2 py-1.5 text-sm outline-none focus:border-brand"
                                                                    value={stop.monthlyFee}
                                                                    onChange={e => updateStop(idx, 'monthlyFee', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.stops.length === 0 && (
                                            <div className="text-center py-8 text-zinc-400 text-sm border-2 border-dashed border-zinc-100 rounded-xl">
                                                No stops added yet. Click "Add Stop" to begin.
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
                                <button onClick={() => setIsDrawerOpen(false)} className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-100 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSubmit} className="px-5 py-2.5 rounded-xl bg-brand text-white font-medium hover:brightness-110 shadow-lg shadow-brand/20 transition-all flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    {editingRoute ? 'Update Route' : 'Save Route'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function SortHeader({ label, sortKey, currentSort, onSort }: any) {
    const isActive = currentSort?.key === sortKey;
    return (
        <th
            className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors select-none group"
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center gap-2">
                {label}
                <div className="flex flex-col opacity-0 group-hover:opacity-50 aria-[current=true]:opacity-100" aria-current={isActive}>
                    <ChevronUp className={`h-2.5 w-2.5 ${isActive && currentSort.direction === 'asc' ? 'text-brand' : 'text-zinc-400'}`} />
                    <ChevronDown className={`h-2.5 w-2.5 ${isActive && currentSort.direction === 'desc' ? 'text-brand' : 'text-zinc-400'}`} />
                </div>
            </div>
        </th>
    );
}
