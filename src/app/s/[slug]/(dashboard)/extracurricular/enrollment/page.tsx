"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
    Plus, UserPlus, Users, Search, 
    Filter, Trash2, Calendar, Trophy
} from "lucide-react";
import { 
    SectionHeader, Btn, RowActions, 
    StatusChip 
} from "@/components/ui/erp-ui";
import { 
    getActivityEnrollmentsAction,
    deleteActivityEnrollmentAction
} from "@/app/actions/extracurricular-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { toast } from "sonner";
import { format } from "date-fns";
import { EnrollmentModal } from "@/components/dashboard/extracurricular/EnrollmentModal";

export default function EnrollmentPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async () => {
        setIsLoading(true);
        const res = await getActivityEnrollmentsAction(slug);
        if (res.success) {
            setEnrollments(res.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [slug]);

    const filtered = enrollments.filter(e => 
        e.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.activity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-8 p-8 min-w-0">
            <SectionHeader
                title="Student Enrollment"
                subtitle="Manage student registrations for sports, arts, and clubs."
                icon={UserPlus}
                action={
                    <Btn 
                        icon={Plus} 
                        onClick={() => {
                            setShowModal(true);
                        }} 
                    >New Enrollment</Btn>
                }
            />

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border-2 border-zinc-100 shadow-sm">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by student name or activity..."
                        className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-zinc-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50">
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Student</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Program</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Enrolled On</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((enrollment) => (
                                <tr key={enrollment.id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <img 
                                                    src={enrollment.student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollment.student.firstName}`} 
                                                    alt="" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-black text-zinc-900 whitespace-nowrap">
                                                    {enrollment.student.firstName} {enrollment.student.lastName}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                                                    {enrollment.student.currentClass?.name || "Unassigned"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-zinc-700 font-bold">
                                        <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                            {enrollment.activity.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 whitespace-nowrap text-sm font-bold text-zinc-500">
                                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                            {format(new Date(enrollment.createdAt), 'MMM d, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusChip label={enrollment.status} />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-end relative z-20">
                                            <RowActions
                                                onDelete={async () => {
                                                    if (confirm("Are you sure you want to remove this enrollment?")) {
                                                        const res = await deleteActivityEnrollmentAction(slug, enrollment.id);
                                                        if (res.success) {
                                                            toast.success("Enrollment deleted successfully");
                                                            loadData();
                                                        } else {
                                                            toast.error(res.error || "Failed to delete enrollment");
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Users className="w-12 h-12 text-zinc-200" />
                                            <p className="text-sm font-bold text-zinc-400">No enrollments found.</p>
                                            <Btn 
                                                variant="secondary" 
                                                onClick={() => setShowModal(true)} 
                                            >Create First Enrollment</Btn>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <EnrollmentModal
                    slug={slug}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
