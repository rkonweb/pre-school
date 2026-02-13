
import { prisma } from "@/lib/prisma";

async function main() {
    const years = await prisma.academicYear.findMany({
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
            school: {
                select: {
                    slug: true,
                    name: true
                }
            }
        }
    });

    if (years.length === 0) {
        console.log("No academic years found.");
    } else {
        years.forEach(y => {
            console.log(`[${y.school.slug}] ${y.name} (${y.startDate.toISOString().split('T')[0]} to ${y.endDate.toISOString().split('T')[0]}) - Current: ${y.isCurrent} [ID: ${y.id}]`);
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
