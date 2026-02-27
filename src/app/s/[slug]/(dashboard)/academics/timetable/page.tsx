"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Calendar,
    Search,
    Clock,
    Save,
    CheckCircle2,
    Briefcase,
    AlertCircle,
    ChevronDown,
    LayoutGrid,
    Settings,
    Plus,
    Trash2,
    Info,
    AlertTriangle,
    X,
    Loader2,
    Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getClassroomsAction, updateClassroomAction } from "@/app/actions/classroom-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { checkTeacherAvailabilityAction } from "@/app/actions/timetable-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { getTimetableStructuresAction, createTimetableStructureAction, updateTimetableStructureAction, deleteTimetableStructureAction, assignTimetableStructureAction } from "@/app/actions/timetable-structure-actions";

type PeriodNode = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    type: "CLASS" | "BREAK";
};

type TimetableConfig = {
    periods: PeriodNode[];
    workingDays: string[];
};

type TimetableStructure = {
    id: string;
    name: string;
    description: string | null;
    config: string;
    _count?: { classrooms: number };
};

export default function TimetablePage() {
    const params = useParams();
    const slug = params.slug as string;

    const [activeTab, setActiveTab] = useState<"schedule" | "config">("schedule");
    const [isLoading, setIsLoading] = useState(true);

    // Data
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [structures, setStructures] = useState<TimetableStructure[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData(showLoader = true) {
        if (showLoader) setIsLoading(true);
        try {
            const [classesRes, staffRes, structuresRes, subjectsRes] = await Promise.all([
                getClassroomsAction(slug),
                getStaffAction(slug),
                getTimetableStructuresAction(slug),
                getMasterDataAction("SUBJECT")
            ]);

            if (classesRes.success) setClassrooms(classesRes.data || []);
            if (staffRes.success) {
                const teachersOnly = (staffRes.data || []).filter((s: any) =>
                    (s.designation && s.designation.toLowerCase().includes("teacher")) ||
                    (s.role === "STAFF")
                );
                setStaff(teachersOnly);
            }
            if (subjectsRes.success) {
                setSubjects(subjectsRes.data || []);
            }
            if (structuresRes.success) {
                setStructures(structuresRes.structures || []);
            }
        } catch (error) {
            toast.error("Failed to load data");
            console.error(error);
        } finally {
            if (showLoader) setIsLoading(false);
        }
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900">Timetable Management</h2>
                    <p className="text-sm font-medium text-zinc-500 mt-1">
                        Configure multiple school timings and manage class schedules.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-zinc-100 p-1 rounded-full">
                    <button
                        onClick={() => setActiveTab("schedule")}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                            activeTab === "schedule" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        <Calendar className="h-4 w-4" />
                        Class Schedules
                    </button>
                    <button
                        onClick={() => setActiveTab("config")}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                            activeTab === "config" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        <Settings className="h-4 w-4" />
                        Structure & Settings
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
                </div>
            ) : (
                <>
                    {activeTab === "config" ? (
                        <StructuresView structures={structures} slug={slug} onUpdate={() => loadData(false)} />
                    ) : (
                        <SchedulerView
                            classrooms={classrooms}
                            staff={staff}
                            subjects={subjects}
                            structures={structures}
                            slug={slug}
                            onUpdate={() => loadData(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// --- Structures List & Config View ---
function StructuresView({ structures, slug, onUpdate }: any) {
    const [editingStructure, setEditingStructure] = useState<TimetableStructure | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    if (editingStructure || isCreatingNew) {
        return (
            <StructureEditor
                structure={editingStructure}
                slug={slug}
                onClose={() => {
                    setEditingStructure(null);
                    setIsCreatingNew(false);
                }}
                onSave={() => {
                    setEditingStructure(null);
                    setIsCreatingNew(false);
                    onUpdate();
                }}
            />
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Info className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-orange-900">Multiple Timing Structures</h3>
                    <p className="text-sm text-orange-700 mt-1 max-w-2xl leading-relaxed">
                        Create multiple distinct timetable schedules (e.g., Primary timings, High School timings). You can then explicitly assign a specific structure to each Classroom from the Class Schedules tab.
                    </p>
                </div>
                <div className="ml-auto shrink-0">
                    <button
                        onClick={() => setIsCreatingNew(true)}
                        className="h-10 px-5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg shadow-orange-600/20"
                    >
                        <Plus className="h-4 w-4" />
                        New Structure
                    </button>
                </div>
            </div>

            {structures.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[32px] border border-dashed border-zinc-200">
                    <Settings className="h-10 w-10 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-zinc-900">No Timetable Structures</h3>
                    <p className="text-zinc-400 font-medium mt-1">Create your first structure to start scheduling classrooms.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {structures.map((s: any) => {
                        let parsedConfig: any = { periods: [], workingDays: [] };
                        try {
                            parsedConfig = JSON.parse(s.config);
                        } catch (e) { }

                        return (
                            <div key={s.id} className="bg-white rounded-[32px] border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-lg font-black text-zinc-900 line-clamp-1">{s.name}</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1 line-clamp-1">
                                            {s.description || "No description"}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 bg-brand/10 text-brand rounded-full flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="space-y-3 mt-auto">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 font-medium">Assigned Classes</span>
                                        <span className="font-bold text-zinc-900 px-2.5 py-1 bg-zinc-100 rounded-lg">{s._count?.classrooms || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 font-medium">Total Periods</span>
                                        <span className="font-bold text-zinc-900 px-2.5 py-1 bg-zinc-100 rounded-lg">{parsedConfig.periods?.length || 0}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6 pt-6 border-t border-zinc-100">
                                    <button
                                        onClick={() => setEditingStructure(s)}
                                        className="flex-1 h-10 px-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm("Are you sure you want to delete this structure? This will reset the timetable layout for all assigned classes.")) {
                                                const res = await deleteTimetableStructureAction(slug, s.id);
                                                if (res.success) onUpdate();
                                                else toast.error("Delete failed");
                                            }
                                        }}
                                        className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 bg-zinc-50 rounded-xl transition-all shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

// --- Structure Editor Component ---
function StructureEditor({ structure, slug, onClose, onSave }: any) {
    const isEditing = !!structure;
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState(structure?.name || "");
    const [description, setDescription] = useState(structure?.description || "");

    // Parse config safely
    const defaultConfig: TimetableConfig = {
        periods: [
            { id: "p1", name: "Period 1", startTime: "09:00", endTime: "09:45", type: "CLASS" },
            { id: "b1", name: "Break", startTime: "09:45", endTime: "10:00", type: "BREAK" },
            { id: "p2", name: "Period 2", startTime: "10:00", endTime: "10:45", type: "CLASS" },
        ],
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    };

    const [localConfig, setLocalConfig] = useState<TimetableConfig>(() => {
        if (!structure?.config) return defaultConfig;
        try {
            return JSON.parse(structure.config);
        } catch (e) {
            return defaultConfig;
        }
    });

    const addPeriod = () => {
        setLocalConfig(prev => ({
            ...prev,
            periods: [
                ...prev.periods,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    name: `Period ${prev.periods.length + 1}`,
                    startTime: "",
                    endTime: "",
                    type: "CLASS"
                }
            ]
        }));
    };

    const removePeriod = (index: number) => {
        const newPeriods = [...localConfig.periods];
        newPeriods.splice(index, 1);
        setLocalConfig(prev => ({ ...prev, periods: newPeriods }));
    };

    const updatePeriod = (index: number, field: string, value: any) => {
        const newPeriods = [...localConfig.periods];
        newPeriods[index] = { ...newPeriods[index], [field]: value };
        setLocalConfig(prev => ({ ...prev, periods: newPeriods }));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please provide a name for this structure");
            return;
        }

        const isValid = localConfig.periods.every(p => p.name && p.startTime && p.endTime);
        if (!isValid) {
            toast.error("Please fill in all period details");
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = {
                name,
                description,
                config: JSON.stringify(localConfig)
            };

            const res = isEditing
                ? await updateTimetableStructureAction(slug, structure.id, dataToSave)
                : await createTimetableStructureAction(slug, dataToSave);

            if (res.success) {
                toast.success(`Structure ${isEditing ? 'updated' : 'created'} successfully`);
                onSave();
            } else {
                toast.error(res.error || "Failed to save");
            }
        } catch (e) {
            toast.error("Save error");
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onClose}
                    className="h-10 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-sm transition-colors flex items-center justify-center"
                >
                    &larr; Back
                </button>
                <h3 className="text-2xl font-black text-zinc-900">{isEditing ? 'Edit Structure' : 'Create New Structure'}</h3>
            </div>

            <div className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block ml-1">Structure Name *</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Primary School Timings"
                            className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-none font-bold text-sm focus:ring-2 focus:ring-brand placeholder:text-zinc-300 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block ml-1">Short Description</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional notes"
                            className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-none font-bold text-sm focus:ring-2 focus:ring-brand placeholder:text-zinc-300 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm">
                <h3 className="text-xl font-black text-zinc-900 mb-6">Active Working Days</h3>
                <div className="flex flex-wrap gap-3">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                        const isSelected = (localConfig.workingDays || []).includes(day);
                        return (
                            <button
                                key={day}
                                onClick={() => {
                                    const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                                    const current = localConfig.workingDays || [];
                                    let newDays = [];
                                    if (isSelected) {
                                        newDays = current.filter((d: string) => d !== day);
                                    } else {
                                        newDays = [...current, day];
                                    }
                                    newDays.sort((a: string, b: string) => allDays.indexOf(a) - allDays.indexOf(b));
                                    setLocalConfig(prev => ({ ...prev, workingDays: newDays }));
                                }}
                                className={cn(
                                    "h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2",
                                    isSelected
                                        ? "bg-brand border-brand text-[var(--secondary-color)] shadow-lg shadow-brand/20"
                                        : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300"
                                )}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-zinc-900">Daily Timeline Blocks</h3>
                    <button
                        onClick={addPeriod}
                        className="h-10 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Slot
                    </button>
                </div>

                <div className="space-y-3">
                    {(localConfig.periods || []).map((period, index) => (
                        <div key={period.id} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-zinc-100 hover:border-zinc-300 hover:shadow-sm transition-all bg-white items-start md:items-center">
                            <div className="flex items-center gap-3 w-12 pt-3 md:pt-0">
                                <span className="text-xs font-black text-zinc-300 w-6">#{index + 1}</span>
                            </div>

                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Slot Name</label>
                                    <input
                                        value={period.name}
                                        onChange={e => updatePeriod(index, "name", e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl bg-zinc-50 border-none text-sm font-bold focus:ring-2 focus:ring-brand/10 transition-all placeholder:text-zinc-300"
                                        placeholder="e.g. Period 1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Type</label>
                                    <div className="flex bg-zinc-100 p-1 rounded-lg h-10">
                                        <button
                                            onClick={() => updatePeriod(index, "type", "CLASS")}
                                            className={cn("flex-1 rounded-md text-[10px] font-black uppercase transition-all", period.type === "CLASS" ? "bg-white shadow-sm text-brand" : "text-zinc-400")}
                                        >
                                            Class
                                        </button>
                                        <button
                                            onClick={() => updatePeriod(index, "type", "BREAK")}
                                            className={cn("flex-1 rounded-md text-[10px] font-black uppercase transition-all", period.type === "BREAK" ? "bg-white shadow-sm text-orange-600" : "text-zinc-400")}
                                        >
                                            Break
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Start Time</label>
                                    <input
                                        type="time"
                                        value={period.startTime}
                                        onChange={e => updatePeriod(index, "startTime", e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl bg-zinc-50 border-none text-sm font-bold focus:ring-2 focus:ring-brand/10 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">End Time</label>
                                    <input
                                        type="time"
                                        value={period.endTime}
                                        onChange={e => updatePeriod(index, "endTime", e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl bg-zinc-50 border-none text-sm font-bold focus:ring-2 focus:ring-brand/10 transition-all"
                                    />
                                </div>
                            </div>

                            <button onClick={() => removePeriod(index)} className="h-10 w-10 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}

                    {(!localConfig.periods || localConfig.periods.length === 0) && (
                        <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                            <Clock className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                            <p className="text-zinc-400 text-sm font-medium">No timeline slots defined yet.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex gap-4 justify-end pt-6 border-t border-zinc-100">
                    <button
                        onClick={onClose}
                        className="h-12 px-8 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-8 bg-brand text-[var(--secondary-color)] hover:brightness-110 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Structure"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Scheduler View ---
function SchedulerView({ classrooms, staff, subjects, structures, slug, onUpdate }: any) {
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedStructureId, setSelectedStructureId] = useState("");
    const [schedule, setSchedule] = useState<any>({});

    // Structure state
    const selectedClass = classrooms.find((c: any) => c.id === selectedClassId);
    const assignedStructureId = selectedClass?.timetableStructureId || "";

    useEffect(() => {
        if (selectedClass) {
            setSelectedStructureId(selectedClass.timetableStructureId || "");
        } else {
            setSelectedStructureId("");
        }
    }, [selectedClassId, classrooms]);

    // Parse the assigned structure config (or return empty defaults)
    const activeStructure = structures.find((s: any) => s.id === assignedStructureId);
    let config: TimetableConfig = { periods: [], workingDays: [] };
    if (activeStructure && activeStructure.config) {
        try {
            config = JSON.parse(activeStructure.config);
        } catch (e) { }
    }

    // Cell Editing
    const [editingCell, setEditingCell] = useState<{ day: string, periodId: string } | null>(null);

    const periods = config.periods || [];
    const days = config.workingDays || [];

    useEffect(() => {
        if (selectedClassId && selectedClass?.timetable) {
            try {
                setSchedule(JSON.parse(selectedClass.timetable));
            } catch (e) {
                setSchedule({});
            }
        } else {
            setSchedule({});
        }
    }, [selectedClassId, classrooms]);

    const handleAssignStructure = async () => {
        if (!selectedClassId || !selectedStructureId) {
            toast.error("Please select a classroom and structure.");
            return;
        }

        if (assignedStructureId && assignedStructureId !== selectedStructureId) {
            if (!window.confirm("Changing the structure will reset the current timetable layout for this class. Are you sure?")) {
                return;
            }
        }

        toast.loading("Applying structure...", { id: "assign" });
        try {
            const res = await assignTimetableStructureAction(slug, selectedClassId, selectedStructureId || null);
            if (res.success) {
                toast.success("Schedule successfully created for class", { id: "assign" });
                onUpdate();
            } else {
                toast.error(res.error || "Failed to apply structure", { id: "assign" });
            }
        } catch (e) {
            toast.error("An error occurred", { id: "assign" });
        }
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Selection Bar */}
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="flex-1 w-full lg:max-w-[400px]">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 mb-2 block">1. Select Classroom</label>
                    <div className="relative">
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full h-14 pl-6 pr-10 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-brand appearance-none cursor-pointer"
                        >
                            <option value="">-- Choose a Class --</option>
                            {classrooms.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex-1 w-full lg:max-w-[400px] border-l-0 lg:border-l border-zinc-100 lg:pl-6">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest px-1 mb-2 block", selectedClassId ? "text-zinc-400" : "text-zinc-300")}>
                        2. Select Timetable Structure
                    </label>
                    <div className="relative">
                        <select
                            disabled={!selectedClassId}
                            value={selectedStructureId}
                            onChange={(e) => setSelectedStructureId(e.target.value)}
                            className="w-full h-14 pl-6 pr-10 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-brand appearance-none cursor-pointer disabled:opacity-50"
                        >
                            <option value="">-- Select Structure --</option>
                            {structures.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex shrink-0 lg:pl-6 items-end lg:h-[70px]">
                    <button
                        type="button"
                        onClick={handleAssignStructure}
                        disabled={!selectedClassId || !selectedStructureId || (assignedStructureId === selectedStructureId)}
                        className="h-14 px-8 bg-brand hover:brightness-110 text-[var(--secondary-color)] rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center w-full lg:w-auto"
                    >
                        {assignedStructureId === selectedStructureId && selectedStructureId !== "" ? "Active" : "Create Schedule"}
                    </button>
                </div>
            </div>

            {selectedClassId ? (
                <>
                    {!assignedStructureId ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-zinc-100 text-center animate-in fade-in duration-500 shadow-sm">
                            <div className="h-24 w-24 bg-brand/5 rounded-full flex items-center justify-center mb-6 text-brand">
                                <LayoutGrid className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900">No Schedule Created</h3>
                            <p className="text-zinc-400 font-medium mt-2 max-w-sm">
                                To schedule periods for this classroom, you must first select a Timetable Structure from the dropdown menu above and click "Create Schedule".
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[1200px]">
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-100">
                                            <th className="p-6 text-left border-r border-zinc-100 w-48 font-black text-xs uppercase text-zinc-400 sticky left-0 bg-zinc-50 z-10">Period</th>
                                            {days.map((day: string) => (
                                                <th key={day} className="p-6 text-center border-r border-zinc-100 font-black text-xs uppercase tracking-widest text-zinc-800">{day}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {periods.map((period: PeriodNode) => (
                                            <tr key={period.id} className="border-b border-zinc-100 last:border-0 group hover:bg-zinc-50/30 transition-colors">
                                                <td className="p-4 border-r border-zinc-100 font-bold text-zinc-500 bg-zinc-50 sticky left-0 z-10 group-hover:bg-zinc-100 transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-zinc-700">{period.name}</span>
                                                        <span className="text-[10px] text-zinc-400 font-bold mt-1 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {period.startTime} - {period.endTime}
                                                        </span>
                                                        {period.type === "BREAK" && (
                                                            <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 w-fit">
                                                                BREAK
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                {period.type === "CLASS" ? (
                                                    days.map((day: string) => {
                                                        const cellData = schedule[day]?.[period.id] || {};
                                                        const teacher = staff.find((s: any) => s.id === cellData.teacherId);

                                                        return (
                                                            <td key={`${day}-${period.id}`} className="p-2 border-r border-zinc-100 align-top h-32">
                                                                <Cell
                                                                    data={cellData}
                                                                    teacher={teacher}
                                                                    onClick={() => setEditingCell({ day, periodId: period.id })}
                                                                />
                                                            </td>
                                                        );
                                                    })
                                                ) : (
                                                    <td colSpan={days.length} className="bg-zinc-50/50 p-2 align-middle text-center">
                                                        <div className="flex items-center justify-center gap-2 text-zinc-300 font-black text-4xl opacity-20 uppercase tracking-[1em]">
                                                            Break
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-zinc-100 text-center animate-in fade-in duration-500 shadow-sm">
                    <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                        <Calendar className="h-10 w-10 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900">Select a Class</h3>
                    <p className="text-zinc-400 font-medium mt-2 max-w-xs">
                        Choose a class section from the dropdown above to view and assign the timetable.
                    </p>
                </div>
            )}

            {/* Cell Editor Dialog */}
            {editingCell && (
                <CellEditor
                    day={editingCell.day}
                    periodId={editingCell.periodId}
                    initialData={schedule[editingCell.day]?.[editingCell.periodId] || {}}
                    staff={staff}
                    subjects={subjects}
                    slug={slug}
                    currentClassId={selectedClassId}
                    onClose={() => setEditingCell(null)}
                    onSave={async (data: any) => {
                        // Optimistic Update
                        const newSchedule = {
                            ...schedule,
                            [editingCell.day]: {
                                ...(schedule[editingCell.day] || {}),
                                [editingCell.periodId]: data
                            }
                        };
                        setSchedule(newSchedule);
                        setEditingCell(null);

                        // Auto-Save
                        toast.loading("Auto-saving...", { id: "autosave" });
                        try {
                            const res = await updateClassroomAction(slug, selectedClassId, {
                                timetable: JSON.stringify(newSchedule)
                            });
                            if (res.success) {
                                toast.success("Saved", { id: "autosave" });
                                onUpdate();
                            } else {
                                toast.error("Failed to auto-save", { id: "autosave" });
                            }
                        } catch (e) {
                            toast.error("Save error", { id: "autosave" });
                        }
                    }}
                />
            )}
        </div>
    );
}

function Cell({ data, teacher, onClick }: any) {
    if (!data.subject && !data.teacherId) {
        return (
            <button onClick={onClick} className="w-full h-full rounded-2xl border-2 border-dashed border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 flex flex-col items-center justify-center text-zinc-300 hover:text-zinc-500 transition-all gap-2 group">
                <Plus className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100">Assign</span>
            </button>
        );
    }

    const subjectDisplay = data.subject || (teacher?.subjects ? teacher.subjects.split(",")[0].trim() : "No Subject");
    const teacherNameDisplay = teacher ? `${teacher.firstName} ${teacher.lastName}` : "No Teacher";

    return (
        <button onClick={onClick} className="w-full h-full rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-brand/30 text-left p-3 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-brand/5 rounded-bl-[3rem] -z-0" />
            <div className="relative z-10 flex flex-col h-full">
                <span className="text-xs font-black text-zinc-900 break-words line-clamp-2">{subjectDisplay}</span>
                <span className="mt-auto text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {teacherNameDisplay}
                </span>
            </div>
        </button>
    );
}

function CellEditor({ day, periodId, initialData, staff, subjects, slug, currentClassId, onClose, onSave }: any) {
    const [subject, setSubject] = useState(initialData.subject || "");
    const [teacherId, setTeacherId] = useState(initialData.teacherId || "");

    const [checking, setChecking] = useState(false);
    const [conflict, setConflict] = useState<string | null>(null);

    useEffect(() => {
        if (teacherId) {
            checkConflict(teacherId);
        }
    }, []);

    const checkConflict = async (tid: string) => {
        if (!tid) {
            setConflict(null);
            return;
        }
        setChecking(true);
        const res = await checkTeacherAvailabilityAction(slug, tid, day, periodId, currentClassId);
        if (res && res.available === false) {
            setConflict(res.conflictClass || "Unknown Class");
        } else {
            setConflict(null);
        }
        setChecking(false);
    };

    const handleTeacherChange = (tid: string) => {
        setTeacherId(tid);
        checkConflict(tid);

        const teacher = staff.find((s: any) => s.id === tid);
        if (teacher && teacher.subjects) {
            const firstSubject = teacher.subjects.split(",")[0].trim();
            setSubject(firstSubject);
        }
    };

    const handleSave = () => {
        if (conflict) {
            toast.error(`Cannot assign: Teacher is busy in ${conflict}`);
            return;
        }
        onSave({ subject, teacherId });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-zinc-900/20">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black text-zinc-900">{day}</h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Edit Slot</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">Subject</label>
                        <div className="space-y-2">
                            <select
                                className="w-full h-12 px-4 rounded-2xl bg-zinc-50 border-none font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all appearance-none cursor-pointer"
                                value={subjects.some((s: any) => s.name === subject) ? subject : subject ? "___CUSTOM___" : ""}
                                onChange={(e) => {
                                    if (e.target.value === "___CUSTOM___") {
                                        setSubject("");
                                    } else {
                                        setSubject(e.target.value);
                                    }
                                }}
                            >
                                <option value="">Select Subject...</option>
                                {subjects.map((s: any) => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                                <option value="___CUSTOM___" className="text-brand font-bold">+ Other / Custom</option>
                            </select>

                            {(!subjects.some((s: any) => s.name === subject) || subject === "") && (
                                <div className="relative animate-in slide-in-from-top-2 duration-200">
                                    <input
                                        autoFocus
                                        className="w-full h-12 px-4 rounded-2xl bg-white border-2 border-zinc-100 font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                                        placeholder="Type custom subject name..."
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                    {subject && subjects.some((s: any) => s.name === subject) && (
                                        <button
                                            onClick={() => setSubject("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">Teacher</label>
                        <select
                            className="w-full h-12 px-4 rounded-2xl bg-zinc-50 border-none font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all appearance-none cursor-pointer"
                            value={teacherId}
                            onChange={(e) => handleTeacherChange(e.target.value)}
                        >
                            <option value="">Select Teacher...</option>
                            {staff.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.designation || 'Staff'})</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-10">
                        {checking ? (
                            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                                <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
                            </div>
                        ) : conflict ? (
                            <div className="flex items-center gap-2 text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                Busy in {conflict}
                            </div>
                        ) : teacherId && (
                            <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                Available
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => onSave({ subject: "", teacherId: "" })}
                        className="flex-1 h-12 rounded-2xl border-2 border-zinc-100 text-zinc-400 font-black text-xs uppercase tracking-widest hover:border-red-100 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!!conflict || checking}
                        className="flex-[2] h-12 rounded-2xl bg-brand text-[var(--secondary-color)] hover:brightness-110 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand/20"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
