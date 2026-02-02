"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentUserAction } from "./session-actions";

export async function getClassroomsAction(schoolSlug: string) {
    try {
        const whereClause: any = {
            school: {
                slug: schoolSlug
            }
        };

        // ---------------------------------------------------------
        // ACCESS CONTROL
        // ---------------------------------------------------------
        const userRes = await getCurrentUserAction();
        if (userRes.success && userRes.data) {
            const currentUser = userRes.data;
            if (currentUser.role === "STAFF") {
                const accessItems = await prisma.classAccess.findMany({
                    where: { userId: currentUser.id, canRead: true },
                    select: { classroomId: true }
                });

                const allowedIds = accessItems.map((i: any) => i.classroomId);

                if (allowedIds.length > 0) {
                    whereClause.id = { in: allowedIds };
                } else {
                    // No access -> return empty immediately
                    return { success: true, data: [] };
                }
            }
        }
        // ---------------------------------------------------------

        const classrooms = await prisma.classroom.findMany({
            where: whereClause,
            include: {
                teacher: true,
                _count: {
                    select: { students: true }
                }
            },
            orderBy: {
                name: "asc"
            }
        });
        return { success: true, data: classrooms };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getClassroomAction(id: string) {
    try {
        const classroom = await prisma.classroom.findUnique({
            where: { id },
            include: {
                teacher: true,
                students: true
            }
        });
        return { success: true, classroom };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createClassroomAction(schoolSlug: string, name: string, teacherId?: string) {
    const school = await prisma.school.findUnique({
        where: { slug: schoolSlug }
    });

    if (!school) throw new Error("School not found");

    const classroom = await prisma.classroom.create({
        data: {
            name,
            schoolId: school.id,
            teacherId: teacherId || null
        }
    });

    revalidatePath(`/s/${schoolSlug}/classroom`);
    return classroom;
}

export async function updateClassroomAction(schoolSlug: string, id: string, data: any) {
    try {
        const updateData = { ...data };
        if (updateData.teacherId === "") {
            updateData.teacherId = null;
        }

        const classroom = await prisma.classroom.update({
            where: { id },
            data: updateData
        });
        revalidatePath(`/s/${schoolSlug}/classroom`);
        return { success: true, classroom };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteClassroomAction(schoolSlug: string, id: string) {
    try {
        await prisma.classroom.delete({
            where: { id }
        });
        revalidatePath(`/s/${schoolSlug}/classroom`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
