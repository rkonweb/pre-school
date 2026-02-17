require('dotenv').config();
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');
if (process.env.DATABASE_URL) console.log('DB URL starts with:', process.env.DATABASE_URL.substring(0, 10));

const { PrismaClient } = require('../src/generated/client_v2');
const prisma = new PrismaClient();

async function migrate() {
    console.log('🚀 Starting Multi-Branch Migration...');

    try {
        const schools = await prisma.school.findMany({
            include: {
                branches: true,
            },
        });

        for (const school of schools) {
            let mainBranch = school.branches.find(b => b.name === 'Main Branch');

            if (!mainBranch) {
                if (school.branches.length === 0) {
                    console.log(`Creating 'Main Branch' for school ${school.name}...`);
                    mainBranch = await prisma.branch.create({
                        data: {
                            name: 'Main Branch',
                            schoolId: school.id,
                        },
                    });
                } else {
                    mainBranch = school.branches[0];
                }
            }

            const branchId = mainBranch.id;

            const updateModel = async (model, modelName, hasSchoolId = true, relationPath = null) => {
                let whereClause = { branchId: null };

                if (hasSchoolId) {
                    whereClause.schoolId = school.id;
                } else if (relationPath) {
                    // For updateMany we can't use relation filter.
                    // We must fetch IDs first.
                    const findWhere = { branchId: null };
                    let currentLevel = findWhere;
                    const parts = relationPath.split('.');
                    // e.g. student.schoolId
                    // This simple parser is enough for single relation
                    if (parts.length === 2) {
                        findWhere[parts[0]] = { [parts[1]]: school.id };
                    }

                    const records = await model.findMany({
                        where: findWhere,
                        select: { id: true }
                    });

                    const ids = records.map(r => r.id);
                    if (ids.length === 0) {
                        console.log(`Assignments for ${modelName} are up to date.`);
                        return;
                    }

                    console.log(`Updating ${ids.length} ${modelName}s...`);
                    await model.updateMany({
                        where: { id: { in: ids } },
                        data: { branchId: branchId }
                    });
                    console.log(`✅ Updated ${modelName}s.`);
                    return;
                }

                const count = await model.count({ where: whereClause });

                if (count > 0) {
                    console.log(`Updating ${count} ${modelName}s...`);
                    await model.updateMany({
                        where: whereClause,
                        data: {
                            branchId: branchId,
                        },
                    });
                    console.log(`✅ Updated ${modelName}s.`);
                } else {
                    console.log(`Assignments for ${modelName} are up to date.`);
                }
            };

            await updateModel(prisma.student, 'Student', true);
            await updateModel(prisma.classroom, 'Classroom', true);
            await updateModel(prisma.admission, 'Admission', true);

            // Fee has student.schoolId
            await updateModel(prisma.fee, 'Fee', false, 'student.schoolId');

            // StaffAttendance has user.schoolId
            await updateModel(prisma.staffAttendance, 'StaffAttendance', false, 'user.schoolId');

            await updateModel(prisma.libraryBook, 'LibraryBook', true);
            await updateModel(prisma.transportVehicle, 'TransportVehicle', true);
            await updateModel(prisma.transportRoute, 'TransportRoute', true);

            // Leads use preferredBranchId. Handled separately or we can adapt this function.
            const leadCount = await prisma.lead.count({
                where: {
                    schoolId: school.id,
                    preferredBranchId: null
                }
            });

            if (leadCount > 0) {
                console.log(`Updating ${leadCount} Leads...`);
                await prisma.lead.updateMany({
                    where: {
                        schoolId: school.id,
                        preferredBranchId: null
                    },
                    data: {
                        preferredBranchId: branchId
                    }
                });
                console.log(`✅ Updated Leads.`);
            }
        }


        console.log('🎉 Migration Complete!');
    } catch (error) {
        console.error('❌ Migration Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
