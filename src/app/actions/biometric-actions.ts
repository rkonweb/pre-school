"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBiometricUnmappedUsersAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found" };

        // 1. Get all unique deviceUserIds from logs
        const uniqueLogIds = await prisma.biometricLog.groupBy({
            by: ["deviceUserId"],
            where: { schoolId: school.id }
        });

        const deviceUserIds = uniqueLogIds.map(u => u.deviceUserId);

        // 2. Get all currently mapped biometric IDs in User table
        const mappedUsers = await prisma.user.findMany({
            where: {
                schoolId: school.id,
                biometricId: { in: deviceUserIds }
            },
            select: { biometricId: true }
        });

        const mappedIds = new Set(mappedUsers.map(u => u.biometricId));

        // 3. Filter out IDs that are already mapped
        const unmappedIds = deviceUserIds.filter(id => !mappedIds.has(id));

        return { success: true, data: unmappedIds };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function mapBiometricUserAction(schoolSlug: string, deviceUserId: string, systemUserId: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            include: { users: { where: { id: systemUserId } } }
        });

        if (!school || !school.users[0]) return { success: false, error: "Validation failed" };

        await prisma.user.update({
            where: { id: systemUserId },
            data: { biometricId: deviceUserId }
        });

        revalidatePath(`/s/${schoolSlug}/settings/biometric`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRecentBiometricLogsAction(schoolSlug: string) {
    try {
        const logs = await prisma.biometricLog.findMany({
            where: { school: { slug: schoolSlug } },
            orderBy: { timestamp: "desc" },
            take: 20
        });

        // Resolve user names if mapped
        // This is N+1 but efficient enough for 20 items. Better to use join if possible, but biometricId is separate.
        // Let's do a bulk fetch optimization.
        const deviceIds = Array.from(new Set(logs.map(l => l.deviceUserId)));
        const users = await prisma.user.findMany({
            where: {
                school: { slug: schoolSlug },
                biometricId: { in: deviceIds }
            },
            select: { firstName: true, lastName: true, biometricId: true }
        });

        const userMap = new Map();
        users.forEach(u => userMap.set(u.biometricId, `${u.firstName} ${u.lastName}`));

        const enrichedLogs = logs.map(log => ({
            ...log,
            userName: userMap.get(log.deviceUserId) || "Unknown",
            statusLabel: log.status === 0 ? "IN" : log.status === 1 ? "OUT" : "LOG"
        }));

        return { success: true, data: enrichedLogs };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getConnectedDevicesAction(schoolSlug: string) {
    try {
        const logs = await prisma.biometricLog.groupBy({
            by: ["deviceId"],
            where: { school: { slug: schoolSlug } },
            _max: { timestamp: true },
            _count: { _all: true }
        });

        const devices = logs.map(d => ({
            serialNumber: d.deviceId,
            lastSeen: d._max.timestamp,
            totalPunches: d._count._all,
            status: d._max.timestamp && (new Date().getTime() - new Date(d._max.timestamp).getTime() < 1000 * 60 * 15) ? "ONLINE" : "OFFLINE"
        }));

        return { success: true, data: devices };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generateSampleBiometricDataAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found" };

        const deviceId = "SN-TEST-8899";
        const deviceUserIds = ["101", "102", "105", "200"];

        // Create 5 random logs
        for (let i = 0; i < 5; i++) {
            const randomUserId = deviceUserIds[Math.floor(Math.random() * deviceUserIds.length)];
            await prisma.biometricLog.create({
                data: {
                    deviceId,
                    deviceUserId: randomUserId,
                    timestamp: new Date(),
                    status: Math.random() > 0.5 ? 0 : 1, // 0=IN, 1=OUT
                    schoolId: school.id
                }
            });
        }

        revalidatePath(`/s/${schoolSlug}/settings/biometric`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
