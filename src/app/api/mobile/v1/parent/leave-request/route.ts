import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { submitLeaveRequestAction, getLeaveRequestsAction } from "@/app/actions/parent-misc-actions";

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

        const result = await getLeaveRequestsAction(studentId, phone);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mobile Leave Request GET Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const body = await req.json();
        const { studentId, startDate, endDate, reason } = body;

        if (!studentId || !startDate || !endDate || !reason) {
            return NextResponse.json({ success: false, error: "studentId, startDate, endDate, and reason are required" }, { status: 400 });
        }

        const result = await submitLeaveRequestAction(studentId, phone, { startDate, endDate, reason });

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error("Mobile Leave Request POST Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
