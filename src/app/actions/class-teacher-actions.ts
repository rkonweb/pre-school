"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserAction } from "@/app/actions/session-actions";

/**
 * Returns all classrooms where the current logged-in user is the assigned Class Teacher.
 * A teacher can be Class Teacher of multiple classrooms.
 */
export async function getMyClassTeacherClassroomsAction(schoolSlug: string) {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) {
            return { success: false, classrooms: [], isClassTeacher: false };
        }

        const userId = userRes.data.id;

        const classrooms = await prisma.classroom.findMany({
            where: {
                teacherId: userId,
                school: { slug: schoolSlug }
            },
            select: {
                id: true,
                name: true,
                teacherId: true,
                students: {
                    select: { id: true }
                }
            }
        });

        return {
            success: true,
            isClassTeacher: classrooms.length > 0,
            classrooms: JSON.parse(JSON.stringify(classrooms)),
            userId
        };
    } catch (error: any) {
        return { success: false, classrooms: [], isClassTeacher: false };
    }
}

/**
 * Check if a specific user is the Class Teacher of a given classroom.
 * Used in server components and actions to gate elevated access.
 */
export async function isClassTeacherOfClassroomAction(userId: string, classroomId: string): Promise<boolean> {
    try {
        const classroom = await prisma.classroom.findFirst({
            where: { id: classroomId, teacherId: userId },
            select: { id: true }
        });
        return !!classroom;
    } catch {
        return false;
    }
}

/**
 * Get the Class Teacher info for a given classroom (for display purposes).
 */
export async function getClassroomTeacherAction(classroomId: string) {
    try {
        const classroom = await prisma.classroom.findUnique({
            where: { id: classroomId },
            select: {
                id: true,
                name: true,
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        designation: true,
                        email: true
                    }
                }
            }
        });
        return { success: true, classroom: JSON.parse(JSON.stringify(classroom)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
