'use server';

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default async function MonthlyAnalyticsPage({ params, searchParams }: {
    params: { slug: string },
    searchParams: { month?: string, year?: string }
}) {
    const { slug } = params;
    const now = new Date();
    const month = parseInt(searchParams.month || (now.getMonth() + 1).toString());
    const year = parseInt(searchParams.year || now.getFullYear().toString());

    const reportRes = await getMonthlyTransportReportAction(slug, month, year);
    const data = reportRes.success ? reportRes.data : [];

    // Financial Overview Aggregation
    const totalFuel = data.reduce((sum, v) => sum + v.totalFuelCost, 0);
    const totalMaintenance = data.reduce((sum, v) => sum + v.totalMaintenanceCost, 0);
    const totalDistance = data.reduce((sum, v) => sum + v.totalDistance, 0);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="p-6 space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Monthly Insights</h1>
                    <p className="text-zinc-500 mt-1 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-brand" />
                        Aggregated analytics for {monthNames[month - 1]} {year}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-zinc-100 shadow-sm">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <select className="bg-transparent border-none text-sm font-bold text-zinc-900 outline-none focus:ring-0">
                            {monthNames.map((m, i) => (
                                <option key={m} value={i + 1} selected={i + 1 === month}>{m}</option>
                            ))}
                        </select>
                        <select className="bg-transparent border-none text-sm font-bold text-zinc-900 outline-none focus:ring-0">
                            {[2023, 2024, 2025, 2026].map(y => (
                                <option key={y} value={y} selected={y === year}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button className="p-2.5 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors">
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <ReportTabs slug={slug} />

            {/* Financial Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl shadow-zinc-200/50 bg-gradient-to-br from-brand to-brand/80 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <DollarSign className="h-20 w-20" />
                    </div>
                    <CardContent className="p-8">
                        <p className="text-xs font-black uppercase text-white/70 tracking-widest">Total Ops Expenditure</p>
                        <h3 className="text-4xl font-black mt-2">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalFuel + totalMaintenance)}
                        </h3>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">
                                <ArrowDownRight className="h-3 w-3" />
                                12% vs last month
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-zinc-200/50 bg-white overflow-hidden relative">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">Fuel Economy Average</p>
                                <h3 className="text-3xl font-black text-zinc-900 mt-2">
                                    {totalDistance > 0 ? (totalFuel / totalDistance).toFixed(2) : "0.00"}
                                    <span className="text-sm font-bold text-zinc-400 ml-1">₹/km</span>
                                </h3>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded-xl text-blue-500">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex h-1.5 flex-1 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: '65%' }} />
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase">Target: ₹18/km</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-zinc-200/50 bg-white overflow-hidden relative">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">Fleet Uptime</p>
                                <h3 className="text-3xl font-black text-zinc-900 mt-2">98.4%</h3>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded-xl text-green-500">
                                <Activity className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-green-600">
                            <ArrowUpRight className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase">Exceeding Benchmark</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Vehicle Analytics Table */}
            <Card className="border-none shadow-xl shadow-zinc-200/50 overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black">Vehicle performance Matrix</CardTitle>
                            <CardDescription>Individual asset efficiency and financial impact</CardDescription>
                        </div>
                        <PieChart className="h-6 w-6 text-zinc-300" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/30">
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Asset Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Active Days</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Distance</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Fuel Expense</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Maintenance</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Efficiency Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {data.map((item: any) => (
                                    <tr key={item.vehicle.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                                                    <Bus className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-zinc-900">{item.vehicle.registrationNumber}</p>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{item.vehicle.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-zinc-600">{item.totalDaysActive} / 30</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-black text-zinc-900">{item.totalDistance.toFixed(0)} km</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-zinc-900">
                                                <Fuel className="h-3 w-3 text-blue-500" />
                                                <span className="text-sm font-black text-zinc-900">₹{item.totalFuelCost.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-zinc-900">
                                                <Wrench className="h-3 w-3 text-orange-500" />
                                                <span className="text-sm font-black text-zinc-900">₹{item.totalMaintenanceCost.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-brand">A+</span>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <div key={i} className={cn("h-3 w-1.5 rounded-sm", i <= 4 ? "bg-brand" : "bg-zinc-200")} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-50">
                                                <BarChart3 className="h-12 w-12 text-zinc-200" />
                                                <p className="text-sm font-black uppercase text-zinc-400">No consolidated data for this month</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
