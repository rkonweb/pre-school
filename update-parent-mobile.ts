import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('\n🔧 Updating Aarav Sharma student record with correct parent mobile...\n');

    // Find Aarav Sharma
    const student = await prisma.student.findFirst({
        where: {
            firstName: 'Aarav',
            lastName: 'Sharma',
            school: {
                slug: 'test4'
            }
        }
    });

    if (!student) {
        console.log('❌ Student not found!');
        return;
    }

    console.log(`Found: ${student.firstName} ${student.lastName}`);
    console.log(`Current parent mobile: ${student.parentMobile}`);
    console.log(`Updating to: 9445901265\n`);

    // Update the parent mobile
    const updated = await prisma.student.update({
        where: { id: student.id },
        data: {
            parentMobile: '9445901265'
        }
    });

    console.log('✅ Updated successfully!');
    console.log(`New parent mobile: ${updated.parentMobile}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
