const { PrismaClient } = require("./src/generated/client_final");
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("--- SCHOLLS ---");
        const schools = await prisma.school.findMany({
            select: { id: true, slug: true, name: true }
        });
        console.log(JSON.stringify(schools, null, 2));

        console.log("\n--- ACADEMIC YEARS (PRISMA) ---");
        try {
            const years = await prisma.academicYear.findMany();
            console.log(JSON.stringify(years, null, 2));
        } catch (e) {
            console.log("Prisma query failed:", e.message);
        }

        console.log("\n--- ACADEMIC YEARS (RAW) ---");
        try {
            const rawYears = await prisma.$queryRawUnsafe("SELECT * FROM AcademicYear");
            console.log(JSON.stringify(rawYears, null, 2));
        } catch (e) {
            console.log("Raw query failed:", e.message);
        }

    } catch (e) {
        console.error("Main error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
