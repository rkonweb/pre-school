
import { prisma } from "@/lib/prisma";

async function main() {
    const attendance = await prisma.attendance.findMany({
        where: { academicYearId: null },
        take: 10
    });

    console.log(`Found ${attendance.length} unlinked attendance records.`);
    if (attendance.length > 0) {
        console.log("Sample:", attendance[0]);
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
