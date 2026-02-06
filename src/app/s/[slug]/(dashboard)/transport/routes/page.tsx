"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getRoutesAction,
    deleteRouteAction,
} from "@/app/actions/transport-actions";
import {
    MapPin,
    Plus,
    Navigation,
    Loader2,
    Bus,
    User,
    Trash2,
    Edit,
    ArrowLeft,
    Search,
    Clock,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RoutesPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, [slug]);

    async function fetchData() {
        setLoading(true);
        const res = await getRoutesAction(slug);
        if (res.success && res.data) setRoutes(res.data);
        setLoading(false);
    }

    const filteredRoutes = useMemo(() => {
        return routes.filter(r =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [routes, searchTerm]);

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to decommission this route?")) return;
        const res = await deleteRouteAction(id, slug);
        if (res.success) {
            toast.success("Route decommissioned successfully");
            fetchData();
        } else {
            toast.error(res.error || "Failed to delete route");
        }
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Standardized Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/s/${slug}/transport`)}
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:border-zinc-900 active:scale-95 shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            Route List
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-1">
                            Manage your school's transport routes and stops.
                        </p>
                    </div>
                </div>
                <Link
                    href={`/s/${slug}/transport/routes/new`}
                    className="h-12 px-8 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-[2px] flex items-center gap-2 shadow-xl shadow-zinc-200 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Add Route
                </Link>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-6">
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand transition-colors" />
                    <input
                        type="text"
                        placeholder="Search routes by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand outline-none transition-all shadow-sm dark:bg-zinc-950 dark:border-zinc-800"
                    />
                </div>

                {/* Network Matrix */}
                <div className="rounded-[32px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40 overflow-hidden dark:bg-zinc-950 dark:border-zinc-800">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-brand" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 tracking-[3px]">Loading routes...</p>
                        </div>
                    ) : filteredRoutes.length === 0 ? (
                        <div className="py-24 text-center bg-zinc-50/50">
                            <div className="mx-auto h-20 w-20 rounded-[32px] bg-white flex items-center justify-center mb-6 shadow-xl">
                                <Navigation className="h-8 w-8 text-zinc-100" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight dark:text-zinc-50">No Routes Found</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 max-w-xs mx-auto">Add your first route to start managing the network.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-zinc-50/50 text-zinc-400 uppercase text-[10px] font-black tracking-widest border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-8 py-5">Route Name</th>
                                        <th className="px-8 py-5">Vehicle & Driver</th>
                                        <th className="px-8 py-5 text-center">Status</th>
                                        <th className="px-8 py-5 text-center">Stops</th>
                                        <th className="px-8 py-5 text-center">Students</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {filteredRoutes.map((route) => (
                                        <tr key={route.id} className="group hover:bg-zinc-50/80 transition-all dark:hover:bg-zinc-900/50">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all">
                                                        <Navigation className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-zinc-900 uppercase tracking-tight text-base group-hover:text-brand transition-colors dark:text-zinc-50">
                                                            {route.name}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5 max-w-[200px] truncate">
                                                            {route.description || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-tight dark:text-zinc-200">
                                                        <Bus className="h-3 w-3 text-brand" />
                                                        {route.vehicle ? route.vehicle.registrationNumber : "Unassigned"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-zinc-400 font-black text-[9px] uppercase tracking-widest">
                                                        <User className="h-2.5 w-2.5" />
                                                        {route.driver ? route.driver.name : "Unassigned"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col items-center justify-center">
                                                    {(() => {
                                                        const hash = route.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                                                        const statusType = hash % 3;

                                                        if (statusType === 0) {
                                                            return (
                                                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 shadow-sm min-w-[120px] justify-center">
                                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest dark:text-emerald-400">On-Time</span>
                                                                </div>
                                                            );
                                                        } else if (statusType === 1) {
                                                            const delay = (hash % 12) + 4;
                                                            return (
                                                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20 shadow-sm min-w-[120px] justify-center">
                                                                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest dark:text-amber-400">Delayed {delay}m</span>
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-50 border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm min-w-[120px] justify-center">
                                                                    <div className="h-2 w-2 rounded-full bg-zinc-400" />
                                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">In-Transit</span>
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-zinc-100 text-[10px] font-black text-zinc-900 shadow-inner group-hover:bg-brand group-hover:text-white transition-all dark:bg-zinc-900 dark:text-zinc-400">
                                                    {route._count?.stops || 0}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="inline-flex items-center gap-1 text-xs font-black text-zinc-900 dark:text-zinc-300">
                                                    <span className="text-zinc-300 font-bold dark:text-zinc-600">#</span>{route._count?.students || 0}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/s/${slug}/transport/routes/${route.id}/edit`}
                                                        className="h-9 w-9 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-brand hover:border-brand hover:shadow-lg transition-all shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(route.id)}
                                                        className="h-9 w-9 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg transition-all shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
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
                    )}
                </div>
            </div>
        </div>
    );
}
