
import { prisma } from "@/lib/prisma";

async function main() {
    const exams = await prisma.exam.findMany({
        select: {
            id: true,
            title: true,
            date: true,
            academicYearId: true,
            academicYear: {
                select: { name: true }
            },
            school: { select: { slug: true } }
        },
        orderBy: { date: 'desc' }
    });

    if (exams.length === 0) {
        console.log("No exams found.");
    } else {
        console.log(`Found ${exams.length} exams:`);
        exams.forEach(e => {
            console.log(`- [${e.school.slug}] ${e.title} (${e.date.toISOString().split('T')[0]}) | Year: ${e.academicYear?.name || 'NULL'} (ID: ${e.academicYearId})`);
        });
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
