"use client"

import React, { useState } from 'react'
import { Receipt, CalendarClock, Building2, User, FileText, CheckCircle2 } from 'lucide-react'
import { generateHostelFeeInvoiceAction } from '@/app/actions/hostel-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/context/SidebarContext'

export default function HostelBillingClient({ slug, allocations, recentInvoices }: { slug: string, allocations: any[], recentInvoices: any[] }) {
    const { currency } = useSidebar()
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [description, setDescription] = useState('Monthly Hostel Fee')
    const [isGenerating, setIsGenerating] = useState(false)
    const [selectedAllocationIds, setSelectedAllocationIds] = useState<string[]>([])

    const toggleAll = () => {
        if (selectedAllocationIds.length === allocations.length) setSelectedAllocationIds([])
        else setSelectedAllocationIds(allocations.map(a => a.id))
    }

    const toggleAllocation = (id: string) => {
        if (selectedAllocationIds.includes(id)) {
            setSelectedAllocationIds(selectedAllocationIds.filter(v => v !== id))
        } else {
            setSelectedAllocationIds([...selectedAllocationIds, id])
        }
    }

    const handleGenerate = async () => {
        if (selectedAllocationIds.length === 0) return toast.error("Select at least one resident")

        setIsGenerating(true)
        let successCount = 0
        let failCount = 0

        for (const id of selectedAllocationIds) {
            const res = await generateHostelFeeInvoiceAction(slug, id, new Date(selectedDate), description)
            if (res.success) successCount++
            else failCount++
        }

        setIsGenerating(false)
        if (successCount > 0) {
            toast.success(`Generated ${successCount} invoices successfully.`)
            setSelectedAllocationIds([]) // Clear selection
            setTimeout(() => window.location.reload(), 1500)
        }
        if (failCount > 0) {
            toast.error(`Failed to generate ${failCount} invoices.`)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-zinc-900">Active Residents</h3>
                            <p className="text-xs text-zinc-500">Select students to invoice {selectedAllocationIds.length > 0 && `(${selectedAllocationIds.length} selected)`}</p>
                        </div>
                        <button
                            onClick={toggleAll}
                            className="text-xs font-bold text-brand hover:underline"
                        >
                            {selectedAllocationIds.length === allocations.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="divide-y divide-zinc-100 max-h-[600px] overflow-y-auto">
                        {allocations.length === 0 && (
                            <div className="p-8 text-center text-zinc-400">
                                <User className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p className="font-medium text-sm">No active hostel allocations.</p>
                            </div>
                        )}
                        {allocations.map(allocation => (
                            <div key={allocation.id} className="p-4 flex items-center gap-4 hover:bg-zinc-50 transition-colors">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-zinc-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                                    checked={selectedAllocationIds.includes(allocation.id)}
                                    onChange={() => toggleAllocation(allocation.id)}
                                    title={`Select ${allocation.student.firstName}'s allocation`}
                                />
                                <div className="flex-1 min-w-0 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                                        {allocation.student.firstName[0]}{allocation.student.lastName[0]}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 flex-1">
                                        <div>
                                            <p className="font-bold text-sm text-zinc-900 truncate">{allocation.student.firstName} {allocation.student.lastName}</p>
                                            <p className="text-xs text-zinc-500 truncate">{allocation.student.grade || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-zinc-400" /> Rm {allocation.room.roomNumber}</p>
                                            <p className="text-xs text-zinc-500 truncate">{allocation.room.hostel.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-brand">{currency}{allocation.monthlyFee}</p>
                                            <p className="text-xs text-zinc-400">Monthly Fee</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <h3 className="font-black text-lg text-zinc-900 mb-4 flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-brand" /> Generate Invoice
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-700 block mb-1.5">Invoice Due Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 bg-zinc-50"
                                title="Select the due date for the invoice"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-700 block mb-1.5">Description Title</label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="e.g. October Hostel Fee"
                                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 bg-zinc-50"
                                title="Enter a description for the invoice"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || selectedAllocationIds.length === 0}
                            className="w-full py-3 rounded-xl font-bold bg-brand text-white shadow-sm shadow-brand/20 hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2"
                            title={isGenerating ? 'Processing...' : selectedAllocationIds.length === 0 ? 'Select residents to generate invoices' : `Generate ${selectedAllocationIds.length} invoice(s)`}
                        >
                            <FileText className="h-4 w-4" />
                            {isGenerating ? 'Processing...' : `Generate ${selectedAllocationIds.length} Invoice(s)`}
                        </button>
                    </div>
                </div>

                <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6">
                    <h3 className="font-bold text-sm text-zinc-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-zinc-400" /> Recent Invoices
                    </h3>
                    <div className="space-y-3">
                        {recentInvoices.map(invoice => (
                            <div key={invoice.id} className="bg-white border text-sm border-zinc-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="font-bold text-zinc-900 truncate w-32">{invoice.student.firstName}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-brand">{currency}{invoice.amount}</p>
                                    <p className={cn("text-[10px] font-bold uppercase", invoice.status === 'PENDING' ? 'text-amber-500' : 'text-emerald-500')}>
                                        {invoice.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentInvoices.length === 0 && (
                            <p className="text-xs text-zinc-400 text-center py-4">No recent hostel invoices found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
