import { validateUserSchoolAction } from "@/app/actions/session-actions";
import { redirect } from "next/navigation";
import { getCanteenSubscriptionsAction, getCanteenPackagesAction } from "@/app/actions/canteen-actions";
import { prisma } from "@/lib/prisma";
import CanteenBillingClient from "./CanteenBillingClient";

export default async function CanteenBillingPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const auth = await validateUserSchoolAction(params.slug);
    if (!auth.success || !auth.user) redirect(`/s/${params.slug}/login`);

    // school is on auth.user.school; for SUPER_ADMIN look it up by slug
    const school = auth.user.school ?? await (prisma as any).school.findUnique({
        where: { slug: params.slug },
        select: { id: true },
    });
    if (!school) redirect(`/s/${params.slug}/login`);

    const [subsRes, packagesRes] = await Promise.all([
        getCanteenSubscriptionsAction(params.slug),
        getCanteenPackagesAction(params.slug),
    ]);

    const students = await (prisma as any).student.findMany({
        where: { schoolId: school.id, status: "ACTIVE" },
        select: { id: true, firstName: true, lastName: true, admissionNumber: true, classroom: { select: { name: true } } },
        orderBy: [{ firstName: "asc" }],
    });

    return (
        <CanteenBillingClient
            slug={params.slug}
            subscriptions={subsRes.data ?? []}
            packages={packagesRes.data ?? []}
            students={students}
        />
    );
}
