import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123"
);

async function getAuthUser(req: NextRequest) {
  const token = (req.headers.get("Authorization") ?? "")
    .replace("Bearer ", "")
    .trim();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: {
        id: true, role: true, schoolId: true,
        school: { select: { slug: true, id: true } },
      },
    });
    return user ?? null;
  } catch {
    return null;
  }
}

// GET /api/mobile/v1/staff/homework?slug=xxx&classroomId=xxx&page=1
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const page  = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip  = (page - 1) * limit;

    // Resolve schoolId — from JWT token first (fastest), slug fallback
    let schoolId: string | null = user.school?.id ?? null;
    if (!schoolId) {
      const slug = searchParams.get("slug") || user.school?.slug;
      if (slug) {
        const s = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        schoolId = s?.id ?? null;
      }
    }
    if (!schoolId)
      return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });

    const where: Record<string, unknown> = { schoolId };
    if (classroomId) where.classroomId = classroomId;

    // Fetch homework + classroom name + total submission count
    const [homeworkList, total] = await Promise.all([
      prisma.homework.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          classroom: { select: { id: true, name: true } },
          _count: { select: { submissions: true } },
        },
      }),
      prisma.homework.count({ where }),
    ]);

    if (homeworkList.length === 0) {
      return NextResponse.json({
        success: true, data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const ids = homeworkList.map((h) => h.id);

    // Count how many submissions are actually submitted (isSubmitted=true)
    const submittedRows = await prisma.homeworkSubmission.groupBy({
      by: ["homeworkId"],
      where: { homeworkId: { in: ids }, isSubmitted: true },
      _count: { id: true },
    });
    const submittedMap: Record<string, number> = {};
    for (const r of submittedRows) submittedMap[r.homeworkId] = r._count.id;

    // Count how many are reviewed (graded)
    const reviewedRows = await prisma.homeworkSubmission.groupBy({
      by: ["homeworkId"],
      where: { homeworkId: { in: ids }, isReviewed: true },
      _count: { id: true },
    });
    const reviewedMap: Record<string, number> = {};
    for (const r of reviewedRows) reviewedMap[r.homeworkId] = r._count.id;

    const data = homeworkList.map((hw) => {
      const totalStudents  = hw._count.submissions;
      const submittedCount = submittedMap[hw.id] ?? 0;
      const reviewedCount  = reviewedMap[hw.id] ?? 0;
      const pendingCount   = totalStudents - submittedCount;
      return {
        id:             hw.id,
        title:          hw.title,
        subject:        hw.subject ?? "",
        description:    hw.description,
        dueDate:        hw.dueDate,
        isPublished:    hw.isPublished,
        assignedTo:     hw.assignedTo,
        classroomId:    hw.classroomId,
        classroomName:  hw.classroom?.name ?? null,
        totalStudents,
        submittedCount,
        pendingCount,
        reviewedCount,
        attachments:    hw.attachments ? (() => { try { return JSON.parse(hw.attachments!); } catch { return []; } })() : [],
        createdAt:      hw.createdAt,
      };
    });

    return NextResponse.json({
      success: true, data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("[Mobile Homework GET]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/mobile/v1/staff/homework — Create homework
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { slug, title, description, subject, dueDate, classroomId, assignedTo } = body;

    if (!title?.trim())
      return NextResponse.json({ success: false, error: "title is required" }, { status: 400 });
    if (!classroomId)
      return NextResponse.json({ success: false, error: "classroomId is required" }, { status: 400 });

    // Resolve schoolId — JWT first
    let schoolId: string | null = user.school?.id ?? null;
    if (!schoolId && slug) {
      const s = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
      schoolId = s?.id ?? null;
    }
    if (!schoolId)
      return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });

    const hw = await prisma.homework.create({
      data: {
        title:       title.trim(),
        subject:     subject?.trim() || null,
        description: description?.trim() || "",
        dueDate:     dueDate ? new Date(dueDate) : null,
        classroomId,
        assignedTo:  assignedTo || "CLASS",
        createdById: user.id,
        schoolId,
        isPublished: true,
        targetIds:   "[]",
        attachments: "[]",
      },
    });

    // Auto-create pending submission records
    const students = await prisma.student.findMany({
      where: { classroomId, status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true },
    });
    if (students.length > 0) {
      await prisma.homeworkSubmission.createMany({
        data: students.map((s) => ({
          studentId:   s.id,
          studentName: `${s.firstName} ${s.lastName}`.trim(),
          homeworkId:  hw.id,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ success: true, id: hw.id, studentsNotified: students.length });
  } catch (error: any) {
    console.error("[Mobile Homework POST]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
