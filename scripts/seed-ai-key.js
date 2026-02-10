const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const apiKey = "AIzaSyCPLcFTucJGZsd2sqgg44y9DsvNalz7vwg";
    const config = {
        googleAiKey: apiKey,
        openAiKey: ""
    };

    await prisma.systemSettings.upsert({
        where: { id: 'global' },
        update: {
            integrationsConfig: JSON.stringify(config)
        },
        create: {
            id: 'global',
            integrationsConfig: JSON.stringify(config),
            timezone: "UTC+05:30 (India Standard Time)",
            currency: "INR"
        }
    });

    console.log("Successfully seeded Google AI API Key.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
