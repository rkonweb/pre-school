"use client";

import { Plus, Filter, ArrowUpDown, Edit3, Trash2, Loader2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Phone, Settings2, Check, User as UserIcon, GripVertical, Users, UserCheck, UserMinus, BookOpen } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/SearchInput";
import { getStudentsAction, deleteStudentAction, getStudentOverviewAction } from "@/app/actions/student-actions";
import { searchStudentsElasticAction } from "@/app/actions/search-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getCookie } from "@/lib/cookies";
import { useConfirm } from "@/contexts/ConfirmContext";
import { ErpTabs, SectionHeader, tableStyles, SortIcon, RowActions, StatusChip, Btn } from "@/components/ui/erp-ui";
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

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(30);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isPaginating, setIsPaginating] = useState(false);

    const [students, setStudents] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [overview, setOverview] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [showColumnToggle, setShowColumnToggle] = useState(false);

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        admissionNumber: true,
        name: true,
        class: true,
        gender: true,
        fatherPhone: true,
        motherPhone: true,
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
        { id: 'fatherPhone', label: 'Father Contact' },
        { id: 'motherPhone', label: 'Mother Contact' },
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
        loadOverview();
    }, [slug]);

    // Reset list when filters/search/tab change — do a fresh page-1 load
    useEffect(() => {
        setPage(1);
        setStudents([]);
        setTotalPages(1);
    }, [slug, statusFilter, classFilter, genderFilter, sortConfig, activeTab, searchTerm, pageSize]);

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
            if (page > 1) setIsPaginating(true);
            const timer = setTimeout(() => { if (!cancelled) run(); }, 400);
            return () => { cancelled = true; clearTimeout(timer); };
        } else {
            if (page === 1) setIsLoading(true);
            run();
            return () => { cancelled = true; };
        }
    }, [page, slug, statusFilter, classFilter, genderFilter, sortConfig, activeTab, searchTerm, pageSize]);



    const loadClassrooms = async () => {
        const res = await getClassroomsAction(slug);
        if (res?.success) {
            setClassrooms(res.data || []);
        }
    };

    const loadOverview = async () => {
        const res = await getStudentOverviewAction(slug);
        if (res?.success) {
            setOverview(res.data);
        }
    };

    const loadData = async (currentPage: number, cancelled?: boolean) => {
        if (currentPage > 1) {
            setIsPaginating(true);
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
                limit: pageSize,
                search: searchTerm,
                filters,
                sort: sortConfig
            });

            if (cancelled) return;

            if (res.success) {
                const newStudents = res.students || [];
                setStudents(newStudents);
                const pagination = res.pagination;
                setTotalPages(pagination?.totalPages || 1);
                setTotalItems(pagination?.total || 0);
            } else {
                toast.error(res.error || "Failed to load students");
            }
        } catch (error) {
            console.error("Critical Load Error", error);
            toast.error("Failed to load data");
        } finally {
            if (!cancelled) {
                setIsLoading(false);
                setIsPaginating(false);
            }
        }
    };

    const handleSort = (field: string) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
        }));
    };

    const renderSortIcon = (field: string) => {
        return <SortIcon col={field} sortCol={sortConfig.field} sortDir={sortConfig.direction} />;
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
            loadData(1);
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
            <SectionHeader
                title="Students Directory"
                subtitle="Manage your student profiles and enrollment status."
                icon={UserIcon}
                action={
                    <div className="flex gap-3">
                        <Btn
                            variant="secondary"
                            icon={ArrowUpDown}
                            onClick={() => router.push(`/s/${slug}/students/promote`)}
                        >
                            Promote
                        </Btn>
                        {canCreate && (
                            <Btn
                                variant="primary"
                                icon={Plus}
                                onClick={() => router.push(`/s/${slug}/students/new`)}
                            >
                                Add Student
                            </Btn>
                        )}
                    </div>
                }
            />

            {/* Overview Cards */}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Students</p>
                            <h3 className="text-2xl font-bold text-gray-900">{overview.totalStudents}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Active Students</p>
                            <h3 className="text-2xl font-bold text-gray-900">{overview.activeStudents}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                            <UserMinus size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Inactive Students</p>
                            <h3 className="text-2xl font-bold text-gray-900">{overview.inactiveStudents}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Total Classes</p>
                            <h3 className="text-2xl font-bold text-gray-900">{overview.totalClasses}</h3>
                        </div>
                    </div>
                </div>
            )}

            <ErpTabs
                tabs={[
                    { label: "Active Students" },
                    { label: "Alumni" }
                ]}
                active={activeTab === "active" ? 0 : 1}
                onChange={(i) => {
                    setActiveTab(i === 0 ? "active" : "alumni");
                    setPage(1);
                    setStatusFilter("all");
                }}
            />

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[220px]">
                    <SearchInput
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setPage(1);
                        }}
                        placeholder={activeTab === "alumni" ? "Search alumni..." : "Search students..."}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    {activeTab === "active" && (
                        <div className="flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                title="Filter by Status"
                                className="rounded-[10px] border-[1.5px] border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-gray-700 outline-none cursor-pointer"
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
                        onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                        title="Filter by Class"
                        className="rounded-[10px] border-[1.5px] border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-gray-700 outline-none cursor-pointer"
                    >
                        <option value="all">All Classes</option>
                        {classrooms.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select
                        value={genderFilter}
                        onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
                        title="Filter by Gender"
                        className="rounded-[10px] border-[1.5px] border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-gray-700 outline-none cursor-pointer"
                    >
                        <option value="all">All Genders</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnToggle(!showColumnToggle)}
                            title="Customize Columns"
                            className="flex items-center gap-[7px] rounded-[10px] border-[1.5px] border-gray-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-gray-700 cursor-pointer"
                        >
                            <Settings2 className="w-3.5 h-3.5" />
                            Columns
                        </button>
                        {showColumnToggle && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowColumnToggle(false)} />
                                <div className="absolute right-0 mt-2 w-[200px] rounded-[14px] border-[1.5px] border-gray-200 bg-white p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-20">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-2 border-b border-gray-100 mb-1.5">Visible Columns</div>
                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="columns" direction="vertical">
                                            {(provided) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-0.5">
                                                    {columns.map((col, index) => (
                                                        <Draggable key={col.id} draggableId={col.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={cn("flex items-center justify-between rounded-lg px-2 py-1.5", snapshot.isDragging ? "bg-brand/10 shadow-[0_4px_16px_rgba(0,0,0,0.1)]" : "bg-transparent shadow-none")}
                                                                    style={snapshot.isDragging ? { backgroundColor: 'rgba(var(--brand-color-rgb, 245, 158, 11), 0.1)', ...provided.draggableProps.style } : { ...provided.draggableProps.style }}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 flex">
                                                                            <GripVertical className="w-3.5 h-3.5" />
                                                                        </div>
                                                                        <button className={cn("bg-none border-none cursor-pointer text-[13px] text-left", visibleColumns[col.id] ? "font-bold text-indigo-950" : "font-medium text-gray-400")} onClick={() => toggleColumn(col.id)}>{col.label}</button>
                                                                    </div>
                                                                    <button onClick={() => toggleColumn(col.id)} className="bg-none border-none cursor-pointer">
                                                                        {visibleColumns[col.id] && <Check className="w-3.5 h-3.5 text-brand" style={{ color: 'var(--brand-color)' }} />}
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

            <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={tableStyles.container}>
                {isLoading ? (
                    <div className="flex h-[240px] flex-col items-center justify-center gap-3">
                        <div className="w-9 h-9 rounded-full border-[3px] border-gray-100 border-t-brand animate-spin" style={{ borderTopColor: 'var(--brand-color)' }} />
                        <p className="text-[13px] font-semibold text-gray-500">Loading students...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full border-collapse">
                                <thead style={tableStyles.thead}>
                                    <tr>
                                        <th className="px-6 py-4 border-b border-white/10 text-left text-[11px] font-bold tracking-wider uppercase sticky left-0 z-20 bg-[var(--brand-color)] text-[var(--secondary-color)] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-white/10">Action</th>
                                        {columns.map(col => {
                                            if (!visibleColumns[col.id]) return null;

                                            return (
                                                <th key={col.id} className="px-6 py-4 border-b border-white/10 text-left text-[11px] font-bold tracking-wider uppercase text-[var(--secondary-color)]" onClick={() => handleSort(col.id)}>
                                                    <div className="flex items-center gap-1 cursor-pointer select-none">{col.label} {renderSortIcon(col.id)}</div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length > 0 ? (
                                        students.map((student, i) => (
                                            <tr
                                                key={student.id}
                                                className={cn("transition-all hover:translate-x-[3px]", i % 2 === 0 ? "bg-white" : "bg-gray-50")}
                                                style={{ ['--hover-bg' as any]: 'rgba(var(--brand-color-rgb, 245, 158, 11), 0.05)' }}
                                            >
                                                <td className="px-6 py-4 border-b border-gray-100 bg-inherit text-left align-middle sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-100">
                                                    <div className="flex items-center gap-2 relative z-20">
                                                        <RowActions
                                                            onEdit={canEdit ? () => router.push(`/s/${slug}/students/${student.id}`) : undefined}
                                                            onDelete={canDelete ? () => handleDelete(student.id) : undefined}
                                                        />
                                                    </div>
                                                </td>
                                                {columns.map(col => {
                                                    if (!visibleColumns[col.id]) return null;

                                                    if (col.id === 'admissionNumber') return (
                                                        <td key={col.id} className="px-6 py-4 border-b border-gray-100 bg-transparent text-left align-middle text-[13px] text-gray-700 font-medium whitespace-nowrap">
                                                            {student.admissionNumber || "-"}
                                                        </td>
                                                    );
                                                    if (col.id === 'name') return (
                                                        <td key={col.id} className="px-6 py-4 border-b border-gray-100 bg-transparent text-left align-middle">
                                                            <div className="flex items-center gap-2.5">
                                                                <StudentAvatar src={student.avatar} name={student.name} />
                                                                <div className="flex flex-col min-w-0">
                                                                    <Link
                                                                        href={`/s/${slug}/students/${student.id}`}
                                                                        className="font-bold text-gray-800 no-underline overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] hover:text-brand"
                                                                        style={{ ['--hover-color' as any]: 'var(--brand-color)' }}
                                                                        title={student.name}
                                                                    >
                                                                        {cleanName(student.name)}
                                                                    </Link>
                                                                    <span className="text-[11px] text-gray-500 font-semibold tracking-wide">
                                                                        {student.id.slice(-6).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    );
                                                    if (col.id === 'class') return (
                                                        <td key={col.id} className="px-6 py-4 border-b border-gray-100 bg-transparent text-left align-middle">
                                                            <span className="font-semibold text-gray-700">{student.class}</span>
                                                        </td>
                                                    );
                                                    if (col.id === 'gender') return (
                                                        <td key={col.id} className="px-6 py-4 border-b border-gray-100 bg-transparent text-left align-middle">
                                                            <span className="text-[11px] font-bold tracking-wide uppercase text-gray-500">{student.gender}</span>
                                                        </td>
                                                    );
                                                    if (col.id === 'fatherPhone') return (
                                                        <td key={col.id} className="px-6 py-4 border-b border-gray-100 bg-transparent text-left align-middle whitespace-nowrap">
                                                            {student.fatherPhone ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-[26px] h-[26px] rounded-full bg-blue-100 flex items-center justify-center text-[10.5px] font-extrabold text-blue-700">F</div>
                                                                    <span className="text-[13px] font-semibold text-gray-700">{student.fatherPhone}</span>
                                                                </div>
                                                            ) : <span className="text-gray-400">-</span>}
                                                        </td>
                                                    );
                                                    if (col.id === 'motherPhone') return (
                                                        <td key={col.id} className="px-6 py-4 border-b border-gray-100 bg-transparent text-left align-middle whitespace-nowrap">
                                                            {student.motherPhone ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-[26px] h-[26px] rounded-full bg-pink-100 flex items-center justify-center text-[10.5px] font-extrabold text-pink-700">M</div>
                                                                    <span className="text-[13px] font-semibold text-gray-700">{student.motherPhone}</span>
                                                                </div>
                                                            ) : <span className="text-gray-400">-</span>}
                                                        </td>
                                                    );
                                                    if (col.id === 'joiningDate') return (
                                                        <td key={col.id} className="px-6 py-4 border-b border-gray-100 bg-transparent text-left align-middle whitespace-nowrap">
                                                            <span className="text-[13px] font-semibold text-gray-600">{student.joiningDate ? format(new Date(student.joiningDate), 'MMM d, yyyy') : '-'}</span>
                                                        </td>
                                                    );
                                                    if (col.id === 'status') return (
                                                        <td key={col.id} className="px-6 py-4 border-b border-gray-100 bg-transparent text-left align-middle whitespace-nowrap">
                                                            <StatusChip label={student.status} />
                                                        </td>
                                                    );

                                                    return null;
                                                })}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="py-10 px-6 text-center text-gray-500 text-[13px] font-medium">
                                                No students found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4 gap-4">
                            <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-gray-500">
                                <span className="whitespace-nowrap">
                                    Total: <strong className="text-gray-900">{totalItems}</strong> students
                                </span>
                                <div className="h-4 w-px bg-gray-300 hidden sm:block" />
                                <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap">Rows per page:</span>
                                    <select
                                        title="Rows per page"
                                        value={pageSize}
                                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                                        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 outline-none cursor-pointer hover:border-brand"
                                        disabled={isPaginating || isLoading}
                                        style={{ '--tw-border-opacity': 1, 'borderColor': 'var(--brand-color, #e5e7eb)' } as any}
                                    >
                                        <option value={10}>10</option>
                                        <option value={30}>30</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="text-[13px] font-semibold text-gray-500 hidden sm:block">
                                    Page {page} of {totalPages || 1}
                                    {isPaginating && <span className="ml-2 text-brand">Loading...</span>}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
                                        onClick={() => setPage(1)}
                                        disabled={page === 1 || isPaginating}
                                        title="First Page"
                                    >
                                        <ChevronsLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1 || isPaginating}
                                        title="Previous Page"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages || isPaginating}
                                        title="Next Page"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
                                        onClick={() => setPage(totalPages)}
                                        disabled={page >= totalPages || isPaginating}
                                        title="Last Page"
                                    >
                                        <ChevronsRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
