"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Zap, CheckCircle, XCircle, 
    Users, Calendar, ChevronLeft, 
    Save, Loader2, Trophy
} from "lucide-react";
import { 
    SectionHeader, Btn
} from "@/components/ui/erp-ui";
import { 
    getSessionAttendanceAction,
    markActivityAttendanceAction 
} from "@/app/actions/extracurricular-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MarkAttendancePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const sessionId = params.sessionId as string;
    
    const [data, setData] = useState<any[]>([]);
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const res = await getSessionAttendanceAction(slug, sessionId);
            if (res.success) {
                setData(res.data);
                setSession(res.session);
            } else {
                toast.error(res.error || "Failed to load session");
                router.back();
            }
            setIsLoading(false);
        }
        loadData();
    }, [slug, sessionId, router]);

    const handleStatusChange = (studentId: string, status: string) => {
        setData(prev => prev.map(item => 
            item.studentId === studentId ? { ...item, status } : item
        ));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await markActivityAttendanceAction(slug, sessionId, data.map(item => ({
            studentId: item.studentId,
            status: item.status,
            notes: item.notes
        })));

        if (res.success) {
            toast.success("Attendance saved successfully");
            router.push(`/s/${slug}/extracurricular/attendance`);
        } else {
            toast.error(res.error || "Failed to save attendance");
        }
        setIsSaving(false);
    };

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-8 p-8 min-w-0">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-2xl bg-white border-2 border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-200 transition-all shadow-sm flex-shrink-0"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <SectionHeader
                    title="Mark Attendance"
                    subtitle={session ? `${session.activity.name} • ${format(new Date(session.date), 'MMM d, yyyy')}` : "Session Attendance"}
                    icon={Zap}
                    action={
                        <Btn 
                            variant="primary" 
                            icon={CheckCircle} 
                            loading={isSaving}
                            onClick={handleSave}
                            className="flex-1 lg:flex-none lg:min-w-[200px]"
                        >Save Attendance</Btn>
                    }
                />
            </div>

            <div className="bg-white rounded-[40px] border-2 border-zinc-100 overflow-hidden shadow-sm">
                <div className="p-6 bg-zinc-50 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Enrolled</span>
                            <span className="text-xl font-black text-zinc-900">{data.length} Students</span>
                        </div>
                        <div className="h-8 w-px bg-zinc-200" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Present</span>
                            <span className="text-xl font-black text-emerald-600">{data.filter(d => d.status === 'PRESENT').length}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Absent</span>
                            <span className="text-xl font-black text-rose-600">{data.filter(d => d.status === 'ABSENT').length}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Btn 
                            variant="secondary" 
                            onClick={() => setData(prev => prev.map(d => ({ ...d, status: 'PRESENT' })))} 
                        >
                            Mark All Present
                        </Btn>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white">
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Student Profile</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap text-center">Status</th>
                                <th className="px-8 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Remarks / Observation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {data.map((item) => (
                                <tr key={item.studentId} className="hover:bg-zinc-50/30 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden flex-shrink-0">
                                                <img src={item.student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.student.name}`} alt="" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[15px] font-black text-zinc-900 whitespace-nowrap">{item.student.name}</span>
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">{item.student.class}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center justify-center gap-2 bg-zinc-100/50 p-1.5 rounded-2xl w-fit mx-auto">
                                            <button
                                                onClick={() => handleStatusChange(item.studentId, 'PRESENT')}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                                    item.status === 'PRESENT' 
                                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                                                        : "text-zinc-400 hover:text-zinc-600"
                                                )}
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(item.studentId, 'ABSENT')}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                                    item.status === 'ABSENT' 
                                                        ? "bg-rose-600 text-white shadow-lg shadow-rose-200" 
                                                        : "text-zinc-400 hover:text-zinc-600"
                                                )}
                                            >
                                                Absent
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <input
                                            type="text"
                                            placeholder="Add a remark..."
                                            value={item.notes}
                                            onChange={(e) => setData(prev => prev.map(d => 
                                                d.studentId === item.studentId ? { ...d, notes: e.target.value } : d
                                            ))}
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-zinc-600 placeholder:text-zinc-300 transition-all outline-none"
                                        />
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-12 h-12 text-zinc-100" />
                                            <p className="text-sm font-black text-zinc-300 uppercase tracking-widest">No students enrolled</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
