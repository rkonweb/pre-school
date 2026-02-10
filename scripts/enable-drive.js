const { PrismaClient } = require('@prisma/client');

async function enableGoogleDrive() {
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

        await prisma.school.update({
            where: { slug: 'test' },
            data: { integrationsConfig: JSON.stringify(config) }
        });

        console.log('✅ Enabled Google Drive');
        console.log('   Folder ID:', config.googleDrive.folderId);
    } finally {
        await prisma.$disconnect();
    }
}

enableGoogleDrive().catch(console.error);
