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
import { SectionHeader, tableStyles, StatusChip, Btn } from "@/components/ui/erp-ui";

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
        if (!vehicle.telemetry) return <StatusChip label="Closed" />; // Closed gives gray styling
        if (vehicle.telemetry.status === "IDLE") return <StatusChip label="Draft" />; // Draft gives blue styling
        if (vehicle.telemetry.delayMinutes > 0) return <StatusChip label="Delayed" />;
        return <StatusChip label="OnTime" />;
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
        <div className="space-y-6">
            <SectionHeader
                title="Fleet Tracker"
                subtitle="Real-time vehicle monitoring"
                icon={Bus}
                action={
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
                }
            />

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
                <div className={cn(tableStyles.container, "bg-white overflow-hidden shadow-xl shadow-zinc-200/40")}>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-left">
                                    <th className="px-6 py-5">Registration</th>
                                    <th className="px-6 py-5">Route</th>
                                    <th className="px-6 py-5">Driver</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5">Delay</th>
                                    <th className="px-6 py-5">Last Update</th>
                                    <th className="px-6 py-5">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.map((vehicle, i) => (
                                    <tr
                                        key={vehicle.id}
                                        className={cn(
                                            "group transition-all duration-200 border-b border-zinc-50 last:border-0",
                                            i % 2 === 0 ? "bg-white" : "bg-zinc-50/20",
                                            "hover:bg-amber-50/50"
                                        )}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200/50 shadow-sm shrink-0">
                                                        <Bus className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-black text-zinc-900 uppercase tracking-tight text-sm">{vehicle.registrationNumber}</span>
                                                </div>
                                                {/* AI Insights Labels */}
                                                {(vehicle as any).aiInsights?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {(vehicle as any).aiInsights.map((insight: string, idx: number) => (
                                                            <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100 shadow-sm shadow-purple-200/50">
                                                                <Activity className="h-2 w-2" />
                                                                {insight}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-zinc-900 uppercase tracking-widest bg-zinc-100/50 px-2 py-1 rounded-lg border border-zinc-200/30">{vehicle.routeName || "No Route"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-zinc-600">{vehicle.driverName || "Unassigned"}</span>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(vehicle)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                {vehicle.telemetry && vehicle.telemetry.delayMinutes > 0 ? (
                                                    <>
                                                        <span className="text-rose-600 font-black uppercase tracking-widest text-[10px]">+{vehicle.telemetry.delayMinutes} MIN</span>
                                                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-tight italic mt-0.5">Delayed arrival</span>
                                                    </>
                                                ) : (
                                                    <span className="text-emerald-600 font-black uppercase tracking-widest text-[10px]">ON MISSION</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-md">
                                                {vehicle.telemetry ? getTimeSince(vehicle.telemetry.recordedAt) : "OFFLINE"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Btn
                                                size="sm"
                                                variant="primary"
                                                onClick={() => setSelectedVehicle(vehicle.id)}
                                                disabled={!vehicle.telemetry}
                                                icon={MapPin}
                                            >
                                                Track
                                            </Btn>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredVehicles.length === 0 && (
                        <div className="p-24 text-center">
                            <div className="mx-auto h-20 w-20 rounded-[32px] bg-zinc-50 flex items-center justify-center mb-6">
                                <Bus className="h-8 w-8 text-zinc-200" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Zero Presence</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed italic spacing-wider">No active missions matching your filters.</p>
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
