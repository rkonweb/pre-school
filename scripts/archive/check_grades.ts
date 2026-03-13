
import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function checkGrades() {
    console.log("Checking MasterData for grades...");
    const grades = await prisma.masterData.findMany({
        where: { type: 'GRADE' }
    });

    console.log("Found Grades:", grades.map(g => g.name));

    console.log("\nChecking Student Grades...");
    const students = await prisma.student.findMany({
        take: 5,
        select: { firstName: true, grade: true }
    });
    console.log("Sample Students:", students);
}

checkGrades()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
