"use client";

import { Plus, Search, MoreHorizontal, Filter, User as UserIcon, Edit2, Trash2, ArrowUpDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getStaffAction, deleteStaffAction, updateStaffBasicInfoAction } from "@/app/actions/staff-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { toast } from "sonner";

export default function StaffPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

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

    useEffect(() => {
        loadData();
        loadMasterData();
    }, [slug]);

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
        const res = await getStaffAction(slug);
        if (res.success) {
            setStaff(res.data || []);
        } else {
            toast.error("Failed to load staff");
        }
        setIsLoading(false);
    }

    const filteredAndSortedStaff = useMemo(() => {
        let result = staff.filter((person) => {
            const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
            const searchMatch = fullName.includes(searchTerm.toLowerCase()) ||
                (person.designation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (person.email || "").toLowerCase().includes(searchTerm.toLowerCase());

            const roleMatch = roleFilter === "all" || person.designation === roleFilter;
            const deptMatch = deptFilter === "all" || person.department === deptFilter;
            const empTypeMatch = empTypeFilter === "all" || person.employmentType === empTypeFilter;
            const statusMatch = statusFilter === "all" || person.status === statusFilter;

            return searchMatch && roleMatch && deptMatch && empTypeMatch && statusMatch;
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
    }, [staff, searchTerm, roleFilter, deptFilter, statusFilter, sortBy, sortOrder]);

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
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            const res = await deleteStaffAction(slug, id);
            if (res.success) {
                toast.success("Staff member deleted successfully");
                loadData();
            } else {
                toast.error(res.error || "Failed to delete staff member");
            }
        }
    }

    return (
        <div className="flex flex-col gap-6 p-8">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Staff Management
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        View and manage your teaching and administrative team.
                    </p>
                </div>
                <Link
                    href={`/s/${slug}/staff/add`}
                    className="h-12 px-6 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Add Staff Member
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name, role or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        style={{ '--tw-ring-color': 'var(--brand-color)' } as any}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        style={{ '--tw-ring-color': 'var(--brand-color)' } as any}
                    >
                        <option value="all">All Designations</option>
                        {designations.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>

                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>

                    <select
                        value={empTypeFilter}
                        onChange={(e) => setEmpTypeFilter(e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        <option value="all">All Emp. Types</option>
                        {employmentTypes.map(d => (
                            <option key={d.id} value={d.code}>{d.name}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
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
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="role">Sort by Role</option>
                            <option value="dept">Sort by Dept</option>
                            <option value="status">Sort by Status</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="p-2 text-zinc-500 hover:text-blue-600 transition-colors"
                        >
                            {sortOrder === "asc" ? "↑" : "↓"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Staff Table */}
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Phone Number</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Designation</th>
                            <th className="px-6 py-4 font-medium">Department</th>
                            <th className="px-6 py-4 font-medium">Emp. Type</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                                            <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-zinc-100 dark:bg-zinc-800" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800" /></td>
                                    <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800" /></td>
                                    <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-16 rounded bg-zinc-100 dark:bg-zinc-800" /></td>
                                </tr>
                            ))
                        ) : filteredAndSortedStaff.map((person) => (
                            <tr key={person.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-white dark:bg-zinc-800 dark:ring-zinc-900 shrink-0">
                                            {person.avatar ? (
                                                <img src={person.avatar} alt={person.firstName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                                    <UserIcon className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                            {person.firstName} {person.lastName}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap font-medium">
                                    {person.mobile || "N/A"}
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                    {person.email || "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap" style={{ backgroundColor: 'rgba(var(--brand-color-rgb, 37, 99, 235), 0.1)', color: 'var(--brand-color)', borderColor: 'rgba(var(--brand-color-rgb, 37, 99, 235), 0.2)' } as any}>
                                        {person.designation || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                        {person.department || "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-blue-400/10 dark:text-purple-400 dark:ring-purple-400/20 whitespace-nowrap">
                                        {person.employmentType ? person.employmentType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()) : "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border whitespace-nowrap uppercase tracking-wider",
                                        person.status === "ACTIVE"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                            : person.status === "INACTIVE"
                                                ? "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50"
                                    )}>
                                        {person.status || "UNKNOWN"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/s/${slug}/staff/${person.id}/edit`}
                                            className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                                            title="Edit Staff"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(person.id, `${person.firstName} ${person.lastName}`)}
                                            className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 transition-all"
                                            title="Delete Staff"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!isLoading && filteredAndSortedStaff.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-zinc-400 font-medium">No staff members found matching your criteria.</p>
                </div>
            )}
        </div>
    );
}
