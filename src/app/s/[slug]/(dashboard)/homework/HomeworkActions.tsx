"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { deleteHomeworkAction, toggleHomeworkPublishAction } from "@/app/actions/homework-actions"
import Link from "next/link"

export default function HomeworkActions({ slug, homework }: { slug: string; homework: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deleteHomeworkAction(slug, homework.id)
            if (res.success) {
                toast.success("Homework deleted")
                router.refresh()
            } else {
                toast.error(res.error || "Failed to delete")
            }
            setShowDeleteModal(false)
        })
    }

    const handleTogglePublish = () => {
        startTransition(async () => {
            const res = await toggleHomeworkPublishAction(slug, homework.id, !homework.isPublished)
            if (res.success) {
                toast.success(homework.isPublished ? "Moved to draft" : "Published!")
                router.refresh()
            } else {
                toast.error(res.error || "Failed")
            }
        })
    }

    return (
        <>
            <div className="flex items-center gap-1">
                <button
                    onClick={handleTogglePublish}
                    disabled={isPending}
                    title={homework.isPublished ? "Unpublish" : "Publish"}
                    className="h-7 w-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-400 transition-all disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : homework.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                <Link
                    href={`/s/${slug}/homework/${homework.id}/edit`}
                    title="Edit"
                    className="h-7 w-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-400 transition-all"
                >
                    <Pencil className="h-3 w-3" />
                </Link>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isPending}
                    title="Delete"
                    className="h-7 w-7 rounded-lg bg-white border border-red-100 flex items-center justify-center text-red-400 hover:border-red-300 transition-all disabled:opacity-50"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="h-7 w-7 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 text-center mb-2">Delete Homework?</h3>
                        <p className="text-zinc-500 text-sm text-center mb-6">
                            This will permanently delete <span className="font-bold text-zinc-800">"{homework.title}"</span> and all submissions.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-50 transition-all">Cancel</button>
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
