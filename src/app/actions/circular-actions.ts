"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";

export async function createCircularAction(data: {
    schoolSlug: string;
    title: string;
    subject?: string;
    content?: string;
    type?: string;
    priority?: string;
    category?: string;
    targetClassIds?: string[];
    targetRoles?: string[];
    isPublished?: boolean;
    expiresAt?: string;
    fileUrl?: string;
    attachments?: string[];
}, authenticatedUser?: any) {
    try {
        let currentUser = authenticatedUser;
        if (!currentUser) {
            const auth = await validateUserSchoolAction(data.schoolSlug);
            if (!auth.success || !auth.user) return { success: false, error: auth.error };
            currentUser = auth.user;
        }

        // PERMISSION CHECK - Only Principal or specific roles can post
        const allowedRoles = ["PRINCIPAL", "ADMIN"]; // Explicitly allowed
        if (!allowedRoles.includes(currentUser.role.toUpperCase())) {
            return { success: false, error: "Only Principal or Admin can post circulars." };
        }

        const schoolId = currentUser.schoolId;
        if (!schoolId) return { success: false, error: "User has no assigned school" };

        const circular = await prisma.schoolCircular.create({
            data: {
                title: data.title,
                subject: data.subject || null,
                content: data.content || null,
                type: data.type || "CIRCULAR",
                priority: data.priority || "NORMAL",
                category: data.category || "GENERAL",
                targetClassIds: data.targetClassIds ? JSON.stringify(data.targetClassIds) : "[]",
                targetRoles: data.targetRoles ? JSON.stringify(data.targetRoles) : "[]",
                isPublished: data.isPublished || false,
                publishedAt: data.isPublished ? new Date() : null,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                fileUrl: data.fileUrl || null,
                attachments: data.attachments ? JSON.stringify(data.attachments) : "[]",
                schoolId: schoolId,
                authorId: currentUser.id,
            }
        });

        revalidatePath(`/s/${data.schoolSlug}/circulars`);
        return { success: true, data: JSON.parse(JSON.stringify(circular)) };
    } catch (error: any) {
        console.error("Create Circular Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getCircularsAction(schoolSlug: string, filters?: {
    type?: string;
    category?: string;
    isPublished?: boolean;
    targetRole?: string;
    targetClassId?: string;
}) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;

        const where: any = {
            schoolId: currentUser.schoolId
        };

        if (filters?.type) where.type = filters.type;
        if (filters?.category) where.category = filters.category;
        if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;

        // Role-based filtering for non-admins
        if (currentUser.role !== "ADMIN" && currentUser.role !== "PRINCIPAL" && currentUser.role !== "SUPER_ADMIN") {
            // Only show published ones
            where.isPublished = true;
            
            const rolesToMatch = [currentUser.role];
            if (currentUser.customRole?.name) {
                rolesToMatch.push(currentUser.customRole.name);
            }

            // Show if targeted to their role or "PUBLIC" (empty targetRoles)
            where.OR = [
                { targetRoles: "[]" },
                { targetRoles: "[\"PUBLIC\"]" },
                ...rolesToMatch.map(r => ({ targetRoles: { contains: `"${r}"` } }))
            ];

            // If user is a parent/student, also check targetClassIds
            // This would require more specific logic if we know the student's class
        }

        const circulars = await prisma.schoolCircular.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        designation: true
                    }
                }
            },
            orderBy: [
                { createdAt: "desc" }
            ]
        });

        return { success: true, data: JSON.parse(JSON.stringify(circulars)) };
    } catch (error: any) {
        console.error("Get Circulars Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getCircularAction(id: string, schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const circular = await prisma.schoolCircular.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        designation: true
                    }
                }
            }
        });

        if (!circular) return { success: false, error: "Circular not found" };
        if (circular.schoolId !== auth.user.schoolId) return { success: false, error: "Unauthorized" };

        return { success: true, data: JSON.parse(JSON.stringify(circular)) };
    } catch (error: any) {
        console.error("Get Circular Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateCircularAction(id: string, schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        
        const updateData: any = { ...data };
        if (data.targetClassIds) updateData.targetClassIds = JSON.stringify(data.targetClassIds);
        if (data.targetRoles) updateData.targetRoles = JSON.stringify(data.targetRoles);
        if (data.attachments) updateData.attachments = JSON.stringify(data.attachments);
        
        if (data.isPublished && !data.publishedAt) {
            updateData.publishedAt = new Date();
        }

        const circular = await prisma.schoolCircular.update({
            where: { id },
            data: updateData
        });

        revalidatePath(`/s/${schoolSlug}/circulars`);
        return { success: true, data: JSON.parse(JSON.stringify(circular)) };
    } catch (error: any) {
        console.error("Update Circular Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteCircularAction(id: string, schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        await prisma.schoolCircular.delete({
            where: { id }
        });

        revalidatePath(`/s/${schoolSlug}/circulars`);
        return { success: true };
    } catch (error: any) {
        console.error("Delete Circular Error:", error);
        return { success: false, error: error.message };
    }
}
