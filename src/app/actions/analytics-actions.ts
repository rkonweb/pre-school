"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserAction } from "./session-actions";

export async function getClassAnalyticsAction(schoolSlug: string, examId: string, classroomId: string) {
    try {
        const results = await prisma.examResult.findMany({
            where: {
                examId,
                student: { classroomId }
            }
        });

        if (results.length === 0) {
            return { success: true, data: { average: 0, distinctSubjects: [], heatmap: [] } };
        }

        // Calculate stats
        const subjectStats: any = {};

        results.forEach(res => {
            if (!res.subject || res.marks === null) return;
            if (!subjectStats[res.subject]) {
                subjectStats[res.subject] = { total: 0, count: 0, max: 0, min: 100 };
            }
            subjectStats[res.subject].total += res.marks;
            subjectStats[res.subject].count += 1;
            if (res.marks > subjectStats[res.subject].max) subjectStats[res.subject].max = res.marks;
            if (res.marks < subjectStats[res.subject].min) subjectStats[res.subject].min = res.marks;
        });

        const distinctSubjects = Object.keys(subjectStats).map(subject => ({
            name: subject,
            avg: Math.round(subjectStats[subject].total / subjectStats[subject].count),
            max: subjectStats[subject].max,
            min: subjectStats[subject].min
        }));

        // Heatmap Structure: { studentId, subject, grade/marks }
        const heatmap = results.map(r => ({
            studentId: r.studentId,
            subject: r.subject,
            marks: r.marks,
            grade: r.grade
        }));

        return { success: true, data: { distinctSubjects, heatmap } };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentProgressAction(studentId: string) {
    try {
        // 1. Fetch Exam Results
        const results = await prisma.examResult.findMany({
            where: { studentId },
            include: { exam: true },
            orderBy: { exam: { date: 'asc' } }
        });

        // 2. Fetch Attendance Stats
        const attendanceRecords = await prisma.attendance.findMany({
            where: { studentId, status: "PRESENT" }
        });
        const totalAttendance = await prisma.attendance.count({
            where: { studentId }
        });
        const attendancePercentage = totalAttendance > 0
            ? Math.round((attendanceRecords.length / totalAttendance) * 100)
            : 0;

        // 3. Process Results into Trendline Data
        const examsMap: any = {};
        results.forEach(r => {
            const dateStr = new Date(r.exam.date).toISOString().split('T')[0];
            if (!examsMap[dateStr]) {
                examsMap[dateStr] = { date: dateStr, examName: r.exam.title, totalMarks: 0, maxTotal: 0 };
            }
            if (r.marks !== null) {
                examsMap[dateStr].totalMarks += r.marks;
                examsMap[dateStr].maxTotal += r.exam.maxMarks;
            }
        });

        const academicTrend = Object.values(examsMap).map((e: any) => ({
            date: e.date,
            exam: e.examName,
            percentage: e.maxTotal > 0 ? Math.round((e.totalMarks / e.maxTotal) * 100) : 0
        }));

        return {
            success: true,
            data: {
                academicTrend,
                attendance: { percentage: attendancePercentage, totalDays: totalAttendance, presentDays: attendanceRecords.length }
            }
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- NEW SMART ANALYTICS ---

export interface SmartAnalytics {
    academics: {
        overallPercentage: number;
        totalExams: number;
        subjectPerformance: { subject: string; average: number; grade: string }[];
        bestSubject: string;
        weakestSubject: string;
        trend: "IMPROVING" | "DECLINING" | "STABLE" | "INSUFFICIENT_DATA";
        examHistory: any[];
    };
    attendance: {
        totalDays: number;
        present: number;
        absent: number;
        late: number;
        percentage: number;
    };
    health: any | null;
    activities: any[];
    insights: {
        type: "STRENGTH" | "WEAKNESS" | "TREND" | "ATTENDANCE" | "GENERAL";
        message: string;
        sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    }[];
}

export async function getStudentSmartAnalyticsAction(schoolSlug: string, studentId: string): Promise<{ success: boolean; data?: SmartAnalytics; error?: string }> {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success) return { success: false, error: "Unauthorized" };

        // 1. Fetch Academic Data
        const examResults = await prisma.examResult.findMany({
            where: { studentId },
            include: { exam: true },
            orderBy: { exam: { date: 'asc' } }
        });

        // 2. Fetch Attendance Data
        const attendance = await prisma.attendance.findMany({
            where: { studentId },
            orderBy: { date: 'desc' }
        });

        // 3. Fetch Health & Activities
        const health = await prisma.studentHealthRecord.findFirst({
            where: { studentId },
            orderBy: { recordedAt: 'desc' }
        });

        const activities = await prisma.studentActivityRecord.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
            take: 5
        });

        // --- PROCESSING ANALYTICS ---

        // Academics
        let totalMarks = 0;
        let totalMax = 0;
        const subjectStats: Record<string, { total: number; max: number; count: number }> = {};

        examResults.forEach(res => {
            const marks = res.marks || 0;
            const max = res.exam.maxMarks || 100;
            const subject = res.subject || "Unknown";

            totalMarks += marks;
            totalMax += max;

            if (!subjectStats[subject]) subjectStats[subject] = { total: 0, max: 0, count: 0 };
            subjectStats[subject].total += marks;
            subjectStats[subject].max += max;
            subjectStats[subject].count++;
        });

        const subjectPerformance = Object.entries(subjectStats).map(([sub, stats]) => {
            const avg = stats.max > 0 ? (stats.total / stats.max) * 100 : 0;
            return {
                subject: sub,
                average: avg,
                grade: calculateGrade(avg)
            };
        }).sort((a, b) => b.average - a.average);

        const bestSubject = subjectPerformance.length > 0 ? subjectPerformance[0].subject : "N/A";
        const weakestSubject = subjectPerformance.length > 0 ? subjectPerformance[subjectPerformance.length - 1].subject : "N/A";
        const overallPercentage = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;

        // Trend Analysis
        const examGroups: Record<string, { total: number; max: number; date: Date; title: string }> = {};
        examResults.forEach(r => {
            if (!examGroups[r.examId]) examGroups[r.examId] = { total: 0, max: 0, date: r.exam.date, title: r.exam.title };
            examGroups[r.examId].total += (r.marks || 0);
            examGroups[r.examId].max += (r.exam.maxMarks || 100);
        });

        const sortedExams = Object.values(examGroups).sort((a, b) => a.date.getTime() - b.date.getTime());
        let trend: SmartAnalytics['academics']['trend'] = "INSUFFICIENT_DATA";

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

        // Attendance Stats
        const totalDays = attendance.length;
        const present = attendance.filter(a => a.status === 'PRESENT').length;
        const late = attendance.filter(a => a.status === 'LATE').length;
        const absent = attendance.filter(a => a.status === 'ABSENT').length;
        const attPercentage = totalDays > 0 ? ((present + late) / totalDays) * 100 : 0;

        // Insights Generation
        const insights: SmartAnalytics['insights'] = [];

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
            success: true,
            data: {
                academics: {
                    overallPercentage,
                    totalExams: sortedExams.length,
                    subjectPerformance,
                    bestSubject,
                    weakestSubject,
                    trend,
                    examHistory: sortedExams.map(e => ({
                        name: e.title,
                        date: e.date.toLocaleDateString(),
                        percentage: e.max > 0 ? (e.total / e.max) * 100 : 0
                    }))
                },
                attendance: {
                    totalDays,
                    present,
                    absent,
                    late,
                    percentage: attPercentage
                },
                health,
                activities,
                insights
            }
        };

    } catch (error: any) {
        console.error("Smart Analytics Error:", error);
        return { success: false, error: error.message };
    }
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
