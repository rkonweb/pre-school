"use server";

import { prisma } from "@/lib/prisma";

import { getCurrentUserAction } from "./session-actions";
import { getCurriculumScope } from "@/lib/access-control";

export async function getCurriculumsAction() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fifteenDaysLater = new Date(today);
        fifteenDaysLater.setDate(today.getDate() + 14);
        fifteenDaysLater.setHours(23, 59, 59, 999);

        // ---------------------------------------------------------
        // ACCESS CONTROL
        // ---------------------------------------------------------
        let accessCondition = "";

        const userRes = await getCurrentUserAction();
        if (userRes.success && userRes.data) {
            const currentUser = userRes.data;

            if (currentUser.role === "STAFF") {
                const allowedIds = await getCurriculumScope(currentUser.id, currentUser.role);

                if (allowedIds.length > 0) {
                    const ids = allowedIds.map(id => `'${id}'`).join(", ");
                    accessCondition = `WHERE id IN (${ids})`;
                } else {
                    return { success: true, data: [] };
                }
            }
        }
        // ---------------------------------------------------------

        const query = `SELECT * FROM Curriculum ${accessCondition}`;
        // console.log("Executing Query:", query);
        const curriculums: any[] = await prisma.$queryRawUnsafe(query);

        if (curriculums.length === 0 && accessCondition === "") {
            // Only seed if we are viewing ALL (no filter) and it's truly empty DB
            const grades = [
                { name: "Playgroup", slug: "playgroup", color: "#00f2ff" },
                { name: "Nursery", slug: "nursery", color: "#bc00ff" },
                { name: "LKG", slug: "lkg", color: "#00ff8c" },
                { name: "UKG", slug: "ukg", color: "#ff0060" },
            ];
            for (const g of grades) {
                await prisma.$executeRawUnsafe(
                    `INSERT INTO Curriculum (id, name, slug, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
                    Math.random().toString(36).substr(2, 9), g.name, g.slug, g.color
                );
            }
            // Re-fetch after seeding
            const seeded: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM Curriculum`);
            return { success: true, data: await attachCompletion(seeded, today, fifteenDaysLater) };
        }

        return { success: true, data: await attachCompletion(curriculums, today, fifteenDaysLater) };
    } catch (error: any) {
        console.error("getCurriculumsAction Error:", error);
        return { success: false, error: error.message };
    }
}

async function attachCompletion(curriculums: any[], today: Date, fifteenDaysLater: Date) {
    return await Promise.all(curriculums.map(async (c) => {
        const days: any[] = await prisma.$queryRawUnsafe(
            `SELECT count(*) as count FROM DayCurriculum WHERE curriculumId = ? AND date >= ? AND date <= ?`,
            c.id, today.toISOString(), fifteenDaysLater.toISOString()
        );
        const count = Number(days[0].count);
        return {
            ...c,
            completion: Math.round((count / 15) * 100)
        };
    }));
}

function normalizeDate(date: Date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
}

export async function getDayCurriculumAction(curriculumId: string, date: Date) {
    try {
        const targetDate = normalizeDate(date);
        const days: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM DayCurriculum WHERE curriculumId = ? AND date = ?`,
            curriculumId,
            targetDate
        );
        return { success: true, data: days[0] || null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function saveDayCurriculumAction(curriculumId: string, date: Date, blocks: any, youtubeUrl?: string, worksheets?: any[]) {
    try {
        const targetDate = normalizeDate(date);
        const jsonBlocks = JSON.stringify(blocks);
        const jsonWorksheets = JSON.stringify(worksheets || []);

        await prisma.$executeRawUnsafe(`
            INSERT INTO DayCurriculum (id, curriculumId, date, blocks, youtubeUrl, worksheets, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(curriculumId, date) DO UPDATE SET
                blocks = excluded.blocks,
                youtubeUrl = excluded.youtubeUrl,
                worksheets = excluded.worksheets,
                updatedAt = datetime('now')
        `,
            Math.random().toString(36).substr(2, 9),
            curriculumId,
            targetDate,
            jsonBlocks,
            youtubeUrl || null,
            jsonWorksheets
        );

        return { success: true };
    } catch (error: any) {
        console.error("Save Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createCurriculumAction(name: string, slug: string, color?: string) {
    try {
        await prisma.$executeRawUnsafe(
            `INSERT INTO Curriculum (id, name, slug, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
            Math.random().toString(36).substr(2, 9), name, slug, color
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getMonthCurriculumAction(curriculumId: string, startDate: Date, endDate: Date) {
    try {
        // For range queries, we want the literal calendar days
        const start = normalizeDate(startDate);
        const end = normalizeDate(endDate).replace('00:00:00.000Z', '23:59:59.999Z');

        const days: any[] = await prisma.$queryRawUnsafe(
            `SELECT date, blocks FROM DayCurriculum WHERE curriculumId = ? AND date >= ? AND date <= ?`,
            curriculumId,
            start,
            end
        );
        return { success: true, data: days };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
