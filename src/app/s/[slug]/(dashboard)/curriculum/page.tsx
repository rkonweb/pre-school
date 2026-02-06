"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Sparkles, FileText, FileUp, Video, Printer } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getCurriculumsAction, getDayCurriculumAction, getMonthCurriculumAction } from "@/app/actions/curriculum-actions";

const SecurePdfViewer = dynamic(() => import("@/components/curriculum/SecurePdfViewer"), { ssr: false });

interface Block {
    id: string;
    type: string;
    data: any;
}

export default function SchoolCurriculumPage() {
    const [view, setView] = useState<"classes" | "timeline" | "day">("classes");
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [curriculums, setCurriculums] = useState<any[]>([]);
    const [previewFile, setPreviewFile] = useState<{ name: string; url: string } | null>(null);

    useEffect(() => {
        const loadCurriculums = async () => {
            const result = await getCurriculumsAction();
            if (result.success) {
                setCurriculums(result.data || []);
            } else {
                toast.error("Failed to load curriculums");
            }
        };
        loadCurriculums();
    }, []);

    const getIcon = (slug: string) => {
        const icons: any = {
            playgroup: "🎈",
            nursery: "🌱",
            lkg: "📚",
            ukg: "🎓",
        };
        return icons[slug] || "📖";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30"
        >
            <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl print:hidden">
                <div className="flex items-center justify-between px-8 h-20">
                    <div className="flex items-center gap-4">
                        {view !== "classes" && (
                            <button
                                onClick={() => setView(view === "day" ? "timeline" : "classes")}
                                className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                CLASS <span className="text-zinc-400 font-medium">CURRICULUM</span>
                            </h1>
                            {selectedClass && (
                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600 mt-1">
                                    {selectedClass.name} {selectedDate && `• ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </p>
                            )}
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
                                <h2 className="text-4xl font-black tracking-tight mb-2 text-zinc-900">Academic <span className="text-zinc-300">Overview</span></h2>
                                <p className="text-zinc-500 text-lg">Select a class to view its daily curriculum and resources.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {curriculums.map((cls: any) => (
                                    <motion.button
                                        key={cls.id}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedClass(cls);
                                            setView("timeline");
                                        }}
                                        className="group relative h-80 rounded-[2.5rem] bg-white border border-zinc-100 p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all text-left"
                                    >
                                        <div
                                            className="absolute -top-24 -right-24 h-48 w-48 blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"
                                            style={{ backgroundColor: cls.color }}
                                        />
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-3xl mb-6 border border-zinc-100 group-hover:scale-110 transition-transform">
                                                {getIcon(cls.slug)}
                                            </div>
                                            <h3 className="text-2xl font-black text-zinc-900 mb-2">{cls.name}</h3>
                                            <p className="text-sm text-zinc-400 font-medium">{cls.description || "View curriculum"}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600">
                                            View Curriculum
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {view === "timeline" && selectedClass && (
                        <SchoolCalendarView
                            selectedClass={selectedClass}
                            onSelectDate={(date) => {
                                setSelectedDate(date);
                                setView("day");
                            }}
                        />
                    )}

                    {view === "day" && selectedClass && selectedDate && (
                        <SchoolDayViewer
                            selectedClass={selectedClass}
                            date={selectedDate}
                            onPreview={setPreviewFile}
                        />
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {previewFile && (
                    <SecurePdfViewer
                        file={previewFile}
                        onClose={() => setPreviewFile(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SchoolCalendarView({ selectedClass, onSelectDate }: any) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [curriculumData, setCurriculumData] = useState<any>({});

    useEffect(() => {
        const loadCalendar = async () => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const result = await getMonthCurriculumAction(selectedClass.id, startDate, endDate);
            if (result.success && result.data) {
                const dataMap: any = {};
                result.data.forEach((day: any) => {
                    const dateKey = new Date(day.date).toISOString().split('T')[0];
                    dataMap[dateKey] = { blocks: JSON.parse(day.blocks || '[]') };
                });
                setCurriculumData(dataMap);
            } else {
                toast.error("Failed to load calendar");
            }
        };
        loadCalendar();
    }, [selectedClass.id, currentMonth]);

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const hasCurriculum = (date: Date | null) => {
        if (!date) return false;
        const key = date.toISOString().split('T')[0];
        return curriculumData[key]?.blocks?.length > 0;
    };

    return (
        <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto"
        >
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-zinc-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
                <div className="grid grid-cols-7 gap-4 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-xs font-black uppercase tracking-widest text-zinc-400">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-4">
                    {getDaysInMonth().map((date, i) => (
                        <button
                            key={i}
                            onClick={() => date && hasCurriculum(date) && onSelectDate(date)}
                            disabled={!date || !hasCurriculum(date)}
                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${date && hasCurriculum(date)
                                ? 'bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 cursor-pointer'
                                : 'bg-zinc-50 border border-zinc-100 cursor-not-allowed opacity-50'
                                }`}
                        >
                            {date && (
                                <>
                                    <span className="text-lg font-black text-zinc-900">{date.getDate()}</span>
                                    {hasCurriculum(date) && (
                                        <Calendar className="h-3 w-3 text-blue-600 mt-1" />
                                    )}
                                </>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function SchoolDayViewer({ selectedClass, date, onPreview }: any) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [worksheets, setWorksheets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const result = await getDayCurriculumAction(selectedClass.id, date);
                if (result.success && result.data) {
                    setBlocks(JSON.parse(result.data.blocks || '[]'));
                    setYoutubeUrl(result.data.youtubeUrl || "");
                    setWorksheets(JSON.parse(result.data.worksheets || '[]'));
                } else {
                    setBlocks([]);
                    setYoutubeUrl("");
                    setWorksheets([]);
                }
            } catch {
                toast.error("Failed to load curriculum");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [selectedClass.id, date]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <motion.div
            key="day"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
        >
            <div className="flex items-center justify-between mb-8 print:hidden">
                <h2 className="text-3xl font-black text-zinc-900">
                    Daily Plan
                </h2>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 hover:bg-zinc-800 transition-all text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105"
                >
                    <Printer className="h-4 w-4" />
                    Print Plan
                </button>
            </div>

            <div id="curriculum-content-area" className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 print:border-none print:shadow-none print:p-0">
                <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-8 text-center print:block print:border-zinc-200">
                    <div className="text-left w-full">
                        <h1 className="text-2xl font-black text-zinc-900 mb-2">{selectedClass.name} Curriculum</h1>
                        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">
                            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {youtubeUrl && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50 print:hidden">
                            <img src={getYouTubeThumbnail(youtubeUrl) || ""} alt="Video" className="w-full h-full object-cover opacity-90" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl">
                                    <Video className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-white text-xs font-bold">
                                Video Resource Attached
                            </div>
                        </div>
                    )}

                    {blocks.map((block) => (
                        <ReadOnlyBlock key={block.id} block={block} />
                    ))}

                    {worksheets.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-zinc-100 break-before-avoid print:hidden">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                <FileUp className="h-4 w-4 text-emerald-600" />
                                Worksheets & Resources
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {worksheets.map((ws: any) => (
                                    <div key={ws.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 print:border-zinc-200">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-zinc-100">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900">{ws.name}</p>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{ws.size}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (ws.url) {
                                                    onPreview(ws);
                                                } else {
                                                    toast.error("File content missing. Please re-upload this worksheet in the Architect.");
                                                }
                                            }}
                                            className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-all print:hidden"
                                        >
                                            View Securely
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 15mm; }
                    body { -webkit-print-color-adjust: exact; font-size: 12px; }
                    
                    body * {
                        visibility: hidden;
                    }
                    
                    #curriculum-content-area,
                    #curriculum-content-area * {
                        visibility: visible;
                    }
                    
                    #curriculum-content-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        background: white !important;
                    }
                    
                    .print\\:hidden { display: none !important; }

                    .space-y-6 { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 1rem; 
                    }
                    .space-y-6 > .break-before-avoid {
                        grid-column: 1 / -1;
                    }
                    
                    .bg-white, .bg-zinc-50 { 
                        border: 1px solid #e5e7eb !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </motion.div>
    );
}

function ReadOnlyBlock({ block }: { block: Block }) {
    if (block.type === "timetable") {
        return (
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 break-inside-avoid">
                <div className="space-y-4">
                    {block.data.schedule.map((s: any, i: number) => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className="w-24 shrink-0 flex flex-col items-center justify-center bg-white rounded-xl py-2 border border-zinc-200/50">
                                <span className="text-[10px] font-black text-blue-600 uppercase">{s.startTime}</span>
                                <div className="h-3 w-[1px] bg-zinc-200 my-0.5" />
                                <span className="text-[10px] font-black text-zinc-400 uppercase">{s.endTime}</span>
                            </div>
                            <div className="flex-1 py-1">
                                <span className="text-sm font-bold text-zinc-900 block pt-1">{s.task}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 break-inside-avoid">
            {block.data.image && (
                <div className="h-48 w-full rounded-xl overflow-hidden mb-4 border border-zinc-200 shadow-sm print:h-auto">
                    <img src={block.data.image} alt="Header" className="w-full h-full object-cover" />
                </div>
            )}
            <h4 className="text-xl font-black mb-3 leading-tight text-zinc-900">{block.data.header}</h4>
            <div className="prose prose-sm prose-zinc max-w-none text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {block.data.text}
            </div>
        </div>
    );
}

function getYouTubeThumbnail(url: string) {
    if (!url) return null;
    const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}
