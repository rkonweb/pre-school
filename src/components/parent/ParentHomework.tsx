"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Clock, Video, Mic, FileText, Camera, Upload, Send,
    Sparkles, Star, Award, Heart, CheckCircle, AlertCircle, Smile,
    ThumbsUp, ThumbsDown, Meh, Loader2, X, Play, BookOpen, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { submitHomeworkAction, recordReadReceiptAction, getStudentHomeworkAction } from "@/app/actions/homework-actions";
import MediaUploader from "@/components/upload/MediaUploader";

interface ParentHomeworkProps {
    studentId: string;
    parentId: string;
    slug: string;
    brandColor?: string;
}

export default function ParentHomeworkPage({ studentId, parentId, slug, brandColor = "#6366f1" }: ParentHomeworkProps) {
    const [homework, setHomework] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        loadHomework();
    }, [studentId]);

    const loadHomework = async () => {
        setIsLoading(true);
        const res = await getStudentHomeworkAction(slug, studentId);
        if (res.success) setHomework(res.data || []);
        setIsLoading(false);
    };

    const handleTaskClick = async (task: any) => {
        setSelectedTask(task);
        // Record read receipt
        await recordReadReceiptAction({
            homeworkId: task.id,
            parentId,
            studentId,
        });
    };

    const handleSubmissionSuccess = () => {
        setShowCelebration(true);
        setTimeout(() => {
            setShowCelebration(false);
            setSelectedTask(null);
            loadHomework();
        }, 3000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex items-center justify-between"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Homework</h2>
                    </div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none">Emma's Active Learning Journey</p>
                </div>
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                    <BookOpen className="h-6 w-6" />
                </div>
            </motion.div>

            {/* Homework Cards */}
            <div className="max-w-4xl mx-auto space-y-4">
                {homework.map((task, index) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onClick={() => handleTaskClick(task)}
                        brandColor={brandColor}
                    />
                ))}
            </div>

            {homework.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto text-center py-12"
                >
                    <div className="h-32 w-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="h-16 w-16 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-800 mb-2">All Caught Up! 🎉</h3>
                    <p className="text-zinc-600">No new homework right now. Check back soon for exciting activities!</p>
                </motion.div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    studentId={studentId}
                    slug={slug}
                    onClose={() => setSelectedTask(null)}
                    onSuccess={handleSubmissionSuccess}
                />
            )}

            {/* Celebration Animation */}
            <CelebrationOverlay isVisible={showCelebration} />
        </div>
    );
}

function TaskCard({ task, index, onClick, brandColor }: any) {
    const isSubmitted = task.submission?.isSubmitted;
    const isReviewed = task.submission?.isReviewed;
    const stickerType = task.submission?.stickerType;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01, y: -4 }}
            onClick={onClick}
            className="relative bg-white rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-4 border-transparent hover:border-indigo-100/50 transition-all cursor-pointer overflow-hidden group"
        >
            {/* Status Bar */}
            <div
                className="absolute left-0 top-0 bottom-0 w-2.5 transition-all group-hover:w-3.5"
                style={{ backgroundColor: isReviewed ? '#10b981' : isSubmitted ? brandColor : '#f1f5f9' }}
            />

            {/* Status Badge */}
            <div className="absolute top-8 right-8">
                {isReviewed ? (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full shadow-xl shadow-emerald-200/40">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Reviewed</span>
                    </div>
                ) : isSubmitted ? (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full shadow-xl shadow-indigo-200/40">
                        <Clock className="h-4 w-4" />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Submitted</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 animate-pulse">
                        <Star className="h-4 w-4" />
                        <span className="font-black text-[10px] uppercase tracking-widest leading-none">New Task</span>
                    </div>
                )}
            </div>

            <div className="pr-20">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                        {task.subject || "General"}
                    </span>
                </div>

                <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-[0.9] mb-4 group-hover:text-slate-900 transition-colors">
                    {task.title}
                </h3>

                <p className="text-[11px] text-slate-400 font-medium italic mb-8 line-clamp-2 leading-relaxed">
                    "{task.description}"
                </p>

                {/* Media Badges */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {task.videoUrl && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100">
                            <Video className="h-3.5 w-3.5" />
                            Video
                        </span>
                    )}
                    {task.voiceNoteUrl && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-purple-100">
                            <Mic className="h-3.5 w-3.5" />
                            Voice
                        </span>
                    )}
                    {task.worksheetUrl && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <FileText className="h-3.5 w-3.5" />
                            Worksheet
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-6">
                        {task.dueDate && (
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <Clock className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.estimatedTime || "15m"}</span>
                        </div>
                    </div>

                    {!isSubmitted && (
                        <div className="flex items-center gap-2 text-indigo-600 group-hover:translate-x-1 transition-transform">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Start</span>
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    )}
                </div>

                {/* Teacher Feedback */}
                {isReviewed && stickerType && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-8 p-5 rounded-[2rem] border-2 border-amber-100 shadow-lg shadow-amber-500/5 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}
                    >
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-200/20 rounded-full blur-2xl" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-md">
                                {stickerType === "EXCELLENT" && <Star className="h-7 w-7 text-amber-400 fill-amber-400" />}
                                {stickerType === "CREATIVE" && <Sparkles className="h-7 w-7 text-amber-400" />}
                                {stickerType === "STAR" && <Star className="h-7 w-7 text-amber-400 fill-amber-400" />}
                                {stickerType === "MEDAL" && <Award className="h-7 w-7 text-amber-400" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] mb-0.5">Sticker Awarded!</p>
                                <p className="text-xl font-black text-amber-900 leading-none">{stickerType.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

function TaskDetailModal({ task, studentId, slug, onClose, onSuccess }: any) {
    const [uploadType, setUploadType] = useState<"PHOTO" | "VIDEO" | null>(null);
    const [mediaUrl, setMediaUrl] = useState("");
    const [parentNotes, setParentNotes] = useState("");
    const [parentFeedback, setParentFeedback] = useState<"ENJOYED" | "DIFFICULT" | "NEUTRAL" | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);

    const handleSubmit = async () => {
        if (!mediaUrl && !parentNotes) {
            toast.error("Please upload a photo/video or add notes");
            return;
        }

        setIsSubmitting(true);

        const result = await submitHomeworkAction(slug, {
            homeworkId: task.id,
            studentId,
            mediaType: uploadType || "NONE",
            mediaUrl,
            parentNotes,
            parentFeedback: parentFeedback || undefined,
        });

        if (result.success) {
            onSuccess();
        } else {
            toast.error(result.error || "Failed to submit");
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-[3rem] p-8 max-w-2xl w-full shadow-2xl my-8"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-zinc-900 mb-2">{task.title}</h2>
                            <p className="text-zinc-600 font-medium">{task.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Instructions */}
                    {task.instructions && (
                        <div className="mb-6 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
                            <h3 className="font-black text-zinc-900 mb-2 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                Instructions
                            </h3>
                            <p className="text-zinc-700 whitespace-pre-wrap">{task.instructions}</p>
                        </div>
                    )}

                    {/* Media Resources */}
                    <div className="mb-6 space-y-3">
                        {task.videoUrl && (
                            <button
                                onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                                className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all"
                            >
                                <Play className="h-5 w-5" />
                                {showVideoPlayer ? "Hide" : "Watch"} Teacher's Video Guide
                            </button>
                        )}
                        {showVideoPlayer && task.videoUrl && (
                            <div className="rounded-2xl overflow-hidden">
                                <video src={task.videoUrl} controls className="w-full" />
                            </div>
                        )}

                        {task.voiceNoteUrl && (
                            <div className="p-4 bg-purple-100 rounded-2xl">
                                <audio src={task.voiceNoteUrl} controls className="w-full" />
                            </div>
                        )}

                        {task.worksheetUrl && (
                            <a
                                href={task.worksheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-emerald-100 text-emerald-700 rounded-2xl font-bold text-center hover:bg-emerald-200 transition-colors"
                            >
                                <FileText className="h-5 w-5 inline mr-2" />
                                View Worksheet
                            </a>
                        )}
                    </div>


                    {/* Upload Section */}
                    <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200">
                        <h3 className="font-black text-zinc-900 mb-4 flex items-center gap-2">
                            <Camera className="h-5 w-5 text-blue-600" />
                            Upload Your Child's Activity
                        </h3>

                        {!uploadType ? (
                            <div className="grid grid-cols-2 gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setUploadType("PHOTO")}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                                >
                                    <Camera className="h-8 w-8 mx-auto mb-2" />
                                    Take Photo
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setUploadType("VIDEO")}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                                >
                                    <Video className="h-8 w-8 mx-auto mb-2" />
                                    Record Video
                                </motion.button>
                            </div>
                        ) : (
                            <MediaUploader
                                type={uploadType}
                                onUploadComplete={(url) => {
                                    setMediaUrl(url);
                                    toast.success("Upload complete!");
                                }}
                                onCancel={() => setUploadType(null)}
                            />
                        )}
                    </div>

                    {/* Parent Notes */}
                    <div className="mb-6">
                        <label className="font-bold text-zinc-900 mb-2 block">Add Notes (Optional)</label>
                        <textarea
                            value={parentNotes}
                            onChange={(e) => setParentNotes(e.target.value)}
                            placeholder="Share how your child enjoyed this activity..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 focus:border-blue-500 focus:outline-none resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Feedback Toggles */}
                    <div className="mb-6">
                        <label className="font-bold text-zinc-900 mb-3 block">How did your child find this?</label>
                        <div className="grid grid-cols-3 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setParentFeedback("ENJOYED")}
                                className={`p-4 rounded-2xl font-bold transition-all ${parentFeedback === "ENJOYED"
                                    ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                                    : "bg-white text-zinc-700 border-2 border-zinc-200"
                                    }`}
                            >
                                <Smile className="h-8 w-8 mx-auto mb-2" />
                                Enjoyed!
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setParentFeedback("NEUTRAL")}
                                className={`p-4 rounded-2xl font-bold transition-all ${parentFeedback === "NEUTRAL"
                                    ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                                    : "bg-white text-zinc-700 border-2 border-zinc-200"
                                    }`}
                            >
                                <Meh className="h-8 w-8 mx-auto mb-2" />
                                Okay
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setParentFeedback("DIFFICULT")}
                                className={`p-4 rounded-2xl font-bold transition-all ${parentFeedback === "DIFFICULT"
                                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                                    : "bg-white text-zinc-700 border-2 border-zinc-200"
                                    }`}
                            >
                                <ThumbsDown className="h-8 w-8 mx-auto mb-2" />
                                Difficult
                            </motion.button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-6 w-6" />
                                Submit Activity
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function CelebrationOverlay({ isVisible }: { isVisible: boolean }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gradient-to-br from-blue-500/90 to-purple-500/90 backdrop-blur-sm z-50 flex items-center justify-center"
                    {...({} as any)}
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className="text-center"
                        {...({} as any)}
                    >
                        {/* Confetti Effect */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: 0, x: 0, opacity: 1 }}
                                animate={{
                                    y: [0, -200, -400],
                                    x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 300],
                                    opacity: [1, 1, 0],
                                    rotate: [0, 360],
                                }}
                                transition={{ duration: 2, delay: i * 0.05 }}
                                className="absolute h-4 w-4 rounded-full"
                                {...({} as any)}
                                style={{
                                    backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][i % 5],
                                }}
                            />
                        ))}

                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="h-32 w-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                            {...({} as any)}
                        >
                            <Star className="h-16 w-16 text-yellow-500" fill="currentColor" />
                        </motion.div>

                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-6xl font-black text-white mb-4"
                            {...({} as any)}
                        >
                            Amazing Work! 🎉
                        </motion.h2>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-2xl text-white/90 font-bold"
                            {...({} as any)}
                        >
                            Activity submitted successfully!
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
