import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");
    let decoded;
    try {
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }
    
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ success: false, error: "Invalid token payload" }, { status: 401 });
    }

    const userId = decoded.sub as string;

    const today = new Date();
    const todayStart = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    const record = await prisma.staffAttendance.findFirst({
      where: {
        userId: userId,
        date: todayStart
      },
      include: {
        punches: {
          orderBy: { timestamp: "asc" }
        }
      }
    });

    if (!record || record.punches.length === 0) {
      return NextResponse.json({ success: true, status: "NOT_PUNCHED", punches: [] });
    }

    const latestPunch = record.punches[record.punches.length - 1];

    // Get school timings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: { select: { schoolTimings: true, workingDays: true } } }
    });

    return NextResponse.json({ 
      success: true, 
      status: latestPunch.type, // 'IN' or 'OUT'
      timestamp: latestPunch.timestamp,
      punches: record.punches.map(p => ({
        id: p.id,
        type: p.type,
        timestamp: p.timestamp,
      })),
      schoolTimings: user?.school?.schoolTimings || "9:00 AM - 3:00 PM",
    });

  } catch (error) {
    console.error("GET self attendance today error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
