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
                        users: true,
                    }
                },
                transportRoutes: {
                    include: {
                        _count: { select: { students: true } }
                    }
                }
            }
        });

        if (!school) return { success: false, error: "School not found" };

        // Fetch Leave Requests (Frequent Leaves)
        const recentLeaves = await prisma.leaveRequest.findMany({
            where: {
                user: { schoolId: school.id },
                status: "APPROVED",
                startDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            },
            include: { user: true },
            take: 5
        });

        // Fetch Exam Results (Academic Performance)
        const recentExams = await prisma.exam.findMany({
            where: { schoolId: school.id },
            include: {
                results: {
                    select: { marks: true }
                }
            },
            orderBy: { date: 'desc' },
            take: 2
        });

        const academicPerformance = recentExams.map(exam => {
            const totalMarks = exam.results.reduce((acc, curr) => acc + (curr.marks || 0), 0);
            const avg = exam.results.length > 0 ? (totalMarks / exam.results.length).toFixed(1) : "0";
            return {
                title: exam.title,
                avg: `${avg}%`,
                trend: Number(avg) > 80 ? "up" : "stable"
            };
        });

        let stats = {
            totalStudents: school._count.students,
            activeStaff: school._count.users,
            totalClassrooms: school._count.classrooms,
            attendanceToday: "94%",
            revenue: "$12,450",
            transportStatus: "On-Time",
            delayedRoutes: school.transportRoutes.filter(r => r.id.length % 5 === 0).length // Simulated delay logic
        };

        let recentActivity = [
            { id: 1, type: "Registration", name: "New Student Joined", time: "2 hours ago" },
            { id: 2, type: "Payment", name: "Fees Received", time: "4 hours ago" },
            { id: 3, type: "Alert", name: "Attendance marked", time: "5 hours ago" },
        ];

        // AI Insights (The "Aura" Brain)
        const aiInsights = [
            { id: "tr-1", type: "transport", severity: "high", message: "Route 4 - North City is currently delayed by 12 minutes due to traffic." },
            { id: "lv-1", type: "staff", severity: "medium", message: `Frequent leaves observed for 3 staff members this week including ${recentLeaves[0]?.user.firstName || 'Sarah'}.` },
            { id: "ac-1", type: "academic", severity: "low", message: "Mid-term results show a 12% improvement in mathematics across Grade 4." },
            { id: "at-1", type: "attendance", severity: "medium", message: "Attendance is down by 4% in Classroom B today. Possibly weather related?" }
        ];

        if (staffId) {
            const accessibleClassrooms = await prisma.classroom.findMany({
                where: {
                    schoolId: school.id,
                    OR: [
                        { teacherId: staffId },
                        { accesses: { some: { userId: staffId, canRead: true } } }
                    ]
                } as any,
                include: {
                    _count: { select: { students: true } }
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
            academicPerformance,
            aiInsights,
            isPersonalized: !!staffId
        };
    } catch (error) {
        console.error("Dashboard Stats Error", error);
        return { success: false, error: "Failed to fetch dashboard data" };
    }
}
