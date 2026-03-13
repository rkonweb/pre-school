// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    console.log("Checking attendance records for:", today.toISOString());

    try {
        const records = await prisma.attendance.findMany({
            where: {
                date: today
            },
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                        classroom: { select: { name: true } }
                    }
                }
            }
        });

        console.log(`\nFound ${records.length} total records for today:`);
        const grouped: any = {};
        records.forEach((r: any) => {
            const className = r.student.classroom?.name || "Unknown";
            if (!grouped[className]) grouped[className] = [];
            grouped[className].push(r);
        });

        for (const className in grouped) {
            console.log(`\nClassroom: ${className}`);
            grouped[className].forEach((r: any) => {
                console.log(`  - Student: ${r.student.firstName} ${r.student.lastName} | Status: ${r.status} | ID: ${r.studentId} | AcademicYear: ${r.academicYearId}`);
            });
        }
    } catch (e) {
        console.error("Database Query Failed:", e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
