import { NextResponse } from "next/server";
import { sendParentOTPAction } from "@/app/actions/parent-actions";

export async function POST(req: Request) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 });
        }

        const result = await sendParentOTPAction(phone);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error: any) {
        console.error("Mobile OTP Request Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
