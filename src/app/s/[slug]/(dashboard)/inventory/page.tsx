"use client";

import { useState } from "react";
import {
    Package,
    Search,
    Plus,
    Filter,
    AlertTriangle,
    ArrowUpRight,
    MoreVertical,
    History,
    ShoppingCart,
    CheckCircle2,
    XCircle,
    Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";

type InventoryCategory = "SUPPLIES" | "CONSUMABLES" | "ASSETS";

interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    stock: number;
    minStock: number;
    unit: string;
    lastUpdated: string;
    status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

const MOCK_INVENTORY: InventoryItem[] = [
    { id: "1", name: "Drawing Paper (A4)", category: "CONSUMABLES", stock: 12, minStock: 20, unit: "Packs", lastUpdated: "2026-01-20", status: "LOW_STOCK" },
    { id: "2", name: "Crayons (24 set)", category: "CONSUMABLES", stock: 45, minStock: 10, unit: "Boxes", lastUpdated: "2026-01-22", status: "IN_STOCK" },
    { id: "3", name: "First Aid Kit", category: "ASSETS", stock: 5, minStock: 2, unit: "Units", lastUpdated: "2025-12-15", status: "IN_STOCK" },
    { id: "4", name: "Hand Sanitizer", category: "SUPPLIES", stock: 0, minStock: 5, unit: "Bottles", lastUpdated: "2026-01-24", status: "OUT_OF_STOCK" },
];

const MOCK_REQUESTS = [
    { id: "REQ-001", item: "Hand Sanitizer", qty: 5, requester: "Ms. Sarah (KG-A)", status: "PENDING", date: "2026-01-24" },
    { id: "REQ-002", item: "Drawing Paper", qty: 2, requester: "Mr. John (KG-B)", status: "APPROVED", date: "2026-01-23" },
    { id: "REQ-003", item: "Baby Wipes", qty: 10, requester: "Ms. Linda (Nursery)", status: "COMPLETED", date: "2026-01-22" },
];

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<"stock" | "requests">("stock");
    const [filter, setFilter] = useState<InventoryCategory | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = MOCK_INVENTORY.filter(item => {
        const matchesFilter = filter === "ALL" || item.category === filter;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Inventory Management</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Track supplies, assets, and consumables.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
                        <History className="h-4 w-4" />
                        Usage History
                    </button>
                    <button className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Items" value="124" icon={Package} trend={{ value: 12, isPositive: true }} />
                <StatCard title="Low Stock Alerts" value="8" icon={AlertTriangle} color="red" />
                <StatCard title="Pending Requests" value="3" icon={Truck} color="orange" />
                <StatCard title="Asset Value" value="$15,800" icon={ArrowUpRight} color="green" />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab("stock")}
                    className={cn(
                        "px-6 py-3 text-sm font-bold transition-all border-b-2",
                        activeTab === "stock" ? "border-brand text-brand" : "border-transparent text-zinc-500 hover:text-zinc-700"
                    )}
                >
                    Stock Inventory
                </button>
                <button
                    onClick={() => setActiveTab("requests")}
                    className={cn(
                        "px-6 py-3 text-sm font-bold transition-all border-b-2",
                        activeTab === "requests" ? "border-brand text-brand" : "border-transparent text-zinc-500 hover:text-zinc-700"
                    )}
                >
                    Supply Requests
                    <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] text-brand dark:bg-brand/20">3</span>
                </button>
            </div>

            {activeTab === "stock" ? (
                <>
                    {/* Filter & Search Bar */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            {["ALL", "CONSUMABLES", "SUPPLIES", "ASSETS"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat as any)}
                                    className={cn(
                                        "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                                        filter === cat
                                            ? "bg-brand text-white hover:brightness-110 dark:bg-zinc-50 dark:text-zinc-900"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                                    )}
                                >
                                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-10 pr-4 text-sm focus:border-brand focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                            />
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100 dark:border-zinc-900">
                                        <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Item Name</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Category</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Stock Level</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Status</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Last Updated</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-zinc-900 dark:text-zinc-50">{item.name}</div>
                                                <div className="text-xs text-zinc-500">{item.unit}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.stock}</span>
                                                    <span className="text-zinc-400 font-normal">/ {item.minStock} min</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    item.status === "IN_STOCK" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                                                        item.status === "LOW_STOCK" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" :
                                                            "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                                )}>
                                                    {item.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500">
                                                {item.lastUpdated}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                    <MoreVertical className="h-4 w-4 text-zinc-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-900">
                                    <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Request ID</th>
                                    <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Item</th>
                                    <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Requester</th>
                                    <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Status</th>
                                    <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Date</th>
                                    <th className="px-6 py-4 text-right font-semibold text-zinc-900 dark:text-zinc-50">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                                {MOCK_REQUESTS.map((req) => (
                                    <tr key={req.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{req.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900 dark:text-zinc-50">{req.item}</div>
                                            <div className="text-xs text-zinc-500">Qty: {req.qty}</div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{req.requester}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                req.status === "PENDING" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" :
                                                    req.status === "APPROVED" ? "bg-brand/5 text-brand dark:bg-brand/10 dark:text-brand" :
                                                        "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                            )}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">{req.date}</td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === "PENDING" ? (
                                                <div className="flex justify-end gap-2">
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950 dark:text-green-400">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </button>
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400">
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="text-xs font-bold text-zinc-400" disabled>
                                                    Processed
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
