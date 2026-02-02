"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSchoolAdminsAction(schoolId: string) {
    try {
        if (!schoolId) {
            return { success: false, error: "School ID is required" };
        }

        const admins: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM User WHERE schoolId = ? AND role = 'ADMIN' ORDER BY createdAt DESC`,
            schoolId
        );

        return {
            success: true,
            data: admins.map(admin => ({
                ...admin,
                joiningDate: admin.joiningDate ? new Date(admin.joiningDate) : null,
                dateOfBirth: admin.dateOfBirth ? new Date(admin.dateOfBirth) : null,
                createdAt: new Date(admin.createdAt),
                updatedAt: new Date(admin.updatedAt),
            }))
        };
    } catch (error: any) {
        console.error("getSchoolAdminsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createAdminAction(schoolId: string, data: {
    mobile: string;
    email?: string;
    firstName: string;
    lastName: string;
    designation?: string;
    department?: string;
}) {
    try {
        // Check if mobile already exists
        const existing: any[] = await prisma.$queryRawUnsafe(
            `SELECT id FROM User WHERE mobile = ?`,
            data.mobile
        );

        if (existing.length > 0) {
            return { success: false, error: "Mobile number already registered" };
        }

        const id = Math.random().toString(36).substr(2, 9);

        await prisma.$executeRawUnsafe(
            `INSERT INTO User (id, mobile, email, firstName, lastName, designation, department, role, schoolId, status, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'ADMIN', ?, 'ACTIVE', datetime('now'), datetime('now'))`,
            id,
            data.mobile,
            data.email || null,
            data.firstName,
            data.lastName,
            data.designation || null,
            data.department || null,
            schoolId
        );

        revalidatePath(`/s/[slug]/settings/admin`);
        return { success: true, data: { id } };
    } catch (error: any) {
        console.error("createAdminAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateAdminAction(userId: string, data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    designation?: string;
    department?: string;
    status?: string;
}) {
    try {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.email !== undefined) {
            updates.push("email = ?");
            values.push(data.email);
        }
        if (data.firstName !== undefined) {
            updates.push("firstName = ?");
            values.push(data.firstName);
        }
        if (data.lastName !== undefined) {
            updates.push("lastName = ?");
            values.push(data.lastName);
        }
        if (data.designation !== undefined) {
            updates.push("designation = ?");
            values.push(data.designation);
        }
        if (data.department !== undefined) {
            updates.push("department = ?");
            values.push(data.department);
        }
        if (data.status !== undefined) {
            updates.push("status = ?");
            values.push(data.status);
        }

        updates.push("updatedAt = datetime('now')");
        values.push(userId);

        await prisma.$executeRawUnsafe(
            `UPDATE User SET ${updates.join(", ")} WHERE id = ?`,
            ...values
        );

        revalidatePath(`/s/[slug]/settings/admin`);
        return { success: true };
    } catch (error: any) {
        console.error("updateAdminAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAdminAction(userId: string) {
    try {
        await prisma.$executeRawUnsafe(
            `DELETE FROM User WHERE id = ?`,
            userId
        );

        revalidatePath(`/s/[slug]/settings/admin`);
        return { success: true };
    } catch (error: any) {
        console.error("deleteAdminAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleAdminStatusAction(userId: string) {
    try {
        const users: any[] = await prisma.$queryRawUnsafe(
            `SELECT status FROM User WHERE id = ?`,
            userId
        );

        if (users.length === 0) {
            return { success: false, error: "User not found" };
        }

        const newStatus = users[0].status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        await prisma.$executeRawUnsafe(
            `UPDATE User SET status = ?, updatedAt = datetime('now') WHERE id = ?`,
            newStatus,
            userId
        );

        revalidatePath(`/s/[slug]/settings/admin`);
        return { success: true, data: { status: newStatus } };
    } catch (error: any) {
        console.error("toggleAdminStatusAction Error:", error);
        return { success: false, error: error.message };
    }
}
