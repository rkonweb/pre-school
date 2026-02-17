"use client";

import { useEffect, useState } from "react";
import { getStaffLibraryHistoryAction } from "@/app/actions/library-actions";
import { BookOpen, Loader2 } from "lucide-react";
import { cn, getCurrencySymbol } from "@/lib/utils";

interface StaffLibraryHistoryProps {
    staffId: string;
    schoolSlug: string; // Needed if we want to link back or use currency context properly (though currency often comes from school, assumed available or passed)
    currency?: string;
}

export function StaffLibraryHistory({ staffId, schoolSlug, currency = "USD" }: StaffLibraryHistoryProps) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [staffId]);

    async function loadData() {
        setIsLoading(true);
        const res = await getStaffLibraryHistoryAction(schoolSlug, staffId);
        if (res.success) {
            setTransactions(res.data || []);
        }
        setIsLoading(false);
    }

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Library History</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Books borrowed and returned by this staff member.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="py-10 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50/50 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Book</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Issued</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fine</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{tx.book?.title || "Unknown Title"}</div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{tx.book?.author || "Unknown Author"}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                        {new Date(tx.issuedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            tx.status === "ISSUED" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                                                tx.status === "RETURNED" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                                                    "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                                        )}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600 dark:text-red-400">
                                        {tx.fineAmount > 0 ? getCurrencySymbol(currency) + tx.fineAmount : "-"}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <p className="text-zinc-400 font-medium text-sm">No library transactions found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
