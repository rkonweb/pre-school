import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth-mobile";

async function findStudentsByParentMobile(mobile: string) {
    const digits = mobile.replace(/\D/g, "");
    const last10 = digits.slice(-10);

    const candidates = Array.from(new Set([
        mobile, digits, `+91${last10}`, `+91 ${last10}`, `91${last10}`, last10,
    ]));

    let students = [];
    for (const candidate of candidates) {
        students = await prisma.student.findMany({
            where: {
                OR: [
                    { parentMobile: candidate },
                    { fatherPhone: candidate },
                    { motherPhone: candidate }
                ]
            },
            include: { school: true, classroom: true }
        });
        if (students.length > 0) return students;
    }
    return [];
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(req: Request) {
    console.log(">>> [PARENT AUTH] POST /verify-otp started");
    try {
        const { mobile, code } = await req.json();

        if (!mobile || !code) {
            return NextResponse.json({ success: false, error: "Mobile and OTP code are required" }, { status: 400 });
        }

        const isBackdoor = code === "123456" && process.env.NODE_ENV !== "production";

        let students: any[] = [];
        
        if (isBackdoor) {
            console.log(">>> [PARENT AUTH] Backdoor triggered for", mobile);
            students = await findStudentsByParentMobile(mobile);
            
            // If no student found for exactly this number during backdoor, 
            // fallback to get any student to allow testing UI
            if (students.length === 0) {
               const firstStudent = await prisma.student.findFirst({
                   include: { school: true, classroom: true }
               });
               if(firstStudent) students = [firstStudent];
            }
        } else {
             // Regular verification
            const digits = mobile.replace(/\D/g, "");
            const last10 = digits.slice(-10);
            const mobileCandidates = Array.from(new Set([
                mobile, digits, `+91${last10}`, `+91 ${last10}`, `91${last10}`, last10,
            ]));

            let record = null;
            for (const candidate of mobileCandidates) {
                record = await prisma.otp.findFirst({
                    where: {
                        mobile: candidate,
                        code,
                        verified: false,
                        expiresAt: { gt: new Date() }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                if (record) break;
            }

            if (!record) {
                return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 401 });
            }

            await prisma.otp.update({
                where: { id: record.id },
                data: { verified: true }
            });

            students = await findStudentsByParentMobile(mobile);
        }

        if (students.length === 0) {
            return NextResponse.json({ success: false, error: "No student records found associated with this mobile number." }, { status: 404 });
        }

        // We use the first student's school as the primary context
        const primarySchool = students[0].school;
        
        // Generate Token
        const token = await signToken({
            sub: `parent_${mobile}`,
            role: "PARENT",
            schoolId: primarySchool.id,
            branchId: students[0].branchId || null,
            firstName: students[0].parentName || students[0].fatherName || students[0].motherName || "Parent",
            lastName: ""
        });

        const mappedStudents = students.map(s => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            avatar: s.avatar,
            grade: s.grade,
            classroomName: s.classroom?.name,
            schoolId: s.schoolId,
            branchId: s.branchId,
        }));

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: `parent_${mobile}`,
                role: "PARENT",
                name: students[0].parentName || students[0].fatherName || students[0].motherName || "Parent",
                schoolId: primarySchool.id,
                students: mappedStudents
            },
            school: {
                id: primarySchool.id,
                name: primarySchool.name,
                slug: primarySchool.slug,
                logo: primarySchool.logo,
                primaryColor: primarySchool.brandColor || primarySchool.primaryColor,
                secondaryColor: primarySchool.secondaryColor,
            }
        }, { headers: { 'Access-Control-Allow-Origin': '*' } });

    } catch (error) {
        console.error("Parent Verify OTP Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
