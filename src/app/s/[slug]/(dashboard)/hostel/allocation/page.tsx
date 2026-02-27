import React from 'react'
import { getHostelsAction } from '@/app/actions/hostel-actions'
import { prisma } from '@/lib/prisma'
import HostelAllocationClient from './HostelAllocationClient'

export default async function HostelAllocationPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const response = await getHostelsAction(slug)
    const hostels = response.success ? response.data : []

    // Fetch all active students with their current classroom and active hostel allocation
    const school = await prisma.school.findUnique({ where: { slug: slug } })
    if (!school) return <div>School not found</div>

    const students = await prisma.student.findMany({
        where: { schoolId: school.id, status: 'ACTIVE' },
        include: {
            classroom: {
                select: {
                    id: true,
                    name: true,
                }
            },
            hostelAllocations: {
                where: { status: 'ACTIVE' },
                include: {
                    room: {
                        include: {
                            hostel: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { grade: 'asc' },
            { firstName: 'asc' }
        ]
    })

    // Prepare filter options
    const grades = Array.from(new Set(students.map(s => s.grade).filter(Boolean))) as string[]
    const sections = Array.from(new Set(students.map(s => s.classroom?.name).filter(Boolean))) as string[]

    return (
        <div className="flex-1 space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Hostel Allocation</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Comprehensive student residency management.</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                <HostelAllocationClient
                    slug={slug}
                    hostels={hostels}
                    initialStudents={JSON.parse(JSON.stringify(students))}
                    availableGrades={grades.sort()}
                    availableSections={sections.sort()}
                    currency={school.currency}
                />
            </div>
        </div>
    )
}
