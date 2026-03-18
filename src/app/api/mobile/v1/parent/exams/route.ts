import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";

export async function GET(req: Request) {
    try {
        const authResult = await getMobileAuth(req);
        if (!authResult) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const studentId = url.searchParams.get("studentId");
        if (!studentId) {
            return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { classroom: true, school: true }
        });

        if (!student || !student.classroomId) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        // Fetch all exams with schedule entries
        const allExams = await (prisma.exam as any).findMany({
            where: { schoolId: student.schoolId },
            orderBy: { date: "asc" },
            include: {
                createdBy: { select: { firstName: true, lastName: true } },
                scheduleEntries: { orderBy: { sortOrder: "asc" } },
                _count: { select: { results: true } }
            }
        });

        // Filter exams for student's classroom
        const studentExams = allExams.filter((exam: any) => {
            try {
                const ids = JSON.parse(exam.classrooms || "[]");
                return ids.includes(student.classroomId);
            } catch { return false; }
        });

        // Get student results
        const examIds = studentExams.map((e: any) => e.id);
        const results = await prisma.examResult.findMany({
            where: { studentId, examId: { in: examIds } }
        });
        const resultsMap: Record<string, any[]> = {};
        results.forEach(r => {
            if (!resultsMap[r.examId]) resultsMap[r.examId] = [];
            resultsMap[r.examId].push(r);
        });

        const now = new Date();
        const upcoming: any[] = [];
        const completed: any[] = [];

        for (const exam of studentExams) {
            let subjects: string[] = [];
            try { subjects = JSON.parse(exam.subjects || "[]"); } catch {}

            const examDate = new Date(exam.date);
            const daysLeft = Math.ceil((examDate.getTime() - now.getTime()) / 86400000);
            const teacherName = [exam.createdBy?.firstName, exam.createdBy?.lastName].filter(Boolean).join(" ") || "Teacher";

            // Build schedule entries for response
            const schedule = (exam.scheduleEntries || []).map((entry: any) => ({
                id: entry.id,
                subject: entry.subject,
                date: new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                fullDate: entry.date,
                day: new Date(entry.date).toLocaleDateString("en-IN", { weekday: "long" }),
                startTime: entry.startTime,
                endTime: entry.endTime,
                maxMarks: entry.maxMarks,
                room: entry.room,
                syllabus: entry.syllabus,
                isGapDay: entry.isGapDay,
                gapLabel: entry.gapLabel,
            }));

            const entry = {
                id: exam.id,
                title: exam.title,
                description: exam.description,
                date: examDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
                fullDate: exam.date,
                day: examDate.toLocaleDateString("en-IN", { weekday: "long" }),
                type: exam.type,
                category: exam.category,
                maxMarks: exam.maxMarks,
                passMark: exam.minMarks,
                gradingSystem: exam.gradingSystem,
                subjects,
                teacher: teacherName,
                daysLeft,
                schedule,
                results: resultsMap[exam.id] || [],
                hasSchedule: schedule.filter((s: any) => !s.isGapDay).length > 0,
            };

            if (daysLeft >= 0) upcoming.push({ ...entry, tag: "upcoming" });
            else completed.push({ ...entry, tag: "completed" });
        }

        return NextResponse.json({
            success: true,
            data: {
                upcoming,
                completed,
                classroom: student.classroom?.name || "",
                school: student.school?.name || "",
            }
        });
    } catch (error) {
        console.error("Parent Exams Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
