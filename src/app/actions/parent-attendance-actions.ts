import { prisma } from "@/lib/prisma";
import { getFamilyStudentsAction } from "./parent-actions";

export async function getParentAttendanceAction(studentId: string, phone: string, limit: number = 20) {
    try {
        // Verify parent has access to this student
        const familyResult = await getFamilyStudentsAction(phone);
        if (!familyResult.success || !familyResult.students) {
            return { success: false, error: "Unauthorized access to student" };
        }

        const hasAccess = familyResult.students.some((s: any) => s.id === studentId);
        if (!hasAccess) {
            return { success: false, error: "Unauthorized access to student" };
        }

        const attendance = await prisma.attendance.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
            take: limit
        });

        return {
            success: true,
            records: attendance.map(r => ({
                id: r.id,
                date: r.date.toISOString().split("T")[0],
                status: r.status,
                notes: r.notes
            }))
        };
    } catch (e: any) {
        console.error("getParentAttendanceAction error:", e);
        return { success: false, error: "Failed to load attendance history" };
    }
}
