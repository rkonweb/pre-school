"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAutomationRulesAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const rules = await prisma.leadAutomationRule.findMany({
            where: { schoolId: school.id }
        });

        return { success: true, rules };
    } catch (error) {
        return { success: false, error: "Failed to fetch rules" };
    }
}

export async function saveAutomationRuleAction(schoolSlug: string, data: any) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const rule = await prisma.leadAutomationRule.upsert({
            where: {
                schoolId_scoreBand: {
                    schoolId: school.id,
                    scoreBand: data.scoreBand
                }
            },
            create: {
                scoreBand: data.scoreBand,
                frequency: data.frequency,
                maxMessages: data.maxMessages,
                isEnabled: data.isEnabled ?? true,
                schoolId: school.id,
                allowedCats: Array.isArray(data.allowedCats) ? JSON.stringify(data.allowedCats) : data.allowedCats || '[]',
            },
            update: {
                frequency: data.frequency,
                maxMessages: data.maxMessages,
                isEnabled: data.isEnabled ?? true,
                allowedCats: Array.isArray(data.allowedCats) ? JSON.stringify(data.allowedCats) : data.allowedCats || '[]',
            }
        });

        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/automation`);
        return { success: true, rule };
    } catch (error) {
        console.error("Save Rule Error:", error);
        return { success: false, error: "Failed to save rule" };
    }
}

export async function getAutomationSummaryAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            include: {
                aiSettings: true
            }
        });

        if (!school) return { success: false, error: "School not found" };

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Calculate stats using Direct queries instead of iteration
        const [totalSent, responded, activeRulesCount] = await Promise.all([
            prisma.leadInteraction.count({
                where: {
                    OR: [
                        { lead: { schoolId: school.id } },
                        { admission: { schoolId: school.id } }
                    ],
                    type: "AUTOMATION",
                    createdAt: { gte: thirtyDaysAgo }
                }
            }),
            prisma.leadInteraction.count({
                where: {
                    OR: [
                        { lead: { schoolId: school.id } },
                        { admission: { schoolId: school.id } }
                    ],
                    type: "WHATSAPP_MSG",
                    createdAt: { gte: thirtyDaysAgo }
                }
            }),
            prisma.leadAutomationRule.count({
                where: { schoolId: school.id }
            })
        ]);

        // Get Pending Queue
        const pendingFollowUps = await prisma.followUp.findMany({
            where: {
                type: "WHATSAPP",
                status: "PENDING",
                OR: [
                    { lead: { schoolId: school.id } },
                    { admission: { schoolId: school.id } }
                ]
            },
            include: {
                lead: true,
                admission: true
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5
        });

        // Get Recent History
        const recentInteractions = await prisma.leadInteraction.findMany({
            where: {
                OR: [
                    { lead: { schoolId: school.id } },
                    { admission: { schoolId: school.id } }
                ],
                type: "AUTOMATION"
            },
            include: {
                lead: true,
                admission: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        const queue = pendingFollowUps.map(f => ({
            id: f.id,
            leadId: f.leadId || f.admissionId,
            leadName: f.admission?.studentName || f.lead?.parentName || "Unknown",
            type: "WhatsApp Sequence",
            scheduledAt: f.scheduledAt
        }));

        const history = recentInteractions.map(i => ({
            id: i.id,
            leadId: i.leadId || i.admissionId,
            leadName: i.admission?.studentName || i.lead?.parentName || "Unknown",
            content: i.content,
            createdAt: i.createdAt
        }));

        const settings = school.aiSettings ? {
            ...school.aiSettings,
            quietHours: JSON.parse(school.aiSettings.quietHours || "{\"start\":\"20:00\",\"end\":\"09:00\"}")
        } : {
            globalAutomationEnabled: false, // Default to false if never configured
            quietHours: { start: "20:00", end: "09:00" }
        };

        return {
            success: true,
            stats: {
                totalSent,
                responseRate: totalSent > 0 ? Math.round((responded / totalSent) * 100) : 0,
                activeRules: activeRulesCount,
                savedHours: Math.round(totalSent * 0.2)
            },
            queue,
            history,
            settings
        };
    } catch (error: any) {
        console.error("Automation Summary Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteQueuedAutomationAction(schoolSlug: string, id: string) {
    try {
        await prisma.followUp.delete({ where: { id } });
        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/automation`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to cancel automation" };
    }
}

export async function executeQueuedAutomationAction(schoolSlug: string, id: string) {
    try {
        const followUp = await prisma.followUp.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        // Log interaction as if it was sent
        await prisma.leadInteraction.create({
            data: {
                type: 'AUTOMATION',
                content: followUp.notes || "WhatsApp automation message sent (manual trigger)",
                leadId: followUp.leadId,
                admissionId: followUp.admissionId
            }
        });

        revalidatePath(`/s/${schoolSlug}/admissions/inquiry/automation`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to execute automation" };
    }
}
