import React from 'react'
import { prisma } from '@/lib/prisma'
import { validateUserSchoolAction } from '@/app/actions/session-actions'
import { redirect } from 'next/navigation'
import CreateHomeworkClient from './CreateHomeworkClient'
import { getSelectedAcademicYearId } from '@/lib/getSelectedAcademicYear'

export const dynamic = 'force-dynamic'

export default async function NewHomeworkPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const { slug } = params

    const auth = await validateUserSchoolAction(slug)
    if (!auth.success || !auth.user || !auth.user.schoolId) {
        redirect(`/s/${slug}/homework`)
    }

    const [classrooms, academicYearId, students] = await Promise.all([
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

    return (
        <CreateHomeworkClient
            slug={slug}
            classrooms={classrooms}
            students={students}
            currentUserId={auth.user.id}
            academicYearId={academicYearId}
        />
    )
}
