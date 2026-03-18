"use server";

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";
import { resolveSchoolAIModel } from "@/lib/school-integrations";
import { getDashboardStatsAction } from "./dashboard-actions";

/**
 * Lightweight action to fetch AI insights for the GlobalAuraWrapper.
 * Reuses the dashboard stats action which already generates insights.
 */
export async function getDashboardInsightsAction(slug: string, staffId?: string) {
    try {
        const res = await getDashboardStatsAction(slug, staffId);
        if (!res.success) {
            return { success: false, error: res.error };
        }
        return {
            success: true,
            insights: (res as any).aiInsights || []
        };
    } catch (error: any) {
        console.error("[Aura Insights] Error:", error);
        return { success: false, error: "Failed to load insights" };
    }
}

export async function askAuraAction(query: string, slug: string, staffId?: string) {
    console.log(`[Aura Engine] Processing Query for Node: ${slug} (ID: ${staffId || "ADMIN"})`);
    try {
        // 1. Get Context (Dashboard Stats)
        // We reuse the existing stats action to get the same data the user sees
        const statsRes = await getDashboardStatsAction(slug, staffId);

        if (!statsRes.success) {
            console.error(`[Aura Engine] Context Retrieval Error:`, statsRes.error);
            return { success: false, error: statsRes.error || "Could not retrieve school data context." };
        }

        const contextData = statsRes.stats;
        const recentActivity = statsRes.recentActivity;

        // 2. Get AI model key from PER-SCHOOL integration config
        let model;
        try {
            const { apiKey, provider } = await resolveSchoolAIModel(slug);
            model = provider === 'google'
                ? createGoogleGenerativeAI({ apiKey })('gemini-flash-latest')
                : createOpenAI({ apiKey })('gpt-4o');
        } catch {
            // Fallback: Simple Rule-Based Response if no key configured
            console.warn(`[Aura Engine] No AI key for school: ${slug}. Using fallback logic.`);
            return {
                success: true,
                data: generateFallbackResponse(query, contextData)
            };
        }

        // 2.5 Get Expanded Data (richer context for the AI) — FULL PORTAL ACCESS
        const expandedData = await getExpandedSchoolData(slug);

        const systemPrompt = `
            You are Aura, the intelligent AI assistant for this school management platform (Bodhi Board).
            You have FULL ACCESS to every module in this school portal.
            
            CURRENT DASHBOARD OVERVIEW:
            ${JSON.stringify(contextData, null, 2)}

            COMPREHENSIVE SCHOOL KNOWLEDGE BASE (All Modules):
            ${JSON.stringify(expandedData, null, 2)}

            RECENT ACTIVITY FEED:
            ${JSON.stringify(recentActivity?.slice(0, 10), null, 2)}

            USER QUERY: "${query}"

            INSTRUCTIONS:
            - You have access to ALL modules: Students, Staff/HR, Attendance, Fees/Billing, Admissions, Transport, Homework, Diary, Calendar, Library, Hostel, Canteen, Extracurricular Activities, Circulars/Broadcasts, Communication, Exams, and more.
            - Answer the user's question based strictly on the provided data.
            - If asking about specific people (students/staff), check the Knowledge Base.
            - If asking about fees, check billing data including pending amounts, collection rates, overdue counts.
            - If asking about HR, check leave requests, staff attendance, departments.
            - If asking about transport, check routes, vehicles, drivers.
            - If asking about homework, check recent assignments and submission rates.
            - If asking about admissions, check pipeline stats and lead status.
            - Be concise, professional, and helpful. Use bullet points for lists.
            - If the answer is not in the data, say "I don't have that specific data available right now, but you can check the relevant module for details."
            - Format numbers nicely with commas.
            - Do not mention JSON, data structures, or technical details. Speak naturally like a knowledgeable school administrator.
            - If the user asks a general question, provide a helpful summary from all available data.
        `;

        const { text } = await generateText({
            model,
            messages: [{ role: 'user', content: systemPrompt }]
        });

        return { success: true, data: JSON.parse(JSON.stringify(text)) };

    } catch (error: any) {
        console.error("askAuraAction Error:", error);
        return { success: false, error: "Failed to process your request." };
    }
}

async function getExpandedSchoolData(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: slug },
            select: {
                id: true, name: true, city: true, country: true, website: true,
                email: true, phone: true, currency: true, timezone: true,
                schoolTimings: true, workingDays: true,
                academicYears: { where: { isCurrent: true }, select: { id: true, name: true, startDate: true, endDate: true } }
            }
        });

        if (!school) return null;
        const schoolData = school as any;
        const schoolId = schoolData.id;
        const now = new Date();
        const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const currentAcademicYearId = schoolData.academicYears?.[0]?.id;

        // ═══════════════════════════════════════════════════
        // PARALLEL BATCH 1: Core Aggregations
        // ═══════════════════════════════════════════════════
        const [
            gradeStats,
            staffStats,
            totalStudents,
            totalStaff,
            totalClassrooms,
        ] = await Promise.all([
            prisma.student.groupBy({
                by: ['grade'],
                where: { schoolId, status: 'ACTIVE', grade: { not: null } },
                _count: { id: true }
            }),
            prisma.user.groupBy({
                by: ['department'],
                where: { schoolId, status: 'ACTIVE', role: { not: 'STUDENT' }, department: { not: null } },
                _count: { id: true }
            }),
            prisma.student.count({ where: { schoolId, status: 'ACTIVE' } }),
            prisma.user.count({ where: { schoolId, status: 'ACTIVE', role: { in: ['STAFF', 'ADMIN'] } } }),
            prisma.classroom.count({ where: { schoolId } }),
        ]);

        // ═══════════════════════════════════════════════════
        // PARALLEL BATCH 2: All Module Data
        // ═══════════════════════════════════════════════════
        const [
            // Academics & Exams
            upcomingExams,
            recentExamResults,
            classrooms,
            // Billing & Fees
            feeStructures,
            pendingFees,
            overdueFees,
            recentPayments,
            totalFeesAgg,
            totalCollectedAgg,
            // Admissions Pipeline
            admissionsByStage,
            recentAdmissions,
            // HR & Staff
            pendingLeaves,
            approvedLeaves,
            staffAttendanceToday,
            // Transport
            routes,
            vehicles,
            drivers,
            // Homework
            recentHomework,
            homeworkSubmissionStats,
            // Diary
            recentDiary,
            // Circulars & Broadcasts
            recentCirculars,
            recentBroadcasts,
            // Library
            libraryBooks,
            activeLibraryTransactions,
            // Calendar
            upcomingHolidays,
            upcomingEvents,
            // Communication
            parentRequests,
            // Canteen
            canteenPackages,
            canteenSubscriptions,
            // Hostel
            hostels,
            // Extracurricular
            activities,
            clubs,
            activityEnrollments,
        ] = await Promise.all([
            // ── Academics & Exams ──
            prisma.exam.findMany({
                where: { schoolId, date: { gte: now } },
                take: 10, orderBy: { date: 'asc' },
                select: { title: true, date: true, type: true, maxMarks: true }
            }),
            prisma.exam.findMany({
                where: { schoolId, date: { lt: now } },
                take: 5, orderBy: { date: 'desc' },
                select: {
                    title: true, date: true, type: true, maxMarks: true,
                    results: { select: { marks: true }, take: 100 }
                }
            }),
            prisma.classroom.findMany({
                where: { schoolId },
                select: {
                    name: true, roomNumber: true, capacity: true,
                    teacher: { select: { firstName: true, lastName: true } },
                    _count: { select: { students: true } }
                }
            }),

            // ── Billing & Fees ──
            prisma.feeStructure.findMany({
                where: { schoolId },
                select: { name: true, academicYear: true, components: { select: { name: true, amount: true, frequency: true } } }
            }),
            prisma.fee.count({ where: { student: { schoolId }, status: 'PENDING' } }),
            prisma.fee.count({ where: { student: { schoolId }, status: 'PENDING', dueDate: { lt: now } } }),
            prisma.feePayment.findMany({
                where: { fee: { student: { schoolId } }, date: { gte: sevenDaysAgo } },
                select: { amount: true, date: true, method: true },
                orderBy: { date: 'desc' }, take: 10
            }),
            prisma.fee.aggregate({ _sum: { amount: true }, where: { student: { schoolId } } }),
            prisma.feePayment.aggregate({ _sum: { amount: true }, where: { fee: { student: { schoolId } } } }),

            // ── Admissions Pipeline ──
            prisma.admission.groupBy({
                by: ['stage'],
                where: { schoolId },
                _count: { id: true }
            }),
            prisma.admission.findMany({
                where: { schoolId },
                orderBy: { createdAt: 'desc' }, take: 10,
                select: { studentName: true, stage: true, officialStatus: true, priority: true, source: true, createdAt: true }
            }),

            // ── HR & Staff ──
            prisma.leaveRequest.findMany({
                where: { user: { schoolId }, status: 'PENDING' },
                select: { type: true, startDate: true, endDate: true, reason: true, user: { select: { firstName: true, lastName: true } } },
                take: 10
            }),
            prisma.leaveRequest.count({
                where: { user: { schoolId }, status: 'APPROVED', startDate: { gte: thirtyDaysAgo } }
            }),
            prisma.staffAttendance.count({
                where: { user: { schoolId }, date: { gte: startOfDay, lte: endOfDay }, status: 'PRESENT' }
            }),

            // ── Transport ──
            prisma.transportRoute.findMany({
                where: { schoolId },
                select: { name: true, type: true, _count: { select: { stops: true } } },
                take: 20
            }),
            prisma.transportVehicle.findMany({
                where: { schoolId, status: 'ACTIVE' },
                select: { registrationNumber: true, capacity: true, model: true }
            }),
            prisma.transportDriver.findMany({
                where: { schoolId, status: 'ACTIVE' },
                select: { name: true, phone: true, licenseNumber: true }
            }),

            // ── Homework ──
            prisma.homework.findMany({
                where: { schoolId, createdAt: { gte: sevenDaysAgo } },
                select: {
                    title: true, subject: true, dueDate: true, status: true,
                    classroom: { select: { name: true } },
                    _count: { select: { submissions: true } }
                },
                orderBy: { createdAt: 'desc' }, take: 10
            }),
            prisma.homeworkSubmission.groupBy({
                by: ['status'],
                where: { homework: { schoolId, createdAt: { gte: sevenDaysAgo } } },
                _count: { id: true }
            }),

            // ── Diary ──
            prisma.diaryEntry.findMany({
                where: { schoolId, status: 'PUBLISHED' },
                select: { title: true, scheduledFor: true, priority: true, type: true },
                orderBy: { scheduledFor: 'desc' }, take: 10
            }),

            // ── Circulars & Broadcasts ──
            prisma.schoolCircular.findMany({
                where: { schoolId },
                select: { title: true, category: true, publishedAt: true, isPublished: true },
                orderBy: { createdAt: 'desc' }, take: 5
            }),
            prisma.broadcast.findMany({
                where: { schoolId },
                select: { title: true, channel: true, status: true, scheduledAt: true },
                orderBy: { createdAt: 'desc' }, take: 5
            }),

            // ── Library ──
            prisma.libraryBook.findMany({
                where: { schoolId },
                select: { title: true, author: true, isbn: true, copies: true },
                take: 20
            }),
            prisma.libraryTransaction.count({
                where: { schoolId, status: 'ISSUED' }
            }),

            // ── Calendar ──
            prisma.schoolHoliday.findMany({
                where: { schoolId, date: { gte: now } },
                select: { name: true, date: true, type: true },
                orderBy: { date: 'asc' }, take: 10
            }),
            prisma.schoolEvent.findMany({
                where: { schoolId, date: { gte: now } },
                select: { title: true, date: true, endDate: true, type: true, venue: true },
                orderBy: { date: 'asc' }, take: 10
            }),

            // ── Communication ──
            prisma.parentRequest.findMany({
                where: { schoolId, status: 'PENDING' },
                select: { type: true, description: true, createdAt: true },
                orderBy: { createdAt: 'desc' }, take: 10
            }),

            // ── Canteen ──
            prisma.canteenPackage.findMany({
                where: { schoolId },
                select: { name: true, price: true, validity: true, isActive: true },
                take: 10
            }),
            prisma.canteenSubscription.count({
                where: { schoolId, status: 'ACTIVE' }
            }),

            // ── Hostel ──
            prisma.hostel.findMany({
                where: { schoolId },
                select: { name: true, capacity: true, type: true }
            }),

            // ── Extracurricular ──
            prisma.activity.findMany({
                where: { schoolId },
                select: { name: true, type: true, status: true, maxCapacity: true },
                take: 20
            }),
            prisma.club.findMany({
                where: { schoolId },
                select: { name: true, type: true, status: true, maxMembers: true },
                take: 20
            }),
            prisma.activityEnrollment.count({
                where: { schoolId, status: 'ACTIVE' }
            }),
        ]);

        // ═══════════════════════════════════════════════════
        // COMPILE COMPREHENSIVE KNOWLEDGE BASE
        // ═══════════════════════════════════════════════════

        const totalFeesAmount = totalFeesAgg._sum.amount || 0;
        const totalCollectedAmount = totalCollectedAgg._sum.amount || 0;
        const collectionRate = totalFeesAmount > 0 ? Math.round((totalCollectedAmount / totalFeesAmount) * 100) : 0;

        return {
            schoolProfile: {
                name: schoolData.name,
                location: `${schoolData.city || 'N/A'}, ${schoolData.country || 'N/A'}`,
                contact: `${schoolData.email || 'N/A'} | ${schoolData.phone || 'N/A'}`,
                website: schoolData.website || 'N/A',
                currency: schoolData.currency || 'INR',
                timezone: schoolData.timezone || 'Asia/Kolkata',
                timings: schoolData.schoolTimings || 'N/A',
                workingDays: schoolData.workingDays || 'N/A',
                currentAcademicYear: schoolData.academicYears[0]?.name || "N/A"
            },

            academicStructure: {
                totalStudents,
                totalStaff,
                totalClassrooms,
                grades: gradeStats.map(g => `${g.grade} (${g._count.id} students)`),
                departments: staffStats.map(s => `${s.department} (${s._count.id} staff)`),
                classroomDetails: classrooms.map(c => ({
                    name: c.name,
                    teacher: c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'Unassigned',
                    students: c._count.students,
                    capacity: c.capacity,
                    room: c.roomNumber
                }))
            },

            examsAndAssessments: {
                upcomingExams: upcomingExams.map(e => ({ title: e.title, date: e.date.toLocaleDateString(), type: e.type, maxMarks: e.maxMarks })),
                recentExamPerformance: recentExamResults.map(e => {
                    const marks = e.results.map(r => r.marks || 0);
                    const avg = marks.length > 0 ? (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(1) : '0';
                    return { title: e.title, date: e.date.toLocaleDateString(), avgMarks: `${avg}/${e.maxMarks}`, studentsAttempted: marks.length };
                })
            },

            billingAndFees: {
                totalFeesGenerated: totalFeesAmount,
                totalCollected: totalCollectedAmount,
                collectionRate: `${collectionRate}%`,
                pendingFeeCount: pendingFees,
                overdueCount: overdueFees,
                feeStructures: feeStructures.map(f => ({
                    name: f.name,
                    year: f.academicYear,
                    components: f.components.map(c => `${c.name}: ${schoolData.currency || 'INR'} ${c.amount} (${c.frequency})`)
                })),
                recentPayments: recentPayments.map(p => ({
                    amount: `${schoolData.currency || 'INR'} ${p.amount}`,
                    date: p.date.toLocaleDateString(),
                    method: p.method
                }))
            },

            admissionsPipeline: {
                stageBreakdown: admissionsByStage.map(a => `${a.stage}: ${a._count.id}`),
                recentInquiries: recentAdmissions.map(a => ({
                    name: a.studentName,
                    stage: a.stage,
                    status: a.officialStatus,
                    priority: a.priority,
                    source: a.source,
                    date: a.createdAt.toLocaleDateString()
                }))
            },

            hrAndStaff: {
                staffPresentToday: staffAttendanceToday,
                pendingLeaveRequests: pendingLeaves.map(l => ({
                    staff: `${l.user.firstName} ${l.user.lastName}`,
                    type: l.type,
                    from: l.startDate.toLocaleDateString(),
                    to: l.endDate.toLocaleDateString(),
                    reason: l.reason
                })),
                approvedLeavesThisMonth: approvedLeaves
            },

            transport: {
                totalRoutes: routes.length,
                routes: routes.map(r => ({ name: r.name, type: r.type, stops: r._count.stops })),
                activeVehicles: vehicles.map(v => ({
                    registration: v.registrationNumber,
                    capacity: v.capacity,
                    vehicle: v.model || 'N/A'
                })),
                activeDrivers: drivers.map(d => ({ name: d.name, phone: d.phone }))
            },

            homework: {
                recentAssignments: recentHomework.map(h => ({
                    title: h.title,
                    subject: h.subject,
                    class: h.classroom?.name || 'N/A',
                    dueDate: h.dueDate?.toLocaleDateString() || 'N/A',
                    status: h.status,
                    submissions: h._count.submissions
                })),
                submissionStats: homeworkSubmissionStats.map(s => `${s.status}: ${s._count.id}`)
            },

            diary: {
                recentEntries: recentDiary.map(d => ({
                    title: d.title,
                    date: d.scheduledFor?.toLocaleDateString() || 'N/A',
                    priority: d.priority,
                    type: d.type
                }))
            },

            circularsAndBroadcasts: {
                recentCirculars: recentCirculars.map(c => ({
                    title: c.title,
                    category: c.category,
                    date: c.publishedAt?.toLocaleDateString() || 'Draft',
                    status: c.isPublished ? 'Published' : 'Draft'
                })),
                recentBroadcasts: recentBroadcasts.map(b => ({
                    title: b.title,
                    channel: b.channel,
                    status: b.status
                }))
            },

            library: {
                totalBooks: libraryBooks.length,
                currentlyIssued: activeLibraryTransactions,
                catalog: libraryBooks.map(b => ({
                    title: b.title,
                    author: b.author,
                    copies: b.copies
                }))
            },

            calendar: {
                upcomingHolidays: upcomingHolidays.map(h => ({
                    name: h.name,
                    date: h.date.toLocaleDateString(),
                    type: h.type
                })),
                upcomingEvents: upcomingEvents.map(e => ({
                    title: e.title,
                    date: e.date.toLocaleDateString(),
                    type: e.type,
                    venue: e.venue || 'TBD'
                }))
            },

            communication: {
                pendingParentRequests: parentRequests.map(r => ({
                    type: r.type,
                    description: r.description?.substring(0, 100) || 'N/A',
                    date: r.createdAt.toLocaleDateString()
                }))
            },

            canteen: {
                packages: canteenPackages.map(p => ({
                    name: p.name,
                    price: `${schoolData.currency || 'INR'} ${p.price}`,
                    active: p.isActive
                })),
                activeSubscriptions: canteenSubscriptions
            },

            hostel: {
                facilities: hostels.map(h => ({
                    name: h.name,
                    capacity: h.capacity,
                    type: h.type
                }))
            },

            extracurricular: {
                activities: activities.map(a => ({
                    name: a.name,
                    type: a.type,
                    status: a.status,
                    capacity: a.maxCapacity
                })),
                clubs: clubs.map(c => ({
                    name: c.name,
                    type: c.type,
                    status: c.status,
                    maxMembers: c.maxMembers
                })),
                totalEnrollments: activityEnrollments
            }
        };
    } catch (error) {
        console.error("[Aura Engine] Expanded Data Error:", error);
        return null;
    }
}

function generateFallbackResponse(query: string, stats: any): string {
    const q = query.toLowerCase();

    if (q.includes("attendance")) {
        return `Attendance is currently at ${stats.attendanceToday}.`;
    }
    if (q.includes("student") || q.includes("count")) {
        return `There are ${stats.totalStudents} active students enrolled.`;
    }
    if (q.includes("staff")) {
        return `We have ${stats.activeStaff} staff members active today.`;
    }
    if (q.includes("revenue") || q.includes("fee") || q.includes("collection")) {
        return `Total revenue collected today is ${stats.revenue}. Collection progress is at ${stats.collectionPercent}%.`;
    }
    if (q.includes("transport") || q.includes("bus")) {
        return `Transport status: ${stats.transportStatus}. Active routes: ${stats.routesCount}.`;
    }
    if (q.includes("homework")) {
        return "Check the Homework module for recent assignments and submission details.";
    }
    if (q.includes("admission") || q.includes("inquiry") || q.includes("lead")) {
        return "Check the Admissions module for pipeline details and recent inquiries.";
    }
    if (q.includes("leave") || q.includes("hr")) {
        return "Check the HR module for leave requests and staff attendance details.";
    }
    if (q.includes("library") || q.includes("book")) {
        return "Check the Library module for book catalog and transaction details.";
    }
    if (q.includes("diary") || q.includes("event") || q.includes("calendar")) {
        return "Check the Calendar and Diary modules for upcoming events and entries.";
    }
    if (q.includes("canteen") || q.includes("food") || q.includes("meal")) {
        return "Check the Canteen module for menu plans and subscription details.";
    }
    if (q.includes("hostel") || q.includes("boarding")) {
        return "Check the Hostel module for facility and allocation details.";
    }
    if (q.includes("activity") || q.includes("club") || q.includes("extra")) {
        return "Check the Extracurricular module for activities, clubs, and enrollments.";
    }

    return "I can help you with any school module — fees, attendance, students, staff, transport, homework, admissions, library, diary, canteen, hostel, activities, and more. Try asking a specific question!";
}
