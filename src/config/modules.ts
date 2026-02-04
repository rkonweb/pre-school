
export interface ModuleDefinition {
    id: string;
    label: string;
    description: string;
    category: "core" | "academic" | "administrative" | "communication";
}

export const ALL_MODULES: ModuleDefinition[] = [
    // Core
    { id: "students", label: "Student Management", description: "Profiles, enrollment, and detailed records", category: "core" },
    { id: "staff", label: "Staff Management", description: "Directory, roles, and employment details", category: "core" },
    { id: "settings", label: "System Settings", description: "School configuration and preferences", category: "core" },

    // Administrative
    { id: "admissions", label: "Admissions", description: "Inquiry to enrollment workflow", category: "administrative" },
    { id: "attendance", label: "Attendance", description: "Student and staff attendance tracking", category: "administrative" },
    { id: "billing", label: "Billing & Finance", description: "Fee collection and invoice generation", category: "administrative" },
    { id: "inventory", label: "Inventory", description: "Asset and resource management", category: "administrative" },
    { id: "transport", label: "Transport", description: "Route planning and vehicle tracking", category: "administrative" },
    { id: "library", label: "Library", description: "Book cataloging and circulation", category: "administrative" },

    // Academic
    { id: "academics", label: "Academics", description: "Curriculum, timetable, and exams", category: "academic" },
    { id: "diary", label: "Student Diary", description: "Daily logs and homework", category: "academic" },

    // Communication
    { id: "communication", label: "Communication", description: "Messaging and notifications", category: "communication" },
];

export const MODULE_CATEGORIES = {
    core: "Core Platform",
    academic: "Academic Tools",
    administrative: "Administrative Efficiency",
    communication: "Communication & Engagement"
};

// Helper to get simple list of IDs for backward compatibility
export const AVAILABLE_MODULE_IDS = ALL_MODULES.map(m => m.id);
