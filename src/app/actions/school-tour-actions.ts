"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSchoolToursAction(schoolSlug: string, filters: { range?: string } = {}) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        const baseWhere: any = {
            type: 'VISIT' as const,
            OR: [
                { lead: { schoolId: school.id } },
                { admission: { schoolId: school.id } }
            ]
        };

        let where = { ...baseWhere };

        // Apply range filters
        if (filters.range === 'today') {
            where.scheduledAt = { gte: todayStart, lte: todayEnd };
            where.status = 'PENDING';
        } else if (filters.range === 'overdue') {
            where.scheduledAt = { lt: todayStart };
            where.status = 'PENDING';
        } else if (filters.range === 'upcoming') {
            where.scheduledAt = { gt: todayEnd };
            where.status = 'PENDING';
        } else if (filters.range === 'completed') {
            where.status = 'COMPLETED';
        }

        const [tours, totalOverdue, totalToday] = await Promise.all([
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
                where: { ...baseWhere, status: 'PENDING', scheduledAt: { lt: todayStart } }
            }),
            prisma.followUp.count({
                where: { ...baseWhere, status: 'PENDING', scheduledAt: { gte: todayStart, lte: todayEnd } }
            })
        ]);

        // Map admission to lead property for UI consistency
        const mappedTours = tours.map(t => {
            const typedT = t as any;
            return {
                ...t,
                lead: typedT.admission ? {
                    id: typedT.admission.id,
                    parentName: typedT.admission.parentName,
                    childName: typedT.admission.studentName,
                    mobile: typedT.admission.parentPhone,
                    score: typedT.admission.score || 50
                } : typedT.lead
            };
        });

        return {
            success: true,
            tours: mappedTours,
            stats: {
                overdue: totalOverdue,
                today: totalToday
            }
        };
    } catch (error) {
        console.error("Fetch tours error:", error);
        return { success: false, error: "Failed to fetch tours" };
    }
}

export async function deleteTourAction(schoolSlug: string, id: string) {
    try {
        await prisma.followUp.delete({ where: { id } });
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/tours`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete tour" };
    }
}

export async function rescheduleTourAction(schoolSlug: string, id: string, scheduledAt: Date) {
    try {
        await prisma.followUp.update({
            where: { id },
            data: { scheduledAt, status: 'PENDING' }
        });
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/tours`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to reschedule tour" };
    }
}

export async function completeTourAction(schoolSlug: string, id: string, notes: string) {
    try {
        const tour = await prisma.followUp.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                notes: notes,
                completedAt: new Date()
            }
        });

        // Log interaction
        await prisma.leadInteraction.create({
            data: {
                type: 'VISIT',
                content: `School Tour Completed: ${notes}`,
                leadId: tour.leadId,
                admissionId: tour.admissionId
            }
        });

        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/tours`);
        return { success: true };
    } catch (error) {
        console.error("Complete tour error:", error);
        return { success: false, error: "Failed to complete tour" };
    }
}

export async function bookTourAction(schoolSlug: string, data: { leadId: string, scheduledAt: Date, assignedToId?: string, notes?: string }) {
    try {
        const admission = await prisma.admission.findUnique({ where: { id: data.leadId } });

        const createData: any = {
            type: 'VISIT',
            scheduledAt: data.scheduledAt,
            assignedToId: data.assignedToId,
            notes: data.notes,
            status: 'PENDING'
        };

        if (admission) {
            createData.admissionId = data.leadId;
        } else {
            createData.leadId = data.leadId;
        }

        const tour = await prisma.followUp.create({
            data: createData
        });

        // Update lead/admission tour status
        if (admission) {
            await prisma.admission.update({
                where: { id: data.leadId },
                data: {
                    tourStatus: 'SCHEDULED',
                    marketingStatus: 'TOUR_SCHEDULED'
                }
            });
        } else {
            await prisma.lead.update({
                where: { id: data.leadId },
                data: {
                    tourStatus: 'SCHEDULED',
                    status: 'TOUR_SCHEDULED'
                }
            });
        }

        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/tours`);
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/${data.leadId}`);

        return { success: true, tour };
    } catch (error) {
        return { success: false, error: "Failed to book tour" };
    }
}
