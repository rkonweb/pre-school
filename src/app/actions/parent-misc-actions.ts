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
        // 1. Find all students linked to this parent
        const students = await prisma.student.findMany({
            where: {
                status: "ACTIVE",
                OR: [
                    { parentMobile: phone },
                    { fatherPhone: phone },
                    { motherPhone: phone },
                ],
            },
            select: { id: true, firstName: true, lastName: true, classroomId: true, schoolId: true },
        });

        if (!students.length) {
            return { success: true, data: { notifications: [], unreadCount: 0, totalPages: 1, currentPage: page } };
        }

        const studentIds = students.map(s => s.id);
        const classroomIds = students.map(s => s.classroomId).filter(Boolean) as string[];
        const schoolIds = [...new Set(students.map(s => s.schoolId))];
        const studentNameMap = Object.fromEntries(students.map(s => [s.id, `${s.firstName} ${s.lastName ?? ''}`.trim()]));

        // 2. Get read notification IDs for this parent (to track read state of aggregated items)
        const readNotifs = await prisma.notification.findMany({
            where: { userId: phone, userType: "PARENT", isRead: true },
            select: { relatedId: true },
        });
        const readIds = new Set(readNotifs.map(n => n.relatedId).filter(Boolean));

        // Also get existing manual notifications
        const manualNotifs = await prisma.notification.findMany({
            where: { userId: phone, userType: "PARENT", relatedId: null },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // 3. Query all sources in parallel
        const [diaryEntries, homeworks, absences, pendingFees, ptmSessions, broadcasts] = await Promise.all([
            // Diary entries / Circulars for student's classrooms
            prisma.diaryEntry.findMany({
                where: {
                    schoolId: { in: schoolIds },
                    status: "PUBLISHED",
                    publishedAt: { gte: thirtyDaysAgo },
                    OR: [
                        { classroomId: { in: classroomIds } },
                        { classroomId: null }, // School-wide entries
                    ],
                },
                select: { id: true, title: true, content: true, type: true, publishedAt: true, createdAt: true, priority: true, subject: true },
                orderBy: { publishedAt: 'desc' },
                take: 30,
            }),

            // Homework for student's classrooms
            prisma.homework.findMany({
                where: {
                    schoolId: { in: schoolIds },
                    isPublished: true,
                    createdAt: { gte: thirtyDaysAgo },
                    classroomId: { in: classroomIds },
                },
                select: { id: true, title: true, subject: true, dueDate: true, description: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),

            // Attendance absences for students (last 7 days)
            prisma.attendance.findMany({
                where: {
                    studentId: { in: studentIds },
                    date: { gte: sevenDaysAgo },
                    status: { in: ["ABSENT", "LATE"] },
                },
                select: { id: true, date: true, status: true, notes: true, studentId: true, createdAt: true },
                orderBy: { date: 'desc' },
            }),

            // Pending / overdue fees
            prisma.fee.findMany({
                where: {
                    studentId: { in: studentIds },
                    status: { in: ["PENDING", "OVERDUE"] },
                },
                select: { id: true, title: true, amount: true, dueDate: true, status: true, studentId: true, createdAt: true, category: true },
                orderBy: { dueDate: 'asc' },
                take: 20,
            }),

            // PTM Sessions (upcoming & active)
            prisma.pTMSession.findMany({
                where: {
                    schoolId: { in: schoolIds },
                    isActive: true,
                    date: { gte: sevenDaysAgo },
                },
                select: { id: true, title: true, description: true, date: true, startTime: true, endTime: true, slotMinutes: true, createdAt: true },
                orderBy: { date: 'asc' },
                take: 10,
            }),

            // Broadcasts (school-wide announcements)
            prisma.broadcast.findMany({
                where: {
                    schoolId: { in: schoolIds },
                    status: "APPROVED",
                    createdAt: { gte: thirtyDaysAgo },
                },
                select: { id: true, title: true, content: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
        ]);

        // 4. Transform into unified notification objects
        const allNotifications: any[] = [];

        // Manual notifications (from Notification table)
        for (const n of manualNotifs) {
            allNotifications.push({
                id: n.id,
                type: n.type || 'system',
                title: n.title,
                message: n.message,
                createdAt: n.createdAt,
                isRead: n.isRead,
                relatedId: n.relatedId,
                relatedType: n.relatedType,
            });
        }

        // Diary entries → academic
        for (const d of diaryEntries) {
            const id = `diary_${d.id}`;
            allNotifications.push({
                id,
                type: d.priority === 'URGENT' ? 'urgent' : (d.type === 'CIRCULAR' ? 'event' : 'academic'),
                title: d.title,
                message: (d.content || '').substring(0, 200),
                createdAt: d.publishedAt || d.createdAt,
                isRead: readIds.has(id),
                relatedId: d.id,
                relatedType: 'DiaryEntry',
            });
        }

        // Homework → homework
        for (const h of homeworks) {
            const id = `hw_${h.id}`;
            const dueStr = h.dueDate ? `Due: ${new Date(h.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : '';
            allNotifications.push({
                id,
                type: 'homework',
                title: `${h.subject || 'Homework'}: ${h.title}`,
                message: `${h.description ? h.description.substring(0, 150) : 'New homework assigned'}${dueStr ? ` • ${dueStr}` : ''}`,
                createdAt: h.createdAt,
                isRead: readIds.has(id),
                relatedId: h.id,
                relatedType: 'Homework',
            });
        }

        // Attendance absences → attendance
        for (const a of absences) {
            const id = `att_${a.id}`;
            const sName = studentNameMap[a.studentId] || 'Your child';
            const dateStr = new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            allNotifications.push({
                id,
                type: 'attendance',
                title: a.status === 'ABSENT' ? `${sName} was marked absent` : `${sName} was marked late`,
                message: `${dateStr}${a.notes ? ` • ${a.notes}` : ''}`,
                createdAt: a.createdAt,
                isRead: readIds.has(id),
                relatedId: a.id,
                relatedType: 'Attendance',
            });
        }

        // Fees → fee
        for (const f of pendingFees) {
            const id = `fee_${f.id}`;
            const sName = studentNameMap[f.studentId] || 'Student';
            const dueStr = new Date(f.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            const isOverdue = new Date(f.dueDate) < new Date();
            allNotifications.push({
                id,
                type: isOverdue ? 'urgent' : 'fee',
                title: isOverdue ? `⚠️ Overdue: ${f.title}` : `Fee Due: ${f.title}`,
                message: `₹${f.amount.toLocaleString('en-IN')} for ${sName} • Due: ${dueStr}`,
                createdAt: f.createdAt,
                isRead: readIds.has(id),
                relatedId: f.id,
                relatedType: 'Fee',
            });
        }

        // PTM → ptm
        for (const p of ptmSessions) {
            const id = `ptm_${p.id}`;
            const dateStr = new Date(p.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
            allNotifications.push({
                id,
                type: 'ptm',
                title: p.title,
                message: `${dateStr} • ${p.startTime} – ${p.endTime}${p.description ? ` • ${p.description.substring(0, 100)}` : ''}`,
                createdAt: p.createdAt,
                isRead: readIds.has(id),
                relatedId: p.id,
                relatedType: 'PTMSession',
            });
        }

        // Broadcasts → event
        for (const b of broadcasts) {
            const id = `bcast_${b.id}`;
            allNotifications.push({
                id,
                type: 'event',
                title: b.title,
                message: (b.content || '').substring(0, 200),
                createdAt: b.createdAt,
                isRead: readIds.has(id),
                relatedId: b.id,
                relatedType: 'Broadcast',
            });
        }

        // 5. Sort by date descending
        allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // 6. Paginate
        const limit = 30;
        const skip = (page - 1) * limit;
        const paginated = allNotifications.slice(skip, skip + limit);
        const unreadCount = allNotifications.filter(n => !n.isRead).length;

        return {
            success: true,
            data: JSON.parse(JSON.stringify({
                notifications: paginated,
                unreadCount,
                totalPages: Math.ceil(allNotifications.length / limit),
                currentPage: page,
            }))
        };
    } catch (error: any) {
        console.error("getParentNotificationsAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function markNotificationsReadAction(phone: string, notificationIds?: string[]) {
    try {
        if (!notificationIds || notificationIds.length === 0) {
            // Mark ALL as read — mark existing DB notifications + create read markers for aggregated IDs
            await prisma.notification.updateMany({
                where: { userId: phone, userType: "PARENT", isRead: false },
                data: { isRead: true, readAt: new Date() }
            });
            return { success: true };
        }

        // Separate real DB notification IDs from aggregated virtual IDs
        const realIds: string[] = [];
        const virtualIds: string[] = [];
        for (const id of notificationIds) {
            if (id.includes('_')) {
                virtualIds.push(id); // e.g., "diary_abc123", "hw_xyz456"
            } else {
                realIds.push(id); // Actual Notification table IDs
            }
        }

        // Mark real notifications as read
        if (realIds.length > 0) {
            await prisma.notification.updateMany({
                where: { id: { in: realIds }, userId: phone, userType: "PARENT" },
                data: { isRead: true, readAt: new Date() }
            });
        }

        // Create read markers for virtual IDs (store as Notification records with relatedId)
        if (virtualIds.length > 0) {
            // Check which virtual IDs already have markers
            const existing = await prisma.notification.findMany({
                where: { userId: phone, userType: "PARENT", relatedId: { in: virtualIds } },
                select: { relatedId: true },
            });
            const existingIds = new Set(existing.map(e => e.relatedId));

            const newMarkers = virtualIds.filter(id => !existingIds.has(id));
            if (newMarkers.length > 0) {
                await prisma.notification.createMany({
                    data: newMarkers.map(id => ({
                        userId: phone,
                        userType: "PARENT",
                        title: "Read marker",
                        message: "",
                        type: "system",
                        relatedId: id,
                        isRead: true,
                        readAt: new Date(),
                    })),
                });
            }
        }

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

        return { success: true, data: JSON.parse(JSON.stringify(leaveRequest)) };
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

        return { success: true, data: JSON.parse(JSON.stringify(requests)) };
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
            data: JSON.parse(JSON.stringify({
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
            }))
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
