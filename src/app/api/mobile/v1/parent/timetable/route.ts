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

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                classroom: {
                    include: {
                        timetableStructure: true
                    }
                }
            }
        });

        if (!student || !student.classroomId) {
             return NextResponse.json({ success: false, error: "Student or classroom not found" }, { status: 404 });
        }

        // Parse period definitions from TimetableStructure config
        let periodDefs: any[] = [];
        try {
            if (student.classroom?.timetableStructure?.config) {
                const config = JSON.parse(student.classroom.timetableStructure.config);
                periodDefs = config.periods || [];
            }
        } catch (e) {}

        // Parse timetable data (object format: { Monday: { p1: { subject, teacherId } } })
        let timetableObj: Record<string, any> = {};
        try {
            if (student.classroom?.timetable) {
                const parsed = JSON.parse(student.classroom.timetable);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    timetableObj = parsed;
                }
            }
        } catch (e) {}

        // Collect all unique teacherIds to resolve names
        const teacherIds = new Set<string>();
        for (const dayData of Object.values(timetableObj)) {
            if (dayData && typeof dayData === 'object') {
                for (const periodData of Object.values(dayData as Record<string, any>)) {
                    if (periodData?.teacherId) {
                        teacherIds.add(periodData.teacherId);
                    }
                }
            }
        }

        // Fetch teacher names
        const teacherMap: Record<string, string> = {};
        if (teacherIds.size > 0) {
            const teachers = await prisma.user.findMany({
                where: { id: { in: Array.from(teacherIds) } },
                select: { id: true, firstName: true, lastName: true }
            });
            teachers.forEach(t => { teacherMap[t.id] = [t.firstName, t.lastName].filter(Boolean).join(' ') || 'Teacher'; });
        }

        // Build organized schedule
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const organizedSchedule: Record<string, any[]> = {};

        for (const day of days) {
            // Find matching day data (case-insensitive)
            const dayKey = Object.keys(timetableObj).find(
                k => k.toLowerCase() === day
            );
            const dayData = dayKey ? timetableObj[dayKey] : {};

            const periods: any[] = [];

            for (const pd of periodDefs) {
                const periodId = pd.id;
                const isBreak = pd.type === 'BREAK';

                if (isBreak) {
                    periods.push({
                        periodName: pd.name || 'Break',
                        subject: pd.name || 'Break',
                        startTime: pd.startTime || '',
                        endTime: pd.endTime || '',
                        type: 'break',
                        isBreak: true,
                    });
                } else {
                    const assignment = dayData?.[periodId] || {};
                    const subject = assignment.subject || '';
                    const teacherId = assignment.teacherId || '';

                    periods.push({
                        periodName: pd.name || `Period`,
                        subject: subject || 'Free Period',
                        teacherName: teacherId ? (teacherMap[teacherId] || 'Teacher') : '',
                        startTime: pd.startTime || '',
                        endTime: pd.endTime || '',
                        type: 'class',
                        isBreak: false,
                    });
                }
            }

            organizedSchedule[day] = periods;
        }

        return NextResponse.json({
            success: true,
            data: {
                schedule: organizedSchedule,
                periodCount: periodDefs.filter(p => p.type !== 'BREAK').length,
                classroom: student.classroom?.name || '',
            }
        });

    } catch (error) {
        console.error("Parent Timetable Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
