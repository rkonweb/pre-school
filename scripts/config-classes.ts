import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const schoolSlug = 'littlechanakyas';
    const school = await prisma.school.findUnique({
        where: { slug: schoolSlug }
    });

    if (!school) {
        console.error(`School not found: ${schoolSlug}`);
        return;
    }

    console.log(`Configuring classes for ${school.name}...`);

    // 1. Get all classes for this school
    const classes = await prisma.classroom.findMany({
        where: { schoolId: school.id }
    });

    if (classes.length === 0) {
        console.log("No classes found to configure.");
    } else {
        // 2. Set default capacities (e.g., 25 for preschool classes)
        console.log(`Updating capacities for ${classes.length} classes...`);
        await prisma.classroom.updateMany({
            where: { schoolId: school.id },
            data: { capacity: 25 }
        });
    }

    // 3. Assign teachers if missing
    // Get all STAFF/ADMIN users for this school
    const staff = await prisma.user.findMany({
        where: { 
            schoolId: school.id,
            role: { in: ['ADMIN', 'STAFF'] },
            status: 'ACTIVE'
        }
    });

    if (staff.length === 0) {
        console.log("No active staff found to assign as teachers.");
    } else {
        console.log(`Found ${staff.length} staff members.`);
        
        for (let i = 0; i < classes.length; i++) {
            const classroom = classes[i];
            // Assign a teacher cyclically from the staff list if not already assigned
            if (!classroom.teacherId) {
                const teacher = staff[i % staff.length];
                await prisma.classroom.update({
                    where: { id: classroom.id },
                    data: { teacherId: teacher.id }
                });
                console.log(`Assigned ${teacher.firstName} ${teacher.lastName} to ${classroom.name}`);
            } else {
                console.log(`${classroom.name} already has a teacher assigned.`);
            }
        }
    }

    console.log("Class configuration complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
