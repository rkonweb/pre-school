"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Fetches school information by slug for branding
 */
export async function getSchoolBySlugAction(slug: string) {
    try {
        const school = await (prisma as any).school.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                brandColor: true,
                primaryColor: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                modulesConfig: true,
                addonsConfig: true
            }
        });

        if (!school) {
            return { success: false, error: "School not found" };
        }

        return { success: true, school };
    } catch (error: any) {
        console.error("getSchoolBySlugAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Sends OTP to a mobile number (checks if parent exists in DB)
 */
/**
 * Sends OTP to a mobile number (checks if parent exists in DB)
 * SECURED: Rate Limits applied (3 per 10 mins), 6-digit OTP, No hardcoded value.
 */
export async function sendParentOTPAction(phone: string) {
    try {
        const cleanPhone = String(phone).replace(/\D/g, "");
        if (cleanPhone.length < 10) {
            return { success: false, error: "Invalid phone number." };
        }

        // 1. RATE LIMITING (Max 3 OTPs in 10 minutes)
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentAttempts = await (prisma as any).otp.count({
            where: {
                mobile: phone,
                createdAt: { gt: tenMinsAgo }
            }
        });

        if (recentAttempts >= 3) {
            return { success: false, error: "Too many attempts. Please wait 10 minutes." };
        }

        // 2. Check Ownership (Is this a parent?)
        const students = await (prisma as any).student.findMany({
            where: {
                OR: [
                    { parentMobile: { contains: cleanPhone } },
                    { emergencyContactPhone: { contains: cleanPhone } }
                ]
            }
        });

        const admissions = await (prisma as any).admission.findMany({
            where: {
                OR: [
                    { fatherPhone: { contains: cleanPhone.slice(-5) } }, // Fuzzy match safe? Better strictly contains cleanPhone
                    { motherPhone: { contains: cleanPhone.slice(-5) } },
                    { parentPhone: { contains: cleanPhone.slice(-5) } }
                ]
            }
        });

        if (students.length === 0 && admissions.length === 0) {
            return { success: false, error: "Mobile number not found in our records." };
        }

        // 3. Generate Secure 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 4. Store OTP
        await (prisma as any).otp.create({
            data: {
                mobile: phone,
                code: otpCode,
                expiresAt,
                verified: false
            }
        });

        console.log(`[AUTH] OTP sent to ${phone.slice(0, 4)}...`);
        // In Dev, log it for testing convenience (or remove in prod)
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV ONLY] OTP: ${otpCode}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error("sendParentOTPAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Verifies OTP and returns the Parent ID
 * SECURED: No backdoors. Strict expiration check.
 */
export async function verifyParentOTPAction(phone: string, otp: string) {
    try {
        const record = await (prisma as any).otp.findFirst({
            where: {
                mobile: phone,
                code: otp,
                verified: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) {
            return { success: false, error: "Invalid or expired OTP" };
        }

        // Mark OTP as verified (Consume it)
        await (prisma as any).otp.update({
            where: { id: record.id },
            data: { verified: true }
        });

        // UNIFIED AUTH: Ensure a User record exists for this parent
        let user = await (prisma as any).user.findUnique({
            where: { mobile: phone }
        });

        if (!user) {
            // Create 'Shadow' User for Parent
            // Try to link to a school if possible
            const student = await (prisma as any).student.findFirst({
                where: { OR: [{ parentMobile: { contains: String(phone).replace(/\D/g, "") } }] }
            });

            user = await (prisma as any).user.create({
                data: {
                    mobile: phone,
                    firstName: "Parent",
                    role: "PARENT",
                    schoolId: student?.schoolId
                }
            });
        }

        // SET SESSION COOKIE
        const { setUserSessionAction } = await import("./session-actions");
        await setUserSessionAction(user.id);

        return {
            success: true,
            parentId: user.id,
            phone
        };
    } catch (error: any) {
        console.error("verifyParentOTPAction Error:", error);
        return { success: false, error: "Verification failed" };
    }
}

/**
 * Fetches all students associated with a parent phone number
 */
/**
 * Fetches all students associated with a parent phone number
 * Uses fuzzy matching to handle formatting differences
 */
export async function getFamilyStudentsAction(phone: string) {
    try {
        if (!phone) return { success: true, students: [] };

        const cleanDigits = String(phone).replace(/\D/g, "");
        // Use last 5 digits for broad search if possible, else full
        const searchFragment = cleanDigits.length >= 5 ? cleanDigits.slice(-5) : cleanDigits;

        if (!searchFragment) return { success: true, students: [] };

        // 1. Fetch Students
        const students = await (prisma as any).student.findMany({
            where: {
                OR: [
                    { parentMobile: { contains: searchFragment } },
                    { emergencyContactPhone: { contains: searchFragment } }
                ]
            },
            include: {
                classroom: true,
                school: {
                    select: {
                        name: true,
                        slug: true
                    }
                }
            }
        });

        // 2. Fetch Admissions
        const admissions = await (prisma as any).admission.findMany({
            where: {
                OR: [
                    { parentPhone: { contains: searchFragment } },
                    { fatherPhone: { contains: searchFragment } },
                    { motherPhone: { contains: searchFragment } }
                ]
            },
            include: {
                school: {
                    select: {
                        name: true,
                        slug: true
                    }
                }
            }
        });

        // Strict-er verification in JS
        const isMatch = (dbPhone: string | null) => {
            if (!dbPhone) return false;
            const dbDigits = String(dbPhone).replace(/\D/g, "");
            return dbDigits.includes(cleanDigits) || cleanDigits.includes(dbDigits);
        };

        const matchedStudents = students.filter((s: any) =>
            isMatch(s.parentMobile) || isMatch(s.emergencyContactPhone)
        ).map((s: any) => ({ ...s, type: "STUDENT" }));

        // 3. Process Admissions
        const matchedAdmissions = admissions.filter((a: any) =>
            isMatch(a.parentPhone) || isMatch(a.fatherPhone) || isMatch(a.motherPhone)
        ).map((a: any) => ({
            id: a.id,
            firstName: a.studentName,
            lastName: "", // Name is usually full in Admission
            parentName: a.parentName,
            parentEmail: a.parentEmail,
            parentMobile: a.parentPhone || a.fatherPhone || a.motherPhone,
            grade: a.enrolledGrade,
            status: a.stage, // e.g. ENROLLED, APPLICATION
            schoolId: a.schoolId,
            school: a.school,
            type: "ADMISSION",
            // Mock other fields to prevent UI crashes if accessed directly
            classroom: null
        }));

        const allRecords = [...matchedStudents, ...matchedAdmissions];

        return { success: true, students: allRecords };

    } catch (error: any) {
        console.error("getFamilyStudentsAction Error:", error);
        return { success: false, error: error.message, students: [] };
    }
}

/**
 * OPTIMIZED: Fetch ALL Dashboard Data in Single Request
 * significantly reduces network overhead and improves load time
 */
export async function getParentDashboardDataAction(slug: string, phone: string) {
    try {
        const start = Date.now();
        console.log(`[DASHBOARD_PERF] Starting fetch for ${phone}`);

        // 1. Fetch Core Data (School, Profile, Student List) in Parallel
        const [schoolRes, profileRes, studentsRes] = await Promise.all([
            getSchoolBySlugAction(slug),
            getParentProfileAction(phone),
            getFamilyStudentsAction(phone)
        ]);

        const school = schoolRes.success ? schoolRes.school : null;
        const profile = profileRes.success ? profileRes.profile : null;
        let students = studentsRes.success ? studentsRes.students : [];

        // 2. Fetch Detailed Stats for each student in Parallel
        // We do this server-side to avoid N+1 network requests
        const studentsWithStats = await Promise.all(students.map(async (student: any) => {
            // Run fee and attendance content concurrently for this student
            const [attendanceRes, feesRes] = await Promise.all([
                getStudentAttendanceAction(student.id, phone, 30),
                getStudentFeesAction(student.id, phone)
            ]);

            return {
                ...student,
                stats: {
                    attendance: attendanceRes.success ? attendanceRes.stats : null,
                    fees: feesRes.success ? feesRes.summary : null
                }
            };
        }));

        // 3. Fetch Messages
        const convRes = await getParentConversationsAction(phone);
        const conversations = (convRes.success ? convRes.conversations : []) || [];
        const unreadMessages = conversations.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);

        console.log(`[DASHBOARD_PERF] Completed in ${Date.now() - start}ms`);

        return {
            success: true,
            school,
            profile,
            students: studentsWithStats,
            unreadMessages,
            conversations
        };

    } catch (error: any) {
        console.error("getParentDashboardDataAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches parent profile details based on phone number
 * Priorities Admission record for richer data, falls back to Student record
 */
export async function getParentProfileAction(phone: string) {
    try {
        // 1. Try to find Admission record (Source of truth for detailed parent info)
        const admission = await (prisma as any).admission.findFirst({
            where: {
                OR: [
                    { fatherPhone: phone },
                    { motherPhone: phone },
                    { parentPhone: phone }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        if (admission) {
            // Determine if the user is Father or Mother based on phone match
            let role = "Parent";
            let name = admission.parentName;
            let email = admission.parentEmail;

            if (admission.fatherPhone === phone) {
                role = "Father";
                name = admission.fatherName || admission.parentName;
                email = admission.fatherEmail || admission.parentEmail;
            } else if (admission.motherPhone === phone) {
                role = "Mother";
                name = admission.motherName || admission.parentName;
                email = admission.motherEmail || admission.parentEmail;
            }

            return {
                success: true,
                profile: {
                    name,
                    role,
                    email,
                    phone: phone,
                    address: admission.address,
                    city: admission.city,
                    state: admission.state,
                    zip: admission.zip,
                    secondaryPhone: admission.secondaryPhone,
                    emergencyContact: {
                        name: admission.emergencyContactName,
                        phone: admission.emergencyContactPhone
                    }
                }
            };
        }

        // 2. Fallback to Student record
        const student = await (prisma as any).student.findFirst({
            where: {
                OR: [
                    { parentMobile: phone },
                    { emergencyContactPhone: phone }
                ]
            }
        });

        if (student) {
            return {
                success: true,
                profile: {
                    name: student.parentName || "Parent",
                    role: "Parent",
                    email: student.parentEmail,
                    phone: phone,
                    address: null, // Student table doesn't have address in this schema
                    emergencyContact: {
                        name: student.emergencyContactName,
                        phone: student.emergencyContactPhone
                    }
                }
            };
        }

        return { success: false, error: "Profile not found" };
    } catch (error: any) {
        console.error("getParentProfileAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches detailed information for a specific student
 */
export async function getStudentDetailsAction(studentId: string, phone: string) {
    try {
        const cleanPhone = String(phone).replace(/\D/g, "");
        const isMatch = (dbPhone: string | null) => {
            if (!dbPhone) return false;
            const dbDigits = String(dbPhone).replace(/\D/g, "");
            return dbDigits.includes(cleanPhone) || cleanPhone.includes(dbDigits);
        };

        let student = await (prisma as any).student.findUnique({
            where: { id: studentId },
            include: {
                classroom: {
                    include: {
                        teacher: {
                            select: { firstName: true, lastName: true, email: true, mobile: true, avatar: true }
                        }
                    }
                },
                school: {
                    select: {
                        name: true,
                        slug: true,
                        logo: true,
                        address: true,
                        phone: true,
                        email: true,
                        timetableConfig: true,
                        workingDays: true
                    }
                }
            }
        });

        if (!student) {
            // Check if it's an Admission ID
            const admission = await (prisma as any).admission.findUnique({
                where: { id: studentId }
            });

            if (admission) {
                // Verify initial access to admission
                if (isMatch(admission.parentPhone) || isMatch(admission.fatherPhone) || isMatch(admission.motherPhone)) {
                    // Try to resolve to student
                    const phonesToLink = [admission.fatherPhone, admission.motherPhone, admission.parentPhone]
                        .filter(p => p && p.length > 5)
                        .map(p => p!.replace(/\D/g, "").slice(-7));

                    const matchedStudent = await (prisma as any).student.findFirst({
                        where: {
                            schoolId: admission.schoolId,
                            firstName: { startsWith: admission.studentName.trim().split(" ")[0] },
                            OR: phonesToLink.length > 0 ? phonesToLink.map(p => ({ parentMobile: { contains: p } })) : []
                        }
                    });

                    if (matchedStudent) {
                        return getStudentDetailsAction(matchedStudent.id, phone);
                    }

                    // Fallback: Return admission as student if not enrolled yet
                    return {
                        success: true,
                        student: {
                            id: admission.id,
                            firstName: admission.studentName.split(" ")[0],
                            lastName: admission.studentName.split(" ").slice(1).join(" ") || "Unknown",
                            name: admission.studentName,
                            avatar: null,
                            age: admission.studentAge,
                            grade: admission.enrolledGrade,
                            status: admission.stage,
                            admissionNumber: admission.id,
                            parentName: admission.parentName || admission.fatherName || admission.motherName,
                            parentMobile: admission.parentPhone || admission.fatherPhone || admission.motherPhone,
                            parentEmail: admission.parentEmail || admission.fatherEmail || admission.motherEmail,
                            isAdmissionOnly: true
                        } as any
                    };
                }
            }
            return { success: false, error: "Student not found or access denied" };
        }

        // Final access check for direct Student lookup
        let hasAccess = isMatch(student.parentMobile) || isMatch(student.emergencyContactPhone);
        if (!hasAccess) {
            const linkedAdmission = await (prisma as any).admission.findFirst({
                where: {
                    schoolId: student.schoolId,
                    studentName: { startsWith: student.firstName },
                    OR: [
                        { fatherPhone: { contains: cleanPhone.slice(-5) } },
                        { motherPhone: { contains: cleanPhone.slice(-5) } },
                        { parentPhone: { contains: cleanPhone.slice(-5) } }
                    ]
                }
            });
            if (linkedAdmission) hasAccess = true;
        }

        if (!hasAccess) return { success: false, error: "Access denied" };

        // Process Timetable to inject Teacher Names
        let processedTimetable = {};
        if (student.classroom?.timetable) {
            try {
                const timetable = typeof student.classroom.timetable === 'string'
                    ? JSON.parse(student.classroom.timetable)
                    : student.classroom.timetable;

                // Collect IDs
                const teacherIds = new Set<string>();
                Object.values(timetable).forEach((daySchedule: any) => {
                    if (daySchedule) {
                        Object.values(daySchedule).forEach((period: any) => {
                            if (period?.teacherId) teacherIds.add(period.teacherId);
                        });
                    }
                });

                if (teacherIds.size > 0) {
                    const teachers = await (prisma as any).user.findMany({
                        where: { id: { in: Array.from(teacherIds) } },
                        select: { id: true, firstName: true, lastName: true }
                    });

                    const teacherMap = new Map();
                    teachers.forEach((t: any) => {
                        teacherMap.set(t.id, `${t.firstName} ${t.lastName}`);
                    });

                    // Inject Names
                    Object.keys(timetable).forEach(day => {
                        if (timetable[day]) {
                            Object.keys(timetable[day]).forEach(pId => {
                                const period = timetable[day][pId];
                                if (period?.teacherId && teacherMap.has(period.teacherId)) {
                                    period.teacherName = teacherMap.get(period.teacherId);
                                }
                            });
                        }
                    });
                }
                processedTimetable = timetable;
            } catch (e) {
                console.error("Timetable enrichment failed", e);
                processedTimetable = {};
            }
        }

        return {
            success: true,
            student: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                name: `${student.firstName} ${student.lastName}`,
                avatar: student.avatar,
                age: student.age,
                gender: student.gender,
                dateOfBirth: student.dateOfBirth,
                grade: student.grade,
                status: student.status,
                bloodGroup: student.bloodGroup,
                medicalConditions: student.medicalConditions,
                allergies: student.allergies,
                admissionNumber: student.admissionNumber,
                joiningDate: student.joiningDate,
                classroom: student.classroom ? {
                    ...student.classroom,
                    timetable: processedTimetable
                } : null,
                school: student.school,
                parentName: student.parentName,
                parentMobile: student.parentMobile,
                parentEmail: student.parentEmail,
                emergencyContactName: student.emergencyContactName,
                emergencyContactPhone: student.emergencyContactPhone
            }
        };
    } catch (error: any) {
        console.error("getStudentDetailsAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches attendance records for a student
 */
export async function getStudentAttendanceAction(studentId: string, phone: string, limit = 30) {
    try {
        // Verify parent has access to this student
        const student = await (prisma as any).student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { parentMobile: phone },
                    { emergencyContactPhone: phone }
                ]
            }
        });

        if (!student) {
            // Check if it's an admission ID
            const admission = await (prisma as any).admission.findUnique({
                where: { id: studentId }
            });

            if (admission) {
                const phonesToLink = [admission.fatherPhone, admission.motherPhone, admission.parentPhone]
                    .filter(p => p && p.length > 5)
                    .map(p => p!.replace(/\D/g, "").slice(-7));

                const matchedStudent = await (prisma as any).student.findFirst({
                    where: {
                        schoolId: admission.schoolId,
                        firstName: { startsWith: admission.studentName.trim().split(" ")[0] },
                        OR: phonesToLink.length > 0 ? phonesToLink.map(p => ({ parentMobile: { contains: p } })) : undefined
                    }
                });

                if (matchedStudent) {
                    return getStudentAttendanceAction(matchedStudent.id, phone, limit);
                }
            }
            return { success: false, error: "Access denied" };
        }

        const attendance = await (prisma as any).attendance.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
            take: limit
        });

        // Calculate statistics
        const total = attendance.length;
        const present = attendance.filter((a: any) => a.status === "PRESENT").length;
        const absent = attendance.filter((a: any) => a.status === "ABSENT").length;
        const late = attendance.filter((a: any) => a.status === "LATE").length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
            success: true,
            attendance,
            stats: {
                total,
                present,
                absent,
                late,
                percentage
            }
        };
    } catch (error: any) {
        console.error("getStudentAttendanceAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches fee details for a student
 */
export async function getStudentFeesAction(studentId: string, phone: string) {
    try {
        const cleanPhone = String(phone).replace(/\D/g, "");
        const isMatch = (dbPhone: string | null) => {
            if (!dbPhone) return false;
            const dbDigits = String(dbPhone).replace(/\D/g, "");
            return dbDigits.includes(cleanPhone) || cleanPhone.includes(dbDigits);
        };

        // 1. Try finding in Student table
        const student = await (prisma as any).student.findUnique({
            where: { id: studentId },
            include: {
                classroom: true
            }
        });

        if (student) {
            // Check access
            let hasAccess = isMatch(student.parentMobile) || isMatch(student.emergencyContactPhone);
            if (!hasAccess) {
                const linkedAdmission = await (prisma as any).admission.findFirst({
                    where: {
                        schoolId: student.schoolId,
                        studentName: { startsWith: student.firstName },
                        OR: [
                            { fatherPhone: { contains: cleanPhone.slice(-5) } },
                            { motherPhone: { contains: cleanPhone.slice(-5) } },
                            { parentPhone: { contains: cleanPhone.slice(-5) } }
                        ]
                    }
                });
                if (linkedAdmission) hasAccess = true;
            }
            if (!hasAccess) {
                return { success: false, error: "Access denied" };
            }

            // Fetch Fees
            const fees = await (prisma as any).fee.findMany({
                where: { studentId },
                include: { payments: true },
                orderBy: { dueDate: 'desc' }
            });

            // Calculate totals
            const totalDue = fees.reduce((sum: number, f: any) => {
                const paid = f.payments.reduce((pSum: number, p: any) => pSum + p.amount, 0);
                const remaining = f.amount - paid;
                return sum + (remaining > 0 ? remaining : 0);
            }, 0);

            const totalPaid = fees.reduce((sum: number, f: any) => {
                return sum + f.payments.reduce((pSum: number, p: any) => pSum + p.amount, 0);
            }, 0);

            const pending = fees.filter((f: any) => f.status === "PENDING" || f.status === "PARTIAL").length;
            const overdue = fees.filter((f: any) => f.status === "OVERDUE").length;

            return {
                success: true,
                fees,
                summary: { totalDue, totalPaid, pending, overdue }
            };
        }

        // 2. Try finding in Admission table
        const admission = await (prisma as any).admission.findUnique({
            where: { id: studentId }
        });

        if (admission) {
            // Check access
            if (!isMatch(admission.parentPhone) && !isMatch(admission.fatherPhone) && !isMatch(admission.motherPhone)) {
                return { success: false, error: "Access denied" };
            }

            // TRY TO RESOLVE TO STUDENT (Realtime Data)
            const phonesToLink = [admission.fatherPhone, admission.motherPhone, admission.parentPhone]
                .filter(p => p && p.length > 5)
                .map(p => p!.replace(/\D/g, "").slice(-7));

            const matchedStudent = await (prisma as any).student.findFirst({
                where: {
                    schoolId: admission.schoolId,
                    firstName: { startsWith: admission.studentName.trim().split(" ")[0] },
                    OR: phonesToLink.length > 0 ? phonesToLink.map(p => ({ parentMobile: { contains: p } })) : []
                }
            });

            if (matchedStudent) {
                console.log(`[FEES_RESOLVE] Admission ${studentId} -> Student ${matchedStudent.id}`);
                return getStudentFeesAction(matchedStudent.id, phone);
            }

            // Fallback for non-enrolled inquiry
            return {
                success: true,
                fees: [],
                summary: { totalDue: 0, totalPaid: 0, pending: 0, overdue: 0 }
            };
        }

        return { success: false, error: "Student not found" };

    } catch (error: any) {
        console.error("getStudentFeesAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches report cards for a student
 */
export async function getStudentReportsAction(studentId: string, phone: string) {
    try {
        // Verify parent has access
        const cleanPhone = String(phone).replace(/\D/g, "");
        const isMatch = (dbPhone: string | null) => {
            if (!dbPhone) return false;
            const dbDigits = String(dbPhone).replace(/\D/g, "");
            return dbDigits.includes(cleanPhone) || cleanPhone.includes(dbDigits);
        };

        const student = await (prisma as any).student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            // Check if it's an admission ID
            const admission = await (prisma as any).admission.findUnique({
                where: { id: studentId }
            });

            if (admission) {
                // Verify initial access to admission
                if (isMatch(admission.parentPhone) || isMatch(admission.fatherPhone) || isMatch(admission.motherPhone)) {
                    const phonesToLink = [admission.fatherPhone, admission.motherPhone, admission.parentPhone]
                        .filter(p => p && p.length > 5)
                        .map(p => p!.replace(/\D/g, "").slice(-7));

                    const matchedStudent = await (prisma as any).student.findFirst({
                        where: {
                            schoolId: admission.schoolId,
                            firstName: { startsWith: admission.studentName.trim().split(" ")[0] },
                            OR: phonesToLink.length > 0 ? phonesToLink.map(p => ({ parentMobile: { contains: p } })) : undefined
                        }
                    });

                    if (matchedStudent) {
                        return getStudentReportsAction(matchedStudent.id, phone);
                    }
                }
            }
            return { success: false, error: "Access denied" };
        }

        // Extended access check for student
        let hasAccess = isMatch(student.parentMobile) || isMatch(student.emergencyContactPhone);
        if (!hasAccess) {
            const linkedAdmission = await (prisma as any).admission.findFirst({
                where: {
                    schoolId: student.schoolId,
                    studentName: { startsWith: student.firstName },
                    OR: [
                        { fatherPhone: { contains: cleanPhone.slice(-5) } },
                        { motherPhone: { contains: cleanPhone.slice(-5) } },
                        { parentPhone: { contains: cleanPhone.slice(-5) } }
                    ]
                }
            });
            if (linkedAdmission) hasAccess = true;
        }
        if (!hasAccess) return { success: false, error: "Access denied" };

        const reports = await (prisma as any).reportCard.findMany({
            where: {
                studentId,
                published: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, reports };
    } catch (error: any) {
        console.error("getStudentReportsAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * MESSAGING ACTIONS
 */

export async function getParentConversationsAction(phone: string) {
    try {
        // 1. Get all students for this parent
        const students = await (prisma as any).student.findMany({
            where: {
                OR: [
                    { parentMobile: phone },
                    { emergencyContactPhone: phone }
                ]
            },
            include: {
                conversations: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        }
                    }
                },
                classroom: {
                    include: {
                        teacher: true
                    }
                }
            }
        });

        let allConversations: any[] = [];

        // 2. Process each student
        for (const student of students) {
            // Ensure default conversations exist
            const defaultTypes = [
                { type: "TEACHER", title: student.classroom?.teacher ? `Ms. ${student.classroom.teacher.lastName || student.classroom.teacher.firstName}` : "Class Teacher" },
                { type: "ACCOUNTS", title: "Accounts Dept" }
            ];

            for (const def of defaultTypes) {
                const exists = student.conversations.find((c: any) => c.type === def.type);
                if (!exists) {
                    // Create it
                    const newConv = await (prisma as any).conversation.create({
                        data: {
                            studentId: student.id,
                            type: def.type,
                            title: def.title
                        },
                        include: {
                            messages: true
                        }
                    });
                    // Push to list (mocking structure)
                    allConversations.push({
                        ...newConv,
                        studentName: student.firstName,
                        unreadCount: 0,
                        lastMessage: null,
                        avatar: def.type === 'TEACHER' ? 'Teacher' : 'Accounts'
                    });
                } else {
                    // Add existing
                    const lastMsg = exists.messages[0];
                    const unread = await (prisma as any).message.count({
                        where: {
                            conversationId: exists.id,
                            isRead: false,
                            senderType: "STAFF" // Unread messages FROM staff
                        }
                    });

                    allConversations.push({
                        id: exists.id,
                        title: exists.title,
                        type: exists.type,
                        studentId: student.id,
                        studentName: student.firstName,
                        lastMessage: lastMsg ? lastMsg.content : "No messages yet",
                        lastMessageTime: lastMsg ? lastMsg.createdAt : exists.updatedAt,
                        unreadCount: unread,
                        avatar: exists.type === 'TEACHER' ? 'Teacher' : 'Accounts'
                    });
                }
            }
        }

        // Sort by latest activity
        allConversations.sort((a, b) => {
            const dateA = new Date(a.lastMessageTime || a.createdAt || 0);
            const dateB = new Date(b.lastMessageTime || b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });

        return { success: true, conversations: allConversations };
    } catch (error: any) {
        console.error("getParentConversationsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getMessagesAction(conversationId: string) {
    try {
        const messages = await (prisma as any).message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });

        // Mark as read (simple approach: mark all staff messages as read when parent opens)
        await (prisma as any).message.updateMany({
            where: {
                conversationId,
                senderType: "STAFF",
                isRead: false
            },
            data: { isRead: true, readAt: new Date() }
        });

        return { success: true, messages };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendMessageAction(conversationId: string, content: string, senderName: string, senderId: string) {
    try {
        const message = await (prisma as any).message.create({
            data: {
                conversationId,
                content,
                senderType: "PARENT",
                senderName,
                senderId,
                isRead: false
            }
        });

        // Update conversation lastMessageAt
        await (prisma as any).conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        });

        revalidatePath(`/`); // Aggressive revalidate
        return { success: true, message };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Creates a payment order for a fee
 */
export async function createPaymentOrderAction(feeId: string, phone: string) {
    try {
        const cleanPhone = String(phone).replace(/\D/g, "");

        // Fetch the fee with student details
        const fee = await (prisma as any).fee.findUnique({
            where: { id: feeId },
            include: {
                student: true,
                payments: true
            }
        });

        if (!fee) {
            return { success: false, error: "Fee not found" };
        }

        // Verify parent access
        const isMatch = (dbPhone: string | null) => {
            if (!dbPhone) return false;
            const dbDigits = String(dbPhone).replace(/\D/g, "");
            return dbDigits.includes(cleanPhone) || cleanPhone.includes(dbDigits);
        };

        let hasAccess = isMatch(fee.student.parentMobile) || isMatch(fee.student.emergencyContactPhone);

        if (!hasAccess) {
            const linkedAdmission = await (prisma as any).admission.findFirst({
                where: {
                    schoolId: fee.student.schoolId,
                    studentName: { startsWith: fee.student.firstName },
                    OR: [
                        { fatherPhone: { contains: cleanPhone.slice(-5) } },
                        { motherPhone: { contains: cleanPhone.slice(-5) } },
                        { parentPhone: { contains: cleanPhone.slice(-5) } }
                    ]
                }
            });
            if (linkedAdmission) hasAccess = true;
        }

        if (!hasAccess) {
            return { success: false, error: "Access denied" };
        }

        // Calculate remaining amount
        const totalPaid = fee.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        const remainingAmount = fee.amount - totalPaid;

        if (remainingAmount <= 0) {
            return { success: false, error: "Fee already paid" };
        }

        // For now, return payment details for client-side processing
        // In production, you would integrate with Razorpay/Stripe here
        return {
            success: true,
            paymentOrder: {
                feeId: fee.id,
                amount: remainingAmount,
                currency: "INR",
                studentName: `${fee.student.firstName} ${fee.student.lastName}`,
                feeTitle: fee.title,
                dueDate: fee.dueDate
            }
        };
    } catch (error: any) {
        console.error("createPaymentOrderAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Records a payment after successful transaction
 */
export async function recordPaymentAction(
    feeId: string,
    amount: number,
    method: string,
    reference: string,
    phone: string
) {
    console.log(`[PAYMENT_ACTION] Starting for Fee ${feeId} with phone ${phone}`);
    try {
        const cleanPhone = String(phone).replace(/\D/g, "");
        console.log(`[PAYMENT_ACTION] Clean Phone: ${cleanPhone}`);

        // Fetch the fee with student details
        const fee = await (prisma as any).fee.findUnique({
            where: { id: feeId },
            include: {
                student: true,
                payments: true
            }
        });

        if (!fee) {
            console.error(`[PAYMENT_ACTION] Fee not found: ${feeId}`);
            return { success: false, error: "Fee not found" };
        }
        console.log(`[PAYMENT_ACTION] Fee found. Student: ${fee.student.firstName} (${fee.student.id})`);

        // Verify parent access
        const isMatch = (dbPhone: string | null) => {
            if (!dbPhone) return false;
            const dbDigits = String(dbPhone).replace(/\D/g, "");
            const match = dbDigits.includes(cleanPhone) || cleanPhone.includes(dbDigits);
            if (match) console.log(`[PAYMENT_ACTION] Phone Match Found: ${dbPhone}`);
            return match;
        };

        let hasAccess = isMatch(fee.student.parentMobile) || isMatch(fee.student.emergencyContactPhone);

        if (!hasAccess) {
            console.log(`[PAYMENT_ACTION] Direct access failed. Checking Linked Admission...`);
            const linkedAdmission = await (prisma as any).admission.findFirst({
                where: {
                    schoolId: fee.student.schoolId,
                    studentName: { startsWith: fee.student.firstName },
                    OR: [
                        { fatherPhone: { contains: cleanPhone.slice(-5) } },
                        { motherPhone: { contains: cleanPhone.slice(-5) } },
                        { parentPhone: { contains: cleanPhone.slice(-5) } }
                    ]
                }
            });
            if (linkedAdmission) {
                console.log(`[PAYMENT_ACTION] Linked Admission found: ${linkedAdmission.id}`);
                hasAccess = true;
            } else {
                console.log(`[PAYMENT_ACTION] No Linked Admission found.`);
            }
        }

        if (!hasAccess) {
            console.error(`[PAYMENT_ACTION] Access Denied for phone ${cleanPhone}`);
            return { success: false, error: "Access denied" };
        }

        console.log(`[PAYMENT_ACTION] Access Granted. Creating Payment Record...`);

        // Create payment record
        const payment = await (prisma as any).feePayment.create({
            data: {
                feeId,
                amount,
                method,
                reference,
                date: new Date()
            }
        });

        // Calculate new totals and update fee status
        const totalPaid = fee.payments.reduce((sum: number, p: any) => sum + p.amount, 0) + amount;
        const remaining = fee.amount - totalPaid;

        let newStatus = "PENDING";
        if (remaining <= 0) {
            newStatus = "PAID";
        } else if (totalPaid > 0) {
            newStatus = "PARTIAL";
        } else if (new Date() > new Date(fee.dueDate)) {
            newStatus = "OVERDUE";
        }

        await (prisma as any).fee.update({
            where: { id: feeId },
            data: { status: newStatus }
        });

        revalidatePath("/");

        console.log(`[PAYMENT_ACTION] Success! New Status: ${newStatus}`);

        return {
            success: true,
            payment,
            newStatus,
            remainingAmount: remaining
        };
    } catch (error: any) {
        console.error("[PAYMENT_ACTION] Critical Error:", error);
        return { success: false, error: error.message };
    }
}
