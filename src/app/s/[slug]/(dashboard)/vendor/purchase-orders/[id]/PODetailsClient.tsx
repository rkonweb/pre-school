"use client";

import { useState } from "react";
import { ArrowLeft, Building2, Calendar, FileText, CheckCircle2, Clock, XCircle, PackagePlus, Receipt, ChevronRight } from "lucide-react";
import Link from "next/link";
import { updatePurchaseOrderStatusAction, receivePurchaseOrderItemsAction } from "@/app/actions/vendor-actions";

export default function PODetailsClient({ slug, initialPO }: { slug: string, initialPO: any }) {
    const [po, setPo] = useState(initialPO);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for receiving items modal
    const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
    const [receivingItems, setReceivingItems] = useState<{ id: string, name: string, ordered: number, receivedSoFar: number, toReceive: number }[]>([]);

    const handleUpdateStatus = async (newStatus: string) => {
        setIsSubmitting(true);
        // Using 'System Admin' as the generic default ID until user context is integrated
        const res = await updatePurchaseOrderStatusAction(slug, po.id, newStatus, newStatus === "APPROVED" ? "System Admin" : undefined);
        if (res.success && res.data) {
            setPo({ ...po, status: res.data.status, approvalDate: res.data.approvalDate, approvedById: res.data.approvedById });
        } else {
            alert(res.error || "Failed to update PO status");
        }
        setIsSubmitting(false);
    };

    const openReceivingModal = () => {
        const initialReceivingData = po.items.map((item: any) => ({
            id: item.id,
            name: item.customItemName || "Catalog Item",
            ordered: item.quantity,
            receivedSoFar: item.receivedQuantity,
            toReceive: 0
        }));
        setReceivingItems(initialReceivingData);
        setIsReceivingModalOpen(true);
    };

    const handleReceiveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const updates = receivingItems.map(item => ({
            id: item.id,
            receivedQuantity: item.receivedSoFar + item.toReceive
        }));

        const res = await receivePurchaseOrderItemsAction(slug, po.id, updates);
        if (res.success) {
            // Optimistically update the local state
            const updatedItems = po.items.map((item: any) => {
                const update = updates.find(u => u.id === item.id);
                if (update) {
                    return { ...item, receivedQuantity: update.receivedQuantity };
                }
                return item;
            });

            const allReceived = updatedItems.every((i: any) => i.receivedQuantity >= i.quantity);
            const anyReceived = updatedItems.some((i: any) => i.receivedQuantity > 0);
            let newStatus = po.status;
            if (allReceived) newStatus = "COMPLETED";
            else if (anyReceived) newStatus = "PARTIAL_RECEIVED";

            setPo({ ...po, items: updatedItems, status: newStatus });
            setIsReceivingModalOpen(false);
        } else {
            alert(res.error || "Failed to save received quantities");
        }
        setIsSubmitting(false);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "ACCEPTED":
            case "COMPLETED":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-4 w-4" /> {status.replace("_", " ")}</span>;
            case "REJECTED":
            case "CANCELLED":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="h-4 w-4" /> {status.replace("_", " ")}</span>;
            case "DRAFT":
            case "REVIEW":
            case "PENDING_APPROVAL":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-4 w-4" /> {status.replace("_", " ")}</span>;
            case "ISSUED":
            case "PARTIAL_RECEIVED":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"><Clock className="h-4 w-4" /> {status.replace("_", " ")}</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
        }
    };

    const actionButtons = () => {
        switch (po.status) {
            case "DRAFT":
                return (
                    <button disabled={isSubmitting} onClick={() => handleUpdateStatus("PENDING_APPROVAL")} className="bg-brand text-[var(--secondary-color)] px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 shadow-sm transition-all disabled:opacity-50">
                        Submit for Approval
                    </button>
                );
            case "PENDING_APPROVAL":
                return (
                    <div className="flex gap-2">
                        <button disabled={isSubmitting} onClick={() => handleUpdateStatus("APPROVED")} className="bg-brand-gradient text-[var(--secondary-color)] px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 shadow-lg shadow-brand/20 transition-all disabled:opacity-50 border-none">
                            Approve PO
                        </button>
                        <button disabled={isSubmitting} onClick={() => handleUpdateStatus("DRAFT")} className="bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 shadow-sm transition-all disabled:opacity-50">
                            Reject
                        </button>
                    </div>
                );
            case "APPROVED":
                return (
                    <button disabled={isSubmitting} onClick={() => handleUpdateStatus("ISSUED")} className="bg-brand text-[var(--secondary-color)] px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 shadow-lg shadow-brand/20 transition-all disabled:opacity-50">
                        Mark as Issued to Vendor
                    </button>
                );
            case "ISSUED":
            case "PARTIAL_RECEIVED":
                return (
                    <button disabled={isSubmitting} onClick={openReceivingModal} className="flex items-center gap-2 bg-brand-gradient text-[var(--secondary-color)] px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 shadow-lg shadow-brand/20 transition-all disabled:opacity-50 border-none">
                        <PackagePlus className="h-4 w-4" /> Receive Goods
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            <Link href={`/s/${slug}/vendor/purchase-orders`} className="inline-flex items-center text-sm text-slate-500 hover:text-brand transition-colors mb-2">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Purchase Orders
            </Link>

            {/* Header & Status */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{po.poNumber}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={po.status} />
                        <span className="text-sm text-slate-500 ml-2">Total Amount: <strong className="text-slate-900">₹{po.totalAmount.toLocaleString()}</strong></span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {actionButtons()}
                    {po.status !== "CANCELLED" && po.status !== "COMPLETED" && (
                        <button onClick={() => { if (confirm("Are you sure you want to cancel this PO?")) handleUpdateStatus("CANCELLED"); }} className="text-sm font-medium text-rose-600 hover:text-rose-700 px-3">
                            Cancel PO
                        </button>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Col - Details */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-brand" /> Vendor Details</h3>
                        <div>
                            <p className="text-sm font-medium text-slate-900">{po.vendor?.name}</p>
                            {po.vendor?.contactPerson && <p className="text-sm text-slate-500 mt-1">{po.vendor.contactPerson}</p>}
                            {po.vendor?.email && <p className="text-sm text-slate-500 mt-1">{po.vendor.email}</p>}
                            {po.vendor?.phone && <p className="text-sm text-slate-500 mt-1">{po.vendor.phone}</p>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <Link href={`/s/${slug}/vendor/vendors/${po.vendorId}`} className="text-sm text-brand font-medium hover:underline flex items-center">
                                View Vendor Profile <ChevronRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Calendar className="h-4 w-4 text-brand" /> Timelines</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500">Order Date</p>
                                <p className="text-sm font-medium text-slate-900">{new Date(po.orderDate).toLocaleDateString()}</p>
                            </div>
                            {po.expectedDelivery && (
                                <div>
                                    <p className="text-xs text-slate-500">Expected Delivery</p>
                                    <p className="text-sm font-medium text-slate-900">{new Date(po.expectedDelivery).toLocaleDateString()}</p>
                                </div>
                            )}
                            {po.approvalDate && (
                                <div>
                                    <p className="text-xs text-slate-500">Approved On</p>
                                    <p className="text-sm font-medium text-emerald-600">{new Date(po.approvalDate).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Col - Items */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Receipt className="h-4 w-4 text-brand" /> Line Items</h3>
                            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{po.items?.length || 0} items</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Item Description</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Qty</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Rate</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Total</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase">Received</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {po.items?.map((item: any, idx: number) => (
                                        <tr key={idx} className={item.receivedQuantity >= item.quantity ? "bg-emerald-50/30" : ""}>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.customItemName || "Catalog Item"}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-right">{item.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-right">₹{item.unitRate.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">₹{item.total.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-right">
                                                <span className={item.receivedQuantity >= item.quantity ? "text-emerald-600" : (item.receivedQuantity > 0 ? "text-amber-600" : "text-slate-400")}>
                                                    {item.receivedQuantity} / {item.quantity}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-sm font-bold text-slate-900 text-right uppercase">PO Total</td>
                                        <td className="px-6 py-4 text-base font-black text-brand text-right">₹{po.totalAmount.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {po.notes && (
                        <div className="mt-6 bg-amber-50 rounded-2xl border border-amber-100 p-6">
                            <h3 className="text-sm font-semibold text-amber-800 mb-2">Terms & Notes</h3>
                            <p className="text-sm text-amber-700 whitespace-pre-wrap leading-relaxed">{po.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Receiving Modal */}
            {isReceivingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Receive Goods (GRN)</h2>
                                <p className="text-sm text-slate-500 mt-1">Record the quantities delivered by the vendor.</p>
                            </div>
                            <button onClick={() => setIsReceivingModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                        </div>
                        <form onSubmit={handleReceiveSubmit} className="p-6">
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {receivingItems.map((item, idx) => {
                                    const remaining = item.ordered - item.receivedSoFar;
                                    const isDone = remaining === 0;

                                    return (
                                        <div key={item.id} className={`p-4 rounded-xl border ${isDone ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold text-slate-900">{item.name}</h4>
                                                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded">Ordered: {item.ordered}</span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-500 mb-1">Previously Received</p>
                                                    <p className="text-sm font-medium text-slate-900">{item.receivedSoFar} units</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-500 mb-1">Pending Delivery</p>
                                                    <p className={`text-sm font-bold ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>{remaining} units</p>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-slate-700 mb-1">Receiving Now</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={remaining}
                                                        disabled={isDone}
                                                        value={item.toReceive}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            const newItems = [...receivingItems];
                                                            newItems[idx].toReceive = Math.min(val, remaining);
                                                            setReceivingItems(newItems);
                                                        }}
                                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-brand focus:border-brand disabled:bg-slate-100 disabled:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsReceivingModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-brand-gradient text-[var(--secondary-color)] text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-50 shadow-[0_10px_25px_-5px_rgba(var(--brand-color-rgb),0.4)] border-none">
                                    {isSubmitting ? "Saving..." : "Record Goods Receipt"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
