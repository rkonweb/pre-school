"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import {
    ShoppingBag, Package, TrendingUp, Activity, BarChart3,
    BookOpen, Shirt, Pencil, CreditCard, CheckCircle2, Clock,
    AlertTriangle, ArrowRight, Users, Layers
} from "lucide-react";
import Link from "next/link";
import { getStoreSalesSummaryAction, getStoreOrdersAction, getStoreInventoryAction } from "@/app/actions/store-actions";

const QUICK_LINKS = [
    {
        title: "Catalog",
        description: "Add & manage individual items like books, uniforms, stationery",
        icon: BookOpen,
        href: (slug: string) => `/s/${slug}/store/catalog`,
        color: "bg-indigo-50 text-indigo-600",
        border: "border-indigo-100",
    },
    {
        title: "Academic Packages",
        description: "Create grade-wise bundles and assign to student classes",
        icon: Layers,
        href: (slug: string) => `/s/${slug}/store/packages`,
        color: "bg-violet-50 text-violet-600",
        border: "border-violet-100",
    },
    {
        title: "Inventory",
        description: "Track stock levels, set alerts, adjust quantities",
        icon: Activity,
        href: (slug: string) => `/s/${slug}/store/inventory`,
        color: "bg-amber-50 text-amber-600",
        border: "border-amber-100",
    },
    {
        title: "Orders & Fulfillment",
        description: "View all orders, mark paid, issue items to students",
        icon: ShoppingBag,
        href: (slug: string) => `/s/${slug}/store/orders`,
        color: "bg-emerald-50 text-emerald-600",
        border: "border-emerald-100",
    },
];

export default function StoreDashboard() {
    const params = useParams();
    const slug = params.slug as string;

    const [summary, setSummary] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [salesRes, ordersRes, inventoryRes] = await Promise.all([
                getStoreSalesSummaryAction(slug),
                getStoreOrdersAction(slug),
                getStoreInventoryAction(slug),
            ]);

            if (salesRes.success) setSummary(salesRes.data);
            if (ordersRes.success) setRecentOrders(ordersRes.data.slice(0, 6));
            if (inventoryRes.success) {
                setLowStock(inventoryRes.data.filter((i: any) => i.quantity <= (i.lowStockAlert ?? 10)));
            }
            setIsLoading(false);
        };
        loadData();
    }, [slug]);

    const statCards = [
        {
            name: "Total Revenue",
            value: summary ? `₹${summary.totalRevenue.toFixed(2)}` : "—",
            sub: summary ? `From ${summary.totalOrders} paid orders` : "Loading...",
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            name: "Package Revenue",
            value: summary ? `₹${summary.packageRevenue.toFixed(2)}` : "—",
            sub: "From mandatory academic packages",
            icon: Layers,
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            name: "Pending Orders",
            value: recentOrders.filter(o => o.paymentStatus === "UNPAID").length,
            sub: "Awaiting payment",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            name: "Low Stock Alerts",
            value: lowStock.length,
            sub: "Items below threshold",
            icon: AlertTriangle,
            color: "text-rose-600",
            bg: "bg-rose-50",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-4 border-brand border-t-transparent animate-spin" />
                    <p className="text-sm text-slate-500">Loading store data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Store & Inventory</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage academic packages, individual items, inventory, and sales.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div key={card.name} className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
                        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} mb-3`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{card.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div>
                <h2 className="text-base font-semibold text-slate-700 mb-3">Quick Access</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {QUICK_LINKS.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href(slug)}
                            className={`group flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ${link.border} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                        >
                            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${link.color}`}>
                                <link.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 text-sm group-hover:text-brand transition-colors">{link.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{link.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand transition-colors mt-auto" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom grid: Recent + Low Stock */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900 text-sm">Recent Orders</h2>
                        <Link href={`/s/${slug}/store/orders`} className="text-xs text-brand font-medium hover:underline">
                            View all
                        </Link>
                    </div>
                    <ul className="divide-y divide-slate-50">
                        {recentOrders.length === 0 ? (
                            <li className="p-8 text-center text-sm text-slate-400">No orders yet.</li>
                        ) : (
                            recentOrders.map((order) => (
                                <li key={order.id} className="flex items-center justify-between px-6 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {order.student?.firstName} {order.student?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {order.sourceType === "PACKAGE" ? "📦 Package" : "🛒 Ad-hoc"} &middot; {order.orderItems?.length} items
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-900">₹{order.totalAmount.toFixed(2)}</p>
                                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Low Stock */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900 text-sm">Low Stock Alerts</h2>
                        <Link href={`/s/${slug}/store/inventory`} className="text-xs text-brand font-medium hover:underline">
                            Manage
                        </Link>
                    </div>
                    <ul className="divide-y divide-slate-50">
                        {lowStock.length === 0 ? (
                            <li className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
                                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                All stock levels are healthy.
                            </li>
                        ) : (
                            lowStock.slice(0, 6).map((inv: any) => (
                                <li key={inv.id} className="flex items-center justify-between px-6 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{inv.item?.name}</p>
                                        <p className="text-xs text-slate-400">{inv.item?.type}</p>
                                    </div>
                                    <span className={`text-sm font-bold ${inv.quantity === 0 ? "text-rose-600" : "text-amber-600"}`}>
                                        {inv.quantity} left
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
