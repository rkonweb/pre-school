"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Save, Loader2, User, BookOpen, Hash,
    Users, MapPin, ChevronDown, Sparkles, Info, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClassroomAction, updateClassroomAction } from "@/app/actions/classroom-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";

const SectionTitle = ({ icon: Icon, title, subtitle, color = "zinc" }: any) => (
    <div className="flex items-center gap-3 mb-6">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color === "brand" ? "bg-brand/10 text-brand" : "bg-zinc-100 text-zinc-700"}`}>
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <h3 className="text-base font-black text-zinc-900">{title}</h3>
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">{label}</label>
        {children}
        {hint && <p className="text-[10px] text-zinc-400 px-1 mt-1">{hint}</p>}
    </div>
);

const inputCls = "w-full h-14 px-6 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all";
const selectCls = inputCls + " appearance-none";

export default function CreateClassPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);

    const [mode, setMode] = useState<"standard" | "custom">("standard");
    const [grade, setGrade] = useState("");
    const [section, setSection] = useState("");
    const [customName, setCustomName] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [capacity, setCapacity] = useState(30);
    const [roomNumber, setRoomNumber] = useState("");

    // Preview of the class name
    const previewName = mode === "standard"
        ? `${grade || "Grade"}${section ? ` - ${section}` : ""}`
        : customName || "My Class";

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const [staffRes, gradesRes, sectionsRes] = await Promise.all([
                getStaffAction(slug),
                getMasterDataAction("GRADE", null),
                getMasterDataAction("SECTION", null)
            ]);
            if (staffRes.success) setStaff(staffRes.data || []);
            if (gradesRes.success) setGrades(gradesRes.data || []);
            if (sectionsRes.success) setSections(sectionsRes.data || []);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const finalName = mode === "standard"
            ? `${grade}${section ? ` - ${section}` : ""}`
            : customName;

        if (!finalName.trim()) { toast.error("Class name is required"); return; }
        setIsSaving(true);
        try {
            const res = await createClassroomAction(slug, finalName, teacherId || undefined);
            // @ts-ignore
            if (res?.success && res.data) {
                if (capacity !== 30 || roomNumber) {
                    // @ts-ignore
                    await updateClassroomAction(slug, res.data.id, { capacity, roomNumber: roomNumber || null });
                }
                toast.success("Class created!");
                router.push(`/s/${slug}/academics/classes`);
            } else {
                // @ts-ignore
                toast.error("Failed: " + (res?.error || "Unknown error"));
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to create class");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
    );

    const selectedTeacher = staff.find(s => s.id === teacherId);

    return (
        <div className="w-full pb-20 px-4 md:px-8">
            {/* Header */}
            <div className="flex items-center gap-5 py-8 border-b border-zinc-100 mb-8">
                <Link href={`/s/${slug}/academics/classes`}>
                    <button className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all" title="Back">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Create New Class</h1>
                    <p className="text-sm text-zinc-500 mt-1">Configure a new classroom — assign a teacher, set capacity, and room details.</p>
                </div>
                {/* Live preview badge */}
                <div className="hidden md:flex items-center gap-3 bg-brand/5 border border-brand/20 rounded-2xl px-5 py-3">
                    <Sparkles className="h-4 w-4 text-brand" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Class Preview</p>
                        <p className="text-sm font-black text-zinc-900">{previewName}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT — Main Config */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Class Naming */}
                        <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 p-8">
                            <SectionTitle icon={BookOpen} title="Class Identity" subtitle="Define how this class will be displayed across the system" />

                            {/* Standard / Custom toggle */}
                            <div className="flex bg-zinc-100 p-1 rounded-2xl mb-6">
                                {(["standard", "custom"] as const).map(m => (
                                    <button key={m} type="button" onClick={() => setMode(m)}
                                        className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                            mode === m ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                        )}>
                                        {m === "standard" ? "Standard Format" : "Custom Name"}
                                    </button>
                                ))}
                            </div>

                            {mode === "standard" ? (
                                <div className="grid md:grid-cols-2 gap-5">
                                    <Field label="Grade *" hint="Select from your configured grade levels">
                                        <div className="relative">
                                            <select value={grade} onChange={e => setGrade(e.target.value)} className={selectCls} required>
                                                <option value="">Select Grade...</option>
                                                {grades.length > 0 ? grades.map((g: any) => (
                                                    <option key={g.id} value={g.name}>{g.name}</option>
                                                )) : (
                                                    <>
                                                        <option value="Nursery">Nursery</option>
                                                        <option value="LKG">LKG</option>
                                                        <option value="UKG">UKG</option>
                                                        <option value="Pre-K">Pre-K</option>
                                                        <option value="Kindergarten">Kindergarten</option>
                                                        <option value="Grade 1">Grade 1</option>
                                                        <option value="Grade 2">Grade 2</option>
                                                        <option value="Grade 3">Grade 3</option>
                                                    </>
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                        </div>
                                    </Field>
                                    <Field label="Section" hint="Optional — e.g. A, B, Rose, Sunflower">
                                        <div className="relative">
                                            <select value={section} onChange={e => setSection(e.target.value)} className={selectCls}>
                                                <option value="">No Section</option>
                                                {sections?.length > 0 ? sections.map((s: any) => (
                                                    <option key={s.id} value={s.name}>{s.name}</option>
                                                )) : (
                                                    <>
                                                        <option value="A">Section A</option>
                                                        <option value="B">Section B</option>
                                                        <option value="C">Section C</option>
                                                        <option value="D">Section D</option>
                                                    </>
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                        </div>
                                    </Field>
                                    {/* Preview */}
                                    <div className="md:col-span-2 bg-zinc-50 rounded-2xl p-4 flex items-center gap-3">
                                        <Info className="h-4 w-4 text-zinc-400 shrink-0" />
                                        <p className="text-sm text-zinc-500">
                                            This will create a class named{" "}
                                            <span className="font-black text-zinc-900">
                                                {grade ? `"${grade}${section ? ` - ${section}` : ""}"` : "—"}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <Field label="Class Display Name *" hint='e.g. "Science Lab 1", "Nursery - Rose", "Activity Room"'>
                                    <input
                                        type="text"
                                        placeholder="Enter a unique class name..."
                                        value={customName}
                                        onChange={e => setCustomName(e.target.value)}
                                        className={inputCls}
                                        required
                                    />
                                </Field>
                            )}
                        </div>

                        {/* Classroom Details */}
                        <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 p-8">
                            <SectionTitle icon={MapPin} title="Room Details" subtitle="Physical location and student capacity" />

                            <div className="grid md:grid-cols-2 gap-5">
                                <Field label="Room Number" hint="e.g. 101, Ground Floor East">
                                    <input
                                        type="text"
                                        placeholder="e.g. 101"
                                        value={roomNumber}
                                        onChange={e => setRoomNumber(e.target.value)}
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Student Capacity" hint="Maximum number of students for this class">
                                    <input
                                        type="number"
                                        min={1}
                                        max={200}
                                        value={capacity}
                                        onChange={e => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className={inputCls}
                                    />
                                </Field>
                            </div>

                            {/* Capacity visual bar */}
                            <div className="mt-5 p-4 bg-zinc-50 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Capacity Indicator</p>
                                    <p className="text-xs font-black text-zinc-700">{capacity} students</p>
                                </div>
                                <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all", capacity <= 20 ? "bg-emerald-400" : capacity <= 35 ? "bg-blue-400" : capacity <= 50 ? "bg-amber-400" : "bg-red-400")}
                                        style={{ width: `${Math.min(100, (capacity / 60) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[9px] text-zinc-400 mt-1.5">
                                    {capacity <= 20 ? "Small group — ideal for focused learning" : capacity <= 35 ? "Standard class size" : capacity <= 50 ? "Large class" : "Very large capacity"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Teacher & Summary */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Teacher Assignment */}
                        <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 p-8">
                            <SectionTitle icon={User} title="Class Teacher" subtitle="Assign a primary teacher (optional)" />

                            <div className="relative">
                                <select
                                    value={teacherId}
                                    onChange={e => setTeacherId(e.target.value)}
                                    className={selectCls + " pr-10"}
                                    aria-label="Class Teacher"
                                >
                                    <option value="">No teacher assigned</option>
                                    {staff.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                            </div>

                            {selectedTeacher && (
                                <div className="mt-4 flex items-center gap-3 p-4 bg-brand/5 border border-brand/10 rounded-2xl">
                                    <img
                                        src={selectedTeacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTeacher.firstName}`}
                                        className="h-10 w-10 rounded-full object-cover"
                                        alt={selectedTeacher.firstName}
                                    />
                                    <div>
                                        <p className="text-sm font-black text-zinc-900">{selectedTeacher.firstName} {selectedTeacher.lastName}</p>
                                        <p className="text-xs text-zinc-400">{selectedTeacher.designation || "Teacher"}</p>
                                    </div>
                                </div>
                            )}

                            {staff.length === 0 && (
                                <p className="mt-3 text-xs text-zinc-400 text-center">No staff found. Add staff members first.</p>
                            )}
                        </div>

                        {/* Summary Card */}
                        <div className="bg-zinc-900 text-white rounded-[32px] p-8">
                            <div className="flex items-center gap-2 mb-5">
                                <Sparkles className="h-4 w-4 text-zinc-400" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Summary</p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: "Class Name", value: previewName },
                                    { label: "Teacher", value: selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : "Not assigned" },
                                    { label: "Room", value: roomNumber || "Not specified" },
                                    { label: "Capacity", value: `${capacity} students` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-start gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 shrink-0">{label}</span>
                                        <span className="text-sm font-bold text-white text-right">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                type="submit"
                                form="create-class-form"
                                disabled={isSaving}
                                onClick={handleSubmit as any}
                                className="w-full h-14 bg-brand text-[var(--secondary-color)] hover:brightness-110 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                {isSaving ? "Creating..." : "Create Class"}
                            </button>
                            <Link href={`/s/${slug}/academics/classes`} className="block">
                                <button type="button" className="w-full h-12 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-sm transition-all">
                                    Cancel
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
