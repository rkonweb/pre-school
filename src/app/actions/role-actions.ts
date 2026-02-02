"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// ROLE ACTIONS
// ==========================================

export async function getRolesAction(schoolSlug: string) {
    try {
        const roles = await prisma.role.findMany({
            where: { school: { slug: schoolSlug } },
            include: { _count: { select: { users: true } } },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, roles };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createRoleAction(schoolSlug: string, data: { name: string; description?: string; permissions: any[] }) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) throw new Error("School not found");

        const role = await prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
                permissions: JSON.stringify(data.permissions),
                schoolId: school.id
            }
        });
        revalidatePath(`/s/${schoolSlug}/roles`);
        return { success: true, role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRoleAction(schoolSlug: string, roleId: string, data: { name: string; description?: string; permissions: any[] }) {
    try {
        const role = await prisma.role.update({
            where: { id: roleId },
            data: {
                name: data.name,
                description: data.description,
                permissions: JSON.stringify(data.permissions)
            }
        });
        revalidatePath(`/s/${schoolSlug}/roles`);
        return { success: true, role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRoleAction(schoolSlug: string, roleId: string) {
    try {
        await prisma.role.delete({ where: { id: roleId } });
        revalidatePath(`/s/${schoolSlug}/roles`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignRoleToUserAction(schoolSlug: string, userId: string, roleId: string | null) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { customRoleId: roleId }
        });
        revalidatePath(`/s/${schoolSlug}/roles`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// CLASS ACCESS ACTIONS
// ==========================================

export async function getTeachersWithAccessAction(schoolSlug: string) {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                school: { slug: schoolSlug },
                role: { in: ["TEACHER", "STAFF", "ADMIN"] } // Include generic roles
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                designation: true,
                customRole: true,
                _count: { select: { classAccesses: true } }
            }
        });
        return { success: true, teachers };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getUserClassAccessAction(userId: string) {
    try {
        const access = await prisma.classAccess.findMany({
            where: { userId },
            include: { classroom: true }
        });
        return { success: true, access };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateClassAccessAction(userId: string, classroomId: string, permissions: { canRead: boolean; canWrite: boolean; canEdit: boolean; canDelete: boolean }) {
    try {
        // Check if all false, then maybe remove?
        // But upsert is fine.
        await prisma.classAccess.upsert({
            where: {
                userId_classroomId: {
                    userId,
                    classroomId
                }
            },
            update: permissions,
            create: {
                userId,
                classroomId,
                ...permissions
            }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function removeClassAccessAction(userId: string, classroomId: string) {
    try {
        await prisma.classAccess.delete({
            where: {
                userId_classroomId: { userId, classroomId }
            }
        });
        return { success: true };
    } catch (error: any) {
        // Ignore if does not exist
        return { success: false, error: error.message };
    }
}

// ==========================================
// STAFF ATTENDANCE ACCESS ACTIONS
// ==========================================

export async function getManagedStaffAction(managerId: string) {
    try {
        const managedStaff = await (prisma as any).staffAccess.findMany({
            where: { managerId },
            include: { staff: true }
        });
        return { success: true, managedStaff };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateManagedStaffAction(managerId: string, staffIds: string[]) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Remove all existing for this manager
            await (tx as any).staffAccess.deleteMany({
                where: { managerId }
            });

            // 2. Create new ones
            if (staffIds.length > 0) {
                for (const staffId of staffIds) {
                    await (tx as any).staffAccess.create({
                        data: {
                            managerId,
                            staffId
                        }
                    });
                }
            }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
