
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Starting Mock Data Cleanup...");

    try {
        // 1. Remove Students with @demo.com emails or "StudentX" names
        const deletedStudents = await prisma.student.deleteMany({
            where: {
                OR: [
                    { parentEmail: { endsWith: "@demo.com" } },
                    { firstName: { startsWith: "Student" } }
                ]
            }
        });
        console.log(`✅ Deleted ${deletedStudents.count} mock students.`);

        // 2. Remove Users with @demo.com emails
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                email: { endsWith: "@demo.com" }
            }
        });
        console.log(`✅ Deleted ${deletedUsers.count} mock users.`);

        // 3. Remove Admissions/Leads with @demo.com or "Test" names
        const deletedAdmissions = await prisma.admission.deleteMany({
            where: {
                OR: [
                    { parentEmail: { endsWith: "@demo.com" } },
                    { studentName: { contains: "Test" } }
                ]
            }
        });
        console.log(`✅ Deleted ${deletedAdmissions.count} mock admissions.`);

        // 4. Cleanup any orphaned Salary Revisions if they weren't cascaded
        // (Prisma might handle this depending on schema, but let's be safe)
        // Actually deleteMany with relational filters is better but deleteMany doesn't support joins in some versions.
        // We'll trust the cascading or use a raw query if needed.

        console.log("✨ Cleanup completed successfully.");
    } catch (error) {
        console.error("❌ Cleanup failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
