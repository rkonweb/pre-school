import { PrismaClient } from '../src/generated/client_final';

const prisma = new PrismaClient();

async function main() {
    const mobile = '+912323232323';

    // check if school exists
    let school = await prisma.school.findFirst();
    if (!school) {
        school = await prisma.school.create({
            data: {
                name: "Bodhi Board Pre-School",
                slug: "bodhi-board",
            }
        });
        console.log("Created School", school.name);
    } else {
        console.log("School already exists", school.name);
    }

    let user = await prisma.user.findFirst({
        where: { mobile }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                mobile,
                firstName: "Admin",
                lastName: "User",
                role: "ADMIN",
                status: "ACTIVE",
                schoolId: school.id
            }
        });
        console.log("Created Admin User", user.mobile);
    } else {
        console.log("User already exists", user.mobile);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
