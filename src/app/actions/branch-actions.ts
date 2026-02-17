"use server";

import { prisma } from "@/lib/prisma";
import { validateUserSchoolAction } from "./session-actions";
import { revalidatePath } from "next/cache";

export async function getBranchesAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const branches = await prisma.branch.findMany({
            where: { school: { slug } },
            orderBy: { createdAt: 'asc' },
            include: {
                _count: {
                    select: {
                        students: true,
                        users: true
                    }
                }
            }
        });

        return { success: true, data: branches };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createBranchAction(slug: string, data: { name: string, address?: string, phone?: string, email?: string }) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        if (auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Permission denied" };
        }

        const school = await prisma.school.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { branches: true }
                }
            }
        });

        if (!school) return { success: false, error: "School not found" };

        if (school._count.branches >= school.maxBranches) {
            return { success: false, error: `Branch limit reached (${school.maxBranches}). Contact support to upgrade.` };
        }

        const branch = await prisma.branch.create({
            data: {
                name: data.name,
                address: data.address,
                phone: data.phone,
                email: data.email,
                schoolId: school.id,
                status: "ACTIVE"
            }
        });

        revalidatePath(`/s/${slug}/settings/branches`);
        revalidatePath(`/s/${slug}/dashboard`, 'layout'); // Update sidebar
        return { success: true, data: branch };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateBranchAction(slug: string, id: string, data: { name: string, address?: string, phone?: string, email?: string }) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        if (auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Permission denied" };
        }

        const branch = await prisma.branch.update({
            where: { id },
            data: {
                name: data.name,
                address: data.address,
                phone: data.phone,
                email: data.email
            }
        });

        revalidatePath(`/s/${slug}/settings/branches`);
        revalidatePath(`/s/${slug}/dashboard`, 'layout');
        return { success: true, data: branch };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteBranchAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        if (auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Permission denied" };
        }

        // Prevent deleting if has students or users
        const branch = await prisma.branch.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { students: true, users: true }
                }
            }
        });

        if (!branch) return { success: false, error: "Branch not found" };

        if (branch._count.students > 0 || branch._count.users > 0) {
            return { success: false, error: "Cannot delete branch with active students or staff." };
        }

        await prisma.branch.delete({ where: { id } });

        revalidatePath(`/s/${slug}/settings/branches`);
        revalidatePath(`/s/${slug}/dashboard`, 'layout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
