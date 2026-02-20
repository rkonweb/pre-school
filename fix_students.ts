
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("Starting student branch fix for school 'gggggggggg'...");

    const school = await prisma.school.findUnique({
        where: { slug: 'gggggggggg' },
        include: { branches: true }
    });

    if (!school) {
        console.error("School 'gggggggggg' NOT FOUND.");
        return;
    }

    const defaultBranch = school.branches[0];
    if (!defaultBranch) {
        console.error("No branches found for this school!");
        return;
    }

    console.log(`Target Branch: ${defaultBranch.name} (${defaultBranch.id})`);

    // Find students with NO branch (branchId is null)
    const studentsToFix = await prisma.student.findMany({
        where: {
            schoolId: school.id,
            branchId: null
        }
    });

    console.log(`Found ${studentsToFix.length} students with NULL branchId.`);

    if (studentsToFix.length > 0) {
        const updateResult = await prisma.student.updateMany({
            where: {
                schoolId: school.id,
                branchId: null
            },
            data: {
                branchId: defaultBranch.id
            }
        });

        console.log(`Successfully updated ${updateResult.count} students.`);
    } else {
        console.log("No students needed fixing.");
    }
}

main()
    .catch(e => console.error(e));
