import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const studentId = url.searchParams.get("studentId");
        const view = url.searchParams.get("view"); // "menu" | "orders" | "wallet"

        if (!studentId) {
            return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        if (view === "menu") {
            const today = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat
            const items = [
                { id: "1", name: "Idli Sambar with Chutney", price: 35, mealType: "BREAKFAST", category: "South Indian", dietType: "VEG" },
                { id: "2", name: "Batata Poha with Lemon", price: 30, mealType: "BREAKFAST", category: "Indian", dietType: "VEG" },
                { id: "3", name: "Dal Tadka Rice Combo", price: 65, mealType: "LUNCH", category: "Main Course", dietType: "VEG" },
                { id: "4", name: "Paneer Butter Masala + Rice", price: 80, mealType: "LUNCH", category: "North Indian", dietType: "VEG" },
                { id: "5", name: "Seasonal Fruit Bowl", price: 45, mealType: "SNACK", category: "Healthy", dietType: "VEG" },
                { id: "6", name: "Grilled Masala Sandwich", price: 40, mealType: "SNACK", category: "Snack", dietType: "VEG" }
            ];

            return NextResponse.json({
                success: true,
                data: { todayMenu: [], allItems: items, dayOfWeek: today },
            });
        }

        if (view === "wallet") {
            const wallet = {
                balance: 487.50,
                transactions: [
                    { id: "t1", type: "DEBIT", description: "Dal Tadka Combo + Fruit Bowl", reason: "Canteen Counter 2", amount: 110, createdAt: new Date().toISOString() },
                    { id: "t2", type: "CREDIT", description: "Wallet Recharge — UPI", reason: "Sarah Johnson", amount: 500, createdAt: new Date(Date.now() - 86400000).toISOString() },
                    { id: "t3", type: "DEBIT", description: "Idli Sambar + Poha", reason: "Canteen Counter 1", amount: 65, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
                    { id: "t4", type: "DEBIT", description: "Grilled Masala Sandwich × 2", reason: "Canteen Counter 3", amount: 80, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() }
                ]
            };
            return NextResponse.json({ success: true, data: wallet });
        }

        if (view === "orders") {
            const orders = [
                {
                    id: "o1",
                    totalAmount: 110,
                    paymentMethod: "WALLET",
                    orderDate: new Date().toISOString(),
                    orderItems: [
                        { item: { name: "Dal Tadka Rice Combo" }, quantity: 1 },
                        { item: { name: "Seasonal Fruit Bowl" }, quantity: 1 }
                    ]
                },
                {
                    id: "o2",
                    totalAmount: 65,
                    paymentMethod: "WALLET",
                    orderDate: new Date(Date.now() - 86400000 * 2).toISOString(),
                    orderItems: [
                        { item: { name: "Idli Sambar with Chutney" }, quantity: 1 },
                        { item: { name: "Batata Poha with Lemon" }, quantity: 1 }
                    ]
                }
            ];
            return NextResponse.json({ success: true, data: orders });
        }

        const subscription = null;
        const wallet = { balance: 487.50 };

        return NextResponse.json({
            success: true,
            data: {
                subscription,
                walletBalance: wallet.balance,
                hasActiveSubscription: !!subscription,
            },
        });
    } catch (error: any) {
        console.error("Canteen API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
