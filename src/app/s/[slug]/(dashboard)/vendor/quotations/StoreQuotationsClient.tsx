"use client";

import { useState } from "react";
import { Search, FileText, CheckCircle2, Clock, XCircle, Store, ChevronRight } from "lucide-react";
import Link from "next/link";
import { updateQuotationStatusAction } from "@/app/actions/vendor-actions";

export default function StoreQuotationsClient({ slug, initialQuotations }: { slug: string, initialQuotations: any[] }) {
    const [quotations, setQuotations] = useState(initialQuotations);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Derived state
    const filteredQuotes = quotations.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
            q.vendor?.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleUpdateStatus = async (quoteId: string, status: string) => {
        const res = await updateQuotationStatusAction(slug, quoteId, status);
        if (res.success && res.data) {
            setQuotations(quotations.map(q => q.id === quoteId ? res.data : q));
        } else {
            alert(res.error || "Failed to update quotation");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "ACCEPTED":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> {status}</span>;
            case "REJECTED":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="h-3 w-3" /> {status}</span>;
            case "REVIEW":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> {status}</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quotations (RFQs)</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Review and compare product quotations from your vendors.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search quotes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="REVIEW">Under Review</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Quotation Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Vendor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Date Received</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredQuotes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="h-10 w-10 text-slate-300 mb-2" />
                                            {search || statusFilter !== "ALL" ? "No quotations match your filters." : "No quotations uploaded yet."}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{quote.title}</div>
                                            {quote.documentUrl && (
                                                <a href={quote.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand font-medium hover:underline inline-flex items-center gap-1 mt-1">
                                                    <FileText className="h-3 w-3" /> View Document PDF
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/s/${slug}/vendor/vendors/${quote.vendorId}`} className="flex items-center hover:text-brand transition-colors">
                                                <Store className="h-4 w-4 text-slate-400 mr-2" />
                                                <span className="text-sm font-medium">{quote.vendor?.name}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{new Date(quote.createdAt).toLocaleDateString()}</div>
                                            {quote.validUntil && <div className="text-xs text-slate-500">Valid till: {new Date(quote.validUntil).toLocaleDateString()}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={quote.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {quote.status === "REVIEW" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleUpdateStatus(quote.id, "ACCEPTED")} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 transition-colors">Accept</button>
                                                    <button onClick={() => handleUpdateStatus(quote.id, "REJECTED")} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 border border-slate-200 transition-colors">Reject</button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs font-medium">No actions available</span>
                                            )}
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
