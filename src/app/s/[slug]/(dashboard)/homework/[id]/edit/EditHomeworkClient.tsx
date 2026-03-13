"use client"

import React, { useState, useRef, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    BookOpen, ArrowLeft, Upload, X, FileText, Loader2, Calendar, Clock,
    Users, User, Save, Send, GraduationCap, Paperclip, CheckCircle2,
    AlertCircle, Youtube, Mic, Bell, Timer, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { updateHomeworkAction, uploadHomeworkFileAction } from '@/app/actions/homework-actions'

type Attachment = {
    name: string; url: string; type: string; size?: number
    uploading?: boolean; error?: string
}

const HW_TYPES = ['Written', 'Project', 'Reading', 'Practical'] as const
type HwType = typeof HW_TYPES[number]

export default function EditHomeworkClient({
    slug, homework, classrooms, students, academicYearId,
}: {
    slug: string
    homework: any
    classrooms: { id: string; name: string }[]
    students: { id: string; firstName: string; lastName: string; classroomId: string | null }[]
    academicYearId?: string
}) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)

    const [form, setForm] = useState({
        title:          homework.title || '',
        subject:        homework.subject || '',
        description:    homework.description || '',
        instructions:   homework.instructions || '',
        videoUrl:       homework.videoUrl || '',
        voiceNoteUrl:   homework.voiceNoteUrl || '',
        assignedTo:     (homework.assignedTo || 'CLASS') as 'CLASS' | 'INDIVIDUAL',
        classroomId:    homework.classroomId || classrooms[0]?.id || '',
        targetIds:      (homework.assignedTo === 'INDIVIDUAL' ? (homework.submissions?.map((s: any) => s.studentId) || []) : []) as string[],
        scheduledFor:   homework.scheduledFor ? new Date(homework.scheduledFor).toISOString().slice(0, 16) : '',
        dueDate:        homework.dueDate ? new Date(homework.dueDate).toISOString().slice(0, 16) : '',
        isPublished:    homework.isPublished,
        maxMarks:       homework.maxMarks?.toString() || '',
        hwType:         (homework.hwType || 'Written') as HwType,
        notifyParents:  homework.notifyParents ?? true,
        allowLate:      homework.allowLate ?? false,
        autoRemind:     homework.autoRemind ?? false,
    })

    const [attachments, setAttachments] = useState<Attachment[]>(
        (homework.attachments || []).map((a: any) => ({ ...a, uploading: false }))
    )

    const selectedClassName = classrooms.find(c => c.id === form.classroomId)?.name || 'General'

    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return
        const newFiles: Attachment[] = Array.from(files).map(f => ({ name: f.name, url: '', type: f.type, size: f.size, uploading: true }))
        setAttachments(prev => [...prev, ...newFiles])
        setIsUploading(true)
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const fd = new FormData()
            fd.append('file', file); fd.append('slug', slug)
            fd.append('classroomName', selectedClassName); fd.append('date', new Date().toISOString())
            try {
                const res = await uploadHomeworkFileAction(fd)
                setAttachments(prev => prev.map(a => a.name === file.name && a.uploading
                    ? { ...a, url: res.success && 'url' in res ? (res.url ?? '') : '', uploading: false, error: res.success ? undefined : (res.error ?? 'Upload failed') }
                    : a))
            } catch (e: any) {
                setAttachments(prev => prev.map(a => a.name === file.name && a.uploading ? { ...a, uploading: false, error: e.message } : a))
            }
        }
        setIsUploading(false)
    }, [slug, selectedClassName])

    const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, i) => i !== index))
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files) }

    const handleSave = (publish?: boolean) => {
        if (!form.title.trim()) { toast.error('Please enter a title'); return }
        const validAttachments = attachments.filter(a => a.url && !a.error)
        startTransition(async () => {
            const res = await updateHomeworkAction(slug, homework.id, {
                title:        form.title,
                subject:      form.subject || undefined,
                description:  form.description,
                instructions: form.instructions,
                videoUrl:     form.videoUrl || undefined,
                voiceNoteUrl: form.voiceNoteUrl || undefined,
                attachments:  validAttachments.map(a => ({ name: a.name, url: a.url, type: a.type, size: a.size })),
                assignedTo:   form.assignedTo,
                targetIds:    form.assignedTo === 'CLASS' ? [] : form.targetIds,
                classroomId:  form.classroomId || undefined,
                scheduledFor: form.scheduledFor ? new Date(form.scheduledFor) : null,
                dueDate:      form.dueDate ? new Date(form.dueDate) : null,
                isPublished:  publish !== undefined ? publish : form.isPublished,
            })
            if (res.success) { toast.success('Homework updated!'); router.push(`/s/${slug}/homework/${homework.id}`) }
            else toast.error(res.error || 'Failed to update')
        })
    }

    const formatBytes = (bytes?: number) => {
        if (!bytes) return ''
        if (bytes < 1024) return `${bytes}B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
    }

    const currentStudents = students.filter(s => s.classroomId === form.classroomId)
    const toggleStudent = (id: string) => setForm(p => ({ ...p, targetIds: p.targetIds.includes(id) ? p.targetIds.filter(x => x !== id) : [...p.targetIds, id] }))
    const selectAllStudents = () => setForm(p => ({ ...p, targetIds: currentStudents.map(s => s.id) }))
    const clearStudents = () => setForm(p => ({ ...p, targetIds: [] }))

    const inputCls = "w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
    const labelCls = "block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2"

    return (
        <div className="flex flex-col h-full overflow-hidden bg-zinc-50/50">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 pt-8 pb-4 shrink-0 border-b border-zinc-100 bg-white">
                <div className="flex items-center gap-4">
                    <Link href={`/s/${slug}/homework/${homework.id}`}
                        className="h-9 w-9 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center transition-all shadow-sm">
                        <ArrowLeft className="h-4 w-4 text-zinc-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-amber-500" /> Edit Homework
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium">
                            Modifying: <span className="text-zinc-900 font-bold">{homework.title}</span>
                        </p>
                    </div>
                </div>
                {/* Quick action bar */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/s/${slug}/homework/${homework.id}`}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-all">
                        Cancel
                    </Link>
                    <button type="button" disabled={isPending || isUploading} onClick={() => handleSave()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-300 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all disabled:opacity-50">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                    </button>
                    {!homework.isPublished && (
                        <button type="button" disabled={isPending || isUploading} onClick={() => handleSave(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all disabled:opacity-50 shadow-sm shadow-amber-300">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Save & Publish
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
                <div className="max-w-4xl mx-auto p-8 space-y-8">

                    {/* ── Title ─────────────────────────────── */}
                    <div>
                        <label className={labelCls}>Assignment Title *</label>
                        <input type="text" placeholder="e.g. Chapter 6 — Exercise 6.1"
                            value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className={inputCls} />
                    </div>

                    {/* ── Class Selector ─────────────────────── */}
                    <div>
                        <label className={labelCls}><GraduationCap className="inline h-3.5 w-3.5 mr-1" /> Select Class *</label>
                        <div className="flex gap-2 flex-wrap">
                            {classrooms.map(c => (
                                <button key={c.id} type="button"
                                    onClick={() => setForm(p => ({ ...p, classroomId: c.id, targetIds: [] }))}
                                    className={cn("px-4 py-2 rounded-xl border text-sm font-bold transition-all",
                                        form.classroomId === c.id
                                            ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200"
                                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400")}>
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Subject + Due Date ────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Subject</label>
                            <input type="text" placeholder="Mathematics" value={form.subject}
                                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                                className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}><Clock className="inline h-3.5 w-3.5 mr-1" /> Due Date</label>
                            <input type="datetime-local" value={form.dueDate}
                                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                                className={inputCls} />
                        </div>
                    </div>

                    {/* ── Description + Instructions ────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Description / Instructions</label>
                            <textarea placeholder="Describe the assignment, page numbers, questions to solve..." rows={4} value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                className={cn(inputCls, "resize-none")} />
                        </div>
                        <div>
                            <label className={labelCls}>Instructions for Parents</label>
                            <textarea placeholder="Notes for parents on how to help..." rows={4} value={form.instructions}
                                onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                                className={cn(inputCls, "resize-none")} />
                        </div>
                    </div>

                    {/* ── Max Marks + Type ──────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Max Marks</label>
                            <input type="number" placeholder="20" min={0} value={form.maxMarks}
                                onChange={e => setForm(p => ({ ...p, maxMarks: e.target.value }))}
                                className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Type</label>
                            <div className="flex gap-2 flex-wrap">
                                {HW_TYPES.map(t => (
                                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, hwType: t }))}
                                        className={cn("px-4 py-2 rounded-xl border text-sm font-bold transition-all",
                                            form.hwType === t
                                                ? "bg-zinc-900 text-white border-zinc-900"
                                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400")}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Assign To ─────────────────────────── */}
                    {form.classroomId && (
                        <div>
                            <label className={labelCls}>Assign To</label>
                            <div className="flex gap-3 mb-4">
                                {([{ value: 'CLASS', label: 'Whole Class', icon: Users }, { value: 'INDIVIDUAL', label: 'Custom Students', icon: User }] as const).map(opt => (
                                    <button key={opt.value} type="button" onClick={() => setForm(p => ({ ...p, assignedTo: opt.value }))}
                                        className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all",
                                            form.assignedTo === opt.value ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400")}>
                                        <opt.icon className="h-4 w-4" /> {opt.label}
                                    </button>
                                ))}
                            </div>
                            {form.assignedTo === 'INDIVIDUAL' && (
                                <div className="p-5 border border-zinc-200 rounded-2xl bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-zinc-900">Select Students ({form.targetIds.length}/{currentStudents.length})</h3>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={selectAllStudents} className="text-xs font-medium text-amber-500 hover:underline">Select All</button>
                                            <span className="text-zinc-300">|</span>
                                            <button type="button" onClick={clearStudents} className="text-xs font-medium text-zinc-500 hover:text-zinc-800">Clear</button>
                                        </div>
                                    </div>
                                    {currentStudents.length === 0 ? (
                                        <p className="text-sm text-zinc-400 py-4 text-center">No active students in this class.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                                            {currentStudents.map(student => {
                                                const sel = form.targetIds.includes(student.id)
                                                return (
                                                    <button key={student.id} type="button" onClick={() => toggleStudent(student.id)}
                                                        className={cn("flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left",
                                                            sel ? "border-amber-400 bg-amber-50" : "border-zinc-200 bg-white hover:border-zinc-300")}>
                                                        <span className={cn("text-sm font-medium", sel ? "text-amber-600" : "text-zinc-700")}>{student.firstName} {student.lastName}</span>
                                                        <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors", sel ? "border-amber-500 bg-amber-500 text-white" : "border-zinc-300")}>
                                                            {sel && <CheckCircle2 className="h-3 w-3" />}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── File Attachments ──────────────────── */}
                    <div>
                        <label className={labelCls}><Paperclip className="inline h-3.5 w-3.5 mr-1" /> Attach Files</label>
                        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                            <Upload className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                            <p className="text-sm font-bold text-zinc-500">Drop files or <span className="text-amber-500">click to browse</span></p>
                            <p className="text-xs text-zinc-400 mt-1">PDF, Images, Word Docs</p>
                            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />
                        </div>
                        {attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {attachments.map((att, i) => (
                                    <div key={i} className={cn("flex items-center gap-3 p-3 rounded-xl border",
                                        att.error ? 'border-red-100 bg-red-50' : att.uploading ? 'border-zinc-100 bg-zinc-50' : 'border-emerald-100 bg-emerald-50')}>
                                        {att.uploading ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400 shrink-0" /> : att.error ? <AlertCircle className="h-4 w-4 text-red-400 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-zinc-700 truncate">{att.name}</p>
                                            <p className="text-[10px] text-zinc-400">
                                                {att.error ? <span className="text-red-500">{att.error}</span> : att.uploading ? 'Uploading…' : <span className="text-emerald-600">✓ Ready {formatBytes(att.size)}</span>}
                                            </p>
                                        </div>
                                        <button onClick={() => removeAttachment(i)} className="h-6 w-6 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors shrink-0"><X className="h-3 w-3" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Video + Voice URL ─────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}><Youtube className="inline h-3.5 w-3.5 mr-1 text-red-500" /> Video URL</label>
                            <input type="url" placeholder="https://youtube.com/..." value={form.videoUrl}
                                onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}><Mic className="inline h-3.5 w-3.5 mr-1 text-purple-500" /> Voice Note URL</label>
                            <input type="url" placeholder="https://..." value={form.voiceNoteUrl}
                                onChange={e => setForm(p => ({ ...p, voiceNoteUrl: e.target.value }))} className={inputCls} />
                        </div>
                    </div>

                    {/* ── Scheduled For ─────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}><Calendar className="inline h-3.5 w-3.5 mr-1" /> Schedule For</label>
                            <input type="datetime-local" value={form.scheduledFor}
                                onChange={e => setForm(p => ({ ...p, scheduledFor: e.target.value }))} className={inputCls} />
                        </div>
                    </div>

                    {/* ── Toggles ───────────────────────────── */}
                    <div>
                        <label className={labelCls}>Options</label>
                        <div className="flex flex-wrap gap-3">
                            {([
                                { key: 'notifyParents', label: '🔔 Notify Parents', icon: Bell },
                                { key: 'allowLate',     label: '📤 Allow Late Submit', icon: Timer },
                                { key: 'autoRemind',    label: '⚡ Auto-Remind',      icon: Zap },
                            ] as const).map(({ key, label }) => {
                                const active = form[key]
                                return (
                                    <button key={key} type="button" onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                                        className={cn("px-4 py-2.5 rounded-xl border text-sm font-bold transition-all",
                                            active ? "bg-amber-50 border-amber-400 text-amber-700" : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400")}>
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* ── Save Bar ──────────────────────────── */}
                    <div className="flex items-center gap-4 pt-4 pb-8 border-t border-zinc-100">
                        <Link href={`/s/${slug}/homework/${homework.id}`} className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-all">Cancel</Link>
                        <div className="flex-1" />
                        <button type="button" disabled={isPending || isUploading} onClick={() => handleSave()}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-300 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all disabled:opacity-50">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
                        </button>
                        {!homework.isPublished && (
                            <button type="button" disabled={isPending || isUploading} onClick={() => handleSave(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all disabled:opacity-50 shadow-sm shadow-amber-200">
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Save & Publish
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
