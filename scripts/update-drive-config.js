const { PrismaClient } = require('@prisma/client');

async function updateDriveConfig() {
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
        config.googleDrive.enabled = true;
        config.googleDrive.folderId = '0AO3SHZteIjaMUk9PVA'; // New Shared Drive ID

        await prisma.school.update({
            where: { slug: 'test' },
            data: { integrationsConfig: JSON.stringify(config) }
        });

        console.log('✅ Updated Google Drive config');
        console.log('   Enabled: true');
        console.log('   Shared Drive ID: 0AO3SHZteIjaMUk9PVA');
    } finally {
        await prisma.$disconnect();
    }
}

updateDriveConfig().catch(console.error);
