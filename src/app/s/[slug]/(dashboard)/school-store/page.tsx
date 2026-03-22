"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
    ShoppingBag, Plus, Package, ToggleLeft, ToggleRight,
    X, Check, CheckCircle, AlertCircle, TrendingUp, TrendingDown,
    DollarSign, Archive, ShoppingCart, Star, Search, Download,
    ChevronDown, MoreVertical, Eye, EyeOff, Zap, Filter,
    RefreshCw, Sparkles, Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
    getStoreCatalogAction,
    getStoreOrdersAction,
    updateStoreItemAvailabilityAction,
    updateStoreOrderStatusAction,
    createStoreItemBySlugAction,
} from "@/app/actions/school-store-actions";

// ─── DESIGN TOKENS (matching erp-ui-kit-v3) ─────────────────
const C = {
    amber: "#F59E0B", amberD: "#D97706", amberL: "#FEF3C7", amberXL: "#FFFBEB",
    navy: "#1E1B4B", navyM: "#312E81", navyL: "#EDE9FE",
    green: "#10B981", greenD: "#059669", greenL: "#D1FAE5", greenXL: "#ECFDF5",
    red: "#EF4444", redL: "#FEE2E2", redXL: "#FEF2F2",
    blue: "#3B82F6", blueL: "#DBEAFE", blueXL: "#EFF6FF",
    orange: "#F97316", orangeL: "#FFEDD5",
    purple: "#8B5CF6", purpleL: "#EDE9FE",
    teal: "#14B8A6", tealL: "#CCFBF1",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
    g300: "#D1D5DB", g400: "#9CA3AF", g500: "#6B7280",
    g600: "#4B5563", g700: "#374151", g800: "#1F2937",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    shM: "0 8px 32px rgba(0,0,0,0.12)",
    shL: "0 16px 48px rgba(0,0,0,0.18)",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
};

const CATEGORIES = ["UNIFORM", "STATIONERY", "BOOK", "KIT", "OTHER"];
const CAT_META: Record<string, { emoji: string; color: string; bg: string }> = {
    UNIFORM: { emoji: "👕", color: C.blue, bg: C.blueL },
    STATIONERY: { emoji: "✏️", color: C.amber, bg: C.amberL },
    BOOK: { emoji: "📚", color: C.green, bg: C.greenL },
    KIT: { emoji: "🎒", color: C.purple, bg: C.purpleL },
    OTHER: { emoji: "📦", color: C.g500, bg: C.g100 },
};

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
    PLACED: { color: C.amber, bg: C.amberL, label: "Placed" },
    CONFIRMED: { color: C.blue, bg: C.blueL, label: "Confirmed" },
    READY: { color: C.purple, bg: C.purpleL, label: "Ready" },
    DELIVERED: { color: C.green, bg: C.greenL, label: "Delivered" },
    CANCELLED: { color: C.red, bg: C.redL, label: "Cancelled" },
};

// ─── GLOBAL ANIMATION STYLES ─────────────────────────────────
const PageStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.1)}75%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes ripple{to{transform:scale(4);opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        .store-hover-lift{transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.3s ease}
        .store-hover-lift:hover{transform:translateY(-5px) scale(1.02);box-shadow:0 14px 36px rgba(0,0,0,0.14)}
        .rubber-hover:hover{animation:bounceIn 0.45s ease}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#F3F4F6;border-radius:4px}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:#F59E0B}
    `}</style>
);

// ─── RIPPLE BUTTON ───────────────────────────────────────────
const BV: Record<string, any> = {
    primary: { bg: `linear-gradient(135deg,${C.amber},${C.orange})`, color: "white", border: "none", sh: `0 4px 16px ${C.amber}45` },
    secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
    ghost: { bg: "transparent", color: C.g500, border: "none", sh: "none" },
    danger: { bg: `linear-gradient(135deg,${C.red},#DC2626)`, color: "white", border: "none", sh: `0 4px 14px ${C.red}40` },
    success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", border: "none", sh: `0 4px 14px ${C.green}40` },
    navy: { bg: `linear-gradient(135deg,${C.navy},${C.navyM})`, color: "white", border: "none", sh: `0 4px 14px ${C.navy}40` },
    outline: { bg: "transparent", color: C.amber, border: `1.5px solid ${C.amber}`, sh: "none" },
    soft: { bg: C.amberL, color: C.amberD, border: "none", sh: "none" },
    blue: { bg: `linear-gradient(135deg,${C.blue},#2563EB)`, color: "white", border: "none", sh: `0 4px 14px ${C.blue}40` },
    purple: { bg: `linear-gradient(135deg,${C.purple},#7C3AED)`, color: "white", border: "none", sh: `0 4px 14px ${C.purple}40` },
};
const BS: Record<string, any> = { sm: { p: "7px 14px", fs: 12, r: 9 }, md: { p: "10px 20px", fs: 13.5, r: 12 }, lg: { p: "13px 26px", fs: 15, r: 14 } };

function Btn({ variant = "primary", size = "md", icon: Icon, iconPos = "left", loading, disabled, children, onClick, fullWidth }: any) {
    const [ripples, setRipples] = useState<any[]>([]);
    const ref = useRef<any>(null);
    const v = BV[variant] || BV.primary;
    const s = BS[size];
    const dis = disabled || loading;
    const handleClick = (e: any) => {
        if (dis) return;
        const rect = ref.current.getBoundingClientRect();
        const id = Date.now();
        setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
        onClick?.();
    };
    return (
        <button ref={ref} disabled={dis} onClick={handleClick}
            onMouseEnter={e => { if (!dis) { (e.currentTarget as any).style.filter = "brightness(1.08)"; (e.currentTarget as any).style.transform = "translateY(-2px) scale(1.03)"; } }}
            onMouseLeave={e => { (e.currentTarget as any).style.filter = "none"; (e.currentTarget as any).style.transform = "scale(1)"; }}
            style={{ background: dis ? C.g100 : v.bg, color: dis ? C.g400 : v.color, border: v.border || "none", borderRadius: s.r, padding: s.p, fontSize: s.fs, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: dis ? "none" : v.sh, fontFamily: "'Plus Jakarta Sans',sans-serif", width: fullWidth ? "100%" : "auto", transition: `all 0.4s ${C.spring}, filter 0.15s`, opacity: dis ? 0.55 : 1, letterSpacing: 0.2, position: "relative", overflow: "hidden" }}>
            {ripples.map(rp => <span key={rp.id} style={{ position: "absolute", left: rp.x, top: rp.y, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "ripple 0.6s ease forwards", marginLeft: -4, marginTop: -4, pointerEvents: "none" }} />)}
            {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${v.color}40`, borderTop: `2px solid ${v.color}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (Icon && iconPos === "left" ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : null)}
            {children}
            {!loading && Icon && iconPos === "right" && <Icon size={s.fs - 1} strokeWidth={2.2} />}
        </button>
    );
}

// ─── BADGE ───────────────────────────────────────────────────
function Badge({ label, color, bg, dot, pulse: doPulse }: any) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg, color, borderRadius: 20, padding: "4px 11px", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.2 }}>
            {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: doPulse ? "orbitPulse 1.5s ease-in-out infinite" : undefined }} />}
            {label}
        </span>
    );
}

// ─── STAT CARD ───────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, delta, color, bg }: any) {
    const isUp = delta >= 0;
    return (
        <div className="store-hover-lift" style={{ background: "white", borderRadius: 20, padding: "20px 22px", boxShadow: C.sh, border: `1px solid ${C.g100}`, cursor: "pointer", animation: "fadeUp 0.5s ease both" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div className="rubber-hover" style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={color} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: isUp ? C.green : C.red, background: isUp ? C.greenXL : C.redXL, borderRadius: 20, padding: "3px 9px", display: "flex", alignItems: "center", gap: 3 }}>
                    {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{isUp ? "+" : ""}{delta}%
                </span>
            </div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, letterSpacing: -1, marginBottom: 2, animation: "countUp 0.6s ease" }}>{value}</div>
            <div style={{ fontSize: 12.5, color: C.g400, fontWeight: 500 }}>{label}</div>
        </div>
    );
}

// ─── SKELETON ────────────────────────────────────────────────
function Skeleton({ width = "100%", height = 16, radius = 8 }: any) {
    return <div style={{ width, height, borderRadius: radius, background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)", backgroundSize: "600px 100%", animation: "shimmer 1.6s infinite" }} />;
}

// ─── FORM INPUT ──────────────────────────────────────────────
function FInput({ label, placeholder, type = "text", value, onChange, prefix, required }: any) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ width: "100%" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.g600, display: "block", marginBottom: 6 }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center", background: focused ? C.amberXL : C.g50, border: `1.5px solid ${focused ? C.amber : C.g200}`, borderRadius: 12, transition: C.tr, boxShadow: focused ? `0 0 0 4px ${C.amber}20` : "none" }}>
                {prefix && <span style={{ padding: "0 0 0 14px", fontSize: 13, color: C.g400, fontWeight: 600, whiteSpace: "nowrap" }}>{prefix}</span>}
                <input type={type} placeholder={placeholder} value={value} onChange={onChange}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, border: "none", background: "transparent", padding: "11px 14px", fontSize: 13.5, color: C.g800, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500, minWidth: 0 }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function SchoolStorePage() {
    const params = useParams();
    const slug = params.slug as string;

    const [items, setItems] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<"CATALOG" | "ORDERS">("CATALOG");
    const [showForm, setShowForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQ, setSearchQ] = useState("");
    const [filterCat, setFilterCat] = useState("ALL");
    const [form, setForm] = useState({ name: "", description: "", price: "", category: "UNIFORM", stock: "" });

    useEffect(() => { loadData(); }, [slug, view]);

    async function loadData() {
        setIsLoading(true);
        try {
            if (view === "CATALOG") {
                const res = await getStoreCatalogAction(slug);
                if (res.success) setItems(res.data);
                else toast.error(res.error);
            } else {
                const res = await getStoreOrdersAction(slug);
                if (res.success) setOrders(res.data);
                else toast.error(res.error);
            }
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }

    async function handleCreate() {
        if (!form.name || !form.price || !form.stock) { toast.error("Name, price, and stock are required"); return; }
        setIsCreating(true);
        try {
            const res = await createStoreItemBySlugAction(slug, {
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
            const res = await updateStoreItemAvailabilityAction(itemId, !current);
            if (res.success) {
                toast.success(current ? "Item hidden from store" : "Item visible in store");
                loadData();
            } else toast.error(res.error);
        } catch { toast.error("Failed to update item"); }
    }

    async function updateOrderStatus(orderId: string, status: string) {
        try {
            const res = await updateStoreOrderStatusAction(orderId, status);
            if (res.success) {
                toast.success(`Order marked as ${status.toLowerCase()}`);
                loadData();
            } else toast.error(res.error);
        } catch { toast.error("Failed to update order"); }
    }

    // ─── Derived Stats ──────────────────────────────────────
    const totalItems = items.length;
    const availableItems = items.filter(i => i.isAvailable).length;
    const totalStock = items.reduce((a, b) => a + (b.stock || 0), 0);
    const totalOrders = orders.length;

    const filteredItems = items.filter(item => {
        const matchQ = searchQ === "" || item.name.toLowerCase().includes(searchQ.toLowerCase());
        const matchCat = filterCat === "ALL" || item.category === filterCat;
        return matchQ && matchCat;
    });

    return (
        <div style={{ padding: "32px 32px 60px", background: "linear-gradient(160deg,#F0EFF8 0%,#FAFAFA 60%,#FFF8F0 100%)", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <PageStyles />

            {/* ── PAGE HEADER ── */}
            <div style={{ marginBottom: 30, animation: "fadeUp 0.5s ease both" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${C.amber},${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${C.amber}40`, animation: "float 3.5s ease-in-out infinite" }}>
                                <ShoppingBag size={22} color="white" />
                            </div>
                            <div>
                                <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: -1, lineHeight: 1.1, margin: 0 }}>
                                    School Store
                                </h1>
                                <p style={{ fontSize: 13, color: C.g400, margin: 0, marginTop: 2 }}>Manage merchandise, uniforms &amp; stationery</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        {/* View Toggle */}
                        <div style={{ display: "flex", background: C.g100, borderRadius: 12, padding: 4, gap: 2 }}>
                            {(["CATALOG", "ORDERS"] as const).map(v => (
                                <button key={v} onClick={() => setView(v)}
                                    style={{ padding: "8px 18px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: view === v ? `linear-gradient(135deg,${C.amber},${C.orange})` : "transparent", color: view === v ? "white" : C.g500, transition: `all 0.4s ${C.spring}`, boxShadow: view === v ? `0 3px 12px ${C.amber}40` : "none", letterSpacing: 0.3 }}>
                                    {v === "CATALOG" ? "📦 Catalog" : "🛒 Orders"}
                                </button>
                            ))}
                        </div>

                        <Btn icon={RefreshCw} variant="secondary" size="sm" onClick={loadData}>Refresh</Btn>
                        {view === "CATALOG" && (
                            <Btn icon={Plus} variant="primary" size="md" onClick={() => setShowForm(!showForm)}>Add Item</Btn>
                        )}
                    </div>
                </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                {[
                    { icon: Package, label: "Total Products", value: String(totalItems), delta: 0, color: C.purple, bg: C.purpleL },
                    { icon: Eye, label: "Available Now", value: String(availableItems), delta: availableItems > 0 ? 5 : -5, color: C.green, bg: C.greenL },
                    { icon: Archive, label: "Total Stock", value: String(totalStock), delta: 3, color: C.amber, bg: C.amberL },
                    { icon: ShoppingCart, label: "Total Orders", value: String(totalOrders), delta: totalOrders > 0 ? 8 : 0, color: C.blue, bg: C.blueL },
                ].map((s, i) => (
                    <div key={i} style={{ animation: `bounceIn 0.5s ease ${i * 0.1}s both` }}>
                        <StatCard {...s} />
                    </div>
                ))}
            </div>

            {/* ── ADD ITEM MODAL ── */}
            {showForm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(30,27,75,0.6)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", animation: "scaleIn 0.2s ease" }}
                    onClick={() => setShowForm(false)}>
                    <div style={{ background: "white", borderRadius: 28, padding: 36, width: "90%", maxWidth: 560, boxShadow: C.shL, animation: "scaleIn 0.3s ease" }}
                        onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${C.amber},${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Sparkles size={18} color="white" />
                                    </div>
                                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: C.navy, margin: 0 }}>Add Store Item</h2>
                                </div>
                                <p style={{ fontSize: 13, color: C.g400, margin: 0, marginLeft: 48 }}>Fill in details to add a new product.</p>
                            </div>
                            <button className="rubber-hover" onClick={() => setShowForm(false)}
                                style={{ width: 32, height: 32, borderRadius: 9, border: `1.5px solid ${C.g200}`, background: C.g50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X size={15} color={C.g500} />
                            </button>
                        </div>

                        {/* Category Picker */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: C.g600, display: "block", marginBottom: 8 }}>Category</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {CATEGORIES.map(c => {
                                    const m = CAT_META[c];
                                    const isActive = form.category === c;
                                    return (
                                        <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                                            style={{ padding: "7px 14px", borderRadius: 10, border: `2px solid ${isActive ? m.color : C.g200}`, background: isActive ? m.bg : "white", color: isActive ? m.color : C.g500, fontSize: 12.5, fontWeight: 700, cursor: "pointer", transition: `all 0.3s ${C.spring}`, transform: isActive ? "scale(1.05)" : "scale(1)" }}>
                                            {m.emoji} {c}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                            <div style={{ gridColumn: "1/-1" }}>
                                <FInput label="Item Name" placeholder="E.g., School Uniform Full Set" required value={form.name} onChange={(e: any) => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <FInput label="Price" placeholder="350" type="number" prefix="₹" required value={form.price} onChange={(e: any) => setForm(f => ({ ...f, price: e.target.value }))} />
                            <FInput label="Stock Quantity" placeholder="50" type="number" required value={form.stock} onChange={(e: any) => setForm(f => ({ ...f, stock: e.target.value }))} />
                            <div style={{ gridColumn: "1/-1" }}>
                                <FInput label="Description (optional)" placeholder="Size, material, or additional notes..." value={form.description} onChange={(e: any) => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                            <Btn variant="primary" icon={Check} loading={isCreating} onClick={handleCreate}>Add to Store</Btn>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MAIN CONTENT ── */}
            <div style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: C.sh, animation: "fadeUp 0.5s ease 0.3s both" }}>

                {/* Content Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 2 }}>
                            {view === "CATALOG" ? "📦 Product Catalog" : "🛒 Orders"}
                        </div>
                        <div style={{ fontSize: 12, color: C.g400 }}>
                            {view === "CATALOG" ? `${filteredItems.length} product${filteredItems.length !== 1 ? "s" : ""} found` : `${orders.length} order${orders.length !== 1 ? "s" : ""} total`}
                        </div>
                    </div>

                    {view === "CATALOG" && (
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            {/* Search */}
                            <div style={{ position: "relative" }}>
                                <Search size={13} color={C.g400} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                                <input placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                                    style={{ paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9, fontSize: 13, border: `1.5px solid ${C.g200}`, borderRadius: 10, outline: "none", width: 200, fontFamily: "'Plus Jakarta Sans',sans-serif", background: C.g50, color: C.g800 }} />
                            </div>

                            {/* Category Filter */}
                            <div style={{ display: "flex", gap: 6 }}>
                                {["ALL", ...CATEGORIES].map(c => (
                                    <button key={c} onClick={() => setFilterCat(c)}
                                        style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${filterCat === c ? C.amber : C.g200}`, background: filterCat === c ? C.amberL : "white", color: filterCat === c ? C.amberD : C.g500, fontSize: 11.5, fontWeight: 700, cursor: "pointer", transition: C.tr }}>
                                        {c === "ALL" ? "All" : CAT_META[c].emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── LOADING STATE ── */}
                {isLoading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ background: C.g50, borderRadius: 20, padding: 20, animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                                    <Skeleton width={44} height={44} radius={12} />
                                    <Skeleton width={60} height={20} radius={10} />
                                </div>
                                <Skeleton width="70%" height={18} radius={6} />
                                <div style={{ height: 8 }} />
                                <Skeleton width="45%" height={12} radius={4} />
                                <div style={{ height: 16 }} />
                                <Skeleton width="100%" height={36} radius={10} />
                            </div>
                        ))}
                    </div>
                ) : view === "CATALOG" ? (

                    /* ── CATALOG GRID ── */
                    filteredItems.length === 0 ? (
                        <div style={{ padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", border: `2px dashed ${C.g200}`, borderRadius: 20 }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: C.amberL, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>
                                <ShoppingBag size={32} color={C.amber} />
                            </div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 6 }}>
                                {searchQ || filterCat !== "ALL" ? "No products found" : "Store is empty"}
                            </div>
                            <p style={{ fontSize: 13.5, color: C.g400, marginBottom: 20 }}>
                                {searchQ || filterCat !== "ALL" ? "Try clearing your filters." : "Add your first item to get started."}
                            </p>
                            {!searchQ && filterCat === "ALL" && (
                                <Btn icon={Plus} variant="primary" onClick={() => setShowForm(true)}>Add First Item</Btn>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                            {filteredItems.map((item, idx) => {
                                const m = CAT_META[item.category] || CAT_META.OTHER;
                                return (
                                    <div key={item.id} className="store-hover-lift" style={{ borderRadius: 20, border: `1.5px solid ${item.isAvailable ? C.g100 : C.g200}`, background: item.isAvailable ? "white" : C.g50, padding: 20, transition: C.tr, opacity: item.isAvailable ? 1 : 0.65, animation: `slideRight 0.35s ease ${idx * 0.05}s both`, position: "relative", overflow: "hidden" }}>
                                        {/* Availability glow */}
                                        {item.isAvailable && <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right,${m.color}12,transparent)`, pointerEvents: "none" }} />}

                                        {/* Card Header */}
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: 13, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                                                    {m.emoji}
                                                </div>
                                                <div>
                                                    <Badge label={item.category} color={m.color} bg={m.bg} />
                                                    <div style={{ marginTop: 4, fontSize: 14, fontWeight: 800, color: C.navy, fontFamily: "'Sora',sans-serif" }}>{item.name}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {item.description && (
                                            <p style={{ fontSize: 12.5, color: C.g400, marginBottom: 14, lineHeight: 1.5 }}>{item.description}</p>
                                        )}

                                        {/* Price & Stock */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.g50, borderRadius: 12, marginBottom: 14, border: `1px solid ${C.g100}` }}>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: 0.8 }}>Price</div>
                                                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: m.color }}>₹{item.price}</div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: 0.8 }}>Stock</div>
                                                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: item.stock > 10 ? C.green : item.stock > 0 ? C.amber : C.red }}>
                                                    {item.stock}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Availability Toggle */}
                                        <button onClick={() => toggleAvailability(item.id, item.isAvailable)}
                                            onMouseEnter={e => { (e.currentTarget as any).style.filter = "brightness(0.95)"; }}
                                            onMouseLeave={e => { (e.currentTarget as any).style.filter = "none"; }}
                                            style={{ width: "100%", padding: "9px 14px", borderRadius: 11, border: `1.5px solid ${item.isAvailable ? C.green + "50" : C.amber + "50"}`, background: item.isAvailable ? C.greenXL : C.amberXL, color: item.isAvailable ? C.greenD : C.amberD, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: C.tr, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                                            {item.isAvailable ? <><Eye size={13} /> Visible in Store</> : <><EyeOff size={13} /> Hidden from Store</>}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (

                    /* ── ORDERS TABLE ── */
                    orders.length === 0 ? (
                        <div style={{ padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", border: `2px dashed ${C.g200}`, borderRadius: 20 }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: C.blueL, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>
                                <ShoppingCart size={32} color={C.blue} />
                            </div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 6 }}>No Orders Yet</div>
                            <p style={{ fontSize: 13.5, color: C.g400 }}>Orders placed by parents will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ borderRadius: 20, border: `1px solid ${C.g100}`, overflow: "hidden", boxShadow: C.sh }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})` }}>
                                        {["Order ID", "Student", "Items", "Total", "Status", "Date", "Actions"].map((h, i) => (
                                            <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: 0.7, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, idx) => {
                                        const sm = STATUS_META[order.status] || STATUS_META.PLACED;
                                        return (
                                            <tr key={order.id} style={{ background: idx % 2 === 0 ? "white" : C.g50, borderBottom: `1px solid ${C.g100}`, transition: C.tr, animation: `slideRight 0.3s ease ${idx * 0.05}s both` }}
                                                onMouseEnter={e => { (e.currentTarget as any).style.background = C.amberXL; (e.currentTarget as any).style.transform = "translateX(2px)"; }}
                                                onMouseLeave={e => { (e.currentTarget as any).style.background = idx % 2 === 0 ? "white" : C.g50; (e.currentTarget as any).style.transform = "none"; }}>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: C.g500, fontFamily: "monospace", background: C.g100, padding: "3px 8px", borderRadius: 6 }}>#{order.id.slice(-6).toUpperCase()}</span>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: 33, height: 33, borderRadius: 10, background: C.amberL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.amberD, flexShrink: 0 }}>
                                                            {order.student?.firstName?.[0]}{order.student?.lastName?.[0]}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.g800 }}>{order.student?.firstName} {order.student?.lastName}</div>
                                                            <div style={{ fontSize: 11, color: C.g400 }}>{order.student?.admissionNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                        {order.items?.slice(0, 2).map((i: any) => (
                                                            <div key={i.id} style={{ fontSize: 12, color: C.g600 }}>• {i.item?.name} ×{i.quantity}</div>
                                                        ))}
                                                        {order.items?.length > 2 && <div style={{ fontSize: 11, color: C.g400 }}>+{order.items.length - 2} more</div>}
                                                    </div>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.green }}>₹{order.totalAmount.toFixed(0)}</div>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <Badge label={sm.label} color={sm.color} bg={sm.bg} dot />
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <div style={{ fontSize: 12, color: C.g500 }}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                                        <div style={{ display: "flex", gap: 6 }}>
                                                            {order.status === "PLACED" && (
                                                                <button onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                                                                    style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: C.blueL, color: C.blue, fontSize: 11.5, fontWeight: 700, cursor: "pointer", transition: C.tr }}
                                                                    onMouseEnter={e => { (e.currentTarget as any).style.background = C.blue; (e.currentTarget as any).style.color = "white"; }}
                                                                    onMouseLeave={e => { (e.currentTarget as any).style.background = C.blueL; (e.currentTarget as any).style.color = C.blue; }}>
                                                                    Confirm
                                                                </button>
                                                            )}
                                                            {order.status === "CONFIRMED" && (
                                                                <button onClick={() => updateOrderStatus(order.id, "READY")}
                                                                    style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: C.purpleL, color: C.purple, fontSize: 11.5, fontWeight: 700, cursor: "pointer", transition: C.tr }}
                                                                    onMouseEnter={e => { (e.currentTarget as any).style.background = C.purple; (e.currentTarget as any).style.color = "white"; }}
                                                                    onMouseLeave={e => { (e.currentTarget as any).style.background = C.purpleL; (e.currentTarget as any).style.color = C.purple; }}>
                                                                    Mark Ready
                                                                </button>
                                                            )}
                                                            {order.status === "READY" && (
                                                                <button onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                                                                    style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: C.greenL, color: C.greenD, fontSize: 11.5, fontWeight: 700, cursor: "pointer", transition: C.tr }}
                                                                    onMouseEnter={e => { (e.currentTarget as any).style.background = C.green; (e.currentTarget as any).style.color = "white"; }}
                                                                    onMouseLeave={e => { (e.currentTarget as any).style.background = C.greenL; (e.currentTarget as any).style.color = C.greenD; }}>
                                                                    Delivered
                                                                </button>
                                                            )}
                                                            <button onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                                                                style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: C.redL, color: C.red, fontSize: 11.5, fontWeight: 700, cursor: "pointer", transition: C.tr }}
                                                                onMouseEnter={e => { (e.currentTarget as any).style.background = C.red; (e.currentTarget as any).style.color = "white"; }}
                                                                onMouseLeave={e => { (e.currentTarget as any).style.background = C.redL; (e.currentTarget as any).style.color = C.red; }}>
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
