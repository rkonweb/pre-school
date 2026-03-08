"use client";

import { useState, useMemo } from "react";
import {
    ArrowLeft, Plus, Trash2, Receipt, Building2, Phone, Mail,
    MapPin, Search, PackageSearch, Loader2, CalendarDays,
    FileText, Tag, ChevronDown
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPurchaseOrderAction } from "@/app/actions/vendor-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Vendor = {
    id: string;
    name: string;
    contactPerson?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    categories?: string[];
    taxId?: string | null;
    paymentTerms?: string | null;
};

type CatalogItem = {
    id: string;
    name: string;
    type?: string;
    price: number;
};

type LineItem = {
    itemId?: string;
    customItemName: string;
    quantity: number;
    unitRate: number;
};

const inputClass = "w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all";
const labelClass = "block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5";

export default function CreatePOClient({
    slug,
    vendors,
    catalogItems,
}: {
    slug: string;
    vendors: Vendor[];
    catalogItems: CatalogItem[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultVendorId = searchParams.get("vendorId") || "";

    const [vendorId, setVendorId] = useState(defaultVendorId);
    const [expectedDelivery, setExpectedDelivery] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<LineItem[]>([{ customItemName: "", quantity: 1, unitRate: 0 }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Catalog search per line item
    const [catalogSearch, setCatalogSearch] = useState<string[]>([""]);
    const [showSuggestions, setShowSuggestions] = useState<boolean[]>([false]);

    const selectedVendor = vendors.find(v => v.id === vendorId);
    const totalAmount = items.reduce((acc, i) => acc + Number(i.quantity) * Number(i.unitRate), 0);

    const addItem = () => {
        setItems(prev => [...prev, { customItemName: "", quantity: 1, unitRate: 0 }]);
        setCatalogSearch(prev => [...prev, ""]);
        setShowSuggestions(prev => [...prev, false]);
    };

    const removeItem = (idx: number) => {
        setItems(prev => prev.filter((_, i) => i !== idx));
        setCatalogSearch(prev => prev.filter((_, i) => i !== idx));
        setShowSuggestions(prev => prev.filter((_, i) => i !== idx));
    };

    const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
        setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const selectCatalogItem = (idx: number, cat: CatalogItem) => {
        setItems(prev => prev.map((item, i) => i === idx ? {
            ...item, itemId: cat.id, customItemName: cat.name, unitRate: cat.price
        } : item));
        setCatalogSearch(prev => prev.map((s, i) => i === idx ? cat.name : s));
        setShowSuggestions(prev => prev.map((_, i) => i === idx ? false : _));
    };

    const filteredCatalog = (idx: number): CatalogItem[] => {
        const q = catalogSearch[idx]?.toLowerCase() ?? "";
        if (!q || q.length < 1) return catalogItems.slice(0, 8);
        return catalogItems.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorId) { toast.error("Please select a vendor"); return; }
        if (items.some(i => !i.customItemName.trim())) { toast.error("All items must have a name or description"); return; }
        if (totalAmount === 0) { toast.error("Total amount cannot be zero"); return; }

        setIsSubmitting(true);
        const res = await createPurchaseOrderAction(slug, {
            vendorId,
            expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : undefined,
            notes: notes.trim() || undefined,
            items,
        });

        if (res.success && res.data) {
            toast.success(`PO ${res.data.poNumber} created as Draft!`);
            router.push(`/s/${slug}/vendor/purchase-orders/${res.data.id}`);
        } else {
            toast.error(res.error || "Failed to create PO");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-6">

            {/* Back */}
            <button
                onClick={() => router.back()}
                className="group flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-[0.85rem] border border-zinc-200 bg-white group-hover:shadow-sm group-hover:border-zinc-300 transition-all">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Back to Purchase Orders
            </button>

            {/* Title */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
                    <Receipt className="h-7 w-7 text-brand" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Raise Purchase Order</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">Create a new procurement order to send to a vendor.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>

                {/* Section 1: Header */}
                <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                    <div className="flex items-center gap-3 px-8 py-5 border-b border-zinc-100 bg-zinc-50/50">
                        <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-brand" />
                        </div>
                        <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Order Header</h2>
                        {vendors.length === 0 && (
                            <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                No active vendors — add one first
                            </span>
                        )}
                    </div>
                    <div className="p-8 grid sm:grid-cols-2 gap-6">
                        {/* Vendor Select */}
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Vendor <span className="text-red-500">*</span></label>
                            {vendors.length === 0 ? (
                                <div className="w-full py-3 px-4 text-sm text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-xl">
                                    No active vendors found. Please add a vendor in the Vendors module first.
                                </div>
                            ) : (
                                <select
                                    required
                                    value={vendorId}
                                    onChange={e => setVendorId(e.target.value)}
                                    title="Select Vendor"
                                    className={inputClass}
                                >
                                    <option value="">— Choose Vendor —</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}{v.categories?.length ? ` (${v.categories.join(", ")})` : ""}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Vendor Info Card */}
                        {selectedVendor && (
                            <div className="sm:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl p-4 grid sm:grid-cols-3 gap-3 text-sm">
                                {selectedVendor.contactPerson && (
                                    <div className="flex items-center gap-2 text-zinc-600">
                                        <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <span className="font-medium truncate">{selectedVendor.contactPerson}</span>
                                    </div>
                                )}
                                {selectedVendor.phone && (
                                    <div className="flex items-center gap-2 text-zinc-600">
                                        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <span className="font-medium">{selectedVendor.phone}</span>
                                    </div>
                                )}
                                {selectedVendor.email && (
                                    <div className="flex items-center gap-2 text-zinc-600">
                                        <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <span className="font-medium truncate">{selectedVendor.email}</span>
                                    </div>
                                )}
                                {selectedVendor.address && (
                                    <div className="flex items-center gap-2 text-zinc-600 sm:col-span-2">
                                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <span className="font-medium truncate">{selectedVendor.address}</span>
                                    </div>
                                )}
                                {selectedVendor.taxId && (
                                    <div className="flex items-center gap-2 text-zinc-600">
                                        <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <span className="font-mono text-xs font-bold">{selectedVendor.taxId}</span>
                                    </div>
                                )}
                                {selectedVendor.paymentTerms && (
                                    <div className="flex items-center gap-2 text-zinc-600 sm:col-span-3">
                                        <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <span className="text-xs font-medium">{selectedVendor.paymentTerms}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Delivery Date */}
                        <div>
                            <label className={labelClass}>Expected Delivery Date</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={expectedDelivery}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={e => setExpectedDelivery(e.target.value)}
                                    title="Expected Delivery Date"
                                    className={`${inputClass} pl-10`}
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className={labelClass}>Terms & Notes</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={2}
                                placeholder="Payment terms, delivery instructions..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Line Items */}
                <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                    <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                <PackageSearch className="w-4 h-4 text-blue-500" />
                            </div>
                            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Line Items</h2>
                            <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black px-2 py-0.5 rounded-full">{items.length}</span>
                        </div>
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-1.5 text-sm font-black text-brand hover:text-brand/80 transition-colors"
                        >
                            <Plus className="h-4 w-4" /> Add Item
                        </button>
                    </div>

                    <div className="p-6 space-y-3">
                        {/* Column Headers */}
                        <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 bg-zinc-50 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-100">
                            <div className="col-span-1 text-center">#</div>
                            <div className="col-span-5">Item / Description</div>
                            <div className="col-span-2 text-right">Qty</div>
                            <div className="col-span-2 text-right">Unit Rate (₹)</div>
                            <div className="col-span-1 text-right">Total</div>
                            <div className="col-span-1" />
                        </div>

                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start p-4 sm:p-2 border sm:border-0 border-zinc-200 rounded-xl sm:rounded-none"
                            >
                                <div className="hidden sm:flex col-span-1 justify-center items-center pt-2.5 text-sm font-black text-zinc-300">{idx + 1}</div>

                                {/* Item Name with catalog autocomplete */}
                                <div className="col-span-1 sm:col-span-5 relative">
                                    <label className="sm:hidden block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Description</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                        <input
                                            required
                                            type="text"
                                            placeholder={catalogItems.length > 0 ? "Type to search catalog or enter custom..." : "Item description"}
                                            value={item.customItemName}
                                            onChange={e => {
                                                updateItem(idx, "customItemName", e.target.value);
                                                updateItem(idx, "itemId" as any, "");
                                                setCatalogSearch(prev => prev.map((s, i) => i === idx ? e.target.value : s));
                                                setShowSuggestions(prev => prev.map((_, i) => i === idx ? true : _));
                                            }}
                                            onFocus={() => setShowSuggestions(prev => prev.map((_, i) => i === idx ? true : _))}
                                            onBlur={() => setTimeout(() => setShowSuggestions(prev => prev.map((_, i) => i === idx ? false : _)), 200)}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                        />
                                    </div>
                                    {/* Dropdown suggestions */}
                                    {showSuggestions[idx] && catalogItems.length > 0 && filteredCatalog(idx).length > 0 && (
                                        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
                                            {filteredCatalog(idx).map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onMouseDown={() => selectCatalogItem(idx, cat)}
                                                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 transition-colors text-left"
                                                >
                                                    <div>
                                                        <div className="text-sm font-bold text-zinc-900">{cat.name}</div>
                                                        {cat.type && <div className="text-xs text-zinc-400">{cat.type}</div>}
                                                    </div>
                                                    <span className="text-xs font-black text-brand ml-4 shrink-0">₹{cat.price.toLocaleString("en-IN")}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Qty */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="sm:hidden block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Quantity</label>
                                    <input
                                        required type="number" min="1"
                                        value={item.quantity}
                                        onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                                        title="Quantity"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-bold text-right text-zinc-900 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                    />
                                </div>

                                {/* Unit Rate */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="sm:hidden block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Unit Rate (₹)</label>
                                    <input
                                        required type="number" min="0" step="0.01"
                                        value={item.unitRate}
                                        onChange={e => updateItem(idx, "unitRate", Number(e.target.value))}
                                        title="Unit Rate"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-bold text-right text-zinc-900 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                    />
                                </div>

                                {/* Line Total */}
                                <div className="col-span-1 flex sm:justify-end items-center pt-0 sm:pt-2.5">
                                    <label className="sm:hidden text-[10px] font-black uppercase tracking-widest text-zinc-500 mr-2">Total:</label>
                                    <span className="font-black text-zinc-900 text-sm">
                                        ₹{(Number(item.quantity) * Number(item.unitRate)).toLocaleString("en-IN")}
                                    </span>
                                </div>

                                {/* Remove */}
                                <div className="col-span-1 flex sm:justify-center items-center">
                                    <button
                                        type="button"
                                        onClick={() => items.length > 1 && removeItem(idx)}
                                        disabled={items.length === 1}
                                        title="Remove item"
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-30 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary & Submit */}
                <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Summary</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-black text-brand">₹{totalAmount.toLocaleString("en-IN")}</span>
                                <span className="text-sm text-zinc-400 font-medium">{items.length} item{items.length !== 1 ? "s" : ""}</span>
                            </div>
                            <p className="text-xs text-zinc-400">Status will be set to <span className="font-bold text-zinc-600">Draft</span> — approve it after review.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 rounded-2xl border border-zinc-200 text-sm font-black text-zinc-700 hover:bg-zinc-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !vendorId || totalAmount === 0}
                                className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-brand text-[var(--secondary-color)] text-sm font-black hover:bg-brand/90 shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : "Generate Draft PO"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
