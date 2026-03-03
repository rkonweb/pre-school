import { prisma } from "@/lib/prisma";
import { getFamilyStudentsAction } from "./parent-actions";

export async function getParentHomeDataAction(phone: string) {
    try {
        console.log("[getParentHomeDataAction] Fetching family for phone:", phone);
        const familyResult = await getFamilyStudentsAction(phone);
        console.log("[getParentHomeDataAction] familyResult.success:", familyResult.success);
        if (!familyResult.success || !familyResult.students || familyResult.students.length === 0) {
            return { success: false, error: "No students found" };
        }

        const studentsData = familyResult.students;
        const activeStudentId = studentsData[0].id;
        const schoolId = studentsData[0].schoolId;
        console.log("[getParentHomeDataAction] activeStudentId:", activeStudentId);

        // Fetch School Branding
        console.log("[getParentHomeDataAction] Fetching school branding for schoolId:", schoolId);
        const school = await prisma.school.findUnique({
            where: { id: schoolId || "" },
            select: { name: true, logo: true, brandColor: true, slug: true }
        });
        console.log("[getParentHomeDataAction] school found:", !!school);

        const schoolData = {
            name: school?.name || "School",
            slug: school?.slug || "school",
            primaryColor: school?.brandColor || "#2563EB",
            logo: school?.logo ? (school.logo.startsWith('/') ? `http://localhost:3000${school.logo}` : school.logo) : "https://bodhiboard.vercel.app/logo.png"
        };

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Map students with safety status
        console.log("[getParentHomeDataAction] Mapping students safety status...");
        const students = await Promise.all(studentsData.map(async (s: any) => {
            let safetyStatus = "AT_HOME";

            // Check Attendance
            const attendance = await prisma.attendance.findFirst({
                where: { studentId: s.id, date: { gte: startOfDay, lte: endOfDay } },
                orderBy: { createdAt: 'desc' }
            });

            if (attendance?.status === "PRESENT") {
                safetyStatus = "IN_SCHOOL";
            } else if (attendance?.status === "ABSENT") {
                safetyStatus = "ABSENT";
            }

            // Check Transport Log
            const transport = await prisma.transportBoardingLog.findFirst({
                where: { studentId: s.id, timestamp: { gte: startOfDay, lte: endOfDay } },
                orderBy: { timestamp: 'desc' }
            });

            if (transport) {
                if (transport.type === "PICKUP" && transport.status === "BOARDED") safetyStatus = "IN_TRANSIT";
                if (transport.type === "PICKUP" && transport.status === "DROPPED") safetyStatus = "IN_SCHOOL";
                if (transport.type === "DROP" && transport.status === "BOARDED") safetyStatus = "IN_TRANSIT";
                if (transport.type === "DROP" && transport.status === "DROPPED") safetyStatus = "AT_HOME";
            }

            return {
                id: s.id,
                firstName: s.firstName,
                avatar: s.avatar,
                safetyStatus,
                classroomName: s.classroom || "Unassigned"
            };
        }));
        console.log("[getParentHomeDataAction] Mapping students safety status complete.");

        // Fetch Critical Alerts (e.g. Broadcasts flagged or general unread Conversations)
        const conversations = await prisma.conversation.count({
            where: {
                OR: [
                    { studentId: activeStudentId }
                ]
            }
        });
        const criticalAlerts = 0; // TBD implement unread chat counts

        // Build Timeline Snippet (Top 3 events today)
        let timelineEvents: any[] = [];
        const activeStudent = studentsData[0];

        const att = await prisma.attendance.findFirst({
            where: { studentId: activeStudentId, date: { gte: startOfDay, lte: endOfDay } }
        });
        if (att) {
            timelineEvents.push({ time: att.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: "ATTENDANCE", title: `Marked ${att.status}`, status: "COMPLETED", timestamp: att.createdAt.getTime() });
        }

        const trans = await prisma.transportBoardingLog.findMany({
            where: { studentId: activeStudentId, timestamp: { gte: startOfDay, lte: endOfDay } },
            orderBy: { timestamp: 'desc' },
            take: 2
        });
        trans.forEach((tr: any) => {
            timelineEvents.push({ time: tr.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: "TRANSPORT", title: `${tr.status} Bus`, status: "COMPLETED", timestamp: tr.timestamp.getTime() });
        });

        timelineEvents.sort((a, b) => b.timestamp - a.timestamp);
        const timelineSnippet = timelineEvents.slice(0, 3).map(e => ({ time: e.time, type: e.type, title: e.title, status: e.status }));

        return {
            success: true,
            activeStudentId,
            students,
            school: schoolData,
            criticalAlerts,
            timelineSnippet
        };
    } catch (e: any) {
        console.error("getParentHomeDataAction error:", e);
        return { success: false, error: "Failed to load home data" };
    }
}
