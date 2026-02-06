import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getStudentActivityFeedAction } from "@/app/actions/parent-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const limit = parseInt(searchParams.get("limit") || "50");
        const phone = (auth as any).phone;

        if (!studentId) {
            return NextResponse.json({ success: false, error: "Student ID is required" }, { status: 400 });
        }

        const result = await getStudentActivityFeedAction(studentId, phone, limit);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            feed: result.feed
        });
    } catch (error: any) {
        console.error("Mobile Feed API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
