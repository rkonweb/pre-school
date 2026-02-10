"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Building2,
    CreditCard,
    MoreVertical,
    Search,
    Plus,
    ShieldCheck,
    AlertTriangle,
    TrendingUp,
    LogIn,
    ArrowUpDown,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Trash2,
    Power,
    Play,
    Pencil,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { getTenantsAction, updateTenantStatusAction, deleteTenantAction, updateTenantAction, impersonateTenantAction } from "@/app/actions/tenant-actions";
import { Tenant } from "@/types/tenant";
import { formatDistanceToNow } from "date-fns";

export default function TenantManagementPage() {
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Tenant; direction: "asc" | "desc" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const loadTenants = async () => {
        // Only set loading if it's the initial load to prevent flashing
        if (tenants.length === 0) setIsLoading(true);
        try {
            const data = await getTenantsAction();
            setTenants(data);
        } catch (error) {
            console.error("Failed to fetch tenants", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTenants();

        // Polling for "Realtime" effect every 30s
        const interval = setInterval(loadTenants, 30000);
        return () => clearInterval(interval);
    }, []);

    // Derived State for Stats
    const stats = useMemo(() => {
        const totalMRR = tenants.reduce((sum, t) => t.status === "ACTIVE" || t.status === "PAST_DUE" ? sum + t.mrr : sum, 0);
        const activeCount = tenants.filter(t => t.status === "ACTIVE").length;
        const trialCount = tenants.filter(t => t.status === "TRIAL").length;
        const churnRisk = tenants.filter(t => t.status === "PAST_DUE").length;

        return { totalMRR, activeCount, trialCount, churnRisk };
    }, [tenants]);

    // Helper functions
    const handleSort = (key: keyof Tenant) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const getStatusColor = (status: Tenant["status"]) => {
        switch (status) {
            case "ACTIVE": return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
            case "TRIAL": return "bg-amber-50 text-amber-700 ring-amber-600/20";
            case "PAST_DUE": return "bg-rose-50 text-rose-700 ring-rose-600/20";
            case "SUSPENDED": return "bg-zinc-100 text-zinc-600 ring-zinc-500/20";
            default: return "bg-zinc-50 text-zinc-700 ring-zinc-600/20";
        }
    };

    // Filter & Sort Logic
    const filteredTenants = useMemo(() => {
        let data = [...tenants];

        if (filter !== "ALL") {
            data = data.filter(t => t.status === filter);
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            data = data.filter(t =>
                t.name.toLowerCase().includes(lowerQuery) ||
                t.email.toLowerCase().includes(lowerQuery) ||
                t.adminName.toLowerCase().includes(lowerQuery)
            );
        }

        if (sortConfig) {
            data.sort((a, b) => {
                // @ts-ignore
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
                // @ts-ignore
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [tenants, filter, searchQuery, sortConfig]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    const paginatedTenants = filteredTenants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-zinc-50/50 relative">
            {/* Header */}

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Tenant Management</h2>
                    <p className="text-zinc-500 font-medium">Oversee school instances, subscriptions, and financial health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-zinc-700 border border-zinc-200 shadow-sm hover:bg-zinc-50 transition-colors">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                    <Link
                        href="/admin/tenants/onboard"
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Onboard New School
                    </Link>
                </div>
            </div>

            {/* Dynamic Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4">
                <StatCard
                    title="Monthly Recurring Revenue"
                    value={`$${stats.totalMRR.toLocaleString()}`}
                    subValue="+8.2% vs last month"
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    title="Active Campuses"
                    value={stats.activeCount.toString()}
                    icon={Building2}
                    color="blue"
                />
                <StatCard
                    title="Active Trials"
                    value={stats.trialCount.toString()}
                    icon={ShieldCheck}
                    color="purple"
                />
                <StatCard
                    title="Payment At-Risk"
                    value={stats.churnRisk.toString()}
                    icon={AlertTriangle}
                    color="red"
                />
            </div>

            {/* Filters & Actions Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl">
                        {["ALL", "ACTIVE", "TRIAL", "PAST_DUE", "SUSPENDED"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setFilter(tab); setCurrentPage(1); }}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                    filter === tab ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                                )}
                            >
                                {tab.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by school, admin, or email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                        />
                    </div>
                    <button className="p-2.5 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                        <Filter className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">School Details <ArrowUpDown className="h-3 w-3" /></div>
                                </th>
                                <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('plan')}>
                                    <div className="flex items-center gap-2">Plan <ArrowUpDown className="h-3 w-3" /></div>
                                </th>
                                <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs tracking-wider cursor-pointer hover:bg-zinc-100 transition-colors text-right" onClick={() => handleSort('mrr')}>
                                    <div className="flex items-center justify-end gap-2">MRR <ArrowUpDown className="h-3 w-3" /></div>
                                </th>
                                <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {paginatedTenants.length > 0 ? (
                                paginatedTenants.map((tenant) => (
                                    <tr key={tenant.id} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 flex items-center justify-center font-bold text-zinc-500 text-xs shadow-sm">
                                                    {tenant.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">{tenant.name}</div>
                                                    <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                        <span className="truncate max-w-[150px]">{tenant.adminName}</span>
                                                        <span className="h-0.5 w-0.5 rounded-full bg-zinc-300" />
                                                        <span className="truncate max-w-[150px]">{tenant.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className={cn(
                                                    "inline-flex w-fit items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md border",
                                                    tenant.plan === "Enterprise" ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                        tenant.plan === "Growth" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                            "bg-zinc-100 text-zinc-700 border-zinc-200"
                                                )}>
                                                    {tenant.plan === "Enterprise" && <ShieldCheck className="h-3 w-3" />}
                                                    {tenant.plan}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-medium">Auto-renew: Jan 30</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset shadow-sm",
                                                getStatusColor(tenant.status)
                                            )}>
                                                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse",
                                                    tenant.status === "ACTIVE" ? "bg-emerald-500" :
                                                        tenant.status === "TRIAL" ? "bg-amber-500" : "bg-red-500"
                                                )} />
                                                {tenant.status.replace("_", " ")}
                                            </span>
                                            <div className="text-[10px] text-zinc-400 font-medium mt-1.5">
                                                Active: {formatDistanceToNow(new Date(tenant.lastActive), { addSuffix: true })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="font-mono font-bold text-zinc-700 group-hover:text-zinc-900">
                                                ${tenant.mrr.toLocaleString()}
                                            </div>
                                            <div className="text-[10px] text-zinc-400 font-medium">
                                                {tenant.students} Students
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end items-center gap-1">
                                                <Link
                                                    href={`/admin/tenants/${tenant.id}/edit`}
                                                    title="Edit Details"
                                                    className="p-2 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={async () => {
                                                        const loadingToast = toast.loading(`Impersonating ${tenant.adminName}...`);
                                                        try {
                                                            const result = await impersonateTenantAction(tenant.id);
                                                            if (result.success && result.redirectUrl) {
                                                                toast.dismiss(loadingToast);
                                                                toast.success("Login successful! Redirecting...", { duration: 2000 });
                                                                router.push(result.redirectUrl);
                                                            } else {
                                                                toast.dismiss(loadingToast);
                                                                toast.error(result.error || "Impersonation failed");
                                                            }
                                                        } catch (error) {
                                                            toast.dismiss(loadingToast);
                                                            toast.error("Failed to impersonate");
                                                        }
                                                    }}
                                                    title="Impersonate"
                                                    className="p-2 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                >
                                                    <LogIn className="h-4 w-4" />
                                                </button>

                                                {tenant.status === "SUSPENDED" ? (
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("Activate this tenant?")) {
                                                                await updateTenantStatusAction(tenant.id, "ACTIVE");
                                                                await loadTenants();
                                                            }
                                                        }}
                                                        title="Activate"
                                                        className="p-2 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                                    >
                                                        <Play className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("Suspend this tenant?")) {
                                                                await updateTenantStatusAction(tenant.id, "SUSPENDED");
                                                                await loadTenants();
                                                            }
                                                        }}
                                                        title="Suspend"
                                                        className="p-2 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Permanently delete this tenant? This cannot be undone.")) {
                                                            await deleteTenantAction(tenant.id);
                                                            await loadTenants();
                                                        }
                                                    }}
                                                    title="Delete"
                                                    className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                                                <p className="font-bold text-zinc-900">Loading schools...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                                                    <Search className="h-6 w-6 text-zinc-400" />
                                                </div>
                                                <p className="font-bold text-zinc-900">No schools found</p>
                                                <p className="text-sm">Try adjusting your filters or search query.</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-6 py-4">
                    <p className="text-xs font-medium text-zinc-500">
                        Showing <span className="font-bold text-zinc-900">{Math.min(filteredTenants.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-bold text-zinc-900">{Math.min(filteredTenants.length, currentPage * itemsPerPage)}</span> of <span className="font-bold text-zinc-900">{filteredTenants.length}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
