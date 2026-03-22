import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { validateUserSchoolAction } from '@/app/actions/session-actions'
import { getSchoolHomeworkAction } from '@/app/actions/homework-actions'
import { BookOpen, Plus, Eye, Clock, Users, CheckCircle2, FileText, Video, Mic, Pencil } from 'lucide-react'
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
        return <div style={{ padding: 32, color: "#DC2626", fontWeight: 700 }}>Unauthorized</div>
    }

    const schoolId = auth.user.schoolId
    if (!schoolId) return <div style={{ padding: 32, color: "#DC2626", fontWeight: 700 }}>School not found.</div>

    const classrooms = await prisma.classroom.findMany({
        where: { schoolId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    const homeworkRes = await getSchoolHomeworkAction(slug, searchParams.class)
    const allHomework = homeworkRes.success ? (homeworkRes.data || []) : []

    const statusFilter = searchParams.status || 'ALL'
    const homework = allHomework.filter((hw: any) => {
        if (statusFilter === 'PUBLISHED') return hw.isPublished
        if (statusFilter === 'DRAFT') return !hw.isPublished
        return true
    })

    const totalPublished = allHomework.filter((h: any) => h.isPublished).length
    const totalDraft = allHomework.filter((h: any) => !h.isPublished).length
    const totalSubmissions = allHomework.reduce((acc: number, h: any) => acc + (h.submittedCount || 0), 0)

    const stats = [
        { label: 'Total', value: allHomework.length, icon: FileText, bg: '#F9FAFB', iconColor: '#6B7280' },
        { label: 'Published', value: totalPublished, icon: Eye, bg: '#ECFDF5', iconColor: '#059669' },
        { label: 'Drafts', value: totalDraft, icon: Pencil, bg: '#FFFBEB', iconColor: '#D97706' },
        { label: 'Submissions', value: totalSubmissions, icon: CheckCircle2, bg: 'rgba(245,158,11,0.08)', iconColor: '#F59E0B' },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#F9FAFB' }}>
            <style>{`.hw-card{transition:box-shadow .2s}.hw-card:hover{box-shadow:0 6px 24px rgba(0,0,0,0.08)!important}`}</style>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '28px 32px 0' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#18181B', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen style={{ width: 20, height: 20, color: 'white' }} />
                        </div>
                        Homework &amp; Activities
                    </h1>
                    <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginTop: 6 }}>Create tasks, track submissions, and give feedback to students.</p>
                </div>
                <Link
                    href={`/s/${slug}/homework/new`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 14, background: 'linear-gradient(135deg,#F59E0B,#D97706)', padding: '11px 22px', fontSize: 14, fontWeight: 800, color: 'white', textDecoration: 'none', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}
                >
                    <Plus style={{ width: 16, height: 16 }} />
                    Create Homework
                </Link>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, padding: '20px 32px 0' }}>
                {stats.map(stat => (
                    <div key={stat.label} style={{ background: 'white', border: '1.5px solid #F3F4F6', borderRadius: 18, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 13, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <stat.icon style={{ width: 20, height: 20, color: stat.iconColor }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: '#18181B', lineHeight: 1.2 }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 32px', borderBottom: '1px solid #F3F4F6', background: 'white', marginTop: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2 }}>Class</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Link href={`/s/${slug}/homework?status=${statusFilter}`}
                            style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: 'none', background: !searchParams.class ? '#18181B' : 'white', color: !searchParams.class ? 'white' : '#6B7280', border: '1.5px solid #E5E7EB' }}>
                            All Classes
                        </Link>
                        {classrooms.map(c => (
                            <Link key={c.id} href={`/s/${slug}/homework?class=${c.id}&status=${statusFilter}`}
                                style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: 'none', background: searchParams.class === c.id ? '#18181B' : 'white', color: searchParams.class === c.id ? 'white' : '#6B7280', border: '1.5px solid #E5E7EB' }}>
                                {c.name}
                            </Link>
                        ))}
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2 }}>Status</span>
                    {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map(s => (
                        <Link key={s} href={`/s/${slug}/homework?${searchParams.class ? `class=${searchParams.class}&` : ''}status=${s}`}
                            style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: 'none', background: statusFilter === s ? '#18181B' : 'white', color: statusFilter === s ? 'white' : '#6B7280', border: '1.5px solid #E5E7EB' }}>
                            {s}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Homework List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px 80px' }}>
                {homework.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ width: 72, height: 72, background: '#F3F4F6', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                            <BookOpen style={{ width: 36, height: 36, color: '#D1D5DB' }} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#9CA3AF', marginBottom: 8 }}>No homework found</h3>
                        <p style={{ fontSize: 13, color: '#D1D5DB', marginBottom: 24 }}>Create your first homework assignment</p>
                        <Link href={`/s/${slug}/homework/new`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#18181B', color: 'white', borderRadius: 14, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                            <Plus style={{ width: 16, height: 16 }} /> Create Homework
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
                        {homework.map((hw: any) => {
                            const submittedPct = hw.submissionCount > 0 ? Math.round((hw.submittedCount / hw.submissionCount) * 100) : 0

                            return (
                                <div key={hw.id} className="hw-card" style={{ background: 'white', border: '1.5px solid #F3F4F6', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                                    <div style={{ padding: '18px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <div style={{ flex: 1, paddingRight: 12 }}>
                                                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                                                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, background: hw.isPublished ? '#ECFDF5' : '#FFFBEB', color: hw.isPublished ? '#059669' : '#D97706', border: `1px solid ${hw.isPublished ? '#A7F3D0' : '#FDE68A'}` }}>
                                                        {hw.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        {hw.assignedTo === 'CLASS' ? <><Users style={{ width: 9, height: 9 }} /> Class</> : 'Individual'}
                                                    </span>
                                                </div>
                                                <h3 style={{ fontWeight: 800, color: '#18181B', fontSize: 15, lineHeight: 1.3, margin: 0 }}>{hw.title}</h3>
                                                {hw.description && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{hw.description}</p>}
                                            </div>
                                            <div style={{ width: 40, height: 40, borderRadius: 13, background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <BookOpen style={{ width: 18, height: 18, color: '#F59E0B' }} />
                                            </div>
                                        </div>

                                        {/* Media Badges */}
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                            {hw.videoUrl && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 4 }}><Video style={{ width: 9, height: 9 }} /> Video</span>}
                                            {hw.voiceNoteUrl && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', gap: 4 }}><Mic style={{ width: 9, height: 9 }} /> Voice</span>}
                                            {(hw.attachments?.length > 0) && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: 4 }}><FileText style={{ width: 9, height: 9 }} /> {hw.attachments.length} File{hw.attachments.length !== 1 ? 's' : ''}</span>}
                                        </div>

                                        {hw.dueDate && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', fontWeight: 600, marginBottom: 12 }}><Clock style={{ width: 13, height: 13 }} /> Due {formatDate(hw.dueDate)}</div>}

                                        {hw.submissionCount > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#6B7280' }}>
                                                    <span>Submissions</span><span style={{ color: '#18181B' }}>{hw.submittedCount} / {hw.submissionCount}</span>
                                                </div>
                                                <div style={{ height: 5, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#F59E0B,#D97706)', borderRadius: 999, width: `${submittedPct}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div style={{ padding: '12px 20px', background: '#F9FAFB', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>{timeAgo(hw.createdAt)}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <HomeworkActions slug={slug} homework={hw} />
                                            <Link href={`/s/${slug}/homework/${hw.id}`}
                                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#18181B', color: 'white', borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                                                <Eye style={{ width: 12, height: 12 }} /> Review
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
