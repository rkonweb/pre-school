"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { ArrowLeft, Plus, Trash2, CheckCircle2, BookOpen, Shirt, Pencil, Package, Layers } from "lucide-react";
import { toast } from "sonner";
import { getStoreCatalogAction, createStorePackageAction } from "@/app/actions/store-actions";
import Link from "next/link";

const ITEM_TYPE_ICON: Record<string, any> = {
    BOOK: BookOpen,
    UNIFORM: Shirt,
    STATIONERY: Pencil,
    OTHER: Package,
};

const GRADE_OPTIONS = [
    "Nursery", "LKG", "UKG",
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
];

export default function CreatePackagePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [isPending, startTransition] = useTransition();
    const [catalogItems, setCatalogItems] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        description: "",
        gradeLevel: "",
        isMandatory: true,
        academicYearId: "",
        discountedPrice: "",
    });
    const [selectedItems, setSelectedItems] = useState<{ itemId: string; quantity: number }[]>([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");

    useEffect(() => {
        const load = async () => {
            const [catalogRes, yearsRes] = await Promise.all([
                getStoreCatalogAction(slug),
                (await import("@/app/actions/academic-year-actions")).getAcademicYearsAction(slug),
            ]);
            if (catalogRes.success) setCatalogItems(catalogRes.data);
            if ((yearsRes as any)?.data) {
                const years = (yearsRes as any).data;
                setAcademicYears(years);
                const current = years.find((y: any) => y.isCurrent) || years[0];
                if (current) setForm(f => ({ ...f, academicYearId: current.id }));
            }
            setIsLoading(false);
        };
        load();
    }, [slug]);

    const addItem = (itemId: string) => {
        if (selectedItems.find(i => i.itemId === itemId)) return;
        setSelectedItems([...selectedItems, { itemId, quantity: 1 }]);
    };
    const removeItem = (itemId: string) => setSelectedItems(selectedItems.filter(i => i.itemId !== itemId));
    const updateQty = (itemId: string, qty: number) => {
        setSelectedItems(selectedItems.map(i => i.itemId === itemId ? { ...i, quantity: Math.max(1, qty) } : i));
    };

    const calcTotal = () => selectedItems.reduce((sum, si) => {
        const item = catalogItems.find(i => i.id === si.itemId);
        return sum + (item ? item.price * si.quantity : 0);
    }, 0);

    const handleCreate = () => {
        if (!form.name.trim()) { toast.error("Package name is required"); return; }
        if (!form.academicYearId) { toast.error("Select an academic year"); return; }
        if (selectedItems.length === 0) { toast.error("Add at least one item to the package"); return; }

        startTransition(async () => {
            const res = await createStorePackageAction({
                slug,
                name: form.name,
                description: form.description,
                gradeLevel: form.gradeLevel,
                isMandatory: form.isMandatory,
                academicYearId: form.academicYearId,
                classIds: [],
                discountedPrice: form.discountedPrice ? parseFloat(form.discountedPrice) : undefined,
                items: selectedItems,
            });

            if (res.success) {
                toast.success("Academic Package created successfully!");
                router.push(`/s/${slug}/store/packages`);
            } else {
                toast.error(res.error || "Failed to create package");
            }
        });
    };

    const filteredCatalog = catalogItems.filter(item => {
        const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = !filterType || item.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/s/${slug}/store/packages`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 text-slate-500 hover:text-slate-900 hover:shadow-md transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create Academic Package</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Build a grade-wise bundle of books, uniforms, stationery and more.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Left Column — Details */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Package Details Card */}
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 space-y-4">
                        <h2 className="font-semibold text-slate-900">Package Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Package Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Grade 5 Academic Kit 2026"
                                className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                            <textarea
                                rows={3}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief description of what this package includes..."
                                className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50 resize-none"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Grade Level</label>
                                <select
                                    value={form.gradeLevel}
                                    onChange={e => setForm({ ...form, gradeLevel: e.target.value })}
                                    title="Grade Level"
                                    className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50"
                                >
                                    <option value="">-- Any Grade --</option>
                                    {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Academic Year *</label>
                                <select
                                    value={form.academicYearId}
                                    onChange={e => setForm({ ...form, academicYearId: e.target.value })}
                                    title="Academic Year"
                                    className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50"
                                >
                                    <option value="">Select year...</option>
                                    {academicYears.map((y: any) => (
                                        <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? " (Current)" : ""}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Discounted Package Price (₹)</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.discountedPrice}
                                    onChange={e => setForm({ ...form, discountedPrice: e.target.value })}
                                    placeholder="Leave blank to auto-calculate"
                                    className="w-full rounded-xl border-0 py-2.5 pl-8 pr-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50"
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-400">Leave blank to use the sum of all item prices.</p>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-slate-50 ring-1 ring-slate-200 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium text-slate-800">Mandatory for Grade</p>
                                <p className="text-xs text-slate-500">Parents will see this as a required purchase each academic year.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, isMandatory: !form.isMandatory })}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${form.isMandatory ? "bg-brand" : "bg-slate-200"}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${form.isMandatory ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                        </div>
                    </div>

                    {/* Item Picker Card */}
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
                        <h2 className="font-semibold text-slate-900 mb-4">Add Items from Catalog</h2>

                        <div className="flex gap-3 mb-4">
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="flex-1 rounded-xl border-0 py-2 px-4 text-sm text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-brand bg-slate-50"
                            />
                            <select
                                title="Filter by type"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="rounded-xl border-0 py-2 px-3 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-brand bg-slate-50"
                            >
                                <option value="">All Types</option>
                                <option value="BOOK">Books</option>
                                <option value="UNIFORM">Uniform</option>
                                <option value="STATIONERY">Stationery</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        {isLoading ? (
                            <div className="flex h-24 items-center justify-center">
                                <div className="h-6 w-6 rounded-full border-4 border-brand border-t-transparent animate-spin" />
                            </div>
                        ) : (
                            <div className="max-h-72 overflow-y-auto rounded-xl ring-1 ring-slate-100 divide-y divide-slate-100">
                                {filteredCatalog.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-slate-400">No items found.</p>
                                ) : filteredCatalog.map((item: any) => {
                                    const isSelected = selectedItems.some(i => i.itemId === item.id);
                                    const Icon = ITEM_TYPE_ICON[item.type] || Package;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => isSelected ? removeItem(item.id) : addItem(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${isSelected ? "bg-violet-50" : "hover:bg-slate-50"}`}
                                        >
                                            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-violet-100" : "bg-slate-100"}`}>
                                                {isSelected
                                                    ? <CheckCircle2 className="h-4 w-4 text-violet-600" />
                                                    : <Icon className="h-4 w-4 text-slate-500" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium truncate ${isSelected ? "text-violet-900" : "text-slate-800"}`}>{item.name}</p>
                                                <p className="text-xs text-slate-400">{item.type}{item.category ? ` · ${item.category}` : ""}</p>
                                            </div>
                                            <span className={`font-semibold text-sm ${isSelected ? "text-violet-700" : "text-slate-700"}`}>₹{item.price}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column — Summary */}
                <div className="lg:col-span-2">
                    <div className="sticky top-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        <div className="bg-violet-600 px-6 py-5">
                            <div className="flex items-center gap-3 mb-1">
                                <Layers className="h-5 w-5 text-white/80" />
                                <p className="text-sm font-semibold text-white/80">Package Summary</p>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {form.discountedPrice ? `₹${parseFloat(form.discountedPrice).toFixed(2)}` : `₹${calcTotal().toFixed(2)}`}
                            </p>
                            {form.discountedPrice && parseFloat(form.discountedPrice) < calcTotal() && (
                                <p className="text-xs text-white/60 mt-0.5 line-through">₹{calcTotal().toFixed(2)} before discount</p>
                            )}
                        </div>

                        <div className="p-5">
                            {selectedItems.length === 0 ? (
                                <p className="py-6 text-center text-sm text-slate-400">No items selected yet.<br />Pick items from the catalog.</p>
                            ) : (
                                <ul className="space-y-3 mb-5">
                                    {selectedItems.map(si => {
                                        const item = catalogItems.find(i => i.id === si.itemId);
                                        const Icon = ITEM_TYPE_ICON[item?.type] || Package;
                                        return (
                                            <li key={si.itemId} className="flex items-start gap-3">
                                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 mt-0.5">
                                                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 truncate">{item?.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={si.quantity}
                                                            onChange={e => updateQty(si.itemId, parseInt(e.target.value) || 1)}
                                                            className="w-14 rounded-lg border-0 py-1 px-2 text-xs text-center ring-1 ring-slate-200 focus:ring-violet-400 bg-slate-50"
                                                        />
                                                        <span className="text-xs text-slate-400">× ₹{item?.price}</span>
                                                        <span className="text-xs font-semibold text-slate-700 ml-auto">= ₹{((item?.price || 0) * si.quantity).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeItem(si.itemId)} className="mt-1 flex-shrink-0">
                                                    <Trash2 className="h-4 w-4 text-slate-300 hover:text-rose-500 transition-colors" />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            <div className="space-y-2 text-xs text-slate-500 mb-5">
                                {form.gradeLevel && <p>📚 <strong>Grade:</strong> {form.gradeLevel}</p>}
                                {form.isMandatory && <p>⚠️ <strong>Mandatory</strong> for this grade</p>}
                                <p>📅 <strong>Year:</strong> {academicYears.find(y => y.id === form.academicYearId)?.name || "—"}</p>
                                <p>📦 <strong>Items:</strong> {selectedItems.length} item type{selectedItems.length !== 1 ? "s" : ""}</p>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={isPending || selectedItems.length === 0 || !form.name}
                                className="w-full rounded-xl bg-violet-600 text-white py-3 text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                {isPending ? "Creating Package..." : "Create Academic Package"}
                            </button>
                            <Link href={`/s/${slug}/store/packages`}>
                                <button type="button" className="mt-2 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
