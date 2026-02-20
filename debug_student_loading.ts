
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("Simulating Student Loading...");
    const schoolSlug = 'gggggggggg';

    // 1. Get School
    const school = await prisma.school.findUnique({
        where: { slug: schoolSlug },
        include: { branches: true }
    });

    if (!school) {
        console.error("School not found");
        return;
    }
    console.log(`School: ${school.name}`);

    // 2. Check Permissions / validation logic simulation
    // Since we can't easily mock the session cookie here without a lot of work,
    // we will simulate the QUERY part of getStudentsAction assuming we are an ADMIN (all access)

    console.log("Simulating Admin Query...");

    const branchId = school.branches[0]?.id;
    console.log(`Using Branch Context: ${branchId}`);

    try {
        const whereClause: any = {
            school: { slug: schoolSlug },
            branchId: branchId // Simulating the branch filter applied by session
        };

        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                classroom: true
            },
            take: 5
        });

        console.log(`Query Success! Found ${students.length} students.`);
        students.forEach(s => console.log(` - ${s.firstName} (Branch: ${s.branchId})`));

    } catch (error) {
        console.error("Query FAILED:", error);
    }
}

main().catch(console.error);
