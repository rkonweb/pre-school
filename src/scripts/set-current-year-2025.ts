
import { prisma } from "@/lib/prisma";

async function main() {
    const schools = await prisma.school.findMany();

    for (const school of schools) {
        console.log(`Processing school: ${school.name} (${school.slug})`);

        // 1. Unset current for all existing years
        await prisma.academicYear.updateMany({
            where: { schoolId: school.id },
            data: { isCurrent: false }
        });

        // 2. Check if 2025-2026 exists
        const existing2025 = await prisma.academicYear.findFirst({
            where: {
                schoolId: school.id,
                name: "2025-2026"
            }
        });

        if (existing2025) {
            console.log(`  - 2025-2026 already exists, verifying current status...`);
            await prisma.academicYear.update({
                where: { id: existing2025.id },
                data: { isCurrent: true }
            });
            console.log(`  - Set 2025-2026 as current.`);
        } else {
            console.log(`  - Creating 2025-2026...`);
            await prisma.academicYear.create({
                data: {
                    name: "2025-2026",
                    startDate: new Date("2025-04-01"),
                    endDate: new Date("2026-03-31"),
                    isCurrent: true,
                    schoolId: school.id
                }
            });
            console.log(`  - Created and set 2025-2026 as current.`);
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
