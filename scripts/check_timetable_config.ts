// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = "bodhi-board";
    console.log(`Checking Timetable Data for School: ${slug}`);

    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true, name: true }
        });

        if (!school) {
            console.error("School not found!");
            return;
        }

        const classrooms = await prisma.classroom.findMany({
            where: { schoolId: school.id },
            select: {
                id: true,
                name: true,
                timetable: true,
                timetableStructureId: true,
                timetableStructure: {
                    select: {
                        id: true,
                        name: true,
                        config: true
                    }
                }
            }
        });

        console.log(`Found ${classrooms.length} classrooms.\n`);

        classrooms.forEach((c: any) => {
            console.log(`Classroom: ${c.name} (${c.id})`);
            console.log(`- Assigned Structure ID: ${c.timetableStructureId}`);
            console.log(`- Structure Name: ${c.timetableStructure?.name || "NONE"}`);
            console.log(`- Timetable Blob (first 100 chars): ${c.timetable ? c.timetable.substring(0, 100) : "NULL"}`);

            if (c.timetableStructure) {
                console.log(`- Structure Config (first 100 chars): ${c.timetableStructure.config.substring(0, 100)}...`);
            }
            console.log("--------------------------------------------------");
        });

        const structures = await prisma.timetableStructure.findMany({
            where: { schoolId: school.id },
            select: { id: true, name: true, config: true }
        });

        console.log(`\nTotal Timetable Structures in School: ${structures.length}`);
        structures.forEach((s: any) => {
            console.log(`- Structure: ${s.name} (${s.id})`);
        });

    } catch (e) {
        console.error("Query Failed:", e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
