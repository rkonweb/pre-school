'use client';

import { useState, useMemo } from "react";
import {
    Plus, Trash2, MapPin, Bus, Search,
    Edit2, Filter, ChevronDown, ChevronUp,
    User, Phone, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { deleteRouteAction } from "@/app/actions/transport-actions";
import { useConfirm } from "@/contexts/ConfirmContext";
import Link from "next/link";

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

    // --- Render ---

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Route Management</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage transport routes, stops, and vehicle assignments.</p>
                </div>
                <Link
                    href={`/s/${schoolSlug}/transport/route/routes/new`}
                    className="flex items-center gap-2 bg-brand text-[var(--secondary-color)] px-5 py-2.5 rounded-xl shadow-lg shadow-brand/20 hover:brightness-110 active:scale-95 transition-all font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Create New Route
                </Link>
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
                                                <Link
                                                    href={`/s/${schoolSlug}/transport/route/routes/${route.id}/edit`}
                                                    className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Edit Route"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
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
