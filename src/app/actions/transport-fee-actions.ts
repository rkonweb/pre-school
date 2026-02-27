
'use server';

import { prisma } from "@/lib/prisma";
import { validateUserSchoolAction } from "./session-actions";
import { revalidatePath } from "next/cache";

export async function getTransportFeesAction(slug: string, period?: { month: number, year: number }) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const whereClause: any = {
            student: { schoolId: auth.user.schoolId },
            category: "TRANSPORT",
        };

        if (period) {
            const startDate = new Date(period.year, period.month - 1, 1);
            const endDate = new Date(period.year, period.month, 0, 23, 59, 59);
            whereClause.dueDate = {
                gte: startDate,
                lte: endDate
            };
        }

        const fees = await prisma.fee.findMany({
            where: whereClause,
            include: {
                student: { select: { firstName: true, lastName: true, grade: true } },
                payments: true
            },
            orderBy: { dueDate: 'desc' }
        });

        return { success: true, data: fees };
    } catch (error: any) {
        console.error("Error fetching transport fees:", error);
        return { success: false, error: error.message };
    }
}

export async function generateTransportInvoicesAction(
    slug: string,
    type: 'MONTHLY' | 'TERM' | 'YEARLY',
    month: number,
    year: number,
    filters?: { classroomId?: string; studentId?: string; termId?: string; monthCount?: number }
) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        // 1. Build where clause based on filters
        const whereClause: any = {
            student: {
                schoolId,
                ...(filters?.classroomId && { classroomId: filters.classroomId }),
                ...(filters?.studentId && { id: filters.studentId }),
            },
            status: "APPROVED",
            transportFee: { gt: 0 } // Only those with a fee set
        };

        // 2. Get active transport students
        const activeProfiles = await prisma.studentTransportProfile.findMany({
            where: whereClause,
            include: {
                student: {
                    include: { classroom: true }
                },
                dropStop: true
            }
        });

        if (activeProfiles.length === 0) {
            return { success: false, error: "No active transport students found to bill." };
        }

        let generatedCount = 0;
        let skippedCount = 0;

        // Define billing period dates
        const startDate = new Date(year, month - 1, 1);
        let endDate: Date;
        let monthCount = 1;

        if (type === 'MONTHLY') {
            endDate = new Date(year, month, 0);
            monthCount = 1;
        } else if (type === 'TERM') {
            monthCount = filters?.monthCount || 3; // Default to 3 if not specified
            endDate = new Date(year, month + (monthCount - 1), 0);
        } else {
            endDate = new Date(year + 1, month - 1, 0);
            monthCount = 10; // Assuming 10 months for annual
        }

        const dueDate = new Date(year, month - 1, 5); // Due by 5th of the month

        for (const profile of activeProfiles) {
            // Check for duplicates
            // We prevent double billing if a TRANSPORT fee exists for this student in this month/year range
            // This is a simple heuristic. A more robust one might use a "billingCycleId".
            const duplicate = await prisma.fee.findFirst({
                where: {
                    studentId: profile.studentId,
                    category: "TRANSPORT",
                    dueDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    amount: type === 'MONTHLY' ? profile.transportFee : (profile.transportFee * monthCount) // Updated check
                }
            });

            if (duplicate) {
                // duplicate found, skip
                continue;
            }

            const amount = profile.transportFee * monthCount;

            let title = "";
            const monthName = startDate.toLocaleString('default', { month: 'long' });

            if (type === 'MONTHLY') title = `Transport Fee - ${monthName} ${year}`;
            else if (type === 'TERM') title = `Transport Fee (${filters?.termId || 'Term'}) - ${year}`;
            else title = `Annual Transport Fee - ${year}-${year + 1}`;

            // Create Fee
            await prisma.fee.create({
                data: {
                    title: title,
                    amount: amount,
                    dueDate: dueDate,
                    status: "PENDING",
                    studentId: profile.studentId,
                    description: `Transport Service: ${profile.dropStop?.name || 'Assigned Stop'}`,
                    category: "TRANSPORT"
                }
            });
            generatedCount++;
        }

        revalidatePath(`/s/${slug}/transport/fees`);
        return { success: true, count: generatedCount };
    } catch (error: any) {
        console.error("Error generating invoices:", error);
        return { success: false, error: error.message };
    }
}

export async function sendTransportFeeRemindersAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

        const threeDaysFromNowStart = new Date(startOfToday.getTime() + 3 * 24 * 60 * 60 * 1000);
        const threeDaysFromNowEnd = new Date(endOfToday.getTime() + 3 * 24 * 60 * 60 * 1000);

        // Find all pending transport fees
        const pendingFees = await prisma.fee.findMany({
            where: {
                student: { schoolId: auth.user.schoolId },
                category: "TRANSPORT",
                status: "PENDING"
            },
            include: { student: true }
        });

        let sentCount = 0;

        for (const fee of pendingFees) {
            const dueDate = new Date(fee.dueDate);
            const isDueToday = dueDate >= startOfToday && dueDate <= endOfToday;
            const isDueIn3Days = dueDate >= threeDaysFromNowStart && dueDate <= threeDaysFromNowEnd;
            const isOverdue = dueDate < startOfToday;

            let title = "";
            let message = "";

            if (isDueToday) {
                title = "Transport Fee Due Today";
                message = `Reminder: The transport fee of ${fee.amount} for ${(fee as any).student.firstName} is due today. Please pay to avoid late charges.`;
            } else if (isDueIn3Days) {
                title = "Upcoming Transport Fee";
                message = `Reminder: The transport fee of ${fee.amount} for ${(fee as any).student.firstName} is due in 3 days.`;
            } else if (isOverdue) {
                // To avoid spam, we might only want to send overdue reminders weekly. For this implementation, we assume a cron job manages frequency.
                title = "Overdue Transport Fee";
                message = `Alert: The transport fee of ${fee.amount} for ${(fee as any).student.firstName} is overdue. Please settle immediately.`;
            }

            if (title) {
                await prisma.notification.create({
                    data: {
                        userId: fee.studentId,
                        userType: "STUDENT",
                        title,
                        message,
                        type: "FEE_REMINDER",
                        relatedId: fee.id,
                        relatedType: "Fee",
                        isRead: false
                    }
                });
                sentCount++;
            }
        }

        return { success: true, count: sentCount };
    } catch (e: any) {
        console.error("Reminder Generation Error:", e);
        return { success: false, error: e.message };
    }
}
