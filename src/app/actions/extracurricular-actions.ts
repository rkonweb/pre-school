"use server";

import { prisma } from "@/lib/prisma";
import { validateUserSchoolAction } from "./session-actions";
import { revalidatePath } from "next/cache";

// --- Activity Master Actions ---

export async function getActivitiesAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };
        const schoolId = auth.user.schoolId;

        const activities = await prisma.activity.findMany({
            where: { school: { slug: schoolSlug } },
            include: {
                coach: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                },
                _count: {
                    select: { enrollments: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return { success: true, data: JSON.parse(JSON.stringify(activities)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createActivityAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const activity = await prisma.activity.create({
            data: {
                ...data,
                schoolId: auth.user.schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/activities`);
        return { success: true, data: JSON.parse(JSON.stringify(activity)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateActivityAction(schoolSlug: string, id: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const activity = await prisma.activity.update({
            where: { id, schoolId: auth.user.schoolId! },
            data
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/activities`);
        return { success: true, data: JSON.parse(JSON.stringify(activity)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteActivityAction(schoolSlug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        await prisma.activity.delete({
            where: { id, schoolId: auth.user.schoolId }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/activities`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Club Actions ---

export async function getClubsAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const clubs = await prisma.club.findMany({
            where: { school: { slug: schoolSlug } },
            include: {
                coach: {
                    select: { id: true, firstName: true, lastName: true, avatar: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return { success: true, data: JSON.parse(JSON.stringify(clubs)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createClubAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const club = await prisma.club.create({
            data: {
                ...data,
                schoolId: auth.user.schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/clubs`);
        return { success: true, data: JSON.parse(JSON.stringify(club)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateClubAction(schoolSlug: string, id: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const club = await prisma.club.update({
            where: { id, school: { slug: schoolSlug } },
            data: {
                ...data,
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/clubs`);
        return { success: true, data: JSON.parse(JSON.stringify(club)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteClubAction(schoolSlug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        await prisma.club.delete({
            where: { id, school: { slug: schoolSlug } }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/clubs`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Enrollment Actions ---

export async function enrollStudentAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const { notes, ...enrollmentData } = data;
        const enrollment = await prisma.activityEnrollment.create({
            data: {
                ...enrollmentData,
                schoolId: auth.user.schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/activities`);
        revalidatePath(`/s/${schoolSlug}/extracurricular/enrollment`);
        return { success: true, data: JSON.parse(JSON.stringify(enrollment)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getActivityEnrollmentsAction(schoolSlug: string, activityId?: string, studentId?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const enrollments = await prisma.activityEnrollment.findMany({
            where: { 
                schoolId: auth.user.schoolId,
                ...(activityId ? { activityId } : {}),
                ...(studentId ? { studentId } : {})
            },
            include: {
                student: {
                    select: { 
                        id: true, 
                        firstName: true, 
                        lastName: true, 
                        avatar: true, 
                        classroom: { select: { name: true } } 
                    }
                },
                activity: {
                    select: { id: true, name: true, category: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: JSON.parse(JSON.stringify(enrollments)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
export async function deleteActivityEnrollmentAction(schoolSlug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        await prisma.activityEnrollment.delete({
            where: { id, schoolId: auth.user.schoolId }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/enrollment`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- Timetable Actions ---

export async function createTimetableSlotAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const payload = { ...data };
        if (payload.dayOfWeek !== undefined) {
            payload.dayOfWeek = String(payload.dayOfWeek);
        }
        if (payload.coachId === "") {
            payload.coachId = null;
        }

        const slot = await prisma.activityTimetable.create({
            data: {
                ...payload,
                schoolId: auth.user.schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/timetable`);
        return { success: true, data: JSON.parse(JSON.stringify(slot)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getActivityTimetableAction(schoolSlug: string, activityId?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const timetable = await prisma.activityTimetable.findMany({
            where: { 
                school: { slug: schoolSlug },
                ...(activityId ? { activityId } : {})
            },
            include: {
                activity: { select: { id: true, name: true, category: true } },
                coach: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });

        return { success: true, data: JSON.parse(JSON.stringify(timetable)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSessionsAction(schoolSlug: string, activityId?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };
        const schoolId = auth.user.schoolId;

        const sessions = await prisma.activitySession.findMany({
            where: { 
                schoolId,
                ...(activityId ? { activityId } : {})
            },
            include: {
                activity: { select: { id: true, name: true, category: true } },
                coach: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { attendance: true } }
            },
            orderBy: { date: 'desc' },
            take: 50
        });

        return { 
            success: true, 
            data: JSON.parse(JSON.stringify(sessions.map(s => ({
                ...s,
                attendanceCount: s._count.attendance
            })))) 
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function startSessionFromTimetableAction(schoolSlug: string, timetableId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };
        const schoolId = auth.user.schoolId;

        const slot = await prisma.activityTimetable.findUnique({
            where: { id: timetableId, schoolId },
            include: { activity: true }
        });

        if (!slot) return { success: false, error: "Schedule slot not found" };

        // Check if a session already exists for this activity today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let session = await prisma.activitySession.findFirst({
            where: {
                activityId: slot.activityId,
                date: { gte: startOfDay, lte: endOfDay },
                schoolId
            }
        });

        if (!session) {
            session = await prisma.activitySession.create({
                data: {
                    activityId: slot.activityId,
                    date: new Date(),
                    coachId: slot.coachId,
                    location: slot.venue,
                    notes: `Scheduled ${slot.activity.name} Session`,
                    schoolId
                }
            });
        }

        revalidatePath(`/s/${schoolSlug}/extracurricular/attendance`);
        return { success: true, sessionId: session.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Session & Attendance Actions ---

export async function createActivitySessionAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const { topic, ...sessionData } = data;
        const session = await prisma.activitySession.create({
            data: {
                ...sessionData,
                schoolId: auth.user.schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/attendance`);
        return { success: true, data: JSON.parse(JSON.stringify(session)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markActivityAttendanceAction(schoolSlug: string, sessionId: string, attendanceData: any[]) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const operations = attendanceData.map(record => 
            prisma.activityAttendance.upsert({
                where: { 
                    sessionId_studentId: {
                        sessionId,
                        studentId: record.studentId
                    }
                },
                update: { status: record.status, notes: record.notes },
                create: { 
                    sessionId,
                    studentId: record.studentId,
                    status: record.status,
                    notes: record.notes
                }
            })
        );

        await prisma.$transaction(operations);

        revalidatePath(`/s/${schoolSlug}/extracurricular/attendance`);
        revalidatePath(`/s/${schoolSlug}/extracurricular/attendance/${sessionId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSessionAttendanceAction(schoolSlug: string, sessionId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };
        const schoolId = auth.user.schoolId;

        const session = await prisma.activitySession.findUnique({
            where: { id: sessionId, schoolId },
            include: { 
                activity: { select: { id: true, name: true, category: true } },
                coach: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        if (!session) return { success: false, error: "Session not found" };

        const enrollments = await prisma.activityEnrollment.findMany({
            where: { activityId: session.activityId, status: 'ACTIVE' },
            include: {
                student: { 
                    select: { 
                        id: true, 
                        firstName: true, 
                        lastName: true, 
                        avatar: true,
                        classroom: { select: { name: true } }
                    } 
                }
            }
        });

        const attendance = await prisma.activityAttendance.findMany({
            where: { sessionId }
        });

        const data = enrollments.map(en => {
            const att = attendance.find(a => a.studentId === en.studentId);
            return {
                studentId: en.studentId,
                student: {
                    ...en.student,
                    name: `${en.student.firstName} ${en.student.lastName}`,
                    class: en.student.classroom?.name || "Unassigned"
                },
                status: att?.status || 'PRESENT', 
                notes: att?.notes || ""
            };
        });

        return { 
            success: true, 
            data: JSON.parse(JSON.stringify(data)), 
            session: JSON.parse(JSON.stringify(session)) 
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Stats & Dashboard Actions ---

export async function getExtracurricularStatsAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const schoolId = auth.user.schoolId!;

        const [activePrograms, totalEnrollments, activeClubs, todaySessions] = await Promise.all([
            prisma.activity.count({ where: { schoolId, status: 'ACTIVE' } }),
            prisma.activityEnrollment.count({ where: { schoolId, status: 'ACTIVE' } }),
            prisma.club.count({ where: { schoolId } }),
            prisma.activitySession.count({ 
                where: { 
                    schoolId, 
                    date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                } 
            })
        ]);

        return { 
            success: true, 
            data: {
                activePrograms,
                totalEnrollments,
                activeClubs,
                todaySessions
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Event & Award Actions ---

export async function getActivityEventsAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const events = await prisma.activityEvent.findMany({
            where: { schoolId: auth.user.schoolId },
            orderBy: { date: 'desc' }
        });

        const awards = await prisma.activityAward.findMany({
            where: { schoolId: auth.user.schoolId },
            include: {
                activity: { select: { name: true } },
                student: { select: { firstName: true, lastName: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { 
            success: true, 
            data: { events, awards } 
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createActivityEventAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const event = await prisma.activityEvent.create({
            data: {
                ...data,
                date: new Date(data.date),
                schoolId: auth.user.schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/events`);
        return { success: true, data: JSON.parse(JSON.stringify(event)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createActivityAwardAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const award = await prisma.activityAward.create({
            data: {
                ...data,
                schoolId: auth.user.schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/events`);
        return { success: true, data: JSON.parse(JSON.stringify(award)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Performance Actions ---

export async function getActivityPerformanceAction(schoolSlug: string, activityId?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const performance = await prisma.activityPerformance.findMany({
            where: { 
                schoolId: auth.user.schoolId,
                ...(activityId ? { activityId } : {})
            },
            include: {
                student: { select: { firstName: true, lastName: true, avatar: true, classroom: { select: { name: true } } } },
                activity: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: JSON.parse(JSON.stringify(performance)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createActivityPerformanceAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const perf = await prisma.activityPerformance.create({
            data: {
                ...data,
                schoolId: auth.user.schoolId,
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/performance`);
        return { success: true, data: JSON.parse(JSON.stringify(perf)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Fee Actions ---

export async function getActivityFeesAction(schoolSlug: string, studentId?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const fees = await prisma.activityFee.findMany({
            where: { 
                schoolId: auth.user.schoolId,
                ...(studentId ? { studentId } : {})
            },
            include: {
                activity: { select: { name: true } },
                student: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: JSON.parse(JSON.stringify(fees)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createActivityFeeAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        // 1. Create the ActivityFee record for internal tracking
        const activityFee = await prisma.activityFee.create({
            data: {
                ...data,
                schoolId: auth.user.schoolId
            }
        });

        // 2. Create a generic Fee record to integrate with the main Billing system
        // This ensures it shows up in dashboards, invoices, and can be paid.
        const [student, activity, academicYear] = await Promise.all([
            prisma.student.findUnique({
                where: { id: data.studentId },
                select: { branchId: true }
            }),
            prisma.activity.findUnique({
                where: { id: data.activityId },
                select: { name: true }
            }),
            prisma.academicYear.findFirst({
                where: { schoolId: auth.user.schoolId, isCurrent: true },
                select: { id: true }
            })
        ]);

        await prisma.fee.create({
            data: {
                studentId: data.studentId,
                title: `EXTRACURRICULAR: ${activity?.name || 'Activity Fee'}`,
                amount: data.amount,
                dueDate: new Date(), // Immediate due date or configurable
                status: "PENDING",
                category: "EXTRACURRICULAR",
                description: `Fee for ${activity?.name}. Frequency: ${data.billingFrequency}`,
                branchId: student?.branchId,
                academicYearId: academicYear?.id
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/fees`);
        revalidatePath(`/s/${schoolSlug}/billing`);
        
        return { success: true, data: JSON.parse(JSON.stringify(activityFee)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Equipment Actions ---

export async function getEquipmentAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const equipment = await prisma.activityEquipment.findMany({
            where: { schoolId: auth.user.schoolId },
            orderBy: { name: 'asc' }
        });

        return { success: true, data: JSON.parse(JSON.stringify(equipment)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createEquipmentAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const equipment = await prisma.activityEquipment.create({
            data: {
                ...data,
                quantity: Number(data.quantity) || 0,
                schoolId: auth.user.schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/equipment`);
        return { success: true, data: JSON.parse(JSON.stringify(equipment)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateEquipmentAction(schoolSlug: string, id: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        const equipment = await prisma.activityEquipment.update({
            where: { id, schoolId: auth.user.schoolId },
            data: {
                ...data,
                quantity: Number(data.quantity) || 0
            }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/equipment`);
        return { success: true, data: JSON.parse(JSON.stringify(equipment)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteEquipmentAction(schoolSlug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user || !auth.user.schoolId) return { success: false, error: auth.error || "Unauthorized" };

        await prisma.activityEquipment.delete({
            where: { id, schoolId: auth.user.schoolId }
        });

        revalidatePath(`/s/${schoolSlug}/extracurricular/equipment`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
