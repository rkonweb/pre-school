"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentUserAction } from "./session-actions";
import { verifyClassAccess } from "@/lib/access-control";

export async function createFeeAction(studentId: string, title: string, amount: number, dueDate: Date, description?: string) {
    try {
        // PERMISSION CHECK
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) return { success: false, error: "Unauthorized" };
        const currentUser = userRes.data;

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classroomId: true }
        });

        if (!student) return { success: false, error: "Student not found" };

        if (student.classroomId) {
            const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, student.classroomId);
            if (!hasAccess) return { success: false, error: "Permission denied for this student's class." };
        } else if (currentUser.role === 'STAFF') {
            return { success: false, error: "Student has no class assigned." };
        }

        const fee = await prisma.fee.create({
            data: {
                studentId,
                title,
                amount,
                dueDate: new Date(dueDate),
                status: "PENDING",
                description
            }
        });
        return { success: true, data: fee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentFeesAction(studentId: string) {
    try {
        // PERMISSION CHECK
        const userRes = await getCurrentUserAction();
        if (userRes.success && userRes.data) {
            const currentUser = userRes.data;
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                select: { classroomId: true }
            });

            if (student && student.classroomId) {
                const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, student.classroomId);
                if (!hasAccess) return { success: true, data: [] }; // Hide
            }
        }

        const fees = await prisma.fee.findMany({
            where: { studentId },
            include: { payments: true },
            orderBy: { dueDate: 'asc' }
        });
        return { success: true, data: fees };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function recordPaymentAction(feeId: string, amount: number, method: string, reference?: string) {
    try {
        // PERMISSION CHECK
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) return { success: false, error: "Unauthorized" };
        const currentUser = userRes.data;

        // Trace fee -> student -> classroom
        const feeRecord = await prisma.fee.findUnique({
            where: { id: feeId },
            include: { student: { select: { classroomId: true } } }
        });

        if (!feeRecord) return { success: false, error: "Fee not found" };

        if (feeRecord.student?.classroomId) {
            const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, feeRecord.student.classroomId);
            if (!hasAccess) return { success: false, error: "Permission denied." };
        }

        // 1. Record payment
        const payment = await prisma.feePayment.create({
            data: {
                feeId,
                amount,
                method,
                reference
            }
        });

        // 2. Update fee status
        const fee = await prisma.fee.findUnique({
            where: { id: feeId },
            include: { payments: true }
        });

        if (fee) {
            const totalPaid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
            let newStatus = fee.status;
            if (totalPaid >= fee.amount) {
                newStatus = "PAID";
            } else if (totalPaid > 0) {
                newStatus = "PARTIAL";
            }

            if (newStatus !== fee.status) {
                await prisma.fee.update({
                    where: { id: feeId },
                    data: { status: newStatus }
                });
            }
        }

        return { success: true, data: payment };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getFeeStructuresAction(schoolSlug: string) {
    try {
        const structures = await prisma.feeStructure.findMany({
            where: {
                school: { slug: schoolSlug }
            },
            include: {
                components: true
            }
        });
        return { success: true, data: structures };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateFeeAction(id: string, data: any) {
    try {
        const fee = await prisma.fee.update({
            where: { id },
            data: {
                title: data.title,
                amount: data.amount,
                dueDate: new Date(data.dueDate),
                description: data.description
            }
        });
        return { success: true, data: fee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFeeAction(id: string) {
    try {
        // Delete payments first
        await prisma.feePayment.deleteMany({
            where: { feeId: id }
        });
        await prisma.fee.delete({
            where: { id }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
