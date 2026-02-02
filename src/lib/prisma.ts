import 'server-only';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = (() => {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;
    console.log("INITIALIZING FRESH PRISMA INSTANCE");
    return new PrismaClient({
        log: ['query'],
    });
})();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
