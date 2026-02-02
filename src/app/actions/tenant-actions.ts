"use server";

import { prisma } from "@/lib/prisma";
import { Tenant, CreateTenantInput } from "@/types/tenant";
import { revalidatePath } from "next/cache";

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
            mrr: sub?.planId === "growth" ? 5999 : sub?.planId === "enterprise" ? 9999 : 2499,
            joinedDate: school.createdAt.toISOString(),
            region: "India",
            lastActive: school.updatedAt.toISOString(),
            website: school.website || `https://${school.slug}.antigravity.com`,
            contactPhone: school.phone || admin?.mobile,
            modules: ["attendance", "admissions", "classroom", "billing"]
        };
    });
}

export async function createTenantAction(data: CreateTenantInput) {
    // Map admin name to first/last
    const nameParts = data.adminName.split(" ");
    const firstName = nameParts[0] || "Admin";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Primary contact number for owner
    const mobile = data.adminPhone || data.contactPhone || `mock-${Date.now()}`;

    // Map plan name to ID
    let planId = "plan_start_001";
    if (data.plan === "Growth") planId = "plan_growth_001";
    if (data.plan === "Enterprise") planId = "plan_ent_001";

    try {
        await prisma.$transaction(async (tx) => {
            const school = await tx.school.create({
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
                    dateFormat: data.dateFormat
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
        return { success: false, error: e.message };
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
        await prisma.school.update({
            where: { id },
            data: {
                ...data
            }
        });
        revalidatePath("/admin/tenants");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getTenantByIdAction(id: string) {
    const tenants = await getTenantsAction();
    return tenants.find(t => t.id === id);
}
