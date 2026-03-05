"use server";

import { prisma } from "@/lib/prisma";

export async function getChildProgressAction(studentId: string, phone: string) {
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
            select: { id: true, schoolId: true, firstName: true }
        });

        if (!student) {
            return { success: false, error: "Unauthorized or student not found" };
        }

        // Fetch all progress data in parallel
        const [reportCards, examResults, developmentReports, milestoneRecords, skillAssessments, portfolioEntries] = await Promise.all([
            // Published Report Cards
            prisma.reportCard.findMany({
                where: { studentId, published: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),

            // Exam Results with exam info
            prisma.examResult.findMany({
                where: { studentId },
                include: {
                    exam: {
                        select: { title: true, date: true, maxMarks: true, type: true, category: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),

            // Published Development Reports
            prisma.developmentReport.findMany({
                where: { studentId, published: true },
                orderBy: { publishedAt: 'desc' },
                take: 5,
            }),

            // Milestone Records with domain info
            prisma.milestoneRecord.findMany({
                where: { studentId },
                include: {
                    milestone: {
                        include: {
                            domain: {
                                select: { name: true, color: true, icon: true }
                            }
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' },
            }),

            // Skill Assessments
            prisma.skillAssessment.findMany({
                where: { studentId },
                include: {
                    skill: {
                        include: {
                            domain: {
                                select: { name: true, color: true }
                            }
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' },
            }),

            // Portfolio
            prisma.portfolioEntry.findMany({
                where: { studentId },
                orderBy: { createdAt: 'desc' },
                take: 20,
                select: {
                    id: true, title: true, description: true, type: true,
                    mediaUrl: true, thumbnailUrl: true, tags: true, createdAt: true
                }
            }),
        ]);

        // Group skill assessments by domain
        const skillsByDomain: Record<string, any> = {};
        skillAssessments.forEach(sa => {
            const domainName = sa.skill.domain.name;
            if (!skillsByDomain[domainName]) {
                skillsByDomain[domainName] = {
                    domain: sa.skill.domain.name,
                    color: sa.skill.domain.color,
                    skills: []
                };
            }
            skillsByDomain[domainName].skills.push({
                skill: sa.skill.name,
                rating: sa.rating,
                term: sa.term,
                notes: sa.notes,
            });
        });

        // Group milestones by domain
        const milestonesByDomain: Record<string, any> = {};
        milestoneRecords.forEach(mr => {
            const domainName = mr.milestone.domain.name;
            if (!milestonesByDomain[domainName]) {
                milestonesByDomain[domainName] = {
                    domain: mr.milestone.domain.name,
                    color: mr.milestone.domain.color,
                    icon: mr.milestone.domain.icon,
                    milestones: []
                };
            }
            milestonesByDomain[domainName].milestones.push({
                title: mr.milestone.title,
                status: mr.status,
                achievedDate: mr.achievedDate,
                notes: mr.notes,
            });
        });

        return {
            success: true,
            data: {
                reportCards: reportCards.map(rc => ({
                    id: rc.id,
                    term: rc.term,
                    marks: JSON.parse(rc.marks || '{}'),
                    comments: rc.comments,
                    publishedAt: rc.updatedAt,
                })),
                examResults: examResults.map(er => ({
                    id: er.id,
                    subject: er.subject,
                    marks: er.marks,
                    grade: er.grade,
                    remarks: er.remarks,
                    exam: er.exam,
                })),
                developmentReports: developmentReports.map(dr => ({
                    id: dr.id,
                    term: dr.term,
                    teacherNarrative: dr.teacherNarrative,
                    strengths: dr.strengthsNotes,
                    areasToGrow: dr.areasToGrow,
                    parentMessage: dr.parentMessage,
                    publishedAt: dr.publishedAt,
                })),
                skillsByDomain: Object.values(skillsByDomain),
                milestonesByDomain: Object.values(milestonesByDomain),
                portfolio: portfolioEntries,
            }
        };
    } catch (error: any) {
        console.error("getChildProgressAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}
