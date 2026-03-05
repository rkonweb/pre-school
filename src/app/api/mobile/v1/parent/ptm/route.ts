import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import {
    getActivePTMSessionsAction,
    getMyPTMBookingsAction,
    bookPTMSlotAction,
    cancelPTMBookingAction,
} from "@/app/actions/parent-phase3-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const phone = (auth as any).phone;

        const url = new URL(req.url);
        const view = url.searchParams.get("view"); // "my-bookings" or default sessions

        if (view === "my-bookings") {
            const result = await getMyPTMBookingsAction(phone);
            return NextResponse.json(result);
        }

        const result = await getActivePTMSessionsAction(phone);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const phone = (auth as any).phone;
        const body = await req.json();
        const { studentId, sessionId, slotTime, teacherName } = body;

        if (!studentId || !sessionId || !slotTime) {
            return NextResponse.json({ success: false, error: "studentId, sessionId, and slotTime are required" }, { status: 400 });
        }

        const result = await bookPTMSlotAction(phone, studentId, sessionId, slotTime, teacherName);
        return NextResponse.json(result, { status: result.success ? 201 : 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const phone = (auth as any).phone;
        const { bookingId } = await req.json();

        if (!bookingId) return NextResponse.json({ success: false, error: "bookingId required" }, { status: 400 });

        const result = await cancelPTMBookingAction(phone, bookingId);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
