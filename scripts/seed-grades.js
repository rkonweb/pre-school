const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const grades = [
        { name: 'Playgroup (Toddlers)', code: 'PG' },
        { name: 'Nursery', code: 'NUR' },
        { name: 'Junior Kindergarten (LKG)', code: 'LKG' },
        { name: 'Senior Kindergarten (UKG)', code: 'UKG' },
        { name: 'Grade 1', code: 'G1' },
        { name: 'Grade 2', code: 'G2' },
        { name: 'Grade 3', code: 'G3' },
        { name: 'Grade 4', code: 'G4' },
        { name: 'Grade 5', code: 'G5' },
    ];

    console.log('Seeding pre-school grades...');

    for (const grade of grades) {
        try {
            const existing = await prisma.masterData.findFirst({
                where: {
                    type: 'GRADE',
                    name: grade.name,
                    parentId: null
                }
            });

            if (existing) {
                await prisma.masterData.update({
                    where: { id: existing.id },
                    data: { code: grade.code }
                });
                console.log(`- Updated: ${grade.name}`);
            } else {
                await prisma.masterData.create({
                    data: {
                        type: 'GRADE',
                        name: grade.name,
                        code: grade.code,
                        parentId: null
                    }
                });
                console.log(`- Created: ${grade.name}`);
            }
        } catch (e) {
            console.error(`- Error seeding ${grade.name}:`, e.message);
        }
    }

    console.log('Seeding completed!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
