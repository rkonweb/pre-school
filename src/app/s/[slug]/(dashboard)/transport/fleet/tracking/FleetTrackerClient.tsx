"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFleetStatusAction } from "@/app/actions/tracking-actions";
import {
    Bus,
    Loader2,
    MapPin,
    Clock,
    Activity,
    RefreshCw,
    Search
} from "lucide-react";
import FleetMapPreview from "@/components/transport/FleetMapPreview";
import { cn } from "@/lib/utils";
import VehicleTrackingModal from "@/components/transport/VehicleTrackingModal";

type VehicleStatus = {
    id: string;
    registrationNumber: string;
    model: string | null;
    status: string;
    routeName: string | null;
    driverName: string | null;
    telemetry: {
        latitude: number;
        longitude: number;
        speed: number | null;
        heading: number | null;
        status: string;
        delayMinutes: number;
        recordedAt: Date;
    } | null;
};

// Add apiKey to props
interface FleetTrackerClientProps {
    apiKey: string;
}

export default function FleetTrackerClient({ apiKey }: FleetTrackerClientProps) {
    const params = useParams();
    const slug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<VehicleStatus[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<VehicleStatus[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<"list" | "map">("list");

    const fetchFleetStatus = async () => {
        const res = await getFleetStatusAction(slug);
        if (res.success && res.data) {
            setVehicles(res.data as VehicleStatus[]);
            setLastUpdate(new Date());
        }
        setLoading(false);
    };

    useEffect(() => {
        // Initial fetch
        fetchFleetStatus();

        // Setup Server-Sent Events for real-time updates
        if (!autoRefresh) return;

        const eventSource = new EventSource(`/api/tracking/stream?schoolSlug=${slug}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setVehicles(data as VehicleStatus[]);
                setLastUpdate(new Date());
            } catch (error) {
                console.error("SSE Parse Error:", error);
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE Connection Error:", error);
            eventSource.close();
            // Fallback to polling if SSE fails
            const interval = setInterval(fetchFleetStatus, 30000);
            return () => clearInterval(interval);
        };

        return () => {
            eventSource.close();
        };
    }, [slug, autoRefresh]);

    // Filter vehicles
    useEffect(() => {
        let filtered = vehicles;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(v =>
                v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.routeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.driverName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== "ALL") {
            filtered = filtered.filter(v => {
                if (statusFilter === "ON_TIME") return v.telemetry && v.telemetry.delayMinutes === 0;
                if (statusFilter === "DELAYED") return v.telemetry && v.telemetry.delayMinutes > 0;
                if (statusFilter === "OFFLINE") return !v.telemetry;
                if (statusFilter === "IDLE") return v.telemetry?.status === "IDLE";
                return true;
            });
        }

        setFilteredVehicles(filtered);
    }, [vehicles, searchQuery, statusFilter]);

    const getStatusBadge = (vehicle: VehicleStatus) => {
        if (!vehicle.telemetry) {
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-zinc-200 text-zinc-600">⚫ OFFLINE</span>;
        }

        if (vehicle.telemetry.status === "IDLE") {
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-zinc-300 text-zinc-700">⚫ IDLE</span>;
        }

        if (vehicle.telemetry.delayMinutes > 0) {
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700">🟡 DELAYED</span>;
        }

        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">🟢 ON-TIME</span>;
    };

    const getTimeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
                        <Bus className="h-6 w-6 text-[var(--secondary-color)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Fleet Tracker</h1>
                        <p className="text-sm text-zinc-500">Real-time vehicle monitoring</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-zinc-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === "list" ? "bg-white shadow text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === "map" ? "bg-white shadow text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Map View
                        </button>
                    </div>

                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            autoRefresh
                                ? "bg-green-100 text-green-700"
                                : "bg-zinc-100 text-zinc-600"
                        )}
                    >
                        <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
                        {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
                    </button>

                    <button
                        onClick={fetchFleetStatus}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-[var(--secondary-color)] text-sm font-medium hover:brightness-110 transition-colors shadow-lg shadow-brand/10"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh Now
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-zinc-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500">Total Vehicles</p>
                            <p className="text-2xl font-bold text-zinc-900">{vehicles.length}</p>
                        </div>
                        <Bus className="h-8 w-8 text-brand" />
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-zinc-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500">On-Time</p>
                            <p className="text-2xl font-bold text-green-600">
                                {vehicles.filter(v => v.telemetry && v.telemetry.delayMinutes === 0).length}
                            </p>
                        </div>
                        <Activity className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-zinc-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500">Delayed</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {vehicles.filter(v => v.telemetry && v.telemetry.delayMinutes > 0).length}
                            </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-zinc-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500">Offline</p>
                            <p className="text-2xl font-bold text-zinc-600">
                                {vehicles.filter(v => !v.telemetry).length}
                            </p>
                        </div>
                        <MapPin className="h-8 w-8 text-zinc-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by registration, route, or driver..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {["ALL", "ON_TIME", "DELAYED", "OFFLINE", "IDLE"].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                statusFilter === filter
                                    ? "bg-brand text-[var(--secondary-color)] shadow-lg shadow-brand/20"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            )}
                        >
                            {filter.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content: List or Map */}
            {viewMode === "list" ? (
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Registration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Route
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Driver
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Delay
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Last Update
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {filteredVehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <Bus className="h-4 w-4 text-zinc-400" />
                                                <span className="font-medium text-zinc-900">{vehicle.registrationNumber}</span>
                                            </div>
                                            {/* AI Insights Labels */}
                                            {(vehicle as any).aiInsights?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(vehicle as any).aiInsights.map((insight: string, idx: number) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
                                                            <Activity className="h-2 w-2" />
                                                            {insight}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                                        {vehicle.routeName || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                                        {vehicle.driverName || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(vehicle)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex flex-col">
                                            {vehicle.telemetry && vehicle.telemetry.delayMinutes > 0 ? (
                                                <>
                                                    <span className="text-yellow-600 font-bold">+{vehicle.telemetry.delayMinutes} min</span>
                                                    <span className="text-[10px] text-zinc-400 italic">Delayed arrival</span>
                                                </>
                                            ) : (
                                                <span className="text-green-600 font-medium">On Track</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                        {vehicle.telemetry ? getTimeSince(vehicle.telemetry.recordedAt) : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => setSelectedVehicle(vehicle.id)}
                                            disabled={!vehicle.telemetry}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                                vehicle.telemetry
                                                    ? "bg-brand text-[var(--secondary-color)] hover:brightness-110 shadow-lg shadow-brand/20"
                                                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                            )}
                                        >
                                            <MapPin className="h-4 w-4" />
                                            Track
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredVehicles.length === 0 && (
                        <div className="p-12 text-center">
                            <Bus className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-500 font-medium">No vehicles found</p>
                            <p className="text-sm text-zinc-400 mt-1">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Map View Mode */
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden h-[600px] shadow-xl">
                    <FleetMapPreview schoolSlug={slug} initialVehicles={filteredVehicles} apiKey={apiKey} />
                </div>
            )}

            {/* Last Update Info */}
            <div className="text-center text-sm text-zinc-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
            </div>

            {/* Map Modal */}
            {selectedVehicle && (
                <VehicleTrackingModal
                    vehicleId={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                    apiKey={apiKey}
                />
            )}
        </div>
    );
}
