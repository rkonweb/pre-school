"use client";

import { useState } from "react";
import { ArrowLeft, Building2, Mail, Phone, MapPin, Receipt, FileText, Plus, CheckCircle2, Clock, XCircle, FileUp } from "lucide-react";
import Link from "next/link";
import { uploadQuotationAction, updateQuotationStatusAction, updateVendorAction } from "@/app/actions/vendor-actions";

export default function VendorProfileClient({ slug, initialVendor }: { slug: string, initialVendor: any }) {
    const [vendor, setVendor] = useState(initialVendor);
    const [activeTab, setActiveTab] = useState<"POS" | "QUOTES">("QUOTES");

    // Quotation Upload Modal
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quoteTitle, setQuoteTitle] = useState("");
    const [quoteUrl, setQuoteUrl] = useState("");

    const handleUploadQuotation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quoteTitle) return;
        setIsSubmitting(true);
        const res = await uploadQuotationAction(slug, {
            vendorId: vendor.id,
            title: quoteTitle,
            documentUrl: quoteUrl || ""
        });

        if (res.success && res.data) {
            setVendor({ ...vendor, quotations: [res.data, ...(vendor.quotations || [])] });
            setIsUploadModalOpen(false);
            setQuoteTitle("");
            setQuoteUrl("");
        } else {
            alert(res.error || "Failed to upload quote");
        }
        setIsSubmitting(false);
    };

    const handleUpdateQuoteStatus = async (quoteId: string, status: string) => {
        const res = await updateQuotationStatusAction(slug, quoteId, status);
        if (res.success && res.data) {
            setVendor({
                ...vendor,
                quotations: vendor.quotations.map((q: any) => q.id === quoteId ? res.data : q)
            });
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "ACCEPTED":
            case "COMPLETED":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> {status}</span>;
            case "REJECTED":
            case "CANCELLED":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="h-3 w-3" /> {status}</span>;
            case "DRAFT":
            case "REVIEW":
            case "PENDING_APPROVAL":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> {status}</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            <Link href={`/s/${slug}/vendor/vendors`} className="inline-flex items-center text-sm text-slate-500 hover:text-brand transition-colors mb-2">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
            </Link>

            {/* Vendor Header Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex gap-4 items-start">
                    <div className="h-16 w-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{vendor.name}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {vendor.categories?.map((cat: string) => (
                                <span key={cat} className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                    {cat}
                                </span>
                            ))}
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                                {vendor.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-600 w-full md:w-auto">
                    {vendor.contactPerson && (
                        <div className="flex items-center gap-2"><div className="w-6 flex justify-center"><Building2 className="h-4 w-4 text-slate-400" /></div>{vendor.contactPerson}</div>
                    )}
                    {vendor.phone && (
                        <div className="flex items-center gap-2"><div className="w-6 flex justify-center"><Phone className="h-4 w-4 text-slate-400" /></div>{vendor.phone}</div>
                    )}
                    {vendor.email && (
                        <div className="flex items-center gap-2"><div className="w-6 flex justify-center"><Mail className="h-4 w-4 text-slate-400" /></div>{vendor.email}</div>
                    )}
                    {vendor.address && (
                        <div className="flex items-center gap-2"><div className="w-6 flex justify-center"><MapPin className="h-4 w-4 text-slate-400" /></div>{vendor.address}</div>
                    )}
                    {vendor.taxId && (
                        <div className="flex items-center gap-2"><div className="w-6 flex justify-center"><FileText className="h-4 w-4 text-slate-400" /></div>GST/VAT: {vendor.taxId}</div>
                    )}
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab("QUOTES")}
                        className={`flex-1 flex items-center justify-center py-4 text-sm font-medium transition-colors ${activeTab === "QUOTES" ? "text-brand border-b-2 border-brand" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                    >
                        <FileText className="h-4 w-4 mr-2" /> Quotations (RFQs)
                    </button>
                    <button
                        onClick={() => setActiveTab("POS")}
                        className={`flex-1 flex items-center justify-center py-4 text-sm font-medium transition-colors ${activeTab === "POS" ? "text-brand border-b-2 border-brand" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                    >
                        <Receipt className="h-4 w-4 mr-2" /> Purchase Orders
                    </button>
                </div>

                <div className="p-0">
                    {/* QUOTATIONS TAB */}
                    {activeTab === "QUOTES" && (
                        <div>
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Submitted Quotes</h3>
                                    <p className="text-sm text-slate-500">Track and review quotes submitted by this vendor.</p>
                                </div>
                                <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                                    <FileUp className="h-4 w-4" /> Upload Quote
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {(!vendor.quotations || vendor.quotations.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <FileText className="h-12 w-12 text-slate-200 mb-3" />
                                        <p className="text-slate-500 font-medium">No quotations uploaded yet.</p>
                                    </div>
                                ) : (
                                    vendor.quotations.map((quote: any) => (
                                        <div key={quote.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-semibold text-slate-900">{quote.title}</h4>
                                                    <StatusBadge status={quote.status} />
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-3">
                                                    <span>Uploaded: {new Date(quote.createdAt).toLocaleDateString()}</span>
                                                    {quote.validUntil && <span>Valid till: {new Date(quote.validUntil).toLocaleDateString()}</span>}
                                                </p>
                                                {quote.documentUrl && (
                                                    <a href={quote.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-brand font-medium hover:underline">
                                                        <FileText className="h-3.5 w-3.5" /> View Document
                                                    </a>
                                                )}
                                            </div>

                                            {quote.status === "REVIEW" && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleUpdateQuoteStatus(quote.id, "ACCEPTED")} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 transition-colors">Accept</button>
                                                    <button onClick={() => handleUpdateQuoteStatus(quote.id, "REJECTED")} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 border border-rose-200 transition-colors">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* POs TAB */}
                    {activeTab === "POS" && (
                        <div>
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Purchase Orders</h3>
                                    <p className="text-sm text-slate-500">History of POs issued to {vendor.name}.</p>
                                </div>
                                <Link href={`/s/${slug}/vendor/purchase-orders/new?vendorId=${vendor.id}`} className="flex items-center gap-2 bg-brand text-[var(--secondary-color)] px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-colors">
                                    <Plus className="h-4 w-4" /> Raise PO
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {(!vendor.purchaseOrders || vendor.purchaseOrders.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Receipt className="h-12 w-12 text-slate-200 mb-3" />
                                        <p className="text-slate-500 font-medium">No purchase orders found.</p>
                                    </div>
                                ) : (
                                    vendor.purchaseOrders.map((po: any) => (
                                        <Link key={po.id} href={`/s/${slug}/vendor/purchase-orders/${po.id}`} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-semibold text-slate-900 group-hover:text-brand transition-colors">{po.poNumber}</h4>
                                                    <StatusBadge status={po.status} />
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-3">
                                                    <span>Issued: {new Date(po.orderDate).toLocaleDateString()}</span>
                                                    {po.expectedDelivery && <span>Expected: {new Date(po.expectedDelivery).toLocaleDateString()}</span>}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900">₹{po.totalAmount.toLocaleString()}</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Quote Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Upload Quotation</h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                        </div>
                        <form onSubmit={handleUploadQuotation} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title / Description *</label>
                                <input required type="text" value={quoteTitle} onChange={e => setQuoteTitle(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand focus:border-brand" placeholder="e.g. Uniform Quotation 2026-27" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Document URL (Optional for testing)</label>
                                <input type="url" value={quoteUrl} onChange={e => setQuoteUrl(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand focus:border-brand" placeholder="https://..." />
                                <p className="text-xs text-slate-500 mt-1">Leave blank to use a dummy PDF placeholder.</p>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200">Cancel</button>
                                <button type="submit" disabled={isSubmitting || !quoteTitle} className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50">
                                    {isSubmitting ? "Uploading..." : "Upload Quote"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
