import { prisma } from "@/lib/prisma";
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
    Activity,
    MoreHorizontal,
    Globe,
    Gauge,
    LayoutDashboard,
    Plane,
    Wallet,
    Calendar,
    Settings,
    ChevronRight,
    Search
} from "lucide-react";
import Link from "next/link";
import { getTransportDashboardStatsAction } from "@/app/actions/transport-actions";
import { getFleetStatusAction } from "@/app/actions/tracking-actions";
import { cn } from "@/lib/utils";
import FleetMapPreview from "@/components/transport/FleetMapPreview";
import { SectionHeader, ErpCard, Btn, StatusChip, ErpInput, C } from "@/components/ui/erp-ui";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";

export default async function TransportDashboard(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const slug = params.slug;
    const statsRes = await getTransportDashboardStatsAction(slug);
    const fleetRes = await getFleetStatusAction(slug);

    if (!statsRes.success || !statsRes.data) {
        return (
            <div className="p-12 text-center bg-red-50/50 rounded-[40px] border-2 border-dashed border-red-100 flex flex-col items-center">
                <div className="p-8 bg-white rounded-[32px] shadow-sm mb-6 ring-4 ring-red-50">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-red-900 uppercase tracking-tight">Telemetry Handshake Failed</h2>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-3 underline decoration-red-200 decoration-2 underline-offset-4">{statsRes.error || "Operational timeout or missing protocol parameters."}</p>
                <Link href={`/s/${slug}/transport`} className="mt-10">
                    <Btn variant="destructive">RETRY HANDSHAKE</Btn>
                </Link>
            </div>
        );
    }

    const { finances, fleet, drivers } = statsRes.data;
    const initialFleet = fleetRes.success && fleetRes.data ? fleetRes.data : [];

    const school = await prisma.school.findUnique({
        where: { slug },
        select: { id: true, googleMapsApiKey: true, currency: true }
    });

    const currencySymbol = school?.currency || 'INR';

    const [pendingRequests, activeStudents] = await Promise.all([
        prisma.studentTransportProfile.count({
            where: { student: { schoolId: school?.id }, status: "PENDING" }
        }),
        prisma.studentTransportProfile.count({
            where: { student: { schoolId: school?.id }, status: { in: ["APPROVED", "ACTIVE"] } }
        })
    ]);

    return (
        <div className="p-8 space-y-12 w-full mb-24">
            {/* Header Matrix */}
            <SectionHeader
                title="Logistics Command Center"
                subtitle="Intelligent fleet orchestration and real-time telemetry matrix enabled."
                icon={<LayoutDashboard size={18} color={C.amber} />}
                action={
                    <div className="flex items-center gap-4">
                        <Link href={`/s/${slug}/transport/fleet/tracking`}>
                            <Btn
                                icon={<Globe size={18} />}
                                className="!rounded-[20px] shadow-2xl shadow-brand/40"
                            >
                                LIVE FLEET MIRROR
                            </Btn>
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="p-3.5 rounded-2xl border-1.5 border-zinc-200 bg-white text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm"
                                    aria-label="Access Advanced Operations"
                                >
                                    <MoreHorizontal className="h-6 w-6" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-3 rounded-[28px] border-zinc-100 shadow-2xl">
                                <DropdownMenuItem asChild>
                                    <Link href={`/s/${slug}/transport/route/routes`} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-zinc-50 font-black text-[10px] uppercase tracking-widest text-zinc-900 cursor-pointer">
                                        <div className="p-2 bg-zinc-100 rounded-lg"><Navigation className="h-4 w-4" /></div>
                                        Corridor Optimization
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/s/${slug}/settings/fees`} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-zinc-50 font-black text-[10px] uppercase tracking-widest text-zinc-900 cursor-pointer">
                                        <div className="p-2 bg-zinc-100 rounded-lg"><DollarSign className="h-4 w-4" /></div>
                                        Tariff Calibration
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Visual Telemetry Stream */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ErpCard noPad className="!rounded-[40px] border-zinc-100 p-10 shadow-2xl shadow-zinc-200/50 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Bus className="h-64 w-64 text-zinc-900" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-900/40">
                                        <Gauge className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Fleet Saturation</p>
                                        <StatusChip label={fleet.active === fleet.total ? "Approved" : "Partial"} />
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <h3 className="text-6xl font-black text-zinc-900 tracking-tighter tabular-nums leading-none">
                                        {fleet.active}<span className="text-2xl text-zinc-300 mx-2">/</span>{fleet.total}
                                    </h3>
                                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mt-4 flex items-center gap-2">
                                        <Bus className="h-4 w-4 text-brand" /> Active Assets In Deployment
                                    </p>
                                </div>
                            </div>
                        </ErpCard>

                        <ErpCard noPad className="!rounded-[40px] border-none bg-zinc-900 text-white p-10 shadow-2xl shadow-zinc-900/30 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 flex flex-col gap-1 items-end">
                                <DollarSign className="h-16 w-16 text-brand" />
                                <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand w-[var(--p)]" style={{ '--p': `${finances.collectionRate}%` } as React.CSSProperties} />
                                </div>
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 text-brand flex items-center justify-center border border-white/10 shadow-inner">
                                        <Wallet className="h-7 w-7" />
                                    </div>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Revenue Integrity Index</p>
                                </div>
                                <div className="mt-auto">
                                    <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-6">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencySymbol, maximumFractionDigits: 0 }).format(finances.totalCollected)}
                                    </h3>
                                    <div className="flex items-center gap-5">
                                        <div className="px-4 py-2 bg-emerald-500/10 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                                            {finances.collectionRate.toFixed(1)}% Realized
                                        </div>
                                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic opacity-60">
                                            Target: {currencySymbol}920K
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ErpCard>
                    </div>

                    {/* LIVE TRACKING INTERFACE */}
                    <ErpCard noPad className="!rounded-[50px] border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden group h-[550px]">
                        <div className="absolute top-6 left-6 z-20 space-y-3">
                            <div className="bg-white/90 backdrop-blur-md shadow-2xl border border-zinc-200/50 rounded-[28px] px-6 py-4 flex items-center gap-4 group/chip hover:scale-105 transition-all">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 leading-none">Global Sync Active</span>
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">Satellite Handshake Integrity 99.2%</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-full relative z-0">
                            <FleetMapPreview schoolSlug={slug} initialVehicles={initialFleet} apiKey={school?.googleMapsApiKey || ""} />
                        </div>
                    </ErpCard>
                </div>

                {/* Logistics Intelligence Sidebar */}
                <div className="space-y-10">
                    <ErpCard className="!rounded-[40px] border-none bg-zinc-50 p-10 flex flex-col gap-8 shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white text-brand flex items-center justify-center shadow-sm border border-zinc-100">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <h4 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Health Status</h4>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Telemetry Lag</p>
                                <span className={cn(
                                    "text-lg font-black tabular-nums",
                                    fleet.delayed > 0 ? "text-brand" : "text-emerald-500"
                                )}>{fleet.delayed} <span className="text-[10px] tracking-normal font-black opacity-40 ml-1 italic">VHC</span></span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pilot Absence</p>
                                <span className={cn(
                                    "text-lg font-black tabular-nums",
                                    drivers.absent > 0 ? "text-red-500" : "text-emerald-500"
                                )}>{drivers.absent} <span className="text-[10px] tracking-normal font-black opacity-40 ml-1 italic">PLT</span></span>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-zinc-200">
                            <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">
                                <span>AI Risk Analysis</span>
                                <span className="text-brand font-black">LOW THREAT</span>
                            </div>
                        </div>
                    </ErpCard>

                    <div className="grid grid-cols-1 gap-6">
                        {[
                            { name: "Global Corridor Sync", href: `/s/${slug}/transport/route/routes`, icon: Navigation, tags: "Routes & Stops" },
                            { name: "Strategic Asset Ledger", href: `/s/${slug}/transport/fleet/vehicles`, icon: Bus, tags: "Fleet Inventory" },
                            { name: "Pilot Cert Records", href: `/s/${slug}/transport/fleet/drivers`, icon: Users, tags: "Driver Intelligence" },
                            { name: "Passenger Registry", href: `/s/${slug}/transport/students`, icon: UserCheck, tags: "Student Manifest" },
                            { name: "Financial Telemetery", href: `/s/${slug}/transport/fees`, icon: Activity, tags: "Economic Impact" },
                            { name: "Strategic Control", href: `/s/${slug}/transport/fleet/tracking`, icon: Plane, tags: "Live Monitoring" },
                        ].map((action) => (
                            <Link
                                key={action.name}
                                href={action.href}
                                className="group relative flex items-center justify-between p-6 bg-white rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-zinc-50 group-hover:bg-brand transition-all" />
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white flex items-center justify-center transition-all duration-500 shadow-inner group-hover:shadow-lg">
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-zinc-900 uppercase tracking-tight group-hover:text-brand transition-all">{action.name}</p>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1 opacity-60">{action.tags}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>

                    <ErpCard noPad className="!rounded-[40px] border-none bg-emerald-50/50 p-8 flex flex-col gap-6 relative overflow-hidden group">
                        <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp className="h-32 w-32 text-emerald-900" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Financial Insight</p>
                            <h5 className="text-lg font-black text-zinc-900 uppercase tracking-tight leading-snug">Automative Billing <br /> Intelligence Active</h5>
                        </div>
                        <Link href={`/s/${slug}/transport/fees`}>
                            <Btn
                                variant="secondary"
                                className="w-full !rounded-[20px] bg-white border-zinc-200 text-emerald-600 shadow-sm hover:bg-emerald-50 transition-all"
                            >
                                AUDIT LEDGER
                            </Btn>
                        </Link>
                    </ErpCard>
                </div>
            </div>
        </div>
    );
}
