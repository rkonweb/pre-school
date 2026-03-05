import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { validateUserSchoolAction } from '@/app/actions/session-actions'
import { getSchoolHomeworkAction } from '@/app/actions/homework-actions'
import {
    BookOpen, Plus, Eye, Clock, Users, CheckCircle2, FileText, Video,
    Mic, Calendar, GraduationCap, Pencil, BarChart3, Sparkles
} from 'lucide-react'
import HomeworkActions from './HomeworkActions'

export const dynamic = 'force-dynamic'

function formatDate(date: Date | string | null | undefined) {
    if (!date) return null
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

function timeAgo(date: Date | string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export default async function HomeworkPage(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ class?: string; status?: string }> }) {
    const params = await props.params
    const searchParams = await props.searchParams
    const { slug } = params

    const auth = await validateUserSchoolAction(slug)
    if (!auth.success || !auth.user) {
        return <div className="p-8 text-red-500">Unauthorized</div>
    }

    const schoolId = auth.user.schoolId
    if (!schoolId) return <div className="p-8 text-red-500">School not found.</div>

    // Fetch classrooms for filter
    const classrooms = await prisma.classroom.findMany({
        where: { schoolId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    // Fetch homework
    const homeworkRes = await getSchoolHomeworkAction(slug, searchParams.class)
    const allHomework = homeworkRes.success ? (homeworkRes.data || []) : []

    // Filter by status
    const statusFilter = searchParams.status || 'ALL'
    const homework = allHomework.filter(hw => {
        if (statusFilter === 'PUBLISHED') return hw.isPublished
        if (statusFilter === 'DRAFT') return !hw.isPublished
        return true
    })

    // Stats
    const totalPublished = allHomework.filter(h => h.isPublished).length
    const totalDraft = allHomework.filter(h => !h.isPublished).length
    const totalSubmissions = allHomework.reduce((acc, h) => acc + (h.submittedCount || 0), 0)

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 pt-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-brand" />
                        Homework & Activities
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Create tasks, track submissions, and give feedback to students.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={`/s/${slug}/homework/new`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-[var(--secondary-color)] transition-colors hover:brightness-110 shadow-sm shadow-brand/20"
                    >
                        <Plus className="h-4 w-4" />
                        Create Homework
                    </Link>
                </div>
            </div>

            {/* Stats Row */}
            <div className="px-8 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: allHomework.length, icon: FileText, color: 'text-zinc-500 bg-zinc-100', iconColor: 'text-zinc-500' },
                    { label: 'Published', value: totalPublished, icon: Eye, color: 'text-emerald-700 bg-emerald-50', iconColor: 'text-emerald-500' },
                    { label: 'Drafts', value: totalDraft, icon: Pencil, color: 'text-amber-700 bg-amber-50', iconColor: 'text-amber-500' },
                    { label: 'Submissions', value: totalSubmissions, icon: CheckCircle2, color: 'text-brand bg-brand/10', iconColor: 'text-brand' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{stat.label}</p>
                            <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="px-8 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-4 shrink-0 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Class</span>
                    <div className="flex gap-2 flex-wrap">
                        <Link
                            href={`/s/${slug}/homework?status=${statusFilter}`}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!searchParams.class ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}
                        >
                            All Classes
                        </Link>
                        {classrooms.map(c => (
                            <Link
                                key={c.id}
                                href={`/s/${slug}/homework?class=${c.id}&status=${statusFilter}`}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${searchParams.class === c.id ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}
                            >
                                {c.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Status</span>
                    {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map(s => (
                        <Link
                            key={s}
                            href={`/s/${slug}/homework?${searchParams.class ? `class=${searchParams.class}&` : ''}status=${s}`}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}
                        >
                            {s}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Homework List */}
            <div className="flex-1 overflow-auto p-8 min-h-0">
                {homework.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="h-20 w-20 bg-zinc-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="h-10 w-10 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-400">No homework found</h3>
                        <p className="text-sm text-zinc-300 mt-1">Create your first homework assignment</p>
                        <Link
                            href={`/s/${slug}/homework/new`}
                            className="mt-6 flex items-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all"
                        >
                            <Plus className="h-4 w-4" /> Create Homework
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {homework.map(hw => {
                            const submittedPct = hw.submissionCount > 0
                                ? Math.round((hw.submittedCount / hw.submissionCount) * 100) : 0
                            const reviewedPct = hw.submittedCount > 0
                                ? Math.round((hw.reviewedCount / hw.submittedCount) * 100) : 0

                            return (
                                <div key={hw.id} className="group bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 hover:shadow-md transition-all overflow-hidden">
                                    {/* Card Header */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 pr-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {hw.isPublished ? (
                                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[10px] font-black uppercase tracking-wider">Published</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[10px] font-black uppercase tracking-wider">Draft</span>
                                                    )}
                                                    {hw.assignedTo === 'CLASS' ? (
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                            <Users className="h-2.5 w-2.5" /> Class
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-md text-[10px] font-black uppercase tracking-wider">Individual</span>
                                                    )}
                                                </div>
                                                <h3 className="font-black text-zinc-900 text-base leading-tight">{hw.title}</h3>
                                                {hw.description && (
                                                    <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{hw.description}</p>
                                                )}
                                            </div>
                                            <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                        </div>

                                        {/* Media Badges */}
                                        <div className="flex gap-1.5 flex-wrap mb-3">
                                            {hw.videoUrl && <span className="px-2 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded-md text-[10px] font-bold flex items-center gap-1"><Video className="h-2.5 w-2.5" /> Video</span>}
                                            {hw.voiceNoteUrl && <span className="px-2 py-0.5 bg-purple-50 text-purple-500 border border-purple-100 rounded-md text-[10px] font-bold flex items-center gap-1"><Mic className="h-2.5 w-2.5" /> Voice</span>}
                                            {(hw.attachments?.length > 0) && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[10px] font-bold flex items-center gap-1"><FileText className="h-2.5 w-2.5" /> {hw.attachments.length} File{hw.attachments.length !== 1 ? 's' : ''}</span>}
                                        </div>

                                        {/* Due Date */}
                                        {hw.dueDate && (
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-3">
                                                <Clock className="h-3.5 w-3.5" />
                                                Due {formatDate(hw.dueDate)}
                                            </div>
                                        )}

                                        {/* Submission Progress */}
                                        {hw.submissionCount > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                                                    <span>Submissions</span>
                                                    <span className="text-zinc-800">{hw.submittedCount} / {hw.submissionCount}</span>
                                                </div>
                                                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${submittedPct}%` }} />
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                                                    <span>Reviewed</span>
                                                    <span className="text-zinc-800">{hw.reviewedCount}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{timeAgo(hw.createdAt)}</span>
                                        <div className="flex items-center gap-2">
                                            <HomeworkActions slug={slug} homework={hw} />
                                            <Link
                                                href={`/s/${slug}/homework/${hw.id}`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-700 transition-all"
                                            >
                                                <Eye className="h-3 w-3" /> Review
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
