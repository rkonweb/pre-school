"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getTransportDashboardDataAction,
    getRoutesAction
} from "@/app/actions/transport-actions";
import {
    Bus,
    Users,
    User,
    Navigation,
    AlertTriangle,
    Activity,
    Fuel,
    Star,
    ArrowUpRight,
    Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveTelemetryMap } from "@/components/transport/LiveTelemetryMap";

export default function TransportDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [stats, setStats] = useState({
        vehicles: 0,
        drivers: 0,
        routes: 0,
        studentsOnTransport: 0
    });
    const [routes, setRoutes] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [topDrivers, setTopDrivers] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            const [dashRes, routesRes] = await Promise.all([
                import("@/app/actions/transport-actions").then(m => m.getTransportDashboardDataAction(slug)),
                import("@/app/actions/transport-actions").then(m => m.getRoutesAction(slug))
            ]);

            if (dashRes.success && dashRes.data) {
                setStats(dashRes.data.stats);
                setAlerts(dashRes.data.alerts);
                setTopDrivers(dashRes.data.topDrivers);
            }
            if (routesRes.success && routesRes.data) {
                setRoutes(routesRes.data);
            }
        }
        fetchData();
    }, [slug]);

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        Transport Dashboard
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium mt-1">
                        Manage your school's transport system and track vehicles in real-time.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/s/${slug}/transport/vehicles`)}
                        className="h-12 px-6 rounded-2xl border border-zinc-200 bg-white text-[10px] font-black uppercase tracking-[2px] text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-900 active:scale-95 flex items-center gap-2"
                    >
                        <Bus className="h-4 w-4" />
                        Vehicles
                    </button>
                    <button
                        onClick={() => router.push(`/s/${slug}/transport/routes`)}
                        className="h-12 px-8 rounded-2xl bg-blue-600 text-[10px] font-black uppercase tracking-[2px] text-white shadow-xl shadow-zinc-200 transition-all hover:bg-black hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                    >
                        <Navigation className="h-4 w-4" />
                        Routes
                    </button>
                </div>
            </div>

            {/* Global StatCard Integration */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Vehicles"
                    value={stats.vehicles.toString()}
                    subValue="Fleet size"
                    icon={Bus}
                    color="brand"
                />
                <StatCard
                    title="Students"
                    value={stats.studentsOnTransport.toString()}
                    subValue="Using transport"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Total Routes"
                    value={stats.routes.toString()}
                    subValue="Active tracks"
                    icon={Navigation}
                    color="purple"
                />
                <StatCard
                    title="Total Drivers"
                    value={stats.drivers.toString()}
                    subValue="Registered drivers"
                    icon={User}
                    color="orange"
                />
            </div>

            {/* Operational Intelligence Layer */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Live Telemetry Map - Integrated Component */}
                <LiveTelemetryMap routes={routes} stats={stats} />

                {/* Tactical Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* System Alerts */}
                    <div className="bg-white rounded-[40px] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/40 dark:bg-zinc-950 dark:border-zinc-800">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-[20px] bg-red-50 flex items-center justify-center dark:bg-red-500/10">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Transport Alerts</h3>
                        </div>

                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="p-8 rounded-[28px] border-2 border-dashed border-zinc-100/50 flex flex-col items-center justify-center text-center">
                                    <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                        <Wifi className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed">All systems normal: No pending alerts or issues found.</p>
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <div key={alert.id} className="p-6 rounded-[28px] bg-red-50/50 border border-red-100 group cursor-pointer hover:bg-red-50 transition-all dark:bg-red-500/5 dark:border-red-500/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="px-3 py-1 bg-white rounded-full text-[9px] font-black text-red-600 uppercase tracking-widest shadow-sm ring-1 ring-red-100 dark:bg-zinc-900 dark:ring-red-900/30">
                                                {alert.type}
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-red-300 group-hover:text-red-500 transition-colors" />
                                        </div>
                                        <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight dark:text-zinc-100">{alert.title}</h4>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Vehicle: {alert.asset} • Expires: {new Date(alert.date).toLocaleDateString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Personnel Activity */}
                    <div className="bg-white rounded-[40px] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/40 dark:bg-zinc-950 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-[20px] bg-orange-50 flex items-center justify-center dark:bg-orange-500/10">
                                    <Star className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Top Drivers</h3>
                            </div>
                            <button className="text-[10px] font-black text-brand uppercase tracking-widest hover:bg-brand/5 px-3 py-1.5 rounded-xl transition-all">View All</button>
                        </div>

                        <div className="space-y-3">
                            {topDrivers.length === 0 ? (
                                <div className="p-6 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed">
                                    No driver activity data available.
                                </div>
                            ) : (
                                topDrivers.map((driver, idx) => (
                                    <div key={driver.id} className="flex items-center justify-between p-4 rounded-[24px] hover:bg-zinc-50 group cursor-pointer transition-all dark:hover:bg-zinc-900">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-[20px] bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg relative overflow-hidden group-hover:scale-105 transition-all">
                                                {driver.name.split(' ').map((n: string) => n[0]).join('')}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-zinc-900 group-hover:text-brand transition-colors uppercase dark:text-zinc-100">
                                                    {driver.name}
                                                </p>
                                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Active Driver • Rank {idx + 1}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-black text-zinc-900 text-xs dark:text-zinc-300">
                                            4.{9 - idx} <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
