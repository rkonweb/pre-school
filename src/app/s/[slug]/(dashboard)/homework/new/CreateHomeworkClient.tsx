"use client"

import React, { useState, useRef, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    BookOpen, Plus, ArrowLeft, Upload, X, FileText, Video, Mic,
    Image, File, Loader2, Calendar, Clock, Users, User, Save, Send,
    GraduationCap, Paperclip, CheckCircle2, AlertCircle, Youtube
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createHomeworkAction, uploadHomeworkFileAction } from '@/app/actions/homework-actions'

type Attachment = {
    name: string
    url: string
    type: string
    size?: number
    uploading?: boolean
    error?: string
}

export default function CreateHomeworkClient({
    slug,
    classrooms,
    students,
    currentUserId,
    academicYearId,
}: {
    slug: string
    classrooms: { id: string; name: string }[]
    students: { id: string; firstName: string; lastName: string; classroomId: string | null }[]
    currentUserId: string
    academicYearId?: string
}) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)

    const [form, setForm] = useState({
        title: '',
        description: '',
        instructions: '',
        videoUrl: '',
        voiceNoteUrl: '',
        assignedTo: 'CLASS' as 'CLASS' | 'INDIVIDUAL',
        classroomId: classrooms[0]?.id || '',
        targetIds: [] as string[],
        scheduledFor: '',
        dueDate: '',
        isPublished: false,
    })

    const [attachments, setAttachments] = useState<Attachment[]>([])

    const selectedClassName = classrooms.find(c => c.id === form.classroomId)?.name || 'General'

    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return

        const newFiles: Attachment[] = Array.from(files).map(f => ({
            name: f.name,
            url: '',
            type: f.type,
            size: f.size,
            uploading: true,
        }))

        setAttachments(prev => [...prev, ...newFiles])
        setIsUploading(true)

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            const formData = new FormData()
            formData.append('file', file)
            formData.append('slug', slug)
            formData.append('classroomName', selectedClassName)
            formData.append('date', new Date().toISOString())

            try {
                const res = await uploadHomeworkFileAction(formData)
                setAttachments(prev => prev.map(a =>
                    a.name === file.name && a.uploading
                        ? { ...a, url: res.success && 'url' in res ? (res.url ?? '') : '', uploading: false, error: res.success ? undefined : (res.error ?? 'Upload failed') }
                        : a
                ))
            } catch (e: any) {
                setAttachments(prev => prev.map(a =>
                    a.name === file.name && a.uploading
                        ? { ...a, uploading: false, error: e.message }
                        : a
                ))
            }
        }

        setIsUploading(false)
    }, [slug, selectedClassName])

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        handleFileSelect(e.dataTransfer.files)
    }

    const handleSubmit = (publish: boolean) => {
        if (!form.title.trim()) {
            toast.error('Please enter a title')
            return
        }
        if (form.assignedTo === 'CLASS' && !form.classroomId) {
            toast.error('Please select a class')
            return
        }

        const validAttachments = attachments.filter(a => a.url && !a.error)

        startTransition(async () => {
            const res = await createHomeworkAction(slug, {
                title: form.title,
                description: form.description,
                instructions: form.instructions,
                videoUrl: form.videoUrl || undefined,
                voiceNoteUrl: form.voiceNoteUrl || undefined,
                attachments: validAttachments.map(a => ({ name: a.name, url: a.url, type: a.type, size: a.size })),
                assignedTo: form.assignedTo,
                targetIds: form.assignedTo === 'CLASS' ? [] : form.targetIds,
                classroomId: form.assignedTo === 'CLASS' ? form.classroomId : undefined,
                scheduledFor: form.scheduledFor ? new Date(form.scheduledFor) : undefined,
                dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
                isPublished: publish,
                academicYearId,
            })

            if (res.success) {
                toast.success(publish ? 'Homework published!' : 'Saved as draft!')
                router.push(`/s/${slug}/homework`)
            } else {
                toast.error(res.error || 'Failed to create homework')
            }
        })
    }

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="h-4 w-4 text-pink-500" />
        if (type.startsWith('video/')) return <Video className="h-4 w-4 text-red-500" />
        if (type.startsWith('audio/')) return <Mic className="h-4 w-4 text-purple-500" />
        if (type === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />
        return <File className="h-4 w-4 text-zinc-500" />
    }

    const formatBytes = (bytes?: number) => {
        if (!bytes) return ''
        if (bytes < 1024) return `${bytes}B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
    }

    const currentStudents = students.filter(s => s.classroomId === form.classroomId)

    const toggleStudent = (studentId: string) => {
        setForm(p => ({
            ...p,
            targetIds: p.targetIds.includes(studentId)
                ? p.targetIds.filter(id => id !== studentId)
                : [...p.targetIds, studentId]
        }))
    }

    const selectAllStudents = () => setForm(p => ({ ...p, targetIds: currentStudents.map(s => s.id) }))
    const clearStudents = () => setForm(p => ({ ...p, targetIds: [] }))

    return (
        <div className="flex flex-col h-full overflow-hidden bg-zinc-50/50">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-8 pt-8 shrink-0">
                <div className="flex items-center gap-4 mb-2">
                    <Link
                        href={`/s/${slug}/homework`}
                        className="h-9 w-9 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4 text-zinc-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-brand" />
                            Create Homework
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium">Assign tasks, upload files, set due dates</p>
                    </div>
                </div>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-auto min-h-0">
                <div className="max-w-4xl mx-auto p-8 space-y-8">

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g., Weekend Fun Task — Find Red Objects"
                            className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                        />
                    </div>

                    {/* Description + Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Brief overview of this activity..."
                                rows={4}
                                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Instructions for Parents</label>
                            <textarea
                                value={form.instructions}
                                onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                                placeholder="Step-by-step guide for parents to help their child..."
                                rows={4}
                                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* 1. Class Selector */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                            <GraduationCap className="inline h-3.5 w-3.5 mr-1" />
                            1. Select Class
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {classrooms.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, classroomId: c.id, targetIds: [] }))}
                                    className={cn(
                                        "px-4 py-2 rounded-xl border text-sm font-bold transition-all",
                                        form.classroomId === c.id
                                            ? "bg-brand text-[var(--secondary-color)] border-brand shadow-sm shadow-brand/20"
                                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                                    )}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Assign To */}
                    {form.classroomId && (
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">2. Assign To</label>
                            <div className="grid grid-cols-2 gap-3 max-w-sm mb-4">
                                {([
                                    { value: 'CLASS', label: 'Whole Class', icon: Users },
                                    { value: 'INDIVIDUAL', label: 'Custom Students', icon: User },
                                ] as const).map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, assignedTo: opt.value }))}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all",
                                            form.assignedTo === opt.value
                                                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                                        )}
                                    >
                                        <opt.icon className="h-4 w-4" />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Student Selector */}
                            {form.assignedTo === 'INDIVIDUAL' && (
                                <div className="p-5 border border-zinc-200 rounded-2xl bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-zinc-900">Select Students ({form.targetIds.length}/{currentStudents.length})</h3>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={selectAllStudents} className="text-xs font-medium text-brand hover:underline">Select All</button>
                                            <span className="text-zinc-300">|</span>
                                            <button type="button" onClick={clearStudents} className="text-xs font-medium text-zinc-500 hover:text-zinc-800">Clear</button>
                                        </div>
                                    </div>
                                    {currentStudents.length === 0 ? (
                                        <p className="text-sm text-zinc-400 py-4 text-center">No active students found in this class.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {currentStudents.map(student => {
                                                const isSelected = form.targetIds.includes(student.id);
                                                return (
                                                    <button
                                                        key={student.id}
                                                        type="button"
                                                        onClick={() => toggleStudent(student.id)}
                                                        className={cn(
                                                            "flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left",
                                                            isSelected ? "border-brand bg-brand/5" : "border-zinc-200 bg-white hover:border-zinc-300"
                                                        )}
                                                    >
                                                        <span className={cn("text-sm font-medium", isSelected ? "text-brand" : "text-zinc-700")}>
                                                            {student.firstName} {student.lastName}
                                                        </span>
                                                        <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors", isSelected ? "border-brand bg-brand text-[var(--secondary-color)]" : "border-zinc-300")}>
                                                            {isSelected && <CheckCircle2 className="h-3 w-3" />}
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

                    {/* File Upload */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
                            <Paperclip className="inline h-3.5 w-3.5 mr-1" />
                            Attachments — Saved to Google Drive
                        </label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={e => e.preventDefault()}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-all"
                        >
                            <Upload className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                            <p className="text-sm font-bold text-zinc-500">
                                Drag & drop files here, or <span className="text-brand">click to browse</span>
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-1">
                                PDF, Images, Videos, Audio — Saved to: <span className="font-mono text-zinc-600">Homework / {selectedClassName} / Month / Day</span>
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.png,.jpg,.jpeg,.gif,.mp4,.mov,.mp3,.wav,.doc,.docx,.ppt,.pptx"
                                className="hidden"
                                onChange={e => handleFileSelect(e.target.files)}
                            />
                        </div>

                        {/* Attachment List */}
                        {attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {attachments.map((att, i) => (
                                    <div key={i} className={cn("flex items-center gap-3 p-3 rounded-xl border", att.error ? 'border-red-100 bg-red-50' : att.uploading ? 'border-zinc-100 bg-zinc-50' : 'border-emerald-100 bg-emerald-50')}>
                                        {att.uploading ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400 shrink-0" /> : att.error ? <AlertCircle className="h-4 w-4 text-red-400 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-zinc-700 truncate">{att.name}</p>
                                            <p className="text-[10px] text-zinc-400 mt-0.5">
                                                {att.error ? <span className="text-red-500">{att.error}</span> : att.uploading ? 'Uploading to Google Drive…' : <span className="text-emerald-600">✓ Uploaded {formatBytes(att.size)}</span>}
                                            </p>
                                        </div>
                                        <button onClick={() => removeAttachment(i)} className="h-6 w-6 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Video & Voice Note */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                                <Youtube className="inline h-3.5 w-3.5 mr-1 text-red-500" />
                                Video URL (YouTube / Drive)
                            </label>
                            <input
                                type="url"
                                value={form.videoUrl}
                                onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                                <Mic className="inline h-3.5 w-3.5 mr-1 text-purple-500" />
                                Voice Note URL
                            </label>
                            <input
                                type="url"
                                value={form.voiceNoteUrl}
                                onChange={e => setForm(p => ({ ...p, voiceNoteUrl: e.target.value }))}
                                placeholder="https://..."
                                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                                <Calendar className="inline h-3.5 w-3.5 mr-1" />
                                Scheduled For
                            </label>
                            <input
                                type="datetime-local"
                                value={form.scheduledFor}
                                onChange={e => setForm(p => ({ ...p, scheduledFor: e.target.value }))}
                                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                                <Clock className="inline h-3.5 w-3.5 mr-1" />
                                Due Date
                            </label>
                            <input
                                type="datetime-local"
                                value={form.dueDate}
                                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 pb-8 border-t border-zinc-100">
                        <Link
                            href={`/s/${slug}/homework`}
                            className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-all"
                        >
                            Cancel
                        </Link>
                        <div className="flex-1" />
                        <button
                            type="button"
                            disabled={isPending || isUploading}
                            onClick={() => handleSubmit(false)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-300 text-zinc-700 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save as Draft
                        </button>
                        <button
                            type="button"
                            disabled={isPending || isUploading}
                            onClick={() => handleSubmit(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Publish Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
