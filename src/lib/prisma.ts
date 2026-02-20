import { PrismaClient } from '../generated/client_final';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// We use a fresh instance to ensure stale global cache from old client generations is cleared
export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
