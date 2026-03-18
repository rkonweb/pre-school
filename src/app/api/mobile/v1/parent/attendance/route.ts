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
        const monthStr = url.searchParams.get('month');
        const yearStr = url.searchParams.get('year');
        
        const monthNum = monthStr ? parseInt(monthStr) : new Date().getMonth() + 1;
        const yearNum = yearStr ? parseInt(yearStr) : new Date().getFullYear();

        if (!studentId) {
             return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        const startOfMonth = new Date(yearNum, monthNum - 1, 1);
        const endOfMonth = new Date(yearNum, monthNum, 0);

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                studentId,
                date: { gte: startOfMonth, lte: endOfMonth }
            },
            orderBy: { date: 'asc' }
        });

        const formatted = attendanceRecords.map(a => ({
             date: a.date.toISOString().split('T')[0],
             status: a.status,
             notes: a.notes
        }));
        
        const summary = {
            present: formatted.filter(a => a.status === 'PRESENT').length,
            absent: formatted.filter(a => a.status === 'ABSENT').length,
            halfDay: formatted.filter(a => a.status === 'HALF_DAY').length,
            late: formatted.filter(a => a.status === 'LATE').length,
        }

        return NextResponse.json({
            success: true,
            data: {
                records: formatted,
                summary,
                month: monthNum,
                year: yearNum
            }
        });

    } catch (error) {
        console.error("Parent Attendance Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
