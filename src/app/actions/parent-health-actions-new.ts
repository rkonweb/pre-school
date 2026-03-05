"use server";

import { prisma } from "@/lib/prisma";

export async function getChildHealthAction(studentId: string, phone: string) {
    try {
        // Validate parent access
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { parentMobile: phone },
                    { fatherPhone: phone },
                    { motherPhone: phone },
                ],
            },
            select: {
                id: true,
                firstName: true,
                bloodGroup: true,
                allergies: true,
                medicalConditions: true,
                emergencyContactName: true,
                emergencyContactPhone: true,
            }
        });

        if (!student) {
            return { success: false, error: "Unauthorized or student not found" };
        }

        // Fetch health records
        const healthRecords = await prisma.studentHealthRecord.findMany({
            where: { studentId },
            orderBy: { recordedAt: 'desc' },
            take: 10,
            select: {
                id: true,
                height: true,
                weight: true,
                bmi: true,
                visionLeft: true,
                visionRight: true,
                hearingLeft: true,
                hearingRight: true,
                dentalStatus: true,
                generalHealth: true,
                bloodPressure: true,
                pulseRate: true,
                recordedAt: true,
            }
        });

        return {
            success: true,
            data: {
                // Basic medical info from student profile
                bloodGroup: student.bloodGroup,
                allergies: student.allergies,
                medicalConditions: student.medicalConditions,
                emergencyContact: {
                    name: student.emergencyContactName,
                    phone: student.emergencyContactPhone,
                },
                // Clinic / nurse records
                healthRecords,
            }
        };
    } catch (error: any) {
        console.error("getChildHealthAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}
