"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Users,
    Plus,
    Search,
    BookOpen,
    Edit3,
    Trash2,
    User,
    School,
    Calendar,
    MapPin,
    LayoutGrid,
    MoreHorizontal
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getClassroomsAction, deleteClassroomAction } from "@/app/actions/classroom-actions";
import { useConfirm } from "@/contexts/ConfirmContext";
import { DashboardLoader } from "@/components/ui/DashboardLoader";

export default function ClassesPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { confirm: confirmDialog } = useConfirm();

    const [isLoading, setIsLoading] = useState(true);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData(showLoading = true) {
        if (showLoading) setIsLoading(true);
        try {
            const classesRes = await getClassroomsAction(slug);

            if (classesRes.success) {
                setClassrooms(classesRes.data || []);
            } else {
                toast.error("Failed to load classes");
            }

        } catch (error) {
            toast.error("Failed to load data");
            console.error(error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }

    const filteredClasses = (classrooms || []).filter(c =>
        (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.teacher?.firstName || "").toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Class",
            message: "Are you sure you want to delete this class? This cannot be undone.",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            const res = await deleteClassroomAction(slug, id);
            if (res.success) {
                toast.success("Class deleted");
                loadData(false);
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900">Classes & Sections</h2>
                    <p className="text-sm font-medium text-zinc-500 mt-1">
                        Manage academic hierarchy, class teachers, and time tables.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => router.push(`/s/${slug}/academics/classes/create`)}
                        className="h-12 px-6 bg-brand text-[var(--secondary-color)] hover:brightness-110 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        New Class
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-12 px-4 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all"
                                title="More options"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                            <DropdownMenuItem onClick={() => router.push(`/s/${slug}/staff`)} className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Manage Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/s/${slug}/academics/timetable`)} className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Timetables
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <School className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-zinc-900">{classrooms.length}</p>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Classes</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-zinc-900">{classrooms.reduce((acc, c) => acc + (c._count?.students || 0), 0)}</p>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Students</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-zinc-900">{classrooms.filter(c => c.teacherId).length}</p>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Teachers Assigned</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <LayoutGrid className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-zinc-900">{classrooms.reduce((acc, c) => acc + (c.capacity || 0), 0)}</p>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Capacity</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search classes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-14 pl-12 pr-6 bg-white rounded-2xl border-2 border-zinc-100 text-sm font-bold outline-none focus:border-zinc-900 transition-all"
                />
            </div>

            {/* Table View */}
            <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-black text-zinc-400">Class Name</th>
                                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-black text-zinc-400">Class Teacher</th>
                                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-black text-zinc-400">Details</th>
                                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-black text-zinc-400">Stats</th>
                                <th className="text-right py-4 px-6 text-[10px] uppercase tracking-widest font-black text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-0">
                                        <DashboardLoader message="Loading academic classes..." />
                                    </td>
                                </tr>
                            ) : filteredClasses.length > 0 ? (
                                filteredClasses.map((item) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-zinc-900">{item.name}</div>
                                            {item.roomNumber && <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> Room {item.roomNumber}</div>}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
                                                    {item.teacher?.avatar ? (
                                                        <img src={item.teacher.avatar} className="h-full w-full object-cover" alt="Teacher" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-zinc-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-zinc-900">
                                                        {item.teacher?.firstName ? `${item.teacher.firstName} ${item.teacher.lastName}` : "Not Assigned"}
                                                    </div>
                                                    <div className="text-[10px] font-medium text-zinc-500">
                                                        {item.teacher?.email || "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold text-zinc-500 flex items-center gap-2">
                                                    <BookOpen className="h-3 w-3" />
                                                    {item.timetable ? "Timetable Set" : "No Timetable"}
                                                </div>
                                                <div className="text-[10px] font-bold text-zinc-500 flex items-center gap-2">
                                                    <LayoutGrid className="h-3 w-3" />
                                                    Capacity: {item.capacity || "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-zinc-400" />
                                                <span className="text-sm font-bold text-zinc-700">{item._count?.students || 0}</span>
                                                {item.capacity && (
                                                    <span className="text-[10px] text-zinc-400 font-medium">/ {item.capacity}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/s/${slug}/academics/timetable`)}
                                                    className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-purple-600 hover:border-purple-200 transition-all"
                                                    title="Manage Timetable"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/s/${slug}/academics/classes/${item.id}/edit`)}
                                                    className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-brand hover:border-brand/30 transition-all"
                                                    title="Edit Class"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 transition-all"
                                                    title="Delete Class"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-12 w-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                                                <Search className="h-5 w-5 text-zinc-300" />
                                            </div>
                                            <p className="text-zinc-500 font-medium">No classes found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty State */}
            {!isLoading && classrooms.length === 0 && !search && (
                <div className="text-center py-20 bg-white rounded-[40px] border border-zinc-100 mt-6">
                    <School className="h-16 w-16 text-zinc-200 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-zinc-900">No classes found</h3>
                    <p className="text-zinc-400 font-medium mt-2 max-w-xs mx-auto">
                        Get started by creating your first academic class section.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={() => router.push(`/s/${slug}/staff`)}
                            className="h-12 px-8 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm"
                        >
                            Assigned Staff First
                        </button>
                        <button
                            onClick={() => router.push(`/s/${slug}/academics/classes/create`)}
                            className="h-12 px-8 bg-brand text-[var(--secondary-color)] hover:brightness-110 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20"
                        >
                            Create First Class
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
