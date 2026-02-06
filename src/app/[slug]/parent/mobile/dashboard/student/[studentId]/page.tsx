import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import {
    getStudentDetailsAction,
    getStudentAttendanceAction,
    getStudentFeesAction
} from "@/app/actions/parent-actions";
import { StudentProfileView } from "@/components/mobile/StudentProfileView";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default async function StudentDetailsPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string; studentId: string }>;
    searchParams: Promise<{ preview?: string }>;
}) {
    const { slug, studentId } = await params;
    const { preview } = await searchParams;

    const userRes = await getCurrentUserAction();

    // PREVIEW BYPASS: Use demo phone if preview mode is active
    const phone = (preview === "true") ? "9999999999" : (userRes.data?.mobile || "");

    if (preview !== "true" && (!userRes.success || !userRes.data)) {
        redirect("/parent-login");
    }

    // Fetch Deep Data in Parallel
    const [detailsRes, attendanceRes, feesRes] = await Promise.all([
        getStudentDetailsAction(studentId, phone),
        getStudentAttendanceAction(studentId, phone),
        getStudentFeesAction(studentId, phone)
    ]);

    if (!detailsRes.success || !detailsRes.student) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
                <h1 className="text-2xl font-black text-summer-navy mb-2">Not Found</h1>
                <p className="text-gray-500 mb-6">We couldn't locate this student's profile.</p>
                <Link href={`/${slug}/parent/mobile/dashboard`} className="px-8 py-3 bg-summer-navy text-white rounded-2xl font-bold">
                    Go Back
                </Link>
            </div>
        );
    }

    const student = detailsRes.student;
    const attendancePct = attendanceRes.success ? (attendanceRes as any).stats?.percentage : (student.stats?.attendance?.percentage || 0);
    const feesDue = feesRes.success ? (feesRes as any).summary?.totalDue : (student.stats?.fees?.totalDue || 0);

    const classroom = student.classroom;
    const teacher = classroom?.teacher;

    return (
        <div className="min-h-screen bg-white max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
            {/* Floating Header */}
            <div className="absolute top-12 left-6 right-6 z-50 flex justify-between items-center">
                <Link
                    href={`/${slug}/parent/mobile/dashboard${preview === "true" ? "?preview=true" : ""}`}
                    className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
                >
                    <ChevronLeft className="w-6 h-6 text-summer-navy" />
                </Link>
                <button className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border border-white/20 flex items-center justify-center text-summer-navy active:scale-95 transition-transform">
                    <MoreHorizontal className="w-6 h-6" />
                </button>
            </div>

            <StudentProfileView
                student={student}
                attendancePct={attendancePct}
                feesDue={feesDue}
                classroom={classroom}
                teacher={teacher}
            />

            {/* Simplified Mobile Nav context */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 pointer-events-none z-50">
                <div className="bg-summer-navy rounded-[32px] p-2 flex justify-between items-center shadow-2xl pointer-events-auto">
                    <Link href={`/${slug}/parent/mobile/dashboard${preview === "true" ? "?preview=true" : ""}`} className="p-4 text-white/40">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    </Link>
                    <Link href={`/${slug}/parent/mobile/activity?studentId=${studentId}${preview === "true" ? "&preview=true" : ""}`} className="p-4 text-white/40">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </Link>
                    <div className="w-14 h-14 bg-vibrant-pink rounded-full flex items-center justify-center text-white shadow-xl">
                        <User className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Icon helper
function User(props: any) {
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
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
