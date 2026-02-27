"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { ShoppingBag, CheckCircle2, Clock, CreditCard, Package, Filter, RefreshCw, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { getStoreOrdersAction, markOrderPaidAction, fulfillStoreOrderAction } from "@/app/actions/store-actions";

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    FULFILLED: "bg-emerald-100 text-emerald-700",
    PARTIALLY_FULFILLED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-slate-100 text-slate-500",
};

const PAYMENT_STYLES: Record<string, string> = {
    UNPAID: "bg-rose-100 text-rose-700",
    PAID: "bg-emerald-100 text-emerald-700",
    REFUNDED: "bg-slate-100 text-slate-500",
};

function OrderCard({ order, onRefresh, slug }: { order: any; onRefresh: () => void; slug: string }) {
    const [expanded, setExpanded] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [referenceNo, setReferenceNo] = useState("");

    const handleMarkPaid = () => {
        startTransition(async () => {
            const res = await markOrderPaidAction({ orderId: order.id, slug, paymentMethod, referenceNo });
            if (res.success) { toast.success("Order marked as paid. Inventory deducted & sale recorded in accounts."); onRefresh(); }
            else toast.error(res.error || "Failed to mark paid");
        });
    };

    const handleFulfill = (issuerId: string) => {
        startTransition(async () => {
            const res = await fulfillStoreOrderAction(order.id, issuerId);
            if (res.success) { toast.success("Order fulfilled! Items issued to student."); onRefresh(); }
            else toast.error(res.error || "Failed to fulfill order");
        });
    };

    const studentName = `${order.student?.firstName} ${order.student?.lastName}`;
    const backorderedItems = order.orderItems?.filter((oi: any) => oi.isBackordered) || [];

    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            {/* Card Header */}
            <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-slate-100">
                    {order.sourceType === "PACKAGE" ? <Package className="h-5 w-5 text-violet-500" /> : <ShoppingBag className="h-5 w-5 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{studentName}</p>
                    <p className="text-xs text-slate-400">
                        {order.sourceType === "PACKAGE" ? `📦 ${order.package?.name}` : `🛒 ${order.orderItems?.length} item(s)`}
                        &nbsp;·&nbsp;{new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${PAYMENT_STYLES[order.paymentStatus] || "bg-slate-100 text-slate-500"}`}>
                        {order.paymentStatus}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full hidden sm:inline-block ${STATUS_STYLES[order.status] || "bg-slate-100 text-slate-500"}`}>
                        {order.status.replace(/_/g, " ")}
                    </span>
                    <p className="font-bold text-slate-900 text-sm ml-1">₹{order.totalAmount.toFixed(2)}</p>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                    {/* Backorder warning */}
                    {backorderedItems.length > 0 && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-800">
                                <strong>Backordered items:</strong> {backorderedItems.map((oi: any) => `${oi.item?.name} (${oi.backordered} unit(s) pending)`).join(", ")}
                            </p>
                        </div>
                    )}

                    {/* Order items */}
                    <div className="space-y-2">
                        {order.orderItems?.map((oi: any) => (
                            <div key={oi.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${oi.isIssued ? "bg-emerald-400" : oi.isBackordered ? "bg-amber-400" : "bg-slate-300"}`} />
                                    <span className="text-slate-700">{oi.item?.name}</span>
                                    <span className="text-slate-400 text-xs">×{oi.quantity}</span>
                                    {oi.isBackordered && <span className="text-xs text-amber-600 font-medium">({oi.backordered} backordered)</span>}
                                </div>
                                <span className="font-medium text-slate-800">₹{(oi.unitPrice * oi.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Accounting link */}
                    {order.accountTransaction && (
                        <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                            ✅ Recorded in Accounts as <strong>{order.accountTransaction.transactionNo}</strong>
                        </p>
                    )}

                    {/* Notes */}
                    {order.notes && <p className="text-xs text-slate-500 italic">{order.notes}</p>}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-1">
                        {order.paymentStatus === "UNPAID" && (
                            <div className="flex items-center gap-2 w-full flex-wrap">
                                <select
                                    title="Payment Method"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="rounded-xl border-0 py-2 px-3 text-sm ring-1 ring-slate-200 focus:ring-brand bg-white text-slate-700"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="ONLINE">Online Transfer</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="CARD">Card</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Reference No. (optional)"
                                    value={referenceNo}
                                    onChange={e => setReferenceNo(e.target.value)}
                                    className="flex-1 min-w-0 rounded-xl border-0 py-2 px-3 text-sm ring-1 ring-slate-200 focus:ring-brand bg-white text-slate-700"
                                />
                                <button
                                    onClick={handleMarkPaid}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    {isPending ? "Processing..." : "Mark Paid"}
                                </button>
                            </div>
                        )}
                        {order.paymentStatus === "PAID" && order.status === "PENDING" && (
                            <button
                                onClick={() => handleFulfill("system")}
                                disabled={isPending}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-brand text-[var(--secondary-color)] px-4 py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {isPending ? "Fulfilling..." : "Mark as Issued"}
                            </button>
                        )}
                        {order.status === "FULFILLED" && (
                            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                                <CheckCircle2 className="h-4 w-4" /> All items issued
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function StoreOrdersPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterPayment, setFilterPayment] = useState("");
    const [filterSource, setFilterSource] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const loadOrders = async () => {
        setIsLoading(true);
        const res = await getStoreOrdersAction(slug, {
            paymentStatus: filterPayment || undefined,
            sourceType: filterSource || undefined,
            status: filterStatus || undefined,
        });
        if (res.success) setOrders(res.data);
        setIsLoading(false);
    };

    useEffect(() => { loadOrders(); }, [slug, filterPayment, filterSource, filterStatus]);

    const unpaidCount = orders.filter(o => o.paymentStatus === "UNPAID").length;
    const pendingFulfillment = orders.filter(o => o.paymentStatus === "PAID" && o.status === "PENDING").length;

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Orders & Fulfillment</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {unpaidCount > 0 && <span className="text-rose-600 font-medium">{unpaidCount} unpaid · </span>}
                        {pendingFulfillment > 0 && <span className="text-amber-600 font-medium">{pendingFulfillment} ready to fulfill · </span>}
                        {orders.length} total orders
                    </p>
                </div>
                <button onClick={loadOrders} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Callout banners */}
            {pendingFulfillment > 0 && (
                <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-800">
                        <strong>{pendingFulfillment} order(s)</strong> have been paid and are ready to be physically issued to students.
                    </p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <select title="Filter payment status" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
                    className="rounded-xl border-0 py-2.5 px-4 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-brand bg-white">
                    <option value="">All Payments</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PAID">Paid</option>
                </select>
                <select title="Filter source" value={filterSource} onChange={e => setFilterSource(e.target.value)}
                    className="rounded-xl border-0 py-2.5 px-4 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-brand bg-white">
                    <option value="">All Sources</option>
                    <option value="PACKAGE">Package Orders</option>
                    <option value="ADHOC">Ad-hoc Orders</option>
                </select>
                <select title="Filter status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="rounded-xl border-0 py-2.5 px-4 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-brand bg-white">
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
                </select>
            </div>

            {/* Orders */}
            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ShoppingBag className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No orders found.</p>
                    <p className="text-sm text-slate-400 mt-1">Orders appear here once packages are assigned to students.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map(order => (
                        <OrderCard key={order.id} order={order} onRefresh={loadOrders} slug={slug} />
                    ))}
                </div>
            )}
        </div>
    );
}
