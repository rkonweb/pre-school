import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting cleanup of test data...");

    // Check available models to avoid errors
    const models = Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$"));
    console.log("Available models:", models.join(", "));

    // 1. Remove Test Drivers/Staff from User
    // Use 'user' because 'model User' is in schema
    if ((prisma as any).user) {
        const deletedUsers = await (prisma as any).user.deleteMany({
            where: {
                OR: [
                    { firstName: { contains: "Test", mode: "insensitive" }, lastName: { contains: "Driver", mode: "insensitive" } },
                    { firstName: { contains: "Sample", mode: "insensitive" } }
                ],
                role: { in: ["STAFF", "ADMIN"] }
            }
        });
        console.log(`✅ Deleted ${deletedUsers.count} test staff/users.`);
    }

    // 2. Remove Auto Test Parents from Admissions CRM (Lead model)
    if ((prisma as any).lead) {
        const deletedLeads = await (prisma as any).lead.deleteMany({
            where: {
                OR: [
                    { parentName: { contains: "Auto Test", mode: "insensitive" } },
                    { parentName: { contains: "Sample Parent", mode: "insensitive" } }
                ]
            }
        });
        console.log(`✅ Deleted ${deletedLeads.count} test leads/parents.`);
    }

    // 3. Ensure Admin User has a valid email
    if ((prisma as any).user) {
        const adminUser = await (prisma as any).user.findFirst({
            where: { role: "ADMIN" }
        });

        if (adminUser) {
            if (!adminUser.email) {
                const updatedAdmin = await (prisma as any).user.update({
                    where: { id: adminUser.id },
                    data: { email: `admin@pre-school.com` }
                });
                console.log(`✅ Updated email for admin user: ${updatedAdmin.email}`);
            } else {
                console.log(`ℹ️ Admin user already has email: ${adminUser.email}`);
            }
        }
    }

    console.log("✨ Cleanup completed.");
}

main()
    .catch((e) => {
        console.error("❌ Error during cleanup:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
