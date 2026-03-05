import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getChildHealthAction } from "@/app/actions/parent-health-actions-new";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const url = new URL(req.url);
        const studentId = url.searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        const result = await getChildHealthAction(studentId, phone);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mobile Health API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
