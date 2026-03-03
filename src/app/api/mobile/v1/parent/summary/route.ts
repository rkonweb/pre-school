import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getParentDailySummaryAction } from "@/app/actions/parent-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const schoolSlug = searchParams.get("schoolSlug");

        if (!studentId || !schoolSlug) {
            return NextResponse.json({ success: false, error: "studentId and schoolSlug are required" }, { status: 400 });
        }

        const phone = (auth as any).phone;
        const result = await getParentDailySummaryAction(schoolSlug, phone, studentId);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Summary API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
