"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { Plus, Coffee, Utensils, Apple, Save, Trash2, Loader2, RefreshCw, AlertTriangle, Pencil, X, Upload, Download } from "lucide-react";
import {
    createCanteenItemAction,
    updateCanteenItemAction,
    saveCanteenMenuTimetableAction,
    deleteCanteenItemAction,
    bulkCreateCanteenItemsAction,
    updateCanteenGstSettingsAction
} from "@/app/actions/canteen-actions";
import Papa from "papaparse";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

// ——————————————————————————————————————————
// Constants
// ——————————————————————————————————————————
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MEAL_TYPES = ["BREAKFAST", "MORNING_SNACKS", "LUNCH", "EVENING_SNACKS", "DINNER"];
const CATEGORY_OPTIONS = [
    { value: "BREAKFAST", label: "Breakfast" },
    { value: "MORNING_SNACKS", label: "Morning Snacks" },
    { value: "LUNCH", label: "Lunch" },
    { value: "EVENING_SNACKS", label: "Evening Snacks" },
    { value: "DINNER", label: "Dinner" },
    { value: "ANY", label: "Any / General" },
];
const DIET_OPTIONS = [
    { value: "VEG", label: "Vegetarian" },
    { value: "NON_VEG", label: "Non-Veg" },
    { value: "BEVERAGE", label: "Beverage" },
    { value: "SNACK", label: "Snack" },
];

type CanteenItem = {
    id: string;
    name: string;
    description?: string;
    category: string[];
    mealType: string;
    price: number;
    isAvailable: boolean;
    isAddOn: boolean;
    foodCategory?: string | null;
    gstPercentage?: number;
    hsnCode?: string | null;
};
type MenuPlan = {
    id: string;
    dayOfWeek: number;
    mealType: string;
    items: string; // JSON string
    isSpecial: boolean;
    specialDetails?: string;
};

// ——————————————————————————————————————————
// Main Component
// ——————————————————————————————————————————
export default function CanteenMenuClient({
    slug,
    initialItems,
    initialPlans,
    foodCategories = [],
    schoolGstType,
    schoolCommonGst,
}: {
    slug: string;
    initialItems: CanteenItem[];
    initialPlans: MenuPlan[];
    foodCategories: { id: string; name: string }[];
    schoolGstType?: string;
    schoolCommonGst?: number;
}) {
    const { currency } = useSidebar();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [items, setItems] = useState<CanteenItem[]>(initialItems);
    const [plans, setPlans] = useState<MenuPlan[]>(initialPlans);
    const [activeTab, setActiveTab] = useState<"ITEMS" | "TIMETABLE">("TIMETABLE");
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());

    // New item / Edit item form
    const EMPTY_ITEM = { name: "", description: "", category: ["LUNCH"] as string[], mealType: "LUNCH", price: 0, isAddOn: false, foodCategory: "", gstPercentage: 0, hsnCode: "" };
    const [newItem, setNewItem] = useState(EMPTY_ITEM);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    // GST Settings
    const [showGstSettings, setShowGstSettings] = useState(false);
    const [gstType, setGstType] = useState(schoolGstType || "NONE");
    const [commonGst, setCommonGst] = useState(schoolCommonGst || 0);

    const handleSaveGstSettings = () => {
        startTransition(async () => {
            const res = await updateCanteenGstSettingsAction(slug, gstType, commonGst);
            if (res.success) {
                toast.success("GST Settings updated successfully");
                setShowGstSettings(false);
                refresh();
            } else {
                toast.error(res.error ?? "Failed to save settings");
            }
        });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setCategoryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const refresh = () => {
        router.refresh();
    };

    // ——— Bulk Import/Export ———
    const handleExportCSV = () => {
        if (items.length === 0) {
            toast.error("No items to export.");
            return;
        }
        const data = items.map(i => ({
            Name: i.name,
            Description: i.description || "",
            "Meal Categories": i.category.join("; "),
            "Food Cuisine": i.foodCategory || "",
            Price: i.price,
            "Is Add-On": i.isAddOn ? "Yes" : "No"
        }));
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `food_inventory_${slug}_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    toast.error("Error parsing CSV file.");
                    return;
                }
                const newItems = results.data.map((row: any) => ({
                    name: row["Name"],
                    description: row["Description"] || null,
                    category: row["Meal Categories"] ? row["Meal Categories"].split(";").map((c: string) => c.trim()).filter(Boolean) : ["LUNCH"],
                    foodCategory: row["Food Cuisine"] || null,
                    price: parseFloat(row["Price"]) || 0,
                    isAddOn: row["Is Add-On"] === "Yes" || row["Is Add-On"] === "true",
                    mealType: "LUNCH", // Default fallback
                })).filter(item => item.name && item.price >= 0);

                if (newItems.length === 0) {
                    toast.error("No valid items found in the CSV.");
                    return;
                }

                startTransition(() => {
                    bulkCreateCanteenItemsAction(slug, newItems).then(res => {
                        if (res.success) {
                            toast.success(`Successfully imported ${res.count} items!`);
                            refresh();
                        } else {
                            toast.error(res.error || "Failed to import items.");
                        }
                    });
                });
            }
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ——— Save (Create/Update) Item ———
    const handleSaveItem = () => {
        if (!newItem.name.trim() || newItem.price <= 0 || newItem.category.length === 0) {
            toast.error("Name, a positive price, and at least 1 category are required.");
            return;
        }
        startTransition(async () => {
            const payload = {
                name: newItem.name.trim(),
                description: newItem.description || undefined,
                category: newItem.category.length > 0 ? newItem.category : ["ANY"],
                mealType: newItem.category[0] || "ANY",
                price: newItem.price,
                isAddOn: newItem.isAddOn,
                foodCategory: newItem.foodCategory || undefined,
                gstPercentage: gstType === "ITEM" ? newItem.gstPercentage : undefined,
                hsnCode: newItem.hsnCode || undefined,
            };

            if (editingItemId) {
                const res = await updateCanteenItemAction(slug, editingItemId, payload);
                if (res.success) {
                    toast.success(`"${newItem.name}" updated!`);
                    setItems(prev => prev.map(i => i.id === editingItemId ? { ...i, ...payload, id: i.id, foodCategory: payload.foodCategory || null, description: payload.description || undefined, isAvailable: i.isAvailable } : i));
                    setNewItem(EMPTY_ITEM);
                    setEditingItemId(null);
                    refresh();
                } else {
                    toast.error(res.error ?? "Failed to update item.");
                }
            } else {
                const res = await createCanteenItemAction(slug, payload);
                if (res.success && res.data) {
                    toast.success(`"${newItem.name}" added to inventory!`);
                    setItems(prev => [...prev, res.data as CanteenItem]);
                    setNewItem(EMPTY_ITEM);
                    refresh();
                } else {
                    toast.error(res.error ?? "Failed to add item.");
                }
            }
        });
    };

    const handleEditItem = (item: CanteenItem) => {
        setEditingItemId(item.id);
        setNewItem({
            name: item.name,
            description: item.description || "",
            category: item.category,
            mealType: item.mealType,
            price: item.price,
            isAddOn: item.isAddOn,
            foodCategory: item.foodCategory || "",
            gstPercentage: item.gstPercentage || 0,
            hsnCode: item.hsnCode || "",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingItemId(null);
        setNewItem(EMPTY_ITEM);
    };

    // ——— Delete Item ———
    const handleDeleteItem = (id: string, name: string) => {
        setDeleteTarget({ id, name });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const { id } = deleteTarget;
        setDeleteTarget(null);
        startTransition(async () => {
            const res = await deleteCanteenItemAction(slug, id);
            if (res.success) {
                toast.success("Item deleted.");
                setItems(prev => prev.filter(i => i.id !== id));
                refresh();
            } else {
                toast.error(res.error ?? "Failed to delete.");
            }
        });
    };

    // ——— Save Meal Plan ———
    const handleSaveMealPlan = (mealType: string, selectedItemIds: string[], isSpecial: boolean, specialDetails: string) => {
        startTransition(async () => {
            const res = await saveCanteenMenuTimetableAction(slug, [{
                dayOfWeek: selectedDay,
                mealType,
                items: selectedItemIds,
                isSpecial,
                specialDetails: specialDetails || undefined,
            }]);
            if (res.success) {
                toast.success(`${mealType.charAt(0) + mealType.slice(1).toLowerCase()} plan saved for ${DAYS[selectedDay]}!`);
                // Update local plans state
                setPlans(prev => {
                    const idx = prev.findIndex(p => p.dayOfWeek === selectedDay && p.mealType === mealType);
                    const updated: MenuPlan = {
                        id: prev[idx]?.id ?? `tmp-${Date.now()}`,
                        dayOfWeek: selectedDay,
                        mealType,
                        items: JSON.stringify(selectedItemIds),
                        isSpecial,
                        specialDetails: specialDetails || undefined,
                    };
                    if (idx >= 0) return prev.map((p, i) => i === idx ? updated : p);
                    return [...prev, updated];
                });
                refresh();
            } else {
                toast.error(res.error ?? "Failed to save plan.");
            }
        });
    };

    const getPlanForMeal = (mealType: string) =>
        plans.find(p => p.dayOfWeek === selectedDay && p.mealType === mealType);

    // ——————————————————————————————————————————
    // Render
    // ——————————————————————————————————————————
    return (
        <div className="space-y-5 p-6">
            {/* Tab bar */}
            <div className="flex items-center justify-between border-b border-zinc-200">
                <div className="flex gap-1">
                    {(["TIMETABLE", "ITEMS"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-3 text-sm font-bold border-b-2 transition-colors",
                                activeTab === tab
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-zinc-500 hover:text-zinc-800"
                            )}
                        >
                            {tab === "TIMETABLE" ? "Menu Timetable" : `Food Inventory (${items.length})`}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    {activeTab === "ITEMS" && (
                        <>
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                ref={fileInputRef}
                                aria-label="Import CSV"
                                onChange={handleImportCSV}
                            />
                            <button onClick={() => fileInputRef.current?.click()} disabled={isPending} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-orange-600 bg-white border border-zinc-200 hover:border-orange-300 font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm">
                                <Upload className="h-3.5 w-3.5" /> Import
                            </button>
                            <button onClick={handleExportCSV} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-orange-600 bg-white border border-zinc-200 hover:border-orange-300 font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm">
                                <Download className="h-3.5 w-3.5" /> Export
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowGstSettings(true)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-zinc-200 font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm">
                        <Pencil className="h-3.5 w-3.5" /> GST Settings
                    </button>
                    <button onClick={refresh} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-zinc-200 font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm">
                        <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </button>
                </div>
            </div>

            {/* ————— ITEMS TAB ————— */}
            {activeTab === "ITEMS" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add/Edit Item Form */}
                    <div className="md:col-span-1 relative">
                        <div className="border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4 bg-white sticky top-6 z-10">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-zinc-900 text-base">
                                    {editingItemId ? "Edit Food Item" : "Add Food Item"}
                                </h3>
                                {editingItemId && (
                                    <button onClick={cancelEdit} className="text-zinc-400 hover:text-zinc-600 transition" title="Cancel Edit">
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-500 block mb-1">Item Name *</label>
                                <input
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    placeholder="e.g. Veg Biryani"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 block mb-1">Meal Categories *</label>
                                    <div className="relative" ref={categoryDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setCategoryDropdownOpen(o => !o)}
                                            className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 flex items-center justify-between text-left"
                                        >
                                            <span className="truncate text-zinc-700">
                                                {newItem.category.length === 0 ? 'Select...' : newItem.category.map(c => CATEGORY_OPTIONS.find(o => o.value === c)?.label ?? c).join(', ')}
                                            </span>
                                            <svg className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        {categoryDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                                {CATEGORY_OPTIONS.map(o => (
                                                    <label key={o.value} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-orange-50 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded text-orange-500 focus:ring-orange-400 shrink-0"
                                                            checked={newItem.category.includes(o.value)}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                if (o.value === "ANY") {
                                                                    setNewItem({ ...newItem, category: checked ? ["ANY"] : [] });
                                                                } else {
                                                                    const current = newItem.category.filter(c => c !== "ANY");
                                                                    setNewItem({ ...newItem, category: checked ? [...current, o.value] : current.filter(c => c !== o.value) });
                                                                }
                                                            }}
                                                        />
                                                        <span className="font-medium text-zinc-700">{o.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 block mb-1">Price ({currency}) *</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={newItem.price || ""}
                                        onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Food Category from master data */}
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 block mb-1">Food Category (Cuisine)</label>
                                    <select
                                        title="Food Category (Cuisine)"
                                        aria-label="Food Category (Cuisine)"
                                        value={newItem.foodCategory}
                                        onChange={e => setNewItem({ ...newItem, foodCategory: e.target.value })}
                                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    >
                                        <option value="">-- Select cuisine --</option>
                                        {foodCategories.map(fc => (
                                            <option key={fc.id} value={fc.name}>{fc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* HSN Code */}
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 block mb-1">HSN Code</label>
                                    <input
                                        type="text"
                                        value={newItem.hsnCode}
                                        onChange={e => setNewItem({ ...newItem, hsnCode: e.target.value })}
                                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        placeholder="e.g. 210690"
                                    />
                                </div>
                            </div>

                            {gstType === "ITEM" && (
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 block mb-1">GST Percentage (%) *</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={newItem.gstPercentage || ""}
                                        onChange={e => setNewItem({ ...newItem, gstPercentage: parseFloat(e.target.value) || 0 })}
                                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        placeholder="0"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-zinc-500 block mb-1">Description (optional)</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    rows={2}
                                    placeholder="Short description..."
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newItem.isAddOn}
                                    onChange={e => setNewItem({ ...newItem, isAddOn: e.target.checked })}
                                    className="rounded text-orange-500 focus:ring-orange-400"
                                />
                                <span className="text-sm font-semibold text-zinc-700">Mark as Add-on</span>
                            </label>

                            <div className="flex gap-2">
                                {editingItemId && (
                                    <button
                                        onClick={cancelEdit}
                                        disabled={isPending}
                                        className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-2.5 rounded-xl text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveItem}
                                    disabled={isPending}
                                    className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-60"
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItemId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    {editingItemId ? "Update Item" : "Save Item"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Item Grid */}
                    <div className="md:col-span-2">
                        {items.length === 0 ? (
                            <div className="py-20 text-center text-zinc-400">
                                <Utensils className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                <p className="font-medium">No items yet. Add your first food item.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3">Item Name</th>
                                                <th className="px-4 py-3">Categories</th>
                                                <th className="px-4 py-3 text-right">Price ({currency})</th>
                                                <th className="px-4 py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200">
                                            {items.map(item => (
                                                <tr key={item.id} className="hover:bg-orange-50/50 transition-colors group">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "h-8 w-8 shrink-0 rounded-md flex items-center justify-center bg-indigo-50 text-indigo-600"
                                                            )}>
                                                                {item.category.includes("BREAKFAST") ? <Coffee className="h-4 w-4" /> :
                                                                    item.category.some(c => c.includes("SNACK")) ? <Apple className="h-4 w-4" /> :
                                                                        <Utensils className="h-4 w-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-zinc-900">{item.name}</p>
                                                                {item.foodCategory && <p className="text-xs text-zinc-500 font-medium">{item.foodCategory}</p>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.category.map(cat => (
                                                                <span key={cat} className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded capitalize">
                                                                    {cat.replace(/_/g, " ").toLowerCase()}
                                                                </span>
                                                            ))}
                                                            {item.isAddOn && <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Add-on</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-orange-600">
                                                        {currency}{item.price}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleEditItem(item)}
                                                                disabled={isPending}
                                                                className="text-zinc-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                                                                title="Edit item"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(item.id, item.name)}
                                                                disabled={isPending}
                                                                className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                                                                title="Delete item"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ————— TIMETABLE TAB ————— */}
            {activeTab === "TIMETABLE" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Day selector */}
                    <div className="lg:col-span-1 relative">
                        <div className="space-y-2 sticky top-6 z-10 self-start">
                            {DAYS.map((day, idx) => {
                                const isToday = new Date().getDay() === idx;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(idx)}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-between text-sm",
                                            selectedDay === idx
                                                ? "bg-orange-500 text-white shadow-md"
                                                : "bg-white border border-zinc-200 text-zinc-600 hover:border-orange-300"
                                        )}
                                    >
                                        {day}
                                        {isToday && (
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-md uppercase tracking-widest font-extrabold",
                                                selectedDay === idx ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
                                            )}>
                                                Today
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Meal editors */}
                    <div className="lg:col-span-3">
                        {items.length === 0 && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-medium mb-4">
                                ⚠️ Add items to Food Inventory first before creating a timetable.
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MEAL_TYPES.map(mealType => {
                                const plan = getPlanForMeal(mealType);
                                const parsedItemIds: string[] = plan?.items ? JSON.parse(plan.items) : [];
                                return (
                                    <MealPlanEditor
                                        key={`${selectedDay}-${mealType}`}
                                        mealType={mealType}
                                        initialItemIds={parsedItemIds}
                                        initialIsSpecial={plan?.isSpecial ?? false}
                                        initialSpecialDetails={plan?.specialDetails ?? ""}
                                        allItems={items}
                                        isPending={isPending}
                                        onSave={(ids, isSp, details) => handleSaveMealPlan(mealType, ids, isSp, details)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ——— Delete Confirmation Modal ——— */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold text-zinc-900">Delete Food Item?</p>
                            <p className="text-sm text-zinc-500 mt-1">
                                <span className="font-semibold text-zinc-800">&quot;{deleteTarget!.name}&quot;</span> will be permanently removed from inventory.
                            </p>
                        </div>
                        <div className="flex gap-3 w-full pt-1">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 border border-zinc-200 text-zinc-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isPending}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-1.5"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ——— GST Settings Modal ——— */}
            {showGstSettings && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGstSettings(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 space-y-5">
                        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                            <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-zinc-500" /> Canteen GST Settings
                            </h3>
                            <button
                                onClick={() => setShowGstSettings(false)}
                                title="Close settings"
                            >
                                <X className="h-5 w-5 text-zinc-400 hover:text-zinc-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 block mb-1.5">GST Application Type</label>
                                <select
                                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    value={gstType}
                                    title="GST Application Type"
                                    onChange={(e) => setGstType(e.target.value)}
                                >
                                    <option value="NONE">No GST</option>
                                    <option value="COMMON">Common (Applies to all items)</option>
                                    <option value="ITEM">Item Wise (Set per food item)</option>
                                </select>
                            </div>

                            {gstType === "COMMON" && (
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 block mb-1.5">Common GST Percentage (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={commonGst || ""}
                                        onChange={(e) => setCommonGst(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        placeholder="E.g. 5, 12, 18"
                                    />
                                </div>
                            )}

                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                                    Changing settings will affect future orders from the POS system immediately. Previous orders and cart calculations in-progress will NOT be updated. This impacts checkout only.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                            <button onClick={() => setShowGstSettings(false)} className="px-4 py-2 border border-zinc-200 text-zinc-600 font-semibold text-sm rounded-xl hover:bg-zinc-50">
                                Cancel
                            </button>
                            <button disabled={isPending} onClick={handleSaveGstSettings} className="px-4 py-2 bg-orange-500 text-white font-bold text-sm rounded-xl hover:bg-orange-600 shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ——————————————————————————————————————————
// Meal Plan Editor sub-component
// ——————————————————————————————————————————
function MealPlanEditor({
    mealType,
    initialItemIds,
    initialIsSpecial,
    initialSpecialDetails,
    allItems,
    isPending,
    onSave,
}: {
    mealType: string;
    initialItemIds: string[];
    initialIsSpecial: boolean;
    initialSpecialDetails: string;
    allItems: CanteenItem[];
    isPending: boolean;
    onSave: (ids: string[], isSpecial: boolean, specialDetails: string) => void;
}) {
    const { currency } = useSidebar();
    const [selectedIds, setSelectedIds] = useState<string[]>(initialItemIds);
    const [isSpecial, setIsSpecial] = useState(initialIsSpecial);
    const [specialDetails, setSpecialDetails] = useState(initialSpecialDetails);

    // New states for search and add
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggle = (id: string) =>
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const hasChanges =
        JSON.stringify(selectedIds.sort()) !== JSON.stringify([...initialItemIds].sort()) ||
        isSpecial !== initialIsSpecial ||
        specialDetails !== initialSpecialDetails;

    const MealIcon = mealType === "BREAKFAST" ? Coffee : mealType.includes("SNACK") ? Apple : Utensils;
    const iconColor = mealType === "BREAKFAST" ? "text-amber-600" : mealType === "LUNCH" ? "text-red-600" : mealType === "DINNER" ? "text-indigo-600" : "text-emerald-600";

    const filteredItemsForCategory = allItems.filter(item => item.category.includes(mealType) || item.category.includes("ANY"));
    const selectedItemsList = filteredItemsForCategory.filter(item => selectedIds.includes(item.id));
    const availableItemsList = filteredItemsForCategory.filter(item => !selectedIds.includes(item.id) && item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MealIcon className={cn("h-4 w-4", iconColor)} />
                    <h4 className="font-black text-zinc-900 text-sm capitalize">{mealType.toLowerCase().replace(/_/g, " ")}</h4>
                </div>
                <span className="text-xs text-zinc-400">{selectedIds.length} items</span>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col space-y-3">
                {isAdding ? (
                    <div className="flex flex-col h-full border border-orange-200 rounded-xl bg-orange-50/50 p-3 shadow-sm min-h-[200px]">
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search items to add..."
                                aria-label="Search items to add"
                                className="flex-1 border border-orange-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                            />
                            <button onClick={() => { setIsAdding(false); setSearchQuery(""); }} className="text-xs font-bold text-zinc-500 hover:text-zinc-800 bg-white border border-zinc-200 px-2.5 py-1.5 rounded-lg">Done</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-48 pr-1">
                            {availableItemsList.length === 0 ? (
                                <p className="text-[10px] text-zinc-400 text-center py-2">No matching items found.</p>
                            ) : (
                                availableItemsList.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => toggle(item.id)}
                                        className="w-full flex items-center justify-between p-2 rounded-lg border border-zinc-200 bg-white hover:border-orange-300 hover:bg-orange-50 text-left transition-colors group"
                                    >
                                        <span className="truncate text-xs font-medium text-zinc-700">{item.name}</span>
                                        <span className="text-[10px] font-bold text-emerald-600 shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Added Items</span>
                            <button onClick={() => setIsAdding(true)} className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
                                <Plus className="h-3 w-3" /> Add Item
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                            {selectedItemsList.length === 0 ? (
                                <p className="text-xs text-zinc-400 text-center py-6 border border-dashed border-zinc-200 rounded-xl">No items selected.</p>
                            ) : (
                                selectedItemsList.map(item => (
                                    <label
                                        key={item.id}
                                        className="flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors text-sm border-orange-200 bg-orange-50/30 hover:bg-orange-50 text-orange-900"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            onChange={() => toggle(item.id)}
                                            className="rounded text-orange-500 focus:ring-orange-400"
                                        />
                                        <span className="truncate font-medium">{item.name}</span>
                                        <span className="ml-auto text-xs font-bold text-zinc-500 shrink-0">{currency}{item.price}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Special toggle */}
                <div className="pt-2 border-t border-zinc-100 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isSpecial}
                            onChange={e => setIsSpecial(e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-400"
                        />
                        <span className="text-xs font-bold text-zinc-700">Mark as Special</span>
                    </label>
                    {isSpecial && (
                        <input
                            value={specialDetails}
                            onChange={e => setSpecialDetails(e.target.value)}
                            placeholder="e.g. Masala Dosa combo"
                            aria-label="Special details"
                            className="w-full border border-amber-200 bg-amber-50 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100">
                <button
                    onClick={() => onSave(selectedIds, isSpecial, specialDetails)}
                    disabled={!hasChanges || isPending}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                >
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save Plan
                </button>
            </div>
        </div >
    );
}
