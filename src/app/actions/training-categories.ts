"use server";

import { trainingPrisma as prisma } from "@/lib/training-prisma";
import { revalidatePath } from "next/cache";

export async function testAction() {
    console.log("SERVER ACTION: testAction CALLED");
    try {
        const isPrismaDefined = !!prisma;
        console.log("SERVER ACTION: prisma defined?", isPrismaDefined);
        return { success: true, message: "Server action is working", prismaDefined: isPrismaDefined };
    } catch (error: any) {
        console.error("SERVER ACTION: testAction ERROR", error);
        return { success: false, error: error.message };
    }
}

export async function getTrainingCategoriesAction() {
    try {
        const categories = await (prisma as any).trainingCategory.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                slug: true,
                name: true
            }
        });
        return { success: true, data: categories };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createTrainingCategoryAction(name: string) {
    try {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const category = await (prisma as any).trainingCategory.create({
            data: {
                name,
                slug: `${slug}-${Date.now()}` // Ensure uniqueness
            }
        });
        revalidatePath('/admin/training');
        return { success: true, data: category };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTrainingCategoryAction(categoryId: string) {
    try {
        await (prisma as any).trainingCategory.delete({
            where: { id: categoryId }
        });
        revalidatePath('/admin/training');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function renameTrainingCategoryAction(categoryId: string, name: string) {
    try {
        const category = await (prisma as any).trainingCategory.update({
            where: { id: categoryId },
            data: { name }
        });
        revalidatePath('/admin/training');
        return { success: true, data: category };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
