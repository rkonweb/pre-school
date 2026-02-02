const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bloodGroups = [
    { name: "A+", code: "A_POS" },
    { name: "A-", code: "A_NEG" },
    { name: "B+", code: "B_POS" },
    { name: "B-", code: "B_NEG" },
    { name: "O+", code: "O_POS" },
    { name: "O-", code: "O_NEG" },
    { name: "AB+", code: "AB_POS" },
    { name: "AB-", code: "AB_NEG" },
];

const genders = [
    { name: "Male", code: "MALE" },
    { name: "Female", code: "FEMALE" },
    { name: "Other", code: "OTHER" },
    { name: "Prefer not to say", code: "NOT_DISCLOSED" }
];

async function main() {
    console.log("Seeding Personal Master Data (Blood Group, Gender)...");

    // Seed Blood Groups
    const existingBloodGroups = await prisma.masterData.findMany({ where: { type: "BLOOD_GROUP" } });
    const existingBGNames = new Set(existingBloodGroups.map(d => d.name));

    for (const bg of bloodGroups) {
        if (!existingBGNames.has(bg.name)) {
            await prisma.masterData.create({
                data: { type: "BLOOD_GROUP", name: bg.name, code: bg.code }
            });
            console.log(`Created Blood Group: ${bg.name}`);
        }
    }

    // Seed Genders
    const existingGenders = await prisma.masterData.findMany({ where: { type: "GENDER" } });
    const existingGenderNames = new Set(existingGenders.map(d => d.name));

    for (const g of genders) {
        if (!existingGenderNames.has(g.name)) {
            await prisma.masterData.create({
                data: { type: "GENDER", name: g.name, code: g.code }
            });
            console.log(`Created Gender: ${g.name}`);
        }
    }

    console.log("Personal Master Data seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
