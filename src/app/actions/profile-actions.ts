"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserAction } from "./session-actions";

export async function getProfileDataAction(slug: string) {
    try {
        // Get current user from session
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) {
            return {
                success: false,
                error: "Not authenticated"
            };
        }

        const currentUser = userRes.data as any;

        // Get school with subscription and plan details
        const school = await prisma.school.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                subscription: {
                    select: {
                        id: true,
                        status: true,
                        startDate: true,
                        endDate: true,
                        plan: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                tier: true,
                                price: true,
                                currency: true,
                                billingPeriod: true,
                                maxStudents: true,
                                maxStaff: true,
                                maxStorageGB: true,
                                features: true,
                                addonUserTiers: true,
                            }
                        },
                        addonUsers: true,
                    }
                }
            }
        });

        if (!school) {
            return {
                success: false,
                error: "School not found"
            };
        }

        // Get usage statistics
        const [studentCount, staffCount, storageUsage] = await Promise.all([
            prisma.student.count({
                where: { schoolId: school.id }
            }),
            prisma.user.count({
                where: {
                    schoolId: school.id,
                    status: "ACTIVE"
                }
            }),
            prisma.trainingAttachment.aggregate({
                _sum: {
                    size: true
                }
            })
        ]);

        // Safely calculate storage usage (convert bytes to GB)
        const totalSizeBytes = (storageUsage as any)?._sum?.size || 0;
        const storageUsedGB = totalSizeBytes / (1024 * 1024 * 1024);


        // Calculate days remaining
        let daysRemaining = null;
        if (school.subscription?.endDate) {
            const now = new Date();
            const endDate = new Date(school.subscription.endDate);
            const diffTime = endDate.getTime() - now.getTime();
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Determine subscription status with warnings
        let subscriptionStatus = school.subscription?.status || "TRIAL";
        if (daysRemaining !== null) {
            if (daysRemaining < 0) {
                subscriptionStatus = "EXPIRED";
            } else if (daysRemaining <= 7) {
                subscriptionStatus = "EXPIRING_SOON";
            }
        }

        // Parse features if they're stored as JSON string
        let features: string[] = [];
        if (school.subscription?.plan?.features) {
            try {
                features = typeof school.subscription.plan.features === 'string'
                    ? JSON.parse(school.subscription.plan.features)
                    : school.subscription.plan.features;
            } catch (e) {
                features = [];
            }
        }

        // Parse addonUserTiers
        let addonUserTiers: any[] = [];
        if (school.subscription?.plan?.addonUserTiers) {
            try {
                addonUserTiers = typeof school.subscription.plan.addonUserTiers === 'string'
                    ? JSON.parse(school.subscription.plan.addonUserTiers)
                    : school.subscription.plan.addonUserTiers;
            } catch (e) {
                addonUserTiers = [];
            }
        }

        return {
            success: true,
            data: {
                user: {
                    id: currentUser.id,
                    firstName: currentUser.firstName || "",
                    lastName: currentUser.lastName || "",
                    email: currentUser.email || currentUser.mobile,
                    mobile: currentUser.mobile,
                    role: currentUser.role,
                    avatar: currentUser.avatar || null,
                    avatarAdjustment: currentUser.avatarAdjustment || null,
                },
                school: {
                    name: school.name,
                    slug: school.slug,
                    logo: school.logo || null,
                },
                subscription: school.subscription ? {
                    id: school.subscription.id,
                    status: subscriptionStatus,
                    startDate: school.subscription.startDate,
                    endDate: school.subscription.endDate,
                    daysRemaining,
                    plan: {
                        id: school.subscription.plan.id,
                        name: school.subscription.plan.name,
                        slug: school.subscription.plan.slug,
                        tier: school.subscription.plan.tier,
                        price: school.subscription.plan.price,
                        currency: school.subscription.plan.currency,
                        billingPeriod: school.subscription.plan.billingPeriod,
                        maxStudents: school.subscription.plan.maxStudents,
                        maxStaff: school.subscription.plan.maxStaff,
                        maxStorageGB: school.subscription.plan.maxStorageGB,
                        features,
                        addonUserTiers,
                    },
                    addonUsers: school.subscription.addonUsers || 0,
                } : null,
                usage: {
                    currentStudents: studentCount,
                    currentStaff: staffCount,
                    storageUsedGB: storageUsedGB || 0.1, // Using 0.1 as a baseline for system files
                }
            }
        };
    } catch (error: any) {
        console.error("Error fetching profile data:", error);
        return {
            success: false,
            error: `Failed to fetch profile data: ${error.message || "Unknown error"}`
        };
    }
}

/**
 * Get the full admin profile for the dedicated profile page.
 * Returns complete user data with all fields for editing.
 */
export async function getFullAdminProfileAction(slug: string) {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) {
            return { success: false, error: "Not authenticated" };
        }

        const currentUser = userRes.data as any;

        // Get full user data from DB
        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                mobile: true,
                avatar: true,
                avatarAdjustment: true,
                gender: true,
                dateOfBirth: true,
                bloodGroup: true,
                role: true,
                designation: true,
                department: true,
                employmentType: true,
                joiningDate: true,
                qualifications: true,
                experience: true,
                subjects: true,
                status: true,
                address: true,
                addressCity: true,
                addressState: true,
                addressZip: true,
                addressCountry: true,
                emergencyContactName: true,
                emergencyContactPhone: true,
                emergencyContactRelation: true,
                bankName: true,
                bankAccountNo: true,
                bankIfsc: true,
                facebook: true,
                linkedin: true,
                twitter: true,
                instagram: true,
                modulePermissions: true,
                createdAt: true,
                updatedAt: true,
                school: {
                    select: {
                        name: true,
                        slug: true,
                        logo: true,
                        currency: true,
                    }
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                customRole: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                managedClassrooms: {
                    select: {
                        id: true,
                        name: true,
                        _count: { select: { students: true } }
                    }
                },
                _count: {
                    select: {
                        leaveRequests: true,
                        staffAttendance: true,
                        createdExams: true,
                        diaryEntries: true,
                    }
                }
            }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Calculate staff stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [attendanceCount, presentCount] = await Promise.all([
            prisma.staffAttendance.count({
                where: { userId: user.id, date: { gte: thirtyDaysAgo } }
            }),
            prisma.staffAttendance.count({
                where: { userId: user.id, date: { gte: thirtyDaysAgo }, status: 'PRESENT' }
            })
        ]);

        const attendanceRate = attendanceCount > 0
            ? Math.round((presentCount / attendanceCount) * 100)
            : 100;

        return {
            success: true,
            data: {
                ...user,
                dateOfBirth: user.dateOfBirth?.toISOString() || null,
                joiningDate: user.joiningDate?.toISOString() || null,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                stats: {
                    attendanceRate,
                    classroomsManaged: user.managedClassrooms.length,
                    totalStudents: user.managedClassrooms.reduce((acc, c) => acc + c._count.students, 0),
                    leavesTaken: user._count.leaveRequests,
                    examsCreated: user._count.createdExams,
                    diaryEntries: user._count.diaryEntries,
                }
            }
        };
    } catch (error: any) {
        console.error("Error fetching full admin profile:", error);
        return { success: false, error: `Failed to fetch profile: ${error.message}` };
    }
}

/**
 * Update admin profile fields.
 */
export async function updateAdminProfileAction(slug: string, data: Record<string, any>) {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) {
            return { success: false, error: "Not authenticated" };
        }

        const currentUser = userRes.data as any;

        // Allowed fields for update
        const allowedFields = [
            'firstName', 'lastName', 'email', 'gender', 'dateOfBirth', 'bloodGroup',
            'designation', 'department', 'employmentType', 'qualifications', 'experience', 'subjects',
            'address', 'addressCity', 'addressState', 'addressZip', 'addressCountry',
            'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
            'bankName', 'bankAccountNo', 'bankIfsc',
            'facebook', 'linkedin', 'twitter', 'instagram',
            'avatar', 'avatarAdjustment'
        ];

        // Filter only allowed fields
        const updateData: Record<string, any> = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                if (field === 'dateOfBirth' && data[field]) {
                    updateData[field] = new Date(data[field]);
                } else {
                    updateData[field] = data[field];
                }
            }
        }

        if (Object.keys(updateData).length === 0) {
            return { success: false, error: "No valid fields to update" };
        }

        await prisma.user.update({
            where: { id: currentUser.id },
            data: updateData
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error updating admin profile:", error);
        return { success: false, error: `Failed to update profile: ${error.message}` };
    }
}
