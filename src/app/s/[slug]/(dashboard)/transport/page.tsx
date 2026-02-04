"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTransportStatsAction } from "@/app/actions/transport-actions";
import {
    Bus,
    Users,
    MapPin,
    Navigation,
    AlertTriangle,
    Activity,
    Fuel,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

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

    useEffect(() => {
        async function fetchStats() {
            const res = await getTransportStatsAction(slug);
            if (res.success && res.data) {
                setStats(res.data);
            }
        }
        fetchStats();
    }, [slug]);

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Transport Overview</h1>
                    <p className="text-zinc-500">Manage your fleet, routes, and transport operations.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/s/${slug}/transport/vehicles`)}
                        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                        <Bus className="h-4 w-4" />
                        Fleet
                    </button>
                    <button
                        onClick={() => router.push(`/s/${slug}/transport/routes`)}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                    >
                        <Navigation className="h-4 w-4" />
                        Routes
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Vehicles"
                    value={stats.vehicles}
                    icon={Bus}
                    color="blue"
                    subtext="Available in fleet"
                />
                <StatCard
                    label="Active Routes"
                    value={stats.routes}
                    icon={MapPin}
                    color="emerald"
                    subtext="Daily operations"
                />
                <StatCard
                    label="Students"
                    value={stats.studentsOnTransport}
                    icon={Users}
                    color="violet"
                    subtext="Using transport"
                />
                <StatCard
                    label="Drivers"
                    value={stats.drivers}
                    icon={Users}
                    color="amber"
                    subtext="Registered staff"
                />
            </div>

            {/* Live Tracking Mockup */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
                        <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
                        Live Fleet Tracking
                    </h2>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        SYSTEM ACTIVE
                    </span>
                </div>

                {/* Mock Map UI */}
                <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200 group">
                    <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=800x600&maptype=roadmap&style=feature:all|element:labels|visibility:off')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"></div>

                    {/* Simulated Buses */}
                    <div className="absolute top-1/4 left-1/4 animate-bounce duration-[3000ms]">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg ring-4 ring-blue-500/20">
                            <Bus className="h-4 w-4 text-white" />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                Bus 01 • 45km/h
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 animate-bounce duration-[4000ms] delay-75">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg ring-4 ring-emerald-500/20">
                            <Bus className="h-4 w-4 text-white" />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                Van 03 • Stopped
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-1/3 right-1/4 animate-bounce duration-[3500ms] delay-150">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 shadow-lg ring-4 ring-amber-500/20">
                            <Bus className="h-4 w-4 text-white" />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                Bus 05 • 32km/h
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 p-3 backdrop-blur-sm">
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Fleet Status</div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                8 Vehicles Moving
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700">
                                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                2 Stopped
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                1 Issue Reported
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Recent Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-zinc-900">Maintenance Alerts</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 rounded-xl bg-red-50 p-4 border border-red-100">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-900">Bus 04 - Brake Check</h4>
                                <p className="text-sm text-red-700">Scheduled maintenance overdue by 2 days.</p>
                                <button className="mt-2 text-xs font-bold text-red-800 underline">Schedule Service</button>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 rounded-xl bg-amber-50 p-4 border border-amber-100">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
                                <Fuel className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900">Fuel Efficiency Alert</h4>
                                <p className="text-sm text-amber-700">Van 02 reporting lower mileage than average.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-zinc-900">Driver Performance</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((val) => (
                            <div key={val} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold">
                                        JD
                                    </div>
                                    <div>
                                        <div className="font-bold text-zinc-900">John Doe</div>
                                        <div className="text-xs text-zinc-500">Route 1 • North City</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-zinc-900">4.8</span>
                                    <span className="text-amber-400">★</span>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                            View All Drivers
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, subtext }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100"
    };

    return (
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm transition-transform hover:scale-110">
                <Icon className={cn("h-5 w-5", colors[color]?.split(" ")[1] || "text-zinc-900")} />
            </div>
            <div className="text-3xl font-black text-zinc-900">{value}</div>
            <div className="mb-1 text-sm font-bold text-zinc-500">{label}</div>
            <div className="text-xs text-zinc-400">{subtext}</div>
        </div>
    );
}
