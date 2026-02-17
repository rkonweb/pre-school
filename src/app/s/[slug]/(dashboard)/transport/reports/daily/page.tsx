'use server';

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Clock,
    Navigation,
    Calendar,
    Bus,
    Zap,
    AlertCircle,
    CheckCircle2,
    MapPin,
    ArrowRight,
    RefreshCw,
    History
} from "lucide-react";
import { getTransportDailyReportsAction, syncDailyLogsAction } from "@/app/actions/report-actions";
import { cn } from "@/lib/utils";
import SyncLogsButton from "@/components/transport/SyncLogsButton";
import ReportTabs from "@/components/transport/ReportTabs";

export default async function DailyReportsPage({ params, searchParams }: {
    params: { slug: string },
    searchParams: { date?: string, vehicleId?: string }
}) {
    const { slug } = params;
    const dateStr = searchParams.date || new Date().toISOString().split('T')[0];
    const vehicleId = searchParams.vehicleId;

    const reportsRes = await getTransportDailyReportsAction(slug, { date: dateStr, vehicleId });
    const reports = reportsRes.success ? reportsRes.data : [];

    // Get all vehicles for the filter
    const vehicles = await prisma.transportVehicle.findMany({
        where: { school: { slug } },
        select: { id: true, registrationNumber: true, model: true }
    });

    return (
        <div className="p-6 space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Daily Performance</h1>
                    <p className="text-zinc-500 mt-1 flex items-center gap-2">
                        <History className="h-4 w-4 text-brand" />
                        Telemetry-based fleet analytics for {new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'full' })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <SyncLogsButton slug={slug} currentDate={dateStr} />
                </div>
            </div>

            <ReportTabs slug={slug} />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <input
                        type="date"
                        defaultValue={dateStr}
                        className="bg-transparent border-none text-sm font-bold text-zinc-900 outline-none focus:ring-0"
                    />
                </div>
                <div className="h-6 w-px bg-zinc-200 hidden md:block" />
                <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-zinc-400" />
                    <select className="bg-transparent border-none text-sm font-bold text-zinc-900 outline-none focus:ring-0 appearance-none pr-8">
                        <option value="">All Vehicles</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Daily Logs Content */}
            <div className="grid grid-cols-1 gap-8">
                {reports.length > 0 ? reports.map((log: any) => (
                    <Card key={log.id} className="border-none shadow-xl shadow-zinc-200/50 overflow-hidden group">
                        <div className="grid grid-cols-1 lg:grid-cols-4">
                            {/* Vehicle Sidebar Info */}
                            <div className="bg-zinc-900 text-white p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/10 rounded-xl">
                                        <Bus className="h-6 w-6 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black leading-tight">{log.vehicle?.registrationNumber}</h3>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{log.vehicle?.model}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-400 font-medium">Start Time</span>
                                        <span className="text-sm font-bold">{log.startTime ? new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-400 font-medium">End Time</span>
                                        <span className="text-sm font-bold">{log.endTime ? new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-zinc-400 font-medium">Total Distance</span>
                                        <span className="text-lg font-black text-brand">{log.totalDistance.toFixed(1)} km</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase">Driving Score</span>
                                        <span className="text-xs font-black text-green-400">{log.efficiencyScore}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 transition-all" style={{ width: `${log.efficiencyScore}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Stop Analysis */}
                            <div className="lg:col-span-3 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h4 className="text-xl font-black text-zinc-900">Stop Arrival Analysis</h4>
                                        <p className="text-sm text-zinc-500">Actual vs Scheduled synchronization</p>
                                    </div>
                                    <div className="px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-600 uppercase tracking-widest border border-zinc-200">
                                        {log.stopLogs.length} Points Tracked
                                    </div>
                                </div>

                                <div className="space-y-6 relative ml-4">
                                    <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-zinc-100 -ml-4" />

                                    {log.stopLogs.length > 0 ? log.stopLogs.map((stopLog: any, idx: number) => (
                                        <div key={stopLog.id} className="relative flex items-center justify-between group/row">
                                            {/* Connector point */}
                                            <div className={cn(
                                                "absolute left-0 h-3 w-3 rounded-full -ml-[21.5px] border-2 border-white shadow-sm ring-4 transition-all",
                                                stopLog.delayMinutes > 5 ? "bg-red-500 ring-red-50" : "bg-green-500 ring-green-50"
                                            )} />

                                            <div className="flex flex-col">
                                                <p className="text-sm font-black text-zinc-900">{stopLog.stop?.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase">
                                                        <Clock className="h-3 w-3" />
                                                        Sched: {stopLog.scheduledArrival}
                                                    </div>
                                                    <ArrowRight className="h-3 w-3 text-zinc-300" />
                                                    <div className={cn(
                                                        "flex items-center gap-1 text-[10px] font-black uppercase",
                                                        stopLog.delayMinutes > 5 ? "text-red-600" : "text-green-600"
                                                    )}>
                                                        <Navigation className="h-3 w-3" />
                                                        Actual: {new Date(stopLog.actualArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {stopLog.delayMinutes > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                            stopLog.delayMinutes > 5 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                                        )}>
                                                            {stopLog.delayMinutes}M Delay
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-tight">On Time</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                                            <MapPin className="h-10 w-10 mb-2" />
                                            <p className="text-sm font-medium italic">No stop arrival data captured for this route segment</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                )) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-6 bg-zinc-50 rounded-full text-zinc-200">
                            <Activity className="h-16 w-16" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">No Reports Found</h2>
                            <p className="text-zinc-500 max-w-sm mx-auto mt-2 font-medium">
                                We couldn't find any performance logs for this date. Ensure vehicles were active and telemetry sync is configured.
                            </p>
                        </div>
                        <SyncLogsButton slug={slug} currentDate={dateStr} />
                    </div>
                )}
            </div>
        </div>
    );
}

function Activity(props: any) {
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
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
