"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getClassroomAction, updateClassroomAction } from "@/app/actions/classroom-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";

export default function EditClassPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const classId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);

    const [mode, setMode] = useState<"standard" | "custom">("custom");
    const [grade, setGrade] = useState("");
    const [section, setSection] = useState("");
    const [customName, setCustomName] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [capacity, setCapacity] = useState(30);
    const [roomNumber, setRoomNumber] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const [classRes, staffRes, gradesRes, sectionsRes] = await Promise.all([
                getClassroomAction(classId, slug),
                getStaffAction(slug),
                getMasterDataAction("GRADE", null),
                getMasterDataAction("SECTION", null)
            ]);

            if (staffRes.success) setStaff(staffRes.data || []);
            if (gradesRes.success) setGrades(gradesRes.data || []);
            if (sectionsRes.success) setSections(sectionsRes.data || []);

            if (classRes.success && classRes.classroom) {
                const cls = classRes.classroom;
                setCustomName(cls.name || "");
                setTeacherId(cls.teacherId || "");
                setCapacity(cls.capacity || 30);
                setRoomNumber(cls.roomNumber || "");
                setMode("custom"); // Always use custom for existing classes
            } else {
                toast.error("Class not found");
                router.push(`/s/${slug}/academics/classes`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);

        const finalName = mode === "standard"
            ? `${grade}${section ? ` - ${section}` : ""}`
            : customName;

        try {
            const res = await updateClassroomAction(slug, classId, {
                name: finalName,
                teacherId: teacherId || null,
                capacity: capacity,
                roomNumber: roomNumber || null
            });

            if (res.success) {
                toast.success("Class updated successfully");
                router.push(`/s/${slug}/academics/classes`);
            } else {
                toast.error(res.error || "Failed to update class");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update class");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 pb-20 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/s/${slug}/academics/classes`}>
                    <button className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Edit Class</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Update class details and settings</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 p-8">
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
                                    required
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
                                onChange={e => setCapacity(parseInt(e.target.value) || 30)}
                                className="w-full h-14 px-6 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-blue-600"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <Link href={`/s/${slug}/academics/classes`} className="flex-1">
                            <button type="button" className="w-full h-14 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest transition-all">
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 h-14 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            {isSaving ? "Saving..." : "Update Class"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
