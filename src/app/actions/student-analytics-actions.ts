"use server";

import { prisma } from "@/lib/prisma";

// Types for analytics data
export interface SubjectPerformance {
    subject: string;
    marks: number;
    grade: string;
    status: string;
    maxMarks: number;
    percentage: number;
}

export interface AttendanceStats {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    sick: number;
    leave: number;
    percentage: number;
    monthlyData: Array<{ month: string; present: number; total: number }>;
}

export interface HealthMetrics {
    latest: {
        height?: number;
        weight?: number;
        bmi?: number;
        bloodPressure?: string;
        pulseRate?: number;
        recordedAt: Date;
    } | null;
    growthTrend: Array<{
        date: Date;
        height?: number;
        weight?: number;
        bmi?: number;
    }>;
    alerts: string[];
}

export interface ActivitySummary {
    total: number;
    awards: number;
    participations: number;
    byCategory: Record<string, number>;
    recent: Array<{
        id: string;
        title: string;
        category: string;
        type: string;
        date: Date;
        achievement?: string;
    }>;
}

export interface AIInsight {
    type: 'strength' | 'weakness' | 'improvement' | 'concern' | 'achievement';
    category: 'academic' | 'attendance' | 'health' | 'activity';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
}

export interface StudentAnalytics {
    student: {
        id: string;
        name: string;
        grade: string;
        avatar?: string;
        admissionNumber?: string;
    };
    academic: {
        subjects: SubjectPerformance[];
        overallPercentage: number;
        overallGrade: string;
        classAverage?: number;
        trend: 'improving' | 'declining' | 'stable';
        consistencyScore: number;
    };
    attendance: AttendanceStats;
    health: HealthMetrics;
    activities: ActivitySummary;
    insights: AIInsight[];
}

/**
 * Calculate grade from percentage
 */
function calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
}

/**
 * Calculate BMI
 */
function calculateBMI(weight: number, height: number): number {
    // height in cm, weight in kg
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

/**
 * Generate AI insights based on student data
 */
function generateInsights(analytics: Omit<StudentAnalytics, 'insights'>): AIInsight[] {
    const insights: AIInsight[] = [];

    // Academic insights
    const { overallPercentage, trend, subjects } = analytics.academic;

    if (overallPercentage >= 85) {
        insights.push({
            type: 'strength',
            category: 'academic',
            title: 'Excellent Academic Performance',
            description: `Outstanding overall performance with ${overallPercentage.toFixed(1)}% average. Keep up the great work!`,
            severity: 'low'
        });
    } else if (overallPercentage < 50) {
        insights.push({
            type: 'concern',
            category: 'academic',
            title: 'Academic Support Needed',
            description: `Current performance at ${overallPercentage.toFixed(1)}% requires attention. Consider additional tutoring or study support.`,
            severity: 'high'
        });
    }

    if (trend === 'improving') {
        insights.push({
            type: 'improvement',
            category: 'academic',
            title: 'Showing Academic Improvement',
            description: 'Performance trend is positive. Student is making consistent progress.',
            severity: 'low'
        });
    } else if (trend === 'declining') {
        insights.push({
            type: 'concern',
            category: 'academic',
            title: 'Declining Performance Trend',
            description: 'Recent performance shows a declining trend. Early intervention recommended.',
            severity: 'medium'
        });
    }

    // Find weak subjects
    const weakSubjects = subjects.filter(s => s.percentage < 50);
    if (weakSubjects.length > 0) {
        insights.push({
            type: 'weakness',
            category: 'academic',
            title: 'Subjects Needing Attention',
            description: `Focus needed in: ${weakSubjects.map(s => s.subject).join(', ')}`,
            severity: 'medium'
        });
    }

    // Find strong subjects
    const strongSubjects = subjects.filter(s => s.percentage >= 85);
    if (strongSubjects.length > 0) {
        insights.push({
            type: 'strength',
            category: 'academic',
            title: 'Subject Strengths',
            description: `Excelling in: ${strongSubjects.map(s => s.subject).join(', ')}`,
            severity: 'low'
        });
    }

    // Attendance insights
    const { percentage: attendancePercentage } = analytics.attendance;

    if (attendancePercentage >= 95) {
        insights.push({
            type: 'strength',
            category: 'attendance',
            title: 'Excellent Attendance',
            description: `Outstanding attendance at ${attendancePercentage.toFixed(1)}%. Regular presence contributes to better learning.`,
            severity: 'low'
        });
    } else if (attendancePercentage < 75) {
        insights.push({
            type: 'concern',
            category: 'attendance',
            title: 'Attendance Needs Improvement',
            description: `Current attendance at ${attendancePercentage.toFixed(1)}% is below recommended levels. Regular attendance is crucial for academic success.`,
            severity: 'high'
        });
    }

    // Health insights
    if (analytics.health.latest?.bmi) {
        const bmi = analytics.health.latest.bmi;
        if (bmi < 16 || bmi > 25) {
            insights.push({
                type: 'concern',
                category: 'health',
                title: 'Health Monitoring Recommended',
                description: `BMI of ${bmi.toFixed(1)} suggests consultation with healthcare provider for optimal health.`,
                severity: 'medium'
            });
        }
    }

    if (analytics.health.alerts.length > 0) {
        insights.push({
            type: 'concern',
            category: 'health',
            title: 'Health Alerts',
            description: analytics.health.alerts.join('. '),
            severity: 'high'
        });
    }

    // Activity insights
    const { awards, total } = analytics.activities;

    if (awards >= 3) {
        insights.push({
            type: 'achievement',
            category: 'activity',
            title: 'Outstanding in Co-curricular Activities',
            description: `Achieved ${awards} awards in various activities. Excellent all-round development!`,
            severity: 'low'
        });
    } else if (total === 0) {
        insights.push({
            type: 'weakness',
            category: 'activity',
            title: 'Limited Co-curricular Participation',
            description: 'Encourage participation in sports, arts, or clubs for holistic development.',
            severity: 'low'
        });
    }

    return insights;
}

/**
 * Get comprehensive student analytics
 */
export async function getStudentAnalyticsAction(studentId: string) {
    try {
        // Fetch student with all related data
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                attendance: {
                    orderBy: { date: 'desc' }
                },
                examResults: {
                    include: {
                        exam: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                healthRecords: {
                    orderBy: { recordedAt: 'desc' }
                },
                activityRecords: {
                    orderBy: { date: 'desc' }
                },
                classroom: true
            }
        });

        if (!student) {
            return { success: false, error: 'Student not found' };
        }

        // 1. Calculate Academic Performance
        const subjectMap = new Map<string, { total: number; count: number; maxMarks: number }>();

        student.examResults.forEach(result => {
            if (result.marks && result.subject) {
                const existing = subjectMap.get(result.subject) || { total: 0, count: 0, maxMarks: 0 };
                subjectMap.set(result.subject, {
                    total: existing.total + result.marks,
                    count: existing.count + 1,
                    maxMarks: result.exam.maxMarks
                });
            }
        });

        const subjects: SubjectPerformance[] = Array.from(subjectMap.entries()).map(([subject, data]) => {
            const avgMarks = data.total / data.count;
            const percentage = (avgMarks / data.maxMarks) * 100;
            return {
                subject,
                marks: parseFloat(avgMarks.toFixed(2)),
                grade: calculateGrade(percentage),
                status: percentage >= (data.maxMarks * 0.4) ? 'PASSED' : 'FAILED',
                maxMarks: data.maxMarks,
                percentage: parseFloat(percentage.toFixed(2))
            };
        });

        const overallPercentage = subjects.length > 0
            ? subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length
            : 0;

        // Calculate trend (compare recent vs older results)
        const recentResults = student.examResults.slice(0, 5);
        const olderResults = student.examResults.slice(5, 10);
        const recentAvg = recentResults.length > 0
            ? recentResults.reduce((sum, r) => sum + (r.marks || 0), 0) / recentResults.length
            : 0;
        const olderAvg = olderResults.length > 0
            ? olderResults.reduce((sum, r) => sum + (r.marks || 0), 0) / olderResults.length
            : recentAvg;

        const trend: 'improving' | 'declining' | 'stable' =
            recentAvg > olderAvg + 5 ? 'improving' :
                recentAvg < olderAvg - 5 ? 'declining' : 'stable';

        // Calculate consistency (lower variance = more consistent)
        const variance = subjects.length > 0
            ? subjects.reduce((sum, s) => sum + Math.pow(s.percentage - overallPercentage, 2), 0) / subjects.length
            : 0;
        const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

        // 2. Calculate Attendance Stats
        const attendanceByStatus = student.attendance.reduce((acc, att) => {
            acc[att.status] = (acc[att.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const totalDays = student.attendance.length;
        const present = attendanceByStatus['PRESENT'] || 0;
        const absent = attendanceByStatus['ABSENT'] || 0;
        const late = attendanceByStatus['LATE'] || 0;
        const sick = attendanceByStatus['SICK'] || 0;
        const leave = attendanceByStatus['LEAVE'] || 0;
        const attendancePercentage = totalDays > 0 ? (present / totalDays) * 100 : 0;

        // Monthly attendance data
        const monthlyData = student.attendance.reduce((acc, att) => {
            const month = new Date(att.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const existing = acc.find(m => m.month === month);
            if (existing) {
                existing.total++;
                if (att.status === 'PRESENT') existing.present++;
            } else {
                acc.push({
                    month,
                    present: att.status === 'PRESENT' ? 1 : 0,
                    total: 1
                });
            }
            return acc;
        }, [] as Array<{ month: string; present: number; total: number }>);

        // 3. Health Metrics
        const latestHealth = student.healthRecords[0] || null;
        const healthAlerts: string[] = [];

        if (latestHealth) {
            if (latestHealth.bmi && (latestHealth.bmi < 16 || latestHealth.bmi > 25)) {
                healthAlerts.push('BMI outside healthy range');
            }
            if (latestHealth.visionLeft === 'POOR' || latestHealth.visionRight === 'POOR') {
                healthAlerts.push('Vision check recommended');
            }
            if (latestHealth.hearingLeft === 'POOR' || latestHealth.hearingRight === 'POOR') {
                healthAlerts.push('Hearing check recommended');
            }
        }

        const growthTrend = student.healthRecords.slice(0, 10).map(record => ({
            date: record.recordedAt,
            height: record.height || undefined,
            weight: record.weight || undefined,
            bmi: record.bmi || undefined
        }));

        // 4. Activity Summary
        const activityByCategory = student.activityRecords.reduce((acc, activity) => {
            acc[activity.category] = (acc[activity.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const awards = student.activityRecords.filter(a => a.type === 'AWARD').length;
        const participations = student.activityRecords.filter(a => a.type === 'PARTICIPATION').length;

        const analytics: Omit<StudentAnalytics, 'insights'> = {
            student: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                grade: student.grade || 'N/A',
                avatar: student.avatar || undefined,
                admissionNumber: student.admissionNumber || undefined
            },
            academic: {
                subjects,
                overallPercentage: parseFloat(overallPercentage.toFixed(2)),
                overallGrade: calculateGrade(overallPercentage),
                trend,
                consistencyScore: parseFloat(consistencyScore.toFixed(2))
            },
            attendance: {
                totalDays,
                present,
                absent,
                late,
                sick,
                leave,
                percentage: parseFloat(attendancePercentage.toFixed(2)),
                monthlyData
            },
            health: {
                latest: latestHealth ? {
                    height: latestHealth.height || undefined,
                    weight: latestHealth.weight || undefined,
                    bmi: latestHealth.bmi || undefined,
                    bloodPressure: latestHealth.bloodPressure || undefined,
                    pulseRate: latestHealth.pulseRate || undefined,
                    recordedAt: latestHealth.recordedAt
                } : null,
                growthTrend,
                alerts: healthAlerts
            },
            activities: {
                total: student.activityRecords.length,
                awards,
                participations,
                byCategory: activityByCategory,
                recent: student.activityRecords.slice(0, 5).map(a => ({
                    id: a.id,
                    title: a.title,
                    category: a.category,
                    type: a.type,
                    date: a.date,
                    achievement: a.achievement || undefined
                }))
            }
        };

        // Generate AI insights
        const insights = generateInsights(analytics);

        const fullAnalytics: StudentAnalytics = {
            ...analytics,
            insights
        };

        return { success: true, data: fullAnalytics };
    } catch (error: any) {
        console.error('Error fetching student analytics:', error);
        return { success: false, error: error.message };
    }
}
