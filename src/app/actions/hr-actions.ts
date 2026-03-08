"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getJobPostingsAction() {
    try {
        const postings = await prisma.jobPosting.findMany({
            include: { JobApplication: true },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: JSON.parse(JSON.stringify(postings)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateApplicationStatusAction(id: string, status: string, slug: string) {
    try {
        const app = await prisma.jobApplication.update({
            where: { id },
            data: { status }
        });
        revalidatePath(`/s/${slug}/hr/recruitment`);
        return { success: true, data: JSON.parse(JSON.stringify(app)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createJobPostingAction(data: any, slug: string) {
    try {
        const posting = await prisma.jobPosting.create({
            data: {
                id: `JP-${Date.now()}`,
                title: data.title,
                department: data.department,
                location: data.location,
                type: data.type,
                description: data.description,
                requirements: data.requirements || null,
                isOpen: true,
                updatedAt: new Date(),
            }
        });
        revalidatePath(`/s/${slug}/hr/recruitment`);
        return { success: true, data: JSON.parse(JSON.stringify(posting)) };
    } catch (error: any) {
        console.error("Failed to create job posting:", error);
        return { success: false, error: error.message };
    }
}
