"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Paperclip } from "lucide-react";
import { createDiaryEntryAction, updateDiaryEntryAction } from "@/app/actions/diary-actions";
import { toast } from "sonner";
import { getCookie } from "@/lib/cookies";

interface DiaryEntryModalProps {
    schoolSlug: string;
    classrooms: any[];
    initialData?: any;
    selectedClassroomId?: string;
    selectedDate?: string;
    onClose: () => void;
}

export function DiaryEntryModal({ schoolSlug, classrooms, initialData, selectedClassroomId, selectedDate, onClose }: DiaryEntryModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Helper to get initial scheduled date
    const getInitialScheduledFor = () => {
        if (initialData?.scheduledFor) {
            return new Date(initialData.scheduledFor).toISOString().slice(0, 16);
        }
        if (selectedDate) {
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
        attachments: initialData?.attachments ? JSON.parse(initialData.attachments) : []
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        // Only restrict past dates for new entries
        if (!initialData && formData.scheduledFor && new Date(formData.scheduledFor) < new Date()) {
            toast.error("Cannot schedule entries in the past");
            setIsLoading(false);
            return;
        }

        try {
            const data = {
                ...formData,
                schoolSlug,
                recipientType: "CLASS" as const, // Always send to entire class
                studentIds: [], // Not needed for CLASS type
                academicYearId: getCookie(`academic_year_${schoolSlug}`) || undefined
            };

            const res = initialData
                ? await updateDiaryEntryAction(initialData.id, data)
                : await createDiaryEntryAction(data);

            if (res.success) {
                toast.success(initialData ? "Entry updated successfully" : "Entry created successfully");
                onClose();
            } else {
                toast.error(res.error || "Failed to save entry");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

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

                    {/* Type & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-medium text-sm focus:ring-2 focus:ring-blue-600 outline-none"
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
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-medium text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                            >
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
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
                            className="w-4 h-4"
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
