import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const phone = (auth as any).phone;
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const dateStr = searchParams.get("date"); // YYYY-MM-DD

        if (!studentId) return NextResponse.json({ success: false, error: "Student ID missing" }, { status: 400 });

        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [{ parentMobile: phone }, { fatherPhone: phone }, { motherPhone: phone }]
            },
            include: { classroom: true }
        });

        if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });

        // Build base date
        const targetDate = dateStr ? new Date(`${dateStr}T12:00:00Z`) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

        // 1. Fetch Diary Entries / Homework for today
        const diaryEntries = await prisma.diaryEntry.findMany({
            where: {
                schoolId: student.schoolId,
                status: "PUBLISHED",
                OR: [{ classroomId: student.classroomId }, { recipients: { some: { studentId: student.id } } }],
                scheduledFor: { gte: startOfDay, lte: endOfDay }
            },
            include: { author: { select: { firstName: true, lastName: true, role: true } } },
            orderBy: { scheduledFor: 'desc' },
            take: 5
        });

        const activeHomeworks = await prisma.homework.findMany({
            where: {
                schoolId: student.schoolId,
                OR: [{ classroomId: student.classroomId }, { submissions: { some: { studentId: student.id } } }],
                dueDate: { gte: startOfDay }
            },
            orderBy: { dueDate: 'asc' },
            take: 5
        });

        // 2. Timetable (Mocked since we use standard structure usually)
        const timetable = [
            { id: 1, period: "1", subject: "Mathematics", time: "8:00 AM - 8:45 AM", room: "Rm 202", teacher: "Mrs. Kapoor", isDone: true, isCurrent: false },
            { id: 2, period: "2", subject: "Science", time: "8:50 AM - 9:35 AM", room: "Lab 3", teacher: "Mr. Sharma", isDone: true, isCurrent: false },
            { id: 3, period: "3", subject: "English", time: "9:40 AM - 10:25 AM", room: "Rm 105", teacher: "Ms. D'Souza", isDone: false, isCurrent: true },
            { id: 4, period: "Lunch", subject: "Lunch Break", time: "12:15 PM - 1:00 PM", room: "Canteen", teacher: "Free Period", isDone: false, isCurrent: false },
            { id: 5, period: "6", subject: "Geography", time: "1:00 PM - 1:45 PM", room: "Rm 204", teacher: "Mrs. Sinha", isDone: false, isCurrent: false },
        ];

        // 3. Recent Marks
        const recentMarks = [
            { id: 1, subject: "Mathematics", test: "Unit Test", date: "Nov 18", score: 45, total: 50, grade: "A+" },
            { id: 2, subject: "Science", test: "Lab Practical", date: "Nov 19", score: 26, total: 30, grade: "A" },
            { id: 3, subject: "English", test: "Comprehension", date: "Nov 17", score: 33, total: 40, grade: "A" }
        ];

        // 4. Teacher Remarks
        const teacherRemarks = [
            { id: 1, teacher: "Mrs. Sunita Kapoor", subject: "Mathematics", initial: "SK", remark: "Emma has shown excellent progress in Algebra this week. Her problem-solving approach is methodical and her working is very well presented. Keep it up!", mood: "Excellent", stars: 5, date: "Nov 19" },
            { id: 2, teacher: "Mr. Rahul Sharma", subject: "Science", initial: "RS", remark: "Good effort in the friction experiment. Please ensure your lab report includes proper error analysis.", mood: "Good", stars: 4, date: "Nov 19" }
        ];

        // 5. Weekly Stats (Rings)
        const weeklyStats = {
            homework: 75,
            attendance: 90,
            testAvg: 87,
            behaviour: 95,
            participation: 80
        };

        const notices = [
            { id: 1, title: "Annual Science Exhibition — Registration Open", content: "Register your project for the Inter-School Science Exhibition 2024. Deadline: Nov 30.", date: "Today · 8:15 AM", from: "Science Dept.", type: "Event" },
            { id: 2, title: "Parent-Teacher Meeting — Nov 28, 2024", content: "PTM scheduled for Grade 8 on Thursday, Nov 28 from 10 AM – 1 PM. Please book your slot via the app.", date: "Yesterday · 3:30 PM", from: "Principal's Office", type: "Meeting" }
        ];

        // 7. Events
        const events = [
            { id: 1, title: "Sports Day Rehearsal", date: "23 Nov", desc: "9:00 AM · School Ground · Wear sports kit", type: "Sports", inDays: "in 3 days" },
            { id: 2, title: "Parent-Teacher Meeting", date: "28 Nov", desc: "10:00 AM – 1:00 PM · Grade 8 Block", type: "Academic", inDays: "in 8 days" }
        ];

        // 8. Mood Tracker
        const moodTracker = {
            weeklyMood: [
                { day: "Mon", emoji: "😊", level: 80, color: "00C9A7" },
                { day: "Tue", emoji: "😄", level: 90, color: "3B6EF8" },
                { day: "Wed", emoji: "😐", level: 50, color: "F5A623", isCurrent: true },
                { day: "Thu", emoji: "😴", level: 0, color: "8B5CF6" },
                { day: "Fri", emoji: "😁", level: 0, color: "10B981" }
            ],
            aiSummary: "Emma seemed a bit tired on Wednesday — possibly due to the unit test. Overall mood this week is positive and engaged. No behavioural concerns."
        };

        // Student Info
        const studentInfo = {
            name: student.firstName,
            className: student.classroom?.name || "Grade N/A",
            dateStr: targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        };

        return NextResponse.json({
            success: true,
            data: {
                studentInfo,
                diaryEntries,
                homeworks: activeHomeworks.length > 0 ? activeHomeworks : [
                    { id: "1", title: "Chapter 9 - Algebra: Solve exercises 9.4 to 9.8", subject: { name: "Mathematics" }, completion: 75, due: "Due 5:00 PM", overdue: true, desc: "Complete all 12 problems. Show full working steps." },
                    { id: "2", title: "Lab Report: Friction Experiment", subject: { name: "Science" }, completion: 40, due: "Due Tomorrow", overdue: false, desc: "Submit 2-page lab report covering Hypothesis, Materials, etc." },
                    { id: "3", title: "Essay: \"The Role of Courage in To Kill a Mockingbird\"", subject: { name: "English Literature" }, completion: 0, due: "Due Nov 25", overdue: false, desc: "Analytical essay referencing minimum 3 quotes from the novel." }
                ],
                timetable,
                recentMarks,
                teacherRemarks,
                weeklyStats,
                notices,
                events,
                moodTracker
            }
        });
    } catch (error: any) {
        console.error("Diary Comprehensive API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error", details: error.message }, { status: 500 });
    }
}
