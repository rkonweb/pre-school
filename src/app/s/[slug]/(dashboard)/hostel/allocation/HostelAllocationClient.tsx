"use client"

import React, { useState, useMemo, useTransition, useCallback } from 'react'
import {
    Search, User, Bed, ArrowRight, Save, LayoutGrid,
    X, Home, Users, CheckCircle2, AlertCircle, Trash2,
    Users2, Building2, UserPlus, LogOut, Loader2, Info,
    Filter, MoreHorizontal, GraduationCap, School, CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { allocateStudentToRoomAction, vacateStudentFromRoomAction } from '@/app/actions/hostel-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/context/SidebarContext'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Student = {
    id: string
    firstName: string
    lastName: string
    grade: string | null
    gender: string | null
    avatar?: string
    classroom: { id: string, name: string } | null
    hostelAllocations: any[]
}

type Hostel = {
    id: string
    name: string
    gender: string
    rooms: any[]
}

export default function HostelAllocationClient({
    slug,
    hostels,
    initialStudents,
    availableGrades,
    availableSections,
}: {
    slug: string,
    hostels: Hostel[],
    initialStudents: Student[]
    availableGrades: string[]
    availableSections: string[]
}) {
    const { currency } = useSidebar()
    const [students, setStudents] = useState<Student[]>(initialStudents)
    const [nameSearch, setNameSearch] = useState('')
    const [gradeFilter, setGradeFilter] = useState('ALL')
    const [sectionFilter, setSectionFilter] = useState('ALL')
    const [statusFilter, setStatusFilter] = useState('ALL')

    const [isPending, startTransition] = useTransition()
    const [allocationTarget, setAllocationTarget] = useState<Student | null>(null)
    const [vacateTarget, setVacateTarget] = useState<Student | null>(null)
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
    const [customFee, setCustomFee] = useState<string>('')

    // Filter Logic
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesName = `${s.firstName} ${s.lastName}`.toLowerCase().includes(nameSearch.toLowerCase())
            const matchesGrade = gradeFilter === 'ALL' || s.grade === gradeFilter
            const matchesSection = sectionFilter === 'ALL' || s.classroom?.name === sectionFilter

            const isAllocated = s.hostelAllocations.length > 0
            const matchesStatus = statusFilter === 'ALL' ||
                (statusFilter === 'ALLOCATED' && isAllocated) ||
                (statusFilter === 'UNALLOCATED' && !isAllocated)

            return matchesName && matchesGrade && matchesSection && matchesStatus
        })
    }, [students, nameSearch, gradeFilter, sectionFilter, statusFilter])

    // Stats
    const stats = useMemo(() => {
        const total = students.length
        const allocated = students.filter(s => s.hostelAllocations.length > 0).length
        return {
            total,
            allocated,
            unallocated: total - allocated
        }
    }, [students])

    const handleAllocate = useCallback(() => {
        if (!allocationTarget || !selectedRoomId) return

        const room = hostels.flatMap(h => h.rooms).find(r => r.id === selectedRoomId)
        if (!room) return

        startTransition(async () => {
            const fee = customFee ? parseFloat(customFee) : (room.baseCost || 0)
            const res = await allocateStudentToRoomAction(slug, selectedRoomId, allocationTarget.id, fee)

            if (res.success) {
                toast.success("Student assigned to room!")

                // Real-time update
                const hostel = hostels.find(h => h.rooms.some(r => r.id === selectedRoomId))
                const newAllocation = {
                    id: `tmp-${Date.now()}`,
                    roomId: selectedRoomId,
                    status: "ACTIVE",
                    room: {
                        id: selectedRoomId,
                        roomNumber: room.roomNumber,
                        hostel: { name: hostel?.name }
                    }
                }

                setStudents(prev => prev.map(s =>
                    s.id === allocationTarget.id
                        ? { ...s, hostelAllocations: [newAllocation] }
                        : s
                ))

                setAllocationTarget(null)
                setSelectedRoomId(null)
                setCustomFee('')
            } else {
                toast.error(res.error)
            }
        })
    }, [allocationTarget, selectedRoomId, slug, hostels, customFee])

    const handleVacate = useCallback(() => {
        if (!vacateTarget) return
        const allocation = vacateTarget.hostelAllocations[0]
        if (!allocation) return

        startTransition(async () => {
            const res = await vacateStudentFromRoomAction(slug, allocation.roomId, vacateTarget.id)
            if (res.success) {
                toast.success("Room vacated successfully")
                setStudents(prev => prev.map(s =>
                    s.id === vacateTarget.id
                        ? { ...s, hostelAllocations: [] }
                        : s
                ))
                setVacateTarget(null)
            } else {
                toast.error(res.error)
            }
        })
    }, [vacateTarget, slug])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header Section */}
            <div className="p-8 bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase">
                        <Users2 className="h-8 w-8 text-brand" />
                        Hostel Allocation
                    </h1>
                    <p className="text-zinc-400 font-medium text-sm mt-1">Manage room assignments and student residency status.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-11 px-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-md outline-none"
                                title="More options"
                            >
                                <MoreHorizontal className="h-5 w-5 text-white/70" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-52">
                            <DropdownMenuItem asChild>
                                <Link href={`/s/${slug}/hostel`} className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-zinc-400" />
                                    Hostel Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/s/${slug}/hostel/billing`} className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-zinc-400" />
                                    Hostel Billing
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/s/${slug}/hostel/settings`} className="flex items-center gap-2">
                                    <Home className="h-4 w-4 text-zinc-400" />
                                    Manage Buildings
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-white border-b border-zinc-200 flex flex-wrap items-center gap-4 shrink-0">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        placeholder="Search student name..."
                        value={nameSearch}
                        onChange={e => setNameSearch(e.target.value)}
                        className="w-full border border-zinc-200 bg-zinc-50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
                        title="Search student name"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-400" />
                    <select
                        value={gradeFilter}
                        onChange={e => setGradeFilter(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                        title="Filter by Grade"
                    >
                        <option value="ALL">All Grades</option>
                        {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>

                    <select
                        value={sectionFilter}
                        onChange={e => setSectionFilter(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                        title="Filter by Section"
                    >
                        <option value="ALL">All Sections</option>
                        {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                        title="Filter by Allocation Status"
                    >
                        <option value="ALL">All Allocation Status</option>
                        <option value="ALLOCATED">Allocated</option>
                        <option value="UNALLOCATED">Unallocated</option>
                    </select>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <Badge variant="outline" className="bg-zinc-50 text-zinc-600 border-zinc-200 py-1.5 px-3">
                        Total {stats.total}
                    </Badge>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 py-1.5 px-3">
                        Allocated {stats.allocated}
                    </Badge>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 py-1.5 px-3">
                        Unallocated {stats.unallocated}
                    </Badge>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto min-h-0 bg-white">
                <Table>
                    <TableHeader className="sticky top-0 bg-zinc-50 z-10 shadow-sm">
                        <TableRow>
                            <TableHead className="font-black text-xs uppercase tracking-widest py-4">Student</TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest text-center">Grade</TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest text-center">Section</TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest text-center">Residency</TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest">Assigned Room</TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map((student) => {
                            const allocation = student.hostelAllocations[0]
                            const isAllocated = !!allocation

                            return (
                                <TableRow key={student.id} className="group hover:bg-zinc-50/80 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-xs">
                                                {student.firstName[0]}{student.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-zinc-900 text-sm">{student.firstName} {student.lastName}</p>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{student.gender}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-sm text-zinc-600">
                                        {student.grade || '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {student.classroom ? (
                                            <Badge variant="outline" className="bg-zinc-50 text-zinc-500 border-zinc-200">
                                                {student.classroom.name}
                                            </Badge>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {isAllocated ? (
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                                                In-Hostel
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-zinc-200 text-zinc-500 hover:bg-zinc-200 border-none text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                                                Day Scholar
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isAllocated ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                <div>
                                                    <p className="font-bold text-sm text-zinc-800">{allocation.room.hostel.name}</p>
                                                    <p className="text-[10px] font-black text-brand uppercase tracking-widest">RM {allocation.room.roomNumber}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-300 italic text-xs">Not assigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {isAllocated ? (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setVacateTarget(student)}
                                                    className="h-8 rounded-lg font-bold text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100"
                                                >
                                                    <LogOut className="h-3.5 w-3.5 mr-1" />
                                                    Vacate
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setAllocationTarget(student)
                                                        setSelectedRoomId(null)
                                                    }}
                                                    className="h-8 rounded-lg font-bold text-xs bg-brand text-white shadow-sm"
                                                >
                                                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                                                    Assign Room
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>

                {filteredStudents.length === 0 && (
                    <div className="p-20 text-center">
                        <Users className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                        <h3 className="font-black text-lg text-zinc-400">No students matching criteria</h3>
                    </div>
                )}
            </div>

            {/* Allocation Dialog */}
            <Dialog open={!!allocationTarget} onOpenChange={() => setAllocationTarget(null)}>
                <DialogContent className="max-w-4xl p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-zinc-900 text-white">
                        <DialogTitle className="text-2xl font-black">Assign Room</DialogTitle>
                        <DialogDescription className="text-zinc-400 font-medium">
                            Selecting room for <span className="text-white font-black">{allocationTarget?.firstName} {allocationTarget?.lastName}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 bg-zinc-50 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {hostels.map(hostel => (
                                <div key={hostel.id} className="space-y-3">
                                    <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <Building2 className="h-3 w-3" />
                                        {hostel.name} ({hostel.gender})
                                    </h4>
                                    <div className="space-y-2">
                                        {hostel.rooms.map((room: any) => {
                                            const isFull = room.allocations?.length >= room.capacity
                                            const isSelected = selectedRoomId === room.id

                                            // Gender check (suggested)
                                            const genderMatch = hostel.gender.toLowerCase() === allocationTarget?.gender?.toLowerCase()

                                            return (
                                                <button
                                                    key={room.id}
                                                    disabled={isFull}
                                                    onClick={() => {
                                                        setSelectedRoomId(room.id)
                                                        setCustomFee(room.baseCost.toString())
                                                    }}
                                                    className={cn(
                                                        "w-full text-left p-3 rounded-2xl border transition-all flex flex-col",
                                                        isSelected
                                                            ? "bg-brand border-brand/20 shadow-lg shadow-brand/10 text-white"
                                                            : isFull
                                                                ? "bg-zinc-100 border-zinc-200 opacity-50 cursor-not-allowed"
                                                                : "bg-white border-zinc-200 hover:border-brand/40"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-black text-sm">Room {room.roomNumber}</span>
                                                        <span className={cn("text-xs font-black", isSelected ? "text-white/80" : "text-brand")}>{currency}{room.baseCost}</span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div className="flex gap-1">
                                                            {Array.from({ length: room.capacity }).map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={cn(
                                                                        "h-1 w-3 rounded-full",
                                                                        i < (room.allocations?.length || 0)
                                                                            ? (isSelected ? "bg-white/40" : "bg-rose-400")
                                                                            : (isSelected ? "bg-white/20" : "bg-emerald-400/20")
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className={cn("text-[9px] font-black uppercase tracking-tighter", isSelected ? "text-white/60" : "text-zinc-400")}>
                                                            {room.capacity - (room.allocations?.length || 0)} FREE
                                                        </span>
                                                    </div>
                                                    {!genderMatch && (
                                                        <div className="mt-2 flex items-center gap-1 text-[8px] font-black uppercase text-orange-500">
                                                            <AlertCircle className="h-2.5 w-2.5" />
                                                            Gender Mismatch
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-white border-t border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {selectedRoomId && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Pricing Override</p>
                                    <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 h-10">
                                        <span className="text-sm font-bold text-zinc-400">{currency}</span>
                                        <input
                                            type="number"
                                            value={customFee}
                                            onChange={e => setCustomFee(e.target.value)}
                                            className="bg-transparent text-sm font-black w-24 focus:outline-none"
                                            title="Custom Fee"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setAllocationTarget(null)}>Cancel</Button>
                            <Button
                                className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl px-8 font-black h-11 shadow-xl shadow-zinc-200"
                                disabled={!selectedRoomId || isPending}
                                onClick={handleAllocate}
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                Confirm Assignment
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Vacate Confirmation */}
            <Dialog open={!!vacateTarget} onOpenChange={() => setVacateTarget(null)}>
                <DialogContent className="max-w-sm rounded-[32px] p-8 border-none shadow-2xl">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                            <LogOut className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-xl font-black text-zinc-900 mb-2">Vacate Room?</DialogTitle>
                        <DialogDescription className="font-medium text-zinc-500 mb-6">
                            Are you sure you want to remove <span className="text-zinc-900 font-black">{vacateTarget?.firstName} {vacateTarget?.lastName}</span> from the hostel?
                        </DialogDescription>

                        <div className="w-full flex flex-col gap-2">
                            <Button
                                variant="destructive"
                                className="w-full h-12 rounded-2xl font-black bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200"
                                onClick={handleVacate}
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Vacate"}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-2xl font-bold"
                                onClick={() => setVacateTarget(null)}
                            >
                                Nevermind
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}
