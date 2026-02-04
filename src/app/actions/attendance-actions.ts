"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentUserAction } from "./session-actions";

export async function getStaffAttendanceAction(schoolSlug: string, date?: string) {
    try {
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        let whereClause: any = {
            date: targetDate,
            user: {
                school: { slug: schoolSlug }
            }
        };

        // Permission Filtering
        // Permission Filtering
        const currentUserRes = await getCurrentUserAction();
        const viewingUserId = currentUserRes.success ? currentUserRes.data?.id : null;

        if (viewingUserId) {
            const user = await prisma.user.findUnique({
                where: { id: viewingUserId },
                include: { customRole: true } as any
            });

            if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
                // Default: Restrict to OWN
                let restricted = true;
                let allowedIds: string[] = [viewingUserId];

                if (user.customRole) {
                    let perms: any[] = [];
                    try {
                        perms = typeof (user as any).customRole?.permissions === 'string'
                            ? JSON.parse((user as any).customRole.permissions)
                            : (user as any).customRole?.permissions;
                    } catch (e) { }

                    const attendPerm = perms?.find(p => p.module === "staff.attendance");

                    if (attendPerm) {
                        const actions = attendPerm.actions || [];
                        if (actions.includes("manage") || actions.includes("view")) {
                            restricted = false;
                        } else if (actions.includes("manage_selected")) {
                            const access = await (prisma as any).staffAccess.findMany({
                                where: { managerId: viewingUserId },
                                select: { staffId: true }
                            });
                            const mappedIds = access.map((a: any) => a.staffId);
                            allowedIds = [...allowedIds, ...mappedIds];
                        }
                    }
                }

                if (restricted) {
                    whereClause.userId = { in: allowedIds };
                }
            }
        } else {
            return { success: true, data: [] };
        }

        const attendance = await prisma.staffAttendance.findMany({
            where: whereClause,
            include: {
                user: {
                    include: {
                        customRole: {
                            include: {
                                leavePolicies: true
                            }
                        },
                        school: {
                            include: {
                                leavePolicies: {
                                    where: { isDefault: true }
                                }
                            }
                        }
                    }
                },
                punches: {
                    orderBy: { timestamp: "asc" }
                }
            } as any
        });

        // Map to include effective policy gap
        const data = attendance.map((at: any) => {
            const policies = at.user.customRole?.leavePolicies || [];
            // Find policy for this role in this school
            const rolePolicy = policies.find((p: any) => p.schoolId === at.user.schoolId);
            // Default policy for the school
            const defaultPolicy = at.user.school?.leavePolicies?.find((p: any) => p.isDefault);

            const effectivePolicy = rolePolicy || defaultPolicy;

            return {
                ...at,
                minPunchGapMins: effectivePolicy?.minPunchGapMins || 0
            };
        });

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAttendanceScope(userId: string): Promise<{ type: 'ALL' | 'OWN' | 'SELECTED' | 'NONE', ids?: string[] }> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { customRole: true } as any
    });

    if (!user) return { type: 'NONE' };
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return { type: 'ALL' };

    let perms: any[] = [];
    try {
        perms = typeof (user as any).customRole?.permissions === 'string'
            ? JSON.parse((user as any).customRole.permissions)
            : (user as any).customRole?.permissions;
    } catch (e) { return { type: 'NONE' }; }

    if (!perms) return { type: 'NONE' };

    const attendPerm = perms.find(p => p.module === "staff.attendance");
    if (!attendPerm) return { type: 'NONE' }; // Or OWN if we want default? No, strict.

    // Check actions
    if (attendPerm.actions.includes("view") || attendPerm.actions.includes("manage") || attendPerm.actions.includes("mark")) {
        // Technically 'view' might be global? 
        // If they have 'manage_own' AND 'view', usually 'view' implies global unless we restrict.
        // For this system, let's assume 'view' is global. 
        // BUT the user wants granular.
        // If they have 'manage_selected' they shouldn't see all.
        // Let's check granular FIRST.

        // Actually, usually 'view' is the base.
        // If the user has 'manage_selected', they likely DO NOT have global 'view' in the checkboxes if the UI is exclusive.
        // But the UI allows checking multiple.
        // Let's assume: if 'manage' is present -> ALL.
        // If 'manage_selected' -> SELECTED.
        // If 'manage_own' -> OWN.

        if (attendPerm.actions.includes("manage")) return { type: 'ALL' };

        if (attendPerm.actions.includes("manage_selected")) {
            const access = await (prisma as any).staffAccess.findMany({
                where: { managerId: userId },
                select: { staffId: true }
            });
            const ids = access.map((a: any) => a.staffId);
            // Also include self? Usually yes.
            if (!ids.includes(userId)) ids.push(userId);
            return { type: 'SELECTED', ids };
        }

        if (attendPerm.actions.includes("manage_own")) return { type: 'OWN' };

        if (attendPerm.actions.includes("view")) return { type: 'ALL' }; // Fallback to global view
    }

    return { type: 'NONE' };
}

// Helper to verify attendance management permission
// Helper to verify attendance management permission
async function verifyAttendancePermission(managerId: string, targetUserId: string) {
    const user = await prisma.user.findUnique({
        where: { id: managerId }
    });

    if (!user) return false;

    // Strict Policy: Only Admins can manage others' attendance
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return true;

    // Users can only manage their own
    return managerId === targetUserId;
}

export async function togglePunchAction(schoolSlug: string, userId: string, date: string) {
    try {
        const currentUserRes = await getCurrentUserAction();
        const performingUserId = currentUserRes.success ? currentUserRes.data?.id : null;

        if (!performingUserId) throw new Error("Unauthorized");

        // Enforce Permission
        const hasPermission = await verifyAttendancePermission(performingUserId, userId);
        if (!hasPermission) throw new Error("Unauthorized to manage this staff's attendance");

        // 0. Fetch Policy First (needed for validation and later calculation)
        let minFull = 8.0;
        let minHalf = 4.0;
        let maxPunches = 10;
        let minPunchGap = 0;

        try {
            // 0a. Get User Role
            const targetUser = await prisma.user.findUnique({
                where: { id: userId },
                // @ts-ignore: Stale client
                select: { customRoleId: true } as any
            });

            let policy: any = null;

            // 0b. Try Role-Specific Policy first
            // @ts-ignore
            if ((targetUser as any)?.customRoleId) {
                policy = await (prisma as any).leavePolicy.findFirst({
                    where: {
                        school: { slug: schoolSlug },
                        // @ts-ignore
                        roleId: (targetUser as any).customRoleId
                    }
                });
            }

            // 0c. Fallback to Default Policy
            if (!policy) {
                const school = await prisma.school.findUnique({
                    where: { slug: schoolSlug },
                    include: { leavePolicies: { where: { isDefault: true } } }
                });
                policy = (school?.leavePolicies?.[0] as any);
            }

            if (policy) {
                minFull = policy.minFullDayHours ?? 8.0;
                minHalf = policy.minHalfDayHours ?? 4.0;
                maxPunches = policy.maxDailyPunchEvents ?? 10;
                minPunchGap = policy.minPunchGapMins ?? 0;
            }
        } catch (e) {
            console.error("Policy Fetch Error (Using Defaults):", e);
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // 1. Get or Create Attendance Record
        let attendance = await (prisma as any).staffAttendance.upsert({
            where: { userId_date: { userId, date: targetDate } },
            update: {},
            create: { userId, date: targetDate },
            include: { punches: { orderBy: { timestamp: "desc" } } }
        });

        // Check Max Punches Limit
        if ((attendance as any).punches.length >= maxPunches) {
            throw new Error(`Daily punch limit of ${maxPunches} reached.`);
        }

        const lastPunch = (attendance as any).punches[0];
        const nextType = (!lastPunch || lastPunch.type === "OUT") ? "IN" : "OUT";

        // Check Punch Gap
        const minGap = minPunchGap;
        if (lastPunch && minGap > 0) {
            const lastPunchTime = new Date(lastPunch.timestamp).getTime();
            const now = Date.now();
            const gapMs = now - lastPunchTime;
            const minGapMs = minGap * 60 * 1000;

            if (gapMs < minGapMs) {
                const remainingMins = Math.ceil((minGapMs - gapMs) / (60 * 1000));
                throw new Error(`Please wait ${remainingMins} more minute(s) before punching ${nextType.toLowerCase()}.`);
            }
        }

        // 2. Record the new Punch
        await (prisma as any).staffPunch.create({
            data: {
                type: nextType,
                attendanceId: (attendance as any).id,
                timestamp: new Date()
            }
        });

        // 3. Recalculate Total Hours
        const allPunches = await (prisma as any).staffPunch.findMany({
            where: { attendanceId: (attendance as any).id },
            orderBy: { timestamp: "asc" }
        });

        let totalHours = 0;
        let lastIn: Date | null = null;

        for (const punch of allPunches) {
            if (punch.type === "IN") {
                lastIn = new Date(punch.timestamp);
            } else if (punch.type === "OUT" && lastIn) {
                const diff = (punch as any).timestamp.getTime() - lastIn.getTime();
                totalHours += diff / (1000 * 60 * 60);
                lastIn = null;
            }
        }

        // 4. Calculate Status based on Policy (using hoisted values)
        let currentStatus = (attendance as any).status || "PRESENT";
        let newStatus = currentStatus;
        const lastRec = allPunches[allPunches.length - 1]; // We just added one, so this exists
        const isCurrentlyIn = lastRec.type === "IN";

        // Logic:
        // 1. If currently IN, we give benefit of doubt -> PRESENT (unless previously LATE).
        // 2. If currently OUT, we strictly check hours -> PRESENT / HALF_DAY / ABSENT.

        // Debug Log
        console.log("--- Attendance Calculation ---");
        console.log(`User: ${userId} | Date: ${date} | Total Hours: ${totalHours}`);
        console.log(`Policy: MinHalf=${minHalf}, MinFull=${minFull}, MaxPunches=${maxPunches}`);
        console.log(`Current Punch: ${lastRec.type} (Length: ${allPunches.length})`);

        if (isCurrentlyIn) {
            // Logic: If they punch IN, we set them to PRESENT tentatively, 
            // UNLESS they were LATE previously (preserve LATE).
            if (currentStatus === "ABSENT" || currentStatus === "HALF_DAY") {
                newStatus = "PRESENT";
            }
            // If status was LATE, it stays LATE. 
            // If status was PRESENT, it stays PRESENT.
        } else {
            // OUT Logic
            if (totalHours >= minFull) {
                if (currentStatus !== "LATE") newStatus = "PRESENT";
            } else if (totalHours >= minHalf) {
                newStatus = "HALF_DAY";
            } else {
                newStatus = "ABSENT";
            }
        }

        console.log(`Decision: ${currentStatus} -> ${newStatus}`);

        await (prisma as any).staffAttendance.update({
            where: { id: (attendance as any).id },
            data: {
                totalHours,
                status: newStatus
            }
        });

        revalidatePath(`/s/${schoolSlug}/staff/attendance`);
        return { success: true };
    } catch (error: any) {
        console.error("Toggle Punch Error:", error);
        if (error.message?.includes("Unknown argument")) {
            return { success: false, error: "Database schema update pending. Please STOP and RESTART your server (npm run dev) to apply new attendance rules." };
        }
        return { success: false, error: error.message };
    }
}

export async function markStaffAttendanceAction(schoolSlug: string, data: { userId: string, date: string, status?: string, notes?: string }) {
    try {
        const currentUserRes = await getCurrentUserAction();
        const performingUserId = currentUserRes.success ? currentUserRes.data?.id : null;

        if (!performingUserId) throw new Error("Unauthorized");

        // Enforce Permission
        const hasPermission = await verifyAttendancePermission(performingUserId, data.userId);
        if (!hasPermission) throw new Error("Unauthorized to manage this staff's attendance");

        const targetDate = new Date(data.date);
        targetDate.setHours(0, 0, 0, 0);

        await (prisma as any).staffAttendance.upsert({
            where: { userId_date: { userId: data.userId, date: targetDate } },
            update: { status: data.status, notes: data.notes },
            create: {
                userId: data.userId,
                date: targetDate,
                status: data.status || "PRESENT",
                notes: data.notes
            }
        });

        revalidatePath(`/s/${schoolSlug}/staff/attendance`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStaffLeaveRequestsAction(schoolSlug: string) {
    try {
        const currentUserRes = await getCurrentUserAction();
        const viewingUserId = currentUserRes.success ? currentUserRes.data?.id : null;

        let whereClause: any = {
            user: {
                school: { slug: schoolSlug }
            }
        };

        if (viewingUserId) {
            const user = await prisma.user.findUnique({
                where: { id: viewingUserId },
                include: { customRole: true } as any
            });

            if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
                let restricted = true;
                let allowedIds: string[] = [viewingUserId];

                if (user.customRole) {
                    let perms: any[] = [];
                    try {
                        perms = typeof (user as any).customRole?.permissions === 'string'
                            ? JSON.parse((user as any).customRole.permissions)
                            : (user as any).customRole?.permissions;
                    } catch (e) { }

                    const attendPerm = perms?.find(p => p.module === "staff.attendance");

                    if (attendPerm) {
                        const actions = attendPerm.actions || [];
                        if (actions.includes("manage") || actions.includes("view")) {
                            restricted = false;
                        } else if (actions.includes("manage_selected")) {
                            const access = await (prisma as any).staffAccess.findMany({
                                where: { managerId: viewingUserId },
                                select: { staffId: true }
                            });
                            const mappedIds = access.map((a: any) => a.staffId);
                            allowedIds = [...allowedIds, ...mappedIds];
                        }
                    }
                }

                if (restricted) {
                    whereClause.userId = { in: allowedIds };
                }
            }
        }

        const requests = await prisma.leaveRequest.findMany({
            where: whereClause,
            include: {
                user: true
            },
            orderBy: {
                startDate: "desc"
            }
        });
        return { success: true, data: requests };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createLeaveRequestAction(schoolSlug: string, data: { userId: string, startDate: string, endDate: string, type: string, reason: string }) {
    try {
        const request = await prisma.leaveRequest.create({
            data: {
                userId: data.userId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                type: data.type,
                reason: data.reason
            }
        });
        revalidatePath(`/s/${schoolSlug}/staff/attendance`);
        return { success: true, data: request };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLeaveStatusAction(schoolSlug: string, id: string, status: string) {
    try {
        const request = await prisma.leaveRequest.update({
            where: { id },
            data: { status }
        });
        revalidatePath(`/s/${schoolSlug}/staff/attendance`);
        return { success: true, data: request };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAttendanceAnalyticsAction(schoolSlug: string, month: number, year: number) {
    try {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const currentUserRes = await getCurrentUserAction();
        const viewingUserId = currentUserRes.success ? currentUserRes.data?.id : null;

        let whereClause: any = {
            date: {
                gte: startDate,
                lte: endDate
            },
            user: {
                school: { slug: schoolSlug }
            }
        };

        let leaveWhereClause: any = {
            OR: [
                { startDate: { lte: endDate }, endDate: { gte: startDate } }
            ],
            user: {
                school: { slug: schoolSlug }
            },
            status: "APPROVED"
        };


        if (viewingUserId) {
            const user = await prisma.user.findUnique({
                where: { id: viewingUserId },
                include: { customRole: true } as any
            });

            if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
                let restricted = true;
                let allowedIds: string[] = [viewingUserId];

                if (user.customRole) {
                    let perms: any[] = [];
                    try {
                        perms = typeof (user as any).customRole?.permissions === 'string'
                            ? JSON.parse((user as any).customRole.permissions)
                            : (user as any).customRole?.permissions;
                    } catch (e) { }

                    const attendPerm = perms?.find(p => p.module === "staff.attendance");

                    if (attendPerm) {
                        const actions = attendPerm.actions || [];
                        if (actions.includes("manage") || actions.includes("view")) {
                            restricted = false;
                        } else if (actions.includes("manage_selected")) {
                            const access = await (prisma as any).staffAccess.findMany({
                                where: { managerId: viewingUserId },
                                select: { staffId: true }
                            });
                            const mappedIds = access.map((a: any) => a.staffId);
                            allowedIds = [...allowedIds, ...mappedIds];
                        }
                    }
                }

                if (restricted) {
                    whereClause.userId = { in: allowedIds };
                    leaveWhereClause.userId = { in: allowedIds };
                }
            }
        }

        const attendance = await prisma.staffAttendance.findMany({
            where: whereClause
        });

        const leaves = await prisma.leaveRequest.findMany({
            where: leaveWhereClause
        });

        // Basic aggregation
        const stats = {
            totalPresent: attendance.filter(a => a.status === "PRESENT").length,
            totalLate: attendance.filter(a => a.status === "LATE").length,
            totalHalfDay: attendance.filter(a => a.status === "HALF_DAY").length,
            totalLeaves: leaves.length,
            avgHours: attendance.length > 0 ? attendance.reduce((acc, curr) => acc + (curr.totalHours || 0), 0) / attendance.length : 0
        };

        return { success: true, data: stats };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStaffAttendanceHistoryAction(userId: string) {
    try {
        const attendance = await prisma.staffAttendance.findMany({
            where: { userId },
            include: { punches: { orderBy: { timestamp: "asc" } } },
            orderBy: { date: "desc" }
        });

        // Calculate stats
        const stats = {
            totalDays: attendance.length,
            presentDays: attendance.filter(a => a.status === "PRESENT").length,
            lateDays: attendance.filter(a => a.status === "LATE").length,
            absentDays: attendance.filter(a => a.status === "ABSENT").length,
            totalHours: attendance.reduce((acc, curr) => acc + (curr.totalHours || 0), 0)
        };

        return { success: true, data: { attendance, stats } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStaffLeaveHistoryAction(userId: string) {
    try {
        const leaves = await prisma.leaveRequest.findMany({
            where: { userId },
            orderBy: { startDate: "desc" }
        });
        return { success: true, data: leaves };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ----------------------------------------------------------------------
// CUSTOM STUDENT ATTENDANCE ACTIONS
// ----------------------------------------------------------------------

export async function getAttendanceDataAction(schoolSlug: string, classroomId: string, dateStr: string) {
    try {
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);

        // 1. Fetch all students in the class
        const students = await prisma.student.findMany({
            where: {
                classroomId: classroomId,
                status: "ACTIVE"
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                grade: true,
            },
            orderBy: { firstName: "asc" }
        });

        // 2. Fetch attendance records for these students on the specific date
        // Note: We cannot query `studentId` in `students` array directly within findMany easily in one go efficiently without `in`
        // But since it's one class, we can just fetch all attendance for this class's students on that date.

        const studentIds = students.map(s => s.id);
        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                studentId: { in: studentIds },
                date: targetDate
            }
        });

        // 3. Merge data
        const mergedData = students.map(student => {
            const record = attendanceRecords.find(r => r.studentId === student.id);
            return {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                avatar: student.avatar,
                rollNo: "—", // Field not in schema yet, relying on UI to handle missing
                status: record ? record.status : null,
                notes: record ? record.notes : null
            };
        });

        return { success: true, data: mergedData };
    } catch (error: any) {
        console.error("Student Attendance Fetch Error:", error);
        return { success: false, error: error.message };
    }
}

export async function markAttendanceAction(studentId: string, date: string | Date, status: string, notes?: string) {
    try {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        await prisma.attendance.upsert({
            where: {
                studentId_date: {
                    studentId,
                    date: targetDate
                }
            },
            update: { status, notes },
            create: {
                studentId,
                date: targetDate,
                status,
                notes
            }
        });

        // Optional: Revalidate if we were showing a summary on another page
        // revalidatePath(...)

        return { success: true };
    } catch (error: any) {
        console.error("Mark Student Attendance Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getStudentAttendanceAction(studentId: string) {
    try {
        const attendance = await prisma.attendance.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
            take: 365
        });
        return { success: true, data: attendance };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
