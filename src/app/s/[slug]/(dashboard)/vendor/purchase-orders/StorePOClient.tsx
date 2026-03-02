"use client";

import { useState, useMemo, useTransition } from "react";
import {
    Plus, Search, Receipt, CheckCircle2, Clock, XCircle, Store, Settings2,
    GripVertical, ArrowRight, Trash2, ChevronUp, ChevronDown, Filter,
    FileText, AlertCircle, PackageCheck, RefreshCw, Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { updatePurchaseOrderStatusAction, deletePurchaseOrderAction } from "@/app/actions/vendor-actions";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { toast } from "sonner";

type PO = {
    id: string;
    poNumber: string;
    vendorId: string;
    orderDate: string | Date;
    expectedDelivery?: string | Date | null;
    status: string;
    totalAmount: number;
    notes?: string | null;
    items: { id: string; customItemName?: string | null; quantity: number; unitRate: number; total: number; receivedQuantity: number }[];
    vendor: { id: string; name: string } | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    DRAFT: { label: "Draft", color: "bg-zinc-100 text-zinc-600 border-zinc-200", icon: <FileText className="h-3 w-3" /> },
    PENDING_APPROVAL: { label: "Pending Approval", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="h-3 w-3" /> },
    APPROVED: { label: "Approved", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <CheckCircle2 className="h-3 w-3" /> },
    ISSUED: { label: "Issued", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: <RefreshCw className="h-3 w-3" /> },
    PARTIAL_RECEIVED: { label: "Partial Received", color: "bg-orange-50 text-orange-700 border-orange-200", icon: <AlertCircle className="h-3 w-3" /> },
    COMPLETED: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <PackageCheck className="h-3 w-3" /> },
    CANCELLED: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200", icon: <XCircle className="h-3 w-3" /> },
};

const STATUS_ORDER = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "ISSUED", "PARTIAL_RECEIVED", "COMPLETED", "CANCELLED"];

const TAB_STATUSES: Record<string, string[]> = {
    active: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "ISSUED"],
    receiving: ["PARTIAL_RECEIVED"],
    completed: ["COMPLETED"],
    cancelled: ["CANCELLED"],
    all: [],
};

const ALL_COLUMNS = [
    { id: "poNumber", label: "PO Number" },
    { id: "vendor", label: "Vendor" },
    { id: "orderDate", label: "PO Date" },
    { id: "expectedDelivery", label: "Expected Delivery" },
    { id: "items", label: "Line Items" },
    { id: "totalAmount", label: "Amount" },
    { id: "status", label: "Status" },
];

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || { label: status, color: "bg-zinc-100 text-zinc-600 border-zinc-200", icon: null };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
            {cfg.icon}{cfg.label}
        </span>
    );
}

export default function StorePOClient({ slug, initialPurchaseOrders }: { slug: string; initialPurchaseOrders: PO[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [orders, setOrders] = useState<PO[]>(initialPurchaseOrders);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"active" | "receiving" | "completed" | "cancelled" | "all">("active");
    const [sortConfig, setSortConfig] = useState<{ field: string; dir: "asc" | "desc" }>({ field: "orderDate", dir: "desc" });
    const [showColumnToggle, setShowColumnToggle] = useState(false);
    const [columns, setColumns] = useState(ALL_COLUMNS);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        poNumber: true, vendor: true, orderDate: true, expectedDelivery: true,
        items: true, totalAmount: true, status: true,
    });

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const next = Array.from(columns);
        const [moved] = next.splice(result.source.index, 1);
        next.splice(result.destination.index, 0, moved);
        setColumns(next);
    };

    const handleSort = (field: string) => {
        setSortConfig(c => ({ field, dir: c.field === field && c.dir === "asc" ? "desc" : "asc" }));
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortConfig.field !== field) return null;
        return sortConfig.dir === "asc" ? <ChevronUp className="w-3.5 h-3.5 ml-1 inline" /> : <ChevronDown className="w-3.5 h-3.5 ml-1 inline" />;
    };

    const handleStatusChange = async (poId: string, newStatus: string) => {
        startTransition(async () => {
            const res = await updatePurchaseOrderStatusAction(slug, poId, newStatus);
            if (res.success) {
                setOrders(prev => prev.map(o => o.id === poId ? { ...o, status: newStatus } : o));
                toast.success(`PO status updated to ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`);
            } else {
                toast.error(res.error || "Failed to update status");
            }
        });
    };

    const handleDelete = async (po: PO) => {
        if (!confirm(`Delete PO "${po.poNumber}"? This cannot be undone.`)) return;
        startTransition(async () => {
            const res = await deletePurchaseOrderAction(slug, po.id);
            if (res.success) {
                setOrders(prev => prev.filter(o => o.id !== po.id));
                toast.success(`${po.poNumber} deleted`);
            } else {
                toast.error(res.error || "Failed to delete PO");
            }
        });
    };

    const filtered = useMemo(() => {
        const tabStatuses = TAB_STATUSES[activeTab];
        return orders
            .filter(po => {
                if (tabStatuses.length > 0 && !tabStatuses.includes(po.status)) return false;
                if (search.length >= 2) {
                    const q = search.toLowerCase();
                    return po.poNumber.toLowerCase().includes(q) || (po.vendor?.name || "").toLowerCase().includes(q);
                }
                return true;
            })
            .sort((a, b) => {
                const dir = sortConfig.dir === "asc" ? 1 : -1;
                if (sortConfig.field === "totalAmount") return (a.totalAmount - b.totalAmount) * dir;
                if (sortConfig.field === "orderDate") return (new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()) * dir;
                if (sortConfig.field === "vendor") return (a.vendor?.name ?? "").localeCompare(b.vendor?.name ?? "") * dir;
                return a.poNumber.localeCompare(b.poNumber) * dir;
            });
    }, [orders, search, activeTab, sortConfig]);

    // Stats — use Number() to guard against Prisma Decimal serialised as string
    const totalValue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const byStatus = (s: string) => orders.filter(o => o.status === s).length;
    const pendingValue = orders
        .filter(o => ["DRAFT", "PENDING_APPROVAL", "APPROVED", "ISSUED"].includes(o.status))
        .reduce((s, o) => s + Number(o.totalAmount), 0);

    // Smart Indian rupee formatter: Cr / L / K / full
    const formatINR = (n: number) => {
        if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
        if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
        if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
        return `₹${n.toLocaleString("en-IN")}`;
    };

    const tabs = [
        { key: "active", label: "Active", count: orders.filter(o => TAB_STATUSES.active.includes(o.status)).length },
        { key: "receiving", label: "Receiving", count: orders.filter(o => TAB_STATUSES.receiving.includes(o.status)).length },
        { key: "completed", label: "Completed", count: orders.filter(o => TAB_STATUSES.completed.includes(o.status)).length },
        { key: "cancelled", label: "Cancelled", count: orders.filter(o => TAB_STATUSES.cancelled.includes(o.status)).length },
        { key: "all", label: "All Orders", count: orders.length },
    ] as const;

    const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

    return (
        <div className="flex flex-col gap-6 pb-20 min-w-0">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Purchase Orders</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage procurements raised to vendors.</p>
                </div>
                <Link
                    href={`/s/${slug}/vendor/purchase-orders/new`}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-brand/90 transition-all self-start"
                >
                    <Plus className="h-4 w-4" /> Raise PO
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total POs", value: orders.length, sub: `${byStatus("DRAFT")} drafts`, color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20" },
                    { label: "Pending Value", value: formatINR(pendingValue), sub: `${TAB_STATUSES.active.reduce((c, s) => c + byStatus(s), 0)} open orders`, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20" },
                    { label: "Total Value", value: formatINR(totalValue), sub: `avg ${orders.length ? formatINR(Math.round(totalValue / orders.length)) : '₹0'} / PO`, color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-100 dark:border-purple-500/20" },
                    { label: "Completed", value: byStatus("COMPLETED"), sub: `${byStatus("PARTIAL_RECEIVED")} still receiving`, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} px-5 py-4`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-60 ${s.color}`}>{s.label}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        <p className={`text-[11px] font-medium mt-0.5 opacity-50 ${s.color}`}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2",
                                activeTab === tab.key
                                    ? "border-brand text-brand"
                                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
                            )}
                        >
                            {tab.label}
                            <span className={cn(
                                "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-black",
                                activeTab === tab.key ? "bg-brand/10 text-brand" : "bg-zinc-100 text-zinc-500"
                            )}>{tab.count}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search PO number or vendor..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        title="Search purchase orders"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:ring-4 focus:ring-brand/10 focus:border-brand focus:outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowColumnToggle(!showColumnToggle)}
                        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                        title="Customize Columns"
                    >
                        <Settings2 className="h-4 w-4" /> Columns
                    </button>
                    {showColumnToggle && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowColumnToggle(false)} />
                            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl z-20">
                                <p className="mb-2 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">Visible Columns</p>
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="po-cols">
                                        {prov => (
                                            <div className="space-y-1" {...prov.droppableProps} ref={prov.innerRef}>
                                                {columns.map((col, idx) => (
                                                    <Draggable key={col.id} draggableId={col.id} index={idx}>
                                                        {(prov2, snap) => (
                                                            <div
                                                                ref={prov2.innerRef}
                                                                {...prov2.draggableProps}
                                                                className={cn("flex items-center justify-between rounded-md px-2 py-1.5 text-sm", snap.isDragging && "bg-zinc-50 shadow ring-1 ring-zinc-200")}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div {...prov2.dragHandleProps} className="cursor-grab text-zinc-400 hover:text-zinc-600">
                                                                        <GripVertical className="h-4 w-4" />
                                                                    </div>
                                                                    <button className="text-sm text-left" onClick={() => setVisibleColumns(v => ({ ...v, [col.id]: !v[col.id] }))}>
                                                                        <span className={visibleColumns[col.id] ? "text-zinc-900 font-medium" : "text-zinc-400"}>{col.label}</span>
                                                                    </button>
                                                                </div>
                                                                {visibleColumns[col.id] && <Check className="h-4 w-4 text-brand shrink-0" />}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {prov.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-800 dark:text-zinc-400">
                                <th className="px-6 py-4 font-medium sticky left-0 bg-zinc-50 dark:bg-zinc-800/50 shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 before:content-[''] before:absolute before:inset-0 before:border-r before:border-zinc-200">
                                    Action
                                </th>
                                {columns.map(col => {
                                    if (!visibleColumns[col.id]) return null;
                                    const sortable = ["poNumber", "vendor", "orderDate", "totalAmount"].includes(col.id);
                                    return (
                                        <th
                                            key={col.id}
                                            className={cn("px-6 py-4 font-medium whitespace-nowrap", sortable && "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors")}
                                            onClick={sortable ? () => handleSort(col.id) : undefined}
                                        >
                                            {col.label}<SortIcon field={col.id} />
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleCount + 1} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-zinc-400">
                                            <Receipt className="w-10 h-10 text-zinc-200" />
                                            <p className="font-medium">{search ? "No POs match your search." : "No purchase orders in this tab."}</p>
                                            {!search && (
                                                <Link href={`/s/${slug}/vendor/purchase-orders/new`} className="text-brand text-sm font-bold hover:underline">
                                                    + Raise First PO
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map(po => (
                                <tr key={po.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                    {/* Sticky action cell */}
                                    <td className="px-4 py-4 sticky left-0 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/40 transition-colors shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 before:content-[''] before:absolute before:inset-0 before:border-r before:border-zinc-200">
                                        <div className="flex items-center gap-2 relative z-20">
                                            <StandardActionButton
                                                variant="view"
                                                icon={ArrowRight}
                                                tooltip="View PO Details"
                                                onClick={() => router.push(`/s/${slug}/vendor/purchase-orders/${po.id}`)}
                                            />
                                            {/* Inline status change */}
                                            <select
                                                value={po.status}
                                                title="Change status"
                                                disabled={isPending || po.status === "COMPLETED" || po.status === "CANCELLED"}
                                                onChange={e => handleStatusChange(po.id, e.target.value)}
                                                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-bold text-zinc-600 outline-none focus:border-brand hover:border-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-900 dark:border-zinc-700"
                                            >
                                                {STATUS_ORDER.map(s => (
                                                    <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                                                ))}
                                            </select>
                                            <StandardActionButton
                                                variant="delete"
                                                icon={Trash2}
                                                tooltip="Delete PO"
                                                onClick={() => handleDelete(po)}
                                            />
                                        </div>
                                    </td>

                                    {columns.map(col => {
                                        if (!visibleColumns[col.id]) return null;

                                        if (col.id === "poNumber") return (
                                            <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{po.poNumber}</div>
                                                {po.notes && <div className="text-xs text-zinc-400 mt-0.5 max-w-[160px] truncate" title={po.notes}>{po.notes}</div>}
                                            </td>
                                        );

                                        if (col.id === "vendor") return (
                                            <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                                                        <Store className="h-3.5 w-3.5 text-brand" />
                                                    </div>
                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">{po.vendor?.name ?? "—"}</span>
                                                </div>
                                            </td>
                                        );

                                        if (col.id === "orderDate") return (
                                            <td key={col.id} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                                                {new Date(po.orderDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </td>
                                        );

                                        if (col.id === "expectedDelivery") return (
                                            <td key={col.id} className="px-6 py-4 whitespace-nowrap text-sm">
                                                {po.expectedDelivery ? (
                                                    <span className={cn(
                                                        "font-medium",
                                                        new Date(po.expectedDelivery) < new Date() && !["COMPLETED", "CANCELLED"].includes(po.status)
                                                            ? "text-red-600" : "text-zinc-600 dark:text-zinc-400"
                                                    )}>
                                                        {new Date(po.expectedDelivery).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                        {new Date(po.expectedDelivery) < new Date() && !["COMPLETED", "CANCELLED"].includes(po.status) && " ⚠️"}
                                                    </span>
                                                ) : <span className="text-zinc-300">—</span>}
                                            </td>
                                        );

                                        if (col.id === "items") return (
                                            <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{po.items.length} item{po.items.length !== 1 ? "s" : ""}</span>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-20 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                                                            {po.items.length > 0 && (() => {
                                                                const totalQty = po.items.reduce((s, i) => s + i.quantity, 0);
                                                                const recQty = po.items.reduce((s, i) => s + i.receivedQuantity, 0);
                                                                const pct = totalQty > 0 ? Math.round(recQty / totalQty * 100) : 0;
                                                                return <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />;
                                                            })()}
                                                        </div>
                                                        <span className="text-[10px] text-zinc-400 font-medium">
                                                            {po.items.reduce((s, i) => s + i.receivedQuantity, 0)}/{po.items.reduce((s, i) => s + i.quantity, 0)} rcvd
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        );

                                        if (col.id === "totalAmount") return (
                                            <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-black text-zinc-900 dark:text-zinc-100">
                                                    ₹{po.totalAmount.toLocaleString("en-IN")}
                                                </span>
                                            </td>
                                        );

                                        if (col.id === "status") return (
                                            <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={po.status} />
                                            </td>
                                        );

                                        return null;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
                    <span className="text-sm text-zinc-500">
                        Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{filtered.length}</span> of <span className="font-medium">{orders.length}</span> purchase orders
                    </span>
                    <span className="text-xs text-zinc-400">
                        Total value: <span className="font-bold text-zinc-700 dark:text-zinc-300">₹{totalValue.toLocaleString("en-IN")}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
