"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    BarChart3,
    Building2,
    Layers,
    Settings,
    ShieldCheck,
    LogOut,
    Globe,
    Database,
    CreditCard,
    FileText,
    GraduationCap,
    ChevronRight,
    Plus,
    Loader2,
    Pencil,
    Trash2,
    Server
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;
import { cn } from "@/lib/utils";
import { logoutSuperAdminAction } from "@/app/actions/admin-auth-actions";
import {
    getTrainingCategoriesAction,
    createTrainingCategoryAction,
    renameTrainingCategoryAction,
    deleteTrainingCategoryAction,
    testAction
} from "../../app/actions/training-categories";
import { toast } from "sonner";
import { useModal } from "@/components/ui/modal/ModalContext";

export function AdminSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["Training Module"]));
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const { openInputModal, openModal } = useModal();

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            setIsLoadingCategories(true);

            console.log("AdminSidebar: Testing server action connection...");
            const testRes = await testAction();
            console.log("AdminSidebar: testAction result:", testRes);

            let categoriesData = [];
            // Try server action first
            const res = await getTrainingCategoriesAction();
            if (res.success && Array.isArray(res.data)) {
                categoriesData = res.data;
            } else {
                console.error("Server Action failed, falling back to API...", res);
                // Fallback to API route
                try {
                    const apiRes = await fetch('/api/categories');
                    const apiJson = await apiRes.json();
                    if (apiJson.success && Array.isArray(apiJson.data)) {
                        categoriesData = apiJson.data;
                    }
                } catch (apiError) {
                    console.error("API Fallback failed:", apiError);
                }
            }

            if (categoriesData.length > 0) {
                setCategories(categoriesData);
            } else {
                console.error("Critical: Could not load categories from either source.");
                setCategories([]);
            }
        } catch (error) {
            console.error("AdminSidebar loadCategories error:", error);
            setCategories([]);
        } finally {
            setIsLoadingCategories(false);
        }
    }

    async function handleLogout() {
        await logoutSuperAdminAction();
        router.push("/admin/login");
    }

    const toggleExpand = (name: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const handleAddCategory = () => {
        openInputModal({
            title: "Add Training Category",
            description: "Enter the name of the new training category (e.g., 'Cook', 'Security').",
            placeholder: "Category Name",
            onSubmit: async (value: string) => {
                const res = await createTrainingCategoryAction(value);
                if (res.success) {
                    toast.success("Category created successfully!");
                    loadCategories();
                } else {
                    toast.error(res.error || "Failed to create category");
                }
            }
        });
    };

    const handleRenameCategory = (id: string, currentName: string) => {
        openInputModal({
            title: "Rename Category",
            initialValue: currentName,
            onSubmit: async (value: string) => {
                const res = await renameTrainingCategoryAction(id, value);
                if (res.success) {
                    toast.success("Category renamed");
                    loadCategories();
                } else {
                    toast.error(res.error || "Failed to rename category");
                }
            }
        });
    };

    const handleDeleteCategory = (id: string) => {
        openModal("CONFIRMATION", {
            title: "Delete Category",
            message: "Are you sure you want to delete this category? All modules within it will be hidden or lost.",
            variant: "danger",
            confirmText: "Delete",
            onConfirm: async () => {
                const res = await deleteTrainingCategoryAction(id);
                if (res.success) {
                    toast.success("Category deleted");
                    loadCategories();
                } else {
                    toast.error(res.error || "Failed to delete category");
                }
            }
        });
    };

    type NavItem = {
        name: string;
        href: string;
        icon: any;
        children?: { name: string; href: string; id?: string; type?: string }[];
    };

    const baseNavigation: NavItem[] = [
        { name: "Console Overview", href: "/admin/dashboard", icon: BarChart3 },
        { name: "Tenant Management", href: "/admin/tenants", icon: Building2 },
        { name: "Master Data", href: "/admin/dashboard/master-data", icon: Database },
        { name: "Marketing Tools", href: "/admin/marketing", icon: Layers },
        { name: "CMS", href: "/admin/cms", icon: FileText },
        { name: "Curriculum Architect", href: "/admin/curriculum", icon: Layers },
    ];

    const schoolResourcesCat = categories.find(c => c.slug === "school-resources" || c.name === "School Resources");

    // Add Document Management as a top-level item if it exists
    const docManagementNav: NavItem | null = schoolResourcesCat ? {
        name: "Document Management",
        href: `/admin/training?categoryId=${schoolResourcesCat.id}`,
        icon: FileText
    } : null;

    const trainingNav: NavItem = {
        name: "Training Module",
        href: "/admin/training",
        icon: GraduationCap,
        children: [
            ...categories
                .filter(cat => cat.id !== schoolResourcesCat?.id) // Filter out School Resources
                .map(cat => ({
                    name: cat.name,
                    href: `/admin/training?categoryId=${cat.id}`,
                    id: cat.id,
                    type: 'category'
                }))
        ]
    };

    const bottomNavigation: NavItem[] = [
        { name: "Global Monitor", href: "/admin/curriculum/monitor", icon: Globe },
        { name: "System Config", href: "/admin/settings", icon: Settings },
        { name: "API Management", href: "/admin/settings/apis", icon: Server },
        { name: "Subscription Plans", href: "/admin/subscriptions", icon: CreditCard },
    ];

    const navigation: NavItem[] = [
        ...baseNavigation,
        ...(docManagementNav ? [docManagementNav] : []),
        trainingNav,
        ...bottomNavigation
    ];

    return (
        <MotionDiv
            initial={{ width: 288 }}
            animate={{ width: isCollapsed ? 80 : 288 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex h-screen flex-col bg-white border-r border-zinc-200 relative shrink-0"
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center hover:text-zinc-900 hover:scale-110 transition-all z-50 shadow-sm"
            >
                <ChevronRight className={cn("h-3 w-3 transition-transform", isCollapsed ? "" : "rotate-180")} />
            </button>

            <div className="flex h-16 items-center gap-3 px-6 border-b border-zinc-100 overflow-hidden whitespace-nowrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-md shadow-zinc-900/10 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <MotionSpan
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                    className="text-sm font-bold text-zinc-900 tracking-wide overflow-hidden"
                >
                    MASTER ADMIN
                </MotionSpan>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-4">
                {navigation.map((item) => {
                    const currentCategoryId = searchParams.get('categoryId');
                    let isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin/dashboard");

                    // Special handling to DE-SELECT Training Module if we are in Document Management
                    if (item.name === "Training Module") {
                        if (schoolResourcesCat && currentCategoryId === schoolResourcesCat.id) {
                            isActive = false;
                        }
                    }

                    // Special handling to SELECT Document Management if we are in it
                    if (item.name === "Document Management") {
                        if (schoolResourcesCat && currentCategoryId === schoolResourcesCat.id) {
                            isActive = true;
                        } else {
                            // strictly false if not matching category, because pathname /admin/training matches both
                            isActive = false;
                        }
                    }

                    const isExpanded = expandedItems.has(item.name);
                    const isChildActive = item.children?.some(child => {
                        return pathname + window.location.search === child.href;
                    });

                    return (
                        <div key={item.name}>
                            {item.children ? (
                                <>
                                    <div
                                        onClick={() => !isCollapsed && toggleExpand(item.name)}
                                        className={cn(
                                            "group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 cursor-pointer select-none",
                                            isActive || isChildActive
                                                ? "bg-zinc-50 text-blue-600 shadow-sm border border-zinc-100"
                                                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                                            isCollapsed ? "justify-center" : ""
                                        )}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive || isChildActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600")} />
                                            <MotionSpan
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                                                className="overflow-hidden whitespace-nowrap"
                                            >
                                                {item.name}
                                            </MotionSpan>
                                        </div>
                                        {!isCollapsed && (
                                            <ChevronRight className={cn("h-4 w-4 transition-transform text-zinc-400", isExpanded ? "rotate-90" : "")} />
                                        )}
                                    </div>
                                    {!isCollapsed && isExpanded && (
                                        <div className="pl-10 space-y-1 mt-1">
                                            {isLoadingCategories && item.name === "Training Module" ? (
                                                <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-400">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                                                </div>
                                            ) : (
                                                <>
                                                    {item.children.map(child => {
                                                        // Use pure href string matching if possible, or exact match
                                                        const isChildSelected = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '') === child.href
                                                            || (child.href.includes('?') && searchParams.get('categoryId') === new URLSearchParams(child.href.split('?')[1]).get('categoryId'));

                                                        return (
                                                            <div key={child.name} className="group relative flex items-center">
                                                                <Link
                                                                    href={child.href}
                                                                    className={cn(
                                                                        "block rounded-lg px-3 py-2 text-xs font-medium transition-all flex-1 truncate",
                                                                        isChildSelected
                                                                            ? "text-blue-600 bg-blue-50 font-bold"
                                                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                                                    )}
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                                {child.type === 'category' && (
                                                                    <div className="absolute right-1 hidden group-hover:flex items-center gap-1 bg-white/90 backdrop-blur-sm p-0.5 rounded shadow-sm border border-zinc-100">
                                                                        <button
                                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRenameCategory(child.id!, child.name); }}
                                                                            className="p-1 hover:text-blue-600 rounded text-zinc-400 hover:bg-zinc-100 transition-colors"
                                                                            title="Rename"
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteCategory(child.id!); }}
                                                                            className="p-1 hover:text-red-600 rounded text-zinc-400 hover:bg-zinc-100 transition-colors"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                    {item.name === "Training Module" && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); handleAddCategory(); }}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all mt-2 border border-dashed border-indigo-200"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add Category
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-zinc-50 text-blue-600 shadow-sm border border-zinc-100"
                                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                                        isCollapsed ? "justify-center" : ""
                                    )}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600")} />
                                    <MotionSpan
                                        animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                                        className="overflow-hidden whitespace-nowrap"
                                    >
                                        {item.name}
                                    </MotionSpan>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-zinc-100 overflow-hidden">
                <div className={cn("flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-3", isCollapsed && "justify-center px-0 bg-transparent border-none")}>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-inner ring-2 ring-white shrink-0" />
                    <MotionDiv
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                        className="flex-1 overflow-hidden whitespace-nowrap"
                    >
                        <p className="truncate text-xs font-bold text-zinc-900">Root User</p>
                        <p className="truncate text-[10px] text-zinc-500">access-level: 0</p>
                    </MotionDiv>

                    {!isCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="text-zinc-400 hover:text-zinc-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </MotionDiv>
    );
}
