"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWhatsAppTemplatesAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const templates = await (prisma as any).whatsAppTemplate.findMany({
            where: { schoolId: school.id },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, templates };
    } catch (error) {
        console.error("Get Templates Error:", error);
        return { success: false, error: "Failed to fetch templates" };
    }
}

export async function saveWhatsAppTemplateAction(schoolSlug: string, data: any) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const template = await (prisma as any).whatsAppTemplate.upsert({
            where: { id: data.id || 'new' },
            create: {
                ...data,
                id: undefined,
                schoolId: school.id,
                scoreBands: JSON.stringify(data.scoreBands || []),
                variables: JSON.stringify(data.variables || []),
            },
            update: {
                ...data,
                scoreBands: JSON.stringify(data.scoreBands || []),
                variables: JSON.stringify(data.variables || []),
            }
        });

        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/templates`);
        return { success: true, template };
    } catch (error) {
        console.error("Save Template Error:", error);
        return { success: false, error: "Failed to save template" };
    }
}

export async function toggleWhatsAppTemplateAction(schoolSlug: string, id: string, isActive: boolean) {
    try {
        await (prisma as any).whatsAppTemplate.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/templates`);
        return { success: true };
    } catch (error) {
        console.error("Toggle Template Error:", error);
        return { success: false, error: "Failed to toggle status" };
    }
}

export async function deleteWhatsAppTemplateAction(schoolSlug: string, id: string) {
    try {
        await (prisma as any).whatsAppTemplate.delete({
            where: { id }
        });
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/templates`);
        return { success: true };
    } catch (error) {
        console.error("Delete Template Error:", error);
        return { success: false, error: "Failed to delete template" };
    }
}
