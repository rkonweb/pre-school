"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { toggleHomeworkPublishAction } from "@/app/actions/homework-actions"

export default function HomeworkDetailActions({
    slug, id, isPublished
}: { slug: string; id: string; isPublished: boolean }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            const res = await toggleHomeworkPublishAction(slug, id, !isPublished)
            if (res.success) {
                toast.success(isPublished ? "Moved to draft" : "Published!")
                router.refresh()
            } else {
                toast.error(res.error || "Failed")
            }
        })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPublished ? "Unpublish" : "Publish"}
        </button>
    )
}
