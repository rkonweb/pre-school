import React from 'react'
import { prisma } from '@/lib/prisma'
import { validateUserSchoolAction } from '@/app/actions/session-actions'
import { redirect } from 'next/navigation'
import CreateHomeworkClient from './CreateHomeworkClient'

export const dynamic = 'force-dynamic'

export default async function NewHomeworkPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const { slug } = params

    const auth = await validateUserSchoolAction(slug)
    if (!auth.success || !auth.user || !auth.user.schoolId) {
        redirect(`/s/${slug}/homework`)
    }

    const [classrooms, academicYear, students] = await Promise.all([
        prisma.classroom.findMany({
            where: { schoolId: auth.user.schoolId },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        }),
        prisma.academicYear.findFirst({
            where: { schoolId: auth.user.schoolId, isCurrent: true },
            select: { id: true }
        }),
        prisma.student.findMany({
            where: { schoolId: auth.user.schoolId, status: 'ACTIVE' },
            select: { id: true, firstName: true, lastName: true, classroomId: true },
            orderBy: { firstName: 'asc' }
        })
    ])

    return (
        <CreateHomeworkClient
            slug={slug}
            classrooms={classrooms}
            students={students}
            currentUserId={auth.user.id}
            academicYearId={academicYear?.id}
        />
    )
}
