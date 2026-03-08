"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Helper ──────────────────────────────────────────────────────────────────
async function validateParentStudent(phone: string, studentId: string) {
    return prisma.student.findFirst({
        where: {
            id: studentId,
            OR: [
                { parentMobile: phone },
                { fatherPhone: phone },
                { motherPhone: phone },
            ],
        },
        select: { id: true, schoolId: true },
    });
}

async function getSchoolIdForParent(phone: string): Promise<string | null> {
    const student = await prisma.student.findFirst({
        where: {
            status: "ACTIVE",
            OR: [
                { parentMobile: phone },
                { fatherPhone: phone },
                { motherPhone: phone },
            ],
        },
        select: { schoolId: true },
    });
    return student?.schoolId ?? null;
}

// ─── PTM ─────────────────────────────────────────────────────────────────────
export async function getActivePTMSessionsAction(phone: string) {
    try {
        const schoolId = await getSchoolIdForParent(phone);
        if (!schoolId) return { success: false, error: "No school found" };

        const sessions = await prisma.pTMSession.findMany({
            where: {
                schoolId,
                isActive: true,
                date: { gte: new Date() },
            },
            include: {
                bookings: {
                    where: { parentMobile: phone },
                    select: { slotTime: true, status: true, id: true },
                },
            },
            orderBy: { date: "asc" },
            take: 10,
        });

        return { success: true, data: JSON.parse(JSON.stringify(sessions)) };
    } catch (error: any) {
        console.error("getActivePTMSessionsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function bookPTMSlotAction(
    phone: string,
    studentId: string,
    sessionId: string,
    slotTime: string,
    teacherName?: string
) {
    try {
        const student = await validateParentStudent(phone, studentId);
        if (!student) return { success: false, error: "Unauthorized" };

        // Check if slot is already taken
        const existing = await prisma.pTMBooking.findFirst({
            where: { sessionId, slotTime, teacherName: teacherName || null },
        });
        if (existing) return { success: false, error: "This slot is already booked" };

        // Check if parent already has booking for this session
        const alreadyBooked = await prisma.pTMBooking.findFirst({
            where: { sessionId, studentId, parentMobile: phone, status: "CONFIRMED" },
        });
        if (alreadyBooked) return { success: false, error: "You already have a booking for this session" };

        const booking = await prisma.pTMBooking.create({
            data: {
                sessionId,
                studentId,
                parentMobile: phone,
                slotTime,
                teacherName: teacherName || null,
                status: "CONFIRMED",
            },
        });

        return { success: true, data: JSON.parse(JSON.stringify(booking)) };
    } catch (error: any) {
        if (error.code === "P2002") return { success: false, error: "This slot is already taken" };
        console.error("bookPTMSlotAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function getMyPTMBookingsAction(phone: string) {
    try {
        const bookings = await prisma.pTMBooking.findMany({
            where: { parentMobile: phone },
            include: {
                session: { select: { title: true, date: true, schoolId: true } },
                student: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return { success: true, data: JSON.parse(JSON.stringify(bookings)) };
    } catch (error: any) {
        console.error("getMyPTMBookingsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function cancelPTMBookingAction(phone: string, bookingId: string) {
    try {
        const booking = await prisma.pTMBooking.findFirst({
            where: { id: bookingId, parentMobile: phone },
        });
        if (!booking) return { success: false, error: "Booking not found" };

        await prisma.pTMBooking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
        });
        return { success: true };
    } catch (error: any) {
        console.error("cancelPTMBookingAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── School Store ─────────────────────────────────────────────────────────────
export async function getStoreItemsAction(phone: string) {
    try {
        const schoolId = await getSchoolIdForParent(phone);
        if (!schoolId) return { success: false, error: "No school found" };

        const items = await prisma.parentStoreItem.findMany({
            where: { schoolId, isAvailable: true },
            orderBy: [{ category: "asc" }, { name: "asc" }],
        });

        // Group by category
        const grouped = items.reduce<Record<string, any[]>>((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

        return { success: true, data: { items, grouped } };
    } catch (error: any) {
        console.error("getStoreItemsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function placeStoreOrderAction(
    phone: string,
    studentId: string,
    cartItems: Array<{ itemId: string; quantity: number }>
) {
    try {
        const student = await validateParentStudent(phone, studentId);
        if (!student) return { success: false, error: "Unauthorized" };

        // Validate items and calculate total
        const itemIds = cartItems.map((c) => c.itemId);
        const storeItems = await prisma.parentStoreItem.findMany({
            where: { id: { in: itemIds }, schoolId: student.schoolId, isAvailable: true },
        });

        if (storeItems.length !== itemIds.length) {
            return { success: false, error: "One or more items are unavailable" };
        }

        let total = 0;
        const orderItems = cartItems.map((c) => {
            const item = storeItems.find((i) => i.id === c.itemId)!;
            if (c.quantity > item.stock) throw new Error(`Insufficient stock for ${item.name}`);
            total += item.price * c.quantity;
            return { itemId: c.itemId, quantity: c.quantity, unitPrice: item.price };
        });

        const order = await prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.parentStoreOrder.create({
                data: {
                    schoolId: student.schoolId,
                    studentId,
                    parentMobile: phone,
                    totalAmount: total,
                    status: "PLACED",
                    items: { create: orderItems },
                },
                include: { items: { include: { item: true } } },
            });

            // Deduct stock
            for (const c of cartItems) {
                await tx.parentStoreItem.update({
                    where: { id: c.itemId },
                    data: { stock: { decrement: c.quantity } },
                });
            }

            // Create payment request
            await tx.onlinePaymentRequest.create({
                data: {
                    schoolId: student.schoolId,
                    studentId,
                    parentMobile: phone,
                    type: "STORE_ORDER",
                    amount: total,
                    description: `Store order #${newOrder.id.slice(-6).toUpperCase()}`,
                    status: "PENDING",
                    storeOrderId: newOrder.id,
                },
            });

            return newOrder;
        });

        return { success: true, data: JSON.parse(JSON.stringify(order)) };
    } catch (error: any) {
        console.error("placeStoreOrderAction Error:", error.message);
        return { success: false, error: error.message || "Internal server error" };
    }
}

export async function getMyStoreOrdersAction(phone: string) {
    try {
        const orders = await prisma.parentStoreOrder.findMany({
            where: { parentMobile: phone },
            include: {
                items: { include: { item: { select: { name: true, imageUrl: true } } } },
                payment: { select: { status: true, amount: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return { success: true, data: JSON.parse(JSON.stringify(orders)) };
    } catch (error: any) {
        console.error("getMyStoreOrdersAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export async function getPaymentSummaryAction(phone: string, studentId?: string) {
    try {
        // Outstanding fees
        const feeWhere: any = studentId
            ? { studentId, student: { OR: [{ parentMobile: phone }, { fatherPhone: phone }, { motherPhone: phone }] } }
            : {
                student: {
                    OR: [{ parentMobile: phone }, { fatherPhone: phone }, { motherPhone: phone }],
                },
            };

        const [pendingFees, paidFees, onlinePayments] = await Promise.all([
            prisma.fee.findMany({
                where: { ...feeWhere, status: "PENDING" },
                include: {
                    student: { select: { firstName: true, lastName: true, admissionNumber: true } },
                    payments: { orderBy: { date: "desc" }, take: 1 },
                },
                orderBy: { dueDate: "asc" },
                take: 20,
            }),
            prisma.fee.findMany({
                where: { ...feeWhere, status: "PAID" },
                include: { payments: { orderBy: { date: "desc" }, take: 1 } },
                orderBy: { updatedAt: "desc" },
                take: 10,
            }),
            prisma.onlinePaymentRequest.findMany({
                where: { parentMobile: phone },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
        ]);

        const totalDue = pendingFees.reduce((sum, f) => sum + f.amount, 0);
        const totalPaid = paidFees.reduce((sum, f) => sum + f.amount, 0);

        return {
            success: true,
            data: {
                pendingFees,
                paidFees,
                onlinePayments,
                totalDue,
                totalPaid,
            },
        };
    } catch (error: any) {
        console.error("getPaymentSummaryAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function initiateOnlineFeePaymentAction(
    phone: string,
    feeId: string
) {
    try {
        const fee = await prisma.fee.findFirst({
            where: {
                id: feeId,
                status: "PENDING",
                student: {
                    OR: [{ parentMobile: phone }, { fatherPhone: phone }, { motherPhone: phone }],
                },
            },
            include: { student: { select: { id: true, schoolId: true, firstName: true } } },
        });
        if (!fee) return { success: false, error: "Fee not found or already paid" };

        // Check for existing pending payment
        const existing = await prisma.onlinePaymentRequest.findFirst({
            where: { feeId, status: "PENDING" },
        });
        if (existing) return { success: true, data: existing, message: "Existing payment request found" };

        const paymentRequest = await prisma.onlinePaymentRequest.create({
            data: {
                schoolId: fee.student.schoolId,
                studentId: fee.student.id,
                parentMobile: phone,
                type: "FEE",
                amount: fee.amount,
                description: fee.title,
                status: "PENDING",
                feeId: feeId,
            },
        });

        return {
            success: true,
            data: paymentRequest,
            // TODO: Initialize Razorpay/Stripe order here and return gatewayOrderId
            message: "Payment request created. Gateway integration pending.",
        };
    } catch (error: any) {
        console.error("initiateOnlineFeePaymentAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── Admin: Create PTM Session ────────────────────────────────────────────────
export async function createPTMSessionAction(
    schoolSlug: string,
    data: {
        title: string;
        description?: string;
        date: string;
        startTime: string;
        endTime: string;
        slotMinutes?: number;
        classIds?: string[];
    }
) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });
        if (!school) return { success: false, error: "School not found" };

        const session = await prisma.pTMSession.create({
            data: {
                schoolId: school.id,
                title: data.title,
                description: data.description,
                date: new Date(data.date),
                startTime: data.startTime,
                endTime: data.endTime,
                slotMinutes: data.slotMinutes || 10,
                classIds: JSON.stringify(data.classIds || ["all"]),
                isActive: true,
            },
        });
        revalidatePath("/s/[slug]/ptm", "page");
        return { success: true, data: JSON.parse(JSON.stringify(session)) };
    } catch (error: any) {
        console.error("createPTMSessionAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── Admin: Create Store Item ─────────────────────────────────────────────────
export async function createStoreItemAction(
    schoolId: string,
    data: {
        name: string;
        description?: string;
        price: number;
        category: string;
        stock: number;
        imageUrl?: string;
    }
) {
    try {
        const item = await prisma.parentStoreItem.create({
            data: {
                schoolId,
                name: data.name,
                description: data.description,
                price: data.price,
                category: data.category,
                stock: data.stock,
                imageUrl: data.imageUrl,
                isAvailable: data.stock > 0,
            },
        });
        return { success: true, data: JSON.parse(JSON.stringify(item)) };
    } catch (error: any) {
        console.error("createStoreItemAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── Admin: PTM Management ───────────────────────────────────────────────────
export async function getPTMSessionsAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });
        if (!school) return { success: false, error: "School not found" };

        const sessions = await prisma.pTMSession.findMany({
            where: { schoolId: school.id },
            include: {
                bookings: {
                    include: {
                        student: { select: { firstName: true, lastName: true, admissionNumber: true } },
                    },
                },
                _count: { select: { bookings: true } },
            },
            orderBy: { date: "desc" },
            take: 50,
        });

        return { success: true, data: JSON.parse(JSON.stringify(sessions)) };
    } catch (error: any) {
        console.error("getPTMSessionsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function deletePTMSessionAction(sessionId: string) {
    try {
        await prisma.pTMSession.delete({
            where: { id: sessionId },
        });
        revalidatePath("/s/[slug]/ptm", "page");
        return { success: true };
    } catch (error: any) {
        console.error("deletePTMSessionAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function togglePTMSessionAction(sessionId: string, isActive: boolean) {
    try {
        await prisma.pTMSession.update({
            where: { id: sessionId },
            data: { isActive: !isActive },
        });
        revalidatePath("/s/[slug]/ptm", "page");
        return { success: true };
    } catch (error: any) {
        console.error("togglePTMSessionAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}
