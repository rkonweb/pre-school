import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const phone = (auth as any).phone;

        const url = new URL(req.url);
        const studentId = url.searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        // Security check
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [{ parentMobile: phone }, { fatherPhone: phone }, { motherPhone: phone }],
            },
            include: {
                classroom: {
                    include: {
                        timetableStructure: true,
                    },
                },
            },
        });

        if (!student) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });

        const structure = student.classroom?.timetableStructure;
        if (!structure) {
            return NextResponse.json({
                success: true,
                data: null,
                message: "No timetable configured for this class yet",
            });
        }

        // Parse the config JSON - the structure stores periods/schedule in config
        let config: any = {};
        try {
            config = JSON.parse(structure.config || "{}");
        } catch {
            config = {};
        }

        return NextResponse.json({
            success: true,
            data: {
                id: structure.id,
                name: structure.name,
                description: structure.description,
                classroomName: student.classroom?.name,
                // config contains the actual periods/slots
                schedule: config.schedule || config.periods || config || {},
                config,
            },
        });
    } catch (error: any) {
        console.error("Timetable API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
