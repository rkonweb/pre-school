import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-mobile";
import { getFamilyStudentsAction, getParentDashboardDataAction } from "@/app/actions/parent-actions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) {
            return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.phone) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const phone = payload.phone as string;
        const studentsResult = await getFamilyStudentsAction(phone);

        if (!studentsResult.success || !studentsResult.students || studentsResult.students.length === 0) {
            return NextResponse.json({ success: false, error: "No students associated with this account" }, { status: 404 });
        }

        const firstStudent = studentsResult.students[0];
        const dashboardData = await getParentDashboardDataAction(firstStudent.schoolSlug, phone);

        // Fetch actual school branding
        const schoolRecord = await prisma.school.findUnique({
            where: { slug: firstStudent.schoolSlug }
        });

        // Format logo to be absolute URL
        const rawLogo = schoolRecord?.logo || "";
        const logoUrl = rawLogo.startsWith('/') ? `http://localhost:3000${rawLogo}` : rawLogo;

        return NextResponse.json({
            success: true,
            user: {
                id: phone,
                name: "Parent", // Default name if not available
                phone: phone,
                role: "PARENT",
            },
            students: studentsResult.students,
            school: {
                name: schoolRecord?.name || firstStudent.schoolName || "Bodhi Board Pre-School",
                slug: firstStudent.schoolSlug,
                primaryColor: schoolRecord?.primaryColor || "#2563EB",
                secondaryColor: schoolRecord?.secondaryColor || "#FACC15",
                logo: logoUrl
            },
            activities: dashboardData.activities || []
        });
    } catch (error: any) {
        console.error("Parent Mobile ME API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
