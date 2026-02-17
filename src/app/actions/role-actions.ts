"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MODULES, RolePermission, ModuleDefinition } from "@/lib/permissions-config";

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

// ==========================================
// SEED DEFAULTS
// ==========================================

export async function seedDefaultRolesAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug }
        });

        if (!school) return { success: false, error: "School not found" };

        const flatten = (modules: ModuleDefinition[]): RolePermission[] => {
            return modules.flatMap(m => {
                const base: RolePermission = { module: m.key, actions: m.permissions };
                const subs = m.subModules ? flatten(m.subModules) : [];
                return [base, ...subs];
            });
        };

        const adminPerms: RolePermission[] = flatten(MODULES);

        const teacherPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "students", actions: ["view"] },
            { module: "students.profiles", actions: ["view"] },
            { module: "students.profiles.personal", actions: ["view", "edit"] },
            { module: "students.profiles.health", actions: ["view"] },
            { module: "students.attendance", actions: ["view", "mark", "edit"] },
            { module: "students.reports", actions: ["view", "create", "edit"] },
            { module: "academics", actions: ["view"] },
            { module: "academics.classes", actions: ["view"] },
            { module: "academics.timetable", actions: ["view"] },
            { module: "academics.curriculum", actions: ["view"] },
            { module: "diary", actions: ["view", "create", "review"] },
            { module: "library", actions: ["view"] },
            { module: "transport", actions: ["view"] },
            { module: "staff.attendance", actions: ["view", "manage_own"] },
        ];

        const accountantPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "billing", actions: ["view", "create", "edit", "delete", "export"] },
            { module: "billing.invoices", actions: ["view", "create", "export"] },
            { module: "billing.expenses", actions: ["view", "create", "edit", "delete"] },
            { module: "billing.structure", actions: ["view", "manage"] },
            { module: "staff", actions: ["view"] },
            { module: "staff.payroll", actions: ["view", "manage", "export"] },
            { module: "inventory", actions: ["view"] },
            { module: "students", actions: ["view"] },
        ];

        const librarianPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "library", actions: ["view", "manage", "create", "edit", "delete"] },
            { module: "students", actions: ["view"] },
            { module: "staff", actions: ["view"] },
        ];

        const transportPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "transport", actions: ["view", "manage", "create", "edit", "delete"] },
            { module: "transport.expenses", actions: ["view", "create", "edit", "delete", "approve", "review"] },
            { module: "students", actions: ["view"] },
            { module: "staff.directory", actions: ["view"] },
            { module: "staff.directory.personal", actions: ["view"] },
        ];

        const receptionistPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "admissions", actions: ["view", "create", "edit"] },
            { module: "admissions.inquiries", actions: ["view", "create", "edit"] },
            { module: "admissions.applications", actions: ["view", "create", "edit"] },
            { module: "students", actions: ["view"] },
            { module: "communication", actions: ["view", "send"] },
            { module: "staff.directory", actions: ["view"] },
            { module: "staff.directory.personal", actions: ["view"] },
        ];

        const hrManagerPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "staff", actions: ["view", "create", "edit", "delete"] },
            { module: "staff.directory", actions: ["view", "create", "edit", "delete"] },
            { module: "staff.directory.personal", actions: ["view", "edit"] },
            { module: "staff.directory.contract", actions: ["view", "manage"] },
            { module: "staff.directory.system", actions: ["view", "manage"] },
            { module: "staff.attendance", actions: ["view", "mark", "edit", "manage_selected"] },
            { module: "staff.payroll", actions: ["view", "manage", "export"] },
        ];

        const academicCoordinatorPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "academics", actions: ["view", "manage"] },
            { module: "academics.classes", actions: ["view", "manage", "create", "edit"] },
            { module: "academics.timetable", actions: ["view", "create", "edit"] },
            { module: "academics.curriculum", actions: ["view", "create", "edit"] },
            { module: "students", actions: ["view"] },
            { module: "students.profiles", actions: ["view", "edit"] },
            { module: "students.reports", actions: ["view", "create", "edit", "delete"] },
            { module: "diary", actions: ["view", "review"] },
            { module: "staff.directory", actions: ["view"] },
        ];

        const nursePerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "students", actions: ["view"] },
            { module: "students.profiles", actions: ["view"] },
            { module: "students.profiles.personal", actions: ["view"] },
            { module: "students.profiles.health", actions: ["view", "edit"] },
        ];

        const driverPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "transport", actions: ["view"] },
            { module: "transport.expenses", actions: ["view", "create"] },
            { module: "students", actions: ["view"] },
        ];

        const officeAdminPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "students", actions: ["view", "create", "edit", "delete", "export"] },
            { module: "students.profiles", actions: ["view", "create", "edit", "delete"] },
            { module: "students.attendance", actions: ["view", "mark", "edit"] },
            { module: "admissions", actions: ["view", "create", "edit", "delete"] },
            { module: "admissions.inquiries", actions: ["view", "create", "edit", "delete"] },
            { module: "admissions.applications", actions: ["view", "create", "edit", "delete"] },
            { module: "staff.directory", actions: ["view"] },
            { module: "staff.attendance", actions: ["view", "mark", "edit", "manage_selected"] },
            { module: "billing", actions: ["view"] },
            { module: "billing.invoices", actions: ["view", "create", "export"] },
            { module: "inventory", actions: ["view", "manage"] },
            { module: "transport", actions: ["view", "manage"] },
            { module: "communication", actions: ["view", "send"] },
            { module: "library", actions: ["view", "manage"] },
        ];

        const canteenManagerPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "inventory", actions: ["view", "manage", "create", "edit", "delete"] },
            { module: "students.profiles.health", actions: ["view"] },
        ];

        const defaults = [
            { name: "Administrator", desc: "Full system access", perms: adminPerms },
            { name: "Office Administrator", desc: "Daily school operations", perms: officeAdminPerms },
            { name: "Teacher", desc: "Academic and student management", perms: teacherPerms },
            { name: "Accountant", desc: "Financial management", perms: accountantPerms },
            { name: "Librarian", desc: "Library management", perms: librarianPerms },
            { name: "Transport Manager", desc: "Fleet management", perms: transportPerms },
            { name: "Receptionist", desc: "Front desk operations", perms: receptionistPerms },
            { name: "HR Manager", desc: "Human resources and payroll", perms: hrManagerPerms },
            { name: "Academic Coordinator", desc: "Curriculum and teacher oversight", perms: academicCoordinatorPerms },
            { name: "Nurse", desc: "Health and wellness", perms: nursePerms },
            { name: "Driver", desc: "Transport operations", perms: driverPerms },
            { name: "Canteen Manager", desc: "Food and inventory management", perms: canteenManagerPerms }
        ];

        let createdCount = 0;
        let updatedCount = 0;

        for (const roleDef of defaults) {
            const existing = await prisma.role.findFirst({
                where: {
                    schoolId: school.id,
                    name: roleDef.name
                }
            });

            if (!existing) {
                await prisma.role.create({
                    data: {
                        name: roleDef.name,
                        description: roleDef.desc,
                        permissions: JSON.stringify(roleDef.perms),
                        schoolId: school.id
                    }
                });
                createdCount++;
            } else {
                await prisma.role.update({
                    where: { id: existing.id },
                    data: {
                        description: roleDef.desc,
                        permissions: JSON.stringify(roleDef.perms)
                    }
                });
                updatedCount++;
            }
        }

        revalidatePath(`/s/${schoolSlug}/roles`);
        return { success: true, created: createdCount, updated: updatedCount };
    } catch (error: any) {
        console.error("Seed Roles Error:", error);
        return { success: false, error: error.message };
    }
}
