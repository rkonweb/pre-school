
import { PrismaClient } from './src/generated/client';

const prisma = new PrismaClient();

async function enableTransportModule() {
    const slug = 'gggggggggg';

    console.log(`Fetching config for school: ${slug}`);

    const school = await prisma.school.findUnique({
        where: { slug },
        select: {
            id: true,
            modulesConfig: true
        }
    });

    if (!school) {
        console.error("School not found!");
        return;
    }

    let modules: string[] = [];
    if (school.modulesConfig) {
        try {
            modules = JSON.parse(school.modulesConfig);
        } catch (e) {
            console.error("Error parsing config, resetting to empty array");
        }
    }

    if (!modules.includes('transport')) {
        modules.push('transport');
        console.log("Adding 'transport' to modules...");
    } else {
        console.log("'transport' is already enabled.");
        return;
    }

    const updated = await prisma.school.update({
        where: { id: school.id },
        data: {
            modulesConfig: JSON.stringify(modules)
        }
    });

    console.log("Updated Modules Config:", updated.modulesConfig);
}

enableTransportModule()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
