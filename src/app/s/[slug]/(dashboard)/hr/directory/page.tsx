"use client";

import {
    Plus, Search, MoreHorizontal, Filter, User as UserIcon, Edit2, Trash2, ArrowUpDown,
    ShieldCheck, CalendarCheck, CreditCard, Settings2, GripVertical
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { getStaffAction, deleteStaffAction, updateStaffBasicInfoAction } from "@/app/actions/staff-actions";
import { searchStaffElasticAction } from "@/app/actions/search-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { toast } from "sonner";
import { AvatarWithAdjustment } from "@/components/dashboard/staff/AvatarWithAdjustment";
import { SearchInput } from "@/components/ui/SearchInput";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { ErpTabs, SectionHeader, tableStyles, SortIcon, RowActions, StatusChip, Btn } from "@/components/ui/erp-ui";

export default function StaffPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { confirm: confirmDialog } = useConfirm();
    const { requestAdminAuth } = useAdminAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [staff, setStaff] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [deptFilter, setDeptFilter] = useState("all");
    const [empTypeFilter, setEmpTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [designations, setDesignations] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employmentTypes, setEmploymentTypes] = useState<any[]>([]);

    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [columns, setColumns] = useState([
        { id: 'name', label: 'Name' },
        { id: 'phone', label: 'Phone Number' },
        { id: 'email', label: 'Email' },
        { id: 'designation', label: 'Designation' },
        { id: 'department', label: 'Department' },
        { id: 'empType', label: 'Emp. Type' },
        { id: 'status', label: 'Status' },
    ]);

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        name: true,
        phone: true,
        email: true,
        designation: true,
        department: true,
        empType: true,
        status: true,
    });

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(columns);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setColumns(items);
    };

    useEffect(() => {
        loadMasterData();
    }, [slug]);

    // Immediate load for filters
    useEffect(() => {
        loadData();
    }, [slug, roleFilter, deptFilter, empTypeFilter, statusFilter]);

    // Debounced load for search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) loadData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Clear search immediate trigger
    useEffect(() => {
        if (searchTerm === "") {
            loadData();
        }
    }, [searchTerm]);

    async function loadMasterData() {
        const [desigRes, deptRes, empRes] = await Promise.all([
            getMasterDataAction("DESIGNATION"),
            getMasterDataAction("DEPARTMENT"),
            getMasterDataAction("EMPLOYMENT_TYPE")
        ]);
        if (desigRes.success) setDesignations(desigRes.data || []);
        if (deptRes.success) setDepartments(deptRes.data || []);
        if (empRes.success) setEmploymentTypes(empRes.data || []);
    }

    async function loadData() {
        setIsLoading(true);
        let res;
        if (searchTerm && searchTerm.length >= 2) {
            res = await searchStaffElasticAction(slug, searchTerm, {
                designation: roleFilter,
                department: deptFilter
            });
            if (res.success) {
                setStaff(res.staff || []);
            }
        } else {
            res = await getStaffAction(slug);
            if (res.success) {
                setStaff(res.data || []);
            }
        }

        if (!res?.success) {
            // Toast only on error if explicitly failed, but getStaffAction handles its own errors mostly in returning {success: false}
            if (res?.error) toast.error("Failed to load staff");
        }
        setIsLoading(false);
    }

    const filteredAndSortedStaff = useMemo(() => {
        let result = staff.filter((person) => {
            // Logic:
            // If we performed a search (searchTerm exists), we assume 'staff' from backend is already relevant.
            // But we still apply dropdown filters on top of it (client-side refinement).
            // If no search, 'staff' is ALL users, so we apply filters.

            const roleMatch = roleFilter === "all" || person.designation === roleFilter;
            const deptMatch = deptFilter === "all" || person.department === deptFilter;
            const empTypeMatch = empTypeFilter === "all" || person.employmentType === empTypeFilter;
            const statusMatch = statusFilter === "all" || person.status === statusFilter;

            // Note: We removed the text 'includes' check because ES handles fuzzy search. 
            // If we kept it, valid ES fuzzy matches (Jon -> John) would be hidden by the strict JS includes check.

            return roleMatch && deptMatch && empTypeMatch && statusMatch;
        });

        result.sort((a, b) => {
            let compare = 0;
            if (sortBy === "name") compare = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            else if (sortBy === "role") compare = (a.role || "").localeCompare(b.role || "");
            else if (sortBy === "dept") compare = (a.department || "").localeCompare(b.department || "");
            else if (sortBy === "status") compare = (a.status || "").localeCompare(b.status || "");

            return sortOrder === "asc" ? compare : -compare;
        });

        return result;
    }, [staff, roleFilter, deptFilter, empTypeFilter, statusFilter, sortBy, sortOrder]);

    const handleUpdateField = async (id: string, field: string, value: string) => {
        // Optimistic update
        setStaff(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

        const res = await updateStaffBasicInfoAction(slug, id, { [field]: value });
        if (res.success) {
            toast.success(`Staff ${field} updated`);
        } else {
            toast.error(res.error || "Update failed");
            loadData(); // Revert
        }
    };

    async function handleDelete(id: string, name: string) {
        const confirmed = await confirmDialog({
            title: "Delete Staff Member",
            message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const isVerified = await requestAdminAuth({
            actionName: "Delete Staff Member",
            description: `You are about to delete ${name}. Please verify your identity to proceed.`
        });

        if (!isVerified) {
            toast.error("Deletion cancelled. Identity verification failed.");
            return;
        }

        const res = await deleteStaffAction(slug, id);
        if (res.success) {
            toast.success("Staff member deleted successfully");
            loadData();
        } else {
            toast.error(res.error || "Failed to delete staff member");
        }
    }

    return (
        <div className="flex flex-col gap-6 p-8 min-w-0">
            <SectionHeader
                title="Staff Management"
                subtitle="View and manage your teaching and administrative team."
                icon={UserIcon}
                action={
                    <div className="flex flex-wrap gap-3">
                        <Btn
                            variant="primary"
                            icon={Plus}
                            onClick={() => router.push(`/s/${slug}/hr/directory/add`)}
                        >
                            Add Staff Member
                        </Btn>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="h-12 px-4 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:border-brand/30 hover:text-brand transition-all outline-none"
                                >
                                    <Settings2 className="h-4 w-4" />
                                    Columns
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl">
                                <DropdownMenuLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    Customize Columns
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="staff-columns">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                                {columns.map((col, index) => (
                                                    <Draggable key={col.id} draggableId={col.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={cn(
                                                                    "flex items-center gap-2 rounded-xl px-2 py-1 transition-colors",
                                                                    snapshot.isDragging ? "bg-zinc-100 shadow-sm dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                                                )}
                                                            >
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className="cursor-pointer p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                                                >
                                                                    <GripVertical className="h-4 w-4" />
                                                                </div>
                                                                <DropdownMenuCheckboxItem
                                                                    className="flex-1 rounded-lg cursor-pointer data-[highlighted]:bg-transparent"
                                                                    checked={visibleColumns[col.id]}
                                                                    onCheckedChange={(checked) =>
                                                                        setVisibleColumns(prev => ({ ...prev, [col.id]: !!checked }))
                                                                    }
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    {col.label}
                                                                </DropdownMenuCheckboxItem>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="h-12 px-4 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all outline-none"
                                    title="More options"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-52">
                                <DropdownMenuItem asChild>
                                    <Link href={`/s/${slug}/hr/roles`} className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-zinc-400" />
                                        Custom Roles
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/s/${slug}/hr/attendance`} className="flex items-center gap-2">
                                        <CalendarCheck className="h-4 w-4 text-zinc-400" />
                                        Attendance
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/s/${slug}/hr/payroll`} className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-zinc-400" />
                                        Payroll
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            {/* Filters & Search */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <SearchInput
                        onSearch={(term) => setSearchTerm(term)}
                        placeholder="Search by name, role or email (Elasticsearch)..."
                        className="w-full"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        title="Filter by Designation"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 focus:ring-2 focus:ring-brand"
                    >
                        <option value="all">All Designations</option>
                        {designations.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>

                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        title="Filter by Department"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>

                    <select
                        value={empTypeFilter}
                        onChange={(e) => setEmpTypeFilter(e.target.value)}
                        title="Filter by Employment Type"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Emp. Types</option>
                        {employmentTypes.map(d => (
                            <option key={d.id} value={d.code}>{d.name}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        title="Filter by Status"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="LEAVE">On Leave</option>
                    </select>

                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-zinc-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            title="Sort By"
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="role">Sort by Role</option>
                            <option value="dept">Sort by Dept</option>
                            <option value="status">Sort by Status</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                            className="p-2 text-zinc-500 hover:text-brand transition-colors"
                        >
                            {sortOrder === "asc" ? "↑" : "↓"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Staff Table */}
            <div style={tableStyles.container}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={tableStyles.thead}>
                        <tr>
                            <th style={{ ...tableStyles.thNoSort, position: "sticky", left: 0, zIndex: 10, background: "linear-gradient(135deg,#1E1B4B,#312E81)" }}>Action</th>
                            {columns.map(col => {
                                if (!visibleColumns[col.id]) return null;
                                return <th key={col.id} style={tableStyles.thNoSort}>{col.label}</th>;
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="p-0">
                                    <DashboardLoader message="Loading staff data..." />
                                </td>
                            </tr>
                        ) : filteredAndSortedStaff.map((person, i) => (
                            <tr
                                key={person.id}
                                style={i % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}
                                onMouseEnter={e => {
                                    (e.currentTarget).style.background = "#FFFBEB";
                                    (e.currentTarget).style.transform = "translateX(3px)";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget).style.background = i % 2 === 0 ? "white" : "#F9FAFB";
                                    (e.currentTarget).style.transform = "none";
                                }}
                            >
                                <td style={{ ...tableStyles.td, position: "sticky", left: 0, zIndex: 10, background: "inherit" }}>
                                    <div className="flex items-center justify-start gap-2 relative z-20">
                                        <RowActions
                                            onEdit={() => router.push(`/s/${slug}/hr/directory/${person.id}/edit`)}
                                            onDelete={() => handleDelete(person.id, `${person.firstName} ${person.lastName}`)}
                                        />
                                    </div>
                                </td>
                                {columns.map(col => {
                                    if (!visibleColumns[col.id]) return null;

                                    if (col.id === 'name') return (
                                        <td key={col.id} style={tableStyles.td}>
                                            <div className="flex items-center gap-4">
                                                <AvatarWithAdjustment
                                                    src={person.avatar}
                                                    adjustment={person.avatarAdjustment}
                                                    className="h-10 w-10 overflow-hidden rounded-full shrink-0"
                                                />
                                                <div className="font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                                    {person.firstName} {person.lastName}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                    if (col.id === 'phone') return (
                                        <td key={col.id} style={tableStyles.td}>
                                            <span className="font-semibold text-zinc-700">{person.mobile || "N/A"}</span>
                                        </td>
                                    );
                                    if (col.id === 'email') return (
                                        <td key={col.id} style={tableStyles.td}>
                                            <span className="font-medium text-zinc-600">{person.email || "N/A"}</span>
                                        </td>
                                    );
                                    if (col.id === 'designation') return (
                                        <td key={col.id} style={tableStyles.td}>
                                            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset whitespace-nowrap bg-amber-50 text-amber-600 border-amber-200">
                                                {person.designation || "-"}
                                            </span>
                                        </td>
                                    );
                                    if (col.id === 'department') return (
                                        <td key={col.id} style={tableStyles.td}>
                                            <span className="text-sm font-semibold text-zinc-600 whitespace-nowrap">
                                                {person.department || "-"}
                                            </span>
                                        </td>
                                    );
                                    if (col.id === 'empType') return (
                                        <td key={col.id} style={tableStyles.td}>
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-100 whitespace-nowrap">
                                                {person.employmentType ? person.employmentType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()) : "-"}
                                            </span>
                                        </td>
                                    );
                                    if (col.id === 'status') return (
                                        <td key={col.id} style={tableStyles.td}>
                                            <StatusChip label={person.status || "UNKNOWN"} />
                                        </td>
                                    );

                                    return null;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {
                !isLoading && filteredAndSortedStaff.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-zinc-400 font-medium">No staff members found matching your criteria.</p>
                    </div>
                )
            }
        </div >
    );
}
