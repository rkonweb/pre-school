
import { PrismaClient } from "../src/generated/client";
const prisma = new PrismaClient();

async function debugData() {
    console.log("--- DEBUG CLASSROOM DATA ---");
    const slug = "test";

    // 1. Check School
    const school = await prisma.school.findUnique({
        where: { slug },
        include: { _count: { select: { classrooms: true } } }
    });
    console.log("School:", school ? `${school.name} (${school.id})` : "NOT FOUND");
    if (school) {
        console.log("Classroom Count:", school._count.classrooms);
    }

    // 2. List Classrooms
    if (school) {
        const classrooms = await prisma.classroom.findMany({
            where: { schoolId: school.id }
        });
        console.log("Classrooms:", classrooms.map(c => `${c.name} (${c.id})`));
    }

    // 3. Check Users & Roles
    if (school) {
        const users = await prisma.user.findMany({
            where: { schoolId: school.id },
            select: { id: true, firstName: true, role: true }
        });
        console.log("Users in School:", users);
    }
}

debugData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
