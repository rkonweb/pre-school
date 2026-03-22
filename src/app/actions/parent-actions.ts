"use server";

import { prisma } from "@/lib/prisma";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { resolveSchoolAIModel } from "@/lib/school-integrations";

/**
 * Gets all students belonging to a family based on a parent phone number.
 * Searches both Student and Admission records for matching phone numbers.
 *
 * Overload 1 (school-scoped): getFamilyStudentsAction(schoolSlug, parentPhone)
 * Overload 2 (global / mobile API): getFamilyStudentsAction(parentPhone)
 */
export async function getFamilyStudentsAction(
    slugOrPhone: string,
    parentPhone?: string
) {
    try {
        // Determine if we have a school-scoped call or a global one
        const isScoped = parentPhone !== undefined;
        const phone = isScoped ? parentPhone : slugOrPhone;
        const schoolSlug = isScoped ? slugOrPhone : undefined;

        if (!phone) {
            return { success: false, error: "Parent phone is required", students: [] };
        }

        const cleanPhone = phone.replace(/\D/g, "").slice(-10);
        if (!cleanPhone) {
            return { success: false, error: "Invalid phone number", students: [] };
        }

        // Build school scope condition
        const schoolWhere = schoolSlug ? { school: { slug: schoolSlug } } : {};

        // Search Student records
        const students = await prisma.student.findMany({
            where: {
                ...schoolWhere,
                OR: [
                    { parentMobile: { contains: cleanPhone } },
                    { fatherPhone: { contains: cleanPhone } },
                    { motherPhone: { contains: cleanPhone } },
                    { emergencyContactPhone: { contains: cleanPhone } },
                ],
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
                avatar: true,
                status: true,
                classroom: {
                    select: { id: true, name: true },
                },
                school: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });

        // Search Admission records (for students pending enrolment)
        const admissions = await prisma.admission.findMany({
            where: {
                ...(schoolSlug ? { school: { slug: schoolSlug } } : {}),
                OR: [
                    { fatherPhone: { contains: cleanPhone } },
                    { motherPhone: { contains: cleanPhone } },
                    { parentPhone: { contains: cleanPhone } },
                ],
            },
            select: {
                id: true,
                studentName: true,
                school: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });

        const studentResults = students.map((s) => ({
            id: s.id,
            type: "STUDENT" as const,
            firstName: s.firstName,
            lastName: s.lastName,
            name: `${s.firstName} ${s.lastName}`,
            admissionNumber: s.admissionNumber || "",
            avatar: s.avatar ? (s.avatar.startsWith('/') ? `http://localhost:3000${s.avatar}` : s.avatar) : "",
            status: s.status,
            classroom: s.classroom?.name || "Unassigned",
            classroomId: s.classroom?.id,
            schoolId: s.school?.id,
            schoolName: s.school?.name,
            schoolSlug: s.school?.slug,
        }));

        const admissionResults = admissions.map((a) => {
            const parts = a.studentName.split(" ");
            const fName = parts[0];
            const lName = parts.slice(1).join(" ");
            return {
                id: a.id,
                type: "ADMISSION" as const,
                firstName: fName,
                lastName: lName,
                name: a.studentName.trim(),
                admissionNumber: "",
                avatar: "",
                status: "PENDING",
                classroom: "Pending Admission",
                classroomId: undefined,
                schoolId: a.school?.id,
                schoolName: a.school?.name,
                schoolSlug: a.school?.slug,
            };
        });

        return {
            success: true,
            students: JSON.parse(JSON.stringify([...studentResults, ...admissionResults])),
        };
    } catch (error: any) {
        console.error("getFamilyStudentsAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch family data", students: [] };
    }
}

export async function getStudentActivityFeedAction(studentId: string, phone: string, limit: number = 50) {
    try {
        // Verify parent has access to this student
        const familyResult = await getFamilyStudentsAction(phone);
        if (!familyResult.success || !familyResult.students) {
            return { success: false, error: "Unauthorized access to student", feed: [] };
        }

        const hasAccess = familyResult.students.some((s: any) => s.id === studentId);
        if (!hasAccess) {
            return { success: false, error: "Unauthorized access to student", feed: [] };
        }

        // Fetch Student Context (for Classroom ID)
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classroomId: true, schoolId: true }
        });

        if (!student) return { success: false, error: "Student not found", feed: [] };

        const feed: any[] = [];

        // 1. Fetch Attendance (Last 30 days)
        const attendance = await prisma.attendance.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
            take: limit
        });

        for (const attr of attendance) {
            feed.push({
                id: `att-${attr.id}`,
                timestamp: attr.createdAt.toISOString(),
                type: 'ATTENDANCE',
                title: `Attendance Marked: ${attr.status}`,
                description: attr.notes || 'School attendance recorded.',
                icon: 'event_available'
            });
        }

        // 2. Fetch Transport Logs
        const transport = await prisma.transportBoardingLog.findMany({
            where: { studentId },
            orderBy: { timestamp: 'desc' },
            take: limit
        });

        for (const tr of transport) {
            feed.push({
                id: `tr-${tr.id}`,
                timestamp: tr.timestamp.toISOString(),
                type: 'TRANSPORT',
                title: `${tr.type === "PICKUP" ? "Morning Pickup" : "Evening Drop"}: ${tr.status}`,
                description: tr.notes || `Student ${tr.status.toLowerCase()} the bus.`,
                icon: 'directions_bus'
            });
        }

        // 3. Fetch Diary Entries (Published for this Classroom)
        if (student.classroomId) {
            const diary = await prisma.diaryEntry.findMany({
                where: {
                    classroomId: student.classroomId,
                    status: 'PUBLISHED'
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            });

            for (const d of diary) {
                feed.push({
                    id: `diary-${d.id}`,
                    timestamp: d.createdAt.toISOString(),
                    type: 'DIARY',
                    title: d.title,
                    description: d.content,
                    icon: 'auto_stories'
                });
            }
        }

        // Sort combined feed by timestamp (descending)
        feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return { success: true, feed: JSON.parse(JSON.stringify(feed.slice(0, limit))) };
    } catch (error: any) {
        console.error("getStudentActivityFeedAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch activity feed", feed: [] };
    }
}

export async function updateMessageReceiptAction(conversationId: string, messageIds: string[], status: string) {
    try {
        if (!conversationId || !messageIds.length) return { success: false };

        await prisma.message.updateMany({
            where: {
                id: { in: messageIds },
                conversationId: conversationId,
                senderType: { not: 'PARENT' } // Only mark incoming messages as read
            },
            data: {
                isRead: status === 'READ'
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("updateMessageReceiptAction Error:", error);
        return { success: false, error: error.message || "Failed to update message receipt" };
    }
}

export async function getStudentTransportAction(studentId: string, phone: string) {
    try {
        // Security Check & Data Fetch
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { parentMobile: { contains: phone } },
                    { fatherPhone: { contains: phone } },
                    { motherPhone: { contains: phone } }
                ]
            },
            include: {
                transportProfile: {
                    include: {
                        route: true,
                        pickupStop: true,
                        dropStop: true
                    }
                }
            }
        });

        if (!student) {
            return { success: false, error: "Unauthorized access to student" };
        }

        const profile = (student as any).transportProfile;
        if (!profile || profile.status !== 'ACTIVE') {
            return { success: true, isActive: false, message: "Transport not active for this student" };
        }

        // Determine Trip Type
        const hour = new Date().getHours();
        const tripType = hour < 12 ? "PICKUP" : "DROP";
        const vehicleId = tripType === "PICKUP" ? profile.route?.pickupVehicleId : profile.route?.dropVehicleId;

        if (!vehicleId) {
            return { success: true, isActive: false, message: "No vehicle assigned for current trip" };
        }

        // Fetch vehicle, driver, and latest telemetry
        const [vehicle, driver, telemetry] = await Promise.all([
            prisma.transportVehicle.findUnique({ where: { id: vehicleId } }),
            profile.route?.driverId ? prisma.transportDriver.findUnique({ where: { id: profile.route.driverId } }) : Promise.resolve(null),
            prisma.vehicleTelemetry.findFirst({
                where: { vehicleId },
                orderBy: { recordedAt: 'desc' }
            })
        ]);

        return JSON.parse(JSON.stringify({
            success: true,
            isActive: true,
            tripType,
            route: profile.route ? { id: profile.route.id, name: profile.route.name } : null,
            vehicle: vehicle ? { registrationNumber: vehicle.registrationNumber, capacity: vehicle.capacity } : null,
            driver: driver ? { name: driver.name, phone: driver.phone } : null,
            studentStops: {
                pickup: profile.pickupStop ? {
                    name: profile.pickupStop.name,
                    time: profile.pickupStop.pickupTime,
                    lat: profile.pickupStop.latitude,
                    lng: profile.pickupStop.longitude
                } : null,
                drop: profile.dropStop ? {
                    name: profile.dropStop.name,
                    time: profile.dropStop.dropTime,
                    lat: profile.dropStop.latitude,
                    lng: profile.dropStop.longitude
                } : null
            },
            liveTelemetry: telemetry ? {
                lat: telemetry.latitude,
                lng: telemetry.longitude,
                speed: telemetry.speed,
                status: telemetry.status,
                lastUpdated: telemetry.recordedAt.toISOString()
            } : null
        }));
    } catch (error: any) {
        console.error("getStudentTransportAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch transport data" };
    }
}

export async function sendParentOTPAction(phone: string) {
    try {
        if (!phone) return { success: false, error: "Phone number is required." };

        // Ensure parent exists
        const family = await getFamilyStudentsAction(phone);
        if (!family.success || family.students.length === 0) {
            // For testing: skip validation if using backdoor number
            if (phone !== "9090909090" && phone !== "test") {
                return { success: false, error: "No students associated with this phone number." };
            }
        }

        // Generate OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.otp.create({
            data: {
                mobile: phone,
                code,
                expiresAt,
            }
        });

        console.log(`[DEV OTP] Parent OTP for ${phone} is ${code}`);

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to send OTP" };
    }
}

export async function verifyParentOTPAction(phone: string, otp: string) {
    try {
        if (!phone || !otp) return { success: false, error: "Phone and OTP required" };

        const isBackdoor = otp === "123456" && process.env.NODE_ENV !== "production";

        if (!isBackdoor) {
            const record = await prisma.otp.findFirst({
                where: {
                    mobile: phone,
                    code: otp,
                    verified: false,
                    expiresAt: { gt: new Date() }
                },
                orderBy: { createdAt: "desc" }
            });

            if (!record) {
                return { success: false, error: "Invalid or expired OTP" };
            }

            await prisma.otp.update({
                where: { id: record.id },
                data: { verified: true }
            });
        }

        return { success: true, parentId: phone, phone };
    } catch (e: any) {
        return { success: false, error: "OTP Verification failed" };
    }
}

export async function getParentDashboardDataAction(schoolSlug: string, parentPhone: string) {
    try {
        const familyResult = await getFamilyStudentsAction(schoolSlug, parentPhone);
        if (!familyResult.success || !familyResult.students.length) {
            return { success: false, error: "No students associated with this account" };
        }

        const students = familyResult.students;
        const studentIds = students.map((s: any) => s.id);

        // Count unread messages (real-time)
        const unreadMessages = await prisma.message.count({
            where: {
                conversation: { studentId: { in: studentIds } },
                isRead: false,
                senderType: { not: 'PARENT' }
            }
        });

        // Fetch today's attendance for these students
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                studentId: { in: studentIds },
                date: { gte: startOfDay, lte: endOfDay }
            }
        });

        // Generate real-time activity timeline
        const activities = [];

        // 1. Fetch Today's Attendance
        const attendance = attendanceRecords[0];
        if (attendance) {
            activities.push({
                time: attendance.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: 'Attendance Marked',
                subtitle: `Status: ${attendance.status}`,
                isActive: false
            });
        }

        // 2. Fetch Today's Transport Logs
        const transportLogs = await prisma.transportBoardingLog.findMany({
            where: {
                studentId: { in: studentIds },
                timestamp: { gte: startOfDay, lte: endOfDay }
            },
            orderBy: { timestamp: 'desc' },
            take: 3
        });

        for (const log of transportLogs) {
            activities.push({
                time: log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: `${log.type === "PICKUP" ? "Pickup" : "Drop"} - ${log.status}`,
                subtitle: log.notes || 'Status updated',
                isActive: false
            });
        }

        // Sort by time (most recent first) and cap at 5
        activities.sort((a, b) => {
            const timeA = new Date(`1970-01-01 ${a.time}`).getTime();
            const timeB = new Date(`1970-01-01 ${b.time}`).getTime();
            return timeB - timeA;
        });

        // Add a placeholder for Morning Assembly if no activities yet
        if (activities.length === 0) {
            activities.push({
                time: '09:00 AM',
                title: 'Morning Assembly',
                subtitle: 'Daily school start',
                isActive: new Date().getHours() === 9
            });
        }

        return JSON.parse(JSON.stringify({
            success: true,
            school: { slug: schoolSlug, name: students[0].schoolName },
            profile: { phone: parentPhone },
            students,
            unreadMessages,
            activities: activities.slice(0, 5),
            conversations: []
        }));
    } catch (error: any) {
        console.error("getParentDashboardDataAction Error:", error);
        return { success: false, error: "Failed to load dashboard data" };
    }
}
export async function getParentDailySummaryAction(schoolSlug: string, parentPhone: string, studentId: string) {
    try {
        // 1. Fetch Student Context
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { firstName: true, grade: true, classroomId: true }
        });

        if (!student) return { success: false, error: "Student not found" };

        // 2. Fetch Today's Events (simplified for now)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [attendance, diaryEntries] = await Promise.all([
            prisma.attendance.findFirst({
                where: { studentId, date: { gte: startOfDay } }
            }),
            prisma.diaryEntry.findMany({
                where: {
                    schoolId: (await prisma.school.findUnique({ where: { slug: schoolSlug }, select: { id: true } }))?.id,
                    createdAt: { gte: startOfDay }
                },
                take: 3
            })
        ]);

        const context = {
            studentName: student.firstName,
            grade: student.grade,
            attendanceStatus: attendance?.status || "Not marked yet",
            recentActivities: diaryEntries.map(d => d.title).join(", ") || "Regular classroom activities"
        };

        // 3. Resolve AI Model
        let model;
        try {
            const { apiKey, provider } = await resolveSchoolAIModel(schoolSlug);
            model = provider === 'google'
                ? createGoogleGenerativeAI({ apiKey })('gemini-1.5-flash')
                : createOpenAI({ apiKey })('gpt-4o-mini');
        } catch (e) {
            return {
                success: true,
                summary: `Today, ${student.firstName} is in school. Attendance is marked as ${context.attendanceStatus}. Wishing ${student.firstName} a great day!`
            };
        }

        // 4. Generate Summary
        const prompt = `
            You are a helpful school assistant for parents.
            Summarize the child's day so far in 2 comforting, warm sentences.
            
            DATA:
            Student: ${context.studentName} (${context.grade})
            Attendance: ${context.attendanceStatus}
            Activities: ${context.recentActivities}
            
            INSTRUCTIONS:
            - Be very warm and reassuring.
            - Focus on the positive.
            - Use the child's name.
            - Keep it short (max 40 words).
        `;

        const { text } = await generateText({
            model,
            messages: [{ role: 'user', content: prompt }]
        });

        return { success: true, summary: text };

    } catch (error: any) {
        console.error("getParentDailySummaryAction Error:", error);
        return { success: false, error: "Failed to generate summary" };
    }
}

export async function getSchoolBySlugAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
        });
        if (!school) return { success: false, error: "School not found" };
        
        // Ensure serialization by converting Dates to strings
        const serializedSchool = {
            ...school,
            createdAt: school.createdAt.toISOString(),
            updatedAt: school.updatedAt.toISOString(),
            academicYearStart: school.academicYearStart ? school.academicYearStart.toISOString() : null,
            academicYearEnd: school.academicYearEnd ? school.academicYearEnd.toISOString() : null,
        };

        return { success: true, school: serializedSchool };
    } catch (error: any) {
        console.error("getSchoolBySlugAction Error:", error);
        return { success: false, error: "Failed to fetch school data" };
    }
}
export async function getStudentExtracurricularDataAction(studentId: string, phone: string) {
    try {
        // 1. Verify access
        const familyResult = await getFamilyStudentsAction(phone);
        if (!familyResult.success || !familyResult.students) {
            return { success: false, error: "Unauthorized access" };
        }
        const hasAccess = familyResult.students.some((s: any) => s.id === studentId);
        if (!hasAccess) return { success: false, error: "Unauthorized access" };

        const schoolId = familyResult.students.find((s: any) => s.id === studentId)?.schoolId;
        if (!schoolId) return { success: false, error: "School context not found" };

        // 2. Fetch all relevant extracurricular data
        const [enrollments, awards, performance, attendance] = await Promise.all([
            prisma.activityEnrollment.findMany({
                where: { studentId, status: 'ACTIVE' },
                include: { activity: true }
            }),
            prisma.activityAward.findMany({
                where: { studentId },
                include: { activity: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.activityPerformance.findMany({
                where: { studentId },
                include: { activity: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.activityAttendance.findMany({
                where: { studentId },
                include: { session: { include: { activity: true } } },
                orderBy: { session: { date: 'desc' } },
                take: 10
            })
        ]);

        return {
            success: true,
            data: JSON.parse(JSON.stringify({
                enrollments,
                awards,
                performance,
                attendance: attendance.map(a => ({
                    id: a.id,
                    status: a.status,
                    date: a.session.date,
                    activityName: a.session.activity.name,
                    notes: a.notes
                }))
            }))
        };
    } catch (error: any) {
        console.error("getStudentExtracurricularDataAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch extracurricular data" };
    }
}

export async function getApprovedBroadcastsAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true }
        });
        if (!school) return { success: false, error: "School not found", broadcasts: [] };

        const broadcasts = await prisma.broadcast.findMany({
            where: {
                schoolId: school.id,
                status: "PUBLISHED"
            },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
                author: {
                    select: { firstName: true, lastName: true, avatar: true }
                }
            }
        });

        return { success: true, broadcasts: JSON.parse(JSON.stringify(broadcasts)) };
    } catch (error: any) {
        console.error("getApprovedBroadcastsAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch broadcasts", broadcasts: [] };
    }
}

export async function payTransportFeeAction(slug: string, studentId: string) {
    try {
        const updated = await prisma.studentTransportProfile.updateMany({
            where: {
                studentId,
                student: { school: { slug } }
            },
            data: { status: "ACTIVE" }
        });

        if (updated.count === 0) {
            return { success: false, error: "Transport profile not found or already active" };
        }

        return { success: true };
    } catch (error: any) {
        console.error("payTransportFeeAction Error:", error);
        return { success: false, error: error.message || "Failed to process transport payment" };
    }
}

export async function acknowledgeDiaryEntryAction(recipientId: string, acknowledgedBy: string) {
    try {
        await prisma.diaryRecipient.update({
            where: { id: recipientId },
            data: {
                isAcknowledged: true,
                acknowledgedAt: new Date(),
                acknowledgedBy
            }
        });
        return { success: true };
    } catch (error: any) {
        console.error("acknowledgeDiaryEntryAction Error:", error);
        return { success: false, error: error.message || "Failed to acknowledge diary entry" };
    }
}

export async function getStudentAcademicDataAction(slug: string, studentId: string, phone?: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true }
        });
        if (!school) return { success: false, error: "School not found" };
        
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                schoolId: school.id,
                OR: [
                    { parentMobile: { contains: phone } },
                    { fatherPhone: { contains: phone } },
                    { motherPhone: { contains: phone } }
                ]
            },
            include: {
                classroom: true
            }
        });
        
        if (!student) return { success: false, error: "Student not found or unauthorized" };
        
        return { success: true, data: JSON.parse(JSON.stringify(student)) };
    } catch (error: any) {
        console.error("getStudentAcademicDataAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch academic data" };
    }
}
