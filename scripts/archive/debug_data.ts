
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for school 'gggggggggg'...");
    const school = await prisma.tenant.findUnique({
        where: { slug: 'gggggggggg' },
        include: { branches: true }
    });

    if (!school) {
        console.log("School 'gggggggggg' NOT FOUND.");
        return;
    }

    console.log(`School found: ${school.name} (${school.id})`);
    console.log(`Branches: ${school.branches.length}`);
    school.branches.forEach(b => console.log(` - ${b.name} (${b.id})`));

    console.log("\nChecking students...");
    const students = await prisma.student.findMany({
        where: { schoolId: school.id },
        take: 5
    });

    console.log(`Found ${students.length} students (showing top 5):`);
    students.forEach(s => console.log(` - ${s.firstName} ${s.lastName} (${s.id}) - Branch: ${s.branchId}`));

    const allStudentsCount = await prisma.student.count({
        where: { schoolId: school.id }
    });
    console.log(`Total students in DB for this school: ${allStudentsCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
