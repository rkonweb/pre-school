const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const settings = await prisma.systemSettings.findUnique({ where: { id: 'global' } });
        const config = JSON.parse(settings.integrationsConfig);
        const apiKey = config.googleAiKey;

        if (!apiKey) {
            console.error("No API key found in DB.");
            return;
        }

        console.log("Testing API Key:", apiKey.substring(0, 10) + "...");

        // Try to list models
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error Response:", JSON.stringify(data.error, null, 2));
            return;
        }

        if (data.models) {
            console.log("Available Models for this key:");
            data.models.forEach(m => {
                console.log(`- ${m.name}`);
            });
        } else {
            console.log("No models returned. Response:", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("Diagnostic Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
