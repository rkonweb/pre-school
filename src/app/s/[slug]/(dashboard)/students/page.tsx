"use client";

import { Plus, Filter, ArrowUpDown, Edit3, Trash2, Loader2, ChevronUp, ChevronDown, Phone, Settings2, Check, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/SearchInput";
import { getStudentsAction, deleteStudentAction } from "@/app/actions/student-actions";
import { searchStudentsElasticAction } from "@/app/actions/search-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getCookie } from "@/lib/cookies";
import { useConfirm } from "@/contexts/ConfirmContext";
import { StandardActionButton } from "@/components/ui/StandardActionButton";

import { StudentAvatar, cleanName } from "@/components/dashboard/students/StudentAvatar";
import { useRolePermissions } from "@/hooks/useRolePermissions";

export default function StudentsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const { can, isLoading: isPermsLoading } = useRolePermissions();
    const { confirm: confirmDialog } = useConfirm();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [classFilter, setClassFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("active");

    // Sort Config
    const [sortConfig, setSortConfig] = useState<{ field: string, direction: "asc" | "desc" }>({
        field: "createdAt",
        direction: "desc"
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState<any>(null);

    const [students, setStudents] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [showColumnToggle, setShowColumnToggle] = useState(false);

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        admissionNumber: true,
        name: true,
        class: true,
        gender: true,
        fatherContact: true,
        motherContact: true,
        joiningDate: true,
        status: true,
    });

    const toggleColumn = (column: string) => {
        setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
    };

    const columns = [
        { id: 'admissionNumber', label: 'Adm No' },
        { id: 'name', label: 'Student Name' },
        { id: 'class', label: 'Class' },
        { id: 'gender', label: 'Gender' },
        { id: 'fatherContact', label: 'Father Contact' },
        { id: 'motherContact', label: 'Mother Contact' },
        { id: 'joiningDate', label: 'Joined' },
        { id: 'status', label: 'Status' },
    ];

    useEffect(() => {
        setMounted(true);
        loadClassrooms();
    }, [slug]);

    // Single unified effect — debounce search, immediate for filters
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled) return;
            await loadData();
        };

        if (searchTerm && searchTerm.length >= 2) {
            const timer = setTimeout(() => { if (!cancelled) run(); }, 400);
            return () => { cancelled = true; clearTimeout(timer); };
        } else {
            run();
            return () => { cancelled = true; };
        }
    }, [slug, page, statusFilter, classFilter, genderFilter, sortConfig, activeTab, searchTerm]);

    const loadClassrooms = async () => {
        const res = await getClassroomsAction(slug);
        if (res?.success) {
            setClassrooms(res.data || []);
        }
    };

    const loadData = async () => {
        setIsLoading(true);

        try {
            const filters: any = {};

            // Status Logic based on Tab
            if (activeTab === "alumni") {
                filters.status = "ALUMNI";
            } else {
                // Active Tab
                if (statusFilter !== "all") {
                    filters.status = statusFilter;
                } else {
                    filters.excludeStatus = "ALUMNI";
                }
            }

            if (classFilter !== "all") filters.class = classFilter;
            if (genderFilter !== "all") filters.gender = genderFilter;

            // Add Academic Year filter
            const academicYearId = getCookie(`academic_year_${slug}`);
            if (academicYearId) {
                filters.academicYearId = academicYearId;
            }

            let res;
            if (searchTerm && searchTerm.length >= 2) {
                res = await searchStudentsElasticAction(slug, searchTerm, filters);
                if (res.success) {
                    setStudents(res.students || []);
                    setPaginationInfo({
                        page: 1,
                        limit: 50,
                        total: res.total,
                        totalPages: Math.ceil((res.total || 0) / 50)
                    });
                } else {
                    // Elastic failed — silently fall back to DB search
                    console.warn("Elastic search failed, falling back to DB:", res.error);
                    res = await getStudentsAction(slug, {
                        page: 1,
                        limit: 50,
                        search: searchTerm,
                        filters,
                        sort: sortConfig
                    });
                    if (res.success) {
                        setStudents(res.students || []);
                        setPaginationInfo(res.pagination);
                    } else {
                        toast.error(res.error || "Search failed");
                    }
                }
            } else {
                res = await getStudentsAction(slug, {
                    page,
                    limit: 10,
                    search: searchTerm,
                    filters,
                    sort: sortConfig
                });

                if (res.success) {
                    setStudents(res.students || []);
                    setPaginationInfo(res.pagination);
                } else {
                    toast.error(res.error || "Failed to load students");
                }
            }

        } catch (error) {
            console.error("Critical Load Error", error);
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (field: string) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
        }));
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortConfig.field !== field) return <div className="w-4 h-4 text-transparent"></div>;
        return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Student",
            message: "Are you sure you want to delete this student? This action cannot be undone.",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await deleteStudentAction(slug, id);
        if (res.success) {
            toast.success("Student deleted");
            loadData();
        } else {
            toast.error(res.error || "Delete failed");
        }
    };

    if (!mounted || isPermsLoading) return null;

    const hasNextPage = paginationInfo?.page < paginationInfo?.totalPages;
    const hasPrevPage = paginationInfo?.page > 1;

    // Check module permission (using 'students.profiles' based on config structure)
    // If user has NO 'view' access, technically Sidebar handles it, but good to check here too.
    const canCreate = can('students.profiles', 'create');
    const canEdit = can('students.profiles', 'edit');
    const canDelete = can('students.profiles', 'delete');

    return (
        <div className="flex flex-col gap-6 pb-20 min-w-0">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Students
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage your student profiles and enrollment status.
                    </p>
                </div>
                <div className="flex gap-3">
                    <StandardActionButton
                        asChild
                        variant="outline"
                        icon={ArrowUpDown}
                        label="Promote"
                    >
                        <Link href={`/s/${slug}/students/promote`} />
                    </StandardActionButton>
                    <StandardActionButton
                        variant="primary"
                        icon={Plus}
                        label="Add Student"
                        onClick={() => router.push(`/s/${slug}/students/new`)}
                        permission={{ module: 'students.profiles', action: 'create' }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => { setActiveTab("active"); setPage(1); setStatusFilter("all"); }}
                        className={cn(
                            "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                            activeTab === "active"
                                ? "border-brand text-brand"
                                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
                        )}
                    >
                        Active Students
                    </button>
                    <button
                        onClick={() => { setActiveTab("alumni"); setPage(1); setStatusFilter("all"); }}
                        className={cn(
                            "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                            activeTab === "alumni"
                                ? "border-brand text-brand"
                                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
                        )}
                    >
                        Alumni
                    </button>
                </nav>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <SearchInput
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setPage(1);
                        }}
                        placeholder={activeTab === "alumni" ? "Search alumni..." : "Search students..."}
                        className="w-full"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {activeTab === "active" && (
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-zinc-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                            >
                                <option value="all">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="ABSENT">Absent</option>
                            </select>
                        </div>
                    )}

                    <select
                        value={classFilter}
                        onChange={(e) => {
                            setClassFilter(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Classes</option>
                        {classrooms.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        value={genderFilter}
                        onChange={(e) => {
                            setGenderFilter(e.target.value);
                            setPage(1);
                        }}
                        title="Filter by Gender"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Genders</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>

                    <div className="relative">
                        <button
                            onClick={() => setShowColumnToggle(!showColumnToggle)}
                            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                            title="Customize Columns"
                        >
                            <Settings2 className="h-4 w-4" />
                            Columns
                        </button>

                        {showColumnToggle && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowColumnToggle(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl z-20 dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="mb-2 px-2 py-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                                        Visible Columns
                                    </div>
                                    <div className="space-y-1">
                                        {columns.map(col => (
                                            <button
                                                key={col.id}
                                                onClick={() => toggleColumn(col.id)}
                                                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                            >
                                                <span className={visibleColumns[col.id] ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-400"}>
                                                    {col.label}
                                                </span>
                                                {visibleColumns[col.id] && <Check className="h-4 w-4 text-brand" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-brand" />
                            <p className="text-sm text-zinc-500 animate-pulse font-medium">Loading students...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                                        {visibleColumns.admissionNumber && (
                                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('admissionNumber')}>
                                                <div className="flex items-center gap-1">Adm No <SortIcon field="admissionNumber" /></div>
                                            </th>
                                        )}
                                        {visibleColumns.name && (
                                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('name')}>
                                                <div className="flex items-center gap-1">Student Name <SortIcon field="name" /></div>
                                            </th>
                                        )}
                                        {visibleColumns.class && (
                                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('class')}>
                                                <div className="flex items-center gap-1">Class <SortIcon field="class" /></div>
                                            </th>
                                        )}
                                        {visibleColumns.gender && (
                                            <th className="px-6 py-4 font-medium">Gender</th>
                                        )}
                                        {visibleColumns.fatherContact && (
                                            <th className="px-6 py-4 font-medium">
                                                Father Contact
                                            </th>
                                        )}
                                        {visibleColumns.motherContact && (
                                            <th className="px-6 py-4 font-medium">
                                                Mother Contact
                                            </th>
                                        )}
                                        {visibleColumns.joiningDate && (
                                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('joiningDate')}>
                                                <div className="flex items-center gap-1">Joined <SortIcon field="joiningDate" /></div>
                                            </th>
                                        )}
                                        {visibleColumns.status && (
                                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('status')}>
                                                <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
                                            </th>
                                        )}
                                        <th className="px-6 py-4 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {students.length > 0 ? (
                                        students.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                            >
                                                {visibleColumns.admissionNumber && (
                                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                                        {student.admissionNumber || "-"}
                                                    </td>
                                                )}
                                                {visibleColumns.name && (
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <StudentAvatar
                                                                src={student.avatar}
                                                                name={student.name}
                                                            />
                                                            <div className="flex flex-col min-w-0">
                                                                <Link
                                                                    href={`/s/${slug}/students/${student.id}`}
                                                                    className="font-medium text-zinc-900 transition-colors dark:text-zinc-50 hover:text-brand truncate max-w-[150px]"
                                                                    title={student.name}
                                                                >
                                                                    {cleanName(student.name)}
                                                                </Link>
                                                                <span className="text-xs text-zinc-500">
                                                                    {student.id.slice(-6).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.class && (
                                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                                        {student.class}
                                                    </td>
                                                )}
                                                {visibleColumns.gender && (
                                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs whitespace-nowrap">
                                                        {student.gender}
                                                    </td>
                                                )}
                                                {visibleColumns.fatherContact && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {student.fatherPhone ? (
                                                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                                    F
                                                                </div>
                                                                <Phone className="h-3 w-3 text-zinc-400" />
                                                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{student.fatherPhone}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-zinc-400">-</span>
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.motherContact && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {student.motherPhone ? (
                                                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-50 text-[10px] font-bold text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                                                                    M
                                                                </div>
                                                                <Phone className="h-3 w-3 text-zinc-400" />
                                                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{student.motherPhone}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-zinc-400">-</span>
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.joiningDate && (
                                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs whitespace-nowrap">
                                                        {student.joiningDate ? format(new Date(student.joiningDate), 'MMM d, yyyy') : '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.status && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={cn(
                                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                                (student.status === "Active" || student.status === "ACTIVE")
                                                                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                                                    : (student.status === "Absent" || student.status === "ABSENT")
                                                                        ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400"
                                                            )}
                                                        >
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <StandardActionButton
                                                            asChild
                                                            variant="view"
                                                            icon={Edit3}
                                                            tooltip="View/Edit Profile"
                                                            permission={{ module: 'students.profiles', action: 'edit' }}
                                                        >
                                                            <Link href={`/s/${slug}/students/${student.id}`} />
                                                        </StandardActionButton>
                                                        <StandardActionButton
                                                            variant="delete"
                                                            icon={Trash2}
                                                            tooltip="Delete Student"
                                                            onClick={() => handleDelete(student.id)}
                                                            permission={{ module: 'students.profiles', action: 'delete' }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-12 text-center text-zinc-500">
                                                No students found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                            <div className="flex items-center justify-between text-sm text-zinc-500">
                                <span>
                                    Page <span className="font-bold text-zinc-900">{paginationInfo?.page || 1}</span> of <span className="font-medium">{paginationInfo?.totalPages || 1}</span> ({paginationInfo?.total || 0} students)
                                </span>
                                <div className="flex gap-2">
                                    <StandardActionButton
                                        variant="outline"
                                        label="Previous"
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={!hasPrevPage}
                                        className="h-9 px-3 text-xs"
                                    />
                                    <StandardActionButton
                                        variant="outline"
                                        label="Next"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={!hasNextPage}
                                        className="h-9 px-3 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
