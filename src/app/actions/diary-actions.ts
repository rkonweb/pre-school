"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserAction } from "./session-actions";
import { getEnforcedScope, verifyClassAccess } from "@/lib/access-control";

// ... existing code ...

export async function createDiaryEntryAction(data: {
    schoolSlug: string;
    title: string;
    content: string;
    type: string;
    scheduledFor?: string;
    attachments?: string[];
    classroomId?: string;
    recipientType: "STUDENT" | "GROUP" | "CLASS";
    studentIds?: string[];
    priority?: string;
    requiresAck?: boolean;
    academicYearId?: string;
}) {
    try {
        // Get current user from session
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) {
            return { success: false, error: "Not authenticated. Please log in." };
        }

        const currentUser = userRes.data;

        // PERMISSION CHECK
        if (data.classroomId) {
            const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, data.classroomId);
            if (!hasAccess) {
                return { success: false, error: "You do not have permission to post to this class." };
            }
        }

        // Get school ID from slug
        const school = await prisma.school.findUnique({
            where: { slug: data.schoolSlug },
            select: { id: true }
        });

        if (!school) {
            return { success: false, error: "School not found" };
        }

        // Verify user belongs to this school
        if (currentUser.schoolId !== school.id) {
            return { success: false, error: "Unauthorized access" };
        }

        // Determine status based on scheduling
        let status = "PUBLISHED";
        let publishedAt = new Date();

        if (data.scheduledFor) {
            const scheduledDate = new Date(data.scheduledFor);
            if (scheduledDate > new Date()) {
                status = "SCHEDULED";
                publishedAt = null as any;
            }
        }

        // Create diary entry
        const entry = await prisma.diaryEntry.create({
            data: {
                title: data.title,
                content: data.content,
                type: data.type,
                scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
                publishedAt,
                status,
                attachments: data.attachments ? JSON.stringify(data.attachments) : null,
                priority: data.priority || "NORMAL",
                requiresAck: data.requiresAck || false,
                schoolId: school.id,
                authorId: currentUser.id,
                classroomId: data.classroomId || null,
                academicYearId: data.academicYearId || null,
            }
        });

        // Create recipients
        if (data.recipientType === "CLASS" && data.classroomId) {
            // Get all students in the class
            const students = await prisma.student.findMany({
                where: { classroomId: data.classroomId },
                select: { id: true }
            });

            // Create recipients one by one (workaround for Prisma Client not regenerated)
            await Promise.all(
                students.map(student =>
                    prisma.diaryRecipient.create({
                        data: {
                            entryId: entry.id,
                            recipientType: "STUDENT",
                            studentId: student.id
                        }
                    })
                )
            );
        } else if (data.recipientType === "STUDENT" && data.studentIds) {
            // Individual students
            await Promise.all(
                data.studentIds.map(studentId =>
                    prisma.diaryRecipient.create({
                        data: {
                            entryId: entry.id,
                            recipientType: "STUDENT",
                            studentId
                        }
                    })
                )
            );
        }

        revalidatePath(`/s/${data.schoolSlug}/diary`);
        return { success: true, data: entry };
    } catch (error: any) {
        console.error("Create Diary Entry Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// GET DIARY ENTRIES (Teacher View)
// ============================================

export async function getDiaryEntriesAction(schoolSlug: string, filters?: {
    classroomId?: string;
    type?: string;
    status?: string;
    month?: string; // YYYY-MM format
    academicYearId?: string;
}) {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) {
            return { success: false, error: "Unauthorized" };
        }
        const currentUser = userRes.data;

        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });

        if (!school) {
            return { success: false, error: "School not found" };
        }

        const where: any = {
            schoolId: school.id
        };

        if (filters?.academicYearId) {
            where.academicYearId = filters.academicYearId;
        }

        // ACCESS CONTROL
        const scope = await getEnforcedScope(currentUser.id, currentUser.role);
        if (scope.restriction) {
            if (filters?.classroomId) {
                if (!scope.allowedIds.includes(filters.classroomId)) {
                    return { success: true, data: [] };
                }
                where.classroomId = filters.classroomId;
            } else {
                if (scope.allowedIds.length > 0) {
                    where.classroomId = { in: scope.allowedIds };
                } else {
                    return { success: true, data: [] };
                }
            }
        } else {
            // No restriction, honor filters if present
            if (filters?.classroomId) {
                where.classroomId = filters.classroomId;
            }
        }

        if (filters?.type) {
            where.type = filters.type;
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.month) {
            const [year, month] = filters.month.split("-");
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

            where.OR = [
                {
                    scheduledFor: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                {
                    publishedAt: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            ];
        }

        const entries = await prisma.diaryEntry.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                classroom: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                recipients: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        recipients: true
                    }
                }
            },
            orderBy: [
                { scheduledFor: "desc" },
                { createdAt: "desc" }
            ]
        });

        return { success: true, data: entries };
    } catch (error: any) {
        console.error("Get Diary Entries Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// GET DIARY ENTRIES FOR PARENT (Student-specific)
// ============================================

import { verifyParentAccess } from "@/lib/access-control";

export async function getDiaryEntriesForStudentAction(studentId: string, academicYearId?: string) {
    try {
        // PERMISSION CHECK
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) return { success: false, error: "Unauthorized" };
        const currentUser = userRes.data;

        if (currentUser.role === "PARENT") {
            const hasAccess = await verifyParentAccess(currentUser.mobile, studentId);
            if (!hasAccess) return { success: false, error: "Access denied" };
        } else if (currentUser.role === "STAFF") {
            const student = await prisma.student.findUnique({ where: { id: studentId }, select: { classroomId: true } });
            if (student?.classroomId) {
                const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, student.classroomId);
                if (!hasAccess) return { success: false, error: "Access denied" };
            }
        }

        const query: any = {
            studentId,
            entry: {
                status: "PUBLISHED"
            }
        };

        if (academicYearId) {
            query.entry.academicYearId = academicYearId;
        }

        const recipients = await prisma.diaryRecipient.findMany({
            where: query,
            include: {
                entry: {
                    include: {
                        author: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        },
                        classroom: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                entry: {
                    publishedAt: "desc"
                }
            }
        });

        return { success: true, data: recipients };
    } catch (error: any) {
        console.error("Get Student Diary Entries Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// UPDATE DIARY ENTRY
// ============================================

export async function updateDiaryEntryAction(id: string, data: {
    title?: string;
    content?: string;
    type?: string;
    scheduledFor?: string;
    attachments?: string[];
    priority?: string;
    requiresAck?: boolean;
    status?: string;
}) {
    try {
        const updateData: any = {};

        if (data.title) updateData.title = data.title;
        if (data.content) updateData.content = data.content;
        if (data.type) updateData.type = data.type;
        if (data.scheduledFor !== undefined) {
            updateData.scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;
        }
        if (data.attachments) updateData.attachments = JSON.stringify(data.attachments);
        if (data.priority) updateData.priority = data.priority;
        if (data.requiresAck !== undefined) updateData.requiresAck = data.requiresAck;
        if (data.status) updateData.status = data.status;

        const entry = await prisma.diaryEntry.update({
            where: { id },
            data: updateData,
            include: {
                school: {
                    select: { slug: true }
                }
            }
        });

        if (entry.school?.slug) {
            revalidatePath(`/s/${entry.school.slug}/diary`);
        }

        return { success: true, data: entry };
    } catch (error: any) {
        console.error("Update Diary Entry Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// DELETE DIARY ENTRY
// ============================================

export async function deleteDiaryEntryAction(id: string) {
    try {
        const entry = await prisma.diaryEntry.findUnique({
            where: { id },
            include: {
                school: {
                    select: { slug: true }
                }
            }
        });

        if (!entry) {
            return { success: false, error: "Entry not found" };
        }

        await prisma.diaryEntry.delete({
            where: { id }
        });

        if (entry.school?.slug) {
            revalidatePath(`/s/${entry.school.slug}/diary`);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Delete Diary Entry Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// MARK AS READ
// ============================================

export async function markDiaryAsReadAction(recipientId: string) {
    try {
        await prisma.diaryRecipient.update({
            where: { id: recipientId },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Mark Diary as Read Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// ACKNOWLEDGE DIARY ENTRY
// ============================================

export async function acknowledgeDiaryEntryAction(recipientId: string, acknowledgedBy: string) {
    try {
        await prisma.diaryRecipient.update({
            where: { id: recipientId },
            data: {
                isAcknowledged: true,
                acknowledgedAt: new Date(),
                acknowledgedBy
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Acknowledge Diary Entry Error:", error);
        return { success: false, error: error.message };
    }
}
