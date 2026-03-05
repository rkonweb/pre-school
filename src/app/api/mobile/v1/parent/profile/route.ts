import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { updateParentProfileAction } from "@/app/actions/parent-misc-actions";

export async function PATCH(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const body = await req.json();
        const { parentName, parentEmail, address } = body;

        const result = await updateParentProfileAction(phone, { parentName, parentEmail, address });

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mobile Profile API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
