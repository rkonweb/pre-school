import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('\n📚 Checking students in test4 school:\n');

    const students = await prisma.student.findMany({
        where: {
            school: {
                slug: 'test4'
            }
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            parentMobile: true,
            emergencyContactPhone: true,
            grade: true,
            status: true
        },
        take: 10
    });

    if (students.length === 0) {
        console.log('❌ No students found in test4 school!');
        console.log('\n💡 The admission record exists but needs to be converted to a Student record.');
    } else {
        console.log(`Found ${students.length} students:\n`);
        students.forEach((s, i) => {
            console.log(`${i + 1}. ${s.firstName} ${s.lastName}`);
            console.log(`   Parent Mobile: ${s.parentMobile || 'Not set'}`);
            console.log(`   Emergency: ${s.emergencyContactPhone || 'Not set'}`);
            console.log(`   Grade: ${s.grade}`);
            console.log(`   Status: ${s.status}`);
            console.log('');
        });
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
