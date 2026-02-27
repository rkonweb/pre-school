"use server";

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";
import { resolveSchoolAIModel } from "@/lib/school-integrations";
import { getDashboardStatsAction } from "./dashboard-actions";

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

        // 2.5 Get Expanded Data (richer context for the AI)
        const expandedData = await getExpandedSchoolData(slug);

        const systemPrompt = `
            You are Aura, the AI intelligence for this school dashboard.
            
            CURRENT SCHOOL DATA:
            ${JSON.stringify(contextData, null, 2)}

            EXPANDED KNOWLEDGE GRAPH (Students, Staff, Classes, Transport):
            ${JSON.stringify(expandedData, null, 2)}

            RECENT ACTIVITY:
            ${JSON.stringify(recentActivity?.slice(0, 5), null, 2)}

            USER QUERY: "${query}"

            INSTRUCTIONS:
            - Answer the user's question based strictly on the provided data.
            - If asking about specific people (students/staff), check the Expanded Knowledge Graph.
            - Be concise, professional, and helpful.
            - If the answer is not in the data, say "I don't have access to that information right now."
            - Format numbers nicely.
            - Do not mention JSON or data structures. Speak naturally.
        `;

        const { text } = await generateText({
            model,
            messages: [{ role: 'user', content: systemPrompt }]
        });

        return { success: true, data: text };

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
                email: true, phone: true,
                academicYears: { where: { isCurrent: true }, select: { name: true, startDate: true, endDate: true } }
            }
        });

        if (!school) return null;
        const schoolData = school as any;

        // 1. Optimized Aggregations (Fast)
        // Group Students by Grade to know structure without fetching all 500+ records
        const gradeStats = await prisma.student.groupBy({
            by: ['grade'],
            where: { schoolId: schoolData.id, status: 'ACTIVE', grade: { not: null } },
            _count: { id: true }
        });

        // Group Staff by Department
        const staffStats = await prisma.user.groupBy({
            by: ['department'],
            where: { schoolId: schoolData.id, status: 'ACTIVE', role: { not: 'STUDENT' }, department: { not: null } },
            _count: { id: true }
        });

        const [exams, feeStructures, recentAdmissions, vehicles] = await Promise.all([
            // 2. Upcoming Exams (Next 30 days)
            prisma.exam.findMany({
                where: {
                    schoolId: schoolData.id,
                    date: { gte: new Date() }
                },
                take: 5,
                orderBy: { date: 'asc' },
                select: { title: true, date: true, type: true, classrooms: true }
            }),
            // 3. Fee Structures
            prisma.feeStructure.findMany({
                where: { schoolId: schoolData.id },
                select: { name: true, academicYear: true }
            }),
            // 4. Critical Operational Data (Limited)
            prisma.admission.findMany({
                where: { schoolId: schoolData.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { childName: true, classAppliedFor: true, officialStatus: true } as any
            }),
            prisma.transportVehicle.findMany({
                where: { schoolId: schoolData.id, status: 'ACTIVE' },
                select: { registrationNumber: true, capacity: true }
            })
        ]);

        return {
            schoolProfile: {
                name: schoolData.name,
                location: `${schoolData.city}, ${schoolData.country}`,
                contact: `${schoolData.email} | ${schoolData.phone}`,
                currentYear: schoolData.academicYears[0]?.name || "N/A"
            },
            academicStructure: {
                grades: gradeStats.map(g => `${g.grade} (${g._count.id} students)`),
                departments: staffStats.map(s => `${s.department} (${s._count.id} staff)`),
                activeClassesCount: gradeStats.length
            },
            operationalContext: {
                upcomingExams: exams.map(e => `${e.title} (${new Date(e.date).toLocaleDateString()})`),
                activeFeePlans: feeStructures.map(f => f.name),
                recentAdmissions: recentAdmissions.map((a: any) => `${a.childName} (${a.officialStatus})`),
                fleet: `Active Vehicles: ${vehicles.length}`
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

    return "I can help you with attendance, specific student details, or financial stats. Try asking 'What is the attendance today?'";
}
