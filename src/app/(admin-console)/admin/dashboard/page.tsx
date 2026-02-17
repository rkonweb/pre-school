"use client";

import {
    BarChart3,
    Users,
    Globe,
    TrendingUp,
    Activity,
    AlertCircle,
    MoreVertical,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSuperAdminData } from "@/context/super-admin-context";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboardPage() {
    const { stats, recentSchools, isLoading } = useSuperAdminData();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Tenants",
            value: stats?.totalTenants.toString() || "0",
            sub: "Registered Schools",
            icon: Globe,
            color: "blue"
        },
        {
            title: "Monthly Revenue",
            value: `₹${stats?.monthlyRevenue.toLocaleString() || "0"}`,
            sub: "Estimated",
            icon: TrendingUp,
            color: "green"
        },
        {
            title: "Total Students",
            value: stats?.totalStudents.toLocaleString() || "0",
            sub: "Global enrollment",
            icon: Users,
            color: "indigo"
        },
        {
            title: "System Incidents",
            value: stats?.systemIncidents.toString() || "0",
            sub: "Active Alerts",
            icon: AlertCircle,
            color: "rose"
        },
    ];

    return (
        <div className="p-8 space-y-8 bg-zinc-50/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">Command Center</h1>
                    <p className="text-zinc-500 font-medium">System performance and global metrics.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">System Operational</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-zinc-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
                        <div className={cn(
                            "absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110",
                            `text-${stat.color}-600`
                        )}>
                            <stat.icon className="h-24 w-24" />
                        </div>

                        <div className="relative z-10">
                            <div className={cn(
                                "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                                stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                                    stat.color === "green" ? "bg-green-50 text-green-600" :
                                        stat.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
                                            "bg-rose-50 text-rose-600"
                            )}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500">{stat.title}</p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-zinc-900">{stat.value}</h3>
                                <span className={cn(
                                    "text-xs font-bold",
                                    stat.color === "rose" ? "text-rose-600" : "text-emerald-600"
                                )}>
                                    {stat.sub}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm border border-zinc-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-xl text-zinc-900 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-zinc-400" />
                            Platform Usage Activity
                        </h3>
                        <select className="rounded-lg border-zinc-200 text-sm font-medium text-zinc-600 focus:ring-blue-500">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="h-64 w-full flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50">
                        <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">Real-time Analytics Graph Integration Pending</p>
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-sm border border-zinc-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl text-zinc-900">Recent Growth</h3>
                        <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentSchools.length === 0 ? (
                            <p className="text-sm text-zinc-400 font-medium">No schools registered yet.</p>
                        ) : (
                            recentSchools.map((school, i) => (
                                <div key={school.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs text-white"
                                            style={{ backgroundColor: school.brandColor || "#2563eb" }}
                                        >
                                            {school.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-zinc-900 group-hover:text-blue-600 transition-colors truncate max-w-[120px]">
                                                {school.name}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {formatDistanceToNow(new Date(school.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-1 rounded-full border",
                                            "bg-emerald-50 text-emerald-600 border-emerald-100" // Defaulting to Active for simplicity
                                        )}>
                                            Active
                                        </span>
                                        <ArrowUpRight className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
