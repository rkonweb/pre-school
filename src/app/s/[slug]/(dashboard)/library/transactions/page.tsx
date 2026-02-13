"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    getTransactionsAction,
    returnBookAction
} from "@/app/actions/library-actions";
import {
    CheckCircle2,
    Filter,
    ArrowUpRight,
    Users,
    BookOpen,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LibraryTransactionsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [filter, setFilter] = useState<"ALL" | "ISSUED" | "RETURNED" | "OVERDUE">("ALL");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, [slug, filter]);

    async function fetchTransactions() {
        setLoading(true);
        const res = await getTransactionsAction(slug, filter);
        if (res.success) {
            setTransactions(res.data);
        }
        setLoading(false);
    }

    async function handleReturn(id: string) {
        if (!confirm("Confirm return of this book?")) return;
        setProcessingId(id);
        const res = await returnBookAction(id, slug);
        if (res.success) {
            toast.success("Book returned successfully");
            fetchTransactions();
        } else {
            toast.error(res.error || "Failed to return book");
        }
        setProcessingId(null);
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Transactions</h1>
                    <p className="text-zinc-500">View history and manage returns.</p>
                </div>

                <div className="flex bg-zinc-100 p-1 rounded-xl">
                    {["ALL", "ISSUED", "RETURNED", "OVERDUE"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                                filter === f ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
            ) : (
                <div className="rounded-3xl bg-white shadow-sm ring-1 ring-zinc-100 overflow-hidden">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50/50 text-zinc-500">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Book Details</th>
                                    <th className="px-6 py-4 font-bold">Borrower</th>
                                    <th className="px-6 py-4 font-bold">Dates</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-zinc-500">
                                            No transactions found matching this filter.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/5 text-brand">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-900">{tx.book.title}</p>
                                                        <p className="text-xs text-zinc-500">{tx.book.isbn || "No ISBN"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-zinc-400" />
                                                    <span className="font-medium text-zinc-700">
                                                        {tx.student ? `${tx.student.firstName} ${tx.student.lastName}` : `${tx.staff?.firstName} ${tx.staff?.lastName} (Staff)`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    <span className="w-12">Issued:</span>
                                                    <span className="font-medium text-zinc-900">{new Date(tx.issuedDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    <span className="w-12">Due:</span>
                                                    <span className={cn("font-medium", new Date() > new Date(tx.dueDate) && tx.status === "ISSUED" ? "text-red-600" : "text-zinc-900")}>
                                                        {new Date(tx.dueDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                                                    tx.status === "ISSUED" ? "bg-amber-100 text-amber-700" :
                                                        tx.status === "RETURNED" ? "bg-emerald-100 text-emerald-700" :
                                                            "bg-zinc-100 text-zinc-700"
                                                )}>
                                                    {tx.status}
                                                </span>
                                                {tx.fineAmount > 0 && (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                                                        Fine: {tx.fineAmount}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {tx.status === "ISSUED" && (
                                                    <button
                                                        onClick={() => handleReturn(tx.id)}
                                                        disabled={processingId === tx.id}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-emerald-600 disabled:opacity-50"
                                                    >
                                                        {processingId === tx.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                                                        Return
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
