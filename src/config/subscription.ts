import { MessageSquare, Smartphone, Fingerprint, Mail } from "lucide-react";

export const PLAN_FEATURES: Record<string, string[]> = {
    Starter: ["admissions", "students", "students.profiles", "students.attendance", "settings"],
    Growth: [
        "admissions", "students", "students.profiles", "students.attendance",
        "academics", "academics.curriculum", "academics.timetable", "academics.classes",
        "diary", "staff", "staff.directory", "staff.attendance", "communication", "billing", "settings"
    ],
    Enterprise: [
        "admissions", "students", "students.profiles", "students.attendance",
        "academics", "academics.curriculum", "academics.timetable", "academics.classes",
        "diary", "staff", "staff.directory", "staff.attendance", "staff.payroll",
        "billing", "inventory", "communication", "settings"
    ]
};

export const ADDONS = [
    { id: "whatsapp", label: "WhatsApp Integration", price: 49, icon: MessageSquare, desc: "Automated alerts & communication" },
    { id: "branding", label: "Custom Branded App", price: 99, icon: Smartphone, desc: "Your school app on App Store/Play Store" },
    { id: "biometrics", label: "Biometric Sync", price: 29, icon: Fingerprint, desc: "Hardware integration for attendance" },
    { id: "sms", label: "Advanced SMS Gateway", price: 19, icon: Mail, desc: "Priority delivery & international SMS" }
];

export const PLANS = [
    {
        id: "Starter",
        name: "Starter",
        price: 299,
        color: "blue",
        limit: "Up to 100 Students",
        features: ["Up to 100 Students", "Basic Reporting", "Email Support"],
        permissionKey: "plan_start_001"
    },
    {
        id: "Growth",
        name: "Growth",
        price: 599,
        color: "indigo",
        limit: "Up to 500 Students",
        features: ["Up to 500 Students", "Advanced Analytics", "Priority Support", "Branded App"],
        permissionKey: "plan_growth_001"
    },
    {
        id: "Enterprise",
        name: "Enterprise",
        price: 999,
        color: "zinc",
        limit: "Unlimited Students",
        features: ["Unlimited Students", "Dedicated Manager", "SLA", "API Access"],
        permissionKey: "plan_ent_001"
    }
];

export const PLAN_PRICES: Record<string, number> = {
    Starter: 299,
    Growth: 599,
    Enterprise: 999
};

export function calculateMRR(plan: string, activeAddonIds: string[] = []) {
    const basePrice = PLAN_PRICES[plan] || 299;
    const addonsPrice = activeAddonIds.reduce((acc, id) => {
        const addon = ADDONS.find(a => a.id === id);
        return acc + (addon?.price || 0);
    }, 0);
    return basePrice + addonsPrice;
}
