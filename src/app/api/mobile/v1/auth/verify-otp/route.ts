import { NextResponse } from "next/server";
import { verifyParentOTPAction } from "@/app/actions/parent-actions";
import { signToken } from "@/lib/auth-mobile";

export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json({ success: false, error: "Phone and OTP are required" }, { status: 400 });
        }

        const result = await verifyParentOTPAction(phone, otp);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 401 });
        }

        // Generate Secure JWT for Mobile
        const token = await signToken({
            parentId: result.parentId,
            phone: result.phone,
            role: "PARENT"
        });

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: result.parentId,
                phone: result.phone,
                role: "PARENT"
            }
        });
    } catch (error: any) {
        console.error("Mobile OTP Verify Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
