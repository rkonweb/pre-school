"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStoreCatalogAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found", data: [] };

        const data = await prisma.parentStoreItem.findMany({
            where: { schoolId: school.id },
            orderBy: [{ category: "asc" }, { name: "asc" }],
        });
        return { success: true, data };
    } catch (error: any) {
        console.error("getStoreCatalogAction Error:", error);
        return { success: false, error: "Failed to fetch catalog", data: [] };
    }
}

export async function getStoreOrdersAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found", data: [] };

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
        return { success: true, data };
    } catch (error: any) {
        console.error("getStoreOrdersAction Error:", error);
        return { success: false, error: "Failed to fetch orders", data: [] };
    }
}

export async function updateStoreItemAvailabilityAction(itemId: string, isAvailable: boolean) {
    try {
        await prisma.parentStoreItem.update({ where: { id: itemId }, data: { isAvailable } });
        return { success: true };
    } catch (error: any) {
        console.error("updateStoreItemAvailabilityAction Error:", error);
        return { success: false, error: "Failed to update item" };
    }
}

export async function updateStoreOrderStatusAction(orderId: string, status: string) {
    try {
        await prisma.parentStoreOrder.update({ where: { id: orderId }, data: { status } });
        return { success: true };
    } catch (error: any) {
        console.error("updateStoreOrderStatusAction Error:", error);
        return { success: false, error: "Failed to update order" };
    }
}

export async function createStoreItemBySlugAction(
    slug: string,
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
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        const item = await prisma.parentStoreItem.create({
            data: {
                schoolId: school.id,
                name: data.name,
                description: data.description,
                price: data.price,
                category: data.category as any,
                stock: data.stock,
                imageUrl: data.imageUrl,
                isAvailable: data.stock > 0,
            },
        });
        revalidatePath(`/s/${slug}/school-store`);
        return { success: true, data: JSON.parse(JSON.stringify(item)) };
    } catch (error: any) {
        console.error("createStoreItemBySlugAction Error:", error);
        return { success: false, error: "Failed to create item" };
    }
}
