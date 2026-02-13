"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMarketingTemplatesAction(type?: string, category?: string) {
    try {
        console.log("[MARKETING_ACTIONS] getTemplates called with:", { type, category });

        const where: any = {};
        if (type && type !== "ALL") where.type = type;
        if (category && category !== "ALL") where.category = category;

        const templates = await prisma.marketingTemplate.findMany({
            where,
            orderBy: { createdAt: "desc" }
        });

        // Ensure plain object serialization to avoid Next.js server action issues with complex objects (like Dates sometimes)
        return { success: true, data: JSON.parse(JSON.stringify(templates)) };
    } catch (error: any) {
        console.error("[MARKETING_ACTIONS] getTemplates error:", error);
        return { success: false, error: `Failed to load templates: ${error.message}` };
    }
}

export async function getMarketingTemplateAction(id: string) {
    try {
        const template = await prisma.marketingTemplate.findUnique({
            where: { id }
        });
        return { success: true, data: JSON.parse(JSON.stringify(template)) };
    } catch (error: any) {
        console.error("[MARKETING_ACTIONS] getTemplate error:", error);
        return { success: false, error: `Failed to load template: ${error.message}` };
    }
}

export async function createMarketingTemplateAction(data: {
    name: string;
    type: string;
    category: string;
    baseImageUrl: string;
    previewUrl?: string;
    config?: string;
}) {
    try {
        console.log("[MARKETING_ACTIONS] createTemplate start", { name: data.name, type: data.type });

        const template = await prisma.marketingTemplate.create({
            data: {
                name: data.name,
                type: data.type,
                category: data.category,
                baseImageUrl: data.baseImageUrl,
                previewUrl: data.previewUrl || data.baseImageUrl,
                config: data.config || "{}",
                isActive: true
            }
        });

        console.log("[MARKETING_ACTIONS] createTemplate success", template.id);
        console.log("[MARKETING_ACTIONS] createTemplate success", template.id);

        try {
            revalidatePath("/admin/marketing");
            revalidatePath("/s/[slug]/marketing", "page");
        } catch (e) {
            console.error("Revalidation failed", e);
        }

        return { success: true, data: JSON.parse(JSON.stringify(template)) };
    } catch (error: any) {
        console.error("[MARKETING_ACTIONS] createTemplate error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
        return {
            success: false,
            error: `Database Error: ${error.message || "Unknown error"}. Please check if the database is accessible.`
        };
    }
}

export async function updateMarketingTemplateAction(id: string, data: any) {
    try {
        const template = await prisma.marketingTemplate.update({
            where: { id },
            data
        });

        try {
            revalidatePath("/admin/marketing");
            revalidatePath(`/admin/marketing/${id}`);
            revalidatePath("/s/[slug]/marketing", "page");
        } catch (e) {
            console.error("Revalidation failed", e);
        }

        return { success: true, data: JSON.parse(JSON.stringify(template)) };
    } catch (error) {
        console.error("[MARKETING_ACTIONS] updateTemplate error:", error);
        return { success: false, error: "Failed to update template" };
    }
}

export async function deleteMarketingTemplateAction(id: string) {
    try {
        await prisma.marketingTemplate.delete({
            where: { id }
        });

        try {
            revalidatePath("/admin/marketing");
            revalidatePath("/s/[slug]/marketing", "page");
        } catch (e) {
            console.error("Revalidation failed", e);
        }

        return { success: true };
    } catch (error) {
        console.error("[MARKETING_ACTIONS] deleteTemplate error:", error);
        return { success: false, error: "Failed to delete template" };
    }
}

export async function toggleMarketingTemplateStatusAction(id: string, isActive: boolean) {
    try {
        await prisma.marketingTemplate.update({
            where: { id },
            data: { isActive }
        });

        try {
            revalidatePath("/admin/marketing");
            revalidatePath("/s/[slug]/marketing", "page");
        } catch (e) {
            console.error("Revalidation failed", e);
        }

        return { success: true };
    } catch (error) {
        console.error("[MARKETING_ACTIONS] toggleStatus error:", error);
        return { success: false, error: "Failed to toggle status" };
    }
}

// ============================================================================
// ATTRIBUTE ACTIONS (Categories & Formats)
// ============================================================================

export async function getMarketingAttributesAction(type: "FORMAT" | "CATEGORY") {
    try {
        const attributes = await prisma.marketingAttribute.findMany({
            where: { type },
            orderBy: { name: "asc" }
        });
        return { success: true, data: JSON.parse(JSON.stringify(attributes)) };
    } catch (error: any) {
        console.error("[MARKETING_ACTIONS] getAttributes error:", error);
        return { success: false, error: `Failed to load attributes: ${error.message}` };
    }
}

export async function createMarketingAttributeAction(type: "FORMAT" | "CATEGORY", name: string) {
    try {
        const attribute = await prisma.marketingAttribute.create({
            data: { type, name }
        });

        try {
            revalidatePath("/admin/marketing");
        } catch (e) {
            console.error("Revalidation failed", e);
        }

        return { success: true, data: JSON.parse(JSON.stringify(attribute)) };
    } catch (error) {
        console.error("[MARKETING_ACTIONS] createAttribute error:", error);
        return { success: false, error: "Failed to create attribute" };
    }
}

export async function deleteMarketingAttributeAction(id: string) {
    try {
        await prisma.marketingAttribute.delete({
            where: { id }
        });

        try {
            revalidatePath("/admin/marketing");
        } catch (e) {
            console.error("Revalidation failed", e);
        }

        return { success: true };
    } catch (error) {
        console.error("[MARKETING_ACTIONS] deleteAttribute error:", error);
        return { success: false, error: "Failed to delete attribute" };
    }
}
