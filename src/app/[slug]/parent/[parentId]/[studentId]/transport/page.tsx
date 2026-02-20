

import React from "react";
import { getStudentTransportAction } from "@/app/actions/parent-actions";
import { TransportClient } from "@/components/mobile/TransportClient";
import { TransportApplication } from "@/components/mobile/TransportApplication";
import { TransportPayment } from "@/components/mobile/TransportPayment";
import { Clock, Ban } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageWrapper, StickyHeader } from "@/components/ui-theme";
import { HeaderSettingsButton } from "@/components/ui-theme/HeaderSettingsButton";

export default async function TransportPage(props: {
    params: Promise<{ slug: string; parentId: string; studentId: string }>;
    searchParams: Promise<{ preview?: string; phone?: string }>;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { slug, parentId, studentId } = params;
    const phone = searchParams.phone || "";

    // We can fetch data directly here
    const [transportRes, school] = await Promise.all([
        getStudentTransportAction(slug, studentId),
        prisma.school.findUnique({
            where: { slug },
            select: { googleMapsApiKey: true }
        })
    ]);

    if (!school) {
        notFound();
    }

    const header = (
        <StickyHeader
            title="Transport"
            rightAction={
                <HeaderSettingsButton
                    slug={slug}
                    parentId={parentId}
                    studentId={studentId}
                    phone={phone}
                />
            }
        />
    );

    // If no transport profile, Show Application Form
    if (!transportRes.success || !transportRes.transport) {
        const studentData = await prisma.student.findUnique({
            where: { id: studentId },
            select: { firstName: true, lastName: true, parentMobile: true }
        });

        return (
            <PageWrapper>
                {header}
                <TransportApplication
                    slug={slug}
                    studentId={studentId}
                    studentName={`${studentData?.firstName} ${studentData?.lastName}`}
                    parentPhone={studentData?.parentMobile || ""}
                    googleMapsApiKey={school.googleMapsApiKey || ""}
                    onSuccess={async () => {
                        "use server";
                        redirect(`/${slug}/parent/${parentId}/${studentId}/transport?refresh=${Date.now()}`);
                    }}
                />
            </PageWrapper>
        );
    }

    const transport = transportRes.transport;
    const status = transport.studentStatus || "ACTIVE";

    // PENDING
    if (status === "PENDING") {
        return (
            <PageWrapper>
                {header}
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                        <Clock className="w-10 h-10 text-yellow-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Application Under Review</h1>
                        <p className="text-gray-500 text-sm">Your transport application is currently being reviewed by the school administration. Please check back later.</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    // APPROVED / UNPAID
    if (status === "APPROVED" || status === "APPROVED_UNPAID") {
        return (
            <PageWrapper>
                {header}
                <TransportPayment
                    slug={slug}
                    studentId={studentId}
                    amount={transport.transportFee || 5000}
                    route={transport.route}
                    pickupStop={transport.profile?.pickupStop}
                    dropStop={transport.profile?.dropStop}
                    onSuccess={async () => {
                        "use server";
                        redirect(`/${slug}/parent/${parentId}/${studentId}/transport?refresh=${Date.now()}`);
                    }}
                />
            </PageWrapper>
        );
    }

    // REJECTED
    if (status === "REJECTED") {
        return (
            <PageWrapper>
                {header}
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <Ban className="w-10 h-10 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Application Declined</h1>
                        <p className="text-gray-500 text-sm">
                            {transport.profile?.rejectionReason
                                ? `Reason: ${transport.profile.rejectionReason}`
                                : "Your transport application was not approved. Please contact the school administration for more details."}
                        </p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    // ACTIVE / MOVING / COMPLETED -> Show Map
    return (
        <PageWrapper className="pb-0 h-[100dvh] overflow-hidden bg-white">
            <StickyHeader
                title="Live Tracking"
                subtitle="Transport"
                rightAction={
                    <HeaderSettingsButton
                        slug={slug}
                        parentId={parentId}
                        studentId={studentId}
                        phone={phone}
                    />
                }
            />
            <div className="flex-1 relative">
                <TransportClient
                    slug={slug}
                    parentId={parentId}
                    initialData={transportRes.transport}
                    studentId={studentId}
                    apiKey={school.googleMapsApiKey || ""}
                />
            </div>
        </PageWrapper>
    );
}
