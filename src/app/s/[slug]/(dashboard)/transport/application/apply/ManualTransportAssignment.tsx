"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Navigation, Search, CheckCircle2, Bus, User, CreditCard, ChevronRight, X } from "lucide-react";
import {
    searchStudentsForTransportAction,
    assignStudentToRouteAction
} from "@/app/actions/transport-actions";
import { ErpCard, Btn, StatusChip, ErpInput } from "@/components/ui/erp-ui";
import { cn } from "@/lib/utils";

export default function ManualTransportAssignment({ slug, initialRoutes }: { slug: string, initialRoutes: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [selectedRouteId, setSelectedRouteId] = useState("");
    const [pickupStopId, setPickupStopId] = useState("");
    const [dropStopId, setDropStopId] = useState("");
    const [fee, setFee] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived states
    const selectedRoute = initialRoutes.find(r => r.id === selectedRouteId);
    const stops = selectedRoute?.stops || [];

    const handleSearch = async (val: string) => {
        setSearchTerm(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const res = await searchStudentsForTransportAction(val, slug);
        if (res.success && res.data) {
            setSearchResults(res.data);
        }
        setIsSearching(false);
    };

    const handleSelectStudent = (student: any) => {
        setSelectedStudent(student);
        setSearchTerm("");
        setSearchResults([]);

        // Pre-fill existing assignment if any
        if (student.transportProfile) {
            setSelectedRouteId(student.transportProfile.routeId || "");
            setPickupStopId(student.transportProfile.pickupStopId || "");
            setDropStopId(student.transportProfile.dropStopId || "");
            setFee(student.transportProfile.transportFee?.toString() || "");
        } else {
            setSelectedRouteId("");
            setPickupStopId("");
            setDropStopId("");
            setFee("");
        }
    };

    const handleSubmit = async () => {
        if (!selectedStudent || !selectedRouteId || !pickupStopId || !dropStopId || !fee) {
            toast.error("MISSION ABORTED: Missing parameters.");
            return;
        }

        setIsSubmitting(true);

        const res = await assignStudentToRouteAction(
            selectedStudent.id,
            selectedRouteId,
            pickupStopId,
            dropStopId,
            slug,
            parseFloat(fee)
        );

        if (res.success) {
            toast.success("MISSION SUCCESS: Student deployed to route.");
            // Reset form
            setSelectedStudent(null);
            setSelectedRouteId("");
            setPickupStopId("");
            setDropStopId("");
            setFee("");
        } else {
            toast.error(res.error || "TACTICAL FAILURE: Enrollment failed.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Passenger Selection Orbit */}
            <div className="space-y-8">
                <ErpCard noPad className="!rounded-[40px] border-zinc-100 shadow-2xl shadow-zinc-200/50 p-10 group bg-zinc-50/30">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-14 w-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-900/40">
                            <User className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Manifest Entry</h2>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic opacity-60">Identity Verification Protocol</p>
                        </div>
                    </div>

                    {!selectedStudent ? (
                        <div className="relative">
                            <ErpInput
                                label="Search Registry"
                                placeholder="ENTER NAME OR ADMISSION ID..."
                                value={searchTerm}
                                onChange={e => handleSearch(e.target.value)}
                                icon={Search}
                                className="!bg-white shadow-inner"
                            />

                            {/* Tactical Search Dropdown */}
                            {searchTerm.length >= 2 && (
                                <div className="absolute top-24 left-0 right-0 bg-white border border-zinc-100 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] z-50 max-h-[400px] overflow-y-auto p-3 ring-8 ring-zinc-50/50">
                                    {isSearching ? (
                                        <div className="p-10 text-center flex flex-col items-center gap-4">
                                            <div className="h-8 w-8 border-4 border-brand border-t-transparent animate-spin rounded-full"></div>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Scanning Data Matrix...</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="space-y-1">
                                            {searchResults.map(student => (
                                                <div
                                                    key={student.id}
                                                    className="p-5 hover:bg-zinc-50 rounded-[24px] cursor-pointer group/item flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                                                    onClick={() => handleSelectStudent(student)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-500 uppercase group-hover/item:bg-zinc-900 group-hover/item:text-white transition-all">
                                                            {student.firstName?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-zinc-900 uppercase text-sm leading-tight group-hover/item:text-brand transition-all">{student.firstName} {student.lastName}</p>
                                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1 opacity-60 leading-none">{student.admissionNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {student.transportProfile && (
                                                            <div className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tight">ACTIVE NODE</span>
                                                            </div>
                                                        )}
                                                        <ChevronRight className="h-4 w-4 text-zinc-200 group-hover/item:translate-x-1 group-hover/item:text-brand transition-all" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center flex flex-col items-center gap-2 opacity-40">
                                            <X className="h-8 w-8 text-zinc-300" />
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">No Handshake Detected</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 relative group/card">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="absolute -inset-2 bg-brand/20 rounded-[24px] blur-xl opacity-0 group-hover/card:opacity-100 transition-all duration-700" />
                                        <div className="h-16 w-16 rounded-[24px] bg-zinc-900 text-white flex items-center justify-center font-black text-3xl uppercase shadow-2xl relative z-10 border-2 border-white/10 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                            {selectedStudent.firstName[0]}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl text-zinc-900 uppercase tracking-tighter leading-none mb-2">
                                            {selectedStudent.firstName} {selectedStudent.lastName}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                {selectedStudent.admissionNumber}
                                            </span>
                                            <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                            <span className="text-[10px] font-black text-brand uppercase tracking-widest italic">
                                                GRADE {selectedStudent.grade || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    aria-label="De-select Student"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 bg-zinc-900 rounded-[28px] border border-white/5 shadow-2xl">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 italic">Operational Insight</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500 font-bold uppercase tracking-tight">Active Enrollment</span>
                                        <span className={cn("font-black uppercase", selectedStudent.transportProfile ? "text-emerald-400" : "text-amber-400")}>
                                            {selectedStudent.transportProfile ? "DETECTED" : "VACANT"}
                                        </span>
                                    </div>
                                    <div className="h-[1px] bg-white/5 w-full" />
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500 font-bold uppercase tracking-tight">Protocol Ready</span>
                                        <span className="text-white font-black uppercase">INITIALIZED</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ErpCard>
            </div>

            {/* Tactical Deployment Matrix */}
            <div className="space-y-8">
                <ErpCard noPad className={cn(
                    "!rounded-[40px] border-zinc-100 shadow-2xl p-10 transition-all duration-700 relative overflow-hidden",
                    !selectedStudent ? "opacity-30 pointer-events-none grayscale blur-[4px] scale-[0.98]" : "opacity-100 shadow-zinc-200/50"
                )}>
                    {!selectedStudent && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center p-12 text-center pointer-events-none">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] leading-relaxed">System Locked: <br /> Waiting for Identity Handshake</p>
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-14 w-14 bg-brand text-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 relative">
                            <Bus className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Route Calibration</h2>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic opacity-60">Telemetry Stop Synchronization</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Route Strategic Link */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Mission Corridor</label>
                            <div className="relative group/select">
                                <Navigation className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-hover/select:text-brand transition-colors z-10" />
                                <select
                                    aria-label="Select Route"
                                    className="w-full bg-zinc-50 border border-zinc-200 pl-14 pr-6 py-5 rounded-[24px] text-sm font-black uppercase outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand text-zinc-900 appearance-none shadow-inner transition-all cursor-pointer"
                                    value={selectedRouteId}
                                    onChange={(e) => {
                                        setSelectedRouteId(e.target.value);
                                        setPickupStopId("");
                                        setDropStopId("");
                                    }}
                                >
                                    <option value="" disabled className="text-zinc-400">--- SELECT DEPLOYMENT CORRIDOR ---</option>
                                    {initialRoutes.map(route => (
                                        <option key={route.id} value={route.id}>{route.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none border-4 border-transparent border-t-zinc-400" />
                            </div>
                        </div>

                        {/* Node Synchronization (Stops) */}
                        {selectedRouteId && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Pickup Node
                                    </label>
                                    <select
                                        aria-label="Select Pickup Stop"
                                        className="w-full bg-zinc-50 border border-zinc-200 p-5 rounded-[22px] text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 text-zinc-900 appearance-none transition-all cursor-pointer shadow-sm"
                                        value={pickupStopId}
                                        onChange={(e) => setPickupStopId(e.target.value)}
                                    >
                                        <option value="" disabled>-- SYNC PICKUP --</option>
                                        {stops.map((stop: any) => (
                                            <option key={stop.id} value={stop.id}>{stop.name} [{stop.pickupTime}]</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-brand" /> Drop Node
                                    </label>
                                    <select
                                        aria-label="Select Drop Stop"
                                        className="w-full bg-zinc-50 border border-zinc-200 p-5 rounded-[22px] text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand text-zinc-900 appearance-none transition-all cursor-pointer shadow-sm"
                                        value={dropStopId}
                                        onChange={(e) => setDropStopId(e.target.value)}
                                    >
                                        <option value="" disabled>-- SYNC DROP --</option>
                                        {stops.map((stop: any) => (
                                            <option key={stop.id} value={stop.id}>{stop.name} [{stop.dropTime}]</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Economic Impact (Fee) */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Monthly Tariff Calibration (₹)</label>
                            <div className="relative group/fee">
                                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-hover/fee:text-emerald-500 transition-colors z-10" />
                                <input
                                    aria-label="Monthly Fee"
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-zinc-50 border border-zinc-200 pl-14 pr-6 py-5 rounded-[24px] text-sm font-black uppercase outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 text-zinc-900 shadow-inner transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <Btn
                                fullWidth
                                size="lg"
                                variant="primary"
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                disabled={!selectedStudent || !selectedRouteId || !pickupStopId || !dropStopId || !fee}
                                className="!rounded-[24px] !py-6 shadow-2xl shadow-brand/40 group/btn"
                                icon={CheckCircle2}
                            >
                                <span className="text-[11px] uppercase tracking-[0.2em] font-black">
                                    {isSubmitting ? "ENROLLING MISSION..." : "STRIKE ENROLLMENT NOW"}
                                </span>
                            </Btn>
                        </div>
                    </div>
                </ErpCard>
            </div>
        </div>
    );
}
