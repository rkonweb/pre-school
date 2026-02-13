"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserAction } from "./session-actions";
import { verifyClassAccess } from "@/lib/access-control";
import { syncStudentFeesAction } from "./fee-actions";

interface PromotionData {
    schoolSlug: string;
    studentIds: string[];
    targetClassroomId: string;
    targetAcademicYearId: string;
    feeStructureId?: string;
}

export async function promoteStudentsAction(data: PromotionData) {
    try {
        // 1. Auth Check
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) return { success: false, error: "Unauthorized" };
        const currentUser = userRes.data;

        // Verify admin or principal role (Customize as needed)
        if (!["ADMIN", "PRINCIPAL", "VICE_PRINCIPAL"].includes(currentUser.role)) {
            return { success: false, error: "Insufficient permissions for promotion." };
        }

        const { schoolSlug, studentIds, targetClassroomId, targetAcademicYearId, feeStructureId } = data;
        console.log("Promote Action Triggered:", { schoolSlug, studentIdsCount: studentIds.length, targetClassroomId, targetAcademicYearId });

        // 2. Validate Target Data
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) return { success: false, error: "School not found" };

        const targetClass = await prisma.classroom.findUnique({ where: { id: targetClassroomId } });
        if (!targetClass) return { success: false, error: "Target class not found" };

        // 3. Handle Dynamic Academic Year Creation
        let finalAcademicYearId = targetAcademicYearId;
        if (targetAcademicYearId.startsWith("NEW:")) {
            const yearName = targetAcademicYearId.replace("NEW:", "");
            // Assumption: Format "YYYY-YYYY" (e.g. 2026-2027)
            // Defaulting start to April 1st and end to March 31st
            try {
                const parts = yearName.split("-");
                if (parts.length === 2) {
                    const startYear = parseInt(parts[0]);
                    const endYear = parseInt(parts[1]);

                    const startDate = new Date(startYear, 3, 1); // April 1st (Month is 0-indexed)
                    const endDate = new Date(endYear, 2, 31);   // March 31st

                    // Check existence
                    const existing = await prisma.academicYear.findFirst({
                        where: { name: yearName, schoolId: school.id }
                    });

                    if (existing) {
                        finalAcademicYearId = existing.id;
                    } else {
                        const newYear = await prisma.academicYear.create({
                            data: {
                                name: yearName,
                                startDate: startDate,
                                endDate: endDate,
                                schoolId: school.id,
                                isCurrent: false
                            }
                        });
                        finalAcademicYearId = newYear.id;
                    }
                }
            } catch (e) {
                console.error("Failed to create new academic year:", e);
                return { success: false, error: "Invalid new academic year format." };
            }
        }

        // 4. Promote Students (Update Classroom)
        await prisma.$transaction(async (tx) => {
            console.log("Starting transaction...");
            // A. Update Students
            console.log(`Promoting student IDs: ${studentIds.join(", ")}`);
            // Extract grade name (e.g. "UKG" from "UKG - A")
            const gradePart = targetClass.name.split(" - ")[0];

            await (tx as any).student.updateMany({
                where: {
                    id: { in: studentIds },
                    schoolId: school.id
                },
                data: {
                    promotedToClassroomId: targetClassroomId,
                    promotedToGrade: gradePart
                }
            });

            console.log(`Updated classroom for ${studentIds.length} students.`);
        });

        // 5. Sync Fees (Now that classroom is updated)
        console.log("Syncing fees for promoted students...");
        for (const studentId of studentIds) {
            await syncStudentFeesAction(studentId, schoolSlug);
        }

        revalidatePath(`/s/${schoolSlug}/students`);
        return { success: true, message: `Successfully promoted ${studentIds.length} students.` };

    } catch (error: any) {
        console.error("Promotion Error Stack:", error.stack);
        console.error("Promotion Error Message:", error.message);
        return { success: false, error: error.message || "An error occurred during promotion. Please try again." };
    }
}

