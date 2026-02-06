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

export async function bulkCreateMasterDataAction(type: string, parentId: string | null, items: { name: string; code?: string }[]) {
    try {
        if (!items || items.length === 0) return { success: true, count: 0 };

        console.log(`Bulk importing ${items.length} items for type ${type} (Parent: ${parentId})`);

        // Filter duplicates within the payload
        const uniqueItems = Array.from(new Set(items.map(i => i.name)))
            .map(name => items.find(i => i.name === name)!);

        // Optimization: Find existing names to avoid unique constraint errors (if name is unique per type/parent)
        // Usually MasterData doesn't strictly enforce DB-level constraints on (type, name, parentId) but it's good practice.
        // We will just attempt to create them.

        // @ts-ignore
        const result = await (prisma as any).masterData.createMany({
            data: uniqueItems.map(item => ({
                type,
                name: item.name,
                code: item.code || item.name.substring(0, 3).toUpperCase(),
                parentId: parentId || null
            })),
            skipDuplicates: true // Works on some DBs, ignored on others if no unique constraint
        });

        revalidatePath("/admin/dashboard/master-data");
        return { success: true, count: result.count };
    } catch (error: any) {
        console.error("Bulk Create Error:", error);
        return { success: false, error: error.message || "Bulk import failed" };
    }
}

export async function getAllMasterDataForExportAction() {
    try {
        // @ts-ignore
        const allData = await (prisma as any).masterData.findMany({
            orderBy: [
                { type: 'asc' },
                { name: 'asc' }
            ]
        });
        return { success: true, data: allData };
    } catch (error: any) {
        console.error("Export Fetch Error:", error);
        return { success: false, error: error.message };
    }
}
