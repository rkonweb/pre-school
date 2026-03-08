"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
    Plus, Trophy, Users, Edit3, Trash2, 
    Search, Filter, CheckCircle, XCircle,
    Calendar, Package, Zap, Sparkles
} from "lucide-react";
import { 
    SectionHeader, Btn, tableStyles, 
    RowActions, StatusChip 
} from "@/components/ui/erp-ui";
import { 
    getActivitiesAction, 
    deleteActivityAction 
} from "@/app/actions/extracurricular-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { toast } from "sonner";
import { useConfirm } from "@/contexts/ConfirmContext";
import { ActivityModal } from "@/components/dashboard/extracurricular/ActivityModal";

export default function ActivityMasterPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { confirm } = useConfirm();
    
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async () => {
        setIsLoading(true);
        const res = await getActivitiesAction(slug);
        if (res.success) {
            setActivities(res.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [slug]);

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: "Delete Activity",
            message: "Are you sure you want to delete this activity? This will remove all associated enrollments.",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (isConfirmed) {
            const res = await deleteActivityAction(slug, id);
            if (res.success) {
                toast.success("Activity deleted successfully");
                loadData();
            } else {
                toast.error(res.error || "Failed to delete activity");
            }
        }
    };

    const filteredActivities = activities.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-8 p-8 min-w-0">
            <SectionHeader
                title="Activity Master"
                subtitle="Define and manage sports, arts, and skill development programs."
                icon={Trophy}
                action={
                    <Btn 
                        icon={Plus} 
                        onClick={() => {
                            setSelectedActivity(null);
                            setShowModal(true);
                        }} 
                    >Create Activity</Btn>
                }
            />

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border-2 border-zinc-100 shadow-sm">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search activities by name or category..."
                        className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-zinc-400 ml-2" />
                    <select className="bg-zinc-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-zinc-700 outline-none cursor-pointer">
                        <option>All Categories</option>
                        <option>Sports</option>
                        <option>Arts & Culture</option>
                        <option>Clubs</option>
                        <option>Skill Development</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-zinc-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50">
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Program Name</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Category</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Coach / Mentor</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Schedule</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap">Enrollment</th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredActivities.map((activity) => (
                                <tr key={activity.id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-black text-zinc-900 line-clamp-1">{activity.name}</span>
                                            <span className="text-xs text-zinc-400 font-bold uppercase tracking-tight truncate max-w-[200px]">{activity.description || "No description"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusChip label={activity.category} color={getCategoryColor(activity.category)} />
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {activity.coach?.avatar ? (
                                                    <img src={activity.coach.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-4 h-4 text-zinc-400" />
                                                )}
                                            </div>
                                            <span className="text-sm font-bold text-zinc-700 whitespace-nowrap">
                                                {activity.coach ? `${activity.coach.firstName} ${activity.coach.lastName}` : "Not Assigned"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-zinc-500 whitespace-nowrap">{activity.schedule || "Flexible"}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-black text-zinc-900">
                                                {activity._count?.enrollments || 0}
                                                <span className="text-[10px] text-zinc-400 font-black ml-1 uppercase">Students</span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-emerald-500" 
                                                    style={{ width: `${Math.min(100, (activity._count?.enrollments || 0) * 10)}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-end relative z-20">
                                            <RowActions
                                                onEdit={() => {
                                                    setSelectedActivity(activity);
                                                    setShowModal(true);
                                                }}
                                                onDelete={() => handleDelete(activity.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredActivities.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Trophy className="w-12 h-12 text-zinc-200" />
                                            <p className="text-sm font-bold text-zinc-400">No activities found.</p>
                                            <Btn 
                                                variant="secondary" 
                                                onClick={() => setShowModal(true)} 
                                            >Create Your First Activity</Btn>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <ActivityModal
                    slug={slug}
                    activity={selectedActivity}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedActivity(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setSelectedActivity(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}

function getCategoryColor(cat: string) {
    switch (cat.toLowerCase()) {
        case 'sports': return 'amber';
        case 'arts & culture': return 'rose';
        case 'clubs': return 'blue';
        case 'skill development': return 'violet';
        default: return 'zinc';
    }
}
