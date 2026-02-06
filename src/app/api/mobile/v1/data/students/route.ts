import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getFamilyStudentsAction } from "@/app/actions/parent-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const result = await getFamilyStudentsAction(phone);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, students: result.students });
    } catch (error: any) {
        console.error("Mobile Students API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
