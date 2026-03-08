"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
    Award, Trophy, Calendar, MapPin, 
    Users, Plus, Search, Filter,
    ChevronRight, Medal, Star
} from "lucide-react";
import { 
    SectionHeader, Btn
} from "@/components/ui/erp-ui";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { 
    getActivityEventsAction, 
    createActivityEventAction,
    createActivityAwardAction,
    getActivitiesAction
} from "@/app/actions/extracurricular-actions";
import { searchStudentsAction } from "@/app/actions/student-actions";
import { ErpModal, ErpInput, StatusChip, ErpCard } from "@/components/ui/erp-ui";
import { toast } from "sonner";

export default function EventsPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>({ events: [], awards: [] });
    const [activities, setActivities] = useState<any[]>([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAwardModal, setShowAwardModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function loadData() {
        const [evRes, actRes] = await Promise.all([
            getActivityEventsAction(slug),
            getActivitiesAction(slug)
        ]);
        if (evRes.success) setData(evRes.data);
        if (actRes.success) setActivities(actRes.data);
        setIsLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [slug]);

    const handleCreateEvent = async (formData: any) => {
        setIsSubmitting(true);
        const res = await createActivityEventAction(slug, formData);
        if (res.success) {
            toast.success("Event created successfully");
            setShowEventModal(false);
            loadData();
        } else {
            toast.error(res.error || "Failed to create event");
        }
        setIsSubmitting(false);
    };

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-8 p-8 min-w-0">
            <SectionHeader
                title="Events & Awards"
                subtitle="Manage inter-school competitions, annual events, and student recognition."
                icon={Award}
                action={
                    <Btn 
                        icon={Plus} 
                        onClick={() => setShowEventModal(true)} 
                    >Create Event</Btn>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Events Section */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-zinc-400" />
                            Upcoming Competitions
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        {data.events.length === 0 ? (
                            <div className="py-12 bg-white rounded-[32px] border-2 border-zinc-100 flex flex-col items-center justify-center opacity-50">
                                <Calendar className="w-12 h-12 mb-2" />
                                <p className="text-sm font-bold">No upcoming competitions found</p>
                            </div>
                        ) : (
                            data.events.map((event: any, i: number) => (
                                <div key={i} className="p-6 bg-white rounded-[32px] border-2 border-zinc-100 shadow-sm hover:border-blue-500/20 hover:shadow-xl transition-all group cursor-pointer">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Trophy className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-[17px] font-black text-zinc-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none mb-1">{event.name}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{event.type}</span>
                                                    {event.venue && (
                                                        <>
                                                            <div className="w-1 h-1 rounded-full bg-zinc-200" />
                                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{event.venue}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-zinc-900 block">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            {new Date(event.date) > new Date() ? (
                                                <StatusChip label="Upcoming" variant="warning" />
                                            ) : (
                                                <StatusChip label="Completed" variant="success" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Awards Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3">
                            <Medal className="w-5 h-5 text-zinc-400" />
                            Global Recognition
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        {data.awards.length === 0 ? (
                            <div className="py-8 bg-zinc-50 rounded-[32px] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center opacity-50">
                                <Medal className="w-10 h-10 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No awards logged yet</p>
                            </div>
                        ) : (
                            data.awards.map((award: any, i: number) => (
                                <div key={i} className="p-5 bg-zinc-900 rounded-[32px] text-white flex items-center gap-4 shadow-xl group cursor-pointer hover:bg-zinc-800 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-700 transition-all">
                                        <Medal className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="text-sm font-black uppercase tracking-tight leading-none mb-1 truncate">
                                            {award.student.firstName} {award.student.lastName}
                                        </h4>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none truncate">
                                            {award.level} • {award.awardType} • {award.activity.name}
                                        </p>
                                    </div>
                                    <div className="ml-auto p-2 bg-zinc-800 rounded-2xl flex-shrink-0">
                                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                                    </div>
                                </div>
                            ))
                        )}

                        <button 
                            onClick={() => setShowAwardModal(true)}
                            className="w-full py-4 bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-[32px] text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-zinc-100 hover:text-zinc-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Star className="w-4 h-4" />
                            Log New Achievement
                        </button>
                    </div>
                </div>
            </div>

            <AwardModal
                open={showAwardModal}
                onClose={() => setShowAwardModal(false)}
                onSubmit={async (formData: any) => {
                    setIsSubmitting(true);
                    const res = await createActivityAwardAction(slug, formData);
                    if (res.success) {
                        toast.success("Award logged successfully");
                        setShowAwardModal(false);
                        loadData();
                    } else {
                        toast.error(res.error || "Failed to log award");
                    }
                    setIsSubmitting(false);
                }}
                loading={isSubmitting}
                activities={activities}
                slug={slug}
            />

            <EventModal
                open={showEventModal}
                onClose={() => setShowEventModal(false)}
                onSubmit={handleCreateEvent}
                loading={isSubmitting}
            />
        </div>
    );
}

function AwardModal({ open, onClose, onSubmit, loading, activities, slug }: any) {
    const [formData, setFormData] = useState({
        studentId: "",
        activityId: "",
        awardType: "CERTIFICATE",
        level: "SCHOOL",
        certificateUrl: ""
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    useEffect(() => {
        if (!searchQuery) {
            setStudents([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            const res = await searchStudentsAction(slug, searchQuery);
            if (res.success) setStudents(res.students);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, slug]);

    return (
        <ErpModal
            open={open}
            onClose={onClose}
            title="Log Achievement"
            subtitle="Recognize student excellence in extracurriculars."
            icon={Award}
            footer={
                <div className="flex gap-3">
                    <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                    <Btn loading={loading} disabled={!formData.studentId || !formData.activityId} onClick={() => onSubmit(formData)}>Log Award</Btn>
                </div>
            }
        >
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2 relative">
                    <ErpInput 
                        label="Search Student" 
                        placeholder="Type name or admission number..." 
                        icon={Search}
                        value={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            if (selectedStudent) {
                                setSelectedStudent(null);
                                setFormData({ ...formData, studentId: "" });
                            }
                        }}
                    />
                    {!selectedStudent && students.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border-2 border-zinc-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                            {students.map(s => (
                                <div 
                                    key={s.id} 
                                    className="p-3 hover:bg-zinc-50 cursor-pointer flex items-center gap-3 transition-colors"
                                    onClick={() => {
                                        setSelectedStudent(s);
                                        setFormData({ ...formData, studentId: s.id });
                                        setSearchQuery("");
                                        setStudents([]);
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 overflow-hidden">
                                        <img src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.firstName}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-900">{s.firstName} {s.lastName}</span>
                                        <span className="text-[10px] font-black text-zinc-400">#{s.admissionNumber}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase px-1">Activity</label>
                    <select 
                        title="Select Activity"
                        className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-3 text-sm font-bold text-zinc-900 outline-none focus:border-amber-500 transition-all"
                        value={formData.activityId}
                        onChange={e => setFormData({ ...formData, activityId: e.target.value })}
                    >
                        <option value="">Select Activity</option>
                        {activities.map((a: any) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase px-1">Award Type</label>
                        <select 
                            title="Award Type"
                            className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-3 text-sm font-bold text-zinc-900 outline-none focus:border-amber-500 transition-all"
                            value={formData.awardType}
                            onChange={e => setFormData({ ...formData, awardType: e.target.value })}
                        >
                            <option value="TROPHY">Trophy</option>
                            <option value="MEDAL">Medal</option>
                            <option value="CERTIFICATE">Certificate</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase px-1">Level</label>
                        <select 
                            title="Achievement Level"
                            className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-3 text-sm font-bold text-zinc-900 outline-none focus:border-amber-500 transition-all"
                            value={formData.level}
                            onChange={e => setFormData({ ...formData, level: e.target.value })}
                        >
                            <option value="SCHOOL">School</option>
                            <option value="DISTRICT">District</option>
                            <option value="STATE">State</option>
                            <option value="NATIONAL">National</option>
                        </select>
                    </div>
                </div>
            </div>
        </ErpModal>
    );
}

function EventModal({ open, onClose, onSubmit, loading }: any) {
    const [formData, setFormData] = useState({
        name: "",
        type: "INTERNAL",
        date: "",
        venue: ""
    });

    return (
        <ErpModal
            open={open}
            onClose={onClose}
            title="Create New Event"
            subtitle="Schedule internal or inter-school competitions."
            icon={Calendar}
            footer={
                <div className="flex gap-3">
                    <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                    <Btn loading={loading} onClick={() => onSubmit(formData)}>Create Event</Btn>
                </div>
            }
        >
            <div className="flex flex-col gap-4 py-4">
                <ErpInput 
                    label="Event Name" 
                    placeholder="e.g., Annual Sports Day" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase px-1">Event Type</label>
                        <select 
                            title="Event Type"
                            className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-3 text-sm font-bold text-zinc-900 outline-none focus:border-amber-500 transition-all appearance-none"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="INTERNAL">Internal</option>
                            <option value="INTER_SCHOOL">Inter-School</option>
                            <option value="NATIONAL">National</option>
                        </select>
                    </div>
                    <ErpInput 
                        label="Date" 
                        type="date" 
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <ErpInput 
                    label="Venue" 
                    placeholder="e.g., Main Playground" 
                    icon={MapPin}
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                />
            </div>
        </ErpModal>
    );
}
