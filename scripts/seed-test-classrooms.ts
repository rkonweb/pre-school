
import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function seedClassrooms() {
    console.log("--- SEEDING CLASSROOMS FOR 'TEST' SCHOOL ---");
    const slug = "test";

    const school = await prisma.school.findUnique({
        where: { slug }
    });

    if (!school) {
        console.error("School 'test' not found!");
        return;
    }

    const standardClasses = [
        "Nursery - A", "Nursery - B",
        "LKG - A", "LKG - B",
        "UKG - A", "UKG - B",
        "Grade 1 - A", "Grade 1 - B",
        "Grade 2 - A", "Grade 2 - B"
    ];

    console.log(`Found School: ${school.name} (${school.id})`);
    console.log("Creating classrooms...");

    for (const name of standardClasses) {
        // Check if exists
        const exists = await prisma.classroom.findFirst({
            where: { schoolId: school.id, name }
        });

        if (exists) {
            console.log(`Skipping ${name} (already exists)`);
        } else {
            await prisma.classroom.create({
                data: {
                    name,
                    schoolId: school.id,
                    capacity: 30
                }
            });
            console.log(`Created: ${name}`);
        }
    }
    console.log("--- SEEDING COMPLETE ---");
}

seedClassrooms()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
