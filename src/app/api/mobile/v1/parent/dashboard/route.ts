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
        const studentId = url.searchParams.get('studentId');

        if (!studentId) {
             return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        // Fetch Student Data
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                classroom: true,
                school: true
            }
        });

        if (!student) {
             return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        // Fetch stats (mocked aggregations for the UI structure)
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Fetch attendance for current month
        const attendance = await prisma.attendance.findMany({
            where: {
                studentId,
                date: { gte: startOfMonth, lte: today }
            }
        });

        const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
        const totalDays = attendance.length || 1; // avoid division by zero
        const attendancePercentage = Math.round((presentDays / totalDays) * 100);

        // Fetch Homework Stats
        const allHomeworks = await prisma.homework.findMany({
            where: { classroomId: student.classroomId }
        });
        
        const submissions = await prisma.homeworkSubmission.findMany({
            where: { studentId: student.id, isSubmitted: true }
        });
        
        const submittedHomeworkIds = submissions.map(s => s.homeworkId);
        
        const totalHomework = allHomeworks.length;
        const submittedHomework = submissions.length;
        const pendingHomework = allHomeworks.filter(h => !submittedHomeworkIds.includes(h.id)).length;

        // Dummy data for rank/grade for UI layout
        const overallGrade = "A+";
        const rank = "1st";

        // Extract today's timetable
        let todaysClasses: any[] = [];
        try{
            const ttConfig = student.classroom?.timetable ? JSON.parse(student.classroom.timetable) : [];
            const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); // e.g 'monday'
            todaysClasses = ttConfig.filter((c: any) => c.day?.toLowerCase() === dayOfWeek);
        } catch(e) {}

        const nextClass = todaysClasses.length > 0 ? todaysClasses[0] : null;

        // Fetch Next Pending Fee
        const nextFee = await prisma.fee.findFirst({
            where: {
                studentId,
                status: 'PENDING'
            },
            orderBy: { dueDate: 'asc' }
        });

        // Fetch Latest Diary Entry
        const latestDiary = await prisma.diaryEntry.findFirst({
            where: {
                classroomId: student.classroomId
            },
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        });

        return NextResponse.json({
            success: true,
            data: {
                student: {
                    id: student.id,
                    name: `${student.firstName} ${student.lastName}`,
                    avatar: student.avatar,
                    grade: student.grade,
                    classroom: student.classroom?.name,
                     rank,
                     schoolName: student.school?.name,
                },
                stats: {
                    attendancePercent: isNaN(attendancePercentage) ? 100 : attendancePercentage,
                    attendanceHistory: attendance.map(a => a.status),
                    averageScore: 88, // Mocked for now until grades logic is finalized
                    pendingHomework,
                    submittedHomework,
                    totalHomework,
                    todayPeriods: todaysClasses.length,
                },
                todaysSchedule: todaysClasses,
                nextClass,
                feePreview: nextFee,
                diaryPreview: latestDiary ? {
                     title: latestDiary.title,
                     date: latestDiary.createdAt,
                     author: `${latestDiary.author.firstName} ${latestDiary.author.lastName}`
                } : null
            }
        });

    } catch (error) {
        console.error("Parent Dashboard Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
