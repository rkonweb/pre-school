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
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getClassroomsAction, updateClassroomAction } from "@/app/actions/classroom-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { getTimetableConfigAction, updateTimetableConfigAction, checkTeacherAvailabilityAction } from "@/app/actions/timetable-actions";

type PeriodNode = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    type: "CLASS" | "BREAK";
};

type TimetableConfig = {
    periods: PeriodNode[];
    workingDays: string[]; // e.g. ["Monday", "Tuesday", ...]
};

export default function TimetablePage() {
    const params = useParams();
    const slug = params.slug as string;

    const [activeTab, setActiveTab] = useState<"schedule" | "config">("schedule");
    const [isLoading, setIsLoading] = useState(true);

    // Data
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [config, setConfig] = useState<TimetableConfig>({ periods: [], workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData(showLoader = true) {
        if (showLoader) setIsLoading(true);
        try {
            const [classesRes, staffRes, configRes] = await Promise.all([
                getClassroomsAction(slug),
                getStaffAction(slug),
                getTimetableConfigAction(slug)
            ]);

            if (classesRes.success) setClassrooms(classesRes.data || []);
            if (staffRes.success) {
                // Filter staff to include only those with "Teacher" in their designation
                const teachersOnly = (staffRes.data || []).filter((s: any) =>
                    s.designation && s.designation.toLowerCase().includes("teacher")
                );
                setStaff(teachersOnly);
            }
            if (configRes.success && configRes.config) {
                // Ensure defaults
                const loadedConfig = configRes.config;
                if (!loadedConfig.periods) loadedConfig.periods = [];
                if (!loadedConfig.workingDays) loadedConfig.workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                setConfig(loadedConfig);
            } else {
                // Default config if none exists
                setConfig({
                    periods: [
                        { id: "p1", name: "Period 1", startTime: "09:00", endTime: "09:45", type: "CLASS" },
                        { id: "b1", name: "Break", startTime: "09:45", endTime: "10:00", type: "BREAK" },
                        { id: "p2", name: "Period 2", startTime: "10:00", endTime: "10:45", type: "CLASS" },
                    ],
                    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                });
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
                        Configure school timings and manage class schedules.
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
                        <ConfigView config={config} setConfig={setConfig} slug={slug} onSave={() => loadData(false)} />
                    ) : (
                        <SchedulerView
                            classrooms={classrooms}
                            staff={staff}
                            config={config}
                            slug={slug}
                            onUpdate={() => loadData(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// --- Configuration View ---
function ConfigView({ config, setConfig, slug, onSave }: any) {
    const [isSaving, setIsSaving] = useState(false);
    const [localConfig, setLocalConfig] = useState<TimetableConfig>(JSON.parse(JSON.stringify(config)));

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
        setIsSaving(true);
        // Validate
        const isValid = localConfig.periods.every(p => p.name && p.startTime && p.endTime);
        if (!isValid) {
            toast.error("Please fill in all period details");
            setIsSaving(false);
            return;
        }

        try {
            const res = await updateTimetableConfigAction(slug, localConfig);
            if (res.success) {
                toast.success("Structure saved successfully");
                setConfig(localConfig);
                onSave();
            } else {
                toast.error(res.error);
            }
        } catch (e) {
            toast.error("Save failed");
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Info className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-orange-900">Configuration Guide</h3>
                    <p className="text-sm text-orange-700 mt-1 max-w-2xl leading-relaxed">
                        Define the master structure here. All classes will follow this timeline. Any changes here will reflect in all class timetables (though existing assigned data will attempt to map by Period ID if possible, otherwise by order).
                        Ensure you set "Break" periods correctly.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm">
                <h3 className="text-xl font-black text-zinc-900 mb-6">Working Days</h3>
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
                                    // Sort to maintain week order
                                    newDays.sort((a: string, b: string) => allDays.indexOf(a) - allDays.indexOf(b));

                                    setLocalConfig(prev => ({ ...prev, workingDays: newDays }));
                                }}
                                className={cn(
                                    "h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2",
                                    isSelected
                                        ? "bg-blue-600 border-zinc-900 text-white shadow-lg shadow-zinc-200"
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
                    <h3 className="text-xl font-black text-zinc-900">Daily Timeline</h3>
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
                                        className="w-full h-10 px-3 rounded-xl bg-zinc-50 border-none text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-zinc-300"
                                        placeholder="e.g. Period 1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Type</label>
                                    <div className="flex bg-zinc-100 p-1 rounded-lg h-10">
                                        <button
                                            onClick={() => updatePeriod(index, "type", "CLASS")}
                                            className={cn("flex-1 rounded-md text-[10px] font-black uppercase transition-all", period.type === "CLASS" ? "bg-white shadow-sm text-blue-600" : "text-zinc-400")}
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
                                        className="w-full h-10 px-3 rounded-xl bg-zinc-50 border-none text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">End Time</label>
                                    <input
                                        type="time"
                                        value={period.endTime}
                                        onChange={e => updatePeriod(index, "endTime", e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl bg-zinc-50 border-none text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
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

                <div className="mt-8 flex justify-end pb-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-8 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
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
function SchedulerView({ classrooms, staff, config, slug, onUpdate }: any) {
    const [selectedClassId, setSelectedClassId] = useState("");
    const [schedule, setSchedule] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    // Cell Editing
    const [editingCell, setEditingCell] = useState<{ day: string, periodId: string } | null>(null);

    // Filtered config periods actually displayed (filtering out breaks if desired for edit view? No, show breaks but read-only)
    const periods = config.periods || [];
    const days = config.workingDays || [];

    useEffect(() => {
        if (selectedClassId) {
            const cls = classrooms.find((c: any) => c.id === selectedClassId);
            if (cls && cls.timetable) {
                try {
                    setSchedule(JSON.parse(cls.timetable));
                } catch (e) {
                    setSchedule({});
                }
            } else {
                setSchedule({});
            }
        } else {
            setSchedule({});
        }
    }, [selectedClassId, classrooms]);

    const handleSave = async () => {
        if (!selectedClassId) return;
        setIsSaving(true);
        try {
            const res = await updateClassroomAction(slug, selectedClassId, {
                timetable: JSON.stringify(schedule)
            });
            if (res.success) {
                toast.success("Timetable saved successfully");
                onUpdate();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to save timetable");
        }
        setIsSaving(false);
    };

    const selectedClass = classrooms.find((c: any) => c.id === selectedClassId);

    if (periods.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-zinc-100 text-center animate-in fade-in duration-500">
                <div className="h-24 w-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-orange-500">
                    <AlertTriangle className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-black text-zinc-900">Structure Missing</h3>
                <p className="text-zinc-400 font-medium mt-2 max-w-xs">
                    Please go to the "Structure & Settings" tab to define periods and school timings first.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Selection Bar */}
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full md:max-w-md">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 mb-2 block">Select Class</label>
                    <div className="relative">
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full h-14 pl-6 pr-10 bg-zinc-50 rounded-2xl text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                        >
                            <option value="">-- Choose a Class --</option>
                            {classrooms.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                {selectedClass && (
                    <div className="flex items-center gap-4 border-l border-zinc-100 pl-6 w-full md:w-auto flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                <LayoutGrid className="h-5 w-5" />
                            </div>
                            <div className="shrink-0">
                                <p className="text-sm font-bold text-zinc-900">{selectedClass.capacity || "N/A"}</p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Capacity</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedClassId ? (
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
                                                <div className="flex items-center justify-center gap-2 text-zinc-300 font-black text-5xl opacity-20 uppercase tracking-[1em]">
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
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-zinc-100 text-center animate-in fade-in duration-500">
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
                                onUpdate(); // Silent refresh
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
        <button onClick={onClick} className="w-full h-full rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-blue-300 text-left p-3 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-blue-50/50 rounded-bl-[3rem] -z-0" />
            <div className="relative z-10 flex flex-col h-full">
                <span className="text-xs font-black text-zinc-900 break-words line-clamp-2">{subjectDisplay}</span>
                <span className="mt-auto text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {teacherNameDisplay}
                </span>
            </div>
        </button>
    );
}

function CellEditor({ day, periodId, initialData, staff, slug, currentClassId, onClose, onSave }: any) {
    const [subject, setSubject] = useState(initialData.subject || "");
    const [teacherId, setTeacherId] = useState(initialData.teacherId || "");

    // Conflict State
    const [checking, setChecking] = useState(false);
    const [conflict, setConflict] = useState<string | null>(null);

    // Initial check (if editing existing)
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

        // Auto-fill subject from teacher profile
        const teacher = staff.find((s: any) => s.id === tid);
        if (teacher && teacher.subjects) {
            // Take first subject if multiple (comma separated)
            const firstSubject = teacher.subjects.split(",")[0].trim();
            // Only auto-fill if subject is empty? Or always?
            // User requested "Show the Selected Teacher's Subject", usually implies override or set.
            setSubject(firstSubject);
        }
    };

    const handleSave = () => {
        if (conflict) {
            // Optional: Block save or just warn? User requirement: "We annot assign same teacher".
            // Blocking save seems appropriate.
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
                    {/* Subject Selector */}
                    <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">Subject</label>
                        {(() => {
                            const selectedTeacher = staff.find((s: any) => s.id === teacherId);
                            const availableSubjects = selectedTeacher?.subjects
                                ? selectedTeacher.subjects.split(",").map((s: any) => s.trim()).filter(Boolean)
                                : [];

                            // Determine if we should show dropdown
                            // Show dropdown if:
                            // 1. Teacher has subjects
                            // 2. AND (Subject is empty OR Subject is in the list)
                            // Otherwise allow custom input (unless user explicitly wants to switch back)

                            // We use a local state to track "mode" but to keep it simple without adding more useState hooks 
                            // inside this mapping (which is bad practice), we'll define the state above or use a simple conditional check based on value.
                            // Actually, adding state to the component is better.

                            // Since I cannot inject useState in the middle of this replace easily without rewriting the whole component,
                            // I will use a clever trick: Check if current 'subject' is in list. 
                            // If not in list (and not empty), assume custom.
                            // BUT user might want to select from list.

                            // Let's rewrite the component state in a previous step? 
                            // No, I can replace the whole CellEditor function start to add state.
                            // But for now, let's just stick to the Input if simple. 

                            // User asked for Dropdown. 
                            // I'll render a SELECT if availableSubjects.length > 0.
                            // And add an "Other" option.

                            if (availableSubjects.length > 0) {
                                // Check if current subject is custom (not in list and not empty)
                                const isCustomValue = subject && !availableSubjects.includes(subject);

                                if (isCustomValue) {
                                    return (
                                        <div className="relative">
                                            <input
                                                autoFocus
                                                className="w-full h-12 px-4 rounded-2xl bg-zinc-50 border-none font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all placeholder:text-zinc-300 pr-20"
                                                placeholder="e.g. Mathematics"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                            />
                                            <button
                                                onClick={() => setSubject(availableSubjects[0])}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                                            >
                                                Show List
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <select
                                        className="w-full h-12 px-4 rounded-2xl bg-zinc-50 border-none font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all appearance-none cursor-pointer"
                                        value={subject}
                                        onChange={(e) => {
                                            if (e.target.value === "___CUSTOM___") {
                                                setSubject("Custom Subject"); // Temporary placeholder or clear?
                                                // Ideally clear it so the input renders empty or with "Custom Subject"
                                                // But the logic above checks !includes(subject). 
                                                // So "Custom Subject" works if it's not in list.
                                            } else {
                                                setSubject(e.target.value);
                                            }
                                        }}
                                    >
                                        <option value="">Select Subject...</option>
                                        {availableSubjects.map((s: string) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                        <option value="___CUSTOM___" className="text-blue-600 font-bold">+ Other Subject</option>
                                    </select>
                                );
                            }

                            // Default Text Input (No subjects available)
                            return (
                                <input
                                    autoFocus
                                    className="w-full h-12 px-4 rounded-2xl bg-zinc-50 border-none font-bold text-sm focus:ring-2 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                                    placeholder="e.g. Mathematics"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            );
                        })()}
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
                                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Conflict Status */}
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
                        className="flex-[2] h-12 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-black text-xs uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-lg shadow-zinc-200"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
