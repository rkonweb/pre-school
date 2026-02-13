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
                            }
                        }
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
        const [studentCount, staffCount] = await Promise.all([
            prisma.student.count({
                where: { schoolId: school.id }
            }),
            prisma.user.count({
                where: {
                    schoolId: school.id,
                    status: "ACTIVE"
                }
            })
        ]);

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
                    }
                } : null,
                usage: {
                    currentStudents: studentCount,
                    currentStaff: staffCount,
                    storageUsedGB: 0, // TODO: Calculate actual storage usage
                }
            }
        };
    } catch (error) {
        console.error("Error fetching profile data:", error);
        return {
            success: false,
            error: "Failed to fetch profile data"
        };
    }
}
