import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getAllChildrenProfilesAction, getChildProfileAction } from "@/app/actions/parent-child-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const url = new URL(req.url);
        const studentId = url.searchParams.get("studentId");

        let result;
        if (studentId) {
            result = await getChildProfileAction(studentId, phone);
        } else {
            result = await getAllChildrenProfilesAction(phone);
        }

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mobile Child API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
