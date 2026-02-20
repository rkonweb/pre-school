"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Paperclip, ChevronDown, Search, Check, Users, User } from "lucide-react";
import { createDiaryEntryAction, updateDiaryEntryAction } from "@/app/actions/diary-actions";
import { getClassroomAction } from "@/app/actions/classroom-actions";
import { clearUserSessionAction } from "@/app/actions/session-actions";
import { toast } from "sonner";
import { getCookie } from "@/lib/cookies";
import { cn } from "@/lib/utils";

interface DiaryEntryModalProps {
    schoolSlug: string;
    classrooms: any[];
    initialData?: any;
    selectedClassroomId?: string;
    selectedDate?: string;
    onClose: () => void;
}

const PRIORITIES = [
    { value: "LOW", label: "Low", color: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" },
    { value: "NORMAL", label: "Normal", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
    { value: "HIGH", label: "High", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" },
    { value: "URGENT", label: "Urgent", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" }
];

export function DiaryEntryModal({ schoolSlug, classrooms, initialData, selectedClassroomId, selectedDate, onClose }: DiaryEntryModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Student Selection State
    const [students, setStudents] = useState<any[]>([]);
    const [isFetchingStudents, setIsFetchingStudents] = useState(false);
    const [studentSearch, setStudentSearch] = useState("");
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

    // Initial parsing of student IDs if editing
    const getInitialStudentIds = () => {
        if (initialData?.studentIds) {
            try {
                return typeof initialData.studentIds === 'string'
                    ? JSON.parse(initialData.studentIds)
                    : initialData.studentIds;
            } catch (e) { return []; }
        }
        return [];
    };

    // Helper to get initial scheduled date
    const getInitialScheduledFor = () => {
        if (initialData?.scheduledFor) {
            return new Date(initialData.scheduledFor).toISOString().slice(0, 16);
        }
        if (selectedDate) {
            const todayStr = new Date().toISOString().split("T")[0];
            if (selectedDate === todayStr) return "";
            return `${selectedDate}T09:00`;
        }
        return "";
    };

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        content: initialData?.content || "",
        type: initialData?.type || "NOTE",
        scheduledFor: getInitialScheduledFor(),
        classroomId: initialData?.classroomId || selectedClassroomId || "",
        priority: initialData?.priority || "NORMAL",
        requiresAck: initialData?.requiresAck || false,
        attachments: initialData?.attachments ? JSON.parse(initialData.attachments) : [],
        recipientType: initialData?.recipientType || "CLASS",
        studentIds: getInitialStudentIds() as string[]
    });

    // Fetch students when classroom changes
    useEffect(() => {
        const fetchStudents = async () => {
            if (!formData.classroomId) {
                setStudents([]);
                return;
            }

            setIsFetchingStudents(true);
            try {
                const res = await getClassroomAction(formData.classroomId);
                if (res.success && res.classroom) {
                    setStudents(res.classroom.students || []);
                }
            } catch (error) {
                console.error("Failed to fetch students", error);
                toast.error("Failed to load student list");
            } finally {
                setIsFetchingStudents(false);
            }
        };

        fetchStudents();
    }, [formData.classroomId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        // Validation
        if (formData.recipientType === "STUDENT" && formData.studentIds.length === 0) {
            toast.error("Please select at least one student");
            setIsLoading(false);
            return;
        }

        if (!initialData && formData.scheduledFor && new Date(formData.scheduledFor) < new Date()) {
            toast.error("Cannot schedule entries in the past");
            setIsLoading(false);
            return;
        }

        try {
            const data = {
                ...formData,
                schoolSlug,
                // Ensure correct types are sent
                recipientType: formData.recipientType as "CLASS" | "STUDENT",
                studentIds: formData.recipientType === "CLASS" ? [] : formData.studentIds,
                academicYearId: getCookie(`academic_year_${schoolSlug}`) || undefined
            };

            const res = initialData
                ? await updateDiaryEntryAction(schoolSlug, initialData.id, data)
                : await createDiaryEntryAction(data);

            if (res.success) {
                toast.success(initialData ? "Entry updated successfully" : "Entry created successfully");
                onClose();
            } else {
                if (res.error === "Unauthorized access to this school" || res.error === "Tenant mismatch") {
                    toast.error("Session mismatch detected. Refreshing...");
                    await clearUserSessionAction();
                    window.location.href = "/school-login";
                    return;
                }
                toast.error(res.error || "Failed to save entry");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    const toggleStudentSelection = (studentId: string) => {
        setFormData(prev => {
            const currentIds = prev.studentIds;
            if (currentIds.includes(studentId)) {
                return { ...prev, studentIds: currentIds.filter(id => id !== studentId) };
            } else {
                return { ...prev, studentIds: [...currentIds, studentId] };
            }
        });
    };

    const filteredStudents = students.filter(s =>
        s.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.lastName.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const selectedClassroom = classrooms.find(c => c.id === formData.classroomId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-zinc-100 bg-zinc-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                                {initialData ? "Edit Entry" : "New Diary Entry"}
                            </h2>
                            <p className="text-sm text-zinc-500 font-medium mt-1">
                                {selectedClassroom?.name || "Select a class"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Math Homework - Chapter 5"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-medium text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>

                    {/* Recipient Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-700">Recipients *</label>
                        <div className="flex bg-zinc-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, recipientType: "CLASS" })}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                                    formData.recipientType === "CLASS"
                                        ? "bg-white text-zinc-900 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <Users className="h-4 w-4" />
                                Entire Class
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, recipientType: "STUDENT" })}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
                                    formData.recipientType === "STUDENT"
                                        ? "bg-white text-zinc-900 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <User className="h-4 w-4" />
                                Specific Students
                            </button>
                        </div>

                        {/* Student Dropdown */}
                        {formData.recipientType === "STUDENT" && (
                            <div className="relative">
                                <div
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white font-medium text-sm cursor-pointer hover:border-zinc-300 flex items-center justify-between"
                                    onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                                >
                                    <span className={formData.studentIds.length === 0 ? "text-zinc-400" : "text-zinc-900"}>
                                        {formData.studentIds.length === 0
                                            ? "Select students..."
                                            : `${formData.studentIds.length} student${formData.studentIds.length > 1 ? 's' : ''} selected`
                                        }
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                                </div>

                                {isStudentDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-zinc-200 shadow-xl z-20 overflow-hidden">
                                        <div className="p-3 border-b border-zinc-100">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    value={studentSearch}
                                                    onChange={(e) => setStudentSearch(e.target.value)}
                                                    placeholder="Search students..."
                                                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 rounded-lg text-sm font-medium outline-none focus:bg-zinc-100"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                                            {isFetchingStudents ? (
                                                <div className="p-4 text-center text-zinc-400 text-sm">Loading students...</div>
                                            ) : filteredStudents.length === 0 ? (
                                                <div className="p-4 text-center text-zinc-400 text-sm">No students found</div>
                                            ) : (
                                                filteredStudents.map(student => {
                                                    const isSelected = formData.studentIds.includes(student.id);
                                                    return (
                                                        <div
                                                            key={student.id}
                                                            onClick={() => toggleStudentSelection(student.id)}
                                                            className={cn(
                                                                "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors",
                                                                isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-zinc-50 text-zinc-700"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black",
                                                                    isSelected ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-500"
                                                                )}>
                                                                    {student.firstName[0]}
                                                                </div>
                                                                <span className="text-sm font-bold">
                                                                    {student.firstName} {student.lastName}
                                                                </span>
                                                            </div>
                                                            {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Type & Priority */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-medium text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                            >
                                <option value="HOMEWORK">Homework</option>
                                <option value="NOTE">Note</option>
                                <option value="MESSAGE">Message</option>
                                <option value="ANNOUNCEMENT">Announcement</option>
                                <option value="REMINDER">Reminder</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Priority</label>
                            <div className="grid grid-cols-4 gap-2">
                                {PRIORITIES.map(priority => {
                                    const isSelected = formData.priority === priority.value;
                                    return (
                                        <button
                                            key={priority.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: priority.value })}
                                            className={cn(
                                                "h-11 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center transition-all border-2",
                                                priority.color,
                                                isSelected
                                                    ? "border-current opacity-100 ring-2 ring-offset-2 ring-blue-100 scale-105"
                                                    : "border-transparent bg-opacity-50 opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
                                            )}
                                            style={isSelected ? {} : { backgroundColor: '#f4f4f5', color: '#71717a', borderColor: 'transparent' }} // Inline override for unselected visual simplicity? Or rely on classes
                                        >
                                            {priority.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Content *</label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={5}
                            placeholder="Write your message here..."
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-medium text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                        />
                    </div>

                    {/* Scheduled For */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Schedule For (Optional)</label>
                        <input
                            type="datetime-local"
                            value={formData.scheduledFor}
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-medium text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                        <p className="text-xs text-zinc-500">Leave empty to publish immediately</p>
                    </div>

                    {/* Require Acknowledgment */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.requiresAck}
                            onChange={(e) => setFormData({ ...formData, requiresAck: e.target.checked })}
                            className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-sm font-medium text-zinc-700">Require parent acknowledgment</span>
                    </label>

                    {/* Attachments Placeholder */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Attachments</label>
                        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center">
                            <Paperclip className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                            <p className="text-sm text-zinc-400 font-medium">File upload coming soon</p>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border-2 border-zinc-200 font-bold text-sm text-zinc-700 hover:bg-zinc-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {initialData ? "Update Entry" : "Create Entry"}
                    </button>
                </div>
            </div>
        </div>
    );
}
