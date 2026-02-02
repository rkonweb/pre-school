import { Tenant, CreateTenantInput } from "@/types/tenant";

// Persistent global store for development to survive HMR
const globalStore = globalThis as unknown as {
    mockTenants: Tenant[];
};

// Initial Mock Data
const INITIAL_TENANTS: Tenant[] = [
    {
        id: "SCH-001",
        name: "Bright Beginnings Central",
        subdomain: "bright-central",
        brandColor: "#2563eb",
        adminName: "Sarah Connor",
        email: "sarah@bright-central.com",
        plan: "Growth",
        status: "ACTIVE",
        students: 450,
        mrr: 299,
        joinedDate: "2024-01-15T09:00:00.000Z",
        region: "US-West",
        lastActive: new Date(Date.now() - 1000 * 60 * 2).toISOString()
    },
    {
        id: "SCH-002",
        name: "Little Stars Academy",
        subdomain: "littlestars",
        brandColor: "#7c3aed",
        adminName: "John Smith",
        email: "john@littlestars.uk",
        plan: "Enterprise",
        status: "ACTIVE",
        students: 1200,
        mrr: 899,
        joinedDate: "2023-11-20T10:00:00.000Z",
        region: "UK-London",
        lastActive: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
        id: "SCH-003",
        name: "Tiny Toes Preschool",
        subdomain: "tinytoes",
        brandColor: "#16a34a",
        adminName: "Emily Chen",
        email: "emily@tinytoes.sg",
        plan: "Starter",
        status: "TRIAL",
        students: 45,
        mrr: 0,
        joinedDate: "2026-01-20T08:30:00.000Z",
        region: "SG-Central",
        lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
];

// Initialize store if empty (using globalThis to persist across hot reloads)
if (!globalStore.mockTenants) {
    globalStore.mockTenants = [...INITIAL_TENANTS];
}

// Simulate Network Latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const TenantStore = {
    getAll: async (): Promise<Tenant[]> => {
        await delay(300);
        return [...globalStore.mockTenants].sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
    },

    create: async (input: CreateTenantInput): Promise<Tenant> => {
        await delay(500);
        const newTenant: Tenant = {
            id: `SCH-${String(globalStore.mockTenants.length + 1).padStart(3, '0')}`,
            ...input,
            students: 0,
            mrr: input.plan === "Starter" ? 199 : input.plan === "Growth" ? 299 : 899,
            status: "TRIAL",
            joinedDate: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        // Unshift to add to top of list
        globalStore.mockTenants = [newTenant, ...globalStore.mockTenants];
        return newTenant;
    },

    updateStatus: async (id: string, status: Tenant["status"]): Promise<void> => {
        await delay(300);
        globalStore.mockTenants = globalStore.mockTenants.map(t =>
            t.id === id ? { ...t, status } : t
        );
    },

    delete: async (id: string): Promise<void> => {
        await delay(300);
        globalStore.mockTenants = globalStore.mockTenants.filter(t => t.id !== id);
    },

    update: async (id: string, data: Partial<Tenant>): Promise<Tenant | null> => {
        await delay(400);
        let updatedTwnt: Tenant | null = null;
        globalStore.mockTenants = globalStore.mockTenants.map(t => {
            if (t.id === id) {
                updatedTwnt = { ...t, ...data };
                return updatedTwnt;
            }
            return t;
        });
        return updatedTwnt;
    },

    getById: async (id: string): Promise<Tenant | undefined> => {
        await delay(300);
        return globalStore.mockTenants.find(t => t.id === id);
    }
};
