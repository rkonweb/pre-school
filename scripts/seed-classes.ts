import { PrismaClient } from '../src/generated/client_final';

const prisma = new PrismaClient();

const SCHOOL_SLUG = 'bodhi-board';
const SECTIONS = ['A', 'B'];

async function main() {
    // 1. Get school
    const school = await prisma.school.findUnique({ where: { slug: SCHOOL_SLUG } });
    if (!school) { console.error('School not found:', SCHOOL_SLUG); process.exit(1); }
    console.log(`✅ School: ${school.name} (${school.id})`);

    // 2. Get all grades from MasterData
    const grades = await prisma.masterData.findMany({
        where: { type: 'GRADE' },
        orderBy: { name: 'asc' }
    });

    if (grades.length === 0) {
        // No grades configured — use preschool defaults
        console.log('⚠️  No GRADE master data found. Using preschool defaults.');
        grades.push(
            { id: 'default-nursery', type: 'GRADE', name: 'Nursery', code: null, parentId: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 'default-lkg', type: 'GRADE', name: 'LKG', code: null, parentId: null, createdAt: new Date(), updatedAt: new Date() },
            { id: 'default-ukg', type: 'GRADE', name: 'UKG', code: null, parentId: null, createdAt: new Date(), updatedAt: new Date() },
        );
    }

    console.log(`\n📚 Grades found (${grades.length}):`);
    grades.forEach(g => console.log(`   - ${g.name}`));

    // 3. Create classrooms
    let created = 0;
    let skipped = 0;

    for (const grade of grades) {
        for (const sec of SECTIONS) {
            const name = `${grade.name} - ${sec}`;
            // Check if already exists
            const existing = await prisma.classroom.findFirst({
                where: { schoolId: school.id, name }
            });
            if (existing) {
                console.log(`   ⏭️  Already exists: ${name}`);
                skipped++;
                continue;
            }
            await prisma.classroom.create({
                data: { name, schoolId: school.id, capacity: 30 }
            });
            console.log(`   ✅ Created: ${name}`);
            created++;
        }
    }

    console.log(`\n🎉 Done! Created: ${created}, Skipped (already existed): ${skipped}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
