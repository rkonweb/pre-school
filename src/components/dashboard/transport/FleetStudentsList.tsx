"use client";

import { useState } from "react";
import { logStudentBoardingAction } from "@/app/actions/tracking-actions";
import { toast } from "sonner";
import {
    Bus, MapPin, Search, CheckCircle2, UserX, XCircle, Clock, Map, Users, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErpCard, ErpInput, SectionHeader, StatusChip } from "@/components/ui/erp-ui";

interface FleetStudentsListProps {
    slug: string;
    initialStudents: any[];
}

export function FleetStudentsList({ slug, initialStudents }: FleetStudentsListProps) {
    const [students, setStudents] = useState(initialStudents);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRouteId, setSelectedRouteId] = useState<string>("ALL");

    // Derived routes list for filtering
    const routes = Array.from(new Set(initialStudents.filter(s => s.route).map(s => s.route.id))).map(routeId => {
        return initialStudents.find(s => s.route?.id === routeId)?.route;
    }).filter(Boolean);

    const filteredStudents = students.filter(s => {
        const matchesSearch = `${s.student.firstName} ${s.student.lastName} ${s.student.admissionNumber}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesRoute = selectedRouteId === "ALL" || s.route?.id === selectedRouteId;
        return matchesSearch && matchesRoute;
    });

    // Mark Boarding Status
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

    async function handleBoarding(
        studentId: string,
        routeId: string,
        status: "IN" | "OUT" | "ABSENT",
        type: "PICKUP" | "DROP"
    ) {
        const vehicleId = "temp-vehicle";

        setLoadingIds(prev => new Set(prev).add(studentId));

        const res = await logStudentBoardingAction(slug, {
            studentId,
            routeId,
            vehicleId,
            status,
            type,
            recordedBy: "Driver UI"
        });

        if (res.success) {
            toast.success(`Marked ${status} for ${type}`);
        } else {
            toast.error(res.error || "Failed to update boarding status");
        }

        setLoadingIds(prev => {
            const next = new Set(prev);
            next.delete(studentId);
            return next;
        });
    }

    return (
        <div className="space-y-10">
            <SectionHeader
                title="Manifest Registry"
                subtitle="Passenger manifest and real-time boarding control matrix."
                icon={Users}
                badge={`${filteredStudents.length} ACTIVE`}
            />

            <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                <div className="flex-1">
                    <ErpInput
                        icon={Search}
                        placeholder="IDENTIFY PASSENGER OR ADMISSION ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="!h-16"
                    />
                </div>
                <div className="md:w-72 relative">
                    <Map className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 pointer-events-none z-10" />
                    <select
                        aria-label="Filter by Corridor"
                        className="w-full h-14 appearance-none rounded-2xl border-1.5 border-zinc-200 bg-zinc-50 pl-14 pr-12 text-[10px] font-black text-zinc-900 focus:bg-white focus:ring-4 focus:ring-brand/10 outline-none transition-all uppercase cursor-pointer"
                        value={selectedRouteId}
                        onChange={(e) => setSelectedRouteId(e.target.value)}
                    >
                        <option value="ALL">All Connectivity Networks</option>
                        {routes.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 pointer-events-none" />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
                {filteredStudents.map(profile => (
                    <ErpCard key={profile.id} className="group/student relative !rounded-[40px] border-zinc-200 p-8 shadow-2xl shadow-zinc-200/50 hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-[24px] bg-zinc-900 text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-zinc-50">
                                    {profile.student.firstName[0]}{profile.student.lastName?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-zinc-900 uppercase tracking-tight leading-none mb-1">
                                        {profile.student.firstName} {profile.student.lastName}
                                    </h3>
                                    <p className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase">
                                        ADM: {profile.student.admissionNumber} • {profile.student.classroom?.name || 'GEN-OPS'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            {profile.route && (
                                <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100">
                                    <Map className="h-4 w-4 text-brand" />
                                    {profile.route.name}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/50">
                                    <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Inbound
                                    </p>
                                    <p className="text-xs font-black text-zinc-900 uppercase truncate" title={profile.pickupStop?.name}>
                                        {profile.pickupStop?.name || 'UNCALIBRATED'}
                                    </p>
                                    <p className="text-[10px] font-black text-zinc-400 mt-2 flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-brand" /> {profile.pickupStop?.pickupTime || '--:--'}
                                    </p>
                                </div>
                                <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
                                    <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Outbound
                                    </p>
                                    <p className="text-xs font-black text-zinc-900 uppercase truncate" title={profile.dropStop?.name}>
                                        {profile.dropStop?.name || 'UNCALIBRATED'}
                                    </p>
                                    <p className="text-[10px] font-black text-zinc-400 mt-2 flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-brand" /> {profile.dropStop?.dropTime || '--:--'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-100">
                            <button
                                onClick={() => handleBoarding(profile.student.id, profile.route?.id, "IN", "PICKUP")}
                                disabled={loadingIds.has(profile.student.id) || !profile.route}
                                className="flex flex-col items-center justify-center p-4 rounded-[24px] bg-zinc-900 text-[var(--secondary-color)] hover:bg-brand transition-all disabled:opacity-30 group/btn"
                                title="Mark Boarding IN"
                            >
                                <CheckCircle2 className="h-7 w-7 mb-2" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100 transition-opacity">IN</span>
                            </button>
                            <button
                                onClick={() => handleBoarding(profile.student.id, profile.route?.id, "OUT", "DROP")}
                                disabled={loadingIds.has(profile.student.id) || !profile.route}
                                className="flex flex-col items-center justify-center p-4 rounded-[24px] bg-zinc-50 text-zinc-900 hover:bg-zinc-200 transition-all disabled:opacity-30 group/btn border border-zinc-100"
                                title="Mark Boarding OUT"
                            >
                                <Bus className="h-7 w-7 mb-2 text-brand" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100 transition-opacity">OUT</span>
                            </button>
                            <button
                                onClick={() => handleBoarding(profile.student.id, profile.route?.id, "ABSENT", "PICKUP")}
                                disabled={loadingIds.has(profile.student.id) || !profile.route}
                                className="flex flex-col items-center justify-center p-4 rounded-[24px] bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 group/btn"
                                title="Mark Absent"
                            >
                                <UserX className="h-7 w-7 mb-2" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100 transition-opacity">OFF</span>
                            </button>
                        </div>
                    </ErpCard>
                ))}

                {filteredStudents.length === 0 && (
                    <div className="col-span-full py-32 text-center flex flex-col items-center bg-zinc-50/50 rounded-[60px] border-2 border-dashed border-zinc-200">
                        <div className="p-10 bg-white rounded-[40px] shadow-sm mb-8 ring-4 ring-zinc-50">
                            <UserX className="h-20 w-20 text-zinc-100" />
                        </div>
                        <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Zero Registry Hits</h3>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-3 italic">Identify parameters did not match any active manifest profiles.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
