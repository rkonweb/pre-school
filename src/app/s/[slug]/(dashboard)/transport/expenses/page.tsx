'use server';

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DollarSign,
    AlertTriangle,
    CheckCircle2,
    Bus,
    Calendar,
    Filter,
    Plus,
    History,
    Receipt,
    Wallet,
    AlertCircle,
    MoreHorizontal,
    Trash2
} from "lucide-react";
import { getTransportExpensesAction, resolveExpenseAnomalyAction } from "@/app/actions/expense-actions";
import { getVehiclesAction } from "@/app/actions/transport-actions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ExpenseForm from "@/components/transport/ExpenseForm";
import ExpenseActions from "@/components/transport/ExpenseActions";
import RealtimeLedgerWrapper from "@/components/transport/RealtimeLedgerWrapper";
import ExpenseCharts from "@/components/transport/ExpenseCharts";

export default async function TransportExpensesPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const expensesRes = await getTransportExpensesAction(slug);
    const vehiclesRes = await getVehiclesAction(slug);

    const expenses = expensesRes.success ? expensesRes.data : [];
    const vehicles = vehiclesRes.success ? vehiclesRes.data : [];

    // Stats calculation
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const suspiciousCount = expenses.filter(e => e.isSuspicious).length;
    const fuelExpenses = expenses.filter(e => e.category === "FUEL").reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="p-6 space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Expense Monitoring</h1>
                    <p className="text-zinc-500 mt-1 flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-brand" />
                        Unified ledger for fleet maintenance and fuel
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <ExpenseForm slug={slug} vehicles={vehicles} />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-lg shadow-zinc-200/50 bg-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Ledger</p>
                                <h3 className="text-3xl font-black text-zinc-900 mt-2">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalExpenses)}
                                </h3>
                            </div>
                            <div className="p-3 bg-zinc-100 rounded-xl text-zinc-600">
                                <History className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg shadow-zinc-200/50 bg-zinc-900 text-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Fuel Consumption</p>
                                <h3 className="text-3xl font-black text-white mt-2">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(fuelExpenses)}
                                </h3>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl text-yellow-500">
                                <Plus className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "border-none shadow-lg shadow-zinc-200/50 transition-all",
                    suspiciousCount > 0 ? "bg-red-50 text-red-950 border border-red-200" : "bg-white text-zinc-900"
                )}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={cn(
                                    "text-sm font-bold uppercase tracking-wider",
                                    suspiciousCount > 0 ? "text-red-700" : "text-zinc-500"
                                )}>Anomalies Found</p>
                                <h3 className="text-3xl font-black mt-2">{suspiciousCount}</h3>
                            </div>
                            <div className={cn(
                                "p-3 rounded-xl",
                                suspiciousCount > 0 ? "bg-red-100 text-red-600 animate-pulse" : "bg-green-50 text-green-600"
                            )}>
                                {suspiciousCount > 0 ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Suspicious Alerts Dashboard */}
            {suspiciousCount > 0 && (
                <div className="bg-red-600 text-white rounded-2xl p-6 shadow-xl shadow-red-200 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-4">
                        <ShieldAlert className="h-48 w-48" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <AlertCircle className="h-6 w-6" />
                            AI ANOMALY DETECTED
                        </h2>
                        <p className="text-red-100 mt-1 max-w-xl">
                            Our system has flagged {suspiciousCount} expense records as suspicious based on vehicle consumption patterns and historical averages. Please verify these entries.
                        </p>
                    </div>
                    <button className="relative z-10 px-8 py-3 bg-white text-red-600 rounded-xl font-black shadow-lg hover:bg-zinc-100 transition-all active:scale-95">
                        RESOLVE ALERTS
                    </button>
                </div>
            )}

            {/* Expense Analytics Charts */}
            <ExpenseCharts expenses={expenses} />

            {/* Ledger Table */}
            <RealtimeLedgerWrapper>
                <Card className="border-none shadow-xl shadow-zinc-200/50">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 bg-zinc-50/50 rounded-t-xl">
                        <div>
                            <CardTitle className="text-lg font-bold">Expense Ledger</CardTitle>
                            <CardDescription>Comprehensive record of all fleet expenditures</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <select className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-brand">
                                    <option>All Status</option>
                                    <option>Pending</option>
                                    <option>Approved</option>
                                    <option>Rejected</option>
                                </select>
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <select className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-brand">
                                    <option>All Categories</option>
                                    <option>Fuel</option>
                                    <option>Maintenance</option>
                                    <option>Repairs</option>
                                    <option>Insurance</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/30">
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Vehicle</th>
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {expenses.map((expense) => (
                                        <tr key={expense.id} className={cn(
                                            "group transition-colors",
                                            expense.isSuspicious ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-zinc-50/50"
                                        )}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-zinc-400" />
                                                    <span className="text-sm font-bold text-zinc-900">
                                                        {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900">{expense.vehicle?.registrationNumber}</p>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{expense.vehicle?.model}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border",
                                                    expense.category === "FUEL" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                        expense.category === "REPAIR" ? "bg-orange-50 text-orange-700 border-orange-100" :
                                                            "bg-zinc-100 text-zinc-700 border-zinc-200"
                                                )}>
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-zinc-900">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(expense.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border shadow-sm",
                                                            expense.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                                expense.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-100" :
                                                                    "bg-amber-50 text-amber-700 border-amber-100"
                                                        )}>
                                                            {expense.status}
                                                        </span>
                                                        {expense.isSuspicious && (
                                                            <div className="flex items-center gap-1 text-red-600 animate-pulse" title={expense.anomalyReason}>
                                                                <AlertCircle className="h-3 w-3" />
                                                                <span className="text-[8px] font-black uppercase">Anomaly</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col text-[10px]">
                                                        {expense.status === "REJECTED" && expense.rejectionReason && (
                                                            <span className="text-red-500 font-bold italic line-clamp-1" title={expense.rejectionReason}>
                                                                Reason: {expense.rejectionReason}
                                                            </span>
                                                        )}
                                                        <span className="text-zinc-500 font-medium">
                                                            By {expense.createdBy?.firstName || "System"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {expense.receiptUrl && (
                                                        <a href={expense.receiptUrl} target="_blank" className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-500" title="View Receipt">
                                                            <Receipt className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    <ExpenseActions
                                                        slug={slug}
                                                        expense={expense}
                                                        vehicles={vehicles}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <History className="h-10 w-10 text-zinc-200" />
                                                    <p className="text-zinc-500 font-medium">No expenses recorded yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </RealtimeLedgerWrapper>
        </div>
    );
}

function ShieldAlert(props: any) {
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
