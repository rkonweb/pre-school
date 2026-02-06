import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { getStudentTransportAction, getFamilyStudentsAction } from "@/app/actions/parent-actions";
import { TransportClient } from "@/components/mobile/TransportClient";

export default async function ParentTransportPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ studentId?: string; preview?: string }>;
}) {
    const { slug } = await params;
    const { studentId: queryStudentId, preview } = await searchParams;

    const userRes = await getCurrentUserAction();

    // PREVIEW BYPASS: Use demo phone if preview mode is active
    const phone = (preview === "true") ? "9999999999" : (userRes.data?.mobile || "");

    if (preview !== "true" && (!userRes.success || !userRes.data)) {
        redirect("/parent-login");
    }

    // Get student context
    const familyRes = await getFamilyStudentsAction(phone);
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
    const transportRes = await getStudentTransportAction(studentId, phone);

    if (!transportRes.success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-10 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-summer-navy mb-2">No Transport Info</h1>
                    <p className="text-gray-500">{transportRes.error || "This student is not assigned to any bus route."}</p>
                </div>
            </div>
        );
    }

    return (
        <TransportClient
            slug={slug}
            parentId={userRes.data?.id || "demo-parent-id"}
            initialData={transportRes.transport}
            studentId={studentId}
        />
    );
}
