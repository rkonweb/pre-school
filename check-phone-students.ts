import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const phone = '9445901265';

    console.log(`\n🔍 Searching for students with phone: ${phone}\n`);

    // Check in Student table
    const students = await prisma.student.findMany({
        where: {
            OR: [
                { parentMobile: phone },
                { emergencyContactPhone: phone }
            ]
        },
        include: {
            classroom: true,
            school: {
                select: {
                    name: true,
                    slug: true
                }
            }
        }
    });

    console.log(`📚 Students found in Student table: ${students.length}\n`);
    students.forEach((student, idx) => {
        console.log(`${idx + 1}. ${student.firstName} ${student.lastName}`);
        console.log(`   ID: ${student.id}`);
        console.log(`   Grade: ${student.grade}`);
        console.log(`   Class: ${student.classroom?.name || 'N/A'}`);
        console.log(`   School: ${student.school?.name} (${student.school?.slug})`);
        console.log(`   Status: ${student.status}`);
        console.log(`   Parent Mobile: ${student.parentMobile}`);
        console.log('');
    });

    // Check in Admission table
    const admissions = await prisma.admission.findMany({
        where: {
            OR: [
                { fatherPhone: phone },
                { motherPhone: phone },
                { parentPhone: phone }
            ]
        }
    });

    console.log(`📋 Admissions found: ${admissions.length}\n`);
    admissions.forEach((admission, idx) => {
        console.log(`${idx + 1}. ${admission.studentName}`);
        console.log(`   ID: ${admission.id}`);
        console.log(`   Father Phone: ${admission.fatherPhone}`);
        console.log(`   Mother Phone: ${admission.motherPhone}`);
        console.log(`   Parent Phone: ${admission.parentPhone}`);
        console.log('');
    });

    if (students.length === 0 && admissions.length === 0) {
        console.log('❌ No students or admissions found for this phone number!');
        console.log('\n💡 Suggestion: Check if the phone number exists in the database or try a different number.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
