import { SubscriptionPlan, CreateSubscriptionPlanInput } from "@/types/subscription";

// Persistent global store for development to survive HMR
const globalStore = globalThis as unknown as {
    mockSubscriptions: SubscriptionPlan[];
};

const INITIAL_PLANS: SubscriptionPlan[] = [
    {
        id: "plan_free_001",
        name: "Free Trial",
        slug: "free-trial",
        price: 0,
        billingPeriod: "monthly",
        currency: "INR",
        description: "Perfect for testing the waters.",
        features: ["Up to 20 Students", "Basic Attendance", "Community Support"],
        limits: { maxStudents: 20, maxStaff: 5, maxStorageGB: 1 },
        includedModules: ["attendance", "admissions"],
        supportLevel: "community",
        isActive: true,
        tier: "free",
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        additionalStaffPrice: 0
    },
    {
        id: "plan_start_001",
        name: "Starter",
        slug: "starter",
        price: 2499,
        billingPeriod: "monthly",
        currency: "INR",
        description: "Essential tools for small schools.",
        features: ["Up to 100 Students", "Basic Reporting", "Email Support", "Parent App"],
        limits: { maxStudents: 100, maxStaff: 20, maxStorageGB: 10 },
        includedModules: ["attendance", "admissions", "communication", "billing"],
        supportLevel: "email",
        isActive: true,
        isPopular: true,
        tier: "basic",
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        additionalStaffPrice: 299
    },
    {
        id: "plan_growth_001",
        name: "Growth",
        slug: "growth",
        price: 5999,
        billingPeriod: "monthly",
        currency: "INR",
        description: "Advanced features for growing institutions.",
        features: ["Up to 500 Students", "Advanced Analytics", "Priority Support", "Branded App", "API Access"],
        limits: { maxStudents: 500, maxStaff: 100, maxStorageGB: 50 },
        includedModules: ["attendance", "admissions", "communication", "billing", "transport", "library"],
        supportLevel: "priority",
        isActive: true,
        tier: "premium",
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        additionalStaffPrice: 299
    }
];

// Initialize store if empty
if (!globalStore.mockSubscriptions) {
    globalStore.mockSubscriptions = [...INITIAL_PLANS];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const SubscriptionStore = {
    getAll: async (): Promise<SubscriptionPlan[]> => {
        await delay(500);
        return [...globalStore.mockSubscriptions];
    },

    getById: async (id: string): Promise<SubscriptionPlan | undefined> => {
        await delay(300);
        return globalStore.mockSubscriptions.find(p => p.id === id);
    },

    create: async (data: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> => {
        await delay(500);
        const newPlan: SubscriptionPlan = {
            id: `plan_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            ...data
        };
        globalStore.mockSubscriptions = [newPlan, ...globalStore.mockSubscriptions];
        return newPlan;
    },

    update: async (id: string, data: Partial<SubscriptionPlan>): Promise<void> => {
        await delay(400);
        globalStore.mockSubscriptions = globalStore.mockSubscriptions.map(p =>
            p.id === id ? { ...p, ...data } : p
        );
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        globalStore.mockSubscriptions = globalStore.mockSubscriptions.filter(p => p.id !== id);
    }
};
