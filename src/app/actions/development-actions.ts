"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserAction } from "./session-actions";
import { revalidatePath } from "next/cache";

// ─── DEFAULT DOMAIN SEED DATA ─────────────────────────────────────────────────

const DEFAULT_DOMAINS = [
    {
        name: "Cognitive",
        description: "Thinking, problem-solving, memory, and learning",
        color: "#6366f1",
        icon: "Brain",
        order: 1,
        milestones: [
            { title: "Recognizes and names basic colors", ageGroup: "3-4 years", order: 1 },
            { title: "Counts objects up to 10", ageGroup: "3-4 years", order: 2 },
            { title: "Matches shapes and patterns", ageGroup: "3-4 years", order: 3 },
            { title: "Understands concepts of more/less", ageGroup: "4-5 years", order: 4 },
            { title: "Recognizes letters of the alphabet", ageGroup: "4-5 years", order: 5 },
            { title: "Sorts objects by size, color, or shape", ageGroup: "4-5 years", order: 6 },
            { title: "Completes simple puzzles (4-6 pieces)", ageGroup: "3-4 years", order: 7 },
            { title: "Understands cause and effect", ageGroup: "4-5 years", order: 8 },
        ],
        skills: [
            { name: "Problem Solving", order: 1 },
            { name: "Memory & Recall", order: 2 },
            { name: "Number Sense", order: 3 },
            { name: "Letter Recognition", order: 4 },
            { name: "Pattern Recognition", order: 5 },
        ],
    },
    {
        name: "Language & Communication",
        description: "Speaking, listening, reading readiness, and expression",
        color: "#0ea5e9",
        icon: "MessageCircle",
        order: 2,
        milestones: [
            { title: "Speaks in 3-4 word sentences", ageGroup: "3-4 years", order: 1 },
            { title: "Listens and follows 2-step instructions", ageGroup: "3-4 years", order: 2 },
            { title: "Asks questions using 'why' and 'how'", ageGroup: "4-5 years", order: 3 },
            { title: "Tells a simple story or retells a familiar one", ageGroup: "4-5 years", order: 4 },
            { title: "Recognizes own name in print", ageGroup: "4-5 years", order: 5 },
            { title: "Rhymes words and identifies rhyming pairs", ageGroup: "4-5 years", order: 6 },
            { title: "Holds a conversation with peers", ageGroup: "4-5 years", order: 7 },
        ],
        skills: [
            { name: "Speaking Clarity", order: 1 },
            { name: "Listening & Following Instructions", order: 2 },
            { name: "Vocabulary", order: 3 },
            { name: "Reading Readiness", order: 4 },
            { name: "Storytelling", order: 5 },
        ],
    },
    {
        name: "Social & Emotional",
        description: "Relationships, self-regulation, empathy, and cooperation",
        color: "#f59e0b",
        icon: "Heart",
        order: 3,
        milestones: [
            { title: "Plays cooperatively with other children", ageGroup: "3-4 years", order: 1 },
            { title: "Takes turns and shares materials", ageGroup: "3-4 years", order: 2 },
            { title: "Expresses emotions using words", ageGroup: "3-4 years", order: 3 },
            { title: "Shows empathy towards peers", ageGroup: "4-5 years", order: 4 },
            { title: "Manages frustration with support", ageGroup: "4-5 years", order: 5 },
            { title: "Follows classroom rules independently", ageGroup: "4-5 years", order: 6 },
            { title: "Separates from parent/caregiver without distress", ageGroup: "3-4 years", order: 7 },
        ],
        skills: [
            { name: "Sharing & Turn-Taking", order: 1 },
            { name: "Emotional Regulation", order: 2 },
            { name: "Empathy", order: 3 },
            { name: "Conflict Resolution", order: 4 },
            { name: "Independence", order: 5 },
        ],
    },
    {
        name: "Physical Development",
        description: "Gross motor, fine motor, and body awareness",
        color: "#10b981",
        icon: "Activity",
        order: 4,
        milestones: [
            { title: "Runs, jumps, and hops on one foot", ageGroup: "3-4 years", order: 1 },
            { title: "Catches a large ball with both hands", ageGroup: "3-4 years", order: 2 },
            { title: "Holds pencil/crayon with correct grip", ageGroup: "4-5 years", order: 3 },
            { title: "Cuts along a straight line with scissors", ageGroup: "4-5 years", order: 4 },
            { title: "Draws recognizable shapes (circle, square)", ageGroup: "4-5 years", order: 5 },
            { title: "Dresses and undresses independently", ageGroup: "4-5 years", order: 6 },
            { title: "Climbs playground equipment safely", ageGroup: "3-4 years", order: 7 },
        ],
        skills: [
            { name: "Gross Motor Skills", order: 1 },
            { name: "Fine Motor Skills", order: 2 },
            { name: "Pencil Grip & Control", order: 3 },
            { name: "Body Coordination", order: 4 },
            { name: "Self-Care Skills", order: 5 },
        ],
    },
    {
        name: "Creative Arts",
        description: "Imagination, art, music, drama, and creative expression",
        color: "#ec4899",
        icon: "Palette",
        order: 5,
        milestones: [
            { title: "Draws a person with at least 4 body parts", ageGroup: "4-5 years", order: 1 },
            { title: "Participates in music and movement activities", ageGroup: "3-4 years", order: 2 },
            { title: "Engages in imaginative/pretend play", ageGroup: "3-4 years", order: 3 },
            { title: "Uses art materials purposefully (paint, clay)", ageGroup: "3-4 years", order: 4 },
            { title: "Creates a simple craft with guidance", ageGroup: "4-5 years", order: 5 },
            { title: "Sings songs and remembers simple lyrics", ageGroup: "3-4 years", order: 6 },
        ],
        skills: [
            { name: "Drawing & Painting", order: 1 },
            { name: "Music & Rhythm", order: 2 },
            { name: "Imaginative Play", order: 3 },
            { name: "Craft & Construction", order: 4 },
            { name: "Creative Expression", order: 5 },
        ],
    },
];

// ─── SEED DEFAULT DOMAINS ─────────────────────────────────────────────────────

export async function seedDefaultDomainsAction(schoolId: string) {
    try {
        const existing = await prisma.developmentDomain.count({ where: { schoolId } });
        if (existing > 0) return { success: true, seeded: false };

        for (const domain of DEFAULT_DOMAINS) {
            const { milestones, skills, ...domainData } = domain;
            const created = await prisma.developmentDomain.create({
                data: { ...domainData, schoolId },
            });
            await prisma.developmentMilestone.createMany({
                data: milestones.map((m) => ({ ...m, domainId: created.id })),
            });
            await prisma.skillItem.createMany({
                data: skills.map((s) => ({ ...s, domainId: created.id })),
            });
        }

        return { success: true, seeded: true };
    } catch (error: any) {
        console.error("Seed Domains Error:", error);
        return { success: false, error: error.message };
    }
}

// ─── GET DOMAINS WITH MILESTONES & SKILLS ─────────────────────────────────────

export async function getDevelopmentDomainsAction(schoolId: string) {
    try {
        const domains = await prisma.developmentDomain.findMany({
            where: { schoolId },
            include: {
                milestones: { orderBy: { order: "asc" } },
                skills: { orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
        });
        return { success: true, data: domains };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─── MILESTONE RECORDS ────────────────────────────────────────────────────────

export async function getStudentMilestonesAction(
    studentId: string,
    academicYearId?: string
) {
    try {
        const records = await prisma.milestoneRecord.findMany({
            where: { studentId, academicYearId: academicYearId || null },
            include: { milestone: { include: { domain: true } } },
        });
        return { success: true, data: records };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function upsertMilestoneRecordAction(
    studentId: string,
    milestoneId: string,
    status: "NOT_STARTED" | "IN_PROGRESS" | "ACHIEVED",
    notes: string,
    academicYearId?: string
) {
    try {
        const user = await getCurrentUserAction();
        const recordedById = user?.success ? user.user?.id : undefined;

        const record = await prisma.milestoneRecord.upsert({
            where: {
                studentId_milestoneId_academicYearId: {
                    studentId,
                    milestoneId,
                    academicYearId: academicYearId || null,
                },
            },
            create: {
                studentId,
                milestoneId,
                status,
                notes,
                academicYearId: academicYearId || null,
                recordedById,
                achievedDate: status === "ACHIEVED" ? new Date() : null,
            },
            update: {
                status,
                notes,
                recordedById,
                achievedDate: status === "ACHIEVED" ? new Date() : null,
            },
        });
        return { success: true, data: record };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─── SKILL ASSESSMENTS ────────────────────────────────────────────────────────

export async function getStudentSkillsAction(
    studentId: string,
    term: string,
    academicYearId?: string
) {
    try {
        const assessments = await prisma.skillAssessment.findMany({
            where: { studentId, term, academicYearId: academicYearId || null },
            include: { skill: { include: { domain: true } } },
        });
        return { success: true, data: assessments };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function upsertSkillAssessmentAction(
    studentId: string,
    skillId: string,
    rating: number,
    term: string,
    notes: string,
    academicYearId?: string
) {
    try {
        const user = await getCurrentUserAction();
        const recordedById = user?.success ? user.user?.id : undefined;

        const assessment = await prisma.skillAssessment.upsert({
            where: {
                studentId_skillId_term_academicYearId: {
                    studentId,
                    skillId,
                    term,
                    academicYearId: academicYearId || null,
                },
            },
            create: {
                studentId,
                skillId,
                rating,
                term,
                notes,
                academicYearId: academicYearId || null,
                recordedById,
            },
            update: { rating, notes, recordedById },
        });
        return { success: true, data: assessment };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function bulkUpsertSkillAssessmentsAction(
    studentId: string,
    assessments: Array<{ skillId: string; rating: number; notes: string }>,
    term: string,
    academicYearId?: string
) {
    try {
        const user = await getCurrentUserAction();
        const recordedById = user?.success ? user.user?.id : undefined;

        const results = await Promise.all(
            assessments.map((a) =>
                prisma.skillAssessment.upsert({
                    where: {
                        studentId_skillId_term_academicYearId: {
                            studentId,
                            skillId: a.skillId,
                            term,
                            academicYearId: academicYearId || null,
                        },
                    },
                    create: {
                        studentId,
                        skillId: a.skillId,
                        rating: a.rating,
                        term,
                        notes: a.notes,
                        academicYearId: academicYearId || null,
                        recordedById,
                    },
                    update: { rating: a.rating, notes: a.notes, recordedById },
                })
            )
        );
        return { success: true, data: results };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─── PORTFOLIO ENTRIES ────────────────────────────────────────────────────────

export async function getPortfolioEntriesAction(
    studentId: string,
    academicYearId?: string
) {
    try {
        const entries = await prisma.portfolioEntry.findMany({
            where: { studentId, academicYearId: academicYearId || null },
            orderBy: { createdAt: "desc" },
            include: { recordedBy: { select: { firstName: true, lastName: true } } },
        });
        return { success: true, data: entries };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createPortfolioEntryAction(
    studentId: string,
    data: {
        title: string;
        description?: string;
        type: string;
        mediaUrl?: string;
        thumbnailUrl?: string;
        tags?: string[];
        domainId?: string;
        academicYearId?: string;
    }
) {
    try {
        const user = await getCurrentUserAction();
        const recordedById = user?.success ? user.user?.id : undefined;

        const entry = await prisma.portfolioEntry.create({
            data: {
                studentId,
                title: data.title,
                description: data.description,
                type: data.type,
                mediaUrl: data.mediaUrl,
                thumbnailUrl: data.thumbnailUrl,
                tags: JSON.stringify(data.tags || []),
                domainId: data.domainId,
                academicYearId: data.academicYearId || null,
                recordedById,
            },
        });
        return { success: true, data: entry };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePortfolioEntryAction(entryId: string) {
    try {
        await prisma.portfolioEntry.delete({ where: { id: entryId } });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─── DEVELOPMENT REPORTS ──────────────────────────────────────────────────────

export async function getDevelopmentReportAction(
    studentId: string,
    term: string,
    academicYearId?: string
) {
    try {
        const report = await prisma.developmentReport.findFirst({
            where: { studentId, term, academicYearId: academicYearId || null },
            include: { recordedBy: { select: { firstName: true, lastName: true } } },
        });
        return { success: true, data: report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function saveDevelopmentReportAction(
    studentId: string,
    term: string,
    data: {
        teacherNarrative?: string;
        strengthsNotes?: string;
        areasToGrow?: string;
        parentMessage?: string;
    },
    academicYearId?: string
) {
    try {
        const user = await getCurrentUserAction();
        const recordedById = user?.success ? user.user?.id : undefined;

        const report = await prisma.developmentReport.upsert({
            where: {
                studentId_term_academicYearId: {
                    studentId,
                    term,
                    academicYearId: academicYearId || null,
                },
            },
            create: {
                studentId,
                term,
                ...data,
                academicYearId: academicYearId || null,
                recordedById,
            },
            update: { ...data, recordedById },
        });
        return { success: true, data: report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function publishDevelopmentReportAction(reportId: string) {
    try {
        const report = await prisma.developmentReport.update({
            where: { id: reportId },
            data: { published: true, publishedAt: new Date() },
        });
        return { success: true, data: report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─── DOMAIN MANAGEMENT (SETTINGS) ────────────────────────────────────────────

export async function createDevelopmentDomainAction(
    schoolId: string,
    data: { name: string; description?: string; color?: string; icon?: string }
) {
    try {
        const count = await prisma.developmentDomain.count({ where: { schoolId } });
        const domain = await prisma.developmentDomain.create({
            data: { ...data, schoolId, order: count + 1 },
        });
        return { success: true, data: domain };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateDevelopmentDomainAction(
    domainId: string,
    data: { name?: string; description?: string; color?: string; icon?: string }
) {
    try {
        const domain = await prisma.developmentDomain.update({
            where: { id: domainId },
            data,
        });
        return { success: true, data: domain };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteDevelopmentDomainAction(domainId: string) {
    try {
        await prisma.developmentDomain.delete({ where: { id: domainId } });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createMilestoneAction(
    domainId: string,
    data: { title: string; description?: string; ageGroup?: string }
) {
    try {
        const count = await prisma.developmentMilestone.count({ where: { domainId } });
        const milestone = await prisma.developmentMilestone.create({
            data: { ...data, domainId, order: count + 1 },
        });
        return { success: true, data: milestone };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateMilestoneAction(
    milestoneId: string,
    data: { title?: string; description?: string; ageGroup?: string }
) {
    try {
        const milestone = await prisma.developmentMilestone.update({
            where: { id: milestoneId },
            data,
        });
        return { success: true, data: milestone };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteMilestoneAction(milestoneId: string) {
    try {
        await prisma.developmentMilestone.delete({ where: { id: milestoneId } });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createSkillItemAction(
    domainId: string,
    data: { name: string; description?: string }
) {
    try {
        const count = await prisma.skillItem.count({ where: { domainId } });
        const skill = await prisma.skillItem.create({
            data: { ...data, domainId, order: count + 1 },
        });
        return { success: true, data: skill };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteSkillItemAction(skillId: string) {
    try {
        await prisma.skillItem.delete({ where: { id: skillId } });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─── CLASS-LEVEL OVERVIEW ─────────────────────────────────────────────────────

export async function getClassDevelopmentSummaryAction(
    classroomId: string,
    academicYearId?: string
) {
    try {
        const students = await prisma.student.findMany({
            where: { classroomId, status: "ACTIVE" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                milestoneRecords: {
                    where: { academicYearId: academicYearId || null },
                    select: { status: true },
                },
                skillAssessments: {
                    where: { academicYearId: academicYearId || null },
                    select: { rating: true },
                },
                developmentReports: {
                    where: { academicYearId: academicYearId || null },
                    select: { published: true, term: true },
                },
            },
            orderBy: { firstName: "asc" },
        });

        const summary = students.map((s) => {
            const totalMilestones = s.milestoneRecords.length;
            const achieved = s.milestoneRecords.filter((r) => r.status === "ACHIEVED").length;
            const avgRating =
                s.skillAssessments.length > 0
                    ? s.skillAssessments.reduce((sum, a) => sum + a.rating, 0) /
                    s.skillAssessments.length
                    : 0;

            return {
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                avatar: s.avatar,
                milestoneProgress: totalMilestones > 0 ? Math.round((achieved / totalMilestones) * 100) : 0,
                achievedMilestones: achieved,
                totalMilestones,
                avgSkillRating: Math.round(avgRating * 10) / 10,
                reports: s.developmentReports,
            };
        });

        return { success: true, data: summary };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
