"use server";

import { prisma } from "@/lib/prisma";
import { sendNotificationToGroup } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

// ─── Helper: Get schoolId from parent phone ──────────────────────────────────
async function getSchoolIdForParent(phone: string): Promise<string | null> {
    const student = await prisma.student.findFirst({
        where: {
            status: "ACTIVE",
            OR: [
                { parentMobile: phone },
                { fatherPhone: phone },
                { motherPhone: phone },
            ],
        },
        select: { schoolId: true },
    });
    return student?.schoolId ?? null;
}

// Helper to get parent user IDs for a school and optional classes
async function getParentUserIds(schoolId: string, classIds?: string[]): Promise<string[]> {
    const students = await prisma.student.findMany({
        where: {
            schoolId,
            status: "ACTIVE",
            ...(classIds && classIds.length > 0 && !classIds.includes("all") ? { classroomId: { in: classIds } } : {}),
        },
        select: { parentMobile: true, fatherPhone: true, motherPhone: true },
    });

    const phones = new Set<string>();
    students.forEach(s => {
        if (s.parentMobile) phones.add(s.parentMobile.replace(/\D/g, "").slice(-10));
        if (s.fatherPhone) phones.add(s.fatherPhone.replace(/\D/g, "").slice(-10));
        if (s.motherPhone) phones.add(s.motherPhone.replace(/\D/g, "").slice(-10));
    });

    if (phones.size === 0) return [];

    const users = await prisma.user.findMany({
        where: {
            role: "PARENT",
            OR: Array.from(phones).map(p => ({ mobile: { contains: p } })),
        },
        select: { id: true },
    });

    return users.map(u => u.id);
}

// ─── School Events ───────────────────────────────────────────────────────────
export async function getParentEventsAction(phone: string, month?: number, year?: number) {
    try {
        const schoolId = await getSchoolIdForParent(phone);
        if (!schoolId) return { success: false, error: "No school found for this number" };

        const now = new Date();
        const targetMonth = month ?? now.getMonth() + 1;
        const targetYear = year ?? now.getFullYear();

        const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        // Fetch events for the month + upcoming events in next 60 days
        const events = await prisma.schoolEvent.findMany({
            where: {
                schoolId,
                isPublic: true,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
            orderBy: { date: 'asc' },
        });

        // Also fetch upcoming events for the next 2 months (calendar preview)
        const upcoming = await prisma.schoolEvent.findMany({
            where: {
                schoolId,
                isPublic: true,
                date: { gte: new Date(), lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
            },
            orderBy: { date: 'asc' },
            take: 10,
        });

        return {
            success: true,
            data: JSON.parse(JSON.stringify({
                events,
                upcoming,
                month: targetMonth,
                year: targetYear,
            }))
        };
    } catch (error: any) {
        console.error("getParentEventsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function getAdminEventsBySlugAction(slug: string, month: number, year: number) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const events = await prisma.schoolEvent.findMany({
            where: { schoolId: school.id, date: { gte: startOfMonth, lte: endOfMonth } },
            orderBy: { date: "asc" },
        });

        const upcoming = await prisma.schoolEvent.findMany({
            where: { schoolId: school.id, date: { gte: new Date() } },
            orderBy: { date: "asc" },
            take: 5,
        });

        return { success: true, events: JSON.parse(JSON.stringify(events)), upcoming: JSON.parse(JSON.stringify(upcoming)) };
    } catch (error: any) {
        console.error("getAdminEventsBySlugAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function createAdminEventBySlugAction(
    slug: string,
    data: {
        title: string;
        description?: string;
        date: string;
        endDate?: string;
        type: string;
        venue?: string;
        color?: string;
        classIds?: string[];
    }
) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        const res = await createSchoolEventAction(school.id, {
            ...data,
            isPublic: true,
            classIds: data.classIds && data.classIds.length > 0 ? data.classIds : ["all"],
        });

        if (res.success) {
            revalidatePath(`/s/${slug}/(dashboard)/events`);
            revalidatePath(`/s/${slug}/events`);
        }

        return res;
    } catch (error: any) {
        console.error("createAdminEventBySlugAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function deleteAdminEventAction(eventId: string, slug: string) {
    try {
        await prisma.schoolEvent.delete({
            where: { id: eventId },
        });

        revalidatePath(`/s/${slug}/(dashboard)/events`);
        revalidatePath(`/s/${slug}/events`);

        return { success: true };
    } catch (error: any) {
        console.error("deleteAdminEventAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}


// ─── Emergency Alerts ────────────────────────────────────────────────────────
export async function getEmergencyAlertsAction(phone: string) {
    try {
        const schoolId = await getSchoolIdForParent(phone);
        if (!schoolId) return { success: false, error: "No school found for this number" };

        const now = new Date();

        const [activeAlerts, recentAlerts] = await Promise.all([
            // Currently active alerts
            prisma.emergencyAlert.findMany({
                where: {
                    schoolId,
                    isActive: true,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gte: now } }
                    ],
                },
                orderBy: [{ priority: 'desc' }, { sentAt: 'desc' }],
            }),
            // Recent alerts (last 30 days) including resolved
            prisma.emergencyAlert.findMany({
                where: {
                    schoolId,
                    sentAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                },
                orderBy: { sentAt: 'desc' },
                take: 20,
            }),
        ]);

        return {
            success: true,
            data: {
                activeAlerts,
                recentAlerts,
                hasActiveAlerts: activeAlerts.length > 0,
            }
        };
    } catch (error: any) {
        console.error("getEmergencyAlertsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── Admin: Create Emergency Alert ───────────────────────────────────────────
export async function createEmergencyAlertAction(
    schoolId: string,
    data: {
        title: string;
        message: string;
        type: string;
        priority?: string;
        expiresAt?: string;
    }
) {
    try {
        const alert = await prisma.emergencyAlert.create({
            data: {
                schoolId,
                title: data.title,
                message: data.message,
                type: data.type,
                priority: data.priority || "HIGH",
                isActive: true,
                sentAt: new Date(),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
        });

        // TRIGGER PUSH
        const parentIds = await getParentUserIds(schoolId);
        if (parentIds.length > 0) {
            await sendNotificationToGroup(
                parentIds,
                `🚨 ${data.title}`,
                data.message,
                { type: 'EMERGENCY_ALERT', alertId: alert.id },
                "high"
            );
        }

        return { success: true, data: JSON.parse(JSON.stringify(alert)) };
    } catch (error: any) {
        console.error("createEmergencyAlertAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── Parent Requests ─────────────────────────────────────────────────────────
export async function submitParentRequestAction(
    phone: string,
    studentId: string,
    data: { type: string; description: string }
) {
    try {
        // Validate parent access to student
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { parentMobile: phone },
                    { fatherPhone: phone },
                    { motherPhone: phone },
                ],
            },
            select: { id: true, schoolId: true },
        });

        if (!student) return { success: false, error: "Unauthorized or student not found" };

        const request = await prisma.parentRequest.create({
            data: {
                schoolId: student.schoolId,
                studentId,
                parentMobile: phone,
                type: data.type,
                description: data.description,
                status: "PENDING",
            },
        });

        return { success: true, data: JSON.parse(JSON.stringify(request)) };
    } catch (error: any) {
        console.error("submitParentRequestAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function getParentRequestsAction(phone: string, studentId?: string) {
    try {
        const where: any = { parentMobile: phone };
        if (studentId) where.studentId = studentId;

        const requests = await prisma.parentRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 30,
            include: {
                student: { select: { firstName: true, lastName: true } },
            }
        });

        return { success: true, data: JSON.parse(JSON.stringify(requests)) };
    } catch (error: any) {
        console.error("getParentRequestsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── School Circulars ────────────────────────────────────────────────────────
export async function getParentCircularsAction(phone: string) {
    try {
        const schoolId = await getSchoolIdForParent(phone);
        if (!schoolId) return { success: false, error: "No school found for this number" };

        const circulars = await prisma.schoolCircular.findMany({
            where: {
                schoolId,
                isPublished: true,
            },
            orderBy: { publishedAt: 'desc' },
            take: 30,
            select: {
                id: true,
                title: true,
                content: true,
                fileUrl: true,
                type: true,
                publishedAt: true,
                targetClassIds: true,
            }
        });

        return { success: true, data: JSON.parse(JSON.stringify(circulars)) };
    } catch (error: any) {
        console.error("getParentCircularsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── Admin: Create School Event ───────────────────────────────────────────────
export async function createSchoolEventAction(
    schoolId: string,
    data: {
        title: string;
        description?: string;
        date: string;
        endDate?: string;
        type: string;
        classIds?: string[];
        color?: string;
        venue?: string;
        isPublic?: boolean;
    }
) {
    try {
        const event = await prisma.schoolEvent.create({
            data: {
                schoolId,
                title: data.title,
                description: data.description,
                date: new Date(data.date),
                endDate: data.endDate ? new Date(data.endDate) : null,
                type: data.type,
                classIds: JSON.stringify(data.classIds || ["all"]),
                color: data.color || "#2563EB",
                venue: data.venue,
                isPublic: data.isPublic ?? true,
            },
        });

        // TRIGGER PUSH
        const classIds = data.classIds || ["all"];
        const parentIds = await getParentUserIds(schoolId, classIds.includes("all") ? undefined : classIds);
        if (parentIds.length > 0) {
            await sendNotificationToGroup(
                parentIds,
                `📅 New Event: ${data.title}`,
                data.description || "A new event has been scheduled. Check the calendar for details.",
                { type: 'EVENT', eventId: event.id }
            );
        }

        return { success: true, data: JSON.parse(JSON.stringify(event)) };
    } catch (error: any) {
        console.error("createSchoolEventAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── Admin: Publish Circular ──────────────────────────────────────────────────
export async function publishCircularAction(
    schoolId: string,
    data: {
        title: string;
        content?: string;
        fileUrl?: string;
        type: string;
        targetClassIds?: string[];
    }
) {
    try {
        const circular = await prisma.schoolCircular.create({
            data: {
                schoolId,
                title: data.title,
                content: data.content,
                fileUrl: data.fileUrl,
                type: data.type,
                targetClassIds: JSON.stringify(data.targetClassIds || ["all"]),
                isPublished: true,
                publishedAt: new Date(),
            },
        });

        // TRIGGER PUSH
        const targetClassIds = data.targetClassIds || ["all"];
        const parentIds = await getParentUserIds(schoolId, targetClassIds.includes("all") ? undefined : targetClassIds);
        if (parentIds.length > 0) {
            await sendNotificationToGroup(
                parentIds,
                `📄 New Circular: ${data.title}`,
                "A new school circular has been published. Read more in the app.",
                { type: 'CIRCULAR', circularId: circular.id }
            );
        }

        return { success: true, data: JSON.parse(JSON.stringify(circular)) };
    } catch (error: any) {
        console.error("publishCircularAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function publishAdminCircularBySlugAction(
    slug: string,
    data: {
        title: string;
        content?: string;
        fileUrl?: string;
        type: string;
        targetClassIds?: string[];
    }
) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        const res = await publishCircularAction(school.id, data);

        if (res.success) {
            revalidatePath(`/s/${slug}/(dashboard)/circulars`);
            revalidatePath(`/s/${slug}/circulars`);
        }

        return res;
    } catch (error: any) {
        console.error("publishAdminCircularBySlugAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function getAdminCircularsBySlugAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        const circulars = await prisma.schoolCircular.findMany({
            where: { schoolId: school.id },
            orderBy: { createdAt: "desc" },
            take: 30,
        });

        return { success: true, data: JSON.parse(JSON.stringify(circulars)) };
    } catch (error: any) {
        console.error("getAdminCircularsBySlugAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function deleteCircularAction(circularId: string, slug: string) {
    try {
        await prisma.schoolCircular.delete({
            where: { id: circularId },
        });

        revalidatePath(`/s/${slug}/(dashboard)/circulars`);
        revalidatePath(`/s/${slug}/circulars`);

        return { success: true };
    } catch (error: any) {
        console.error("deleteCircularAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function toggleCircularPublishAction(circularId: string, currentStatus: boolean, slug: string) {
    try {
        await prisma.schoolCircular.update({
            where: { id: circularId },
            data: {
                isPublished: !currentStatus,
                publishedAt: !currentStatus ? new Date() : null,
            },
        });

        revalidatePath(`/s/${slug}/(dashboard)/circulars`);
        revalidatePath(`/s/${slug}/circulars`);

        return { success: true };
    } catch (error: any) {
        console.error("toggleCircularPublishAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

// ─── Admin: Emergency Alerts ──────────────────────────────────────────────────

export async function getAdminEmergencyAlertsAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });
        if (!school) return { success: false, error: "School not found" };

        const alerts = await prisma.emergencyAlert.findMany({
            where: { schoolId: school.id },
            orderBy: { sentAt: "desc" },
            take: 50,
        });

        return { success: true, data: JSON.parse(JSON.stringify(alerts)) };
    } catch (error: any) {
        console.error("getAdminEmergencyAlertsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function createAdminEmergencyAlertAction(
    schoolSlug: string,
    data: {
        title: string;
        message: string;
        type: string;
        priority: string;
        targetClassIds?: string[];
        expiresAt?: string;
    }
) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });
        if (!school) return { success: false, error: "School not found" };

        const alert = await prisma.emergencyAlert.create({
            data: {
                schoolId: school.id,
                title: data.title,
                message: data.message,
                type: data.type,
                priority: data.priority,
                isActive: true,
                sentAt: new Date(),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
        });

        // trigger push notification
        const parentIds = await getParentUserIds(school.id);
        if (parentIds.length > 0) {
            await sendNotificationToGroup(
                parentIds,
                `🚨 ${data.title}`,
                data.message,
                { type: "EMERGENCY_ALERT", alertId: alert.id },
                data.priority === "CRITICAL" ? "high" : "normal"
            );
        }

        revalidatePath(`/s/${schoolSlug}/emergency`);
        return { success: true, data: JSON.parse(JSON.stringify(alert)) };
    } catch (error: any) {
        console.error("createAdminEmergencyAlertAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function deactivateEmergencyAlertAction(alertId: string, schoolSlug: string) {
    try {
        await prisma.emergencyAlert.update({
            where: { id: alertId },
            data: { isActive: false },
        });
        revalidatePath(`/s/${schoolSlug}/emergency`);
        return { success: true };
    } catch (error: any) {
        console.error("deactivateEmergencyAlertAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function deleteEmergencyAlertAction(alertId: string, schoolSlug: string) {
    try {
        await prisma.emergencyAlert.delete({
            where: { id: alertId },
        });
        revalidatePath(`/s/${schoolSlug}/emergency`);
        return { success: true };
    } catch (error: any) {
        console.error("deleteEmergencyAlertAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}
