"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStatsAction(slug: string, staffId?: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        students: true,
                        classrooms: true,
                        users: true, // Staff
                    }
                }
            }
        });

        if (!school) return { success: false, error: "School not found" };

        let stats = {
            totalStudents: school._count.students,
            activeStaff: school._count.users,
            totalClassrooms: school._count.classrooms,
            attendanceToday: "94%", // Placeholder for now
            revenue: "$12,450", // Placeholder for now
        };

        let recentActivity = [
            { id: 1, type: "Registration", name: "New Student Joined", time: "2 hours ago" },
            { id: 2, type: "Payment", name: "Fees Received", time: "4 hours ago" },
            { id: 3, type: "Alert", name: "Attendance marked", time: "5 hours ago" },
        ];

        // Customization for Staff
        if (staffId) {
            // Fetch accessible classrooms (Either Class Teacher OR Granted Access)
            const accessibleClassrooms = await prisma.classroom.findMany({
                where: {
                    schoolId: school.id,
                    OR: [
                        { teacherId: staffId },
                        { accesses: { some: { userId: staffId, canRead: true } } }
                    ]
                } as any,
                include: {
                    _count: {
                        select: { students: true }
                    }
                }
            });

            const studentCount = accessibleClassrooms.reduce((acc, curr) => acc + curr._count.students, 0);

            stats = {
                ...stats,
                totalClassrooms: accessibleClassrooms.length,
                totalStudents: studentCount,
                revenue: "N/A"
            };
        }

        return {
            success: true,
            stats,
            recentActivity,
            isPersonalized: !!staffId
        };
    } catch (error) {
        console.error("Dashboard Stats Error", error);
        return { success: false, error: "Failed to fetch dashboard data" };
    }
}
