"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFeeStructuresAction(schoolSlug: string) {
    try {
        const structures = await prisma.feeStructure.findMany({
            where: {
                school: { slug: schoolSlug }
            },
            include: {
                components: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return { success: true, data: structures };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createFeeStructureAction(schoolSlug: string, data: any) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) throw new Error("School not found");

        const structure = await prisma.feeStructure.create({
            data: {
                name: data.name,
                academicYear: data.academicYear,
                description: data.description,
                termConfig: JSON.stringify(data.termConfig),
                schoolId: school.id,
                components: {
                    create: data.components.map((c: any) => ({
                        name: c.name,
                        amount: parseFloat(c.amount),
                        currency: c.currency || "USD",
                        frequency: c.frequency,
                        isOptional: c.isOptional || false,
                        isRefundable: c.isRefundable || false,
                        midTermRule: c.midTermRule || "FULL",
                        config: c.config ? JSON.stringify(c.config) : null
                    }))
                }
            }
        });

        revalidatePath(`/s/${schoolSlug}/settings/fees`);
        return { success: true, data: structure };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateFeeStructureAction(schoolSlug: string, id: string, data: any) {
    try {
        // We'll use a transaction to update structure and replace components safely
        await prisma.$transaction(async (tx) => {
            // 1. Update basic details
            await tx.feeStructure.update({
                where: { id },
                data: {
                    name: data.name,
                    academicYear: data.academicYear,
                    description: data.description,
                    termConfig: JSON.stringify(data.termConfig)
                }
            });

            // 2. Delete existing components (simplified approach for full replace)
            // In a real app, might want to diff them to preserve IDs if referenced elsewhere
            await tx.feeComponent.deleteMany({
                where: { feeStructureId: id }
            });

            // 3. Create new components
            if (data.components && data.components.length > 0) {
                await Promise.all(data.components.map((c: any) =>
                    tx.feeComponent.create({
                        data: {
                            feeStructureId: id,
                            name: c.name,
                            amount: parseFloat(c.amount),
                            currency: c.currency || "USD",
                            frequency: c.frequency,
                            isOptional: c.isOptional || false,
                            isRefundable: c.isRefundable || false,
                            midTermRule: c.midTermRule || "FULL",
                            config: c.config ? JSON.stringify(c.config) : null
                        }
                    })
                ));
            }
        });

        revalidatePath(`/s/${schoolSlug}/settings/fees`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFeeStructureAction(schoolSlug: string, id: string) {
    try {
        await prisma.feeStructure.delete({
            where: { id }
        });
        revalidatePath(`/s/${schoolSlug}/settings/fees`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
