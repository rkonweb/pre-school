"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSchoolDesignAction(schoolSlug: string, templateId: string, customValues: Record<string, string>) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        await prisma.schoolMarketingDesign.upsert({
            where: {
                schoolId_templateId: {
                    schoolId: school.id,
                    templateId: templateId
                }
            },
            update: {
                customValues: JSON.stringify(customValues)
            },
            create: {
                schoolId: school.id,
                templateId: templateId,
                customValues: JSON.stringify(customValues)
            }
        });

        revalidatePath(`/s/${schoolSlug}/marketing/customize/${templateId}`);
        return { success: true };
    } catch (error) {
        console.error("saveSchoolDesign error:", error);
        return { success: false, error: "Failed to save design" };
    }
}

export async function getSchoolDesignAction(schoolSlug: string, templateId: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const design = await prisma.schoolMarketingDesign.findUnique({
            where: {
                schoolId_templateId: {
                    schoolId: school.id,
                    templateId: templateId
                }
            }
        });

        if (!design) return { success: true, data: null };

        return { success: true, data: JSON.parse(design.customValues) };
    } catch (error) {
        console.error("getSchoolDesign error:", error);
        return { success: false, error: "Failed to load design" };
    }
}

export async function resetSchoolDesignAction(schoolSlug: string, templateId: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        await prisma.schoolMarketingDesign.delete({
            where: {
                schoolId_templateId: {
                    schoolId: school.id,
                    templateId: templateId
                }
            }
        });

        revalidatePath(`/s/${schoolSlug}/marketing/customize/${templateId}`);
        return { success: true };
    } catch (error) {
        // Record not found is fine
        return { success: true };
    }
}
