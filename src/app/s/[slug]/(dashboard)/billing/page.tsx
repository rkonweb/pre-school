"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Download,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    MoreHorizontal,
    Search,
    Filter,
    Loader2,
    ChevronUp,
    ChevronDown,
    Calendar,
    ListFilter
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";
import { getBillingDashboardAction } from "@/app/actions/billing-dashboard-actions";
import { format } from "date-fns";
import { toast } from "sonner";
import { getCookie } from "@/lib/cookies";

export default function BillingDashboard() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    // Query State
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortConfig, setSortConfig] = useState<{ field: string, direction: "asc" | "desc" }>({
        field: "dueDate",
        direction: "desc"
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(timer);
    }, [slug, page, searchTerm, statusFilter, sortConfig]);

    async function loadData() {
        // Only show full loader on initial load or severe context switch
        // For pagination/search, maybe just opacity? 
        // For now, simple approach:
        if (!data) setIsLoading(true); // Initial

        // Prepare filters
        const academicYearId = getCookie(`academic_year_${slug}`) || undefined;
        const filters: any = { academicYearId };
        if (statusFilter !== "ALL") filters.status = statusFilter;

        const res = await getBillingDashboardAction(slug, {
            page,
            limit: 10,
            search: searchTerm,
            filters,
            sort: sortConfig
        });

        if (res.success) {
            setData(res);
        } else {
            toast.error("Failed to load data");
        }
        setIsLoading(false);
    }

    const handleSort = (field: string) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
        }));
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortConfig.field !== field) return <div className="w-4 h-4" />;
        return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    const currencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: data?.currency || "USD"
    });

    const hasNextPage = data?.pagination?.page < data?.pagination?.totalPages;
    const hasPrevPage = data?.pagination?.page > 1;

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Billing & Invoices
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage student fees, generate invoices, and track payments.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900">
                        <Download className="h-4 w-4" />
                        Export Report
                    </button>
                    <Link
                        href={`/s/${slug}/billing/bulk`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-[var(--secondary-color)] transition-colors hover:brightness-110 shadow-sm shadow-brand/20"
                    >
                        <Plus className="h-4 w-4" />
                        Bulk Generate Invoices
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Billed"
                    value={currencyFormatter.format(data?.stats?.totalBilled || 0)}
                    subValue="All time"
                    icon={FileText}
                    color="brand"
                />
                <StatCard
                    title="Collected"
                    value={currencyFormatter.format(data?.stats?.collected || 0)}
                    subValue={`${data?.stats?.totalBilled ? Math.round((data.stats.collected / data.stats.totalBilled) * 100) : 0}% collection rate`}
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="Pending"
                    value={currencyFormatter.format(data?.stats?.pending || 0)}
                    subValue="Receivables"
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    title="Overdue"
                    value={currencyFormatter.format(data?.stats?.overdue || 0)}
                    subValue="Requires active follow-up"
                    icon={AlertCircle}
                    color="purple"
                />
            </div>

            {/* Invoices List */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold">Invoices & Fees</h2>
                        {data?.pagination?.total > 0 && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                                {data.pagination.total} total
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950"
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="relative">
                                <ListFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="appearance-none rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-8 text-sm font-medium focus:border-brand focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 min-w-[140px]"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PAID">Paid</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="PARTIAL">Partial</option>
                                    <option value="OVERDUE">Overdue</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('id')}>
                                        <div className="flex items-center gap-1">Ref <SortIcon field="id" /></div>
                                    </th>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('studentName')}>
                                        <div className="flex items-center gap-1">Student <SortIcon field="studentName" /></div>
                                    </th>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('title')}>
                                        <div className="flex items-center gap-1">Fee Title <SortIcon field="title" /></div>
                                    </th>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('amount')}>
                                        <div className="flex items-center gap-1">Amount <SortIcon field="amount" /></div>
                                    </th>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
                                    </th>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('dueDate')}>
                                        <div className="flex items-center gap-1">Due Date <SortIcon field="dueDate" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {!data?.invoices || data.invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                            No invoices found
                                        </td>
                                    </tr>
                                ) : (
                                    data.invoices.map((inv: any) => (
                                        <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-zinc-500 select-all">
                                                {inv.id.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                                                        {inv.studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900 dark:text-zinc-50">{inv.studentName}</p>
                                                        <p className="text-xs text-zinc-500">{inv.grade || "No Grade"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-medium">{inv.title}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{currencyFormatter.format(inv.amount)}</span>
                                                    {inv.paid > 0 && (
                                                        <span className="text-[10px] text-green-600 font-medium">Paid: {currencyFormatter.format(inv.paid)}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border",
                                                    inv.status === "PAID" && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                                    inv.status === "PENDING" && "bg-brand/5 text-brand border-brand/20",
                                                    inv.status === "PARTIAL" && "bg-amber-50 text-amber-700 border-amber-200",
                                                    inv.status === "OVERDUE" && "bg-rose-50 text-rose-700 border-rose-200"
                                                )}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-medium">
                                                {format(new Date(inv.dueDate), "MMM dd, yyyy")}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 transition-colors">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="border-t border-zinc-200 p-4 flex items-center justify-between">
                        <div className="text-sm text-zinc-500">
                            Page <span className="font-bold text-zinc-900">{data?.pagination?.page}</span> of <span className="font-medium">{data?.pagination?.totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={!hasPrevPage}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 text-sm font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                disabled={!hasNextPage}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 text-sm font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
