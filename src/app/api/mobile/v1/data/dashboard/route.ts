import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getParentDashboardDataAction } from "@/app/actions/parent-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const phone = (auth as any).phone;

        if (!slug) {
            return NextResponse.json({ success: false, error: "School slug is required" }, { status: 400 });
        }

        const result = await getParentDashboardDataAction(slug, phone);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            school: result.school,
            profile: result.profile,
            students: result.students,
            unreadMessages: result.unreadMessages,
            conversations: result.conversations
        });
    } catch (error: any) {
        console.error("Mobile Dashboard API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
