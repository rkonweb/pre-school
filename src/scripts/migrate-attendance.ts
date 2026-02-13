
import { prisma } from "@/lib/prisma";

async function main() {
    const attendance = await prisma.attendance.findMany({
        where: { academicYearId: null },
        include: { student: { include: { school: true } } } // Assuming student has school relation through Classroom? Or is attendance linked to student directly?
        // Let's check relation. Attendance -> Student. Student -> School (via Class/SchoolID?)
        // Actually Student belongs to School directly usually.
    });

    console.log(`Found ${attendance.length} unlinked attendance records.`);

    // We need schoolID to find academic year.
    // Student model usually has schoolId.

    for (const record of attendance) {
        const student = await prisma.student.findUnique({
            where: { id: record.studentId },
            select: { schoolId: true }
        });

        if (!student) {
            console.log(`Student not found for attendance ID ${record.id}`);
            continue;
        }

        // Find matching year
        const matchingYear = await prisma.academicYear.findFirst({
            where: {
                schoolId: student.schoolId,
                startDate: { lte: record.date },
                endDate: { gte: record.date }
            }
        });

        if (matchingYear) {
            console.log(`Linking attendance for student ${record.studentId} on ${record.date.toISOString().split('T')[0]} to ${matchingYear.name}`);
            await prisma.attendance.update({
                where: { id: record.id },
                data: { academicYearId: matchingYear.id }
            });
        } else {
            console.log(`No matching academic year found for date ${record.date.toISOString().split('T')[0]}`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
