
import { prisma } from "./src/lib/prisma";

async function main() {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: 'global' }
        });
        // console.log("System Settings:", settings);
        if (settings && settings.integrationsConfig) {
            console.log("Integrations Config:", JSON.parse(settings.integrationsConfig));
        } else {
            console.log("Settings or integrationsConfig is missing.");
        }
    } catch (error) {
        console.error("Error fetching settings:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
