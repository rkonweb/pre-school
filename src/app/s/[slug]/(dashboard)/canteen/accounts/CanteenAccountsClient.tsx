"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Wallet, Banknote, CreditCard, ArrowDownRight, ArrowUpRight,
    Search, Filter, Receipt, Database, Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";

export default function CanteenAccountsClient({ slug, initialData }: { slug: string, initialData: any }) {
    const { currency } = useSidebar();
    const [search, setSearch] = useState("");

    function fmt(n: number) { return `${currency}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
    const [filter, setFilter] = useState("ALL"); // ALL, CASH, UPI, WALLET_RECHARGE, POS_DIRECT_SALE

    if (!initialData) {
        return (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
                <Database className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No Ledger Data</h3>
                <p className="text-sm mt-1">Failed to load canteen accounts. Please check database connection.</p>
            </div>
        );
    }

    const { ledger, totals } = initialData;

    const filteredLedger = ledger.filter((tx: any) => {
        const matchSearch = search === "" ||
            tx.desc?.toLowerCase().includes(search.toLowerCase()) ||
            tx.student?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            tx.student?.admissionNumber?.toLowerCase().includes(search.toLowerCase());

        let matchFilter = true;
        if (filter === "CASH") matchFilter = tx.mode === "CASH";
        else if (filter === "UPI") matchFilter = tx.mode === "UPI";
        else if (filter === "WALLET_RECHARGE") matchFilter = tx.type === "WALLET_RECHARGE";
        else if (filter === "POS_DIRECT_SALE") matchFilter = tx.type === "POS_DIRECT_SALE";

        return matchSearch && matchFilter;
    });

    const totalFilteredAmount = filteredLedger.reduce((sum: number, tx: any) => sum + tx.amount, 0);

    return (
        <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-64px)]">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Receipt className="h-6 w-6 text-indigo-500" />
                        Accounts & Ledger
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">
                        Unified view of Wallet Recharges and Direct POS Sales for the current month.
                    </p>
                </div>
                <Button variant="outline" className="gap-2 bg-white" onClick={() => window.print()}>
                    <Download className="h-4 w-4" /> Export Ledger
                </Button>
            </div>

            {/* ── Settlement Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5">
                        <Banknote className="w-32 h-32 text-green-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Cash Collected</p>
                    <h2 className="text-3xl font-black text-green-600">{fmt(totals.cash)}</h2>
                    <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-500">
                        <div><span className="text-slate-400">POS Sales:</span> <span className="text-slate-800">{fmt(totals.pos.cash)}</span></div>
                        <div><span className="text-slate-400">Wallet Topups:</span> <span className="text-slate-800">{fmt(totals.wallet.cash)}</span></div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5">
                        <CreditCard className="w-32 h-32 text-blue-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total UPI Collected</p>
                    <h2 className="text-3xl font-black text-blue-600">{fmt(totals.upi)}</h2>
                    <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-500">
                        <div><span className="text-slate-400">POS Sales:</span> <span className="text-slate-800">{fmt(totals.pos.upi)}</span></div>
                        <div><span className="text-slate-400">Wallet Topups:</span> <span className="text-slate-800">{fmt(totals.wallet.upi)}</span></div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg text-white">
                    <p className="text-sm font-semibold text-indigo-200 uppercase tracking-wider mb-2">Total Monthly Revenue</p>
                    <h2 className="text-3xl font-black">{fmt(totals.cash + totals.upi)}</h2>
                    <p className="text-xs text-indigo-200/70 mt-4 leading-relaxed max-w-[200px]">
                        Cash + UPI directly injected into the system this month.
                    </p>
                </div>
            </div>

            {/* ── Ledger Table ── */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search student, adm no, description..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                        <div className="flex items-center gap-2 mr-2 text-sm font-bold text-slate-500 shrink-0">
                            <Filter className="w-4 h-4" /> Filter:
                        </div>
                        {["ALL", "CASH", "UPI", "WALLET_RECHARGE", "POS_DIRECT_SALE"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-all
                                    ${filter === f
                                        ? "bg-slate-800 text-white border-slate-800"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                            >
                                {f.replace(/_/g, " ")}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50/50 border-b border-slate-200 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Transaction Type</th>
                                <th className="px-6 py-4">Mode</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLedger.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No transactions found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredLedger.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-semibold text-slate-800">{format(new Date(tx.date), "dd MMM yyyy")}</p>
                                            <p className="text-xs text-slate-500">{format(new Date(tx.date), "hh:mm a")}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.student ? (
                                                <>
                                                    <p className="font-bold text-slate-800">{tx.student.firstName} {tx.student.lastName}</p>
                                                    <p className="text-xs text-slate-500">{tx.student.admissionNumber}</p>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 italic">Anonymous</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {tx.type === "WALLET_RECHARGE" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-violet-100 text-violet-700">
                                                        <Wallet className="w-3.5 h-3.5" /> Topup
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700">
                                                        <Receipt className="w-3.5 h-3.5" /> Order
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500 truncate max-w-[150px]" title={tx.desc}>{tx.desc}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.mode === "CASH" ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 font-bold"><Banknote className="w-4 h-4" /> Cash</span>
                                            ) : tx.mode === "UPI" ? (
                                                <span className="inline-flex items-center gap-1 text-blue-600 font-bold"><CreditCard className="w-4 h-4" /> UPI</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-slate-500 font-bold">{tx.mode}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-800 text-base">
                                            {fmt(tx.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {filteredLedger.length > 0 && (
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-bold text-slate-500 uppercase">
                                        Filtered Total
                                    </td>
                                    <td className="px-6 py-4 text-right text-lg font-black text-slate-800">
                                        {fmt(totalFilteredAmount)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

        </div>
    );
}
