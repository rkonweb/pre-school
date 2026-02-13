"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from "date-fns";

/**
 * Generate payroll for a specific month
 */
export async function generatePayrollAction(schoolSlug: string, month: number, year: number) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "SchoolHasNoID" };

        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            include: { users: { where: { status: "ACTIVE" } } }
        });

        if (!school) throw new Error("School not found");

        const settings = await (prisma as any).payrollSettings.findUnique({
            where: { schoolId: school.id }
        });

        const startDate = startOfMonth(new Date(year, month - 1));
        const endDate = endOfMonth(new Date(year, month - 1));
        const daysInInterval = eachDayOfInterval({ start: startDate, end: endDate });

        // Count workable days (exclude Sundays for a simple 6-day week assumption, or handle properly)
        const workableDays = daysInInterval.filter(date => !isWeekend(date) || date.getDay() === 6).length; // Excluding Sundays (0), keeping Saturdays (6)
        const totalDaysInMonth = daysInInterval.length;

        // 1. Create or Get Payroll Record
        const payroll = await (prisma as any).payroll.upsert({
            where: { schoolId_month_year: { schoolId: school.id, month, year } },
            update: { status: "DRAFT" },
            create: { schoolId: school.id, month, year, status: "DRAFT" }
        });

        const staffList = school.users.filter(u => u.role !== "SUPER_ADMIN" && u.role !== "PARENT");
        let totalProcessedAmount = 0;

        // 2. Process each staff
        for (const staff of staffList) {
            // Get Latest Salary Revision
            const salary = await prisma.salaryRevision.findFirst({
                where: { userId: staff.id, effectiveDate: { lte: endDate } },
                orderBy: { effectiveDate: "desc" }
            });

            if (!salary) continue;

            // Get Attendance
            const attendance = await prisma.staffAttendance.findMany({
                where: {
                    userId: staff.id,
                    date: { gte: startDate, lte: endDate }
                }
            });

            const presentDaysCount = attendance.filter(a => a.status === "PRESENT").length;
            const halfDaysCount = attendance.filter(a => a.status === "HALF_DAY").length;
            const effectiveWorkedDays = presentDaysCount + (halfDaysCount * 0.5);

            const absentDays = Math.max(0, workableDays - effectiveWorkedDays);

            // Calculation Constants
            const baseAdds = (salary as any).customAdditions ? JSON.parse((salary as any).customAdditions) : [];
            const baseDeds = (salary as any).customDeductions ? JSON.parse((salary as any).customDeductions) : [];
            const totalFixedDeductions = (salary.tax || 0) + (salary.pf || 0) + (salary.insurance || 0);

            // --- AUTOMATED LOGIC FROM SETTINGS ---
            let autoAdds = [...baseAdds];
            let autoDeds = [...baseDeds];

            if (settings) {
                // 1. Full Attendance Bonus
                if (absentDays === 0 && settings.fullAttendanceBonus > 0) {
                    autoAdds.push({ label: "Full Attendance Incentive", amount: settings.fullAttendanceBonus });
                }

                // 2. Late Punctuality Logic
                const lateDaysCount = attendance.filter(a => a.status === "LATE").length;
                if (lateDaysCount === 0 && settings.punctualityBonus > 0) {
                    autoAdds.push({ label: "Perfect Punctuality Bonus", amount: settings.punctualityBonus });
                } else if (lateDaysCount > settings.lateThreshold && settings.latePenalty > 0) {
                    const penaltyAmount = (lateDaysCount - settings.lateThreshold) * settings.latePenalty;
                    autoDeds.push({ label: `Excessive Late Penalty (${lateDaysCount} days)`, amount: penaltyAmount });
                }
            }

            const finalAddsAmount = autoAdds.reduce((acc: number, item: any) => acc + (item.amount || 0), 0);
            const finalDedsAmount = autoDeds.reduce((acc: number, item: any) => acc + (item.amount || 0), 0);

            const gross = (salary.basic || 0) + (salary.hra || 0) + (salary.allowance || 0) + finalAddsAmount;
            const leaveDeduction = (gross / totalDaysInMonth) * absentDays;

            const netSalary = gross - (totalFixedDeductions + finalDedsAmount) - leaveDeduction;

            // Update local copies for storage
            const customAdditions = JSON.stringify(autoAdds);
            const customDeductions = JSON.stringify(autoDeds);

            // 3. Create Payslip
            await (prisma as any).payslip.upsert({
                where: { userId_month_year: { userId: staff.id, month, year } },
                update: {
                    payrollId: payroll.id,
                    basic: salary.basic,
                    hra: salary.hra,
                    allowances: salary.allowance,
                    tax: salary.tax,
                    pf: salary.pf,
                    insurance: salary.insurance,
                    leaveDeduction,
                    customAdditions,
                    customDeductions,
                    grossSalary: gross,
                    netSalary: Math.max(0, netSalary),
                    totalDays: totalDaysInMonth,
                    presentDays: effectiveWorkedDays,
                    absentDays,
                    leaveDays: 0,
                    status: "UNPAID"
                },
                create: {
                    userId: staff.id,
                    payrollId: payroll.id,
                    month,
                    year,
                    basic: salary.basic,
                    hra: salary.hra,
                    allowances: salary.allowance,
                    tax: salary.tax,
                    pf: salary.pf,
                    insurance: salary.insurance,
                    leaveDeduction,
                    customAdditions,
                    customDeductions,
                    grossSalary: gross,
                    netSalary: Math.max(0, netSalary),
                    totalDays: totalDaysInMonth,
                    presentDays: effectiveWorkedDays,
                    absentDays,
                    leaveDays: 0,
                    status: "UNPAID"
                }
            });

            totalProcessedAmount += Math.max(0, netSalary);
        }

        // 4. Update Payroll Total
        await (prisma as any).payroll.update({
            where: { id: payroll.id },
            data: {
                totalAmount: totalProcessedAmount,
                status: "PROCESSED",
                processedAt: new Date()
            }
        });

        revalidatePath(`/s/${schoolSlug}/staff/payroll`);
        return { success: true, data: payroll };
    } catch (error: any) {
        console.error("Payroll Generation Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getPayrollsAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "SchoolHasNoID" };

        const payrolls = await (prisma as any).payroll.findMany({
            where: { schoolId: schoolId },
            orderBy: [{ year: "desc" }, { month: "desc" }],
            include: { payslips: true }
        });

        return { success: true, data: payrolls };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPayslipsAction(payrollId: string) {
    try {
        const payslips = await (prisma as any).payslip.findMany({
            where: { payrollId },
            include: { user: true }
        });
        return { success: true, data: payslips };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markAsPaidAction(payrollId: string, schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };
        await (prisma as any).payroll.update({
            where: { id: payrollId },
            data: { status: "PAID" }
        });

        await (prisma as any).payslip.updateMany({
            where: { payrollId },
            data: { status: "PAID", paidAt: new Date() }
        });

        revalidatePath(`/s/${schoolSlug}/staff/payroll`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSchoolDetailsAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug },
            select: {
                name: true,
                logo: true,
                address: true,
                email: true,
                phone: true,
                brandColor: true
            }
        });
        return { success: true, data: school };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
