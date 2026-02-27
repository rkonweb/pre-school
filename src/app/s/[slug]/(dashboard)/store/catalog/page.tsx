"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Plus, BookOpen, Shirt, Pencil, Package, Edit2, Trash2, Search, Archive, Upload, Download, FileSpreadsheet, X } from "lucide-react";
import { toast } from "sonner";
import { getStoreCatalogAction, createStoreItemAction, updateStoreItemAction, deleteStoreItemAction, hardDeleteStoreItemAction, bulkCreateStoreItemsAction, bulkReplaceStoreItemsAction, bulkUpdateByNameAction } from "@/app/actions/store-actions";

const ITEM_TYPES = [
    { value: "BOOK", label: "Book / Academic", icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { value: "UNIFORM", label: "Uniform / Apparel", icon: Shirt, color: "text-purple-600 bg-purple-50" },
    { value: "STATIONERY", label: "Stationery", icon: Pencil, color: "text-amber-600 bg-amber-50" },
    { value: "OTHER", label: "Other", icon: Package, color: "text-slate-600 bg-slate-50" },
];

function getTypeInfo(type: string) {
    return ITEM_TYPES.find(t => t.value === type) || ITEM_TYPES[3];
}

// ─── Export helper ────────────────────────────────────────────────────────────
async function exportItems(items: any[], format: "csv" | "xlsx") {
    const { utils, writeFile } = await import("xlsx");

    const HEADERS = ["Name", "Type", "Category", "Grade", "Price", "TaxPercentage", "Stock", "LowStockAlert", "HSNCode", "Description", "IsActive", "CreatedAt"];

    const dataRows = items.map(i => [
        i.name,
        i.type,
        i.category || "",
        i.gradeLevel || "All",
        i.price,
        i.taxPercentage,
        i.inventories?.[0]?.quantity ?? 0,
        i.inventories?.[0]?.lowStockAlert ?? 10,
        i.hsnCode || "",
        i.description || "",
        i.isActive ? "Yes" : "No",
        i.createdAt ? new Date(i.createdAt).toLocaleDateString("en-IN") : "",
    ]);

    // aoa_to_sheet (array-of-arrays) guarantees headers are always written
    const ws = utils.aoa_to_sheet([HEADERS, ...dataRows]);
    ws["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 35 }, { wch: 10 }, { wch: 12 }];
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Catalog");
    writeFile(wb, `store-catalog-${new Date().toISOString().slice(0, 10)}.${format}`, { bookType: format === "csv" ? "csv" : "xlsx" });
}

// ─── Import Modes ─────────────────────────────────────────────────────────────
type ImportMode = "append" | "replace" | "update";

const IMPORT_MODES: { value: ImportMode; label: string; desc: string; color: string; warn?: boolean }[] = [
    { value: "append", label: "Append", desc: "Add all rows as new items. Duplicates allowed.", color: "border-emerald-500 bg-emerald-50 text-emerald-800" },
    { value: "update", label: "Update by Name", desc: "Match by Name: update if found, create if new.", color: "border-blue-500 bg-blue-50 text-blue-800" },
    { value: "replace", label: "Replace All", desc: "Archive ALL current items, then add from file.", color: "border-rose-500 bg-rose-50 text-rose-800", warn: true },
];

// ─── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({ slug, onClose, onSuccess }: { slug: string; onClose: () => void; onSuccess: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [rows, setRows] = useState<any[]>([]);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const [mode, setMode] = useState<ImportMode>("append");
    const [step, setStep] = useState<"config" | "preview">("config");

    const parseRow = (row: any) => {
        const get = (key: string) => {
            const k = Object.keys(row).find(r => r.toLowerCase().replace(/[\s_]/g, "") === key.toLowerCase().replace(/[\s_]/g, ""));
            return k ? row[k] : "";
        };
        return {
            name: String(get("name") || "").trim(),
            type: String(get("type") || "OTHER").toUpperCase(),
            category: String(get("category") || ""),
            gradeLevel: (String(get("grade") || "")).toLowerCase() === "all" ? "" : String(get("grade") || ""),
            price: parseFloat(get("price")) || 0,
            taxPercentage: parseFloat(get("taxpercentage") || get("tax")) || 0,
            initialStock: parseInt(get("stock") || get("initialstock")) || 0,
            lowStockAlert: parseInt(get("lowstockalert") || get("stockalert")) || 10,
            hsnCode: String(get("hsncode") || get("hsn") || ""),
            description: String(get("description") || ""),
            isActive: String(get("isactive") || "yes").toLowerCase() !== "no",
        };
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setError("");
        setRows([]);
        try {
            const { read, utils } = await import("xlsx");
            const buf = await file.arrayBuffer();
            const wb = read(buf, { type: "array", cellDates: true, raw: false });
            const ws = wb.Sheets[wb.SheetNames[0]];
            // sheet_to_json with raw:false converts numbers/dates to strings consistently
            const data: any[] = utils.sheet_to_json(ws, { defval: "", raw: false });
            if (!data.length) { setError("File appears to be empty or has no data rows."); return; }
            const headers = Object.keys(data[0] || {});
            const hasName = headers.some(h => h.toLowerCase().replace(/[\s_]/g, "").includes("name"));
            const hasPrice = headers.some(h => h.toLowerCase().replace(/[\s_]/g, "").includes("price"));
            if (!hasName || !hasPrice) {
                setError(`Missing required columns. Found: ${headers.join(", ")}. Need at least: Name, Price`);
                return;
            }
            const parsed = data.map(parseRow).filter(r => r.name && r.price > 0);
            if (!parsed.length) { setError("No valid rows found (rows need Name and Price > 0)."); return; }
            setRows(parsed);
            setStep("preview");
        } catch (err) {
            console.error("Import parse error:", err);
            setError("Failed to parse file — ensure it's a valid .csv or .xlsx file.");
        }
    };

    const handleDownloadTemplate = async () => {
        const { utils, writeFile } = await import("xlsx");
        const sample = [
            { Name: "Grade 5 Math Textbook", Type: "BOOK", Category: "Academic", Grade: "Grade 5", Price: 250, TaxPercentage: 0, Stock: 100, LowStockAlert: 10, HSNCode: "4901", Description: "NCERT Mathematics Grade 5", IsActive: "Yes" },
            { Name: "Summer Uniform Shirt", Type: "UNIFORM", Category: "Uniform", Grade: "All", Price: 350, TaxPercentage: 5, Stock: 200, LowStockAlert: 20, HSNCode: "6205", Description: "White cotton shirt", IsActive: "Yes" },
            { Name: "A4 Notebook 200 Pages", Type: "STATIONERY", Category: "Stationery", Grade: "All", Price: 60, TaxPercentage: 12, Stock: 500, LowStockAlert: 50, HSNCode: "4820", Description: "200-page ruled notebook", IsActive: "Yes" },
        ];
        const ws = utils.json_to_sheet(sample);
        ws["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 8 }, { wch: 35 }, { wch: 10 }];
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Template");
        writeFile(wb, "store-catalog-template.xlsx");
    };

    const handleImport = () => {
        if (rows.length === 0) return;
        startTransition(async () => {
            let res: any;
            if (mode === "append") {
                res = await bulkCreateStoreItemsAction(slug, rows);
                if (res.success && res.data) toast.success(`✅ Added ${res.data.created} items${res.data.skipped > 0 ? `, ${res.data.skipped} skipped` : ""}`);
            } else if (mode === "replace") {
                res = await bulkReplaceStoreItemsAction(slug, rows);
                if (res.success && res.data) toast.success(`✅ Replaced catalog: ${res.data.created} items imported${res.data.skipped > 0 ? `, ${res.data.skipped} skipped` : ""}`);
            } else {
                res = await bulkUpdateByNameAction(slug, rows);
                if (res.success && res.data) toast.success(`✅ ${res.data.updated} updated · ${res.data.created} new · ${res.data.skipped} skipped`);
            }
            if (!res.success) toast.error(res.error || "Import failed");
            else { onSuccess(); onClose(); }
        });
    };

    const ALL_COLS = ["Name", "Type", "Category", "Grade", "Price", "Tax%", "Stock", "LowAlert", "HSN", "Description", "Active"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Bulk Import Catalog</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {step === "config" ? "Choose import mode and upload your file" : `${rows.length} rows parsed — review and confirm`}
                        </p>
                    </div>
                    <button onClick={onClose} title="Close" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Step 1 — Mode selector */}
                    <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Import Mode</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {IMPORT_MODES.map(m => (
                                <button key={m.value} onClick={() => setMode(m.value)}
                                    className={`text-left rounded-xl border-2 px-4 py-3 transition-all ${mode === m.value ? m.color + " border-current" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                                    <p className="text-sm font-bold">{m.label}</p>
                                    <p className="text-xs mt-0.5 opacity-80">{m.desc}</p>
                                    {m.warn && mode === m.value && <p className="text-xs mt-1.5 font-semibold text-rose-700">⚠ All existing items will be archived!</p>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Template + field guide */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Supported Columns</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { col: "Name", req: true }, { col: "Price", req: true },
                                        { col: "Type", req: false }, { col: "Category", req: false },
                                        { col: "Grade", req: false }, { col: "TaxPercentage", req: false },
                                        { col: "Stock", req: false }, { col: "LowStockAlert", req: false },
                                        { col: "HSNCode", req: false }, { col: "Description", req: false }, { col: "IsActive", req: false },
                                    ].map(({ col, req }) => (
                                        <span key={col} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${req ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-600"}`}>
                                            {col}{req && <span className="text-rose-500">*</span>}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5">Type values: BOOK · UNIFORM · STATIONERY · OTHER · Grade: Grade 1–10, LKG, UKG, Nursery, or All</p>
                            </div>
                            <button onClick={handleDownloadTemplate}
                                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
                                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                                Sample Template
                            </button>
                        </div>
                    </div>

                    {/* File picker */}
                    {step === "config" && (
                        <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand py-10 cursor-pointer bg-slate-50/50 transition-colors">
                            <Upload className="h-10 w-10 text-slate-300" />
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-700">Click or drop your file here</p>
                                <p className="text-xs text-slate-400 mt-1">.csv, .xls, .xlsx · Column headers in first row</p>
                            </div>
                            <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFile} className="sr-only" />
                        </label>
                    )}

                    {step === "preview" && (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                <span className="text-sm font-medium text-slate-700 truncate">{fileName}</span>
                                <span className="ml-auto text-xs text-slate-500 flex-shrink-0">{rows.length} rows</span>
                            </div>
                            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors whitespace-nowrap">
                                <Upload className="h-3.5 w-3.5" /> Change File
                                <input type="file" accept=".csv,.xls,.xlsx" onChange={e => { setStep("config"); setTimeout(() => handleFile(e), 50); }} className="sr-only" />
                            </label>
                        </div>
                    )}

                    {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>}

                    {/* Preview table — ALL columns */}
                    {rows.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-slate-700">{rows.length} rows ready · Mode: <span className="font-bold">{IMPORT_MODES.find(m2 => m2.value === mode)?.label}</span></p>
                                <p className="text-xs text-slate-400">{rows.length > 50 ? `Showing first 50` : `All rows`}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto max-h-64">
                                    <table className="w-full text-xs min-w-[900px]">
                                        <thead className="bg-slate-50 sticky top-0 z-10">
                                            <tr>
                                                {ALL_COLS.map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {rows.slice(0, 50).map((r, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-3 py-2 font-medium text-slate-800 max-w-[160px] truncate">{r.name}</td>
                                                    <td className="px-3 py-2 text-slate-500">{r.type}</td>
                                                    <td className="px-3 py-2 text-slate-500">{r.category || "—"}</td>
                                                    <td className="px-3 py-2 text-slate-500">{r.gradeLevel || "All"}</td>
                                                    <td className="px-3 py-2 text-slate-800 font-medium">₹{r.price}</td>
                                                    <td className="px-3 py-2 text-slate-500">{r.taxPercentage}%</td>
                                                    <td className="px-3 py-2 text-slate-800">{r.initialStock}</td>
                                                    <td className="px-3 py-2 text-slate-500">{r.lowStockAlert}</td>
                                                    <td className="px-3 py-2 text-slate-400">{r.hsnCode || "—"}</td>
                                                    <td className="px-3 py-2 text-slate-400 max-w-[140px] truncate">{r.description || "—"}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${r.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                            {r.isActive ? "Yes" : "No"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
                    <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                    <div className="flex items-center gap-3">
                        {step === "preview" && (
                            <button onClick={() => setStep("config")} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">← Back</button>
                        )}
                        <button onClick={handleImport} disabled={rows.length === 0 || isPending}
                            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50 transition-all ${mode === "replace" ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-brand text-[var(--secondary-color)] hover:brightness-110"}`}>
                            <Upload className="h-4 w-4" />
                            {isPending ? "Importing…" : `${IMPORT_MODES.find(m2 => m2.value === mode)?.label} ${rows.length > 0 ? rows.length : ""} Items`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ItemRow({ item, onEdit, onArchive, onHardDelete }: {
    item: any;
    onEdit: (item: any) => void;
    onArchive: (id: string) => void;
    onHardDelete: (id: string) => void;
}) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const typeInfo = getTypeInfo(item.type);
    const Icon = typeInfo.icon;
    const stock = item.inventories?.[0]?.quantity ?? 0;
    const lowAlert = item.inventories?.[0]?.lowStockAlert ?? 10;

    return (
        <li className="group flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-4 min-w-0">
                <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl ring-1 ring-slate-200 ${typeInfo.color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-400">{typeInfo.label}{item.category ? ` · ${item.category}` : ""}</span>
                        {item.gradeLevel && (
                            <span className="inline-block text-[10px] font-semibold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-100">
                                {item.gradeLevel}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                {!confirmingDelete && (
                    <>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">₹{item.price.toFixed(2)}</p>
                            {item.taxPercentage > 0 && <p className="text-xs text-slate-400">+{item.taxPercentage}% tax</p>}
                        </div>
                        <div className="text-right hidden md:block">
                            <p className={`text-sm font-semibold ${stock === 0 ? "text-rose-600" : stock <= lowAlert ? "text-amber-600" : "text-emerald-600"}`}>
                                {stock} in stock
                            </p>
                            <p className="text-xs text-slate-400">Alert at {lowAlert}</p>
                        </div>
                    </>
                )}

                {confirmingDelete ? (
                    /* Inline confirmation bar */
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2">
                        <span className="text-xs font-medium text-rose-700 whitespace-nowrap">Delete permanently?</span>
                        <button
                            onClick={() => { setConfirmingDelete(false); onHardDelete(item.id); }}
                            className="rounded-lg bg-rose-600 text-white px-3 py-1 text-xs font-semibold hover:bg-rose-700 transition-colors"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={() => setConfirmingDelete(false)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    /* Icon-only Action Buttons */
                    <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(item)} title="Edit item"
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => onArchive(item.id)} title="Archive (hide from catalog)"
                            className="p-2 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                            <Archive className="h-4 w-4" />
                        </button>
                        <button onClick={() => setConfirmingDelete(true)} title="Permanently delete"
                            className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </li>
    );
}

const GRADE_OPTIONS = [
    "Nursery", "LKG", "UKG",
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
];

function ItemForm({ initial, onSave, onCancel, slug }: {
    initial?: any;
    onSave: () => void;
    onCancel: () => void;
    slug: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
        name: initial?.name || "",
        description: initial?.description || "",
        type: initial?.type || "BOOK",
        category: initial?.category || "",
        gradeLevel: initial?.gradeLevel || "",
        price: initial?.price?.toString() || "",
        taxPercentage: initial?.taxPercentage?.toString() || "0",
        initialStock: "",
        hsnCode: initial?.hsnCode || "",
    });

    const handleSave = () => {
        if (!form.name || !form.price) { toast.error("Name and price are required"); return; }
        startTransition(async () => {
            if (initial?.id) {
                const res = await updateStoreItemAction(initial.id, {
                    name: form.name, description: form.description, type: form.type,
                    category: form.category, gradeLevel: form.gradeLevel || null,
                    price: parseFloat(form.price),
                    taxPercentage: parseFloat(form.taxPercentage), hsnCode: form.hsnCode,
                });
                if (res.success) { toast.success("Item updated"); onSave(); }
                else toast.error(res.error || "Failed to update");
            } else {
                const res = await createStoreItemAction({
                    schoolId: slug, name: form.name, description: form.description,
                    type: form.type, category: form.category,
                    gradeLevel: form.gradeLevel || undefined,
                    price: parseFloat(form.price),
                    taxPercentage: parseFloat(form.taxPercentage),
                    initialStock: form.initialStock ? parseInt(form.initialStock) : 0,
                    hsnCode: form.hsnCode,
                });
                if (res.success) { toast.success("Item added to catalog"); onSave(); }
                else toast.error(res.error || "Failed to create item");
            }
        });
    };

    return (
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-2 ring-brand/20">
            <h2 className="text-base font-semibold text-slate-900 mb-5">{initial ? "Edit Item" : "Add New Catalog Item"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name *</label>
                    <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Grade 5 Math Textbook"
                        className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Type *</label>
                    <select title="Item Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                        className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50">
                        {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Price (₹) *</label>
                    <input required type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax % (GST)</label>
                    <input type="number" step="0.5" value={form.taxPercentage} onChange={e => setForm({ ...form, taxPercentage: e.target.value })}
                        placeholder="0"
                        className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Category / Sub-type</label>
                    <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                        placeholder="e.g. Shoes, Summer Uniform, Notebook"
                        className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Grade</label>
                    <select title="Grade" value={form.gradeLevel} onChange={e => setForm({ ...form, gradeLevel: e.target.value })}
                        className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50">
                        <option value="">All Grades</option>
                        {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                {!initial && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Stock</label>
                        <input type="number" value={form.initialStock} onChange={e => setForm({ ...form, initialStock: e.target.value })}
                            placeholder="0"
                            className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50" />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">HSN Code</label>
                    <input type="text" value={form.hsnCode} onChange={e => setForm({ ...form, hsnCode: e.target.value })}
                        placeholder="For GST billing"
                        className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50" />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand sm:text-sm bg-slate-50" />
                </div>
            </div>
            <div className="flex justify-end gap-3">
                <button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Cancel
                </button>
                <button onClick={handleSave} disabled={isPending}
                    className="rounded-xl bg-brand text-[var(--secondary-color)] px-6 py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all">
                    {isPending ? "Saving..." : (initial ? "Save Changes" : "Add to Catalog")}
                </button>
            </div>
        </div>
    );
}

export default function StoreCatalogPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [filterType, setFilterType] = useState("");
    const [search, setSearch] = useState("");
    const [showImport, setShowImport] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [, startTransition] = useTransition();

    const loadItems = async () => {
        setIsLoading(true);
        const res = await getStoreCatalogAction(slug, filterType || undefined);
        if (res.success && res.data) setItems(res.data);
        setIsLoading(false);
    };

    useEffect(() => { loadItems(); }, [slug, filterType]);

    const handleEdit = (item: any) => { setEditingItem(item); setShowForm(true); };
    const handleArchive = (id: string) => {
        startTransition(async () => {
            const res = await deleteStoreItemAction(id);
            if (res.success) { toast.success("Item archived"); loadItems(); }
            else toast.error(res.error || "Failed to archive");
        });
    };
    const handleHardDelete = (id: string) => {
        startTransition(async () => {
            const res = await hardDeleteStoreItemAction(id);
            if (res.success) { toast.success("Item permanently deleted"); loadItems(); }
            else toast.error(res.error || "Failed to delete");
        });
    };
    const handleFormClose = () => { setShowForm(false); setEditingItem(null); loadItems(); };

    const filtered = items.filter(i =>
        !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {showImport && (
                <ImportModal slug={slug} onClose={() => setShowImport(false)} onSuccess={loadItems} />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Item Catalog</h1>
                    <p className="mt-1 text-sm text-slate-500">All individual items available for sale or inclusion in packages.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Export */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                        {showExportMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                <div className="absolute right-0 z-20 mt-1 w-36 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 overflow-hidden">
                                    <button onClick={() => { setShowExportMenu(false); exportItems(items, "csv"); }}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                        <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" /> Export CSV
                                    </button>
                                    <button onClick={() => { setShowExportMenu(false); exportItems(items, "xlsx"); }}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" /> Export Excel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Import */}
                    <button
                        onClick={() => setShowImport(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        Import
                    </button>

                    {/* Add Item */}
                    <button
                        onClick={() => { setEditingItem(null); setShowForm(!showForm); }}
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all active:scale-95 ${showForm && !editingItem
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "bg-brand text-[var(--secondary-color)] hover:brightness-110 hover:-translate-y-0.5"}`}
                    >
                        <Plus className={`h-4 w-4 transition-transform duration-300 ${showForm && !editingItem ? "rotate-45" : ""}`} />
                        {showForm && !editingItem ? "Cancel" : "Add Item"}
                    </button>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <ItemForm
                    initial={editingItem}
                    slug={slug}
                    onSave={handleFormClose}
                    onCancel={handleFormClose}
                />
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-brand text-sm bg-white text-slate-900"
                    />
                </div>
                <select
                    title="Filter by type"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="rounded-xl border-0 py-2.5 px-4 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-brand bg-white"
                >
                    <option value="">All Types</option>
                    {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            {/* Items List */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <div className="hidden sm:flex items-center px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <span className="flex-1">Item</span>
                    <span className="w-28 text-right">Price</span>
                    <span className="w-28 text-right">Stock</span>
                    <span className="w-12" />
                </div>
                {isLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <div className="h-7 w-7 rounded-full border-4 border-brand border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <ul role="list" className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <li className="p-12 text-center text-slate-400 text-sm">
                                {search ? "No items match your search." : "No items in the catalog yet. Add your first item above."}
                            </li>
                        ) : (
                            filtered.map(item => (
                                <ItemRow key={item.id} item={item} onEdit={handleEdit} onArchive={handleArchive} onHardDelete={handleHardDelete} />
                            ))
                        )}
                    </ul>
                )}
                {filtered.length > 0 && (
                    <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between bg-slate-50">
                        <p className="text-xs text-slate-500">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
