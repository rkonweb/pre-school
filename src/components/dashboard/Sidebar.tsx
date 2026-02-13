"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    FileText,
    Briefcase,
    CreditCard,
    MessageCircle,
    Settings,
    GraduationCap,
    Clock,
    BookOpen,
    Package,
    Layers,
    ChevronDown,
    ChevronRight,
    LucideIcon,
    NotebookPen,
    LogOut,
    Shield,
    Banknote,
    Bus,
    FileSpreadsheet,
    Folder,
    MapPin,
    TrendingUp,
    Sparkles,
    Sliders
} from "lucide-react";
import { useState } from "react";
import { clearUserSessionAction } from "@/app/actions/session-actions";

// Define navigation types
type NavItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: { name: string; href: string; icon: LucideIcon }[];
};

export function Sidebar({ schoolName, logo, user, enabledModules = [] }: { schoolName?: string; logo?: string | null; user?: any, enabledModules?: string[] }) {
    const pathname = usePathname();
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string || "demo";

    // State to track expanded submenus
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        "Students": true // Default expand Students for better UX initially
    });

    const toggleGroup = (name: string) => {
        setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const displayName = schoolName || "Preschool ERP";

    const checkAccess = (permissionKey: string) => {
        // 1. Super Admins/Admins have full access
        if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") return true;

        // 2. Staff without role? Maybe restricted or full? 
        // Assuming restricted default: if no role, no access (except dashboard?)
        if (!user?.customRole) return permissionKey === "dashboard";

        // 3. Check custom permissions
        // Parse permissions from JSON string if needed (Prisma might return string or object depending on driver)
        let perms: any[] = [];
        try {
            perms = typeof user.customRole.permissions === 'string'
                ? JSON.parse(user.customRole.permissions)
                : user.customRole.permissions;
        } catch (e) {
            return false;
        }

        if (!perms || !Array.isArray(perms)) return false;

        // Check if user has "view" or any access to the module
        // Permission structure: { module: 'students', actions: ['view', 'create'] }
        const modulePerm = perms.find(p => p.module === permissionKey || p.module?.startsWith(permissionKey + "."));

        // Return true if any permission exists for this module (checking for 'view' specifically is safer)
        return !!modulePerm?.actions?.includes("view");
    };

    // Dynamic Dashboard Link based on Role
    let dashboardHref = `/s/${slug}/dashboard`;
    if (user?.role === "STAFF") {
        dashboardHref = `/s/${slug}/teacher/${user.id}/dashboard`;
    } else if (user?.role === "PARENT") {
        dashboardHref = `/s/${slug}/parent`;
    }

    const rawNavigation: NavItem[] = [
        { name: "Dashboard", href: dashboardHref, icon: LayoutDashboard },
        {
            name: "Admissions",
            href: `/s/${slug}/admissions`,
            icon: FileText,
            children: [
                { name: "AI Dashboard", href: `/s/${slug}/admissions/dashboard`, icon: Sparkles },
                { name: "Application Pipeline", href: `/s/${slug}/admissions`, icon: Layers },
                { name: "Inquiry Dashboard", href: `/s/${slug}/admissions/inquiry`, icon: LayoutDashboard },
                { name: "Leads (Pipeline)", href: `/s/${slug}/admissions/inquiry/pipeline`, icon: MessageCircle },
                { name: "Lead List", href: `/s/${slug}/admissions/inquiry/list`, icon: Users },
                { name: "Follow-ups", href: `/s/${slug}/admissions/inquiry/followups`, icon: Clock },
                { name: "School Tours", href: `/s/${slug}/admissions/inquiry/tours`, icon: MapPin },
                { name: "WhatsApp Automation", href: `/s/${slug}/admissions/inquiry/automation`, icon: MessageCircle },
                { name: "Template Library", href: `/s/${slug}/admissions/inquiry/templates`, icon: BookOpen },
                { name: "Reports", href: `/s/${slug}/admissions/inquiry/reports`, icon: TrendingUp },
                { name: "Inquiry Settings", href: `/s/${slug}/admissions/inquiry/settings`, icon: Settings },
                { name: "AI Configuration", href: `/s/${slug}/admissions/settings/ai`, icon: Sparkles },
            ]
        },
        {
            name: "Students",
            href: `/s/${slug}/students`,
            icon: GraduationCap,
            children: [
                { name: "All Students", href: `/s/${slug}/students`, icon: Users }, // Key: students or students.profiles
                { name: "Attendance", href: `/s/${slug}/students/attendance`, icon: Clock }, // Key: students.attendance
                { name: "Progress Reports", href: `/s/${slug}/students/reports`, icon: FileSpreadsheet }, // Key: students.reports
            ]
        },
        { name: "Classes", href: `/s/${slug}/academics/classes`, icon: Layers }, // Key: academics.classes
        { name: "Timetable", href: `/s/${slug}/academics/timetable`, icon: Clock }, // Key: academics.timetable
        { name: "Diary", href: `/s/${slug}/diary`, icon: NotebookPen }, // Key: diary
        { name: "Curriculum", href: `/s/${slug}/curriculum`, icon: FileText }, // Key: academics.curriculum
        {
            name: "Staff",
            href: `/s/${slug}/staff`,
            icon: Briefcase,
            children: [
                { name: "Staff Directory", href: `/s/${slug}/staff`, icon: Users }, // Key: staff.directory
                { name: "Attendance", href: `/s/${slug}/staff/attendance`, icon: Clock }, // Key: staff.attendance
                { name: "Payroll", href: `/s/${slug}/staff/payroll`, icon: Banknote }, // Key: staff.payroll
            ]
        },
        { name: "Billing", href: `/s/${slug}/billing`, icon: CreditCard }, // Key: billing
        { name: "Inventory", href: `/s/${slug}/inventory`, icon: Package }, // Key: inventory
        { name: "Transport", href: `/s/${slug}/transport`, icon: Bus }, // Key: transport
        { name: "Library", href: `/s/${slug}/library`, icon: BookOpen }, // Key: library
        { name: "Documents", href: `/s/${slug}/documents`, icon: Folder }, // Key: documents
        { name: "Communication", href: `/s/${slug}/communication`, icon: MessageCircle }, // Key: communication
        { name: "Marketing Tools", href: `/s/${slug}/marketing`, icon: Layers }, // Key: marketing
        { name: "Roles & Permissions", href: `/s/${slug}/roles`, icon: Shield }, // Key: settings (grouped with settings usually, or separate 'roles')
        { name: "Settings", href: `/s/${slug}/settings`, icon: Settings }, // Key: settings
    ];

    // Map Nav Names to Permission Keys
    const navPermissionMap: Record<string, string> = {
        "Dashboard": "dashboard",
        "Admissions": "admissions",
        "AI Dashboard": "admissions.dashboard", // Using generic permissions for now
        "Application Pipeline": "admissions.pipeline",
        "Inquiry Dashboard": "admissions.inquiry.dashboard",
        "Leads (Pipeline)": "admissions.inquiry.pipeline",
        "Lead List": "admissions.inquiry.list",
        "Follow-ups": "admissions.inquiry.followups",
        "School Tours": "admissions.inquiry.tours",
        "WhatsApp Automation": "admissions.inquiry.automation",
        "Template Library": "admissions.inquiry.templates",
        "Reports": "admissions.inquiry.reports",
        "Inquiry Settings": "admissions.inquiry.settings", // Note: This might overlap with global settings
        "AI Configuration": "admissions.settings",
        "Students": "students", // Parent check
        "All Students": "students.profiles",
        "Attendance": "students.attendance", // Context dependent? But usually student attendance
        "Classroom": "academics.classes",
        "Classes": "academics.classes",
        "Timetable": "academics.timetable",
        "Diary": "diary",
        "Curriculum": "academics.curriculum",
        "Staff": "staff", // Parent
        "Staff Directory": "staff.directory",
        "Staff Attendance": "staff.attendance", // Fix name match in loop
        "Payroll": "staff.payroll",
        "Billing": "billing",
        "Inventory": "inventory",
        "Transport": "transport",
        "Library": "library",
        "Documents": "documents",
        "Communication": "communication",
        "Marketing Tools": "marketing",
        "Roles & Permissions": "settings", // Only admins/settings access should see roles
        "Settings": "settings"
    };

    // In map logic below we can use specific handling or just ensure unique names or rely on context

    // Check if module is enabled at SCHOOL level
    const isModuleEnabled = (permissionKey: string) => {
        if (!permissionKey) return true;
        if (!Array.isArray(enabledModules) || enabledModules.length === 0) return true;
        return enabledModules.includes(permissionKey) || enabledModules.some(m => typeof m === 'string' && permissionKey.startsWith(m + "."));
    };

    const navigation = rawNavigation.reduce((acc: NavItem[], item) => {
        // 1. Check parent permission
        // Special case: For groups like "Students", if any child is visible, show parent? 
        // OR check generic "students" permission?
        // Let's check generic first.

        const permKey = navPermissionMap[item.name];

        // Check school-level permission first
        if (permKey && !isModuleEnabled(permKey)) return acc;

        const hasDirectAccess = permKey ? checkAccess(permKey) : false;

        if (item.children) {
            // Filter children
            const visibleChildren = item.children.filter(child => {
                // Special handling for Attendance which appears twice
                let childKey = "";
                if (child.name === "Attendance" && item.name === "Students") childKey = "students.attendance";
                else if (child.name === "Attendance" && item.name === "Staff") {
                    // Always allow Staff to see their own attendance logs
                    if (user?.role === "STAFF") return true;
                    childKey = "staff.attendance";
                }
                else childKey = navPermissionMap[child.name];

                // Check school-level for child
                if (!isModuleEnabled(childKey)) return false;

                return checkAccess(childKey);
            });

            if (visibleChildren.length > 0) {
                // If children exist, show parent (even if direct parent view is false, usually UI implies expand capability)
                acc.push({ ...item, children: visibleChildren });
            }
        } else {
            // Single item
            if (hasDirectAccess) {
                acc.push(item);
            }
        }

        return acc;
    }, []);

    return (
        <div className="hidden border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:block lg:w-72">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-28 items-center border-b border-zinc-200 dark:border-zinc-800 justify-center">
                    <Link href={`/s/${slug}/dashboard`} className="flex items-center justify-center w-full h-full group overflow-hidden">
                        {logo ? (
                            <img
                                src={logo}
                                alt={displayName}
                                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex flex-row items-center gap-3">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20">
                                    <span className="text-2xl font-black">{displayName[0]}</span>
                                </div>
                                <span className="text-zinc-900 dark:text-zinc-50 font-bold truncate leading-tight transition-colors">
                                    {displayName}
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6">
                    <nav className="space-y-1 px-3">
                        {navigation.map((item) => {
                            const isGroup = !!item.children;
                            const isActive = isGroup
                                ? pathname.startsWith(item.href)
                                : pathname === item.href;
                            const isExpanded = expandedGroups[item.name];

                            // For single items
                            if (!isGroup) {
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand"
                                                : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "h-5 w-5 flex-shrink-0 transition-colors",
                                                isActive
                                                    ? "text-brand"
                                                    : "text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-500 dark:group-hover:text-zinc-50"
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            }

                            // For grouped items (Tree structure)
                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={() => toggleGroup(item.name)}
                                        className={cn(
                                            "group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            isActive && !isExpanded
                                                ? "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand" // Highlight parent if active child but collapsed
                                                : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon
                                                className={cn(
                                                    "h-5 w-5 flex-shrink-0 transition-colors",
                                                    (isActive && !isExpanded)
                                                        ? "text-brand"
                                                        : "text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-500 dark:group-hover:text-zinc-50"
                                                )}
                                            />
                                            {item.name}
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                                        )}
                                    </button>

                                    {/* Children */}
                                    {isExpanded && (
                                        <div className="mt-1 space-y-1 pl-4">
                                            {item.children!.map((child) => {
                                                const isChildActive = pathname === child.href; // Exact match or startWith depending on pref
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className={cn(
                                                            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 border-l-2 ml-2",
                                                            isChildActive
                                                                ? "border-brand bg-brand/10 text-brand dark:bg-brand/10 dark:text-brand"
                                                                : "border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                                        )}
                                                    >
                                                        {/* Optional: No icon for sub-items to keep clean, or use smaller icon */}
                                                        <span>{child.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* User Profile Snippet (Bottom) */}
                <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                                <span className="text-sm font-bold">
                                    {(user?.firstName?.[0] || "U").toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate max-w-[120px]">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                                    {user?.role?.toLowerCase() || "Staff"}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                await clearUserSessionAction();
                                router.push(`/school-login`);
                            }}
                            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-red-400 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
