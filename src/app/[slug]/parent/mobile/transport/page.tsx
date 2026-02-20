import { redirect, notFound } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { getStudentTransportAction, getFamilyStudentsAction } from "@/app/actions/parent-actions";
import { TransportClient } from "@/components/mobile/TransportClient";
import { TransportApplication } from "@/components/mobile/TransportApplication";
import { TransportPayment } from "@/components/mobile/TransportPayment";
import MobileShell from "@/components/mobile/MobileShell";
import { Clock, Ban } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ParentTransportPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ studentId?: string; preview?: string }>;
}) {
    const { slug } = await params;
    const { studentId: queryStudentId, preview } = await searchParams;

    const [userRes, school] = await Promise.all([
        getCurrentUserAction(),
        prisma.school.findUnique({
            where: { slug },
            select: { googleMapsApiKey: true }
        })
    ]);

    if (!school) {
        notFound();
    }

    // PREVIEW BYPASS: Use demo phone if preview mode is active
    const phone = (preview === "true") ? "9999999999" : (userRes.data?.mobile || "");

    if (preview !== "true" && (!userRes.success || !userRes.data)) {
        redirect("/parent-login");
    }

    // Get student context
    const familyRes = await getFamilyStudentsAction(slug, phone);
    if (!familyRes.success || !familyRes.students?.length) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-10 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-summer-navy mb-2">Access Denied</h1>
                    <p className="text-gray-500">No transport records found for your students.</p>
                </div>
            </div>
        );
    }

    const studentId = queryStudentId || familyRes.students[0].id;
    const transportRes = await getStudentTransportAction(slug, studentId, phone);

    // If no transport profile, Show Application Form
    if (!transportRes.success || !transportRes.transport) {
        return (
            <MobileShell slug={slug} hideFooter={false}>
                <TransportApplication slug={slug} studentId={studentId} onSuccess={() => redirect(`/${slug}/parent/mobile/transport?studentId=${studentId}&refresh=${Date.now()}`)} />
            </MobileShell>
        );
    }

    const transport = transportRes.transport;
    const status = transport.studentStatus || "ACTIVE"; // Default to active if field missing for legacy

    // PENDING
    if (status === "PENDING") {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                    <Clock className="w-10 h-10 text-yellow-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Application Under Review</h1>
                    <p className="text-gray-500 text-sm">Your transport application is currently being reviewed by the school administration. Please check back later.</p>
                </div>
                <Link href={`/${slug}/parent/mobile/dashboard`} className="text-blue-600 font-medium text-sm">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    // APPROVED / UNPAID
    if (status === "APPROVED" || status === "APPROVED_UNPAID") {
        return (
            <MobileShell slug={slug} hideFooter={false}>
                <TransportPayment
                    slug={slug}
                    studentId={studentId}
                    amount={transport.transportFee || 5000}
                    onSuccess={() => redirect(`/${slug}/parent/mobile/transport?studentId=${studentId}&refresh=${Date.now()}`)}
                />
            </MobileShell>
        );
    }

    // REJECTED
    if (status === "REJECTED") {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <Ban className="w-10 h-10 text-red-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Application Declined</h1>
                    <p className="text-gray-500 text-sm">Your transport application was not approved. Please contact the school administration for more details.</p>
                </div>
                <Link href={`/${slug}/parent/mobile/dashboard`} className="text-blue-600 font-medium text-sm">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    // ACTIVE / MOVING / COMPLETED -> Show Map
    return (
        <TransportClient
            slug={slug}
            parentId={userRes.data?.id || "demo-parent-id"}
            initialData={transportRes.transport}
            studentId={studentId}
            apiKey={school.googleMapsApiKey || ""}
        />
    );
}
