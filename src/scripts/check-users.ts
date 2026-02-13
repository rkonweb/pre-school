
import { prisma } from "../lib/prisma";

async function main() {
    const schoolSlug = "y";
    const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
    if (!school) {
        console.log("School not found");
        return;
    }

    const users = await prisma.user.findMany({
        where: { schoolId: school.id }
    });

    console.log(`Users for school ${school.name}:`);
    users.forEach(u => {
        console.log(` - ${u.firstName} ${u.lastName} (Role: ${u.role}, Status: ${u.status})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
