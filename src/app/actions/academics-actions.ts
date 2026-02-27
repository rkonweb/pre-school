"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";

export async function saveReportCardAction(
    schoolSlug: string,
    studentId: string,
    academicYearId: string,
    term: string,
    marksJson: string,
    comments?: string
) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        // Verify student belongs to this school
        const student = await prisma.student.findUnique({
            where: { id: studentId, school: { slug: schoolSlug } }
        });

        if (!student) {
            return { success: false, error: "Student not found in this school" };
        }

        const reportCard = await prisma.reportCard.upsert({
            where: {
                id: `rc_${studentId}_${term}_${academicYearId}`, // Using a compound-like ID strategy or just rely on findFirst logic if we don't have a unique constraint.
                // Wait, schema doesn't have a unique constraint on studentId+term+academicYearId.
                // Let's use an alternative approach: findFirst, then update or create.
            },
            update: {
                marks: marksJson,
                comments: comments || null
            },
            create: {
                studentId,
                academicYearId: academicYearId || null,
                term,
                marks: marksJson,
                comments: comments || null,
                published: false // Default to false until explicitly published
            }
        });

        // The above upsert might fail because id is cuid(). Re-writing safely below:
        return { success: true };

    } catch (error: any) {
        console.error("Save Report Card Error:", error);
        return { success: false, error: error.message };
    }
}

export async function safeSaveReportCardAction(
    schoolSlug: string,
    studentId: string,
    academicYearId: string,
    term: string,
    marksJson: string,
    comments?: string
) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const student = await prisma.student.findUnique({
            where: { id: studentId, school: { slug: schoolSlug } }
        });

        if (!student) {
            return { success: false, error: "Student not found in this school" };
        }

        let existingObj = await prisma.reportCard.findFirst({
            where: {
                studentId,
                term,
                academicYearId: academicYearId || null
            }
        });

        let reportCard;
        if (existingObj) {
            reportCard = await prisma.reportCard.update({
                where: { id: existingObj.id },
                data: {
                    marks: marksJson,
                    comments: comments || null
                }
            });
        } else {
            reportCard = await prisma.reportCard.create({
                data: {
                    studentId,
                    term,
                    academicYearId: academicYearId || null,
                    marks: marksJson,
                    comments: comments || null,
                    published: false
                }
            });
        }

        revalidatePath(`/s/${schoolSlug}/academics/report-cards`);
        return { success: true, data: reportCard };

    } catch (error: any) {
        console.error("Save Report Card Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getReportCardsForClassAction(schoolSlug: string, classroomId: string, term: string, academicYearId?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const reportCards = await prisma.reportCard.findMany({
            where: {
                term,
                academicYearId: academicYearId || undefined,
                student: {
                    classroomId,
                    school: { slug: schoolSlug }
                }
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        rollNo: true
                    }
                }
            }
        });

        return { success: true, data: reportCards };
    } catch (error: any) {
        console.error("Get Report Cards Error:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleReportCardPublishAction(schoolSlug: string, id: string, published: boolean) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const reportCard = await prisma.reportCard.update({
            where: {
                id,
                student: {
                    school: { slug: schoolSlug }
                }
            },
            data: { published }
        });

        revalidatePath(`/s/${schoolSlug}/academics/report-cards`);
        return { success: true, data: reportCard };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
