import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getParentEventsAction } from "@/app/actions/parent-phase2-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const url = new URL(req.url);
        const month = url.searchParams.get("month") ? parseInt(url.searchParams.get("month")!) : undefined;
        const year = url.searchParams.get("year") ? parseInt(url.searchParams.get("year")!) : undefined;

        const result = await getParentEventsAction(phone, month, year);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mobile Events API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
