import React from 'react'
import { prisma } from '@/lib/prisma'
import CanteenMenuClient from './CanteenMenuClient'
import { getFoodCategoriesAction } from '@/app/actions/canteen-actions'

export default async function CanteenMenuPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const school = await prisma.school.findUnique({ where: { slug: slug } })

    const [items, menuPlans, foodCatsRes] = await Promise.all([
        prisma.canteenItem.findMany({
            where: { schoolId: school?.id },
            orderBy: { name: 'asc' }
        }) as any,
        prisma.canteenMenuPlan.findMany({
            where: { schoolId: school?.id }
        }),
        getFoodCategoriesAction(),
    ])

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Menu &amp; Timetable</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Manage food inventory and weekly meal schedules.</p>
                </div>
            </div>

            <CanteenMenuClient
                slug={slug}
                initialItems={JSON.parse(JSON.stringify(items))}
                initialPlans={JSON.parse(JSON.stringify(menuPlans))}
                foodCategories={foodCatsRes.data}
                schoolGstType={school?.canteenGstType || "NONE"}
                schoolCommonGst={school?.canteenCommonGst || 0}
            />
        </div>
    )
}
