import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { submitParentRequestAction, getParentRequestsAction } from "@/app/actions/parent-phase2-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const url = new URL(req.url);
        const studentId = url.searchParams.get("studentId") ?? undefined;

        const result = await getParentRequestsAction(phone, studentId);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mobile Requests GET Error:", error);
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
        const { studentId, type, description } = body;

        if (!studentId || !type || !description) {
            return NextResponse.json({ success: false, error: "studentId, type, and description are required" }, { status: 400 });
        }

        const result = await submitParentRequestAction(phone, studentId, { type, description });

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error("Mobile Requests POST Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
