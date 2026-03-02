export type PermissionType = "view" | "create" | "edit" | "delete" | "manage" | "export" | "mark" | "send" | "review" | "approve" | "publish" | "reply" | "manage_own" | "manage_selected";

export interface ModuleDefinition {
    key: string;
    label: string;
    description: string;
    permissions: PermissionType[];
    subModules?: ModuleDefinition[];
}

export const MODULES: ModuleDefinition[] = [
    {
        key: "dashboard",
        label: "Dashboard",
        description: "Overview and insights",
        permissions: ["view"],
        subModules: [
            {
                key: "dashboard.academic_metrics",
                label: "Academic Metrics",
                description: "Student performance & attendance stats",
                permissions: ["view"]
            },
            {
                key: "dashboard.financial_metrics",
                label: "Financial Metrics",
                description: "Revenue & collection stats",
                permissions: ["view"]
            },
            {
                key: "dashboard.staff_metrics",
                label: "Staff Metrics",
                description: "Staff attendance & payroll stats",
                permissions: ["view"]
            }
        ]
    },
    {
        key: "admissions",
        label: "Admissions",
        description: "Manage inquiries and applications",
        permissions: ["view", "create", "edit", "delete"],
        subModules: [
            {
                key: "admissions.inquiries",
                label: "Inquiries",
                description: "Prospective leads",
                permissions: ["view", "create", "edit"]
            },
            {
                key: "admissions.applications",
                label: "Applications",
                description: "Formal applications",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "admissions.follow_ups",
                label: "Follow-ups & CRM",
                description: "Manage communication with leads",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "admissions.reports",
                label: "Reports",
                description: "Conversion & admission stats",
                permissions: ["view", "export"]
            }
        ]
    },
    {
        key: "students",
        label: "Students",
        description: "Student Management",
        permissions: ["view", "create", "edit", "delete"],
        subModules: [
            {
                key: "students.profiles",
                label: "Profiles",
                description: "Student personal data",
                permissions: ["view", "create", "edit", "delete"],
                subModules: [
                    {
                        key: "students.profiles.personal",
                        label: "Personal Info",
                        description: "Basic details & Family",
                        permissions: ["view", "edit"]
                    },
                    {
                        key: "students.profiles.documents",
                        label: "Documents",
                        description: "Uploaded files",
                        permissions: ["view", "create", "delete"]
                    },
                    {
                        key: "students.profiles.health",
                        label: "Health Records",
                        description: "Medical info",
                        permissions: ["view", "edit"]
                    }
                ]
            },
            {
                key: "students.attendance",
                label: "Attendance",
                description: "Track daily attendance",
                permissions: ["view", "mark", "edit"]
            },
            {
                key: "students.reports",
                label: "Reports",
                description: "Academic reports and cards",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "students.behavior",
                label: "Behavior & Discipline",
                description: "Disciplinary records",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "students.achievements",
                label: "Achievements",
                description: "Awards and recognitions",
                permissions: ["view", "create", "edit"]
            },
            {
                key: "students.leave_requests",
                label: "Leave Requests",
                description: "Student leave applications",
                permissions: ["view", "approve", "review"]
            }
        ]
    },
    {
        key: "academics",
        label: "Academics",
        description: "Academic Operations",
        permissions: ["view", "manage"],
        subModules: [
            {
                key: "academics.classes",
                label: "Classes & Sections",
                description: "Manage classrooms",
                permissions: ["view", "create", "edit", "manage"]
            },
            {
                key: "academics.timetable",
                label: "Timetable",
                description: "Class scheduling",
                permissions: ["view", "create", "edit"]
            },
            {
                key: "academics.curriculum",
                label: "Curriculum",
                description: "Syllabus and lesson plans",
                permissions: ["view", "create", "edit"]
            },
            {
                key: "academics.assignments",
                label: "Assignments",
                description: "Class assignments and tasks",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "academics.examinations",
                label: "Examinations",
                description: "Exam schedules and setup",
                permissions: ["view", "create", "edit", "manage"]
            },
            {
                key: "academics.grading",
                label: "Grading",
                description: "Grade entry and publishing",
                permissions: ["view", "mark", "edit", "publish"]
            }
        ]
    },
    {
        key: "diary",
        label: "Diary",
        description: "Daily logs and homework",
        permissions: ["view", "create", "review"]
    },
    {
        key: "staff",
        label: "Staff Management",
        description: "Staff directory and profiles",
        permissions: ["view", "create", "edit", "delete"],
        subModules: [
            {
                key: "staff.directory",
                label: "Directory",
                description: "Staff lists and details",
                permissions: ["view", "create", "edit", "delete"],
                subModules: [
                    {
                        key: "staff.directory.personal",
                        label: "Personal Information",
                        description: "Contact & Bio",
                        permissions: ["view", "edit"]
                    },
                    {
                        key: "staff.directory.contract",
                        label: "HR & Contract",
                        description: "Salary, Bank, Role",
                        permissions: ["view", "manage"]
                    },
                    {
                        key: "staff.directory.system",
                        label: "System Access",
                        description: "Login & Roles",
                        permissions: ["view", "manage"]
                    }
                ]
            },
            {
                key: "staff.attendance",
                label: "Attendance",
                description: "Staff attendance records",
                permissions: ["view", "mark", "edit", "manage_own", "manage_selected"]
            },
            {
                key: "staff.payroll",
                label: "Payroll",
                description: "Salary and slips",
                permissions: ["view", "manage", "export"]
            },
            {
                key: "staff.leave_management",
                label: "Leave Management",
                description: "Review and approve staff leaves",
                permissions: ["view", "create", "approve"]
            },
            {
                key: "staff.performance",
                label: "Performance",
                description: "Appraisals and reviews",
                permissions: ["view", "edit", "manage"]
            }
        ]
    },
    {
        key: "billing",
        label: "Billing & Finance",
        description: "Fee structures, invoices, and payments",
        permissions: ["view", "create", "edit", "delete", "export"],
        subModules: [
            {
                key: "billing.invoices",
                label: "Invoices",
                description: "Fee collection",
                permissions: ["view", "create", "export"]
            },
            {
                key: "billing.expenses",
                label: "Expenses",
                description: "School expenditures",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "billing.structure",
                label: "Fee Structure",
                description: "Fee heads & plans",
                permissions: ["view", "manage"]
            },
            {
                key: "billing.discounts",
                label: "Discounts & Waivers",
                description: "Configure scholarship/discounts",
                permissions: ["view", "create", "manage"]
            },
            {
                key: "billing.payroll_processing",
                label: "Payroll Processing",
                description: "Finance-side payroll link",
                permissions: ["view", "manage", "approve"]
            },
            {
                key: "billing.reports",
                label: "Reports",
                description: "Financial reports & ledger",
                permissions: ["view", "export"]
            }
        ]
    },
    {
        key: "communication",
        label: "Communication",
        description: "Broadcasts and messaging",
        permissions: ["view", "send"],
        subModules: [
            {
                key: "communication.announcements",
                label: "Announcements",
                description: "Notice board & circulars",
                permissions: ["view", "create", "edit", "delete", "send"]
            },
            {
                key: "communication.sms_email",
                label: "SMS & Email",
                description: "Direct broadcasts",
                permissions: ["view", "create", "send"]
            },
            {
                key: "communication.parent_messages",
                label: "Parent Messages",
                description: "Direct messaging with parents",
                permissions: ["view", "review", "reply"]
            }
        ]
    },
    {
        key: "inventory",
        label: "School Inventory",
        description: "Manage assets and stocks",
        permissions: ["view", "manage"]
    },
    {
        key: "library",
        label: "Library",
        description: "Book catalog and circulation",
        permissions: ["view", "manage", "create", "edit", "delete"]
    },
    {
        key: "transport",
        label: "Transport",
        description: "Routes, vehicles and tracking",
        permissions: ["view", "manage", "create", "edit", "delete"],
        subModules: [
            {
                key: "transport.routes",
                label: "Routes",
                description: "Bus routes and stops",
                permissions: ["view", "manage", "create", "edit"]
            },
            {
                key: "transport.vehicles",
                label: "Vehicles",
                description: "Vehicle directory and tracking",
                permissions: ["view", "manage", "create", "edit"]
            },
            {
                key: "transport.allocations",
                label: "Allocations",
                description: "Student passenger lists",
                permissions: ["view", "manage"]
            },
            {
                key: "transport.expenses",
                label: "Expense Management",
                description: "Fleet expenditures and claims",
                permissions: ["view", "create", "edit", "delete", "approve", "review"]
            }
        ]
    },
    {
        key: "settings",
        label: "System Settings",
        description: "School configuration and setup",
        permissions: ["view", "manage"]
    }
];

export type ModuleKey = string; // Simplified for flexibility with nested keys

export interface RolePermission {
    module: ModuleKey;
    actions: PermissionType[];
}
