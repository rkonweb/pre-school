import React from 'react'
import { prisma } from '@/lib/prisma'
import HostelBillingClient from './HostelBillingClient'

export default async function HostelBillingPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const school = await prisma.school.findUnique({ where: { slug: slug } })

    // Fetch all active allocations to bill them
    const activeAllocations = await prisma.hostelAllocation.findMany({
        where: {
            room: { hostel: { schoolId: school?.id } },
            status: "ACTIVE"
        },
        include: {
            student: true,
            room: { include: { hostel: true } }
        }
    })

    // Fetch Recent Fees categorized as HOSTEL
    const recentInvoices = await prisma.fee.findMany({
        where: {
            student: { schoolId: school?.id },
            category: "HOSTEL"
        },
        include: { student: true },
        orderBy: { createdAt: 'desc' },
        take: 20
    })

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Hostel Billing</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Generate fee invoices for active hostel residents.</p>
                </div>
            </div>

            <HostelBillingClient
                slug={slug}
                allocations={JSON.parse(JSON.stringify(activeAllocations))}
                recentInvoices={JSON.parse(JSON.stringify(recentInvoices))}
                currency={school?.currency || 'INR'}
            />
        </div>
    )
}
