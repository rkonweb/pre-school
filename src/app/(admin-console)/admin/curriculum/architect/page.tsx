"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    ChevronLeft,
    Layout,
    Calendar as CalendarIcon,
    Clock,
    FileText,
    Image as ImageIcon,
    Video,
    FileUp,
    Save,
    Sparkles,
    ArrowRight,
    Search,
    Trash2,
    Eye,
    GripVertical,
    ChevronRight,
    ArrowLeft,
    Monitor
} from "lucide-react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isToday
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCurriculumsAction, getDayCurriculumAction, saveDayCurriculumAction, getMonthCurriculumAction } from "@/app/actions/curriculum-actions";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types
type ViewState = "classes" | "timeline" | "editor";

interface Block {
    id: string;
    type: "timetable" | "content";
    data: any;
}

export default function CurriculumArchitectPage() {
    const [view, setView] = useState<ViewState>("classes");
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [curriculums, setCurriculums] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCurriculums();
    }, []);

    async function loadCurriculums() {
        setIsLoading(true);
        const res = await getCurriculumsAction();
        if (res.success && res.data) setCurriculums(res.data);
        else setCurriculums([]);
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

    const displayCurriculums = curriculums.length > 0 ? curriculums : [
        { id: "playgroup", name: "Playgroup", color: "#00f2ff", slug: "playgroup", _count: { days: 45 } },
        { id: "nursery", name: "Nursery", color: "#bc00ff", slug: "nursery", _count: { days: 62 } },
        { id: "lkg", name: "LKG", color: "#00ff8c", slug: "lkg", _count: { days: 88 } },
        { id: "ukg", name: "UKG", color: "#ff0060", slug: "ukg", _count: { days: 32 } },
    ];

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
                <div className="flex items-center justify-between px-8 h-20">
                    <div className="flex items-center gap-4">
                        {view !== "classes" && (
                            <button
                                onClick={() => setView(view === "editor" ? "timeline" : "classes")}
                                className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                CURRICULUM <span className="text-zinc-400 font-medium">ARCHITECT</span>
                            </h1>
                            {selectedClass && (
                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600 mt-1">
                                    {selectedClass.name} {selectedDate && `• ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="h-10 px-5 rounded-xl bg-white border border-zinc-200 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all text-zinc-500">
                            Blueprints
                        </button>
                        <div className="h-8 w-[1px] bg-zinc-100 mx-2" />
                        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl p-1">
                            <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                Designer
                            </button>
                            <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600">
                                Teacher View
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-8">
                <AnimatePresence mode="wait">
                    {view === "classes" && (
                        <motion.div
                            key="classes"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-7xl mx-auto"
                        >
                            <div className="mb-12">
                                <h2 className="text-4xl font-black tracking-tight mb-2 text-zinc-900">Select Class <span className="text-zinc-300">Level</span></h2>
                                <p className="text-zinc-500 text-lg">Choose a division to architect its 15-day rolling timeline.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {displayCurriculums.map((cls: any) => (
                                    <motion.button
                                        key={cls.id}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedClass(cls);
                                            setView("timeline");
                                        }}
                                        className="group relative h-80 rounded-[2.5rem] bg-white border border-zinc-100 p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all"
                                    >
                                        {/* Glow Effect */}
                                        <div
                                            className="absolute -top-24 -right-24 h-48 w-48 blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"
                                            style={{ backgroundColor: cls.color }}
                                        />

                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-3xl mb-6 border border-zinc-100 group-hover:scale-110 transition-transform">
                                                {getIcon(cls.slug)}
                                            </div>
                                            <h3 className="text-2xl font-black mb-2 text-zinc-900">{cls.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Architecture</span>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="flex items-end justify-between mb-2">
                                                <span className="text-3xl font-black tracking-tighter text-zinc-900">{cls.completion || 0}%</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Completion</span>
                                            </div>
                                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${cls.completion || 0}%` }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: cls.color }}
                                                />
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {view === "timeline" && (
                        <CalendarView
                            selectedClass={selectedClass}
                            onSelectDate={(date: Date) => {
                                setSelectedDate(date);
                                setView("editor");
                            }}
                        />
                    )}

                    {view === "editor" && (
                        <DayEditor
                            selectedClass={selectedClass}
                            date={selectedDate!}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

// --- Calendar View ---
function CalendarView({ selectedClass, onSelectDate }: { selectedClass: any, onSelectDate: (d: Date) => void }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthData, setMonthData] = useState<any[]>([]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    useEffect(() => {
        loadMonthData();
    }, [currentMonth, selectedClass]);

    async function loadMonthData() {
        const res = await getMonthCurriculumAction(selectedClass.id, startDate, endDate);
        if (res.success && res.data) setMonthData(res.data);
        else setMonthData([]);
    }

    const dateFormat = "MMMM yyyy";
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getDayInfo = (date: Date) => {
        return monthData.find(d => isSameDay(new Date(d.date), date));
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col h-[calc(100vh-12rem)]"
        >
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-4xl font-black tracking-tight tracking-tighter uppercase text-zinc-900"> ARCHITECTURE <span className="text-zinc-300">CALENDAR</span></h2>
                    <p className="text-zinc-500 font-medium">Select any date to build {selectedClass.name} curriculum blocks.</p>
                </div>

                <div className="flex items-center gap-6 bg-white border border-zinc-200 p-2 rounded-2xl shadow-sm">
                    <button
                        onClick={prevMonth}
                        className="h-12 w-12 rounded-xl bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-all text-zinc-400 hover:text-zinc-900"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <span className="text-lg font-black uppercase tracking-widest min-w-[200px] text-center text-zinc-900">
                        {format(currentMonth, dateFormat)}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="h-12 w-12 rounded-xl bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-all text-zinc-400 hover:text-zinc-900"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-7 gap-px bg-zinc-100 border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="bg-zinc-50 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">
                        {d}
                    </div>
                ))}

                {allDays.map((d, i) => {
                    const isCurrentMonth = isSameMonth(d, monthStart);
                    const isTodayDate = isToday(d);
                    const dayInfo = getDayInfo(d);
                    const blocksCount = dayInfo ? JSON.parse(dayInfo.blocks).length : 0;

                    return (
                        <button
                            key={i}
                            onClick={() => onSelectDate(d)}
                            className={cn(
                                "relative group h-full min-h-[120px] bg-white p-6 transition-all hover:bg-blue-50/50 flex flex-col items-start justify-between border-r border-b border-zinc-100 last:border-r-0",
                                !isCurrentMonth && "opacity-20 pointer-events-none"
                            )}
                        >
                            <span className={cn(
                                "text-xl font-black tracking-tighter transition-all group-hover:scale-110",
                                isTodayDate ? "text-blue-600" : "text-zinc-900"
                            )}>
                                {format(d, "d")}
                            </span>

                            {isTodayDate && (
                                <div className="absolute top-6 right-6">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                                </div>
                            )}

                            <div className="w-full space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-500", blocksCount > 0 ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" : "bg-zinc-200")}
                                        style={{ width: blocksCount > 0 ? '100%' : '0%' }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest",
                                    blocksCount > 0 ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-500"
                                )}>
                                    {blocksCount > 0 ? `${blocksCount} Blocks Active` : 'No Architecture'}
                                </span>
                            </div>

                            {/* Hover Highlight */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/5 transition-all pointer-events-none" />
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}

// --- Day Editor ---
function DayEditor({ selectedClass, date }: { selectedClass: any, date: Date }) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [worksheets, setWorksheets] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [date]);

    async function loadData() {
        const res = await getDayCurriculumAction(selectedClass.id, date);
        if (res.success && res.data) {
            setBlocks(JSON.parse(res.data.blocks));
            setYoutubeUrl(res.data.youtubeUrl || "");
            setWorksheets(JSON.parse(res.data.worksheets || "[]"));
        } else {
            setBlocks([
                { id: "b1", type: "timetable", data: { schedule: [{ startTime: "09:00 AM", endTime: "09:30 AM", task: "Circle Time" }] } }
            ]);
            setYoutubeUrl("");
            setWorksheets([]);
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addBlock = (type: "timetable" | "content") => {
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            data: type === "timetable"
                ? { schedule: [{ startTime: "", endTime: "", task: "" }] }
                : { header: "", text: "", image: null }
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await saveDayCurriculumAction(selectedClass.id, date, blocks, youtubeUrl, worksheets);
        if (res.success) toast.success("Curriculum saved successfully");
        else toast.error("Failed to save");
        setIsSaving(false);
    };

    const [viewMode, setViewMode] = useState<"designer" | "teacher">("designer");

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-6xl mx-auto"
        >
            <div className="flex items-center justify-between mb-12 sticky top-24 z-40 py-4 bg-zinc-50/80 backdrop-blur-md">
                <div>
                    <h2 className="text-3xl font-black tracking-tight tracking-tighter uppercase leading-none text-zinc-900">
                        {viewMode === "designer" ? (
                            <>DAILY <span className="text-zinc-300">WORKSPACE</span></>
                        ) : (
                            <>APP <span className="text-zinc-300">PREVIEW</span></>
                        )}
                    </h2>
                    <p className="text-zinc-400 font-medium">Drafting for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white border border-zinc-200 shadow-sm rounded-2xl p-1.5 mr-4">
                        <button
                            onClick={() => setViewMode("designer")}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === "designer" ? "bg-zinc-100 text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Designer
                        </button>
                        <button
                            onClick={() => setViewMode("teacher")}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === "teacher" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Teacher App
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-8 rounded-2xl bg-zinc-900 text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Architecture
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-32">
                {/* Editor Area */}
                <div className={cn("space-y-8", viewMode === "designer" ? "lg:col-span-12" : "lg:col-span-7")}>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={blocks.map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {blocks.map((block, index) => (
                                <SortableBlock
                                    key={block.id}
                                    block={block}
                                    index={index}
                                    viewMode={viewMode}
                                    removeBlock={removeBlock}
                                    blocks={blocks}
                                    setBlocks={setBlocks}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    {viewMode === "designer" && (
                        <div className="flex justify-center pt-8">
                            <div className="bg-white border border-zinc-200 p-2 rounded-3xl flex gap-2 shadow-sm">
                                <button
                                    onClick={() => addBlock("timetable")}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all text-[10px] font-black uppercase tracking-widest text-zinc-900"
                                >
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    Timetable
                                </button>
                                <button
                                    onClick={() => addBlock("content")}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all text-[10px] font-black uppercase tracking-widest text-zinc-900"
                                >
                                    <FileText className="h-4 w-4 text-purple-600" />
                                    Content Block
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Preview Area */}
                {viewMode === "teacher" && (
                    <div className="lg:col-span-5 sticky top-52 h-[750px] bg-zinc-900 rounded-[3.5rem] border-[8px] border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="h-8 w-1/3 bg-zinc-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[1.5rem] z-20" />
                        <div className="flex-1 overflow-y-auto bg-white p-6 space-y-6 pt-12 no-scrollbar">
                            <div className="px-2">
                                <h1 className="text-2xl font-black mb-1 text-zinc-900">Today's Curriculum</h1>
                                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{selectedClass.name} • Blueprints</p>
                            </div>

                            {youtubeUrl && (
                                <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50">
                                    <img src={getYouTubeThumbnail(youtubeUrl) || ""} alt="Video" className="w-full h-full object-cover opacity-50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-2xl">
                                            <Video className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {blocks.map((b) => (
                                <div key={b.id} className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                                    {b.type === "timetable" ? (
                                        <div className="space-y-3">
                                            {b.data.schedule.map((s: any, i: number) => (
                                                <div key={i} className="flex flex-col">
                                                    <div className="flex items-center gap-1 text-[8px] font-black text-blue-600">
                                                        <span>{s.startTime}</span>
                                                        <span className="opacity-50">—</span>
                                                        <span>{s.endTime}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-zinc-900">{s.task}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            {b.data.image && (
                                                <div className="h-32 w-full rounded-xl overflow-hidden mb-3">
                                                    <img src={b.data.image} alt="Header" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <h4 className="text-lg font-black mb-2 leading-tight text-zinc-900">{b.data.header}</h4>
                                            <p className="text-sm text-zinc-500 leading-relaxed">{b.data.text}</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {worksheets.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 mt-4">Resources & Worksheets</h3>
                                    {worksheets.map((ws: any) => {
                                        const now = new Date();
                                        const diffTime = date.getTime() - now.getTime();
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        const isLocked = diffDays > 15;

                                        return (
                                            <div key={ws.id} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-900 line-clamp-1">{ws.name}</p>
                                                        <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">{ws.size}</p>
                                                    </div>
                                                </div>
                                                {isLocked ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="h-6 w-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-300">
                                                            <Clock className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="text-[6px] font-black uppercase tracking-widest text-zinc-300">Locked</span>
                                                    </div>
                                                ) : (
                                                    <button className="h-8 px-3 rounded-lg bg-emerald-500 text-[10px] font-black uppercase tracking-widest text-white">
                                                        Print
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="h-1 w-1/3 bg-zinc-400 absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full" />
                    </div>
                )}
            </div>

            {/* Media Stack & Worksheet */}
            <div className="mt-12 pt-12 border-t border-zinc-100 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <MediaStack youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} />

                    <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                            <FileUp className="h-4 w-4 text-emerald-600" />
                            Worksheet Module
                        </h3>
                        <div className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files || []);
                                        const processedFiles = await Promise.all(files.map(async (f) => {
                                            if (f.size > 2 * 1024 * 1024) {
                                                toast.error(`${f.name} is too large (>2MB).`);
                                                return null;
                                            }

                                            return new Promise((resolve) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    resolve({
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        name: f.name,
                                                        size: (f.size / 1024 / 1024).toFixed(2) + " MB",
                                                        uploadDate: new Date(),
                                                        url: reader.result // Save Data URL
                                                    });
                                                };
                                                reader.readAsDataURL(f);
                                            });
                                        }));

                                        const validFiles = processedFiles.filter(Boolean);
                                        setWorksheets([...worksheets, ...validFiles]);
                                        if (validFiles.length > 0) toast.success(`${validFiles.length} worksheet(s) uploaded`);
                                    }}
                                />
                                <div className="flex flex-col items-center justify-center h-48 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-8 group-hover:bg-zinc-100 group-hover:border-emerald-500 transition-all">
                                    <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600 transition-all group-hover:scale-110 shadow-sm">
                                        <FileUp className="h-8 w-8" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-900">Upload PDF Worksheet</p>
                                    <p className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-tight">15-Day Print Lock applies</p>
                                </div>
                            </div>

                            {worksheets.length > 0 && (
                                <div className="space-y-2">
                                    {worksheets.map((ws: any) => (
                                        <div key={ws.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-emerald-100/50 flex items-center justify-center text-emerald-600">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 line-clamp-1">{ws.name}</p>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{ws.size}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-[8px] font-black uppercase text-zinc-400">
                                                    Locked: 15 Days
                                                </div>
                                                <button
                                                    onClick={() => setWorksheets(worksheets.filter((w: any) => w.id !== ws.id))}
                                                    className="h-8 w-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div >
    );
}

// --- Helper Components & Logic ---

function getYouTubeThumbnail(url: string) {
    if (!url) return null;
    const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

function MediaStack({ youtubeUrl, setYoutubeUrl }: { youtubeUrl: string, setYoutubeUrl: (v: string) => void }) {
    const thumb = getYouTubeThumbnail(youtubeUrl);

    return (
        <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                <Video className="h-4 w-4 text-red-500" />
                Media Stack
            </h3>
            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 transition-all placeholder:text-zinc-400"
                        placeholder="YouTube Video URL..."
                    />
                    <Video className="absolute right-4 top-3.5 h-4 w-4 text-zinc-400" />
                </div>
                <div className="relative aspect-video bg-zinc-50 rounded-2xl flex items-center justify-center border border-dashed border-zinc-200 overflow-hidden group">
                    {thumb ? (
                        <>
                            <img src={thumb} alt="YouTube Thumbnail" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" />
                            <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                    <Video className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <Video className="h-8 w-8 text-zinc-200" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Video Preview</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SortableBlock({ block, index, viewMode, removeBlock, blocks, setBlocks }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("group relative", isDragging && "opacity-50 ring-2 ring-blue-600/50 rounded-[2rem]")}
        >
            {viewMode === "designer" && (
                <div className="absolute -left-12 top-4 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                        {...attributes}
                        {...listeners}
                        className="h-8 w-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 cursor-grab active:cursor-grabbing shadow-sm"
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => removeBlock(block.id)}
                        className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className={cn(
                "transition-all",
                viewMode === "designer"
                    ? "bg-white border border-zinc-100 rounded-[2rem] p-10 hover:border-blue-100 shadow-sm"
                    : "bg-zinc-50 border border-zinc-100 rounded-[1.5rem] p-8"
            )}>
                {block.type === "timetable" ? (
                    <TimetableBlock data={block.data} readOnly={viewMode === "teacher"} onChange={(d) => {
                        const newBlocks = [...blocks];
                        newBlocks[index].data = d;
                        setBlocks(newBlocks);
                    }} />
                ) : (
                    <ContentBlock data={block.data} readOnly={viewMode === "teacher"} onChange={(d) => {
                        const newBlocks = [...blocks];
                        newBlocks[index].data = d;
                        setBlocks(newBlocks);
                    }} />
                )}
            </div>
        </motion.div>
    );
}

// --- Block Components ---

function TimetableBlock({ data, onChange, readOnly }: { data: any, onChange: (d: any) => void, readOnly?: boolean }) {
    const addRow = () => onChange({ schedule: [...data.schedule, { startTime: "", endTime: "", task: "" }] });
    const updateRow = (i: number, field: string, val: string) => {
        const newSchedule = [...data.schedule];
        newSchedule[i][field] = val;
        onChange({ schedule: newSchedule });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600/60 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session Timetable
            </h3>
            <div className="space-y-4">
                {data.schedule.map((row: any, i: number) => (
                    <div key={i} className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex gap-2">
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 block px-1">Start</span>
                                <input
                                    type="text"
                                    disabled={readOnly}
                                    value={row.startTime}
                                    onChange={(e) => updateRow(i, "startTime", e.target.value)}
                                    className="w-28 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 transition-all disabled:opacity-80 text-zinc-900"
                                    placeholder="09:00 AM"
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block px-1">End</span>
                                <input
                                    type="text"
                                    disabled={readOnly}
                                    value={row.endTime}
                                    onChange={(e) => updateRow(i, "endTime", e.target.value)}
                                    className="w-28 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 transition-all disabled:opacity-80 text-zinc-900"
                                    placeholder="09:30 AM"
                                />
                            </div>
                        </div>
                        <div className="flex-1 w-full space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block px-1">Activity / Task</span>
                            <input
                                type="text"
                                disabled={readOnly}
                                value={row.task}
                                onChange={(e) => updateRow(i, "task", e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-600 transition-all disabled:opacity-80 text-zinc-900"
                                placeholder="Task Name..."
                            />
                        </div>
                    </div>
                ))}
                {!readOnly && (
                    <button
                        onClick={addRow}
                        className="w-full py-3 rounded-xl border border-dashed border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 hover:border-blue-600 transition-all"
                    >
                        + Add New Slot
                    </button>
                )}
            </div>
        </div>
    );
}

function ContentBlock({ data, onChange, readOnly }: { data: any, onChange: (d: any) => void, readOnly?: boolean }) {
    const layout = data.layout || "top";

    return (
        <div className="space-y-6">
            {!readOnly && (
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div className="flex gap-1">
                        <button className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all font-serif font-bold">B</button>
                        <button className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all italic font-serif">I</button>
                        <button className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-xs font-bold">•</button>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-lg p-1">
                        {["top", "left", "right"].map((l) => (
                            <button
                                key={l}
                                onClick={() => onChange({ ...data, layout: l })}
                                className={cn(
                                    "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                                    layout === l ? "bg-white text-blue-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className={cn(
                "flex gap-8",
                layout === "top" ? "flex-col" : layout === "right" ? "flex-row-reverse" : "flex-row"
            )}>
                <div className="flex-1 space-y-4">
                    <input
                        type="text"
                        disabled={readOnly}
                        value={data.header}
                        onChange={(e) => onChange({ ...data, header: e.target.value })}
                        className="w-full bg-transparent border-none text-2xl font-black p-0 outline-none placeholder:text-zinc-200 text-zinc-900 disabled:opacity-80"
                        placeholder="Enter Block Header..."
                    />
                    <textarea
                        value={data.text}
                        disabled={readOnly}
                        onChange={(e) => onChange({ ...data, text: e.target.value })}
                        className="w-full bg-transparent border-none text-zinc-500 text-lg leading-relaxed p-0 outline-none resize-none h-48 placeholder:text-zinc-200 disabled:opacity-80"
                        placeholder="Describe the teaching content, stories, or activities here..."
                    />
                </div>

                <div className={cn(
                    "flex-shrink-0",
                    layout === "top" ? "w-full" : "w-64"
                )}>
                    {!readOnly && (
                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => onChange({ ...data, image: ev.target?.result });
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <div className={cn(
                                "bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 group-hover:bg-zinc-100 group-hover:border-blue-600 transition-all overflow-hidden relative shadow-sm",
                                layout === "top" ? "h-64" : "h-48"
                            )}>
                                {data.image ? (
                                    <>
                                        <img src={data.image} alt="Upload" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <ImageIcon className="h-6 w-6 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="h-6 w-6 text-zinc-200 group-hover:text-blue-600 transition-all" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-zinc-400">Image Drop</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    {readOnly && data.image && (
                        <div className={cn(
                            "rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm",
                            layout === "top" ? "h-64 w-full" : "h-48 w-64"
                        )}>
                            <img src={data.image} alt="Content" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
