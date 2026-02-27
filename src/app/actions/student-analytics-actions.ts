"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserAction } from "./session-actions";

export interface BulkSmartAnalytics {
    [studentId: string]: any; // Same structure as SmartAnalytics
}

export interface StudentAnalytics {
    student: {
        id: string;
        name: string;
        grade: string;
        admissionNumber: string | null;
        avatar: string | null;
    };
    academic: {
        subjects: any[];
        overallPercentage: number;
        overallGrade: string;
        trend: "IMPROVING" | "DECLINING" | "STABLE" | "INSUFFICIENT_DATA";
        consistencyScore: number;
    };
    attendance: any;
    health: any;
    activities: any[];
    insights: any[];
}

export async function getStudentAnalyticsAction(studentId: string, academicYearId?: string): Promise<{ success: boolean; data?: StudentAnalytics; error?: string }> {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success) return { success: false, error: "Unauthorized" };

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) return { success: false, error: "Student not found" };

        const user = await prisma.user.findFirst({
            where: { student: { id: student.id } }
        });

        const classroomName = student.classroomId ?
            (await prisma.classroom.findUnique({ where: { id: student.classroomId } }))?.name || "N/A" : "N/A";

        const query: any = { studentId };
        if (academicYearId) query.academicYearId = academicYearId;

        const [examResults, attendance, healthRecords, activities] = await Promise.all([
            prisma.examResult.findMany({
                where: {
                    studentId,
                    exam: academicYearId ? { academicYearId } : {}
                },
                include: { exam: true },
                orderBy: { exam: { date: 'asc' } }
            }),
            prisma.attendance.findMany({
                where: query,
                orderBy: { date: 'desc' }
            }),
            prisma.studentHealthRecord.findMany({
                where: query,
                orderBy: { recordedAt: 'desc' }
            }),
            prisma.studentActivityRecord.findMany({
                where: query,
                orderBy: { date: 'desc' }
            })
        ]);

        const processed = processStudentData(examResults, attendance, healthRecords[0] || null, activities);

        const data: StudentAnalytics = {
            student: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                grade: classroomName,
                admissionNumber: student.admissionNumber || null,
                avatar: user?.avatar || null,
            },
            academic: {
                subjects: processed.academics.subjectPerformance,
                overallPercentage: processed.academics.overallPercentage,
                overallGrade: calculateGrade(processed.academics.overallPercentage),
                trend: processed.academics.trend,
                consistencyScore: processed.academics.subjectPerformance.length > 0
                    ? processed.academics.subjectPerformance.reduce((acc, sub) => acc + sub.average, 0) / processed.academics.subjectPerformance.length
                    : 0
            },
            attendance: processed.attendance,
            health: processed.health,
            activities: processed.activities,
            insights: processed.insights,
        };

        return { success: true, data };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBulkStudentAnalyticsAction(schoolSlug: string, studentIds: string[], academicYearId?: string): Promise<{ success: boolean; data?: BulkSmartAnalytics; error?: string }> {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success) return { success: false, error: "Unauthorized" };

        if (!studentIds.length) return { success: true, data: {} };

        // Query filters
        const query: any = { studentId: { in: studentIds } };
        if (academicYearId) query.academicYearId = academicYearId;

        // 1. Fetch all data for these students
        const [examResults, attendance, healthRecords, activities] = await Promise.all([
            prisma.examResult.findMany({
                where: {
                    studentId: { in: studentIds },
                    exam: academicYearId ? { academicYearId } : {}
                },
                include: { exam: true },
                orderBy: { exam: { date: 'asc' } }
            }),
            prisma.attendance.findMany({
                where: query,
                orderBy: { date: 'desc' }
            }),
            prisma.studentHealthRecord.findMany({
                where: query,
                orderBy: { recordedAt: 'desc' }
            }),
            prisma.studentActivityRecord.findMany({
                where: query,
                orderBy: { date: 'desc' }
            })
        ]);

        const bulkData: BulkSmartAnalytics = {};

        // Process per student
        for (const studentId of studentIds) {
            const sExamResults = examResults.filter(r => r.studentId === studentId);
            const sAttendance = attendance.filter(a => a.studentId === studentId);
            const sHealth = healthRecords.find(h => h.studentId === studentId) || null;
            const sActivities = activities.filter(a => a.studentId === studentId).slice(0, 5);

            // Logic copied from single student (simplified for bulk)
            bulkData[studentId] = processStudentData(sExamResults, sAttendance, sHealth, sActivities);
        }

        return { success: true, data: bulkData };

    } catch (error: any) {
        console.error("Bulk Analytics Error:", error);
        return { success: false, error: error.message };
    }
}

function processStudentData(examResults: any[], attendance: any[], health: any, activities: any[]) {
    // Re-use logic from single student action
    let totalMarks = 0;
    let totalMax = 0;
    const subjectStats: Record<string, { total: number; maxScore: number; minScore: number; maxAvailable: number; count: number }> = {};

    examResults.forEach(res => {
        const marks = res.marks || 0;
        const max = res.exam.maxMarks || 100;
        const subject = res.subject || "Unknown";

        totalMarks += marks;
        totalMax += max;

        if (!subjectStats[subject]) {
            subjectStats[subject] = { total: 0, maxScore: 0, minScore: Infinity, maxAvailable: 0, count: 0 };
        }
        subjectStats[subject].total += marks;
        subjectStats[subject].maxAvailable += max;
        subjectStats[subject].count++;

        if (marks > subjectStats[subject].maxScore) subjectStats[subject].maxScore = marks;
        if (marks < subjectStats[subject].minScore) subjectStats[subject].minScore = marks;
    });

    const subjectPerformance = Object.entries(subjectStats).map(([sub, stats]) => {
        const avg = stats.maxAvailable > 0 ? (stats.total / stats.maxAvailable) * 100 : 0;
        return {
            subject: sub,
            average: avg,
            grade: calculateGrade(avg),
            min: stats.minScore === Infinity ? 0 : stats.minScore,
            max: stats.maxScore,
            count: stats.count
        };
    }).sort((a, b) => b.average - a.average);

    const bestSubject = subjectPerformance.length > 0 ? subjectPerformance[0].subject : "N/A";
    const weakestSubject = subjectPerformance.length > 0 ? subjectPerformance[subjectPerformance.length - 1].subject : "N/A";
    const overallPercentage = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;

    const examGroups: Record<string, { total: number; max: number; date: Date; title: string, id: string, subjects: any[] }> = {};
    examResults.forEach(r => {
        if (!examGroups[r.examId]) examGroups[r.examId] = { id: r.examId, total: 0, max: 0, date: r.exam.date, title: r.exam.title, subjects: [] };
        examGroups[r.examId].total += (r.marks || 0);
        examGroups[r.examId].max += (r.exam.maxMarks || 100);
        examGroups[r.examId].subjects.push({
            name: r.subject,
            marks: r.marks,
            maxMarks: r.exam.maxMarks,
            grade: calculateGrade(r.exam.maxMarks > 0 ? ((r.marks || 0) / r.exam.maxMarks) * 100 : 0)
        });
    });

    const sortedExams = Object.values(examGroups).sort((a, b) => a.date.getTime() - b.date.getTime());

    // Trend
    let trend: any = "INSUFFICIENT_DATA";
    if (sortedExams.length >= 2) {
        const recent = sortedExams.slice(-3);
        const slopes: number[] = [];
        for (let i = 1; i < recent.length; i++) {
            const prev = recent[i - 1].max > 0 ? recent[i - 1].total / recent[i - 1].max : 0;
            const curr = recent[i].max > 0 ? recent[i].total / recent[i].max : 0;
            slopes.push(curr - prev);
        }
        const avgSlope = slopes.reduce((a, b) => a + b, 0) / slopes.length;
        if (avgSlope > 0.02) trend = "IMPROVING";
        else if (avgSlope < -0.02) trend = "DECLINING";
        else trend = "STABLE";
    }

    const totalDays = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const attPercentage = totalDays > 0 ? ((present + late) / totalDays) * 100 : 0;

    // --- INSIGHTS GENERATION ---
    const insights: any[] = [];

    if (bestSubject !== "N/A" && subjectPerformance[0].average >= 90) {
        insights.push({
            type: "STRENGTH",
            message: `Exceptional performance in ${bestSubject} with a ${subjectPerformance[0].average.toFixed(1)}% average.`,
            sentiment: "POSITIVE"
        });
    }

    if (weakestSubject !== "N/A" && subjectPerformance[subjectPerformance.length - 1].average < 50) {
        insights.push({
            type: "WEAKNESS",
            message: `Requires attention in ${weakestSubject} (Avg: ${subjectPerformance[subjectPerformance.length - 1].average.toFixed(1)}%).`,
            sentiment: "NEGATIVE"
        });
    }

    if (trend === "IMPROVING") {
        insights.push({
            type: "TREND",
            message: "Showing a consistent upward trend in recent exams. Keep it up!",
            sentiment: "POSITIVE"
        });
    } else if (trend === "DECLINING") {
        insights.push({
            type: "TREND",
            message: "Performance has dipped slightly in the most recent exams.",
            sentiment: "NEGATIVE"
        });
    }

    if (totalDays > 10 && attPercentage < 75) {
        insights.push({
            type: "ATTENDANCE",
            message: `Low attendance (${attPercentage.toFixed(1)}%). Regular attendance is crucial for improvement.`,
            sentiment: "NEGATIVE"
        });
    }

    if (activities.length > 0) {
        insights.push({
            type: "GENERAL",
            message: `Active participant in ${activities[0].category} activities (${activities.length} achievements recorded).`,
            sentiment: "POSITIVE"
        });
    }

    return {
        academics: {
            overallPercentage,
            totalExams: sortedExams.length,
            subjectPerformance,
            bestSubject,
            weakestSubject,
            trend,
            examHistory: sortedExams.map(e => ({
                id: e.id,
                name: e.title,
                date: e.date.toLocaleDateString(),
                percentage: e.max > 0 ? (e.total / e.max) * 100 : 0,
                subjects: e.subjects
            }))
        },
        attendance: { totalDays, present, absent, late, percentage: attPercentage },
        health,
        activities,
        insights
    };
}

function calculateGrade(percentage: number): string {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
}
