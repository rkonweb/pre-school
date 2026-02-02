"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Clock, Video, Mic, FileText, Camera, Upload, Send,
    Sparkles, Star, Award, Heart, CheckCircle, AlertCircle, Smile,
    ThumbsUp, ThumbsDown, Meh, Loader2, X, Play, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { submitHomeworkAction, recordReadReceiptAction, getStudentHomeworkAction } from "@/app/actions/homework-actions";
import MediaUploader from "@/components/upload/MediaUploader";

interface ParentHomeworkProps {
    studentId: string;
    parentId: string;
}

export default function ParentHomeworkPage({ studentId, parentId }: ParentHomeworkProps) {
    const [homework, setHomework] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        loadHomework();
    }, [studentId]);

    const loadHomework = async () => {
        setIsLoading(true);
        const res = await getStudentHomeworkAction(studentId);
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
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h2 className="text-2xl font-black tracking-tight">Homework & Activities</h2>
                </div>
                <p className="text-zinc-500 font-medium">Capture and share Emma's fun learning moments!</p>
            </motion.div>

            {/* Homework Cards */}
            <div className="max-w-4xl mx-auto space-y-4">
                {homework.map((task, index) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onClick={() => handleTaskClick(task)}
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
                    onClose={() => setSelectedTask(null)}
                    onSuccess={handleSubmissionSuccess}
                />
            )}

            {/* Celebration Animation */}
            <CelebrationOverlay isVisible={showCelebration} />
        </div>
    );
}

function TaskCard({ task, index, onClick }: any) {
    const isSubmitted = task.submission?.isSubmitted;
    const isReviewed = task.submission?.isReviewed;
    const stickerType = task.submission?.stickerType;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={onClick}
            className="relative bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-transparent hover:border-blue-200 transition-all cursor-pointer overflow-hidden"
        >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50 -z-10" />

            {/* Status Badge */}
            <div className="absolute top-6 right-6">
                {isReviewed ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full shadow-lg">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-black text-sm">Reviewed!</span>
                    </div>
                ) : isSubmitted ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg">
                        <Clock className="h-5 w-5" />
                        <span className="font-black text-sm">Submitted</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg animate-pulse">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-black text-sm">New!</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="pr-32">
                <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mb-3 leading-tight">
                    {task.title}
                </h3>
                <p className="text-zinc-600 font-medium mb-4 line-clamp-2">
                    {task.description}
                </p>

                {/* Media Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {task.videoUrl && (
                        <span className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-bold">
                            <Video className="h-4 w-4" />
                            Video Guide
                        </span>
                    )}
                    {task.voiceNoteUrl && (
                        <span className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-600 rounded-xl text-sm font-bold">
                            <Mic className="h-4 w-4" />
                            Voice Note
                        </span>
                    )}
                    {task.worksheetUrl && (
                        <span className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-600 rounded-xl text-sm font-bold">
                            <FileText className="h-4 w-4" />
                            Worksheet
                        </span>
                    )}
                </div>

                {/* Due Date */}
                {task.dueDate && (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                )}

                {/* Teacher Feedback */}
                {isReviewed && stickerType && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border-2 border-yellow-200"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center">
                                {stickerType === "EXCELLENT" && <Star className="h-6 w-6 text-white" />}
                                {stickerType === "CREATIVE" && <Sparkles className="h-6 w-6 text-white" />}
                                {stickerType === "STAR" && <Star className="h-6 w-6 text-white" />}
                                {stickerType === "MEDAL" && <Award className="h-6 w-6 text-white" />}
                            </div>
                            <div>
                                <p className="font-black text-zinc-900">Teacher's Feedback</p>
                                <p className="text-sm text-zinc-600 font-bold">{stickerType.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Action Button */}
            {!isSubmitted && (
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-center shadow-xl"
                >
                    Start Activity →
                </motion.div>
            )}
        </motion.div>
    );
}

function TaskDetailModal({ task, studentId, onClose, onSuccess }: any) {
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

        const result = await submitHomeworkAction({
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
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className="text-center"
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
                        >
                            <Star className="h-16 w-16 text-yellow-500" fill="currentColor" />
                        </motion.div>

                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-6xl font-black text-white mb-4"
                        >
                            Amazing Work! 🎉
                        </motion.h2>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-2xl text-white/90 font-bold"
                        >
                            Activity submitted successfully!
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
