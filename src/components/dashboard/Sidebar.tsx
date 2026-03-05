"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Users, FileText, Briefcase, CreditCard,
    MessageCircle, Settings, GraduationCap, Clock, BookOpen,
    Package, Layers, ChevronDown, ChevronRight, ChevronLeft,
    LucideIcon, NotebookPen, LogOut, Shield, Banknote, Bus,
    FileSpreadsheet, Folder, MapPin, TrendingUp, Sparkles, X,
    PanelLeftClose, PanelLeftOpen, Activity, School, Building2,
    Palmtree, ShieldCheck, Fingerprint, Zap, CalendarDays, Wallet,
    Building, Utensils, ShoppingBag, Receipt, Store, Brain,
    ShieldAlert, MessageSquare, Binary
} from "lucide-react";
import { useState, useEffect } from "react";
import { clearUserSessionAction } from "@/app/actions/session-actions";
import { useSidebar } from "@/context/SidebarContext";

type NavItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: { name: string; href: string; icon: LucideIcon }[];
};

// ── Design tokens matching UI Kit v3 ──────────────────────────
const AMBER = "#F59E0B";
const AMBER_D = "#D97706";
const AMBER_L = "#FEF3C7";
const AMBER_XL = "#FFFBEB";
const NAVY = "#1E1B4B";
const NAVYm = "#312E81";
const G50 = "#F9FAFB";
const G100 = "#F3F4F6";
const G200 = "#E5E7EB";
const G400 = "#9CA3AF";
const G500 = "#6B7280";
const G600 = "#4B5563";
const G700 = "#374151";
const SPRING = "cubic-bezier(0.34,1.56,0.64,1)";

export function Sidebar({ schoolName, logo, user, enabledModules = [] }: {
    schoolName?: string;
    logo?: string | null;
    user?: any;
    enabledModules?: string[];
}) {
    const { isOpen, isCollapsed, toggleCollapse, setIsOpen, isAppFullscreen } = useSidebar();
    const rawPathname = usePathname();
    const pathname = rawPathname || "";
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string || "demo";

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const toggleGroup = (name: string) => setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));

    const displayName = schoolName || "Preschool ERP";
    const initials = displayName.slice(0, 2).toUpperCase();

    const checkAccess = (permissionKey: string) => {
        if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") return true;
        if (!user?.customRole) return permissionKey === "dashboard";
        let perms: any[] = [];
        try {
            perms = typeof user.customRole.permissions === 'string'
                ? JSON.parse(user.customRole.permissions)
                : user.customRole.permissions;
        } catch (e) { return false; }
        if (!perms || !Array.isArray(perms)) return false;
        const modulePerm = perms.find(p => p.module === permissionKey || p.module?.startsWith(permissionKey + "."));
        return !!modulePerm?.actions?.includes("view");
    };

    let dashboardHref = `/s/${slug}/dashboard`;
    if (user?.role === "STAFF") dashboardHref = `/s/${slug}/teacher/${user.id}/dashboard`;
    else if (user?.role === "PARENT") dashboardHref = `/s/${slug}/parent`;

    const rawNavigation: NavItem[] = [
        { name: "Dashboard", href: dashboardHref, icon: LayoutDashboard },
        {
            name: "Students", href: `/s/${slug}/students`, icon: GraduationCap,
            children: [
                { name: "All Students", href: `/s/${slug}/students`, icon: Users },
                { name: "Attendance", href: `/s/${slug}/students/attendance`, icon: Clock },
                { name: "Progress Reports", href: `/s/${slug}/students/reports`, icon: FileSpreadsheet },
                { name: "Development", href: `/s/${slug}/students/development`, icon: Brain },
                { name: "Health Records", href: `/s/${slug}/students/health`, icon: Activity },
                { name: "Promote Students", href: `/s/${slug}/students/promote`, icon: TrendingUp },
                { name: "ID Cards", href: `/s/${slug}/students/id-cards`, icon: CreditCard },
            ]
        },
        { name: "Classes", href: `/s/${slug}/academics/classes`, icon: Layers },
        {
            name: "Classroom", href: `/s/${slug}/classroom`, icon: BookOpen,
            children: [
                { name: "Classroom Central", href: `/s/${slug}/classroom`, icon: LayoutDashboard },
                { name: "Teacher Guides", href: `/s/${slug}/classroom/guide`, icon: BookOpen },
                { name: "Worksheets", href: `/s/${slug}/classroom/worksheets`, icon: FileSpreadsheet },
            ]
        },
        { name: "Timetable", href: `/s/${slug}/academics/timetable`, icon: Clock },
        { name: "Diary", href: `/s/${slug}/diary`, icon: NotebookPen },
        { name: "Homework", href: `/s/${slug}/homework`, icon: NotebookPen },
        { name: "Curriculum", href: `/s/${slug}/curriculum`, icon: FileText },
        {
            name: "Human Resources", href: `/s/${slug}/hr`, icon: Briefcase,
            children: [
                { name: "HR Dashboard", href: `/s/${slug}/hr`, icon: LayoutDashboard },
                { name: "Staff Directory", href: `/s/${slug}/hr/directory`, icon: Users },
                { name: "Attendance", href: `/s/${slug}/hr/attendance`, icon: Clock },
                { name: "Payroll Dashboard", href: `/s/${slug}/hr/payroll`, icon: Banknote },
                { name: "Recruitment (ATS)", href: `/s/${slug}/hr/recruitment`, icon: Sparkles },
                { name: "Roles & Permissions", href: `/s/${slug}/hr/roles`, icon: Shield },
            ]
        },
        {
            name: "Admissions CRM", href: `/s/${slug}/admissions`, icon: FileText,
            children: [
                { name: "Application Pipeline", href: `/s/${slug}/admissions`, icon: Layers },
                { name: "Leads (Pipeline)", href: `/s/${slug}/admissions/inquiry/pipeline`, icon: MessageCircle },
                { name: "Lead List", href: `/s/${slug}/admissions/inquiry/list`, icon: Users },
                { name: "Follow-ups", href: `/s/${slug}/admissions/inquiry/followups`, icon: Clock },
                { name: "Inquiry Dashboard", href: `/s/${slug}/admissions/inquiry`, icon: LayoutDashboard },
                { name: "School Tours", href: `/s/${slug}/admissions/inquiry/tours`, icon: MapPin },
                { name: "AI Dashboard", href: `/s/${slug}/admissions/dashboard`, icon: Sparkles },
                { name: "WhatsApp Automation", href: `/s/${slug}/admissions/inquiry/automation`, icon: MessageCircle },
                { name: "Template Library", href: `/s/${slug}/admissions/inquiry/templates`, icon: BookOpen },
                { name: "Reports", href: `/s/${slug}/admissions/inquiry/reports`, icon: TrendingUp },
                { name: "Inquiry Settings", href: `/s/${slug}/admissions/inquiry/settings`, icon: Settings },
                { name: "AI Configuration", href: `/s/${slug}/admissions/settings/ai`, icon: Sparkles },
            ]
        },
        {
            name: "Accounts", href: `/s/${slug}/accounts`, icon: Wallet,
            children: [
                { name: "Financial Dashboard", href: `/s/${slug}/accounts`, icon: LayoutDashboard },
                { name: "Fee Management", href: `/s/${slug}/billing`, icon: CreditCard },
                { name: "Transactions", href: `/s/${slug}/accounts/transactions`, icon: FileSpreadsheet },
                { name: "Vendors & Payees", href: `/s/${slug}/accounts/vendors`, icon: Users },
                { name: "Bulk Fee Actions", href: `/s/${slug}/billing/bulk`, icon: Layers },
                { name: "Purchase Orders", href: `/s/${slug}/vendor/purchase-orders`, icon: Receipt },
                { name: "Quotations", href: `/s/${slug}/vendor/quotations`, icon: FileText },
                { name: "AI Insights", href: `/s/${slug}/accounts/insights`, icon: Sparkles },
                { name: "Account Settings", href: `/s/${slug}/accounts/settings`, icon: Settings },
            ]
        },
        {
            name: "Communication", href: `/s/${slug}/communication`, icon: MessageCircle,
            children: [
                { name: "Communication Center", href: `/s/${slug}/communication`, icon: MessageSquare },
                { name: "Chat History", href: `/s/${slug}/communication/chat-history`, icon: ShieldAlert },
                { name: "Circulars & Notices", href: `/s/${slug}/circulars`, icon: FileText },
                { name: "Events & Calendar", href: `/s/${slug}/events`, icon: CalendarDays },
                { name: "PTM Scheduler", href: `/s/${slug}/ptm`, icon: Users },
                { name: "Emergency Alerts", href: `/s/${slug}/emergency`, icon: ShieldAlert },
            ]
        },
        {
            name: "Transport", href: `/s/${slug}/transport`, icon: Bus,
            children: [
                { name: "Transport Dashboard", href: `/s/${slug}/transport`, icon: LayoutDashboard },
                { name: "Routes", href: `/s/${slug}/transport/route/routes`, icon: MapPin },
                { name: "Student List", href: `/s/${slug}/transport/students`, icon: GraduationCap },
                { name: "Fleet – Vehicles", href: `/s/${slug}/transport/fleet/vehicles`, icon: Bus },
                { name: "Fleet – Drivers", href: `/s/${slug}/transport/fleet/drivers`, icon: Users },
                { name: "Fleet – Assignments", href: `/s/${slug}/transport/fleet/assignments`, icon: Layers },
                { name: "GPS Tracking", href: `/s/${slug}/transport/fleet/tracking`, icon: Activity },
                { name: "Applications", href: `/s/${slug}/transport/application/apply`, icon: FileText },
                { name: "Transport Fees", href: `/s/${slug}/transport/fees`, icon: Banknote },
                { name: "Daily Reports", href: `/s/${slug}/transport/reports/daily`, icon: TrendingUp },
                { name: "Monthly Reports", href: `/s/${slug}/transport/reports/monthly`, icon: FileSpreadsheet },
                { name: "Expense Tracking", href: `/s/${slug}/transport/expenses`, icon: Banknote },
                { name: "Application Requests", href: `/s/${slug}/transport/application/requests`, icon: Receipt },
                { name: "Application Status", href: `/s/${slug}/transport/application/status`, icon: Clock },
                { name: "Fee Generation", href: `/s/${slug}/transport/application/fees`, icon: Wallet },
            ]
        },
        {
            name: "Library", href: `/s/${slug}/library`, icon: BookOpen,
            children: [
                { name: "Library Dashboard", href: `/s/${slug}/library`, icon: LayoutDashboard },
                { name: "Issue & Return", href: `/s/${slug}/library/issue`, icon: Receipt },
                { name: "Book Inventory", href: `/s/${slug}/library/inventory`, icon: Package },
                { name: "Transactions", href: `/s/${slug}/library/transactions`, icon: FileSpreadsheet },
            ]
        },
        {
            name: "Canteen", href: `/s/${slug}/canteen`, icon: Utensils,
            children: [
                { name: "Dashboard & AI", href: `/s/${slug}/canteen`, icon: LayoutDashboard },
                { name: "Point of Sale", href: `/s/${slug}/canteen/pos`, icon: CreditCard },
                { name: "Menu & Timetable", href: `/s/${slug}/canteen/menu`, icon: CalendarDays },
                { name: "Meal Packages", href: `/s/${slug}/canteen/packages`, icon: Package },
                { name: "Subscriptions", href: `/s/${slug}/canteen/billing`, icon: Banknote },
                { name: "Accounts Ledger", href: `/s/${slug}/canteen/accounts`, icon: Wallet },
            ]
        },
        {
            name: "Hostel Management", href: `/s/${slug}/hostel/allocation`, icon: Building2,
            children: [
                { name: "Room Allocation", href: `/s/${slug}/hostel/allocation`, icon: Users },
                { name: "Hostel Billing", href: `/s/${slug}/hostel/billing`, icon: Banknote },
                { name: "Hostel Settings", href: `/s/${slug}/hostel/settings`, icon: Settings },
            ]
        },
        {
            name: "School Store", href: `/s/${slug}/store`, icon: ShoppingBag,
            children: [
                { name: "Store Dashboard", href: `/s/${slug}/store`, icon: LayoutDashboard },
                { name: "Orders", href: `/s/${slug}/store/orders`, icon: ShoppingBag },
                { name: "Academic Packages", href: `/s/${slug}/store/packages`, icon: Layers },
                { name: "Catalog", href: `/s/${slug}/store/catalog`, icon: BookOpen },
                { name: "Store Inventory", href: `/s/${slug}/store/inventory`, icon: Activity },
            ]
        },
        { name: "School Inventory", href: `/s/${slug}/inventory`, icon: Package },
        { name: "Training Center", href: `/s/${slug}/training`, icon: School },
        { name: "Documents", href: `/s/${slug}/documents`, icon: Folder },
        { name: "Marketing Tools", href: `/s/${slug}/marketing`, icon: Sparkles },
        { name: "Parent Requests", href: `/s/${slug}/parent-requests`, icon: MessageSquare },
        {
            name: "Settings", href: `/s/${slug}/settings`, icon: Settings,
            children: [
                { name: "Institutional Identity", href: `/s/${slug}/settings/identity`, icon: Building2 },
                { name: "Academic Years", href: `/s/${slug}/settings/academic-years`, icon: CalendarDays },
                { name: "Fee Configuration", href: `/s/${slug}/settings/fees`, icon: Wallet },
                { name: "System Access Control", href: `/s/${slug}/settings/admin`, icon: ShieldCheck },
                { name: "Branch Management", href: `/s/${slug}/settings/branches`, icon: Building },
                { name: "Identifiers", href: `/s/${slug}/settings/identifiers`, icon: Binary },
                { name: "Attendance & Leaves", href: `/s/${slug}/hr/configuration/leaves`, icon: Palmtree },
                { name: "Payroll & Disbursement", href: `/s/${slug}/hr/configuration/payroll`, icon: Banknote },
                { name: "Biometric Integration", href: `/s/${slug}/hr/configuration/biometric`, icon: Fingerprint },
                { name: "Location & Physicality", href: `/s/${slug}/settings/location`, icon: MapPin },
                { name: "Connectors & APIs", href: `/s/${slug}/settings/integrations`, icon: Zap },
                { name: "Subscription & Plan", href: `/s/${slug}/settings/subscription`, icon: CreditCard },
                { name: "ID Card Templates", href: `/s/${slug}/settings/id-cards`, icon: CreditCard },
                { name: "Regional Operations", href: `/s/${slug}/settings/config`, icon: Settings },
                { name: "Development Settings", href: `/s/${slug}/settings/development`, icon: Brain },
                { name: "UI Kit / Design System", href: `/s/${slug}/settings/ui-kit`, icon: Sparkles },
            ]
        },
    ];

    const navPermissionMap: Record<string, string> = {
        "Dashboard": "dashboard",
        "Admissions CRM": "admissions",
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
        "Classroom Central": "academics.classes",
        "Teacher Guides": "academics.classes",
        "Worksheets": "academics.classes",
        "Classes": "academics.classes",
        "Timetable": "academics.timetable",
        "Diary": "dairy",
        "Homework": "homework",
        "Curriculum": "academics.curriculum",
        "Communication": "communication",
        "Communication Center": "communication",
        "Chat History": "communication",
        "Circulars & Notices": "communication",
        "Events & Calendar": "communication",
        "PTM Scheduler": "communication",
        "Emergency Alerts": "communication",
        "Marketing Tools": "marketing",
        "Parent Requests": "communication",
        "Training Center": "training",
        "Documents": "documents",
        "Settings": "settings",
    };

    const isModuleEnabled = (permissionKey: string) => {
        if (!permissionKey) return true;
        if (!Array.isArray(enabledModules) || enabledModules.length === 0) return true;
        return enabledModules.includes(permissionKey) ||
            enabledModules.some(m => typeof m === 'string' && permissionKey.startsWith(m + "."));
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
                } else childKey = navPermissionMap[child.name];
                if (!isModuleEnabled(childKey)) return false;
                return checkAccess(childKey);
            });
            if (visibleChildren.length > 0) acc.push({ ...item, children: visibleChildren });
        } else {
            if (hasDirectAccess) acc.push(item);
        }
        return acc;
    }, []);

    useEffect(() => {
        setExpandedGroups(prev => {
            const next = { ...prev };
            let changed = false;
            rawNavigation.forEach(item => {
                if (item.children) {
                    const isActiveModule = pathname.startsWith(item.href);
                    if (isActiveModule && !prev[item.name]) { next[item.name] = true; changed = true; }
                    else if (!isActiveModule && prev[item.name]) { next[item.name] = false; changed = true; }
                }
            });
            return changed ? next : prev;
        });
    }, [pathname]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            document.getElementById("active-sidebar-item")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
        return () => clearTimeout(timeout);
    }, [pathname]);

    const userInitials = (user?.firstName?.[0] || "U").toUpperCase() + (user?.lastName?.[0] || "").toUpperCase();

    return (
        <>
            {/* Mobile overlay */}
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
                "fixed inset-y-0 left-0 flex flex-col transition-all duration-300 ease-in-out",
                isAppFullscreen ? "z-[10002]" : "z-[150]",
                isAppFullscreen
                    ? (isOpen ? "translate-x-0" : "-translate-x-full")
                    : (isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"),
                isAppFullscreen ? "w-[272px]" : (isCollapsed ? "lg:w-[80px]" : "lg:w-[256px]"),
                "w-[260px]"
            )}
                style={{
                    background: "white",
                    borderRight: `1px solid ${G100}`,
                    boxShadow: "3px 0 20px rgba(0,0,0,0.06)",
                }}>
                <div className="flex h-full flex-col">

                    {/* ── Logo / Brand Header ── */}
                    <div style={{
                        padding: isCollapsed ? "18px 12px" : "18px 16px",
                        borderBottom: `1px solid ${G100}`,
                        display: "flex", alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "space-between",
                        minHeight: 72,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {/* Logo / Icon */}
                            <div
                                className="float-anim flex-shrink-0"
                                style={{
                                    width: 38, height: 38, borderRadius: 11,
                                    background: `linear-gradient(135deg, ${AMBER}, ${AMBER_D})`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                    boxShadow: `0 4px 14px rgba(245,158,11,0.35)`,
                                    overflow: "hidden",
                                }}
                            >
                                {logo ? (
                                    <img src={logo} alt={displayName} style={{ width: 38, height: 38, objectFit: "cover" }} />
                                ) : (
                                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: "white" }}>
                                        {initials}
                                    </span>
                                )}
                            </div>

                            {!isCollapsed && (
                                <div>
                                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 12.5, fontWeight: 800, color: NAVY, lineHeight: 1.2 }}>
                                        {displayName}
                                    </div>
                                    <div style={{ fontSize: 10.5, color: G400, marginTop: 1 }}>School Portal</div>
                                </div>
                            )}
                        </div>

                        {/* Mobile close */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden"
                            style={{ padding: 6, borderRadius: 8, color: G400, cursor: "pointer", border: "none", background: "transparent" }}
                        >
                            <X style={{ width: 16, height: 16 }} />
                        </button>
                    </div>

                    {/* ── Collapse toggle ── */}
                    <button
                        onClick={toggleCollapse}
                        className={cn("absolute -right-3 z-[160]", isAppFullscreen ? "hidden" : "hidden lg:flex")}
                        style={{
                            top: "calc(50% - 200px)",
                            width: 24, height: 24,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${AMBER}, ${AMBER_D})`,
                            border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 2px 10px rgba(245,158,11,0.4)`,
                            color: "white",
                            transition: `all 0.3s ${SPRING}`,
                        }}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed
                            ? <ChevronRight style={{ width: 13, height: 13 }} />
                            : <ChevronLeft style={{ width: 13, height: 13 }} />}
                    </button>

                    {/* ── Navigation ── */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin py-3">
                        <nav style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>

                            {!isCollapsed && (
                                <div style={{
                                    fontSize: 10, fontWeight: 700, color: G400,
                                    letterSpacing: 1.2, padding: "6px 8px 4px",
                                    textTransform: "uppercase",
                                }}>
                                    Navigation
                                </div>
                            )}

                            {navigation.map((item, navIdx) => {
                                const isGroup = !!item.children;
                                const isActive = isGroup ? pathname.startsWith(item.href) : pathname === item.href;
                                const isExpanded = expandedGroups[item.name];
                                const hasActiveChild = item.children?.some(c => pathname === c.href);

                                // ── Single Item ──
                                if (!isGroup) {
                                    return (
                                        <Link
                                            id={isActive ? "active-sidebar-item" : undefined}
                                            key={item.name}
                                            href={item.href}
                                            title={isCollapsed ? item.name : ""}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 9,
                                                padding: isCollapsed ? "10px 0" : "9px 10px",
                                                borderRadius: 10,
                                                fontSize: 13,
                                                fontWeight: isActive ? 700 : 500,
                                                textDecoration: "none",
                                                justifyContent: isCollapsed ? "center" : "flex-start",
                                                background: isActive
                                                    ? `linear-gradient(135deg, ${AMBER}, ${AMBER_D})`
                                                    : "transparent",
                                                color: isActive ? "white" : G600,
                                                boxShadow: isActive ? `0 3px 14px rgba(245,158,11,0.4)` : "none",
                                                transform: isActive ? "translateX(3px) scale(1.01)" : "none",
                                                transition: `all 0.35s ${SPRING}`,
                                            }}
                                            onMouseEnter={e => {
                                                if (!isActive) {
                                                    (e.currentTarget as HTMLElement).style.background = AMBER_XL;
                                                    (e.currentTarget as HTMLElement).style.color = AMBER_D;
                                                    (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (!isActive) {
                                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                                    (e.currentTarget as HTMLElement).style.color = G600;
                                                    (e.currentTarget as HTMLElement).style.transform = "none";
                                                }
                                            }}
                                        >
                                            <item.icon style={{ width: 16, height: 16, flexShrink: 0, color: isActive ? "rgba(255,255,255,0.9)" : G400 }} />
                                            {!isCollapsed && <span>{item.name}</span>}
                                        </Link>
                                    );
                                }

                                // ── Group Item ──
                                return (
                                    <div key={item.name}>
                                        <button
                                            id={(isActive && !hasActiveChild) ? "active-sidebar-item" : undefined}
                                            onClick={() => toggleGroup(item.name)}
                                            title={isCollapsed ? item.name : ""}
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: isCollapsed ? "center" : "space-between",
                                                gap: 9,
                                                padding: isCollapsed ? "10px 0" : "9px 10px",
                                                borderRadius: 10,
                                                fontSize: 13,
                                                fontWeight: (isActive && !isExpanded) ? 700 : 500,
                                                cursor: "pointer",
                                                border: "none",
                                                background: (isActive && !isExpanded)
                                                    ? `linear-gradient(135deg, ${AMBER}, ${AMBER_D})`
                                                    : "transparent",
                                                color: (isActive && !isExpanded) ? "white" : G600,
                                                boxShadow: (isActive && !isExpanded) ? `0 3px 14px rgba(245,158,11,0.4)` : "none",
                                                transform: (isActive && !isExpanded) ? "translateX(3px) scale(1.01)" : "none",
                                                transition: `all 0.35s ${SPRING}`,
                                            }}
                                            onMouseEnter={e => {
                                                if (!(isActive && !isExpanded)) {
                                                    (e.currentTarget as HTMLElement).style.background = AMBER_XL;
                                                    (e.currentTarget as HTMLElement).style.color = AMBER_D;
                                                    (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (!(isActive && !isExpanded)) {
                                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                                    (e.currentTarget as HTMLElement).style.color = G600;
                                                    (e.currentTarget as HTMLElement).style.transform = "none";
                                                }
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                <item.icon style={{
                                                    width: 16, height: 16, flexShrink: 0,
                                                    color: (isActive && !isExpanded) ? "rgba(255,255,255,0.9)" : G400,
                                                }} />
                                                {!isCollapsed && <span>{item.name}</span>}
                                            </div>
                                            {!isCollapsed && (
                                                <ChevronDown style={{
                                                    width: 14, height: 14, flexShrink: 0,
                                                    color: (isActive && !isExpanded) ? "rgba(255,255,255,0.8)" : G400,
                                                    transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                                                    transition: `transform 0.35s ${SPRING}`,
                                                }} />
                                            )}
                                        </button>

                                        {/* Children */}
                                        {isExpanded && !isCollapsed && (
                                            <div style={{
                                                marginTop: 2, marginLeft: 20, paddingLeft: 12,
                                                borderLeft: `2px solid ${AMBER_L}`,
                                                display: "flex", flexDirection: "column", gap: 1,
                                            }}>
                                                {item.children!.map(child => {
                                                    const isChildActive = pathname === child.href;
                                                    return (
                                                        <Link
                                                            id={isChildActive ? "active-sidebar-item" : undefined}
                                                            key={child.name}
                                                            href={child.href}
                                                            style={{
                                                                display: "block",
                                                                padding: "7px 10px",
                                                                borderRadius: 8,
                                                                fontSize: 12.5,
                                                                fontWeight: isChildActive ? 700 : 500,
                                                                textDecoration: "none",
                                                                color: isChildActive ? AMBER_D : G500,
                                                                background: isChildActive ? AMBER_XL : "transparent",
                                                                borderLeft: isChildActive ? `2px solid ${AMBER}` : "2px solid transparent",
                                                                transition: "all 0.2s ease",
                                                            }}
                                                            onMouseEnter={e => {
                                                                if (!isChildActive) {
                                                                    (e.currentTarget as HTMLElement).style.background = AMBER_XL;
                                                                    (e.currentTarget as HTMLElement).style.color = AMBER_D;
                                                                }
                                                            }}
                                                            onMouseLeave={e => {
                                                                if (!isChildActive) {
                                                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                                                    (e.currentTarget as HTMLElement).style.color = G500;
                                                                }
                                                            }}
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

                    {/* ── User Profile (Bottom) ── */}
                    <div style={{
                        borderTop: `1px solid ${G100}`,
                        padding: isCollapsed ? "12px 8px" : "12px 14px",
                        background: AMBER_XL,
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: isCollapsed ? "center" : "space-between",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {/* Avatar */}
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    background: `linear-gradient(135deg, ${AMBER}, ${AMBER_D})`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 13, fontWeight: 800, color: "white",
                                    flexShrink: 0,
                                    boxShadow: `0 2px 8px rgba(245,158,11,0.35)`,
                                }}>
                                    {userInitials}
                                </div>
                                {!isCollapsed && (
                                    <div>
                                        <div style={{
                                            fontFamily: "'Sora', sans-serif",
                                            fontSize: 12.5, fontWeight: 700,
                                            color: NAVYm,
                                            maxWidth: 120, overflow: "hidden",
                                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}>
                                            {user?.firstName} {user?.lastName}
                                        </div>
                                        <div style={{ fontSize: 10.5, color: G500, textTransform: "capitalize" }}>
                                            {user?.role?.toLowerCase() || "Staff"}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isCollapsed && (
                                <button
                                    onClick={async () => { await clearUserSessionAction(); router.push("/school-login"); }}
                                    title="Sign out"
                                    style={{
                                        padding: 7, borderRadius: 8, border: "none",
                                        background: "transparent", cursor: "pointer",
                                        color: G400, transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#EF4444"; (e.currentTarget as HTMLElement).style.background = "#FEE2E2"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = G400; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                >
                                    <LogOut style={{ width: 15, height: 15 }} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
