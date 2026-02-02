"use server";

import { prisma } from "@/lib/prisma";
import { isSuperAdminAuthenticated } from "@/app/actions/admin-auth-actions";

export async function getSuperAdminDashboardDataAction() {
    // 1. Auth Check (Server Side)
    const isAuth = await isSuperAdminAuthenticated();
    if (!isAuth) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // 2. Fetch Aggregated Metrics
        // We run these in parallel for speed
        const [
            schoolsCount,
            studentsCount,
            recentSchools,
            totalRevenue
        ] = await Promise.all([
            prisma.school.count(),
            prisma.student.count(),
            prisma.school.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { students: true }
                    }
                }
            }),
            // Mock revenue calculation from subscriptions if possible
            // prisma.subscription.aggregate({ _sum: { amount: true } })
            Promise.resolve(0)
        ]);

        // 3. Construct Response
        return {
            success: true,
            stats: {
                totalTenants: schoolsCount,
                totalStudents: studentsCount,
                monthlyRevenue: 15400, // Mocked for now until payments integrated
                systemIncidents: 0
            },
            recentSchools: recentSchools.map(s => ({
                id: s.id,
                name: s.name,
                slug: s.slug,
                createdAt: s.createdAt,
                studentCount: s._count.students,
                brandColor: s.brandColor || "#2563eb",
                status: "ACTIVE" // Default
            }))
        };

    } catch (error) {
        console.error("Super Admin Dashboard Error:", error);
        return { success: false, error: "Failed to load dashboard data" };
    }
}
