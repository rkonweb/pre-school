"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getLibraryStatsAction } from "@/app/actions/library-actions";
import {
    Book,
    BookOpen,
    ArrowUpRight,
    AlertCircle,
    Search,
    Plus,
    History,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LibraryDashboardPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const res = await getLibraryStatsAction(slug);
            if (res.success) {
                setStats(res.data);
            }
            setLoading(false);
        }
        fetchStats();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Library</h1>
                    <p className="text-zinc-500">Manage books, circulation, and member activity.</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href={`/s/${slug}/library/issue`}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl"
                    >
                        <ArrowUpRight className="h-4 w-4" />
                        Issue Book
                    </Link>
                    <Link
                        href={`/s/${slug}/library/inventory`}
                        className="flex items-center gap-2 rounded-xl bg-white border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50"
                    >
                        <Book className="h-4 w-4" />
                        Inventory
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Total Books</p>
                            <h3 className="text-2xl font-black text-zinc-900">{stats?.totalBooks || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                            <History className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Currently Issued</p>
                            <h3 className="text-2xl font-black text-zinc-900">{stats?.issuedBooks || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Overdue Items</p>
                            <h3 className="text-2xl font-black text-zinc-900">{stats?.overdueBooks || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Inventory", icon: Book, href: `/s/${slug}/library/inventory`, color: "blue", desc: "Manage catalog & stock" },
                    { title: "Issue / Return", icon: ArrowUpRight, href: `/s/${slug}/library/issue`, color: "emerald", desc: "Circulate books" },
                    { title: "Members", icon: Users, href: `/s/${slug}/library/members`, color: "violet", desc: "Borrower history" },
                    { title: "Reports", icon: History, href: `/s/${slug}/library/reports`, color: "orange", desc: "Fines & analysis" },
                ].map((item) => (
                    <Link
                        key={item.title}
                        href={item.href}
                        className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 transition-all hover:scale-[1.02] hover:shadow-md"
                    >
                        <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-xl", `bg-${item.color}-50 text-${item.color}-600`)}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-zinc-900">{item.title}</h3>
                        <p className="text-xs font-medium text-zinc-500">{item.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-zinc-900">Recent Transactions</h3>
                    <Link href={`/s/${slug}/library/transactions`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        View All
                    </Link>
                </div>

                <div className="relative overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-zinc-500">
                            <tr>
                                <th className="rounded-l-lg px-4 py-3 font-medium">Book</th>
                                <th className="px-4 py-3 font-medium">Borrower</th>
                                <th className="px-4 py-3 font-medium">Issued On</th>
                                <th className="px-4 py-3 font-medium">Due Date</th>
                                <th className="rounded-r-lg px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {stats?.recentTransactions?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                                        No recent transactions found.
                                    </td>
                                </tr>
                            ) : (
                                stats?.recentTransactions?.map((tx: any) => (
                                    <tr key={tx.id}>
                                        <td className="px-4 py-3 font-medium text-zinc-900">
                                            {tx.book.title}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {tx.student ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {tx.student.firstName} {tx.student.lastName}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-purple-600">
                                                    <Users className="h-3 w-3" />
                                                    {tx.staff?.firstName} {tx.staff?.lastName} (Staff)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500">
                                            {new Date(tx.issuedDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500">
                                            {new Date(tx.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                                                tx.status === "ISSUED" ? "bg-amber-100 text-amber-700" :
                                                    tx.status === "RETURNED" ? "bg-emerald-100 text-emerald-700" :
                                                        "bg-zinc-100 text-zinc-700"
                                            )}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
