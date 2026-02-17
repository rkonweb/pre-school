"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CreateLeadInput = {
    parentName: string;
    mobile: string;
    childName: string;
    childAge?: number;
    childDOB?: string;
    programInterested?: string;
    preferredBranchId?: string;
    source?: string;
    status?: string;
    priority?: string;
    counsellorId?: string;
    isReferral?: boolean;
    consentWhatsApp?: boolean;
    consentCalls?: boolean;
};

export async function createLeadAction(schoolSlug: string, data: CreateLeadInput) {
    try {
        console.log("Create Lead Start - Slug:", schoolSlug);
        console.log("Available Prisma Models:", Object.keys(prisma).filter(k => !k.startsWith('_')));

        if (!(prisma as any).lead) {
            console.error("CRITICAL: prisma.lead is UNDEFINED. Prisma client may need regeneration.");
            return { success: false, error: "Database Client Error: Lead model is missing from the generated client. Please run 'npx prisma generate'." };
        }

        console.log("Create Lead Data:", JSON.stringify(data, null, 2));

        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) {
            console.error("Create Lead Error: School not found for slug", schoolSlug);
            return { success: false, error: "School not found" };
        }

        const createData = {
            ...data,
            counsellorId: data.counsellorId || undefined,
            preferredBranchId: data.preferredBranchId || undefined,
            programInterested: data.programInterested || undefined,
            childDOB: data.childDOB ? new Date(data.childDOB) : null,
            schoolId: school.id,
            status: data.status || "NEW",
        };
        console.log("Prisma Create Data:", JSON.stringify(createData, null, 2));

        const lead = await prisma.lead.create({
            data: createData
        });

        console.log("Lead Created Successfully:", lead.id);

        // Create initial interaction log
        await prisma.leadInteraction.create({
            data: {
                leadId: lead.id,
                type: "AUTOMATION",
                content: `Lead captured via ${data.source || 'Direct Source'}.`,
            }
        });

        await syncLead(lead.id);

        revalidatePath(`/s/${schoolSlug}/admissions/inquiry`);
        return { success: true, leadId: lead.id };
    } catch (error: any) {
        console.error("CRITICAL: Create Lead Error:", error);
        return { success: false, error: `Backend Error: ${error.message}\nStack: ${error.stack}` };
    }
}

import { syncLead } from "@/lib/search-sync";

export async function getLeadByIdAction(leadId: string) {
    try {
        // Try to find in Admission first (Primary Source)
        const admission = await prisma.admission.findUnique({
            where: { id: leadId },
            include: {
                counsellor: true,
                interactions: {
                    include: { staff: true },
                    orderBy: { createdAt: 'desc' }
                },
                followUps: {
                    include: { assignedTo: true },
                    orderBy: { scheduledAt: 'desc' }
                }
            }
        });

        if (admission) {
            // Map Admission to Lead shape for frontend compatibility
            const lead: any = {
                ...admission,
                childName: admission.studentName,
                mobile: admission.parentPhone || admission.fatherPhone || admission.motherPhone,
                email: admission.parentEmail || admission.fatherEmail || admission.motherEmail,
                status: admission.marketingStatus,
                programInterested: admission.enrolledGrade,
                source: admission.source || "Direct",
                childAge: admission.dateOfBirth ? new Date().getFullYear() - admission.dateOfBirth.getFullYear() : null,
                interactions: admission.interactions.map(i => ({
                    ...i,
                    leadId: admission.id // Ensure ID matches
                })),
                followUps: admission.followUps.map(f => ({
                    ...f,
                    leadId: admission.id
                }))
            };
            return { success: true, lead };
        }

        // Fallback to Lead table (Legacy)
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                branch: true,
                counsellor: true,
                interactions: {
                    include: { staff: true },
                    orderBy: { createdAt: 'desc' }
                },
                followUps: {
                    include: { assignedTo: true },
                    orderBy: { scheduledAt: 'desc' }
                }
            }
        });

        if (!lead) return { success: false, error: "Lead not found" };

        return { success: true, lead };
    } catch (error) {
        console.error("Get Lead By ID Error:", error);
        return { success: false, error: "Failed to fetch lead details" };
    }
}

export async function updateLeadAction(schoolSlug: string, id: string, data: Partial<CreateLeadInput> & { officialStatus?: string }) {
    try {
        const admission = await prisma.admission.findUnique({ where: { id } });

        if (admission) {
            // Map updates to Admission Schema
            const updateData: any = {};
            if (data.status) updateData.marketingStatus = data.status;
            if (data.counsellorId !== undefined) updateData.counsellorId = data.counsellorId || null;
            if (data.childDOB) updateData.dateOfBirth = new Date(data.childDOB);
            if (data.programInterested) updateData.enrolledGrade = data.programInterested;
            // Add other fields as necessary

            const updated = await prisma.admission.update({
                where: { id },
                data: updateData
            });
            await syncLead(id);
            revalidatePath(`/s/${schoolSlug}/admissions/inquiry`);
            revalidatePath(`/s/${schoolSlug}/admissions/inquiry/${id}`);
            return { success: true, lead: updated };
        }

        const updateData: any = { ...data };
        if (data.childDOB) updateData.childDOB = new Date(data.childDOB);
        if (data.counsellorId === "") updateData.counsellorId = null;
        if (data.preferredBranchId === "") updateData.preferredBranchId = null;
        if (data.programInterested === "") updateData.programInterested = null;

        const lead = await prisma.lead.update({
            where: { id },
            data: updateData
        });

        await syncLead(id);
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry`);
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/${id}`);
        return { success: true, lead };
    } catch (error) {
        console.error("Update Lead Error:", error);
        return { success: false, error: "Failed to update lead" };
    }
}

// ... (getLeadsAction remains largely for legacy or needs update if list view used widely)
// Skipping getLeadsAction update for now as instructions focused on Dashboard flow/Creation.

export async function assignLeadAction(schoolSlug: string, leadId: string, counsellorId: string) {
    try {
        const admission = await prisma.admission.findUnique({ where: { id: leadId } });

        if (admission) {
            await prisma.admission.update({
                where: { id: leadId },
                data: { counsellorId }
            });

            await prisma.leadInteraction.create({
                data: {
                    admissionId: leadId,
                    type: "STATUS_CHANGE",
                    content: `Lead assigned to counsellor.`,
                    staffId: counsellorId,
                }
            });
            revalidatePath(`/s/${schoolSlug}/admissions/inquiry`);
            return { success: true };
        }

        await prisma.lead.update({
            where: { id: leadId },
            data: { counsellorId }
        });

        // Log interaction
        await prisma.leadInteraction.create({
            data: {
                leadId,
                type: "STATUS_CHANGE",
                content: `Lead assigned to counsellor.`,
                staffId: counsellorId,
            }
        });

        revalidatePath(`/s/${schoolSlug}/admissions/inquiry`);
        return { success: true };
    } catch (error) {
        console.error("Assign Lead Error:", error);
        return { success: false, error: "Failed to assign lead" };
    }
}

export async function getLeadStatsAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalToday, totalWeek, totalMonth, totalAll, enrolledCount, statusGroups, overdueCount, staffStats] = await Promise.all([
            prisma.admission.count({ where: { schoolId: school.id, createdAt: { gte: startOfToday } } }),
            prisma.admission.count({ where: { schoolId: school.id, createdAt: { gte: startOfWeek } } }),
            prisma.admission.count({ where: { schoolId: school.id, createdAt: { gte: startOfMonth } } }),
            prisma.admission.count({ where: { schoolId: school.id } }),
            prisma.admission.count({ where: { schoolId: school.id, stage: 'ENROLLED' } }),
            prisma.admission.groupBy({
                by: ['marketingStatus'],
                where: { schoolId: school.id },
                _count: { _all: true }
            }),
            prisma.followUp.count({
                where: {
                    OR: [
                        { admission: { schoolId: school.id } },
                        { lead: { schoolId: school.id } }
                    ],
                    status: 'PENDING',
                    scheduledAt: { lt: new Date() }
                }
            }),
            prisma.admission.groupBy({
                by: ['counsellorId'],
                where: { schoolId: school.id, counsellorId: { not: null } },
                _count: { _all: true },
            })
        ]);

        // Fetch staff names for the top performers
        const counsellorIds = staffStats.map(s => s.counsellorId as string);
        const counsellors = await prisma.user.findMany({
            where: { id: { in: counsellorIds } },
            select: { id: true, firstName: true, lastName: true, role: true }
        });

        const staffPerformance = staffStats.map(stat => {
            const counsellor = counsellors.find(c => c.id === stat.counsellorId);
            return {
                name: counsellor ? `${counsellor.firstName} ${counsellor.lastName}` : 'Unknown',
                count: stat._count._all,
                conversion: "N/A"
            };
        }).sort((a, b) => b.count - a.count).slice(0, 3);

        const conversionRate = totalAll > 0 ? Math.round((enrolledCount / totalAll) * 100) : 0;

        // Map marketingStatus to the UI's expected 'status' key
        const mappedStatusGroups = statusGroups.map(g => ({
            status: g.marketingStatus,
            _count: g._count
        }));

        return {
            success: true,
            stats: {
                today: totalToday,
                week: totalWeek,
                month: totalMonth,
                total: totalAll,
                conversionRate: `${conversionRate}%`,
                overdueCount,
                byStatus: mappedStatusGroups,
                staffPerformance
            }
        };
    } catch (error) {
        console.error("Get Lead Stats Error:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}

export async function getBranchesAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const branches = await prisma.branch.findMany({
            where: { schoolId: school.id },
            orderBy: { name: 'asc' }
        });

        return { success: true, branches };
    } catch (error) {
        console.error("Get Branches Error:", error);
        return { success: false, error: "Failed to fetch branches" };
    }
}

export async function getCounsellorsAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const counsellors = await prisma.user.findMany({
            where: {
                schoolId: school.id,
                // roles that can be counsellors
                OR: [
                    { role: 'ADMIN' },
                    { role: 'STAFF' }
                ]
            },
            select: { id: true, firstName: true, lastName: true },
            orderBy: { firstName: 'asc' }
        });

        return { success: true, counsellors };
    } catch (error) {
        console.error("Get Counsellors Error:", error);
        return { success: false, error: "Failed to fetch counsellors" };
    }
}

export async function addLeadNoteAction(schoolSlug: string, leadId: string, content: string) {
    try {
        const admission = await prisma.admission.findUnique({ where: { id: leadId } });

        if (admission) {
            await prisma.leadInteraction.create({
                data: {
                    admissionId: leadId,
                    type: "NOTE",
                    content,
                }
            });
            revalidatePath(`/s/${schoolSlug}/admissions/inquiry/${leadId}`);
            return { success: true };
        }

        await prisma.leadInteraction.create({
            data: {
                leadId,
                type: "NOTE",
                content,
                // In a real app, we'd get the current user ID here from session
                // staffId: session.user.id 
            }
        });

        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/${leadId}`);
        return { success: true };
    } catch (error) {
        console.error("Add Note Error:", error);
        return { success: false, error: "Failed to add note" };
    }
}

export async function getLeadsAction(schoolSlug: string, filters: {
    status?: string;
    branchId?: string; // Not used for Admission yet
    counsellorId?: string;
    searchTerm?: string;
} = {}) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const where: any = {
            schoolId: school.id,
            // Use marketingStatus for status filtering
            ...(filters.status && filters.status !== 'all' ? { marketingStatus: filters.status } : {}),
            ...(filters.counsellorId && filters.counsellorId !== 'all' ? { counsellorId: filters.counsellorId } : {}),
            ...(filters.searchTerm ? {
                OR: [
                    { parentName: { contains: filters.searchTerm } },
                    { studentName: { contains: filters.searchTerm } },
                    { parentPhone: { contains: filters.searchTerm } },
                    { fatherPhone: { contains: filters.searchTerm } },
                    { motherPhone: { contains: filters.searchTerm } },
                ]
            } : {})
        };

        const admissions = await prisma.admission.findMany({
            where,
            include: {
                // branch: true,
                counsellor: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to Lead shape
        const leads = admissions.map(a => ({
            ...a,
            childName: a.studentName,
            mobile: a.parentPhone || a.fatherPhone || a.motherPhone || "",
            email: a.parentEmail || a.fatherEmail || a.motherEmail || "",
            status: a.marketingStatus, // CRM Status
            programInterested: a.enrolledGrade,
            source: a.source || "Direct",
            // Add other fields to satisfy type if needed
            // lead.branch is expected in UI?
            branch: null // Admission has no branch relation yet
        }));

        return { success: true, leads };
    } catch (error) {
        console.error("Get Leads Error:", error);
        return { success: false, error: "Failed to fetch leads" };
    }
}

export async function getRecentActivityAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const activities = await prisma.leadInteraction.findMany({
            where: {
                // Fetch interactions linked to Admissions OR Leads (during transition)
                // But primarily Admissions now
                OR: [
                    { admission: { schoolId: school.id } },
                    { lead: { schoolId: school.id } }
                ]
            },
            include: {
                lead: {
                    select: { id: true, parentName: true, childName: true }
                },
                admission: {
                    select: { id: true, parentName: true, studentName: true }
                },
                staff: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Map to a common shape
        const mappedActivities = activities.map(a => ({
            ...a,
            lead: a.admission ? {
                id: a.admission.id,
                parentName: a.admission.parentName,
                childName: a.admission.studentName
            } : a.lead
        })).filter(a => a.lead); // Ensure we have a valid target

        return { success: true, activities: mappedActivities };
    } catch (error) {
        console.error("Get Recent Activity Error:", error);
        return { success: false, error: "Failed to fetch activity" };
    }
}
