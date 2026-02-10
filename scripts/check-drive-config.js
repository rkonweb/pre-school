const { PrismaClient } = require('@prisma/client');

async function checkConfig() {
    const prisma = new PrismaClient();
    try {
        const school = await prisma.school.findUnique({
            where: { slug: 'test' },
            select: { integrationsConfig: true }
        });

        console.log('Raw config:', school?.integrationsConfig);

        if (school?.integrationsConfig) {
            const config = JSON.parse(school.integrationsConfig);
            console.log('\nParsed config:', JSON.stringify(config, null, 2));

            if (config.googleDrive) {
                console.log('\n=== Google Drive Config ===');
                console.log('Enabled:', config.googleDrive.enabled);
                console.log('Client Email:', config.googleDrive.clientEmail ? '✓ Set' : '✗ Not set');
                console.log('Private Key:', config.googleDrive.privateKey ? '✓ Set (' + config.googleDrive.privateKey.length + ' chars)' : '✗ Not set');
                console.log('Folder ID:', config.googleDrive.folderId || 'Not set (using root)');
            } else {
                console.log('\n❌ No googleDrive config found');
            }
        } else {
            console.log('\n❌ No integrationsConfig found for school');
        }
    } finally {
        await prisma.$disconnect();
    }
}

checkConfig().catch(console.error);
