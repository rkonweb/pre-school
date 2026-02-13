
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugAutoCreate() {
    console.log("Starting Debug...");

    // 1. Fetch first school (assuming single tenant for test)
    const school = await prisma.school.findFirst();
    if (!school) {
        console.error("No school found!");
        return;
    }
    console.log(`Checking School: ${school.name} (${school.slug})`);

    // 2. Fetch Current Year
    const currentYear = await prisma.academicYear.findFirst({
        where: { schoolId: school.id, isCurrent: true }
    });

    if (!currentYear) {
        console.error("No CURRENT academic year found!");
        const allYears = await prisma.academicYear.findMany({ where: { schoolId: school.id } });
        console.log("All Years:", allYears);
        return;
    }

    console.log(`Current Year: ${currentYear.name}`);
    console.log(`Start Date: ${currentYear.startDate}`);
    console.log(`End Date: ${currentYear.endDate}`);

    // 3. Logic Check
    const endDate = new Date(currentYear.endDate);
    const thresholdDate = new Date(endDate);
    thresholdDate.setMonth(thresholdDate.getMonth() - 10);

    const today = new Date();

    console.log("--- Calculation ---");
    console.log(`Today: ${today.toISOString()}`);
    console.log(`Threshold (10 months before end): ${thresholdDate.toISOString()}`);
    console.log(`Today >= Threshold? ${today >= thresholdDate}`);

    if (today >= thresholdDate) {
        console.log("Result: SHOULD CREATE NEXT YEAR");

        const parts = currentYear.name.split("-");
        if (parts.length === 2) {
            const start = parseInt(parts[0]);
            const end = parseInt(parts[1]);
            const nextYearName = `${start + 1}-${end + 1}`;
            console.log(`Next Year Name: ${nextYearName}`);

            const existing = await prisma.academicYear.findFirst({
                where: { schoolId: school.id, name: nextYearName }
            });

            if (existing) {
                console.log("Status: ALREADY EXISTS");
            } else {
                console.log("Status: DOES NOT EXIST (Would Create)");
            }
        } else {
            console.error("Error: Could not parse year name format.");
        }
    } else {
        console.log("Result: NO ACTION NEEDED");
    }
}

debugAutoCreate()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
