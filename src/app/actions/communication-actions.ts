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
                userType: user.role,
                title,
                message,
                type: 'SYSTEM'
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
                where: { classroomId: audience, schoolId: school.id }
            });

            const targetUsers = new Set<string>();
            const phonesToSearch = new Set<string>();

            // Collect student user IDs (if applicable) and parent phones
            studentsInClass.forEach(s => {
                if (s.parentMobile) {
                    const cleanPhone = String(s.parentMobile).replace(/\D/g, "");
                    if (cleanPhone.length >= 5) {
                        phonesToSearch.add(cleanPhone.slice(-5));
                    }
                }
                if (s.emergencyContactPhone) {
                    const cleanPhone = String(s.emergencyContactPhone).replace(/\D/g, "");
                    if (cleanPhone.length >= 5) {
                        phonesToSearch.add(cleanPhone.slice(-5));
                    }
                }
            });

            // Find valid parent users based on collected phones
            if (phonesToSearch.size > 0) {
                const parentUsers = await prisma.user.findMany({
                    where: {
                        role: "PARENT",
                        OR: Array.from(phonesToSearch).map(p => ({ mobile: { contains: p } }))
                    }
                });
                parentUsers.forEach(pu => targetUsers.add(pu.id));
            }

            const notificationsToCreate = Array.from(targetUsers).map(userId => ({
                userId,
                userType: "PARENT",
                title,
                message,
                type: 'SYSTEM'
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
                student: true
            }
        });

        let generated = 0;
        const processedParents = new Set<string>(); // Keep track so we don't spam a parent with multiple kids

        for (const fee of soonDueFees as any[]) {
            const student = fee.student;
            if (!student) continue;

            const phones = [student.parentMobile, student.emergencyContactPhone]
                .filter(Boolean)
                .map(p => String(p).replace(/\D/g, ""))
                .filter(p => p.length >= 5)
                .map(p => p.slice(-5));

            if (phones.length === 0) continue;

            const parents = await prisma.user.findMany({
                where: {
                    role: "PARENT",
                    OR: phones.map(p => ({ mobile: { contains: p } }))
                }
            });

            for (const parent of parents) {
                if (!processedParents.has(parent.id)) {
                    await prisma.notification.create({
                        data: {
                            userId: parent.id,
                            userType: "PARENT",
                            title: "Fee Reminder",
                            message: `Friendly reminder: A fee of ${fee.amount} for ${student.firstName} is due on ${fee.dueDate.toISOString().split('T')[0]}.`,
                            type: "SYSTEM"
                        }
                    });
                    processedParents.add(parent.id);
                    generated++;
                }
            }
        }

        return { success: true, count: generated };

    } catch (error: any) {
        console.error("Fee Reminder Trigger Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches all conversations across the school for admin monitoring.
 * Includes messages with moderation details.
 */
export async function getChatHistoryAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug }
        });

        if (!school) return { success: false, error: "School not found" };

        const conversations = await prisma.conversation.findMany({
            where: {
                student: { schoolId: school.id }
            },
            include: {
                student: {
                    select: { id: true, firstName: true, lastName: true, admissionNumber: true, parentMobile: true }
                },
                messages: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        content: true,
                        senderType: true,
                        senderName: true,
                        deliveryStatus: true,
                        isFlagged: true,
                        flaggedReason: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { lastMessageAt: "desc" }
        });

        // Parse/stringify to strip complex Date objects which can cause "unexpected response" Next.js runtime errors
        const serialized = JSON.parse(JSON.stringify(conversations));

        return { success: true, data: serialized };
    } catch (error: any) {
        console.error("Chat History Error:", error);
        return { success: false, error: error.message };
    }
}
/**
 * Fetches all PENDING broadcasts for a school to show in admin approval queue.
 */
export async function getPendingBroadcastsAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const broadcasts = await prisma.broadcast.findMany({
            where: {
                schoolId: school.id,
                status: "PENDING"
            },
            include: {
                author: {
                    select: { firstName: true, lastName: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, broadcasts };
    } catch (error: any) {
        console.error("getPendingBroadcastsAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Admin action to approve or reject a broadcast.
 */
export async function updateBroadcastStatusAction(schoolSlug: string, broadcastId: string, status: "APPROVED" | "REJECTED") {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        if (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Unauthorized. Admin permissions required." };
        }

        const broadcast = await prisma.broadcast.update({
            where: { id: broadcastId },
            data: {
                status,
                approvedById: auth.user.id,
                approvedAt: status === "APPROVED" ? new Date() : null
            }
        });

        // Revalidate paths if necessary
        revalidatePath(`/s/${schoolSlug}/communication`);

        return { success: true, broadcast };
    } catch (error: any) {
        console.error("updateBroadcastStatusAction Error:", error);
        return { success: false, error: error.message };
    }
}
