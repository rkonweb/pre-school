'use server';

import { prisma } from "@/lib/prisma";
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
    History,
    Activity as ActivityIcon
} from "lucide-react";
import { getTransportDailyReportsAction, syncDailyLogsAction } from "@/app/actions/report-actions";
import { cn } from "@/lib/utils";
import SyncLogsButton from "@/components/transport/SyncLogsButton";
import ReportTabs from "@/components/transport/ReportTabs";
import { SectionHeader, ErpCard, StatusChip, tableStyles, C } from "@/components/ui/erp-ui";

export default async function DailyReportsPage(props: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ date?: string, vehicleId?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { slug } = params;
    const dateStr = searchParams.date || new Date().toISOString().split('T')[0];
    const vehicleId = searchParams.vehicleId;

    const reportsRes = await getTransportDailyReportsAction(slug, { date: dateStr, vehicleId });
    const reports = reportsRes.success && reportsRes.data ? reportsRes.data : [];

    // Get all vehicles for the filter
    const vehicles = await prisma.transportVehicle.findMany({
        where: { school: { slug } },
        select: { id: true, registrationNumber: true, model: true }
    });

    return (
        <div className="p-8 space-y-10 w-full mb-20">
            <SectionHeader
                title="Daily Fleet Analytics"
                subtitle={`Telemetry-based performance metrics for ${new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'full' })}`}
                icon={<History size={18} color={C.amber} />}
                action={<SyncLogsButton slug={slug} currentDate={dateStr} />}
            />

            <ReportTabs slug={slug} />

            {/* Filters Matrix */}
            <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-zinc-100">
                <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-brand" />
                    <input
                        type="date"
                        defaultValue={dateStr}
                        aria-label="Select Target Date"
                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-900 outline-none focus:ring-0"
                    />
                </div>
                <div className="h-6 w-px bg-zinc-100 hidden md:block" />
                <div className="flex items-center gap-3">
                    <Bus className="h-4 w-4 text-brand" />
                    <select
                        aria-label="Filter by Asset"
                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-900 outline-none focus:ring-0 appearance-none pr-8 cursor-pointer"
                    >
                        <option value="">Scan All Assets</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Daily Logs Content */}
            <div className="grid grid-cols-1 gap-10">
                {(reports || []).length > 0 ? (reports || []).map((log: any) => (
                    <ErpCard key={log.id} noPad className="!rounded-[40px] border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden group">
                        <div className="grid grid-cols-1 lg:grid-cols-4">
                            {/* Asset Sidebar Info */}
                            <div className="bg-zinc-900 text-white p-8 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white/10 rounded-2xl shadow-inner">
                                        <Bus className="h-6 w-6 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black leading-tight tracking-tight uppercase">{log.vehicle?.registrationNumber}</h3>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">{log.vehicle?.model}</p>
                                    </div>
                                </div>

                                <div className="space-y-5 pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Session Start</span>
                                        <span className="text-sm font-bold">{log.startTime ? new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Session End</span>
                                        <span className="text-sm font-bold">{log.endTime ? new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4">
                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Total Traverse</span>
                                        <span className="text-2xl font-black text-brand tracking-tighter">{log.totalDistance.toFixed(1)} <span className="text-xs">KM</span></span>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/5 rounded-[28px] border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Efficiency Index</span>
                                        <span className="text-xs font-black text-brand">{log.efficiencyScore}%</span>
                                    </div>
                                    <div
                                        className="h-full bg-brand transition-all shadow-[0_0_10px_rgba(255,107,0,0.4)] w-[var(--efficiency)]"
                                        style={{ '--efficiency': `${log.efficiencyScore}%` } as React.CSSProperties}
                                    />
                                </div>
                            </div>

                            {/* Node Synchronization Analysis */}
                            <div className="lg:col-span-3 p-10 bg-white">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h4 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Node Sync Matrix</h4>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Operational vs Scheduled telemetry</p>
                                    </div>
                                    <div className="px-5 py-2 bg-zinc-50 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] border border-zinc-100">
                                        {log.stopLogs.length} Sync Points Detected
                                    </div>
                                </div>

                                <div className="space-y-8 relative ml-6">
                                    <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-zinc-50 -ml-6" />

                                    {log.stopLogs.length > 0 ? log.stopLogs.map((stopLog: any, idx: number) => (
                                        <div key={stopLog.id} className="relative flex items-center justify-between group/row">
                                            {/* Connector point */}
                                            <div className={cn(
                                                "absolute left-0 h-4 w-4 rounded-full -ml-[25px] border-4 border-white shadow-md transition-all",
                                                stopLog.delayMinutes > 5 ? "bg-red-500 shadow-red-200" : "bg-brand shadow-orange-100"
                                            )} />

                                            <div className="flex flex-col">
                                                <p className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">{stopLog.stop?.name}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-tight">
                                                        <Clock className="h-3 w-3" />
                                                        ST: {stopLog.scheduledArrival}
                                                    </div>
                                                    <ArrowRight className="h-3 w-3 text-zinc-200" />
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tight",
                                                        stopLog.delayMinutes > 5 ? "text-red-500" : "text-brand"
                                                    )}>
                                                        <Navigation className="h-3 w-3" />
                                                        OT: {new Date(stopLog.actualArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {stopLog.delayMinutes > 0 ? (
                                                    <StatusChip label={stopLog.delayMinutes > 5 ? "Delayed" : "Late"} />
                                                ) : (
                                                    <StatusChip label="OnTime" />
                                                )}
                                                {stopLog.delayMinutes > 0 && (
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        stopLog.delayMinutes > 5 ? "text-red-600" : "text-amber-500"
                                                    )}>
                                                        {stopLog.delayMinutes}M
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                                            <MapPin className="h-12 w-12 mb-4 text-zinc-300" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px]">Node synchronization data missing for this segment</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ErpCard>
                )) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-zinc-50/50 rounded-[40px] border-2 border-dashed border-zinc-100">
                        <div className="p-10 bg-white rounded-[32px] shadow-sm text-zinc-200 ring-1 ring-zinc-50">
                            <ActivityIcon className="h-20 w-20" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">No Telemetry Logs</h2>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest max-w-sm mx-auto italic">
                                Zero operational data detected for the selected period. Ensure asset tracking is active.
                            </p>
                        </div>
                        <SyncLogsButton slug={slug} currentDate={dateStr} />
                    </div>
                )}
            </div>
        </div>
    );
}
