"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";
import { getSchoolToday, getSchoolNow } from "@/lib/date-utils";

// ----------------------------------------------------------------------
// ATTENDANCE DASHBOARD ACTIONS
// ----------------------------------------------------------------------

export async function getStudentAttendanceStatsAction(studentId: string, month: number, year: number) {
    try {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const attendance = await prisma.attendance.findMany({
            where: {
                studentId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'asc' }
        });

        // Basic Stats
        const stats = {
            totalDays: attendance.length,
            present: attendance.filter(a => a.status === "PRESENT").length,
            absent: attendance.filter(a => a.status === "ABSENT").length,
            late: attendance.filter(a => a.status === "LATE").length,
            holiday: attendance.filter(a => a.status === "HOLIDAY").length,
            records: attendance
        };

        return { success: true, data: stats };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ----------------------------------------------------------------------
// LEAVE REQUEST ACTIONS
// ----------------------------------------------------------------------

export async function getStudentLeaveRequestsAction(studentId: string) {
    try {
        const requests = await prisma.studentLeaveRequest.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: requests };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createStudentLeaveRequestAction(
    studentId: string,
    startDate: string,
    endDate: string,
    reason: string
) {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return { success: false, error: "Start date cannot be after end date" };
        }

        const request = await prisma.studentLeaveRequest.create({
            data: {
                studentId,
                startDate: start,
                endDate: end,
                reason,
                status: "PENDING"
            }
        });

        revalidatePath('/'); // Revalidate broadly or specific path if known
        return { success: true, data: request };
    } catch (error: any) {
        console.error("Create Leave Request Error:", error);
        return { success: false, error: error.message };
    }
}

export async function cancelStudentLeaveRequestAction(requestId: string) {
    try {
        await prisma.studentLeaveRequest.update({
            where: { id: requestId },
            data: { status: "CANCELLED" }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
