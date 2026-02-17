import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Bus,
    MapPin,
    Users,
    AlertCircle,
    TrendingUp,
    DollarSign,
    UserCheck,
    ShieldAlert,
    Clock,
    Zap,
    Navigation,
    ArrowRight,
    Activity
} from "lucide-react";
import Link from "next/link";
import { getTransportDashboardStatsAction } from "@/app/actions/transport-actions";
import { getFleetStatusAction } from "@/app/actions/tracking-actions";
import { cn } from "@/lib/utils";
import FleetMapPreview from "@/components/transport/FleetMapPreview";

export default async function TransportDashboard({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    const statsRes = await getTransportDashboardStatsAction(slug);
    const fleetRes = await getFleetStatusAction(slug);

    if (!statsRes.success || !statsRes.data) {
        return (
            <div className="p-12 text-center bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-900">Dashboard Failed to Load</h2>
                <p className="text-red-600 mt-2">{statsRes.error || "An unexpected error occurred."}</p>
            </div>
        );
    }

    const { finances, fleet, drivers } = statsRes.data;
    const initialFleet = fleetRes.success ? fleetRes.data : [];

    // Additional data for basic stats
    const school = await prisma.school.findUnique({
        where: { slug },
        select: { id: true }
    });

    const pendingRequests = await prisma.studentTransportProfile.count({
        where: { student: { schoolId: school?.id }, status: "PENDING" }
    });

    const activeStudents = await prisma.studentTransportProfile.count({
        where: { student: { schoolId: school?.id }, status: { in: ["APPROVED", "ACTIVE"] } }
    });

    return (
        <div className="p-6 space-y-8 w-full">
            {/* Header with SOS Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Intelligent Transport Dashboard</h1>
                    <p className="text-zinc-500 mt-1 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-brand fill-brand" />
                        AI-powered monitoring enabled
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 group">
                        <ShieldAlert className="h-5 w-5 group-hover:animate-pulse" />
                        EMERGENCY SOS BROADCAST
                    </button>
                    <Link
                        href={`/s/${slug}/transport/fleet/tracking`}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all"
                    >
                        <Navigation className="h-5 w-5" />
                        Live Fleet Map
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Stats and Map */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Core Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-xl shadow-zinc-200/50 bg-gradient-to-br from-white to-zinc-50 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Bus className="h-20 w-20 text-brand" />
                            </div>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-zinc-100">
                                        <Bus className="h-5 w-5 text-brand" />
                                    </div>
                                    <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Fleet Status</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-4xl font-black text-zinc-900">{fleet.active} / {fleet.total}</h3>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter",
                                        fleet.active === fleet.total ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                    )}>
                                        {fleet.active === fleet.total ? "Full Deployment" : "Partial Ops"}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500 font-medium mt-1">Vehicles Active</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl shadow-zinc-200/50 bg-brand text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <DollarSign className="h-20 w-20 text-white" />
                            </div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-white/20">
                                        <DollarSign className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-white/70 uppercase tracking-wider">Revenue Tracking</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-3xl font-black text-white">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(finances.totalCollected)}
                                    </h3>
                                    <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white transition-all duration-500" style={{ width: `${finances.collectionRate}%` }}></div>
                                    </div>
                                    <p className="text-[10px] font-bold mt-2 uppercase text-white/80">{finances.collectionRate.toFixed(1)}% Collected</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* LIVE MAP TRACKING BOX */}
                    <Card className="border-none shadow-2xl shadow-zinc-300/50 overflow-hidden h-[450px]">
                        <CardHeader className="p-4 bg-white border-b border-zinc-100 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-lg font-bold">Live Fleet Mirror</CardTitle>
                                <CardDescription className="text-xs">Real-time GPS synchronization</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black border border-green-100 flex items-center gap-1.5">
                                    <Activity className="h-2.5 w-2.5" />
                                    SYNCED
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 h-[calc(450px-73px)]">
                            <FleetMapPreview schoolSlug={slug} initialVehicles={initialFleet} />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Operations */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-zinc-200/50 bg-zinc-900 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-white/10 text-yellow-500">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Operational Health</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-zinc-400">Delayed Vehicles</p>
                                    <span className={cn(
                                        "text-xl font-black",
                                        fleet.delayed > 0 ? "text-yellow-500" : "text-green-500"
                                    )}>{fleet.delayed}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-zinc-400">Drivers Absent</p>
                                    <span className={cn(
                                        "text-xl font-black",
                                        drivers.absent > 0 ? "text-red-500" : "text-green-500"
                                    )}>{drivers.absent}</span>
                                </div>
                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-500">
                                        <span>AI Analysis Service</span>
                                        <span className="text-green-500">Active</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-500">
                                        <span>Proactive Alerts</span>
                                        <span className="text-green-500">Ready</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-zinc-200/50">
                        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                            <CardTitle className="text-lg">Operations Center</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col gap-2">
                            {[
                                { name: "Route Planning", href: `/s/${slug}/transport/route/routes`, icon: Navigation, desc: "Optimize Paths" },
                                { name: "Vehicles & Docs", href: `/s/${slug}/transport/fleet/vehicles`, icon: Bus, desc: "Compliance Check" },
                                { name: "Driver Scorecards", href: `/s/${slug}/transport/fleet/drivers`, icon: Users, desc: "Safety Metrics" },
                                { name: "Full Tracking", href: `/s/${slug}/transport/fleet/tracking`, icon: NavPosition, desc: "Global Control" },
                            ].map((action) => (
                                <Link
                                    key={action.name}
                                    href={action.href}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all group"
                                >
                                    <div className="p-2.5 rounded-lg bg-zinc-100 group-hover:bg-brand group-hover:text-white transition-colors">
                                        <action.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 leading-tight">{action.name}</p>
                                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tight">{action.desc}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 ml-auto text-zinc-300 transition-all group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function NavPosition(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            <path d="m13 13 9 9" />
        </svg>
    )
}
