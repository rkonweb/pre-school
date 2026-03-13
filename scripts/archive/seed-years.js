const { PrismaClient } = require("./src/generated/client");
const prisma = new PrismaClient();

async function main() {
    try {
        const schools = await prisma.school.findMany();
        console.log(`Found ${schools.length} schools.`);

        for (const school of schools) {
            const existing = await prisma.$queryRawUnsafe(
                "SELECT * FROM AcademicYear WHERE schoolId = ?",
                school.id
            );

            if (existing.length === 0) {
                console.log(`Seeding Academic Year for ${school.name}...`);
                await prisma.$executeRawUnsafe(
                    `INSERT INTO AcademicYear (id, name, startDate, endDate, isCurrent, status, schoolId) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    `seed-${school.slug}-2024`,
                    "2024-2025",
                    new Date("2024-04-01").toISOString(),
                    new Date("2025-03-31").toISOString(),
                    1, // isCurrent
                    "ACTIVE",
                    school.id
                );
            } else {
                console.log(`Academic Year already exists for ${school.name}.`);
            }
        }
        console.log("Seeding complete.");
    } catch (e) {
        console.error("Seeding error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
