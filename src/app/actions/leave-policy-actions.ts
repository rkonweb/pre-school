"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLeavePoliciesAction(schoolSlug: string) {
    try {
        const policies = await prisma.leavePolicy.findMany({
            where: { school: { slug: schoolSlug } },
            include: { leaveTypes: true }
        });
        return { success: true, data: policies };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createLeavePolicyAction(schoolSlug: string, data: any) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug }
        });

        if (!school) return { success: false, error: "School not found" };

        const policy = await (prisma as any).leavePolicy.create({
            data: {
                name: data.name,
                description: data.description,
                effectiveFrom: new Date(data.effectiveFrom),
                isDefault: data.isDefault || false,
                schoolId: school.id,

                // Punctuality
                lateComingGrace: Number(data.lateComingGrace || 15),
                lateComingMax: Number(data.lateComingMax || 60),
                earlyLeavingGrace: Number(data.earlyLeavingGrace || 15),
                earlyLeavingMax: Number(data.earlyLeavingMax || 60),

                // Attendance Calculation
                minFullDayHours: Number(data.minFullDayHours || 8.0),
                minHalfDayHours: Number(data.minHalfDayHours || 4.0),
                maxDailyPunchEvents: Number(data.maxDailyPunchEvents || 10),

                // Role Link
                roleId: data.roleId || null,

                // Permissions
                permissionAllowed: data.permissionAllowed ?? true,
                permissionMaxMins: Number(data.permissionMaxMins || 120),
                permissionMaxOccur: Number(data.permissionMaxOccur || 2),
                minPunchGapMins: Number(data.minPunchGapMins || 0),

                leaveTypes: {
                    create: data.leaveTypes.map((lt: any) => ({
                        name: lt.name,
                        code: lt.code,
                        totalDays: Number(lt.totalDays),
                        canCarryForward: lt.canCarryForward || false,
                        maxCarryForward: Number(lt.maxCarryForward || 0),
                        isPaid: lt.isPaid ?? true,
                        allowHalfDay: lt.allowHalfDay ?? true,
                        minNoticePeriod: Number(lt.minNoticePeriod || 0),
                        requiresApproval: lt.requiresApproval ?? true,
                        gender: lt.gender || "ALL"
                    }))
                }
            } as any,
            include: {
                leaveTypes: true
            }
        });

        revalidatePath(`/s/${schoolSlug}/settings`);
        return { success: true, data: policy };
    } catch (error: any) {
        console.error("Create Policy Error:", error);
        if (error.message?.includes("Unknown argument")) {
            return { success: false, error: "Database schema update pending. Please STOP and RESTART your server to unlock new features." };
        }
        return { success: false, error: error.message };
    }
}

export async function deleteLeavePolicyAction(schoolSlug: string, id: string) {
    try {
        await prisma.leavePolicy.delete({
            where: { id }
        });
        revalidatePath(`/s/${schoolSlug}/settings`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLeavePolicyAction(schoolSlug: string, policyId: string, data: any) {
    try {
        const policy = await (prisma as any).leavePolicy.update({
            where: { id: policyId },
            data: {
                name: data.name,
                description: data.description,
                effectiveFrom: new Date(data.effectiveFrom),
                isDefault: data.isDefault || false,

                // Punctuality
                lateComingGrace: Number(data.lateComingGrace || 15),
                lateComingMax: Number(data.lateComingMax || 60),
                earlyLeavingGrace: Number(data.earlyLeavingGrace || 15),
                earlyLeavingMax: Number(data.earlyLeavingMax || 60),

                // Attendance Calculation
                minFullDayHours: Number(data.minFullDayHours || 8.0),
                minHalfDayHours: Number(data.minHalfDayHours || 4.0),
                maxDailyPunchEvents: Number(data.maxDailyPunchEvents || 10),

                // Role Link
                roleId: data.roleId || null,

                // Permissions
                permissionAllowed: data.permissionAllowed ?? true,
                permissionMaxMins: Number(data.permissionMaxMins || 120),
                permissionMaxOccur: Number(data.permissionMaxOccur || 2),
                minPunchGapMins: Number(data.minPunchGapMins || 0),

                // Recreate Leave Types for simplicity (or update existing)
                // For a robust implementation, we might want to diff them, 
                // but delete/create is safer for this schema structure
                leaveTypes: {
                    deleteMany: {},
                    create: data.leaveTypes.map((lt: any) => ({
                        name: lt.name,
                        code: lt.code,
                        totalDays: Number(lt.totalDays),
                        canCarryForward: lt.canCarryForward || false,
                        maxCarryForward: Number(lt.maxCarryForward || 0),
                        isPaid: lt.isPaid ?? true,
                        allowHalfDay: lt.allowHalfDay ?? true,
                        minNoticePeriod: Number(lt.minNoticePeriod || 0),
                        requiresApproval: lt.requiresApproval ?? true,
                        gender: lt.gender || "ALL"
                    }))
                }
            } as any,
            include: {
                leaveTypes: true
            }
        });

        revalidatePath(`/s/${schoolSlug}/settings`);
        return { success: true, data: policy };
    } catch (error: any) {
        console.error("Update Policy Error:", error);
        if (error.message?.includes("Unknown argument")) {
            return { success: false, error: "Database schema update pending. Please STOP and RESTART your server to unlock new features." };
        }
        return { success: false, error: error.message };
    }
}
