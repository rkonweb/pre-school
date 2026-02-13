
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Marketing Attributes...");

    const formats = ["Social Media", "WhatsApp", "Brochure", "Flyer"];
    const categories = ["Admissions", "Events", "Holidays", "Academic", "Branding"];

    for (const name of formats) {
        await prisma.marketingAttribute.upsert({
            where: { type_name: { type: "FORMAT", name } },
            update: {},
            create: { type: "FORMAT", name },
        });
        console.log(`Created Format: ${name}`);
    }

    for (const name of categories) {
        await prisma.marketingAttribute.upsert({
            where: { type_name: { type: "CATEGORY", name } },
            update: {},
            create: { type: "CATEGORY", name },
        });
        console.log(`Created Category: ${name}`);
    }

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
