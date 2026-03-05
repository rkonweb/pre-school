"use server";

import { prisma } from "@/lib/prisma";

export async function getParentDiaryAction(
    studentId: string,
    parentPhone: string,
    filters?: { date?: string; month?: string; type?: string }
) {
    try {
        // First verify parent has access to this student
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { parentMobile: parentPhone },
                    { fatherPhone: parentPhone },
                    { motherPhone: parentPhone }
                ],
                status: "ACTIVE"
            }
        });

        if (!student) {
            return { success: false, error: "Student not found or access denied" };
        }

        // Build query for DiaryEntry
        const whereClause: any = {
            schoolId: student.schoolId,
            status: "PUBLISHED",
            OR: [
                { classroomId: student.classroomId }, // Targeted to this class
                {
                    recipients: {
                        some: { studentId: student.id }
                    }
                } // Explicitly targeted to this student
            ]
        };

        if (filters?.type) {
            whereClause.type = filters.type;
        }

        if (filters?.date) {
            // date is YYYY-MM-DD
            const startOfDay = new Date(`${filters.date}T00:00:00.000Z`);
            const endOfDay = new Date(`${filters.date}T23:59:59.999Z`);

            whereClause.OR = [
                {
                    scheduledFor: { gte: startOfDay, lte: endOfDay }
                },
                {
                    scheduledFor: null,
                    createdAt: { gte: startOfDay, lte: endOfDay }
                }
            ];

            // Re-apply the visibility OR clause using AND
            const visibilityOr = [
                { classroomId: student.classroomId },
                { recipients: { some: { studentId: student.id } } }
            ];

            whereClause.AND = [{ OR: visibilityOr }];
            delete whereClause.OR; // Replaced by the date OR and the visibility AND

        } else if (filters?.month) {
            // month is YYYY-MM
            const [yearStr, monthStr] = filters.month.split('-');
            const year = parseInt(yearStr);
            const month = parseInt(monthStr);

            const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
            const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

            whereClause.OR = [
                {
                    scheduledFor: { gte: startOfMonth, lte: endOfMonth }
                },
                {
                    scheduledFor: null,
                    createdAt: { gte: startOfMonth, lte: endOfMonth }
                }
            ];

            // Re-apply the visibility OR clause using AND
            const visibilityOr = [
                { classroomId: student.classroomId },
                { recipients: { some: { studentId: student.id } } }
            ];

            whereClause.AND = [{ OR: visibilityOr }];
            delete whereClause.OR;
        }

        const entries = await prisma.diaryEntry.findMany({
            where: whereClause,
            orderBy: [
                { scheduledFor: 'desc' },
                { createdAt: 'desc' }
            ],
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        role: true
                    }
                },
                classroom: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return {
            success: true,
            data: entries
        };
    } catch (error: any) {
        console.error("getParentDiaryAction Error:", error);
        return { success: false, error: "Failed to fetch diary entries" };
    }
}
