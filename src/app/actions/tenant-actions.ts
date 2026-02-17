"use server";

import { prisma } from "@/lib/prisma";
import { Tenant, CreateTenantInput } from "@/types/tenant";
import { revalidatePath } from "next/cache";
import { calculateMRR, PLAN_FEATURES, ADDONS } from "@/config/subscription";

export async function getTenantsAction(): Promise<Tenant[]> {
    // Fetch real data from DB
    const schools = await prisma.school.findMany({
        include: {
            users: {
                where: { role: "ADMIN" },
                take: 1
            },
            subscription: {
                include: { plan: true }
            },
            _count: {
                select: { students: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Map to Tenant Interface
    return schools.map(school => {
        const admin = school.users[0];
        const sub = school.subscription;

        // Determine plan name from plan relation
        const planName = sub?.plan?.name || "No Plan";
        const planPrice = sub?.plan?.price || 0;

        const addons = (() => {
            try {
                return (school as any).addonsConfig ? JSON.parse((school as any).addonsConfig) : [];
            } catch (e) {
                return [];
            }
        })();

        const addonsCost = addons.reduce((sum: number, id: string) => {
            const addon = ADDONS.find(a => a.id === id);
            return sum + (addon?.price || 0);
        }, 0);

        return {
            id: school.id,
            name: school.name,
            subdomain: school.slug,
            brandColor: school.brandColor || "#0F172A",
            adminName: admin ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || "Admin" : "No Admin",
            email: admin?.email || admin?.mobile || "N/A",
            plan: planName,
            status: (sub?.status as any) || "TRIAL",
            subscriptionEndDate: sub?.endDate ? sub.endDate.toISOString() : undefined,
            students: school._count.students,
            mrr: planPrice + addonsCost,
            joinedDate: school.createdAt.toISOString(),
            region: "India",
            lastActive: school.updatedAt.toISOString(),
            website: school.website || `https://${school.slug}.antigravity.com`,
            contactPhone: school.phone || admin?.mobile || undefined,
            contactEmail: school.email || undefined,
            currency: (school as any).currency || undefined,
            timezone: (school as any).timezone || undefined,
            dateFormat: (school as any).dateFormat || undefined,
            logo: school.logo || undefined,
            motto: school.motto || undefined,
            foundingYear: school.foundingYear || undefined,
            address: school.address || undefined,
            city: school.city || undefined,
            state: school.state || undefined,
            zip: school.zip || undefined,
            country: school.country || undefined,
            latitude: school.latitude || undefined,
            longitude: school.longitude || undefined,
            adminPhone: admin?.mobile || undefined,
            adminDesignation: admin?.designation || undefined,
            socialMedia: {
                facebook: (school as any).facebook || undefined,
                twitter: (school as any).twitter || undefined,
                linkedin: (school as any).linkedin || undefined,
                instagram: (school as any).instagram || undefined,
                youtube: (school as any).youtube || undefined,
            },
            modules: (() => {
                try {
                    return (school as any).modulesConfig ? JSON.parse((school as any).modulesConfig) : [];
                } catch (e) {
                    return [];
                }
            })(),
            addons: (() => {
                try {
                    return (school as any).addonsConfig ? JSON.parse((school as any).addonsConfig) : [];
                } catch (e) {
                    return [];
                }
            })()
        };
    });
}

export async function createTenantAction(data: CreateTenantInput) {
    try {
        // Map admin name to first/last
        const nameParts = data.adminName.split(" ");
        const firstName = nameParts[0] || "Admin";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Primary contact number for owner
        const mobile = data.adminPhone || data.contactPhone || `mock-${Date.now()}`;

        // Global Phone Uniqueness Check for admin phone
        if (mobile && !mobile.startsWith('mock-')) {
            const { validatePhoneUniqueness, validateEmailUniqueness } = await import("./identity-validation");
            const phoneCheck = await validatePhoneUniqueness(mobile);
            if (!phoneCheck.isValid) {
                return { success: false, error: phoneCheck.error };
            }

            // Check admin email if provided
            const adminEmail = data.email || data.contactEmail;
            if (adminEmail) {
                const emailCheck = await validateEmailUniqueness(adminEmail);
                if (!emailCheck.isValid) {
                    return { success: false, error: emailCheck.error };
                }
            }
        }

        // Check school contact phone if different from admin phone
        if (data.contactPhone && data.contactPhone !== mobile) {
            const { validatePhoneUniqueness, validateEmailUniqueness } = await import("./identity-validation");
            const phoneCheck = await validatePhoneUniqueness(data.contactPhone);
            if (!phoneCheck.isValid) {
                return { success: false, error: phoneCheck.error };
            }

            // Check school email if different
            if (data.contactEmail && data.contactEmail !== data.email) {
                const emailCheck = await validateEmailUniqueness(data.contactEmail);
                if (!emailCheck.isValid) {
                    return { success: false, error: emailCheck.error };
                }
            }
        }

        // Get or Create Subscription Plan (Auto-Seeding)
        let planId = "";
        const planInput = data.plan || "Growth";

        let existingPlan = await prisma.subscriptionPlan.findUnique({
            where: { id: planInput }
        });

        if (!existingPlan) {
            existingPlan = await prisma.subscriptionPlan.findFirst({
                where: { name: planInput }
            });
        }

        if (existingPlan) {
            planId = existingPlan.id;
        } else {
            // Fallback: If plan input was a name like "Growth", create it
            const planSlug = planInput.toLowerCase();
            const newPlan = await prisma.subscriptionPlan.create({
                data: {
                    name: planInput,
                    slug: planSlug,
                    price: planInput === "Enterprise" ? 299 : planInput === "Growth" ? 99 : 0,
                    description: `Auto-generated ${planInput} Plan`,
                    tier: planInput === "Enterprise" ? "enterprise" : planInput === "Growth" ? "premium" : "basic",
                    maxStudents: planInput === "Enterprise" ? 5000 : planInput === "Growth" ? 1000 : 100,
                    maxStaff: planInput === "Enterprise" ? 500 : planInput === "Growth" ? 100 : 20,
                    maxStorageGB: planInput === "Enterprise" ? 1000 : planInput === "Growth" ? 100 : 10,
                    isActive: true
                }
            });
            planId = newPlan.id;
        }

        await prisma.$transaction(async (tx) => {
            const school = await (tx.school as any).create({
                data: {
                    name: data.name,
                    slug: data.subdomain,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zip: data.zip,
                    country: data.country,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    phone: data.contactPhone,
                    email: data.contactEmail,
                    website: data.website,
                    motto: data.motto,
                    foundingYear: data.foundingYear,
                    logo: data.logo,
                    brandColor: data.brandColor,

                    // Social
                    facebook: data.socialMedia?.facebook,
                    twitter: data.socialMedia?.twitter,
                    linkedin: data.socialMedia?.linkedin,
                    instagram: data.socialMedia?.instagram,
                    youtube: data.socialMedia?.youtube,

                    // Config
                    currency: data.currency,
                    timezone: data.timezone,
                    dateFormat: data.dateFormat,
                    modulesConfig: JSON.stringify(PLAN_FEATURES[data.plan || "Starter"] || [])
                }
            });

            await tx.user.create({
                data: {
                    firstName,
                    lastName,
                    mobile,
                    email: data.contactEmail || data.email,
                    designation: data.adminDesignation,
                    schoolId: school.id,
                    role: "ADMIN"
                }
            });

            await tx.subscription.create({
                data: {
                    schoolId: school.id,
                    planId,
                    status: "ACTIVE",
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                }
            });
        });

        revalidatePath("/admin/tenants");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to create tenant", e);
        return { success: false, error: e.message || "Unknown error occurred" };
    }
}

export async function updateTenantStatusAction(id: string, status: string) {
    // Update subscription status
    const school = await prisma.school.findUnique({
        where: { id },
        include: { subscription: true }
    });

    if (school && school.subscription) {
        await prisma.subscription.update({
            where: { id: school.subscription.id },
            data: { status }
        });
    }
    revalidatePath("/admin/tenants");
}

export async function deleteTenantAction(id: string) {
    await prisma.school.delete({
        where: { id }
    });
    revalidatePath("/admin/tenants");
}

export async function updateTenantAction(id: string, data: any) {
    try {
        const { modules, addons, socialMedia, plan, adminName, email, adminPhone, adminDesignation, subscriptionStatus, subscriptionStartDate, subscriptionEndDate, ...rest } = data;

        // Lookup plan dynamically
        let planId = undefined;
        if (plan) {
            let existingPlan = await prisma.subscriptionPlan.findUnique({
                where: { id: plan }
            });

            if (!existingPlan) {
                existingPlan = await prisma.subscriptionPlan.findFirst({
                    where: { name: plan }
                });
            }

            if (existingPlan) {
                planId = existingPlan.id;
            } else {
                console.warn(`Plan '${plan}' not found during update. Skipping plan update.`);
            }
        }

        await prisma.$transaction(async (tx) => {
            // 1. Update School details - explicitly map fields to avoid Prisma errors
            const schoolUpdateData: any = {};

            // Basic info
            if (rest.name !== undefined) schoolUpdateData.name = rest.name;
            if (rest.subdomain !== undefined) schoolUpdateData.slug = rest.subdomain;
            if (rest.brandColor !== undefined) schoolUpdateData.brandColor = rest.brandColor;
            if (rest.website !== undefined) schoolUpdateData.website = rest.website;
            if (rest.motto !== undefined) schoolUpdateData.motto = rest.motto;
            if (rest.foundingYear !== undefined) schoolUpdateData.foundingYear = rest.foundingYear;
            if (rest.logo !== undefined) schoolUpdateData.logo = rest.logo;

            // Location
            if (rest.address !== undefined) schoolUpdateData.address = rest.address;
            if (rest.city !== undefined) schoolUpdateData.city = rest.city;
            if (rest.state !== undefined) schoolUpdateData.state = rest.state;
            if (rest.zip !== undefined) schoolUpdateData.zip = rest.zip;
            if (rest.country !== undefined) schoolUpdateData.country = rest.country;
            if (rest.latitude !== undefined) schoolUpdateData.latitude = rest.latitude;
            if (rest.longitude !== undefined) schoolUpdateData.longitude = rest.longitude;

            // Contact
            if (rest.contactEmail !== undefined) schoolUpdateData.email = rest.contactEmail;
            if (rest.contactPhone !== undefined) schoolUpdateData.phone = rest.contactPhone;
            if (rest.phone !== undefined) schoolUpdateData.phone = rest.phone;

            // Config
            if (rest.currency !== undefined) schoolUpdateData.currency = rest.currency;
            if (rest.timezone !== undefined) schoolUpdateData.timezone = rest.timezone;
            if (rest.dateFormat !== undefined) schoolUpdateData.dateFormat = rest.dateFormat;

            // Social Media
            if (socialMedia?.facebook !== undefined) schoolUpdateData.facebook = socialMedia.facebook;
            if (socialMedia?.twitter !== undefined) schoolUpdateData.twitter = socialMedia.twitter;
            if (socialMedia?.linkedin !== undefined) schoolUpdateData.linkedin = socialMedia.linkedin;
            if (socialMedia?.instagram !== undefined) schoolUpdateData.instagram = socialMedia.instagram;
            if (socialMedia?.youtube !== undefined) schoolUpdateData.youtube = socialMedia.youtube;

            // Modules and Addons
            if (modules !== undefined) schoolUpdateData.modulesConfig = JSON.stringify(modules);
            if (addons !== undefined) schoolUpdateData.addonsConfig = JSON.stringify(addons);

            await tx.school.update({
                where: { id },
                data: schoolUpdateData
            });

            // 2. Update Subscription (plan, status, dates)
            const subUpdateData: any = {};
            if (planId) subUpdateData.planId = planId;
            if (subscriptionStatus) subUpdateData.status = subscriptionStatus;
            if (subscriptionStartDate) subUpdateData.startDate = new Date(subscriptionStartDate);
            if (subscriptionEndDate) subUpdateData.endDate = new Date(subscriptionEndDate);

            if (Object.keys(subUpdateData).length > 0) {
                await tx.subscription.updateMany({
                    where: { schoolId: id },
                    data: subUpdateData
                });
            }

            // 3. Update Admin User details if provided
            if (adminName || email || adminPhone || adminDesignation) {
                const adminUser = await tx.user.findFirst({
                    where: { schoolId: id, role: "ADMIN" }
                });
                if (adminUser) {
                    const nameParts = (adminName || "").split(" ");
                    const adminUpdate: any = {};
                    if (adminName) {
                        adminUpdate.firstName = nameParts[0] || undefined;
                        adminUpdate.lastName = nameParts.slice(1).join(" ") || undefined;
                    }
                    if (email) adminUpdate.email = email;
                    if (adminDesignation) adminUpdate.designation = adminDesignation;
                    // Note: adminPhone (mobile) is the login phone — do NOT update casually
                    await tx.user.update({
                        where: { id: adminUser.id },
                        data: adminUpdate
                    });
                }
            }
        });

        revalidatePath("/admin/tenants");
        return { success: true };
    } catch (e: any) {
        console.error("Update Tenant Error:", e);
        return { success: false, error: e.message };
    }
}

export async function getTenantByIdAction(id: string): Promise<Tenant | undefined> {
    try {
        const school = await prisma.school.findUnique({
            where: { id },
            include: {
                users: {
                    where: { role: "ADMIN" },
                    take: 1
                },
                subscription: {
                    include: { plan: true }
                },
                _count: {
                    select: { students: true }
                },
                branches: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (!school) return undefined;

        const admin = school.users[0];
        const sub = school.subscription;

        const planName = sub?.plan?.name || "No Plan";
        const planPrice = sub?.plan?.price || 0;

        return {
            id: school.id,
            name: school.name,
            subdomain: school.slug,
            brandColor: school.brandColor || "#0F172A",
            adminName: admin ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || "Admin" : "No Admin",
            email: admin?.email || admin?.mobile || "N/A",
            plan: planName,
            status: (sub?.status as any) || "TRIAL",
            students: school._count.students,
            mrr: planPrice,
            joinedDate: school.createdAt.toISOString(),
            region: "India",
            lastActive: school.updatedAt.toISOString(),
            website: school.website || `https://${school.slug}.antigravity.com`,
            contactPhone: school.phone || admin?.mobile || undefined,
            contactEmail: school.email || undefined,
            currency: (school as any).currency || undefined,
            timezone: (school as any).timezone || undefined,
            dateFormat: (school as any).dateFormat || undefined,
            logo: school.logo || undefined,
            motto: school.motto || undefined,
            foundingYear: school.foundingYear || undefined,
            address: school.address || undefined,
            city: school.city || undefined,
            state: school.state || undefined,
            zip: school.zip || undefined,
            country: school.country || undefined,
            latitude: school.latitude || undefined,
            longitude: school.longitude || undefined,
            adminPhone: admin?.mobile || undefined,
            adminDesignation: admin?.designation || undefined,
            adminUserId: admin?.id || undefined,
            adminEmail: admin?.email || undefined,
            planId: sub?.planId || undefined,
            subscriptionStatus: sub?.status || undefined,
            subscriptionStartDate: sub?.startDate?.toISOString() || undefined,
            subscriptionEndDate: sub?.endDate?.toISOString() || undefined,
            socialMedia: {
                facebook: (school as any).facebook || undefined,
                twitter: (school as any).twitter || undefined,
                linkedin: (school as any).linkedin || undefined,
                instagram: (school as any).instagram || undefined,
                youtube: (school as any).youtube || undefined,
            },
            modules: (() => {
                try {
                    return (school as any).modulesConfig ? JSON.parse((school as any).modulesConfig) : [];
                } catch (e) {
                    return [];
                }
            })(),
            addons: (() => {
                try {
                    return (school as any).addonsConfig ? JSON.parse((school as any).addonsConfig) : [];
                } catch (e) {
                    return [];
                }
            })(),
            maxBranches: school.maxBranches,
            branches: school.branches ? school.branches.map(b => ({ id: b.id, name: b.name, status: b.status })) : []
        };
    } catch (e) {
        console.error("Error in getTenantByIdAction:", e);
        return undefined;
    }
}

// --- Impersonate Tenant Admin ---
export async function impersonateTenantAction(tenantId: string) {
    try {
        // 1. Verify Super Admin (Security Check)
        const { isSuperAdminAuthenticated } = await import("./admin-auth-actions");
        const isAuth = await isSuperAdminAuthenticated();

        if (!isAuth) {
            return { success: false, error: "Unauthorized: Super Admin access required" };
        }

        // 2. Find the Tenant Admin
        const adminUser = await prisma.user.findFirst({
            where: {
                schoolId: tenantId,
                role: "ADMIN"
            },
            include: {
                school: true
            }
        });

        if (!adminUser || !adminUser.school) {
            return { success: false, error: "Tenant admin not found" };
        }

        // 3. Set Session for this user
        const { setUserSessionAction } = await import("./session-actions");
        await setUserSessionAction(adminUser.id);

        // 4. Return Redirect URL
        return {
            success: true,
            redirectUrl: `/s/${adminUser.school.slug}/dashboard`
        };

    } catch (error: any) {
        console.error("Impersonation Error:", error);
        return { success: false, error: error.message };
    }
}
