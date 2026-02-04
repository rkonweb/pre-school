"use server";

import { prisma } from "@/lib/prisma";
import { Tenant, CreateTenantInput } from "@/types/tenant";
import { revalidatePath } from "next/cache";
import { calculateMRR, PLAN_FEATURES } from "@/config/subscription";

export async function getTenantsAction(): Promise<Tenant[]> {
    // Fetch real data from DB
    const schools = await prisma.school.findMany({
        include: {
            users: {
                where: { role: "ADMIN" },
                take: 1
            },
            subscription: true,
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

        // Determine plan name from planId
        let planName: "Starter" | "Growth" | "Enterprise" = "Starter";
        if (sub?.planId?.includes("growth")) planName = "Growth";
        if (sub?.planId?.includes("enterprise")) planName = "Enterprise";

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
            mrr: calculateMRR(planName, (() => {
                try {
                    return (school as any).addonsConfig ? JSON.parse((school as any).addonsConfig) : [];
                } catch (e) {
                    return [];
                }
            })()),
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

        // Get or Create Subscription Plan (Auto-Seeding)
        let planId = "";
        const planName = data.plan || "Growth";
        const planSlug = planName.toLowerCase();

        const existingPlan = await prisma.subscriptionPlan.findFirst({
            where: { name: { equals: planName, mode: 'insensitive' } }
        });

        if (existingPlan) {
            planId = existingPlan.id;
        } else {
            // Auto-create missing plan
            const newPlan = await prisma.subscriptionPlan.create({
                data: {
                    name: planName,
                    slug: planSlug,
                    price: planName === "Enterprise" ? 299 : planName === "Growth" ? 99 : 0,
                    description: `Auto-generated ${planName} Plan`,
                    tier: planName === "Enterprise" ? "enterprise" : planName === "Growth" ? "premium" : "basic",
                    maxStudents: planName === "Enterprise" ? 5000 : planName === "Growth" ? 1000 : 100,
                    maxStaff: planName === "Enterprise" ? 500 : planName === "Growth" ? 100 : 20,
                    maxStorageGB: planName === "Enterprise" ? 1000 : planName === "Growth" ? 100 : 10,
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
        const { modules, addons, socialMedia, plan, ...rest } = data;

        // Map plan name back to planId pattern
        let planId = "plan_start_001";
        if (plan === "Growth") planId = "plan_growth_001";
        if (plan === "Enterprise") planId = "plan_ent_001";

        await prisma.$transaction(async (tx) => {
            // 1. Update School details
            await tx.school.update({
                where: { id },
                data: {
                    ...rest,
                    facebook: socialMedia?.facebook,
                    twitter: socialMedia?.twitter,
                    linkedin: socialMedia?.linkedin,
                    instagram: socialMedia?.instagram,
                    youtube: socialMedia?.youtube,
                    modulesConfig: modules ? JSON.stringify(modules) : undefined,
                    addonsConfig: addons ? JSON.stringify(addons) : undefined
                }
            });

            // 2. Update Subscription Plan if exists
            await tx.subscription.updateMany({
                where: { schoolId: id },
                data: { planId }
            });
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
                subscription: true,
                _count: {
                    select: { students: true }
                }
            }
        });

        if (!school) return undefined;

        const admin = school.users[0];
        const sub = school.subscription;

        let planName: "Starter" | "Growth" | "Enterprise" = "Starter";
        if (sub?.planId?.includes("growth")) planName = "Growth";
        if (sub?.planId?.includes("enterprise")) planName = "Enterprise";

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
            mrr: calculateMRR(planName, (() => {
                try {
                    return (school as any).addonsConfig ? JSON.parse((school as any).addonsConfig) : [];
                } catch (e) {
                    return [];
                }
            })()),
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
    } catch (e) {
        console.error("Error in getTenantByIdAction:", e);
        return undefined;
    }
}
