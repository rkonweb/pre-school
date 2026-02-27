"use client";

import { useState, useTransition, useEffect } from "react";
import { Package, TrendingUp, TrendingDown, FlaskConical } from "lucide-react";
import { getStoreCatalogAction, updateStoreInventoryAction } from "@/app/actions/store-actions";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function StoreInventory() {
    const params = useParams();
    const schoolId = params.slug as string;

    const [isPending, startTransition] = useTransition();
    const [items, setItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<string>("");
    const [adjustment, setAdjustment] = useState<string>("0");

    useEffect(() => {
        const loadInventory = async () => {
            const res = await getStoreCatalogAction(schoolId);
            if (res.success && res.data) {
                setItems(res.data);
            }
        };
        loadInventory();
    }, [schoolId]);

    const handleUpdateStock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !adjustment || parseInt(adjustment) === 0) return;

        startTransition(async () => {
            const res = await updateStoreInventoryAction(selectedItem, schoolId, parseInt(adjustment));
            if (res.success) {
                toast.success("Inventory updated successfully");
                setAdjustment("0");
                setSelectedItem("");

                // Reload list
                const listRes = await getStoreCatalogAction(schoolId);
                if (listRes.success && listRes.data) setItems(listRes.data);
            } else {
                toast.error(res.error || "Failed to update inventory");
            }
        });
    };

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Track and adjust physical stock levels for store items.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stock Adjustment Form */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sticky top-6">
                            <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2 mb-6">
                                <Package className="h-5 w-5 text-brand" />
                                Adjust Stock
                            </h2>
                            <form onSubmit={handleUpdateStock} className="space-y-6">
                                <div>
                                    <label htmlFor="item" className="block text-sm font-medium leading-6 text-slate-900">Select Item</label>
                                    <select
                                        required
                                        id="item"
                                        value={selectedItem}
                                        onChange={(e) => setSelectedItem(e.target.value)}
                                        className="mt-2 block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6 bg-slate-50/50"
                                    >
                                        <option value="" disabled>Choose an item in the catalog...</option>
                                        {items.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="adjustment" className="block text-sm font-medium leading-6 text-slate-900">
                                        Quantity Adjustment (+ to add, - to remove)
                                    </label>
                                    <div className="mt-2 flex rounded-xl shadow-sm">
                                        <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-300 px-3 text-slate-500 sm:text-sm bg-slate-50">
                                            {parseInt(adjustment || "0") > 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                                        </span>
                                        <input
                                            required
                                            type="number"
                                            id="adjustment"
                                            value={adjustment}
                                            onChange={(e) => setAdjustment(e.target.value)}
                                            className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">Positive values add stock. Negative values deduct stock.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPending || !selectedItem}
                                    className="flex w-full justify-center rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-50 transition-all"
                                >
                                    {isPending ? "Updating..." : "Commit Inventory Adjustment"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Current Inventory Levels */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-base font-medium leading-6 text-slate-900">Current Stock Levels</h3>
                            </div>
                            <ul role="list" className="divide-y divide-slate-100">
                                {items.length === 0 ? (
                                    <li className="p-12 text-center flex flex-col items-center">
                                        <FlaskConical className="h-12 w-12 text-slate-300 mb-4" />
                                        <p className="text-sm text-slate-500">No items available in the catalog.</p>
                                        <p className="text-xs text-slate-400 mt-1">Add items to the catalog first to manage their inventory.</p>
                                    </li>
                                ) : (
                                    items.map((item) => {
                                        const stockQty = item.inventories && item.inventories.length > 0
                                            ? item.inventories.reduce((a: number, b: any) => a + b.quantity, 0)
                                            : 0;

                                        const isLowStock = stockQty <= (item.inventories?.[0]?.lowStockAlert || 10);
                                        const isOutOfStock = stockQty === 0;

                                        return (
                                            <li key={item.id} className="group flex justify-between gap-x-6 px-6 py-5 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex min-w-0 gap-x-4">
                                                    <div className="min-w-0 flex-auto">
                                                        <p className="text-sm font-semibold leading-6 text-slate-900">{item.name}</p>
                                                        <p className="mt-1 flex text-xs leading-5 text-slate-500">
                                                            {item.type} &middot; SKU: {item.id.slice(-6).toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-x-6">
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-bold tracking-tight text-slate-900">{stockQty}</span>
                                                            <span className="text-sm text-slate-500">in stock</span>
                                                        </div>
                                                        {isOutOfStock ? (
                                                            <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 mt-1">
                                                                Out of Stock
                                                            </span>
                                                        ) : isLowStock ? (
                                                            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 mt-1">
                                                                Low Stock Warning
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mt-1">
                                                                Healthy Stock
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
