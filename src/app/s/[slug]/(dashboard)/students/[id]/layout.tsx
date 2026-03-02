import { redirect } from "next/navigation";
import { getStudentAction } from "@/app/actions/student-actions";
import { ArrowLeft, User, Activity, Briefcase, ClipboardList, TrendingUp, Heart, BookOpen, Target, GraduationCap, FileUp, Trash2, Edit3, X } from "lucide-react";
import Link from "next/link";
import { StudentAvatar, cleanName } from "@/components/dashboard/students/StudentAvatar";
import { cn } from "@/lib/utils";
import { StudentProfileHeader } from "./StudentProfileHeader";

export default async function StudentProfileLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { slug: string; id: string };
}) {
    // Fetch minimal header data securely on the server
    const { slug, id } = await params;
    const res = await getStudentAction(slug, id);

    if (!res.success || !res.student) {
        redirect(`/s/${slug}/students`);
    }

    const student = res.student;

    return (
        <div className="flex flex-col gap-8 w-full max-w-full mx-auto pb-20">
            {/* Header (Client Component for interactivity like photo upload & back button) */}
            <StudentProfileHeader student={student} slug={slug} id={id} />

            {/* Navigation Tabs */}
            {/* The `<main>` wrapper in layout.tsx has overflow-y-auto and p-4 sm:p-6 lg:p-8 padding. 
                To stick flush against the top border of `<main>` (under the header), we must use negative top offsets exactly equal to the padding. */}
            <div className="flex p-1.5 bg-zinc-100/80 backdrop-blur-md rounded-[28px] w-full overflow-x-auto shadow-inner sticky -top-4 sm:-top-6 lg:-top-8 z-[90]">
                {[
                    { id: "profile", label: "Profile", icon: "User", path: "" },
                    { id: "attendance", label: "Attendance", icon: "Activity", path: "/attendance" },
                    { id: "fees", label: "Fees", icon: "Briefcase", path: "/fees" },
                    { id: "reports", label: "Reports", icon: "ClipboardList", path: "/reports" },
                    { id: "progress", label: "Progress", icon: "TrendingUp", path: "/progress" },
                    { id: "health", label: "Health", icon: "Heart", path: "/health" },
                    { id: "library", label: "Library", icon: "BookOpen", path: "/library" },
                    { id: "development", label: "Development", icon: "Target", path: "/development" },
                ].map((tab: any) => (
                    <TabLink key={tab.id} tab={tab} slug={slug} id={id} />
                ))}
            </div>

            {/* Nested Route Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </div>
    );
}

// Client Component Wrapper for Tab Links to handle active state dynamically
// In a real implementation we would use usePathname
import { TabLink } from "./TabLink";
