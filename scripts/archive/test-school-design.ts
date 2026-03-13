
const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Testing School Marketing Design Persistence ---');

        // 1. Get a school and a template to test with
        const school = await prisma.school.findFirst();
        const template = await prisma.marketingTemplate.findFirst({ where: { isActive: true } });

        if (!school || !template) {
            console.log('Error: No school or active template found.');
            return;
        }

        console.log(`Using School: ${school.name} (${school.slug})`);
        console.log(`Using Template: ${template.name} (${template.id})`);

        // 2. Create/Update a design
        const dummyValues = { "test_zone": "Hello World" };
        console.log('Saving design...');
        await prisma.schoolMarketingDesign.upsert({
            where: {
                schoolId_templateId: {
                    schoolId: school.id,
                    templateId: template.id
                }
            },
            update: { customValues: JSON.stringify(dummyValues) },
            create: {
                schoolId: school.id,
                templateId: template.id,
                customValues: JSON.stringify(dummyValues)
            }
        });

        // 3. Retrieve it
        const design = await prisma.schoolMarketingDesign.findUnique({
            where: {
                schoolId_templateId: {
                    schoolId: school.id,
                    templateId: template.id
                }
            }
        });
        console.log('Retrieved Design:', design ? design.customValues : 'Not Found');

        // 4. Clean up (Optional, or just reset)
        // await prisma.schoolMarketingDesign.delete(...)

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
