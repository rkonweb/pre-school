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
    ChevronLeft,
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
    X,
    PanelLeftClose,
    PanelLeftOpen,
    Activity,
    School,
    Building2,
    Palmtree,
    ShieldCheck,
    Fingerprint,
    Zap,
    CalendarDays,
    Wallet,
    Building,
    Brain,
    Utensils,
    ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";
import { clearUserSessionAction } from "@/app/actions/session-actions";
import { useSidebar } from "@/context/SidebarContext";

// Define navigation types
type NavItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: { name: string; href: string; icon: LucideIcon }[];
};

export function Sidebar({ schoolName, logo, user, enabledModules = [] }: { schoolName?: string; logo?: string | null; user?: any; enabledModules?: string[] }) {
    const { isOpen, isCollapsed, toggleCollapse, setIsOpen, isAppFullscreen } = useSidebar();
    const rawPathname = usePathname();
    const pathname = rawPathname || "";
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
        if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") return true;
        if (!user?.customRole) return permissionKey === "dashboard";
        let perms: any[] = [];
        try {
            perms = typeof user.customRole.permissions === 'string'
                ? JSON.parse(user.customRole.permissions)
                : user.customRole.permissions;
        } catch (e) {
            return false;
        }
        if (!perms || !Array.isArray(perms)) return false;
        const modulePerm = perms.find(p => p.module === permissionKey || p.module?.startsWith(permissionKey + "."));
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
                { name: "All Students", href: `/s/${slug}/students`, icon: Users },
                { name: "Attendance", href: `/s/${slug}/students/attendance`, icon: Clock },
                { name: "Health Records", href: `/s/${slug}/students/health`, icon: Activity },
                { name: "Progress Reports", href: `/s/${slug}/students/reports`, icon: FileSpreadsheet },
                { name: "Development", href: `/s/${slug}/students/development`, icon: Brain },
                { name: "ID Cards", href: `/s/${slug}/students/id-cards`, icon: CreditCard },
            ]
        },
        { name: "Classes", href: `/s/${slug}/academics/classes`, icon: Layers },
        { name: "Timetable", href: `/s/${slug}/academics/timetable`, icon: Clock },
        { name: "Diary", href: `/s/${slug}/diary`, icon: NotebookPen },
        { name: "Curriculum", href: `/s/${slug}/curriculum`, icon: FileText },
        {
            name: "Staff",
            href: `/s/${slug}/staff`,
            icon: Briefcase,
            children: [
                { name: "Staff Directory", href: `/s/${slug}/staff`, icon: Users },
                { name: "Attendance", href: `/s/${slug}/staff/attendance`, icon: Clock },
                { name: "Payroll", href: `/s/${slug}/staff/payroll`, icon: Banknote },
            ]
        },
        { name: "Billing", href: `/s/${slug}/billing`, icon: CreditCard },
        { name: "Inventory", href: `/s/${slug}/inventory`, icon: Package },
        {
            name: "Hostel Management",
            href: `/s/${slug}/hostel/allocation`,
            icon: Building2,
            children: [
                { name: "Room Allocation", href: `/s/${slug}/hostel/allocation`, icon: Users },
                { name: "Hostel Billing", href: `/s/${slug}/hostel/billing`, icon: Banknote },
                { name: "Hostel Settings", href: `/s/${slug}/hostel/settings`, icon: Settings },
            ]
        },
        {
            name: "Store & Inventory",
            href: `/s/${slug}/store`,
            icon: Package,
            children: [
                { name: "Store Dashboard", href: `/s/${slug}/store`, icon: LayoutDashboard },
                { name: "Academic Packages", href: `/s/${slug}/store/packages`, icon: Layers },
                { name: "Catalog", href: `/s/${slug}/store/catalog`, icon: BookOpen },
                { name: "Inventory", href: `/s/${slug}/store/inventory`, icon: Activity },
                { name: "Orders", href: `/s/${slug}/store/orders`, icon: ShoppingBag },
            ]
        },
        {
            name: "Canteen",
            href: `/s/${slug}/canteen`,
            icon: Utensils,
            children: [
                { name: "Dashboard & AI", href: `/s/${slug}/canteen`, icon: LayoutDashboard },
                { name: "Point of Sale", href: `/s/${slug}/canteen/pos`, icon: CreditCard },
                { name: "Accounts Ledger", href: `/s/${slug}/canteen/accounts`, icon: Wallet },
                { name: "Menu & Timetable", href: `/s/${slug}/canteen/menu`, icon: CalendarDays },
                { name: "Meal Packages", href: `/s/${slug}/canteen/packages`, icon: Package },
                { name: "Subscriptions", href: `/s/${slug}/canteen/billing`, icon: Banknote },
            ]
        },
        {
            name: "Accounts",
            href: `/s/${slug}/accounts`,
            icon: Wallet,
            children: [
                { name: "Financial Dashboard", href: `/s/${slug}/accounts`, icon: LayoutDashboard },
                { name: "Transactions", href: `/s/${slug}/accounts/transactions`, icon: FileSpreadsheet },
                { name: "Vendors & Payees", href: `/s/${slug}/accounts/vendors`, icon: Users },
                { name: "AI Insights", href: `/s/${slug}/accounts/insights`, icon: Sparkles },
                { name: "Account Settings", href: `/s/${slug}/accounts/settings`, icon: Settings },
            ]
        },
        {
            name: "Transport",
            href: `/s/${slug}/transport`,
            icon: Bus,
            children: [
                { name: "Transport Dashboard", href: `/s/${slug}/transport`, icon: LayoutDashboard },
                { name: "Route", href: `/s/${slug}/transport/route/routes`, icon: MapPin },
                { name: "Application", href: `/s/${slug}/transport/application/apply`, icon: FileText },
                { name: "Fleet", href: `/s/${slug}/transport/fleet/vehicles`, icon: Bus },
                { name: "Analytics & Reports", href: `/s/${slug}/transport/reports/daily`, icon: TrendingUp },
                { name: "Expense Tracking", href: `/s/${slug}/transport/expenses`, icon: Banknote },
            ]
        },
        { name: "Library", href: `/s/${slug}/library`, icon: BookOpen },
        { name: "Training Center", href: `/s/${slug}/training`, icon: School },
        { name: "Documents", href: `/s/${slug}/documents`, icon: Folder },
        { name: "Communication", href: `/s/${slug}/communication`, icon: MessageCircle },
        { name: "Marketing Tools", href: `/s/${slug}/marketing`, icon: Layers },
        { name: "Roles & Permissions", href: `/s/${slug}/roles`, icon: Shield },
        {
            name: "Settings", href: `/s/${slug}/settings`, icon: Settings, children: [
                { name: "Institutional Identity", href: `/s/${slug}/settings/identity`, icon: Building2 },
                { name: "Academic Years", href: `/s/${slug}/settings/academic-years`, icon: CalendarDays },
                { name: "Branch Management", href: `/s/${slug}/settings/branches`, icon: Building },
                { name: "Location & Physicality", href: `/s/${slug}/settings/location`, icon: MapPin },
                { name: "Fee Configuration", href: `/s/${slug}/settings/fees`, icon: Wallet },
                { name: "System Access Control", href: `/s/${slug}/settings/admin`, icon: ShieldCheck },
                { name: "Biometric Integration", href: `/s/${slug}/settings/biometric`, icon: Fingerprint },
                { name: "Attendance & Leaves", href: `/s/${slug}/settings/leaves`, icon: Palmtree },
                { name: "Payroll & Disbursement", href: `/s/${slug}/settings/payroll`, icon: Banknote },
                { name: "Regional Operations", href: `/s/${slug}/settings/config`, icon: Settings },
                { name: "Connectors & APIs", href: `/s/${slug}/settings/integrations`, icon: Zap },
                { name: "Subscription & Plan", href: `/s/${slug}/settings/subscription`, icon: CreditCard },
                { name: "ID Card Templates", href: `/s/${slug}/settings/id-cards`, icon: CreditCard },

                { name: "Development Settings", href: `/s/${slug}/settings/development`, icon: Brain },
                { name: "UI Kit / Design System", href: `/s/${slug}/settings/ui-kit`, icon: Sparkles },
            ]
        },
    ];

    // Permission map
    const navPermissionMap: Record<string, string> = {
        "Dashboard": "dashboard",
        "Admissions": "admissions",
        "AI Dashboard": "admissions.dashboard",
        "Application Pipeline": "admissions.pipeline",
        "Inquiry Dashboard": "admissions.inquiry.dashboard",
        "Leads (Pipeline)": "admissions.inquiry.pipeline",
        "Lead List": "admissions.inquiry.list",
        "Follow-ups": "admissions.inquiry.followups",
        "School Tours": "admissions.inquiry.tours",
        "WhatsApp Automation": "admissions.inquiry.automation",
        "Template Library": "admissions.inquiry.templates",
        "Reports": "admissions.inquiry.reports",
        "Inquiry Settings": "admissions.inquiry.settings",
        "AI Configuration": "admissions.settings",
        "Students": "students",
        "All Students": "students.profiles",
        "Attendance": "students.attendance",
        "Health Records": "students.health",
        "Classroom": "academics.classes",
        "Classes": "academics.classes",
        "Timetable": "academics.timetable",
        "Diary": "diary",
        "Curriculum": "academics.curriculum",
        "Staff": "staff",
        "Staff Directory": "staff.directory",
        "Staff Attendance": "staff.attendance",
        "Payroll": "staff.payroll",
        "Billing": "billing",
        "Inventory": "inventory",
        "Hostel Management": "hostel",
        "Room Allocation": "hostel.allocation",
        "Hostel Billing": "hostel.billing",
        "Hostel Settings": "hostel.settings",
        "Canteen": "canteen",
        "Dashboard & AI": "canteen.dashboard",
        "Accounts Ledger": "canteen.accounts",
        "Menu & Timetable": "canteen.menu",
        "Point of Sale": "canteen.pos",
        "Subscriptions": "canteen.subscriptions",
        "Accounts": "accounts",
        "Financial Dashboard": "accounts.dashboard",
        "Transactions": "accounts.transactions",
        "Vendors & Payees": "accounts.vendors",
        "AI Insights": "accounts.insights",
        "Account Settings": "accounts.settings",
        "Transport": "transport",
        "Transport Dashboard": "transport",
        "Route": "transport.routes",
        "Application": "transport.apply",
        "Fleet": "transport.vehicles",
        "Analytics & Reports": "transport.reports",
        "Expense Tracking": "transport.expenses",
        "Library": "library",
        "Training Center": "training",
        "Documents": "documents",
        "Communication": "communication",
        "Marketing Tools": "marketing",
        "Roles & Permissions": "settings",
        "ID Cards": "students.idcards",
        "ID Card Templates": "settings.idcards",
        "Institutional Identity": "settings.identity",
        "Biometric Integration": "settings.biometric",
        "Location & Physicality": "settings.location",
        "Attendance & Leaves": "settings.leaves",
        "System Access Control": "settings.admin",
        "Payroll & Disbursement": "settings.payroll",
        "Regional Operations": "settings.config",
        "Connectors & APIs": "settings.integrations",
        "Academic Years": "settings.academicyears",
        "Fee Configuration": "settings.fees",
        "Branch Management": "settings.branches",
        "Subscription & Plan": "settings.subscription",
        "Development": "students.development",
        "Development Settings": "settings.development",
        "UI Kit / Design System": "settings",
        "Settings": "settings"
    };

    const isModuleEnabled = (permissionKey: string) => {
        if (!permissionKey) return true;
        if (!Array.isArray(enabledModules) || enabledModules.length === 0) return true;
        return enabledModules.includes(permissionKey) || enabledModules.some(m => typeof m === 'string' && permissionKey.startsWith(m + "."));
    };

    const navigation = rawNavigation.reduce((acc: NavItem[], item) => {
        const permKey = navPermissionMap[item.name];
        if (permKey && !isModuleEnabled(permKey)) return acc;
        const hasDirectAccess = permKey ? checkAccess(permKey) : false;

        if (item.children) {
            const visibleChildren = item.children.filter(child => {
                let childKey = "";
                if (child.name === "Attendance" && item.name === "Students") childKey = "students.attendance";
                else if (child.name === "Attendance" && item.name === "Staff") {
                    if (user?.role === "STAFF") return true;
                    childKey = "staff.attendance";
                }
                else childKey = navPermissionMap[child.name];
                if (!isModuleEnabled(childKey)) return false;
                return checkAccess(childKey);
            });
            if (visibleChildren.length > 0) {
                acc.push({ ...item, children: visibleChildren });
            }
        } else {
            if (hasDirectAccess) {
                acc.push(item);
            }
        }
        return acc;
    }, []);

    useEffect(() => {
        setExpandedGroups(prev => {
            const next = { ...prev };
            let changed = false;
            rawNavigation.forEach(item => {
                if (item.children && pathname.startsWith(item.href)) {
                    if (!next[item.name]) {
                        next[item.name] = true;
                        changed = true;
                    }
                }
            });
            return changed ? next : prev;
        });
    }, [pathname]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const activeEl = document.getElementById("active-sidebar-item");
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [pathname]); // Only scroll when navigating to a new module or sub-module

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className={cn(
                        "fixed inset-0 bg-black/30 backdrop-blur-sm",
                        isAppFullscreen ? "z-[10001]" : "z-[140] lg:hidden"
                    )}
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={cn(
                "fixed inset-y-0 left-0 flex flex-col bg-white transition-all duration-300 ease-in-out after:absolute after:right-0 after:top-[94px] after:bottom-0 after:w-px after:bg-zinc-200/80",
                isAppFullscreen ? "z-[10002]" : "z-[150]",
                isAppFullscreen
                    ? (isOpen ? "translate-x-0" : "-translate-x-full")
                    : (isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"),
                isAppFullscreen
                    ? "w-[272px]"
                    : (isCollapsed ? "lg:w-[100px]" : "lg:w-[272px]"),
                "w-[272px]" // Mobile width always
            )}>
                <div className="flex h-full flex-col">

                    {/* ─── Floating Collapse Toggle ─── */}
                    <button
                        onClick={toggleCollapse}
                        className={cn(
                            "absolute -right-3 top-[calc(50%-200px)] z-[160] h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-brand bg-brand text-white shadow-md transition-all hover:bg-brand/90",
                            isAppFullscreen ? "hidden" : "hidden lg:flex"
                        )}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>

                    {/* ─── Logo Section ─── */}
                    <div className={cn(
                        "flex items-center justify-center border-b border-brand/10 bg-brand transition-all",
                        isCollapsed ? "h-[94px] px-2" : "h-[94px] px-4"
                    )}>
                        <div className="flex h-full w-full items-center justify-center group">
                            {logo ? (
                                <img
                                    src={logo}
                                    alt={displayName}
                                    className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div
                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-lg transition-transform duration-300 group-hover:scale-105"
                                >
                                    <span className="text-xl font-black">
                                        {displayName[0]}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Mobile Close */}
                        <button onClick={() => setIsOpen(false)} className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* ─── Navigation ─── */}
                    <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
                        <nav className="space-y-0.5 px-3">
                            {navigation.map((item) => {
                                const isGroup = !!item.children;
                                const isActive = isGroup
                                    ? pathname.startsWith(item.href)
                                    : pathname === item.href;
                                const isExpanded = expandedGroups[item.name];

                                // ── Single Item ──
                                if (!isGroup) {
                                    return (
                                        <Link
                                            id={isActive ? "active-sidebar-item" : undefined}
                                            key={item.name}
                                            href={item.href}
                                            title={isCollapsed ? item.name : ""}
                                            className={cn(
                                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-brand text-white shadow-md shadow-brand/20"
                                                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                                                isCollapsed && "justify-center px-0"
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                                                    isActive
                                                        ? "text-[var(--secondary-color)]"
                                                        : "text-zinc-400 group-hover:text-zinc-600"
                                                )}
                                            />
                                            {!isCollapsed && <span className={cn(isActive && "text-[var(--secondary-color)]")}>{item.name}</span>}
                                        </Link>
                                    );
                                }

                                // ── Group Item ──
                                const hasActiveChild = item.children?.some(c => pathname === c.href);
                                return (
                                    <div key={item.name}>
                                        <button
                                            id={(isActive && !hasActiveChild) ? "active-sidebar-item" : undefined}
                                            onClick={() => toggleGroup(item.name)}
                                            title={isCollapsed ? item.name : ""}
                                            className={cn(
                                                "group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                                                isActive && !isExpanded
                                                    ? "bg-brand text-[var(--secondary-color)] shadow-md shadow-brand/20"
                                                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                                                isCollapsed && "justify-center px-0"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon
                                                    className={cn(
                                                        "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                                                        (isActive && !isExpanded)
                                                            ? "text-[var(--secondary-color)]"
                                                            : "text-zinc-400 group-hover:text-zinc-600"
                                                    )}
                                                />
                                                {!isCollapsed && <span>{item.name}</span>}
                                            </div>
                                            {!isCollapsed && (
                                                <ChevronDown
                                                    className={cn(
                                                        "h-4 w-4 text-zinc-400 transition-transform duration-200",
                                                        isExpanded ? "rotate-0" : "-rotate-90",
                                                        (isActive && !isExpanded) && "text-[var(--secondary-color)]"
                                                    )}
                                                />
                                            )}
                                        </button>

                                        {/* Children */}
                                        {isExpanded && !isCollapsed && (
                                            <div className="mt-0.5 ml-[22px] pl-4 border-l border-zinc-200/80 space-y-0.5">
                                                {item.children!.map((child) => {
                                                    const isChildActive = pathname === child.href;
                                                    return (
                                                        <Link
                                                            id={isChildActive ? "active-sidebar-item" : undefined}
                                                            key={child.name}
                                                            href={child.href}
                                                            className={cn(
                                                                "block px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                                                                isChildActive
                                                                    ? "text-brand bg-brand/10 font-bold"
                                                                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                                                            )}
                                                        >
                                                            {child.name}
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

                    {/* ─── User Profile (Bottom) ─── */}
                    <div className="border-t border-zinc-100 p-3">
                        <div className={cn(
                            "flex items-center",
                            isCollapsed ? "justify-center" : "justify-between"
                        )}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold flex-shrink-0 bg-indigo-600"
                                >
                                    {(user?.firstName?.[0] || "U").toUpperCase()}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-semibold text-zinc-800 truncate max-w-[130px] leading-tight">
                                            {user?.firstName} {user?.lastName}
                                        </span>
                                        <span className="text-xs text-zinc-400 capitalize leading-tight">
                                            {user?.role?.toLowerCase() || "Staff"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && (
                                <button
                                    onClick={async () => {
                                        await clearUserSessionAction();
                                        router.push(`/school-login`);
                                    }}
                                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 transition-colors"
                                    title="Sign out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div >
            </div >
        </>
    );
}
