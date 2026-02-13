"use server";

import { prisma } from "@/lib/prisma";
import { validateUserSchoolAction } from "./session-actions";

interface DashboardOptions {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
        status?: string;
        startDate?: string;
        endDate?: string;
        academicYearId?: string;
    };
    sort?: {
        field: string;
        direction: "asc" | "desc";
    };
}

export async function getBillingDashboardAction(slug: string, options: DashboardOptions = {}) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const { page = 1, limit = 10, search = "", filters = {}, sort } = options;
        const skip = (page - 1) * limit;

        // 1. Get School Info (Currency)
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true, currency: true }
        });

        if (!school) {
            return { success: false, error: "School not found" };
        }

        // 2. Stats Calculation (Global KPIs - unaffected by table filters)
        // Optimization: Use separate aggregation query instead of fetching all records?
        // SQLite doesn't strictly optimize aggregate over JSON/Relation easily, but let's stick to current logic for accuracy on 'Paid' calculation.
        // Actually, prisma.fee.aggregate can be faster.
        // Total Billed = Sum(amount)
        // Collected = Sum(FeePayment.amount)
        // Pending = Total Billed - Collected (Roughly, but partials matter).
        // Let's keep the JS loop for logic correctness on "Pending" (Fee - Payments).

        const statsFees = await prisma.fee.findMany({
            where: {
                student: { schoolId: school.id },
                academicYearId: filters.academicYearId || undefined
            },
            select: {
                amount: true,
                dueDate: true,
                status: true,
                payments: { select: { amount: true } }
            }
        });

        let totalBilled = 0;
        let collected = 0;
        let pending = 0;
        let overdue = 0;
        const now = new Date();

        statsFees.forEach(fee => {
            totalBilled += fee.amount;
            const paid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
            collected += paid;

            // Calculate pending based on remaining amount logic
            // (Don't rely just on status, calculate actual $)
            const remaining = fee.amount - paid;
            if (remaining > 0) {
                pending += remaining;
                if (new Date(fee.dueDate) < now) {
                    overdue += remaining;
                }
            }
        });


        // 3. Paginated Invoices with Search & Filters
        const whereClause: any = {
            student: { schoolId: school.id }
        };

        if (filters.academicYearId) {
            whereClause.academicYearId = filters.academicYearId;
        }

        // Search
        if (search) {
            whereClause.OR = [
                { title: { contains: search } },
                { student: { firstName: { contains: search } } },
                { student: { lastName: { contains: search } } },
                // Allow searching by ID if needed, e.g. last 8 chars
                { id: { contains: search } }
            ];
        }

        // Filters
        if (filters.status && filters.status !== "ALL") {
            whereClause.status = filters.status;
        }

        if (filters.startDate || filters.endDate) {
            whereClause.dueDate = {};
            if (filters.startDate) whereClause.dueDate.gte = new Date(filters.startDate);
            if (filters.endDate) whereClause.dueDate.lte = new Date(filters.endDate);
        }

        // Sorting
        let orderBy: any = { dueDate: 'desc' }; // Default
        if (sort && sort.field) {
            if (sort.field === 'studentName') {
                orderBy = { student: { firstName: sort.direction } };
            } else if (['amount', 'dueDate', 'status', 'title'].includes(sort.field)) {
                orderBy = { [sort.field]: sort.direction };
            }
        }

        const [fees, totalCount] = await prisma.$transaction([
            prisma.fee.findMany({
                where: whereClause,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            grade: true
                        }
                    },
                    payments: true
                },
                orderBy: orderBy,
                take: limit,
                skip: skip
            }),
            prisma.fee.count({ where: whereClause })
        ]);

        // 4. Return Data
        return {
            success: true,
            currency: school.currency || "USD",
            stats: {
                totalBilled,
                collected,
                pending,
                overdue
            },
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            },
            invoices: fees.map(f => {
                const paidAmount = f.payments.reduce((s, p) => s + p.amount, 0);
                return {
                    id: f.id,
                    studentName: `${f.student.firstName} ${f.student.lastName}`,
                    studentId: f.student.id,
                    studentAvatar: f.student.avatar,
                    grade: f.student.grade,
                    title: f.title,
                    amount: f.amount,
                    paid: paidAmount,
                    status: f.status,
                    dueDate: f.dueDate,
                    createdAt: f.createdAt
                };
            })
        };
    } catch (error: any) {
        console.error("Billing Dashboard Error:", error);
        return { success: false, error: error.message };
    }
}
