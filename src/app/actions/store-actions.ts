"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getSchoolIdFromSlug(slug: string): Promise<string> {
    const school = await (prisma as any).school.findUnique({ where: { slug } });
    if (!school) throw new Error("School not found");
    return school.id;
}

/** Generate a short, unique transaction number */
function genTransactionNo(prefix = "STR") {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG — Individual Items
// ─────────────────────────────────────────────────────────────────────────────

export async function getStoreCatalogAction(slug: string, type?: string) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        const items = await (prisma as any).storeItem.findMany({
            where: { schoolId, isActive: true, ...(type && { type }) },
            include: { inventories: true },
            orderBy: [{ type: "asc" }, { name: "asc" }],
        });
        return { success: true, data: items };
    } catch (error) {
        console.error("Error fetching store catalog:", error);
        return { success: false, error: "Failed to fetch store catalog" };
    }
}

export async function bulkCreateStoreItemsAction(slug: string, rows: {
    name: string;
    type?: string;
    category?: string;
    gradeLevel?: string;
    price: number;
    taxPercentage?: number;
    initialStock?: number;
    hsnCode?: string;
    description?: string;
}[]) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        let created = 0;
        let skipped = 0;
        for (const row of rows) {
            if (!row.name || !row.price) { skipped++; continue; }
            try {
                const item = await (prisma as any).storeItem.create({
                    data: {
                        schoolId,
                        name: row.name,
                        type: row.type || "OTHER",
                        category: row.category || null,
                        gradeLevel: row.gradeLevel || null,
                        price: Number(row.price),
                        taxPercentage: Number(row.taxPercentage ?? 0),
                        hsnCode: row.hsnCode || null,
                        description: row.description || null,
                    },
                });
                if (row.initialStock && Number(row.initialStock) > 0) {
                    await (prisma as any).storeInventory.create({
                        data: { itemId: item.id, schoolId, quantity: Number(row.initialStock) },
                    });
                }
                created++;
            } catch { skipped++; }
        }
        revalidatePath(`/s/[slug]/store/catalog`, "page");
        return { success: true, data: { created, skipped } };
    } catch (error) {
        console.error("Bulk import error:", error);
        return { success: false, error: "Bulk import failed" };
    }
}

export async function bulkReplaceStoreItemsAction(slug: string, rows: {
    name: string; type?: string; category?: string; gradeLevel?: string;
    price: number; taxPercentage?: number; initialStock?: number;
    lowStockAlert?: number; hsnCode?: string; description?: string; isActive?: boolean;
}[]) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        // Archive all existing items
        await (prisma as any).storeItem.updateMany({ where: { schoolId }, data: { isActive: false } });
        let created = 0; let skipped = 0;
        for (const row of rows) {
            if (!row.name || !row.price) { skipped++; continue; }
            try {
                const item = await (prisma as any).storeItem.create({
                    data: {
                        schoolId, name: row.name, type: row.type || "OTHER",
                        category: row.category || null, gradeLevel: row.gradeLevel || null,
                        price: Number(row.price), taxPercentage: Number(row.taxPercentage ?? 0),
                        hsnCode: row.hsnCode || null, description: row.description || null,
                        isActive: row.isActive !== false,
                    },
                });
                if (row.initialStock && Number(row.initialStock) > 0) {
                    await (prisma as any).storeInventory.create({
                        data: { itemId: item.id, schoolId, quantity: Number(row.initialStock), lowStockAlert: Number(row.lowStockAlert ?? 10) },
                    });
                }
                created++;
            } catch { skipped++; }
        }
        revalidatePath(`/s/[slug]/store/catalog`, "page");
        return { success: true, data: { created, skipped } };
    } catch (error) {
        console.error("Bulk replace error:", error);
        return { success: false, error: "Bulk replace failed" };
    }
}

export async function bulkUpdateByNameAction(slug: string, rows: {
    name: string; type?: string; category?: string; gradeLevel?: string;
    price: number; taxPercentage?: number; initialStock?: number;
    lowStockAlert?: number; hsnCode?: string; description?: string;
}[]) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        let updated = 0; let created = 0; let skipped = 0;
        for (const row of rows) {
            if (!row.name || !row.price) { skipped++; continue; }
            try {
                const existing = await (prisma as any).storeItem.findFirst({ where: { schoolId, name: row.name } });
                if (existing) {
                    await (prisma as any).storeItem.update({
                        where: { id: existing.id },
                        data: {
                            type: row.type || existing.type, category: row.category ?? existing.category,
                            gradeLevel: row.gradeLevel ?? existing.gradeLevel, price: Number(row.price),
                            taxPercentage: Number(row.taxPercentage ?? existing.taxPercentage),
                            hsnCode: row.hsnCode ?? existing.hsnCode, description: row.description ?? existing.description,
                            isActive: true,
                        },
                    });
                    if (row.initialStock != null && Number(row.initialStock) >= 0) {
                        const inv = await (prisma as any).storeInventory.findFirst({ where: { itemId: existing.id } });
                        if (inv) {
                            await (prisma as any).storeInventory.update({ where: { id: inv.id }, data: { quantity: Number(row.initialStock), lowStockAlert: Number(row.lowStockAlert ?? inv.lowStockAlert) } });
                        } else {
                            await (prisma as any).storeInventory.create({ data: { itemId: existing.id, schoolId, quantity: Number(row.initialStock), lowStockAlert: Number(row.lowStockAlert ?? 10) } });
                        }
                    }
                    updated++;
                } else {
                    const item = await (prisma as any).storeItem.create({
                        data: { schoolId, name: row.name, type: row.type || "OTHER", category: row.category || null, gradeLevel: row.gradeLevel || null, price: Number(row.price), taxPercentage: Number(row.taxPercentage ?? 0), hsnCode: row.hsnCode || null, description: row.description || null },
                    });
                    if (row.initialStock && Number(row.initialStock) > 0) {
                        await (prisma as any).storeInventory.create({ data: { itemId: item.id, schoolId, quantity: Number(row.initialStock), lowStockAlert: Number(row.lowStockAlert ?? 10) } });
                    }
                    created++;
                }
            } catch { skipped++; }
        }
        revalidatePath(`/s/[slug]/store/catalog`, "page");
        return { success: true, data: { updated, created, skipped } };
    } catch (error) {
        console.error("Bulk update error:", error);
        return { success: false, error: "Bulk update failed" };
    }
}

export async function createStoreItemAction(data: {
    schoolId: string; // slug
    name: string;
    description?: string;
    type: string;
    category?: string;
    gradeLevel?: string;
    price: number;
    taxPercentage?: number;
    initialStock?: number;
    hsnCode?: string;
    imageUrl?: string;
}) {
    try {
        const schoolId = await getSchoolIdFromSlug(data.schoolId);
        const item = await prisma.$transaction(async (tx) => {
            const newItem = await (tx as any).storeItem.create({
                data: {
                    schoolId,
                    name: data.name,
                    description: data.description,
                    type: data.type,
                    category: data.category,
                    gradeLevel: data.gradeLevel || null,
                    price: data.price,
                    taxPercentage: data.taxPercentage ?? 0,
                    hsnCode: data.hsnCode,
                    imageUrl: data.imageUrl,
                },
            });

            if (data.initialStock && data.initialStock > 0) {
                await (tx as any).storeInventory.create({
                    data: { itemId: newItem.id, schoolId, quantity: data.initialStock },
                });
            }
            return newItem;
        });

        revalidatePath(`/s/[slug]/store/catalog`, "page");
        return { success: true, data: item };
    } catch (error) {
        console.error("Error creating store item:", error);
        return { success: false, error: "Failed to create store item" };
    }
}

export async function updateStoreItemAction(
    itemId: string,
    data: {
        name?: string;
        description?: string;
        type?: string;
        category?: string;
        gradeLevel?: string | null;
        price?: number;
        taxPercentage?: number;
        hsnCode?: string;
        imageUrl?: string;
        isActive?: boolean;
    }
) {
    try {
        await (prisma as any).storeItem.update({ where: { id: itemId }, data });
        revalidatePath(`/s/[slug]/store/catalog`, "page");
        return { success: true };
    } catch (error) {
        console.error("Error updating store item:", error);
        return { success: false, error: "Failed to update item" };
    }
}

export async function deleteStoreItemAction(itemId: string) {
    try {
        await (prisma as any).storeItem.update({
            where: { id: itemId },
            data: { isActive: false },
        });
        revalidatePath(`/s/[slug]/store/catalog`, "page");
        return { success: true };
    } catch (error) {
        console.error("Error archiving store item:", error);
        return { success: false, error: "Failed to archive item" };
    }
}

export async function hardDeleteStoreItemAction(itemId: string) {
    try {
        // Delete inventory records first, then the item
        await prisma.$transaction([
            (prisma as any).storeInventory.deleteMany({ where: { itemId } }),
            (prisma as any).storeItem.delete({ where: { id: itemId } }),
        ]);
        revalidatePath(`/s/[slug]/store/catalog`, "page");
        return { success: true };
    } catch (error) {
        console.error("Error deleting store item:", error);
        return { success: false, error: "Cannot delete — item may be linked to existing orders." };
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────────────────────

export async function getStoreInventoryAction(slug: string) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        const inventories = await (prisma as any).storeInventory.findMany({
            where: { schoolId },
            include: { item: true },
            orderBy: { updatedAt: "desc" },
        });
        return { success: true, data: inventories };
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return { success: false, error: "Failed to fetch inventory" };
    }
}

export async function adjustInventoryAction(
    itemId: string,
    slug: string,
    adjustment: number,
    notes?: string
) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        const existing = await (prisma as any).storeInventory.findFirst({
            where: { itemId, schoolId },
        });

        if (existing) {
            const newQty = Math.max(0, existing.quantity + adjustment);
            await (prisma as any).storeInventory.update({
                where: { id: existing.id },
                data: { quantity: newQty },
            });
        } else {
            await (prisma as any).storeInventory.create({
                data: { itemId, schoolId, quantity: Math.max(0, adjustment) },
            });
        }
        revalidatePath(`/s/[slug]/store/inventory`, "page");
        return { success: true };
    } catch (error) {
        console.error("Error adjusting inventory:", error);
        return { success: false, error: "Failed to adjust inventory" };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PACKAGES — Academic Grade Bundles
// ─────────────────────────────────────────────────────────────────────────────

export async function getStorePackagesAction(slug: string, academicYearId?: string) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        const packages = await (prisma as any).storePackage.findMany({
            where: { schoolId, isActive: true, ...(academicYearId && { academicYearId }) },
            include: {
                items: { include: { item: { include: { inventories: true } } } },
                academicYear: true,
                _count: { select: { orders: true } },
            },
            orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
        });
        return { success: true, data: packages };
    } catch (error) {
        console.error("Error fetching packages:", error);
        return { success: false, error: "Failed to fetch packages" };
    }
}

export async function createStorePackageAction(data: {
    slug: string;
    name: string;
    description?: string;
    gradeLevel?: string;
    classIds: string[];
    isMandatory?: boolean;
    academicYearId: string;
    discountedPrice?: number;
    imageUrl?: string;
    items: { itemId: string; quantity: number }[];
}) {
    try {
        const schoolId = await getSchoolIdFromSlug(data.slug);

        // Calculate auto total from items
        let totalPrice = 0;
        for (const i of data.items) {
            const item = await (prisma as any).storeItem.findUnique({ where: { id: i.itemId } });
            if (item) totalPrice += item.price * i.quantity;
        }

        const pkg = await (prisma as any).storePackage.create({
            data: {
                schoolId,
                academicYearId: data.academicYearId,
                name: data.name,
                description: data.description,
                gradeLevel: data.gradeLevel,
                classIds: JSON.stringify(data.classIds),
                isMandatory: data.isMandatory ?? false,
                totalPrice,
                discountedPrice: data.discountedPrice ?? null,
                imageUrl: data.imageUrl,
                items: {
                    create: data.items.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
                },
            },
            include: { items: { include: { item: true } } },
        });

        revalidatePath(`/s/[slug]/store/packages`, "page");
        return { success: true, data: pkg };
    } catch (error) {
        console.error("Error creating package:", error);
        return { success: false, error: "Failed to create package" };
    }
}

export async function updateStorePackageAction(
    packageId: string,
    data: {
        name?: string;
        description?: string;
        gradeLevel?: string;
        classIds?: string[];
        isMandatory?: boolean;
        discountedPrice?: number | null;
        isActive?: boolean;
    }
) {
    try {
        const updateData: any = { ...data };
        if (data.classIds) updateData.classIds = JSON.stringify(data.classIds);
        await (prisma as any).storePackage.update({ where: { id: packageId }, data: updateData });
        revalidatePath(`/s/[slug]/store/packages`, "page");
        return { success: true };
    } catch (error) {
        console.error("Error updating package:", error);
        return { success: false, error: "Failed to update package" };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PACKAGE ASSIGNMENT — Bulk assign to students by grade
// ─────────────────────────────────────────────────────────────────────────────

export async function assignPackageToGradeAction(data: {
    slug: string;
    packageId: string;
    academicYearId: string;
    grade: string; // The grade string to filter students
    classroomIds?: string[]; // Optional specific classrooms
}) {
    try {
        const schoolId = await getSchoolIdFromSlug(data.slug);

        const pkg = await (prisma as any).storePackage.findUnique({
            where: { id: data.packageId },
            include: { items: { include: { item: true } } },
        });
        if (!pkg) return { success: false, error: "Package not found" };

        // Find all active students in the specified grade
        const students = await (prisma as any).student.findMany({
            where: {
                schoolId,
                status: "ACTIVE",
                grade: data.grade,
                ...(data.classroomIds?.length ? { classroomId: { in: data.classroomIds } } : {}),
            },
            select: { id: true, firstName: true, lastName: true },
        });

        if (students.length === 0) {
            return { success: false, error: "No active students found in this grade" };
        }

        const effectivePrice = pkg.discountedPrice ?? pkg.totalPrice;

        // Create orders for each student who doesn't already have one
        let created = 0;
        let skipped = 0;

        for (const student of students) {
            // Check if already assigned
            const existing = await (prisma as any).storeOrder.findFirst({
                where: {
                    studentId: student.id,
                    packageId: data.packageId,
                    academicYearId: data.academicYearId,
                    paymentStatus: { in: ["UNPAID", "PAID"] },
                },
            });

            if (existing) {
                skipped++;
                continue;
            }

            await prisma.$transaction(async (tx) => {
                // Create fee entry
                const fee = await (tx as any).fee.create({
                    data: {
                        title: `${pkg.name} — Academic Package`,
                        amount: effectivePrice,
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                        status: "PENDING",
                        studentId: student.id,
                        schoolId,
                        academicYearId: data.academicYearId,
                        category: "STORE",
                        description: `Mandatory Academic Package for ${data.grade}`,
                    },
                });

                // Create the store order
                await (tx as any).storeOrder.create({
                    data: {
                        studentId: student.id,
                        schoolId,
                        packageId: data.packageId,
                        academicYearId: data.academicYearId,
                        sourceType: "PACKAGE",
                        status: "PENDING",
                        paymentStatus: "UNPAID",
                        totalAmount: effectivePrice,
                        taxAmount: 0,
                        feeId: fee.id,
                        notes: `Auto-assigned package for ${data.grade} — ${new Date().getFullYear()}`,
                        orderItems: {
                            create: pkg.items.map((pi: any) => ({
                                itemId: pi.itemId,
                                quantity: pi.quantity,
                                unitPrice: pi.item.price,
                                taxAmount: pi.item.price * pi.quantity * ((pi.item.taxPercentage || 0) / 100),
                            })),
                        },
                    },
                });
            });

            created++;
        }

        revalidatePath(`/s/[slug]/store/orders`, "page");
        return {
            success: true,
            data: { created, skipped, total: students.length },
        };
    } catch (error) {
        console.error("Error assigning package:", error);
        return { success: false, error: "Failed to assign package" };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getStoreOrdersAction(
    slug: string,
    filters?: {
        status?: string;
        paymentStatus?: string;
        sourceType?: string;
        academicYearId?: string;
    }
) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        const where: any = { schoolId };
        if (filters?.status) where.status = filters.status;
        if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;
        if (filters?.sourceType) where.sourceType = filters.sourceType;
        if (filters?.academicYearId) where.academicYearId = filters.academicYearId;

        const orders = await (prisma as any).storeOrder.findMany({
            where,
            include: {
                student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true, grade: true } },
                package: { select: { name: true, gradeLevel: true } },
                orderItems: { include: { item: true } },
                fee: { select: { id: true, status: true, amount: true } },
                accountTransaction: { select: { id: true, transactionNo: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: orders };
    } catch (error) {
        console.error("Error fetching orders:", error);
        return { success: false, error: "Failed to fetch orders" };
    }
}

export async function createAdhocOrderAction(data: {
    studentId: string;
    slug: string;
    items: { itemId: string; quantity: number }[];
    notes?: string;
    generateFee?: boolean;
    academicYearId?: string;
    paymentMethod?: string;
}) {
    try {
        const schoolId = await getSchoolIdFromSlug(data.slug);

        const order = await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            let taxAmount = 0;
            const orderItemsData: any[] = [];

            for (const reqItem of data.items) {
                const item = await (tx as any).storeItem.findUnique({ where: { id: reqItem.itemId } });
                if (!item) throw new Error(`Item ${reqItem.itemId} not found`);

                const itemTotal = item.price * reqItem.quantity;
                const itemTax = itemTotal * ((item.taxPercentage || 0) / 100);
                totalAmount += itemTotal;
                taxAmount += itemTax;

                orderItemsData.push({
                    itemId: item.id,
                    quantity: reqItem.quantity,
                    unitPrice: item.price,
                    taxAmount: itemTax,
                });
            }

            let feeId: string | undefined;
            if (data.generateFee && data.academicYearId) {
                const fee = await (tx as any).fee.create({
                    data: {
                        title: `Store Purchase`,
                        amount: totalAmount + taxAmount,
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        status: "PENDING",
                        studentId: data.studentId,
                        schoolId,
                        academicYearId: data.academicYearId,
                        category: "STORE",
                        description: `Ad-hoc store purchase. ${data.notes || ""}`,
                    },
                });
                feeId = fee.id;
            }

            const newOrder = await (tx as any).storeOrder.create({
                data: {
                    studentId: data.studentId,
                    schoolId,
                    sourceType: "ADHOC",
                    academicYearId: data.academicYearId,
                    totalAmount: totalAmount + taxAmount,
                    taxAmount,
                    notes: data.notes,
                    status: "PENDING",
                    paymentStatus: data.generateFee ? "UNPAID" : "PAID",
                    feeId,
                    orderItems: { create: orderItemsData },
                },
                include: { student: true, orderItems: { include: { item: true } } },
            });

            // If paid immediately, deduct inventory and record accounting
            if (!data.generateFee) {
                await deductInventoryAndRecord(tx, newOrder, schoolId, data.paymentMethod || "CASH");
            }

            return newOrder;
        });

        revalidatePath(`/s/[slug]/store/orders`, "page");
        return { success: true, data: order };
    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error: "Failed to create order" };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT — Mark order as paid, deduct inventory, record in accounts
// ─────────────────────────────────────────────────────────────────────────────

export async function markOrderPaidAction(data: {
    orderId: string;
    slug: string;
    paymentMethod: string;
    referenceNo?: string;
}) {
    try {
        const schoolId = await getSchoolIdFromSlug(data.slug);

        const order = await (prisma as any).storeOrder.findUnique({
            where: { id: data.orderId },
            include: {
                orderItems: { include: { item: true } },
                student: true,
                fee: true,
            },
        });

        if (!order) return { success: false, error: "Order not found" };
        if (order.paymentStatus === "PAID") return { success: false, error: "Already paid" };

        await prisma.$transaction(async (tx) => {
            // Mark order paid
            await (tx as any).storeOrder.update({
                where: { id: order.id },
                data: { paymentStatus: "PAID" },
            });

            // Update linked fee if any
            if (order.feeId) {
                const payment = await (tx as any).feePayment.create({
                    data: {
                        feeId: order.feeId,
                        amount: order.totalAmount,
                        method: data.paymentMethod,
                        reference: data.referenceNo,
                        date: new Date(),
                    },
                });
                await (tx as any).fee.update({
                    where: { id: order.feeId },
                    data: { status: "PAID" },
                });
            }

            // Deduct inventory and create account transaction
            await deductInventoryAndRecord(tx, order, schoolId, data.paymentMethod, data.referenceNo);
        });

        revalidatePath(`/s/[slug]/store/orders`, "page");
        revalidatePath(`/s/[slug]/store/inventory`, "page");
        return { success: true };
    } catch (error) {
        console.error("Error marking order paid:", error);
        return { success: false, error: "Failed to mark order paid" };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FULFILLMENT — Physically issue items to student
// ─────────────────────────────────────────────────────────────────────────────

export async function fulfillStoreOrderAction(orderId: string, issuerId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            const order = await (tx as any).storeOrder.findUnique({
                where: { id: orderId },
                include: { orderItems: true },
            });
            if (!order) throw new Error("Order not found");
            if (order.paymentStatus !== "PAID") throw new Error("Order must be paid before fulfillment");

            for (const orderItem of order.orderItems) {
                await (tx as any).storeOrderItem.update({
                    where: { id: orderItem.id },
                    data: { isIssued: true, issuedAt: new Date(), issuedById: issuerId },
                });
            }

            // Check if all items issued
            const allIssued = order.orderItems.every((oi: any) => !oi.isBackordered);
            await (tx as any).storeOrder.update({
                where: { id: orderId },
                data: { status: allIssued ? "FULFILLED" : "PARTIALLY_FULFILLED" },
            });
        });

        revalidatePath(`/s/[slug]/store/orders`, "page");
        revalidatePath(`/s/[slug]/store/inventory`, "page");
        return { success: true };
    } catch (error: any) {
        console.error("Error fulfilling order:", error);
        return { success: false, error: error.message || "Failed to fulfill order" };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS — Store Sales Summary
// ─────────────────────────────────────────────────────────────────────────────

export async function getStoreSalesSummaryAction(slug: string, academicYearId?: string) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        const where: any = { schoolId, paymentStatus: "PAID" };
        if (academicYearId) where.academicYearId = academicYearId;

        const orders = await (prisma as any).storeOrder.findMany({
            where,
            include: { orderItems: { include: { item: { select: { type: true } } } } },
        });

        const stats = {
            totalRevenue: 0,
            totalOrders: orders.length,
            packageRevenue: 0,
            adhocRevenue: 0,
            byType: {} as Record<string, number>,
        };

        for (const order of orders) {
            stats.totalRevenue += order.totalAmount;
            if (order.sourceType === "PACKAGE") stats.packageRevenue += order.totalAmount;
            else stats.adhocRevenue += order.totalAmount;

            for (const oi of order.orderItems) {
                const type = oi.item?.type || "OTHER";
                stats.byType[type] = (stats.byType[type] || 0) + oi.unitPrice * oi.quantity;
            }
        }

        return { success: true, data: stats };
    } catch (error) {
        console.error("Error fetching sales summary:", error);
        return { success: false, error: "Failed to fetch sales summary" };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARENT — Store browsing and order status
// ─────────────────────────────────────────────────────────────────────────────

export async function getStudentStoreOrdersAction(studentId: string, slug: string) {
    try {
        const orders = await (prisma as any).storeOrder.findMany({
            where: { studentId },
            include: {
                orderItems: { include: { item: true } },
                package: { select: { name: true, gradeLevel: true } },
                fee: { select: { id: true, status: true, amount: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: orders };
    } catch (error) {
        console.error("Error fetching student orders:", error);
        return { success: false, error: "Failed to fetch orders" };
    }
}

export async function getMandatoryPackageForStudentAction(studentId: string, slug: string) {
    try {
        const schoolId = await getSchoolIdFromSlug(slug);
        const student = await (prisma as any).student.findUnique({
            where: { id: studentId },
            select: { grade: true },
        });
        if (!student?.grade) return { success: true, data: null };

        // Find pending mandatory package orders for this student
        const pendingPackageOrder = await (prisma as any).storeOrder.findFirst({
            where: {
                studentId,
                sourceType: "PACKAGE",
                paymentStatus: "UNPAID",
            },
            include: {
                package: {
                    include: {
                        items: { include: { item: { include: { inventories: true } } } },
                    },
                },
                fee: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: pendingPackageOrder };
    } catch (error) {
        console.error("Error fetching mandatory package:", error);
        return { success: false, error: "Failed to fetch package" };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPER — Deduct inventory + Create AccountTransaction
// ─────────────────────────────────────────────────────────────────────────────

async function deductInventoryAndRecord(
    tx: any,
    order: any,
    schoolId: string,
    paymentMethod: string,
    referenceNo?: string
) {
    // 1. Deduct inventory for each line item
    for (const orderItem of order.orderItems) {
        const inventory = await (tx as any).storeInventory.findFirst({
            where: { itemId: orderItem.itemId, schoolId },
        });

        const available = inventory?.quantity ?? 0;
        const demanded = orderItem.quantity;
        const canFulfill = Math.min(available, demanded);
        const backorderQty = demanded - canFulfill;

        if (inventory) {
            await (tx as any).storeInventory.update({
                where: { id: inventory.id },
                data: { quantity: Math.max(0, available - canFulfill) },
            });
        }

        if (backorderQty > 0) {
            await (tx as any).storeOrderItem.update({
                where: { id: orderItem.id },
                data: {
                    isBackordered: true,
                    backordered: backorderQty,
                    notes: `${backorderQty} unit(s) backordered due to insufficient stock`,
                },
            });
        }
    }

    // 2. Find or create a "Store Sales" accounting category
    let storeCategory = await (tx as any).accountCategory.findFirst({
        where: { schoolId, name: "Store Sales", type: "INCOME" },
    });

    if (!storeCategory) {
        storeCategory = await (tx as any).accountCategory.create({
            data: { schoolId, name: "Store Sales", type: "INCOME" },
        });
    }

    // 3. Find active financial year
    const financialYear = await (tx as any).accountFinancialYear.findFirst({
        where: { schoolId, isActive: true },
        orderBy: { startDate: "desc" },
    });

    if (!financialYear) return; // No financial year set up — skip accounting

    // 4. Create account transaction
    const student = order.student || await (tx as any).student.findUnique({
        where: { id: order.studentId },
        select: { firstName: true, lastName: true },
    });
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Student";

    await (tx as any).accountTransaction.create({
        data: {
            schoolId,
            title: `Store Sale — ${studentName}`,
            type: "INCOME",
            amount: order.totalAmount,
            date: new Date(),
            description: order.notes || `Store order ${order.id.slice(-6).toUpperCase()}`,
            paymentMethod,
            referenceNo,
            categoryId: storeCategory.id,
            financialYearId: financialYear.id,
            transactionNo: genTransactionNo("STR"),
            storeOrderId: order.id,
            status: "COMPLETED",
        },
    });
}
