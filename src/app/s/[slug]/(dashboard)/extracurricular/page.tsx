"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
    Palmtree, Trophy, Users, Clock, 
    TrendingUp, Zap, Star, CreditCard, Package
} from "lucide-react";
import { SectionHeader, InfoCard, Btn } from "@/components/ui/erp-ui";
import { 
    getExtracurricularStatsAction, 
    getActivityEventsAction 
} from "@/app/actions/extracurricular-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import Link from "next/link";

export default function ExtracurricularDashboard() {
    const params = useParams();
    const slug = params.slug as string;
    const [extData, setExtData] = useState<any>({
        stats: {
            activePrograms: 0,
            totalEnrollments: 0,
            activeClubs: 0,
            todaySessions: 0
        },
        events: [],
        awards: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            const [statsRes, eventsRes] = await Promise.all([
                getExtracurricularStatsAction(slug),
                getActivityEventsAction(slug)
            ]);

            if (statsRes.success && eventsRes.success && eventsRes.data) {
                setExtData({
                    stats: statsRes.data,
                    events: eventsRes.data.events,
                    awards: eventsRes.data.awards
                });
            }
            setIsLoading(false);
        }
        loadDashboardData();
    }, [slug]);

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-8 p-8 min-w-0">
            <SectionHeader
                title="Extracurricular Dashboard"
                subtitle="Manage sports, clubs, and talent development programs."
                icon={Palmtree}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard
                    title="Active Programs"
                    value={extData.stats.activePrograms.toString()}
                    description="Sports & Arts"
                    icon={Trophy}
                    color="amber"
                />
                <InfoCard
                    title="Total Enrollment"
                    value={extData.stats.totalEnrollments.toString()}
                    description="Students Participation"
                    icon={Users}
                    color="blue"
                />
                <InfoCard
                    title="Participation Rate"
                    value={extData.stats.activePrograms > 0 ? `${Math.round((extData.stats.totalEnrollments / (extData.stats.activePrograms * 20)) * 100)}%` : "0%"}
                    description="Growth Trend"
                    icon={TrendingUp}
                    color="emerald"
                />
                <InfoCard
                    title="Active Clubs"
                    value={extData.stats.activeClubs.toString()}
                    description="Interest Groups"
                    icon={Star}
                    color="violet"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-xl font-black text-zinc-900">Quick Operations</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href={`/s/${slug}/extracurricular/activities`}>
                            <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 hover:border-amber-200 hover:bg-amber-50 transition-all group cursor-pointer h-full">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold text-zinc-900 mb-1">Activity Master</h4>
                                <p className="text-sm text-zinc-500 font-medium">Create and manage sports and arts programs.</p>
                            </div>
                        </Link>
                        <Link href={`/s/${slug}/extracurricular/enrollment`}>
                            <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 hover:border-blue-200 hover:bg-blue-50 transition-all group cursor-pointer h-full">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold text-zinc-900 mb-1">Enrollment</h4>
                                <p className="text-sm text-zinc-500 font-medium">Register students for their favorite clubs.</p>
                            </div>
                        </Link>
                        <Link href={`/s/${slug}/extracurricular/timetable`}>
                            <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group cursor-pointer h-full">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold text-zinc-900 mb-1">Scheduling</h4>
                                <p className="text-sm text-zinc-500 font-medium">Manage weekly slots and venue bookings.</p>
                            </div>
                        </Link>
                        <Link href={`/s/${slug}/extracurricular/attendance`}>
                            <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 hover:border-violet-200 hover:bg-violet-50 transition-all group cursor-pointer h-full">
                                <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold text-zinc-900 mb-1">Participation</h4>
                                <p className="text-sm text-zinc-500 font-medium">Track attendance and evaluate performance.</p>
                            </div>
                        </Link>
                        <Link href={`/s/${slug}/extracurricular/fees`}>
                            <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group cursor-pointer h-full">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold text-zinc-900 mb-1">Fees & Billing</h4>
                                <p className="text-sm text-zinc-500 font-medium">Manage activity charges and generate invoices.</p>
                            </div>
                        </Link>
                        <Link href={`/s/${slug}/extracurricular/equipment`}>
                            <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 hover:border-amber-200 hover:bg-amber-50 transition-all group cursor-pointer h-full">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold text-zinc-900 mb-1">Equipment</h4>
                                <p className="text-sm text-zinc-500 font-medium">Track sports gear and program inventory.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-black text-zinc-900">Upcoming Events</h3>
                    <div className="bg-white rounded-3xl border-2 border-zinc-100 p-6 flex flex-col gap-4">
                        {extData.events.length === 0 ? (
                            <div className="py-8 flex flex-col items-center justify-center text-center opacity-50">
                                <Palmtree className="w-10 h-10 mb-2" />
                                <p className="text-sm font-bold">No upcoming events</p>
                            </div>
                        ) : (
                            extData.events.slice(0, 3).map((event: any) => (
                                <div key={event.id} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-zinc-50 transition-colors cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex flex-col items-center justify-center text-[10px] font-black uppercase">
                                        <span>{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-sm leading-none">{new Date(event.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-zinc-900">{event.name}</h5>
                                        <p className="text-xs text-zinc-500 font-semibold">{event.type} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <Link href={`/s/${slug}/extracurricular/events`}>
                            <Btn variant="secondary" className="mt-2 w-full">View All Events</Btn>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
