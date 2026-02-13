"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFollowUpsAction(schoolSlug: string, filters: { status?: string, type?: string, assignedToId?: string, range?: string } = {}) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        const baseWhere: any = {
            OR: [
                { lead: { schoolId: school.id } },
                { admission: { schoolId: school.id } }
            ]
        };

        const where: any = {
            ...baseWhere,
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.type ? { type: filters.type } : {}),
            ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : {})
        };

        // Handle date ranges for the new tabs
        if (filters.range === 'today') {
            where.scheduledAt = { gte: todayStart, lte: todayEnd };
            where.status = 'PENDING';
        } else if (filters.range === 'overdue') {
            where.scheduledAt = { lt: new Date() };
            where.status = 'PENDING';
        } else if (filters.range === 'upcoming') {
            where.scheduledAt = { gt: todayEnd };
            where.status = 'PENDING';
        }

        const [followUps, totalOverdue, totalToday] = await Promise.all([
            prisma.followUp.findMany({
                where,
                include: {
                    lead: true,
                    admission: true,
                    assignedTo: true
                },
                orderBy: { scheduledAt: 'asc' }
            }),
            prisma.followUp.count({
                where: { ...baseWhere, status: 'PENDING', scheduledAt: { lt: new Date() } }
            }),
            prisma.followUp.count({
                where: { ...baseWhere, status: 'PENDING', scheduledAt: { gte: todayStart, lte: todayEnd } }
            })
        ]);

        // Map admission to lead property for UI consistency if needed
        const mappedFollowUps = followUps.map(f => {
            const typedF = f as any;
            return {
                ...f,
                lead: typedF.admission ? {
                    id: typedF.admission.id,
                    parentName: typedF.admission.parentName,
                    childName: typedF.admission.studentName,
                    mobile: typedF.admission.parentPhone,
                    score: typedF.admission.score || 50
                } : typedF.lead
            };
        });

        return {
            success: true,
            followUps: mappedFollowUps,
            stats: {
                overdue: totalOverdue,
                today: totalToday
            }
        };
    } catch (error) {
        console.error("Fetch FollowUps Error:", error);
        return { success: false, error: "Failed to fetch follow-ups" };
    }
}

export async function completeFollowUpAction(schoolSlug: string, id: string, notes: string) {
    try {
        const followUp = await prisma.followUp.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                notes
            },
            include: { lead: true, admission: true }
        });

        const targetId = followUp.admissionId || followUp.leadId;

        if (targetId) {
            // Log interaction
            await prisma.leadInteraction.create({
                data: {
                    leadId: followUp.leadId,
                    admissionId: followUp.admissionId,
                    type: 'CALL_LOG',
                    content: `Follow-up ${followUp.type} completed: ${notes}`,
                    staffId: followUp.assignedToId
                }
            });

            // Update target's last action
            if (followUp.admissionId) {
                await prisma.admission.update({
                    where: { id: followUp.admissionId },
                    data: { lastMeaningfulActionAt: new Date() }
                });
            } else if (followUp.leadId) {
                await prisma.lead.update({
                    where: { id: followUp.leadId },
                    data: { lastMeaningfulActionAt: new Date() }
                });
            }

            revalidatePath(`/s/${schoolSlug}/admissions/inquiry/followups`);
            revalidatePath(`/s/${schoolSlug}/admissions/inquiry/${targetId}`);
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to complete follow-up" };
    }
}

export async function createFollowUpAction(schoolSlug: string, data: { leadId: string, type: string, scheduledAt: Date, notes?: string, assignedToId?: string }) {
    try {
        const admission = await prisma.admission.findUnique({ where: { id: data.leadId } });

        const createData: any = {
            type: data.type,
            scheduledAt: data.scheduledAt,
            notes: data.notes,
            assignedToId: data.assignedToId,
            status: 'PENDING'
        };

        if (admission) {
            createData.admissionId = data.leadId;
        } else {
            createData.leadId = data.leadId;
        }

        const followUp = await prisma.followUp.create({
            data: createData
        });

        // Update last action
        if (admission) {
            await prisma.admission.update({
                where: { id: data.leadId },
                data: { lastMeaningfulActionAt: new Date() }
            });
        } else {
            await prisma.lead.update({
                where: { id: data.leadId },
                data: { lastMeaningfulActionAt: new Date() }
            });
        }

        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/followups`);
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/${data.leadId}`);

        return { success: true, followUp };
    } catch (error) {
        console.error("Create FollowUp Error:", error);
        return { success: false, error: "Failed to create follow-up" };
    }
}

export async function deleteFollowUpAction(schoolSlug: string, id: string) {
    try {
        await prisma.followUp.delete({
            where: { id }
        });
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/followups`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete follow-up" };
    }
}

export async function rescheduleFollowUpAction(schoolSlug: string, id: string, scheduledAt: Date) {
    try {
        await prisma.followUp.update({
            where: { id },
            data: { scheduledAt }
        });
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/followups`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to reschedule follow-up" };
    }
}

