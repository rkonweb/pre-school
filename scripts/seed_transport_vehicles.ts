
import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'gggggggggg';

    console.log(`Finding school with slug: ${slug}...`);
    const school = await prisma.school.findUnique({
        where: { slug },
    });

    if (!school) {
        console.error(`School with slug "${slug}" not found.`);
        return;
    }

    console.log(`Found school: ${school.name} (${school.id})`);

    const models = ["Tata Starbus", "Ashok Leyland Sunshine", "Force Traveller", "SML Isuzu", "Eicher Skyline"];
    const statuses = ["ACTIVE", "MAINTENANCE", "INACTIVE"];

    console.log("Seeding 10 transport vehicles...");

    for (let i = 1; i <= 10; i++) {
        const registrationNumber = `KA-${Math.floor(Math.random() * 50 + 1).toString().padStart(2, '0')}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 9000 + 1000)}`;
        const model = models[Math.floor(Math.random() * models.length)];
        const capacity = [20, 25, 30, 40, 50][Math.floor(Math.random() * 5)];
        const status = Math.random() > 0.8 ? "MAINTENANCE" : "ACTIVE"; // Mostly active

        await prisma.transportVehicle.create({
            data: {
                registrationNumber,
                model,
                capacity,
                schoolId: school.id,
                status,
                insuranceNumber: `INS-${Math.random().toString(36).substring(7).toUpperCase()}`,
                insuranceExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Valid for 1 year
                pollutionExpiry: new Date(new Date().setMonth(new Date().getMonth() + 6)), // Valid for 6 months
                fitnessExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            }
        });
        console.log(`Created vehicle ${i}: ${registrationNumber} (${model})`);
    }

    console.log("Seeding Complete: Added 10 vehicles.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
