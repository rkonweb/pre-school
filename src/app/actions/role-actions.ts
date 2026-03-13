"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MODULES, RolePermission, ModuleDefinition } from "@/lib/permissions-config";
import { resolveSchoolAIModel } from "@/lib/school-integrations";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

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

        console.log(`[getRolesAction] DB returned ${roles.length} roles for ${schoolSlug}`);

        return { success: true, roles: JSON.parse(JSON.stringify(roles)) };
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
            },
            include: { _count: { select: { users: true } } }
        });
        revalidatePath(`/s/${schoolSlug}/hr/roles`);
        return { success: true, role: JSON.parse(JSON.stringify(role)) };
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
        revalidatePath(`/s/${schoolSlug}/hr/roles`);
        return { success: true, role: JSON.parse(JSON.stringify(role)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRoleAction(schoolSlug: string, roleId: string) {
    try {
        await prisma.role.delete({ where: { id: roleId } });
        revalidatePath(`/s/${schoolSlug}/hr/roles`);
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
        revalidatePath(`/s/${schoolSlug}/hr/roles`);
        revalidatePath(`/s/${schoolSlug}/hr/directory`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Per-user module permissions (CRUD overrides on top of their role)
export interface UserModulePermission {
    module: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    manage: boolean;
}

export async function getUserModulePermissionsAction(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                modulePermissions: true,
                customRoleId: true,
                customRole: {
                    select: { id: true, name: true, permissions: true }
                }
            }
        });
        if (!user) throw new Error("User not found");

        let perms: Record<string, UserModulePermission> = {};
        try {
            perms = JSON.parse(user.modulePermissions || "{}");
        } catch { perms = {}; }

        return {
            success: true,
            permissions: perms,
            role: user.customRole ? JSON.parse(JSON.stringify(user.customRole)) : null
        };
    } catch (error: any) {
        return { success: false, error: error.message, permissions: {}, role: null };
    }
}

export async function updateUserModulePermissionsAction(
    schoolSlug: string,
    userId: string,
    permissions: Record<string, UserModulePermission>
) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { modulePermissions: JSON.stringify(permissions) }
        });
        revalidatePath(`/s/${schoolSlug}/hr/directory`);
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
        return { success: true, teachers: JSON.parse(JSON.stringify(teachers)) };
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
        return { success: true, access: JSON.parse(JSON.stringify(access)) };
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
        return { success: true, managedStaff: JSON.parse(JSON.stringify(managedStaff)) };
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
            { module: "academics.assignments", actions: ["view", "create", "edit", "delete"] },
            { module: "academics.examinations", actions: ["view"] },
            { module: "academics.grading", actions: ["view", "mark", "edit", "publish"] },
            { module: "diary", actions: ["view", "create", "review"] },
            { module: "library", actions: ["view"] },
            { module: "transport", actions: ["view"] },
            { module: "staff.attendance", actions: ["view", "manage_own"] },
        ];

        const headTeacherPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "students", actions: ["view", "create", "edit"] },
            { module: "students.profiles", actions: ["view", "create", "edit"] },
            { module: "students.profiles.personal", actions: ["view", "edit"] },
            { module: "students.profiles.documents", actions: ["view", "create", "delete"] },
            { module: "students.profiles.health", actions: ["view", "edit"] },
            { module: "students.attendance", actions: ["view", "mark", "edit"] },
            { module: "students.reports", actions: ["view", "create", "edit"] },
            { module: "academics", actions: ["view", "manage"] },
            { module: "academics.classes", actions: ["view", "create", "edit", "manage"] },
            { module: "academics.timetable", actions: ["view", "create", "edit"] },
            { module: "academics.curriculum", actions: ["view", "create", "edit"] },
            { module: "academics.assignments", actions: ["view", "create", "edit", "delete"] },
            { module: "academics.examinations", actions: ["view", "create", "edit", "manage"] },
            { module: "academics.grading", actions: ["view", "mark", "edit", "publish"] },
            { module: "diary", actions: ["view", "create", "review"] },
            { module: "admissions", actions: ["view", "edit"] },
            { module: "admissions.inquiries", actions: ["view", "edit"] },
            { module: "admissions.applications", actions: ["view", "edit"] },
            { module: "admissions.follow_ups", actions: ["view", "edit"] },
            { module: "library", actions: ["view"] },
            { module: "communication", actions: ["view", "send"] },
            { module: "communication.announcements", actions: ["view", "create", "send"] },
            { module: "communication.parent_messages", actions: ["view", "review", "reply"] }
        ];

        const nannyPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "diary", actions: ["view", "create"] },
            { module: "students.attendance", actions: ["view", "mark"] },
            { module: "transport", actions: ["view"] }
        ];

        const vanStaffPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "transport", actions: ["view", "manage", "create", "edit"] },
            { module: "transport.routes", actions: ["view", "manage"] },
            { module: "transport.vehicles", actions: ["view", "manage"] },
            { module: "transport.allocations", actions: ["view", "manage"] },
            { module: "transport.expenses", actions: ["view", "create", "edit"] },
            { module: "students.attendance", actions: ["view"] },
            { module: "staff.attendance", actions: ["view"] }
        ];

        const principalPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "admissions", actions: ["view", "create", "edit", "delete"] },
            { module: "admissions.inquiries", actions: ["view", "create", "edit"] },
            { module: "admissions.applications", actions: ["view", "create", "edit", "delete"] },
            { module: "students", actions: ["view", "create", "edit", "delete"] },
            { module: "students.profiles", actions: ["view", "create", "edit", "delete"] },
            { module: "students.profiles.personal", actions: ["view", "edit"] },
            { module: "students.profiles.documents", actions: ["view", "create", "delete"] },
            { module: "students.profiles.health", actions: ["view", "edit"] },
            { module: "students.attendance", actions: ["view", "mark", "edit"] },
            { module: "students.reports", actions: ["view", "create", "edit", "delete"] },
            { module: "students.behavior", actions: ["view", "create", "edit", "delete"] },
            { module: "students.achievements", actions: ["view", "create", "edit"] },
            { module: "students.leave_requests", actions: ["view", "approve", "review"] },
            { module: "academics", actions: ["view", "manage"] },
            { module: "academics.classes", actions: ["view", "create", "edit", "manage"] },
            { module: "academics.timetable", actions: ["view", "create", "edit"] },
            { module: "academics.curriculum", actions: ["view", "create", "edit"] },
            { module: "academics.assignments", actions: ["view", "create", "edit", "delete"] },
            { module: "academics.examinations", actions: ["view", "create", "edit", "manage"] },
            { module: "academics.grading", actions: ["view", "mark", "edit", "publish"] },
            { module: "staff", actions: ["view", "create", "edit", "delete"] },
            { module: "staff.directory", actions: ["view", "create", "edit", "delete"] },
            { module: "staff.directory.personal", actions: ["view", "edit"] },
            { module: "staff.directory.contract", actions: ["view", "manage"] },
            { module: "staff.attendance", actions: ["view", "mark", "edit", "manage_own", "manage_selected"] },
            { module: "staff.payroll", actions: ["view", "manage", "export"] },
            { module: "billing", actions: ["view", "create", "edit", "delete", "export"] },
            { module: "billing.invoices", actions: ["view", "create", "export"] },
            { module: "billing.expenses", actions: ["view", "create", "edit", "delete"] },
            { module: "billing.structure", actions: ["view", "manage"] },
            { module: "billing.discounts", actions: ["view", "create", "manage"] },
            { module: "billing.reports", actions: ["view", "export"] },
            { module: "communication", actions: ["view", "send"] },
            { module: "inventory", actions: ["view", "manage"] },
            { module: "library", actions: ["view", "manage", "create", "edit", "delete"] },
            { module: "transport", actions: ["view", "manage", "create", "edit", "delete"] },
            { module: "transport.expenses", actions: ["view", "create", "edit", "delete", "approve", "review"] }
        ];

        const accountantPerms: RolePermission[] = [
            { module: "dashboard", actions: ["view"] },
            { module: "billing", actions: ["view", "create", "edit", "delete", "export"] },
            { module: "billing.invoices", actions: ["view", "create", "export"] },
            { module: "billing.expenses", actions: ["view", "create", "edit", "delete"] },
            { module: "billing.structure", actions: ["view", "manage"] },
            { module: "billing.discounts", actions: ["view", "create", "manage"] },
            { module: "billing.payroll_processing", actions: ["view", "manage", "approve"] },
            { module: "billing.reports", actions: ["view", "export"] },
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
            { module: "staff.leave_management", actions: ["view", "create", "approve"] },
            { module: "staff.performance", actions: ["view", "edit", "manage"] }
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
            { name: "System Admin", desc: "Technical system management and full access", perms: adminPerms },
            { name: "Principal", desc: "Full school oversight and management", perms: principalPerms },
            { name: "Office Administrator", desc: "Daily school operations", perms: officeAdminPerms },
            { name: "Head Teacher", desc: "Senior academic and student oversight", perms: headTeacherPerms },
            { name: "Teacher", desc: "Academic and student management", perms: teacherPerms },
            { name: "Nanny", desc: "Early years care and basic daily logging", perms: nannyPerms },
            { name: "Accountant", desc: "Financial management", perms: accountantPerms },
            { name: "Librarian", desc: "Library management", perms: librarianPerms },
            { name: "Van Staff", desc: "Vehicle routing and student transport attendance", perms: vanStaffPerms },
            { name: "Transport Manager", desc: "Fleet management", perms: transportPerms },
            { name: "Receptionist", desc: "Front desk operations", perms: receptionistPerms },
            { name: "HR Manager", desc: "Human resources and payroll", perms: hrManagerPerms },
            { name: "Academic Coordinator", desc: "Curriculum and teacher oversight", perms: academicCoordinatorPerms },
            { name: "Nurse", desc: "Health and wellness", perms: nursePerms },
            { name: "Driver", desc: "Transport operations", perms: driverPerms },
            { name: "Canteen Manager", desc: "Food and inventory management", perms: canteenManagerPerms },
            // Keeping Administrator as a legacy backup or alias
            { name: "Administrator", desc: "Full system access", perms: adminPerms, legacyAliases: ["Admin"] }
        ];

        const existingRoles = await prisma.role.findMany({
            where: { schoolId: school.id }
        });

        await prisma.role.createMany({
            data: defaults
                .filter(d => !existingRoles.some(r => r.name === d.name || d.legacyAliases?.includes(r.name)))
                .map(d => ({
                    schoolId: school.id,
                    name: d.name,
                    description: d.desc,
                    isDefault: true,
                    permissions: JSON.stringify(d.perms)
                })),
            skipDuplicates: true
        });

        revalidatePath(`/s/${schoolSlug}/hr/roles`);
        return { success: true };

    } catch (error: any) {
        console.error("Seed Roles Error:", error);
        return { success: false, error: error.message || "Failed to seed defaults" };
    }
}

// ==========================================
// AI-DRIVEN ROLE GENERATION
// ==========================================

export async function generateRolePermissionsAction(prompt: string, slug: string) {
    try {
        let model;
        try {
            const { apiKey, provider } = await resolveSchoolAIModel(slug);
            model = provider === 'google'
                ? createGoogleGenerativeAI({ apiKey })('gemini-2.5-flash')
                : createOpenAI({ apiKey })('gpt-4o');
        } catch (e) {
            console.warn("AI Key not found for school", slug, e);
            return { success: false, error: "AI is not configured for this school. Please add an API key in settings." };
        }

        // Simplify the modules list to pass context to the AI about allowed keys and actions
        const moduleMapContext = MODULES.map(m => {
            const flattenDescriptions = (mod: any): string[] => {
                let lines = [`- ${mod.key} (Actions: ${mod.permissions.join(", ")}) [Desc: ${mod.description}]`];
                if (mod.subModules) {
                    mod.subModules.forEach((sm: any) => {
                        lines.push(...flattenDescriptions(sm).map(l => "  " + l));
                    });
                }
                return lines;
            };
            return flattenDescriptions(m).join("\n");
        }).join("\n");

        const { object } = await generateObject({
            model,
            system: `You are an expert School ERP System Administrator configuring role-based access control (RBAC).
The user will describe a particular job role or permissions set.
Your job is to translate their prompt into a strict array of module permissions based on the available modules.

AVAILABLE MODULES MATRIX:
${moduleMapContext}

RULES:
1. ONLY return modules that exactly match the keys listed above (e.g. "students.profiles.health"). Do not make up module keys.
2. ONLY grant actions that the module explicitly supports (e.g. if the module only lists ["view", "edit"], do not grant "delete").
3. Be logical. If they ask for a "Bus Driver", give Transport, Students View, and maybe Diary View. Don't give them Billing access. Do give parent modules (like "transport") if giving a child module (like "transport.routes").
4. Try to be generous but secure. Ensure the role has what it needs to function based on the prompt.`,
            prompt: `Configure permissions for following role description: "${prompt}"`,
            schema: z.object({
                roleNameSuggestion: z.string().describe("What is a good concise name for this role based on the prompt?"),
                roleDescriptionSuggestion: z.string().describe("A professional one-sentence description of what this role does."),
                permissions: z.array(z.object({
                    module: z.string(),
                    actions: z.array(z.string())
                }))
            })
        });

        return { success: true, data: JSON.parse(JSON.stringify(object)) };

    } catch (error: any) {
        console.error("AI Role Generation Error:", error);
        return { success: false, error: "Failed to generate role with AI." };
    }
}
