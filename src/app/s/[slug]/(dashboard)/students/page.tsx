"use client";

import { Plus, Search, MoreHorizontal, Filter, ArrowUpDown, Edit3, Trash2, Loader2, ChevronUp, ChevronDown, Phone, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { SlideOver } from "@/components/ui/SlideOver";
import { AddStudentForm } from "@/components/dashboard/students/AddStudentForm";
import { SearchInput } from "@/components/ui/SearchInput";
import { getStudentsAction, deleteStudentAction, updateStudentAction } from "@/app/actions/student-actions";
import { searchStudentsElasticAction } from "@/app/actions/search-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { Tenant } from "@/types/tenant";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getCookie } from "@/lib/cookies";
import { useConfirm } from "@/contexts/ConfirmContext";
import { StandardActionButton } from "@/components/ui/StandardActionButton";

import { useRolePermissions } from "@/hooks/useRolePermissions";

export default function StudentsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { can, isLoading: isPermsLoading } = useRolePermissions();
    const { confirm: confirmDialog } = useConfirm();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [classFilter, setClassFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");

    // Sort Config
    const [sortConfig, setSortConfig] = useState<{ field: string, direction: "asc" | "desc" }>({
        field: "createdAt",
        direction: "desc"
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState<any>(null);

    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadClassrooms();
    }, [slug]);

    // Debounce load data
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(timer);
    }, [slug, page, searchTerm, statusFilter, classFilter, genderFilter, sortConfig]);

    const loadClassrooms = async () => {
        const res = await getClassroomsAction(slug);
        if (res?.success) {
            setClassrooms(res.data || []);
        }
    };

    const loadData = async () => {
        if (students.length === 0) setIsLoading(true); // Only show loader if empty or initial

        try {
            const filters: any = {};
            if (statusFilter !== "all") filters.status = statusFilter;
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
                    // Elastic search specific pagination/total handling if needed
                    // For now, we might receive total hits
                    setPaginationInfo({
                        page: 1,
                        limit: 50,
                        total: res.total,
                        totalPages: Math.ceil((res.total || 0) / 50)
                    });
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
                }
            }

            if (!res.success) {
                toast.error("Failed to load students");
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
        <div className="flex flex-col gap-6 pb-20">
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
                        onClick={() => setIsAddStudentOpen(true)}
                        permission={{ module: 'students.profiles', action: 'create' }}
                    />
                </div>
            </div>

            <SlideOver
                isOpen={isAddStudentOpen}
                onClose={() => {
                    setIsAddStudentOpen(false);
                    loadData();
                }}
                title="Add New Student"
                description="Create a new student profile and assign them to a class."
            >
                <AddStudentForm
                    onCancel={() => {
                        setIsAddStudentOpen(false);
                        loadData();
                    }}
                    slug={slug}
                />
            </SlideOver>

            {/* Filters & Actions */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <SearchInput
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setPage(1);
                        }}
                        placeholder="Search students (Elasticsearch)..."
                        className="w-full"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
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
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Genders</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {isLoading && students.length === 0 ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('admissionNumber')}>
                                            <div className="flex items-center gap-1">Adm No <SortIcon field="admissionNumber" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">Student Name <SortIcon field="name" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('class')}>
                                            <div className="flex items-center gap-1">Class <SortIcon field="class" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            Gender
                                        </th>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('parent')}>
                                            <div className="flex items-center gap-1">Parent Contact <SortIcon field="parent" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('joiningDate')}>
                                            <div className="flex items-center gap-1">Joined <SortIcon field="joiningDate" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('status')}>
                                            <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
                                        </th>
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
                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                    {student.admissionNumber || "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={student.avatar}
                                                            alt={student.name}
                                                            className="h-9 w-9 rounded-full bg-zinc-100 object-cover dark:bg-zinc-800"
                                                        />
                                                        <div className="flex flex-col">
                                                            <Link
                                                                href={`/s/${slug}/students/${student.id}`}
                                                                className="font-medium text-zinc-900 transition-colors dark:text-zinc-50"
                                                                style={{ '--hover-color': 'var(--brand-color)' } as any}
                                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-color)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.color = ''}
                                                            >
                                                                {student.name}
                                                            </Link>
                                                            <span className="text-xs text-zinc-500">
                                                                {student.id.slice(-6).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                    {student.class}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs">
                                                    {student.gender}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{student.parent}</span>
                                                        {student.parentMobile && (
                                                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                                <Phone className="h-3 w-3" />
                                                                {student.parentMobile}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs">
                                                    {student.joiningDate ? format(new Date(student.joiningDate), 'MMM d, yyyy') : '-'}
                                                </td>
                                                <td className="px-6 py-4">
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
                                            <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
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
