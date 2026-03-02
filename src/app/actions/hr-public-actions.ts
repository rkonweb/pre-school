"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getJobPostingsAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug }
        });

        if (!school) return { success: false, error: "School not found" };

        const postings = await prisma.jobPosting.findMany({
            where: { isOpen: true },
            orderBy: { createdAt: "desc" }
        });

        return { success: true, data: postings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function submitApplicationAction(data: any, slug: string) {
    try {
        const application = await prisma.jobApplication.create({
            data: {
                id: `APP-${Date.now()}`,
                jobId: data.jobId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                resumeUrl: data.resumeUrl,
                linkedin: data.linkedin,
                portfolio: data.portfolio,
                coverLetter: data.coverLetter,
                status: "PENDING",
                updatedAt: new Date()
            }
        });

        // Revalidate the recruiter's board so the new application appears instantly
        revalidatePath(`/s/${slug}/hr/recruitment`);

        return { success: true, data: application };
    } catch (error: any) {
        console.error("Failed to submit application:", error);
        return { success: false, error: error.message };
    }
}
