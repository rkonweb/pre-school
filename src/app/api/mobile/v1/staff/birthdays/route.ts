import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            select: { id: true, role: true, schoolId: true },
        });
        if (!user?.schoolId) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

        // ── Parse client local date & lookahead ───────────────────────────────
        const urlObj = new URL(req.url);
        const dateParam = urlObj.searchParams.get("date"); // "YYYY-MM-DD"
        const daysAhead = Math.min(parseInt(urlObj.searchParams.get("days") ?? "5", 10), 30);

        let todayYear: number, todayMonth: number, todayDay: number;
        if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
            [todayYear, todayMonth, todayDay] = dateParam.split("-").map(Number);
        } else {
            const now = new Date();
            todayYear = now.getUTCFullYear();
            todayMonth = now.getUTCMonth() + 1;
            todayDay = now.getUTCDate();
        }

        // Build upcoming date windows
        const upcomingDates: { month: number; day: number; daysUntil: number }[] = [];
        for (let i = 0; i <= daysAhead; i++) {
            const d = new Date(todayYear, todayMonth - 1, todayDay + i);
            upcomingDates.push({ month: d.getMonth() + 1, day: d.getDate(), daysUntil: i });
        }

        function matchDOB(dateOfBirth: Date | null): number | null {
            if (!dateOfBirth) return null;
            const m = dateOfBirth.getUTCMonth() + 1;
            const d = dateOfBirth.getUTCDate();
            const found = upcomingDates.find(u => u.month === m && u.day === d);
            return found ? found.daysUntil : null;
        }

        // ── Scoped student filter ─────────────────────────────────────────────
        const studentWhere: any = {
            schoolId: user.schoolId,
            status: { not: "ALUMNI" },
            dateOfBirth: { not: null },
        };
        const isAdmin = ["ADMIN", "SUPER_ADMIN", "OWNER"].includes(user.role);
        if (!isAdmin) {
            const [taughtClassrooms, accessItems] = await Promise.all([
                prisma.classroom.findMany({ where: { teacherId: user.id }, select: { id: true } }),
                prisma.classAccess.findMany({ where: { userId: user.id, canRead: true }, select: { classroomId: true } }),
            ]);
            const allowedIds = [...new Set([
                ...taughtClassrooms.map((c: any) => c.id),
                ...accessItems.map((a: any) => a.classroomId),
            ])];
            if (allowedIds.length > 0) studentWhere.classroomId = { in: allowedIds };
        }

        // ── Parallel fetch: students + staff ──────────────────────────────────
        const [allStudents, allStaff] = await Promise.all([
            prisma.student.findMany({
                where: studentWhere,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    dateOfBirth: true,
                    avatar: true,
                    classroom: { select: { name: true } },
                },
            }),
            prisma.user.findMany({
                where: {
                    schoolId: user.schoolId,
                    dateOfBirth: { not: null },
                    status: "ACTIVE",
                    role: { in: ["STAFF", "TEACHER", "ADMIN"] },
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    dateOfBirth: true,
                    avatar: true,
                    designation: true,
                    role: true,
                },
            }),
        ]);

        // ── Filter & combine ──────────────────────────────────────────────────
        const studentBirthdays = allStudents
            .map(s => {
                const daysUntil = matchDOB(s.dateOfBirth);
                if (daysUntil === null) return null;
                return {
                    id: s.id,
                    name: `${s.firstName} ${s.lastName}`.trim(),
                    photoUrl: s.avatar ?? null,
                    subtitle: s.classroom?.name ?? "—",
                    age: todayYear - (s.dateOfBirth ? new Date(s.dateOfBirth).getFullYear() : todayYear),
                    daysUntil,
                    type: "student" as const,
                };
            })
            .filter((s): s is NonNullable<typeof s> => s !== null);

        const staffBirthdays = allStaff
            .map(u => {
                const daysUntil = matchDOB(u.dateOfBirth);
                if (daysUntil === null) return null;
                return {
                    id: u.id,
                    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
                    photoUrl: u.avatar ?? null,
                    subtitle: u.designation ?? u.role ?? "Staff",
                    age: todayYear - (u.dateOfBirth ? new Date(u.dateOfBirth).getFullYear() : todayYear),
                    daysUntil,
                    type: "staff" as const,
                };
            })
            .filter((s): s is NonNullable<typeof s> => s !== null);

        const birthdays = [...studentBirthdays, ...staffBirthdays]
            .sort((a, b) => a.daysUntil - b.daysUntil);

        return NextResponse.json({ success: true, birthdays });
    } catch (error: any) {
        console.error("Birthdays API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
