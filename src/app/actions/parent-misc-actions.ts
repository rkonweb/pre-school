"use server";

import { prisma } from "@/lib/prisma";

async function getStudentIdsForParent(phone: string): Promise<string[]> {
    const students = await prisma.student.findMany({
        where: {
            status: "ACTIVE",
            OR: [
                { parentMobile: phone },
                { fatherPhone: phone },
                { motherPhone: phone },
            ],
        },
        select: { id: true },
    });
    return students.map(s => s.id);
}

export async function getParentNotificationsAction(phone: string, page = 1) {
    try {
        const limit = 20;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: phone, userType: "PARENT" },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({
                where: { userId: phone, userType: "PARENT" }
            })
        ]);

        const unreadCount = await prisma.notification.count({
            where: { userId: phone, userType: "PARENT", isRead: false }
        });

        return {
            success: true,
            data: {
                notifications,
                unreadCount,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            }
        };
    } catch (error: any) {
        console.error("getParentNotificationsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function markNotificationsReadAction(phone: string, notificationIds?: string[]) {
    try {
        const where: any = { userId: phone, userType: "PARENT", isRead: false };
        if (notificationIds && notificationIds.length > 0) {
            where.id = { in: notificationIds };
        }

        await prisma.notification.updateMany({
            where,
            data: { isRead: true, readAt: new Date() }
        });

        return { success: true };
    } catch (error: any) {
        console.error("markNotificationsReadAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function submitLeaveRequestAction(
    studentId: string,
    phone: string,
    data: { startDate: string; endDate: string; reason: string }
) {
    try {
        // Validate parent access
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { parentMobile: phone },
                    { fatherPhone: phone },
                    { motherPhone: phone },
                ],
            },
            select: { id: true, firstName: true }
        });

        if (!student) {
            return { success: false, error: "Unauthorized or student not found" };
        }

        const leaveRequest = await prisma.studentLeaveRequest.create({
            data: {
                studentId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                reason: data.reason,
                status: "PENDING",
            }
        });

        return { success: true, data: leaveRequest };
    } catch (error: any) {
        console.error("submitLeaveRequestAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function getLeaveRequestsAction(studentId: string, phone: string) {
    try {
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { parentMobile: phone },
                    { fatherPhone: phone },
                    { motherPhone: phone },
                ],
            },
            select: { id: true }
        });

        if (!student) {
            return { success: false, error: "Unauthorized or student not found" };
        }

        const requests = await prisma.studentLeaveRequest.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return { success: true, data: requests };
    } catch (error: any) {
        console.error("getLeaveRequestsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function getParentDocumentsAction(phone: string) {
    try {
        const studentIds = await getStudentIdsForParent(phone);
        if (!studentIds.length) {
            return { success: false, error: "No students found" };
        }

        // Fetch fee receipts, report cards in parallel for all children
        const [feePayments, reportCards, transferCerts] = await Promise.all([
            prisma.feePayment.findMany({
                where: {
                    fee: { studentId: { in: studentIds } }
                },
                include: {
                    fee: {
                        select: { title: true, category: true, student: { select: { firstName: true, lastName: true } } }
                    }
                },
                orderBy: { date: 'desc' },
                take: 50,
            }),
            prisma.reportCard.findMany({
                where: { studentId: { in: studentIds }, published: true },
                include: {
                    student: { select: { firstName: true, lastName: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
            prisma.transferCertificate.findMany({
                where: { studentId: { in: studentIds } },
                include: {
                    student: { select: { firstName: true, lastName: true } }
                },
            }),
        ]);

        return {
            success: true,
            data: {
                feeReceipts: feePayments.map(p => ({
                    id: p.id,
                    amount: p.amount,
                    date: p.date,
                    method: p.method,
                    reference: p.reference,
                    feeTitle: p.fee.title,
                    feeCategory: p.fee.category,
                    studentName: `${p.fee.student.firstName} ${p.fee.student.lastName}`.trim(),
                })),
                reportCards: reportCards.map(rc => ({
                    id: rc.id,
                    term: rc.term,
                    comments: rc.comments,
                    publishedAt: rc.updatedAt,
                    studentName: `${rc.student.firstName} ${rc.student.lastName}`.trim(),
                })),
                transferCertificates: transferCerts.map(tc => ({
                    id: tc.id,
                    tcNumber: tc.tcNumber,
                    issueDate: tc.issueDate,
                    documentUrl: tc.documentUrl,
                    reason: tc.reason,
                    studentName: `${tc.student.firstName} ${tc.student.lastName}`.trim(),
                })),
            }
        };
    } catch (error: any) {
        console.error("getParentDocumentsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function updateParentProfileAction(
    phone: string,
    data: { parentName?: string; parentEmail?: string; address?: string }
) {
    try {
        const studentIds = await getStudentIdsForParent(phone);
        if (!studentIds.length) {
            return { success: false, error: "No students found for this number" };
        }

        // Update linked student records with new parent info
        const updates: any = {};
        if (data.parentName) updates.parentName = data.parentName;
        if (data.parentEmail) updates.parentEmail = data.parentEmail;
        if (data.address) updates.address = data.address;

        if (Object.keys(updates).length === 0) {
            return { success: false, error: "No valid fields to update" };
        }

        await prisma.student.updateMany({
            where: { id: { in: studentIds } },
            data: updates,
        });

        return { success: true, message: "Profile updated successfully" };
    } catch (error: any) {
        console.error("updateParentProfileAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}
