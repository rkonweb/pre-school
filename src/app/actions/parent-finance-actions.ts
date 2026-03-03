import { prisma } from "@/lib/prisma";
import { getFamilyStudentsAction } from "./parent-actions";

export async function getParentFinanceSnapshotAction(studentId: string, phone: string) {
    try {
        // Verify parent has access to this student
        const familyResult = await getFamilyStudentsAction(phone);
        if (!familyResult.success || !familyResult.students) {
            return { success: false, error: "Unauthorized access to student" };
        }

        const hasAccess = familyResult.students.some((s: any) => s.id === studentId);
        if (!hasAccess) {
            return { success: false, error: "Unauthorized access to student" };
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { school: true }
        });

        if (!student) {
            return { success: false, error: "Student not found" };
        }

        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Fetch pending fees
        const pendingFees = await prisma.fee.findMany({
            where: {
                studentId,
                status: "PENDING"
            },
            orderBy: { dueDate: 'asc' }
        });

        let totalDueNow = 0;
        let upcomingNext30Days = 0;

        for (const fee of pendingFees) {
            if (fee.dueDate < now) {
                totalDueNow += fee.amount;
            } else if (fee.dueDate <= thirtyDaysFromNow) {
                upcomingNext30Days += fee.amount;
            }
        }

        // Fetch all payment history
        const feePayments = await prisma.feePayment.findMany({
            where: { fee: { studentId } },
            include: { fee: true },
            orderBy: { date: 'desc' }
        });

        const latestPayment = feePayments.length > 0 ? feePayments[0] : null;

        const dueInvoices = pendingFees.map((f: any) => ({
            id: f.id,
            title: f.title,
            amount: f.amount,
            dueDate: f.dueDate.toISOString().split("T")[0],
            status: f.status
        }));

        const paymentHistory = feePayments.map((p: any) => ({
            id: p.id,
            feeId: p.feeId,
            title: p.fee.title,
            amount: p.amount,
            date: p.date.toISOString(),
            method: p.method,
            reference: p.reference
        }));

        // Parse integrationsConfig for available payment gateways
        let availableGateways: string[] = [];
        try {
            if (student.school.integrationsConfig) {
                const config = JSON.parse(student.school.integrationsConfig);
                if (config.payments) {
                    if (config.payments.razorpay?.isActive) availableGateways.push('razorpay');
                    if (config.payments.stripe?.isActive) availableGateways.push('stripe');
                }
            }
        } catch (err) {
            console.error("Error parsing integrations config:", err);
        }

        // If no dynamic gateways are configured, default to standard offline/manual methods for UI logic
        if (availableGateways.length === 0) {
            availableGateways = ['cash', 'bank_transfer'];
        }

        return {
            success: true,
            summary: {
                totalDueNow,
                upcomingNext30Days,
                lastPaymentAmount: latestPayment?.amount || 0,
                lastPaymentDate: latestPayment?.date.toISOString() || null
            },
            dueInvoices,
            paymentHistory,
            availableGateways
        };

    } catch (e: any) {
        console.error("getParentFinanceSnapshotAction error:", e);
        return { success: false, error: "Failed to load finance data" };
    }
}

export async function processFeePaymentAction(feeId: string, amount: number, method: string, phone: string) {
    try {
        // Find the fee
        const fee = await prisma.fee.findUnique({
            where: { id: feeId },
            include: { student: true }
        });

        if (!fee) {
            return { success: false, error: "Fee not found" };
        }

        // Verify parent has access to this student
        const familyResult = await getFamilyStudentsAction(phone);
        if (!familyResult.success || !familyResult.students) {
            return { success: false, error: "Unauthorized access to student" };
        }

        const hasAccess = familyResult.students.some((s: any) => s.id === fee.studentId);
        if (!hasAccess) {
            return { success: false, error: "Unauthorized access to student" };
        }

        // Simulate payment gateway processing
        // In a real app, we would integrate Stripe or Razorpay SDKs here based on 'method'
        const mockReference = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        // Use a transaction to ensure both fee status and payment record are atomic
        const result = await prisma.$transaction(async (tx) => {
            // Update fee status to PAID
            await tx.fee.update({
                where: { id: feeId },
                data: { status: "PAID" }
            });

            // Create payment record
            const payment = await tx.feePayment.create({
                data: {
                    feeId,
                    amount,
                    method,
                    reference: mockReference,
                    date: new Date()
                }
            });
            return payment;
        });

        return {
            success: true,
            transactionId: result.id,
            reference: result.reference,
            message: "Payment processed successfully"
        };
    } catch (e: any) {
        console.error("processFeePaymentAction error:", e);
        return { success: false, error: "Failed to process payment" };
    }
}
