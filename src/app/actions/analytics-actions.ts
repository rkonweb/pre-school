"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
        // Simple calculation: Count PRESENT / Total Days in current academic year
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
        // Group by Exam
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
