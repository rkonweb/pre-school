import { validateUserSchoolAction } from "@/app/actions/session-actions";
import { redirect } from "next/navigation";
import { getCanteenItemsAction } from "@/app/actions/canteen-actions";
import { prisma } from "@/lib/prisma";
import CanteenPOSClient from "./CanteenPOSClient";

export default async function CanteenPOSPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    const auth = await validateUserSchoolAction(slug);
    if (!auth.success || !auth.user) redirect(`/s/${slug}/login`);

    const school = auth.user.school ?? await (prisma as any).school.findUnique({
        where: { slug },
        select: { id: true, canteenGstType: true, canteenCommonGst: true },
    });
    if (!school) redirect(`/s/${slug}/login`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [itemsRes, students, recentOrders, todayStats] = await Promise.all([
        getCanteenItemsAction(slug),

        (prisma as any).student.findMany({
            where: { schoolId: school.id, status: "ACTIVE" },
            select: {
                id: true, firstName: true, lastName: true,
                admissionNumber: true, avatar: true,
                classroom: { select: { name: true } },
            },
            orderBy: [{ firstName: "asc" }],
        }),

        (prisma as any).canteenOrder.findMany({
            where: {
                student: { schoolId: school.id },
                orderDate: { gte: today },
            },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
                orderItems: { include: { item: { select: { name: true, price: true, mealType: true } } } },
            },
            orderBy: { orderDate: "desc" },
            take: 50,
        }),

        // Today's revenue stats
        (prisma as any).canteenOrder.aggregate({
            where: { student: { schoolId: school.id }, orderDate: { gte: today } },
            _sum: { totalAmount: true },
            _count: { id: true },
        }),
    ]);

    return (
        <CanteenPOSClient
            slug={slug}
            items={itemsRes.data ?? []}
            students={students as any}
            recentOrders={recentOrders as any}
            todayRevenue={todayStats._sum.totalAmount ?? 0}
            todayOrderCount={todayStats._count.id ?? 0}
            schoolGstType={school.canteenGstType || undefined}
            schoolCommonGst={school.canteenCommonGst || undefined}
        />
    );
}
