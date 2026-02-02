export interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    price: number;
    billingPeriod: "monthly" | "yearly";
    currency: string;
    description: string;
    features: string[]; // Display features (marketing text)
    limits: {
        maxStudents: number;
        maxStaff: number;
        maxStorageGB: number;
    };
    includedModules: string[]; // Functional permissions
    supportLevel: "community" | "email" | "priority" | "dedicated";
    isActive: boolean;
    isPopular?: boolean;
    tier: "free" | "basic" | "premium" | "enterprise";
    createdAt: string;
}

export type CreateSubscriptionPlanInput = Omit<SubscriptionPlan, "id" | "createdAt">;
