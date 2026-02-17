import { useState } from "react";
import { 
  LayoutDashboard, Target, GraduationCap, School, Clock, FileText, 
  BookOpen, Users, DollarSign, Package, Bus, Library, FolderOpen,
  MessageSquare, TrendingUp, Shield, Settings, ChevronDown, ChevronRight,
  Sparkles, List, BarChart3, Phone, Calendar, Zap, Mail, FileCheck,
  CheckSquare, ClipboardCheck, Menu, X, LogOut, Bell, User, ChevronsLeft, ChevronsRight
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  badge?: string;
  children?: {
    label: string;
    href: string;
  }[];
}

interface SidebarProps {
  onNavigate?: (path: string) => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["admissions"]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard"
    },
    {
      id: "admissions",
      label: "Admissions",
      icon: Target,
      children: [
        { label: "AI Dashboard", href: "/admissions/ai-dashboard" },
        { label: "Application Pipeline", href: "/admissions/pipeline" },
        { label: "Inquiry Dashboard", href: "/admissions/inquiry-dashboard" },
        { label: "Leads (Pipeline)", href: "/admissions/leads" },
        { label: "Lead List", href: "/admissions/lead-list" },
        { label: "Follow-ups", href: "/admissions/followups" },
        { label: "School Tours", href: "/admissions/tours" },
        { label: "WhatsApp Automation", href: "/admissions/whatsapp" },
        { label: "Template Library", href: "/admissions/templates" },
        { label: "Reports", href: "/admissions/reports" },
        { label: "Inquiry Settings", href: "/admissions/settings" },
        { label: "Configuration", href: "/admissions/configuration" }
      ]
    },
    {
      id: "academics",
      label: "Academics",
      icon: GraduationCap,
      children: [
        { label: "All Students", href: "/academics/students" },
        { label: "Attendance", href: "/academics/attendance" },
        { label: "Progress Reports", href: "/academics/progress" }
      ]
    },
    {
      id: "classes",
      label: "Classes",
      icon: School,
      href: "/classes"
    },
    {
      id: "timetable",
      label: "Timetable",
      icon: Clock,
      href: "/timetable"
    },
    {
      id: "diary",
      label: "Diary",
      icon: FileText,
      href: "/diary"
    },
    {
      id: "curriculum",
      label: "Curriculum",
      icon: BookOpen,
      href: "/curriculum"
    },
    {
      id: "staff",
      label: "Staff",
      icon: Users,
      href: "/staff"
    },
    {
      id: "billing",
      label: "Billing",
      icon: DollarSign,
      href: "/billing"
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      href: "/inventory"
    },
    {
      id: "transport",
      label: "Transport",
      icon: Bus,
      href: "/transport"
    },
    {
      id: "library",
      label: "Library",
      icon: Library,
      href: "/library"
    },
    {
      id: "documents",
      label: "Documents",
      icon: FolderOpen,
      href: "/documents"
    },
    {
      id: "communication",
      label: "Communication",
      icon: MessageSquare,
      href: "/communication"
    },
    {
      id: "marketing",
      label: "Marketing Tools",
      icon: TrendingUp,
      href: "/marketing"
    },
    {
      id: "roles",
      label: "Roles & Permissions",
      icon: Shield,
      href: "/roles"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings"
    }
  ];

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      toggleExpanded(item.id);
    } else if (item.href && onNavigate) {
      onNavigate(item.href);
      setIsMobileOpen(false);
    }
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo/Brand */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-slate-900">🧠</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none text-slate-900">Bodhi Board</span>
              <span className="text-xs text-slate-500">School OS</span>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="p-4 border-b border-slate-200 flex justify-center">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-slate-900">🧠</span>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.id);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.id}>
                {/* Main Item */}
                <button
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    item.id === "dashboard"
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                    <Icon className={`h-5 w-5 ${
                      item.id === "dashboard" ? "text-teal-600" : "text-slate-500"
                    }`} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && hasChildren && (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )
                  )}
                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-teal-100 text-teal-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Sub Items */}
                {!collapsed && hasChildren && isExpanded && (
                  <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-200 space-y-1">
                    {item.children!.map((child, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onNavigate) onNavigate(child.href);
                          setIsMobileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold">
                N
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">TEST TEST</span>
                <span className="text-xs text-slate-500">Admin</span>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <LogOut className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="p-4 border-t border-slate-200 flex justify-center">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold">
            N
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6 text-slate-700" />
        ) : (
          <Menu className="h-6 w-6 text-slate-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex lg:flex-col ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-md"
        >
          {isCollapsed ? (
            <ChevronsRight className="h-3 w-3 text-slate-600" />
          ) : (
            <ChevronsLeft className="h-3 w-3 text-slate-600" />
          )}
        </button>
        
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
