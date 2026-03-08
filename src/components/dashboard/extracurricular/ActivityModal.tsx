"use client";

import { useEffect, useState } from "react";
import { 
    X, Trophy, Users, Info, 
    Calendar, Check, Loader2 
} from "lucide-react";
import { Btn } from "@/components/ui/erp-ui";
import { 
    createActivityAction, 
    updateActivityAction 
} from "@/app/actions/extracurricular-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ActivityModalProps {
    slug: string;
    activity?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function ActivityModal({ slug, activity, onClose, onSuccess }: ActivityModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        name: activity?.name || "",
        category: activity?.category || "Sports",
        description: activity?.description || "",
        coachId: activity?.coachId || "",
        schedule: activity?.schedule || "",
        status: activity?.status || "ACTIVE"
    });

    useEffect(() => {
        async function loadStaff() {
            const res = await getStaffAction(slug);
            if (res.success) setStaff(res.data || []);
        }
        loadStaff();
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Please enter a program name");
            return;
        }

        setIsLoading(true);
        const res = activity 
            ? await updateActivityAction(slug, activity.id, formData)
            : await createActivityAction(slug, formData);

        if (res.success) {
            toast.success(activity ? "Activity updated" : "Activity created");
            onSuccess();
        } else {
            toast.error(res.error || "Something went wrong");
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8 pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900">
                                {activity ? "Edit Program" : "Create Program"}
                            </h2>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Activity Master Setup</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[13px] font-black text-zinc-900 ml-1">Program Name*</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Football Academy, Robotics Club"
                                className="px-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-amber-500/20 outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-black text-zinc-900 ml-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="px-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-amber-500/20 outline-none transition-all"
                            >
                                <option>Sports</option>
                                <option>Arts & Culture</option>
                                <option>Clubs</option>
                                <option>Skill Development</option>
                                <option>Special Programs</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-black text-zinc-900 ml-1">Coach / Mentor</label>
                            <select
                                value={formData.coachId}
                                onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                                className="px-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-amber-500/20 outline-none transition-all"
                            >
                                <option value="">Select Mentor</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[13px] font-black text-zinc-900 ml-1">Weekly Schedule</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={formData.schedule}
                                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                    placeholder="e.g. Mon, Wed, Fri (4:00 PM - 5:30 PM)"
                                    className="w-full pl-11 pr-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-amber-500/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[13px] font-black text-zinc-900 ml-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the goals and details of this program..."
                                rows={3}
                                className="px-5 py-3.5 bg-zinc-50 border-2 border-transparent rounded-2xl text-[15px] font-bold text-zinc-800 focus:bg-white focus:border-amber-500/20 outline-none transition-all"
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
                        >{activity ? "Save Changes" : "Create Program"}</Btn>
                    </div>
                </form>
            </div>
        </div>
    );
}
