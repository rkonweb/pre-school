"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfToday, subDays } from "date-fns";

export async function getAdmissionsReportAction(slug: string, timeframe: string = "month") {
    try {
        const school = await prisma.school.findUnique({ where: { slug } });
        if (!school) return { success: false, error: "School not found" };

        let startDate: Date;
        const now = new Date();

        switch (timeframe) {
            case "today":
                startDate = startOfToday();
                break;
            case "week":
                startDate = subDays(now, 7);
                break;
            case "month":
                startDate = startOfMonth(now);
                break;
            case "90days":
                startDate = subDays(now, 90);
                break;
            default:
                startDate = startOfMonth(now);
        }

        // 1. Source ROI (Admissions grouped by source)
        const sourceData = await (prisma as any).admission.groupBy({
            by: ['source'],
            where: {
                schoolId: school.id,
                createdAt: { gte: startDate }
            },
            _count: { _all: true }
        });

        // Calculate conversion per source (Admitted leads / Total leads)
        const sourceMetrics = await Promise.all(sourceData.map(async (item: any) => {
            const admittedCount = await (prisma as any).admission.count({
                where: {
                    schoolId: school.id,
                    source: item.source,
                    stage: 'ADMITTED',
                    createdAt: { gte: startDate }
                }
            });
            return {
                source: item.source || "Unknown",
                count: item._count._all,
                admitted: admittedCount,
                rate: item._count._all > 0 ? (admittedCount / item._count._all) * 100 : 0
            };
        }));

        // 2. Funnel Data (Grouped by Stage)
        const stageData = await (prisma as any).admission.groupBy({
            by: ['stage'],
            where: {
                schoolId: school.id,
                createdAt: { gte: startDate }
            },
            _count: { _all: true }
        });

        const funnelStages = ["INQUIRY", "FOLLOWUP", "TOUR", "ADMITTED", "LOST"];
        const funnelMetrics = funnelStages.map(stage => {
            const found = stageData.find((s: any) => s.stage === stage);
            return {
                stage,
                count: found ? found._count._all : 0
            };
        });

        // 3. Staff Performance (Interactions logged by staff)
        const staffInteractions = await (prisma as any).leadInteraction.groupBy({
            by: ['staffId'],
            where: {
                admission: { schoolId: school.id },
                createdAt: { gte: startDate },
                staffId: { not: null }
            },
            _count: { _all: true }
        });

        const staffMetrics = await Promise.all(staffInteractions.map(async (item: any) => {
            const staff = await prisma.user.findUnique({
                where: { id: item.staffId },
                select: { name: true, image: true }
            });
            return {
                name: staff?.name || "System/Bot",
                image: staff?.image,
                interactions: item._count._all
            };
        }));

        // 4. Tour Metrics (Scheduled vs Completed)
        const totalTours = await (prisma as any).followUp.count({
            where: {
                admission: { schoolId: school.id },
                type: 'VISIT',
                createdAt: { gte: startDate }
            }
        });

        const completedTours = await (prisma as any).followUp.count({
            where: {
                admission: { schoolId: school.id },
                type: 'VISIT',
                status: 'COMPLETED',
                createdAt: { gte: startDate }
            }
        });

        return {
            success: true,
            data: {
                sources: sourceMetrics.sort((a, b) => b.count - a.count),
                funnel: funnelMetrics,
                staff: staffMetrics.sort((a, b) => b.interactions - a.interactions),
                tours: {
                    total: totalTours,
                    completed: completedTours,
                    rate: totalTours > 0 ? (completedTours / totalTours) * 100 : 0
                }
            }
        };
    } catch (error: any) {
        console.error("Reports Action Error:", error);
        return { success: false, error: "Failed to generate report" };
    }
}
