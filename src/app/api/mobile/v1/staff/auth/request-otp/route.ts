import { NextResponse } from "next/server";
import { sendOtpAction } from "@/app/actions/auth-actions";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { mobile } = body;

        if (!mobile) {
            return NextResponse.json({ success: false, error: "Mobile number is required" }, { status: 400 });
        }

        // We use the exact same 'school-login' context to ensure ONLY STAFF/ADMIN can get OTPs
        const result = await sendOtpAction(mobile, "school-login");

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error: any) {
        console.error("Staff Mobile Request OTP Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
