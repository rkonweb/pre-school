
import { PrismaClient } from './src/generated/client';

const prisma = new PrismaClient();

async function checkSchoolConfig() {
    const slug = 'gggggggggg';

    console.log(`Checking config for school: ${slug}`);

    const school = await prisma.school.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            modulesConfig: true,

        }
    });

    if (!school) {
        console.error("School not found!");
        return;
    }

    console.log("School found:", school.name);
    console.log("Modules Config (Raw):", school.modulesConfig);

    if (school.modulesConfig) {
        try {
            const parsed = JSON.parse(school.modulesConfig);
            console.log("Modules Config (Parsed):", parsed);
            console.log("Is 'transport' enabled?", parsed.includes('transport'));
        } catch (e) {
            console.error("Error parsing modulesConfig:", e);
        }
    } else {
        console.log("modulesConfig is null (All modules enabled by default)");
    }
}

checkSchoolConfig()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
