"use client";

import { useState, useEffect } from "react";
import {
    ChevronLeft,
    Sparkles,
    Save,
    Pencil,
    Trash2,
    Plus,
    X,
    Loader2,
    CheckCircle2,
    Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    getCurriculumsAction,
    getAcademicMonthsAction,
    getAcademicDayAction,
    saveAcademicDayAction,
    initializeAcademicStructureAction,
    createCurriculumAction,
    updateCurriculumAction,
    deleteCurriculumAction,
    uploadWorksheetAction
} from "@/app/actions/curriculum-actions";
import AIPageBuilder from "@/components/curriculum/AIPageBuilder";
import { WorksheetManager } from "@/components/curriculum/WorksheetManager";

// Types
type ViewState = "classes" | "months" | "days" | "editor";

interface Curriculum {
    id: string;
    name: string;
    slug: string;
    color: string | null;
}

interface AcademicMonth {
    id: string;
    monthNumber: number;
    title: string;
    description: string | null;
    theme: string | null;
    days: AcademicDay[];
}

interface AcademicDay {
    id: string;
    dayNumber: number;
    title: string | null;
    theme: string | null;
    blocks: string;
    isCompleted: boolean;
}

export default function CurriculumArchitectPage() {
    const [view, setView] = useState<ViewState>("classes");
    const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<AcademicMonth | null>(null);
    const [selectedDay, setSelectedDay] = useState<AcademicDay | null>(null);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [months, setMonths] = useState<AcademicMonth[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCurriculums();
    }, []);

    async function loadCurriculums() {
        setIsLoading(true);
        const res = await getCurriculumsAction();
        if (res.success && res.data) {
            setCurriculums(res.data as any);
        }
        setIsLoading(false);
    }

    async function loadMonths(curriculumId: string) {
        setIsLoading(true);
        const res = await getAcademicMonthsAction(curriculumId);
        if (res.success && res.data) {
            if (res.data.length === 0) {
                await initializeAcademicStructureAction(curriculumId);
                const retryRes = await getAcademicMonthsAction(curriculumId);
                if (retryRes.success && retryRes.data) {
                    setMonths(retryRes.data as any);
                }
            } else {
                setMonths(res.data as any);
            }
        }
        setIsLoading(false);
    }

    const getIcon = (slug: string) => {
        const icons: any = {
            playgroup: "🍼",
            nursery: "🎨",
            lkg: "📚",
            ukg: "🎓"
        };
        return icons[slug] || "📖";
    };

    return (
        <div className="min-h-screen bg-[#FAFCFF] text-[#0C3449] relative">
            {/* Background Aesthetic Blobs */}
            <div className="fixed -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/40 blur-[120px] rounded-full animate-pulse pointer-events-none -z-10" />
            <div className="fixed top-[20%] -right-[10%] w-[30%] h-[50%] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed -bottom-[10%] left-[20%] w-[50%] h-[30%] bg-rose-50/30 blur-[120px] rounded-full animate-pulse pointer-events-none -z-10" />

            <header className="sticky top-6 z-50 mx-auto max-w-7xl px-4 pointer-events-none">
                <div className="pointer-events-auto h-20 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center justify-between px-8 ring-1 ring-black/5">
                    <div className="flex items-center gap-6">
                        {view !== "classes" && (
                            <button
                                onClick={() => {
                                    if (view === "editor") setView("days");
                                    else if (view === "days") setView("months");
                                    else if (view === "months") setView("classes");
                                }}
                                className="h-12 w-12 rounded-2xl bg-white border border-zinc-200/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-zinc-600 shadow-xl hover:shadow-indigo-100"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-white">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 italic uppercase">
                                    <span className="text-zinc-900">Curriculum</span>
                                    <span className="text-indigo-600">Architect</span>
                                </h1>
                                {selectedCurriculum && (
                                    <div className="flex items-center gap-2 overflow-hidden max-w-[400px]">
                                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400 whitespace-nowrap">
                                            {selectedCurriculum.name}
                                            {selectedMonth && <span className="text-zinc-300 mx-2">/</span>}
                                            {selectedMonth && selectedMonth.title}
                                            {selectedDay && <span className="text-zinc-300 mx-2">/</span>}
                                            {selectedDay && `Day ${selectedDay.dayNumber}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="h-10 px-4 rounded-full bg-indigo-50 border border-indigo-100/50 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Design Mode Active</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-8">
                <AnimatePresence>
                    {view === "classes" && (
                        <ClassSelectionView
                            curriculums={curriculums}
                            isLoading={isLoading}
                            getIcon={getIcon}
                            onSelectCurriculum={(curriculum) => {
                                setSelectedCurriculum(curriculum);
                                loadMonths(curriculum.id);
                                setView("months");
                            }}
                        />
                    )}

                    {view === "months" && selectedCurriculum && (
                        <MonthOverviewView
                            curriculum={selectedCurriculum}
                            months={months}
                            isLoading={isLoading}
                            onSelectMonth={(month) => {
                                setSelectedMonth(month);
                                setView("days");
                            }}
                        />
                    )}

                    {view === "days" && selectedMonth && (
                        <DayGridView
                            month={selectedMonth}
                            onSelectDay={(day) => {
                                setSelectedDay(day);
                                setView("editor");
                            }}
                        />
                    )}

                    {view === "editor" && selectedMonth && selectedDay && (
                        <DayEditorView
                            month={selectedMonth}
                            day={selectedDay}
                            onSave={() => {
                                toast.success("Day saved successfully!");
                                setView("days");
                                loadMonths(selectedCurriculum!.id);
                            }}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function ClassSelectionView({
    curriculums,
    isLoading,
    getIcon,
    onSelectCurriculum
}: {
    curriculums: Curriculum[];
    isLoading: boolean;
    getIcon: (slug: string) => string;
    onSelectCurriculum: (curriculum: Curriculum) => void;
}) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
    const [formData, setFormData] = useState({ name: "", color: "#2D9CB8" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        setIsSubmitting(true);
        const res = await createCurriculumAction(formData.name, formData.color);
        setIsSubmitting(false);
        if (res.success) {
            toast.success("Class created successfully!");
            window.location.reload();
        } else {
            toast.error(res.error || "Failed to create class");
        }
    };

    const handleUpdate = async () => {
        if (!editingCurriculum) return;
        setIsSubmitting(true);
        const res = await updateCurriculumAction(editingCurriculum.id, formData.name, formData.color);
        setIsSubmitting(false);
        if (res.success) {
            toast.success("Class updated successfully!");
            window.location.reload();
        } else {
            toast.error(res.error || "Failed to update class");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure?")) return;
        const res = await deleteCurriculumAction(id);
        if (res.success) window.location.reload();
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-[#2D9CB8]" /></div>;

    return (
        <motion.div {...{ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, scale: 0.95 }, className: "max-w-7xl mx-auto pt-10" } as any}>
            <div className="mb-16 text-center space-y-4">
                <motion.div
                    {...{
                        initial: { scale: 0.9, opacity: 0 },
                        animate: { scale: 1, opacity: 1 },
                        className: "inline-block px-6 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em]"
                    } as any}
                >
                    Academic Excellence
                </motion.div>
                <h2 className="text-7xl font-black tracking-tighter text-zinc-900 italic uppercase">
                    Select <span className="text-indigo-600">Level</span>
                </h2>
                <p className="text-zinc-500 font-bold text-lg uppercase tracking-widest max-w-2xl mx-auto">
                    Choose a curriculum to design its 10-month professional structure.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {curriculums.map((curriculum, idx) => (
                    <motion.div
                        key={curriculum.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        {...{
                            whileHover: { y: -12, scale: 1.02 },
                            whileTap: { scale: 0.98 },
                            onClick: () => onSelectCurriculum(curriculum),
                            className: "group relative h-[420px] rounded-[3rem] bg-white border border-zinc-100 p-10 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200 transition-all cursor-pointer"
                        } as any}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="h-32 w-32 text-indigo-600" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div
                                className="h-24 w-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl ring-8 ring-white"
                                style={{ background: `linear-gradient(135deg, ${curriculum.color || '#6366f1'} 0%, white 200%)` }}
                            >
                                {getIcon(curriculum.slug)}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-4xl font-black text-zinc-900 tracking-tighter leading-none italic uppercase">
                                    {curriculum.name}
                                </h3>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                    Full Academic Year
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-2">
                            <div className="flex-1 h-3 rounded-full bg-zinc-50 border border-zinc-100 overflow-hidden">
                                <motion.div
                                    {...{
                                        initial: { width: 0 },
                                        animate: { width: '65%' },
                                        className: "h-full bg-indigo-500 rounded-full"
                                    } as any}
                                />    </div>
                            <span className="text-[10px] font-black text-zinc-400">65%</span>
                        </div>
                    </motion.div>
                ))}

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: curriculums.length * 0.1 }}
                    {...{
                        whileHover: { y: -12, scale: 1.02 },
                        whileTap: { scale: 0.98 },
                        onClick: () => setIsCreateModalOpen(true),
                        className: "h-[420px] rounded-[3rem] border-4 border-dashed border-zinc-100 p-10 flex flex-col items-center justify-center gap-6 text-zinc-300 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                    } as any}
                >
                    <div className="h-20 w-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-xl transition-all">
                        <Plus className="h-10 w-10" />
                    </div>
                    <span className="text-xl font-black uppercase italic tracking-tighter">Add New Class</span>
                </motion.button>
            </div>
        </motion.div>
    );
}

function MonthOverviewView({
    curriculum,
    months,
    isLoading,
    onSelectMonth
}: {
    curriculum: Curriculum;
    months: AcademicMonth[];
    isLoading: boolean;
    onSelectMonth: (month: AcademicMonth) => void;
}) {
    if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>;

    return (
        <motion.div {...{ initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -50 }, className: "max-w-7xl mx-auto pt-10" } as any}>
            <div className="mb-16 flex items-end justify-between">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Comprehensive Roadmap</p>
                    <h2 className="text-6xl font-black tracking-tighter text-zinc-900 italic uppercase">
                        Structure <span className="text-indigo-600">Overview</span>
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {months.map((month, idx) => {
                    const completedDays = month.days.filter(d => d.isCompleted).length;
                    const progress = (completedDays / 20) * 100;

                    return (
                        <motion.button
                            key={month.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            {...{
                                whileHover: { y: -8, scale: 1.02 },
                                whileTap: { scale: 0.98 },
                                onClick: () => onSelectMonth(month),
                                className: "group relative bg-white border border-zinc-100 rounded-[2.5rem] p-8 hover:border-indigo-200 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-indigo-100/50 text-left overflow-hidden ring-1 ring-black/[0.02]"
                            } as any}
                        >
                            <div className="absolute -top-10 -right-10 h-32 w-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex items-start justify-between mb-6">
                                <div className="h-12 w-12 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 shadow-inner group-hover:bg-indigo-600 transition-colors duration-500">
                                    <span className="text-xl font-black text-zinc-400 group-hover:text-white transition-colors">{month.monthNumber}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-zinc-900 tracking-tighter">{Math.round(progress)}%</span>
                                    <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">Complete</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-zinc-900 mb-4 tracking-tighter leading-tight italic uppercase group-hover:text-indigo-600 transition-colors h-14 line-clamp-2">
                                {month.title}
                            </h3>

                            <div className="h-3 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100 p-[2px]">
                                <motion.div
                                    {...{
                                        initial: { width: 0 },
                                        animate: { width: `${progress}%` },
                                        className: "h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full relative"
                                    } as any}
                                >
                                    <div className="absolute top-0 right-0 h-full w-8 bg-white/20 blur-[2px]" />
                                </motion.div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}

function DayGridView({
    month,
    onSelectDay
}: {
    month: AcademicMonth;
    onSelectDay: (day: AcademicDay) => void;
}) {
    return (
        <motion.div {...{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "max-w-7xl mx-auto pt-10" } as any}>
            <div className="mb-16 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div className="h-[2px] w-12 bg-indigo-100" />
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Daily Architect</p>
                </div>
                <h2 className="text-7xl font-black tracking-tighter text-zinc-900 italic uppercase">
                    {month.title.split(':')[0]} <span className="text-indigo-600 italic">Days</span>
                </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {month.days.map((day, idx) => (
                    <motion.button
                        key={day.id}
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.01 }}
                        {...{
                            whileHover: { y: -4, scale: 1.05 },
                            whileTap: { scale: 0.95 },
                            onClick: () => onSelectDay(day),
                            className: cn(
                                "group relative h-32 rounded-[1.5rem] p-5 flex flex-col justify-between transition-all shadow-sm border",
                                day.isCompleted
                                    ? "bg-indigo-600 border-indigo-600 shadow-indigo-100"
                                    : "bg-white border-zinc-100 hover:border-indigo-200"
                            )
                        } as any}
                    >
                        {day.isCompleted && (
                            <div className="absolute top-0 right-0 p-3">
                                <CheckCircle2 className="h-4 w-4 text-white/50" />
                            </div>
                        )}

                        <span className={cn(
                            "text-3xl font-black tracking-tighter italic",
                            day.isCompleted ? "text-white" : "text-zinc-900 group-hover:text-indigo-600 transition-colors"
                        )}>
                            {day.dayNumber}
                        </span>

                        <div className="flex flex-col gap-0.5">
                            <span className={cn(
                                "text-[7px] font-black uppercase tracking-widest leading-none",
                                day.isCompleted ? "text-indigo-200" : "text-zinc-400"
                            )}>
                                {day.isCompleted ? "Done" : "Draft"}
                            </span>
                        </div>

                        <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                            <Sparkles className={cn(
                                "h-12 w-12",
                                day.isCompleted ? "text-white" : "text-indigo-600"
                            )} />
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}

function DayEditorView({
    month,
    day,
    onSave
}: {
    month: AcademicMonth;
    day: AcademicDay;
    onSave: () => void;
}) {
    const [dayTitle, setDayTitle] = useState(day.title || "");
    const [dayTheme, setDayTheme] = useState(day.theme || "");
    const [worksheets, setWorksheets] = useState<any[]>(day.worksheets ? (typeof day.worksheets === 'string' ? JSON.parse(day.worksheets) : day.worksheets) : []);
    const [isSaving, setIsSaving] = useState(false);

    const handleWorksheetUpload = async (base64: string, name: string, type: string) => {
        const pathParts = ['Curriculum', `Month ${month.monthNumber}`, `Day ${day.dayNumber}`];
        return await uploadWorksheetAction(base64, name, type, pathParts);
    };

    const handleAISave = async (html: string) => {
        setIsSaving(true);
        const saveToast = toast.loading("Saving academic day...");
        console.log("[Save] Starting save for month:", month.id, "day:", day.dayNumber);

        try {
            const blocks: any[] = [
                {
                    id: 'ai-content',
                    type: 'content',
                    data: { html }
                }
            ];

            const res = await saveAcademicDayAction(
                month.id,
                day.dayNumber,
                dayTitle || `Day ${day.dayNumber}`,
                dayTheme,
                blocks,
                worksheets,
                null
            );

            console.log("[Save] Response:", res);

            if (res.success) {
                toast.success("Day saved successfully!", { id: saveToast });
                onSave();
            } else {
                toast.error(res.error || "Failed to save", { id: saveToast });
            }
        } catch (error: any) {
            console.error("[Save] Catch Error:", error);
            toast.error("An error occurred while saving: " + error.message, { id: saveToast });
        } finally {
            setIsSaving(false);
        }
    };

    let initialHTML = "";
    try {
        const blocks = JSON.parse(day.blocks || "[]");
        initialHTML = blocks.find((b: any) => b.type === 'content')?.data?.html || "";
    } catch (e) { }

    return (
        <motion.div {...{ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, className: "space-y-12 max-w-7xl mx-auto pt-10" } as any}>
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[3.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col gap-8 bg-white border border-zinc-100 rounded-[3rem] p-12 shadow-2xl shadow-indigo-100/20 ring-1 ring-black/[0.02]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Pencil className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Archiving Knowledge</span>
                            </div>
                            <input
                                type="text"
                                value={dayTitle}
                                onChange={(e) => setDayTitle(e.target.value)}
                                placeholder={`Day ${day.dayNumber} Title...`}
                                className="text-6xl font-black text-zinc-900 bg-transparent border-none outline-none w-full placeholder:text-zinc-100 tracking-tighter italic uppercase leading-tight"
                            />
                            <div className="flex items-center gap-4">
                                <div className="flex-1 max-w-md relative group/input">
                                    <input
                                        type="text"
                                        value={dayTheme}
                                        onChange={(e) => setDayTheme(e.target.value)}
                                        placeholder="Theme (optional)..."
                                        className="text-sm text-zinc-400 bg-zinc-50/50 rounded-xl px-4 py-2 border border-zinc-100 outline-none w-full placeholder:text-zinc-200 font-bold uppercase tracking-widest focus:border-indigo-200 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="p-8 rounded-[2rem] bg-indigo-50/30 border border-indigo-100/30 text-center space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Day Priority</p>
                                <div className="flex items-center gap-1 justify-center">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={cn("h-1.5 w-4 rounded-full", i <= 3 ? "bg-indigo-500" : "bg-indigo-100")} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-32">
                <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-50/50 rounded-[4rem] blur-xl -z-10" />
                    <AIPageBuilder
                        initialContent={initialHTML}
                        onSave={handleAISave}
                        isSaving={isSaving}
                    />
                </div>

                <div className="mt-12">
                    <WorksheetManager
                        worksheets={worksheets}
                        onChange={setWorksheets}
                        onFileUpload={handleWorksheetUpload}
                    />
                </div>
            </div>
        </motion.div>
    );
}
