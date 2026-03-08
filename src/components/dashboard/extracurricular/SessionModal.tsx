"use client";

import { useEffect, useState } from "react";
import { 
    X, Zap, Trophy, Users, 
    Check, Loader2, Calendar
} from "lucide-react";
import { Btn } from "@/components/ui/erp-ui";
import { 
    createActivitySessionAction, 
    getActivitiesAction 
} from "@/app/actions/extracurricular-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SessionModalProps {
    slug: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function SessionModal({ slug, onClose, onSuccess }: SessionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [activities, setActivities] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        activityId: "",
        coachId: "",
        date: new Date().toISOString().split('T')[0],
        topic: ""
    });

    useEffect(() => {
        async function loadData() {
            const [actRes, staffRes] = await Promise.all([
                getActivitiesAction(slug),
                getStaffAction(slug)
            ]);
            if (actRes.success) setActivities(actRes.data || []);
            if (staffRes.success) setStaff(staffRes.data || []);
        }
        loadData();
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.activityId || !formData.date) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        const res = await createActivitySessionAction(slug, {
            ...formData,
            date: new Date(formData.date)
        });

        if (res.success) {
            toast.success("Session created");
            onSuccess();
        } else {
            toast.error(res.error || "Failed to create session");
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8 pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900">Start Session</h2>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Active Track</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[13px] font-black text-zinc-900 ml-1">Select Program*</label>
                            <select
                                value={formData.activityId}
                                onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                                className="px-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-violet-500/20 outline-none transition-all"
                            >
                                <option value="">Choose an activity...</option>
                                {activities.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-black text-zinc-900 ml-1">Session Date*</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-11 pr-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-violet-500/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-black text-zinc-900 ml-1">Reporting Coach</label>
                            <select
                                value={formData.coachId}
                                onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                                className="px-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-violet-500/20 outline-none transition-all"
                            >
                                <option value="">Select Mentor</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[13px] font-black text-zinc-900 ml-1">Session Topic / Lesson</label>
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="e.g. Backhand technique, Dribbling drills"
                                className="px-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-violet-500/20 outline-none transition-all"
                            />
                        </div>
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
                        >Initialize Session</Btn>
                    </div>
                </form>
            </div>
        </div>
    );
}
