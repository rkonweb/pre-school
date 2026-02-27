"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";

export async function getTimetableStructuresAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const structures = await prisma.timetableStructure.findMany({
            where: { school: { slug: schoolSlug } },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { classrooms: true }
                }
            }
        });

        return { success: true, structures };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createTimetableStructureAction(schoolSlug: string, data: { name: string; description?: string; config: string }) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug }
        });

        if (!school) return { success: false, error: "School not found" };

        const structure = await prisma.timetableStructure.create({
            data: {
                name: data.name,
                description: data.description,
                config: data.config,
                schoolId: school.id
            }
        });

        revalidatePath(`/s/${schoolSlug}/academics/timetable`);
        return { success: true, structure };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTimetableStructureAction(schoolSlug: string, id: string, data: { name?: string; description?: string; config?: string }) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        // Verify ownership implicitly via schoolSlug and structure existence
        const existing = await prisma.timetableStructure.findFirst({
            where: { id, school: { slug: schoolSlug } }
        });

        if (!existing) return { success: false, error: "Structure not found" };

        const structure = await prisma.timetableStructure.update({
            where: { id },
            data
        });

        revalidatePath(`/s/${schoolSlug}/academics/timetable`);
        return { success: true, structure };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTimetableStructureAction(schoolSlug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        await prisma.timetableStructure.delete({
            where: { id, school: { slug: schoolSlug } }
        });

        revalidatePath(`/s/${schoolSlug}/academics/timetable`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Function to assign a structure to a classroom
export async function assignTimetableStructureAction(schoolSlug: string, classroomId: string, structureId: string | null) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const classroom = await prisma.classroom.update({
            where: { id: classroomId, school: { slug: schoolSlug } },
            data: {
                timetableStructureId: structureId
            }
        });

        revalidatePath(`/s/${schoolSlug}/academics/timetable`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
