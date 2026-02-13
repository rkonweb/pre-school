"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAcademicYearsAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug }
        });
        if (!school) return { success: false, error: "School not found" };

        let years: any[];
        try {
            years = await (prisma as any).academicYear.findMany({
                where: { schoolId: school.id },
                orderBy: { startDate: 'desc' }
            });
        } catch (e) {
            // Fallback to raw query if prisma client is out of sync
            years = await prisma.$queryRawUnsafe(
                `SELECT * FROM AcademicYear WHERE schoolId = ? ORDER BY startDate DESC`,
                school.id
            );
            // Map 1/0 to true/false for SQLite boolean fields
            years = years.map(y => ({
                ...y,
                isCurrent: y.isCurrent === 1 || y.isCurrent === true,
                startDate: new Date(y.startDate),
                endDate: new Date(y.endDate)
            }));
        }

        return { success: true, data: years };
    } catch (error: any) {
        console.error("getAcademicYearsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createAcademicYearAction(slug: string, data: { name: string, startDate: Date, endDate: Date, isCurrent: boolean }) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug }
        });
        if (!school) return { success: false, error: "School not found" };

        // If this is set as current, unset others
        if (data.isCurrent) {
            await (prisma as any).academicYear.updateMany({
                where: { schoolId: school.id },
                data: { isCurrent: false }
            });
        }

        const year = await (prisma as any).academicYear.create({
            data: {
                ...data,
                schoolId: school.id,
                status: "ACTIVE"
            }
        });

        revalidatePath(`/s/${slug}/settings`);
        return { success: true, data: year };
    } catch (error: any) {
        console.error("createAcademicYearAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateAcademicYearAction(slug: string, id: string, data: any) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug }
        });
        if (!school) return { success: false, error: "School not found" };

        if (data.isCurrent) {
            await (prisma as any).academicYear.updateMany({
                where: { schoolId: school.id, id: { not: id } },
                data: { isCurrent: false }
            });
        }

        const year = await (prisma as any).academicYear.update({
            where: { id },
            data
        });

        // SHIFT STUDENTS if this year is now current
        if (data.isCurrent) {
            console.log(`Academic year ${year.name} marked as current. Shifting students...`);

            // 1. Find all students in this school who have a future promotion target
            const promotedStudents = await (prisma as any).student.findMany({
                where: {
                    schoolId: school.id,
                    promotedToClassroomId: { not: null }
                }
            });

            console.log(`Found ${promotedStudents.length} students to shift.`);

            // 2. Perform shifting in batches or transaction
            if (promotedStudents.length > 0) {
                await prisma.$transaction(
                    promotedStudents.map((s: any) =>
                        (prisma as any).student.update({
                            where: { id: s.id },
                            data: {
                                classroomId: s.promotedToClassroomId,
                                grade: s.promotedToGrade,
                                promotedToClassroomId: null,
                                promotedToGrade: null
                            }
                        })
                    )
                );
                console.log(`Successfully shifted ${promotedStudents.length} students.`);
            }
        }

        revalidatePath(`/s/${slug}/students`);
        revalidatePath(`/s/${slug}/settings`);
        return { success: true, data: year };
    } catch (error: any) {
        console.error("updateAcademicYearAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getCurrentAcademicYearAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug }
        });
        if (!school) return { success: false, error: "School not found" };

        let year: any;
        try {
            year = await (prisma as any).academicYear.findFirst({
                where: { schoolId: school.id, isCurrent: true }
            });
        } catch (e) {
            const years = await prisma.$queryRawUnsafe(
                `SELECT * FROM AcademicYear WHERE schoolId = ? AND isCurrent = 1 LIMIT 1`,
                school.id
            ) as any[];
            year = years.length > 0 ? {
                ...years[0],
                isCurrent: true,
                startDate: new Date(years[0].startDate),
                endDate: new Date(years[0].endDate)
            } : null;
        }

        return { success: true, data: year };
    } catch (error: any) {
        console.error("getCurrentAcademicYearAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function ensureNextYearAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug } });
        if (!school) return;

        // 1. Get current academic year
        const currentYear = await prisma.academicYear.findFirst({
            where: { schoolId: school.id, isCurrent: true }
        });

        if (!currentYear) return;

        // 2. Calculate threshold (10 months before end)
        // End Date: March 31st, 2026 -> Threshold: May 31st, 2025
        const endDate = new Date(currentYear.endDate);
        const thresholdDate = new Date(endDate);
        thresholdDate.setMonth(thresholdDate.getMonth() - 10);

        const today = new Date();

        console.log(`[Auto-Create Check] Today: ${today.toISOString().split('T')[0]}, Threshold: ${thresholdDate.toISOString().split('T')[0]}`);

        // 3. Check if we need to create next year
        if (today >= thresholdDate) {
            // Calculate next year name
            // Assumption: "YYYY-YYYY" format
            const parts = currentYear.name.split("-");
            if (parts.length === 2) {
                const start = parseInt(parts[0]);
                const end = parseInt(parts[1]);
                const nextYearName = `${start + 1}-${end + 1}`;

                // Check if exists
                const existing = await prisma.academicYear.findFirst({
                    where: { schoolId: school.id, name: nextYearName }
                });

                if (!existing) {
                    console.log(`[Auto-Create] Creating next academic year: ${nextYearName} for ${slug}`);
                    await prisma.academicYear.create({
                        data: {
                            name: nextYearName,
                            startDate: new Date(start + 1, 3, 1), // April 1st
                            endDate: new Date(end + 1, 2, 31),   // March 31st
                            schoolId: school.id,
                            isCurrent: false,
                            status: "ACTIVE"
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error ensuring next academic year:", error);
    }
}
