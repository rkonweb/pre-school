import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function makePrismaClient() {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Wrapper that auto-reconnects on "Server has closed the connection" errors.
 * Use this for critical queries that may fail after a long idle period.
 */
export async function withReconnect<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (err: any) {
        const msg: string = err?.message ?? '';
        const isConnectionError =
            msg.includes('Server has closed the connection') ||
            msg.includes("Can't reach database server") ||
            msg.includes('Connection reset by peer') ||
            err?.code === 'P1017' || // connection closed
            err?.code === 'P1001';   // can't reach database

        if (isConnectionError) {
            console.warn('[Prisma] Reconnecting after dropped connection...');
            await prisma.$disconnect();
            await prisma.$connect();
            // Retry once after reconnect
            return await fn();
        }
        throw err;
    }
}
