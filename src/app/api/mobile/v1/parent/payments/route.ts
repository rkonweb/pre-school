import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import {
    getPaymentSummaryAction,
    initiateOnlineFeePaymentAction,
} from "@/app/actions/parent-phase3-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const phone = (auth as any).phone;

        const url = new URL(req.url);
        const studentId = url.searchParams.get("studentId") ?? undefined;

        const result = await getPaymentSummaryAction(phone, studentId);
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
        const { feeId } = body;

        if (!feeId) return NextResponse.json({ success: false, error: "feeId is required" }, { status: 400 });

        const result = await initiateOnlineFeePaymentAction(phone, feeId);
        return NextResponse.json(result, { status: result.success ? 201 : 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
