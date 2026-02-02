"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import webpush from "web-push";

// Configure Web Push
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@preschool.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Type definition for Web Push Subscription payload
interface WebPushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

// ============================================
// BROADCAST ACTIONS
// ============================================

export async function getBroadcastHistoryAction(schoolSlug: string) {
    try {
        const broadcasts = await prisma.notificationSchedule.findMany({
            where: {
                type: "ANNOUNCEMENT"
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 20
        });

        return { success: true, data: broadcasts };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendBroadcastAction(schoolSlug: string, payload: {
    title: string;
    message: string;
    targetType: "ALL_PARENTS" | "CLASS" | "TEACHERS" | "STUDENTS";
    targetIds?: string[];
}) {
    try {
        // 1. Create Broadcast Record
        const broadcast = await prisma.notificationSchedule.create({
            data: {
                title: payload.title,
                message: payload.message,
                type: "ANNOUNCEMENT",
                targetGroup: payload.targetType,
                scheduledFor: new Date(), // Immediate
                sendVia: "IN_APP", // Default
                targetUserType: payload.targetType === "TEACHERS" ? "TEACHER" : "PARENT",
                // specific target IDs stored as JSON string in relatedId or we just rely on logs
                relatedType: "BROADCAST_METADATA",
                relatedId: payload.targetIds ? JSON.stringify(payload.targetIds) : null
            }
        });

        // 2. Resolve Recipients
        let recipientUserIds: string[] = [];

        if (payload.targetType === "ALL_PARENTS") {
            // Find all students in school -> get distinct parents
            // Since we don't have direct User-Student link, we rely on Student.parentEmail matching User.email
            // OR find Users with role PARENT
            // Better approach with current schema: Find Students -> Get Parent Emails -> Find Users

            const students = await prisma.student.findMany({
                where: { school: { slug: schoolSlug } },
                select: { parentEmail: true, parentMobile: true }
            });

            const emails = students.map(s => s.parentEmail).filter(Boolean) as string[];
            const mobiles = students.map(s => s.parentMobile).filter(Boolean) as string[];

            const parents = await prisma.user.findMany({
                where: {
                    role: "PARENT",
                    OR: [
                        { email: { in: emails } },
                        { mobile: { in: mobiles } }
                    ]
                },
                select: { id: true }
            });
            recipientUserIds = parents.map(p => p.id);

        } else if (payload.targetType === "CLASS" && payload.targetIds?.length) {
            // Students in specific classes
            const students = await prisma.student.findMany({
                where: {
                    classroomId: { in: payload.targetIds },
                    school: { slug: schoolSlug }
                },
                select: { parentEmail: true, parentMobile: true }
            });

            const emails = students.map(s => s.parentEmail).filter(Boolean) as string[];
            const mobiles = students.map(s => s.parentMobile).filter(Boolean) as string[];

            const parents = await prisma.user.findMany({
                where: {
                    role: "PARENT",
                    OR: [
                        { email: { in: emails } },
                        { mobile: { in: mobiles } }
                    ]
                },
                select: { id: true }
            });
            recipientUserIds = parents.map(p => p.id);

        } else if (payload.targetType === "STUDENTS" && payload.targetIds?.length) {
            // Specific Students
            const students = await prisma.student.findMany({
                where: {
                    id: { in: payload.targetIds },
                    school: { slug: schoolSlug }
                },
                select: { parentEmail: true, parentMobile: true }
            });

            const emails = students.map(s => s.parentEmail).filter(Boolean) as string[];
            const mobiles = students.map(s => s.parentMobile).filter(Boolean) as string[];

            const parents = await prisma.user.findMany({
                where: {
                    role: "PARENT",
                    OR: [
                        { email: { in: emails } },
                        { mobile: { in: mobiles } }
                    ]
                },
                select: { id: true }
            });
            recipientUserIds = parents.map(p => p.id);

        } else if (payload.targetType === "TEACHERS") {
            const teachers = await prisma.user.findMany({
                where: {
                    role: { in: ["TEACHER", "STAFF"] },
                    school: { slug: schoolSlug }
                },
                select: { id: true }
            });
            recipientUserIds = teachers.map(t => t.id);
        }

        // 3. Create Notifications
        // Using createMany if supported (SQLite logic check) or Promise.all
        // Prisma createMany is supported in recent versions for SQLite, but safe bet is transaction

        if (recipientUserIds.length > 0) {
            await prisma.$transaction(
                recipientUserIds.map(userId => prisma.notification.create({
                    data: {
                        userId,
                        userType: payload.targetType === "TEACHERS" ? "TEACHER" : "PARENT",
                        title: payload.title,
                        message: payload.message,
                        type: "ANNOUNCEMENT",
                        relatedId: broadcast.id,
                        relatedType: "BROADCAST"
                    }
                }))
            );
        }

        revalidatePath(`/s/${schoolSlug}/communication`);
        return { success: true, count: recipientUserIds.length };

    } catch (error: any) {
        console.error("Broadcast Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// IN-APP NOTIFICATIONS
// ============================================

export async function createNotificationAction(data: {
    userId: string;
    userType: "PARENT" | "TEACHER" | "ADMIN";
    title: string;
    message: string;
    type: "HOMEWORK_REMINDER" | "HOMEWORK_REVIEWED" | "ANNOUNCEMENT" | "ALERT";
    relatedId?: string;
    relatedType?: string;
    actionUrl?: string;
}) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                userType: data.userType,
                title: data.title,
                message: data.message,
                type: data.type,
                relatedId: data.relatedId,
                relatedType: data.relatedType,
                actionUrl: data.actionUrl
            }
        });
        revalidatePath("/notifications");
        return { success: true, data: notification };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getUserNotificationsAction(userId: string, unreadOnly: boolean = false) {
    try {
        const where: any = { userId };
        if (unreadOnly) where.isRead = false;

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return { success: true, data: notifications };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markNotificationReadAction(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() }
        });
        revalidatePath("/notifications");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markAllNotificationsReadAction(userId: string) {
    try {
        // Prisma updateMany
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() }
        });
        revalidatePath("/notifications");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================================
// PUSH NOTIFICATIONS (Legacy / Unchanged mostly)
// ============================================

export async function subscribeToPushAction(data: {
    userId: string;
    userType: "PARENT" | "TEACHER" | "ADMIN";
    subscription: any;
    deviceType?: string;
}) {
    try {
        const keys = JSON.stringify({
            p256dh: data.subscription.keys.p256dh,
            auth: data.subscription.keys.auth,
        });

        // Upsert
        await prisma.pushSubscription.upsert({
            where: { endpoint: data.subscription.endpoint },
            update: {
                userId: data.userId,
                userType: data.userType,
                keys,
                deviceType: data.deviceType,
                updatedAt: new Date()
            },
            create: {
                userId: data.userId,
                userType: data.userType,
                endpoint: data.subscription.endpoint,
                keys,
                deviceType: data.deviceType
            }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// [Duplicate functions removed]

export async function sendPushNotificationAction(data: {
    userId: string;
    title: string;
    message: string;
    actionUrl?: string;
    icon?: string;
}) {
    try {
        // Get user's push subscriptions
        const subscriptions: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM PushSubscription WHERE userId = ? AND isActive = 1`,
            data.userId
        );

        if (subscriptions.length === 0) {
            return { success: false, error: "No active push subscriptions found" };
        }

        const payload = JSON.stringify({
            title: data.title,
            body: data.message,
            icon: data.icon || '/icon-192.png',
            badge: '/badge-72.png',
            data: {
                url: data.actionUrl || '/',
                timestamp: Date.now(),
            },
        });

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: JSON.parse(sub.keys),
                };

                try {
                    await webpush.sendNotification(pushSubscription, payload);

                    // Update last used
                    await prisma.$executeRawUnsafe(
                        `UPDATE PushSubscription SET lastUsed = datetime('now') WHERE id = ?`,
                        sub.id
                    );

                    return { success: true };
                } catch (error: any) {
                    // If subscription is invalid, deactivate it
                    if (error.statusCode === 410) {
                        await prisma.$executeRawUnsafe(
                            `UPDATE PushSubscription SET isActive = 0 WHERE id = ?`,
                            sub.id
                        );
                    }
                    throw error;
                }
            })
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;

        return {
            success: successCount > 0,
            data: { sent: successCount, total: subscriptions.length }
        };
    } catch (error: any) {
        console.error("sendPushNotificationAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// SCHEDULED NOTIFICATIONS
// ============================================

export async function scheduleNotificationAction(data: {
    type: "HOMEWORK_REMINDER" | "DAILY_SUMMARY" | "WEEKLY_REPORT";
    scheduledFor: Date;
    targetUserId?: string;
    targetUserType?: "PARENT" | "TEACHER" | "ADMIN";
    targetGroup?: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
    sendVia?: "PUSH" | "EMAIL" | "SMS" | "ALL";
}) {
    try {
        const id = Math.random().toString(36).substr(2, 9);

        await prisma.$executeRawUnsafe(
            `INSERT INTO NotificationSchedule (
                id, type, scheduledFor, targetUserId, targetUserType, targetGroup,
                title, message, relatedId, relatedType, sendVia, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            id, data.type, data.scheduledFor.toISOString(),
            data.targetUserId || null, data.targetUserType || null, data.targetGroup || null,
            data.title, data.message, data.relatedId || null, data.relatedType || null,
            data.sendVia || 'PUSH'
        );

        return { success: true, data: { id } };
    } catch (error: any) {
        console.error("scheduleNotificationAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function processPendingNotificationsAction() {
    try {
        const now = new Date().toISOString();

        // Get pending notifications that are due
        const pending: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM NotificationSchedule 
             WHERE status = 'PENDING' AND scheduledFor <= ? 
             ORDER BY scheduledFor ASC LIMIT 100`,
            now
        );

        for (const notification of pending) {
            try {
                // Determine recipients
                let recipients: any[] = [];

                if (notification.targetUserId) {
                    recipients = [{
                        id: notification.targetUserId,
                        type: notification.targetUserType
                    }];
                } else if (notification.targetGroup === "ALL_PARENTS") {
                    // Get all parents
                    recipients = await prisma.$queryRawUnsafe(
                        `SELECT DISTINCT id FROM User WHERE role = 'PARENT'`
                    );
                    recipients = recipients.map(r => ({ id: r.id, type: 'PARENT' }));
                }

                // Send notifications
                for (const recipient of recipients) {
                    // Create in-app notification
                    await createNotificationAction({
                        userId: recipient.id,
                        userType: recipient.type,
                        title: notification.title,
                        message: notification.message,
                        type: notification.type as any,
                        relatedId: notification.relatedId,
                        relatedType: notification.relatedType,
                    });

                    // Send push notification if enabled
                    if (notification.sendVia === 'PUSH' || notification.sendVia === 'ALL') {
                        await sendPushNotificationAction({
                            userId: recipient.id,
                            title: notification.title,
                            message: notification.message,
                        });
                    }
                }

                // Mark as sent
                await prisma.$executeRawUnsafe(
                    `UPDATE NotificationSchedule SET 
                        status = 'SENT', sentAt = datetime('now'), updatedAt = datetime('now')
                     WHERE id = ?`,
                    notification.id
                );

            } catch (error: any) {
                // Mark as failed
                await prisma.$executeRawUnsafe(
                    `UPDATE NotificationSchedule SET 
                        status = 'FAILED', failureReason = ?, updatedAt = datetime('now')
                     WHERE id = ?`,
                    error.message, notification.id
                );
            }
        }

        return { success: true, data: { processed: pending.length } };
    } catch (error: any) {
        console.error("processPendingNotificationsAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// HOMEWORK-SPECIFIC REMINDERS
// ============================================

export async function scheduleHomeworkRemindersAction(homeworkId: string) {
    try {
        // Get homework details
        const homework: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM Homework WHERE id = ?`,
            homeworkId
        );

        if (homework.length === 0) {
            return { success: false, error: "Homework not found" };
        }

        const hw = homework[0];

        // Get submissions that haven't been viewed
        const submissions: any[] = await prisma.$queryRawUnsafe(
            `SELECT hs.*, 
                    (SELECT COUNT(*) FROM HomeworkReadReceipt WHERE homeworkId = ? AND studentId = hs.studentId) as viewCount
             FROM HomeworkSubmission hs
             WHERE hs.homeworkId = ?`,
            homeworkId, homeworkId
        );

        const unviewedSubmissions = submissions.filter(s => s.viewCount === 0);

        // Schedule reminder for Saturday evening (6 PM)
        const now = new Date();
        const saturday = new Date(now);
        saturday.setDate(now.getDate() + (6 - now.getDay())); // Next Saturday
        saturday.setHours(18, 0, 0, 0);

        for (const submission of unviewedSubmissions) {
            // Get parent ID (assuming we have this relationship)
            // For now, we'll use studentId as a placeholder
            await scheduleNotificationAction({
                type: "HOMEWORK_REMINDER",
                scheduledFor: saturday,
                targetUserId: submission.studentId, // Should be parent ID
                targetUserType: "PARENT",
                title: "Homework Reminder 📚",
                message: `Don't forget to complete "${hw.title}" for your child!`,
                relatedId: homeworkId,
                relatedType: "HOMEWORK",
                sendVia: "ALL",
            });
        }

        return { success: true, data: { scheduled: unviewedSubmissions.length } };
    } catch (error: any) {
        console.error("scheduleHomeworkRemindersAction Error:", error);
        return { success: false, error: error.message };
    }
}
