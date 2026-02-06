import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { getStudentMediaAction, getFamilyStudentsAction } from "@/app/actions/parent-actions";
import { MediaVault } from "@/components/mobile/MediaVault";
import { ChevronLeft, Grid } from "lucide-react";
import Link from "next/link";

export default async function ParentMediaPage({
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

    // Get students context
    const familyRes = await getFamilyStudentsAction(phone);
    if (!familyRes.success || !familyRes.students?.length) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-10 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-summer-navy mb-2">No Students Found</h1>
                    <p className="text-gray-500">We couldn't find any student records linked to your account.</p>
                </div>
            </div>
        );
    }

    const studentId = queryStudentId || familyRes.students[0].id;
    const mediaRes = await getStudentMediaAction(studentId);
    const mediaItems = (mediaRes.success ? mediaRes.media : []) || [];

    return (
        <div className="min-h-screen bg-white max-w-md mx-auto relative shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 border-b border-gray-50 bg-white sticky top-0 z-50">
                <div className="flex justify-between items-center">
                    <Link
                        href={`/${slug}/parent/mobile/dashboard${preview === "true" ? "?preview=true" : ""}`}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-6 h-6 text-summer-navy" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-summer-navy tracking-tight">MEDIA VAULT</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Your child's memories</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                        <Grid className="w-5 h-5 text-summer-navy" />
                    </div>
                </div>

                {/* Student Selection Pills */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-4">
                    {familyRes.students.map((student: any) => (
                        <Link
                            key={student.id}
                            href={`/${slug}/parent/mobile/media?studentId=${student.id}${preview === "true" ? "&preview=true" : ""}`}
                            className={cn(
                                "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                studentId === student.id
                                    ? "bg-summer-teal text-white shadow-lg shadow-teal-100"
                                    : "bg-gray-50 text-gray-400"
                            )}
                        >
                            {student.firstName}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Media Vault Component */}
            <div className="pt-4">
                <MediaVault items={mediaItems} />
            </div>

            {/* Floating Bottom Navigation (Mocked for context) */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 pointer-events-none z-50">
                <div className="bg-summer-navy rounded-[32px] p-2 flex justify-between items-center shadow-2xl pointer-events-auto">
                    <Link href={`/${slug}/parent/mobile/activity?studentId=${studentId}${preview === "true" ? "&preview=true" : ""}`} className="p-4 text-white/40 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </Link>
                    <div className="w-14 h-14 bg-summer-teal rounded-full flex items-center justify-center text-white shadow-xl">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <Link href={`/${slug}/parent/mobile/transport?studentId=${studentId}${preview === "true" ? "&preview=true" : ""}`} className="p-4 text-white/40 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.485V5.414a2 2 0 012-2l7.586 7.586a2 2 0 010 2.828l-5.586 5.586a2 2 0 01-1.414.586z"></path></svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Utility icon
function ImageIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
