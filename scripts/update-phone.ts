import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePhoneNumber() {
    try {
        // Find the test4 school
        const school = await prisma.school.findUnique({
            where: { slug: 'test4' }
        });

        if (!school) {
            console.log('❌ School "test4" not found');
            return;
        }

        console.log(`✅ Found school: ${school.name} (${school.slug})`);

        // Find the admin user for this school
        const adminUser = await prisma.user.findFirst({
            where: {
                schoolId: school.id,
                role: 'ADMIN'
            }
        });

        if (!adminUser) {
            console.log('❌ No admin user found for test4 school');
            return;
        }

        console.log(`✅ Found admin user: ${adminUser.firstName} ${adminUser.lastName}`);
        console.log(`   Current phone: ${adminUser.mobile || 'Not set'}`);

        // Update the phone number
        const updatedUser = await prisma.user.update({
            where: { id: adminUser.id },
            data: { mobile: '1111111111' }
        });

        console.log(`✅ Phone number updated to: ${updatedUser.mobile}`);
        console.log('\n🎉 Success! You can now login with phone: 1111111111 and OTP: 1234');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updatePhoneNumber();
