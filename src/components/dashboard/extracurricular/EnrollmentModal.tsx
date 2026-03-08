"use client";

import { useEffect, useState } from "react";
import { 
    X, UserPlus, Search, Info, 
    Check, Loader2 
} from "lucide-react";
import { Btn } from "@/components/ui/erp-ui";
import { 
    enrollStudentAction, 
    getActivitiesAction 
} from "@/app/actions/extracurricular-actions";
import { getStudentsAction } from "@/app/actions/student-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EnrollmentModalProps {
    slug: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function EnrollmentModal({ slug, onClose, onSuccess }: EnrollmentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState("");
    
    const [formData, setFormData] = useState({
        studentId: "",
        activityId: "",
        notes: ""
    });

    useEffect(() => {
        async function loadActivities() {
            const res = await getActivitiesAction(slug);
            if (res.success) setActivities(res.data || []);
        }
        loadActivities();
    }, [slug]);

    useEffect(() => {
        if (studentSearch.length < 2) {
            setStudents([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            const res = await getStudentsAction(slug, { search: studentSearch, limit: 5 });
            if (res.success) {
                setStudents(res.students || []);
            }
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [studentSearch, slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.studentId || !formData.activityId) {
            toast.error("Please select both a student and an activity");
            return;
        }

        setIsLoading(true);
        const res = await enrollStudentAction(slug, formData);

        if (res.success) {
            toast.success("Student enrolled successfully");
            onSuccess();
        } else {
            toast.error(res.error || "Enrollment failed");
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8 pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900">New Enrollment</h2>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Student Registration</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-black text-zinc-900 ml-1">Search Student*</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Type student name or admission number..."
                                className="w-full pl-11 pr-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-blue-500/20 outline-none transition-all"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                            )}
                        </div>
                        
                        {students.length > 0 && (
                            <div className="mt-2 bg-white rounded-2xl border-2 border-zinc-100 shadow-xl overflow-hidden">
                                {students.map(s => (
                                    <div 
                                        key={s.id}
                                        onClick={() => {
                                            setFormData({ ...formData, studentId: s.id });
                                            setStudentSearch(`${s.name} (${s.admissionNumber})`);
                                            setStudents([]);
                                        }}
                                        className={cn(
                                            "p-3 flex items-center gap-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-zinc-50 last:border-none",
                                            formData.studentId === s.id && "bg-blue-50/50"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100">
                                            <img src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt={s.name} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-zinc-900">{s.name}</span>
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase">{s.class} • {s.admissionNumber}</span>
                                        </div>
                                        {formData.studentId === s.id && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-black text-zinc-900 ml-1">Select Program*</label>
                        <select
                            value={formData.activityId}
                            onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                            className="px-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-blue-500/20 outline-none transition-all"
                        >
                            <option value="">Choose an activity...</option>
                            {activities.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-black text-zinc-900 ml-1">Additional Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="e.g. Skill level, medical requirements, or goals..."
                            rows={3}
                            className="px-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-blue-500/20 outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-4 mt-4">
                        <Btn
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >Cancel</Btn>
                        <Btn
                            icon={isLoading ? Loader2 : Check}
                            variant="primary"
                            onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
                            className={cn("flex-1", isLoading && "animate-pulse")}
                            disabled={isLoading}
                        >Enroll Student</Btn>
                    </div>
                </form>
            </div>
        </div>
    );
}
