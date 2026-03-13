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
      select: { id: true, role: true, schoolId: true },
    });
    return user ?? null;
  } catch {
    return null;
  }
}

// GET /api/mobile/v1/staff/homework/[id]
// Returns homework detail with all student submissions
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const hw = await prisma.homework.findUnique({
      where: { id },
      include: {
        classroom: { select: { id: true, name: true } },
        submissions: {
          orderBy: [{ isSubmitted: "desc" }, { studentName: "asc" }],
          select: {
            id: true,
            studentId: true,
            studentName: true,
            isSubmitted: true,
            isReviewed: true,
            submittedAt: true,
            teacherComment: true,
            stickerType: true,
            mediaUrl: true,
            mediaType: true,
            parentNotes: true,
          },
        },
        _count: { select: { submissions: true } },
      },
    });

    if (!hw)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const submittedCount = hw.submissions.filter((s) => s.isSubmitted).length;
    const reviewedCount  = hw.submissions.filter((s) => s.isReviewed).length;
    const totalStudents  = hw.submissions.length;
    const pendingCount   = totalStudents - submittedCount;

    return NextResponse.json({
      success: true,
      homework: {
        id: hw.id,
        title: hw.title,
        subject: hw.subject ?? "",
        description: hw.description,
        dueDate: hw.dueDate,
        isPublished: hw.isPublished,
        classroomId: hw.classroomId,
        classroomName: hw.classroom?.name ?? null,
        totalStudents,
        submittedCount,
        pendingCount,
        reviewedCount,
      },
      submissions: hw.submissions,
    });
  } catch (error: any) {
    console.error("[Mobile Homework GET/:id]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/mobile/v1/staff/homework/[id]
// Grade a single student submission
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { submissionId, teacherComment, isReviewed, stickerType } = body;

    if (!submissionId)
      return NextResponse.json({ success: false, error: "submissionId required" }, { status: 400 });

    const updated = await prisma.homeworkSubmission.update({
      where: { id: submissionId, homeworkId: id },
      data: {
        teacherComment: teacherComment ?? null,
        isReviewed:     isReviewed ?? true,
        reviewedAt:     isReviewed !== false ? new Date() : null,
        reviewedById:   isReviewed !== false ? user.id : null,
        stickerType:    stickerType ?? null,
      },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    console.error("[Mobile Homework PATCH/:id]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
