"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMasterDataAction(type: string, parentId?: string | null) {
    try {
        const query: any = { type };

        if (parentId === null || parentId === "null") {
            query.parentId = null;
        } else if (parentId) {
            query.parentId = parentId;
        }

        if (!(prisma as any).masterData) {
            console.error("CRITICAL: MasterData model is missing from Prisma client!");
            const models = Object.keys(prisma).filter(k => !k.startsWith('_') && typeof (prisma as any)[k] === 'object');
            console.log("Available models:", models.join(", "));
            return { success: false, error: "Database client synchronization issue. Models available: " + models.join(", ") };
        }

        console.log("Database Query:", JSON.stringify(query));

        // @ts-ignore - Ignore till TS finishes re-indexing the new local client
        const data = await (prisma as any).masterData.findMany({
            where: query,
            include: {
                _count: {
                    select: { children: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("Fetch Master Data Error:", error);
        return { success: false, error: error.message || "Failed to fetch data" };
    }
}

export async function createMasterDataAction(data: { type: string; name: string; code?: string; parentId?: string }) {
    try {
        // @ts-ignore
        const item = await (prisma as any).masterData.create({
            data: {
                type: data.type,
                name: data.name,
                code: data.code,
                parentId: data.parentId || null
            }
        });

        revalidatePath("/admin/dashboard/master-data");
        return { success: true, data: item };
    } catch (error: any) {
        console.error("Create Master Data Error:", error);
        return { success: false, error: error.message || "Failed to create data" };
    }
}

export async function updateMasterDataAction(id: string, data: { name?: string; code?: string; parentId?: string }) {
    try {
        // @ts-ignore
        const item = await (prisma as any).masterData.update({
            where: { id },
            data: {
                name: data.name,
                code: data.code,
                parentId: data.parentId || undefined
            }
        });

        revalidatePath("/admin/dashboard/master-data");
        return { success: true, data: item };
    } catch (error: any) {
        console.error("Update Master Data Error:", error);
        return { success: false, error: error.message || "Failed to update data" };
    }
}

export async function deleteMasterDataAction(id: string) {
    try {
        // Check for children
        // @ts-ignore
        const childrenCount = await (prisma as any).masterData.count({
            where: { parentId: id }
        });

        if (childrenCount > 0) {
            return { success: false, error: "Cannot delete item with children. Delete children first." };
        }

        // @ts-ignore
        await (prisma as any).masterData.delete({
            where: { id }
        });

        revalidatePath("/admin/dashboard/master-data");
        return { success: true };
    } catch (error: any) {
        console.error("Delete Master Data Error:", error);
        return { success: false, error: error.message || "Failed to delete data" };
    }
}

export async function getMasterDataStatsAction() {
    try {
        // @ts-ignore
        const total = await (prisma as any).masterData.count();
        return { success: true, count: total };
    } catch (error: any) {
        console.error("Fetch stats error:", error);
        return { success: false, count: 0 };
    }
}
