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
    ListFilter,
    Banknote,
    X
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { getBillingDashboardAction } from "@/app/actions/billing-dashboard-actions";
import { recordPaymentAction } from "@/app/actions/fee-actions";
import { format } from "date-fns";
import { toast } from "sonner";
import { getCookie } from "@/lib/cookies";
import { useSidebar } from "@/context/SidebarContext";
import { reconcileOrphanFeesAction } from "@/app/actions/billing-maintenance-actions";
import { SectionHeader } from "@/components/ui/erp-ui";

export default function BillingDashboard() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const { currency } = useSidebar();

    // Payment Modal State
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );

    // Query State
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortConfig, setSortConfig] = useState<{ field: string, direction: "asc" | "desc" }>({
        field: "dueDate",
        direction: "desc"
    });

    // Immediate load for pagination and filters
    useEffect(() => {
        loadData();
    }, [slug, page, statusFilter, sortConfig]);

    // Debounced load for search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) loadData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Clear search immediate trigger
    useEffect(() => {
        if (searchTerm === "") {
            loadData();
        }
    }, [searchTerm]);

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

    const formatCurrency = (amount: number) => {
        return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        const amt = parseFloat(paymentAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        setIsSubmittingPayment(true);
        const res = await recordPaymentAction(
            slug,
            selectedInvoice.id,
            amt,
            paymentMethod,
            paymentReference || "Manual Payment",
            new Date(paymentDate)
        );

        if (res.success) {
            toast.success("Payment recorded successfully!");
            setSelectedInvoice(null);
            setPaymentReference("");
            loadData(); // Refresh the grid
        } else {
            toast.error(res.error || "Failed to record payment");
        }
        setIsSubmittingPayment(false);
    }

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
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80, position: "relative" }}>
            {/* Payment Modal (unchanged) */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-brand" />
                                Record Payment
                            </h2>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount Received</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">{currency}</span>
                                    <input
                                        type="number" step="0.01" min="0.01"
                                        max={selectedInvoice.amount - (selectedInvoice.paid || 0)}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-zinc-900 transition-shadow"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-zinc-400 text-right mt-1">Remaining: {formatCurrency(selectedInvoice.amount - (selectedInvoice.paid || 0))}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Method</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-zinc-900" required>
                                    <option value="CASH">Cash</option>
                                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                                    <option value="CARD">Credit / Debit Card</option>
                                    <option value="UPI">UPI / Mobile Payment</option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Reference / Notes</label>
                                <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)}
                                    placeholder="e.g. Transaction ID, UTR"
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-zinc-900" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Date</label>
                                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-zinc-900" required />
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setSelectedInvoice(null)}
                                    className="px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmittingPayment}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-zinc-900 font-bold text-sm hover:brightness-110 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmittingPayment ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Confirm Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <SectionHeader
                title="Billing & Invoices"
                subtitle="Manage student fees, generate invoices, and track payments."
                icon={CreditCard}
                action={
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Link href={`/s/${slug}/billing/bulk`}
                            style={{ display: "flex", alignItems: "center", gap: 8, height: 42, padding: "0 18px", borderRadius: 12, background: "var(--brand)", color: "var(--secondary-color)", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                            <Plus className="h-4 w-4" />
                            Bulk Generate
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50" title="More options">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href={`/s/${slug}/settings/fees`} className="flex items-center gap-2"><FileText className="h-4 w-4" />Fee Structures</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/s/${slug}/accounts/transactions`} className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Transactions</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={async () => {
                                    const academicYearId = getCookie(`academic_year_${slug}`) || undefined;
                                    const res = await reconcileOrphanFeesAction(slug, academicYearId);
                                    if (res.success) { toast.success(res.message); loadData(); } else { toast.error(res.error); }
                                }} className="flex items-center gap-2 text-amber-600 focus:text-amber-700 cursor-pointer">
                                    <AlertCircle className="h-4 w-4" />Reconcile Invoices
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Billed"
                    value={formatCurrency(data?.stats?.totalBilled || 0)}
                    subValue="All time"
                    icon={FileText}
                    color="brand"
                />
                <StatCard
                    title="Collected"
                    value={formatCurrency(data?.stats?.collected || 0)}
                    subValue={`${data?.stats?.totalBilled ? Math.round((data.stats.collected / data.stats.totalBilled) * 100) : 0}% collection rate`}
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="Pending"
                    value={formatCurrency(data?.stats?.pending || 0)}
                    subValue="Receivables"
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    title="Overdue"
                    value={formatCurrency(data?.stats?.overdue || 0)}
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
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
                    <div className="flex bg-zinc-100/50 p-1 rounded-xl border border-zinc-200/50 dark:bg-zinc-900/50 dark:border-zinc-800/50 w-max">
                        {['ALL', 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE'].map((status) => (
                            <button
                                key={status}
                                onClick={() => { setStatusFilter(status); setPage(1); }}
                                className={cn(
                                    "px-4 py-2 text-sm font-bold rounded-lg transition-all capitalize whitespace-nowrap",
                                    statusFilter === status
                                        ? "bg-white text-brand shadow-sm ring-1 ring-zinc-900/5 dark:bg-zinc-800 dark:text-brand"
                                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:text-zinc-100"
                                )}
                            >
                                {status.toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
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
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(inv.amount)}</span>
                                                    {inv.paid > 0 && (
                                                        <span className="text-[10px] text-green-600 font-medium">Paid: {formatCurrency(inv.paid)}</span>
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 transition-colors"
                                                            title="Options"
                                                        >
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-40">
                                                        {(inv.amount - (inv.paid || 0)) > 0 && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedInvoice(inv);
                                                                    setPaymentAmount((inv.amount - (inv.paid || 0)).toString());
                                                                }}
                                                                className="flex items-center gap-2 cursor-pointer text-brand focus:text-brand"
                                                            >
                                                                <Banknote className="h-4 w-4" />
                                                                Record Payment
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/s/${slug}/billing/invoice/${inv.id}`} className="flex items-center gap-2 cursor-pointer">
                                                                <FileText className="h-4 w-4" />
                                                                View / Print
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
