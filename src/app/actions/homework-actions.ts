"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getEnforcedScope, verifyClassAccess, verifyParentAccess } from "@/lib/access-control";
import { validateUserSchoolAction } from "./session-actions";

// ... existing code ...

export async function createHomeworkAction(slug: string, data: {
    // ... args ...
    title: string;
    description?: string;
    instructions?: string;
    videoUrl?: string;
    voiceNoteUrl?: string;
    worksheetUrl?: string;
    attachments?: string;
    assignedTo: "CLASS" | "GROUP" | "INDIVIDUAL";
    targetIds: string[];
    scheduledFor?: Date;
    dueDate?: Date;
    schoolId: string;
    createdById: string;
    classroomId?: string;
    fromTemplate?: boolean;
    templateId?: string;
    academicYearId?: string;
}) {
    try {
        // PERMISSION CHECK
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;

        if (data.assignedTo === "CLASS" && data.classroomId) {
            const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, data.classroomId);
            if (!hasAccess) {
                return { success: false, error: "You do not have permission to assign homework to this class." };
            }
        }

        const id = Math.random().toString(36).substr(2, 9);
        const targetIdsJson = JSON.stringify(data.targetIds);

        await prisma.$executeRawUnsafe(
            `INSERT INTO Homework (
                id, title, description, instructions, videoUrl, voiceNoteUrl, worksheetUrl, attachments,
                assignedTo, targetIds, scheduledFor, dueDate, isPublished, fromTemplate, templateId,
                schoolId, createdById, classroomId, academicYearId, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            id, data.title, data.description || null, data.instructions || null,
            data.videoUrl || null, data.voiceNoteUrl || null, data.worksheetUrl || null,
            data.attachments || null, data.assignedTo, targetIdsJson,
            data.scheduledFor?.toISOString() || null, data.dueDate?.toISOString() || null,
            false, data.fromTemplate ? 1 : 0, data.templateId || null,
            data.schoolId, data.createdById, data.classroomId || null, data.academicYearId || null
        );

        // ... scope continue ...

        // Create submission records for all target students
        if (data.assignedTo === "CLASS" && data.classroomId) {
            const students: any[] = await prisma.$queryRawUnsafe(
                `SELECT id, firstName, lastName FROM Student WHERE classroomId = ?`,
                data.classroomId
            );

            for (const student of students) {
                const submissionId = Math.random().toString(36).substr(2, 9);
                await prisma.$executeRawUnsafe(
                    `INSERT INTO HomeworkSubmission (id, studentId, studentName, homeworkId, createdAt, updatedAt)
                     VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
                    submissionId, student.id, `${student.firstName} ${student.lastName}`, id
                );
            }
        } else if (data.assignedTo === "INDIVIDUAL") {
            // ... existing individual logic ...
            for (const studentId of data.targetIds) {
                const students: any[] = await prisma.$queryRawUnsafe(
                    `SELECT id, firstName, lastName FROM Student WHERE id = ?`,
                    studentId
                );
                if (students.length > 0) {
                    const student = students[0];
                    const submissionId = Math.random().toString(36).substr(2, 9);
                    await prisma.$executeRawUnsafe(
                        `INSERT INTO HomeworkSubmission (id, studentId, studentName, homeworkId, createdAt, updatedAt)
                         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
                        submissionId, student.id, `${student.firstName} ${student.lastName}`, id
                    );
                }
            }
        }

        revalidatePath("/s/[slug]/homework");
        return { success: true, data: { id } };
    } catch (error: any) {
        console.error("createHomeworkAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ... publishHomeworkAction ...

export async function getSchoolHomeworkAction(slug: string, classroomId?: string, academicYearId?: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;

        const schoolId = currentUser.schoolId;
        if (!schoolId) return { success: false, error: "User has no assigned school" };

        let query = `SELECT * FROM Homework WHERE schoolId = ?`;
        const params: any[] = [schoolId];

        if (academicYearId) {
            query += ` AND academicYearId = ?`;
            params.push(academicYearId);
        }

        const scope = await getEnforcedScope(currentUser.id, currentUser.role);
        if (scope.restriction) {
            if (classroomId) {
                if (!scope.allowedIds.includes(classroomId)) {
                    return { success: true, data: [] };
                }
            } else {
                if (scope.allowedIds.length > 0) {
                    const list = scope.allowedIds.map(id => `'${id}'`).join(", ");
                    query += ` AND (classroomId IN (${list}) OR classroomId IS NULL)`;
                } else {
                    return { success: true, data: [] };
                }
            }
        }
        // ---------------------------------------------------------

        if (classroomId) {
            query += ` AND classroomId = ?`;
            params.push(classroomId);
        } else if (currentUser.role === 'STAFF') {
            // Apply the list filter here if invalid check? 
            // Actually we modified Query string above, but `params` are separate.
            // If we appended string with literals above, we are good.
            // But let's be cleaner.
            const scope = await getEnforcedScope(currentUser.id, currentUser.role);
            if (scope.restriction && !classroomId && scope.allowedIds.length > 0) {
                const list = scope.allowedIds.map(id => `'${id}'`).join(", ");
                query += ` AND classroomId IN (${list})`;
            }
        }

        query += ` ORDER BY createdAt DESC`;

        const homework: any[] = await prisma.$queryRawUnsafe(query, ...params);

        return {
            success: true,
            data: homework.map(hw => ({
                ...hw,
                targetIds: JSON.parse(hw.targetIds || '[]'),
                attachments: hw.attachments ? JSON.parse(hw.attachments) : [],
                scheduledFor: hw.scheduledFor ? new Date(hw.scheduledFor) : null,
                dueDate: hw.dueDate ? new Date(hw.dueDate) : null,
                isPublished: Boolean(hw.isPublished),
                fromTemplate: Boolean(hw.fromTemplate),
                createdAt: new Date(hw.createdAt),
                updatedAt: new Date(hw.updatedAt),
            }))
        };
    } catch (error: any) {
        console.error("getSchoolHomeworkAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// SUBMISSIONS & PARENT INTERACTION
// ============================================

// ... existing imports ...

// ============================================
// STUDENT / PARENT ACTIONS
// ============================================

export async function getStudentHomeworkAction(slug: string, studentId: string, academicYearId?: string) {
    try {
        // PERMISSION CHECK
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;

        if (currentUser.role === "PARENT") {
            const hasAccess = await verifyParentAccess(currentUser.mobile, studentId);
            if (!hasAccess) return { success: false, error: "Access denied" };
        } else if (currentUser.role === "STAFF") {
            // Check if staff handles this student's class
            const student = await prisma.student.findUnique({ where: { id: studentId }, select: { classroomId: true } });
            if (student?.classroomId) {
                const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, student.classroomId);
                if (!hasAccess) return { success: false, error: "Access denied" };
            }
        }

        // Fetch Student to get Classroom ID
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { id: true, classroomId: true }
        });

        if (!student) return { success: false, error: "Student not found" };

        // Query Homework
        // 1. Class-wide homework
        // 2. Individual homework targeting this student
        const tasks: any[] = await prisma.$queryRawUnsafe(`
            SELECT h.*, s.isSubmitted, s.isReviewed, s.stickerType, s.id as submissionId 
            FROM Homework h
            LEFT JOIN HomeworkSubmission s ON h.id = s.homeworkId AND s.studentId = ?
            WHERE 
                ((h.assignedTo = 'CLASS' AND h.classroomId = ?)
                OR 
                (h.assignedTo = 'INDIVIDUAL' AND h.targetIds LIKE ?))
                ${academicYearId ? `AND h.academicYearId = '${academicYearId}'` : ""}
            ORDER BY h.createdAt DESC
        `, studentId, student.classroomId, `%"${studentId}"%`);
        // Note: LIKE %"id"% is a rough JSON check. Ideally we parse or normalize. 
        // Given IDs are random strings, false positives are rare but possible if one ID is substring of another.
        // For strictness we can filter in JS.

        const processed = tasks.map(t => ({
            ...t,
            targetIds: t.targetIds ? JSON.parse(t.targetIds) : [],
            attachments: t.attachments ? JSON.parse(t.attachments) : [],
            submission: {
                isSubmitted: Boolean(t.isSubmitted),
                isReviewed: Boolean(t.isReviewed),
                stickerType: t.stickerType,
                id: t.submissionId
            }
        }));

        // Filter strict for Individual
        const final = processed.filter(t => {
            if (t.assignedTo === 'INDIVIDUAL') {
                return t.targetIds.includes(studentId);
            }
            return true;
        });

        return { success: true, data: final };
    } catch (error: any) {
        console.error("getStudentHomeworkAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function submitHomeworkAction(slug: string, data: {
    homeworkId: string;
    studentId: string;
    mediaType?: "PHOTO" | "VIDEO" | "NONE";
    mediaUrl?: string;
    parentNotes?: string;
    parentFeedback?: "ENJOYED" | "DIFFICULT" | "NEUTRAL";
}) {
    try {
        // PERMISSION CHECK
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;

        // If Parent, verify they own this student
        if (currentUser.role === "PARENT") {
            const hasAccess = await verifyParentAccess(currentUser.mobile, data.studentId);
            if (!hasAccess) return { success: false, error: "You cannot submit for this student." };
        }

        // Check if submission record exists
        const existing = await prisma.$queryRawUnsafe(
            `SELECT id FROM HomeworkSubmission WHERE homeworkId = ? AND studentId = ?`,
            data.homeworkId, data.studentId
        );

        if ((existing as any[]).length === 0) {
            // Create if missing (lazy creation)
            const submissionId = Math.random().toString(36).substr(2, 9);
            await prisma.$executeRawUnsafe(
                `INSERT INTO HomeworkSubmission (id, studentId, studentName, homeworkId, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
                submissionId, data.studentId, "Student", data.homeworkId
            );
        }

        await prisma.$executeRawUnsafe(
            `UPDATE HomeworkSubmission SET 
                mediaType = ?, mediaUrl = ?, parentNotes = ?, parentFeedback = ?,
                isSubmitted = 1, submittedAt = datetime('now'), updatedAt = datetime('now')
             WHERE homeworkId = ? AND studentId = ?`,
            data.mediaType || null, data.mediaUrl || null, data.parentNotes || null,
            data.parentFeedback || null, data.homeworkId, data.studentId
        );

        revalidatePath("/parent");
        return { success: true };
    } catch (error: any) {
        console.error("submitHomeworkAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function recordReadReceiptAction(data: {
    homeworkId: string;
    parentId: string;
    studentId: string;
}) {
    try {
        const id = Math.random().toString(36).substr(2, 9);

        // Check if already exists
        const existing: any[] = await prisma.$queryRawUnsafe(
            `SELECT id FROM HomeworkReadReceipt WHERE homeworkId = ? AND parentId = ? AND studentId = ?`,
            data.homeworkId, data.parentId, data.studentId
        );

        if (existing.length === 0) {
            await prisma.$executeRawUnsafe(
                `INSERT INTO HomeworkReadReceipt (id, homeworkId, parentId, studentId, viewedAt)
                 VALUES (?, ?, ?, ?, datetime('now'))`,
                id, data.homeworkId, data.parentId, data.studentId
            );
        }

        return { success: true };
    } catch (error: any) {
        console.error("recordReadReceiptAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getHomeworkSubmissionsAction(homeworkId: string) {
    try {
        const submissions: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM HomeworkSubmission WHERE homeworkId = ? ORDER BY submittedAt DESC`,
            homeworkId
        );

        return {
            success: true,
            data: submissions.map(sub => ({
                ...sub,
                isSubmitted: Boolean(sub.isSubmitted),
                isReviewed: Boolean(sub.isReviewed),
                addedToPortfolio: Boolean(sub.addedToPortfolio),
                submittedAt: sub.submittedAt ? new Date(sub.submittedAt) : null,
                reviewedAt: sub.reviewedAt ? new Date(sub.reviewedAt) : null,
                createdAt: new Date(sub.createdAt),
                updatedAt: new Date(sub.updatedAt),
            }))
        };
    } catch (error: any) {
        console.error("getHomeworkSubmissionsAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// TEACHER EVALUATION
// ============================================

export async function gradeSubmissionAction(data: {
    submissionId: string;
    stickerType: "EXCELLENT" | "CREATIVE" | "KEEP_IT_UP" | "STAR" | "MEDAL";
    teacherComment?: string;
    reviewedById: string;
    addToPortfolio?: boolean;
    milestoneType?: "SOCIAL" | "COGNITIVE" | "PHYSICAL" | "CREATIVE";
}) {
    try {
        await prisma.$executeRawUnsafe(
            `UPDATE HomeworkSubmission SET 
                stickerType = ?, teacherComment = ?, isReviewed = 1, reviewedAt = datetime('now'),
                reviewedById = ?, addedToPortfolio = ?, milestoneType = ?, updatedAt = datetime('now')
             WHERE id = ?`,
            data.stickerType, data.teacherComment || null, data.reviewedById,
            data.addToPortfolio ? 1 : 0, data.milestoneType || null, data.submissionId
        );

        revalidatePath("/s/[slug]/homework");
        return { success: true };
    } catch (error: any) {
        console.error("gradeSubmissionAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// TEMPLATES
// ============================================

export async function getHomeworkTemplatesAction(category?: string, ageGroup?: string) {
    try {
        let query = `SELECT * FROM HomeworkTemplate WHERE 1=1`;
        const params: any[] = [];

        if (category) {
            query += ` AND category = ?`;
            params.push(category);
        }

        if (ageGroup) {
            query += ` AND ageGroup = ?`;
            params.push(ageGroup);
        }

        query += ` ORDER BY createdAt DESC`;

        const templates: any[] = await prisma.$queryRawUnsafe(query, ...params);

        return {
            success: true,
            data: templates.map(t => ({
                ...t,
                attachments: t.attachments ? JSON.parse(t.attachments) : [],
                isPremium: Boolean(t.isPremium),
                createdAt: new Date(t.createdAt),
                updatedAt: new Date(t.updatedAt),
            }))
        };
    } catch (error: any) {
        console.error("getHomeworkTemplatesAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createHomeworkTemplateAction(data: {
    title: string;
    description?: string;
    category: string;
    instructions?: string;
    videoUrl?: string;
    worksheetUrl?: string;
    attachments?: string;
    isPremium?: boolean;
    ageGroup?: string;
}) {
    try {
        const id = Math.random().toString(36).substr(2, 9);

        await prisma.$executeRawUnsafe(
            `INSERT INTO HomeworkTemplate (
                id, title, description, category, instructions, videoUrl, worksheetUrl,
                attachments, isPremium, ageGroup, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            id, data.title, data.description || null, data.category, data.instructions || null,
            data.videoUrl || null, data.worksheetUrl || null, data.attachments || null,
            data.isPremium ? 1 : 0, data.ageGroup || null
        );

        return { success: true, data: { id } };
    } catch (error: any) {
        console.error("createHomeworkTemplateAction Error:", error);
        return { success: false, error: error.message };
    }
}
