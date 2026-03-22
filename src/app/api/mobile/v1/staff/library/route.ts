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
      include: { school: { select: { id: true, librarySettings: true } } },
    });

    if (!user?.schoolId || !user.school) {
      return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });
    }

    const schoolId = user.schoolId;
    const role = user.role.toUpperCase();
    const isAdmin = ["ADMIN", "PRINCIPAL", "SUPER_ADMIN"].includes(role);

    // For teachers: only show students in their managed classrooms
    // For admins: show all
    let studentIdFilter: string[] | null = null;

    if (!isAdmin) {
      // Get classrooms where this user is the class teacher
      const classrooms = await prisma.classroom.findMany({
        where: { teacherId: user.id, schoolId },
        select: { id: true, name: true },
      });

      if (classrooms.length > 0) {
        const students = await prisma.student.findMany({
          where: { classroomId: { in: classrooms.map((c) => c.id) }, schoolId },
          select: { id: true },
        });
        studentIdFilter = students.map((s) => s.id);
      } else {
        // Teacher with no class assignment — show school-wide (so the module is still useful)
        studentIdFilter = null;
      }
    }

    // Build where clause
    const where: any = {
      schoolId,
      status: "ISSUED", // Only active transactions (can add filter later via query param)
    };

    // URL filter param: ?filter=overdue|due_soon|all|returned
    const url = new URL(req.url);
    const filter = url.searchParams.get("filter") || "all";

    if (filter === "overdue") {
      where.dueDate = { lt: new Date() };
    } else if (filter === "due_soon") {
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      where.dueDate = { gte: new Date(), lte: threeDaysLater };
    } else if (filter === "returned") {
      delete where.status;
      where.status = "RETURNED";
    }
    // "all" => status=ISSUED (default)

    if (studentIdFilter !== null) {
      where.studentId = { in: studentIdFilter };
    } else {
      // Show student transactions only (not staff transactions in teacher view)
      where.student = { isNot: null };
    }

    const transactions = await prisma.libraryTransaction.findMany({
      where,
      include: {
        book: {
          select: {
            id: true, title: true, author: true, isbn: true,
            category: true, coverUrl: true, shelfNo: true,
          },
        },
        student: {
          select: {
            id: true, firstName: true, lastName: true,
            admissionNumber: true,
            classroom: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 100,
    });

    // Stats
    const now = new Date();
    const threeDays = new Date();
    threeDays.setDate(now.getDate() + 3);

    const overdueCount = transactions.filter(
      (t) => t.status === "ISSUED" && t.dueDate < now
    ).length;
    const dueSoonCount = transactions.filter(
      (t) => t.status === "ISSUED" && t.dueDate >= now && t.dueDate <= threeDays
    ).length;

    // Library settings (for max books info / fine per day)
    const settings = user.school.librarySettings;

    return NextResponse.json({
      success: true,
      data: {
        transactions: JSON.parse(JSON.stringify(transactions)),
        stats: {
          totalIssued: transactions.length,
          overdueCount,
          dueSoonCount,
          finePerDay: settings?.finePerDay ?? 10,
          maxBooksStudent: settings?.maxBooksStudent ?? 2,
        },
      },
    });
  } catch (error) {
    console.error("[staff/library] GET error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
