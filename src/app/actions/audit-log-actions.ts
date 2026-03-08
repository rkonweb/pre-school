"use server";

import { prisma } from "@/lib/prisma";
import { validateUserSchoolAction } from "./session-actions";

export async function getAuditLogsAction(schoolSlug: string, query?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) {
            return { success: false, error: auth.error };
        }

        // Must be ADMIN or SUPER_ADMIN
        if (auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Unauthorized access" };
        }

        let whereClause: any = {
            school: { slug: schoolSlug }
        };

        if (query) {
            // Simple generic search
            whereClause = {
                ...whereClause,
                OR: [
                    { action: { contains: query, mode: "insensitive" } },
                    { details: { contains: query, mode: "insensitive" } },
                    { entityType: { contains: query, mode: "insensitive" } },
                    { 
                        user: { 
                            firstName: { contains: query, mode: "insensitive" } 
                        } 
                    },
                    {
                        user: {
                            lastName: { contains: query, mode: "insensitive" }
                        }
                    }
                ]
            };
        }

        const logs = await prisma.auditLog.findMany({
            where: whereClause,
            take: 100, // Limit to 100 on frontend for now
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        avatar: true,
                    }
                }
            }
        });

        return { success: true, data: JSON.parse(JSON.stringify(logs)) };
    } catch (error: any) {
        console.error("GET AUDIT LOGS ERROR:", error);
        return { success: false, error: error.message };
    }
}

export async function getSuspiciousLogsAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) {
            return { success: false, error: auth.error };
        }

        if (auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Unauthorized access" };
        }

        const suspiciousLogs = await prisma.auditLog.findMany({
            where: {
                school: { slug: schoolSlug },
                isSuspicious: true
            },
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        avatar: true,
                        mobile: true,
                    }
                }
            }
        });

        return { success: true, data: JSON.parse(JSON.stringify(suspiciousLogs)) };
    } catch (error: any) {
        console.error("GET SUSPICIOUS LOGS ERROR:", error);
        return { success: false, error: error.message };
    }
}

export async function dismissSuspiciousLogAction(schoolSlug: string, logId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) {
            return { success: false, error: auth.error };
        }

        if (auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Unauthorized access" };
        }

        await prisma.auditLog.update({
            where: {
                id: logId,
                school: { slug: schoolSlug }
            },
            data: {
                isSuspicious: false,
                aiAnalysis: `Dismissed by Admin - Previous analysis removed.`
            }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
