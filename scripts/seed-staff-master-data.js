const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const departments = [
    { name: "Kindergarten", code: "KG" },
    { name: "Nursery", code: "NUR" },
    { name: "Primary", code: "PRI" },
    { name: "Administration", code: "ADMIN" },
    { name: "Support Staff", code: "SUPPORT" },
    { name: "Transport", code: "TRANS" },
    { name: "Security", code: "SEC" },
    { name: "Library", code: "LIB" },
    { name: "IT & Systems", code: "IT" }
];

const employmentTypes = [
    { name: "Full Time", code: "FULL_TIME" },
    { name: "Part Time", code: "PART_TIME" },
    { name: "Contract", code: "CONTRACT" },
    { name: "Internship", code: "INTERN" },
    { name: "Consultant", code: "CONSULT" }
];

async function main() {
    console.log("Seeding Additional Staff Master Data...");

    // Seed Departments
    const existingDepts = await prisma.masterData.findMany({ where: { type: "DEPARTMENT" } });
    const existingDeptNames = new Set(existingDepts.map(d => d.name));

    for (const d of departments) {
        if (!existingDeptNames.has(d.name)) {
            await prisma.masterData.create({
                data: { type: "DEPARTMENT", name: d.name, code: d.code }
            });
            console.log(`Created Department: ${d.name}`);
        }
    }

    // Seed Employment Types
    const existingTypes = await prisma.masterData.findMany({ where: { type: "EMPLOYMENT_TYPE" } });
    const existingTypeNames = new Set(existingTypes.map(d => d.name));

    for (const t of employmentTypes) {
        if (!existingTypeNames.has(t.name)) {
            await prisma.masterData.create({
                data: { type: "EMPLOYMENT_TYPE", name: t.name, code: t.code }
            });
            console.log(`Created Employment Type: ${t.name}`);
        }
    }

    console.log("Master Data seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
