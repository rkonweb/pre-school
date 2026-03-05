"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    Star, Sparkles, ThumbsUp, Award, Trophy, CheckCircle2,
    Clock, Image, Video, Loader2, MessageSquare, ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { gradeSubmissionAction } from "@/app/actions/homework-actions"
import { cn } from "@/lib/utils"

const STICKERS = [
    { type: "EXCELLENT", label: "Excellent", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200", activeBg: "bg-yellow-500 border-yellow-600" },
    { type: "CREATIVE", label: "Creative", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50 border-purple-200", activeBg: "bg-purple-500 border-purple-600" },
    { type: "KEEP_IT_UP", label: "Keep it Up", icon: ThumbsUp, color: "text-blue-500", bg: "bg-blue-50 border-blue-200", activeBg: "bg-blue-500 border-blue-600" },
    { type: "STAR", label: "Star", icon: Award, color: "text-amber-500", bg: "bg-amber-50 border-amber-200", activeBg: "bg-amber-500 border-amber-600" },
    { type: "MEDAL", label: "Medal", icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200", activeBg: "bg-emerald-500 border-emerald-600" },
]

function SubmissionCard({ submission, onGrade, slug }: { submission: any, onGrade: (id: string, sticker: string, comment: string) => void, slug: string }) {
    const [comment, setComment] = useState(submission.teacherComment || "")
    const [selectedSticker, setSelectedSticker] = useState(submission.stickerType || "")
    const [showComment, setShowComment] = useState(false)

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 transition-all">
            {/* Student Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-xs">
                        {submission.studentName?.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                        <p className="font-black text-zinc-900 text-sm">{submission.studentName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            {submission.isSubmitted ? (
                                <span className="text-emerald-500">Submitted</span>
                            ) : (
                                <span className="text-zinc-400">Pending</span>
                            )}
                        </p>
                    </div>
                </div>
                {submission.isReviewed && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-emerald-600">Reviewed</span>
                    </div>
                )}
            </div>

            {/* Submission Media */}
            {submission.isSubmitted && (
                <div className="px-4 pb-3">
                    {submission.mediaUrl && (
                        <div className="rounded-xl overflow-hidden bg-zinc-100 mb-3">
                            {submission.mediaType === "PHOTO" ? (
                                <img src={submission.mediaUrl} alt="Submission" className="w-full h-40 object-cover" />
                            ) : submission.mediaType === "VIDEO" ? (
                                <video src={submission.mediaUrl} controls className="w-full h-40 bg-black" />
                            ) : (
                                <a href={submission.mediaUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-4 text-sm font-bold text-brand hover:underline">
                                    <ExternalLink className="h-4 w-4" /> View Submission
                                </a>
                            )}
                        </div>
                    )}
                    {submission.parentNotes && (
                        <p className="text-xs text-zinc-500 italic mb-3 bg-zinc-50 rounded-xl px-3 py-2">"{submission.parentNotes}"</p>
                    )}
                    {submission.submittedAt && (
                        <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1 mb-3">
                            <Clock className="h-3 w-3" />
                            {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(submission.submittedAt))}
                        </p>
                    )}
                </div>
            )}

            {/* Grade Section */}
            {submission.isSubmitted && !submission.isReviewed && (
                <div className="px-4 pb-4 border-t border-zinc-100 pt-3 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Give Feedback</p>
                    <div className="flex gap-2">
                        {STICKERS.map(s => (
                            <button
                                key={s.type}
                                onClick={() => setSelectedSticker(s.type)}
                                title={s.label}
                                className={cn(
                                    "flex-1 p-2 rounded-xl border transition-all flex flex-col items-center gap-1",
                                    selectedSticker === s.type
                                        ? `${s.activeBg} text-white`
                                        : `${s.bg} hover:opacity-80`
                                )}
                            >
                                <s.icon className={cn("h-4 w-4", selectedSticker === s.type ? "text-white" : s.color)} />
                                <span className={cn("text-[8px] font-black uppercase", selectedSticker === s.type ? "text-white" : "text-zinc-500")}>{s.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowComment(!showComment)}
                        className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                        <MessageSquare className="h-3 w-3" /> Add comment
                    </button>

                    {showComment && (
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Optional comment for the student..."
                            rows={2}
                            className="w-full text-xs border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
                        />
                    )}

                    {selectedSticker && (
                        <button
                            onClick={() => onGrade(submission.id, selectedSticker, comment)}
                            className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-zinc-700 transition-all"
                        >
                            Submit Feedback
                        </button>
                    )}
                </div>
            )}

            {/* Already Reviewed */}
            {submission.isReviewed && submission.stickerType && (
                <div className="px-4 pb-4">
                    {(() => {
                        const s = STICKERS.find(st => st.type === submission.stickerType)
                        return s && (
                            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border", s.bg)}>
                                <s.icon className={cn("h-4 w-4", s.color)} />
                                <span className="text-xs font-bold text-zinc-700">{s.label}</span>
                            </div>
                        )
                    })()}
                    {submission.teacherComment && (
                        <p className="text-xs text-zinc-500 italic mt-2">"{submission.teacherComment}"</p>
                    )}
                </div>
            )}

            {/* Not yet submitted */}
            {!submission.isSubmitted && (
                <div className="px-4 pb-4">
                    <p className="text-xs text-zinc-300 text-center py-2">Waiting for submission</p>
                </div>
            )}
        </div>
    )
}

export default function SubmissionsClient({
    slug, homeworkId, initialSubmissions
}: { slug: string; homeworkId: string; initialSubmissions: any[] }) {
    const router = useRouter()
    const [submissions, setSubmissions] = useState(initialSubmissions)
    const [isPending, startTransition] = useTransition()
    const [filter, setFilter] = useState<"ALL" | "SUBMITTED" | "PENDING" | "REVIEWED">("ALL")

    const handleGrade = (submissionId: string, stickerType: string, comment: string) => {
        startTransition(async () => {
            const res = await gradeSubmissionAction(slug, {
                submissionId,
                stickerType: stickerType as any,
                teacherComment: comment || undefined,
                addToPortfolio: true,
                milestoneType: "COGNITIVE",
            })

            if (res.success) {
                toast.success("Feedback saved!")
                setSubmissions(prev => prev.map(s =>
                    s.id === submissionId
                        ? { ...s, isReviewed: true, stickerType, teacherComment: comment }
                        : s
                ))
                router.refresh()
            } else {
                toast.error(res.error || "Failed to save feedback")
            }
        })
    }

    const filtered = submissions.filter(s => {
        if (filter === 'SUBMITTED') return s.isSubmitted && !s.isReviewed
        if (filter === 'PENDING') return !s.isSubmitted
        if (filter === 'REVIEWED') return s.isReviewed
        return true
    })

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
                {(["ALL", "SUBMITTED", "PENDING", "REVIEWED"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                            filter === f ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        )}
                    >
                        {f} {f === 'ALL' ? `(${submissions.length})` : f === 'SUBMITTED' ? `(${submissions.filter(s => s.isSubmitted && !s.isReviewed).length})` : f === 'PENDING' ? `(${submissions.filter(s => !s.isSubmitted).length})` : `(${submissions.filter(s => s.isReviewed).length})`}
                    </button>
                ))}
                {isPending && <Loader2 className="h-5 w-5 animate-spin text-brand ml-2" />}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-zinc-200" />
                    <p className="text-sm font-bold">No submissions in this category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(sub => (
                        <SubmissionCard key={sub.id} submission={sub} onGrade={handleGrade} slug={slug} />
                    ))}
                </div>
            )}
        </div>
    )
}
