import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { validateUserSchoolAction } from '@/app/actions/session-actions'
import { getHomeworkByIdAction } from '@/app/actions/homework-actions'
import EditHomeworkClient from './EditHomeworkClient'
import { getSelectedAcademicYearId } from '@/lib/getSelectedAcademicYear'

export const dynamic = 'force-dynamic'

export default async function EditHomeworkPage(props: {
    params: Promise<{ slug: string; id: string }>
}) {
    const params = await props.params
    const { slug, id } = params

    const auth = await validateUserSchoolAction(slug)
    if (!auth.success || !auth.user || !auth.user.schoolId) redirect(`/s/${slug}/homework`)

    const [hwRes, classrooms, academicYearId, students] = await Promise.all([
        getHomeworkByIdAction(slug, id),
        prisma.classroom.findMany({
            where: { schoolId: auth.user.schoolId },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        }),
        getSelectedAcademicYearId(slug, auth.user.schoolId),
        prisma.student.findMany({
            where: { schoolId: auth.user.schoolId, status: 'ACTIVE' },
            select: { id: true, firstName: true, lastName: true, classroomId: true },
            orderBy: { firstName: 'asc' }
        })
    ])

    if (!hwRes.success || !hwRes.data) return notFound()

    return (
        <EditHomeworkClient
            slug={slug}
            homework={hwRes.data}
            classrooms={classrooms}
            students={students}
            academicYearId={academicYearId}
        />
    )
}
