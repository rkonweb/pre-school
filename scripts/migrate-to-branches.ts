import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    console.log('🚀 Starting Multi-Branch Migration...');

    try {
        // 1. Get all schools
        const schools = await prisma.school.findMany({
            include: {
                branches: true,
            },
        });

        console.log(`🏫 Found ${schools.length} schools.`);

        for (const school of schools) {
            console.log(`\n-----------------------------------`);
            console.log(`Processing School: ${school.name} (${school.id})`);

            // 2. Check/Create Main Branch
            let mainBranch = school.branches.find(b => b.name === 'Main Branch');

            if (!mainBranch) {
                console.log(`Checking if any branch exists...`);
                // If no "Main Branch", but maybe others exist? 
                // If NO branches at all, create "Main Branch".
                if (school.branches.length === 0) {
                    console.log(`Creating 'Main Branch'...`);
                    mainBranch = await prisma.branch.create({
                        data: {
                            name: 'Main Branch',
                            schoolId: school.id,
                        },
                    });
                    console.log(`✅ Created Branch: ${mainBranch.id}`);
                } else {
                    // Pick the first one as default if multiple exist (unlikely in this migration phase)
                    mainBranch = school.branches[0];
                    console.log(`ℹ️ Using existing branch: ${mainBranch.name} (${mainBranch.id})`);
                }
            } else {
                console.log(`ℹ️ 'Main Branch' already exists: ${mainBranch.id}`);
            }

            const branchId = mainBranch.id;

            // 3. Backfill Data
            // Helper to update if branchId is null
            const updateIfNull = async (model: any, modelName: string) => {
                const count = await model.count({
                    where: {
                        schoolId: school.id,
                        branchId: null,
                    },
                });

                if (count > 0) {
                    console.log(`Updating ${count} ${modelName}s...`);
                    await model.updateMany({
                        where: {
                            schoolId: school.id,
                            branchId: null,
                        },
                        data: {
                            branchId: branchId,
                        },
                    });
                    console.log(`✅ Updated ${modelName}s.`);
                } else {
                    console.log(`Assignments for ${modelName} are up to date.`);
                }
            };

            await updateIfNull(prisma.student, 'Student');
            await updateIfNull(prisma.classroom, 'Classroom');
            await updateIfNull(prisma.admission, 'Admission');
            // Fee sometimes has schoolId via Student, but the model has studentId. 
            // Fee schema: studentId, academicYearId. It DOES NOT have schoolId directly.
            // We need to update Fees based on Student's branch? Or can we just update all fees of students in this school?
            // Actually Fee now has branchId.

            // Update Fees based on Student's branch (which is now set)
            // This is a bit trickier with updateMany as it doesn't support joins in the where clause easily in Prisma < 6 for updateMany relations?
            // Actually, we can fetch fees with null branchId where student.schoolId = school.id

            console.log(`Updating Fees...`);
            // Find fees with no branch where student belongs to this school
            // This might be slow for massive DBs, but fine for migration.
            const feesToUpdate = await prisma.fee.findMany({
                where: {
                    branchId: null,
                    student: {
                        schoolId: school.id
                    }
                },
                select: { id: true }
            });

            if (feesToUpdate.length > 0) {
                console.log(`Found ${feesToUpdate.length} fees to update.`);
                await prisma.fee.updateMany({
                    where: {
                        id: { in: feesToUpdate.map(f => f.id) }
                    },
                    data: {
                        branchId: branchId
                    }
                });
                console.log(`✅ Fees updated.`);
            }

            // Update Library Books
            await updateIfNull(prisma.libraryBook, 'LibraryBook');

            // Update Transport
            await updateIfNull(prisma.transportVehicle, 'TransportVehicle');
            await updateIfNull(prisma.transportRoute, 'TransportRoute');

            // Staff Attendance
            // Similar to Fee, it links to User, not School directly (though user has schoolId).
            console.log(`Updating Staff Attendance...`);
            const attendanceToUpdate = await prisma.staffAttendance.findMany({
                where: {
                    branchId: null,
                    user: {
                        schoolId: school.id
                    }
                },
                select: { id: true }
            });
            if (attendanceToUpdate.length > 0) {
                await prisma.staffAttendance.updateMany({
                    where: { id: { in: attendanceToUpdate.map(a => a.id) } },
                    data: { branchId }
                });
                console.log(`✅ Staff Attendance updated.`);
            }

        }
        console.log('\n🎉 Migration Complete!');
    } catch (error) {
        console.error('❌ Migration Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
