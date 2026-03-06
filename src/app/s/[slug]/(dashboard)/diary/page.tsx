"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, BookOpen, MessageSquare, Bell, Clock, Edit2, Trash2 } from "lucide-react";
import { getDiaryEntriesAction, deleteDiaryEntryAction } from "@/app/actions/diary-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { toast } from "sonner";
import { DiaryEntryModal } from "@/components/diary/DiaryEntryModal";
import { getCookie } from "@/lib/cookies";
import { useConfirm } from "@/contexts/ConfirmContext";
import { SectionHeader, Btn } from "@/components/ui/erp-ui";

export default function DiaryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { confirm: confirmDialog } = useConfirm();

    const [selectedClass, setSelectedClass] = useState<string>("");
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");

    useEffect(() => { loadClassrooms(); }, [slug]);
    useEffect(() => { if (selectedClass) loadData(); }, [selectedClass, currentMonth]);

    async function loadClassrooms() {
        const res = await getClassroomsAction(slug);
        if (res.success) setClassrooms(res.data || []);
    }

    async function loadData(showLoader = true) {
        if (showLoader) setIsLoading(true);
        const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
        const academicYearId = getCookie(`academic_year_${slug}`) || undefined;
        const res = await getDiaryEntriesAction(slug, { classroomId: selectedClass, month: monthStr, academicYearId });
        if (res.success) { setEntries(res.data || []); }
        else { toast.error(res.error || "Failed to load diary entries"); }
        setIsLoading(false);
    }

    async function handleDelete(id: string) {
        const confirmed = await confirmDialog({ title: "Delete Entry", message: "Are you sure you want to delete this entry? This action cannot be undone.", variant: "danger", confirmText: "Delete", cancelText: "Cancel" });
        if (!confirmed) return;
        const res = await deleteDiaryEntryAction(slug, id);
        if (res.success) { toast.success("Entry deleted successfully"); loadData(false); }
        else { toast.error(res.error || "Failed to delete entry"); }
    }

    function handleEdit(entry: any) { setEditingEntry(entry); setIsModalOpen(true); }
    function handleAddEntry(dateStr: string) { setSelectedDate(dateStr); setEditingEntry(null); setIsModalOpen(true); }
    function handleModalClose() { setIsModalOpen(false); setEditingEntry(null); setSelectedDate(""); loadData(false); }
    function previousMonth() { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)); }
    function nextMonth() { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)); }

    const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    function getEntriesForDate(day: number) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return entries.filter(entry => {
            const entryDate = entry.scheduledFor || entry.publishedAt;
            if (!entryDate) return false;
            return new Date(entryDate).toISOString().split("T")[0] === dateStr;
        });
    }

    function getTypeIcon(type: string) {
        const s = { width: 12, height: 12 };
        switch (type) {
            case "HOMEWORK": return <BookOpen style={s} />;
            case "MESSAGE": return <MessageSquare style={s} />;
            case "ANNOUNCEMENT": return <Bell style={s} />;
            case "REMINDER": return <Clock style={s} />;
            default: return <BookOpen style={s} />;
        }
    }

    function getEntryColors(entry: any): { bg: string; text: string; border: string } {
        switch (entry.priority || "NORMAL") {
            case "URGENT": return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" };
            case "HIGH": return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
            case "LOW": return { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" };
            default: return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
        }
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const selectedClassroom = classrooms.find(c => c.id === selectedClass);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80 }}>
            <SectionHeader
                title="Class Diary"
                subtitle="Post homework, notes, and messages for students and parents"
                icon={BookOpen}
            />

            {!selectedClass ? (
                <div style={{ background: "white", borderRadius: 24, border: "1.5px solid #E5E7EB", padding: 48, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
                        <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(245,158,11,0.25)" }}>
                            <BookOpen style={{ width: 34, height: 34, color: "white" }} />
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#18181B", marginBottom: 8 }}>Select a Class</h2>
                        <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, marginBottom: 28 }}>Choose a class to view and manage diary entries</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                            {classrooms.map((classroom) => (
                                <button
                                    key={classroom.id}
                                    onClick={() => setSelectedClass(classroom.id)}
                                    style={{ background: "white", border: "2px solid #E5E7EB", borderRadius: 18, padding: "18px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 14 }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#F59E0B"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(245,158,11,0.12)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                                >
                                    <div style={{ width: 48, height: 48, background: "rgba(245,158,11,0.1)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <span style={{ fontSize: 20, fontWeight: 900, color: "#F59E0B" }}>{classroom.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 15, color: "#18181B" }}>{classroom.name}</div>
                                        <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>{classroom._count?.students || 0} students</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Selected Class Header */}
                    <div style={{ background: "white", borderRadius: 20, border: "1.5px solid #E5E7EB", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <button
                                onClick={() => setSelectedClass("")}
                                title="Back to classes"
                                style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #E5E7EB", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                            >
                                <ChevronLeft style={{ width: 18, height: 18, color: "#374151" }} />
                            </button>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 17, color: "#18181B" }}>{selectedClassroom?.name}</div>
                                <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>{selectedClassroom?._count?.students || 0} students</div>
                            </div>
                        </div>
                        {/* Month Navigation */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F9FAFB", borderRadius: 12, padding: "8px 12px" }}>
                            <button onClick={previousMonth} title="Previous month" style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ChevronLeft style={{ width: 16, height: 16, color: "#374151" }} />
                            </button>
                            <span style={{ fontWeight: 700, fontSize: 13, minWidth: 130, textAlign: "center", color: "#18181B" }}>{monthName}</span>
                            <button onClick={nextMonth} title="Next month" style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ChevronRight style={{ width: 16, height: 16, color: "#374151" }} />
                            </button>
                        </div>
                    </div>

                    {/* Calendar */}
                    {isLoading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320, background: "white", borderRadius: 24, border: "1.5px solid #E5E7EB" }}>
                            <div style={{ width: 36, height: 36, border: "3px solid #F3F4F6", borderTop: "3px solid #F59E0B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        </div>
                    ) : (
                        <div style={{ background: "white", borderRadius: 24, border: "1.5px solid #E5E7EB", padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                            {/* Weekday Headers */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 12 }}>
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                    <div key={day} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1.5, padding: "6px 0" }}>{day}</div>
                                ))}
                            </div>
                            {/* Calendar Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
                                {days.map((day, index) => {
                                    if (day === null) return <div key={`empty-${index}`} style={{ aspectRatio: "1" }} />;
                                    const dayEntries = getEntriesForDate(day);
                                    const isToday = isCurrentMonth && day === today.getDate();
                                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                    const dayDate = new Date(year, month, day);
                                    const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0);
                                    const isPast = dayDate < todayMidnight;

                                    return (
                                        <div
                                            key={day}
                                            style={{ position: "relative", aspectRatio: "1", border: `2px solid ${isToday ? "#F59E0B" : "#F3F4F6"}`, borderRadius: 16, padding: 10, background: isToday ? "rgba(245,158,11,0.04)" : isPast ? "#FAFAFA" : "white", overflow: "hidden" }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? "#F59E0B" : isPast ? "#D1D5DB" : "#374151" }}>{day}</span>
                                                {!isPast && (
                                                    <button
                                                        onClick={() => {
                                                            if (dayEntries.length >= 5) { toast.error("Maximum 5 entries allowed per day."); return; }
                                                            handleAddEntry(dateStr);
                                                        }}
                                                        disabled={dayEntries.length >= 5}
                                                        title={dayEntries.length >= 5 ? "Limit reached (Max 5)" : "Add entry"}
                                                        style={{ width: 22, height: 22, borderRadius: 7, border: "none", cursor: dayEntries.length >= 5 ? "not-allowed" : "pointer", background: dayEntries.length >= 5 ? "#E5E7EB" : "#F59E0B", color: dayEntries.length >= 5 ? "#9CA3AF" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                    >
                                                        <Plus style={{ width: 13, height: 13 }} />
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 3, overflowY: "auto", maxHeight: "calc(100% - 32px)" }}>
                                                {dayEntries.map((entry) => {
                                                    const colors = getEntryColors(entry);
                                                    return (
                                                        <div
                                                            key={entry.id}
                                                            onClick={() => handleEdit(entry)}
                                                            style={{ fontSize: 10, fontWeight: 700, padding: "4px 7px", borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, position: "relative" }}
                                                        >
                                                            {getTypeIcon(entry.type)}
                                                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{entry.title}</span>
                                                            {/* Hover actions */}
                                                            <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(2px)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: 0, transition: "opacity 0.15s" }}
                                                                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                                                                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "0"}
                                                            >
                                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(entry); }} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #E5E7EB", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }} title="Edit">
                                                                    <Edit2 style={{ width: 12, height: 12 }} />
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #FECACA", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }} title="Delete">
                                                                    <Trash2 style={{ width: 12, height: 12 }} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {isModalOpen && (
                <DiaryEntryModal
                    schoolSlug={slug}
                    classrooms={classrooms}
                    initialData={editingEntry}
                    selectedClassroomId={selectedClass}
                    selectedDate={selectedDate}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}
