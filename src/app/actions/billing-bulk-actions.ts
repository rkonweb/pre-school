"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBulkBillingInitData(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true, currency: true }
        });

        if (!school) return { success: false, error: "School not found" };

        const classrooms = await prisma.classroom.findMany({
            where: { schoolId: school.id },
            select: {
                id: true,
                name: true,
                _count: {
                    select: { students: true }
                }
            }
        });

        return { success: true, classrooms, currency: school.currency || "USD" };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function generateBulkInvoicesAction(slug: string, classroomId: string, data: { title: string, amount: number, dueDate: string }) {
    try {
        const students = await prisma.student.findMany({
            where: { classroomId },
            select: { id: true }
        });

        if (students.length === 0) {
            return { success: false, error: "No students found in this class" };
        }

        const feesData = students.map(s => ({
            studentId: s.id,
            title: data.title,
            amount: Number(data.amount),
            dueDate: new Date(data.dueDate),
            status: "PENDING"
        }));

        // Use transaction for safety mostly, createMany is better if available but standardizing is good
        // Use transaction for SQLite compatibility (createMany might not be typed/enabled)
        await prisma.$transaction(
            feesData.map(fee => prisma.fee.create({ data: fee }))
        );

        revalidatePath(`/s/${slug}/billing`);
        return { success: true, count: students.length };
    } catch (e: any) {
        console.error("Bulk Invoice Error:", e);
        return { success: false, error: e.message };
    }
}
