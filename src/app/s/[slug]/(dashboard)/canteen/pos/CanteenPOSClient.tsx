"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    processCanteenOrderAction,
    getPOSStudentContextAction,
    topUpWalletAction,
    toggleCanteenItemAvailabilityAction,
} from "@/app/actions/canteen-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSidebar } from "@/context/SidebarContext";
import {
    Search, ShoppingCart, Plus, Minus, X, Wallet, CreditCard, Banknote,
    CheckCircle, User, Utensils, Coffee, CupSoda, RefreshCw, Clock,
    TrendingUp, Receipt, AlertCircle, Loader2, Star, MoreVertical, Printer
} from "lucide-react";

// ——— Types ———
type Item = { id: string; name: string; category: string; mealType: string; dietType: string; price: number; isAvailable: boolean; isAddOn: boolean; hsnCode?: string | null; gstPercentage?: number };
type Student = { id: string; firstName: string; lastName: string; admissionNumber: string; avatar?: string; classroom?: { name: string } };
type CartItem = Item & { quantity: number; taxAmount?: number };
type OrderItem = { item: { name: string; price: number; mealType: string }; quantity: number; price: number; taxAmount?: number; hsnCode?: string | null };
type Order = {
    id: string;
    totalAmount: number;
    subtotal?: number;
    taxAmount?: number;
    paymentMethod: string;
    orderDate: string;
    status: string;
    student: { id: string; firstName: string; lastName: string; admissionNumber: string };
    orderItems: OrderItem[];
};
type StudentCtx = { subscription: any; walletBalance: number; todayOrders: Order[] };

// ——— Constants ———
const MEAL_ICONS: Record<string, any> = { BREAKFAST: Coffee, LUNCH: Utensils, SNACKS: CupSoda, DINNER: Utensils, ANY: ShoppingCart };
const MEAL_FILTERS = ["ALL", "BREAKFAST", "LUNCH", "SNACKS", "DINNER", "ANY"];
const DIET_FILTERS = ["ALL", "VEG", "NON_VEG", "EGG"];
const PAYMENT_METHODS = [
    { id: "WALLET", label: "Wallet", icon: Wallet, grad: "from-violet-500 to-purple-600" },
    { id: "CASH", label: "Cash", icon: Banknote, grad: "from-green-500 to-emerald-600" },
    { id: "UPI", label: "UPI", icon: CreditCard, grad: "from-blue-500 to-indigo-600" },
];
const TOPUP_PRESETS = [100, 200, 500, 1000, 2000];

function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
}

// ——— Main Component ———
export default function CanteenPOSClient({
    slug, items: initialItems, students,
    recentOrders: initialOrders,
    todayRevenue: initialRevenue,
    todayOrderCount: initialOrderCount,
    schoolGstType,
    schoolCommonGst,
}: {
    slug: string;
    items: Item[];
    students: Student[];
    recentOrders: Order[];
    todayRevenue: number;
    todayOrderCount: number;
    schoolGstType?: string;
    schoolCommonGst?: number;
}) {
    const { currency, isAppFullscreen } = useSidebar();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const fmt = (n: number) => `${currency}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Items
    const [items, setItems] = useState<Item[]>(initialItems);

    // Item panel filters
    const [itemSearch, setItemSearch] = useState("");
    const [mealFilter, setMealFilter] = useState("ALL");
    const [dietFilter, setDietFilter] = useState("ALL");

    // Student
    const [studentSearch, setStudentSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentCtx, setStudentCtx] = useState<StudentCtx | null>(null);
    const [loadingCtx, setLoadingCtx] = useState(false);

    // Cart
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "CASH" | "UPI">("WALLET");

    // Right panel tab
    const [rightTab, setRightTab] = useState<"cart" | "orders">("cart");

    // Order success flash
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [lastOrder, setLastOrder] = useState<Order | null>(null);

    // Top-up dialog
    const [showTopUp, setShowTopUp] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState("");

    // Live stats (updated after each order)
    const [todayRevenue, setTodayRevenue] = useState(initialRevenue);
    const [todayOrderCount, setTodayOrderCount] = useState(initialOrderCount);
    const [recentOrders, setRecentOrders] = useState<Order[]>(initialOrders);

    // ——— Derived ———
    const filteredStudents = studentSearch.length > 1
        ? students.filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.admissionNumber.toLowerCase().includes(studentSearch.toLowerCase())
        ).slice(0, 8)
        : [];

    const filteredItems = items.filter(it =>
        (mealFilter === "ALL" || it.mealType === mealFilter) &&
        (dietFilter === "ALL" || it.dietType === dietFilter) &&
        (itemSearch === "" || it.name.toLowerCase().includes(itemSearch.toLowerCase()))
    );

    const getTaxAmount = (item: CartItem) => {
        if (!schoolGstType || schoolGstType === "NONE") return 0;
        const rate = schoolGstType === "COMMON" ? (schoolCommonGst || 0) : (item.gstPercentage || 0);
        return Math.round(((item.price * item.quantity) * (rate / 100)) * 100) / 100;
    };

    const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const cartDetailed = cart.map(i => ({ ...i, taxAmount: getTaxAmount(i) }));
    const totalTaxAmount = cartDetailed.reduce((s, i) => s + i.taxAmount, 0);
    const cartTotal = cartSubtotal + totalTaxAmount;
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const walletBalance = studentCtx?.walletBalance ?? 0;
    const walletInsufficient = paymentMethod === "WALLET" && studentCtx !== null && walletBalance < cartTotal;

    // ——— Handlers ———
    const refresh = useCallback(() => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 900);
    }, [router]);

    const handleSelectStudent = useCallback((student: Student) => {
        setSelectedStudent(student);
        setStudentSearch("");
        setStudentCtx(null);
        setCart([]);
        setLoadingCtx(true);
        startTransition(async () => {
            const res = await getPOSStudentContextAction(slug, student.id);
            setLoadingCtx(false);
            if (res.success) setStudentCtx(res.data as StudentCtx);
            else toast.error("Could not load student info.");
        });
    }, [slug]);

    const addToCart = (item: Item) => {
        if (!item.isAvailable) { toast.error("Item is out of stock."); return; }
        setCart(prev => {
            const ex = prev.find(i => i.id === item.id);
            if (ex) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...item, quantity: 1 }];
        });
        setRightTab("cart");
    };

    const changeQty = (id: string, delta: number) =>
        setCart(prev => prev
            .map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
            .filter(i => i.quantity > 0)
        );

    const clearCart = () => setCart([]);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const toggleAvailability = (e: React.MouseEvent, id: string, currentStatus: boolean) => {
        e.stopPropagation();
        startTransition(async () => {
            setItems(prev => prev.map(i => i.id === id ? { ...i, isAvailable: !currentStatus } : i));
            const res = await toggleCanteenItemAvailabilityAction(slug, id, !currentStatus);
            if (res.success) toast.success(`Item marked as ${!currentStatus ? 'Available' : 'Out of Stock'}`);
            else {
                toast.error(res.error ?? "Failed to update availability");
                setItems(prev => prev.map(i => i.id === id ? { ...i, isAvailable: currentStatus } : i));
            }
        });
    };

    const handleCheckout = () => {
        if (!selectedStudent) { toast.error("Please select a student first."); return; }
        if (cart.length === 0) { toast.error("Cart is empty."); return; }
        if (walletInsufficient) {
            toast.error(`Insufficient wallet balance. Need ${fmt(cartTotal)}, have ${fmt(walletBalance)}.`);
            return;
        }

        startTransition(async () => {
            const res = await processCanteenOrderAction(slug, {
                studentId: selectedStudent.id,
                cartItems: cartDetailed.map(i => ({
                    itemId: i.id,
                    quantity: i.quantity,
                    price: i.price,
                    taxAmount: i.taxAmount,
                    hsnCode: i.hsnCode || null
                })),
                paymentMethod,
                subscriptionId: studentCtx?.subscription?.id,
                subtotal: cartSubtotal,
                taxAmount: totalTaxAmount,
            });

            if (res.success) {
                setTodayRevenue(r => r + cartTotal);
                setTodayOrderCount(c => c + 1);

                const newOrder: Order = {
                    id: (res.data as any)?.id ?? `tmp-${Date.now()}`,
                    totalAmount: cartTotal,
                    subtotal: cartSubtotal,
                    taxAmount: totalTaxAmount,
                    paymentMethod,
                    orderDate: new Date().toISOString(),
                    status: "COMPLETED",
                    student: {
                        id: selectedStudent.id,
                        firstName: selectedStudent.firstName,
                        lastName: selectedStudent.lastName,
                        admissionNumber: selectedStudent.admissionNumber,
                    },
                    orderItems: cartDetailed.map(i => ({
                        item: { name: i.name, price: i.price, mealType: i.mealType },
                        quantity: i.quantity,
                        price: i.price,
                        taxAmount: i.taxAmount,
                        hsnCode: i.hsnCode || null,
                    })),
                };
                setRecentOrders(prev => [newOrder, ...prev.slice(0, 49)]);

                if (studentCtx && paymentMethod === "WALLET") {
                    setStudentCtx(prev => prev ? { ...prev, walletBalance: prev.walletBalance - cartTotal } : prev);
                }

                setOrderSuccess(true);
                setLastOrder(newOrder);
                setCart([]);
                toast.success(`✅ Order processed! ${fmt(cartTotal)} via ${paymentMethod}`);
                refresh();
            } else {
                toast.error(res.error ?? "Failed to process order.");
            }
        });
    };

    const handleTopUp = () => {
        const amount = parseFloat(topUpAmount);
        if (!amount || amount <= 0) { toast.error("Enter a valid amount."); return; }
        startTransition(async () => {
            const res = await topUpWalletAction(slug, selectedStudent!.id, amount, "Admin top-up via POS");
            if (res.success) {
                toast.success(`${fmt(amount)} added to wallet!`);
                setStudentCtx(prev => prev ? { ...prev, walletBalance: res.newBalance! } : prev);
                setShowTopUp(false);
                setTopUpAmount("");
            } else {
                toast.error(res.error ?? "Failed to top up.");
            }
        });
    };

    const handlePrintBill = (order: Order) => {
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) { toast.error("Could not open print window. Check popup blocker."); return; }

        const formatCurrency = (n: number) => `${currency}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const html = `
            <html>
                <head>
                    <title>Print Receipt - ${order.id}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; font-size: 14px; padding: 20px; color: #000; }
                        .center { text-align: center; }
                        h2 { margin: 5px 0; }
                        p { margin: 3px 0; }
                        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                        .table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                        .table th, .table td { text-align: left; padding: 4px 0; }
                        .table th { border-bottom: 1px solid #000; }
                        .right { text-align: right; }
                        .bold { font-weight: bold; }
                        @media print {
                            body { width: 300px; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <h2>CAFETARIA RECEIPT</h2>
                        <p>Order ID: ${order.id.split("-").pop()?.substring(0, 8)}</p>
                        <p>Date: ${new Date(order.orderDate).toLocaleString()}</p>
                    </div>
                    <div class="line"></div>
                    <p>Student: ${order.student.firstName} ${order.student.lastName}</p>
                    <p>Adm No: ${order.student.admissionNumber}</p>
                    <div class="line"></div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th class="center">HSN</th>
                                <th class="right">Price</th>
                                <th class="center">Qty</th>
                                <th class="right">Tax</th>
                                <th class="right">Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.orderItems.map(item => `
                                <tr>
                                    <td>${item.item.name}</td>
                                    <td class="center text-xs" style="font-size: 11px;">${item.hsnCode || "-"}</td>
                                    <td class="right text-xs">${formatCurrency(item.price)}</td>
                                    <td class="center">${item.quantity}</td>
                                    <td class="right text-xs">${formatCurrency(item.taxAmount || 0)}</td>
                                    <td class="right bold">${formatCurrency(item.price * item.quantity + (item.taxAmount || 0))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="line"></div>
                    <div class="right bold">
                        <p style="font-weight: normal; font-size: 13px;">Subtotal: ${formatCurrency(order.subtotal ?? order.totalAmount)}</p>
                        ${(order.taxAmount || 0) > 0 ? `<p style="font-weight: normal; font-size: 13px;">GST / Taxes: ${formatCurrency(order.taxAmount ?? 0)}</p>` : ''}
                        <p style="font-size: 16px; margin-top: 5px;">Total: ${formatCurrency(order.totalAmount)}</p>
                        <p style="font-weight: normal; font-size: 12px; margin-top: 5px;">Payment: ${order.paymentMethod}</p>
                    </div>
                    <div class="line"></div>
                    <p class="center" style="font-size: 12px; margin-top: 15px;">Thank you! Enjoy your meal.</p>
                </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div className={
            isAppFullscreen
                ? "flex flex-col w-full h-full overflow-hidden bg-slate-50"
                : "flex flex-col h-[calc(100vh-96px)] sm:h-[calc(100vh-112px)] lg:h-[calc(100vh-128px)] rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-slate-50"
        }>

            {/* ── Top Stats Bar ── */}
            <div className="shrink-0 px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
                <div className="flex-1 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-bold text-slate-700">Today's Sales</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Revenue</p>
                        <p className="text-lg font-black text-slate-800">{fmt(todayRevenue)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Orders</p>
                        <p className="text-lg font-black text-slate-800">{todayOrderCount}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <Button variant="ghost" size="sm" onClick={refresh} disabled={isRefreshing} className="gap-1.5 text-xs">
                            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Main 3-column Layout ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ─── Col 1: Item Grid ─── */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200 min-w-0">
                    <div className="shrink-0 p-3 bg-white border-b border-slate-200 space-y-2.5">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search menu items..."
                                    className="pl-9 h-9 text-sm"
                                    value={itemSearch}
                                    onChange={e => setItemSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col ml-2 justify-center gap-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Diet</p>
                                <select
                                    aria-label="Filter by Diet"
                                    className="text-xs bg-slate-100 hover:bg-slate-200 border-0 outline-none rounded py-1 pl-1 pr-6 font-semibold text-slate-700 cursor-pointer h-6"
                                    value={dietFilter}
                                    onChange={(e) => setDietFilter(e.target.value)}
                                >
                                    {DIET_FILTERS.map(f => (
                                        <option key={f} value={f}>{f === "ALL" ? "All Diet" : f.replace('_', '-')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                            {MEAL_FILTERS.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setMealFilter(f)}
                                    className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all
                                        ${mealFilter === f
                                            ? "bg-orange-500 text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                >
                                    {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 content-start">
                        {filteredItems.map(item => {
                            const Icon = MEAL_ICONS[item.mealType] ?? ShoppingCart;
                            const inCart = cart.find(c => c.id === item.id);
                            const DietDot = item.dietType === "VEG" ? "bg-green-500" : item.dietType === "NON_VEG" ? "bg-red-500" : item.dietType === "EGG" ? "bg-yellow-500" : "bg-slate-300";

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    className={`relative text-left p-3 rounded-2xl border-2 transition-all flex flex-col justify-between
                                        ${!item.isAvailable ? "bg-slate-50 border-slate-200 opacity-60 grayscale-[0.8]" : "bg-white hover:shadow-md active:scale-95"}
                                        ${inCart ? "border-orange-400 ring-2 ring-orange-100 shadow-orange-100" : "border-slate-200 hover:border-orange-300"}`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${inCart ? "bg-orange-500" : "bg-orange-50"}`}>
                                            <Icon className={`h-5 w-5 ${inCart ? "text-white" : "text-orange-500"}`} />
                                        </div>
                                        <div className="w-3 h-3 rounded-sm border border-slate-300 flex items-center justify-center bg-white" title={item.dietType}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${DietDot}`} />
                                        </div>
                                    </div>

                                    <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                                        <div
                                            role="button"
                                            title="Item options"
                                            tabIndex={0}
                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }}
                                            onKeyDown={(e) => e.key === 'Enter' && setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/80 border border-slate-200 hover:bg-slate-50 shadow-sm transition cursor-pointer"
                                        >
                                            <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                                        </div>
                                        {openMenuId === item.id && (
                                            <div className="absolute top-7 right-0 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden text-xs">
                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => { e.stopPropagation(); toggleAvailability(e as any, item.id, item.isAvailable); setOpenMenuId(null); }}
                                                    onKeyDown={(e) => e.key === 'Enter' && toggleAvailability(e as any, item.id, item.isAvailable)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2.5 font-semibold hover:bg-slate-50 transition cursor-pointer ${item.isAvailable ? 'text-red-600' : 'text-green-600'}`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.isAvailable ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    {item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">{item.name}</p>
                                        <div className="flex justify-between items-end mt-1">
                                            <p className="text-base font-black text-orange-600">{fmt(item.price)}</p>
                                        </div>
                                    </div>

                                    {item.isAddOn && (
                                        <Badge variant="outline" className="absolute bottom-2 right-2 text-[8px] px-1 py-0 border-purple-300 text-purple-600">
                                            Add-on
                                        </Badge>
                                    )}
                                    {inCart && (
                                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                                            {inCart.quantity}
                                        </div>
                                    )}
                                    {!item.isAvailable && !inCart && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/40 rounded-xl" onClick={(e) => e.stopPropagation()}>
                                            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm rotate-[-12deg]">Out of Stock</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ─── Col 2: Student + Cart + Checkout ─── */}
                <div className="w-[340px] shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-hidden">
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        <div className="shrink-0 p-3 border-b border-slate-200 space-y-2">
                            {!selectedStudent ? (
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search student..."
                                        className="pl-9 h-9 text-sm"
                                        value={studentSearch}
                                        onChange={e => setStudentSearch(e.target.value)}
                                        autoComplete="off"
                                    />
                                    {filteredStudents.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto">
                                            {filteredStudents.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => handleSelectStudent(s)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-orange-50 border-b border-slate-100 last:border-0 text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                        {s.firstName[0]}{s.lastName[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 truncate">{s.firstName} {s.lastName}</p>
                                                        <p className="text-xs text-slate-500 truncate">{s.admissionNumber}{s.classroom?.name ? ` · ${s.classroom.name}` : ""}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-2.5 border border-orange-200">
                                    <div className="h-9 w-9 rounded-full bg-orange-200 text-orange-800 font-black text-sm flex items-center justify-center shrink-0">
                                        {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                                        <p className="text-xs text-slate-500 truncate">{selectedStudent.admissionNumber}{selectedStudent.classroom?.name ? ` · ${selectedStudent.classroom.name}` : ""}</p>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedStudent(null); setStudentCtx(null); setCart([]); }}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                        title="Clear selected student"
                                        aria-label="Clear selected student"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {selectedStudent && (
                                <>
                                    {loadingCtx && (
                                        <div className="flex items-center gap-2 text-xs text-slate-400 justify-center py-1.5">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading student info...
                                        </div>
                                    )}
                                    {studentCtx && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between bg-violet-50 rounded-xl px-3 py-2 border border-violet-200">
                                                <div className="flex items-center gap-1.5">
                                                    <Wallet className="h-3.5 w-3.5 text-violet-600" />
                                                    <span className="text-xs font-semibold text-violet-800">Wallet</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${walletInsufficient && cart.length > 0 ? "text-red-600" : "text-violet-700"}`}>
                                                        {fmt(studentCtx.walletBalance)}
                                                    </span>
                                                    <button onClick={() => setShowTopUp(true)} className="text-[10px] bg-violet-600 hover:bg-violet-700 text-white px-2 py-0.5 rounded-full font-bold transition-colors">Top Up</button>
                                                </div>
                                            </div>

                                            {studentCtx.subscription ? (
                                                <div className="bg-green-50 rounded-xl px-3 py-2 border border-green-200 flex items-center gap-2">
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-green-800 truncate">{studentCtx.subscription.package?.name}</p>
                                                        <p className="text-[10px] text-green-600 truncate">{studentCtx.subscription.package?.includedMeals?.split(",").map((m: string) => m[0] + m.slice(1).toLowerCase()).join(", ")}</p>
                                                    </div>
                                                    <Star className="h-3.5 w-3.5 text-green-500 shrink-0 ml-auto" />
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200 text-center"><p className="text-xs text-slate-400">No active meal plan</p></div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="shrink-0 flex border-b border-slate-200">
                            {[{ id: "cart", label: "Cart", badge: cartCount }, { id: "orders", label: "Recent Orders", badge: 0 }].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setRightTab(tab.id as any)}
                                    className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${rightTab === tab.id ? "border-orange-500 text-orange-600 bg-orange-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                                >
                                    {tab.id === "cart" ? <ShoppingCart className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                    {tab.label} {tab.id === "cart" && cartCount > 0 && <span className="bg-orange-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
                                </button>
                            ))}
                        </div>

                        {rightTab === "cart" && (
                            <div className="p-3 space-y-2 pb-6">
                                {cart.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400"><ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="text-sm font-medium">Cart is empty</p></div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-1"><p className="text-xs font-bold text-slate-600">{cartCount} item{cartCount > 1 ? "s" : ""}</p><button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 font-semibold">Clear all</button></div>
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                                                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p><p className="text-xs text-slate-500">{fmt(item.price)} each</p></div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => changeQty(item.id, -1)}
                                                        className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center"
                                                        title="Decrease quantity"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-5 text-center text-sm font-black text-slate-800">{item.quantity}</span>
                                                    <button
                                                        onClick={() => changeQty(item.id, 1)}
                                                        className="h-6 w-6 rounded-full bg-orange-500 text-white flex items-center justify-center"
                                                        title="Increase quantity"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="text-right shrink-0 w-14"><p className="text-sm font-bold text-slate-800">{fmt(item.price * item.quantity)}</p></div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {rightTab === "orders" && (
                            <div className="divide-y divide-slate-100 pb-6">
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400"><Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="text-sm font-medium">No orders today</p></div>
                                ) : recentOrders.map(o => (
                                    <div key={o.id} className="px-3 py-2.5 hover:bg-slate-50">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-800 truncate">{o.student.firstName} {o.student.lastName}</p><p className="text-[10px] text-slate-400">{o.student.admissionNumber} · {timeAgo(o.orderDate)}</p></div>
                                            <div className="shrink-0 text-right"><p className="text-sm font-black text-slate-900">{fmt(o.totalAmount)}</p><span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">{o.paymentMethod}</span></div>
                                        </div>
                                        <div className="flex justify-end mt-2"><button onClick={() => handlePrintBill(o)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded px-2 py-1"><Printer className="h-3 w-3" /> Print</button></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 p-3 border-t border-slate-200 space-y-2.5 bg-white mt-auto">
                        <div className="grid grid-cols-3 gap-1.5">
                            {PAYMENT_METHODS.map(pm => (
                                <button key={pm.id} onClick={() => setPaymentMethod(pm.id as any)} className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${paymentMethod === pm.id ? `bg-gradient-to-br ${pm.grad} text-white border-transparent` : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                                    <pm.icon className="h-3.5 w-3.5" /> {pm.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center justify-between px-1"><span className="text-sm font-semibold text-slate-600">Total</span><span className={`text-xl font-black ${walletInsufficient && cart.length > 0 ? "text-red-600" : "text-slate-900"}`}>{fmt(cartTotal)}</span></div>
                        {walletInsufficient && cart.length > 0 && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-2 rounded-xl text-[10px] font-bold"><AlertCircle className="h-3.5 w-3.5 shrink-0" />Need {fmt(cartTotal - walletBalance)} more.</div>}

                        <Button
                            onClick={handleCheckout}
                            disabled={isPending || cart.length === 0 || !selectedStudent || walletInsufficient}
                            className="w-full h-11 text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : cart.length === 0 ? "Add items" : !selectedStudent ? "Select student" : `Charge ${fmt(cartTotal)}`}
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
            <Dialog open={orderSuccess} onOpenChange={setOrderSuccess}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-10 w-10" /></div>
                        <h3 className="text-2xl font-black">Order Successful!</h3>
                    </div>
                    {lastOrder && (
                        <div className="p-6 bg-white space-y-6 text-center">
                            <h4 className="text-4xl font-black text-orange-700">{fmt(lastOrder.totalAmount)}</h4>
                            <div className="space-y-3">
                                <Button onClick={() => handlePrintBill(lastOrder!)} className="w-full h-12 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2"><Printer className="h-5 w-5" /> Print Receipt</Button>
                                <Button variant="outline" onClick={() => setOrderSuccess(false)} className="w-full h-12 rounded-2xl font-bold">Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={showTopUp} onOpenChange={(open: boolean) => { setShowTopUp(open); if (!open) setTopUpAmount(""); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>Top Up Wallet</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-1">
                        <div className="flex flex-wrap gap-2">
                            {TOPUP_PRESETS.map(amt => (
                                <button key={amt} onClick={() => setTopUpAmount(String(amt))} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${topUpAmount === String(amt) ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-700"}`}>{currency}{amt}</button>
                            ))}
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                            <Input type="number" placeholder="Amount..." value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} className="pl-7" />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShowTopUp(false)}>Cancel</Button>
                            <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={handleTopUp} disabled={isPending || !topUpAmount}>{isPending ? "Adding..." : "Add"}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
