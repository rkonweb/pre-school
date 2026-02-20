"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { eachMonthOfInterval, format } from "date-fns";

import { validateUserSchoolAction } from "./session-actions";
import { verifyClassAccess } from "@/lib/access-control";

import { validateBranchAccess } from "@/lib/branch-utils";

export async function createFeeAction(slug: string, studentId: string, title: string, amount: number, dueDate: Date, description?: string, academicYearId?: string) {
    try {
        // PERMISSION CHECK
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classroomId: true, branchId: true }
        });

        if (!student) return { success: false, error: "Student not found" };

        // Branch Access Check
        if (!(await validateBranchAccess(currentUser, student.branchId))) {
            return { success: false, error: "Access denied to this student's branch." };
        }

        if (student.classroomId) {
            const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, student.classroomId);
            if (!hasAccess) return { success: false, error: "Permission denied for this student's class." };
        } else if (currentUser.role === 'STAFF') {
            return { success: false, error: "Student has no class assigned." };
        }

        const fee = await prisma.fee.create({
            data: {
                studentId,
                title,
                amount,
                dueDate: new Date(dueDate),
                status: "PENDING",
                description,
                academicYearId,
                branchId: student.branchId
            }
        });
        return { success: true, data: fee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentFeesAction(slug: string, studentId: string, academicYearId?: string) {
    try {
        // PERMISSION CHECK
        const auth = await validateUserSchoolAction(slug);
        if (auth.success && auth.user) {
            const currentUser = auth.user;
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                select: { classroomId: true, branchId: true } // Fetch branchId too
            });

            if (student) {
                // Branch Access Check for viewing fees? Usually less strict, but good practice
                if (!(await validateBranchAccess(currentUser, student.branchId))) {
                    return { success: false, error: "Access denied." };
                }

                if (student.classroomId) {
                    const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, student.classroomId);
                    if (!hasAccess) return { success: true, data: [] }; // Hide
                }
            }
        }

        const query: any = { studentId };
        if (academicYearId) {
            query.academicYearId = academicYearId;
        }

        const fees = await prisma.fee.findMany({
            where: query,
            include: {
                payments: true,
                academicYear: true
            },
            orderBy: { dueDate: 'asc' }
        });
        return { success: true, data: fees };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function recordPaymentAction(slug: string, feeId: string, amount: number, method: string, reference?: string, paymentDate?: Date) {
    try {
        // PERMISSION CHECK
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const currentUser = auth.user;

        // Trace fee -> student -> classroom
        const feeRecord = await prisma.fee.findUnique({
            where: { id: feeId },
            include: { student: { select: { classroomId: true, branchId: true } } }
        });

        if (!feeRecord) return { success: false, error: "Fee not found" };

        if (!(await validateBranchAccess(currentUser, feeRecord.branchId || feeRecord.student.branchId))) {
            return { success: false, error: "Access denied to this branch." };
        }

        if (feeRecord.student?.classroomId) {
            const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, feeRecord.student.classroomId);
            if (!hasAccess) return { success: false, error: "Permission denied." };
        }

        // 1. Record payment
        const payment = await prisma.feePayment.create({
            data: {
                feeId,
                amount,
                method,
                reference,
                date: paymentDate ? new Date(paymentDate) : new Date() // Use provided date or now
            }
        });

        // 2. Update fee status
        const fee = await prisma.fee.findUnique({
            where: { id: feeId },
            include: { payments: true }
        });

        if (fee) {
            const totalPaid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
            let newStatus = fee.status;
            if (totalPaid >= fee.amount) {
                newStatus = "PAID";
            } else if (totalPaid > 0) {
                newStatus = "PARTIAL";
            }

            if (newStatus !== fee.status) {
                await prisma.fee.update({
                    where: { id: feeId },
                    data: { status: newStatus }
                });
            }
        }

        return { success: true, data: payment };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function syncStudentFeesAction(studentId: string, schoolSlug: string, forceReset = false) {
    const startTime = Date.now();
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };
        const currentUser = auth.user;

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { school: true, classroom: true }
        }) as any;

        if (!student) return { success: false, error: "Student not found" };

        if (currentUser && !(await validateBranchAccess(currentUser, student.branchId))) {
            return { success: false, error: "Access denied to this branch." };
        }

        // Handle out-of-sync prisma client
        if (student.promotedToClassroomId === undefined) {
            const raw: any[] = await prisma.$queryRawUnsafe(
                `SELECT promotedToClassroomId, promotedToGrade FROM Student WHERE id = ?`,
                studentId
            );
            if (raw && raw.length > 0) {
                student.promotedToClassroomId = raw[0].promotedToClassroomId;
                student.promotedToGrade = raw[0].promotedToGrade;
            }
        }

        if (forceReset) {
            await prisma.fee.deleteMany({
                where: {
                    studentId,
                    status: "PENDING",
                    payments: { none: {} }
                }
            });
        }

        if (!student.classroomId) return { success: true, message: "No class assigned, skipping fee sync." };

        const academicYears = await prisma.academicYear.findMany({
            where: { schoolId: student.schoolId },
            orderBy: { startDate: 'desc' }
        });

        const currentYear = academicYears.find(y => y.isCurrent);
        const nextYear = currentYear
            ? academicYears.find(y => new Date(y.startDate) > new Date(currentYear.startDate))
            : null;

        const syncYears = [currentYear, nextYear].filter(Boolean);
        const feesToCreate: any[] = [];
        const summaries = [];

        for (const year of syncYears) {
            if (!year) continue;

            const isCurrentYear = year.isCurrent;
            const targetClassroomId = isCurrentYear
                ? student.classroomId
                : ((student as any).promotedToClassroomId || student.classroomId);

            if (!targetClassroomId) continue;

            const structures = await prisma.feeStructure.findMany({
                where: {
                    schoolId: student.schoolId,
                    academicYear: year.name,
                },
                include: { components: true }
            });

            const matchingStructures = structures.filter(s => {
                try {
                    const classIds = JSON.parse(s.classIds || "[]");
                    return Array.isArray(classIds) && classIds.includes(targetClassroomId);
                } catch (e) { return false; }
            });

            if (matchingStructures.length === 0) continue;

            const existingFees = await prisma.fee.findMany({
                where: { studentId, academicYearId: year.id },
                select: { title: true }
            });
            const existingTitles = new Set(existingFees.map(f => f.title.trim().toLowerCase()));

            for (const structure of matchingStructures) {
                for (const component of structure.components) {
                    if (component.frequency === 'TERM') {
                        const componentConfig = component.config ? JSON.parse(component.config) : { terms: [] };
                        const terms = componentConfig.terms || [];

                        for (const term of terms) {
                            const termName = term.name || `Term ${terms.indexOf(term) + 1}`;
                            const title = `${component.name} - ${termName}`;

                            if (!existingTitles.has(title.trim().toLowerCase())) {
                                feesToCreate.push({
                                    studentId,
                                    academicYearId: year.id,
                                    title,
                                    amount: parseFloat(term.amount),
                                    dueDate: term.dueDate ? new Date(term.dueDate) : new Date(),
                                    status: "PENDING",
                                    description: `Auto-generated from ${structure.name}`,
                                    branchId: student.branchId
                                });
                                existingTitles.add(title.trim().toLowerCase());
                            }
                        }
                    } else if (component.frequency === 'MONTHLY') {
                        const months = eachMonthOfInterval({
                            start: new Date(year.startDate),
                            end: new Date(year.endDate)
                        });

                        for (const monthDate of months) {
                            const monthName = format(monthDate, "MMMM yyyy");
                            const title = `${component.name} - ${monthName}`;
                            const dueDate = new Date(monthDate);
                            dueDate.setDate(10);

                            if (!existingTitles.has(title.trim().toLowerCase())) {
                                feesToCreate.push({
                                    studentId,
                                    academicYearId: year.id,
                                    title,
                                    amount: component.amount,
                                    dueDate,
                                    status: "PENDING",
                                    description: `Monthly fee from ${structure.name}`,
                                    branchId: student.branchId
                                });
                                existingTitles.add(title.trim().toLowerCase());
                            }
                        }
                    } else {
                        const title = component.name;
                        if (!existingTitles.has(title.trim().toLowerCase())) {
                            feesToCreate.push({
                                studentId,
                                academicYearId: year.id,
                                title,
                                amount: component.amount,
                                dueDate: component.dueDate ? new Date(component.dueDate) : new Date(),
                                status: "PENDING",
                                description: `Auto-generated from ${structure.name}`,
                                branchId: student.branchId
                            });
                            existingTitles.add(title.trim().toLowerCase());
                        }
                    }
                }
            }
            summaries.push(year.name);
        }

        if (feesToCreate.length > 0) {
            // Batch creation using transaction for performance
            await prisma.$transaction(
                feesToCreate.map(data => prisma.fee.create({ data }))
            );
        }

        const duration = Date.now() - startTime;
        console.log(`[FeeSync] Completed in ${duration}ms for student ${studentId}. Created ${feesToCreate.length} fees.`);

        revalidatePath(`/s/${schoolSlug}/students/${studentId}`);
        return { success: true, message: `Synced ${feesToCreate.length} fees for: ${summaries.join(", ")}` };

    } catch (error: any) {
        console.error("Sync Fee Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getFeeStructuresAction(schoolSlug: string) {
    try {
        const structures = await prisma.feeStructure.findMany({
            where: {
                school: { slug: schoolSlug }
            },
            include: {
                components: true
            }
        });
        return { success: true, data: structures };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateFeeAction(slug: string, id: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        // Fetch fee to check branch
        const feeRecord = await prisma.fee.findUnique({
            where: { id },
            select: { branchId: true }
        });

        if (!feeRecord) return { success: false, error: "Fee not found" };

        if (!(await validateBranchAccess(auth.user, feeRecord.branchId))) {
            return { success: false, error: "Access denied to this branch." };
        }

        // Due Date is NOT updated here to ensure immutability after creation
        const fee = await prisma.fee.update({
            where: { id },
            data: {
                title: data.title,
                amount: data.amount,
                description: data.description
            }
        });
        return { success: true, data: fee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFeeAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        // Fetch fee to check branch
        const feeRecord = await prisma.fee.findUnique({
            where: { id },
            select: { branchId: true }
        });

        if (!feeRecord) return { success: false, error: "Fee not found" };

        if (!(await validateBranchAccess(auth.user, feeRecord.branchId))) {
            return { success: false, error: "Access denied to this branch." };
        }

        // Delete payments first
        await prisma.feePayment.deleteMany({
            where: { feeId: id }
        });
        await prisma.fee.delete({
            where: { id }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
