const { PrismaClient } = require('@prisma/client');

async function disableGoogleDrive() {
    const prisma = new PrismaClient();
    try {
        const school = await prisma.school.findUnique({
            where: { slug: 'test' },
            select: { integrationsConfig: true }
        });

        if (!school?.integrationsConfig) {
            console.log('No config found');
            return;
        }

        const config = JSON.parse(school.integrationsConfig);
        config.googleDrive.enabled = false;

        await prisma.school.update({
            where: { slug: 'test' },
            data: { integrationsConfig: JSON.stringify(config) }
        });

        console.log('✅ Disabled Google Drive - files will save to local storage');
        console.log('   Location: /public/uploads/');
    } finally {
        await prisma.$disconnect();
    }
}

disableGoogleDrive().catch(console.error);
