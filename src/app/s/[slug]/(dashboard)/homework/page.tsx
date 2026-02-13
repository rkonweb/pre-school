"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Video, Mic, FileText, Calendar, Clock, Users, User, Send,
    Sparkles, Upload, X, Check, Eye, Star, Award, ThumbsUp, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import {
    createHomeworkAction,
    getSchoolHomeworkAction,
    getHomeworkSubmissionsAction,
    gradeSubmissionAction,
    getHomeworkTemplatesAction
} from "@/app/actions/homework-actions";
import { getCookie } from "@/lib/cookies";

export default function HomeworkPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [schoolData, setSchoolData] = useState<any>(null);
    const [homework, setHomework] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showBuilder, setShowBuilder] = useState(false);
    const [selectedHomework, setSelectedHomework] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [slug]);

    const loadData = async () => {
        setIsLoading(true);
        const schoolRes = await getSchoolSettingsAction(slug);
        if (schoolRes.success && schoolRes.data) {
            setSchoolData(schoolRes.data);
            const academicYearId = getCookie(`academic_year_${slug}`) || undefined;
            const [homeworkRes, templatesRes] = await Promise.all([
                getSchoolHomeworkAction(schoolRes.data.id, undefined, academicYearId),
                getHomeworkTemplatesAction()
            ]);
            if (homeworkRes.success) setHomework(homeworkRes.data || []);
            if (templatesRes.success) setTemplates(templatesRes.data || []);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-blue-900 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-brand" />
                            Homework & Activities
                        </h1>
                        <p className="text-zinc-400 mt-2 font-medium">Create engaging tasks and track student progress</p>
                    </div>
                    <button
                        onClick={() => setShowBuilder(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-brand text-white rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl hover:scale-105"
                    >
                        <Plus className="h-5 w-5" />
                        Create Homework
                    </button>
                </div>
            </div>

            {/* Homework Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homework.map((hw) => (
                    <HomeworkCard
                        key={hw.id}
                        homework={hw}
                        onClick={() => setSelectedHomework(hw)}
                    />
                ))}
            </div>

            {homework.length === 0 && (
                <div className="max-w-7xl mx-auto text-center py-20">
                    <div className="h-24 w-24 bg-zinc-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-700">
                        <FileText className="h-12 w-12 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-lg font-bold">No homework created yet</p>
                    <p className="text-zinc-600 text-sm mt-2">Click "Create Homework" to get started</p>
                </div>
            )}

            {/* Homework Builder Modal */}
            <HomeworkBuilder
                isOpen={showBuilder}
                onClose={() => setShowBuilder(false)}
                schoolData={schoolData}
                templates={templates}
                onSuccess={loadData}
            />

            {/* Submission Review Modal */}
            {selectedHomework && (
                <SubmissionReview
                    homework={selectedHomework}
                    onClose={() => setSelectedHomework(null)}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}

function HomeworkCard({ homework, onClick }: any) {
    const [stats, setStats] = useState({ total: 0, submitted: 0, reviewed: 0 });

    useEffect(() => {
        loadStats();
    }, [homework.id]);

    const loadStats = async () => {
        const res = await getHomeworkSubmissionsAction(homework.id);
        if (res.success && res.data) {
            const total = res.data.length;
            const submitted = res.data.filter((s: any) => s.isSubmitted).length;
            const reviewed = res.data.filter((s: any) => s.isReviewed).length;
            setStats({ total, submitted, reviewed });
        }
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={onClick}
            className="group relative bg-zinc-800/50 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 cursor-pointer hover:border-blue-500 transition-all"
        >
            <div className="absolute -top-3 -right-3 h-12 w-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl">
                <FileText className="h-6 w-6 text-white" />
            </div>

            <h3 className="text-xl font-black text-white mb-2 pr-8">{homework.title}</h3>
            <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{homework.description}</p>

            {/* Media Badges */}
            <div className="flex gap-2 mb-4">
                {homework.videoUrl && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Video className="h-3 w-3" /> Video
                    </span>
                )}
                {homework.voiceNoteUrl && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Mic className="h-3 w-3" /> Voice
                    </span>
                )}
                {homework.worksheetUrl && (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Worksheet
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-900/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-white">{stats.total}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Total</p>
                </div>
                <div className="bg-brand/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-brand">{stats.submitted}</p>
                    <p className="text-[10px] text-brand uppercase tracking-widest font-black">Submitted</p>
                </div>
                <div className="bg-emerald-500/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-emerald-400">{stats.reviewed}</p>
                    <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-black">Reviewed</p>
                </div>
            </div>

            {!homework.isPublished && (
                <div className="mt-4 px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold text-center">
                    Draft - Not Published
                </div>
            )}
        </motion.div>
    );
}

function HomeworkBuilder({ isOpen, onClose, schoolData, templates, onSuccess }: any) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        instructions: "",
        videoUrl: "",
        voiceNoteUrl: "",
        worksheetUrl: "",
        assignedTo: "CLASS" as "CLASS" | "GROUP" | "INDIVIDUAL",
        targetIds: [] as string[],
        scheduledFor: "",
        dueDate: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await createHomeworkAction({
            ...formData,
            scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined,
            dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
            schoolId: schoolData.id,
            createdById: "current-user-id", // TODO: Get from auth
            academicYearId: getCookie(`academic_year_${schoolData.slug}`) || undefined,
        });

        if (result.success) {
            toast.success("Homework created successfully!");
            onClose();
            onSuccess();
        } else {
            toast.error(result.error || "Failed to create homework");
        }
        setIsSubmitting(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900 border border-zinc-700 rounded-[40px] p-8 max-w-3xl w-full shadow-2xl my-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-black text-white flex items-center gap-3">
                                <Sparkles className="h-8 w-8 text-brand" />
                                Homework Builder
                            </h2>
                            <button
                                onClick={onClose}
                                className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title & Description */}
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-brand focus:outline-none"
                                    placeholder="e.g., Weekend Fun Task - Find Red Objects"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-blue-500 focus:outline-none resize-none"
                                    rows={3}
                                    placeholder="Brief description of the activity..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                    Instructions
                                </label>
                                <textarea
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-blue-500 focus:outline-none resize-none"
                                    rows={4}
                                    placeholder="Detailed step-by-step instructions for parents..."
                                />
                            </div>

                            {/* Attachment Bar */}
                            <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">
                                    Multimedia Attachments
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 mb-2 block flex items-center gap-2">
                                            <Video className="h-4 w-4 text-red-400" />
                                            Video URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.videoUrl}
                                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-brand focus:outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 mb-2 block flex items-center gap-2">
                                            <Mic className="h-4 w-4 text-purple-400" />
                                            Voice Note URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.voiceNoteUrl}
                                            onChange={(e) => setFormData({ ...formData, voiceNoteUrl: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-brand focus:outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 mb-2 block flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-emerald-400" />
                                            Worksheet URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.worksheetUrl}
                                            onChange={(e) => setFormData({ ...formData, worksheetUrl: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-brand focus:outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Assignment Type */}
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                    Assign To
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(["CLASS", "GROUP", "INDIVIDUAL"] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, assignedTo: type })}
                                            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${formData.assignedTo === type
                                                ? "bg-brand text-white"
                                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                                }`}
                                        >
                                            {type === "CLASS" && <Users className="h-4 w-4 inline mr-2" />}
                                            {type === "INDIVIDUAL" && <User className="h-4 w-4 inline mr-2" />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Scheduled For
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduledFor}
                                        onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-brand focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Due Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-brand focus:outline-none"
                                    />
                                </div>
                            </div>

                            <input type="hidden" name="academicYearId" value={getCookie(`academic_year_${schoolData.slug}`) || ""} />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-brand text-white rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        Create & Publish
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function SubmissionReview({ homework, onClose, onSuccess }: any) {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSubmissions();
    }, [homework.id]);

    const loadSubmissions = async () => {
        const res = await getHomeworkSubmissionsAction(homework.id);
        if (res.success) setSubmissions(res.data || []);
        setIsLoading(false);
    };

    const handleGrade = async (submissionId: string, stickerType: string) => {
        const result = await gradeSubmissionAction({
            submissionId,
            stickerType: stickerType as any,
            reviewedById: "current-user-id", // TODO: Get from auth
            addToPortfolio: true,
            milestoneType: "COGNITIVE",
        });

        if (result.success) {
            toast.success("Feedback added!");
            loadSubmissions();
            onSuccess();
        } else {
            toast.error("Failed to add feedback");
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-zinc-900 border border-zinc-700 rounded-[40px] p-8 max-w-6xl w-full shadow-2xl my-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-white">{homework.title}</h2>
                            <p className="text-zinc-400 mt-1">Review student submissions</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-brand" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {submissions.map((sub) => (
                                <SubmissionCard
                                    key={sub.id}
                                    submission={sub}
                                    onGrade={handleGrade}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function SubmissionCard({ submission, onGrade }: any) {
    const stickers = [
        { type: "EXCELLENT", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/20" },
        { type: "CREATIVE", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/20" },
        { type: "KEEP_IT_UP", icon: ThumbsUp, color: "text-blue-400", bg: "bg-blue-500/20" },
        { type: "STAR", icon: Star, color: "text-amber-400", bg: "bg-amber-500/20" },
        { type: "MEDAL", icon: Award, color: "text-emerald-400", bg: "bg-emerald-500/20" },
    ];

    return (
        <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white">{submission.studentName}</h4>
                {submission.isSubmitted ? (
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold">
                        Submitted
                    </span>
                ) : (
                    <span className="px-2 py-1 bg-zinc-700 text-zinc-400 rounded-lg text-xs font-bold">
                        Pending
                    </span>
                )}
            </div>

            {submission.mediaUrl && (
                <div className="mb-3 rounded-xl overflow-hidden bg-zinc-900">
                    {submission.mediaType === "PHOTO" ? (
                        <img src={submission.mediaUrl} alt="Submission" className="w-full h-40 object-cover" />
                    ) : (
                        <video src={submission.mediaUrl} controls className="w-full h-40" />
                    )}
                </div>
            )}

            {submission.parentNotes && (
                <p className="text-sm text-zinc-400 mb-3 italic">"{submission.parentNotes}"</p>
            )}

            {submission.isReviewed ? (
                <div className="flex items-center gap-2 p-3 bg-zinc-900 rounded-xl">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">Reviewed</span>
                </div>
            ) : submission.isSubmitted ? (
                <div className="flex gap-2">
                    {stickers.map((sticker) => (
                        <button
                            key={sticker.type}
                            onClick={() => onGrade(submission.id, sticker.type)}
                            className={`flex-1 p-2 rounded-xl ${sticker.bg} hover:scale-110 transition-all`}
                            title={sticker.type}
                        >
                            <sticker.icon className={`h-5 w-5 ${sticker.color} mx-auto`} />
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-3 text-zinc-600 text-sm">
                    Waiting for submission
                </div>
            )}
        </div>
    );
}
