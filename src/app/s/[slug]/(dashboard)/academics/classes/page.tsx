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
    CheckCircle2,
    X,
    User,
    School,
    MoreHorizontal,
    Calendar,
    Clock,
    Save,
    MapPin,
    LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getClassroomsAction, createClassroomAction, updateClassroomAction, deleteClassroomAction } from "@/app/actions/classroom-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";

export default function ClassesPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<any>(null);
    const [timetableClass, setTimetableClass] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData(showLoading = true) {
        if (showLoading) setIsLoading(true);
        try {
            const [classesRes, staffRes, gradesRes, sectionsRes] = await Promise.all([
                getClassroomsAction(slug),
                getStaffAction(slug),
                getMasterDataAction("GRADE", null),
                getMasterDataAction("SECTION", null)
            ]);

            if (classesRes.success) setClassrooms(classesRes.data || []);
            if (staffRes.success) setStaff(staffRes.data || []);
            if (gradesRes.success) setGrades(gradesRes.data || []);
            if (sectionsRes.success) setSections(sectionsRes.data || []);

        } catch (error) {
            toast.error("Failed to load data");
            console.error(error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }

    const filteredClasses = classrooms.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.teacher?.firstName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class? This cannot be undone.")) return;

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
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="h-12 px-6 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    New Class
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
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
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-4 w-32 bg-zinc-100 rounded" /></td>
                                        <td className="py-4 px-6"><div className="h-4 w-48 bg-zinc-100 rounded" /></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-zinc-100 rounded" /></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-zinc-100 rounded" /></td>
                                        <td className="py-4 px-6"></td>
                                    </tr>
                                ))
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
                                                    onClick={() => setEditingClass(item)}
                                                    className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-200 transition-all"
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
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-8 h-12 px-8 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                    >
                        Create First Class
                    </button>
                </div>
            )}

            {/* Dialogs */}
            {(isCreateOpen || editingClass) && (
                <ClassDialog
                    onClose={() => {
                        setIsCreateOpen(false);
                        setEditingClass(null);
                    }}
                    onSuccess={() => {
                        loadData(false);
                        setIsCreateOpen(false);
                        setEditingClass(null);
                    }}
                    schoolsSlug={slug}
                    grades={grades}
                    sections={sections}
                    staff={staff}
                    initialData={editingClass}
                />
            )}
        </div>
    );
}

function ClassDialog({ onClose, onSuccess, schoolsSlug, grades, sections, staff, initialData }: any) {
    const [grade, setGrade] = useState(initialData ? "" : "");
    const [section, setSection] = useState("");
    const [customName, setCustomName] = useState(initialData?.name || "");
    const [teacherId, setTeacherId] = useState(initialData?.teacherId || "");
    const [capacity, setCapacity] = useState(initialData?.capacity || 30);
    const [roomNumber, setRoomNumber] = useState(initialData?.roomNumber || "");
    const [mode, setMode] = useState<"standard" | "custom">("standard");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData && initialData.name) {
            setMode("custom");
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const finalName = mode === "standard"
            ? `${grade}${section ? ` - ${section}` : ""}`
            : customName;

        try {
            const payload = {
                name: finalName,
                teacherId,
                capacity: parseInt(capacity),
                roomNumber
            };

            if (initialData) {
                const res = await updateClassroomAction(schoolsSlug, initialData.id, payload);
                if (res.success) {
                    toast.success("Class updated");
                    onSuccess();
                } else {
                    toast.error(res.error);
                }
            } else {
                const res = await createClassroomAction(schoolsSlug, finalName, teacherId);
                // Note: Create action might need update for capacity/roomNumber support, or we do a double update.
                // Assuming createClassroomAction only takes name/teacherId for now.
                // To support full creation, we should ideally update createClassroomAction, 
                // but for now let's just create then update if needed, or rely on defaults.
                if (res) {
                    // If we have extra fields, update them immediately
                    if (capacity !== 30 || roomNumber) {
                        await updateClassroomAction(schoolsSlug, res.id, { capacity: parseInt(capacity), roomNumber });
                    }
                    toast.success("Class created");
                    onSuccess();
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-zinc-900/40">
            <div className="bg-white rounded-[48px] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
                        {initialData ? "Edit Class" : "New Class"}
                    </h3>
                    <button onClick={onClose} className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Naming Mode Toggle */}
                    <div className="flex bg-zinc-100 p-1 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setMode("standard")}
                            className={cn(
                                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                mode === "standard" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"
                            )}
                        >
                            Standard Format
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("custom")}
                            className={cn(
                                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                mode === "custom" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"
                            )}
                        >
                            Custom Name
                        </button>
                    </div>

                    {mode === "standard" ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 ml-2">Grade</label>
                                <select
                                    value={grade}
                                    onChange={e => setGrade(e.target.value)}
                                    className="w-full h-14 px-4 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                                    required={!initialData}
                                >
                                    <option value="">Select...</option>
                                    {grades.length > 0 ? grades.map((g: any) => (
                                        <option key={g.id} value={g.name}>{g.name}</option>
                                    )) : (
                                        <>
                                            <option value="Pre-K">Pre-K</option>
                                            <option value="Kindergarten">Kindergarten</option>
                                            <option value="Grade 1">Grade 1</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 ml-2">Section</label>
                                <select
                                    value={section}
                                    onChange={e => setSection(e.target.value)}
                                    className="w-full h-14 px-4 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                                >
                                    <option value="">Select...</option>
                                    {sections?.length > 0 ? sections.map((s: any) => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    )) : (
                                        <>
                                            <option value="A">Section A</option>
                                            <option value="B">Section B</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 ml-4 block">Class Display Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Science Lab 1"
                                value={customName}
                                onChange={e => setCustomName(e.target.value)}
                                className="w-full h-14 px-6 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-blue-600"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 ml-4 block">Class Teacher</label>
                        <div className="relative">
                            <select
                                value={teacherId}
                                onChange={e => setTeacherId(e.target.value)}
                                className="w-full h-14 px-6 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                            >
                                <option value="">Select Teacher</option>
                                {staff.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                ))}
                            </select>
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 ml-4 block">Room No.</label>
                            <input
                                type="text"
                                placeholder="e.g. 101"
                                value={roomNumber}
                                onChange={e => setRoomNumber(e.target.value)}
                                className="w-full h-14 px-6 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-blue-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 ml-4 block">Capacity</label>
                            <input
                                type="number"
                                placeholder="30"
                                value={capacity}
                                onChange={e => setCapacity(e.target.value)}
                                className="w-full h-14 px-6 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-blue-600"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full h-16 bg-blue-600 text-white hover:bg-blue-700 rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
                    >
                        {isSaving ? "Saving..." : initialData ? "Update Class" : "Create Class"}
                    </button>
                </form>
            </div>
        </div>
    );
}
