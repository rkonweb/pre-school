"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserAction } from "./session-actions";
import { getCurriculumScope } from "@/lib/access-control";
import { revalidatePath } from "next/cache";
import { uploadToGoogleDriveNested } from "@/lib/google-drive-upload";

// ============================================================================
// ACADEMIC MONTH & DAY ACTIONS (NEW 10-MONTH STRUCTURE)
// ============================================================================

/**
 * Get all academic months for a curriculum (10 months)
 */
export async function getAcademicMonthsAction(curriculumId: string) {
    try {
        const months = await prisma.academicMonth.findMany({
            where: { curriculumId },
            orderBy: { monthNumber: 'asc' },
            include: {
                days: {
                    orderBy: { dayNumber: 'asc' },
                    select: {
                        id: true,
                        dayNumber: true,
                        title: true,
                        isCompleted: true,
                        blocks: true
                    }
                }
            }
        });

        return { success: true, data: months };
    } catch (error: any) {
        console.error("getAcademicMonthsAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a specific academic month with all its days
 */
export async function getAcademicMonthAction(curriculumId: string, monthNumber: number) {
    try {
        const month = await prisma.academicMonth.findUnique({
            where: {
                curriculumId_monthNumber: {
                    curriculumId,
                    monthNumber
                }
            },
            include: {
                days: {
                    orderBy: { dayNumber: 'asc' }
                }
            }
        });

        return { success: true, data: month };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get a specific academic day with all its blocks
 */
export async function getAcademicDayAction(monthId: string, dayNumber: number) {
    try {
        const day = await prisma.academicDay.findUnique({
            where: {
                monthId_dayNumber: {
                    monthId,
                    dayNumber
                }
            }
        });

        if (day) {
            return {
                success: true,
                data: {
                    ...day,
                    blocks: JSON.parse(day.blocks),
                    worksheets: JSON.parse((day as any).worksheets || "[]")
                }
            };
        }

        return { success: true, data: null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Save academic day with blocks
 */
export async function saveAcademicDayAction(
    monthId: string,
    dayNumber: number,
    title: string | null,
    theme: string | null,
    blocks: any[],
    worksheets: any[],
    notes: string | null
) {
    try {
        const day = await (prisma.academicDay as any).upsert({
            where: {
                monthId_dayNumber: {
                    monthId,
                    dayNumber
                }
            },
            create: {
                monthId,
                dayNumber,
                title,
                theme,
                blocks: JSON.stringify(blocks),
                worksheets: JSON.stringify(worksheets),
                notes,
                isCompleted: blocks.length > 0 || worksheets.length > 0
            },
            update: {
                title,
                theme,
                blocks: JSON.stringify(blocks),
                worksheets: JSON.stringify(worksheets),
                notes,
                isCompleted: blocks.length > 0 || worksheets.length > 0,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/curriculum');
        return { success: true, data: day };
    } catch (error: any) {
        console.error("saveAcademicDayAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Copy a day's content to another day
 */
export async function copyAcademicDayAction(fromDayId: string, toMonthId: string, toDayNumber: number) {
    try {
        const sourceDay = await prisma.academicDay.findUnique({
            where: { id: fromDayId }
        });

        if (!sourceDay) {
            return { success: false, error: "Source day not found" };
        }

        await prisma.academicDay.upsert({
            where: {
                monthId_dayNumber: {
                    monthId: toMonthId,
                    dayNumber: toDayNumber
                }
            },
            create: {
                monthId: toMonthId,
                dayNumber: toDayNumber,
                title: sourceDay.title,
                theme: sourceDay.theme,
                blocks: sourceDay.blocks,
                notes: `Copied from Day ${sourceDay.dayNumber}`,
                isCompleted: false
            },
            update: {
                title: sourceDay.title,
                theme: sourceDay.theme,
                blocks: sourceDay.blocks,
                notes: `Copied from Day ${sourceDay.dayNumber}`,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/curriculum');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Initialize 10 months with 20 days each for a curriculum
 */
export async function initializeAcademicStructureAction(curriculumId: string) {
    try {
        const curriculum = await prisma.curriculum.findUnique({
            where: { id: curriculumId },
            include: { academicMonths: true }
        });

        if (!curriculum) {
            return { success: false, error: "Curriculum not found" };
        }

        // Check if already initialized
        if (curriculum.academicMonths.length > 0) {
            return { success: true, message: "Already initialized" };
        }

        // Create 10 months
        const monthTitles = [
            "Month 1: Foundation & Introduction",
            "Month 2: Building Basics",
            "Month 3: Exploring Concepts",
            "Month 4: Developing Skills",
            "Month 5: Creative Expression",
            "Month 6: Social Learning",
            "Month 7: Advanced Concepts",
            "Month 8: Practical Application",
            "Month 9: Integration & Review",
            "Month 10: Mastery & Assessment"
        ];

        for (let monthNum = 1; monthNum <= 10; monthNum++) {
            const month = await prisma.academicMonth.create({
                data: {
                    curriculumId,
                    monthNumber: monthNum,
                    title: monthTitles[monthNum - 1],
                    description: `Academic month ${monthNum} for ${curriculum.name}`,
                    theme: `Month ${monthNum} Theme`
                }
            });

            // Create 20 days for each month
            const dayPromises = [];
            for (let dayNum = 1; dayNum <= 20; dayNum++) {
                dayPromises.push(
                    prisma.academicDay.create({
                        data: {
                            monthId: month.id,
                            dayNumber: dayNum,
                            title: `Day ${dayNum}`,
                            blocks: "[]"
                        }
                    })
                );
            }

            await Promise.all(dayPromises);
        }

        revalidatePath('/admin/curriculum');
        return { success: true, message: "Initialized 10 months with 20 days each" };
    } catch (error: any) {
        console.error("initializeAcademicStructureAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update month details
 */
export async function updateAcademicMonthAction(
    monthId: string,
    title: string,
    description: string | null,
    theme: string | null,
    objectives: string[]
) {
    try {
        const month = await prisma.academicMonth.update({
            where: { id: monthId },
            data: {
                title,
                description,
                theme,
                objectives: JSON.stringify(objectives),
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/curriculum');
        return { success: true, data: month };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================================================================
// LEGACY CURRICULUM ACTIONS (EXISTING)
// ============================================================================

export async function getCurriculumsAction() {
    try {
        // Fetch all curriculums using Prisma ORM
        let curriculums = await prisma.curriculum.findMany({
            orderBy: { name: 'asc' }
        });

        // If no curriculums exist, return empty array (user can add them)
        return { success: true, data: curriculums };
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

// ============================================================================
// CURRICULUM CRUD ACTIONS
// ============================================================================

export async function createCurriculumAction(name: string, color: string) {
    try {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const curriculum = await prisma.curriculum.create({
            data: {
                name,
                slug,
                color,
            }
        });

        // Initialize academic structure
        await initializeAcademicStructureAction(curriculum.id);

        revalidatePath('/admin/curriculum');
        return { success: true, data: curriculum };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCurriculumAction(id: string, name: string, color: string) {
    try {
        const curriculum = await prisma.curriculum.update({
            where: { id },
            data: {
                name,
                color,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/curriculum');
        return { success: true, data: curriculum };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCurriculumAction(id: string) {
    try {
        await prisma.curriculum.delete({
            where: { id }
        });

        revalidatePath('/admin/curriculum');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Upload a worksheet to Google Drive
 */
export async function uploadWorksheetAction(
    base64: string,
    name: string,
    type: string,
    pathParts: string[]
) {
    try {
        console.log(`[Upload] Starting upload: ${name} (${type}), Length: ${base64.length}`);

        // Convert base64 to Buffer
        const base64Data = base64.split(',')[1] || base64;
        const buffer = Buffer.from(base64Data, 'base64');

        console.log(`[Upload] Buffer created, size: ${buffer.length}`);

        const res = await uploadToGoogleDriveNested(
            buffer,
            name,
            type,
            pathParts
        );

        console.log(`[Upload] Result:`, res);
        return res;
    } catch (error: any) {
        console.error("uploadWorksheetAction Error:", error);
        return { success: false, error: error.message };
    }
}
