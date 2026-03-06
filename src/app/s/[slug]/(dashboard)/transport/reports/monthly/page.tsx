'use server';

import { prisma } from "@/lib/prisma";
import {
    TrendingUp,
    DollarSign,
    Bus,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    BarChart3,
    Activity,
    Fuel,
    Wrench,
    Download
} from "lucide-react";
import { getMonthlyTransportReportAction } from "@/app/actions/report-actions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReportTabs from "@/components/transport/ReportTabs";
import { SectionHeader, ErpCard, Btn, tableStyles, C } from "@/components/ui/erp-ui";

export default async function MonthlyAnalyticsPage(props: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ month?: string, year?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { slug } = params;

    const school = await prisma.school.findUnique({
        where: { slug },
        select: { currency: true }
    });
    const currency = school?.currency || 'INR';
    const symbolMap: Record<string, string> = {
        'INR': '₹',
        'USD': '$',
        'GBP': '£',
        'EUR': '€',
        'KES': 'KSh',
        'UGX': 'USh',
        'TZS': 'TSh',
        'RWF': 'RF',
        'ETB': 'Br',
        'NGN': '₦',
        'GHS': 'GH₵',
    };
    const currencyStr = symbolMap[currency] || currency;

    const now = new Date();
    const month = parseInt(searchParams.month || (now.getMonth() + 1).toString());
    const year = parseInt(searchParams.year || now.getFullYear().toString());

    const reportRes = await getMonthlyTransportReportAction(slug, month, year);
    const data = reportRes.success ? reportRes.data : [];

    // Financial Overview Aggregation
    const totalFuel = (data || []).reduce((sum: number, v: any) => sum + (v.totalFuelCost || 0), 0);
    const totalMaintenance = (data || []).reduce((sum: number, v: any) => sum + (v.totalMaintenanceCost || 0), 0);
    const totalDistance = (data || []).reduce((sum: number, v: any) => sum + (v.totalDistance || 0), 0);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="p-8 space-y-10 w-full mb-20">
            <SectionHeader
                title="Monthly Fleet Insights"
                subtitle={`Consolidated operational analytics for ${monthNames[month - 1]} ${year}`}
                icon={<TrendingUp size={18} color={C.amber} />}
                action={
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-[20px] border border-zinc-100 shadow-sm">
                            <Calendar className="h-4 w-4 text-brand" />
                            <select
                                aria-label="Select Target Month"
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-900 outline-none focus:ring-0 cursor-pointer"
                            >
                                {monthNames.map((m, i) => (
                                    <option key={m} value={i + 1} selected={i + 1 === month}>{m}</option>
                                ))}
                            </select>
                            <div className="h-4 w-px bg-zinc-100" />
                            <select
                                aria-label="Select Target Year"
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-900 outline-none focus:ring-0 cursor-pointer"
                            >
                                {[2023, 2024, 2025, 2026].map(y => (
                                    <option key={y} value={y} selected={y === year}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <Btn
                            variant="secondary"
                            icon={<Download size={18} />}
                            title="Export Analytics"
                            size="md"
                        />
                    </div>
                }
            />

            <ReportTabs slug={slug} />

            {/* Financial Dashboard Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ErpCard noPad className="!rounded-[40px] border-none shadow-2xl shadow-brand/20 bg-gradient-to-br from-zinc-900 to-black text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="h-32 w-32" />
                    </div>
                    <div className="p-10 relative z-10">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Total Operational Burn</p>
                        <h3 className="text-4xl font-black mt-4 tracking-tighter">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(totalFuel + totalMaintenance)}
                        </h3>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 text-brand">
                                <ArrowDownRight className="h-3.5 w-3.5" />
                                12% Optimization
                            </div>
                        </div>
                    </div>
                </ErpCard>

                <ErpCard className="!rounded-[40px] border-zinc-200 p-10 shadow-xl shadow-zinc-200/50 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Fuel Economy Index</p>
                            <h3 className="text-4xl font-black text-zinc-900 mt-4 tracking-tighter">
                                {totalDistance > 0 ? (totalFuel / totalDistance).toFixed(2) : "0.00"}
                                <span className="text-xs font-black text-zinc-400 ml-2 uppercase tracking-widest">{currencyStr}/KM</span>
                            </h3>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl text-blue-500 shadow-inner">
                            <BarChart3 className="h-7 w-7" />
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex h-2 flex-1 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                            <div
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] w-[var(--p)]"
                                style={{ '--p': '65%' } as React.CSSProperties}
                            />
                        </div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">DRIVE: {currencyStr}18/KM</span>
                    </div>
                </ErpCard>

                <ErpCard className="!rounded-[40px] border-zinc-200 p-10 shadow-xl shadow-zinc-200/50 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Fleet Uptime Matrix</p>
                            <h3 className="text-4xl font-black text-zinc-900 mt-4 tracking-tighter">98.4%</h3>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl text-brand shadow-inner">
                            <Activity className="h-7 w-7" />
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-brand">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Apex Performance Level</span>
                    </div>
                </ErpCard>
            </div>

            {/* Asset Performance Matrix Table */}
            <ErpCard noPad className="!rounded-[40px] border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden">
                <div className="p-8 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
                    <div>
                        <h4 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Asset Performance Matrix</h4>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Individual efficiency and financial impact tracking</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-zinc-100 text-zinc-300">
                        <PieChart className="h-6 w-6" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={tableStyles.thead}>
                                <th style={tableStyles.th}>Asset Parameters</th>
                                <th style={tableStyles.th} className="text-center">Operational Days</th>
                                <th style={tableStyles.th} className="text-center">Traverse</th>
                                <th style={tableStyles.th} className="text-center">Fuel Expense</th>
                                <th style={tableStyles.th} className="text-center">Maintenance</th>
                                <th style={tableStyles.th} className="text-right pr-10">Efficiency Index</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {(data || []).map((item: any) => (
                                <tr key={item.vehicle.id} className="hover:bg-zinc-50/80 transition-all group">
                                    <td style={tableStyles.td} className="py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                                <Bus className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{item.vehicle.registrationNumber}</p>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{item.vehicle.model}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tableStyles.td} className="text-center">
                                        <span className="px-4 py-1.5 bg-zinc-50 rounded-full text-[10px] font-black text-zinc-600 uppercase tracking-widest border border-zinc-100">
                                            {item.totalDaysActive} / 30 DAY CYCLE
                                        </span>
                                    </td>
                                    <td style={tableStyles.td} className="text-center">
                                        <span className="text-sm font-black text-zinc-900 tracking-tight">{item.totalDistance.toFixed(0)} KM</span>
                                    </td>
                                    <td style={tableStyles.td} className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Fuel className="h-3.5 w-3.5 text-blue-500" />
                                            <span className="text-sm font-black text-zinc-900">{currencyStr}{item.totalFuelCost.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td style={tableStyles.td} className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Wrench className="h-3.5 w-3.5 text-brand" />
                                            <span className="text-sm font-black text-zinc-900">{currencyStr}{item.totalMaintenanceCost.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td style={tableStyles.td} className="text-right pr-10">
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-brand tracking-tighter italic">GRADE A+</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div key={i} className={cn("h-4 w-2 rounded-sm", i <= 4 ? "bg-brand" : "bg-zinc-200")} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(data || []).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <BarChart3 className="h-16 w-16 text-zinc-400" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Zero consolidated data matrix for this period</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ErpCard>
        </div>
    );
}
