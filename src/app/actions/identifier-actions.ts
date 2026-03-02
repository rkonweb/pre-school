"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type IdentifierType = 'invoice' | 'admission' | 'enquiry' | 'enrollment';

interface IdentifierConfig {
    prefix: string;
    suffix: string;
    padding: number;
    nextNumber: number;
}

const DEFAULT_CONFIGS: Record<IdentifierType, IdentifierConfig> = {
    invoice: { prefix: "INV-", suffix: "", padding: 4, nextNumber: 1001 },
    admission: { prefix: "ADM/", suffix: "", padding: 4, nextNumber: 1 },
    enquiry: { prefix: "ENQ-", suffix: "", padding: 4, nextNumber: 1 },
    enrollment: { prefix: "ENR-", suffix: "", padding: 4, nextNumber: 1 },
};

export async function getIdentifierConfigsAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { modulesConfig: true }
        });

        if (!school) return { success: false, error: "School not found" };

        let config: any = {};
        try {
            config = JSON.parse(school.modulesConfig || "{}");
            if (Array.isArray(config)) config = {};
        } catch (e) {
            config = {};
        }

        const identifiers = (config as any).identifiers || {};

        // Merge with defaults
        const merged: Record<string, IdentifierConfig> = {};
        (Object.keys(DEFAULT_CONFIGS) as IdentifierType[]).forEach(key => {
            merged[key] = { ...DEFAULT_CONFIGS[key], ...(identifiers[key] || {}) };
        });

        return { success: true, data: merged };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateIdentifierConfigAction(slug: string, type: IdentifierType, updates: Partial<IdentifierConfig>) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true, modulesConfig: true }
        });

        if (!school) return { success: false, error: "School not found" };

        let fullConfig: any = {};
        try {
            fullConfig = JSON.parse(school.modulesConfig || "{}");
            if (Array.isArray(fullConfig)) fullConfig = {};
        } catch (e) {
            fullConfig = {};
        }

        if (!fullConfig.identifiers) fullConfig.identifiers = {};

        const current = fullConfig.identifiers[type] || DEFAULT_CONFIGS[type];
        fullConfig.identifiers[type] = { ...current, ...updates };

        await prisma.school.update({
            where: { id: school.id },
            data: { modulesConfig: JSON.stringify(fullConfig) }
        });

        revalidatePath(`/s/${slug}/settings/identifiers`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Generates the next identifier for a given type, formatted according to school settings.
 * This function increments the counter in the database.
 */
export async function generateNextIdentifierAction(slug: string, type: IdentifierType) {
    try {
        return await prisma.$transaction(async (tx) => {
            const school = await tx.school.findUnique({
                where: { slug },
                select: { id: true, modulesConfig: true }
            });

            if (!school) throw new Error("School not found");

            let fullConfig: any = {};
            try {
                fullConfig = JSON.parse(school.modulesConfig || "{}");
                if (Array.isArray(fullConfig)) fullConfig = {};
            } catch (e) {
                fullConfig = {};
            }

            if (!fullConfig.identifiers) fullConfig.identifiers = {};
            const currentTypeConfig = { ...DEFAULT_CONFIGS[type], ...(fullConfig.identifiers[type] || {}) };

            const numStr = String(currentTypeConfig.nextNumber).padStart(currentTypeConfig.padding, '0');
            const generatedId = `${currentTypeConfig.prefix}${numStr}${currentTypeConfig.suffix}`;

            // Increment for next time
            fullConfig.identifiers[type] = { ...currentTypeConfig, nextNumber: currentTypeConfig.nextNumber + 1 };

            await tx.school.update({
                where: { id: school.id },
                data: { modulesConfig: JSON.stringify(fullConfig) }
            });

            return generatedId;
        });
    } catch (error: any) {
        console.error(`Error generating ${type} identifier:`, error);
        return null;
    }
}
