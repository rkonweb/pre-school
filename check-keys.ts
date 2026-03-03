import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'global' } });
    console.log(settings?.integrationsConfig);
}
main().catch(console.error).finally(() => prisma.$disconnect());
