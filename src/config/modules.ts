
export interface ModuleDefinition {
    id: string;
    label: string;
    description: string;
    category: "core" | "academic" | "administrative" | "communication" | "facilities";
}

/**
 * Master module list — single source of truth used by:
 *  - Subscription plan management (/admin/subscriptions)
 *  - Tenant module assignment (/admin/tenants/[id]/edit)
 *
 * IDs here must match the IDs stored in the database (tenant.modules[]).
 */
export const ALL_MODULES: ModuleDefinition[] = [
    // ── Core Platform ─────────────────────────────────────────────────
    { id: "dashboard",       label: "Dashboard",             description: "Main overview and KPIs",                    category: "core" },
    { id: "students",        label: "Student Management",    description: "Profiles, enrollment, and records",         category: "core" },
    { id: "staff",           label: "Staff Management",      description: "Directory, roles, and employment details",  category: "core" },
    { id: "hr",              label: "Human Resources",       description: "HR dashboard, recruitment, and roles",      category: "core" },
    { id: "roles",           label: "Roles & Permissions",   description: "User access control",                       category: "core" },
    { id: "settings",        label: "System Settings",       description: "School configuration and preferences",      category: "core" },

    // ── Academic Tools ────────────────────────────────────────────────
    { id: "academics",       label: "Academics",             description: "Timetable, exams, and scheduling",         category: "academic" },
    { id: "curriculum",      label: "Curriculum Planning",   description: "Syllabus and lesson plans",                category: "academic" },
    { id: "classroom",       label: "Classroom Management",  description: "Daily logs and activities",                category: "academic" },
    { id: "homework",        label: "Homework",              description: "Assignments and grading",                  category: "academic" },
    { id: "diary",           label: "Student Diary",         description: "Daily logs and homework",                  category: "academic" },
    { id: "ptm",             label: "Parent-Teacher Meetings", description: "Schedule and manage PTMs",              category: "academic" },
    { id: "extracurricular", label: "Extracurricular",       description: "Clubs, activities, and sports programs",  category: "academic" },
    { id: "events",          label: "Events & Calendar",     description: "School calendar and activities",           category: "academic" },
    { id: "calendar",        label: "School Calendar",       description: "Academic calendar, holidays, and day status", category: "academic" },

    // ── Administrative Efficiency ─────────────────────────────────────
    { id: "admissions",      label: "Admissions CRM",        description: "Inquiry to enrollment workflow",           category: "administrative" },
    { id: "attendance",      label: "Attendance",            description: "Student and staff attendance tracking",    category: "administrative" },
    { id: "billing",         label: "Billing & Finance",     description: "Fee collection and invoice generation",   category: "administrative" },
    { id: "accounts",        label: "Accounts & Finance",    description: "Ledgers and expense tracking",            category: "administrative" },
    { id: "payroll",         label: "Payroll",               description: "Salary processing and payslips",          category: "administrative" },
    { id: "inventory",       label: "Inventory & Assets",    description: "Asset and resource management",           category: "administrative" },
    { id: "store",           label: "School Store",          description: "Student merchandise and academic packages", category: "administrative" },
    { id: "transport",       label: "Transport & Fleet",     description: "Route planning and vehicle tracking",      category: "administrative" },
    { id: "library",         label: "Library",               description: "Book cataloging and circulation",          category: "administrative" },
    { id: "training",        label: "Training Center",       description: "Staff professional development",           category: "administrative" },
    { id: "documents",       label: "Document Management",   description: "Certificates and files repository",       category: "administrative" },
    { id: "ai_features",     label: "AI Suite",              description: "Smart insights and automation",            category: "administrative" },
    { id: "reports",         label: "Advanced Analytics",    description: "Deep data insights",                       category: "administrative" },
    { id: "health",          label: "Health Records",        description: "Monitor student well-being",               category: "administrative" },
    { id: "parent-requests", label: "Parent Requests",       description: "Manage parent inquiries and support",     category: "administrative" },

    // ── Facilities ────────────────────────────────────────────────────
    { id: "canteen",         label: "Canteen",               description: "POS, menu, and meal subscriptions",       category: "facilities" },
    { id: "hostel",          label: "Hostel Management",     description: "Room allocation and hostel billing",      category: "facilities" },

    // ── Communication & Engagement ────────────────────────────────────
    { id: "communication",   label: "Communication",         description: "Messaging and notifications",             category: "communication" },
    { id: "marketing",       label: "Marketing Tools",       description: "Lead generation and campaigns",           category: "communication" },
];

export const MODULE_CATEGORIES: Record<string, string> = {
    core:           "Core Platform",
    academic:       "Academic Tools",
    administrative: "Administrative Efficiency",
    facilities:     "Campus Facilities",
    communication:  "Communication & Engagement",
};

// Helper to get simple list of IDs for backward compatibility
export const AVAILABLE_MODULE_IDS = ALL_MODULES.map(m => m.id);
