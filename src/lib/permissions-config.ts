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
        key: "accounts",
        label: "Accounts & Finance",
        description: "Ledgers, expense tracking and financial reports",
        permissions: ["view", "create", "edit", "delete", "export", "manage"],
        subModules: [
            {
                key: "accounts.expenses",
                label: "Expense Management",
                description: "Track school expenditures",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "accounts.reports",
                label: "Financial Reports",
                description: "Profit, loss and ledger reports",
                permissions: ["view", "export"]
            },
            {
                key: "accounts.vendors",
                label: "Vendors & Payees",
                description: "Manage vendor accounts",
                permissions: ["view", "create", "edit", "delete"]
            }
        ]
    },
    {
        key: "hr",
        label: "Human Resources",
        description: "HR dashboard, recruitment and roles management",
        permissions: ["view", "manage", "create", "edit", "delete"],
        subModules: [
            {
                key: "hr.recruitment",
                label: "Recruitment (ATS)",
                description: "Job postings and applicant tracking",
                permissions: ["view", "create", "edit", "manage"]
            },
            {
                key: "hr.roles",
                label: "Roles & Permissions",
                description: "Manage custom staff roles",
                permissions: ["view", "create", "edit", "delete", "manage"]
            },
            {
                key: "hr.user-logs",
                label: "User Activity Logs",
                description: "Audit trail of all user actions",
                permissions: ["view", "export"]
            }
        ]
    },
    {
        key: "extracurricular",
        label: "Extracurricular",
        description: "Clubs, sports and activity programs",
        permissions: ["view", "create", "edit", "delete", "manage"],
        subModules: [
            {
                key: "extracurricular.clubs",
                label: "Clubs & Academies",
                description: "Manage clubs and academies",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "extracurricular.enrollment",
                label: "Student Enrollment",
                description: "Enroll students in activities",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "extracurricular.events",
                label: "Events & Awards",
                description: "Competitions and achievement records",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "extracurricular.attendance",
                label: "Attendance Tracking",
                description: "Activity attendance records",
                permissions: ["view", "mark", "edit"]
            }
        ]
    },
    {
        key: "homework",
        label: "Homework",
        description: "Student homework and assignment portal",
        permissions: ["view", "create", "edit", "delete"]
    },
    {
        key: "dairy",
        label: "Daily Diary",
        description: "Daily logs and parent communication updates",
        permissions: ["view", "create", "edit", "delete"]
    },
    {
        key: "ptm",
        label: "Parent Teacher Meetings",
        description: "Schedule and manage PTM events",
        permissions: ["view", "create", "edit", "delete", "manage"]
    },
    {
        key: "parent-requests",
        label: "Parent Requests",
        description: "Manage parent inquiries and support tickets",
        permissions: ["view", "review", "reply", "manage"]
    },
    {
        key: "canteen",
        label: "Canteen",
        description: "Point of sale, menu and meal subscriptions",
        permissions: ["view", "create", "edit", "delete", "manage"],
        subModules: [
            {
                key: "canteen.menu",
                label: "Menu & Timetable",
                description: "Manage daily menu and meal plans",
                permissions: ["view", "create", "edit"]
            },
            {
                key: "canteen.pos",
                label: "Point of Sale",
                description: "Billing and sales transactions",
                permissions: ["view", "create", "manage"]
            },
            {
                key: "canteen.billing",
                label: "Meal Subscriptions",
                description: "Student meal package billing",
                permissions: ["view", "create", "edit", "manage"]
            }
        ]
    },
    {
        key: "hostel",
        label: "Hostel Management",
        description: "Room allocation, billing and hostel administration",
        permissions: ["view", "create", "edit", "delete", "manage"],
        subModules: [
            {
                key: "hostel.allocation",
                label: "Room Allocation",
                description: "Assign students to rooms",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "hostel.billing",
                label: "Hostel Billing",
                description: "Hostel fee invoices and payments",
                permissions: ["view", "create", "edit", "manage"]
            }
        ]
    },
    {
        key: "store",
        label: "School Store",
        description: "Student merchandise, books and academic packages",
        permissions: ["view", "create", "edit", "delete", "manage"],
        subModules: [
            {
                key: "store.catalog",
                label: "Catalog",
                description: "Product listings and pricing",
                permissions: ["view", "create", "edit", "delete"]
            },
            {
                key: "store.orders",
                label: "Orders",
                description: "Student purchase orders",
                permissions: ["view", "create", "edit", "manage"]
            },
            {
                key: "store.inventory",
                label: "Store Inventory",
                description: "Stock management",
                permissions: ["view", "edit", "manage"]
            }
        ]
    },
    {
        key: "training",
        label: "Training Center",
        description: "Staff professional development and training programs",
        permissions: ["view", "create", "edit", "delete", "manage"]
    },
    {
        key: "marketing",
        label: "Marketing & Growth",
        description: "Campaigns, analytics and growth tools",
        permissions: ["view", "create", "edit", "delete", "manage"],
        subModules: [
            {
                key: "marketing.campaigns",
                label: "Campaigns",
                description: "Marketing campaign management",
                permissions: ["view", "create", "edit", "delete", "send"]
            },
            {
                key: "marketing.analytics",
                label: "Growth Analytics",
                description: "Lead and conversion analytics",
                permissions: ["view", "export"]
            }
        ]
    },
    {
        key: "events",
        label: "Events & Calendar",
        description: "School calendar and event management",
        permissions: ["view", "create", "edit", "delete", "manage"]
    },
    {
        key: "documents",
        label: "Document Center",
        description: "Certificates, forms and file repository",
        permissions: ["view", "create", "edit", "delete", "manage"]
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
