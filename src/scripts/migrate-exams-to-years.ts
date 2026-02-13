
import { prisma } from "@/lib/prisma";

async function main() {
    const exams = await prisma.exam.findMany({
        where: { academicYearId: null },
        include: { school: true }
    });

    console.log(`Found ${exams.length} exams with no academic year.`);

    for (const exam of exams) {
        // Find matching year for this school
        const matchingYear = await prisma.academicYear.findFirst({
            where: {
                schoolId: exam.schoolId,
                startDate: { lte: exam.date },
                endDate: { gte: exam.date }
            }
        });

        if (matchingYear) {
            console.log(`Linking exam '${exam.title}' (${exam.date.toISOString().split('T')[0]}) to ${matchingYear.name}`);
            await prisma.exam.update({
                where: { id: exam.id },
                data: { academicYearId: matchingYear.id }
            });
        } else {
            console.log(`No matching academic year found for exam '${exam.title}' (${exam.date.toISOString().split('T')[0]}) in school ${exam.school.slug}`);

            // Fallback: Check if we should broaden the search or just log it
            // Maybe the date is slightly off? 
            // For now, just logging.
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
