import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";



// Haversine formula to compute distance between two coordinates in meters
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
}

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

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get('month'); // e.g. "03"
    const yearStr = searchParams.get('year'); // e.g. "2026"

    const now = new Date();
    const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const records = await prisma.staffAttendance.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        punches: {
          orderBy: { timestamp: "asc" }
        }
      },
      orderBy: { date: "asc" }
    });

    return NextResponse.json({ success: true, attendance: records });
  } catch (error) {
    console.error("GET self attendance error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { latitude, longitude, type } = body; // type is 'IN' or 'OUT'

    if (!latitude || !longitude || !type) {
      return NextResponse.json({ success: false, error: "Missing payload" }, { status: 400 });
    }

    // Get strictly school data from user directly
    const _user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true }
    });

    if (!_user || !_user.school) {
      return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });
    }

    const school = _user.school;
    
    console.log("[DEBUG PUNCH]: User ID:", userId);
    console.log("[DEBUG PUNCH]: School Slug:", school.slug);
    console.log("[DEBUG PUNCH]: School Lat:", school.latitude, typeof school.latitude);
    console.log("[DEBUG PUNCH]: School Lng:", school.longitude, typeof school.longitude);

    if (!school.latitude || !school.longitude) {
      // If school coordinates are not configured, deny
      return NextResponse.json({ success: false, error: "School location is not configured in Portal" }, { status: 400 });
    }

    const sLat = parseFloat(school.latitude);
    const sLon = parseFloat(school.longitude);
    // @ts-ignore
    const radius = school.attendanceRadius ?? 25.0;

    const distance = getDistanceInMeters(latitude, longitude, sLat, sLon);
    if (distance > radius) {
      return NextResponse.json({ 
        success: false, 
        error: `You are too far from the campus. (Distance: ${Math.round(distance)}m, Allowed: ${Math.round(radius)}m)` 
      }, { status: 403 });
    }

    // Coordinates matched. Find or create today's StaffAttendance record
    const today = new Date();
    // Normalize to start of day in UTC for simplicity matching Date column (adjust if timezone needed)
    const todayStart = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    let attendance = await prisma.staffAttendance.findFirst({
      where: {
        userId: userId,
        date: todayStart
      }
    });

    if (!attendance) {
      attendance = await prisma.staffAttendance.create({
        data: {
          userId: userId,
          date: todayStart,
          status: "PRESENT",
          branchId: _user.branchId ?? null
        }
      });
    }

    // Optional: Calculate total hours or change status if late, skipping for now as punches are recorded
    const punch = await prisma.staffPunch.create({
      data: {
        attendanceId: attendance.id,
        type: type.toUpperCase(),
        timestamp: today
      }
    });

    return NextResponse.json({ success: true, punch: punch, distance: Math.round(distance) });
  } catch (error) {
    console.error("POST self attendance error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
