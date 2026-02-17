'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

interface IDCardTemplateData {
    name: string;
    description?: string;
    layout: string;
    dimensions?: string;
    orientation?: string;
    isSystem?: boolean;
    width?: number;
    height?: number;
    unit?: string;
    bleed?: number;
    safeMargin?: number;
    parentTemplateId?: string;
    schoolId?: string;
}

export async function getIDCardTemplatesAction(schoolId: string) {
    try {
        return await prisma.iDCardTemplate.findMany({
            where: {
                OR: [
                    { schoolId },
                    { isSystem: true, schoolId: null }
                ]
            },
            include: {
                childTemplates: {
                    where: { schoolId }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Failed to fetch ID card templates:", error);
        return [];
    }
}

export async function getIDCardTemplateByIdAction(id: string) {
    try {
        return await prisma.iDCardTemplate.findUnique({
            where: { id }
        });
    } catch (error) {
        console.error("Failed to fetch ID card template:", error);
        return null;
    }
}

export async function createIDCardTemplateAction(data: IDCardTemplateData, slug: string) {
    try {
        const template = await prisma.iDCardTemplate.create({
            data: {
                name: data.name,
                description: data.description,
                layout: data.layout,
                dimensions: data.dimensions || "54x86",
                orientation: data.orientation || "VERTICAL",
                isSystem: data.isSystem || false,
                width: data.width ?? 86,
                height: data.height ?? 54,
                unit: data.unit || "mm",
                bleed: data.bleed ?? 3,
                safeMargin: data.safeMargin ?? 5,
                schoolId: data.schoolId,
                parentTemplateId: data.parentTemplateId
            }
        });
        revalidatePath(`/s/${slug}/settings/id-cards`);
        revalidatePath(`/s/${slug}/students/id-cards`);
        return { success: true, data: template };
    } catch (error) {
        console.error("Failed to create ID card template:", error);
        return { success: false, error: "Failed to create template" };
    }
}

export async function updateIDCardTemplateAction(id: string, data: Partial<IDCardTemplateData>, slug: string) {
    try {
        const template = await prisma.iDCardTemplate.update({
            where: { id },
            data
        });
        revalidatePath(`/s/${slug}/settings/id-cards`);
        revalidatePath(`/s/${slug}/students/id-cards`);
        return { success: true, data: template };
    } catch (error) {
        console.error("Failed to update ID card template:", error);
        return { success: false, error: "Failed to update template" };
    }
}

export async function deleteIDCardTemplateAction(id: string, slug: string) {
    try {
        await prisma.iDCardTemplate.delete({
            where: { id }
        });
        revalidatePath(`/s/${slug}/settings/id-cards`);
        revalidatePath(`/s/${slug}/students/id-cards`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete ID card template:", error);
        return { success: false, error: "Failed to delete template" };
    }
}

// --- ID Card Settings ---

export async function getIDCardSettingsAction(schoolId: string) {
    try {
        return await prisma.iDCardSettings.findUnique({
            where: { schoolId }
        });
    } catch (error) {
        console.error("Failed to fetch ID card settings:", error);
        return null;
    }
}

export async function upsertIDCardSettingsAction(schoolId: string, slug: string, data: any) {
    try {
        const settings = await prisma.iDCardSettings.upsert({
            where: { schoolId },
            create: {
                schoolId,
                ...data
            },
            update: data
        });
        revalidatePath(`/s/${slug}/settings/id-cards`);
        revalidatePath(`/s/${slug}/students/id-cards`);
        return { success: true, data: settings };
    } catch (error) {
        console.error("Failed to save ID card settings:", error);
        return { success: false, error: "Failed to save settings" };
    }
}

export async function resetIDCardTemplateAction(templateId: string, slug: string) {
    try {
        await prisma.iDCardTemplate.delete({
            where: { id: templateId }
        });

        revalidatePath(`/s/${slug}/settings/id-cards`);
        revalidatePath(`/s/${slug}/students/id-cards`);
        return { success: true };
    } catch (error) {
        console.error("Failed to reset template:", error);
        return { success: false, error: "Failed to reset template" };
    }
}

export async function duplicateIDCardTemplateAction(templateId: string, slug: string) {
    try {
        const source = await prisma.iDCardTemplate.findUnique({
            where: { id: templateId }
        });

        if (!source) return { success: false, error: "Source template not found" };

        const school = await prisma.school.findUnique({
            where: { slug }
        });

        if (!school) return { success: false, error: "School not found" };

        const duplicate = await prisma.iDCardTemplate.create({
            data: {
                name: `${source.name} (Copy)`,
                description: source.description,
                layout: source.layout,
                dimensions: source.dimensions,
                orientation: source.orientation,
                isSystem: false,
                width: source.width,
                height: source.height,
                unit: source.unit,
                bleed: source.bleed,
                safeMargin: source.safeMargin,
                schoolId: school.id,
                // Duplicate is ALWAYS standalone, no parent link
                parentTemplateId: null
            }
        });

        revalidatePath(`/s/${slug}/settings/id-cards`);
        revalidatePath(`/s/${slug}/students/id-cards`);
        return { success: true, data: duplicate };
    } catch (error) {
        console.error("Failed to duplicate template:", error);
        return { success: false, error: "Failed to duplicate template" };
    }
}

export async function getAdminIDCardTemplatesAction() {
    try {
        return await prisma.iDCardTemplate.findMany({
            where: { isSystem: true, schoolId: null },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Failed to fetch admin ID card templates:", error);
        return [];
    }
}
