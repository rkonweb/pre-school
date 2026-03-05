import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";

export async function POST(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { token, deviceType } = await req.json();

        if (!token) {
            return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 });
        }

        const phone = (auth as any).phone;
        if (!phone) {
            return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
        }

        // Update or create the device token record
        await prisma.deviceToken.upsert({
            where: { token },
            update: {
                userId: phone,
                userType: "PARENT",
                deviceType: deviceType || "unknown",
                lastUsed: new Date(),
            },
            create: {
                token,
                userId: phone,
                userType: "PARENT",
                deviceType: deviceType || "unknown",
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Register Device Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
