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
    { id: "whatsapp", label: "WhatsApp Integration", price: 499, icon: MessageSquare, desc: "Automated alerts & communication" },
    { id: "branding", label: "Custom Branded App", price: 999, icon: Smartphone, desc: "Your school app on App Store/Play Store" },
    { id: "biometrics", label: "Biometric Sync", price: 299, icon: Fingerprint, desc: "Hardware integration for attendance" },
    { id: "sms", label: "Advanced SMS Gateway", price: 199, icon: Mail, desc: "Priority delivery & international SMS" }
];

export const PLANS = [
    {
        id: "Starter",
        name: "Starter",
        price: 0,
        color: "blue",
        limit: "Up to 25 Students",
        features: ["Up to 25 Students", "Basic Reporting", "Email Support"],
        permissionKey: "plan_starter"
    },
    {
        id: "Growth",
        name: "Growth",
        price: 1999,
        color: "indigo",
        limit: "Up to 200 Students",
        features: ["Up to 200 Students", "Advanced Analytics", "Priority Support", "Branded App"],
        permissionKey: "plan_growth"
    },
    {
        id: "Enterprise",
        name: "Enterprise",
        price: 4999,
        color: "zinc",
        limit: "Up to 1000 Students",
        features: ["Up to 1000 Students", "Dedicated Manager", "SLA", "API Access"],
        permissionKey: "plan_enterprise"
    }
];

export const PLAN_PRICES: Record<string, number> = {
    Starter: 0,
    Growth: 1999,
    Enterprise: 4999
};

export function calculateMRR(plan: string, activeAddonIds: string[] = []) {
    const basePrice = PLAN_PRICES[plan] || 0;
    const addonsPrice = activeAddonIds.reduce((acc, id) => {
        const addon = ADDONS.find(a => a.id === id);
        return acc + (addon?.price || 0);
    }, 0);
    return basePrice + addonsPrice;
}
