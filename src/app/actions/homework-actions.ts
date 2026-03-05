"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";
import { getEnforcedScope, verifyClassAccess } from "@/lib/access-control";
import { uploadToGoogleDriveNested } from "@/lib/google-drive-upload";

// ============================================
// GET HOMEWORK LIST (ADMIN / TEACHER VIEW)
// ============================================
export async function getSchoolHomeworkAction(slug: string, classroomId?: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;

        if (!currentUser.schoolId) return { success: false, error: "No school assigned" };

        const scope = await getEnforcedScope(currentUser.id, currentUser.role);

        const whereClause: any = {
            schoolId: currentUser.schoolId,
        };

        if (classroomId) {
            whereClause.classroomId = classroomId;
        } else if (scope.restriction && scope.allowedIds.length > 0) {
            whereClause.classroomId = { in: scope.allowedIds };
        } else if (scope.restriction && scope.allowedIds.length === 0) {
            return { success: true, data: [] };
        }

        const homework = await prisma.homework.findMany({
            where: whereClause,
            include: {
                submissions: {
                    select: { id: true, isSubmitted: true, isReviewed: true }
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: homework.map(hw => ({
                ...hw,
                targetIds: JSON.parse(hw.targetIds || "[]"),
                attachments: hw.attachments ? JSON.parse(hw.attachments) : [],
                submissionCount: hw.submissions.length,
                submittedCount: hw.submissions.filter(s => s.isSubmitted).length,
                reviewedCount: hw.submissions.filter(s => s.isReviewed).length,
            }))
        };
    } catch (error: any) {
        console.error("getSchoolHomeworkAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// GET SINGLE HOMEWORK
// ============================================
export async function getHomeworkByIdAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const homework = await prisma.homework.findUnique({
            where: { id },
            include: {
                submissions: {
                    orderBy: { studentName: "asc" },
                },
            },
        });

        if (!homework) return { success: false, error: "Homework not found" };

        return {
            success: true,
            data: {
                ...homework,
                targetIds: JSON.parse(homework.targetIds || "[]"),
                attachments: homework.attachments ? JSON.parse(homework.attachments) : [],
            }
        };
    } catch (error: any) {
        console.error("getHomeworkByIdAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// CREATE HOMEWORK
// ============================================
export async function createHomeworkAction(slug: string, data: {
    title: string;
    description?: string;
    instructions?: string;
    videoUrl?: string;
    voiceNoteUrl?: string;
    worksheetUrl?: string;
    attachments?: { name: string; url: string; type: string; size?: number }[];
    assignedTo: "CLASS" | "GROUP" | "INDIVIDUAL";
    targetIds: string[];
    scheduledFor?: Date;
    dueDate?: Date;
    classroomId?: string;
    academicYearId?: string;
    isPublished?: boolean;
}) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;
        if (!currentUser.schoolId) return { success: false, error: "No school assigned" };

        if (data.assignedTo === "CLASS" && data.classroomId) {
            const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, data.classroomId);
            if (!hasAccess) return { success: false, error: "No permission for this class." };
        }

        const homework = await prisma.homework.create({
            data: {
                title: data.title,
                description: data.description,
                instructions: data.instructions,
                videoUrl: data.videoUrl,
                voiceNoteUrl: data.voiceNoteUrl,
                worksheetUrl: data.worksheetUrl,
                attachments: JSON.stringify(data.attachments || []),
                assignedTo: data.assignedTo,
                targetIds: JSON.stringify(data.targetIds),
                scheduledFor: data.scheduledFor,
                dueDate: data.dueDate,
                isPublished: data.isPublished ?? false,
                schoolId: currentUser.schoolId,
                createdById: currentUser.id,
                classroomId: data.classroomId,
                academicYearId: data.academicYearId,
            }
        });

        // Auto-create submission rows for class-level homework
        if (data.assignedTo === "CLASS" && data.classroomId) {
            const students = await prisma.student.findMany({
                where: { classroomId: data.classroomId, status: "ACTIVE" },
                select: { id: true, firstName: true, lastName: true }
            });

            if (students.length > 0) {
                await prisma.homeworkSubmission.createMany({
                    data: students.map(s => ({
                        studentId: s.id,
                        studentName: `${s.firstName} ${s.lastName}`,
                        homeworkId: homework.id,
                    })),
                    skipDuplicates: true,
                });
            }
        } else if (data.assignedTo === "INDIVIDUAL" && data.targetIds.length > 0) {
            const students = await prisma.student.findMany({
                where: { id: { in: data.targetIds }, status: "ACTIVE" },
                select: { id: true, firstName: true, lastName: true }
            });

            if (students.length > 0) {
                await prisma.homeworkSubmission.createMany({
                    data: students.map(s => ({
                        studentId: s.id,
                        studentName: `${s.firstName} ${s.lastName}`,
                        homeworkId: homework.id,
                    })),
                    skipDuplicates: true,
                });
            }
        }

        revalidatePath(`/s/${slug}/homework`);
        return { success: true, data: { id: homework.id } };
    } catch (error: any) {
        console.error("createHomeworkAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// UPDATE HOMEWORK
// ============================================
export async function updateHomeworkAction(slug: string, id: string, data: {
    title?: string;
    description?: string;
    instructions?: string;
    videoUrl?: string;
    voiceNoteUrl?: string;
    worksheetUrl?: string;
    attachments?: { name: string; url: string; type: string; size?: number }[];
    scheduledFor?: Date | null;
    dueDate?: Date | null;
    classroomId?: string;
    isPublished?: boolean;
    assignedTo?: 'CLASS' | 'INDIVIDUAL';
    targetIds?: string[];
}) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.instructions !== undefined) updateData.instructions = data.instructions;
        if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
        if (data.voiceNoteUrl !== undefined) updateData.voiceNoteUrl = data.voiceNoteUrl;
        if (data.worksheetUrl !== undefined) updateData.worksheetUrl = data.worksheetUrl;
        if (data.attachments !== undefined) updateData.attachments = JSON.stringify(data.attachments);
        if (data.scheduledFor !== undefined) updateData.scheduledFor = data.scheduledFor;
        if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
        if (data.classroomId !== undefined) updateData.classroomId = data.classroomId;
        if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
        if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;

        await prisma.homework.update({ where: { id }, data: updateData });

        if (data.assignedTo !== undefined || data.targetIds !== undefined || data.classroomId !== undefined) {
            const hw = await prisma.homework.findUnique({ where: { id } });
            if (hw) {
                let studentIdsToAssign: string[] = [];
                if (hw.assignedTo === 'CLASS' && hw.classroomId) {
                    const classStudents = await prisma.student.findMany({
                        where: { classroomId: hw.classroomId, status: 'ACTIVE' },
                        select: { id: true }
                    });
                    studentIdsToAssign = classStudents.map(s => s.id);
                } else if (hw.assignedTo === 'INDIVIDUAL' && data.targetIds) {
                    studentIdsToAssign = data.targetIds;
                }

                if (studentIdsToAssign.length > 0) {
                    const existingSubmissions = await prisma.homeworkSubmission.findMany({
                        where: { homeworkId: id },
                        select: { studentId: true }
                    });
                    const existingIds = new Set(existingSubmissions.map(s => s.studentId));
                    const newIds = studentIdsToAssign.filter(sid => !existingIds.has(sid));

                    if (newIds.length > 0) {
                        const newStudents = await prisma.student.findMany({
                            where: { id: { in: newIds } },
                            select: { id: true, firstName: true, lastName: true }
                        });
                        await prisma.homeworkSubmission.createMany({
                            data: newStudents.map(s => ({
                                studentId: s.id,
                                studentName: `${s.firstName} ${s.lastName}`,
                                homeworkId: hw.id,
                            })),
                            skipDuplicates: true
                        });
                    }
                }
            }
        }

        revalidatePath(`/s/${slug}/homework`);
        revalidatePath(`/s/${slug}/homework/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("updateHomeworkAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// DELETE HOMEWORK
// ============================================
export async function deleteHomeworkAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        await prisma.homework.delete({ where: { id } });

        revalidatePath(`/s/${slug}/homework`);
        return { success: true };
    } catch (error: any) {
        console.error("deleteHomeworkAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// PUBLISH / UNPUBLISH
// ============================================
export async function toggleHomeworkPublishAction(slug: string, id: string, publish: boolean) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        await prisma.homework.update({
            where: { id },
            data: { isPublished: publish }
        });

        revalidatePath(`/s/${slug}/homework`);
        revalidatePath(`/s/${slug}/homework/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("toggleHomeworkPublishAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// UPLOAD HOMEWORK FILE TO GOOGLE DRIVE
// ============================================
export async function uploadHomeworkFileAction(formData: FormData) {
    try {
        const slug = formData.get("slug") as string;
        const classroomName = (formData.get("classroomName") as string) || "General";
        const dateStr = (formData.get("date") as string) || new Date().toISOString();

        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

        const file = formData.get("file") as File;
        if (!file) return { success: false, error: "No file provided" };

        const buffer = Buffer.from(await file.arrayBuffer());
        const date = new Date(dateStr);
        const monthStr = date.toLocaleString("en-US", { month: "long", year: "numeric" }); // "March 2026"
        const dayStr = `${date.getDate().toString().padStart(2, "0")}-${date.toLocaleString("en-US", { weekday: "short" })}`; // "04-Tue"
        const safeClassName = classroomName.replace(/[^a-zA-Z0-9 -]/g, "").trim();

        const folderPath = ["Homework", safeClassName, monthStr, dayStr];

        const res = await uploadToGoogleDriveNested(buffer, file.name, file.type, folderPath);

        return res;
    } catch (error: any) {
        console.error("uploadHomeworkFileAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// GET SUBMISSIONS
// ============================================
export async function getHomeworkSubmissionsAction(homeworkId: string) {
    try {
        const submissions = await prisma.homeworkSubmission.findMany({
            where: { homeworkId },
            orderBy: { studentName: "asc" },
        });

        return { success: true, data: submissions };
    } catch (error: any) {
        console.error("getHomeworkSubmissionsAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// GRADE SUBMISSION
// ============================================
export async function gradeSubmissionAction(slug: string, data: {
    submissionId: string;
    stickerType: "EXCELLENT" | "CREATIVE" | "KEEP_IT_UP" | "STAR" | "MEDAL";
    teacherComment?: string;
    addToPortfolio?: boolean;
    milestoneType?: "SOCIAL" | "COGNITIVE" | "PHYSICAL" | "CREATIVE";
}) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        await prisma.homeworkSubmission.update({
            where: { id: data.submissionId },
            data: {
                stickerType: data.stickerType,
                teacherComment: data.teacherComment,
                isReviewed: true,
                reviewedAt: new Date(),
                reviewedById: auth.user.id,
                addedToPortfolio: data.addToPortfolio ?? false,
                milestoneType: data.milestoneType,
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("gradeSubmissionAction Error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// LEGACY COMPAT
// ============================================
export async function getStudentHomeworkAction(slug: string, studentId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classroomId: true }
        });

        if (!student) return { success: false, error: "Student not found" };

        const homework = await prisma.homework.findMany({
            where: {
                OR: [
                    { assignedTo: "CLASS", classroomId: student.classroomId ?? undefined },
                    {
                        assignedTo: "INDIVIDUAL",
                        targetIds: { contains: studentId }
                    }
                ],
                isPublished: true,
            },
            include: {
                submissions: {
                    where: { studentId },
                    take: 1,
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: homework.map(hw => ({
                ...hw,
                targetIds: JSON.parse(hw.targetIds || "[]"),
                attachments: hw.attachments ? JSON.parse(hw.attachments) : [],
                submission: hw.submissions[0] ?? null,
            }))
        };
    } catch (error: any) {
        console.error("getStudentHomeworkAction Error:", error);
        return { success: false, error: error.message };
    }
}
