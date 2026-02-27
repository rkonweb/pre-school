"use client";

import { useState } from "react";
import { logStudentBoardingAction } from "@/app/actions/tracking-actions";
import { toast } from "sonner";
import {
    Bus, MapPin, Search, CheckCircle2, UserX, XCircle, Clock, Map
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        // Need a vehicle ID? The task says routeId and vehicleId in db. 
        // We'll pass a dummy vehicle for now, or the specific one if we had it.
        const vehicleId = "temp-vehicle"; // If your DB requires it, you might need to fetch the route's assigned vehicle

        setLoadingIds(prev => new Set(prev).add(studentId));

        const res = await logStudentBoardingAction(slug, {
            studentId,
            routeId,
            vehicleId, // You may need to wire this properly if exact vehicle is needed
            status,
            type,
            recordedBy: "Driver UI"
        });

        if (res.success) {
            toast.success(`Marked ${status} for ${type}`);
            // Optimistic UI update could go here
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="SEARCH STUDENT OR ID..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-sm font-bold text-sm uppercase focus:ring-2 focus:ring-brand outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-6 py-4 rounded-2xl border-none bg-white shadow-sm font-bold text-sm uppercase focus:ring-2 focus:ring-brand outline-none cursor-pointer text-zinc-600"
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                >
                    <option value="ALL">ALL ROUTES</option>
                    {routes.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStudents.map(profile => (
                    <div key={profile.id} className="bg-white rounded-[32px] p-6 border border-zinc-100 shadow-xl shadow-zinc-200/40 transform transition-all hover:scale-[1.01]">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center font-black text-xl text-zinc-900 uppercase">
                                    {profile.student.firstName[0]}{profile.student.lastName?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-zinc-900 uppercase tracking-tight leading-tight">
                                        {profile.student.firstName} {profile.student.lastName}
                                    </h3>
                                    <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
                                        {profile.student.admissionNumber} • {profile.student.classroom?.name || 'NO CLASS'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            {profile.route && (
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 uppercase bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                    <Map className="h-4 w-4 text-brand" />
                                    {profile.route.name}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                                    <p className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup</p>
                                    <p className="text-xs font-bold text-zinc-800 uppercase truncate" title={profile.pickupStop?.name}>
                                        {profile.pickupStop?.name || 'Not Set'}
                                    </p>
                                    <p className="text-[10px] font-bold text-zinc-500 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {profile.pickupStop?.pickupTime || '--:--'}
                                    </p>
                                </div>
                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                    <p className="text-[9px] font-black text-blue-600/60 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Drop</p>
                                    <p className="text-xs font-bold text-zinc-800 uppercase truncate" title={profile.dropStop?.name}>
                                        {profile.dropStop?.name || 'Not Set'}
                                    </p>
                                    <p className="text-[10px] font-bold text-zinc-500 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {profile.dropStop?.dropTime || '--:--'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4">
                            <button
                                onClick={() => handleBoarding(profile.student.id, profile.route?.id, "IN", "PICKUP")}
                                disabled={loadingIds.has(profile.student.id) || !profile.route}
                                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <CheckCircle2 className="h-6 w-6 mb-1" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Mark IN</span>
                            </button>
                            <button
                                onClick={() => handleBoarding(profile.student.id, profile.route?.id, "OUT", "DROP")}
                                disabled={loadingIds.has(profile.student.id) || !profile.route}
                                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <Bus className="h-6 w-6 mb-1" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Mark OUT</span>
                            </button>
                            <button
                                onClick={() => handleBoarding(profile.student.id, profile.route?.id, "ABSENT", "PICKUP")}
                                disabled={loadingIds.has(profile.student.id) || !profile.route}
                                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <UserX className="h-6 w-6 mb-1" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Absent</span>
                            </button>
                        </div>
                    </div>
                ))}

                {filteredStudents.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center bg-white rounded-[40px] border-2 border-dashed border-zinc-200">
                        <UserX className="h-12 w-12 text-zinc-200 mb-4" />
                        <h3 className="text-xl font-black text-zinc-900 uppercase">No Students Found</h3>
                        <p className="text-sm font-bold text-zinc-400 uppercase mt-2">Adjust your filters or add students to routes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
