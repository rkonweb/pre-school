export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    brandColor: string;
    adminName: string;
    email: string;
    plan: "Starter" | "Growth" | "Enterprise";
    status: "ACTIVE" | "TRIAL" | "PAST_DUE" | "SUSPENDED";
    students: number;
    mrr: number;
    joinedDate: string;
    region: string;
    lastActive: string;
    website?: string;
    contactPhone?: string;
    contactEmail?: string;
    currency?: string;
    timezone?: string;
    dateFormat?: string;
    modules?: string[];

    // Identity Extras
    logo?: string;
    motto?: string;
    foundingYear?: string;
    socialMedia?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        youtube?: string;
    };

    // Location Extras
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    latitude?: string;
    longitude?: string;

    // Admin Extras
    adminPhone?: string;
    adminDesignation?: string;
}

export type CreateTenantInput = Omit<Tenant, "id" | "students" | "mrr" | "joinedDate" | "status" | "lastActive">;
