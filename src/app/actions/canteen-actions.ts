"use server";

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { startOfDay, endOfDay, subDays, startOfMonth, format } from "date-fns";
import { validateUserSchoolAction } from './session-actions'

// Helper to get school from auth result
async function getAuth(slug: string) {
    const auth = await validateUserSchoolAction(slug);
    if (!auth.success || !auth.user) return { success: false as const, error: auth.error ?? 'Not authenticated' };
    // For SUPER_ADMIN, school may be null on the user obj — look it up by slug
    const school = auth.user.school ?? await (prisma as any).school.findUnique({ where: { slug }, select: { id: true, slug: true, name: true } });
    if (!school) return { success: false as const, error: 'School not found' };
    return { success: true as const, user: auth.user, school };
}

// ==========================================
// CANTEEN PACKAGES
// ==========================================

export async function getCanteenPackagesAction(slug: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error, data: [] };
        const data = await (prisma as any).canteenPackage.findMany({
            where: { schoolId: auth.school.id },
            orderBy: { name: 'asc' },
        });
        return { success: true, data };
    } catch (e: any) {
        console.error('[getCanteenPackagesAction]', e);
        return { success: false, error: e?.message ?? 'Failed to load packages', data: [] };
    }
}

export async function createCanteenPackageAction(slug: string, input: {
    name: string;
    description?: string;
    includedMeals: string;
    monthlyFee: number;
    yearlyFee: number;
    packageType: string;
}) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const pkg = await (prisma as any).canteenPackage.create({
            data: { ...input, schoolId: auth.school.id },
        });
        revalidatePath(`/s/${slug}/canteen`);
        return { success: true, data: pkg };
    } catch (e: any) {
        console.error('[createCanteenPackageAction]', e);
        return { success: false, error: e?.message ?? 'Failed to create package' };
    }
}

export async function updateCanteenPackageAction(slug: string, packageId: string, input: Partial<{
    name: string;
    description: string;
    includedMeals: string;
    monthlyFee: number;
    yearlyFee: number;
    packageType: string;
    isActive: boolean;
}>) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        await (prisma as any).canteenPackage.update({
            where: { id: packageId, schoolId: auth.school.id },
            data: input
        });
        revalidatePath(`/s/${slug}/canteen`);
        return { success: true };
    } catch (e: any) {
        console.error('[updateCanteenPackageAction]', e);
        return { success: false, error: e?.message ?? 'Failed to update package' };
    }
}

export async function deleteCanteenPackageAction(slug: string, packageId: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        await (prisma as any).canteenPackage.delete({
            where: { id: packageId, schoolId: auth.school.id }
        });
        revalidatePath(`/s/${slug}/canteen`);
        return { success: true };
    } catch (e: any) {
        console.error('[deleteCanteenPackageAction]', e);
        return { success: false, error: e?.message ?? 'Failed to delete package' };
    }
}

// ==========================================
// CANTEEN ITEMS
// ==========================================

export async function getCanteenItemsAction(slug: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error, data: [] };
        const data = await (prisma as any).canteenItem.findMany({
            where: { schoolId: auth.school.id },
            orderBy: { name: 'asc' },
        });
        return { success: true, data };
    } catch (e: any) {
        console.error('[getCanteenItemsAction]', e);
        return { success: false, error: e?.message, data: [] };
    }
}

export async function createCanteenItemAction(slug: string, input: {
    name: string;
    description?: string;
    category: string[];
    mealType: string;
    dietType?: string;
    price: number;
    isAddOn?: boolean;
    foodCategory?: string;
    gstPercentage?: number;
    hsnCode?: string | null;
}) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const item = await (prisma as any).canteenItem.create({
            data: { ...input, schoolId: auth.school.id },
        });
        revalidatePath(`/s/${slug}/canteen`);
        return { success: true, data: item };
    } catch (e: any) {
        console.error('[createCanteenItemAction]', e);
        return { success: false, error: e?.message ?? 'Failed to create item' };
    }
}

export async function bulkCreateCanteenItemsAction(slug: string, items: any[]) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };

        await prisma.$transaction(
            items.map(item =>
                (prisma as any).canteenItem.create({
                    data: { ...item, schoolId: auth.school.id },
                })
            )
        );

        revalidatePath(`/s/${slug}/canteen`);
        return { success: true, count: items.length };
    } catch (e: any) {
        console.error('[bulkCreateCanteenItemsAction]', e);
        return { success: false, error: e?.message ?? 'Failed to bulk import items' };
    }
}

export async function updateCanteenItemAction(slug: string, itemId: string, input: Partial<{
    name: string;
    description: string;
    category: string[];
    mealType: string;
    dietType: string;
    price: number;
    isAvailable: boolean;
    isAddOn: boolean;
    foodCategory: string;
    gstPercentage: number;
    hsnCode: string | null;
}>) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        await (prisma as any).canteenItem.update({
            where: { id: itemId, schoolId: auth.school.id },
            data: input
        });
        revalidatePath(`/s/${slug}/canteen`);
        return { success: true };
    } catch (e: any) {
        console.error('[updateCanteenItemAction]', e);
        return { success: false, error: e?.message ?? 'Failed to update item' };
    }
}

export async function deleteCanteenItemAction(slug: string, itemId: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        // Delete related order items first and verify item belongs to school
        await prisma.$transaction([
            (prisma as any).canteenOrderItem.deleteMany({
                where: { itemId, item: { schoolId: auth.school.id } }
            }),
            (prisma as any).canteenItem.delete({
                where: { id: itemId, schoolId: auth.school.id }
            }),
        ]);
        revalidatePath(`/s/${slug}/canteen/menu`);
        revalidatePath(`/s/${slug}/canteen`);
        return { success: true };
    } catch (e: any) {
        console.error('[deleteCanteenItemAction]', e);
        return { success: false, error: e?.message ?? 'Failed to delete item' };
    }
}

export async function updateCanteenGstSettingsAction(slug: string, gstType: string, commonGst: number) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        await (prisma as any).school.update({
            where: { id: auth.school.id },
            data: { canteenGstType: gstType, canteenCommonGst: commonGst }
        });
        revalidatePath(`/s/${slug}/canteen/menu`);
        return { success: true };
    } catch (e: any) {
        console.error('[updateCanteenGstSettingsAction]', e);
        return { success: false, error: e?.message ?? 'Failed to update GST settings' };
    }
}

// ==========================================
// CANTEEN MENU TIMETABLE
// ==========================================

export async function getCanteenMenuAction(slug: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error, data: [] };
        const data = await (prisma as any).canteenMenuPlan.findMany({
            where: { schoolId: auth.school.id },
            orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
        });
        return { success: true, data };
    } catch (e: any) {
        console.error('[getCanteenMenuAction]', e);
        return { success: false, error: e?.message, data: [] };
    }
}

export async function saveCanteenMenuTimetableAction(slug: string, plans: {
    dayOfWeek: number;
    mealType: string;
    items: string[];
    isSpecial?: boolean;
    specialDetails?: string;
}[]) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const schoolId = auth.school.id;
        for (const plan of plans) {
            await (prisma as any).canteenMenuPlan.upsert({
                where: { schoolId_dayOfWeek_mealType: { schoolId, dayOfWeek: plan.dayOfWeek, mealType: plan.mealType } },
                update: {
                    items: JSON.stringify(plan.items),
                    isSpecial: plan.isSpecial ?? false,
                    specialDetails: plan.specialDetails ?? null,
                },
                create: {
                    schoolId,
                    dayOfWeek: plan.dayOfWeek,
                    mealType: plan.mealType,
                    items: JSON.stringify(plan.items),
                    isSpecial: plan.isSpecial ?? false,
                    specialDetails: plan.specialDetails ?? null,
                },
            });
        }
        revalidatePath(`/s/${slug}/canteen`);
        return { success: true };
    } catch (e: any) {
        console.error('[saveCanteenMenuTimetableAction]', e);
        return { success: false, error: e?.message ?? 'Failed to save menu' };
    }
}

// ==========================================
// SUBSCRIPTIONS
// ==========================================

export async function getCanteenSubscriptionsAction(slug: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error, data: [] };
        const data = await (prisma as any).canteenSubscription.findMany({
            where: { schoolId: auth.school.id },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
                package: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data };
    } catch (e: any) {
        console.error('[getCanteenSubscriptionsAction]', e);
        return { success: false, error: e?.message, data: [] };
    }
}

export async function subscribeStudentToPackageAction(slug: string, input: {
    studentId: string;
    packageId: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    startDate?: Date;
}) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const schoolId = auth.school.id;

        const pkg = await (prisma as any).canteenPackage.findUnique({ where: { id: input.packageId } });
        if (!pkg) return { success: false, error: "Package not found." };

        const feeAmount = input.billingCycle === 'YEARLY' ? pkg.yearlyFee : pkg.monthlyFee;

        // Cancel any existing active subscription for this student
        await (prisma as any).canteenSubscription.updateMany({
            where: { studentId: input.studentId, schoolId, status: 'ACTIVE' },
            data: { status: 'CANCELLED', endDate: new Date() },
        });

        const subscription = await (prisma as any).canteenSubscription.create({
            data: {
                studentId: input.studentId,
                packageId: input.packageId,
                billingCycle: input.billingCycle,
                feeAmount,
                schoolId,
                startDate: input.startDate ?? new Date(),
                status: 'ACTIVE',
            },
        });

        // Auto-generate a Fee invoice for the subscription
        await (prisma as any).fee.create({
            data: {
                studentId: input.studentId,
                title: `Canteen Fee - ${pkg.name}`,
                category: 'CANTEEN',
                description: `Canteen Fee - ${pkg.name} (${input.billingCycle})`,
                amount: feeAmount,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'PENDING',
            },
        });

        revalidatePath(`/s/${slug}/canteen`);
        return { success: true, data: subscription };
    } catch (e: any) {
        console.error('[subscribeStudentToPackageAction]', e);
        return { success: false, error: e?.message ?? 'Failed to subscribe student' };
    }
}

export async function cancelCanteenSubscriptionAction(slug: string, subscriptionId: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        await (prisma as any).canteenSubscription.update({
            where: { id: subscriptionId, schoolId: auth.school.id },
            data: { status: 'CANCELLED', endDate: new Date() },
        });
        revalidatePath(`/s/${slug}/canteen`);
        return { success: true };
    } catch (e: any) {
        console.error('[cancelCanteenSubscriptionAction]', e);
        return { success: false, error: e?.message ?? 'Failed to cancel subscription' };
    }
}

// ==========================================
// STUDENT WALLET
// ==========================================

export async function getStudentWalletAction(slug: string, studentId: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error, data: null };
        let wallet = await (prisma as any).studentWallet.findUnique({
            where: { studentId, schoolId: auth.school.id },
            include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
        });
        if (!wallet) {
            wallet = await (prisma as any).studentWallet.create({
                data: { studentId, schoolId: auth.school.id, balance: 0 },
                include: { transactions: true },
            });
        }
        return { success: true, data: wallet };
    } catch (e: any) {
        console.error('[getStudentWalletAction]', e);
        return { success: false, error: e?.message, data: null };
    }
}

export async function topUpWalletAction(slug: string, studentId: string, amount: number, description?: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        if (amount <= 0) return { success: false, error: "Top-up amount must be positive." };

        const wallet = await (prisma as any).studentWallet.upsert({
            where: { studentId, schoolId: auth.school.id },
            create: { studentId, schoolId: auth.school.id, balance: amount },
            update: { balance: { increment: amount } },
        });

        await (prisma as any).walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: 'CREDIT',
                amount,
                reason: 'TOP_UP',
                description: description ?? 'Manual top-up',
            },
        });

        revalidatePath(`/s/${slug}/canteen`);
        return { success: true, newBalance: wallet.balance };
    } catch (e: any) {
        console.error('[topUpWalletAction]', e);
        return { success: false, error: e?.message ?? 'Failed to top up wallet' };
    }
}

// ==========================================
// CANTEEN POS (Point of Sale)
// ==========================================

export async function processCanteenOrderAction(slug: string, input: {
    studentId: string;
    cartItems: { itemId: string; quantity: number; price: number; taxAmount?: number; hsnCode?: string | null }[];
    paymentMethod: 'WALLET' | 'CASH' | 'UPI';
    subscriptionId?: string;
    notes?: string;
    subtotal?: number;
    taxAmount?: number;
}) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const totalAmount = input.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (input.paymentMethod === 'WALLET') {
            const wallet = await (prisma as any).studentWallet.findUnique({ where: { studentId: input.studentId } });
            if (!wallet || wallet.balance < totalAmount) {
                return {
                    success: false,
                    error: `Insufficient wallet balance. Balance: ₹${wallet?.balance?.toFixed(2) ?? '0.00'}, Required: ₹${totalAmount.toFixed(2)}`,
                };
            }
        }

        const result = await (prisma as any).$transaction(async (tx: any) => {
            const order = await tx.canteenOrder.create({
                data: {
                    studentId: input.studentId,
                    totalAmount,
                    subtotal: input.subtotal ?? totalAmount,
                    taxAmount: input.taxAmount ?? 0,
                    paymentMethod: input.paymentMethod,
                    subscriptionId: input.subscriptionId ?? null,
                    notes: input.notes ?? null,
                    status: 'COMPLETED',
                    orderItems: {
                        create: input.cartItems.map(i => ({
                            itemId: i.itemId,
                            quantity: i.quantity,
                            price: i.price,
                            taxAmount: i.taxAmount ?? 0,
                            hsnCode: i.hsnCode ?? null,
                        })),
                    },
                },
            });

            if (input.paymentMethod === 'WALLET') {
                const updatedWallet = await tx.studentWallet.update({
                    where: { studentId: input.studentId },
                    data: { balance: { decrement: totalAmount } },
                });
                await tx.walletTransaction.create({
                    data: {
                        walletId: updatedWallet.id,
                        type: 'DEBIT',
                        amount: totalAmount,
                        reason: 'CANTEEN_POS',
                        description: `POS Order #${order.id.slice(-6)}`,
                        canteenOrderId: order.id,
                    },
                });
            }

            return order;
        });

        revalidatePath(`/s/${slug}/canteen`);
        return { success: true, data: result };
    } catch (e: any) {
        console.error('[processCanteenOrderAction]', e);
        return { success: false, error: e?.message ?? 'Failed to process order' };
    }
}

export async function getRecentCanteenOrdersAction(slug: string, take = 50) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error, data: [] };
        const data = await (prisma as any).canteenOrder.findMany({
            where: { student: { schoolId: auth.school.id } },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
                orderItems: { include: { item: { select: { name: true, price: true } } } },
            },
            orderBy: { orderDate: 'desc' },
            take,
        });
        return { success: true, data };
    } catch (e: any) {
        console.error('[getRecentCanteenOrdersAction]', e);
        return { success: false, error: e?.message, data: [] };
    }
}

export async function getPOSStudentContextAction(slug: string, studentId: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error, data: null };

        const [subscription, wallet, todayOrders] = await Promise.all([
            (prisma as any).canteenSubscription.findFirst({
                where: { studentId, schoolId: auth.school.id, status: 'ACTIVE' },
                include: { package: true },
            }),
            (prisma as any).studentWallet.findUnique({ where: { studentId } }),
            (prisma as any).canteenOrder.findMany({
                where: {
                    studentId,
                    orderDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                },
                include: { orderItems: { include: { item: true } } },
            }),
        ]);

        return {
            success: true,
            data: {
                subscription,
                walletBalance: wallet?.balance ?? 0,
                todayOrders,
            },
        };
    } catch (e: any) {
        console.error('[getPOSStudentContextAction]', e);
        return { success: false, error: e?.message, data: null };
    }
}
export async function toggleCanteenItemAvailabilityAction(slug: string, itemId: string, isAvailable: boolean) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        await (prisma as any).canteenItem.update({
            where: { id: itemId, schoolId: auth.school.id },
            data: { isAvailable },
        });
        revalidatePath(`/s/${slug}/canteen`);
        return { success: true };
    } catch (e: any) {
        console.error('[toggleCanteenItemAvailabilityAction]', e);
        return { success: false, error: e?.message ?? 'Failed to toggle item availability' };
    }
}
// AI Predictive Analytics & Canteen Dashboard Actions
export async function getCanteenAnalyticsAction(slug: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const schoolId = auth.school.id;

        const now = new Date();
        const todayStart = startOfDay(now);
        const monthStart = startOfMonth(now);

        // Basic Stats
        const [
            todayOrders,
            monthOrders,
            totalItems,
            activeSubscriptions,
            lowBalanceWallets
        ] = await Promise.all([
            (prisma as any).canteenOrder.findMany({
                where: { student: { schoolId }, orderDate: { gte: todayStart } },
                include: { orderItems: { include: { item: true } } }
            }),
            (prisma as any).canteenOrder.findMany({
                where: { student: { schoolId }, orderDate: { gte: monthStart } }
            }),
            (prisma as any).canteenItem.count({ where: { schoolId } }),
            (prisma as any).canteenSubscription.count({ where: { schoolId, status: "ACTIVE" } }),
            (prisma as any).studentWallet.count({ where: { schoolId, balance: { lt: 100 } } })
        ]);

        const todayRevenue = todayOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
        const monthRevenue = monthOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);

        // AI Data Processing: Item Velocity (last 7 days)
        const sevenDaysAgo = subDays(todayStart, 7);
        const recentOrdersForAI = await (prisma as any).canteenOrder.findMany({
            where: { student: { schoolId }, orderDate: { gte: sevenDaysAgo } },
            include: { orderItems: { include: { item: true } } }
        });

        const itemFreq: Record<string, { name: string, count: number, revenue: number, category: string }> = {};
        recentOrdersForAI.forEach((o: any) => {
            o.orderItems.forEach((oi: any) => {
                const id = oi.item.id;
                if (!itemFreq[id]) itemFreq[id] = { name: oi.item.name, count: 0, revenue: 0, category: oi.item.category };
                itemFreq[id].count += oi.quantity;
                itemFreq[id].revenue += oi.price * oi.quantity;
            });
        });

        const sortedItems = Object.values(itemFreq).sort((a, b) => b.count - a.count);
        const fastMoving = sortedItems.slice(0, 5);
        const slowMoving = sortedItems.slice(-5).filter(i => i.count < 5).reverse(); // Items with very low sales

        // Category Demand
        const categoryFreq: Record<string, number> = {};
        sortedItems.forEach(i => {
            categoryFreq[i.category] = (categoryFreq[i.category] || 0) + i.count;
        });
        const topCategory = Object.entries(categoryFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Fake AI Forecast (Simulated based on rolling average)
        const dailyAvgs = monthRevenue / (now.getDate() || 1);
        const forecastNext7Days = dailyAvgs * 7 * 1.05; // Predicting 5% growth

        return {
            success: true,
            data: {
                kpi: {
                    todayRevenue, todayOrders: todayOrders.length,
                    monthRevenue, monthOrders: monthOrders.length,
                    totalItems, activeSubscriptions, lowBalanceWallets
                },
                aiInsights: {
                    fastMoving,
                    slowMoving,
                    topCategory,
                    forecastNext7Days,
                    isHolidayApproaching: now.getDay() >= 4 // Quick heuristic: Thursday/Friday show weekend warning
                }
            }
        };
    } catch (e: any) {
        console.error('[getCanteenAnalyticsAction]', e);
        return { success: false, error: e?.message ?? 'Failed to load analytics' };
    }
}

export async function getCanteenAccountsLedgerAction(slug: string) {
    try {
        const auth = await getAuth(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const schoolId = auth.school.id;

        const now = new Date();
        const monthStart = startOfMonth(now);

        // All Wallet Transactions this month (Recharges)
        const walletRecharges = await (prisma as any).walletTransaction.findMany({
            where: {
                wallet: { schoolId },
                createdAt: { gte: monthStart },
                type: "CREDIT"
            },
            include: { wallet: { include: { student: true } } },
            orderBy: { createdAt: 'desc' }
        });

        // Direct Canteen POS Sales (Cash / UPI) this month
        const directSales = await (prisma as any).canteenOrder.findMany({
            where: {
                student: { schoolId },
                orderDate: { gte: monthStart },
                paymentMethod: { in: ["CASH", "UPI"] }
            },
            include: { student: true },
            orderBy: { orderDate: 'desc' }
        });

        // Calculate Totals
        let totalCashWallet = 0;
        let totalUpiWallet = 0;
        let totalCashPOS = 0;
        let totalUpiPOS = 0;

        const combinedLedger = [
            ...walletRecharges.map((tx: any) => {
                // Inferring payment mode from description or defaulting to UPI for 'Admin top-up via POS' if it says UPI, else Cash
                const mode = tx.description?.toLowerCase().includes('upi') ? 'UPI' : 'CASH';
                if (mode === 'CASH') totalCashWallet += tx.amount;
                if (mode === 'UPI') totalUpiWallet += tx.amount;
                return {
                    id: tx.id,
                    date: tx.createdAt,
                    type: 'WALLET_RECHARGE',
                    mode,
                    amount: tx.amount,
                    student: tx.wallet.student,
                    desc: tx.description
                };
            }),
            ...directSales.map((order: any) => {
                if (order.paymentMethod === 'CASH') totalCashPOS += order.totalAmount;
                if (order.paymentMethod === 'UPI') totalUpiPOS += order.totalAmount;
                return {
                    id: order.id,
                    date: order.orderDate,
                    type: 'POS_DIRECT_SALE',
                    mode: order.paymentMethod,
                    amount: order.totalAmount,
                    student: order.student,
                    desc: `POS Order ${order.id.slice(-6).toUpperCase()}`
                };
            })
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            success: true,
            data: {
                ledger: combinedLedger,
                totals: {
                    cash: totalCashWallet + totalCashPOS,
                    upi: totalUpiWallet + totalUpiPOS,
                    wallet: { cash: totalCashWallet, upi: totalUpiWallet },
                    pos: { cash: totalCashPOS, upi: totalUpiPOS }
                }
            }
        };
    } catch (e: any) {
        console.error('[getCanteenAccountsLedgerAction]', e);
        return { success: false, error: e?.message ?? 'Failed to load ledger' };
    }
}

// ==========================================
// FOOD CATEGORIES (Global Master Data)
// ==========================================

export async function getFoodCategoriesAction() {
    try {
        const cats = await (prisma as any).foodCategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true },
        });
        return { success: true, data: cats as { id: string; name: string }[] };
    } catch (e: any) {
        return { success: false, data: [], error: e?.message };
    }
}
