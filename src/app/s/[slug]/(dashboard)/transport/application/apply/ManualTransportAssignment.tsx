"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Navigation, Search, CheckCircle2, Bus } from "lucide-react";
import {
    searchStudentsForTransportAction,
    assignStudentToRouteAction
} from "@/app/actions/transport-actions";

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
            toast.error("Please fill all fields");
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
            toast.success("Student successfully assigned to route");
            // Reset form
            setSelectedStudent(null);
            setSelectedRouteId("");
            setPickupStopId("");
            setDropStopId("");
            setFee("");
        } else {
            toast.error(res.error || "Failed to assign student");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Student Search & Details */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/40">
                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-4">Select Student</h2>

                    {!selectedStudent ? (
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="SEARCH BY NAME..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-zinc-100 bg-zinc-50 font-bold text-sm uppercase focus:ring-0 focus:border-brand outline-none transition-colors"
                                value={searchTerm}
                                onChange={e => handleSearch(e.target.value)}
                            />

                            {/* Search Results Dropdown */}
                            {searchTerm.length >= 2 && (
                                <div className="absolute top-16 left-0 right-0 bg-white border border-zinc-100 rounded-2xl shadow-xl z-10 max-h-64 overflow-y-auto">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-sm font-bold text-zinc-400 uppercase">Searching...</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(student => (
                                            <div
                                                key={student.id}
                                                className="p-4 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-0 flex items-center justify-between transition-colors"
                                                onClick={() => handleSelectStudent(student)}
                                            >
                                                <div>
                                                    <p className="font-bold text-zinc-900 uppercase">{student.firstName} {student.lastName}</p>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{student.admissionNumber}</p>
                                                </div>
                                                {student.transportProfile && (
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 rounded">
                                                        <CheckCircle2 className="h-3 w-3" /> Enrolled
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm font-bold text-zinc-400 uppercase">No students found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-xl uppercase">
                                    {selectedStudent.firstName[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-zinc-900 uppercase leading-none mb-1">
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </h3>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        {selectedStudent.admissionNumber}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg"
                            >
                                Change
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Route Assignment Form */}
            <div className="space-y-6">
                <div className={`bg-white p-6 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/40 transition-opacity duration-300 ${!selectedStudent ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                            <Bus className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Assignment Details</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Route Selection */}
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Select Route</label>
                            <select
                                className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-100 bg-zinc-50 font-bold text-sm uppercase focus:ring-0 focus:border-brand outline-none text-zinc-700"
                                value={selectedRouteId}
                                onChange={(e) => {
                                    setSelectedRouteId(e.target.value);
                                    setPickupStopId("");
                                    setDropStopId("");
                                }}
                            >
                                <option value="" disabled>--- CHOOSE ROUTE ---</option>
                                {initialRoutes.map(route => (
                                    <option key={route.id} value={route.id}>{route.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Stops Selection */}
                        {selectedRouteId && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Pickup Stop
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-100 bg-zinc-50 font-bold text-xs uppercase focus:ring-0 focus:border-brand outline-none text-zinc-700"
                                        value={pickupStopId}
                                        onChange={(e) => setPickupStopId(e.target.value)}
                                    >
                                        <option value="" disabled>-- SELECT --</option>
                                        {stops.map((stop: any) => (
                                            <option key={stop.id} value={stop.id}>{stop.name} ({stop.pickupTime})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block flex items-center gap-1">
                                        <Navigation className="h-3 w-3" /> Drop Stop
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-100 bg-zinc-50 font-bold text-xs uppercase focus:ring-0 focus:border-brand outline-none text-zinc-700"
                                        value={dropStopId}
                                        onChange={(e) => setDropStopId(e.target.value)}
                                    >
                                        <option value="" disabled>-- SELECT --</option>
                                        {stops.map((stop: any) => (
                                            <option key={stop.id} value={stop.id}>{stop.name} ({stop.dropTime})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Fee */}
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Monthly Transport Fee (₹)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-100 bg-zinc-50 font-bold text-sm uppercase focus:ring-0 focus:border-brand outline-none text-zinc-900"
                                value={fee}
                                onChange={(e) => setFee(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedStudent || !selectedRouteId || !pickupStopId || !dropStopId || !fee}
                            className="w-full py-4 mt-2 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-zinc-900"
                        >
                            {isSubmitting ? "Processing..." : "Assign Student"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
