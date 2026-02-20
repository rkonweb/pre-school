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
