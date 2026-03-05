import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getParentDiaryAction } from "@/app/actions/parent-diary-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        // Optional filters for calendar
        const date = searchParams.get("date") || undefined;
        const month = searchParams.get("month") || undefined;
        const type = searchParams.get("type") || undefined;

        if (!studentId) {
            return NextResponse.json({ success: false, error: "Student ID missing" }, { status: 400 });
        }

        const result = await getParentDiaryAction(studentId, phone, { date, month, type });

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mobile Parent Diary API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
