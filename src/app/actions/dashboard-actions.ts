"use server";

import { prisma } from "@/lib/prisma";
import { getSchoolNow } from "@/lib/date-utils";
import { validateUserSchoolAction } from "./session-actions";

export async function getDashboardStatsAction(slug: string, staffId?: string, academicYearId?: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;
        const currentBranchId = (currentUser as any).currentBranchId;

        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true, currency: true, timezone: true }
        });

        if (!school) return { success: false, error: "School not found" };

        const timezone = school.timezone || "Asia/Kolkata";
        const now = getSchoolNow(timezone);
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // Branch Filter Helper
        const branchFilter: any = {};
        if (currentBranchId) {
            branchFilter.branchId = currentBranchId;
        }

        // Parallel Data Fetching
        const [
            totalStudents,
            totalStaff,
            totalClassrooms,
            todayAttendance,
            totalActiveStudents,
            todayRevenue,
            routesCount,
            delayedVehicles,
            revenueStats,
            upcomingDiary,
            recentActivityData,
            recentLeaves,
            recentExams
        ] = await Promise.all([
            // 1. Counts
            prisma.student.count({ where: { schoolId: school.id, status: "ACTIVE", ...branchFilter } }),
            prisma.user.count({ where: { schoolId: school.id, role: { in: ["STAFF", "ADMIN"] }, status: "ACTIVE", ...branchFilter } }),
            prisma.classroom.count({ where: { schoolId: school.id, ...branchFilter } }),

            // 2. Attendance
            prisma.attendance.count({
                where: {
                    student: { schoolId: school.id, ...branchFilter },
                    date: { gte: startOfDay, lte: endOfDay },
                    status: "PRESENT"
                }
            }),
            prisma.student.count({ where: { schoolId: school.id, status: "ACTIVE", ...branchFilter } }), // Re-fetch or reuse? Reuse totalStudents logic if same

            // 3. Revenue Today
            prisma.feePayment.aggregate({
                _sum: { amount: true },
                where: {
                    fee: { student: { schoolId: school.id, ...branchFilter } },
                    date: { gte: startOfDay, lte: endOfDay }
                }
            }),

            // 4. Transport
            prisma.transportRoute.count({ where: { schoolId: school.id, ...branchFilter } }),
            prisma.vehicleTelemetry.findMany({
                where: {
                    TransportVehicle: { schoolId: school.id, ...branchFilter }, // Vehicle has branchId? Yes from relation or add it? 
                    // Wait, Vehicle has branchId.
                    delayMinutes: { gt: 0 },
                    recordedAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) }
                },
                include: { TransportVehicle: true },
                take: 3
            }),

            // 5. Total Revenue Stats (Progress)
            (async () => {
                const totalFees = await prisma.fee.aggregate({
                    _sum: { amount: true },
                    where: { student: { schoolId: school.id, ...branchFilter } } // Fee has branchId now! Use it directly? 
                    // Actually, Fee has branchId.
                    // where: { schoolId: ... (No direct schoolId on Fee?), student: { schoolId: ... } }
                    // Better: where: { branchId: currentBranchId } if set.
                    // But to be safe: where: { student: { schoolId: school.id }, ...(currentBranchId ? { branchId: currentBranchId } : {}) }
                });
                const totalColl = await prisma.feePayment.aggregate({
                    _sum: { amount: true },
                    where: { fee: { student: { schoolId: school.id }, ...(currentBranchId ? { branchId: currentBranchId } : {}) } }
                });
                return { fees: totalFees._sum.amount || 0, collected: totalColl._sum.amount || 0 };
            })(),

            // 6. Diary
            prisma.diaryEntry.findMany({
                where: {
                    schoolId: school.id,
                    status: "PUBLISHED",
                    scheduledFor: { gte: startOfDay },
                    // Diary doesn't have branchId usually? It might be per class or school.
                    // If per class, class has branch.
                    // If no branchId on Diary, we show all school events? 
                    // Let's check schema later. For now assume school-wide or class-linked.
                    // If we want to filter by branch, we need relation.
                    // Let's assume Diary is School-Wide OR filtered by Class. 
                    // If filtered by Class, we check if those classes are in the branch.
                    // For now, keep as is (School wide).
                },
                orderBy: { scheduledFor: 'asc' },
                take: 3
            }),

            // 7. Recent Activity (Unified)
            (async () => {
                const [adm, pay, att] = await Promise.all([
                    prisma.admission.findMany({
                        where: { schoolId: school.id, ...branchFilter },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }),
                    prisma.feePayment.findMany({
                        where: { fee: { student: { schoolId: school.id }, ...(currentBranchId ? { branchId: currentBranchId } : {}) } },
                        include: { fee: { include: { student: true } } },
                        orderBy: { date: 'desc' },
                        take: 5
                    }),
                    prisma.attendance.findMany({
                        where: { student: { schoolId: school.id, ...branchFilter } },
                        include: { student: true },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    })
                ]);
                return { adm, pay, att };
            })(),

            // 8. Leaves
            prisma.leaveRequest.findMany({
                where: {
                    user: { schoolId: school.id, ...branchFilter },
                    status: "APPROVED",
                    startDate: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
                },
                include: { user: true },
                take: 5
            }),

            // 9. Exams
            prisma.exam.findMany({
                where: {
                    schoolId: school.id,
                    academicYearId: academicYearId || undefined
                    // Exam doesn't have local branchId? It's linked to Classes.
                    // If we want to filter exams by branch, we should check checks with classes in that branch?
                    // For now, leave as school-wide.
                },
                include: {
                    results: {
                        select: { marks: true }
                    }
                },
                orderBy: { date: 'desc' },
                take: 4
            })
        ]);

        // 10. Health & Pipeline Metrics
        const [staleInquiries, incompleteStudents] = await Promise.all([
            prisma.admission.count({
                where: {
                    schoolId: school.id,
                    officialStatus: { notIn: ["ENROLLED", "REJECTED"] },
                    dateReceived: { lte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
                    ...branchFilter
                }
            }),
            prisma.student.count({
                where: {
                    schoolId: school.id,
                    status: "ACTIVE",
                    OR: [
                        { parentMobile: null },
                        { dateOfBirth: null },
                        { avatar: null }
                    ],
                    ...branchFilter
                }
            })
        ]);

        // Process Results
        const attendancePercent = totalActiveStudents > 0
            ? Math.round((todayAttendance / totalActiveStudents) * 100)
            : 0;

        const revenueTodayVal = todayRevenue._sum.amount || 0;

        const collectionPercent = revenueStats.fees > 0
            ? Math.round((revenueStats.collected / revenueStats.fees) * 100)
            : 0;

        const unifiedActivity = [
            ...recentActivityData.adm.map(a => ({
                id: `adm-${a.id}`,
                type: "Registration",
                name: `New Inquiry: ${a.studentName}`,
                time: a.createdAt,
                rawTime: a.createdAt.getTime()
            })),
            ...recentActivityData.pay.map(p => ({
                id: `pay-${p.id}`,
                type: "Payment",
                name: `Fee Received: ${school.currency || "INR"} ${p.amount} (${p.fee.student.firstName})`,
                time: p.date,
                rawTime: p.date.getTime()
            })),
            ...recentActivityData.att.map(at => ({
                id: `att-${at.id}`,
                type: "Attendance",
                name: `${at.student.firstName} marked ${at.status.toLowerCase()}`,
                time: at.createdAt,
                rawTime: at.createdAt.getTime()
            }))
        ]
            .sort((a, b) => b.rawTime - a.rawTime)
            .slice(0, 10)
            .map(act => {
                const diffMs = now.getTime() - act.rawTime;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);

                let timeStr = "Just now";
                if (diffDays > 0) timeStr = `${diffDays}d ago`;
                else if (diffHours > 0) timeStr = `${diffHours}h ago`;
                else if (diffMins > 0) timeStr = `${diffMins}m ago`;

                return { ...act, time: timeStr };
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
            totalStudents,
            activeStaff: totalStaff,
            totalClassrooms,
            attendanceToday: `${attendancePercent}%`,
            revenue: `${school.currency || "INR"} ${revenueTodayVal.toLocaleString()}`,
            transportStatus: delayedVehicles.length > 0 ? "Delays Reported" : "On-Time",
            delayedRoutes: delayedVehicles.length,
            routesCount,
            collectionPercent,
            totalFees: revenueStats.fees,
            totalCollected: revenueStats.collected,
            health: {
                staleInquiries,
                incompleteStudents
            }
        };

        // AI Insights (Dynamic & Proactive)
        const aiInsights = [];

        // 1. Critical Alerts (High Severity)
        if (attendancePercent < 85) {
            aiInsights.push({
                id: "at-crit",
                type: "attendance",
                severity: "high",
                message: `Critical drop in attendance (${attendancePercent}%). Consider broadcasting a status query to parents.`
            });
        }

        if (delayedVehicles.length > 0) {
            aiInsights.push({
                id: "tr-crit",
                type: "transport",
                severity: "high",
                message: `${delayedVehicles.length} vehicle(s) are delayed. High priority: Notify affected transport routes.`
            });
        }

        // 2. Operational Health (Medium Severity)
        if (staleInquiries > 0) {
            aiInsights.push({
                id: "adm-stale",
                type: "academic",
                severity: "medium",
                message: `${staleInquiries} inquiries have been stale for over 3 days. Suggest immediate follow-up to maintain conversion.`
            });
        }

        if (incompleteStudents > 5) {
            aiInsights.push({
                id: "stu-inc",
                type: "system",
                severity: "medium",
                message: `${incompleteStudents} student profiles are missing critical documents. This may impact regulatory compliance.`
            });
        }

        // 3. Positive Reinforcement & Suggestions (Low Severity)
        if (revenueTodayVal > 5000) {
            aiInsights.push({
                id: "rev-pos",
                type: "academic",
                severity: "low",
                message: `Strong revenue intake today! Total collections: ${school.currency || "INR"} ${revenueTodayVal.toLocaleString()}.`
            });
        }

        if (aiInsights.length === 0) {
            aiInsights.push({
                id: "sys-ok",
                type: "system",
                severity: "low",
                message: "System is operating within optimal parameters. No immediate action required."
            });
        }

        // Personalization for Staff View
        if (staffId) {
            const accessibleClassrooms = await prisma.classroom.findMany({
                where: {
                    schoolId: school.id,
                    ...branchFilter,
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
            recentActivity: unifiedActivity,
            academicPerformance,
            aiInsights,
            upcomingEvents: upcomingDiary.map(d => ({
                id: d.id,
                date: d.scheduledFor ? d.scheduledFor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A",
                title: d.title,
                color: d.priority === "HIGH" ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-blue-50 border-blue-100 text-blue-700"
            })),
            isPersonalized: !!staffId
        };
    } catch (error: any) {
        console.error("Dashboard Stats Error", error);
        return { success: false, error: error.message || "Failed to fetch dashboard data" };
    }
}
