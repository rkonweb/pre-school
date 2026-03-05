"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ShoppingBag, Plus, Package, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createStoreItemAction } from "@/app/actions/parent-phase3-actions";

const CATEGORIES = ["UNIFORM", "STATIONERY", "BOOK", "KIT", "OTHER"];
const CAT_EMOJIS: Record<string, string> = { UNIFORM: "👕", STATIONERY: "✏️", BOOK: "📚", KIT: "🎒", OTHER: "📦" };
const CAT_COLORS: Record<string, string> = { UNIFORM: "bg-blue-100 text-blue-700", STATIONERY: "bg-yellow-100 text-yellow-700", BOOK: "bg-green-100 text-green-700", KIT: "bg-purple-100 text-purple-700", OTHER: "bg-zinc-100 text-zinc-600" };

export default function SchoolStorePage() {
    const params = useParams();
    const slug = params.slug as string;

    const [items, setItems] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<"CATALOG" | "ORDERS">("CATALOG");
    const [showForm, setShowForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", price: "", category: "UNIFORM", stock: "" });

    useEffect(() => { loadData(); }, [slug, view]);

    async function loadData() {
        setIsLoading(true);
        try {
            const { prisma } = await import("@/lib/prisma");
            const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
            if (!school) return;

            if (view === "CATALOG") {
                const data = await prisma.parentStoreItem.findMany({
                    where: { schoolId: school.id },
                    orderBy: [{ category: "asc" }, { name: "asc" }],
                });
                setItems(data);
            } else {
                const data = await prisma.parentStoreOrder.findMany({
                    where: { schoolId: school.id },
                    include: {
                        student: { select: { firstName: true, lastName: true, admissionNumber: true } },
                        items: { include: { item: { select: { name: true } } } },
                        payment: { select: { status: true } },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 30,
                });
                setOrders(data);
            }
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }

    async function handleCreate() {
        if (!form.name || !form.price || !form.stock) { toast.error("Name, price, and stock are required"); return; }
        setIsCreating(true);
        try {
            const { prisma } = await import("@/lib/prisma");
            const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
            if (!school) return;

            const res = await createStoreItemAction(school.id, {
                name: form.name,
                description: form.description || undefined,
                price: parseFloat(form.price),
                category: form.category,
                stock: parseInt(form.stock),
            });

            if (res.success) {
                toast.success("Item added to store!");
                setShowForm(false);
                setForm({ name: "", description: "", price: "", category: "UNIFORM", stock: "" });
                loadData();
            } else { toast.error(res.error || "Failed to add item"); }
        } catch { toast.error("Unexpected error"); }
        finally { setIsCreating(false); }
    }

    async function toggleAvailability(itemId: string, current: boolean) {
        try {
            const { prisma } = await import("@/lib/prisma");
            await prisma.parentStoreItem.update({ where: { id: itemId }, data: { isAvailable: !current } });
            toast.success(current ? "Item hidden from store" : "Item visible in store");
            loadData();
        } catch { toast.error("Failed to update item"); }
    }

    async function updateOrderStatus(orderId: string, status: string) {
        try {
            const { prisma } = await import("@/lib/prisma");
            await prisma.parentStoreOrder.update({ where: { id: orderId }, data: { status } });
            toast.success(`Order marked as ${status.toLowerCase()}`);
            loadData();
        } catch { toast.error("Failed to update order"); }
    }

    const statusColor: Record<string, string> = { PLACED: "bg-amber-100 text-amber-700", CONFIRMED: "bg-blue-100 text-blue-700", READY: "bg-purple-100 text-purple-700", DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700" };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-emerald-500" /> School <span className="text-emerald-500">Store</span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Manage school merchandise, uniforms, and stationery.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 gap-1">
                        {(["CATALOG", "ORDERS"] as const).map(v => (
                            <button key={v} onClick={() => setView(v)} className={cn("px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", view === v ? "bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm" : "text-zinc-500 hover:text-zinc-900")}>
                                {v === "CATALOG" ? "Catalog" : "Orders"}
                            </button>
                        ))}
                    </div>
                    {view === "CATALOG" && (
                        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                            <Plus className="h-4 w-4" /> Add Item
                        </button>
                    )}
                </div>
            </div>

            {showForm && view === "CATALOG" && (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-emerald-200 dark:border-emerald-900 shadow-xl p-8 animate-in slide-in-from-top-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Add <span className="text-emerald-500">Store Item</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Item Name *</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="E.g., School Uniform (Full Set)" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(c => (
                                    <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} className={cn("px-3 py-2 rounded-xl text-xs font-black border-2 transition-all", form.category === c ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-zinc-200 text-zinc-500")}>
                                        {CAT_EMOJIS[c]} {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Price (₹) *</label>
                            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="350" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Stock Quantity *</label>
                            <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="50" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Description (optional)</label>
                            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Size, material, or additional notes..." className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors" />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button onClick={handleCreate} disabled={isCreating} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-2xl font-black uppercase text-xs disabled:opacity-50 transition-all active:scale-95">{isCreating ? "Adding..." : "Add to Store"}</button>
                        <button onClick={() => setShowForm(false)} className="px-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-4 rounded-2xl font-black uppercase text-xs">Cancel</button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                </div>
            ) : view === "CATALOG" ? (
                items.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl mb-6">🛍️</div>
                        <h3 className="text-xl font-black uppercase italic">Store Empty</h3>
                        <p className="text-zinc-500 text-sm mt-2">Add your first item to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <div key={item.id} className={cn("bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border shadow-sm p-6", item.isAvailable ? "border-zinc-200 dark:border-zinc-800" : "border-zinc-100 dark:border-zinc-900 opacity-50")}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", CAT_COLORS[item.category])}>
                                            {CAT_EMOJIS[item.category]} {item.category}
                                        </span>
                                        <h3 className="font-black text-zinc-900 dark:text-zinc-50 mt-2">{item.name}</h3>
                                        {item.description && <p className="text-xs text-zinc-400 mt-1">{item.description}</p>}
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <div className="text-2xl font-black text-emerald-500">₹{item.price}</div>
                                        <div className="text-[10px] text-zinc-400 font-bold">Stock: {item.stock}</div>
                                    </div>
                                </div>
                                <button onClick={() => toggleAvailability(item.id, item.isAvailable)} className={cn("w-full py-2.5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all", item.isAvailable ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-red-50 hover:text-red-500" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white")}>
                                    {item.isAvailable ? <><ToggleRight className="h-3 w-3" /> Visible</> : <><ToggleLeft className="h-3 w-3" /> Hidden</>}
                                </button>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                orders.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl mb-6">📦</div>
                        <h3 className="text-xl font-black uppercase italic">No Orders Yet</h3>
                        <p className="text-zinc-500 text-sm mt-2">Orders placed by parents will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", statusColor[order.status] || "bg-zinc-100 text-zinc-500")}>{order.status}</span>
                                        <span className="text-xs font-bold text-zinc-400">#{order.id.slice(-6).toUpperCase()}</span>
                                    </div>
                                    <p className="font-black text-zinc-900 dark:text-zinc-50">{order.student?.firstName} {order.student?.lastName}</p>
                                    <p className="text-xs text-zinc-400 mb-3">Adm: {order.student?.admissionNumber} · {order.parentMobile}</p>
                                    <div className="space-y-1">
                                        {order.items.map((i: any) => (
                                            <p key={i.id} className="text-xs text-zinc-600 dark:text-zinc-400">• {i.item?.name} × {i.quantity} @ ₹{i.unitPrice}</p>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        <span className="font-black text-emerald-500">₹{order.totalAmount.toFixed(0)}</span>
                                        <span className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                                    </div>
                                </div>
                                {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                    <div className="flex md:flex-col gap-2 justify-center md:border-l border-zinc-100 dark:border-zinc-800 md:pl-6">
                                        {order.status === "PLACED" && <button onClick={() => updateOrderStatus(order.id, "CONFIRMED")} className="h-10 px-4 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Confirm</button>}
                                        {order.status === "CONFIRMED" && <button onClick={() => updateOrderStatus(order.id, "READY")} className="h-10 px-4 bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Mark Ready</button>}
                                        {order.status === "READY" && <button onClick={() => updateOrderStatus(order.id, "DELIVERED")} className="h-10 px-4 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Delivered</button>}
                                        <button onClick={() => updateOrderStatus(order.id, "CANCELLED")} className="h-10 px-4 bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Cancel</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
