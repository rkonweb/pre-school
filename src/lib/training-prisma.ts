import 'server-only';
// @ts-ignore
import { PrismaClient } from '../generated/training-client';

const globalForPrisma = globalThis as unknown as { trainingPrisma: any };

export const trainingPrisma = globalForPrisma.trainingPrisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.trainingPrisma = trainingPrisma;
