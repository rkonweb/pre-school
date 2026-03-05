"use server";

import { prisma } from "@/lib/prisma";

/**
 * Validates Parent Auth strictly for a given student lookup
 */
async function validateParentAccess(studentId: string, phone: string) {
    // Parent apps authorize by matching their phone number against the Student's contact fields
    const student = await prisma.student.findFirst({
        where: {
            id: studentId,
            OR: [
                { parentMobile: phone },
                { fatherPhone: phone },
                { motherPhone: phone },
            ],
        },
        select: { id: true, schoolId: true },
    });
    return student;
}

/**
 * Fetches all Library Transactions for a specific student,
 * segregating them intelligently and calculating any unreturned fines cleanly.
 */
export async function getParentLibraryAction(studentId: string, phone: string) {
    try {
        console.log(`[Library Action] Validating Parent phone: ${phone}, student: ${studentId}`);
        const parent = await validateParentAccess(studentId, phone);
        if (!parent) {
            console.error(`[Library Action] Unauthorized: No parent found with phone ${phone} linked to student ${studentId}`);
            return { success: false, error: "Unauthorized access to this student" };
        }

        const transactions = await prisma.libraryTransaction.findMany({
            where: { studentId },
            include: {
                book: {
                    select: {
                        coverUrl: true,
                        title: true,
                        author: true,
                        isbn: true,
                        category: true,
                        publisher: true
                    }
                },
                school: {
                    select: {
                        librarySettings: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' }, // Prioritizes ISSUED state
                { issuedDate: 'desc' }
            ]
        });

        // Loop over transactions to gracefully handle dynamic "Overdue" calculations and live fines natively
        const formattedData = transactions.map(txn => {
            let status = txn.status;
            let currentFine = txn.fineAmount || 0;
            const now = new Date();

            // Dynamic evaluation for unreturned books past due date
            if (status === "ISSUED" && txn.dueDate && now > txn.dueDate) {
                status = "OVERDUE";
                const diffTime = Math.abs(now.getTime() - txn.dueDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const finePerDay = txn.school?.librarySettings?.finePerDay || 10;
                currentFine = diffDays * finePerDay;
            }

            return {
                id: txn.id,
                book: txn.book,
                issuedDate: txn.issuedDate.toISOString(),
                dueDate: txn.dueDate.toISOString(),
                returnedDate: txn.returnedDate ? txn.returnedDate.toISOString() : null,
                status: status,
                fineAmount: currentFine,
            };
        });

        return { success: true, data: formattedData };
    } catch (error: any) {
        console.error("getParentLibraryAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}
