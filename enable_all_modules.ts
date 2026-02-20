
import { PrismaClient } from './src/generated/client';

const prisma = new PrismaClient();

async function enableAllModules() {
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

    // List of all available root modules based on Sidebar.tsx
    const allModules = [
        "dashboard",
        "admissions",
        "students",
        "academics",
        "diary",
        "staff",
        "billing",
        "inventory",
        "transport",
        "library",
        "training",
        "documents",
        "communication",
        "marketing",
        "settings",
        // Keeping "attendance" as it was present in current config, possibly for legacy or specific overrides
        "attendance"
    ];

    let currentModules: string[] = [];
    if (school.modulesConfig) {
        try {
            currentModules = JSON.parse(school.modulesConfig);
        } catch (e) {
            console.error("Error parsing config, starting fresh");
        }
    }

    console.log("Current Modules:", currentModules);

    // Merge missing modules
    let updated = false;
    allModules.forEach(mod => {
        if (!currentModules.includes(mod)) {
            currentModules.push(mod);
            console.log(`Enabling module: ${mod}`);
            updated = true;
        }
    });

    if (!updated) {
        console.log("All modules are already enabled.");
        return;
    }

    const result = await prisma.school.update({
        where: { id: school.id },
        data: {
            modulesConfig: JSON.stringify(currentModules)
        }
    });

    console.log("Updated Modules Config:", result.modulesConfig);
}

enableAllModules()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
