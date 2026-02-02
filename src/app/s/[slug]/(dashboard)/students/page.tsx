"use client";

import { Plus, Search, MoreHorizontal, Filter, ArrowUpDown, Edit3, Trash2, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { SlideOver } from "@/components/ui/SlideOver";
import { AddStudentForm } from "@/components/dashboard/students/AddStudentForm";
import { getStudentsAction, deleteStudentAction, updateStudentAction } from "@/app/actions/student-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { Tenant } from "@/types/tenant";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useRolePermissions } from "@/hooks/useRolePermissions";

export default function StudentsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { can, isLoading: isPermsLoading } = useRolePermissions();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [classFilter, setClassFilter] = useState("all");

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
    }, [slug, page, searchTerm, statusFilter, classFilter, sortConfig]);

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

            const res = await getStudentsAction(slug, {
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
        if (!confirm("Are you sure you want to delete this student?")) return;
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
                {canCreate && (
                    <button
                        onClick={() => setIsAddStudentOpen(true)}
                        className="h-12 px-6 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Add Student
                    </button>
                )}
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
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        style={{ '--tw-ring-color': 'var(--brand-color)' } as any}
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
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
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
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Classes</option>
                        {classrooms.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {isLoading && students.length === 0 ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">Student Name <SortIcon field="name" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('class')}>
                                            <div className="flex items-center gap-1">Class <SortIcon field="class" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort('parent')}>
                                            <div className="flex items-center gap-1">Parent <SortIcon field="parent" /></div>
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
                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                    {student.parent}
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
                                                        {canEdit && (
                                                            <Link
                                                                href={`/s/${slug}/students/${student.id}`}
                                                                className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Link>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => handleDelete(student.id)}
                                                                className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 transition-all"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
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
                                    <button
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={!hasPrevPage}
                                        className="rounded-md border border-zinc-200 px-3 py-1 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:hover:bg-zinc-900"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={!hasNextPage}
                                        className="rounded-md border border-zinc-200 px-3 py-1 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:hover:bg-zinc-900"
                                    >
                                        Next
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
