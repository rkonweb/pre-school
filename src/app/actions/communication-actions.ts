"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";

export async function sendBulkMessageAction(schoolSlug: string, audience: "EVERYONE" | string, title: string, message: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        // Ensure we find the school
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        let pushSubscriptions: any[] = [];
        let createdNotificationsCount = 0;

        if (audience === "EVERYONE") {
            // Find ALL active users in the school (Parents, Students, Staff)
            const users = await prisma.user.findMany({
                where: { schoolId: school.id, status: "ACTIVE" }
            });

            // In a real production system, this would be highly optimized or sent to a background worker
            // For now, chunk the notifications
            const notificationsToCreate = users.map(user => ({
                userId: user.id,
                title,
                message,
                type: 'SYSTEM',
                schoolId: school.id
            }));

            // Bulk create
            if (notificationsToCreate.length > 0) {
                await prisma.notification.createMany({
                    data: notificationsToCreate
                });
                createdNotificationsCount = notificationsToCreate.length;
            }
        } else {
            // Assume audience is a classroom ID
            const studentsInClass = await prisma.student.findMany({
                where: { classroomId: audience, schoolId: school.id },
                include: { parent: true }
            });

            const targetUsers = new Set<string>();
            studentsInClass.forEach(s => {
                targetUsers.add(s.userId); // The student
                if (s.parent) {
                    targetUsers.add(s.parent.id); // The parent
                }
            });

            const notificationsToCreate = Array.from(targetUsers).map(userId => ({
                userId,
                title,
                message,
                type: 'SYSTEM',
                schoolId: school.id
            }));

            if (notificationsToCreate.length > 0) {
                await prisma.notification.createMany({
                    data: notificationsToCreate
                });
                createdNotificationsCount = notificationsToCreate.length;
            }
        }

        return { success: true, count: createdNotificationsCount };

    } catch (error: any) {
        console.error("Bulk Send Error:", error);
        return { success: false, error: error.message };
    }
}

export async function triggerFeeRemindersAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        // Find UNPAID or PARTIAL fees due within the next 3 days
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const soonDueFees = await prisma.fee.findMany({
            where: {
                student: { schoolId: school.id },
                status: { in: ['UNPAID', 'PARTIAL'] },
                dueDate: {
                    lte: threeDaysFromNow,
                    gte: new Date() // Don't send for already deeply overdue in this specific job, keep it tight for upcoming
                }
            },
            include: {
                student: {
                    include: {
                        parent: true
                    }
                }
            }
        });

        let generated = 0;
        const processedParents = new Set<string>(); // Keep track so we don't spam a parent with multiple kids

        for (const fee of soonDueFees as any[]) {
            const parent = fee.student?.parent;
            if (parent && !processedParents.has(parent.id)) {
                await prisma.notification.create({
                    data: {
                        userId: parent.id,
                        schoolId: school.id,
                        title: "Fee Reminder",
                        message: `Friendly reminder: A fee of ${fee.amount} for ${fee.student.firstName} is due on ${fee.dueDate.toISOString().split('T')[0]}.`,
                        type: "SYSTEM"
                    }
                });
                processedParents.add(parent.id);
                generated++;
            }
        }

        return { success: true, count: generated };

    } catch (error: any) {
        console.error("Fee Reminder Trigger Error:", error);
        return { success: false, error: error.message };
    }
}
