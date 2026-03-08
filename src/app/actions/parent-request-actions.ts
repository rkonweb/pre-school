"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getParentRequestsAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found", data: [] };

        const data = await prisma.parentRequest.findMany({
            where: { schoolId: school.id },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                student: { select: { firstName: true, lastName: true, admissionNumber: true } },
            }
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("getParentRequestsAction Error:", error);
        return { success: false, error: "Failed to fetch requests", data: [] };
    }
}

export async function updateParentRequestStatusAction(
    slug: string,
    requestId: string,
    status: string,
    responseNote?: string
) {
    try {
        await prisma.parentRequest.update({
            where: { id: requestId },
            data: {
                status: status as any,
                responseNote: responseNote || null,
            },
        });

        revalidatePath(`/s/${slug}/parent-requests`);
        return { success: true };
    } catch (error: any) {
        console.error("updateParentRequestStatusAction Error:", error);
        return { success: false, error: "Failed to update request" };
    }
}

export async function createParentRequestAction(
    studentId: string,
    type: string,
    description: string,
    parentMobile: string
) {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { schoolId: true }
        });

        if (!student) return { success: false, error: "Student not found" };

        const request = await prisma.parentRequest.create({
            data: {
                schoolId: student.schoolId,
                studentId,
                type,
                description,
                parentMobile,
                status: "PENDING",
            }
        });

        return { success: true, data: JSON.parse(JSON.stringify(request)) };
    } catch (error: any) {
        console.error("createParentRequestAction Error:", error);
        return { success: false, error: "Failed to submit request" };
    }
}
