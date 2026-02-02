
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Get the school ID from the ADMIN user (since we know he exists)
    const admin = await prisma.user.findFirst({
        where: { mobile: "9999999999" }
    });

    if (!admin) {
        console.error("Admin not found!");
        return;
    }

    console.log("Creating Parent for School ID:", admin.schoolId);

    // 2. Create/Update Parent User
    const parent = await prisma.user.upsert({
        where: { mobile: "8888888888" },
        update: {
            role: "PARENT", // Ensure role is PARENT
            schoolId: admin.schoolId
        },
        create: {
            mobile: "8888888888",
            firstName: "Parent",
            lastName: "Demo",
            role: "PARENT",
            schoolId: admin.schoolId
        }
    });

    console.log("✅ PARENT CREATED!");
    console.log("Mobile: 8888888888");
    console.log("OTP: 1234 (Mocked)");
    console.log("Role:", parent.role);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
