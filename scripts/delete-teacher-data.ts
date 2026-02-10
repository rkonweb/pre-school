
// @ts-ignore
import { PrismaClient } from '../src/generated/training-client';

const trainingPrisma = new PrismaClient();

async function main() {
    console.log('Starting deletion of Teacher Training Data...');

    try {
        // 1. Find the "Teacher" category
        const teacherCategory = await trainingPrisma.trainingCategory.findFirst({
            where: {
                name: {
                    in: ['Teacher', 'TEACHER', 'teacher']
                }
            }
        });

        if (!teacherCategory) {
            console.log('Teacher category not found. Checking for modules with role="TEACHER" only.');
        } else {
            console.log(`Found Teacher Category: ${teacherCategory.name} (${teacherCategory.id})`);
        }

        // 2. Delete modules
        // We want to delete modules that are either linked to the Teacher category OR have the legacy role "TEACHER"
        const whereClause: any = {
            OR: [
                { role: 'TEACHER' }
            ]
        };

        if (teacherCategory) {
            whereClause.OR.push({ categoryId: teacherCategory.id });
        }

        const deletedModules = await trainingPrisma.trainingModule.deleteMany({
            where: whereClause
        });

        console.log(`Deleted ${deletedModules.count} Training Modules (and related Topics/Pages via Cascade).`);

    } catch (error) {
        console.error('Error deleting data:', error);
    } finally {
        await trainingPrisma.$disconnect();
    }
}

main();
