import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHomeworkByIdAction } from '@/app/actions/homework-actions'
import { validateUserSchoolAction } from '@/app/actions/session-actions'
import {
    ArrowLeft, BookOpen, Calendar, Clock, Users, User, FileText,
    Video, Mic, ExternalLink, Pencil, Download
} from 'lucide-react'
import HomeworkDetailActions from './HomeworkDetailActions'
import SubmissionsClient from './SubmissionsClient'

export const dynamic = 'force-dynamic'

function formatDate(date: Date | string | null | undefined) {
    if (!date) return '—'
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(date))
}

export default async function HomeworkDetailPage(props: {
    params: Promise<{ slug: string; id: string }>
}) {
    const params = await props.params
    const { slug, id } = params

    const auth = await validateUserSchoolAction(slug)
    if (!auth.success || !auth.user) return notFound()

    const hwRes = await getHomeworkByIdAction(slug, id)
    if (!hwRes.success || !hwRes.data) return notFound()

    const hw = hwRes.data
    const submissions = hw.submissions || []
    const submittedCount = submissions.filter((s: any) => s.isSubmitted).length
    const reviewedCount = submissions.filter((s: any) => s.isReviewed).length

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* Header */}
            <div className="p-8 bg-zinc-900 text-white shrink-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <Link
                            href={`/s/${slug}/homework`}
                            className="h-9 w-9 mt-1 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4 text-white" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {hw.isPublished ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-black uppercase tracking-wider">Published</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md text-[10px] font-black uppercase tracking-wider">Draft</span>
                                )}
                                <span className="px-2 py-0.5 bg-white/10 text-zinc-300 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                    {hw.assignedTo === 'CLASS' ? <><Users className="h-2.5 w-2.5" /> Class</> : <><User className="h-2.5 w-2.5" /> Individual</>}
                                </span>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight">{hw.title}</h1>
                            {hw.description && <p className="text-zinc-400 text-sm font-medium mt-1 max-w-2xl">{hw.description}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <HomeworkDetailActions slug={slug} id={id} isPublished={hw.isPublished} />
                        <Link
                            href={`/s/${slug}/homework/${id}/edit`}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all"
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </Link>
                    </div>
                </div>

                {/* Submission Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {[
                        { label: 'Total Students', value: submissions.length },
                        { label: 'Submitted', value: submittedCount },
                        { label: 'Reviewed', value: reviewedCount },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 rounded-2xl p-4">
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
                <div className="p-8 space-y-8">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Scheduled', value: formatDate(hw.scheduledFor), icon: Calendar },
                            { label: 'Due Date', value: formatDate(hw.dueDate), icon: Clock },
                            { label: 'Created', value: formatDate(hw.createdAt), icon: Calendar },
                        ].map(item => (
                            <div key={item.label} className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                                    <item.icon className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                <p className="text-sm font-bold text-zinc-800">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Instructions */}
                    {hw.instructions && (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-2">Instructions for Parents</h3>
                            <p className="text-sm text-zinc-700 font-medium whitespace-pre-wrap">{hw.instructions}</p>
                        </div>
                    )}

                    {/* Attachments */}
                    {(hw.attachments?.length > 0 || hw.videoUrl || hw.voiceNoteUrl) && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Attachments & Media</h3>
                            <div className="flex flex-wrap gap-3">
                                {hw.videoUrl && (
                                    <a href={hw.videoUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition-all">
                                        <Video className="h-4 w-4" /> Watch Video <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {hw.voiceNoteUrl && (
                                    <a href={hw.voiceNoteUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-xl text-sm font-bold text-purple-600 hover:bg-purple-100 transition-all">
                                        <Mic className="h-4 w-4" /> Voice Note <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {hw.attachments?.map((att: any, i: number) => (
                                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition-all max-w-xs">
                                        <FileText className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{att.name}</span>
                                        <Download className="h-3 w-3 shrink-0 text-zinc-400" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submissions Grid */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Student Submissions</h3>
                        <SubmissionsClient slug={slug} homeworkId={id} initialSubmissions={submissions} />
                    </div>
                </div>
            </div>
        </div>
    )
}
