import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";

export async function GET(req: Request) {
    try {
        const authResult = await getMobileAuth(req);
        if (!authResult) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const studentId = url.searchParams.get('studentId');

        if (!studentId) {
             return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        const fees = await prisma.fee.findMany({
            where: { studentId },
            orderBy: { dueDate: 'asc' },
            include: {
                payments: {
                    orderBy: { date: 'desc' }
                }
            }
        });

        let totalDue = 0;
        let totalPaid = 0;
        let overdueCount = 0;
        const now = new Date();
        const categoryTotals: Record<string, { total: number; paid: number; due: number }> = {};

        const allFees = fees.map(f => {
            const paid = f.payments.reduce((acc, p) => acc + p.amount, 0);
            const due = Math.max(0, f.amount - paid);
            const isOverdue = due > 0 && new Date(f.dueDate) < now;

            totalDue += due;
            totalPaid += paid;
            if (isOverdue) overdueCount++;

            // Category breakdown
            const cat = f.category || 'GENERAL';
            if (!categoryTotals[cat]) {
                categoryTotals[cat] = { total: 0, paid: 0, due: 0 };
            }
            categoryTotals[cat].total += f.amount;
            categoryTotals[cat].paid += paid;
            categoryTotals[cat].due += due;

            return {
                id: f.id,
                title: f.title,
                description: f.description,
                category: cat,
                amount: f.amount,
                paid,
                due,
                dueDate: f.dueDate.toISOString(),
                status: isOverdue ? 'OVERDUE' : (due === 0 ? 'PAID' : f.status),
                isOverdue,
                payments: f.payments.map(p => ({
                    id: p.id,
                    amount: p.amount,
                    date: p.date.toISOString(),
                    method: p.method,
                    reference: p.reference,
                })),
            };
        });

        // Separate views
        const pendingFees = allFees.filter(f => f.due > 0);
        const paidFees = allFees.filter(f => f.due === 0);

        // Flatten all payments for payment history
        const allPayments = allFees.flatMap(f =>
            f.payments.map(p => ({
                ...p,
                feeTitle: f.title,
                feeCategory: f.category,
            }))
        );
        allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Category breakdown as array
        const categoryBreakdown = Object.entries(categoryTotals).map(([category, vals]) => ({
            category,
            total: vals.total,
            paid: vals.paid,
            due: vals.due,
            pctPaid: vals.total > 0 ? Math.round((vals.paid / vals.total) * 100) : 0,
        }));

        // Next due date
        const upcomingDue = pendingFees
            .filter(f => !f.isOverdue)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalFees: totalDue + totalPaid,
                    totalDue,
                    totalPaid,
                    overdueCount,
                    pendingCount: pendingFees.length,
                    paidCount: paidFees.length,
                    nextDueDate: upcomingDue.length > 0 ? upcomingDue[0].dueDate : null,
                    pctPaid: (totalDue + totalPaid) > 0 ? Math.round((totalPaid / (totalDue + totalPaid)) * 100) : 0,
                },
                categoryBreakdown,
                pendingFees,
                paidFees,
                paymentHistory: allPayments,
            }
        });

    } catch (error) {
        console.error("Parent Fees Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
