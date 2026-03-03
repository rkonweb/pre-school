import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getParentTodayTimelineAction } from "@/app/actions/parent-today-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json({ success: false, error: "Student ID missing" }, { status: 400 });
        }

        const result = await getParentTodayTimelineAction(studentId, phone);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mobile Today Timeline API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
