"use server";

import { prisma } from "@/lib/prisma";

export async function getFeeDetailsForInvoiceAction(slug: string, feeId: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true, name: true, logo: true, address: true, phone: true, email: true, currency: true }
        });

        if (!school) return { success: false, error: "School not found" };

        const fee = await prisma.fee.findUnique({
            where: { id: feeId },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        admissionNumber: true,
                        grade: true,
                        classroom: { select: { name: true } }
                    }
                },
                payments: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                academicYear: {
                    select: { name: true }
                }
            }
        });

        if (!fee) return { success: false, error: "Fee record not found" };

        // Ensure this fee belongs to a student in this school
        const studentSchool = await prisma.student.findUnique({
            where: { id: fee.studentId },
            select: { schoolId: true }
        });

        if (studentSchool?.schoolId !== school.id) {
            return { success: false, error: "Unauthorized access to fee record." };
        }

        return {
            success: true,
            data: {
                fee,
                student: fee.student,
                school
            }
        };

    } catch (error: any) {
        console.error("Error fetching invoice details:", error);
        return { success: false, error: "Failed to load invoice details" };
    }
}
