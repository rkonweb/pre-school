import { PrismaClient } from '../src/generated/client_final/index.js';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Seeding test students...");
        // Fetch the first active school
        const school = await prisma.school.findFirst();
        if (!school) {
            console.error("No school found in the database. Cannot seed students.");
            return;
        }

        // Fetch the first branch (if any) to assign
        const branch = await prisma.branch.findFirst({
            where: { schoolId: school.id }
        });
        const branchId = branch ? branch.id : null;

        // Fetch all classrooms
        const classrooms = await prisma.classroom.findMany({
            where: { schoolId: school.id }
        });

        if (classrooms.length === 0) {
            console.error("No classrooms found. Please create classes/sections first.");
            return;
        }

        let totalCreated = 0;

        for (const classroom of classrooms) {
            const className = classroom.name.replace(/\s+/g, '_').toLowerCase();

            for (let i = 1; i <= 5; i++) {
                const uniqueSuffix = Date.now().toString().slice(-4) + Math.floor(Math.random() * 1000);
                const firstName = `Student${i}`;
                const lastName = `Class${classroom.name.replace(/[^a-zA-Z0-9]/g, '')}`;

                await prisma.student.create({
                    data: {
                        firstName,
                        lastName,
                        age: 5 + Math.floor(Math.random() * 10), // Random age 5-14
                        gender: i % 2 === 0 ? "Female" : "Male",
                        classroomId: classroom.id,
                        parentName: `Parent of ${firstName}`,
                        parentMobile: `9876${uniqueSuffix.padStart(6, '0')}`.slice(0, 10),
                        parentEmail: `parent.${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.com`,
                        schoolId: school.id,
                        branchId: branchId,
                        status: "ACTIVE",
                        joiningDate: new Date(),
                        admissionNumber: `ADM-${className.toUpperCase()}-${uniqueSuffix}`,
                        bloodGroup: "O+",
                    }
                });
                totalCreated++;
            }
            console.log(`✅ Created 5 students in classroom: ${classroom.name}`);
        }

        console.log(`🎉 Successfully created ${totalCreated} students across ${classrooms.length} classrooms.`);

    } catch (error) {
        console.error("Error seeding students:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
