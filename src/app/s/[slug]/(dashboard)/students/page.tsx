"use client";

import { Plus, Filter, ArrowUpDown, Edit3, Trash2, Loader2, ChevronUp, ChevronDown, Phone, Settings2, Check, User as UserIcon, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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

    // Progressive loading state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const isLoadingMoreRef = useRef(false);
    const hasMoreRef = useRef(true);

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

    const [columns, setColumns] = useState([
        { id: 'admissionNumber', label: 'Adm No' },
        { id: 'name', label: 'Student Name' },
        { id: 'class', label: 'Class' },
        { id: 'gender', label: 'Gender' },
        { id: 'fatherContact', label: 'Father Contact' },
        { id: 'motherContact', label: 'Mother Contact' },
        { id: 'joiningDate', label: 'Joined' },
        { id: 'status', label: 'Status' },
    ]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newColumns = Array.from(columns);
        const [reorderedItem] = newColumns.splice(result.source.index, 1);
        newColumns.splice(result.destination.index, 0, reorderedItem);
        setColumns(newColumns);
    };

    useEffect(() => {
        setMounted(true);
        loadClassrooms();
    }, [slug]);

    // Reset list when filters/search/tab change — do a fresh page-1 load
    useEffect(() => {
        setPage(1);
        setStudents([]);
        setHasMore(true);
        hasMoreRef.current = true;
    }, [slug, statusFilter, classFilter, genderFilter, sortConfig, activeTab, searchTerm]);

    // Trigger load whenever page changes
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled) return;
            // Skip 1-char search mid-type
            if (searchTerm && searchTerm.length === 1) return;
            await loadData(page, cancelled);
        };

        if (searchTerm && searchTerm.length >= 2) {
            setIsLoading(page === 1);
            if (page === 1) setIsLoadingMore(false);
            const timer = setTimeout(() => { if (!cancelled) run(); }, 400);
            return () => { cancelled = true; clearTimeout(timer); };
        } else {
            if (page === 1) setIsLoading(true);
            run();
            return () => { cancelled = true; };
        }
    }, [page, slug, statusFilter, classFilter, genderFilter, sortConfig, activeTab, searchTerm]);

    // Intersection Observer — triggers loading next page when sentinel is visible
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMoreRef.current && hasMoreRef.current) {
                    setPage(prev => prev + 1);
                }
            },
            { rootMargin: "200px" }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [mounted]);

    const loadClassrooms = async () => {
        const res = await getClassroomsAction(slug);
        if (res?.success) {
            setClassrooms(res.data || []);
        }
    };

    const loadData = async (currentPage: number, cancelled?: boolean) => {
        if (currentPage > 1) {
            isLoadingMoreRef.current = true;
            setIsLoadingMore(true);
        }
        try {
            const filters: any = {};

            if (activeTab === "alumni") {
                filters.status = "ALUMNI";
            } else {
                if (statusFilter !== "all") {
                    filters.status = statusFilter;
                } else {
                    filters.excludeStatus = "ALUMNI";
                }
            }

            if (classFilter !== "all") filters.classroomId = classFilter;
            if (genderFilter !== "all") filters.gender = genderFilter;

            const academicYearId = getCookie(`academic_year_${slug}`);
            if (academicYearId) filters.academicYearId = academicYearId;

            const res = await getStudentsAction(slug, {
                page: currentPage,
                limit: 30,
                search: searchTerm,
                filters,
                sort: sortConfig
            });

            if (cancelled) return;

            if (res.success) {
                const newStudents = res.students || [];
                setStudents(prev => currentPage === 1 ? newStudents : [...prev, ...newStudents]);
                const pagination = res.pagination;
                const moreAvailable = pagination?.page < pagination?.totalPages;
                setHasMore(moreAvailable);
                hasMoreRef.current = moreAvailable;
            } else {
                toast.error(res.error || "Failed to load students");
            }
        } catch (error) {
            console.error("Critical Load Error", error);
            toast.error("Failed to load data");
        } finally {
            if (!cancelled) {
                setIsLoading(false);
                setIsLoadingMore(false);
                isLoadingMoreRef.current = false;
            }
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

    // Check module permission
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
                                title="Filter by Status"
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
                        title="Filter by Class"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Classes</option>
                        {classrooms.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
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
                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="columns" direction="vertical">
                                            {(provided) => (
                                                <div
                                                    className="space-y-1"
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                >
                                                    {columns.map((col, index) => (
                                                        <Draggable key={col.id} draggableId={col.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={cn(
                                                                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800",
                                                                        snapshot.isDragging && "bg-zinc-50 dark:bg-zinc-800 shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700 z-50"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            {...provided.dragHandleProps}
                                                                            className="cursor-grab hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 -ml-1 flex-shrink-0"
                                                                        >
                                                                            <GripVertical className="h-4 w-4" />
                                                                        </div>
                                                                        <button
                                                                            className="flex-1 text-left"
                                                                            onClick={() => toggleColumn(col.id)}
                                                                        >
                                                                            <span className={visibleColumns[col.id] ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-400"}>
                                                                                {col.label}
                                                                            </span>
                                                                        </button>
                                                                    </div>

                                                                    <button onClick={() => toggleColumn(col.id)} className="flex-shrink-0 ml-2">
                                                                        {visibleColumns[col.id] && <Check className="h-4 w-4 text-brand" />}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
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
                                        <th className="px-6 py-4 text-left font-medium sticky left-0 bg-zinc-50 dark:bg-zinc-800/50 shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 before:content-[''] before:absolute before:inset-0 before:border-r before:border-zinc-200 dark:before:border-zinc-800">Action</th>
                                        {columns.map(col => {
                                            if (!visibleColumns[col.id]) return null;

                                            if (col.id === 'admissionNumber') return (
                                                <th key={col.id} className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('admissionNumber')}>
                                                    <div className="flex items-center gap-1">Adm No <SortIcon field="admissionNumber" /></div>
                                                </th>
                                            );
                                            if (col.id === 'name') return (
                                                <th key={col.id} className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('name')}>
                                                    <div className="flex items-center gap-1">Student Name <SortIcon field="name" /></div>
                                                </th>
                                            );
                                            if (col.id === 'class') return (
                                                <th key={col.id} className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('class')}>
                                                    <div className="flex items-center gap-1">Class <SortIcon field="class" /></div>
                                                </th>
                                            );
                                            if (col.id === 'gender') return (
                                                <th key={col.id} className="px-6 py-4 font-medium">Gender</th>
                                            );
                                            if (col.id === 'fatherContact') return (
                                                <th key={col.id} className="px-6 py-4 font-medium">Father Contact</th>
                                            );
                                            if (col.id === 'motherContact') return (
                                                <th key={col.id} className="px-6 py-4 font-medium">Mother Contact</th>
                                            );
                                            if (col.id === 'joiningDate') return (
                                                <th key={col.id} className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('joiningDate')}>
                                                    <div className="flex items-center gap-1">Joined <SortIcon field="joiningDate" /></div>
                                                </th>
                                            );
                                            if (col.id === 'status') return (
                                                <th key={col.id} className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleSort('status')}>
                                                    <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
                                                </th>
                                            );
                                            return null;
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {students.length > 0 ? (
                                        students.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                            >
                                                <td className="px-6 py-4 text-left sticky left-0 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50 transition-colors shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 before:content-[''] before:absolute before:inset-0 before:border-r before:border-zinc-200 dark:before:border-zinc-800">
                                                    <div className="flex items-center justify-start gap-2 relative z-20">
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
                                                {columns.map(col => {
                                                    if (!visibleColumns[col.id]) return null;

                                                    if (col.id === 'admissionNumber') return (
                                                        <td key={col.id} className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                                            {student.admissionNumber || "-"}
                                                        </td>
                                                    );
                                                    if (col.id === 'name') return (
                                                        <td key={col.id} className="px-6 py-4">
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
                                                    );
                                                    if (col.id === 'class') return (
                                                        <td key={col.id} className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                                            {student.class}
                                                        </td>
                                                    );
                                                    if (col.id === 'gender') return (
                                                        <td key={col.id} className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs whitespace-nowrap">
                                                            {student.gender}
                                                        </td>
                                                    );
                                                    if (col.id === 'fatherContact') return (
                                                        <td key={col.id} className="px-6 py-4 whitespace-nowrap">
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
                                                    );
                                                    if (col.id === 'motherContact') return (
                                                        <td key={col.id} className="px-6 py-4 whitespace-nowrap">
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
                                                    );
                                                    if (col.id === 'joiningDate') return (
                                                        <td key={col.id} className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs whitespace-nowrap">
                                                            {student.joiningDate ? format(new Date(student.joiningDate), 'MMM d, yyyy') : '-'}
                                                        </td>
                                                    );
                                                    if (col.id === 'status') return (
                                                        <td key={col.id} className="px-6 py-4 whitespace-nowrap">
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
                                                    );

                                                    return null;
                                                })}
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
                        {/* Progressive load sentinel + status */}
                        <div className="border-t border-zinc-200 dark:border-zinc-800">
                            {isLoadingMore && (
                                <div className="flex items-center justify-center gap-2 py-4 text-sm text-zinc-400">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Loading more students...</span>
                                </div>
                            )}
                            {!hasMore && students.length > 0 && !isLoadingMore && (
                                <p className="py-4 text-center text-xs text-zinc-400">
                                    All {students.length} students loaded
                                </p>
                            )}
                            {/* Invisible sentinel — IntersectionObserver watches this */}
                            <div ref={sentinelRef} className="h-1" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
