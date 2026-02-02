const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const designations = [
    { name: "Principal", code: "PR" },
    { name: "Vice Principal", code: "VP" },
    { name: "Head of Department", code: "HOD" },
    { name: "Senior Teacher", code: "ST" },
    { name: "Assistant Teacher", code: "AT" },
    { name: "Lab Instructor", code: "LI" },
    { name: "Librarian", code: "LIB" },
    { name: "Admin Officer", code: "AO" },
    { name: "Accountant", code: "ACC" },
    { name: "Front Desk Executive", code: "FDE" },
    { name: "Support Staff", code: "SS" },
    { name: "Bus Driver", code: "BD" },
    { name: "Security Guard", code: "SG" }
];

async function main() {
    console.log("Seeding Designations...");
    const existing = await prisma.masterData.findMany({
        where: { type: "DESIGNATION" }
    });

    const existingNames = new Set(existing.map(d => d.name));

    for (const d of designations) {
        if (!existingNames.has(d.name)) {
            await prisma.masterData.create({
                data: {
                    type: "DESIGNATION",
                    name: d.name,
                    code: d.code
                }
            });
            console.log(`Created: ${d.name}`);
        } else {
            console.log(`Skipped (already exists): ${d.name}`);
        }
    }
    console.log("Designation seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
