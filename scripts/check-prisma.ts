
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client...');
    try {
        const modules = await prisma.trainingModule.findMany({
            take: 1,
        });
        console.log('Modules found:', modules);

        // Check if role field exists in the result
        if (modules.length > 0) {
            if ('role' in modules[0]) {
                console.log('SUCCESS: role field exists in TrainingModule');
            } else {
                console.error('FAILURE: role field MISSING in TrainingModule');
            }
        } else {
            // Try to create one to check schema
            console.log('No modules found, trying to create one...');
            try {
                const newModule = await prisma.trainingModule.create({
                    data: {
                        title: 'Test Module ' + Date.now(),
                        role: 'TEACHER',
                        slug: 'test-module-' + Date.now(),
                    }
                });
                console.log('SUCCESS: Created module with role:', newModule);
            } catch (e) {
                console.error('FAILURE: Creating module with role failed:', e);
            }
        }

    } catch (e) {
        console.error('Error querying TrainingModule:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
