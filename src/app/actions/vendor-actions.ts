"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to get school ID
async function getSchoolIdFromSlug(slug: string): Promise<string> {
    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) throw new Error("School not found");
    return school.id;
}

// Generate unique PO number
function generatePONumber(prefix = "PO") {
    return `${prefix}-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDORS
// ─────────────────────────────────────────────────────────────────────────────

export async function getVendorsAction(slug: string, category?: string) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const vendors = await prisma.storeVendor.findMany({
            where: {
                tenantId,
                ...(category && { categories: { has: category } })
            },
            orderBy: { name: "asc" }
        });
        return { success: true, data: JSON.parse(JSON.stringify(vendors)) };
    } catch (error: any) {
        console.error("Error fetching vendors:", error);
        return { success: false, error: error.message || "Failed to fetch vendors" };
    }
}

export async function getVendorAction(slug: string, vendorId: string) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const vendor = await prisma.storeVendor.findUnique({
            where: { id: vendorId, tenantId },
            include: {
                purchaseOrders: {
                    orderBy: { orderDate: "desc" },
                    take: 5
                },
                quotations: {
                    orderBy: { createdAt: "desc" }
                }
            }
        });
        if (!vendor) return { success: false, error: "Vendor not found" };
        return { success: true, data: JSON.parse(JSON.stringify(vendor)) };
    } catch (error: any) {
        console.error("Error fetching vendor:", error);
        return { success: false, error: error.message || "Failed to fetch vendor" };
    }
}

export async function createVendorAction(slug: string, data: { name: string; contactPerson?: string; email?: string; phone?: string; address?: string; categories: string[]; taxId?: string; paymentTerms?: string }) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const vendor = await prisma.storeVendor.create({
            data: { ...data, tenantId }
        });
        revalidatePath(`/s/[slug]/vendor/vendors`, "page");
        return { success: true, data: JSON.parse(JSON.stringify(vendor)) };
    } catch (error: any) {
        console.error("Error creating vendor:", error);
        return { success: false, error: error.message || "Failed to create vendor" };
    }
}

export async function updateVendorAction(slug: string, vendorId: string, data: Partial<{ name: string; contactPerson: string; email: string; phone: string; address: string; categories: string[]; taxId: string; paymentTerms: string; status: string }>) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const vendor = await prisma.storeVendor.update({
            where: { id: vendorId, tenantId },
            data
        });
        revalidatePath(`/s/[slug]/vendor/vendors`, "page");
        revalidatePath(`/s/[slug]/vendor/vendors/[id]`, "page");
        return { success: true, data: JSON.parse(JSON.stringify(vendor)) };
    } catch (error: any) {
        console.error("Error updating vendor:", error);
        return { success: false, error: error.message || "Failed to update vendor" };
    }
}

export async function deleteVendorAction(slug: string, vendorId: string) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        await prisma.storeVendor.delete({
            where: { id: vendorId, tenantId }
        });
        revalidatePath(`/s/[slug]/vendor/vendors`, "page");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting vendor:", error);
        return { success: false, error: error.message || "Failed to delete vendor. Ensure no POs are attached." };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export async function getPurchaseOrdersAction(slug: string, status?: string) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const pos = await prisma.storePurchaseOrder.findMany({
            where: {
                tenantId,
                ...(status && { status })
            },
            include: { vendor: true, items: true },
            orderBy: { orderDate: "desc" }
        });
        return { success: true, data: JSON.parse(JSON.stringify(pos)) };
    } catch (error: any) {
        console.error("Error fetching purchase orders:", error);
        return { success: false, error: error.message || "Failed to fetch purchase orders" };
    }
}

export async function getPurchaseOrderAction(slug: string, poId: string) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const po = await prisma.storePurchaseOrder.findUnique({
            where: { id: poId, tenantId },
            include: { vendor: true, items: true }
        });
        if (!po) return { success: false, error: "PO not found" };
        return { success: true, data: JSON.parse(JSON.stringify(po)) };
    } catch (error: any) {
        console.error("Error fetching purchase order:", error);
        return { success: false, error: error.message || "Failed to fetch purchase order" };
    }
}

export async function createPurchaseOrderAction(slug: string, data: { vendorId: string; expectedDelivery?: Date; notes?: string; items: { itemId?: string; customItemName?: string; quantity: number; unitRate: number }[] }) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const poNumber = generatePONumber();

        // Calculate totals and format items
        let totalAmount = 0;
        const formattedItems = data.items.map(item => {
            const total = Number(item.quantity) * Number(item.unitRate);
            totalAmount += total;
            return {
                itemId: item.itemId || null,
                customItemName: item.customItemName || null,
                quantity: Number(item.quantity),
                unitRate: Number(item.unitRate),
                total
            };
        });

        const po = await prisma.storePurchaseOrder.create({
            data: {
                tenantId,
                vendorId: data.vendorId,
                poNumber,
                expectedDelivery: data.expectedDelivery,
                notes: data.notes,
                totalAmount,
                status: "DRAFT",
                items: {
                    create: formattedItems
                }
            },
            include: { vendor: true, items: true }
        });

        revalidatePath(`/s/[slug]/vendor/purchase-orders`, "page");
        return { success: true, data: JSON.parse(JSON.stringify(po)) };
    } catch (error: any) {
        console.error("Error creating purchase order:", error);
        return { success: false, error: error.message || "Failed to create purchase order" };
    }
}

export async function updatePurchaseOrderStatusAction(slug: string, poId: string, status: string, approvedById?: string) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);

        const updateData: any = { status };

        if (status === "APPROVED" && approvedById) {
            updateData.approvedById = approvedById;
            updateData.approvalDate = new Date();
        }

        const po = await prisma.storePurchaseOrder.update({
            where: { id: poId, tenantId },
            data: updateData
        });

        // FUTURE: If status matches receiving, update store inventory directly

        revalidatePath(`/s/[slug]/vendor/purchase-orders`, "page");
        revalidatePath(`/s/[slug]/vendor/purchase-orders/[id]`, "page");
        return { success: true, data: JSON.parse(JSON.stringify(po)) };
    } catch (error: any) {
        console.error("Error updating PO status:", error);
        return { success: false, error: error.message || "Failed to update PO status" };
    }
}

export async function receivePurchaseOrderItemsAction(slug: string, poId: string, receivedItems: { id: string; receivedQuantity: number }[]) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);

        // Update item received quantities
        for (const item of receivedItems) {
            await prisma.storePurchaseOrderItem.update({
                where: { id: item.id },
                data: { receivedQuantity: item.receivedQuantity }
            });
        }

        // Check if all items are fully received
        const currentPO = await prisma.storePurchaseOrder.findUnique({
            where: { id: poId, tenantId },
            include: { items: true }
        });

        if (currentPO) {
            const allReceived = currentPO.items.every(i => i.receivedQuantity >= i.quantity);
            const anyReceived = currentPO.items.some(i => i.receivedQuantity > 0);

            let newStatus = currentPO.status;
            if (allReceived) newStatus = "COMPLETED";
            else if (anyReceived) newStatus = "PARTIAL_RECEIVED";

            if (newStatus !== currentPO.status) {
                await prisma.storePurchaseOrder.update({
                    where: { id: poId },
                    data: { status: newStatus }
                });
            }
        }

        revalidatePath(`/s/[slug]/vendor/purchase-orders`, "page");
        revalidatePath(`/s/[slug]/vendor/purchase-orders/[id]`, "page");
        return { success: true };
    } catch (error: any) {
        console.error("Error receiving PO items:", error);
        return { success: false, error: error.message || "Failed to receive PO items" };
    }
}

export async function deletePurchaseOrderAction(slug: string, poId: string) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        await prisma.storePurchaseOrder.delete({
            where: { id: poId, tenantId }
        });
        revalidatePath(`/s/[slug]/vendor/purchase-orders`, "page");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting purchase order:", error);
        return { success: false, error: error.message || "Failed to delete purchase order" };
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// QUOTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getQuotationsAction(slug: string, vendorId?: string) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const quotations = await prisma.storeQuotation.findMany({
            where: {
                tenantId,
                ...(vendorId && { vendorId })
            },
            include: { vendor: true },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: JSON.parse(JSON.stringify(quotations)) };
    } catch (error: any) {
        console.error("Error fetching quotations:", error);
        return { success: false, error: error.message || "Failed to fetch quotations" };
    }
}

export async function uploadQuotationAction(slug: string, data: { vendorId: string; title: string; documentUrl: string; validUntil?: Date }) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const quote = await prisma.storeQuotation.create({
            data: { ...data, tenantId, status: "REVIEW" }
        });
        revalidatePath(`/s/[slug]/vendor/vendors/[id]`, "page");
        revalidatePath(`/s/[slug]/vendor/quotations`, "page");
        return { success: true, data: JSON.parse(JSON.stringify(quote)) };
    } catch (error: any) {
        console.error("Error uploading quotation:", error);
        return { success: false, error: error.message || "Failed to upload quotation" };
    }
}

export async function updateQuotationStatusAction(slug: string, quoteId: string, status: string) {
    try {
        const tenantId = await getSchoolIdFromSlug(slug);
        const quote = await prisma.storeQuotation.update({
            where: { id: quoteId, tenantId },
            data: { status }
        });
        revalidatePath(`/s/[slug]/vendor/vendors/[id]`, "page");
        revalidatePath(`/s/[slug]/vendor/quotations`, "page");
        return { success: true, data: JSON.parse(JSON.stringify(quote)) };
    } catch (error: any) {
        console.error("Error updating quotation status:", error);
        return { success: false, error: error.message || "Failed to update quotation" };
    }
}
